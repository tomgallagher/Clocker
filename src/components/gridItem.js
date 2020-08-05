import React from 'react';
import { Segment, Header } from 'semantic-ui-react';
import colors from './../components/charts/colorPalette.json';

export const GridItem = (props) => {
    return (
        <div className='internal-grid-item'>
            <Segment
                textAlign='center'
                className='draggableHandle'
                style={{
                    backgroundColor: colors.background,
                    borderRadius: '0',
                }}
            >
                <Header as='h4' content={props.header} />
            </Segment>
            <div className='internal-grid-content'>{props.children}</div>
        </div>
    );
};
