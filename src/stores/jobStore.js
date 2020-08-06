import {
    observable,
    extendObservable,
    toJS,
    decorate,
    reaction,
    computed,
} from 'mobx';
import { v4 as uuidv4 } from 'uuid';

export class JobStore {
    constructor() {
        this.jobs = [];
        this.activeIndex = 0;
        this.isLoading = false;
        this.isLoadError = false;
    }
    //we need a routine to load all the jobs from the database into the observable on start
}

//then add the decorations to make the relevant features of the list observable
decorate(JobStore, {
    jobs: observable,
    activeIndex: observable,
    isLoading: observable,
    isLoadError: observable,
});

export class Job {
    constructor() {
        //always use the default settings
        var defaults = {
            name: 'N/A',
            id: uuidv4(),
            createdAt: Date.now(),
            updatedtAt: Date.now(),
            settings: {},
            //the job must contain reporting stats on its contained pages
            pages: [],
        };

        // create a new object with the defaults over-ridden by the options passed in, none in this case
        let opts = Object.assign({}, defaults, {});

        // assign options to instance data (using only property names contained in defaults object to avoid copying properties we don't want)
        Object.keys(defaults).forEach((prop) => {
            this[prop] = opts[prop];
        });

        //then each job needs to automatically update its reporting stats
        reaction(
            () => this.pages,
            (pagesArray) => {
                console.log('reaction: Autogenerating Job Reporting Stats');
                console.log(pagesArray);

                //and update the date
                this.updatedAt = Date.now();
            }
        );
    }
}

export class Page {
    constructor() {
        //always use the default settings
        var defaults = {};

        // create a new object with the defaults over-ridden by the options passed in, none in this case
        let opts = Object.assign({}, defaults, {});

        // assign options to instance data (using only property names contained in defaults object to avoid copying properties we don't want)
        Object.keys(defaults).forEach((prop) => {
            this[prop] = opts[prop];
        });
    }
}
