//to send command messages to the background script
const SendRuntimeMessage = (command) => {
    chrome.runtime.sendMessage({
        command: command,
        url: location.href,
        timestamp: Date.now(),
        signal: 'page listener',
    });
};
//then the function for the readystate change event listener
const pageSniffer = (evt) => {
    //then we send the message from the ready state event
    switch (evt.target.readyState) {
        case 'loading':
            SendRuntimeMessage('onLoading');
            break;
        case 'interactive':
            SendRuntimeMessage('onDOMContentLoaded');
            break;
        case 'complete':
            SendRuntimeMessage('onCompleted');
    }
};
//add the listener
document.addEventListener('readystatechange', pageSniffer, false);
//here we add a message listener to pass control of the service worker kill operations to the testing suite
chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
    if (navigator.serviceWorker && request.command == 'STOP_SERVICE_WORKER') {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
            //returns installed service workers
            if (registrations.length > 0) {
                //get the scopes of the registrations
                const scopes = registrations.map((item) => item.scope);
                //loop through each of the registrations
                for (const [index, registration] of registrations.entries()) {
                    //we then unregister the service worker via a promise interface
                    registration.unregister();
                    //if we are at the last item in the array then send the response
                    if (index === registrations.length - 1) {
                        scopes.length > 1
                            ? sendResponse({
                                  message: `Service workers with scopes <a>${scopes.join(',')}</a> disabled`,
                              })
                            : sendResponse({ message: `Service worker with scope <a>${scopes[0]}</a> disabled` });
                    }
                }
            } else {
                //here we deal with the situation where we have no registrations at all
                sendResponse({
                    message: `No service workers registered for <a target="_blank" href="${location.href}">${location.href}</a>`,
                });
            }
        });
        return true;
    } else {
        //here we deal with the situation where we have no registrations at all
        sendResponse({
            message: `No service workers registered for <a target="_blank" href="${location.href}">${location.href}</a>`,
        });
    }
});
