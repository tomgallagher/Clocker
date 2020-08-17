/*
    we need to keep a collection of RAW, FILTERED AND COMBINED observables that we use in the main message action routine
    
    1. RAW DATA OBSERVABLES

*/

//SOURCE OBSERVABLE - ON COMPLETE EVENT

//this event is going to provide us with header and resource type information about iframes which is not reported by the debugger network events

//as we are trying to collect header information about all resources loaded by an iframe we need to have an exhaustive list
const onCompleteDataFilter = {
    urls: ['<all_urls>'],
    types: ['sub_frame', 'stylesheet', 'script', 'image', 'font', 'media', 'xmlhttprequest'],
};
//the content length header is what we'll be using for data loads so we need to have the response headers as info
const completeOptions = ['responseHeaders'];

//then we want to wrap the onComplete Event in an observable so we can link it with other event observables
const onWebRequestCompleteObservable = fromEventPattern(
    (handler) => {
        //make sure we report subscription and unsubscription so we can see the memory being cleared on each page load
        console.log(`Test Suite: SUBSCRIBED to SHARED Web Request onComplete Observer.`);
        //then we add the listener with the handler function for the callback and the filters for the requests
        chrome.webRequest.onCompleted.addListener(handler, onCompleteDataFilter, completeOptions);
    },
    (handler) => {
        //report unsubscription
        console.log(`Test Suite: UNSUBSCRIBED from SHARED Web Request onComplete Observer.`);
        //remove the onComplete Event handler function from the listener
        chrome.webRequest.onCompleted.removeListener(handler);
    },
    // returns { requestId: <string>, url: <string>, method: <string>, frameId: <integer>, parentFrameId: <integer>, tabId: <integer>, type: <ResourceType>,
    // initiator <string>, timeStamp: <double>, fromCache: <boolean>, statusCode: <integer>, responseHeaders: <HttpHeaders array>, statusLine: <string> }
    (requestInfo) => requestInfo
    //and this is shared amongst many subscribers
).pipe(share());

//SOURCE OBSERVABLE - ON ERROR EVENT

//This event shows us what the browser or the content-blocking extension has blocked

//as we are trying to collect error information about all blocked resources we need to have an exhaustive list
const onErrorDataFilter = {
    urls: ['<all_urls>'],
    types: ['sub_frame', 'stylesheet', 'script', 'image', 'font', 'media', 'xmlhttprequest'],
};
//the content length header is what we'll be using for data loads so we need to have the response headers as info
const errorOptions = ['extraHeaders'];

//then we want to wrap the onErrorOccurred Event in an observable so we can link it with other event observables
const onWebRequestErrorObservable = fromEventPattern(
    (handler) => {
        //make sure we report subscription and unsubscription so we can see the memory being cleared on each page load
        console.log(`Test Suite: SUBSCRIBED to SHARED Web Request onErrorOccurred Observer.`);
        //then we add the listener with the handler function for the callback and the filters for the requests
        chrome.webRequest.onErrorOccurred.addListener(handler, onErrorDataFilter, errorOptions);
    },
    (handler) => {
        //report unsubscription
        console.log(`Test Suite: UNSUBSCRIBED from SHARED Web Request onErrorOccurred Observer.`);
        //remove the onErrorOccurred Event handler function from the listener
        chrome.webRequest.onErrorOccurred.removeListener(handler);
    },
    // returns { requestId: <string>, url: <string>, method: <string>, frameId: <integer>, parentFrameId: <integer>, tabId: <integer>, type: <ResourceType>,
    // initiator <string>, timeStamp: <double>, fromCache: <boolean>, error: <string>, responseHeaders: <HttpHeaders array> }
    (requestInfo) => requestInfo
    //and this is shared amongst many subscribers
).pipe(
    //start with an empty object to ensure that zip emits
    startWith({ type: 'dummyError' }),
    //then share
    share()
);
//SOURCE OBSERVABLES - NAVIGATION EVENTS

