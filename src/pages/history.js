import React from 'react';
import { Container } from 'semantic-ui-react';
import { runInAction } from 'mobx';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { useStores } from './../hooks/useStores';
import { DefaultHistoryLayouts } from './../components/history/historyLayout';
import { PageTitle } from './../components/pageTitle.js';
import { GridItem } from './../components/gridItem';
import { JobsTable } from '../components/history/jobsTable';
import { DisplayPageTable } from '../components/history/displayPageTable';
import { DisplayMetricsTable } from '../components/history/displayMetricsTable';

// <ResponsiveReactGridLayout> takes width to calculate positions on drag events.
// WidthProvider can be used to automatically determine width upon initialization and window resize events.
const ResponsiveGridLayout = WidthProvider(Responsive);

export const History = () => {
    const { Settings } = useStores();
    //then we need to have a save action on the layout change
    const handleLayoutChange = (currentLayout, allLayouts) => {
        console.log(currentLayout);
        runInAction(() => (Settings.historyLayouts = allLayouts));
    };

    return (
        <>
            <Container text textAlign='center'>
                <PageTitle title='History' subtitle='Add names and view saved jobs' />
            </Container>
            <Container fluid>
                <ResponsiveGridLayout
                    className='layout'
                    draggableHandle='.draggableHandle'
                    layouts={
                        Object.keys(Settings.historyLayouts).length ? Settings.historyLayouts : DefaultHistoryLayouts
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
                    <div key='jobsTable'>
                        <GridItem header='Job Results'>
                            <JobsTable />
                        </GridItem>
                    </div>
                    <div key='pageTable'>
                        <GridItem header='Page Results'>
                            <DisplayPageTable />
                        </GridItem>
                    </div>
                    <div key='metricsTable'>
                        <GridItem header='Page Metrics'>
                            <DisplayMetricsTable />
                        </GridItem>
                    </div>
                </ResponsiveGridLayout>
            </Container>
        </>
    );
};
