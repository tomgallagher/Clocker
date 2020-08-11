/* global chrome */
import { fromEventPattern } from 'rxjs';
import { share } from 'rxjs/operators';

export const SendChromeMessage = (messageObject) => {
    chrome.runtime.sendMessage(messageObject);
};
export const ChromeMessageObservable = fromEventPattern(
    (handler) => {
        const wrapper = (request, sender, sendResponse) => {
            //note the async is set to true by default to allow for slow JSON responses in the createDataResultStream combineLatest
            const options = { async: false, request, sender, sendResponse };
            handler(options);
            return options.async;
        };
        console.log(
            `Chrome Functions: SUBSCRIBED to SHARED Sync Messaging Observer Instance`
        );
        chrome.runtime.onMessage.addListener(wrapper);
        return wrapper;
    },
    (handler, wrapper) => {
        console.log(
            `Chrome Functions: UNSUBSCRIBED from SHARED Sync Messaging Observer Instance`
        );
        chrome.runtime.onMessage.removeListener(wrapper);
    }
).pipe(share());
