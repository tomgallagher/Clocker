import React from 'react';
import { useStores } from './../../../hooks/useStores';
import { Header, Container, Segment } from 'semantic-ui-react';
import colors from './../../charts/colorPalette.json';
import './loadCustomList.css';

export const LoadCustomList = () => {
    const { Settings } = useStores();

    return (
        <Container fluid textAlign='center' className='loadContainer'>
            <Segment
                style={{
                    backgroundColor: colors.background,
                    borderRadius: '0',
                }}
            >
                <Header
                    as='h5'
                    content='Load custom list into current test pages'
                />
            </Segment>
            <div>More work to do here</div>
        </Container>
    );
};