//THIS TURNS ALL NAVIGATION EVENTS INTO AN OBSERVABLE

//we need to only listen for events that are public - not file:// or chrome:// or chrome-extensions:// - these are not public pages
//Filters provided to API method in an Array of UrlFilters - we only want to filter according to schemes
const filteredNavigationURLs = [
    //listening only for the schemes that inidicate a public url
    { schemes: ['http', 'https'] },
];
//then wrap this up into an object that we can pass to the listener
const filteredNavigationObject = { url: filteredNavigationURLs };

const onBeforeNavigateObservable = fromEventPattern(
    (handler) => chrome.webNavigation.onBeforeNavigate.addListener(handler, filteredNavigationObject),
    (handler) => chrome.webNavigation.onBeforeNavigate.removeListener(handler),
    // returns { tabId: <integer>, url: <string>, frameId <integer>, parentFrameId: <integer>, timeStamp: <double> }
    // we add the Identifier
    (info) => ({ ...info, eventType: 'onBeforeNavigate' })
);

const onCommittedObservable = fromEventPattern(
    (handler) => chrome.webNavigation.onCommitted.addListener(handler, filteredNavigationObject),
    (handler) => chrome.webNavigation.onCommitted.removeListener(handler),
    // returns { tabId: <integer>, url: <string>, processId: <integer>, frameId <integer>, parentFrameId: <integer>, timeStamp: <double> }
    // we add the Identifier
    (info) => ({ ...info, eventType: 'onCommitted' })
);

const onDomContentLoadedObservable = fromEventPattern(
    (handler) => chrome.webNavigation.onDOMContentLoaded.addListener(handler, filteredNavigationObject),
    (handler) => chrome.webNavigation.onDOMContentLoaded.removeListener(handler),
    // returns { tabId: <integer>, url: <string>, frameId <integer>, parentFrameId: <integer>, timeStamp: <double> }
    // we add the Identifier
    (info) => ({ ...info, eventType: 'onDOMContentLoaded' })
);

const onNavigationCompleteObservable = fromEventPattern(
    (handler) => chrome.webNavigation.onCompleted.addListener(handler, filteredNavigationObject),
    (handler) => chrome.webNavigation.onCompleted.removeListener(handler),
    // returns { tabId: <integer>, url: <string>, frameId <integer>, parentFrameId: <integer>, timeStamp: <double> }
    // we add the Identifier
    (info) => ({ ...info, eventType: 'onCompleted' })
);

//SOURCE OBSERVABLE - DEBUGGER EVENTS

//THIS TURNS ALL DEBUGGER EVENTS INTO AN OBSERVABLE

const debuggerEventObservable = fromEventPattern(
    //we add the handler that takes the callback object from the debugger event and passes it to subscribers
    (handler) => {
        console.log(`Test Suite: SUBSCRIBED to SHARED Debugger Network Event Observer.`);
        chrome.debugger.onEvent.addListener(handler);
    },
    //we add the handler that removed the handler from the debugger even and reports
    (handler) => {
        console.log(`Test Suite: UNSUBSCRIBED from SHARED Debugger Network Event Observer.`);
        chrome.debugger.onEvent.removeListener(handler);
    },
    (_, message, obj) => {
        //then we pass the object to our subscribers
        return { message: message, infoObject: obj };
    }
    //and this is shared amongst many subscribers
).pipe(share());

//SOURCE OBSERVABLE - MESSAGE EVENTS

//this handles the interactive and complete readystate change messages that come from the page and pass them into an observer

const messagingObservable = fromEventPattern(
    (handler) => {
        const wrapper = (request, sender, sendResponse) => {
            //note the async is set to true by default to allow for slow JSON responses in the createDataResultStream combineLatest
            const options = { async: false, request, sender, sendResponse };
            handler(options);
            return options.async;
        };
        console.log(`Test Suite: SUBSCRIBED to SHARED Sync Messaging Observer Instance`);
        chrome.runtime.onMessage.addListener(wrapper);
        return wrapper;
    },
    (handler, wrapper) => {
        console.log(`Test Suite: UNSUBSCRIBED from SHARED Sync Messaging Observer Instance`);
        chrome.runtime.onMessage.removeListener(wrapper);
    }
    //and this is shared amongst many subscribers
).pipe(share());

