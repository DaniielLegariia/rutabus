import React from 'react';
import { waitFor, fireEvent } from '@testing-library/dom';
import { cleanup } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import API from '@aws-amplify/api';
import { useApi } from '@/hooks/Api';

import NewUser from '@/pages/config/user/new';
import { render } from '../__mocks__/utils';

const APIMock = API as jest.MockedFunction<any>;

afterEach(() => {
    jest.clearAllMocks();
    APIMock.post.mockClear();
    cleanup();
    window.document.body.innerHTML = '';
});

describe('newUser', () => {
    test('Should display the newUser view', async () => {
        const { getByLabelText } = render(<NewUser />);

        await waitFor(() => expect(getByLabelText('newUser-container')).toBeInTheDocument());
    });

    test('Should can create a user from scratch', async () => {
        APIMock.post.mockResolvedValueOnce(Promise.resolve({
            Email: 'david.reyes@easytrack.mx'
        }));

        const { getByPlaceholderText, getByLabelText } = render(<NewUser />);
        const post = jest.spyOn(useApi(), 'post');

        expect(getByLabelText('newUser-container')).toBeInTheDocument();

        await act(async () => {
            fireEvent.change(
                getByPlaceholderText('Ej. Fernando Herrera'),
                { target: { value: 'David Reyes' } }
            );

            fireEvent.change(
                getByPlaceholderText('Ej. fernando.herrera@easytrack.mx'),
                { target: { value: 'david.reyes@easytrack.mx' } }
            );
        });

        await act(async () => {
            await waitFor(() => fireEvent.click(getByLabelText('formElement-submitButton')));
            await waitFor(() => expect(post).toBeCalled());
        });
    });

    test('Should display an error when try to create a user', async () => {
        APIMock.post.mockRejectedValue(new Error('fail'));
        const { getByPlaceholderText, getByLabelText, getByText } = render(<NewUser />);
        const post = jest.spyOn(useApi(), 'post');

        expect(getByLabelText('newUser-container')).toBeInTheDocument();

        await act(async () => {
            fireEvent.click(
                getByPlaceholderText('Ej. Fernando Herrera')
            );

            fireEvent.click(
                getByPlaceholderText('Ej. fernando.herrera@easytrack.mx')
            );

            fireEvent.change(
                getByPlaceholderText('Ej. fernando.herrera@easytrack.mx'),
                { target: { value: 'david.reyes@easytrack.mx' } }
            );
        });

        await act(async () => {
            expect(getByText('Nombre de usuario es obligatorio')).toBeInTheDocument();

            fireEvent.click(
                getByPlaceholderText('Ej. Fernando Herrera')
            );

            fireEvent.change(
                getByPlaceholderText('Ej. Fernando Herrera'),
                { target: { value: 'David Reyes' } }
            );

            await waitFor(() =>
                expect(getByLabelText('formElement-submitButton')).toBeEnabled()
            );

            await waitFor(() => fireEvent.click(getByLabelText('formElement-submitButton')));
            await waitFor(() => expect(post).toBeCalled());
        });
    });
});
