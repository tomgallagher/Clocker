import React, { useLayoutEffect, useRef, useContext, memo } from 'react';
import { VirtualGridContext } from './virtualGrid';

//we use react memo in case the items passed to the list row as message are complex html
export const VirtualGridCell = memo(({ columnIndex, data, rowIndex }) => {
    //here we use context to be set the size of the row and also so we can listen to changes on the window and any other size changes
    const { setSize, windowWidth } = useContext(VirtualGridContext);
    //simple ref so we can imperatively get hold of height in hook
    const root = useRef();
    //use layout effect This runs synchronously immediately after React has performed all DOM mutations. This can be useful if you need to make DOM measurements
    useLayoutEffect(() => {
        //then we use the context function to pass the row size to the parent list
        setSize(rowIndex, root.current.getBoundingClientRect().height);
        //any changes in windowWidth or the container width may require a repaint
    }, [columnIndex, rowIndex, setSize, windowWidth]);
    // Access the data source using the "data" prop:
    const item = data[rowIndex][columnIndex];

    return (
        <div ref={root} className='GridItem'>
            {item}
        </div>
    );
});
