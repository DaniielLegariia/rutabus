import React from 'react';
import { render as _render } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import esES from 'antd/lib/locale/es_ES';
import { QueryClient, QueryClientProvider } from 'react-query';

export const render = (component: any) => {
    const queryClient = new QueryClient();

    return _render(
        <ConfigProvider locale={esES}>
            <QueryClientProvider client={queryClient} contextSharing>
                {component}
            </QueryClientProvider>
        </ConfigProvider>
    );
};

export const awsResponses = {
    signInResponse: {
        challengeName: 'SOFTWARE_TOKEN_MFA',
    },
    mfaSetup: {
        challengeName: 'MFA_SETUP',
    },
    newPassword: {
        challengeName: 'NEW_PASSWORD_REQUIRED',
    },
};
