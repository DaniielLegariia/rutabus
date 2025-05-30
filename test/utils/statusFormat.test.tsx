import statusFormat from '@/utils/statusFormat';

describe('statusFormat', () => {
    test('Should return the correct object when type is "RouteStatus"', async () => {
        expect(statusFormat('RouteStatus', 'withoutroute'))
            .toStrictEqual({ color: 'grey', text: 'Sin ruta' });

        expect(statusFormat('RouteStatus', 'onhold'))
            .toStrictEqual({ color: 'grey', text: 'En espera' });

        expect(statusFormat('RouteStatus', 'late'))
            .toStrictEqual({ color: '#F14854', text: 'Tarde' });

        expect(statusFormat('RouteStatus', 'delay'))
            .toStrictEqual({ color: '#F3BF14', text: 'Retraso' });

        expect(statusFormat('RouteStatus', 'ontime'))
            .toStrictEqual({ color: '#008000', text: 'A tiempo' });

        expect(statusFormat('RouteStatus', 'arrivedtodestination'))
            .toStrictEqual({ color: '#008000', text: 'Llego a destino' });

        // default
        expect(statusFormat('RouteStatus', 'unknow'))
            .toStrictEqual({ color: 'grey', text: 'unknow' });
    });

    test('Should return the correct object when type is not "RouteStatus"', async () => {
        expect(statusFormat('', 'standby'))
            .toStrictEqual({ color: 'grey', text: 'En espera' });

        expect(statusFormat('', 'online'))
            .toStrictEqual({ color: '#008000', text: 'Conectado' });

        expect(statusFormat('', 'offline'))
            .toStrictEqual({ color: '#F3BF14', text: 'Desconectado' });

        // default
        expect(statusFormat('', 'unknow'))
            .toStrictEqual({ color: 'grey', text: 'unknow' });
    });
});
