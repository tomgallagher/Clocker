import React from 'react';
import { PageTitle } from '../../components/pageTitle';
import { observer } from 'mobx-react';
import { useStores } from '../../hooks/useStores';

export const HistoryTitle = observer(() => {
    //get the settings to see if we have any saved layouts
    const { JobStore } = useStores();
    //get the activeJob, if not null, MUST CHECK NOT NULL AS ZERO INDEX POSSIBLE, otherwise the placeholder will do fine
    const subTitle =
        JobStore.displayIndex !== null
            ? `Viewing job: ${JobStore.jobs[JobStore.displayIndex].name}`
            : 'Add names and view saved jobs';
    return (
        <div>
            <PageTitle title='History' subtitle={subTitle} />
        </div>
    );
});
