import { awsResponses } from '../utils';

const Auth = {
    forgotPassword: jest.fn(() => Promise.resolve()),
    configure: jest.fn(),
    currentSession: jest.fn(),
    forgotPasswordSubmit: jest.fn(() => Promise.resolve()),
    signIn: jest.fn(() => Promise.resolve(awsResponses.signInResponse)),
    setupTOTP: jest.fn(() => Promise.resolve('testcode')),
    completeNewPassword: jest.fn(() =>
        Promise.resolve({
            challengeName: 'MFA_SETUP',
        })
    ),
    verifyTotpToken: jest.fn(() =>
        Promise.resolve({
            isValid: jest.fn(() => true),
        })
    ),
    setPreferredMFA: jest.fn(() => Promise.resolve()),
    confirmSignIn: jest.fn(() => Promise.resolve()),
};

export default Auth;
