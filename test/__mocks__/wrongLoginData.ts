export const wrongLoginData = [
    {
        username: 'email@gmail',
        password: 'somePa$wod1',
    },
    {
        username: 'emailgmail.com',
        password: 'somePa$wod1',
    },
    {
        username: 'email@gmail.com',
        password: 'somePa$wod',
    },
    {
        username: 'email@gmail.com',
        password: 'somePawod1',
    },
    {
        username: 'email@gmail.com',
        password: 'somea$wod1',
    },
    {
        username: 'email@gmail.com',
        password: 'sePa$w1',
    },
];

export const wrongResetData = [
    {
        code: '23423',
        password: 'somePa$wod1',
        repeatPassword: 'somePa$wod1',
    },
    {
        code: '23423a',
        password: 'somePa$wod1',
        repeatPassword: 'somePa$wod1',
    },
    {
        code: '2342333',
        password: 'somePa$wod1',
        repeatPassword: 'somePa$wod1',
    },
    {
        code: '234234',
        password: 'somePa$wod',
        repeatPassword: 'somePa$wod',
    },
    {
        code: '234234',
        password: 'somePawod1',
        repeatPassword: 'somePawod1',
    },
    {
        code: '234234',
        password: 'somea$wod1',
        repeatPassword: 'somea$wod1',
    },
    {
        code: '234234',
        password: 'sePa$w1',
        repeatPassword: 'sePa$w1',
    },
];

export const wrongChangeData = [
    {
        password: 'somePa$wod',
        repeatPassword: 'somePa$wod',
    },
    {
        password: 'somePawod1',
        repeatPassword: 'somePawod1',
    },
    {
        password: 'somea$wod1',
        repeatPassword: 'somea$wod1',
    },
    {
        password: 'sePa$w1',
        repeatPassword: 'sePa$w1',
    },
];

export const wrongSetupData = [
    {
        code: '23423',
    },
    {
        code: '23423a',
    },
    {
        code: '2342333',
    },
];
