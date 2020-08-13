const { of, from } = rxjs;
const { map, switchMap, tap } = rxjs.operators;

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
            startTest(request.payload);
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

const startTest = (payload) => {
    //report start to user console
    sendConsoleMessage(`Started Test Job: ${payload.id}`);
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
            //then save the active job details to the globals for access anywhere
            tap((job) => (activeJob = job)),
            //then we run the debugger commands to get started
            switchMap(
                //we need to have the job to be able to pass the tab id to attach debugger etc
                (job) =>
                    //we want to move forward when all our debugger commands have executed in sequence so we supply a promise
                    from(
                        new Promise((resolve) =>
                            //each of the promises in this array will be executed in sequence
                            [attachDebugger(job.tabId)]
                                //this executes each of the promises as f, using a resolved promise as initial value of p in the reducer
                                .reduce((p, f) => p.then(f), Promise.resolve())
                                //and this completes the switchmap functtion when all the promises have been executed
                                .then(() => resolve())
                        )
                    ),
                //and we just pass back the job once all the params on the debugger have been set up
                (job) => job
            )
        )
        //report results and errors
        .subscribe(
            (res) => console.log(res),
            (err) => console.log(err),
            () => {
                sendConsoleMessage(
                    `Completed Test Job: ${payload.id}`
                ).then(() => detachDebugger(activeJob.tabId));
            }
        );
};

//TAB CONTROLS

const openTestTab = () => {
    //open the tab and report ready to console
    return new Promise((resolve, reject) => {
        chrome.tabs.create(
            { url: 'http://www.example.com', active: false },
            function (tab) {
                if (tab) {
                    sendConsoleMessage(
                        `Loaded Testing Tab with ID: ${tab.id}`
                    ).then(() => {
                        //if we have an instant load then we resolve with the tab
                        if (tab.status === 'complete') {
                            console.log(
                                'LOADED INSTANTLY: http://www.example.com'
                            );
                            resolve(tab);
                            return;
                        }
                        //otherwise we wait for the complete event with an interval
                        const loadCompleteChecker = setInterval(() => {
                            chrome.tabs.get(tab.id, (newTab) => {
                                if (newTab.status === 'complete') {
                                    console.log(
                                        'LOADED AFTER INTERVAL: http://www.example.com'
                                    );
                                    clearInterval(loadCompleteChecker);
                                    resolve(newTab);
                                }
                            });
                        }, 200);
                    });
                } else {
                    reject(
                        'TEST ERROR: openTestTabAndCreateTestObject: No Tab Error'
                    );
                }
            }
        );
    });
};

const closeTestTab = function (tabID) {
    return new Promise((resolve, reject) => {
        chrome.tabs.remove(tabID, function () {
            sendConsoleMessage(`Closed Testing Tab with ID: ${tabID}`)
                .then(() => resolve())
                .catch((err) => {
                    sendConsoleMessage(
                        `TEST ERROR: testSuiteHandler.closeTestTab: FAILED ON: ${err}`
                    );
                    reject(err);
                });
        });
    });
};

//DEBUGGER COMMANDS

