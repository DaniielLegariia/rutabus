import React from 'react';
import { waitFor, fireEvent } from '@testing-library/dom';
import { cleanup } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

import Dashboard from '@/pages/dashboard';
import { render } from '../__mocks__/utils';

afterEach(() => {
    jest.clearAllMocks();
    cleanup();
    window.document.body.innerHTML = '';
});

describe('DashboardPage', () => {
    test('Should display the dashboard page', async () => {
        const { getByLabelText } = render(<Dashboard />);
        await waitFor(() => expect(getByLabelText('dashboard-container')).toBeInTheDocument());
    });

    test('Should display routesView by default', async () => {
        const { getByLabelText } = render(<Dashboard />);
        await waitFor(() => expect(getByLabelText('dashboard-container')).toBeInTheDocument());
        await waitFor(() => expect(getByLabelText('routesView')).toBeInTheDocument());
    });

    test('Should change the view when do click in the buttons', async () => {
        await act(async () => {
            const {
                getByLabelText,
                getByText
            } = render(<Dashboard />);

            await waitFor(() => expect(getByLabelText('routesView')).toBeInTheDocument());

            const changeVehiclesViewButton = getByText('Vehículos');
            fireEvent.click(changeVehiclesViewButton);
            await waitFor(() => expect(getByLabelText('vehiclesView')).toBeInTheDocument());

            const changeRoutesViewButton = getByText('Rutas');
            fireEvent.click(changeRoutesViewButton);
            await waitFor(() => expect(getByLabelText('routesView')).toBeInTheDocument());
        });
    });
});
