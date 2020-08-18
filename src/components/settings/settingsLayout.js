export const DefaultSettingsLayouts = {
    // 12 columns
    lg: [
        { i: 'latency', w: 2, h: 2, x: 0, y: 0, isBounded: true },
        { i: 'webPageSelector', w: 6, h: 4, x: 2, y: 0, isBounded: true },
        { i: 'bandwidth', w: 2, h: 2, x: 8, y: 0, isBounded: true },
        { i: 'pageIterations', w: 2, h: 2, x: 10, y: 0, isBounded: true },
        { i: 'screenshot', w: 2, h: 2, x: 0, y: 2, isBounded: true },
        { i: 'withCache', w: 2, h: 2, x: 8, y: 2, isBounded: true },
        { i: 'withServiceWorker', w: 2, h: 2, x: 10, y: 2, isBounded: true },
    ],
    // 10 columns
    md: [
        { i: 'latency', w: 5, h: 2, x: 0, y: 6, isBounded: true },
        { i: 'webPageSelector', w: 8, h: 4, x: 2, y: 0, isBounded: true },
        { i: 'pageIterations', w: 2, h: 2, x: 0, y: 2, isBounded: true },
        { i: 'bandwidth', w: 2, h: 2, x: 0, y: 0, isBounded: true },
        { i: 'screenshot', w: 5, h: 2, x: 5, y: 6, isBounded: true },
        { i: 'withCache', w: 5, h: 2, x: 0, y: 4, isBounded: true },
        { i: 'withServiceWorker', w: 5, h: 2, x: 5, y: 4, isBounded: true },
    ],
    // 6 columns
    sm: [
        { w: 3, h: 2, x: 0, y: 8, i: 'latency', isBounded: true },
        { w: 6, h: 4, x: 0, y: 0, i: 'webPageSelector', isBounded: true },
        { w: 3, h: 2, x: 3, y: 4, i: 'pageIterations', isBounded: true },
        { w: 3, h: 2, x: 0, y: 4, i: 'bandwidth', isBounded: true },
        { w: 3, h: 2, x: 3, y: 8, i: 'screenshot', isBounded: true },
        { w: 3, h: 2, x: 0, y: 6, i: 'withCache', isBounded: true },
        { w: 3, h: 2, x: 3, y: 6, i: 'withServiceWorker', isBounded: true },
    ],
    // 4 columns
    xs: [
        { w: 2, h: 2, x: 0, y: 9, i: 'latency', isBounded: true },
        { w: 4, h: 5, x: 0, y: 0, i: 'webPageSelector', isBounded: true },
        { w: 2, h: 2, x: 2, y: 5, i: 'pageIterations', isBounded: true },
        { w: 2, h: 2, x: 0, y: 5, i: 'bandwidth', isBounded: true },
        { w: 2, h: 2, x: 2, y: 9, i: 'screenshot', isBounded: true },
        { w: 2, h: 2, x: 0, y: 7, i: 'withCache', isBounded: true },
        { w: 2, h: 2, x: 2, y: 7, i: 'withServiceWorker', isBounded: true },
    ],
    // 2 columns
    xxs: [
        { w: 2, h: 2, x: 0, y: 12, i: 'latency', isBounded: true },
        { w: 2, h: 4, x: 0, y: 0, i: 'webPageSelector', isBounded: true },
        { w: 2, h: 2, x: 0, y: 6, i: 'pageIterations', isBounded: true },
        { w: 2, h: 2, x: 0, y: 4, i: 'bandwidth', isBounded: true },
        { w: 2, h: 2, x: 0, y: 14, i: 'screenshot', isBounded: true },
        { w: 2, h: 2, x: 0, y: 8, i: 'withCache', isBounded: true },
        { w: 2, h: 2, x: 0, y: 10, i: 'withServiceWorker', isBounded: true },
    ],
};
