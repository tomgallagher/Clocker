import React from 'react';
import { Header, Container, Segment } from 'semantic-ui-react';
import colors from './../components/charts/colorPalette.json';

export const SidebarItem = (props) => {
    return (
        <Container fluid style={{ height: '100%', backgroundColor: '#fff' }}>
            <Segment
                textAlign='center'
                style={{
                    backgroundColor: colors.background,
                    borderRadius: '0',
                }}
            >
                <Header as='h5' content={props.title} />
            </Segment>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    paddingLeft: '10px',
                    paddingRight: '10px',
                    scroll: 'auto',
                }}
            >
                {props.children}
            </div>
        </Container>
    );
};
