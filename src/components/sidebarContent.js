import React from 'react';
import { useStores } from './../hooks/useStores';
import { SidebarItem } from './../components/sidebarItem';
import { LoadCustomList } from './../components/settings/sidebar/loadCustomList';
import { SaveCustomList } from './../components/settings/sidebar/saveCustomList';

export const SidebarContent = () => {
    const { Settings } = useStores();
    switch (Settings.sidebar) {
        case 'loadUrls':
            return (
                <SidebarItem title='Load custom list into current test pages'>
                    {/* this forces the reload of the component so we can have form resets etc. */}
                    {Settings.showSidebar ? <LoadCustomList /> : null}
                </SidebarItem>
            );
        case 'saveUrls':
            return (
                <SidebarItem title='Save current test pages into custom list'>
                    {/* this forces the reload of the component so we can have form resets etc. */}
                    {Settings.showSidebar ? <SaveCustomList /> : null}
                </SidebarItem>
            );
        default:
            return <div>Hello Sidebar With Default</div>;
    }
};
