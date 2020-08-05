import React from 'react';
import { Container } from 'semantic-ui-react';
import { PageTitle } from './../components/pageTitle.js';

export const Home = () => {
    return (
        <>
            <Container text textAlign='center'>
                <PageTitle
                    title='Clocker'
                    subtitle='Start browser tests'
                    dividing={true}
                />
            </Container>
            <Container fluid>grid</Container>
        </>
    );
};
