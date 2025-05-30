const API = {
    get: jest.fn(() => Promise.resolve({ Count: 0, Items: [], LastEvaluatedKey: {} })),
    put: jest.fn(() => ({ mutate: jest.fn(() => Promise.resolve({ updated: true })) })),
    post: jest.fn(() => ({ mutate: jest.fn(() => Promise.resolve({ created: true })) })),
    del: jest.fn(() => ({ mutate: jest.fn(() => Promise.resolve({ deleted: true })) })),
    configure: jest.fn(() => ({})),
};

export default API;
