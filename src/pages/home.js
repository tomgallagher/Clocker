import React from 'react';
import { Container } from 'semantic-ui-react';
import { Banner } from './../components/home/banner';
import { Cards } from './../components/home/cards';
import ColorPalette from './../components/charts/colorPalette.json';

export const Home = () => {
    return (
        <Container fluid>
            <div
                className='themeWrapper'
                style={{ backgroundColor: ColorPalette.background }}
            >
                <Banner />
            </div>
            <Cards />
        </Container>
    );
};
