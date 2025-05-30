import React from 'react';
import { cleanup } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import API from '@aws-amplify/api';
import { useApi } from '@/hooks/Api';

import ListElements from '@/views/page/ListElements';
import { render } from '../__mocks__/utils';
import { settings } from './settings.helper';

const APIMock = API as jest.MockedFunction<any>;

afterEach(() => {
    jest.clearAllMocks();
    APIMock.get.mockClear();
    cleanup();
});

describe('ListElements', () => {
    test('Should display the title page', async () => {
        APIMock.get.mockResolvedValueOnce(Promise.resolve({ Items: [], Count: 0 }));
        const { getByText } = render(<ListElements settings={settings} />);

        await waitFor(() => expect(getByText(settings.title)).toBeInTheDocument());
    });

    test('Should display button to add elements', () => {
        APIMock.get.mockResolvedValueOnce(Promise.resolve({ Items: [], Count: 0 }));
        const { getByText } = render(<ListElements settings={settings} />);

        const addButton = getByText('Agregar');

        expect(addButton).toBeInTheDocument();
    });

    test('Should initialize the table correctly', async () => {
        const returnValue = {
            Items: [
                {
                    Server: 'a3vip',
                    VehicleId: '2603',
                    RouteStatus: 'withoutroute',
                    GPSStatus: 'standby',
                    ShortName: 'UnNombreDiferente',
                    Name: '505'
                },
                {
                    Server: 'a3vip',
                    VehicleId: '2611',
                    RouteStatus: 'withoutroute',
                    GPSStatus: 'standby',
                    ShortName: 'PruebaDeQueElUsuarioPuedePonerLoQueQuiera',
                    Name: '402'
                }
            ],
            Count: 2,
            LastEvaluatedKey: {}
        };

        APIMock.get.mockResolvedValueOnce(Promise.resolve(returnValue));
        const { getByText, getByLabelText } = render(<ListElements settings={settings} />);
        const get = jest.spyOn(useApi(), 'get');

        expect(getByText('Cargando...')).toBeInTheDocument();

        await waitFor(() =>
            expect(get).toBeCalledWith(
                ['table', settings.source.key, 0],
                settings.source.url,
                {
                    ...settings.source?.extraParams,
                },
                expect.objectContaining({})
            )
        );

        await waitFor(() => expect(get).toBeCalledTimes(2));
        await waitFor(() => expect(getByLabelText('customTable-footer')).toBeInTheDocument());

        // record
        for (const record of returnValue.Items) {
            for (const col of settings.table.columns) {
                if (col.render) {
                    const cell = col.render(record[col.dataIndex], record);
                    expect(getByText(cell)).toBeInTheDocument();
                } else {
                    const cell = getByText(record[col.dataIndex]);
                    expect(cell).toBeInTheDocument();
                }
            }
        }
    });
});
