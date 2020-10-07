import { useState, useEffect } from 'react';

//useful for checking unecessary renders
export const useMountStatus = ({ name, props = {} }) => {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        console.log(`${name} component mounted`, Object.keys(props).length ? JSON.stringify(props) : '');
        setIsMounted(true);
        return () => {
            console.log(`${name} component unmounted`);
            setIsMounted(false);
        };
        // eslint-disable-next-line
    }, []);
    return isMounted;
};
