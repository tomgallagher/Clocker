//class to collect the raw data from the main data collection observable, using debugger event listeners, into arrays
//this is then processed by array operations into the iteration object
class RawData {
    constructor(options) {
        var defaults = {
            url: 'N/A',
            onBeforeRequestTime: 0,
            onInteractiveTime: 0,
            onCompleteTime: 0,
            dataUsageArray: [],
            requestCount: 0,
            headerTimingsArray: [],
            imageLoadArray: [],
            imageCount: 0,
            mediaLoadArray: [],
            mediaCount: 0,
            fontLoadArray: [],
            fontCount: 0,
            styleLoadArray: [],
            styleCount: 0,
            scriptLoadArray: [],
            scriptCount: 0,
            htmlLoadArray: [],
            htmlCount: 0,
            xhrLoadArray: [],
            xhrCount: 0,
            fetchLoadArray: [],
            fetchCount: 0,
            websocketLoadArray: [],
            websocketCount: 0,
            errorArray: [],
            errorCount: 0,
            metrics: null,
        };

        // then we can take the name, id, createdAt and updatedAt values from the user interface job
        let opts = Object.assign({}, defaults, options);

        // assign options to instance data (using only property names contained in defaults object to avoid copying properties we don't want)
        Object.keys(defaults).forEach((prop) => {
            this[prop] = opts[prop];
        });
    }
}
