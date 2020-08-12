export const DefaultSettingsLayouts = {
    // 12 columns
    lg: [
        { i: 'bandwidth', w: 4, h: 2, x: 8, y: 0, isBounded: true },
        { i: 'latency', w: 2, h: 2, x: 0, y: 0, isBounded: true },
        { i: 'webPageSelector', w: 6, h: 4, x: 2, y: 0, isBounded: true },
        { i: 'pageIterations', w: 2, h: 2, x: 0, y: 2, isBounded: true },
        { i: 'withCache', w: 2, h: 2, x: 8, y: 2, isBounded: true },
        { i: 'withServiceWorker', w: 2, h: 2, x: 10, y: 2, isBounded: true },
    ],
    // 10 columns
    md: [
        { i: 'bandwidth', w: 2, h: 2, x: 0, y: 0, isBounded: true },
        { i: 'latency', w: 2, h: 2, x: 0, y: 2, isBounded: true },
        { i: 'webPageSelector', w: 8, h: 4, x: 2, y: 0, isBounded: true },
        { i: 'pageIterations', w: 4, h: 2, x: 0, y: 4, isBounded: true },
        { i: 'withCache', w: 3, h: 2, x: 4, y: 4, isBounded: true },
        { i: 'withServiceWorker', w: 3, h: 2, x: 7, y: 4, isBounded: true },
    ],
    // 6 columns
    sm: [
        { i: 'webPageSelector', w: 6, h: 4, x: 0, y: 0, isBounded: true },
        { i: 'bandwidth', w: 3, h: 2, x: 0, y: 4, isBounded: true },
        { i: 'latency', w: 3, h: 2, x: 3, y: 4, isBounded: true },
        { i: 'pageIterations', w: 3, h: 2, x: 0, y: 6, isBounded: true },
        { i: 'withCache', w: 1, h: 2, x: 3, y: 6, isBounded: true },
        { i: 'withServiceWorker', w: 2, h: 2, x: 4, y: 6, isBounded: true },
    ],
    // 4 columns
    xs: [
        { i: 'webPageSelector', w: 4, h: 5, x: 0, y: 0, isBounded: true },
        { i: 'bandwidth', w: 2, h: 2, x: 0, y: 5, isBounded: true },
        { i: 'latency', w: 2, h: 2, x: 2, y: 5, isBounded: true },
        { i: 'pageIterations', w: 2, h: 2, x: 0, y: 7, isBounded: true },
        { i: 'withCache', w: 2, h: 2, x: 2, y: 7, isBounded: true },
        { i: 'withServiceWorker', w: 2, h: 2, x: 0, y: 9, isBounded: true },
    ],
    // 2 columns
    xxs: [
        { i: 'webPageSelector', w: 4, h: 4, x: 0, y: 0, isBounded: true },
        { i: 'bandwidth', w: 2, h: 2, x: 0, y: 4, isBounded: true },
        { i: 'latency', w: 2, h: 2, x: 2, y: 4, isBounded: true },
        { i: 'pageIterations', w: 2, h: 2, x: 0, y: 6, isBounded: true },
        { i: 'withCache', w: 2, h: 2, x: 2, y: 6, isBounded: true },
        { i: 'withServiceWorker', w: 2, h: 2, x: 0, y: 8, isBounded: true },
    ],
};
