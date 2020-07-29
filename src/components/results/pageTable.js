import React from 'react';
import { SemanticTable } from './../../components/tables/table';

import makeData from './../../__test__/makeData';

export const PageTable = () => {
    // columns are headers with the accessor, referring to the "key" in the data
    const columns = [
        { Header: 'Page Url', accessor: 'url' },
        { Header: 'Dom Loaded (ms)', accessor: 'domLoaded' },
        { Header: 'Page Complete (ms)', accessor: 'complete' },
        { Header: 'Data Usage (bytes)', accessor: 'dataUsage' },
        { Header: 'Image Load (Bytes)', accessor: 'imageLoad' },
        { Header: 'Image Resources', accessor: 'imageResources' },
        { Header: 'Video Load (Bytes)', accessor: 'videoLoad' },
        { Header: 'Video Resources', accessor: 'videoResources' },
        { Header: 'Font Load (Bytes)', accessor: 'fontLoad' },
        { Header: 'Font Resources', accessor: 'fontResources' },
        { Header: 'JS Load (Bytes)', accessor: 'javascriptLoad' },
        { Header: 'JS Resources', accessor: 'javascriptResources' },
        { Header: 'CSS Load (Bytes)', accessor: 'cssLoad' },
        { Header: 'CSS Resources', accessor: 'cssResources' },
    ];
    //build our fake data
    const data = makeData(20);

    return (
        <SemanticTable
            headers={columns}
            dataset={data}
            striped={true}
            compact={true}
            sortable={true}
        />
    );
};
