import React from 'react';
import { cleanup } from '@testing-library/react';
import { fireEvent, waitFor } from '@testing-library/dom';
import { act } from 'react-dom/test-utils';
import API from '@aws-amplify/api';

import GeofencesTable from '@/components/forRoute/GeofencesTable';
import { render } from '../__mocks__/utils';

const APIMock = API as jest.MockedFunction<any>;
const returnValue = [
    {
        Type: 'Step',
        key: 'Parada 1',
        Name: 'Parada 1',
        ShortName: 'P1',
        SectionTime: 0,
        isFinal: false,
        index: 0,
        TransitSectionTime: 0,
        TransitTo: 'Traslado a Parada 2'
    },
    {
        Type: 'Step',
        key: 'Parada 2',
        Name: 'Parada 2',
        ShortName: 'P2',
        SectionTime: 0,
        isFinal: false,
        index: 1,
        TransitSectionTime: 0,
        TransitTo: 'Traslado a Parada 3'
    },
    {
        Type: 'Step',
        key: 'Parada 3',
        Name: 'Parada 3',
        ShortName: 'PFinal',
        SectionTime: null,
        isFinal: true,
        index: 2,
        TransitSectionTime: null,
        TransitTo: ''
    }
];

afterEach(() => {
    jest.clearAllMocks();
    APIMock.get.mockClear();
    cleanup();
});

describe('GeofencesTable', () => {
    test('Should display the GeofencesTable', async () => {
        const { getByLabelText, getByText } = render(
          <GeofencesTable
            dataSource={[]}
            handleEdit={jest.fn()}
            setDataSource={jest.fn()}
            loading={false}
            handleOnDeleteRow={jest.fn()}
            disabled={false}
          />);

        await waitFor(() => expect(getByLabelText('geofencesTable-Table')).toBeInTheDocument());
        expect(getByText('No hay datos')).toBeInTheDocument();
    });

    test('Should can change the shortName', async () => {
        const { getAllByLabelText, getByLabelText } = render(
          <GeofencesTable
            dataSource={returnValue}
            handleEdit={jest.fn()}
            setDataSource={jest.fn()}
            loading={false}
            handleOnDeleteRow={jest.fn()}
            disabled={false}
          />
        );

        const shortNameElement = getAllByLabelText('geofencesTable-shortName')[0];
        expect(shortNameElement).toBeInTheDocument();

        const editButton = getAllByLabelText('geofencesTable-editButton')[0];
        expect(editButton).toBeInTheDocument();
        expect(editButton).toBeEnabled();

        fireEvent.click(editButton);

        const shortNameEditElement = getByLabelText('geofencesTable-editShortName');
        expect(shortNameEditElement).toBeInTheDocument();

        await act(async () => {
            fireEvent.click(shortNameEditElement);
            await waitFor(() => shortNameEditElement);

            fireEvent.change(
                shortNameEditElement,
                { target: { value: '' } }
            );

            fireEvent.focusOut(getByLabelText('geofencesTable-editShortName'));
        });

        await waitFor(() =>
            expect(shortNameEditElement).toHaveValue('')
        );
    });

    test('Should can change the sectionTime', async () => {
        const { getAllByLabelText, getByLabelText } = render(
          <GeofencesTable
            dataSource={returnValue}
            handleEdit={jest.fn()}
            setDataSource={jest.fn()}
            loading={false}
            handleOnDeleteRow={jest.fn()}
            disabled={false}
          />);

        const shortNameElement = getAllByLabelText('geofencesTable-sectionTime')[0];
        expect(shortNameElement).toBeInTheDocument();

        const editButton = getAllByLabelText('geofencesTable-editButton')[0];
        expect(editButton).toBeInTheDocument();
        expect(editButton).toBeEnabled();

        fireEvent.click(editButton);

        const sectionTimeEditElement = getByLabelText('geofencesTable-editSectionTime');
        expect(sectionTimeEditElement).toBeInTheDocument();

        await act(async () => {
            fireEvent.click(sectionTimeEditElement);
            await waitFor(() => sectionTimeEditElement);

            fireEvent.change(
                sectionTimeEditElement,
                { target: { value: 34 } }
            );

            fireEvent.focusOut(sectionTimeEditElement);
            expect(sectionTimeEditElement).toHaveValue('34');
        });
    });

    test('Should can change the transitSectionTime', async () => {
        const { getAllByLabelText, getByLabelText } = render(
          <GeofencesTable
            dataSource={returnValue}
            handleEdit={jest.fn()}
            setDataSource={jest.fn()}
            loading={false}
            handleOnDeleteRow={jest.fn()}
            disabled={false}
          />);

        const shortNameElement = getAllByLabelText('geofencesTable-transitSectionTime')[0];
        expect(shortNameElement).toBeInTheDocument();

        const editButton = getAllByLabelText('geofencesTable-editButton')[0];
        expect(editButton).toBeInTheDocument();
        expect(editButton).toBeEnabled();

        fireEvent.click(editButton);

        const transitTimeEditElement = getByLabelText('geofencesTable-editTransitSectionTime');
        expect(transitTimeEditElement).toBeInTheDocument();

        await act(async () => {
            fireEvent.click(transitTimeEditElement);
            await waitFor(() => transitTimeEditElement);
            fireEvent.change(
                transitTimeEditElement,
                { target: { value: 15 } }
            );

            fireEvent.focusOut(getByLabelText('geofencesTable-editTransitSectionTime'));
            expect(transitTimeEditElement).toHaveValue('15');
        });
    });
});
