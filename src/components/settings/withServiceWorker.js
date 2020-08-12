import React, { useState } from 'react';
import { Popup, Checkbox, Segment, Header } from 'semantic-ui-react';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react';
import { useStores } from './../../hooks/useStores';

export const WithServiceWorker = observer(() => {
    const { Settings } = useStores();
    const [checked, setChecked] = useState(Settings.withServiceWorker);
    const handleToggle = () => {
        runInAction(
            () => (Settings.withServiceWorker = !Settings.withServiceWorker)
        );
        setChecked(!checked);
    };

    return (
        <div className='internal-grid-content-rows'>
            <Popup
                trigger={
                    <Segment basic textAlign='center'>
                        <Header as='h3'>
                            <Header.Content>
                                {Settings.withServiceWorker
                                    ? 'Allowed'
                                    : 'Disallowed'}
                            </Header.Content>
                        </Header>
                    </Segment>
                }
                basic
                mouseEnterDelay={500}
                size='tiny'
            >
                <Popup.Header>Service Workers</Popup.Header>
                <Popup.Content>
                    Change state to allow browser to run service workers on test
                    pages
                </Popup.Content>
            </Popup>

            <Segment textAlign='center'>
                <Checkbox toggle onChange={handleToggle} checked={checked} />
            </Segment>
        </div>
    );
});
