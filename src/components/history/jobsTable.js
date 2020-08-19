import React, { useState } from 'react';
import { Checkbox } from 'semantic-ui-react';
import { observer } from 'mobx-react';
import { runInAction } from 'mobx';
import { useStores } from './../../hooks/useStores';
import { SemanticTable } from './../../components/tables/table';

export const JobsTable = observer(() => {
    //get the job store for data
    const { JobStore } = useStores();
    //then we have the custom row click, which is already passed the row.original by table component
    const handleRowClick = (row) => {
        //then we find the job using the row data id
        const jobId = row.id;
        const jobIndex = JobStore.jobs.findIndex((job) => job.id === jobId);
        runInAction(() => (JobStore.displayIndex = jobIndex));
    };
    //we need to format some cells that are non-standard
    const EditableNameCell = ({ value, row }) => {
        //save input value as local state
        const [textValue, setTextValue] = useState(value);
        //each name cell needs a handler
        const handleOnChange = (event) => {
            //first we update the state so the input reflects
            setTextValue(event.target.value);
            //then we find the job using the row data id and update the name property
            const jobId = row.original.id;
            const jobIndex = JobStore.jobs.findIndex((job) => job.id === jobId);
            //then we run the name change in action
            runInAction(() => (JobStore.jobs[jobIndex].name = event.target.value));
        };

        return (
            <input
                value={textValue}
                //we do not want any of the row handler functions firing when we click on an editable cell
                onClick={(event) => event.stopPropagation()}
                //we need to handle the change
                onChange={handleOnChange}
            />
        );
    };
    const DateCell = ({ value }) => <div>{`${new Date(value).toLocaleString()}`}</div>;
    const CheckboxCell = ({ value }) => <Checkbox disabled defaultChecked={value} />;
    // columns are headers with the accessor, referring to the "key" in the data
    const columns = [
        //basic data
        {
            Header: 'Details',
            columns: [
                { Header: 'Name', accessor: 'name', Cell: EditableNameCell },
                { Header: 'Date', accessor: 'updatedtAt', Cell: DateCell },
                { Header: 'Browser', accessor: 'browserName' },
                { Header: 'System', accessor: 'operatingSystem' },
                { Header: 'Version', accessor: 'operatingSystemVersion' },
            ],
        },
        //settings data
        {
            Header: 'Settings',
            columns: [
                { Header: 'Bandwidth (Mbps)', accessor: 'bandwidth' },
                { Header: 'Page Iterations', accessor: 'pageIterations' },
                { Header: 'Latency (ms)', accessor: 'latency' },
                { Header: 'Cache', accessor: 'withCache', Cell: CheckboxCell },
                { Header: 'Service Workers', accessor: 'withServiceWorker', Cell: CheckboxCell },
            ],
        },
        //results data
        {
            Header: 'Results',
            columns: [
                { Header: 'Web Pages', accessor: 'pagesProcessed' },
                { Header: 'Dom Loaded (ms)', accessor: 'dclAverage' },
                { Header: 'Page Complete (ms)', accessor: 'completeAverage' },
                { Header: 'Data Usage (MB)', accessor: 'dataUsageAverage' },
                { Header: 'Headers (ms)', accessor: 'headerTimingsAverage' },
            ],
        },
    ];
    return (
        <div className='internal-grid-content-single-row'>
            <SemanticTable
                headers={columns}
                dataset={JobStore.jobTableData}
                striped={true}
                compact={true}
                sortable={true}
                selectable={true}
                rowClick={handleRowClick}
                mostRecent={true}
                filename=''
            />
        </div>
    );
});
