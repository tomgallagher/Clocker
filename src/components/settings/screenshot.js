import React from 'react';
import { Popup, Statistic } from 'semantic-ui-react';
import { Slider } from 'react-semantic-ui-range';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react';
import { useStores } from './../../hooks/useStores';

export const Screenshot = observer(() => {
    const { Settings } = useStores();
    const levelsMap = new Map();
    levelsMap.set(200, 'very low');
    levelsMap.set(400, 'low');
    levelsMap.set(600, 'medium');
    levelsMap.set(800, 'high');
    levelsMap.set(1000, 'very high');

    const sliderSettings = {
        start: Settings.screenshotWidth,
        min: 200,
        max: 1000,
        step: 200,
        onChange: (value) => {
            runInAction(() => (Settings.screenshotWidth = value));
        },
    };

    return (
        <div className='internal-grid-content-rows'>
            <Popup
                trigger={<Statistic size='mini' value={levelsMap.get(Settings.screenshotWidth)} />}
                basic
                mouseEnterDelay={500}
                size='tiny'
            >
                <Popup.Header>Screenshot Resolution</Popup.Header>
                <Popup.Content>
                    Change state to increase saved screenshot quality level, within confines of browser window size
                </Popup.Content>
            </Popup>

            <Slider value={Settings.screenshotWidth} color='grey' settings={sliderSettings} />
        </div>
    );
});
