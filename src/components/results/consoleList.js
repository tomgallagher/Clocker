import React, { useEffect, useRef } from 'react';
import { observer } from 'mobx-react';
import { useStores } from './../../hooks/useStores';
import { VirtualList } from './../lists/virtualList';

export const ConsoleList = observer(() => {
    //get the settings to see if we have any saved layouts
    const { JobStore } = useStores();
    //get the activeJob
    const activeJob = JobStore.jobs.length
        ? JobStore.jobs[JobStore.activeIndex]
        : JobStore.placeholderJob;
    //we need a reference to the child list component so we can scroll
    const listRef = useRef(null);
    //then we need to scroll to the bottom of the list each time it comes in
    useEffect(() => {
        if (listRef.current) {
            //VariableSizeList caches offsets and measurements for each index for performance purposes.
            //This method clears that cached data for all items after (and including) the specified index.
            //It should be called whenever a item's size changes.
            listRef.current.resetAfterIndex(0);
            // You can programatically scroll to a item within a List.
            listRef.current.scrollToItem(
                activeJob.consoleMessages.length - 1,
                'end'
            );
        }
        //it is the properties of the observed item that are observable, so we have to monitor length rather than console messages object
    }, [activeJob.consoleMessages.length]);

    return (
        <div className='internal-grid-content-single-row'>
            <VirtualList
                listRef={listRef}
                rowData={activeJob.consoleMessages}
            />
        </div>
    );
});
