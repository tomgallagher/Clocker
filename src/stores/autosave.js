import { autorun, toJS } from 'mobx';

export const autosave = (storeItem, save, delay) => {
    //no point in saving on the first run
    let firstRun = true;
    // This code will run every time any observable property on the store is updated.
    // As a rule of thumb: use autorun if you have a function that should run automatically but that doesn't result in a new value.
    autorun(
        () => {
            //firs we need to create the JS, rather than the proxy version which is observed
            const readyToSave = toJS(storeItem);
            //get the data as JSON, using the toJS function which converts an (observable) object to a javascript structure
            const json = JSON.stringify(readyToSave);
            //then if it's not the first run and we are not testing, report the data saving and use the passed function to save
            if (!firstRun) {
                console.log(`AutoSaving ${storeItem.constructor.name} Data`);
                //use the passed save function to return the stringified json and the ready to save version of the store item
                save(json, readyToSave);
            }
            //remember that we have made a save
            firstRun = false;
            //add the delay which will always save the last emission, like debounce
        },
        { delay: delay }
    );
};
