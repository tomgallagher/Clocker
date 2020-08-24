const { of, from, fromEventPattern, merge, zip, combineLatest, defer } = rxjs;
const {
    map,
    switchMap,
    concatMap,
    flatMap,
    tap,
    filter,
    scan,
    delay,
    startWith,
    repeat,
    share,
    take,
    toArray,
    mapTo,
    shareReplay,
    catchError,
    debounceTime,
} = rxjs.operators;

//we need the active job and the active job observable subscription in global scope
let activeJob = null;
let activeJobSubscription = null;

//enable the browser action click
chrome.browserAction.onClicked.addListener(function () {
    chrome.tabs.create({ url: 'index.html' });
});

chrome.runtime.onMessage.addListener((request) => {
    switch (request.command) {
        case 'forwardConsoleMessage':
            chrome.runtime.sendMessage({
                command: 'incomingConsoleMessage',
                message: request.message,
            });
            return true;
        case 'forwardPageData':
            chrome.runtime.sendMessage({
                command: 'incomingPageData',
                payload: request.payload,
            });
            return true;
        case 'startTest':
            runJob(request.payload);
            break;
        case 'abortTest':
            //first we stop the subscription, if there is an active on
            if (activeJobSubscription) {
                //first we stop the subscription, which will prevent any further processing
                activeJobSubscription.unsubscribe();
                //then we detach the debugger
                stopDebugger(activeJob.tabId)
                    //then we close the test tab
                    .then(() => closeTestTab(activeJob.tabId))
                    //then we send the message
                    .then(() => sendConsoleMessage(`Aborted Test Job: ${activeJob.id}`))
                    //then finally we reset the job
                    .then(() => {
                        activeJob = null;
                        activeJobSubscription = null;
                    });
            }
            break;
        default:
    }
});

//then we want to be responsive to user detaching the debugger, when either the tab is being closed or Chrome DevTools is being invoked for the attached tab.
//this also gets hit when the site disables the debugger
chrome.debugger.onDetach.addListener((source, reason) => {
    //first we stop the subscription, if there is an active on
    if (activeJobSubscription && reason === 'canceled_by_user') {
        //first we stop the subscription, which will prevent any further processing
        activeJobSubscription.unsubscribe();
        //then we close the test tab
        closeTestTab(source.tabId)
            //then we send the message
            .then(() => sendConsoleMessage(`Aborted Test Job: ${activeJob.id} as debugger detached when ${reason}`))
            //then finally we reset the job
            .then(() => {
                activeJob = null;
                activeJobSubscription = null;
            });
    }
});

//DETACH / ATTACH OBSERVABLE RETURNS CURRENT STATE OF DEBUGGER ATTACHMENT
const debuggerDetached$ = fromEventPattern(
    (handler) => chrome.debugger.onDetach.addListener(handler),
    (handler) => chrome.debugger.onDetach.removeListener(handler),
    (source, reason) => ({ source: source, reason: reason })
).pipe(share());

const debuggerOff$ = debuggerDetached$.pipe(
    //we only care about certain detach events
    filter((event) => event.reason === 'target_closed'),
    //then we want to map the debugger off to false
    mapTo(false)
);

const debuggerOn$ = debuggerDetached$.pipe(
    //we only care about certain detach events
    filter((event) => event.reason === 'target_closed'),
    //then we want to reattach the debugger
    switchMap(
        (event) => from(attachDebugger(event.source.tabId)),
        (event) => event
    ),
    //then we want to map the debugger off to false
    mapTo(true)
);

const debouncedDebugger$ = (iteration) => {
    return merge(debuggerOff$, debuggerOn$).pipe(
        // Only emit when debugger emits that it has been reattached
        filter((v) => v),
        //wait for 0.5 second between on/off toggles to emit current value
        debounceTime(500),
        //then a simple continuation
        concatMap(() => from(sendConsoleMessage(`Debugger has become detached: re-attaching`))),
        concatMap(() => from(enableNetworkEvents(iteration.tabId))),
        concatMap(() => from(enablePageEvents(iteration.tabId))),
        concatMap(() => from(enablePerformanceMetrics(iteration.tabId))),
        concatMap(() => from(enableServiceWorkerEvents(iteration.tabId))),
        concatMap(() =>
            from(
                setNetworkConditions(
                    activeJob.tabId,
                    activeJob.latency,
                    activeJob.bandwidth_down,
                    activeJob.bandwidth_up
                )
            )
        ),
        concatMap(() => from(addAlertHandler(iteration.tabId)))
    );
};

