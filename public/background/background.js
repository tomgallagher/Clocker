console.log('running in background');
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
        default:
            console.log('Unrecognised Message Command');
    }
});
