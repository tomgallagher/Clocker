import React from 'react';
import { observer } from 'mobx-react';
import { Doughnut } from 'react-chartjs-2';
import { useStores } from '../../hooks/useStores';

export const LoadChart = observer((props) => {
    //get the settings to see if we have any saved layouts
    const { JobStore } = useStores();
    //get the activeJob
    const activeJob = JobStore.jobs.length
        ? JobStore.jobs[JobStore.activeIndex]
        : JobStore.placeholderJob;
    return (
        <div className='internal-grid-content-single-row'>
            <div className='chartWrappper'>
                <Doughnut
                    data={activeJob.resourceLoadData}
                    options={props.options}
                />
            </div>
        </div>
    );
});

LoadChart.defaultProps = {
    options: {
        responsive: true,
        cutoutPercentage: 75,
        tooltips: {
            enabled: true,
            mode: 'single',
            callbacks: {
                label: (item, data) =>
                    ` ${data.datasets[item.datasetIndex].data[item.index]} MB`,
            },
        },
        animation: {
            animateScale: true,
            animateRotate: true,
        },
    },
    legend: {
        position: 'top',
    },
};
