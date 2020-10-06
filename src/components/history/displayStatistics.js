import React from 'react';
import { Grid, Header, Card } from 'semantic-ui-react';
import { useStores } from '../../hooks/useStores';
import { observer } from 'mobx-react';
import { linearRegression, linearRegressionLine, rSquared } from 'simple-statistics';
import { PlaceHolder } from '../placeHolder';
import { StatisticsCard } from './../../components/results/statisticsCard';
import { StatisticsTool } from './../../components/results/statisticsTool';

export const DisplayStatistics = observer(() => {
    //get the settings to see if we have any saved layouts
    const { JobStore } = useStores();
    //get the activeJob, if not null, MUST CHECK NOT NULL AS ZERO INDEX POSSIBLE, otherwise the placeholder will do fine
    const displayJob = JobStore.displayIndex !== null ? JobStore.jobs[JobStore.displayIndex] : JobStore.placeholderJob;
    return (
        <div className='internal-grid-content-columns'>
            {/*if display index is not null, then show table, MUST CHECK NOT NULL AS ZERO INDEX POSSIBLE*/}
            {JobStore.displayIndex !== null ? (
                <Grid doubling stackable textAlign='center' columns={3}>
                    <Grid.Column>
                        <Header>Dom Content Loaded Regressions</Header>
                        <Card.Group centered>
                            <StatisticsCard
                                title='Data Usage'
                                slope={linearRegression(displayJob.standardStats.dclDataUsage).m}
                                intersect={linearRegression(displayJob.standardStats.dclDataUsage).b}
                                rsquared={rSquared(
                                    displayJob.standardStats.dclDataUsage,
                                    linearRegressionLine(linearRegression(displayJob.standardStats.dclDataUsage))
                                )}
                            />
                            <StatisticsCard
                                title='Header Timings'
                                slope={linearRegression(displayJob.standardStats.dclHeaderTiming).m}
                                intersect={linearRegression(displayJob.standardStats.dclHeaderTiming).b}
                                rsquared={rSquared(
                                    displayJob.standardStats.dclHeaderTiming,
                                    linearRegressionLine(linearRegression(displayJob.standardStats.dclHeaderTiming))
                                )}
                            />
                            <StatisticsCard
                                title='Total Requests'
                                slope={linearRegression(displayJob.standardStats.dclRequests).m}
                                intersect={linearRegression(displayJob.standardStats.dclRequests).b}
                                rsquared={rSquared(
                                    displayJob.standardStats.dclRequests,
                                    linearRegressionLine(linearRegression(displayJob.standardStats.dclRequests))
                                )}
                            />
                        </Card.Group>
                    </Grid.Column>
                    <Grid.Column>
                        <Header>Page Complete Regressions</Header>
                        <Card.Group centered>
                            <StatisticsCard
                                title='Data Usage'
                                slope={linearRegression(displayJob.standardStats.completeDataUsage).m}
                                intersect={linearRegression(displayJob.standardStats.completeDataUsage).b}
                                rsquared={rSquared(
                                    displayJob.standardStats.completeDataUsage,
                                    linearRegressionLine(linearRegression(displayJob.standardStats.completeDataUsage))
                                )}
                            />
                            <StatisticsCard
                                title='Header Timings'
                                slope={linearRegression(displayJob.standardStats.completeHeaderTiming).m}
                                intersect={linearRegression(displayJob.standardStats.completeHeaderTiming).b}
                                rsquared={rSquared(
                                    displayJob.standardStats.completeHeaderTiming,
                                    linearRegressionLine(
                                        linearRegression(displayJob.standardStats.completeHeaderTiming)
                                    )
                                )}
                            />
                            <StatisticsCard
                                title='Total Requests'
                                slope={linearRegression(displayJob.standardStats.completeDclRequests).m}
                                intersect={linearRegression(displayJob.standardStats.completeDclRequests).b}
                                rsquared={rSquared(
                                    displayJob.standardStats.completeDclRequests,
                                    linearRegressionLine(linearRegression(displayJob.standardStats.completeDclRequests))
                                )}
                            />
                        </Card.Group>
                    </Grid.Column>
                    <Grid.Column>
                        <Header>Statistics Tool</Header>
                        <StatisticsTool />
                    </Grid.Column>
                </Grid>
            ) : (
                <PlaceHolder iconName='arrow up' message='Click on job results to show page statistics' />
            )}
        </div>
    );
});
