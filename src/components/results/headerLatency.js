import React from 'react';
import { Popup, Statistic } from 'semantic-ui-react';
import { observer } from 'mobx-react';
import { useStores } from '../../hooks/useStores';

export const HeaderLatency = observer(() => {
    //get the settings to see if we have any saved layouts
    const { JobStore } = useStores();
    //get the activeJob
    const activeJob = JobStore.jobs[JobStore.activeIndex];
    return (
        <div className='internal-grid-content-single-row'>
            <Popup
                trigger={
                    <Statistic
                        label='ms'
                        value={activeJob.headerTimingsAverage}
                    />
                }
                basic
                mouseEnterDelay={500}
                size='tiny'
            >
                <Popup.Header>Average Header Latency</Popup.Header>
                <Popup.Content>
                    Live calculated average for all resources of the time taken
                    to receive a header response.
                </Popup.Content>
            </Popup>
        </div>
    );
});
