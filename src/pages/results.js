import React from 'react';
import { Container, Divider } from 'semantic-ui-react';
import { PageTitle } from './../components/pageTitle.js';
import { PageTable } from './../components/results/pageTable';
import { ConsoleList } from './../components/results/consoleList';

export const Results = () => {
    return (
        <>
            <Container text textAlign='center'>
                <PageTitle title='Results' subtitle='View test job results' />
            </Container>
            <Container fluid>
                <PageTable />
                <Divider hidden />
                <ConsoleList />
            </Container>
        </>
    );
};
