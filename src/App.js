import React from 'react';
import { Sidebar, Container, Segment } from 'semantic-ui-react';
import { Switch, Route } from 'react-router-dom';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react';
import { useStores } from './hooks/useStores';
import { Navigation } from './components/navigation';
import { SidebarContent } from './components/sidebarContent';
import { Home } from './pages/home';
import { SettingsPage } from './pages/settings';
import { Results } from './pages/results';
import { History } from './pages/history';

export const App = observer(() => {
    const { Settings } = useStores();
    return (
        <div className='appContainer'>
            <Navigation />

            <Sidebar.Pushable as={Container} fluid className='pageContainer'>
                <Sidebar
                    as={Segment}
                    animation='overlay'
                    onHide={() => runInAction(() => (Settings.showSidebar = false))}
                    vertical
                    direction='right'
                    visible={Settings.showSidebar}
                    width='very wide'
                    style={{ padding: '0px' }}
                >
                    <SidebarContent />
                </Sidebar>

                <Sidebar.Pusher>
                    <Switch>
                        <Route path='/index.html'>
                            <Home />
                        </Route>
                        <Route path='/settings'>
                            <SettingsPage />
                        </Route>
                        <Route path='/results'>
                            <Results />
                        </Route>
                        <Route path='/history'>
                            <History />
                        </Route>
                        <Route path='*'>
                            <Home />
                        </Route>
                    </Switch>
                </Sidebar.Pusher>
            </Sidebar.Pushable>
        </div>
    );
});
