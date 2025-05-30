import React from 'react';
import { waitFor } from '@testing-library/dom';
import { cleanup } from '@testing-library/react';
import API from '@aws-amplify/api';
import { useApi } from '@/hooks/Api';

import Route from '@/pages/config/route';
import { render } from '../__mocks__/utils';

const APIMock = API as jest.MockedFunction<any>;
const returnValue = {
    Count: 1,
    Items: [
        {
            Name: 'Caseta General Bravo - Caseta Libramiento Mexicali',
            RouteID: '2Ctw2rbXszU6HPTbcCt9TbxIfEH'
        }
    ],
    LastEvaluatedKey: {}
};

afterEach(() => {
    jest.clearAllMocks();
    APIMock.get.mockClear();
    cleanup();
    window.document.body.innerHTML = '';
});

describe('Route', () => {
    test('Should display the Route', async () => {
        const { getByLabelText } = render(<Route />);

        await waitFor(() => expect(getByLabelText('route-container')).toBeInTheDocument());
    });

    test('Should display the Route with data', async () => {
        APIMock.get.mockResolvedValueOnce(Promise.resolve(returnValue));
        const { getByLabelText } = render(<Route />);
        const get = jest.spyOn(useApi(), 'get');

        await waitFor(() => expect(get).toBeCalled());
        expect(getByLabelText('route-container')).toBeInTheDocument();
        expect(getByLabelText('route-editButton')).toBeInTheDocument();
    });
});