//TEST START FUNCTION

const runJob = (payload) => {
    //report start to user console
    sendConsoleMessage(`Started test job with ID: ${payload.id}`);
    //so we attach the active job description to the processing of the incoming payload
    activeJobSubscription = of(payload)
        .pipe(
            //first map to the background js job class so we have everything we need to run the test
            map((payload) => new Job(payload)),
            //lets console log the job so we can keep an eye on things
            tap((job) => console.log(job)),
            //then open the new tab and attach tab id to the job
            switchMap(
                (_) => from(openTestTab()),
                (job, tab) => {
                    //add the tab id to the job
                    job.tabId = tab.id;
                    return job;
                }
            ),
            //then save the active job details to the globals for access anywhere, especially in the data collection observable
            tap((job) => (activeJob = job)),
            //then we run the debugger commands to get started
            //use switchmap as we need to have the job to be able to pass the tab id to attach debugger etc
            switchMap(
                (job) => from(attachDebugger(job.tabId)),
                (job) => job
            ),
            //we need to have a view of network events so we can collect stats etc
            switchMap(
                (job) => from(enableNetworkEvents(job.tabId)),
                (job) => job
            ),
            //we need to have a view of page events for alert controls etc,
            switchMap(
                (job) => from(enablePageEvents(job.tabId)),
                (job) => job
            ),
            //we need to have a view of performance events for metrics etc,
            switchMap(
                (job) => from(enablePerformanceMetrics(job.tabId)),
                (job) => job
            ),
            //we need to have a view of service worker events for stop command etc,
            switchMap(
                (job) => from(enableServiceWorkerEvents(job.tabId)),
                (job) => job
            ),
            //we need to set the network conditions
            switchMap(
                (job) => from(setNetworkConditions(job.tabId, job.latency, job.bandwidth_down, job.bandwidth_up)),
                (job) => job
            ),
            //we need an alert handler so alert boxes do not stop the tests
            switchMap(
                (job) => from(addAlertHandler(job.tabId)),
                (job) => job
            ),
            //then we need to switch to the active tab to get accurate image loads
            switchMap(
                (job) => from(switchToTab(job.tabId)),
                (job) => job
            ),
            //so set up is now complete and we can now start to work each job url into a page, then each iteration of that page
            switchMap(
                (job) => from(job.websites),
                (job, url) =>
                    new Page({
                        url: url,
                        tabId: job.tabId,
                        pageIterations: job.pageIterations,
                        withCache: job.withCache,
                        withServiceWorker: job.withServiceWorker,
                        screenshotWidth: job.screenshotWidth,
                    })
            ),
            //so here we start actioning the page and this needs to be concat map so it waits for each page to complete
            concatMap((page) => runSingleUrl$(page))
        )
        //report results and errors
        .subscribe(
            (res) => console.log(res),
            (err) => {
                sendConsoleMessage(`Cannot complete test job with ID: ${payload.id}: unrecoverable error: ${err}`);
            },
            () => {
                //then we detach the debugger
                stopDebugger(activeJob.tabId)
                    //then we close the test tab
                    .then(() => closeTestTab(activeJob.tabId))
                    //then we send the message
                    .then(() => sendConsoleMessage(`Completed Test Job: ${activeJob.id}`))
                    //then finally we reset the job
                    .then(() => {
                        activeJob = null;
                        activeJobSubscription = null;
                    });
            }
        );
};

//OBSERVABLES FOR REPEATING PAGE IERATIONS

