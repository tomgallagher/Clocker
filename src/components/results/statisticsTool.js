import React, { useState } from 'react';
import { Form } from 'semantic-ui-react';
import { useStores } from '../../hooks/useStores';
import { observer } from 'mobx-react';
import { linearRegression, linearRegressionLine, rSquared } from 'simple-statistics';
import { StatisticsCard } from './statisticsCard';

const labelOptions = [
    { key: 'dcl', text: 'Dom Content Loaded', value: 'dclAverage' },
    { key: 'complete', text: 'Page Complete', value: 'completeAverage' },
];

const featureOptions = [
    { key: 'htmlLoad', text: 'Html Load', value: 'minorResources.htmlLoadAverage' },
    { key: 'cssLoad', text: 'CSS Load', value: 'cssLoadAverage' },
    { key: 'cssRequests', text: 'CSS Requests', value: 'cssRequestsAverage' },
    { key: 'fontLoad', text: 'Font Load', value: 'fontLoadAverage' },
    { key: 'fontRequests', text: 'Font Requests', value: 'fontRequestsAverage' },
    { key: 'scriptLoad', text: 'Script Load', value: 'scriptLoadAverage' },
    { key: 'scriptRequests', text: 'Script Requests', value: 'scriptRequestsAverage' },
    { key: 'imageLoad', text: 'Image Load', value: 'imageLoadAverage' },
    { key: 'imageRequests', text: 'Image Requests', value: 'imageRequestsAverage' },
    { key: 'mediaLoad', text: 'Video Load', value: 'mediaLoadAverage' },
    { key: 'mediaRequests', text: 'Video Requests', value: 'mediaRequestsAverage' },
    { key: 'advertisingFrames', text: 'Advertising Frames', value: 'minorResources.metricsAdvertisingFramesAverage' },
];

export const StatisticsTool = observer(() => {
    //get the settings to see if we have any saved layouts
    const { JobStore } = useStores();
    //get the activeJob, if length, otherwise the placeholder will do fine
    const activeJob = JobStore.jobs.length ? JobStore.jobs[JobStore.activeIndex] : JobStore.placeholderJob;
    //then we have the local states
    const [data, setData] = useState([]);
    const [label, setLabel] = useState(null);
    const [feature, setFeature] = useState(null);

    const handleLabelChange = (e, { value }) => {
        setLabel(value);
        if (feature) {
            let filteredData;
            if (feature.startsWith('minorResources')) {
                const tag = feature.split('.')[1];
                filteredData = activeJob.pages.map((page) => [page.minorResources[tag], page[value]]);
            } else {
                filteredData = activeJob.pages.map((page) => [page[feature], page[value]]);
            }
            setData(filteredData);
        }
    };

    const handleFeatureChange = (e, { value }) => {
        setFeature(value);
        if (label) {
            let filteredData;
            if (value.startsWith('minorResources')) {
                const tag = value.split('.')[1];
                filteredData = activeJob.pages.map((page) => [page.minorResources[tag], page[label]]);
            } else {
                filteredData = activeJob.pages.map((page) => [page[value], page[label]]);
            }
            setData(filteredData);
        }
    };

    return (
        <>
            <Form>
                <Form.Select
                    fluid
                    label='Target'
                    options={labelOptions}
                    placeholder='Target'
                    onChange={handleLabelChange}
                />
                <Form.Select
                    fluid
                    label='Predictor'
                    options={featureOptions}
                    placeholder='Predictor'
                    onChange={handleFeatureChange}
                />
            </Form>
            {data.length ? (
                <StatisticsCard
                    title='Results'
                    slope={linearRegression(data).m}
                    intersect={linearRegression(data).b}
                    rsquared={rSquared(data, linearRegressionLine(linearRegression(data)))}
                    centered={true}
                />
            ) : null}
        </>
    );
});
