import React from 'react';
import { Progress } from 'semantic-ui-react';
import { observer } from 'mobx-react';
import { useStores } from '../../hooks/useStores';

export const ProgressBar = observer(() => {
    //get the settings to see if we have any saved layouts
    const { JobStore } = useStores();
    //get the activeJob
    const activeJob = JobStore.jobs[JobStore.activeIndex];
    //get the current page count
    const pageCount = activeJob.pages.length;
    //then we will want to get the number of urls in the settings of the active job as well
    const pageTarget = 20;

    return (
        <div className='internal-grid-content-single-row'>
            <Progress
                percent={Math.round((pageCount / pageTarget) * 100)}
                autoSuccess
                progress
            />
        </div>
    );
});
