import React from 'react';
import { observer } from 'mobx-react';
import { runInAction } from 'mobx';
import { useStores } from '../../hooks/useStores';
import { useBrowser } from '../../hooks/useBrowser';
import { SemanticTable } from '../tables/table';
import { PlaceHolder } from '../placeHolder';

export const DisplayMetricsTable = observer(() => {
    //get the settings to see if we have any saved layouts
    const { JobStore, Settings } = useStores();
    //get the activeJob, if not null, MUST CHECK NOT NULL AS ZERO INDEX POSSIBLE, otherwise the placeholder will do fine
    const displayJob = JobStore.displayIndex !== null ? JobStore.jobs[JobStore.displayIndex] : JobStore.placeholderJob;
    //get the browser details for the csv file name
    const { Browser } = useBrowser();

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
        { Header: 'Documents', accessor: 'metricsDocumentsAverage' },
        { Header: 'Resources', accessor: 'metricsResourcesAverage' },
        { Header: 'Frames', accessor: 'metricsFramesAverage' },
        { Header: 'Advertising Frames', accessor: 'metricsAdvertisingFramesAverage' },
        { Header: 'Used Memory (bytes)', accessor: 'metricsUsedHeapAverage' },
        { Header: 'Total Memory (bytes)', accessor: 'metricsTotalHeapAverage' },
    ];

    return (
        <div className='internal-grid-content-single-row'>
            {/*if display index is not null, then show table, MUST CHECK NOT NULL AS ZERO INDEX POSSIBLE*/}
            {JobStore.displayIndex !== null ? (
                <SemanticTable
                    headers={columns}
                    dataset={displayJob.pageMetricsTableData}
                    striped={true}
                    compact={true}
                    sortable={true}
                    selectable={true}
                    rowClick={handleRowClick}
                    mostRecent={true}
                    filename={`${Settings.toString}_${Browser.name}_${Browser.os}${Browser.os_version}`}
                />
            ) : (
                <PlaceHolder iconName='arrow up' message='Click on job results to show page data' />
            )}
        </div>
    );
});
