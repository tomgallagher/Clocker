import React from 'react';
import { Container, Button } from 'semantic-ui-react';
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
import { LoadChart } from '../components/charts/loadChart';
import { RequestChart } from '../components/charts/requestChart';
import { SendChromeMessage } from './../utils/chromeFunctions';

/*
//for testing only
import randomSentence from 'random-sentence';
import { newPage } from './../__test__/makeData';
import { useInterval } from './../hooks/useInterval';

*/

// <ResponsiveReactGridLayout> takes width to calculate positions on drag events.
// WidthProvider can be used to automatically determine width upon initialization and window resize events.
const ResponsiveGridLayout = WidthProvider(Responsive);

export const Results = () => {
    //get the settings to see if we have any saved layouts
    const { JobStore, Settings } = useStores();
    //get the activeJob
    const activeJob = JobStore.jobs.length ? JobStore.jobs[JobStore.activeIndex] : JobStore.placeholderJob;

    /*
    //for testing the console - adds a new message every 2 seconds
    useInterval(() => {
        //generate the new console message
        const text = randomSentence(500, 1500);
        SendChromeMessage({ command: 'forwardConsoleMessage', message: text });
        //generate the new page item
        const page = newPage();
        SendChromeMessage({ command: 'forwardPageData', payload: page });
    }, 2000);
    */

    //then we need to have a save action on the layout change
    const handleLayoutChange = (currentLayout, allLayouts) => {
        console.log(currentLayout);
        runInAction(() => (Settings.resultsLayouts = allLayouts));
    };

    const handleButtonClick = (e, { name }) => {
        switch (name) {
            case 'Pause':
                SendChromeMessage({ command: 'pauseTest' });
                break;
            case 'Resume':
                SendChromeMessage({ command: 'resumeTest' });
                break;
            case 'Abort':
                SendChromeMessage({ command: 'abortTest' });
                break;
            default:
        }
    };

    return (
        <>
            <Button.Group floated='right' size='mini' style={{ marginRight: '10px' }}>
                <Button name='Pause' color='black' onClick={handleButtonClick}>
                    Pause
                </Button>
                <Button.Or />
                <Button name='Resume' color='black' onClick={handleButtonClick}>
                    Resume
                </Button>
                <Button.Or />
                <Button name='Abort' negative onClick={handleButtonClick}>
                    Abort
                </Button>
            </Button.Group>
            <Container text textAlign='center'>
                <PageTitle
                    title='Results'
                    subtitle={`Started: ${new Date(activeJob.createdAt).toLocaleString()}`}
                    dividing={false}
                />
            </Container>
            <Container fluid>
                <ResponsiveGridLayout
                    className='layout'
                    draggableHandle='.draggableHandle'
                    layouts={
                        Object.keys(Settings.resultsLayouts).length ? Settings.resultsLayouts : DefaultResultsLayouts
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
                    <div key='loadChart'>
                        <GridItem header='Total Resource Loads'>
                            <LoadChart />
                        </GridItem>
                    </div>
                    <div key='requestChart'>
                        <GridItem header='Average Resource Requests'>
                            <RequestChart />
                        </GridItem>
                    </div>
                </ResponsiveGridLayout>
            </Container>
        </>
    );
};
