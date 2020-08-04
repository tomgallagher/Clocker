export const SettingsLayouts = {
    // 12 columns
    lg: [
        { i: 'bandwidth', x: 0, y: 0, w: 3, h: 2, isBounded: true },
        { i: 'latency', x: 0, y: 2, w: 3, h: 2, isBounded: true },
        { i: 'webPageSelector', x: 3, y: 0, w: 6, h: 4, isBounded: true },
        { i: 'pageIterations', x: 9, y: 0, w: 3, h: 2, isBounded: true },
        { i: 'mobileEmulation', x: 9, y: 2, w: 3, h: 2, isBounded: true },
    ],
    // 10 columns
    md: [
        { i: 'bandwidth', x: 0, y: 0, w: 2, h: 2, isBounded: true },
        { i: 'latency', x: 0, y: 2, w: 2, h: 2, isBounded: true },
        { i: 'webPageSelector', x: 2, y: 0, w: 6, h: 4, isBounded: true },
        { i: 'pageIterations', x: 2, y: 0, w: 2, h: 2, isBounded: true },
        { i: 'mobileEmulation', x: 2, y: 2, w: 2, h: 2, isBounded: true },
    ],
    // 6 columns
    sm: [
        { i: 'webPageSelector', x: 0, y: 0, w: 6, h: 4, isBounded: true },
        { i: 'bandwidth', x: 0, y: 4, w: 3, h: 2, isBounded: true },
        { i: 'latency', x: 3, y: 4, w: 3, h: 2, isBounded: true },
        { i: 'pageIterations', x: 0, y: 6, w: 3, h: 2, isBounded: true },
        { i: 'mobileEmulation', x: 3, y: 6, w: 3, h: 2, isBounded: true },
    ],
    // 4 columns
    xs: [
        { i: 'webPageSelector', x: 0, y: 0, w: 4, h: 6, isBounded: true },
        { i: 'bandwidth', x: 0, y: 4, w: 4, h: 2, isBounded: true },
        { i: 'latency', x: 0, y: 6, w: 4, h: 2, isBounded: true },
        { i: 'pageIterations', x: 0, y: 8, w: 4, h: 2, isBounded: true },
        { i: 'mobileEmulation', x: 0, y: 10, w: 4, h: 4, isBounded: true },
    ],
    // 2 columns
    xxs: [
        { i: 'webPageSelector', x: 0, y: 0, w: 2, h: 4, isBounded: true },
        { i: 'bandwidth', x: 0, y: 4, w: 2, h: 2, isBounded: true },
        { i: 'latency', x: 0, y: 6, w: 2, h: 2, isBounded: true },
        { i: 'pageIterations', x: 0, y: 8, w: 2, h: 2, isBounded: true },
        { i: 'mobileEmulation', x: 0, y: 10, w: 2, h: 4, isBounded: true },
    ],
};
