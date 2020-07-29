import React from 'react';
import { Segment, Header, Icon } from 'semantic-ui-react';

export const PlaceHolder = (props) => {
    //any element that may find itself inside our carousel component needs to be able to accept customStyle prop
    const newStyle = { ...props.customStyle, height: '100%' };

    return (
        <Segment placeholder style={newStyle}>
            <Header icon>
                <Icon
                    name={props.iconName}
                    style={{ color: props.iconColour }}
                />
                {props.message}
            </Header>
        </Segment>
    );
};

PlaceHolder.defaultProps = {
    //choose your icon
    iconName: 'ban',
    //choose your icon color
    iconColour: 'black',
    //as {elementType} An element type to render as (string or function).
    message: 'Oops. Nothing to see here',
    //any element that may find itself inside our carousel component needs to be able to accept customStyle prop
    customStyle: {},
};
