import React from 'react';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react';
import { Button } from 'semantic-ui-react';
import { useStores } from './../../hooks/useStores';
import { SendChromeMessage } from './../../utils/chromeFunctions';

export const ActionButtons = observer(() => {
    //get the settings so we can update paused state
    const { JobStore, Settings } = useStores();
    //handle the button clicks
    const handleButtonClick = (_, { name }) => {
        switch (name) {
            case 'Pause':
                SendChromeMessage({ command: 'pauseTest' });
                runInAction(() => (Settings.isPaused = true));
                break;
            case 'Resume':
                SendChromeMessage({ command: 'resumeTest' });
                runInAction(() => (Settings.isPaused = false));
                break;
            case 'Abort':
                //first we send the message to abort the test, which should then fire null into the mobx listener streams
                SendChromeMessage({ command: 'abortTest' });
                //then we need to reset the listeners after a short delay so we can get the abort message
                setTimeout(() => runInAction(() => JobStore.resetListeners()), 100);
                break;
            default:
        }
    };

    return (
        <Button.Group floated='right' size='mini' style={{ marginRight: '10px' }}>
            <Button name='Pause' color='black' onClick={handleButtonClick}>
                Pause
            </Button>
            <Button.Or />
            <Button name='Resume' color='black' positive={Settings.isPaused} onClick={handleButtonClick}>
                Resume
            </Button>
            <Button.Or />
            <Button name='Abort' negative onClick={handleButtonClick}>
                Abort
            </Button>
        </Button.Group>
    );
});
