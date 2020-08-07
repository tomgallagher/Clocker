import React from 'react';
import { observer } from 'mobx-react';
import { useStores } from './../../hooks/useStores';
import { SemanticTable } from './../../components/tables/table';

export const PageTable = observer(() => {
    //get the settings to see if we have any saved layouts
    const { JobStore } = useStores();
    //get the activeJob
    const activeJob = JobStore.jobs[JobStore.activeIndex];

    //then we have the custom row click
    const handleRowClick = (row) => {
        //here we can use the row info to search our pages and then provide further information, such as showing the screenshot in the sidebar
        console.log(row);
    };

    // columns are headers with the accessor, referring to the "key" in the data
    const columns = [
        { Header: 'Page Url', accessor: 'url' },
        { Header: 'Dom Loaded (ms)', accessor: 'dclAverage' },
        { Header: 'Page Complete (ms)', accessor: 'completeAverage' },
        { Header: 'Data Usage (bytes)', accessor: 'dataUsageAverage' },
        { Header: 'Headers (ms)', accessor: 'headerTimingsAverage' },
        { Header: 'Image Load (bytes)', accessor: 'imageLoadAverage' },
        { Header: 'Images', accessor: 'imageRequestsAverage' },
        { Header: 'Video Load (bytes)', accessor: 'mediaLoadAverage' },
        { Header: 'Videos', accessor: 'mediaRequestsAverage' },
        { Header: 'Font Load (bytes)', accessor: 'fontLoadAverage' },
        { Header: 'Fonts', accessor: 'fontRequestsAverage' },
        { Header: 'JS Load (bytes)', accessor: 'scriptLoadAverage' },
        { Header: 'Scripts', accessor: 'scriptRequestsAverage' },
        { Header: 'CSS Load (bytes)', accessor: 'cssLoadAverage' },
        { Header: 'Stylesheets', accessor: 'cssRequestsAverage' },
    ];

    return (
        <div className='internal-grid-content-single-row'>
            <SemanticTable
                headers={columns}
                dataset={activeJob.pageTableData}
                striped={true}
                compact={true}
                sortable={true}
                selectable={true}
                rowClick={handleRowClick}
                mostRecent={true}
            />
        </div>
    );
});
