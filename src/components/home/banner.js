import React, { useState } from 'react';
import { Segment, Header, Grid, Image, Button, Divider, Message } from 'semantic-ui-react';
import { useHistory } from 'react-router-dom';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { useStores } from './../../hooks/useStores';
import { useMountReport } from './../../hooks/useMountReport';
import Chromium from './../../images/chromium.webp';

export const Banner = observer(() => {
    useMountReport({ name: 'Banner' });
    const { JobStore, Settings } = useStores();
    const [showMessage, setShowMessage] = useState(false);
    let history = useHistory();

    const handleStartClick = () => {
        if (Settings.websites.length) {
            //remove the warning, if present
            setShowMessage(false);
            //get the settings info we care about as partial
            //we freeze the settings as a JS object so we can save it into local storage
            const {
                pageDisplayIndex,
                customUrlLists,
                isPaused,
                sidebar,
                showSidebar,
                themeBackground,
                settingsLayouts,
                resultsLayouts,
                historyLayouts,
                ...partialSettings
            } = toJS(Settings);
            //then create the job, which then sends a message to background.js that starts the process
            JobStore.createJob({ settings: partialSettings });
            //then move to the results page
            history.push('/results');
        } else {
            setShowMessage(true);
        }
    };

    return (
        <Segment vertical style={{ padding: '4em 0em' }}>
            <Grid container stackable textAlign='center'>
                <Grid.Row>
                    <Grid.Column width={8} textAlign='left'>
                        <Header
                            style={{
                                fontFamily: "'PT Serif Caption', serif",
                                fontSize: '4em',
                            }}
                        >
                            Start. Clock. Results.
                        </Header>

                        <Header as='h3'>
                            Performance analysis of Chromium-based browsers and <nobr>content-blocking</nobr>{' '}
                            extensions.
                        </Header>

                        <Divider hidden></Divider>

                        <Grid stackable textAlign='left'>
                            <Grid.Row>
                                <Grid.Column width={4}>
                                    <Button color='black' onClick={handleStartClick}>
                                        Start
                                    </Button>
                                </Grid.Column>
                                <Grid.Column width={8}>
                                    {showMessage ? (
                                        <Message size='tiny'>Test websites must be added to settings</Message>
                                    ) : null}
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </Grid.Column>

                    <Grid.Column width={6} floated='right'>
                        <Image circular bordered size='large' src={Chromium} />
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Segment>
    );
});
