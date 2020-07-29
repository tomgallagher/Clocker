import React from 'react';
import { Container } from 'semantic-ui-react';
import { PageTitle } from './../components/pageTitle.js';

export const History = () => {
    return (
        <>
            <Container text textAlign='center'>
                <PageTitle title='History' subtitle='View test job results' />
            </Container>
            <Container fluid>Grid</Container>
        </>
    );
};
