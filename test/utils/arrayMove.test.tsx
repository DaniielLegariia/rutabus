import { arrayMoveImmutable, arrayMoveMutable } from '@/utils/arrayMove';

const array = ['1', '2', '3', '4'];

describe('arrayMove', () => {
    test('Should change the element position with arrayMoveImmutable', async () => {
        const arrayMove = arrayMoveImmutable(array, 0, 3);
        expect(arrayMove).toStrictEqual(['2', '3', '4', '1']);
    });

    test('Should change the element position with arrayMoveMutable', async () => {
        arrayMoveMutable(array, 1, 2);
        expect(array).toStrictEqual(['1', '3', '2', '4']);
    });

    test(
        'Should change the element position with arrayMoveMutable when indices less than 0',
        async () => {
        arrayMoveMutable(array, -2, -1);
        expect(array).toStrictEqual(['1', '3', '4', '2']);
    });
});
