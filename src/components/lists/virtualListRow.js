import React, { useLayoutEffect, useRef, useContext, memo } from 'react';
import { areEqual } from 'react-window';
import { VirtualListContext } from './virtualList';

//we use react memo in case the items passed to the list row as message are complex html
export const VirtualListRow = memo(({ index, message, styleErrorText }) => {
    //here we use context to be set the size of the row and also so we can listen to changes on the window and any other size changes
    const { setSize, windowWidth } = useContext(VirtualListContext);
    //simple ref so we can imperatively get hold of height in hook
    const root = useRef();
    //use layout effect This runs synchronously immediately after React has performed all DOM mutations. This can be useful if you need to make DOM measurements
    useLayoutEffect(() => {
        //then we use the context function to pass the row size to the parent list
        setSize(index, root.current.getBoundingClientRect().height);
        //any changes in windowWidth or the container width may require a repaint
    }, [index, setSize, windowWidth]);

    return (
        <div
            ref={root}
            className={index % 2 ? 'ListItemOdd' : 'ListItemEven'}
            style={{
                color:
                    styleErrorText && message.includes('Error')
                        ? '#d02712'
                        : 'unset',
            }}
            //we use dangerously set html because we know where the message is coming from and we can then include links and styling in lists
            dangerouslySetInnerHTML={{ __html: message }}
        />
    );
    //Custom comparison function for React.memo.
}, areEqual);
