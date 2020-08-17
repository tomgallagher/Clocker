import { observable, extendObservable, toJS, decorate, reaction, computed } from 'mobx';
import psl from 'psl';
import { getDateString } from './../utils/strings';

export class Settings {
    constructor() {
        //always use the default settings
        var defaults = {
            //test settings
            websites: ['https://turbobrowser.eu/'],
            bandwidth: 1.5,
            latency: 40,
            pageIterations: 2,
            withCache: false,
            withServiceWorker: true,
            //UI settings
            customUrlLists: [],
            activePageIndex: null,
            sidebar: 'default',
            showSidebar: false,
            themeBackground: null,
            settingsLayouts: {},
            resultsLayouts: {},
        };

        // create a new object with the defaults over-ridden by the options passed in, none in this case
        let opts = Object.assign({}, defaults, {});

        // assign options to instance data (using only property names contained in defaults object to avoid copying properties we don't want)
        Object.keys(defaults).forEach((prop) => {
            this[prop] = opts[prop];
        });
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
    sidebar: observable,
    showSidebar: observable,
    settingsLayouts: observable,
    resultsLayouts: observable,
    parsedWebsites: computed,
    toString: computed,
});
