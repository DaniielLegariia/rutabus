import React from 'react';
import { fireEvent, waitFor } from '@testing-library/dom';
import { cleanup } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import API from '@aws-amplify/api';
import { useApi } from '@/hooks/Api';

import RouteCard from '@/components/forDashboard/routes/routeCard';
import { render } from '../__mocks__/utils';

const APIMock = API as jest.MockedFunction<any>;

afterEach(() => {
    jest.clearAllMocks();
    APIMock.get.mockClear();
    APIMock.put.mockClear();
    cleanup();
    window.document.body.innerHTML = '';
});

const returnRouteDetailsValue = {
    Route: {},
    Steps: [
        {
            Config: {
                MinutesToDestination: 55,
                tolerance: {
                    SectionTime: 5
                }
            },
            Transit: {
                MinutesToDestination: 50,
                tolerance: {
                    SectionTime: 25
                },
                Name: 'Traslado a Caseta General Bravo'
            },
            Type: 'Step',
            ShortName: 'Caseta 1',
            RouteID: '2DPYdtkWbuXBeRvrxHYp9tCYmp0',
            StepID: 1,
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
            Transit: {
                MinutesToDestination: 0,
                tolerance: {
                    SectionTime: 0
                },
                Name: ''
            },
            Type: 'Step',
            ShortName: 'Caseta 2',
            RouteID: '2DPYdtkWbuXBeRvrxHYp9tCYmp0',
            StepID: 2,
            isFinal: false,
            Name: 'Caseta General Bravo'
        }
    ]
};

const vehiclesModal = {
    Count: 1,
    Items: [
        {
            GPSStatus: 'online',
            Name: '505',
            RouteStatus: 'withoutroute',
            Server: 'a3vip',
            ShortName: '505',
            VehicleId: '2603',
            Data: {
                dissociateTime: 0,
                GPSTimestamp: '1663777829000',
                DestinationTime: {},
                currentSection: {},
                lastTransition: {}
            }
        }
    ],
    LastEvaluatedKey: {}
};

const returnVehiclesInRouteValue = {
    Count: 3,
    Vehicles: [
        {
            RouteStatus: 'late',
            ShortName: '457',
            Name: '457',
            PK: 'VEHICLE#a3vip#2636',
            Data: {
                dissociateTime: 0,
                GPSTimestamp: '1663777829000',
                DestinationTime: {
                    ETA: 1663627656422,
                    delayToDestination: 9,
                    target: 1663627534128
                },
                currentSection: {
                    elapsedTime: 10,
                    exceededTime: 1,
                    name: 'Caseta La Joya'
                },
                lastTransition: {
                    name: 'Caseta La Joya',
                    timestamp: '1663627229000',
                    type: 'Entrada'
                }
            }
        },
        {
            RouteStatus: 'ontime',
            ShortName: '505',
            Name: '505',
            PK: 'VEHICLE#a3vip#2603',
            Data: {
                dissociateTime: 0,
                GPSTimestamp: '1663777829000',
                DestinationTime: {
                    ETA: 1663627656422,
                    delayToDestination: -2,
                    target: 1663627534128
                },
                currentSection: {
                    elapsedTime: 1,
                    exceededTime: 1,
                    name: 'Caseta La Joya'
                },
                lastTransition: {
                    name: 'Caseta La Joya',
                    timestamp: '1663627229000',
                    type: 'Entrada'
                }
            }
        },
        {
            RouteStatus: '',
            ShortName: '405',
            Name: '405',
            PK: 'VEHICLE#a3vip#2019',
            Data: {
                dissociateTime: 0,
                GPSTimestamp: '1663777829000',
                DestinationTime: {
                    ETA: 1663627656422,
                    delayToDestination: 0,
                    target: 1663627534128
                },
                currentSection: {
                    elapsedTime: 0,
                    exceededTime: 0,
                    name: 'Caseta General Bravo'
                },
                lastTransition: {
                    name: 'Caseta La Joya',
                    timestamp: '1663627229000',
                    type: 'Salida'
                }
            }
        }
    ],
    LastEvaluatedKey: {}
};

