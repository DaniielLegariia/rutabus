import React from 'react';
import { waitFor, fireEvent } from '@testing-library/dom';
import { cleanup } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import API from '@aws-amplify/api';
import { useApi } from '@/hooks/Api';

import VehicleRecord from '@/pages/report/vehicles';
import { render } from '../__mocks__/utils';

const APIMock = API as jest.MockedFunction<any>;

afterEach(() => {
    jest.clearAllMocks();
    APIMock.get.mockClear();
    cleanup();
    window.document.body.innerHTML = '';
});

const selectResponse = {
    Count: 2,
    Items: [
        {
            Name: '505',
            Server: 'a3vip',
            VehicleId: '2603'
        },
        {
            Name: '467',
            Server: 'a3vip',
            VehicleId: '4836'
        }
    ],
    LastEvaluatedKey: {}
};

const recordResponse = {
    Count: 1,
    Items: [
        {
            Name: '467',
            RouteStatus: 'late',
            Server: 'a3vip',
            ShortName: '467',
            VehicleId: '4836',
            Data: {
                DestinationTime: {
                    ETA: 1665019136458,
                    delayToDestination: 202,
                    target: 1665006958716
                },
                GPSStatus: 'ONLINE',
                GPSStatusTime: 1,
                GPSTimestamp: '1665003719000',
                currentSection: {
                    elapsedTime: 0,
                    exceededTime: 5,
                    name: 'Traslado a MEZCALES'
                },
                dissociateTime: 0,
                lastTransition: {
                    name: 'CARLOS KM. 39',
                    timestamp: '1665003719000',
                    type: 'Salida'
                },
                routeName: 'km 21 GDL - TEP - GEPP VALLARTA',
                routeStatus: 'LATE'
            }
        },
        {
            Name: '467',
            RouteStatus: 'onhold',
            Server: 'a3vip',
            ShortName: '467',
            VehicleId: '4836',
            Data: {
                DestinationTime: {
                    ETA: 1665019136658,
                    delayToDestination: 0,
                    target: 1665006958766
                },
                GPSStatus: 'ONLINE',
                GPSStatusTime: 0,
                GPSTimestamp: '1665003779000',
                currentSection: {
                    elapsedTime: 0,
                    exceededTime: 2,
                    name: 'VALLARTA'
                },
                dissociateTime: 0,
                lastTransition: {
                    name: 'CARLOS KM. 39',
                    timestamp: '1665003719000',
                    type: 'Entrada'
                },
                routeName: 'km 21 GDL - TEP - GEPP VALLARTA',
                routeStatus: 'ONHOLD'
            }
        },
        {
            Name: '467',
            RouteStatus: 'onhold',
            Server: 'a3vip',
            ShortName: '467',
            VehicleId: '4836',
            Data: {
                DestinationTime: {
                    ETA: 1665017136658,
                    delayToDestination: 0,
                    target: 1665016958766
                },
                GPSStatus: 'ONLINE',
                GPSStatusTime: 0,
                GPSTimestamp: '1665003479000',
                currentSection: {
                    elapsedTime: 0,
                    exceededTime: 2,
                    name: 'MARIAS'
                },
                dissociateTime: 0,
                lastTransition: {
                    name: 'CARLOS KM. 39',
                    timestamp: '1665003719000',
                    type: 'Entrada'
                },
                routeName: 'km 21 GDL - TEP - GEPP VALLARTA',
                routeStatus: 'ONHOLD'
            }
        }
    ],
    LastEvaluatedKey: {}
};

describe('VehicleRecord View', () => {
    test('Should display the vehicle record page', async () => {
        const { getByLabelText } = render(<VehicleRecord />);
        await waitFor(() => expect(getByLabelText('vehicleRecordView')).toBeInTheDocument());
    });

    test('Should display the vehicle record table and change the vehicle data', async () => {
        APIMock.get.mockResolvedValueOnce(Promise.resolve(selectResponse))
                .mockResolvedValue(Promise.resolve(recordResponse));

        const {
            getAllByLabelText,
            getByText,
            getAllByText,
            getByLabelText,
            getByRole
        } = render(<VehicleRecord />);
        const get = jest.spyOn(useApi(), 'get');

        await act(async () => {
            await waitFor(() => expect(get).toBeCalled());

            await waitFor(() => expect(getByLabelText('vehicleRecordView')).toBeInTheDocument());
            await waitFor(() => expect(getByRole('combobox')).toBeInTheDocument());
            await waitFor(() => expect(getByRole('combobox')).toBeEnabled());

            await waitFor(() => fireEvent.change(
                getByRole('combobox'),
                { target: { value: 'a3vip#4836' } }
            ));

            await waitFor(() => fireEvent.click(getByText('467')));

            act(async () => {
                await waitFor(() =>
                    expect(getAllByLabelText('caret-up')[0]).toBeInTheDocument()
                );
                fireEvent.click(getAllByLabelText('caret-up')[0]);
            });
            await waitFor(() => expect(getByText('Traslado a MEZCALES')).toBeInTheDocument());

            fireEvent.mouseDown(getByLabelText('datePicker'));
            fireEvent.change(getByLabelText('datePicker'), { target: { value: '2022-12-20' } });
            // fireEvent.click(document.querySelectorAll('.ant-picker-cell-selected')[0]);
            fireEvent.click(getByLabelText('search-button'));

            act(() => {
                fireEvent.click(getAllByLabelText('caret-down')[0]);
            });
            await waitFor(() => expect(getByText('(hace 1 min)')).toBeInTheDocument());

            act(() => {
                fireEvent.click(getAllByLabelText('caret-up')[1]);
            });
            await waitFor(() => expect(getByText('(+202 MIN)')).toBeInTheDocument());

            /* await waitFor(() => fireEvent.change(
                getByPlaceholderText('Seleccionar fecha'),
                { target: { value: '2022-12-20' } }
            ));
            fireEvent.click(getByLabelText('search-button')); */

            fireEvent.mouseDown(getByLabelText('datePicker'));
            fireEvent.change(getByLabelText('datePicker'), { target: { value: '' } });
            fireEvent.click(document.querySelectorAll('.ant-picker-cell-selected')[0]);
            fireEvent.click(getByLabelText('search-button'));

            act(async () => {
                fireEvent.click(getAllByLabelText('caret-down')[1]);
                await waitFor(() => expect(getByText('Traslado a MEZCALES')).toBeInTheDocument());
            });

            act(async () => {
                fireEvent.click(getAllByLabelText('caret-up')[1]);
                await waitFor(() => expect(getByText('(+5 min)')).toBeInTheDocument());
                await waitFor(() => expect(getAllByText('467')[0]).toBeInTheDocument());
            });
        });
    });
});
