import { observable, extendObservable, decorate, computed } from 'mobx';
import psl from 'psl';
import { getDateString } from './../utils/strings';
import { autosave } from './autosave';

export class Settings {
    constructor() {
        //test settings
        this.websites = [];
        this.bandwidth = 1.5;
        this.latency = 40;
        this.pageIterations = 2;
        this.withCache = false;
        this.withServiceWorker = true;
        //UI settings
        this.customUrlLists = [];
        this.activePageIndex = null;
        this.isPaused = false;
        this.sidebar = 'default';
        this.showSidebar = false;
        this.themeBackground = null;
        this.settingsLayouts = {};
        this.resultsLayouts = {};
        this.historyLayouts = {};
        //load the data from local storage if available
        this.load();
        //add the autosave function that will persist the data with a small delay
        autosave(this, this.save.bind(this), 500);
    }

    load() {
        //try to get the time data from local storage
        const localData = window.localStorage.getItem('settings_data');
        //if there is time data, use extendObservable, which can be used to add observable properties to the existing target objects, much like object assign.
        localData ? extendObservable(this, JSON.parse(localData)) : console.log('No Settings Data in Storage');
    }

    save(json) {
        window.localStorage.setItem('settings_data', json);
    }

    get parsedWebsites() {
        return this.websites
            .filter(Boolean)
            .map((item) => new window.URL(item.trim()))
            .map((urlObject) => ({
                name: psl.parse(urlObject.hostname).domain,
                favicon: `https://icons.duckduckgo.com/ip3/${urlObject.hostname}.ico`,
                url: urlObject.href,
            }));
    }

    get toString() {
        const selected = {
            bandwidth: this.bandwidth,
            latency: this.latency,
            pageIterations: this.pageIterations,
            withCache: this.withCache,
        };
        const settings = Object.entries(selected)
            .map(([key, value]) => `${key}-${value}`)
            .join('_');
        return `${getDateString()}_${settings}`;
    }
}

//then add the decorations to make the relevant features of the list observable
decorate(Settings, {
    websites: observable,
    bandwidth: observable,
    latency: observable,
    pageIterations: observable,
    withCache: observable,
    withServiceWorker: observable,
    customUrlLists: observable,
    activePageIndex: observable,
    isPaused: observable,
    sidebar: observable,
    showSidebar: observable,
    settingsLayouts: observable,
    resultsLayouts: observable,
    parsedWebsites: computed,
    toString: computed,
});
