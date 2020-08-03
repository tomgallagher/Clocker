import React, { createContext, useRef, useCallback } from 'react';
import { VariableSizeGrid as Grid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useWindowSize } from './../../hooks/useWindowResize';
import { VirtualGridCell } from './virtualGridCell';

//import our styling
import './virtualGrid.css';

//set up the context provider to share the setSize function and changes to window or container width
export const VirtualGridContext = createContext({});

export const VirtualGrid = ({ gridRef, rowData }) => {
    //we need to keep a memory of the row heights which we keep in a lookup object
    const sizeMap = useRef({});
    //then we have a function that we keep in memory that allows for the updating of the row height
    const setSize = useCallback((index, size) => {
        //spread operator to update object, if we have no value or the grid row needs to get bigger
        if (!sizeMap.current[index] || size > sizeMap.current[index])
            sizeMap.current = { ...sizeMap.current, [index]: size };
    }, []);
    //then we have the function to get the size of the row that we pass to the list
    const getSize = useCallback((index) => {
        console.log(sizeMap);
        return sizeMap.current[index] || 50;
    }, []);

    //then we have the custom hook that is listening for changes in window size
    const [windowWidth] = useWindowSize();

    const onResize = () => {
        if (gridRef.current != null) {
            gridRef.current.resetAfterIndices({
                columnIndex: 0,
                rowIndex: 0,
            });
        }
    };

    return (
        <VirtualGridContext.Provider value={{ setSize, windowWidth }}>
            {/* This is required to make the virtual list autosize interact with flexbox parents */}
            <div className='gridContainer'>
                {/* No point in showing the autosized list until we have data */}
                {rowData.length > 0 && (
                    <AutoSizer onResize={onResize}>
                        {/* Auto-sizer provides height and width */}
                        {({ height, width }) => (
                            <Grid
                                className='Grid'
                                height={height}
                                width={width}
                                columnCount={rowData[0].length}
                                columnWidth={(index) =>
                                    Math.floor(width / rowData[0].length)
                                }
                                rowCount={rowData.length}
                                rowHeight={getSize}
                                itemData={rowData}
                                ref={gridRef}
                                onScroll={onResize}
                            >
                                {({ columnIndex, data, rowIndex, style }) => (
                                    // react-window work by absolutely positioning the list items (via an inline style), so don't forget to attach it to the DOM element you render!
                                    <div
                                        style={style}
                                        className={
                                            rowIndex % 2
                                                ? 'GridItemOdd'
                                                : 'GridItemEven'
                                        }
                                    >
                                        {/* Other styles added at component level */}
                                        <VirtualGridCell
                                            columnIndex={columnIndex}
                                            data={data}
                                            rowIndex={rowIndex}
                                        />
                                    </div>
                                )}
                            </Grid>
                        )}
                    </AutoSizer>
                )}
            </div>
        </VirtualGridContext.Provider>
    );
};
