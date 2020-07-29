import React from 'react';
import { Container } from 'semantic-ui-react';
import { PageTitle } from './../components/pageTitle.js';

export const Settings = () => {
    return (
        <>
            <Container text textAlign='center'>
                <PageTitle
                    title='Settings'
                    subtitle='Change test job settings'
                />
            </Container>
            <Container fluid>Grid</Container>
        </>
    );
};
