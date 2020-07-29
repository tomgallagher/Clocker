import namor from 'namor';

const range = (len) => {
    const arr = [];
    for (let i = 0; i < len; i++) {
        arr.push(i);
    }
    return arr;
};

const newPage = () => {
    const totalData = Math.floor(Math.random() * 10485760);
    const totalResources = Math.floor(Math.random() * 120);
    return {
        url: `https://${namor.generate()}.com`,
        domLoaded: Math.floor(Math.random() * 1000),
        complete: Math.floor(Math.random() * 10000),
        dataUsage: Math.floor(Math.random() * 10485760),
        imageLoad: Math.round(totalData * 0.54),
        imageResources: Math.round(totalResources * 0.54),
        videoLoad: Math.round(totalData * 0.06),
        videoResources: Math.round(totalResources * 0.06),
        fontLoad: Math.round(totalData * 0.09),
        fontResources: Math.round(totalResources * 0.09),
        javascriptLoad: Math.round(totalData * 0.31),
        javascriptResources: Math.round(totalResources * 0.31),
        cssLoad: Math.round(totalData * 0.1),
        cssResources: Math.round(totalResources * 0.1),
    };
};

export default function makeData(...lens) {
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
}
