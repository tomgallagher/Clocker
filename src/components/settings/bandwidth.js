import React from 'react';
import { Popup, Statistic } from 'semantic-ui-react';
import { Slider } from 'react-semantic-ui-range';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react';
import { useStores } from './../../hooks/useStores';

export const Bandwidth = observer(() => {
    const { Settings } = useStores();
    const sliderSettings = {
        start: Settings.bandwidth,
        min: 0.5,
        max: 20,
        step: 0.5,
        onChange: (value) => {
            runInAction(() => (Settings.bandwidth = value));
        },
    };

    return (
        <div className='internal-grid-content-rows'>
            <Popup
                trigger={<Statistic label='Mbps' value={Settings.bandwidth} />}
                basic
                mouseEnterDelay={500}
                size='tiny'
            >
                <Popup.Header>Bandwidth Throttling</Popup.Header>
                <Popup.Content>
                    Change state to throttle bandwidth to chosen level, in
                    Megabits per second
                </Popup.Content>
            </Popup>

            <Slider
                value={Settings.bandwidth}
                color='grey'
                settings={sliderSettings}
            />
        </div>
    );
});
