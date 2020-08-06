import React from 'react';
import { observer } from 'mobx-react';
import { useStores } from './../../hooks/useStores';
import { SemanticTable } from './../../components/tables/table';

export const PageTable = observer(() => {
    //get the settings to see if we have any saved layouts
    const { JobStore } = useStores();
    //get the activeJob
    const activeJob = JobStore.jobs[JobStore.activeIndex];

    // columns are headers with the accessor, referring to the "key" in the data
    const columns = [
        { Header: 'Page Url', accessor: 'url' },
        { Header: 'Dom Loaded (ms)', accessor: 'dclAverage' },
        { Header: 'Page Complete (ms)', accessor: 'completeAverage' },
        { Header: 'Data Usage (bytes)', accessor: 'dataUsageAverage' },
        { Header: 'Headers (ms)', accessor: 'headerTimingsAverage' },
        { Header: 'Image Load (bytes)', accessor: 'imageLoadAverage' },
        { Header: 'Image Resources', accessor: 'imageRequestsAverage' },
        { Header: 'Video Load (bytes)', accessor: 'mediaLoadAverage' },
        { Header: 'Video Resources', accessor: 'mediaRequestsAverage' },
        { Header: 'Font Load (bytes)', accessor: 'fontLoadAverage' },
        { Header: 'Font Resources', accessor: 'fontRequestsAverage' },
        { Header: 'JS Load (bytes)', accessor: 'scriptLoadAverage' },
        { Header: 'JS Resources', accessor: 'scriptRequestsAverage' },
        { Header: 'CSS Load (bytes)', accessor: 'cssLoadAverage' },
        { Header: 'CSS Resources', accessor: 'cssRequestsAverage' },
    ];

    return (
        <div className='internal-grid-content-single-row'>
            <SemanticTable
                headers={columns}
                dataset={activeJob.pages}
                striped={true}
                compact={true}
                sortable={true}
            />
        </div>
    );
});
