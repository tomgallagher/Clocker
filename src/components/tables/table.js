import React, { useMemo } from 'react';
import { Table, Menu, Icon, Select } from 'semantic-ui-react';
import { useTable, useSortBy, usePagination } from 'react-table';
import { CSVLink } from 'react-csv';

import './table.css';

export const SemanticTable = ({ headers, dataset, ...props }) => {
    //make sure we memo-ize the incoming data so we can work it
    const columns = useMemo(() => headers, [headers]);
    const data = useMemo(() => dataset, [dataset]);

    const csvHeaders = headers.map((item) => item.Header);
    const csvValues = dataset.map((item) =>
        Object.values(item).filter((e) => {
            return e === 0 || e;
        })
    );
    csvValues.unshift(csvHeaders);

    // Use the state and functions returned from useTable to build your UI
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        visibleColumns,
        prepareRow,
        // Instead of using 'rows', we'll use page, which has only the rows for the active page
        page,
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        state: { pageIndex, pageSize },
    } = useTable(
        { columns, data, initialState: { pageIndex: 0 } },
        useSortBy,
        usePagination
    );

    return (
        /* This is required to make the table full-width */

        <div className='tableContainer'>
            {/* This will make the table scrollable when it gets too small */}
            <div className='tableWrapper'>
                {/* apply the table props */}
                <Table {...getTableProps(props)} style={{ width: '100%' }}>
                    {/* build the table header */}
                    <Table.Header>
                        {
                            // Loop over the header rows
                            headerGroups.map((headerGroup) => (
                                // Apply the header row props
                                <Table.Row
                                    {...headerGroup.getHeaderGroupProps()}
                                >
                                    {
                                        // Loop over the headers in each row
                                        headerGroup.headers.map((column) => (
                                            // Apply the header cell props

                                            <Table.HeaderCell
                                                {...column.getHeaderProps(
                                                    // Add the sorting props to control sorting.
                                                    column.getSortByToggleProps()
                                                )}
                                                /* Add a sort direction indicator, using the sort properties of the column and the semantic ui sorted property */
                                                sorted={
                                                    column.isSorted
                                                        ? column.isSortedDesc
                                                            ? 'descending'
                                                            : 'ascending'
                                                        : null
                                                }
                                            >
                                                {
                                                    // Render the header
                                                    column.render('Header')
                                                }
                                            </Table.HeaderCell>
                                        ))
                                    }
                                </Table.Row>
                            ))
                        }
                    </Table.Header>

                    {/* Apply the table body props */}
                    <Table.Body {...getTableBodyProps()}>
                        {
                            // Loop over the table rows
                            page.map((row) => {
                                // Prepare the row for display
                                prepareRow(row);
                                return (
                                    // Apply the row props
                                    <Table.Row {...row.getRowProps()}>
                                        {
                                            // Loop over the rows cells
                                            row.cells.map((cell) => {
                                                // Apply the cell props
                                                return (
                                                    <Table.Cell
                                                        {...cell.getCellProps()}
                                                    >
                                                        {
                                                            // Render the cell contents
                                                            cell.render('Cell')
                                                        }
                                                    </Table.Cell>
                                                );
                                            })
                                        }
                                    </Table.Row>
                                );
                            })
                        }
                    </Table.Body>

                    <Table.Footer>
                        <Table.Row>
                            <Table.HeaderCell
                                colSpan={visibleColumns.length.toString()}
                            >
                                <Menu floated='left'>
                                    <Menu.Item as='a'>
                                        <CSVLink
                                            data={csvValues}
                                            onClick={() =>
                                                console.log(csvValues)
                                            }
                                        >
                                            CSV
                                        </CSVLink>
                                    </Menu.Item>
                                </Menu>

                                <Menu floated='right' pagination>
                                    <Menu.Item
                                        as='a'
                                        icon
                                        onClick={() => gotoPage(0)}
                                        disabled={!canPreviousPage}
                                    >
                                        <Icon name='chevron left' />
                                        <Icon name='chevron left' />
                                    </Menu.Item>
                                    <Menu.Item
                                        as='a'
                                        icon
                                        onClick={() => previousPage()}
                                        disabled={!canPreviousPage}
                                    >
                                        <Icon name='chevron left' />
                                    </Menu.Item>
                                    <Menu.Item
                                        as='a'
                                        icon
                                        onClick={() => nextPage()}
                                        disabled={!canNextPage}
                                    >
                                        <Icon name='chevron right' />
                                    </Menu.Item>
                                    <Menu.Item
                                        as='a'
                                        icon
                                        onClick={() => gotoPage(pageCount - 1)}
                                        disabled={!canNextPage}
                                    >
                                        <Icon name='chevron right' />
                                        <Icon name='chevron right' />
                                    </Menu.Item>
                                    <Menu.Item as='a'>
                                        Page {pageIndex + 1} of{' '}
                                        {pageOptions.length}
                                    </Menu.Item>

                                    <Select
                                        item
                                        upward={true}
                                        text={`Show ${pageSize}`}
                                        onChange={(e, { value }) => {
                                            setPageSize(Number(value));
                                        }}
                                        options={paginationOptions}
                                    />
                                </Menu>
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Footer>
                </Table>
            </div>
        </div>
    );
};

const paginationOptions = [
    { key: '10', value: '10', text: 'Show 10' },
    { key: '20', value: '20', text: 'Show 20' },
    { key: '30', value: '30', text: 'Show 30' },
    { key: '40', value: '40', text: 'Show 40' },
    { key: '50', value: '50', text: 'Show 50' },
];

SemanticTable.defaultProps = {
    //create the default empty columns, data
    //A table can reduce its complexity to increase readability.
    basic: false,
    //A table may be divided each row into separate cells.
    celled: false,
    //A table can be collapsing, taking up only as much space as its rows.
    collapsing: false,
    //A table can be given a color to distinguish it from other tables.
    //red, orange, yellow, olive, green, teal, blue, violet, purple, pink, brown, grey, black
    color: 'black',
    //A table may sometimes need to be more compact to make more rows visible at a time.
    compact: false,
    //A table may be formatted to emphasize a first column that defines a rows content.
    definition: false,
    //A table can use fixed a special faster form of table rendering that does not resize table cells based on content
    fixed: false,
    //A table's colors can be inverted.
    inverted: false,
    //A table may sometimes need to be more padded for legibility.
    padded: false,
    //A table can specify that its cell contents should remain on a single line and not wrap.
    singleLine: false,
    //A table can also be small or large.
    size: 'small',
    //A table may allow a user to sort contents by clicking on a table header.
    sortable: false,
    //A table can specify how it stacks table content responsively.
    stackable: true,
    //A table can stripe alternate rows of content with a darker color to increase contrast.
    striped: false,
    //A table can be formatted to display complex structured data.
    structured: false,
    //A table can adjust its text alignment.
    textAlign: 'left',
};
