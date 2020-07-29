import React from 'react';
import { Container } from 'semantic-ui-react';
import { PageTitle } from './../components/pageTitle.js';
import { PageTable } from './../components/results/pageTable';

export const Results = () => {
    return (
        <>
            <Container text textAlign='center'>
                <PageTitle title='Results' subtitle='View test job results' />
            </Container>
            <Container fluid>
                <PageTable />
            </Container>
        </>
    );
};
