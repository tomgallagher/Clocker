import { observable, autorun, reaction, decorate, computed, toJS, runInAction } from 'mobx';
import localdb from './../database/database';
import { SendChromeMessage } from './../utils/chromeFunctions';
import { createMobxMessageListener } from './../utils/mobxFunctions';
import { v4 as uuidv4 } from 'uuid';
import { RoundedAverage, RoundedAverageMegaBytes, TotalMegaBytes } from './../utils/arrayFunctions';
import { BrowserDetect } from '../utils/browserDetect';
import ColorPalette from './../components/charts/colorPalette.json';

export class JobStore {
    constructor() {
        //we have the array of jobs in the job store
        this.jobs = [];
        //we have the activeIndex for jobs currently running / most recent job
        this.activeIndex = 0;
        //we have the display index for past jobs that need to be displayed
        this.displayIndex = null;
        //the basic params of the platform we are working on
        this.browser = new BrowserDetect();
        //then we have the placeholders so the UI displays with no data
        this.placeholderJob = new Job({});
        this.placeholderPage = new Page({});
        //then the loading indicators for when we get the data from the database
        this.isLoading = false;
        this.isLoadError = false;
        //more complex observables to link the rxjs messaging port from chrome into mobx store
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

        //then we use autorun to monitor incoming console messages and then update the UI accordingly
        autorun(() => {
            //no need to activate on null value
            if (this.console.current()) {
                //then see if we have an active job or placeholder
                const activeJob = this.jobs.length ? this.jobs[this.activeIndex] : this.placeholderJob;
                // push the new message into the active job console messages array every time we receive the message
                activeJob.consoleMessages.push(this.console.current());
            }
        });

        //same with page data coming in - a new page needs to be added to the active job
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

        //then we are always looking at the jobs length to see if we have a new job and update the active index accordingly
        reaction(
            () => this.jobs.length,
            () => {
                console.log('reaction: new job, updating activeIndex');
                this.activeIndex = this.jobs.length - 1;
            }
        );

        //then we need to load the existing jobs in local storage from the database
        this.loadJobsFromStorage();
    }

    //load guidelines from local storage
    loadJobsFromStorage = () => {
        //mark the loading process as started
        this.isLoading = true;
        //open the correct table
        localdb
            .table('jobs')
            //then get the whole collection as an array
            .toArray()
            //then once we have the array we need to create all the jobs
            .then((jobs) => {
                //then we just need to push each job into the observable list
                jobs.forEach((job) => {
                    //this is a bit more complex as we need to create an observable from the plain JS object that is stored
                    const observableJob = new Job(job);
                    //then push to observable list
                    runInAction(() => this.jobs.push(observableJob));
                });
                //then say we have finished loading
                this.isLoading = false;
                //then report
                console.log(`Loaded ${jobs.length} jobs from storage`);
            })
            .catch((error) => {
                console.error(error);
                this.isLoadError = true;
            });
    };

    createJob = (job) => {
        //add the browser details to the job
        const browserJob = Object.assign({}, job, {
            browserName: this.browser.name,
            operatingSystem: this.browser.os,
            operatingSystemVersion: this.browser.os_version,
        });
        //on button click in banner.js front page we need to create a new job, with the browser details as options
        const newJob = new Job(browserJob);
        //then create a saveable version of the job
        const saveableJob = toJS(newJob);
        //then save the job to storage in order to get the db id attached to the observed job
        localdb
            .table('jobs')
            .add(saveableJob)
            .then((id) => {
                //the id is the only thing that comes back
                newJob.database_id = id;
                //then push the job into our local observable jobs list, which will update the active index
                this.jobs.push(newJob);
                //then report the id of the project
                console.log(`Storage has created local version of Job with ID: ${newJob.database_id}`);
                //then send the job to the background page for processing
                SendChromeMessage({
                    command: 'startTest',
                    payload: toJS(newJob),
                });
            })
            .catch((error) => {
                console.log(error);
                console.log(saveableJob);
            });
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

    get jobTableData() {
        return this.jobs.map((job) => {
            //we have no need for all the fields in the table data
            const partialJob = {
                unique_id: job.unique_id,
                name: job.name,
                updatedtAt: job.updatedtAt,
                browserName: job.browserName,
                operatingSystem: job.operatingSystem,
                operatingSystemVersion: job.operatingSystemVersion,
                bandwidth: job.bandwidth,
                pageIterations: job.pageIterations,
                latency: job.latency,
                withCache: job.withCache,
                withServiceWorker: job.withServiceWorker,
                pagesProcessed: job.pages.length,
                dclAverage: job.dclAverage,
                completeAverage: job.completeAverage,
                dataUsageAverage: job.dataUsageAverage,
                headerTimingsAverage: job.headerTimingsAverage,
            };
            //we have no need for the following settings
            const { activePageIndex, screenshotWidth, websites, ...partialSettings } = job.settings;
            //however we do need the settings extracted from the job settings object
            const expandedPartialJob = Object.assign({}, partialJob, partialSettings);
            //then we return the partial job
            return expandedPartialJob;
        });
    }
}

//then add the decorations to make the relevant features of the list observable
decorate(JobStore, {
    jobs: observable,
    activeIndex: observable,
    displayIndex: observable,
    isLoading: observable,
    isLoadError: observable,
    jobTableData: computed,
});

export class Job {
    constructor(options) {
        //always use the default settings
        var defaults = {
            name: 'N/A',
            browserName: 'N/A',
            operatingSystem: 'N/A',
            operatingSystemVersion: 'N/A',
            unique_id: uuidv4(),
            database_id: 0,
            createdAt: Date.now(),
            updatedtAt: Date.now(),
            //when the job is created the settings at the time are frozen and copied in
            settings: {},
            //record of all console messages
            consoleMessages: [],
            //container for pages
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

        //then when a page gets added we recalc the averages and save to the database
        //using reaction here rather than autosave as we only care about a couple of properties
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
                //and then update in the database at this point
                localdb
                    .table('jobs')
                    //do the update command with the id and the saveable version of the observed project
                    .update(this.database_id, toJS(this))
                    .then(() => {
                        console.log(`Storage has updated on NEW PAGE of Job with ID ${this.database_id}`);
                    })
                    .catch((error) => console.error(error));
            }
        );

