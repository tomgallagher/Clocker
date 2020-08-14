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
} = rxjs.operators;

//we need the active job and the active job observable subscription in global scope
let activeJob = null;
let activeJobSubscription = null;

//enable the browser action click
chrome.browserAction.onClicked.addListener(function () {
    chrome.tabs.create({ url: 'index.html' });
});

chrome.runtime.onMessage.addListener((request) => {
    console.log(request);
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
            //first we stop the subscription, which will prevent any further processing
            if (activeJobSubscription) {
                //first we stop the subscription, which will prevent any further processing
                activeJobSubscription.unsubscribe();
                //then we close the test tab
                closeTestTab(activeJob.tabId).then(() =>
                    //then we send the message
                    sendConsoleMessage(`Aborted Test Job: ${activeJob.id}`)
                );
            }
            break;
        default:
            console.log('Unrecognised Message Command');
    }
});

//TEST START FUNCTION

const runJob = (payload) => {
    //report start to user console
    sendConsoleMessage(`Started test job with ID: ${payload.id}`);
    //so we attach the active job description to the processing of the incoming payload
    activeJobSubscription = of(payload)
        .pipe(
            //first map to the background js job class so we have everything we need to run the test
            map((payload) => new Job(payload)),
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
                    })
            ),
            //so here we start actioning the page and this needs to be concat map so it waits for each page to complete
            concatMap((page) => from(runSingleUrl(page)))
        )
        //report results and errors
        .subscribe(
            (res) => console.log(res),
            (err) => sendConsoleMessage(`Cannot complete test job with ID: ${payload.id}: unrecoverable error: ${err}`),
            () => {
                sendConsoleMessage(`Completed test job with ID: ${payload.id}`).then(() =>
                    detachDebugger(activeJob.tabId)
                );
            }
        );
};

//PROMISES FOR REPEAT

const runSingleUrl = (page) => {
    return new Promise((resolve) => {
        of(page)
            .pipe(flatMap((page) => from(runIterations(page))))
            .subscribe((page) => resolve(page));
    });
};

const runIterations = (page) => {
    return new Promise((resolve, reject) => {
        //here we encase the promise in an observable so that our single promise can be retried
        var rxShelledPromise = defer(() => from(runIteration(page)));
        //then we subscribe to the promise with a repeat setting - the number of interations minus 1 as we have already done one
        rxShelledPromise.pipe(repeat(page.pageIterations)).subscribe(
            (iteration) => {
                page.iterationsArray.push(iteration);
            },
            function (err) {
                console.log(`Test Suite: run iterations Error: ${err}`);
                reject(err);
            },
            function () {
                console.log(`%cTest Suite: runIterations Completed`, 'color: darkred; font-size: normal;');
                resolve(page);
            }
        );
    });
};

const runIteration = (page) => {
    return new Promise((resolve) => {
        of(page)
            .pipe(
                //first we create the new iteration, with only the url and the tab id needed from the page
                map(
                    (mappedPage) =>
                        new Iteration({
                            url: mappedPage.url,
                            tabId: mappedPage.tabId,
                        })
                ),
                //then we switchmap into an execution of the promises that clears the cache
                switchMap(
                    (iteration) =>
                        from(
                            //this clears the cache each time we start
                            Promise.all([clearCache(iteration.tabId), disableCache(iteration.tabId)])
                        ),
                    (iteration) => iteration
                ),
                //then we switchMap into the actual execution of the commands, using combineLatest
                switchMap(
                    (iteration) =>
                        combineLatest(
                            from(navigateAndScroll(iteration.tabId, iteration.url)),
                            //this is the key data collection observable at dataCollection.js
                            masterDataObservable.pipe(tap((data) => console.log(data)))
                        ),
                    (
                        iteration,
                        [
                            _,
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
                            },
                        ]
                    ) => {
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
                        iteration.htmlLoadTotal = htmlLoadArray.filter(Boolean).reduce(Total, 0);
                        iteration.htmlRequestCount = htmlCount;
                        //minor resource stats
                        iteration.xhrLoadTotal = xhrLoadArray.filter(Boolean).reduce(Total, 0);
                        iteration.xhrRequestCount = xhrCount;
                        iteration.fetchLoadTotal = fetchLoadArray.filter(Boolean).reduce(Total, 0);
                        iteration.fetchRequestCount = fetchCount;
                        iteration.websocketLoadTotal = websocketLoadArray.filter(Boolean).reduce(Total, 0);
                        iteration.websocketRequestCount = websocketCount;
                        //Note the addition of the errors
                        iteration.errorArray = errorArray;
                        iteration.errorCount = errorCount;

                        return iteration;
                    }
                ),
                //only take one before killing the stream and unsubscribing from all three inputs into the combineLatest stream
                take(1)
            )
            //then report and resolve
            .subscribe((iteration) => {
                resolve(iteration);
            });
    });
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
    return new Promise((resolve, reject) => {
        chrome.tabs.remove(tabID, function () {
            sendConsoleMessage(`Closed Testing Tab with ID: ${tabID}`)
                .then(() => resolve())
                .catch((err) => {
                    sendConsoleMessage(`Test Error: testSuiteHandler.closeTestTab: FAILED ON: ${err}`);
                    reject(err);
                });
        });
    });
};

const takeScreenshot = (tabID, url) => {
    return new Promise((resolve) => {
        //first we need to get the active tab
        getActiveTabId().then((currentTabId) => {
            if (currentTabId === tabID) {
                //if we are on the job tab then we can just take the screenshot and resolve with the data url
                Screenshot(url).then((dataURL) => resolve(dataURL));
            } else {
                //otherwise we need to switch to the job tab, take the screenshot, resolve with the data url and then switch back
                switchToTab(tabID)
                    .then(() => Screenshot(url))
                    .then((dataURL) => resolve(dataURL))
                    .then(() => switchToTab(currentTabId));
            }
        });
    });
};

