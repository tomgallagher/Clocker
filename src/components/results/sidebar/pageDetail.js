import React from 'react';
import { Header, Image, Statistic } from 'semantic-ui-react';
import { observer } from 'mobx-react';
import { Bar } from 'react-chartjs-2';
import { useStores } from '../../../hooks/useStores';
import ColorPalette from './../../charts/colorPalette.json';
import { ErrorReport } from './errorReport';

export const PageDetail = observer(() => {
    const { JobStore, Settings } = useStores();
    const page = JobStore.jobs[JobStore.activeIndex].pages[Settings.activePageIndex];
    const data = {
        labels: ['HTML', 'XHR', 'Fetch', 'Websocket'],
        datasets: [
            {
                label: 'Resource load (bytes)',
                backgroundColor: ColorPalette.stormysky,
                yAxisID: 'y-axis-1',
                data: [
                    page.minorResources.htmlLoadAverage,
                    page.minorResources.xhrLoadAverage,
                    page.minorResources.fetchLoadAverage,
                    page.minorResources.websocketLoadAverage,
                ],
            },
            {
                label: 'Requests',
                backgroundColor: ColorPalette.eggshell,
                yAxisID: 'y-axis-2',
                data: [
                    page.minorResources.htmlRequestsAverage,
                    page.minorResources.xhrRequestsAverage,
                    page.minorResources.fetchRequestsAverage,
                    page.minorResources.websocketRequestsAverage,
                ],
            },
        ],
    };

    return (
        <>
            <Header as='h4' content={page.url} />
            <Image fluid src={page.screenshot} />
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
            <Statistic label='blocked / errors' value={page.minorResources.errorCount} />
            {page.minorResources.errorCount > 0 ? <ErrorReport errorArray={page.minorResources.errorArray} /> : null}
        </>
    );
});
