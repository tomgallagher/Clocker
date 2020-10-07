import { useEffect } from 'react';

//useful for checking unecessary renders
export const useMountReport = ({ name, props = {} }) => {
    useEffect(() => {
        console.log(`${name} component mounted`, Object.keys(props).length ? JSON.stringify(props) : '');
        return () => console.log(`${name} component unmounted`);
    });
};
