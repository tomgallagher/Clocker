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
