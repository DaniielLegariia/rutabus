import stringWithVariables from '@/utils/stringWithVariables';

describe('stringWithVariables', () => {
    test('Should do nothing', () => {
        const string = stringWithVariables('', { Name: 'David' });
        expect(string).toStrictEqual('');
    });

    test('Should change our string with the data', () => {
        const string = stringWithVariables('No se encontro {Name} en la busqueda', { Name: 'David' });
        expect(string).toStrictEqual('No se encontro David en la busqueda');
    });
});
