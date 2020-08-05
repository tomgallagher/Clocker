import React from 'react';
import { Form, Dropdown } from 'semantic-ui-react';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react';
import { useStores } from './../../../hooks/useStores';

export const LoadCustomList = observer(() => {
    const { Settings } = useStores();
    const options = Settings.customUrlLists.map((item, index) => {
        return {
            key: item.id,
            text: item.name,
            value: index,
        };
    });
    const handleSelectionChange = (e, { value }) => {
        runInAction(
            () =>
                (Settings.websites = [
                    ...Settings.websites,
                    ...Settings.customUrlLists[value].websites,
                ])
        );
    };

    return (
        <Form>
            <Form.Field>
                <label>Select custom list to load saved test pages</label>
                <Dropdown
                    selection
                    name='Loadlist'
                    options={options}
                    placeholder='custom lists...'
                    onChange={handleSelectionChange}
                />
            </Form.Field>
        </Form>
    );
});