const Screenshot = (url) => {
    return new Promise((resolve) => {
        chrome.tabs.captureVisibleTab((dataURL) => {
            if (chrome.runtime.lastError) {
                sendConsoleMessage(`TEST ERROR: Tab Screenshot Error: ${chrome.runtime.lastError.message}`);
                resolve('');
                return;
            }
            sendConsoleMessage(`Screenshot saved for <a target="_blank" href="${url}">${url}</a>`);
            resolve(dataURL);
        });
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
        chrome.tabs.update(tabId, { active: true }, () => resolve());
    });
};

//DEBUGGER COMMANDS

const attachDebugger = (tabID) => {
    return new Promise((resolve, reject) => {
        chrome.debugger.attach({ tabId: tabID }, '1.3', function () {
            if (chrome.runtime.lastError) {
                sendConsoleMessage(`Test Error: Remote Protocol Attach Error: ${chrome.runtime.lastError.message}`);
                reject(chrome.runtime.lastError.message);
                return;
            }
            console.log(`Test Suite: Chrome Debugger Opened`);
            resolve();
        });
    });
};

const detachDebugger = (tabID) => {
    return new Promise((resolve, reject) => {
        chrome.debugger.detach({ tabId: tabID }, function () {
            if (chrome.runtime.lastError) {
                sendConsoleMessage(`Test Error: Remote Protocol Detach Error: ${chrome.runtime.lastError.message}`);
                reject(chrome.runtime.lastError.message);
                return;
            }
            console.log(`Test Suite: Chrome Debugger Closed`);
            resolve();
        });
    });
};

const enableNetworkEvents = (tabID) => {
    return new Promise((resolve, reject) => {
        chrome.debugger.sendCommand({ tabId: tabID }, 'Network.enable', {}, function () {
            if (chrome.runtime.lastError) {
                sendConsoleMessage(`Test Error: Network Domain Enabling Error: ${chrome.runtime.lastError.message}`);
                reject(chrome.runtime.lastError.message);
                return;
            }
            console.log(`Test Suite: Chrome Debugger NetWork Domain Notifications Enabled`);
            resolve();
        });
    });
};

const enablePageEvents = (tabID) => {
    return new Promise((resolve, reject) => {
        chrome.debugger.sendCommand({ tabId: tabID }, 'Page.enable', {}, function () {
            if (chrome.runtime.lastError) {
                sendConsoleMessage(`Test Error: Page Domain Enabling Error: ${chrome.runtime.lastError.message}`);
                reject(chrome.runtime.lastError.message);
                return;
            }
            console.log(`Test Suite: Chrome Debugger Page Domain Notifications Enabled`);
            resolve();
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
            function () {
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
                resolve();
            }
        );
    });
};

const clearCache = (tabID) => {
    return new Promise((resolve, reject) => {
        chrome.debugger.sendCommand({ tabId: tabID }, 'Network.clearBrowserCache', function () {
            if (chrome.runtime.lastError) {
                sendConsoleMessage(
                    `Test Error: Remote Protocol Clear Cache Error: ${chrome.runtime.lastError.message}`
                );
                reject(chrome.runtime.lastError.message);
                return;
            }
            sendConsoleMessage('Browser cache cleared');
            console.log(`Test Suite: Chrome Debugger Cache Cleared`);
            resolve();
        });
    });
};

const disableCache = (tabID) => {
    return new Promise((resolve, reject) => {
        chrome.debugger.sendCommand({ tabId: tabID }, 'Network.setCacheDisabled', { cacheDisabled: true }, function () {
            if (chrome.runtime.lastError) {
                sendConsoleMessage(
                    `Test Error: Remote Protocol Disable Cache Error: ${chrome.runtime.lastError.message}`
                );
                reject(chrome.runtime.lastError.message);
                return;
            }
            sendConsoleMessage('Browser cache disabled');
            console.log(`Test Suite: Chrome Debugger Cache Disabled`);
            resolve();
        });
    });
};

const pageNavigate = (tabID, url) => {
    return new Promise((resolve, reject) => {
        chrome.debugger.sendCommand({ tabId: tabID }, 'Page.navigate', { url: url }, function () {
            if (chrome.runtime.lastError) {
                sendConsoleMessage(
                    `Test Error: Remote Protocol Page Navigate Error: ${chrome.runtime.lastError.message}`
                );
                reject(chrome.runtime.lastError.message);
                return;
            }
            sendConsoleMessage(`Navigated to <a target="_blank" href="${url}">${url}</a>`);
            console.log(`Test Suite: Chrome Debugger Navigated to URL: ${url}`);
            resolve();
        });
    });
};

const dismissAlert = (tabID) => {
    return new Promise((resolve, reject) => {
        chrome.debugger.sendCommand({ tabId: tabID }, 'Page.handleJavaScriptDialog', { accept: true }, function () {
            if (chrome.runtime.lastError) {
                sendConsoleMessage(`Test Error: Dismiss Alert Arror: ${chrome.runtime.lastError.message}`);
                reject(chrome.runtime.lastError.message);
                return;
            }
            sendConsoleMessage(`Dismissed alert dialog on <a target="_blank" href="${url}">${url}</a>`);
            resolve();
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
                    "window.addEventListener('load', () => { window.scrollTo( { top: 0, left: 0, behavior: 'smooth' } ); });",
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

const sendConsoleMessage = (text) => {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({
            command: 'incomingConsoleMessage',
            message: text,
        });
        resolve();
    });
};
