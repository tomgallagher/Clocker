import React from 'react';
import { Checkbox } from 'semantic-ui-react';
import { observer } from 'mobx-react';
import { runInAction } from 'mobx';
import { useStores } from './../../hooks/useStores';
import { EditableDisplayNameTableCell } from './editableDisplayTableCell';
import { SemanticTable } from './../../components/tables/table';

export const JobsTable = observer(() => {
    //get the job store for data
    const { JobStore } = useStores();
    //then we have the custom row click, which is already passed the row.original by table component
    const handleRowClick = (row) => {
        //then we find the job using the row index
        const jobId = row.unique_id;
        const jobIndex = JobStore.jobs.findIndex((job) => job.unique_id === jobId);
        runInAction(() => (JobStore.displayIndex = jobIndex));
    };
    const DateCell = ({ value }) => <div>{`${new Date(value).toLocaleString()}`}</div>;
    const CheckboxCell = ({ value }) => <Checkbox disabled defaultChecked={value} />;
    // columns are headers with the accessor, referring to the "key" in the data
    const columns = [
        //basic data
        {
            Header: 'Details',
            columns: [
                { Header: 'Name', accessor: 'name', Cell: EditableDisplayNameTableCell },
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
