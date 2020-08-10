import React, { useEffect, useRef, useState } from 'react';
import { Label, Image, Button, Form, Segment } from 'semantic-ui-react';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react';
import raw from 'raw.macro';
import { useStores } from './../../hooks/useStores';
import { VirtualGrid } from '../lists/virtualGrid';

const euroSource = raw('./../../database/euro_sites.txt')
    .split('\n')
    .filter(Boolean);

const usSource = raw('./../../database/us_sites.txt')
    .split('\n')
    .filter(Boolean);

const urlRegex = /^(?:(?:https?):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;

export const WebsiteSelector = observer(() => {
    //get access to the settings
    const { Settings } = useStores();
    //we need state for form input
    const [urlInput, setUrlInput] = useState('');
    //we need state for form input errors
    const [urlInputError, setUrlInputError] = useState(false);
    //then parse the current parsed websites computed value to display
    const processed = Settings.parsedWebsites.map((parsed) => [
        <Label
            className='urlShortName'
            as='a'
            target='_blank'
            content={parsed.name}
        />,
        <Image
            avatar
            centered
            style={{ display: 'block' }}
            src={parsed.favicon}
            onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://eu.ui-avatars.com/api/?name=${parsed.name}`;
            }}
        />,
        parsed.url,
    ]);
    //we need a reference to the virtual grid so we can reset according changes in processed data
    const gridRef = useRef();
    //when we have changes to processed data we refresh the virtual grid
    useEffect(() => {
        if (gridRef.current != null) {
            gridRef.current.resetAfterIndices({
                columnIndex: 0,
                rowIndex: 0,
            });
            gridRef.current.scrollToItem(0);
        }
    }, [processed]);
    //buttons for changing regions
    const handleRegionClick = (e, { name }) => {
        //then load the right regional sites
        switch (name) {
            case 'eu':
                runInAction(() => (Settings.websites = [...euroSource]));
                break;
            case 'us':
                runInAction(() => (Settings.websites = [...usSource]));
                break;
            case 'clear':
                runInAction(() => (Settings.websites = []));
                break;
            default:
                console.log('Unrecognised Region Name');
        }
    };
    //this handles changes to the input box for new urls, removing commas as we cannot have commas in a comma separated list
    const handleUrlChange = (event) => setUrlInput(event.target.value);

    //keydown for detecting url input
    const handleUrlEnter = (event) => {
        //get the input url
        const inputUrl = event.target.value.trim();
        //we only handle enter key press when we have some characters to change
        if (event.key === 'Enter' && inputUrl.length > 0) {
            //test to see if we have a valid url
            if (urlRegex.test(inputUrl)) {
                //clear any remaining errors
                setUrlInputError(false);
                //then update our array
                runInAction(
                    () => (Settings.websites = [...Settings.websites, inputUrl])
                );
                //then clear the url input box when we have a success
                setUrlInput('');
            } else {
                setUrlInputError({
                    content: 'Invalid url format',
                    pointing: 'below',
                });
            }
        }
    };

    const handleLoadClick = () => {
        runInAction(() => {
            Settings.sidebar = 'loadUrls';
            Settings.showSidebar = true;
        });
    };

    const handleSaveClick = () => {
        if (Settings.websites.length !== 0) {
            runInAction(() => {
                Settings.sidebar = 'saveUrls';
                Settings.showSidebar = true;
            });
        }
    };

    return (
        <div className='internal-grid-content-single-row'>
            <Form
                size='large'
                className='internal-grid-content-single-row-spread'
            >
                <Form.Field>
                    <label>Test Pages</label>
                    <VirtualGrid gridRef={gridRef} rowData={processed} />
                </Form.Field>
                <Form.Field>
                    <Form.Input
                        fluid
                        label='Add Page Address'
                        type='url'
                        placeholder='type url and press enter...'
                        value={urlInput}
                        error={urlInputError}
                        onChange={handleUrlChange}
                        onKeyUp={handleUrlEnter}
                    />
                </Form.Field>
                <Form.Group widths='equal'>
                    <Form.Field>
                        <label>Add Regional Top 100 Sites</label>
                        <Segment textAlign='center'>
                            <Button.Group size='mini' color='black'>
                                <Button
                                    type='button'
                                    name='eu'
                                    onClick={handleRegionClick}
                                >
                                    Europe
                                </Button>
                                <Button.Or />
                                <Button
                                    type='button'
                                    name='us'
                                    onClick={handleRegionClick}
                                >
                                    United States
                                </Button>
                            </Button.Group>
                        </Segment>
                    </Form.Field>
                    <Form.Field>
                        <label>Manage Test Pages</label>
                        <Segment textAlign='center'>
                            <Button.Group size='mini' color='black'>
                                <Button
                                    type='button'
                                    name='load'
                                    onClick={handleLoadClick}
                                >
                                    Load
                                </Button>
                                <Button.Or />
                                <Button
                                    type='button'
                                    name='save'
                                    onClick={handleSaveClick}
                                >
                                    Save
                                </Button>
                                <Button.Or />
                                <Button
                                    type='button'
                                    name='clear'
                                    onClick={handleRegionClick}
                                >
                                    Clear
                                </Button>
                            </Button.Group>
                        </Segment>
                    </Form.Field>
                </Form.Group>
            </Form>
        </div>
    );
});
