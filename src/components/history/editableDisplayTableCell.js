import React from 'react';
import { observer } from 'mobx-react';
import { runInAction } from 'mobx';
import { useStores } from './../../hooks/useStores';

//we need to format some cells that are non-standard
export const EditableDisplayNameTableCell = observer(({ row }) => {
    //get the job store for data
    const { JobStore } = useStores();
    //then we find the job using the row data id and update the name property
    const jobId = row.original.id;
    const jobIndex = JobStore.jobs.findIndex((job) => job.id === jobId);
    const handleOnChange = (event) => {
        //then we run the name change in action
        runInAction(() => (JobStore.jobs[jobIndex].name = event.target.value));
    };
    return (
        <input
            value={JobStore.jobs[jobIndex].name}
            //we do not want any of the row handler functions firing when we click on an editable cell
            onClick={(event) => event.stopPropagation()}
            //we need to handle the change
            onChange={handleOnChange}
            //unobstrusive border style
            style={{ border: '1px solid rgba(34,36,38,.15)' }}
        />
    );
});
