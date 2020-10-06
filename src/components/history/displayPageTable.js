import React from 'react';
import { observer } from 'mobx-react';
import { runInAction } from 'mobx';
import { useStores } from '../../hooks/useStores';
import { useBrowser } from '../../hooks/useBrowser';
import { SemanticTable } from '../tables/table';
import { PlaceHolder } from '../placeHolder';

export const DisplayPageTable = observer(() => {
    //get the settings to see if we have any saved layouts
    const { JobStore, Settings } = useStores();
    //get the activeJob, if not null, MUST CHECK NOT NULL AS ZERO INDEX POSSIBLE, otherwise the placeholder will do fine
    const displayJob = JobStore.displayIndex !== null ? JobStore.jobs[JobStore.displayIndex] : JobStore.placeholderJob;
    //then get the data which is a computed function
    const { pageTableData } = displayJob;
    //get the browser details for the csv file name
    const { Browser } = useBrowser();

    console.log(displayJob);

    //then we have the custom row click
    const handleRowClick = (row) => {
        //here we can use the row info to search our pages and then provide further information, such as showing the screenshot in the sidebar
        console.log(row);
        runInAction(() => {
            Settings.pageDisplayIndex = displayJob.pages.findIndex((page) => page.url === row.url);
            Settings.sidebar = 'showPageDetail';
            Settings.showSidebar = true;
        });
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
            {/*if display index is not null, then show table, MUST CHECK NOT NULL AS ZERO INDEX POSSIBLE*/}
            {JobStore.displayIndex !== null ? (
                <SemanticTable
                    headers={columns}
                    dataset={pageTableData}
                    striped={true}
                    compact={true}
                    sortable={true}
                    selectable={true}
                    rowClick={handleRowClick}
                    mostRecent={false}
                    filename={`${Settings.toString}_${Browser.name}_${Browser.os}${Browser.os_version}`}
                />
            ) : (
                <PlaceHolder iconName='arrow up' message='Click on job results to show page table' />
            )}
        </div>
    );
});