/*
    The raw data observables need to be filtered and otherwise mutated before being combined    

    2. FILTERED RAW DATA OBSERVABLES

*/

//FILTERED OBSERVABLES = ON COMPLETE EVENT

//WE USE THE ONCOMPLETE EVENT TO GET DATA ABOUT IFRAME DATA WEIGHT AND RESOURCE TYPE

const iframeDataUsageObservable = onWebRequestCompleteObservable.pipe(
    //then we only want data from iframes or from resources that belong to iframes
    filter((onCompleteObject) => onCompleteObject.type == 'sub_frame' || onCompleteObject.frameId > 0),
    //then we only want objects that have response headers and the response headers include content length
    filter(
        (onCompleteObject) =>
            onCompleteObject.responseHeaders &&
            onCompleteObject.responseHeaders.filter((val) => val.name.toLowerCase() === 'content-length').length > 0
    ),
    //then we want to map the oncomplete object to an object that we can work alongside the other data objects
    map((onCompleteObject) => {
        //first we need to work the content length from the headers
        const contentLength = onCompleteObject.responseHeaders
            .filter((val) => val.name.toLowerCase() === 'content-length')
            .map((hdr) => (hdr.value ? parseFloat(hdr.value) : 0))[0];
        //then we need to create an object with the same params as the debugger network event object
        return {
            //we need the request ID from the oncomplete object
            requestId: onCompleteObject.requestId,
            //we need the content length from the headers
            encodedDataLength: contentLength,
        };
    })
);

const iframeResourceTypeObservable = onWebRequestCompleteObservable.pipe(
    //then we only want data from iframes or from resources that belong to iframes
    filter((onCompleteObject) => onCompleteObject.type == 'sub_frame' || onCompleteObject.frameId > 0),
    //then we want to map the oncomplete object to an object that we can work alongside the other data objects
    map((onCompleteObject) => {
        //then we need to create an object with the same params as the debugger network event object
        return {
            //we need the request ID from the oncomplete object
            requestId: onCompleteObject.requestId,
            //we need the content length from the headers
            resourceType: onCompleteObject.type,
            //and let's take the url as well for this one
            url: onCompleteObject.url || 'absent',
        };
    })
);

//FILTERED OBSERVABLES = NAVIGATION EVENTS

//make a navigation observable that combines all the source observables into one and then filters for only certain types of event
const navigationEventObservable = merge(
    onBeforeNavigateObservable,
    onCommittedObservable,
    onDomContentLoadedObservable,
    onNavigationCompleteObservable
).pipe(
    //filter for main frame events
    filter((navObject) => navObject.frameId == 0),
    //then filter for requests that match the active job tab, commented out for testing
    filter((navObject) => (activeJob ? navObject.tabId === activeJob.tabId : false)),
    //and this is shared amongst many subscribers
    share()
);

const streamlinedOnBeforeRequest = navigationEventObservable.pipe(
    //then we only want certain events
    filter((navObject) => navObject.eventType == 'onBeforeNavigate'),
    //get only the properties we care about - url and timestamp, while adding a marker
    map((navObject) => {
        var streamlinedObject = Object.assign(
            {},
            {
                command: navObject.eventType,
                url: navObject.url,
                timestamp: Date.now(),
            }
        );
        return streamlinedObject;
    }),
    //log the arrival of the onBeforeRequest event
    tap((navObject) => console.log(`Test Suite: ${navObject.command} Observer Emits: ${JSON.stringify(navObject)}`)),
    //then report to the console
    tap((navObject) =>
        sendConsoleMessage(`Starting to load page at <a target="_blank" href="${navObject.url}">${navObject.url}</a>`)
    )
);

