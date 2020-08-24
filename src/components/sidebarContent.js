import React from 'react';
import { Header } from 'semantic-ui-react';
import { useStores } from './../hooks/useStores';
import { SidebarItem } from './../components/sidebarItem';
import { LoadCustomList } from './../components/settings/sidebar/loadCustomList';
import { SaveCustomList } from './../components/settings/sidebar/saveCustomList';
import { PageDetail } from './../components/results/sidebar/pageDetail';

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
        case 'showPageDetail':
            return (
                <SidebarItem title='Page detail'>
                    {/* this forces the reload of the component so we can have form resets etc. */}
                    {Settings.showSidebar ? <PageDetail /> : null}
                </SidebarItem>
            );
        default:
            return (
                <SidebarItem title='Useful info'>
                    <Header as='h4' content='About us' />
                    <p>
                        This extension was developed in order to test the performance of{' '}
                        <a target='_blank' href='https://turbobrowser.eu/' rel='noopener noreferrer'>
                            Turbo
                        </a>
                        , a Chromium-based browser that offers faster download speeds and lower data usage for desktop
                        and mobile users.
                    </p>
                    <Header as='h4' content='Get in touch' />
                    <p>
                        The project is open source. For any bug reports, questions or other issues, please get in touch
                        with us at our{' '}
                        <a target='_blank' href='https://github.com/tomgallagher/Clocker' rel='noopener noreferrer'>
                            Github
                        </a>{' '}
                        page.
                    </p>
                    <Header as='h4' content='Tips and tricks' />
                    <ul
                        style={{
                            marginBlockStart: '5px',
                            paddingInlineStart: '20px',
                        }}
                    >
                        <li style={{ paddingBottom: '10px' }}>
                            When you start your first test, you will notice a popup at the top of each browser tab,
                            alerting you that Clocker uses the <strong>Remote Debugging Protocol</strong>. If this
                            bothers you, make the following changes:
                            <ul
                                style={{
                                    marginBlockStart: '5px',
                                    paddingInlineStart: '20px',
                                }}
                            >
                                <li>
                                    Windows - Right click on Chrome icon, select Properties, select Shortcut tab, in
                                    Target field add --silent-debugger-extension-api after and <strong>outside</strong>{' '}
                                    the target string.
                                </li>
                                <li>
                                    macOS - open the terminal and paste this path '/Applications/Google\
                                    Chrome.app/Contents/MacOS/Google\ Chrome --silent-debugger-extension-api' then
                                    Enter.
                                </li>
                            </ul>
                        </li>
                        <li style={{ paddingBottom: '10px' }}>
                            The page results table has a master/detail view. Click on any page row to get screenshot,
                            further stats and blocking/error reports in the sidebar.
                        </li>
                        <li style={{ paddingBottom: '10px' }}>
                            Accurate reporting of image load statistics depends upon the testing tab remaining the
                            active viewed tab. Tests can be run with live monitoring of the Results page if image
                            statistics are not the focus of testing.
                        </li>
                    </ul>
                </SidebarItem>
            );
    }
};
