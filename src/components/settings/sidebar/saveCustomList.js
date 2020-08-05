import React, { useState } from 'react';
import { runInAction } from 'mobx';
import { useStores } from './../../../hooks/useStores';
import { Form, Message } from 'semantic-ui-react';

export const SaveCustomList = () => {
    const { Settings } = useStores();
    //we need state for form input
    const [nameInput, setNameInput] = useState('');
    //we need state for form input errors
    const [nameInputError, setNameInputError] = useState(false);
    //we need state for form success as well
    const [formSuccess, setFormSuccess] = useState(false);

    //this handles changes to the input box for new urls, removing commas as we cannot have commas in a comma separated list
    const handleNameInputChange = (event) => setNameInput(event.target.value);

    //keydown for detecting url input
    const handleNameEnter = (event, { ...props }) => {
        //get the input url
        const inputName = event.target.value.trim();
        //we only handle enter key press when we have some characters to change
        if (event.key === 'Enter') {
            //test to see if we have a valid url
            if (inputName.length > 0) {
                //clear any remaining errors
                setNameInputError(false);
                //then update our array
                runInAction(
                    () =>
                        (Settings.customUrlLists = [
                            ...Settings.customUrlLists,
                            '',
                        ])
                );
                //then clear the url input box when we have a success
                setNameInput('');
                //then set the form success to show the message
                setFormSuccess(true);
            } else {
                setNameInputError({
                    content: 'Name must be 1 or more characters in length',
                    pointing: 'below',
                });
            }
        }
    };

    return (
        <>
            <Form>
                <Form.Field>
                    <Form.Input
                        fluid
                        label='Add name for custom list'
                        type='text'
                        placeholder='type and press enter to save...'
                        value={nameInput}
                        error={nameInputError}
                        onChange={handleNameInputChange}
                        onKeyUp={handleNameEnter}
                    />
                </Form.Field>
            </Form>
            {formSuccess ? (
                <Message
                    success
                    header='Custom List Saved'
                    content='You can view all custom lists via load button'
                />
            ) : null}
        </>
    );
};
