import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Menu } from 'semantic-ui-react';

export const Navigation = () => {
    const [active, setActive] = useState('home');
    let history = useHistory();

    const handleItemClick = (e, { name }) => {
        setActive(name);
        history.push(`/${name}`);
    };

    return (
        <Menu stackable>
            <Menu.Item>
                <img src='/logo48.png' alt='logo' />
            </Menu.Item>

            <Menu.Item
                name='home'
                active={active === 'home'}
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
