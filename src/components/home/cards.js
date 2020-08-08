import React from 'react';
import { Segment, Header, Grid } from 'semantic-ui-react';

export const Cards = () => {
    return (
        <Segment vertical style={{ paddingTop: '14vh' }} textAlign='center'>
            <Grid container stackable textAlign='center'>
                <Grid.Row>
                    <Grid.Column width={14}>
                        <Header
                            style={{
                                fontFamily: "'PT Serif Caption', serif",
                                fontSize: '3em',
                            }}
                        >
                            Key metric performance analysis
                        </Header>
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row>
                    <Grid.Column width={14}></Grid.Column>
                </Grid.Row>
            </Grid>
        </Segment>
    );
};
