import React, { useState } from 'react';
import { Popup, Checkbox, Segment, Header } from 'semantic-ui-react';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react';
import { useStores } from './../../hooks/useStores';

export const WithCache = observer(() => {
    const { Settings } = useStores();
    const [checked, setChecked] = useState(Settings.withCache);
    const handleToggle = () => {
        runInAction(() => (Settings.withCache = !Settings.withCache));
        setChecked(!checked);
    };

    return (
        <div className='internal-grid-content-rows'>
            <Popup
                trigger={
                    <Segment basic textAlign='center'>
                        <Header as='h3'>
                            <Header.Content>
                                {Settings.withCache ? 'Enabled' : 'Disabled'}
                            </Header.Content>
                        </Header>
                    </Segment>
                }
                basic
                mouseEnterDelay={500}
                size='tiny'
            >
                <Popup.Header>Browser Caching</Popup.Header>
                <Popup.Content>
                    Change state to allow browser to cache subresources from
                    test pages
                </Popup.Content>
            </Popup>

            <Segment textAlign='center'>
                <Checkbox toggle onChange={handleToggle} checked={checked} />
            </Segment>
        </div>
    );
});
