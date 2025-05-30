import React from 'react';
import { waitFor } from '@testing-library/dom';
import { cleanup } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

import PageHeader from '@/components/elements/PageHeader';
import { render } from '../__mocks__/utils';

afterEach(() => {
    jest.clearAllMocks();
    cleanup();
    window.document.body.innerHTML = '';
});

describe('PageHeader test', () => {
    test('Should display the PageHeader correctly', async () => {
        await act(async () => {
            const { getByText } = render(
              <PageHeader
                title="Un titulo X"
                onBack={() => {}}
              />
            );

            await waitFor(() => expect(getByText('Un titulo X')).toBeInTheDocument());
        });
    });
});