const runSingleUrl$ = (page) => {
    return of(page).pipe(
        //wait for all the iterations to complete for the page
        concatMap((page) =>
            //this runs all the iterations required by user settings
            runIterations$(page).pipe(
                //returns an array which we map to the page, which we then return to the stream
                map((iterationsArray) => {
                    page.iterationsArray = iterationsArray;
                    return page;
                })
            )
        ),
        //run the stats collection from iterations
        tap((page) => {
            //this is where PAGE AVERAGE stats are computed
            page.updatePageStats();
            sendConsoleMessage(
                `Computing average page stats across ${page.pageIterations} iterations for <a target="_blank" href="${page.url}">${page.url}</a>`
            );
        }),
        //then run the screenshot
        switchMap(
            (page) => from(takeScreenshot(page.tabId, page.url, page.screenshotWidth)),
            (page, dataURL) => {
                page.screenshot = dataURL;
                return page;
            }
        ),
        //then send the data to the UI
        switchMap(
            (page) => from(sendPageData(page)),
            (page) => page
        ),
        //we need to take the page and return an inner observable, which essentially is a state provider about pause and resume
        //as we are using concatMap, the application will pause indefinitely until resume is clicked
        concatMap((page) =>
            //this starts as true and can only be changed by pause or abort message
            pauseResume$.pipe(
                //so we can see the current state for debugging
                tap((v) => console.log(`${v ? 'Application running' : 'Application paused'}`)),
                // Only emit from the inner observable if true
                filter((v) => v),
                //we only want one emission as we are switching back to the page
                take(1),
                //then a simple continuation
                switchMap(() => of(page))
            )
        )
    );
};

const runIterations$ = (page) => {
    return of(page).pipe(
        //we need to wait for the single iteration to complete, which depends upon the delay after the complete event in data collection observable
        concatMap((page) => runIteration$(page)),
        //this repeats as many times as required
        repeat(page.pageIterations),
        //then we want all the iterations collected as an array once complete
        //we could use scan, which halts the test if there are any errors in the data observable
        //but if we use toArray, the following urls continue to run and we just get an empty array
        toArray()
    );
};

const runIteration$ = (page) => {
    return of(page).pipe(
        //first we create the new iteration, with only the url and the tab id needed from the page
        map(
            (mappedPage) =>
                new Iteration({
                    url: mappedPage.url,
                    tabId: mappedPage.tabId,
                })
        ),
        //then we switchmap into an execution of the promises that clear the cache
        switchMap(
            (iteration) =>
                from(
                    page.withCache
                        ? //if the user has chosen to have the cache active then just resolve
                          Promise.resolve()
                        : //otherwise this clears the cache each time we start an iteration
                          Promise.all([clearCache(iteration.tabId), disableCache(iteration.tabId)])
                ),
            (iteration) => iteration
        ),
        //then we do the same with service workers
        switchMap(
            (iteration) =>
                from(
                    page.withServiceWorker
                        ? //if the user has chosen to have the cache active then just resolve
                          Promise.resolve()
                        : //otherwise this clears the cache each time we start an iteration
                          Promise.all([stopAllServiceWorkers(iteration.tabId)])
                ),
            (iteration) => iteration
        ),
        //then we switchMap into the actual execution of the commands, using combineLatest
        switchMap(
            (iteration) =>
                combineLatest(
                    //this is the key data collection observable at dataCollection.js - only emits 5 seconds after page completes
                    masterDataObservable.pipe(tap((data) => console.log(data))),
                    //this opens the page and injects the DCL and complete down/up scroll actions into runtime, this will emit almost instantly
                    from(navigateAndScroll(iteration.tabId, iteration.url)),
                    //this handles odd detachment of debugger on some pages
                    debouncedDebugger$(iteration).pipe(startWith(false))
                ),
            (
                //with result selector function we take iteration and array from combineLatest
                iteration,
                [
                    //then we need to deconstruct the RawData class object that comes back from the masterDataObservable
                    {
                        onBeforeRequestTime,
                        onInteractiveTime,
                        onCompleteTime,
                        dataUsageArray,
                        requestCount,
                        headerTimingsArray,
                        imageLoadArray,
                        imageCount,
                        mediaLoadArray,
                        mediaCount,
                        fontLoadArray,
                        fontCount,
                        styleLoadArray,
                        styleCount,
                        scriptLoadArray,
                        scriptCount,
                        htmlLoadArray,
                        htmlCount,
                        xhrLoadArray,
                        xhrCount,
                        fetchLoadArray,
                        fetchCount,
                        websocketLoadArray,
                        websocketCount,
                        errorArray,
                        errorCount,
                        metrics,
                    },
                    //then the placeholder for the output of the navigate and scroll
                    navigated,
                ]
            ) => {
                console.log(
                    `%cTest Suite: single iteration navigated: ${navigated}`,
                    'color: darkred; font-size: normal;'
                );
                //CONVERT RAW DATA CLASS TO ITERATION CLASS

                //timing stats
                iteration.onCommittedTime = onBeforeRequestTime - iteration.startTime;
                iteration.onDOMLoadedTime = onInteractiveTime - iteration.startTime;
                iteration.onCompleteTime = onCompleteTime - iteration.startTime;
                //major resource stats
                iteration.dataUsageTotal = dataUsageArray.filter(Boolean).reduce(Total, 0);
                iteration.requestTotal = requestCount;
                iteration.headerTimingsAverage = headerTimingsArray.filter(Boolean).reduce(RoundedAverage, 0);
                iteration.imageLoadTotal = imageLoadArray.filter(Boolean).reduce(Total, 0);
                iteration.imageRequestCount = imageCount;
                iteration.mediaLoadTotal = mediaLoadArray.filter(Boolean).reduce(Total, 0);
                iteration.mediaRequestCount = mediaCount;
                iteration.fontLoadTotal = fontLoadArray.filter(Boolean).reduce(Total, 0);
                iteration.fontRequestCount = fontCount;
                iteration.styleLoadTotal = styleLoadArray.filter(Boolean).reduce(Total, 0);
                iteration.styleRequestCount = styleCount;
                iteration.scriptLoadTotal = scriptLoadArray.filter(Boolean).reduce(Total, 0);
                iteration.scriptRequestCount = scriptCount;
                //minor resource stats
                iteration.htmlLoadTotal = htmlLoadArray.filter(Boolean).reduce(Total, 0);
                iteration.htmlRequestCount = htmlCount;
                iteration.xhrLoadTotal = xhrLoadArray.filter(Boolean).reduce(Total, 0);
                iteration.xhrRequestCount = xhrCount;
                iteration.fetchLoadTotal = fetchLoadArray.filter(Boolean).reduce(Total, 0);
                iteration.fetchRequestCount = fetchCount;
                iteration.websocketLoadTotal = websocketLoadArray.filter(Boolean).reduce(Total, 0);
                iteration.websocketRequestCount = websocketCount;
                //Note the addition of the errors
                iteration.errorArray = errorArray;
                iteration.errorCount = errorCount;
                //and the metrics map
                iteration.metrics = metrics;
                return iteration;
            }
        ),
        //only take one before killing the stream and unsubscribing from all inputs into the combineLatest stream
        take(1),
        //then this is where we kill the service worker if that's what's ordered
        switchMap(
            (iteration) =>
                from(
                    page.withServiceWorker
                        ? //if the user has chosen to keep service workers active then we just resolve
                          Promise.resolve()
                        : //otherwise this orders the examination of service workers and potentially stops them
                          stopServiceWorker(iteration.tabId)
                ),
            (iteration) => iteration
        )
    );
};

