import React, { createContext, useRef, useCallback } from 'react';
import { VariableSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useWindowSize } from './../../hooks/useWindowResize';
import { VirtualListRow } from './virtualListRow';

//import our styling
import './virtualList.css';

//set up the context provider to share the setSize function and changes to window or container width
export const VirtualListContext = createContext({});

//we have an incoming list ref so the parent can control the scrolling of the list
export const VirtualList = ({ listRef, rowData, styleErrorText }) => {
    //we need to keep a memory of the row heights which we keep in a lookup object
    const sizeMap = useRef({});
    //then we have a function that we keep in memory that allows for the updating of the row height
    const setSize = useCallback((index, size) => {
        //spread operator to update object
        sizeMap.current = { ...sizeMap.current, [index]: size };
    }, []);
    //then we have the function to get the size of the row that we pass to the list
    const getSize = useCallback((index) => {
        return sizeMap.current[index] || 50;
    }, []);
    //then we have the custom hook that is listening for changes in window size
    const [windowWidth] = useWindowSize();

    return (
        <VirtualListContext.Provider value={{ setSize, windowWidth }}>
            {/* This is required to make the virtual list autosize interact with flexbox parents */}
            <div className='listContainer'>
                {/* No point in showing the autosized list until we have data */}
                {rowData.length > 0 && (
                    <AutoSizer>
                        {/* Auto-sizer provides height and width */}
                        {({ height, width }) => (
                            <List
                                className='List'
                                height={height}
                                itemCount={rowData.length}
                                itemSize={getSize}
                                width={width}
                                ref={listRef}
                            >
                                {({ index, style }) => (
                                    // react-window work by absolutely positioning the list items (via an inline style), so don't forget to attach it to the DOM element you render!
                                    <div style={style}>
                                        {/* Other styles added at component level */}
                                        <VirtualListRow
                                            index={index}
                                            message={rowData[index]}
                                            styleErrorText={styleErrorText}
                                        />
                                    </div>
                                )}
                            </List>
                        )}
                    </AutoSizer>
                )}
            </div>
        </VirtualListContext.Provider>
    );
};

VirtualList.defaultProps = {
    listRef: null,
    rowData: [],
    styleErrorText: false,
};