const attachDebugger = (tabID) => {
    return new Promise((resolve, reject) => {
        chrome.debugger.attach({ tabId: tabID }, '1.3', function () {
            if (chrome.runtime.lastError) {
                sendConsoleMessage(
                    `TEST ERROR: Remote Protocol Attach Error: ${chrome.runtime.lastError.message}`
                );
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
                sendConsoleMessage(
                    `TEST ERROR: Remote Protocol Detach Error: ${chrome.runtime.lastError.message}`
                );
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
        chrome.debugger.sendCommand(
            { tabId: tabID },
            'Network.enable',
            {},
            function () {
                if (chrome.runtime.lastError) {
                    sendConsoleMessage(
                        `TEST ERROR: Network Domain Enabling Error: ${chrome.runtime.lastError.message}`
                    );
                    reject(chrome.runtime.lastError.message);
                    return;
                }
                console.log(
                    `Test Suite: Chrome Debugger NetWork Domain Notifications Enabled`
                );
                resolve();
            }
        );
    });
};

const enablePageEvents = (tabID) => {
    return new Promise((resolve, reject) => {
        chrome.debugger.sendCommand(
            { tabId: tabID },
            'Page.enable',
            {},
            function () {
                if (chrome.runtime.lastError) {
                    sendConsoleMessage(
                        `TEST ERROR: Page Domain Enabling Error: ${chrome.runtime.lastError.message}`
                    );
                    reject(chrome.runtime.lastError.message);
                    return;
                }
                console.log(
                    `Test Suite: Chrome Debugger Page Domain Notifications Enabled`
                );
                resolve();
            }
        );
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
                    sendConsoleMessage(
                        `TEST ERROR: Throttle Bandwidth Error: ${chrome.runtime.lastError.message}`
                    );
                    reject(chrome.runtime.lastError.message);
                    return;
                }
                sendConsoleMessage(
                    `Chrome Debugger Network Conditions Set - Latency: ${latency} ms, DownloadSpeed: ${downloadSpeed} bytes/sec, UploadSpeed ${uploadSpeed} bytes/sec`
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
        chrome.debugger.sendCommand(
            { tabId: tabID },
            'Network.clearBrowserCache',
            function () {
                if (chrome.runtime.lastError) {
                    sendConsoleMessage(
                        `TEST ERROR: Remote Protocol Clear Cache Error: ${chrome.runtime.lastError.message}`
                    );
                    reject(chrome.runtime.lastError.message);
                    return;
                }
                console.log(`Test Suite: Chrome Debugger Cache Cleared`);
                resolve();
            }
        );
    });
};

const disableCache = (tabID) => {
    return new Promise((resolve, reject) => {
        chrome.debugger.sendCommand(
            { tabId: tabID },
            'Network.setCacheDisabled',
            { cacheDisabled: true },
            function () {
                if (chrome.runtime.lastError) {
                    sendConsoleMessage(
                        `TEST ERROR: Remote Protocol Disable Cache Error: ${chrome.runtime.lastError.message}`
                    );
                    reject(chrome.runtime.lastError.message);
                    return;
                }
                console.log(`Test Suite: Chrome Debugger Cache Disabled`);
                resolve();
            }
        );
    });
};

const pageNavigate = (url, tabID) => {
    return new Promise((resolve, reject) => {
        chrome.debugger.sendCommand(
            { tabId: tabID },
            'Page.navigate',
            { url: url },
            function () {
                if (chrome.runtime.lastError) {
                    sendConsoleMessage(
                        `TEST ERROR: Remote Protocol Page Navigate Error: ${chrome.runtime.lastError.message}`
                    );
                    reject(chrome.runtime.lastError.message);
                    return;
                }
                sendConsoleMessage(`TEST PROGRESS REPORT: Navigated to ${url}`);
                console.log(
                    `Test Suite: Chrome Debugger Navigated to URL: ${url}`
                );
                resolve();
            }
        );
    });
};

const dismissAlert = (tabID) => {
    return new Promise((resolve, reject) => {
        chrome.debugger.sendCommand(
            { tabId: tabID },
            'Page.handleJavaScriptDialog',
            { accept: true },
            function () {
                if (chrome.runtime.lastError) {
                    sendConsoleMessage(
                        `TEST ERROR: Dismiss Alert Arror: ${chrome.runtime.lastError.message}`
                    );
                    reject(chrome.runtime.lastError.message);
                    return;
                }
                resolve();
            }
        );
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
                        `Test Suite: Dismissed ${obj.type.toUpperCase()} Dialog at: ${
                            obj.url
                        } with message: ${obj.message}`
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
                    sendConsoleMessage(
                        `TEST ERROR: Scroll To Bottom Error: ${chrome.runtime.lastError.message}`
                    );
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
                    sendConsoleMessage(
                        `TEST ERROR: Scroll to Top Error: ${chrome.runtime.lastError.message}`
                    );
                    reject(chrome.runtime.lastError.message);
                    return;
                }
                resolve();
            }
        );
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
