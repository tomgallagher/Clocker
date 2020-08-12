import React from 'react';
import { Popup, Statistic } from 'semantic-ui-react';
import { observer } from 'mobx-react';
import { useStores } from '../../hooks/useStores';

export const DataUsage = observer(() => {
    //get the settings to see if we have any saved layouts
    const { JobStore } = useStores();
    //get the activeJob
    const activeJob = JobStore.jobs.length
        ? JobStore.jobs[JobStore.activeIndex]
        : JobStore.placeholderJob;
    return (
        <div className='internal-grid-content-single-row'>
            <Popup
                trigger={
                    <Statistic
                        label='Megabytes'
                        value={activeJob.dataUsageAverage}
                    />
                }
                basic
                mouseEnterDelay={500}
                size='tiny'
            >
                <Popup.Header>Average Page Weight</Popup.Header>
                <Popup.Content>
                    Live calculated average of total data transferred to render
                    completed pages.
                </Popup.Content>
            </Popup>
        </div>
    );
});
