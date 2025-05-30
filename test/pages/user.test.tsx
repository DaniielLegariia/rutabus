import React from 'react';
import { fireEvent, waitFor } from '@testing-library/dom';
import { act } from 'react-dom/test-utils';
import { cleanup } from '@testing-library/react';
import API from '@aws-amplify/api';
import { useApi } from '@/hooks/Api';

import User from '@/pages/config/user';
import { render } from '../__mocks__/utils';

const APIMock = API as jest.MockedFunction<any>;
const returnValue = {
    Count: 2,
    Items: [
        {
            Email: 'usuario.pruebas@easytrack.com',
            Name: 'Usuario Pruebas',
            IsAdmin: false
        },
        {
            Email: 'david.reyes@easytrack.mx',
            Name: 'David Reyes',
            IsAdmin: true
        }
    ],
    LastEvaluatedKey: {}
};

afterEach(() => {
    jest.clearAllMocks();
    APIMock.get.mockClear();
    APIMock.put.mockClear();
    APIMock.del.mockClear();
    cleanup();
    window.document.body.innerHTML = '';
});

describe('User', () => {
    test('Should display the user view', async () => {
        const { getByLabelText } = render(<User />);

        await waitFor(() => expect(getByLabelText('user-container')).toBeInTheDocument());
    });

    test('Should display the user list with data', async () => {
        APIMock.get.mockResolvedValueOnce(Promise.resolve(returnValue));
        const { getByLabelText } = render(<User />);
        const get = jest.spyOn(useApi(), 'get');

        await waitFor(() => expect(get).toBeCalled());
        expect(getByLabelText('user-container')).toBeInTheDocument();
        expect(getByLabelText('user-deleteButton')).toBeInTheDocument();
    });

    test('Should display the user list whith data and can edit the Username', async () => {
        APIMock.get.mockResolvedValue(Promise.resolve(returnValue));
        APIMock.put.mockRejectedValueOnce()
                    .mockResolvedValue(Promise.resolve('Success'));

        await act(async () => {
            const { getByLabelText, getAllByLabelText } = render(<User />);
            const get = jest.spyOn(useApi(), 'get');
            const put = jest.spyOn(useApi(), 'put');

            await waitFor(() => expect(get).toBeCalled());

            await waitFor(() => getByLabelText('user-container'));

            expect(getAllByLabelText('user-UserName')[0]).toBeInTheDocument();
            fireEvent.click(getAllByLabelText('user-UserName')[0]);

            const inputEditElement = getAllByLabelText('inputEdit')[0];
            expect(inputEditElement).toBeInTheDocument();
            await waitFor(() => expect(inputEditElement).toHaveValue('Usuario Pruebas'));

            await waitFor(() => fireEvent.click(inputEditElement));
            await waitFor(() => fireEvent.change(
                getByLabelText('inputEdit'),
                { target: { value: 'Usuario Pruebas' } }
            ));

            await waitFor(() => fireEvent.focusOut(getByLabelText('inputEdit')));
            await waitFor(() =>
                expect(getAllByLabelText('user-UserName')[0]).toHaveTextContent('Usuario Pruebas')
            );

            // Edit with only a space
            await waitFor(() => fireEvent.click(getAllByLabelText('user-UserName')[1]));
            await waitFor(() => fireEvent.change(
                getByLabelText('inputEdit'),
                { target: { value: ' ' } }
            ));

            await waitFor(() => fireEvent.focusOut(getByLabelText('inputEdit')));
            await waitFor(() =>
                expect(getAllByLabelText('user-UserName')[0]).toHaveTextContent('Usuario Pruebas')
            );

            // Edit correctly but got an error in back end
            await waitFor(() => fireEvent.click(getAllByLabelText('user-UserName')[1]));
            await waitFor(() => fireEvent.change(
                getByLabelText('inputEdit'),
                { target: { value: 'Test User' } }
            ));

            await waitFor(() => fireEvent.focusOut(getByLabelText('inputEdit')));
            await waitFor(() => expect(put).toBeCalled());

            // Edit correctly
            await waitFor(() => fireEvent.click(getAllByLabelText('user-UserName')[1]));
            await waitFor(() => fireEvent.change(
                getByLabelText('inputEdit'),
                { target: { value: 'Test User' } }
            ));

            await waitFor(() => fireEvent.focusOut(getByLabelText('inputEdit')));
            await waitFor(() => expect(put).toBeCalled());
        });
    });

    test('Should can delete an user', async () => {
        APIMock.get.mockResolvedValue(Promise.resolve(returnValue));
        APIMock.del.mockRejectedValueOnce()
                    .mockResolvedValue(Promise.resolve({ email: 'usuario.pruebas@easytrack.com' }));

        await act(async () => {
            const { getByLabelText, getAllByLabelText, getByText } = render(<User />);
            const get = jest.spyOn(useApi(), 'get');
            const del = jest.spyOn(useApi(), 'del');

            await waitFor(() => expect(get).toBeCalled());

            await waitFor(() => getByLabelText('user-container'));

            expect(getAllByLabelText('user-UserName')[0]).toBeInTheDocument();
            expect(getAllByLabelText('user-deleteButton')[0]).toBeInTheDocument();

            // Cancelar la eliminación
            await waitFor(() => fireEvent.click(getAllByLabelText('user-deleteButton')[0]));
            await waitFor(() =>
                expect(getByText('¿Estas seguro de eliminar este usuario?')).toBeInTheDocument()
            );
            await waitFor(() => fireEvent.click(getByText('Cancelar')));

            // Aceptar la eliminación con error en backend
            await waitFor(() => fireEvent.click(getAllByLabelText('user-deleteButton')[0]));
            await waitFor(() =>
                expect(getByText('¿Estas seguro de eliminar este usuario?')).toBeInTheDocument()
            );
            await waitFor(() => fireEvent.click(getByText('Aceptar')));
            await waitFor(() => expect(del).toBeCalled());

            // Aceptar la eliminación
            await waitFor(() => fireEvent.click(getAllByLabelText('user-deleteButton')[0]));
            await waitFor(() =>
                expect(getByText('¿Estas seguro de eliminar este usuario?')).toBeInTheDocument()
            );
            await waitFor(() => fireEvent.click(getByText('Aceptar')));
            await waitFor(() => expect(del).toBeCalled());
        });
    });
});
