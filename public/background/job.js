//transient mirror of the UI job, but with settings extracted to top level, no collections and some mutations
//so this is a hybrid of the job and the settings

class Job {
    constructor(userInterfaceJob) {
        //always use the default settings
        var defaults = {
            name: 'N/A',
            id: 'N/A',
            createdAt: Date.now(),
            updatedtAt: Date.now(),
            //the job object needs to have a memory of the tab being run by the debugger
            tabId: null,
            //take the websites from the settings page
            websites: userInterfaceJob.settings.websites || [],
            //bandwidth comes from user interface as megabits per second, we need to adjust that to create download and upload, which has to be in bytes
            //A megabit (decimal) contains 1000 * 2 bits. This is the common usage compared to a megabit (binary) or a mebibit that contains 1024 * 2 bits.
            bandwidth_down:
                Math.round(
                    (userInterfaceJob.settings.bandwidth * 1000 ** 2) / 8
                ) || 187500,
            //we make the assumption that upload speeds are going to be 1/10 of download speeds
            bandwidth_up:
                Math.round(
                    (userInterfaceJob.settings.bandwidth * 1000 ** 2) / 8 / 10
                ) || 18750,
            //latency is saved as a number and is required as a number
            latency: userInterfaceJob.settings.latency || 40,
            //page iterations need to be part of the test
            pageIterations: userInterfaceJob.settings.pageIterations || 1,
            //with cache and with service worker needs to be part of the test
            withCache: userInterfaceJob.settings.withCache || false,
            withServiceWorker:
                userInterfaceJob.settings.withServiceWorker || true,
        };

        // then we can take the name, id, createdAt and updatedAt values from the user interface job
        let opts = Object.assign({}, defaults, userInterfaceJob);

        // assign options to instance data (using only property names contained in defaults object to avoid copying properties we don't want)
        Object.keys(defaults).forEach((prop) => {
            this[prop] = opts[prop];
        });
    }
}