const interactiveNavigationObservable = navigationEventObservable.pipe(
    //filter it for the DomContentLoaded events only
    filter((navObject) => navObject.eventType == 'onDOMContentLoaded'),
    //add a timestamp as it passes by
    map((navObject) => {
        var streamlinedObject = Object.assign(
            {},
            {
                command: navObject.eventType,
                url: navObject.url,
                timestamp: Date.now(),
                signal: 'web navigation',
            }
        );
        return streamlinedObject;
    }),
    //log the arrival of the DomContentLoaded event
    tap((navObject) =>
        console.log(`Test Suite: Navigation ${navObject.command} Observer Emits: ${JSON.stringify(navObject)}`)
    )
);

const completeNavigationObservable = navigationEventObservable.pipe(
    //filter it for the interactive messages only
    filter((navObject) => navObject.eventType == 'onCompleted'),
    //add a timestamp as it passes by
    map((navObject) => {
        var streamlinedObject = Object.assign(
            {},
            {
                command: navObject.eventType,
                url: navObject.url,
                timestamp: Date.now(),
                signal: 'web navigation',
            }
        );
        return streamlinedObject;
    }),
    //log the arrival of the window load event
    tap((navObject) =>
        console.log(`Test Suite: Navigation ${navObject.command} Observer Emits: ${JSON.stringify(navObject)}`)
    )
);

//FILTERED OBSERVABLES - MESSAGE EVENTS

const interactiveMessagingObservable = messagingObservable.pipe(
    //filter it for the DomContentLoaded events only
    filter((msgObject) => msgObject.request.command == 'onDOMContentLoaded'),
    //then map it to the request only, which is an object containing only the sent fields
    map((msgObject) => msgObject.request),
    //log the arrival of the DomContentLoaded event
    tap((msgObject) =>
        console.log(`Test Suite: Messaging ${msgObject.command} Observer Emits: ${JSON.stringify(msgObject)}`)
    )
);

const completeMessagingObservable = messagingObservable.pipe(
    //filter it for the DomContentLoaded events only
    filter((msgObject) => msgObject.request.command == 'onCompleted'),
    //then map it to the request only, which is an object containing only the sent fields
    map((msgObject) => msgObject.request),
    //log the arrival of the window load event
    tap((msgObject) =>
        console.log(`Test Suite: Messaging ${msgObject.command} Observer Emits: ${JSON.stringify(msgObject)}`)
    )
);

//FILTERED OBSERVABLES = DEBUGGER EVENTS

//THEN WE ONLY WANT CERTAIN NETWORK EVENTS
const dataUsageObservable = debuggerEventObservable.pipe(
    //to get at the data we use loading finished event
    filter((networkObject) => networkObject.message == 'Network.loadingFinished'),
    //then down stream we only need the following params
    map((networkObject) => {
        return {
            //need the request ID to match iframe observable
            requestId: networkObject.infoObject.requestId,
            //need encoded data length to match iframe observable
            encodedDataLength: networkObject.infoObject.encodedDataLength,
        };
    })
);

const resourceTypeObservable = debuggerEventObservable.pipe(
    //to get at the data we use loading finished event
    filter((networkObject) => networkObject.message == 'Network.responseReceived'),
    //then down stream we only need the following params
    map((networkObject) => {
        return {
            //need the request ID to match iframe observable
            requestId: networkObject.infoObject.requestId,
            //need the type as well
            resourceType: networkObject.infoObject.type.toLowerCase(),
            //let's take the url as well
            url: networkObject.infoObject.response.url || 'absent',
        };
    })
);

const resourceTimingObservable = debuggerEventObservable.pipe(
    //to get at the data we use loading finished event
    filter((networkObject) => networkObject.message == 'Network.responseReceived'),
    //then down stream we only need the following params
    map((networkObject) => {
        //we need to return a timing object with the url
        return {
            url: networkObject.infoObject.response.url,
            timing: networkObject.infoObject.response.timing,
        };
    })
);