        //then we also want to make changes to the saved job when the name gets changed
        reaction(
            () => this.name,
            () => {
                //and then update in the database at this point
                localdb
                    .table('jobs')
                    //do the update command with the id and the saveable version of the observed project
                    .update(this.database_id, toJS(this))
                    .then(() => {
                        console.log(`Storage has updated on NAME CHANGE of Job with ID ${this.database_id}`);
                    })
                    .catch((error) => console.error(error));
            },
            //and we need to have a delay so we can update after the typing has finished
            { delay: 5000 }
        );
    }

    get standardStats() {
        return {
            dclDataUsage: this.pages.map(({ dataUsageAverage, dclAverage }) => [dataUsageAverage, dclAverage]),
            dclHeaderTiming: this.pages.map(({ headerTimingsAverage, dclAverage }) => [
                headerTimingsAverage,
                dclAverage,
            ]),
            dclRequests: this.pages.map(
                ({
                    cssRequestsAverage,
                    fontRequestsAverage,
                    scriptRequestsAverage,
                    imageRequestsAverage,
                    mediaRequestsAverage,
                    dclAverage,
                }) => [
                    [
                        cssRequestsAverage,
                        fontRequestsAverage,
                        scriptRequestsAverage,
                        imageRequestsAverage,
                        mediaRequestsAverage,
                    ].reduce((a, b) => a + b, 0),
                    dclAverage,
                ]
            ),
            completeDataUsage: this.pages.map(({ dataUsageAverage, completeAverage }) => [
                dataUsageAverage,
                completeAverage,
            ]),
            completeHeaderTiming: this.pages.map(({ headerTimingsAverage, completeAverage }) => [
                headerTimingsAverage,
                completeAverage,
            ]),
            completeDclRequests: this.pages.map(
                ({
                    completeAverage,
                    cssRequestsAverage,
                    fontRequestsAverage,
                    scriptRequestsAverage,
                    imageRequestsAverage,
                    mediaRequestsAverage,
                }) => [
                    [
                        cssRequestsAverage,
                        fontRequestsAverage,
                        scriptRequestsAverage,
                        imageRequestsAverage,
                        mediaRequestsAverage,
                    ].reduce((a, b) => a + b, 0),
                    completeAverage,
                ]
            ),
        };
    }

    get pageTableData() {
        return this.pages.map((page) => {
            //we have no need for the following fields in the table data, and it causes problems in the CSV download, so we destructure to remove
            const { jobId, id, createdAt, screenshot, minorResources, ...partialPage } = page;
            //then we return the partial page
            return partialPage;
        });
    }

    get pageMetricsTableData() {
        return this.pages.map((page) => {
            //then we return the partial data for the metrics table
            return {
                url: page.url,
                metricsDocumentsAverage: page.minorResources.metricsDocumentsAverage,
                metricsResourcesAverage: page.minorResources.metricsResourcesAverage,
                metricsFramesAverage: page.minorResources.metricsFramesAverage,
                metricsAdvertisingFramesAverage: page.minorResources.metricsAdvertisingFramesAverage,
                metricsUsedHeapAverage: page.minorResources.metricsUsedHeapAverage,
                metricsTotalHeapAverage: page.minorResources.metricsTotalHeapAverage,
            };
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
    name: observable,
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
    pageMetricsTableData: computed,
    resourceLoadData: computed,
    standardStats: computed,
});

export class Page {
    constructor(options) {
        //always use the default settings, important that these remain in same order as table headers for csv download
        var defaults = {
            url: 'N/A',
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
