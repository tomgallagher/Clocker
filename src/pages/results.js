import React from 'react';
import { Container } from 'semantic-ui-react';
import { runInAction, toJS } from 'mobx';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { useStores } from './../hooks/useStores';
import { DefaultResultsLayouts } from './../components/results/resultsLayout';
import { GridItem } from './../components/gridItem';
import { PageTitle } from './../components/pageTitle.js';
import { HeaderLatency } from '../components/results/headerLatency';
import { DataUsage } from '../components/results/dataUsage';
import { ProgressBar } from './../components/results/progress';
import { PageTable } from './../components/results/pageTable';
import { ConsoleList } from './../components/results/consoleList';
import { Timings } from './../components/results/timings';

//for testing only
import randomSentence from 'random-sentence';
import { useInterval } from './../hooks/useInterval';

// <ResponsiveReactGridLayout> takes width to calculate positions on drag events.
// WidthProvider can be used to automatically determine width upon initialization and window resize events.
const ResponsiveGridLayout = WidthProvider(Responsive);

export const Results = () => {
    //get the settings to see if we have any saved layouts
    const { JobStore, Settings } = useStores();
    //get the activeJob
    const activeJob = JobStore.jobs[JobStore.activeIndex];
    //for testing the console - adds a new message every 2 seconds
    useInterval(() => {
        //generate the new console message
        const text = randomSentence(500, 1500);
        runInAction(() => activeJob.consoleMessages.push(text));
    }, 2000);

    //then we need to have a save action on the layout change
    const handleLayoutChange = (currentLayout, allLayouts) => {
        console.log(currentLayout);
        runInAction(() => (Settings.resultsLayouts = allLayouts));
    };

    return (
        <>
            <Container text textAlign='center'>
                <PageTitle
                    title='Results'
                    subtitle='View test job results'
                    dividing={false}
                />
            </Container>
            <Container fluid>
                <ResponsiveGridLayout
                    className='layout'
                    draggableHandle='.draggableHandle'
                    layouts={
                        Object.keys(Settings.resultsLayouts).length
                            ? Settings.resultsLayouts
                            : DefaultResultsLayouts
                    }
                    breakpoints={{
                        lg: 1200,
                        md: 996,
                        sm: 768,
                        xs: 480,
                        xxs: 0,
                    }}
                    cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                    margin={[10, 10]}
                    containerPadding={[10, 10]}
                    onLayoutChange={handleLayoutChange}
                >
                    <div key='timings'>
                        <GridItem header='Timings'>
                            <Timings />
                        </GridItem>
                    </div>
                    <div key='headerLatency'>
                        <GridItem header='Header Latency'>
                            <HeaderLatency />
                        </GridItem>
                    </div>
                    <div key='dataUsage'>
                        <GridItem header='Page Weight'>
                            <DataUsage />
                        </GridItem>
                    </div>
                    <div key='progress'>
                        <GridItem header='Progress'>
                            <ProgressBar />
                        </GridItem>
                    </div>
                    <div key='pageTable'>
                        <GridItem header='Page Results'>
                            <PageTable />
                        </GridItem>
                    </div>

                    <div key='console'>
                        <GridItem header='Activity Log'>
                            <ConsoleList />
                        </GridItem>
                    </div>
                </ResponsiveGridLayout>
            </Container>
        </>
    );
};
