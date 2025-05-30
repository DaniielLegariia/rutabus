import { useQuery, useMutation } from 'react-query';
import { API as AwsApi } from '@aws-amplify/api';

const get = jest.fn((key, path, params, options) => {
    options.onSuccess({ Count: 0, Items: [], LastEvaluatedKey: {} });
    return {
        refetch: jest.fn(),
        isLoading: false,
        data: [],
        isRefetching: false
    };
});
const put = jest.fn(() => ({ mutate: jest.fn(), isLoading: false }));
const post = jest.fn();
const del = jest.fn();

export const Api = {
    get,
    put,
    post,
    del,
};

export const useApi = () => Api;
