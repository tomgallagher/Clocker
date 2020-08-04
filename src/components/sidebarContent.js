import React from 'react';
import { useStores } from './../hooks/useStores';
import { LoadCustomList } from './../components/settings/sidebar/loadCustomList';
import { SaveCustomList } from './../components/settings/sidebar/saveCustomList';

export const SidebarContent = () => {
    const { Settings } = useStores();
    switch (Settings.sidebar) {
        case 'loadUrls':
            return <LoadCustomList />;
        case 'saveUrls':
            return <SaveCustomList />;
        default:
            return <div>Hello Sidebar With Default</div>;
    }
};
