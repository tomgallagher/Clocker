import React from 'react';
import { Card } from 'semantic-ui-react';

export const StatisticsCard = ({ title, slope, intersect, rsquared, centered = false }) => {
    return (
        <Card centered={centered}>
            <Card.Content>
                <Card.Header>{title}</Card.Header>
                <Card.Meta>Slope : {slope}</Card.Meta>
                <Card.Meta>Intersect : {intersect}</Card.Meta>
                <Card.Meta>
                    R<sup>2</sup> : {rsquared}
                </Card.Meta>
            </Card.Content>
        </Card>
    );
};