const returnVehiclesInRouteValue2 = {
    Count: 2,
    Vehicles: [
        {
            RouteStatus: 'late',
            ShortName: '457',
            Name: '457',
            PK: 'VEHICLE#a3vip#2636',
            Data: {
                dissociateTime: 0,
                GPSTimestamp: '1663777829000',
                DestinationTime: {
                    ETA: 1663627656422,
                    delayToDestination: 9,
                    target: 1663627534128
                },
                currentSection: {
                    elapsedTime: 10,
                    exceededTime: 1,
                    name: 'Caseta La Joya'
                },
                lastTransition: {
                    name: 'Caseta La Joya',
                    timestamp: '1663627229000',
                    type: 'Entrada'
                }
            }
        },
        {
            RouteStatus: 'ontime',
            ShortName: '505',
            Name: '505',
            PK: 'VEHICLE#a3vip#2603',
            Data: {
                dissociateTime: 0,
                GPSTimestamp: '1663777829000',
                DestinationTime: {
                    ETA: 1663627656422,
                    delayToDestination: 0,
                    target: 1663627534128
                },
                currentSection: {
                    elapsedTime: 1,
                    exceededTime: 1,
                    name: 'Traslado a Caseta General Bravo'
                },
                lastTransition: {
                    name: 'Caseta La Joya',
                    timestamp: '1663627229000',
                    type: 'Salida'
                }
            }
        }
    ],
    LastEvaluatedKey: {}
};

const returnVehiclesInRouteValue3 = {
    Count: 2,
    Vehicles: [
        {
            RouteStatus: 'ontime',
            ShortName: '457',
            Name: '457',
            PK: 'VEHICLE#a3vip#2636',
            Data: {
                dissociateTime: 0,
                GPSTimestamp: '1663777829000',
                DestinationTime: {
                    ETA: 1663627656422,
                    delayToDestination: 0,
                    target: 1663627534128
                },
                currentSection: {
                    elapsedTime: 10,
                    exceededTime: 0,
                    name: 'Caseta La Joya'
                },
                lastTransition: {
                    name: 'Caseta La Joya',
                    timestamp: '1663627229000',
                    type: 'Entrada'
                }
            }
        },
        {
            RouteStatus: 'delay',
            ShortName: '505',
            Name: '505',
            PK: 'VEHICLE#a3vip#2603',
            Data: {
                dissociateTime: 0,
                GPSTimestamp: '1663777829000',
                DestinationTime: {
                    ETA: 1663627656422,
                    delayToDestination: 0,
                    target: 1663627534128
                },
                currentSection: {
                    elapsedTime: 5,
                    exceededTime: 0,
                    name: 'Traslado a Caseta General Bravo'
                },
                lastTransition: {
                    name: 'Caseta La Joya',
                    timestamp: '1663627229000',
                    type: 'Salida'
                }
            }
        }
    ],
    LastEvaluatedKey: {}
};

const returnVehiclesInRouteValue4 = {
    Count: 3,
    Vehicles: [
        {
            RouteStatus: 'ontime',
            ShortName: '457',
            Name: '457',
            PK: 'VEHICLE#a3vip#2636',
            Data: {
                dissociateTime: 0,
                GPSTimestamp: '1663777829000',
                DestinationTime: {
                    ETA: 1663627656422,
                    delayToDestination: 0,
                    target: 1663627534128
                },
                currentSection: {
                    elapsedTime: 10,
                    exceededTime: 0,
                    name: 'Caseta General Bravo'
                },
                lastTransition: {
                    name: 'Caseta General Bravo',
                    timestamp: '1663627229000',
                    type: 'Entrada'
                }
            }
        },
        {
            RouteStatus: 'delay',
            ShortName: '505',
            Name: '505',
            PK: 'VEHICLE#a3vip#2603',
            Data: {
                dissociateTime: 0,
                GPSTimestamp: '1663777829000',
                DestinationTime: {
                    ETA: 1663627656422,
                    delayToDestination: 0,
                    target: 1663627534128
                },
                currentSection: {
                    elapsedTime: 5,
                    exceededTime: 0,
                    name: 'Traslado a Caseta General Bravo'
                },
                lastTransition: {
                    name: 'Caseta La Joya',
                    timestamp: '1663627229000',
                    type: 'Salida'
                }
            }
        },
        {
            RouteStatus: 'ontime',
            ShortName: '433D',
            Name: '433D',
            PK: 'VEHICLE#a3vip#2640',
            Data: {
                dissociateTime: 0,
                GPSTimestamp: '1663777829000',
                DestinationTime: {
                    ETA: 1663627656422,
                    delayToDestination: 0,
                    target: 1663627534128
                },
                currentSection: {
                    elapsedTime: 10,
                    exceededTime: 0,
                    name: 'Caseta General Bravo'
                },
                lastTransition: {
                    name: 'Caseta General Bravo',
                    timestamp: '1663627229000',
                    type: 'Entrada'
                }
            }
        }
    ],
    LastEvaluatedKey: {}
};