/*
    The filtered raw data observables need to be combined in order to produce our raw data object    

    3. COMBINED, FILTERED RAW DATA OBSERVABLES

*/

//COMBINE THE TWO EVENT LISTENERS FOR FAILOVER

const interactiveObservable = merge(interactiveNavigationObservable, interactiveMessagingObservable).pipe(
    //we only take one
    take(1),
    //and we report which one
    tap((obj) =>
        sendConsoleMessage(
            `DOM loaded signal from ${obj.signal} at <a target="_blank" href="${obj.url}">${obj.url}</a>`
        )
    )
);

const completeObservable = merge(completeNavigationObservable, completeMessagingObservable).pipe(
    //we only take one
    take(1),
    //and we report which one
    tap((obj) =>
        sendConsoleMessage(
            `Page complete signal from ${obj.signal} at <a target="_blank" href="${obj.url}">${obj.url}</a>`
        )
    )
);

//COMBINE THE TWO DATA USAGE OBSERVABLES FOR A COMPLETE PICTURE

const combinedDataUsageObservable = merge(dataUsageObservable, iframeDataUsageObservable);

//COMBINE THE TWO RESOURCE TYPE OBSERVABLES FOR A COMPLETE PICTURE

const combinedResourceTypeObservable = merge(resourceTypeObservable, iframeResourceTypeObservable);

//then we put them all together, starting with the onBeforeRequest - this should emit when the complete event occurs

