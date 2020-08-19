import Bowser from 'bowser';

export class BrowserDetect {
    constructor() {
        const parsed = Bowser.parse(window.navigator.userAgent);
        this.name = parsed.browser.name;
        this.version = parsed.browser.version;
        this.os = parsed.os.name;
        this.os_version = parsed.os.versionName;
        this.platform = parsed.platform.type;
    }
}
