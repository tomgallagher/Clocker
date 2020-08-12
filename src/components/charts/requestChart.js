import React from 'react';
import { observer } from 'mobx-react';
import { Polar } from 'react-chartjs-2';
import { useStores } from '../../hooks/useStores';

export const RequestChart = observer((props) => {
    //get the settings to see if we have any saved layouts
    const { JobStore } = useStores();
    //get the activeJob
    const activeJob = JobStore.jobs.length
        ? JobStore.jobs[JobStore.activeIndex]
        : JobStore.placeholderJob;
    return (
        <div className='internal-grid-content-single-row'>
            <div className='chartWrappper'>
                <Polar data={activeJob.requestData} options={props.options} />
            </div>
        </div>
    );
});

RequestChart.defaultProps = {
    options: {
        responsive: true,
        animation: {
            animateScale: true,
            animateRotate: true,
        },
    },
    legend: {
        position: 'top',
    },
};