//TAB CONTROLS

const openTestTab = () => {
    //open the tab and report ready to console
    return new Promise((resolve, reject) => {
        chrome.tabs.create({ url: 'http://www.example.com', active: false }, function (tab) {
            if (tab) {
                sendConsoleMessage(`Loaded testing tab with ID: ${tab.id}`).then(() => {
                    //if we have an instant load then we resolve with the tab
                    if (tab.status === 'complete') {
                        console.log('LOADED INSTANTLY: http://www.example.com');
                        resolve(tab);
                        return;
                    }
                    //otherwise we wait for the complete event with an interval
                    const loadCompleteChecker = setInterval(() => {
                        chrome.tabs.get(tab.id, (newTab) => {
                            if (newTab.status === 'complete') {
                                console.log('LOADED AFTER INTERVAL: http://www.example.com');
                                clearInterval(loadCompleteChecker);
                                resolve(newTab);
                            }
                        });
                    }, 200);
                });
            } else {
                reject('Test Error: openTestTabAndCreateTestObject: No Tab Error');
            }
        });
    });
};

const closeTestTab = (tabID) => {
    return new Promise((resolve) => {
        //see which tabs are open
        chrome.tabs.query({}, (tabs) => {
            //we only need the ids
            const tabIdArray = tabs.map((tab) => tab.id);
            //if the tab is there then we need to close
            if (tabIdArray.includes(tabID)) {
                chrome.tabs.remove(tabID, () => {
                    sendConsoleMessage(`Closed Testing Tab with ID: ${tabID}`).then(() => resolve(true));
                });
            } else {
                //otherwise we just resolve
                resolve(false);
            }
        });
    });
};

