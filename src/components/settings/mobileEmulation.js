import React from 'react';
import { observer } from 'mobx-react';
import { useStores } from './../../hooks/useStores';

export const MobileEmulation = observer(() => {
    const { Settings } = useStores();

    return (
        <div className='internal-grid-content-rows'>
            TO DO: Mobile Emulation
        </div>
    );
});
