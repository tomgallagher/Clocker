import React from 'react';
import { Header, Image, Statistic } from 'semantic-ui-react';
import { observer } from 'mobx-react';
import { Bar } from 'react-chartjs-2';
import { useStores } from '../../../hooks/useStores';
import ColorPalette from './../../charts/colorPalette.json';
import { ErrorReport } from './errorReport';

export const PageDetail = observer(() => {
    const { JobStore, Settings } = useStores();
    //get the activeJob
    const activeJob = JobStore.jobs.length ? JobStore.jobs[JobStore.activeIndex] : JobStore.placeholderJob;
    //get the active page
    const activePage = activeJob.pages.length ? activeJob.pages[Settings.activePageIndex] : JobStore.placeholderPage;
    const data = {
        labels: ['HTML', 'XHR', 'Fetch', 'Websocket'],
        datasets: [
            {
                label: 'Resource load (bytes)',
                backgroundColor: ColorPalette.stormysky,
                yAxisID: 'y-axis-1',
                data: [
                    activePage.minorResources.htmlLoadAverage,
                    activePage.minorResources.xhrLoadAverage,
                    activePage.minorResources.fetchLoadAverage,
                    activePage.minorResources.websocketLoadAverage,
                ],
            },
            {
                label: 'Requests',
                backgroundColor: ColorPalette.eggshell,
                yAxisID: 'y-axis-2',
                data: [
                    activePage.minorResources.htmlRequestsAverage,
                    activePage.minorResources.xhrRequestsAverage,
                    activePage.minorResources.fetchRequestsAverage,
                    activePage.minorResources.websocketRequestsAverage,
                ],
            },
        ],
    };

    return (
        <>
            <Header as='h4' content={activePage.url} />
            <Image fluid src={activePage.screenshot} />
            <Header as='h4' content='Minor resources' />
            <Bar
                data={data}
                options={{
                    responsive: true,
                    tooltips: {
                        mode: 'index',
                        intersect: true,
                    },
                    scales: {
                        yAxes: [
                            {
                                type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                                display: true,
                                position: 'left',
                                id: 'y-axis-1',
                            },
                            {
                                type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                                display: true,
                                position: 'right',
                                id: 'y-axis-2',
                                gridLines: {
                                    drawOnChartArea: false,
                                },
                                ticks: {
                                    precision: 0,
                                },
                            },
                        ],
                    },
                    animation: {
                        animateScale: true,
                    },
                }}
            />
            <Header as='h4' content='Blocked resources / errors' />
            <Statistic label='blocked / errors' value={activePage.minorResources.errorCount} />
            {activePage.minorResources.errorCount > 0 ? (
                <ErrorReport errorArray={activePage.minorResources.errorArray} />
            ) : null}
        </>
    );
});
