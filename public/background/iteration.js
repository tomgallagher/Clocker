//class to collect the raw data from the raw data class and then collect into an iteration object
//all iterations are then processed by array operations into the page object
class Iteration {
    constructor(options) {
        var defaults = {
            url: 'N/A',
            tabId: 0,
            startTime: Date.now(),
            //timing stats
            onCommittedTime: 0,
            onDOMLoadedTime: 0,
            onCompleteTime: 0,
            //major resource stats
            dataUsageTotal: 0,
            headerTimingsAverage: 0,
            requestTotal: 0,
            imageLoadTotal: 0,
            imageRequestCount: 0,
            mediaLoadTotal: 0,
            mediaRequestCount: 0,
            fontLoadTotal: 0,
            fontRequestCount: 0,
            styleLoadTotal: 0,
            styleRequestCount: 0,
            scriptLoadTotal: 0,
            scriptRequestCount: 0,
            //minor resource stats
            htmlLoadTotal: 0,
            htmlRequestCount: 0,
            xhrLoadTotal: 0,
            xhrRequestCount: 0,
            fetchLoadTotal: 0,
            fetchRequestCount: 0,
            websocketLoadTotal: 0,
            websocketRequestCount: 0,
            //note the addition of the error arrays
            errorArray: [],
            errorCount: 0,
        };

        // then we can take the name, id, createdAt and updatedAt values from the user interface job
        let opts = Object.assign({}, defaults, options);

        // assign options to instance data (using only property names contained in defaults object to avoid copying properties we don't want)
        Object.keys(defaults).forEach((prop) => {
            this[prop] = opts[prop];
        });
    }
}
