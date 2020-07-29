import React from 'react';
import { Header } from 'semantic-ui-react';

export const PageTitle = (props) => {
    return (
        <Header
            as='h2'
            content={props.title ? props.title : ''}
            dividing
            subheader={props.subtitle ? props.subtitle : ''}
        />
    );
};
