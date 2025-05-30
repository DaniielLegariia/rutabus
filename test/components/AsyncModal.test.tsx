import React from 'react';
import { cleanup } from '@testing-library/react';
import { waitFor, fireEvent } from '@testing-library/dom';
import API from '@aws-amplify/api';
import { useApi } from '@/hooks/Api';
import { act } from 'react-dom/test-utils';

import AsyncModal from '@/components/elements/Modals/AsyncModal';
import { render } from '../__mocks__/utils';

const APIMock = API as jest.MockedFunction<any>;
const returnValue = [
    {
        name: '460',
        vehicleId: 2616,
        device: {
            deviceId: 2422,
            deviceImei: '865851036199289'
        }
    },
    {
        name: '514',
        vehicleId: 2617,
        device: {
            deviceId: 2423,
            deviceImei: '867688036616070'
        }
    },
    {
        name: '453',
        vehicleId: 2618,
        device: {
            deviceId: 2424,
            deviceImei: '865851031910755'
        }
    }
];

const manyListItems:any[] = [];
for (let i = 0; i < 30; i += 1) {
    manyListItems.push({
        name: i.toString(),
        vehicleId: i,
        device: {
            deviceId: i,
            deviceImei: i.toString()
        }
    });
}

afterEach(() => {
    jest.clearAllMocks();
    APIMock.get.mockClear();
    cleanup();
});

