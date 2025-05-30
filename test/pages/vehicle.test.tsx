import React from 'react';
import { waitFor, fireEvent, waitForElementToBeRemoved } from '@testing-library/dom';
import { cleanup } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import API from '@aws-amplify/api';
import { useApi } from '@/hooks/Api';

import Vehicle from '@/pages/config/vehicle';
import { render } from '../__mocks__/utils';

const APIMock = API as jest.MockedFunction<any>;

afterEach(() => {
    jest.clearAllMocks();
    APIMock.get.mockClear();
    APIMock.post.mockClear();
    APIMock.del.mockClear();
    cleanup();
    window.document.body.innerHTML = '';
});

beforeEach(() => {
    jest.clearAllMocks();
    APIMock.get.mockClear();
    APIMock.post.mockClear();
    APIMock.del.mockClear();
    cleanup();
    window.document.body.innerHTML = '';
});

const getVehiclesFromApp = {
    Count: 1,
    Items: [
        {
            Server: 'a3vip',
            VehicleId: '2603',
            RouteStatus: 'withoutroute',
            GPSStatus: 'standby',
            ShortName: '505',
            Name: '505'
        }
    ],
    LastEvaluatedKey: {}
};

describe('VehiclesPage', () => {
    test('Should display the vehicle page', async () => {
        const { getByLabelText } = render(<Vehicle />);
        await waitFor(() => expect(getByLabelText('vehicles-container')).toBeInTheDocument());
    });

    test('Should display an empty table and display the vehiclesModal', async () => {
        // Respuesta a get del modal
        APIMock.get.mockResolvedValue(Promise.resolve([
                {
                    name: 'Vehículos',
                    viewId: 173
                }
            ])).mockResolvedValueOnce(Promise.resolve({
                Count: 0,
                Items: [],
                LastEvaluatedKey: {}
            }));

        const { getByLabelText, getByText, getByRole } = render(<Vehicle />);
        const get = jest.spyOn(useApi(), 'get');

        await waitFor(() => expect(getByLabelText('vehicles-container')).toBeInTheDocument());
        await waitFor(() => expect(get).toBeCalled());

        await act(async () => {
            await waitFor(() => expect(getByText('No hay vehículos para mostrar')).toBeInTheDocument());

            const addButton = getByLabelText('listElement-addButton');
            expect(addButton).toBeInTheDocument();
            expect(addButton).toBeEnabled();

            fireEvent.click(addButton);
            await waitFor(() => expect(getByRole('dialog')).toBeInTheDocument());
        });
    });

    test('Should can select and save item in the vehiclesModal', async () => {
        // Respuesta a get del modal
        APIMock.get.mockResolvedValueOnce(Promise.resolve({
            Count: 0,
            Items: [],
            LastEvaluatedKey: {}
        })).mockResolvedValueOnce(Promise.resolve([
            {
                name: 'Vehículos',
                viewId: 173
            }
        ])).mockResolvedValueOnce(Promise.resolve([
            {
                name: '460',
                vehicleId: 2616,
                device: {
                    deviceId: 2422,
                    deviceImei: '865851036199289'
                }
            }
        ]));

        APIMock.post.mockResolvedValueOnce(Promise.resolve({ message: 'Guardado correctamente' }));

        await act(async () => {
            const {
                getByLabelText,
                getAllByLabelText,
                queryByRole,
                getByRole,
                getByText
            } = render(<Vehicle />);

            const addButton = getByLabelText('listElement-addButton');
            fireEvent.click(addButton);

            await waitFor(() => expect(getByRole('combobox')).toBeInTheDocument());
            await waitFor(() => expect(getByRole('combobox')).toBeEnabled());

            fireEvent.click(getByText('Cancelar'));

            fireEvent.click(addButton);
            await waitFor(() => fireEvent.change(
                getByRole('combobox'),
                { target: { value: 173 } }
            ));
            fireEvent.click(getByText('Aceptar'));

            const firstListItem = await waitFor(() => getAllByLabelText('AsyncModal-ListItem')[0]);
            fireEvent.click(firstListItem);

            const saveButton = getByLabelText('AsyncModal-SaveButton');
            await waitFor(() => expect(saveButton).toBeEnabled());
            act(() => {
                fireEvent.click(saveButton);
            });

            await waitForElementToBeRemoved(() => getByRole('dialog'));

            expect(getByText('Guardado correctamente')).toBeInTheDocument();
            expect(queryByRole('dialog')).not.toBeInTheDocument();
        });
    });

    test('Should get an error when save in the vehiclesModal', async () => {
        // Respuesta a get del modal
        APIMock.get.mockResolvedValueOnce(Promise.resolve({
            Count: 0,
            Items: [],
            LastEvaluatedKey: {}
        })).mockResolvedValueOnce(Promise.resolve([
            {
                name: 'Vehículos',
                viewId: 173
            }
        ])).mockResolvedValueOnce(Promise.resolve([
            {
                name: '460',
                vehicleId: 2616,
                device: {
                    deviceId: 2422,
                    deviceImei: '865851036199289'
                }
            }
        ]));
        APIMock.post.mockRejectedValueOnce();

        const {
            getByLabelText,
            getAllByLabelText,
            getByRole,
            getByText
        } = render(<Vehicle />);
        const get = jest.spyOn(useApi(), 'get');
        await waitFor(() => expect(get).toBeCalled());
        // await waitFor(() => expect(get).toHaveBeenCalledWith({}));

        await act(async () => {
            const addButton = getByLabelText('listElement-addButton');
            fireEvent.click(addButton);

            await waitFor(() => expect(getByRole('combobox')).toBeInTheDocument());
            await waitFor(() => expect(getByRole('combobox')).toBeEnabled());

            await waitFor(() => fireEvent.change(
                getByRole('combobox'),
                { target: { value: 173 } }
            ));
            fireEvent.click(getByText('Aceptar'));

            const firstListItem = await waitFor(() => getAllByLabelText('AsyncModal-ListItem')[0]);
            fireEvent.click(firstListItem);

            const saveButton = getByLabelText('AsyncModal-SaveButton');
            await waitFor(() => expect(saveButton).toBeEnabled());
            act(() => {
                fireEvent.click(saveButton);
            });

            expect(getByRole('dialog')).toBeInTheDocument();
        });
    });

    test('Should display the table whith data and can edit the shortName', async () => {
        // Respuesta a get del modal
        APIMock.get.mockResolvedValueOnce(Promise.resolve(getVehiclesFromApp))
            .mockResolvedValue(Promise.resolve([
                {
                    name: 'Vehículos',
                    viewId: 173
                }
            ]));

        APIMock.post.mockRejectedValueOnce()
            .mockResolvedValue(Promise.resolve('Success'));

        await act(async () => {
            const { getByLabelText, getAllByLabelText } = render(<Vehicle />);
            const get = jest.spyOn(useApi(), 'get');
            const post = jest.spyOn(useApi(), 'post');

            await waitFor(() => expect(get).toBeCalled());

            await waitFor(() => getByLabelText('vehicles-container'));

            await waitFor(() => expect(getByLabelText('vehicles-ShortName')).toBeInTheDocument());
            fireEvent.click(getByLabelText('vehicles-ShortName'));

            const inputEditElement = getAllByLabelText('inputEdit')[0];
            expect(inputEditElement).toBeInTheDocument();
            await waitFor(() => expect(inputEditElement).toHaveValue('505'));

            await waitFor(() => fireEvent.click(inputEditElement));
            await waitFor(() => fireEvent.change(
                getByLabelText('inputEdit'),
                { target: { value: '505' } }
            ));

            await waitFor(() => fireEvent.focusOut(getByLabelText('inputEdit')));
            await waitFor(() => expect(getByLabelText('vehicles-ShortName')).toHaveTextContent('505'));

            // Edit with only a space
            await waitFor(() => fireEvent.click(getByLabelText('vehicles-ShortName')));
            await waitFor(() => fireEvent.change(
                getByLabelText('inputEdit'),
                { target: { value: ' ' } }
            ));

            await waitFor(() => fireEvent.focusOut(getByLabelText('inputEdit')));
            await waitFor(() => expect(getByLabelText('vehicles-ShortName')).toHaveTextContent('505'));

            // Edit correctly but with error from server
            await waitFor(() => fireEvent.click(getByLabelText('vehicles-ShortName')));
            await waitFor(() => fireEvent.change(
                getByLabelText('inputEdit'),
                { target: { value: 'UnNumbreCorto' } }
            ));

            await waitFor(() => fireEvent.focusOut(getByLabelText('inputEdit')));
            await waitFor(() => expect(post).toBeCalled());

            // Edit correctly and success
            await waitFor(() => fireEvent.click(getByLabelText('vehicles-ShortName')));
            await waitFor(() => fireEvent.change(
                getByLabelText('inputEdit'),
                { target: { value: 'UnNumbreCorto' } }
            ));

            await waitFor(() => fireEvent.focusOut(getByLabelText('inputEdit')));
            await waitFor(() => expect(post).toBeCalled());
        });
    });

    test('Should can delete a vehicle', async () => {
        APIMock.get.mockResolvedValue(Promise.resolve(getVehiclesFromApp));
        APIMock.del.mockRejectedValueOnce()
                    .mockResolvedValue(Promise.resolve({ vehicleId: '2645' }));

        await act(async () => {
            const { getByLabelText, getAllByLabelText, getByText } = render(<Vehicle />);
            const get = jest.spyOn(useApi(), 'get');
            const del = jest.spyOn(useApi(), 'del');

            await waitFor(() => expect(get).toBeCalled());

            await waitFor(() => getByLabelText('vehicles-container'));
            expect(getAllByLabelText('vehicle-deleteButton')[0]).toBeInTheDocument();

            // Cancelar la eliminación
            await waitFor(() => fireEvent.click(getAllByLabelText('vehicle-deleteButton')[0]));
            await waitFor(() =>
                expect(getByText('¿Estas seguro de eliminar este vehículo?')).toBeInTheDocument()
            );
            await waitFor(() => fireEvent.click(getByText('Cancelar')));

            // Aceptar la eliminación con error en backend
            await waitFor(() => fireEvent.click(getAllByLabelText('vehicle-deleteButton')[0]));
            await waitFor(() =>
                expect(getByText('¿Estas seguro de eliminar este vehículo?')).toBeInTheDocument()
            );
            await waitFor(() => fireEvent.click(getByText('Aceptar')));
            await waitFor(() => expect(del).toBeCalled());

            // Aceptar la eliminación
            await waitFor(() => fireEvent.click(getAllByLabelText('vehicle-deleteButton')[0]));
            await waitFor(() =>
                expect(getByText('¿Estas seguro de eliminar este vehículo?')).toBeInTheDocument()
            );
            await waitFor(() => fireEvent.click(getByText('Aceptar')));
            await waitFor(() => expect(del).toBeCalled());
        });
    });
});
