import React, { createContext, useEffect, useRef, useContext } from 'react';
import { VariableSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

import './virtualList.css';

const VirtualListContext = createContext({});

const VirtualListRow = ({ style, index, message }) => {
    const { setSize, windowWidth } = useContext(VirtualListContext);
    const root = useRef(null);

    useEffect(() => {
        setSize(index, root.current.getBoundingClientRect().height);
        console.log(
            `setting height of row ${index} to ${
                root.current.getBoundingClientRect().height
            }`
        );
    }, [index, setSize, windowWidth]);

    return (
        <div
            ref={root}
            className={index % 2 ? 'ListItemOdd' : 'ListItemEven'}
            style={style}
        >
            {message}
        </div>
    );
};

export const VirtualList = ({ listRef, rowData }) => {
    const sizeMap = React.useRef({});
    const setSize = React.useCallback((index, size) => {
        sizeMap.current = { ...sizeMap.current, [index]: size };
    }, []);
    const getSize = React.useCallback(
        (index) => sizeMap.current[index] || 50,
        []
    );
    const windowWidth = window.document.documentElement.clientWidth;

    return (
        /* This is required to make the virtual list autosize interact with flexbox */
        <div className='listContainer'>
            <VirtualListContext.Provider value={{ setSize, windowWidth }}>
                <AutoSizer>
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
                                <VirtualListRow
                                    style={style}
                                    index={index}
                                    message={rowData[index]}
                                />
                            )}
                        </List>
                    )}
                </AutoSizer>
            </VirtualListContext.Provider>
        </div>
    );
};
