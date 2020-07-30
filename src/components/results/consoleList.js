import React, { useState, useRef } from 'react';
import randomSentence from 'random-sentence';
import { useInterval } from './../../hooks/useInterval';
import { VirtualList } from './../lists/virtualList';

export const ConsoleList = () => {
    //we need a reference to the child list component so we can scroll
    const listRef = useRef(null);
    //for dev purposes we need to generate and save some data in state, in the end we will observe the console list in the store
    const [messages, setMessages] = useState([]);
    //add a new message every second
    useInterval(() => {
        //generate the new console message
        const text = randomSentence(500, 1500);
        //then update the message array
        setMessages([...messages, text]);
        //then scroll to the bottom of the list, if we have a reference
        if (listRef.current) {
            setTimeout(() => {
                listRef.current.scrollToItem(messages.length, 'end');
            }, 100);
        }
    }, 2000);

    return <VirtualList listRef={listRef} rowData={messages}></VirtualList>;
};
