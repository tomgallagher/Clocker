import React from 'react';
import { Segment, Header, Grid, Reveal, Image, Icon } from 'semantic-ui-react';

export const Cards = () => {
    return (
        <Segment vertical style={{ paddingTop: '14vh' }} textAlign='center'>
            <Grid container stackable textAlign='center'>
                <Grid.Row>
                    <Grid.Column width={16}>
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

                <Grid.Row
                    divided
                    verticalAlign='middle'
                    textAlign='center'
                    columns={3}
                >
                    <Grid.Column className='reveal-container'>
                        <Reveal animated='move' instant>
                            <Reveal.Content visible style={{ width: '100%' }}>
                                <div className='reveal-visible-content'>
                                    <Header as='h2' icon>
                                        <Icon name='tasks' />
                                        Customize
                                    </Header>
                                </div>
                            </Reveal.Content>
                            <Reveal.Content hidden style={{ width: '100%' }}>
                                <Image
                                    src='https://react.semantic-ui.com/images/avatar/large/chris.jpg'
                                    size='large'
                                />
                            </Reveal.Content>
                        </Reveal>
                    </Grid.Column>
                    <Grid.Column className='reveal-container'>
                        <Reveal animated='move' instant>
                            <Reveal.Content visible style={{ width: '100%' }}>
                                <div className='reveal-visible-content'>
                                    <Header as='h2' icon>
                                        <Icon name='exchange' />
                                        Monitor
                                    </Header>
                                </div>
                            </Reveal.Content>
                            <Reveal.Content hidden style={{ width: '100%' }}>
                                <Image
                                    src='https://react.semantic-ui.com/images/avatar/large/chris.jpg'
                                    size='large'
                                />
                            </Reveal.Content>
                        </Reveal>
                    </Grid.Column>
                    <Grid.Column className='reveal-container'>
                        <Reveal animated='move' instant>
                            <Reveal.Content visible style={{ width: '100%' }}>
                                <div className='reveal-visible-content'>
                                    <Header as='h2' icon>
                                        <Icon name='file pdf outline' />
                                        Report
                                    </Header>
                                </div>
                            </Reveal.Content>
                            <Reveal.Content hidden style={{ width: '100%' }}>
                                <Image
                                    src='https://react.semantic-ui.com/images/avatar/large/chris.jpg'
                                    size='large'
                                />
                            </Reveal.Content>
                        </Reveal>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Segment>
    );
};
