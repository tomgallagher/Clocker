import React from 'react';
import { useStores } from './../../../hooks/useStores';
import { Header, Container, Segment } from 'semantic-ui-react';

import './saveCustomList.css';

export const SaveCustomList = () => {
    const { Settings } = useStores();

    return (
        <Container fluid textAlign='center' className='saveContainer'>
            <Segment style={{ backgroundColor: 'rgba(0,0,50,.02)' }}>
                <Header
                    as='h5'
                    content='Save current test pages to custom list'
                />
            </Segment>

            <div>More work to do here</div>
        </Container>
    );
};
