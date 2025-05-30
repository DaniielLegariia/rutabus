export function useAuth() {
    return { 
        setValue: jest.fn(),
        loaded: true,
        getValue: jest.fn(),
        user: { email: '' }
    };
}
