import React, { createRef } from 'react';
import { observer } from 'mobx-react';
import { Header, Tab } from 'semantic-ui-react';
import { VirtualGrid } from './../../lists/virtualGrid';

export const ErrorReport = observer((props) => {
    //create the tabs from the error array - NOTE THAT AN EMPTY ARRAY WILL BE RETURNED IF NO ERRORS
    const panes = props.errorArray.map((errorItem, index) => {
        //we need to have a reference for the grid for resize and scroll operations
        const gridRef = createRef(null);
        return {
            menuItem: `${index + 1}`,
            render: () => (
                <Tab.Pane>
                    <VirtualGrid
                        gridRef={gridRef}
                        //the error array has a key for each iteration index, and the value is the error array for that iteration
                        //so we use object values to get the error array and then object values again to get the values of each object in that error array
                        rowData={Object.values(errorItem)[0].map((item) => Object.values(item))}
                        //we set the values of column widths manually
                        columnWidths={[100, 250, 250]}
                    />
                </Tab.Pane>
            ),
        };
    });

    return (
        <>
            <Header as='h4' content='Errors by iteration' />
            <Tab panes={panes} />
        </>
    );
});
