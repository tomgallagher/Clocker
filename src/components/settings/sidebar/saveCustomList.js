import React from 'react';
import { useStores } from './../../../hooks/useStores';
import { Header, Container, Segment } from 'semantic-ui-react';
import colors from './../../charts/colorPalette.json';
import './saveCustomList.css';

export const SaveCustomList = () => {
    const { Settings } = useStores();

    return (
        <Container fluid textAlign='center' className='saveContainer'>
            <Segment
                style={{
                    backgroundColor: colors.background,
                    borderRadius: '0',
                }}
            >
                <Header
                    as='h5'
                    content='Save current test pages to custom list'
                />
            </Segment>

            <div>More work to do here</div>
        </Container>
    );
};
