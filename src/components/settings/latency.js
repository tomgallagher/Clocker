import React from 'react';
import { Popup, Statistic } from 'semantic-ui-react';
import { Slider } from 'react-semantic-ui-range';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react';
import { useStores } from './../../hooks/useStores';

export const Latency = observer(() => {
    const { Settings } = useStores();
    const sliderSettings = {
        start: Settings.latency,
        min: 0,
        max: 300,
        step: 10,
        onChange: (value) => {
            runInAction(() => (Settings.bandwidth = value));
        },
    };

    return (
        <div className='internal-grid-content-rows'>
            <Popup
                trigger={<Statistic label='ms' value={Settings.latency} />}
                basic
                mouseEnterDelay={500}
                size='tiny'
            >
                <Popup.Header>Latency Throttling</Popup.Header>
                <Popup.Content>
                    Change state to add additional latency into all resource
                    request, in milliseconds
                </Popup.Content>
            </Popup>

            <Slider
                value={Settings.latency}
                color='grey'
                settings={sliderSettings}
            />
        </div>
    );
});
