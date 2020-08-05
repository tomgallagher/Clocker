import React from 'react';
import { Popup, Statistic } from 'semantic-ui-react';
import { Slider } from 'react-semantic-ui-range';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react';
import { useStores } from './../../hooks/useStores';

export const PageIterations = observer(() => {
    const { Settings } = useStores();
    const sliderSettings = {
        start: Settings.pageIterations,
        min: 1,
        max: 5,
        step: 1,
        onChange: (value) => {
            runInAction(() => (Settings.pageIterations = value));
        },
    };

    return (
        <div className='internal-grid-content-rows'>
            <Popup
                trigger={
                    <Statistic
                        label={
                            Settings.pageIterations > 1
                                ? 'Iterations'
                                : 'Iteration'
                        }
                        value={Settings.pageIterations}
                    />
                }
                basic
                mouseEnterDelay={500}
                size='tiny'
            >
                <Popup.Header>Page Iterations</Popup.Header>
                <Popup.Content>
                    Change state to make multiple visits per page, to average
                    out temporary network blips from results.
                </Popup.Content>
            </Popup>

            <Slider
                value={Settings.pageIterations}
                color='grey'
                settings={sliderSettings}
            />
        </div>
    );
});