const returnVehiclesInRouteValue5 = {
    Count: 3,
    Vehicles: [
        {
            RouteStatus: 'ontime',
            ShortName: '457',
            Name: '457',
            PK: 'VEHICLE#a3vip#2636',
            Data: {
                dissociateTime: 0,
                GPSTimestamp: '1663777829000',
                DestinationTime: {
                    ETA: 1663627656422,
                    delayToDestination: 0,
                    target: 1663627534128
                },
                currentSection: {
                    elapsedTime: 10,
                    exceededTime: 0,
                    name: 'Traslado a Caseta General Bravo'
                },
                lastTransition: {
                    name: 'Caseta La Joya',
                    timestamp: '1663627229000',
                    type: 'Salida'
                }
            }
        },
        {
            RouteStatus: 'delay',
            ShortName: '505',
            Name: '505',
            PK: 'VEHICLE#a3vip#2603',
            Data: {
                dissociateTime: 0,
                GPSTimestamp: '1663777829000',
                DestinationTime: {
                    ETA: 1663627656422,
                    delayToDestination: 0,
                    target: 1663627534128
                },
                currentSection: {
                    elapsedTime: 5,
                    exceededTime: 0,
                    name: 'Caseta General Bravo'
                },
                lastTransition: {
                    name: 'Caseta General Bravo',
                    timestamp: '1663627229000',
                    type: 'Entrada'
                }
            }
        },
        {
            RouteStatus: 'ontime',
            ShortName: '433D',
            Name: '433D',
            PK: 'VEHICLE#a3vip#2640',
            Data: {
                dissociateTime: 0,
                GPSTimestamp: '1663777829000',
                DestinationTime: {
                    ETA: 1663627656422,
                    delayToDestination: 0,
                    target: 1663627534128
                },
                currentSection: {
                    elapsedTime: 10,
                    exceededTime: 0,
                    name: 'Traslado a Caseta General Bravo'
                },
                lastTransition: {
                    name: 'Caseta La Joya',
                    timestamp: '1663627229000',
                    type: 'Salida'
                }
            }
        }
    ],
    LastEvaluatedKey: {}
};

