console.log("running in background");
//enable the browser action click
chrome.browserAction.onClicked.addListener(function() {
    chrome.tabs.create({url: 'index.html'});
});