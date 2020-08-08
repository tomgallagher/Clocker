export const DefaultSettingsLayouts = {
    // 12 columns
    lg: [
        { i: 'bandwidth', x: 0, y: 0, w: 3, h: 2, isBounded: true },
        { i: 'latency', x: 0, y: 2, w: 3, h: 2, isBounded: true },
        { i: 'webPageSelector', x: 3, y: 0, w: 6, h: 4, isBounded: true },
        { i: 'pageIterations', x: 9, y: 0, w: 3, h: 2, isBounded: true },
        { i: 'withCache', x: 9, y: 2, w: 3, h: 2, isBounded: true },
    ],
    // 10 columns
    md: [
        { i: 'bandwidth', w: 2, h: 2, x: 0, y: 0, isBounded: true },
        { i: 'latency', w: 2, h: 2, x: 0, y: 2, isBounded: true },
        { i: 'webPageSelector', w: 6, h: 4, x: 2, y: 0, isBounded: true },
        { i: 'pageIterations', w: 2, h: 2, x: 8, y: 0, isBounded: true },
        { i: 'withCache', w: 2, h: 2, x: 8, y: 2, isBounded: true },
    ],
    // 6 columns
    sm: [
        { i: 'webPageSelector', w: 6, h: 4, x: 0, y: 0, isBounded: true },
        { i: 'bandwidth', w: 3, h: 2, x: 0, y: 4, isBounded: true },
        { i: 'latency', w: 3, h: 2, x: 3, y: 4, isBounded: true },
        { i: 'pageIterations', w: 3, h: 2, x: 0, y: 6, isBounded: true },
        { i: 'withCache', w: 3, h: 2, x: 3, y: 6, isBounded: true },
    ],
    // 4 columns
    xs: [
        { i: 'webPageSelector', w: 4, h: 5, x: 0, y: 0, isBounded: true },
        { i: 'bandwidth', w: 2, h: 2, x: 0, y: 5, isBounded: true },
        { i: 'latency', w: 2, h: 2, x: 2, y: 5, isBounded: true },
        { i: 'pageIterations', w: 2, h: 2, x: 0, y: 7, isBounded: true },
        { i: 'withCache', w: 2, h: 2, x: 2, y: 7, isBounded: true },
    ],
    // 2 columns
    xxs: [
        { i: 'webPageSelector', w: 4, h: 4, x: 0, y: 0, isBounded: true },
        { i: 'bandwidth', w: 2, h: 2, x: 0, y: 4, isBounded: true },
        { i: 'latency', w: 2, h: 2, x: 2, y: 4, isBounded: true },
        { i: 'pageIterations', w: 2, h: 2, x: 0, y: 6, isBounded: true },
        { i: 'withCache', w: 2, h: 2, x: 2, y: 6, isBounded: true },
    ],
};
