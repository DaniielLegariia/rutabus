import React from 'react';
import { waitFor, fireEvent } from '@testing-library/dom';
import { cleanup } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import API from '@aws-amplify/api';
import { useApi } from '@/hooks/Api';

import RoutesView from '@/components/forDashboard/routes';
import { render } from '../__mocks__/utils';

const APIMock = API as jest.MockedFunction<any>;

afterEach(() => {
    jest.clearAllMocks();
    APIMock.get.mockClear();
    APIMock.put.mockClear();
    cleanup();
    window.document.body.innerHTML = '';
});

const returnRoutesValue = {
    Count: 1,
    Items: [
        {
            Name: 'Caseta La Joya - Caseta Libramiento Mexicali',
            RouteID: '2DPYdtkWbuXBeRvrxHYp9tCYmp0'
        }
    ],
    LastEvaluatedKey: {}
};

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

const returnVehiclesValue = {
    Count: 2,
    Items: [
        {
            Server: 'a3vip',
            VehicleId: '2636',
            RouteStatus: 'onhold',
            GPSStatus: 'standby',
            ShortName: '457',
            Name: '457'
        },
        {
            Server: 'a3vip',
            VehicleId: '2603',
            RouteStatus: 'onhold',
            GPSStatus: 'standby',
            ShortName: '505',
            Name: '505'
        }
    ],
    LastEvaluatedKey: {}
};

describe('RoutesView', () => {
    test('Should display RoutesView page without routes', async () => {
        const { getByLabelText } = render(<RoutesView />);
        await waitFor(() => expect(getByLabelText('routesView')).toBeInTheDocument());
    });

    test('Should display RoutesView page with routes', async () => {
        APIMock.get
            .mockResolvedValueOnce(Promise.resolve(returnRoutesValue))
            .mockResolvedValue(Promise.resolve(returnRouteDetailsValue));

        await act(async () => {
            const { getAllByLabelText, getByText } = render(<RoutesView />);
            const get = jest.spyOn(useApi(), 'get');

            await waitFor(() => expect(get).toBeCalled());

            await waitFor(() =>
                expect(getByText('Caseta La Joya - Caseta Libramiento Mexicali')).toBeInTheDocument()
            );

            const addButton = getAllByLabelText('addVehiclesToRouteButton')[0];
            expect(addButton).toBeInTheDocument();
        });
    });

    test('Should have an error when try charge the routes', async () => {
        APIMock.get.mockRejectedValueOnce({});

        const { getByLabelText } = render(<RoutesView />);
        const get = jest.spyOn(useApi(), 'get');

        await act(async () => {
            await waitFor(() => expect(get).toBeCalled());
            await waitFor(() => expect(get).toBeCalledTimes(2));
            await waitFor(() => expect(getByLabelText('routesView')).toBeInTheDocument());
        });
    });

    test('Should can select and save some vehicles', async () => {
        APIMock.get
            .mockResolvedValueOnce(Promise.resolve(returnRoutesValue))
            .mockResolvedValue(Promise.resolve(returnVehiclesValue));
        APIMock.put.mockResolvedValueOnce(Promise.resolve({ message: 'Guardado correctamente' }));

        await act(async () => {
            const {
                getByLabelText,
                getAllByLabelText,
                getByRole,
                getByText
            } = render(<RoutesView />);

            const get = jest.spyOn(useApi(), 'get');
            const put = jest.spyOn(useApi(), 'put');
            await waitFor(() => expect(get).toBeCalled());

            await waitFor(() =>
                expect(getByText('Caseta La Joya - Caseta Libramiento Mexicali')).toBeInTheDocument()
            );

            const addButton = getAllByLabelText('addVehiclesToRouteButton')[0];
            expect(addButton).toBeInTheDocument();
            act(() => {
                fireEvent.click(addButton);
            });
            await waitFor(() => expect(get).toBeCalled());
            await waitFor(() => expect(getByRole('dialog')).toBeInTheDocument());

            const firstListItem = await waitFor(() => getAllByLabelText('AsyncModal-ListItem')[0]);
            const secondListItem = await waitFor(() => getAllByLabelText('AsyncModal-ListItem')[1]);
            act(() => {
                fireEvent.click(firstListItem);
                fireEvent.click(secondListItem);
            });

            await waitFor(() => expect(getByLabelText('AsyncModal-SaveButton')).toBeInTheDocument());
            act(() => {
                fireEvent.click(getByLabelText('AsyncModal-SaveButton'));
            });

            await waitFor(() => expect(put).toBeCalled());
        });
    });
});
