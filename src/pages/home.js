import React from 'react';
import { Container } from 'semantic-ui-react';
import { PageTitle } from './../components/pageTitle.js';

export const Home = () => {
    return (
        <>
            <Container text textAlign='center'>
                <PageTitle
                    title='Browser Tester'
                    subtitle='Start browser tests'
                />
            </Container>
            <Container fluid>grid</Container>
        </>
    );
};
