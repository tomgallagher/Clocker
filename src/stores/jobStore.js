import { observable, autorun, reaction, decorate, computed } from 'mobx';
import { createMobxMessageListener } from './../utils/mobxFunctions';
import { v4 as uuidv4 } from 'uuid';
import { RoundedAverage, RoundedAverageMegaBytes, TotalMegaBytes } from './../utils/arrayFunctions';

import ColorPalette from './../components/charts/colorPalette.json';

//for testing purposes
//import { makeData } from './../__test__/makeData';

export class JobStore {
    constructor() {
        //we have the basic attributes of the job store
        this.jobs = [];
        this.activeIndex = 0;
        this.placeholderJob = new Job({});
        this.isLoading = false;
        this.isLoadError = false;
        //more complex observable to link the rxjs messaging port from chrome into mobx store
        //pass command filter, request property to return and default value
        this.console = createMobxMessageListener({
            commandFilter: 'incomingConsoleMessage',
            requestProperty: 'message',
            initialState: null,
        });
        this.pageEntries = createMobxMessageListener({
            commandFilter: 'incomingPageData',
            requestProperty: 'payload',
            initialState: null,
        });

        //then we use the more complex observables in autorun
        autorun(() => {
            //no need to activate on the first default value
            if (this.console.current()) {
                //then see if we have an active job or placeholder
                const activeJob = this.jobs.length ? this.jobs[this.activeIndex] : this.placeholderJob;
                // push the new message into the active job console messages array every time we receive the message
                activeJob.consoleMessages.push(this.console.current());
            }
        });

        autorun(() => {
            //no need to activate on null value
            if (this.pageEntries.current()) {
                //then see if we have an active job or placeholder
                const activeJob = this.jobs.length ? this.jobs[this.activeIndex] : this.placeholderJob;
                //make sure we have a page in the UI format, where we only care about the stats, not the iterations array, settings, etc. used by background.js
                const page = new Page(this.pageEntries.current());
                // push the new data into the active job pages array every time we receive the message
                activeJob.pages.push(page);
            }
        });

        reaction(
            () => this.jobs.length,
            () => {
                console.log('reaction: new job, updating activeIndex');
                this.activeIndex = this.jobs.length - 1;
            }
        );
    }

    createJob = (job) => {
        //on button click in banner.js front page we need to create a new job and push it into the jobs array
        const newJob = new Job(job);
        this.jobs.push(newJob);

        //it also needs to be saved into db at this point
    };

    resetListeners = () => {
        this.console.dispose();
        this.pageEntries.dispose();
        this.console = createMobxMessageListener({
            commandFilter: 'incomingConsoleMessage',
            requestProperty: 'message',
            initialState: null,
        });
        this.pageEntries = createMobxMessageListener({
            commandFilter: 'incomingPageData',
            requestProperty: 'payload',
            initialState: null,
        });
    };
}

//then add the decorations to make the relevant features of the list observable
decorate(JobStore, {
    jobs: observable,
    activeIndex: observable,
    isLoading: observable,
    isLoadError: observable,
});

export class Job {
    constructor(options) {
        //always use the default settings
        var defaults = {
            name: 'N/A',
            id: uuidv4(),
            createdAt: Date.now(),
            updatedtAt: Date.now(),
            settings: {},
            consoleMessages: [],
            pages: [],
            //the job must contain reporting stats on its contained pages, the AVERAGE for the important indicators across all ITERATIONS
            dclAverage: 0,
            completeAverage: 0,
            dataUsageAverage: 0,
            headerTimingsAverage: 0,
            imageRequestsAverage: 0,
            fontRequestsAverage: 0,
            mediaRequestsAverage: 0,
            cssRequestsAverage: 0,
            scriptRequestsAverage: 0,
            //then we need to see totals for comparative purposes
            imageLoadTotal: 0,
            mediaLoadTotal: 0,
            fontLoadTotal: 0,
            cssLoadTotal: 0,
            scriptLoadTotal: 0,
            minorResources: {
                htmlLoadAverage: 0,
                htmlRequestsAverage: 0,
                xhrLoadAverage: 0,
                xhrRequestsAverage: 0,
                fetchLoadAverage: 0,
                fetchRequestsAverage: 0,
                websocketLoadAverage: 0,
                websocketRequestsAverage: 0,
                errorArray: 0,
                errorCount: 0,
            },
        };

        // create a new object with the defaults over-ridden by the options passed in
        let opts = Object.assign({}, defaults, options);

        // assign options to instance data (using only property names contained in defaults object to avoid copying properties we don't want)
        Object.keys(defaults).forEach((prop) => {
            this[prop] = opts[prop];
        });

        //then when a page gets added we recalc the averages
        reaction(
            () => this.pages.length,
            () => {
                console.log('reaction: Autogenerating Job Reporting Stats');
                //first we work out the averages
                this.dclAverage = this.pages.map((item) => item.dclAverage).reduce(RoundedAverage, 0);
                this.completeAverage = this.pages.map((item) => item.completeAverage).reduce(RoundedAverage, 0);
                this.dataUsageAverage = this.pages
                    .map((item) => item.dataUsageAverage)
                    .reduce(RoundedAverageMegaBytes, 0);
                this.headerTimingsAverage = this.pages
                    .map((item) => item.headerTimingsAverage)
                    .reduce(RoundedAverage, 0);
                this.imageRequestsAverage = this.pages
                    .map((item) => item.imageRequestsAverage)
                    .reduce(RoundedAverage, 0);
                this.fontRequestsAverage = this.pages.map((item) => item.fontRequestsAverage).reduce(RoundedAverage, 0);
                this.mediaRequestsAverage = this.pages
                    .map((item) => item.mediaRequestsAverage)
                    .reduce(RoundedAverage, 0);
                this.cssRequestsAverage = this.pages.map((item) => item.cssRequestsAverage).reduce(RoundedAverage, 0);
                this.scriptRequestsAverage = this.pages
                    .map((item) => item.scriptRequestsAverage)
                    .reduce(RoundedAverage, 0);
                //then we work out the running totals
                this.imageLoadTotal = this.pages.map((item) => item.imageLoadAverage).reduce(TotalMegaBytes, 0);
                this.mediaLoadTotal = this.pages.map((item) => item.mediaLoadAverage).reduce(TotalMegaBytes, 0);
                this.fontLoadTotal = this.pages.map((item) => item.fontLoadAverage).reduce(TotalMegaBytes, 0);
                this.cssLoadTotal = this.pages.map((item) => item.cssLoadAverage).reduce(TotalMegaBytes, 0);
                this.scriptLoadTotal = this.pages.map((item) => item.scriptLoadAverage).reduce(TotalMegaBytes, 0);
                //and update the date
                this.updatedAt = Date.now();
            }
        );

        //then for testing purposes we need to add some fake data
        //const testData = makeData(20);
        //const testPages = testData.map((page) => new Page(page));
        //this.pages = [...this.pages, ...testPages];
    }

