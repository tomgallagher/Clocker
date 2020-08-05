import {
    observable,
    extendObservable,
    toJS,
    decorate,
    reaction,
    computed,
} from 'mobx';
import psl from 'psl';

export class Settings {
    constructor() {
        //always use the default settings
        var defaults = {
            //test settings
            websites: [],
            bandwidth: 10485760,
            latency: 40,
            pageIterations: 1,
            mobileEmulation: {},
            customUrlLists: [],
            //UI settings
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
}

//then add the decorations to make the relevant features of the list observable
decorate(Settings, {
    websites: observable,
    bandwidth: observable,
    latency: observable,
    pageIterations: observable,
    mobileEmulation: observable,
    customUrlLists: observable,
    sidebar: observable,
    showSidebar: observable,
    settingsLayouts: observable,
    resultsLayouts: observable,
    parsedWebsites: computed,
});
