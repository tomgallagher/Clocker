import namor from 'namor';

const range = (len) => {
    const arr = [];
    for (let i = 0; i < len; i++) {
        arr.push(i);
    }
    return arr;
};

export const newPage = () => {
    const totalData = Math.floor(Math.random() * 10485760);
    const totalResources = Math.floor(Math.random() * 120);
    return {
        url: `https://${namor.generate()}.com`,
        dclAverage: Math.floor(Math.random() * 1000),
        completeAverage: Math.floor(Math.random() * 10000),
        dataUsageAverage: Math.floor(Math.random() * 10485760),
        headerTimingsAverage: Math.floor(Math.random() * 500),
        imageLoadAverage: Math.round(totalData * 0.54),
        imageRequestsAverage: Math.round(totalResources * 0.54),
        mediaLoadAverage: Math.round(totalData * 0.06),
        mediaRequestsAverage: Math.round(totalResources * 0.06),
        fontLoadAverage: Math.round(totalData * 0.09),
        fontRequestsAverage: Math.round(totalResources * 0.09),
        scriptLoadAverage: Math.round(totalData * 0.31),
        scriptRequestsAverage: Math.round(totalResources * 0.31),
        cssLoadAverage: Math.round(totalData * 0.1),
        cssRequestsAverage: Math.round(totalResources * 0.1),
    };
};

export const makeData = (...lens) => {
    const makeDataLevel = (depth = 0) => {
        const len = lens[depth];
        return range(len).map((d) => {
            return {
                ...newPage(),
                subRows: lens[depth + 1] ? makeDataLevel(depth + 1) : undefined,
            };
        });
    };

    return makeDataLevel();
};