const takeScreenshot = (tabID, url, screenshotWidth) => {
    return new Promise((resolve) => {
        //first we need to get the active tab
        getActiveTabId().then((currentTabId) => {
            switch (true) {
                //if we have the dev tools open then we don't want to attempt the screenshot as we just get an error
                case currentTabId === 0:
                    resolve(
                        `https://via.placeholder.com/${screenshotWidth}x${Math.round(
                            screenshotWidth / 1.77
                        )}.webp?text=No+screenshot+as+dev+tools+focused`
                    );
                    break;
                //if we are on the job tab then we can just take the screenshot and resolve with the data url
                case currentTabId === tabID:
                    Screenshot(url, screenshotWidth).then((dataURL) => resolve(dataURL));
                    break;
                //otherwise we need to switch to the job tab, take the screenshot, resolve with the data url and then switch back
                default:
                    switchToTab(tabID)
                        .then(() => Screenshot(url, screenshotWidth))
                        .then((dataURL) => resolve(dataURL))
                        .then(() => switchToTab(currentTabId));
            }
        });
    });
};

const Screenshot = (url, screenshotWidth) => {
    return new Promise((resolve) => {
        chrome.tabs.captureVisibleTab((dataURL) => {
            if (chrome.runtime.lastError) {
                sendConsoleMessage(`TEST ERROR: Tab Screenshot Error: ${chrome.runtime.lastError.message}`);
                resolve('');
                return;
            }
            resizeScreenshot(dataURL, screenshotWidth)
                .then((smallerDataUrl) => resolve(smallerDataUrl))
                .then(() => sendConsoleMessage(`Screenshot saved for <a target="_blank" href="${url}">${url}</a>`));
        });
    });
};

const resizeScreenshot = (dataURL, screenshotWidth) => {
    return new Promise((resolve) => {
        const sourceImage = new Image();
        sourceImage.onload = () => {
            //set the maximum we want, defined by user
            const maxWidth = screenshotWidth;
            const maxHeight = screenshotWidth;
            //then we get the natural width and height of the image
            const srcWidth = sourceImage.naturalWidth;
            const srcHeight = sourceImage.naturalHeight;
            //then we get the ratio
            const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
            //then we create the width and height for the canvas
            const canvasWidth = Math.round(srcWidth * ratio);
            const canvasHeight = Math.round(srcHeight * ratio);
            // Create a canvas with the desired dimensions
            var canvas = document.createElement('canvas');
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            // Scale and draw the source image to the canvas
            canvas.getContext('2d').drawImage(sourceImage, 0, 0, canvasWidth, canvasHeight);
            // Convert the canvas to a data URL in PNG format
            resolve(canvas.toDataURL('image/jpeg', 1.0));
        };
        sourceImage.src = dataURL;
    });
};

const getActiveTabId = () => {
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentTab = tabs[0];
            currentTab ? resolve(currentTab.id) : resolve(0);
        });
    });
};

const switchToTab = (tabId) => {
    return new Promise((resolve) => {
        chrome.tabs.update(tabId, { selected: true }, (response) => {
            setTimeout(() => resolve(response), 200);
        });
    });
};

//DEBUGGER COMMANDS

const stopDebugger = (tabId) => {
    return new Promise((resolve) => {
        disableNetworkEvents(tabId)
            .then(() => disablePageEvents(tabId))
            .then(() => disableServiceWorkerEvents(tabId))
            .then(() => disablePerformanceMetrics(tabId))
            .then(() => detachDebugger(tabId))
            .then(() => resolve());
    });
};

const attachDebugger = (tabID) => {
    return new Promise((resolve, reject) => {
        chrome.debugger.attach({ tabId: tabID }, '1.3', function (response) {
            if (chrome.runtime.lastError) {
                sendConsoleMessage(`Test Error: Remote Protocol Attach Error: ${chrome.runtime.lastError.message}`);
                reject(chrome.runtime.lastError.message);
                return;
            }
            console.log(`Test Suite: Chrome Debugger Opened`);
            resolve(response);
        });
    });
};

const detachDebugger = (tabID) => {
    return new Promise((resolve, reject) => {
        chrome.debugger.detach({ tabId: tabID }, function (response) {
            if (chrome.runtime.lastError) {
                sendConsoleMessage(`Test Error: Remote Protocol Detach Error: ${chrome.runtime.lastError.message}`);
                reject(chrome.runtime.lastError.message);
                return;
            }
            console.log(`Test Suite: Chrome Debugger Closed`);
            resolve(response);
        });
    });
};

