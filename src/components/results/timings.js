import React from 'react';
import { Icon, Step } from 'semantic-ui-react';
import { observer } from 'mobx-react';
import { useStores } from '../../hooks/useStores';

export const Timings = observer(() => {
    //get the settings to see if we have any saved layouts
    const { JobStore } = useStores();
    //get the activeJob
    const activeJob = JobStore.jobs.length
        ? JobStore.jobs[JobStore.activeIndex]
        : JobStore.placeholderJob;
    return (
        <div className='internal-grid-content-single-row'>
            <Step.Group>
                <Step>
                    <Icon name='th' />
                    <Step.Content>
                        <Step.Title>Dom Content Loaded</Step.Title>
                        <Step.Description>
                            {activeJob.dclAverage}ms
                        </Step.Description>
                    </Step.Content>
                </Step>

                <Step>
                    <Icon name='images outline' />
                    <Step.Content>
                        <Step.Title>Page Complete</Step.Title>
                        <Step.Description>
                            {activeJob.completeAverage}ms
                        </Step.Description>
                    </Step.Content>
                </Step>
            </Step.Group>
        </div>
    );
});
