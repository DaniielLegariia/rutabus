import React from 'react';
import { waitFor, fireEvent } from '@testing-library/dom';
import { cleanup } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import API from '@aws-amplify/api';
import { useApi } from '@/hooks/Api';

import EditRoute from '@/pages/config/route/edit/[id]';
import { render } from '../__mocks__/utils';

const APIMock = API as jest.MockedFunction<any>;
const useRouter = jest.spyOn(require('next/router'), 'useRouter');

const returnValue = {
    Route: {
        AppID: '2AzbSTkQyM5xRgpmnlGixbIxrkF',
        Config: {
            dissociate: {
                referenceTime: 5,
                referenceDateTime: '',
                trigger: 'salir de',
                config: 'auto'
            },
            FinalDestination: {
                time: '1670453008000'
            },
            tolerance: {
                OnTime: 5,
                Late: 10,
                Delayed: 6
            }
        },
        Description: 'La mejor ruta del mundo',
        Type: 'Route',
        RouteID: '2Ctw2rbXszU6HPTbcCt9TbxIfEH',
        Name: 'Caseta General Bravo - Caseta Libramiento Mexicali'
    },
    Steps: [
        {
            Config: {
                MinutesToDestination: 65,
                tolerance: {
                    SectionTime: 10
                }
            },
            Transit: {
                MinutesToDestination: 55,
                tolerance: {
                    SectionTime: 20
                },
                Name: 'Traslado a Caseta La Joya'
            },
            Type: 'Step',
            ShortName: 'Caseta General Bravo',
            RouteID: '2Ctw2rbXszU6HPTbcCt9TbxIfEH',
            StepID: 1,
            isFinal: false,
            Name: 'Caseta General Bravo'
        },
        {
            Config: {
                MinutesToDestination: 35,
                tolerance: {
                    SectionTime: 5
                }
            },
            Transit: {
                MinutesToDestination: 30,
                tolerance: {
                    SectionTime: 30
                },
                Name: 'Traslado a Caseta Libramiento Mexicali'
            },
            Type: 'Step',
            ShortName: 'Caseta La Joya',
            RouteID: '2Ctw2rbXszU6HPTbcCt9TbxIfEH',
            StepID: 2,
            isFinal: false,
            Name: 'Caseta La Joya'
        },
        {
            Config: {
                MinutesToDestination: 0,
                tolerance: {
                    SectionTime: 0
                }
            },
            Transit: {},
            Type: 'Step',
            ShortName: 'Caseta Libramiento Mexicali',
            RouteID: '2Ctw2rbXszU6HPTbcCt9TbxIfEH',
            StepID: 3,
            isFinal: true,
            Name: 'Caseta Libramiento Mexicali'
        }
    ]
};