const enableNetworkEvents = (tabID) => {
    return new Promise((resolve, reject) => {
        chrome.debugger.sendCommand({ tabId: tabID }, 'Network.enable', {}, function (response) {
            if (chrome.runtime.lastError) {
                sendConsoleMessage(`Test Error: Network Domain Enabling Error: ${chrome.runtime.lastError.message}`);
                reject(chrome.runtime.lastError.message);
                return;
            }
            console.log(`Test Suite: Chrome Debugger Network Domain Notifications Enabled`);
            resolve(response);
        });
    });
};

const disableNetworkEvents = (tabID) => {
    return new Promise((resolve, reject) => {
        chrome.debugger.sendCommand({ tabId: tabID }, 'Network.disable', {}, function (response) {
            if (chrome.runtime.lastError) {
                sendConsoleMessage(`Test Error: Network Domain Disabling Error: ${chrome.runtime.lastError.message}`);
                reject(chrome.runtime.lastError.message);
                return;
            }
            console.log(`Test Suite: Chrome Debugger Network Domain Notifications Disabled`);
            resolve(response);
        });
    });
};

const enablePageEvents = (tabID) => {
    return new Promise((resolve, reject) => {
        chrome.debugger.sendCommand({ tabId: tabID }, 'Page.enable', {}, function (response) {
            if (chrome.runtime.lastError) {
                sendConsoleMessage(`Test Error: Page Domain Enabling Error: ${chrome.runtime.lastError.message}`);
                reject(chrome.runtime.lastError.message);
                return;
            }
            console.log(`Test Suite: Chrome Debugger Page Domain Notifications Enabled`);
            resolve(response);
        });
    });
};

const disablePageEvents = (tabID) => {
    return new Promise((resolve, reject) => {
        chrome.debugger.sendCommand({ tabId: tabID }, 'Page.disable', {}, function (response) {
            if (chrome.runtime.lastError) {
                sendConsoleMessage(`Test Error: Page Domain Disabling Error: ${chrome.runtime.lastError.message}`);
                reject(chrome.runtime.lastError.message);
                return;
            }
            console.log(`Test Suite: Chrome Debugger Page Domain Notifications Disabled`);
            resolve(response);
        });
    });
};

const enablePerformanceMetrics = (tabID) => {
    return new Promise((resolve, reject) => {
        chrome.debugger.sendCommand({ tabId: tabID }, 'Performance.enable', { timeDomain: 'timeTicks' }, function (
            response
        ) {
            if (chrome.runtime.lastError) {
                sendConsoleMessage(
                    `Test Error: Performance Metrics Enabling Error: ${chrome.runtime.lastError.message}`
                );
                reject(chrome.runtime.lastError.message);
                return;
            }
            console.log(`Test Suite: Chrome Debugger Performance Metrics Enabled`);
            resolve(response);
        });
    });
};

const getPerformanceMetrics = (tabID) => {
    return new Promise((resolve, reject) => {
        chrome.debugger.sendCommand({ tabId: tabID }, 'Performance.getMetrics', {}, function (metrics) {
            if (chrome.runtime.lastError) {
                sendConsoleMessage(
                    `Test Error: Performance Metrics Collect Error: ${chrome.runtime.lastError.message}`
                );
                reject(chrome.runtime.lastError.message);
                return;
            }
            console.log(`Test Suite: Chrome Debugger Performance Metrics Retrieved`);
            resolve(metrics);
        });
    });
};

const disablePerformanceMetrics = (tabID) => {
    return new Promise((resolve, reject) => {
        chrome.debugger.sendCommand({ tabId: tabID }, 'Performance.disable', {}, function (response) {
            if (chrome.runtime.lastError) {
                sendConsoleMessage(
                    `Test Error: Performance Metrics Disabling Error: ${chrome.runtime.lastError.message}`
                );
                reject(chrome.runtime.lastError.message);
                return;
            }
            console.log(`Test Suite: Chrome Debugger Performance Metrics Disabled`);
            resolve(response);
        });
    });
};

const enableServiceWorkerEvents = (tabID) => {
    return new Promise((resolve, reject) => {
        chrome.debugger.sendCommand({ tabId: tabID }, 'ServiceWorker.enable', {}, function (response) {
            if (chrome.runtime.lastError) {
                sendConsoleMessage(
                    `Test Error: ServiceWorker Domain Enabling Error: ${chrome.runtime.lastError.message}`
                );
                reject(chrome.runtime.lastError.message);
                return;
            }
            console.log(`Test Suite: Chrome Debugger ServiceWorker Domain Notifications Enabled`);
            resolve(response);
        });
    });
};

