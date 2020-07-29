import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { Navigation } from './components/navigation';
import { Home } from './pages/home';
import { Settings } from './pages/settings';
import { Results } from './pages/results';
import { History } from './pages/history';

function App() {
    return (
        <>
            <Navigation />

            <Switch>
                <Route path='/index.html'>
                    <Home />
                </Route>
                <Route path='/settings'>
                    <Settings />
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
        </>
    );
}

export default App;
