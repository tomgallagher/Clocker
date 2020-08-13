import React, { useState } from 'react';
import { Menu } from 'semantic-ui-react';
import { runInAction } from 'mobx';
import { useHistory } from 'react-router-dom';
import { useStores } from './../hooks/useStores';

export const Navigation = () => {
    const { Settings } = useStores();
    const [active, setActive] = useState('home');

    let history = useHistory();

    const showDefaultSidebar = () => {
        runInAction(() => {
            Settings.sidebar = '';
            Settings.showSidebar = true;
        });
    };

    const handleItemClick = (e, { name }) => {
        setActive(name);
        history.push(`/${name}`);
    };

    return (
        <Menu stackable>
            <Menu.Item onClick={showDefaultSidebar}>
                <img src='/logo48.png' alt='logo' />
            </Menu.Item>

            <Menu.Item
                name='index.html'
                active={active === 'index.html'}
                onClick={handleItemClick}
            >
                Home
            </Menu.Item>

            <Menu.Item
                name='settings'
                active={active === 'settings'}
                onClick={handleItemClick}
            >
                Settings
            </Menu.Item>

            <Menu.Item
                name='results'
                active={active === 'results'}
                onClick={handleItemClick}
            >
                Results
            </Menu.Item>

            <Menu.Item
                name='history'
                active={active === 'history'}
                onClick={handleItemClick}
            >
                History
            </Menu.Item>
        </Menu>
    );
};
