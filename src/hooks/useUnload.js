import { useRef, useEffect } from 'react';

export const useUnload = (fn) => {
    //the custom hook useUnload receives a function (fn) and assigns it to the current ref.
    const cb = useRef(fn);
    //then we call useEffect so the event handler is added
    useEffect(() => {
        //get a reference to the current callback
        const onUnload = cb.current;
        //add the event listener with the callback
        window.addEventListener('beforeunload', onUnload);
        //then returns a cleanup function to remove the event handler, when the component is removed.
        return () => window.removeEventListener('beforeunload', onUnload);
    }, [cb]);
};
