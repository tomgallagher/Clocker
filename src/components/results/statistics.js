import React from 'react';
import { Grid, Header, Card } from 'semantic-ui-react';
import { useStores } from '../../hooks/useStores';
import { observer } from 'mobx-react';
import { linearRegression, linearRegressionLine, rSquared } from 'simple-statistics';
import { StatisticsCard } from './statisticsCard';
import { StatisticsTool } from './statisticsTool';

export const Statistics = observer(() => {
    //get the settings to see if we have any saved layouts
    const { JobStore } = useStores();
    //get the activeJob, if length, otherwise the placeholder will do fine
    const activeJob = JobStore.jobs.length ? JobStore.jobs[JobStore.activeIndex] : JobStore.placeholderJob;
    return (
        <div className='internal-grid-content-columns'>
            <Grid doubling stackable textAlign='center' columns={3}>
                <Grid.Column>
                    <Header>Dom Content Loaded Regressions</Header>
                    <Card.Group centered>
                        <StatisticsCard
                            title='Data Usage'
                            slope={linearRegression(activeJob.standardStats.dclDataUsage).m}
                            intersect={linearRegression(activeJob.standardStats.dclDataUsage).b}
                            rsquared={rSquared(
                                activeJob.standardStats.dclDataUsage,
                                linearRegressionLine(linearRegression(activeJob.standardStats.dclDataUsage))
                            )}
                        />
                        <StatisticsCard
                            title='Header Timings'
                            slope={linearRegression(activeJob.standardStats.dclHeaderTiming).m}
                            intersect={linearRegression(activeJob.standardStats.dclHeaderTiming).b}
                            rsquared={rSquared(
                                activeJob.standardStats.dclHeaderTiming,
                                linearRegressionLine(linearRegression(activeJob.standardStats.dclHeaderTiming))
                            )}
                        />
                        <StatisticsCard
                            title='Total Requests'
                            slope={linearRegression(activeJob.standardStats.dclRequests).m}
                            intersect={linearRegression(activeJob.standardStats.dclRequests).b}
                            rsquared={rSquared(
                                activeJob.standardStats.dclRequests,
                                linearRegressionLine(linearRegression(activeJob.standardStats.dclRequests))
                            )}
                        />
                    </Card.Group>
                </Grid.Column>
                <Grid.Column>
                    <Header>Page Complete Regressions</Header>
                    <Card.Group centered>
                        <StatisticsCard
                            title='Data Usage'
                            slope={linearRegression(activeJob.standardStats.completeDataUsage).m}
                            intersect={linearRegression(activeJob.standardStats.completeDataUsage).b}
                            rsquared={rSquared(
                                activeJob.standardStats.completeDataUsage,
                                linearRegressionLine(linearRegression(activeJob.standardStats.completeDataUsage))
                            )}
                        />
                        <StatisticsCard
                            title='Header Timings'
                            slope={linearRegression(activeJob.standardStats.completeHeaderTiming).m}
                            intersect={linearRegression(activeJob.standardStats.completeHeaderTiming).b}
                            rsquared={rSquared(
                                activeJob.standardStats.completeHeaderTiming,
                                linearRegressionLine(linearRegression(activeJob.standardStats.completeHeaderTiming))
                            )}
                        />
                        <StatisticsCard
                            title='Total Requests'
                            slope={linearRegression(activeJob.standardStats.completeDclRequests).m}
                            intersect={linearRegression(activeJob.standardStats.completeDclRequests).b}
                            rsquared={rSquared(
                                activeJob.standardStats.completeDclRequests,
                                linearRegressionLine(linearRegression(activeJob.standardStats.completeDclRequests))
                            )}
                        />
                    </Card.Group>
                </Grid.Column>
                <Grid.Column>
                    <Header>Statistics Tool</Header>
                    <StatisticsTool />
                </Grid.Column>
            </Grid>
        </div>
    );
});