const masterDataObservable = streamlinedOnBeforeRequest.pipe(
    //once we have the initial emission of the onBeforeRequest, then we need to turn that into an observable that collects raw data into our object
    switchMap(
        (requestObj) =>
            zip(
                //make sure we know when the DOM content loaded event happens
                interactiveObservable.pipe(
                    filter(
                        (obj) =>
                            //this can be a source of bugs when http site in our text file changes to https as the event will never fire
                            new URL(obj.url).origin === new URL(requestObj.url).origin &&
                            //we only want events that happen after the start signalled by the onBeforeRequest
                            obj.timestamp > requestObj.timestamp
                    )
                ),
                //make sure we know when the complete event happens
                completeObservable.pipe(
                    filter(
                        (obj) =>
                            new URL(obj.url).origin === new URL(requestObj.url).origin &&
                            //we only want events that happen after the start signalled by the onBeforeRequest
                            obj.timestamp > requestObj.timestamp
                    ),
                    //add some seconds to allow post-window.load advertising and lazy loaded images to load or be blocked - this does not affect the timestamps, just test running
                    delay(5000)
                ),
                //make sure we know when errors happen - when resources are blocked, or otherwise fail to load
                onWebRequestErrorObservable.pipe(
                    //make sure we only take certain error fields
                    map((error) => ({ type: error.type, url: error.url, error: error.error })),
                    //for the time being we are just collecting the error objects into an array,
                    scan((errorArray, currentError) => {
                        //add the error to the error array
                        errorArray.push(currentError);
                        //then return the array for next scan
                        return errorArray;
                        //seed with the initial array
                    }, [])
                ),
                //this combines byte load output from debugger network events and onWebRequestComplete iframes, returns a lookup object with request IDs
                combinedDataUsageObservable.pipe(
                    scan((lookupObject, value) => {
                        //set the key of the lookup object as equal to the request id - these come in different formats according to whether from OnComplete or debugger network event
                        lookupObject[value.requestId] = value.encodedDataLength;
                        //after saving the encoded data length return the lookup object for the next item to be scanned into it
                        return lookupObject;
                        //seed with the initial object
                    }, {})
                ),
                //this combines resource type from debugger network events and onWebRequestComplete iframes, returns a lookup object with request IDs
                combinedResourceTypeObservable.pipe(
                    scan((lookupObject, value) => {
                        //the key is the request ID as well so we can link data sizes with resource categories
                        lookupObject[value.requestId] = value.resourceType;
                        //return the object for the next scan
                        return lookupObject;
                        //seed with the initial object
                    }, {})
                ),
                //get the resource timing information, if any, for inspection
                resourceTimingObservable.pipe(
                    scan((headersTimingArray, value) => {
                        //if the timing object has a receiveHeadersEnd property, then lets save that to the arrau
                        value.timing ? headersTimingArray.push(value.timing.receiveHeadersEnd) : null;
                        //then return the array for next scan
                        return headersTimingArray;
                        //seed with the initial array
                    }, [])
                )
            ),
        (
            //we take the initial onBefore request in the result selector function
            onBeforeRequest,
            //we deconstruct the zip array with variable names so we can work the data
            [onInteractive, onComplete, onErrorArray, dataUsageLookupObject, typeLookupObject, headersTimingArray]
        ) => {
            console.log(
                `%cTest Suite: TIMING OBJECT EMITTED for ${onBeforeRequest.url}`,
                'color: darkred; font-size: normal;'
            );
            sendConsoleMessage(
                `Collecting all page stats for <a target="_blank" href="${onBeforeRequest.url}">${onBeforeRequest.url}</a>`
            );
            //so we set up our new raw data object with the data that we have initially
            const data = new RawData({
                //url for tracking
                url: onBeforeRequest.url,
                //basic time stamps, all from navigation so we can compare
                onBeforeRequestTime: onBeforeRequest.timestamp,
                onInteractiveTime: onInteractive.timestamp,
                onCompleteTime: onComplete.timestamp,
                //global indicators for whole page weight, requests and header latency
                dataUsageArray: Object.values(dataUsageLookupObject),
                requestCount: Object.values(dataUsageLookupObject).length,
                headerTimingsArray: headersTimingArray,
                //keeping track of errors - filter out the empty object value we start with to ensure emission of zip
                errorArray: onErrorArray.filter((error) => error.type !== 'dummyError'),
                errorCount: onErrorArray.filter((error) => error.type !== 'dummyError').length,
            });
            //then we need to do some work to divide everything in the data usage lookup object according to resource type
            //loop through and allocate to arrays
            for (let [requestId, encodedDataLength] of Object.entries(dataUsageLookupObject)) {
                switch (true) {
                    case typeLookupObject[requestId] == 'image':
                        data.imageLoadArray.push(encodedDataLength);
                        data.imageCount = data.imageLoadArray.length;
                        break;
                    case typeLookupObject[requestId] == 'media':
                        data.mediaLoadArray.push(encodedDataLength);
                        data.mediaCount = data.mediaLoadArray.length;
                        break;
                    case typeLookupObject[requestId] == 'font':
                        data.fontLoadArray.push(encodedDataLength);
                        data.fontCount = data.fontLoadArray.length;
                        break;
                    case typeLookupObject[requestId] == 'stylesheet':
                        data.styleLoadArray.push(encodedDataLength);
                        data.styleCount = data.styleLoadArray.length;
                        break;
                    case typeLookupObject[requestId] == 'script':
                        data.scriptLoadArray.push(encodedDataLength);
                        data.scriptCount = data.scriptLoadArray.length;
                        break;
                    case typeLookupObject[requestId] == 'document' || typeLookupObject[requestId] == 'sub_frame':
                        data.htmlLoadArray.push(encodedDataLength);
                        data.htmlCount = data.htmlLoadArray.length;
                        break;
                    case typeLookupObject[requestId] == 'xhr':
                        data.xhrLoadArray.push(encodedDataLength);
                        data.xhrCount = data.xhrLoadArray.length;
                        break;
                    case typeLookupObject[requestId] == 'fetch':
                        data.fetchLoadArray.push(encodedDataLength);
                        data.fetchCount = data.fetchLoadArray.length;
                        break;
                    case typeLookupObject[requestId] == 'websocket':
                        data.websocketLoadArray.push(encodedDataLength);
                        data.websocketCount = data.websocketLoadArray.length;
                }
            }
            //once the loop has finished we're good to return the data
            return data;
        }
    )
);
