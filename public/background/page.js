//this gets sent to the user interface via message payload so it has to be in the format the user interface is expecting

class Page {
    constructor(options) {
        var defaults = {
            url: `N/A`,
            iterationsArray: [],
            //then we need to carry some data forward from the job
            tabId: 0,
            pageIterations: 1,
            withCache: false,
            withServiceWorker: true,
            //then the stats
            dclAverage: 0,
            completeAverage: 0,
            dataUsageAverage: 0,
            headerTimingsAverage: 0,
            imageLoadAverage: 0,
            imageRequestsAverage: 0,
            mediaLoadAverage: 0,
            mediaRequestsAverage: 0,
            fontLoadAverage: 0,
            fontRequestsAverage: 0,
            scriptLoadAverage: 0,
            scriptRequestsAverage: 0,
            cssLoadAverage: 0,
            cssRequestsAverage: 0,
            screenshot: 'N/A',
        };

        // then we can take the name, id, createdAt and updatedAt values from the user interface job
        let opts = Object.assign({}, defaults, options);

        // assign options to instance data (using only property names contained in defaults object to avoid copying properties we don't want)
        Object.keys(defaults).forEach((prop) => {
            this[prop] = opts[prop];
        });
    }

    //then we need to have a function that updates the page states from the iterations array
    updatePageStats = () => {};
}
