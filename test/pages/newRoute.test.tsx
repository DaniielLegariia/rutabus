import React from 'react';
import { waitFor, fireEvent } from '@testing-library/dom';
import { cleanup } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import API from '@aws-amplify/api';
import { useApi } from '@/hooks/Api';

import NewRoute from '@/pages/config/route/new';
import { render } from '../__mocks__/utils';

const APIMock = API as jest.MockedFunction<any>;

afterEach(() => {
    jest.clearAllMocks();
    APIMock.get.mockClear();
    APIMock.post.mockClear();
    cleanup();
    window.document.body.innerHTML = '';
});

describe('newRoute', () => {
    test('Should display the newRoute', async () => {
        const { getByLabelText } = render(<NewRoute />);

        await waitFor(() => expect(getByLabelText('newRoute-container')).toBeInTheDocument());
    });

    test('Should can create a route from scratch', async () => {
        APIMock.get.mockResolvedValueOnce(Promise.resolve([
            {
                name: 'La caseta 1',
                id: 123
            },
            {
                name: 'La caseta 2',
                id: 456
            }
        ]));
        APIMock.post.mockResolvedValue(Promise.resolve('Success'));

        const {
            getByPlaceholderText,
            getByLabelText,
            getAllByLabelText,
            getByRole,
            queryByRole
        } = render(<NewRoute />);
        const get = jest.spyOn(useApi(), 'get');
        const post = jest.spyOn(useApi(), 'post');

        await waitFor(() => expect(get).toBeCalled());

        expect(getByLabelText('newRoute-container')).toBeInTheDocument();

        const modalButton = getByLabelText('newRoute-modalButton');
        expect(modalButton).toBeInTheDocument();

        await act(async () => {
            fireEvent.click(modalButton);
            await waitFor(() => expect(getByRole('dialog')).toBeInTheDocument());

            const firstListItem = await waitFor(() => getAllByLabelText('AsyncModal-ListItem')[0]);
            fireEvent.click(firstListItem);

            const secondListItem = await waitFor(() => getAllByLabelText('AsyncModal-ListItem')[1]);
            fireEvent.click(secondListItem);

            const saveButton = getByLabelText('AsyncModal-SaveButton');
            await waitFor(() => expect(saveButton).toBeEnabled());

            fireEvent.click(saveButton);
        });

        expect(queryByRole('dialog')).not.toBeInTheDocument();

        await act(async () => {
            await waitFor(() => getByLabelText('toleranceOnTime-Input'));
            await waitFor(() => getByLabelText('toleranceDelay-Input'));

            fireEvent.change(
                getByPlaceholderText('Descripción'),
                { target: { value: 'Una descripción mas' } }
            );

            fireEvent.change(
                getByLabelText('toleranceOnTime-Input'),
                { target: { value: 5 } }
            );

            fireEvent.change(
                getByLabelText('toleranceDelay-Input'),
                { target: { value: 5 } }
            );

            fireEvent.change(
                getByPlaceholderText('Ej. 2342342332'),
                { target: { value: '07:15' } }
            );
            await waitFor(() => fireEvent.click(getByLabelText('formElement-submitButton')));
        });

        const shortNameElement = getAllByLabelText('geofencesTable-shortName')[0];
        const sectionTimeElement = getAllByLabelText('geofencesTable-sectionTime')[0];
        const transitTimeElement = getAllByLabelText('geofencesTable-transitSectionTime')[0];

        expect(shortNameElement).toBeInTheDocument();
        expect(sectionTimeElement).toBeInTheDocument();
        expect(transitTimeElement).toBeInTheDocument();

        expect(shortNameElement).toHaveTextContent('La caseta 1');
        expect(sectionTimeElement).toHaveTextContent('0');
        expect(transitTimeElement).toHaveTextContent('0');

        const editButton = getAllByLabelText('geofencesTable-editButton')[0];
        expect(editButton).toBeInTheDocument();
        expect(editButton).toBeEnabled();

        fireEvent.click(editButton);

        const shortNameEditElement = getByLabelText('geofencesTable-editShortName');
        const sectionTimeEditElement = getByLabelText('geofencesTable-editSectionTime');
        const transitTimeEditElement = getByLabelText('geofencesTable-editTransitSectionTime');

        expect(shortNameEditElement).toBeInTheDocument();
        expect(sectionTimeEditElement).toBeInTheDocument();
        expect(transitTimeEditElement).toBeInTheDocument();

        await act(async () => {
            await waitFor(() => fireEvent.click(shortNameEditElement));
            await waitFor(() => fireEvent.change(
                shortNameEditElement,
                { target: { value: 'C1' } }
            ));
        });

        await act(async () => {
            await waitFor(() => fireEvent.click(sectionTimeEditElement));
            await waitFor(() => fireEvent.change(
                sectionTimeEditElement,
                { target: { value: 34 } }
            ));
        });

        await act(async () => {
            await waitFor(() => fireEvent.click(transitTimeEditElement));
            await waitFor(() => fireEvent.change(
                transitTimeEditElement,
                { target: { value: 20 } }
            ));

            const saveButton = getByLabelText('geofencesTable-saveButton');
            await waitFor(() => expect(saveButton).toBeEnabled());
            await waitFor(() => fireEvent.click(saveButton));
            await waitFor(() => expect(saveButton).not.toBeInTheDocument());

            // success request
            await waitFor(() => fireEvent.click(getByLabelText('formElement-submitButton')));
            await waitFor(() => expect(post).toBeCalled());
        });
    }, 10000);

    test('Should have some troubles when try to create a route', async () => {
        APIMock.get.mockResolvedValueOnce(Promise.resolve([
            {
                name: 'La caseta 1',
                id: 123
            },
            {
                name: 'La caseta 2',
                id: 456
            }
        ]));
        APIMock.post.mockRejectedValueOnce();

        const {
            getByLabelText,
            getAllByLabelText,
            getByRole,
            queryByRole
        } = render(<NewRoute />);
        const get = jest.spyOn(useApi(), 'get');

        await waitFor(() => expect(get).toBeCalled());

        expect(getByLabelText('newRoute-container')).toBeInTheDocument();

        const modalButton = getByLabelText('newRoute-modalButton');
        expect(modalButton).toBeInTheDocument();

        await act(async () => {
            fireEvent.click(modalButton);
            await waitFor(() => expect(getByRole('dialog')).toBeInTheDocument());

            const firstListItem = await waitFor(() => getAllByLabelText('AsyncModal-ListItem')[0]);
            fireEvent.click(firstListItem);

            const secondListItem = await waitFor(() => getAllByLabelText('AsyncModal-ListItem')[1]);
            fireEvent.click(secondListItem);

            const saveButton = getByLabelText('AsyncModal-SaveButton');
            await waitFor(() => expect(saveButton).toBeEnabled());

            fireEvent.click(saveButton);
        });

        expect(queryByRole('dialog')).not.toBeInTheDocument();
    });
});
