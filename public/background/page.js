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
            screenshotWidth: 600,
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
            minorResources: {
                htmlLoadAverage: 0,
                htmlRequestsAverage: 0,
                xhrLoadAverage: 0,
                xhrRequestsAverage: 0,
                fetchLoadAverage: 0,
                fetchRequestsAverage: 0,
                websocketLoadAverage: 0,
                websocketRequestsAverage: 0,
                metricsDocumentsAverage: 0,
                metricsResourcesAverage: 0,
                metricsFramesAverage: 0,
                metricsAdvertisingFramesAverage: 0,
                metricsUsedHeapAverage: 0,
                metricsTotalHeapAverage: 0,
                mappedMetricsArray: [],
                errorArray: 0,
                errorCount: 0,
            },
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
    updatePageStats = () => {
        if (this.iterationsArray.length) {
            this.dclAverage = this.iterationsArray
                .map((iteration) => iteration.onDOMLoadedTime)
                .reduce(RoundedAverage, 0);
            this.completeAverage = this.iterationsArray
                .map((iteration) => iteration.onCompleteTime)
                .reduce(RoundedAverage, 0);
            this.dataUsageAverage = this.iterationsArray
                .map((iteration) => iteration.dataUsageTotal)
                .reduce(RoundedAverage, 0);
            this.headerTimingsAverage = this.iterationsArray
                .map((iteration) => iteration.headerTimingsAverage)
                .reduce(RoundedAverage, 0);
            this.imageLoadAverage = this.iterationsArray
                .map((iteration) => iteration.imageLoadTotal)
                .reduce(RoundedAverage, 0);
            this.imageRequestsAverage = this.iterationsArray
                .map((iteration) => iteration.imageRequestCount)
                .reduce(RoundedAverage, 0);
            this.mediaLoadAverage = this.iterationsArray
                .map((iteration) => iteration.mediaLoadTotal)
                .reduce(RoundedAverage, 0);
            this.mediaRequestsAverage = this.iterationsArray
                .map((iteration) => iteration.mediaRequestCount)
                .reduce(RoundedAverage, 0);
            this.fontLoadAverage = this.iterationsArray
                .map((iteration) => iteration.fontLoadTotal)
                .reduce(RoundedAverage, 0);
            this.fontRequestsAverage = this.iterationsArray
                .map((iteration) => iteration.fontRequestCount)
                .reduce(RoundedAverage, 0);
            this.scriptLoadAverage = this.iterationsArray
                .map((iteration) => iteration.scriptLoadTotal)
                .reduce(RoundedAverage, 0);
            this.scriptRequestsAverage = this.iterationsArray
                .map((iteration) => iteration.scriptRequestCount)
                .reduce(RoundedAverage, 0);
            this.cssLoadAverage = this.iterationsArray
                .map((iteration) => iteration.styleLoadTotal)
                .reduce(RoundedAverage, 0);
            this.cssRequestsAverage = this.iterationsArray
                .map((iteration) => iteration.styleRequestCount)
                .reduce(RoundedAverage, 0);
            //then we calculate the minor resources
            this.minorResources.htmlLoadAverage = this.iterationsArray
                .map((iteration) => iteration.htmlLoadTotal)
                .reduce(RoundedAverage, 0);
            this.minorResources.htmlRequestsAverage = this.iterationsArray
                .map((iteration) => iteration.htmlRequestCount)
                .reduce(RoundedAverage, 0);
            this.minorResources.xhrLoadAverage = this.iterationsArray
                .map((iteration) => iteration.xhrLoadTotal)
                .reduce(RoundedAverage, 0);
            this.minorResources.xhrRequestsAverage = this.iterationsArray
                .map((iteration) => iteration.xhrRequestCount)
                .reduce(RoundedAverage, 0);
            this.minorResources.fetchLoadAverage = this.iterationsArray
                .map((iteration) => iteration.fetchLoadTotal)
                .reduce(RoundedAverage, 0);
            this.minorResources.fetchRequestsAverage = this.iterationsArray
                .map((iteration) => iteration.fetchRequestCount)
                .reduce(RoundedAverage, 0);
            this.minorResources.websocketLoadAverage = this.iterationsArray
                .map((iteration) => iteration.websocketLoadTotal)
                .reduce(RoundedAverage, 0);
            this.minorResources.websocketRequestsAverage = this.iterationsArray
                .map((iteration) => iteration.websocketRequestCount)
                .reduce(RoundedAverage, 0);

            //then we calculate the minor resources metrics
            this.minorResources.metricsDocumentsAverage = this.iterationsArray
                .map((iteration) => iteration.metrics.get('Documents'))
                .reduce(RoundedAverage, 0);
            this.minorResources.metricsResourcesAverage = this.iterationsArray
                .map((iteration) => iteration.metrics.get('Resources'))
                .reduce(RoundedAverage, 0);
            this.minorResources.metricsFramesAverage = this.iterationsArray
                .map((iteration) => iteration.metrics.get('Frames'))
                .reduce(RoundedAverage, 0);
            this.minorResources.metricsAdvertisingFramesAverage = this.iterationsArray
                .map((iteration) => iteration.metrics.get('AdSubframes'))
                .reduce(RoundedAverage, 0);
            this.minorResources.metricsUsedHeapAverage = this.iterationsArray
                .map((iteration) => iteration.metrics.get('JSHeapUsedSize'))
                .reduce(RoundedAverage, 0);
            this.minorResources.metricsTotalHeapAverage = this.iterationsArray
                .map((iteration) => iteration.metrics.get('JSHeapTotalSize'))
                .reduce(RoundedAverage, 0);

            //then we want to collect the metrics into the metrics array
            this.minorResources.mappedMetricsArray = this.iterationsArray.map((iteration) => iteration.metrics);

            //for errors, or blocked items, we want an average of the resources blocked
            this.minorResources.errorCount = this.iterationsArray
                .map((iteration) => iteration.errorCount)
                .reduce(RoundedAverage, 0);
            //but we want to keep a record of what was blocked on each iteration, so we're going to need to push index into an object that holds the errors
            this.minorResources.errorArray = this.iterationsArray.map((iteration, index) => ({
                [index]: iteration.errorArray,
            }));
        }
    };
}
