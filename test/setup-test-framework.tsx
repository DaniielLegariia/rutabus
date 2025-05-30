import './__mocks__/matchmedia.js';
import '@testing-library/jest-dom';

HTMLCanvasElement.prototype.getContext = () => {
  // return whatever getContext has to return
};

/* jest.mock('react-query', () => ({
  useQuery: () => ({ isLoading: false, isError: false, data: [] }),
  useMutation: () => ({ mutate: {}, isError: false, isLoading: false }),
  useQueryClient: () => null,
})); */
