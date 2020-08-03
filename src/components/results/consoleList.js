import React, { useState, useEffect, useRef } from 'react';
import randomSentence from 'random-sentence';
import { useInterval } from './../../hooks/useInterval';
import { VirtualList } from './../lists/virtualList';

export const ConsoleList = () => {
    //we need a reference to the child list component so we can scroll
    const listRef = useRef(null);
    //for dev purposes we need to generate and save some data in state, in the end we will observe the console list in the store
    const [messages, setMessages] = useState([]);
    useEffect(() => {
        if (listRef.current) {
            //VariableSizeList caches offsets and measurements for each index for performance purposes.
            //This method clears that cached data for all items after (and including) the specified index.
            //It should be called whenever a item's size changes.
            listRef.current.resetAfterIndex(0);
            // You can programatically scroll to a item within a List.
            listRef.current.scrollToItem(messages.length - 1, 'end');
        }
    }, [messages]);
    //add a new message every second
    useInterval(() => {
        //generate the new console message
        const text = randomSentence(500, 1500);
        //then update the message array
        setMessages([...messages, text]);
    }, 2000);

    return <VirtualList listRef={listRef} rowData={messages} />;
};
