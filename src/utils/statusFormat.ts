const statusFormat = (type: string, status: string) => {
    if (type === 'RouteStatus') {
      switch (status) {
        case 'withoutroute':
          return { color: 'grey', text: 'Sin ruta' };

        case 'onhold':
          return { color: 'grey', text: 'En espera' };

         case 'En espera':
          return { color: 'grey', text: 'En espera' };  

        case 'late':
          return { color: '#F14854', text: 'Tarde' };

        case 'Tarde':
          return { color: '#F14854', text: 'Tarde' };
  
        case 'delay':
          return { color: '#F3BF14', text: 'Retraso' };

         case 'Retraso':
          return { color: '#F3BF14', text: 'Retraso' };  

        case 'ontime':
          return { color: '#008000', text: 'A tiempo' };

        case 'A tiempo':
          return { color: '#008000', text: 'A tiempo' };

        case 'arrivedtodestination':
          return { color: '#008000', text: 'Llego a destino' };

        default:
          return { color: 'grey', text: status };
      }
    } else {
      switch (status) {
        case 'standby':
          return { color: 'grey', text: 'En espera' };

        case 'online':
          return { color: '#008000', text: 'Conectado' };

        case 'offline':
          return { color: '#F3BF14', text: 'Desconectado' };

        default:
          return { color: 'grey', text: status };
      }
    }
  };

export default statusFormat;