    get pageTableData() {
        return this.pages.map((page) => {
            //we have no need for the following fields in the table data, and it causes problems in the CSV download, so we destructure to remove
            const { jobId, id, createdAt, screenshot, minorResources, ...partialPage } = page;
            //then we return the partial page
            return partialPage;
        });
    }

    get resourceLoadData() {
        return {
            datasets: [
                {
                    data: [
                        this.cssLoadTotal,
                        this.scriptLoadTotal,
                        this.fontLoadTotal,
                        this.imageLoadTotal,
                        this.mediaLoadTotal,
                    ],
                    backgroundColor: [
                        ColorPalette.deepsea,
                        ColorPalette.limestone,
                        ColorPalette.sand,
                        ColorPalette.mushroom,
                        ColorPalette.fawn,
                    ],
                    label: 'Total Resource Loads',
                },
            ],
            labels: ['Stylesheets', 'Scripts', 'Fonts', 'Images', 'Videos'],
        };
    }

    get requestData() {
        return {
            datasets: [
                {
                    data: [
                        this.cssRequestsAverage,
                        this.scriptRequestsAverage,
                        this.fontRequestsAverage,
                        this.imageRequestsAverage,
                        this.mediaRequestsAverage,
                    ],
                    backgroundColor: [
                        ColorPalette.deepsea,
                        ColorPalette.limestone,
                        ColorPalette.sand,
                        ColorPalette.mushroom,
                        ColorPalette.fawn,
                    ],
                    label: 'Average Requests',
                },
            ],
            labels: ['Stylesheets', 'Scripts', 'Fonts', 'Images', 'Videos'],
        };
    }
}

decorate(Job, {
    consoleMessages: observable,
    pages: observable,
    //the job must contain reporting stats on its contained pages, the average for the important indicators
    dclAverage: observable,
    completeAverage: observable,
    dataUsageAverage: observable,
    headerTimingsAverage: observable,
    imageRequestsAverage: observable,
    fontRequestsAverage: observable,
    mediaRequestsAverage: observable,
    cssRequestsAverage: observable,
    scriptRequestsAverage: observable,
    //then we need to see totals for comparative purposes
    imageLoadTotal: observable,
    mediaLoadTotal: observable,
    fontLoadTotal: observable,
    cssLoadTotal: observable,
    scriptLoadTotal: observable,
    //then we need to add the computed function
    pageTableData: computed,
    resourceLoadData: computed,
});

export class Page {
    constructor(options) {
        //always use the default settings, important that these remain in same order as table headers for csv download
        var defaults = {
            url: 'N/A',
            jobId: 'N/A',
            id: uuidv4(),
            createdAt: Date.now(),
            //and we can save screenshot of page
            screenshot: '',
            //we always indicate average as we may run multiple iterations
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
            //then we save the minor resources as well
            minorResources: {},
        };

        // create a new object with the defaults over-ridden by the options passed in
        let opts = Object.assign({}, defaults, options);

        // assign options to instance data (using only property names contained in defaults object to avoid copying properties we don't want)
        Object.keys(defaults).forEach((prop) => {
            this[prop] = opts[prop];
        });
    }
}
