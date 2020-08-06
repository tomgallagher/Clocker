export const DefaultResultsLayouts = {
    // 12 columns
    lg: [
        { i: 'jobStats', w: 6, h: 1, x: 0, y: 0, isBounded: true },
        { i: 'progress', w: 6, h: 1, x: 0, y: 1, isBounded: true },
        { i: 'pageTable', w: 9, h: 5, x: 0, y: 2, isBounded: true },
        { i: 'timings', w: 3, h: 2, x: 6, y: 0, isBounded: true },
        { i: 'console', w: 3, h: 2, x: 9, y: 0, isBounded: true },
    ],
    // 10 columns
    md: [
        { i: 'jobStats', x: 0, y: 0, w: 2, h: 2, isBounded: true },
        { i: 'progress', x: 0, y: 2, w: 2, h: 2, isBounded: true },
        { i: 'pageTable', x: 2, y: 0, w: 6, h: 4, isBounded: true },
        { i: 'timings', x: 2, y: 0, w: 2, h: 2, isBounded: true },
        { i: 'console', x: 2, y: 2, w: 2, h: 2, isBounded: true },
    ],
    // 6 columns
    sm: [
        { i: 'pageTable', x: 0, y: 0, w: 6, h: 4, isBounded: true },
        { i: 'jobStats', x: 0, y: 4, w: 3, h: 2, isBounded: true },
        { i: 'progress', x: 3, y: 4, w: 3, h: 2, isBounded: true },
        { i: 'timings', x: 0, y: 6, w: 3, h: 2, isBounded: true },
        { i: 'console', x: 3, y: 6, w: 3, h: 2, isBounded: true },
    ],
    // 4 columns
    xs: [
        { i: 'pageTable', x: 0, y: 0, w: 4, h: 6, isBounded: true },
        { i: 'jobStats', x: 0, y: 4, w: 4, h: 2, isBounded: true },
        { i: 'progress', x: 0, y: 6, w: 4, h: 2, isBounded: true },
        { i: 'timings', x: 0, y: 8, w: 4, h: 2, isBounded: true },
        { i: 'console', x: 0, y: 10, w: 4, h: 4, isBounded: true },
    ],
    // 2 columns
    xxs: [
        { i: 'pageTable', x: 0, y: 0, w: 2, h: 4, isBounded: true },
        { i: 'jobStats', x: 0, y: 4, w: 2, h: 2, isBounded: true },
        { i: 'progress', x: 0, y: 6, w: 2, h: 2, isBounded: true },
        { i: 'timings', x: 0, y: 8, w: 2, h: 2, isBounded: true },
        { i: 'console', x: 0, y: 10, w: 2, h: 4, isBounded: true },
    ],
};