const stopAllServiceWorkers = (tabID) => {
    return new Promise((resolve, reject) => {
        chrome.debugger.sendCommand({ tabId: tabID }, 'ServiceWorker.stopAllWorkers', {}, function (response) {
            if (chrome.runtime.lastError) {
                sendConsoleMessage(
                    `Test Error: ServiceWorker stopAllWorkers Error: ${chrome.runtime.lastError.message}`
                );
                reject(chrome.runtime.lastError.message);
                return;
            }
            console.log(`Test Suite: Chrome Debugger ServiceWorker stopAllWorkers completed`);
            sendConsoleMessage('Service workers stopped');
            resolve(response);
        });
    });
};

const disableServiceWorkerEvents = (tabID) => {
    return new Promise((resolve, reject) => {
        chrome.debugger.sendCommand({ tabId: tabID }, 'ServiceWorker.disable', {}, function (response) {
            if (chrome.runtime.lastError) {
                sendConsoleMessage(
                    `Test Error: ServiceWorker Domain Enabling Error: ${chrome.runtime.lastError.message}`
                );
                reject(chrome.runtime.lastError.message);
                return;
            }
            console.log(`Test Suite: Chrome Debugger ServiceWorker Domain Notifications Enabled`);
            resolve(response);
        });
    });
};

const setNetworkConditions = (tabID, latency, downloadSpeed, uploadSpeed) => {
    return new Promise((resolve, reject) => {
        chrome.debugger.sendCommand(
            { tabId: tabID },
            'Network.emulateNetworkConditions',
            {
                offline: false,
                latency: latency,
                downloadThroughput: downloadSpeed,
                uploadThroughput: uploadSpeed,
            },
            function (response) {
                if (chrome.runtime.lastError) {
                    sendConsoleMessage(`Test Error: Throttle Bandwidth Error: ${chrome.runtime.lastError.message}`);
                    reject(chrome.runtime.lastError.message);
                    return;
                }
                sendConsoleMessage(
                    `Network conditions customised: latency ${latency} ms, download ${downloadSpeed} bytes/sec, upload ${uploadSpeed} bytes/sec`
                );
                console.log(
                    `Test Suite: Chrome Debugger Network Conditions - Latency: ${latency} ms, DownloadSpeed: ${downloadSpeed} bytes/sec, UploadSpeed ${uploadSpeed} bytes/sec`
                );
                resolve(response);
            }
        );
    });
};

const clearCache = (tabID) => {
    return new Promise((resolve, reject) => {
        chrome.debugger.sendCommand({ tabId: tabID }, 'Network.clearBrowserCache', function (response) {
            if (chrome.runtime.lastError) {
                sendConsoleMessage(
                    `Test Error: Remote Protocol Clear Cache Error: ${chrome.runtime.lastError.message}`
                );
                reject(chrome.runtime.lastError.message);
                return;
            }
            sendConsoleMessage('Browser cache cleared');
            console.log(`Test Suite: Chrome Debugger Cache Cleared`);
            resolve(response);
        });
    });
};

const disableCache = (tabID) => {
    return new Promise((resolve, reject) => {
        chrome.debugger.sendCommand({ tabId: tabID }, 'Network.setCacheDisabled', { cacheDisabled: true }, function (
            response
        ) {
            if (chrome.runtime.lastError) {
                sendConsoleMessage(
                    `Test Error: Remote Protocol Disable Cache Error: ${chrome.runtime.lastError.message}`
                );
                reject(chrome.runtime.lastError.message);
                return;
            }
            sendConsoleMessage('Browser cache disabled');
            console.log(`Test Suite: Chrome Debugger Cache Disabled`);
            resolve(response);
        });
    });
};

const pageNavigate = (tabID, url) => {
    return new Promise((resolve, reject) => {
        chrome.debugger.sendCommand({ tabId: tabID }, 'Page.navigate', { url: url }, function (response) {
            if (chrome.runtime.lastError) {
                sendConsoleMessage(
                    `Test Error: Remote Protocol Page Navigate Error: ${chrome.runtime.lastError.message}`
                );
                reject(chrome.runtime.lastError.message);
                return;
            }
            sendConsoleMessage(`Navigated to <a target="_blank" href="${url}">${url}</a>`);
            console.log(`Test Suite: Chrome Debugger Navigated to URL: ${url}`);
            resolve(response);
        });
    });
};

