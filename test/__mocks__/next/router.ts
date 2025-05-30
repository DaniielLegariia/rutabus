// eslint-disable-next-line import/prefer-default-export
export const useRouter = jest.fn(() => ({
    push: jest.fn(() => true),
}));