const returnVehiclesInRouteValue = {
    Count: 2,
    Items: [
        {
            GPSStatus: 'offline',
            Name: 'pendiente',
            RouteStatus: 'arrivedtodestination',
            Server: 'a3vip',
            ShortName: 'pendiente',
            VehicleId: '2643',
            Data: {
                dissociateTime: 0,
                GPSStatus: 'OFFLINE',
                GPSStatusTime: 15,
                GPSTimestamp: '1663777829000',
                routeStatus: 'ARRIVEDTODESTINATION',
                routeName: 'Caseta General Bravo - Cerveza Corona De Los Altos',
                DestinationTime: {
                    ETA: 1663627534128,
                    delayToDestination: 0,
                    target: 1663627534128
                },
                currentSection: {
                    elapsedTime: 10,
                    exceededTime: 0,
                    name: 'Cerveza Corona De Los Altos'
                },
                lastTransition: {
                    name: 'Cerveza Corona De Los Altos',
                    timestamp: '1663627534128',
                    type: 'Entrada'
                }
            }
        },
        {
            GPSStatus: 'online',
            Name: 'U02',
            RouteStatus: 'ontime',
            Server: 'a3vip',
            ShortName: 'U02',
            VehicleId: '2587',
            Data: {
                dissociateTime: 0,
                GPSStatus: 'ONLINE',
                GPSStatusTime: 3,
                GPSTimestamp: '1663777829000',
                routeStatus: 'ONTIME',
                routeName: 'Caseta General Bravo - Cerveza Corona De Los Altos',
                DestinationTime: {
                    ETA: 1663627534128,
                    delayToDestination: -5,
                    target: 1663627534128
                },
                currentSection: {
                    elapsedTime: 15,
                    exceededTime: 1,
                    name: 'Traslado a Caseta La Joya'
                },
                lastTransition: {
                    name: 'Caseta General Bravo',
                    timestamp: '1663627534128',
                    type: 'Salida'
                }
            }
        },
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

describe('editRoute', () => {
    test('Should display the editRoute', async () => {
        const { getByLabelText } = render(<EditRoute />);
        await waitFor(() => expect(getByLabelText('editRoute-container')).toBeInTheDocument());
    });

    test('Should have an error when try to load the data', async () => {
        useRouter.mockImplementation(() => ({
            query: { id: '2Ctw2rbXszU6HPTbcCt9TbxIfEH' }
        }));

        await act(async () => {
            APIMock.get.mockRejectedValueOnce();
            const { queryByText } = render(<EditRoute />);
            const get = jest.spyOn(useApi(), 'get');

            await waitFor(() => expect(get).toBeCalled());
            await waitFor(() =>
                expect(
                    queryByText('Caseta General Bravo - Caseta Libramiento Mexicali')
                ).not.toBeInTheDocument()
            );
        });
    });

    test('Should display the editRoute with data', async () => {
        useRouter.mockImplementation(() => ({
            query: { id: '2Ctw2rbXszU6HPTbcCt9TbxIfEH' }
        }));

        await act(async () => {
            APIMock.get.mockResolvedValue(Promise.resolve(returnValue));
            const { getByText, getByDisplayValue } = render(<EditRoute />);
            const get = jest.spyOn(useApi(), 'get');

            await waitFor(() => expect(get).toBeCalled());
            await waitFor(() =>
                expect(
                    getByText('Caseta General Bravo - Caseta Libramiento Mexicali')
                ).toBeInTheDocument()
            );
            await waitFor(() =>
                expect(
                    getByDisplayValue('La mejor ruta del mundo')
                ).toBeInTheDocument()
            );
        });
    });

    test('Should display the geofances modal & save correctly in the modal', async () => {
        useRouter.mockImplementation(() => ({
            query: { id: '2Ctw2rbXszU6HPTbcCt9TbxIfEH' }
        }));

        await act(async () => {
            APIMock.get.mockResolvedValue(Promise.resolve(returnValue));
            const {
                getByText,
                getByLabelText,
                getAllByLabelText,
                queryByRole,
                getByRole
            } = render(<EditRoute />);
            const get = jest.spyOn(useApi(), 'get');

            await waitFor(() => expect(get).toBeCalled());
            await waitFor(() =>
                expect(
                    getByText('Caseta General Bravo - Caseta Libramiento Mexicali')
                ).toBeInTheDocument()
            );

            await waitFor(() => expect(getByLabelText('editRoute-container')).toBeInTheDocument());

            const modalButton = getByLabelText('newRoute-modalButton');
            await waitFor(() => expect(modalButton).toBeInTheDocument());
            fireEvent.click(modalButton);
            await waitFor(() => expect(getByRole('dialog')).toBeInTheDocument());

            const saveButton = getByLabelText('AsyncModal-SaveButton');
            fireEvent.click(saveButton);

            await waitFor(() => expect(queryByRole('dialog')).not.toBeInTheDocument());

            await waitFor(() =>
                expect(getAllByLabelText('geofencesTable-sectionTime')[0]).toHaveTextContent('10')
            );
        });
    });

    test('Should can edit some field and save correctly', async () => {
        useRouter.mockImplementation(() => ({
            query: { id: '2Ctw2rbXszU6HPTbcCt9TbxIfEH' }
        }));

        await act(async () => {
            APIMock.get.mockResolvedValue(Promise.resolve(returnValue));
            APIMock.put.mockImplementation(
                jest.fn(() => ({ mutate: jest.fn(() => Promise.resolve('success')) }))
            );
            APIMock.put.mockResolvedValueOnce(Promise.resolve({ message: 'success', id: 345 }));
            const {
                getByText,
                getByDisplayValue,
                getAllByLabelText,
                getByLabelText
            } = render(<EditRoute />);

            const get = jest.spyOn(useApi(), 'get');
            const put = jest.spyOn(useApi(), 'put');

            await waitFor(() => expect(get).toBeCalled());
            await waitFor(() =>
                expect(
                    getByText('Caseta General Bravo - Caseta Libramiento Mexicali')
                ).toBeInTheDocument()
            );

            fireEvent.change(
                getByDisplayValue('La mejor ruta del mundo'),
                { target: { value: 'Una descripción mas' } }
            );

            await waitFor(() =>
                expect(
                    getByDisplayValue('Una descripción mas')
                ).toBeInTheDocument()
            );

            const editButton = getAllByLabelText('geofencesTable-editButton')[0];
            expect(editButton).toBeInTheDocument();
            expect(editButton).toBeEnabled();

            fireEvent.click(editButton);

            const transitTimeEditElement = await waitFor(() =>
                getByLabelText('geofencesTable-editTransitSectionTime')
            );
            expect(transitTimeEditElement).toBeInTheDocument();
            await waitFor(() => expect(transitTimeEditElement).toHaveValue('20'));

            await waitFor(() => fireEvent.click(transitTimeEditElement));
            await waitFor(() => fireEvent.change(
                transitTimeEditElement,
                { target: { value: 25 } }
            ));

            const saveButton = getByLabelText('geofencesTable-saveButton');
            await waitFor(() => expect(saveButton).toBeEnabled());
            await waitFor(() => fireEvent.click(saveButton));
            await waitFor(() => expect(saveButton).not.toBeInTheDocument());

            await waitFor(() => fireEvent.click(getByLabelText('formElement-submitButton')));
            await waitFor(() => expect(put).toBeCalled());
        });
    });

    test('Should can edit some field incorrectly and get an error when try to save', async () => {
        useRouter.mockImplementation(() => ({
            query: { id: '2Ctw2rbXszU6HPTbcCt9TbxIfEH' }
        }));

        await act(async () => {
            APIMock.get.mockResolvedValue(Promise.resolve(returnValue));
            APIMock.put.mockImplementation(
                jest.fn(() => ({ mutate: jest.fn(() => Promise.resolve({ updated: false })) }))
            );
            APIMock.put.mockRejectedValue();
            const { getByText, getAllByLabelText, getByLabelText } = render(<EditRoute />);

            const get = jest.spyOn(useApi(), 'get');
            const put = jest.spyOn(useApi(), 'put');

            await waitFor(() => expect(get).toBeCalled());
            await waitFor(() =>
                expect(
                    getByText('Caseta General Bravo - Caseta Libramiento Mexicali')
                ).toBeInTheDocument()
            );

            const editButton = getAllByLabelText('geofencesTable-editButton')[0];
            expect(editButton).toBeInTheDocument();
            expect(editButton).toBeEnabled();

            fireEvent.click(editButton);

            const transitTimeEditElement = await waitFor(() =>
                getByLabelText('geofencesTable-editTransitSectionTime')
            );
            expect(transitTimeEditElement).toBeInTheDocument();
            await waitFor(() => expect(transitTimeEditElement).toHaveValue('20'));

            await waitFor(() => fireEvent.click(transitTimeEditElement));
            await waitFor(() => fireEvent.change(
                transitTimeEditElement,
                { target: { value: 0 } }
            ));

            const saveButton = getByLabelText('geofencesTable-saveButton');
            await waitFor(() => expect(saveButton).toBeEnabled());
            await waitFor(() => fireEvent.click(saveButton));
            await waitFor(() => expect(saveButton).not.toBeInTheDocument());

            await waitFor(() => fireEvent.click(getByLabelText('formElement-submitButton')));
            await waitFor(() => expect(put).toBeCalled());

            fireEvent.click(getAllByLabelText('geofencesTable-deleteButton')[0]);

            await waitFor(() => fireEvent.click(getByLabelText('formElement-submitButton')));
            await waitFor(() => expect(put).toBeCalled());
        });
    });

    test('Should show the associate vehicles when edit route', async () => {
        useRouter.mockImplementation(() => ({
            query: { id: '2Ctw2rbXszU6HPTbcCt9TbxIfEH' }
        }));

        await act(async () => {
            APIMock.get
                .mockResolvedValueOnce(Promise.resolve(returnValue))
                .mockResolvedValueOnce(Promise.resolve(returnValue))
                .mockResolvedValue(Promise.resolve(returnVehiclesInRouteValue));
            const { getByText, getByLabelText } = render(<EditRoute />);

            const get = jest.spyOn(useApi(), 'get');

            await waitFor(() => expect(get).toBeCalled());
            await waitFor(() =>
                expect(
                    getByText('Caseta General Bravo - Caseta Libramiento Mexicali')
                ).toBeInTheDocument()
            );

            expect(
                getByText('No puedes editar la ruta, ya que tienes 2 vehículo(s) vinculado(s) a ella.')
            ).toBeInTheDocument();

            const desassociateVehiclesButton = await waitFor(() =>
                getByLabelText('desasociateButton')
            );
            expect(desassociateVehiclesButton).toBeInTheDocument();
            expect(desassociateVehiclesButton).toBeEnabled();
        });
    });

    test('Should can delete the route correctly', async () => {
        useRouter.mockImplementation(() => ({
            query: { id: '2Ctw2rbXszU6HPTbcCt9TbxIfEH' }
        }));

        await act(async () => {
            APIMock.get.mockResolvedValue(Promise.resolve(returnValue));
            APIMock.put.mockImplementation(
                jest.fn(() => ({ mutate: jest.fn(() => Promise.resolve('success')) }))
            );
            APIMock.del.mockResolvedValueOnce(Promise.resolve('success'));
            const {
                getByText,
            } = render(<EditRoute />);

            const get = jest.spyOn(useApi(), 'get');
            const del = jest.spyOn(useApi(), 'del');

            await waitFor(() => expect(get).toBeCalled());
            await waitFor(() =>
                expect(
                    getByText('Caseta General Bravo - Caseta Libramiento Mexicali')
                ).toBeInTheDocument()
            );

            await waitFor(() => expect(getByText('Eliminar')).toBeInTheDocument());
            await waitFor(() => expect(getByText('Eliminar')).toBeEnabled());

            await waitFor(() => fireEvent.click(getByText('Eliminar')));
            await waitFor(() => expect(del).toBeCalled());
        });
    }, 10000);
});