const dismissAlert = (tabID) => {
    return new Promise((resolve, reject) => {
        chrome.debugger.sendCommand({ tabId: tabID }, 'Page.handleJavaScriptDialog', { accept: true }, function (
            response
        ) {
            if (chrome.runtime.lastError) {
                sendConsoleMessage(`Test Error: Dismiss Alert Arror: ${chrome.runtime.lastError.message}`);
                reject(chrome.runtime.lastError.message);
                return;
            }
            sendConsoleMessage(`Dismissed alert dialog on <a target="_blank" href="${url}">${url}</a>`);
            resolve(response);
        });
    });
};

const addAlertHandler = (tabID) => {
    return new Promise((resolve) => {
        //add the event when we start - this will only fire very seldom passing an object with url <string>, message <string>, type <DialogType>, hasBrowserHandler <boolean>
        chrome.debugger.onEvent.addListener((_, message, obj) => {
            //filter the debugging events for the alert opening event
            if (message == 'Page.javascriptDialogOpening') {
                //then if we get the event we just need to dismiss the alert
                dismissAlert(tabID).then(() => {
                    //report what we have done
                    console.log(
                        `Test Suite: Dismissed ${obj.type.toUpperCase()} Dialog at: ${obj.url} with message: ${
                            obj.message
                        }`
                    );
                });
            }
        });
        //then we just resolve once the handler has been added
        resolve();
    });
};

const scrollPageToBottom = (tabID) => {
    return new Promise((resolve, reject) => {
        chrome.debugger.sendCommand(
            { tabId: tabID },
            'Runtime.evaluate',
            {
                expression:
                    "document.addEventListener('DOMContentLoaded', () => { window.scrollBy( { top: document.body.scrollHeight, left: 0, behavior: 'smooth' } ); });",
            },
            function () {
                if (chrome.runtime.lastError) {
                    sendConsoleMessage(`Test Error: Scroll To Bottom Error: ${chrome.runtime.lastError.message}`);
                    reject(chrome.runtime.lastError.message);
                    return;
                }
                resolve();
            }
        );
    });
};

const scrollPageToTop = (tabID) => {
    return new Promise((resolve, reject) => {
        chrome.debugger.sendCommand(
            { tabId: tabID },
            'Runtime.evaluate',
            {
                expression:
                    "window.addEventListener('load', () => { setTimeout(() => window.scrollTo( { top: 0, left: 0, behavior: 'smooth' } ), 4000); });",
            },
            function () {
                if (chrome.runtime.lastError) {
                    sendConsoleMessage(`Test Error: Scroll to Top Error: ${chrome.runtime.lastError.message}`);
                    reject(chrome.runtime.lastError.message);
                    return;
                }
                resolve();
            }
        );
    });
};

const navigateAndScroll = (tabId, url) => {
    return new Promise((resolve) => {
        //first we navigate to the page
        pageNavigate(tabId, url)
            //then we instruct the run time to execute a scroll to bottom and then wait for 500 milliseconds
            .then(() => scrollPageToBottom(tabId))
            //then we instruct the run time to execute a scroll to top and then wait for 500 milliseconds
            .then(() => scrollPageToTop(tabId))
            //then once the user interactions have taken place we can resolve
            .then(() => resolve(true))
            .catch((err) => {
                //on a scroll error we can just resolve
                resolve(true);
                //but we need to see it
                console.log(err);
            });
    });
};

//UTILS

const stopServiceWorker = (tabId) => {
    return new Promise((resolve) => {
        chrome.tabs.sendMessage(tabId, { command: 'STOP_SERVICE_WORKER' }, (response) => {
            //handle any errors that might arise but do not let it stop the test
            if (chrome.runtime.lastError) {
                console.log(`TEST ERROR: Stop Service Worker: ${chrome.runtime.lastError.message}`);
                resolve();
                return;
            }
            sendConsoleMessage(`${response.message}`);
            resolve(response);
        });
    });
};

const sendConsoleMessage = (text) => {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({
            command: 'incomingConsoleMessage',
            message: text,
        });
        resolve();
    });
};

const sendPageData = (payload) => {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({
            command: 'incomingPageData',
            payload: payload,
        });
        resolve();
    });
};
