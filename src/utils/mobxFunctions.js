import { fromResource } from 'mobx-utils';
import { filter } from 'rxjs/operators';
import { ChromeMessageObservable } from './../utils/chromeFunctions';

//this links the rxjs chrome message port to any mobx store that calls it
export const createMobxMessageListener = ({
    //the command filter allows us to filter the messages received by the mobx store
    commandFilter,
    //the request propert allows us to return only the request payload, or whatever property is called
    requestProperty,
    //then we have an initial state. which should be set to an empty string or object depending on what we want to receive
    initialState,
}) => {
    //define the current subscription outside the fromResource scope so it can be accessed by the subscribe and unsubscribe functions
    let currentSubscription;
    //return an observable whose current state can be inspected using .current(),
    return fromResource(
        (sink) => {
            console.log('Mobx Functions: SUBSCRIBED to message observer');
            // sink the current state - whatever is passed to sink will be returned by current()
            sink(initialState);
            //set subscription resource source to our chrome messaging observable
            currentSubscription = ChromeMessageObservable.pipe(
                //log to console for debugging
                //tap((val) => console.log(val)),
                //filter the messages according to the command filter
                filter((messageObj) => messageObj.request.command === commandFilter)
            ).subscribe((messageObj) => {
                // subscribe to the messaging observer, invoke the sink callback whenever new data arrives, using the request property value
                sink(messageObj.request[requestProperty]);
            });
        },
        () => {
            console.log('Mobx Functions: UNSUBSCRIBED from message observer');
            // the user observable is not in use at the moment, unsubscribe (for now)
            currentSubscription.unsubscribe();
        }
    );
};
