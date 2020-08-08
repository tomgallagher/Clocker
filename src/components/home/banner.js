import React from 'react';
import {
    Segment,
    Header,
    Grid,
    Image,
    Button,
    Divider,
} from 'semantic-ui-react';
import Chromium from './../../images/chromium.webp';

export const Banner = () => {
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

                        <Button color='black'>Start</Button>
                    </Grid.Column>

                    <Grid.Column width={6} floated='right'>
                        <Image circular bordered size='large' src={Chromium} />
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Segment>
    );
};
