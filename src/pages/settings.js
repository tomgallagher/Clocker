import React from 'react';
import { Container } from 'semantic-ui-react';
import { runInAction } from 'mobx';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { useStores } from './../hooks/useStores';
import { PageTitle } from './../components/pageTitle';
import { GridItem } from './../components/gridItem';
import { DefaultSettingsLayouts } from './../components/settings/settingsLayout';
import { Bandwidth } from '../components/settings/bandwidth';
import { Latency } from '../components/settings/latency';
import { WebsiteSelector } from './../components/settings/websiteSelector';
import { PageIterations } from './../components/settings/pageIterations';
import { WithCache } from './../components/settings/withCache';
import { WithServiceWorker } from './../components/settings/withServiceWorker';
import { Screenshot } from './../components/settings/screenshot';

// <ResponsiveReactGridLayout> takes width to calculate positions on drag events.
// WidthProvider can be used to automatically determine width upon initialization and window resize events.
const ResponsiveGridLayout = WidthProvider(Responsive);

export const SettingsPage = () => {
    //get the settings to see if we have any saved layouts
    const { Settings } = useStores();
    //then we need to have a save action on the layout change
    const handleLayoutChange = (currentLayout, allLayouts) => {
        console.log(currentLayout);
        runInAction(() => (Settings.settingsLayouts = allLayouts));
    };

    return (
        <>
            <Container text textAlign='center'>
                <PageTitle title='Settings' subtitle='Change test job settings' dividing={false} />
            </Container>
            <Container fluid>
                <ResponsiveGridLayout
                    className='layout'
                    draggableHandle='.draggableHandle'
                    layouts={
                        Object.keys(Settings.settingsLayouts).length ? Settings.settingsLayouts : DefaultSettingsLayouts
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
                    <div key='latency'>
                        <GridItem header='Latency'>
                            <Latency />
                        </GridItem>
                    </div>
                    <div key='webPageSelector'>
                        <GridItem header='Web Pages'>
                            <WebsiteSelector />
                        </GridItem>
                    </div>

                    <div key='pageIterations'>
                        <GridItem header='Page Iterations'>
                            <PageIterations />
                        </GridItem>
                    </div>
                    <div key='bandwidth'>
                        <GridItem header='Bandwidth'>
                            <Bandwidth />
                        </GridItem>
                    </div>
                    <div key='screenshot'>
                        <GridItem header='Screenshot Quality'>
                            <Screenshot />
                        </GridItem>
                    </div>
                    <div key='withCache'>
                        <GridItem header='Cache Status'>
                            <WithCache />
                        </GridItem>
                    </div>
                    <div key='withServiceWorker'>
                        <GridItem header='Service Workers'>
                            <WithServiceWorker />
                        </GridItem>
                    </div>
                </ResponsiveGridLayout>
            </Container>
        </>
    );
};
