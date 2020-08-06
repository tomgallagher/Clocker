import React, { useState } from 'react';
import { Progress } from 'semantic-ui-react';
import { observer } from 'mobx-react';
import { useStores } from '../../hooks/useStores';

//for testing only
import { useInterval } from './../../hooks/useInterval';

export const ProgressBar = observer(() => {
    //for testing only
    const [counter, setCounter] = useState(0);
    //get the settings to see if we have any saved layouts
    const { JobStore } = useStores();
    //get the activeJob
    const activeJob = JobStore.jobs[JobStore.activeIndex];

    //for testing only
    useInterval(() => {
        setCounter(counter + 1);
    }, 2000);

    return (
        <div className='internal-grid-content-single-row'>
            <Progress percent={counter * 5} autoSuccess progress />
        </div>
    );
});