describe('AsyncModal', () => {
    test('Should display the asyncModal', async () => {
        const modalState = [true, jest.fn()];
        const { getByRole } = render(
          <AsyncModal
            state={modalState}
            dataSource="easytrack/vehicle"
            title="Vehículos seleccionados"
            element="vehiculo"
            apiElement="name"
            itemsPerPage={20}
            maxItemsToSelect={25}
            action={jest.fn()}
            avoidElements={[]}
            refetchData={false}
            selectedItems={[]}
            haveLimitToSelect
            dataKey="name"
            extraParams={{}}
            vehicleLink={undefined}
            vehicleLinkConfig={undefined}
          />);

        await waitFor(() => expect(getByRole('dialog')).toBeInTheDocument());
    });

    test('Should initialize the modal correctly', async () => {
        const modalState = [true, jest.fn()];

        await act(async () => {
            APIMock.get.mockResolvedValueOnce(Promise.resolve(returnValue));
            const { getByLabelText, getAllByLabelText } = render(
              <AsyncModal
                state={modalState}
                dataSource="easytrack/vehicle"
                title="Vehículos seleccionados"
                element="vehiculo"
                apiElement="name"
                itemsPerPage={20}
                maxItemsToSelect={25}
                action={jest.fn()}
                avoidElements={[]}
                refetchData={false}
                selectedItems={[]}
                haveLimitToSelect
                dataKey="name"
                extraParams={{}}
                vehicleLink={undefined}
                vehicleLinkConfig={undefined}
              />
            );
            const get = jest.spyOn(useApi(), 'get');

            await waitFor(() => expect(get).toBeCalled());

            await waitFor(() => expect(getAllByLabelText('AsyncModal-ListItem')).toHaveLength(3));

            await waitFor(() => expect(getByLabelText('AsyncModal-SaveButton')).toBeInTheDocument());
            await waitFor(() => expect(getByLabelText('AsyncModal-SaveButton')).toBeDisabled());
        });
    });

    test('Select an item, avoid 2 items and save', async () => {
        const modalState = [true, jest.fn()];
        const actionFunction = jest.fn();

        await act(async () => {
            APIMock.get.mockResolvedValueOnce(Promise.resolve(returnValue));
            const { getByLabelText, getAllByLabelText } = render(
              <AsyncModal
                state={modalState}
                dataSource="easytrack/vehicle"
                title="Vehículos seleccionados"
                element="vehiculo"
                apiElement="name"
                itemsPerPage={20}
                maxItemsToSelect={25}
                action={actionFunction}
                avoidElements={[
                        {
                            name: '514',
                            vehicleId: 2617,
                            device: {
                                deviceId: 2423,
                                deviceImei: '867688036616070'
                            }
                        },
                        {
                            name: '453',
                            vehicleId: 2618,
                            device: {
                                deviceId: 2424,
                                deviceImei: '865851031910755'
                            }
                        }
                    ]}
                refetchData={false}
                selectedItems={[]}
                haveLimitToSelect
                dataKey="name"
                extraParams={{}}
                vehicleLink={undefined}
                vehicleLinkConfig={undefined}
              />
            );

            const firstListItem = await waitFor(() => getAllByLabelText('AsyncModal-ListItem')[0]);
            fireEvent.click(firstListItem);

            const saveButton = getByLabelText('AsyncModal-SaveButton');
            await waitFor(() => expect(saveButton).toBeEnabled());

            fireEvent.click(saveButton);
            expect(actionFunction).toBeCalledTimes(1);
            expect(actionFunction).toBeCalledWith([
                {
                    name: '460',
                    vehicleId: 2616,
                    device: {
                        deviceId: 2422,
                        deviceImei: '865851036199289'
                    }
                }
            ]);
        });
    });

    test('Search an item and close modal', async () => {
        const closeModalFunction = jest.fn();
        const modalState = [true, closeModalFunction];

        await act(async () => {
            APIMock.get.mockResolvedValueOnce(Promise.resolve(returnValue));
            const { getAllByLabelText, getByLabelText } = render(
              <AsyncModal
                state={modalState}
                dataSource="easytrack/vehicle"
                title="Vehículos seleccionados"
                element="vehiculo"
                apiElement="name"
                itemsPerPage={20}
                maxItemsToSelect={25}
                action={jest.fn()}
                avoidElements={[]}
                refetchData={false}
                selectedItems={[]}
                haveLimitToSelect
                dataKey="name"
                extraParams={{}}
                vehicleLink={undefined}
                vehicleLinkConfig={undefined}
              />
            );

            await waitFor(() => getAllByLabelText('AsyncModal-ListItem'));

            const searchInput = getByLabelText('AsyncModal-SearchInput');
            fireEvent.change(searchInput, { target: { value: '460' } });

            expect(getByLabelText('AsyncModal-ListItem')).toBeInTheDocument();

            const closeButton = getByLabelText('Close', { selector: 'button' });
            fireEvent.click(closeButton);
            expect(closeModalFunction).toBeCalledTimes(1);
        });
    });

    test('Select max items, disabled items and diselect an item', async () => {
        const modalState = [true, jest.fn()];
        const listItems:any[] = [];
        await waitFor(() => {
            for (let i = 0; i < 30; i += 1) {
                listItems.push({
                    name: i.toString(),
                    vehicleId: i,
                    device: {
                        deviceId: i,
                        deviceImei: i.toString()
                    }
                });
            }
        });

        await act(async () => {
            APIMock.get.mockResolvedValueOnce(Promise.resolve(listItems));
            const { getAllByLabelText } = render(
              <AsyncModal
                state={modalState}
                dataSource="easytrack/vehicle"
                title="Vehículos seleccionados"
                element="vehiculo"
                apiElement="name"
                itemsPerPage={30}
                maxItemsToSelect={25}
                action={jest.fn()}
                avoidElements={[]}
                refetchData={false}
                selectedItems={[]}
                haveLimitToSelect
                dataKey="name"
                extraParams={{}}
                vehicleLink={undefined}
                vehicleLinkConfig={undefined}
              />
            );

            for (let i = 0; i < 25; i += 1) {
                const listItem = await waitFor(() => getAllByLabelText('AsyncModal-ListItem')[i]);
                fireEvent.click(listItem);
            }

            const listItem = await waitFor(() => getAllByLabelText('AsyncModal-ListItem')[27]);
            fireEvent.click(listItem);
            expect(getAllByLabelText('AsyncModal-CheckboxItem')[27]).toBeDisabled();

            const firstListItem = await waitFor(() => getAllByLabelText('AsyncModal-ListItem')[0]);
            fireEvent.click(firstListItem);

            expect(getAllByLabelText('AsyncModal-CheckboxItem')[27]).toBeEnabled();
        });
    });

    test('Should have 2 selected items', async () => {
        const modalState = [true, jest.fn()];
        const actionFunction = jest.fn();

        await act(async () => {
            APIMock.get.mockResolvedValueOnce(Promise.resolve(returnValue));
            const { getByLabelText } = render(
              <AsyncModal
                state={modalState}
                dataSource="easytrack/vehicle"
                title="Vehículos seleccionados"
                element="vehiculo"
                apiElement="name"
                itemsPerPage={20}
                maxItemsToSelect={25}
                action={actionFunction}
                selectedItems={[
                        {
                            name: '514',
                            vehicleId: 2617,
                            device: {
                                deviceId: 2423,
                                deviceImei: '867688036616070'
                            }
                        },
                        {
                            name: '453',
                            vehicleId: 2618,
                            device: {
                                deviceId: 2424,
                                deviceImei: '865851031910755'
                            }
                        }
                    ]}
                refetchData={false}
                avoidElements={[]}
                haveLimitToSelect
                dataKey="name"
                extraParams={{}}
                vehicleLink={undefined}
                vehicleLinkConfig={undefined}
              />
            );

            const saveButton = await waitFor(() => getByLabelText('AsyncModal-SaveButton'));
            await waitFor(() => expect(saveButton).toBeEnabled());

            fireEvent.click(saveButton);
            expect(actionFunction).toBeCalledTimes(1);
            expect(actionFunction).toBeCalledWith([
                {
                    name: '514',
                    vehicleId: 2617,
                    device: {
                        deviceId: 2423,
                        deviceImei: '867688036616070'
                    }
                },
                {
                    name: '453',
                    vehicleId: 2618,
                    device: {
                        deviceId: 2424,
                        deviceImei: '865851031910755'
                    }
                }
            ]);
        });
    });

    test('Should try to associate some vehicles and cancel the process', async () => {
        const modalState = [true, jest.fn()];
        const setIsVehicleLink = jest.fn();
        const IsVehicleLink = jest.fn();
        const refetch = jest.fn();

        const vehicleLinkConfig = {
            breakAssociate: { current: false },
            setSuccessVehicles: jest.fn(),
            setVehiclesArray: jest.fn(),
            vehiclesArray: [
                {
                    Name: 'Vehículo 1',
                    status: ''
                },
                {
                    Name: 'Vehículo 2',
                    status: 'failed'
                },
                {
                    Name: 'Vehículo 3',
                    status: 'success'
                }
            ],
            successVehicles: 2,
            vehiclesToLink: 3,
            title: 'Vinculando',
            refetch
        };

        await act(async () => {
            const { getByLabelText, getByText } = render(
              <AsyncModal
                state={modalState}
                dataSource="easytrack/vehicle"
                title="Vehículos seleccionados"
                element="vehiculo"
                apiElement="name"
                itemsPerPage={20}
                maxItemsToSelect={25}
                action={jest.fn()}
                avoidElements={[]}
                refetchData={false}
                selectedItems={[]}
                haveLimitToSelect
                dataKey="name"
                extraParams={{}}
                vehicleLink={[IsVehicleLink, setIsVehicleLink]}
                vehicleLinkConfig={vehicleLinkConfig}
              />
            );

            const cancelButton = await waitFor(() => getByLabelText('AsyncModal-CancelButton'));
            await waitFor(() => fireEvent.click(cancelButton));

            await waitFor(() =>
                expect(getByText('Estas seguro de cancelar la vinculación?')).toBeInTheDocument()
            );

            const confirmButton = await waitFor(() => getByText('Si'));
            await waitFor(() => fireEvent.click(confirmButton));

            await waitFor(() =>
                expect(getByLabelText('AsyncModal-CloseButton')).toBeInTheDocument()
            );
            await waitFor(() => fireEvent.click(getByLabelText('AsyncModal-CloseButton')));
            expect(refetch).toBeCalled();
        });
    });
});
