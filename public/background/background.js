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
        case 'startTest':
            console.log(request.payload);
            break;
        default:
            console.log('Unrecognised Message Command');
    }
});

//TEST START FUNCTION

//DEBUGGER COMMANDS

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
