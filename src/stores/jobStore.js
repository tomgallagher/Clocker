import { observable, autorun, toJS, decorate, reaction, computed } from 'mobx';
import { createMobxMessageListener } from './../utils/mobxFunctions';
import { v4 as uuidv4 } from 'uuid';
import {
    RoundedAverage,
    RoundedAverageMegaBytes,
    TotalMegaBytes,
} from './../utils/arrayFunctions';

import ColorPalette from './../components/charts/colorPalette.json';

//for testing purposes
import { makeData } from './../__test__/makeData';

export class JobStore {
    constructor() {
        //we have the basic attributes of the job store
        this.jobs = [];
        this.activeIndex = 0;
        this.isLoading = false;
        this.isLoadError = false;
        //more complex observable to link the rxjs messaging port from chrome into mobx store
        //pass command filter, request property to return and default value
        this.console = createMobxMessageListener({
            commandFilter: 'incomingConsoleMessage',
            requestProperty: 'message',
            initialState: 'default',
        });
        //then we use the more complex observables in autorun
        autorun(() => {
            //no need to activate on the first default value
            if (this.console.current() !== 'default') {
                // printed everytime the console function receives a new message
                console.log(this.console.current());
            }
        });

        //for testing purpose we need to add a fake job
        const job = new Job({});
        this.jobs.push(job);
    }
}

//then add the decorations to make the relevant features of the list observable
decorate(JobStore, {
    jobs: observable,
    activeIndex: observable,
    isLoading: observable,
    isLoadError: observable,
    console: observable,
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
            //the job must contain reporting stats on its contained pages, the average for the important indicators
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
        };

        // create a new object with the defaults over-ridden by the options passed in
        let opts = Object.assign({}, defaults, options);

        // assign options to instance data (using only property names contained in defaults object to avoid copying properties we don't want)
        Object.keys(defaults).forEach((prop) => {
            this[prop] = opts[prop];
        });

        //then each job needs to automatically update its reporting stats
        reaction(
            () => this.pages,
            (pagesArray) => {
                console.log('reaction: Autogenerating Job Reporting Stats');
                //first we work out the averages
                this.dclAverage = pagesArray
                    .map((item) => item.dclAverage)
                    .reduce(RoundedAverage, 0);
                this.completeAverage = pagesArray
                    .map((item) => item.completeAverage)
                    .reduce(RoundedAverage, 0);
                this.dataUsageAverage = pagesArray
                    .map((item) => item.dataUsageAverage)
                    .reduce(RoundedAverageMegaBytes, 0);
                this.headerTimingsAverage = pagesArray
                    .map((item) => item.headerTimingsAverage)
                    .reduce(RoundedAverage, 0);
                this.imageRequestsAverage = pagesArray
                    .map((item) => item.imageRequestsAverage)
                    .reduce(RoundedAverage, 0);
                this.fontRequestsAverage = pagesArray
                    .map((item) => item.fontRequestsAverage)
                    .reduce(RoundedAverage, 0);
                this.mediaRequestsAverage = pagesArray
                    .map((item) => item.mediaRequestsAverage)
                    .reduce(RoundedAverage, 0);
                this.cssRequestsAverage = pagesArray
                    .map((item) => item.cssRequestsAverage)
                    .reduce(RoundedAverage, 0);
                this.scriptRequestsAverage = pagesArray
                    .map((item) => item.scriptRequestsAverage)
                    .reduce(RoundedAverage, 0);
                //then we work out the running totals
                this.imageLoadTotal = pagesArray
                    .map((item) => item.imageLoadAverage)
                    .reduce(TotalMegaBytes, 0);
                this.mediaLoadTotal = pagesArray
                    .map((item) => item.mediaLoadAverage)
                    .reduce(TotalMegaBytes, 0);
                this.fontLoadTotal = pagesArray
                    .map((item) => item.fontLoadAverage)
                    .reduce(TotalMegaBytes, 0);
                this.cssLoadTotal = pagesArray
                    .map((item) => item.cssLoadAverage)
                    .reduce(TotalMegaBytes, 0);
                this.scriptLoadTotal = pagesArray
                    .map((item) => item.scriptLoadAverage)
                    .reduce(TotalMegaBytes, 0);
                //and update the date
                this.updatedAt = Date.now();
            }
        );

        //then for testing purposes we need to add some fake data
        const testData = makeData(20);
        const testPages = testData.map((page) => new Page(page));
        this.pages = [...this.pages, ...testPages];
    }

    get pageTableData() {
        return this.pages.map((page) => {
            //we have no need for the following fields in the table data, and it causes problems in the CSV download, so we destructure to remove
            const { jobId, id, createdAt, screenshot, ...partialPage } = page;
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
        };

        // create a new object with the defaults over-ridden by the options passed in, none in this case
        let opts = Object.assign({}, defaults, options);

        // assign options to instance data (using only property names contained in defaults object to avoid copying properties we don't want)
        Object.keys(defaults).forEach((prop) => {
            this[prop] = opts[prop];
        });
    }
}
