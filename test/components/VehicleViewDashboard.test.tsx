import React from 'react';
import { waitFor, fireEvent } from '@testing-library/dom';
import { cleanup } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import API from '@aws-amplify/api';
import { useApi } from '@/hooks/Api';

import VehiclesView from '@/components/forDashboard/vehicles';
import { render } from '../__mocks__/utils';

const APIMock = API as jest.MockedFunction<any>;

afterEach(() => {
    jest.clearAllMocks();
    APIMock.get.mockClear();
    cleanup();
    window.document.body.innerHTML = '';
});

const returnVehiclesInRouteValue = {
    Count: 5,
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
        {
            GPSStatus: 'online',
            Name: '474',
            RouteStatus: 'delay',
            Server: 'a3vip',
            ShortName: '474',
            VehicleId: '2601',
            Data: {
                dissociateTime: 0,
                GPSStatus: 'ONLINE',
                GPSStatusTime: 1,
                GPSTimestamp: '1663777829000',
                routeStatus: 'DELAY',
                routeName: 'Caseta General Bravo - Cerveza Corona De Los Altos',
                DestinationTime: {
                    ETA: 1663627534128,
                    delayToDestination: 1,
                    target: 1663627534128
                },
                currentSection: {
                    elapsedTime: 5,
                    exceededTime: 0,
                    name: 'Traslado a La Rumorosa 2'
                },
                lastTransition: {
                    name: 'La Rumorosa',
                    timestamp: '1663627534128',
                    type: 'Salida'
                }
            }
        },
        {
            GPSStatus: 'offline',
            Name: 'T1112',
            RouteStatus: 'late',
            Server: 'a3vip',
            ShortName: 'T1112',
            VehicleId: '2609',
            Data: {
                dissociateTime: 0,
                GPSStatus: 'OFFLINE',
                GPSStatusTime: 20,
                GPSTimestamp: '1663777829000',
                routeStatus: 'LATE',
                routeName: 'Caseta General Bravo - Cerveza Corona De Los Altos',
                DestinationTime: {
                    ETA: 1663627534128,
                    delayToDestination: 12,
                    target: 1663627534128
                },
                currentSection: {
                    elapsedTime: 25,
                    exceededTime: 5,
                    name: 'Cervezas Modelo En Zacatecas'
                },
                lastTransition: {
                    name: 'Cervezas Modelo En Zacatecas',
                    timestamp: '1663627534128',
                    type: 'Entrada'
                }
            }
        },
        {
            GPSStatus: 'standby',
            Name: '421',
            RouteStatus: 'onhold',
            Server: 'a3vip',
            ShortName: '421',
            VehicleId: '2614',
            Data: {
                dissociateTime: 0,
                GPSStatus: 'STANDBY',
                GPSStatusTime: 0,
                GPSTimestamp: '1663777829000',
                routeStatus: 'ONHOLD',
                routeName: 'Tijuana - El Hongo',
                DestinationTime: {},
                currentSection: {},
                lastTransition: {}
            }
        }
    ],
    LastEvaluatedKey: {}
};

describe('VehicleViewDashboard', () => {
    test('Should display the table and sort some columns', async () => {
        APIMock.get.mockResolvedValue(Promise.resolve(returnVehiclesInRouteValue));

        await act(async () => {
            const { getAllByLabelText, getByText } = render(<VehiclesView />);
            const get = jest.spyOn(useApi(), 'get');
            await waitFor(() => expect(get).toBeCalled());

            act(() => {
                fireEvent.click(getAllByLabelText('caret-up')[0]);
            });
            await waitFor(() => expect(getByText('421')).toBeInTheDocument());

            act(() => {
                fireEvent.click(getAllByLabelText('caret-up')[1]);
            });
            await waitFor(() => expect(getByText('Tijuana - El Hongo')).toBeInTheDocument());

            act(() => {
                fireEvent.click(getAllByLabelText('caret-up')[2]);
            });
            await waitFor(() => expect(getByText('(+1 MIN)')).toBeInTheDocument());
        });
    });
});