describe('RouteCard', () => {
    test('Should select some vehicles and associate to route', async () => {
        APIMock.get
            .mockResolvedValueOnce(Promise.resolve(vehiclesModal))
            .mockResolvedValueOnce(Promise.resolve(returnRouteDetailsValue))
            .mockResolvedValue(Promise.resolve(vehiclesModal));

        await act(async () => {
            const { getByLabelText, getAllByLabelText, getByText, getByRole } = render(<RouteCard
              routeId="2DPYdtkWbuXBeRvrxHYp9tCYmp0"
              name="Caseta La Joya - Caseta General Bravo"
            />);
            const get = jest.spyOn(useApi(), 'get');
            const put = jest.spyOn(useApi(), 'put');
            await waitFor(() => expect(get).toBeCalled());

            await waitFor(() => expect(getByLabelText('RouteCard')).toBeInTheDocument());
            await waitFor(() => expect(getByText('Asignar vehículo')).toBeInTheDocument());
            await act(async () => {
                fireEvent.click(getByText('Asignar vehículo'));
                await waitFor(() => expect(getByRole('dialog')).toBeInTheDocument());
            });

            await act(async () => {
                const checkVehicle = await waitFor(
                    () => getAllByLabelText('AsyncModal-ListItem')[0]);
                await waitFor(() => expect(checkVehicle).toBeInTheDocument());
                fireEvent.click(checkVehicle);
            });

            await act(async () => {
                const saveButton = getByLabelText('AsyncModal-SaveButton');
                await waitFor(() => expect(saveButton).toBeInTheDocument());
                await waitFor(() => expect(saveButton).toBeEnabled());

                fireEvent.click(saveButton);
            });

            await waitFor(() => expect(put).toBeCalled());
        });
    });

    test('Should display two vehicles in a step', async () => {
        APIMock.get
            .mockResolvedValueOnce(Promise.resolve(returnRouteDetailsValue))
            .mockResolvedValueOnce(Promise.resolve(returnRouteDetailsValue))
            .mockResolvedValue(Promise.resolve(returnVehiclesInRouteValue));

        await act(async () => {
            const { getByLabelText, getByText } = render(<RouteCard
              routeId="2DPYdtkWbuXBeRvrxHYp9tCYmp0"
              name="Caseta La Joya - Caseta General Bravo"
            />);
            const get = jest.spyOn(useApi(), 'get');
            await waitFor(() => expect(get).toBeCalled());

            await waitFor(() => expect(getByLabelText('RouteCard')).toBeInTheDocument());
            await waitFor(() => expect(getByText('Caseta 1')).toBeInTheDocument());
            await waitFor(() => expect(getByLabelText('buses')).toBeInTheDocument());
        });
    });

    test('Should display one vehicle in step and one vehicle in transit', async () => {
        APIMock.get
            .mockResolvedValueOnce(Promise.resolve(returnRouteDetailsValue))
            .mockResolvedValueOnce(Promise.resolve(returnRouteDetailsValue))
            .mockResolvedValue(Promise.resolve(returnVehiclesInRouteValue2));

        await act(async () => {
            const { getByLabelText, getAllByLabelText, getByText } = render(<RouteCard
              routeId="2DPYdtkWbuXBeRvrxHYp9tCYmp0"
              name="Caseta La Joya - Caseta General Bravo"
            />);
            const get = jest.spyOn(useApi(), 'get');
            await waitFor(() => expect(get).toBeCalled());

            await waitFor(() => expect(getByLabelText('RouteCard')).toBeInTheDocument());
            await waitFor(() => expect(getByText('Caseta 2')).toBeInTheDocument());
            await waitFor(() => expect(getAllByLabelText('bus')[0]).toBeInTheDocument());
            await waitFor(() => expect(getByText('+9')).toBeInTheDocument());
        });
    });

    test(
        'Should display one vehicle in step and one vehicle in transit with diferent status',
        async () => {
        APIMock.get
            .mockResolvedValueOnce(Promise.resolve(returnRouteDetailsValue))
            .mockResolvedValueOnce(Promise.resolve(returnRouteDetailsValue))
            .mockResolvedValue(Promise.resolve(returnVehiclesInRouteValue3));

        await act(async () => {
            const { getByLabelText, getAllByLabelText, getByText } = render(<RouteCard
              routeId="2DPYdtkWbuXBeRvrxHYp9tCYmp0"
              name="Caseta La Joya - Caseta General Bravo"
            />);
            const get = jest.spyOn(useApi(), 'get');
            await waitFor(() => expect(get).toBeCalled());

            await waitFor(() => expect(getByLabelText('RouteCard')).toBeInTheDocument());
            await waitFor(() => expect(getByText('Caseta 1')).toBeInTheDocument());
            await waitFor(() => expect(getByText('Caseta 2')).toBeInTheDocument());
            await waitFor(() => expect(getAllByLabelText('bus')[0]).toBeInTheDocument());
            await waitFor(() => expect(getByText('0')).toBeInTheDocument());
        });
    });

    test(
        'Should display two vehicle in step ontime and one in transit with the same status',
        async () => {
        APIMock.get
            .mockResolvedValueOnce(Promise.resolve(returnRouteDetailsValue))
            .mockResolvedValueOnce(Promise.resolve(returnRouteDetailsValue))
            .mockResolvedValue(Promise.resolve(returnVehiclesInRouteValue4));

        await act(async () => {
            const { getByLabelText, getAllByLabelText, getByText } = render(<RouteCard
              routeId="2DPYdtkWbuXBeRvrxHYp9tCYmp0"
              name="Caseta La Joya - Caseta General Bravo"
            />);
            const get = jest.spyOn(useApi(), 'get');
            await waitFor(() => expect(get).toBeCalled());

            await waitFor(() => expect(getByLabelText('RouteCard')).toBeInTheDocument());
            await waitFor(() => expect(getByText('Caseta 1')).toBeInTheDocument());
            await waitFor(() => expect(getByLabelText('buses')).toBeInTheDocument());
            await waitFor(() => expect(getAllByLabelText('bus')[0]).toBeInTheDocument());
            await waitFor(() => expect(getByText('0')).toBeInTheDocument());
        });
    });

    test(
        'Should display two vehicle in transit ontime and one in step with the delay status',
        async () => {
        APIMock.get
            .mockResolvedValueOnce(Promise.resolve(returnRouteDetailsValue))
            .mockResolvedValueOnce(Promise.resolve(returnRouteDetailsValue))
            .mockResolvedValue(Promise.resolve(returnVehiclesInRouteValue5));

        await act(async () => {
            const { getByLabelText, getAllByLabelText, getByText } = render(<RouteCard
              routeId="2DPYdtkWbuXBeRvrxHYp9tCYmp0"
              name="Caseta La Joya - Caseta General Bravo"
            />);
            const get = jest.spyOn(useApi(), 'get');
            await waitFor(() => expect(get).toBeCalled());

            await waitFor(() => expect(getByLabelText('RouteCard')).toBeInTheDocument());
            await waitFor(() => expect(getByText('Caseta 1')).toBeInTheDocument());
            await waitFor(() => expect(getByLabelText('buses')).toBeInTheDocument());
            await waitFor(() => expect(getAllByLabelText('bus')[0]).toBeInTheDocument());
            await waitFor(() => expect(getByText('0')).toBeInTheDocument());
        });
    });

    test('Should display vehicles in step popover and can disassociate a one vehícle', async () => {
        APIMock.get
            .mockResolvedValueOnce(Promise.resolve(returnRouteDetailsValue))
            .mockResolvedValueOnce(Promise.resolve(returnRouteDetailsValue))
            .mockResolvedValue(Promise.resolve(returnVehiclesInRouteValue2));

        await act(async () => {
            const { getByLabelText, getByText, getAllByText } = render(<RouteCard
              routeId="2DPYdtkWbuXBeRvrxHYp9tCYmp0"
              name="Caseta La Joya - Caseta General Bravo"
            />);
            const get = jest.spyOn(useApi(), 'get');
            const put = jest.spyOn(useApi(), 'put');
            await waitFor(() => expect(get).toBeCalled());

            await waitFor(() => expect(getByLabelText('RouteCard')).toBeInTheDocument());
            await waitFor(() => expect(getByText('vehículo(s) asignado(s)')).toBeInTheDocument());
            await act(async () => {
                fireEvent.mouseOver(getByText('vehículo(s) asignado(s)'));
                await waitFor(() => expect(getByLabelText('vehiclesInRouteContent')).toBeInTheDocument());
            });

            await act(async () => {
                const desassociateButton = await waitFor(
                    () => getAllByText('Desasociar')[0]);
                await waitFor(() => expect(desassociateButton).toBeInTheDocument());
                fireEvent.click(desassociateButton);
            });

            await waitFor(() => expect(put).toBeCalled());
        });
    });
});
