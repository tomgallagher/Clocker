import React, { useState } from 'react';
import {
    Segment,
    Header,
    Grid,
    Image,
    Button,
    Divider,
    Message,
} from 'semantic-ui-react';
import { observer } from 'mobx-react';
import { useStores } from './../../hooks/useStores';
import { SendChromeMessage } from './../../utils/chromeFunctions';
import Chromium from './../../images/chromium.webp';
import { toJS } from 'mobx';

export const Banner = observer(() => {
    const { Settings } = useStores();
    const [showMessage, setShowMessage] = useState(false);

    const handleStartClick = () => {
        if (Settings.websites.length) {
            //remove the warning, if present
            setShowMessage(false);
            //then send the message to background
            SendChromeMessage({
                command: 'startTest',
                payload: toJS(Settings),
            });
            //then move to the results page
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
                            Performance analysis of Chromium-based browsers and{' '}
                            <nobr>content-blocking</nobr> extensions.
                        </Header>

                        <Divider hidden></Divider>

                        <Button color='black' onClick={handleStartClick}>
                            Start
                        </Button>

                        {showMessage ? (
                            <Message size='tiny'>
                                Urls must be added to settings
                            </Message>
                        ) : null}
                    </Grid.Column>

                    <Grid.Column width={6} floated='right'>
                        <Image circular bordered size='large' src={Chromium} />
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Segment>
    );
});
