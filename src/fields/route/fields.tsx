import React from 'react';
import * as Yup from 'yup';
import DisassociateVehicle from '@/components/forRoute/disassociateVehicle';
import ToleranceConfig from '@/components/forRoute/toleranceConfig';

/**
 * Función que regresa el array de campos a utilizar en el formulario
 * de crear ruta
 * @name routeFields
 * @function
 *
 * @property {String} lastStep - Nombre del ultimo step de la ruta
 *
 * @return {Array} - Es un array de objetos el cual contiene los campos
 * y configuración de los mismos los cuales se mostraran al mandarlos como
 * parametro en la creación de ruta.
 */


export const routeFields = (lastStep?: string):any[] => ([
  {
    row: { gutter: [25, 0] },
    title: 'Descripción de la ruta',
    id: 1,
    cols: [
      {
        col: { xl: 8, md: 8, sm: 8, xs: 8 },
        id: 1,
        input: {
          name: 'description',
          type: 'text',
          id: 'description',
          placeholder: 'Descripción',
        },
        item: {
          label: '',
          name: 'description',
          htmlFor: 'description',
          type: 'input',
        },
      }
    ],
  },
  {
  row: { gutter: [25, 0] },
  title: 'Hora de llegada a destino',
  id: 2,
  help: `Debes proporcionar una hora de llegada fija para la unidad motriz.`,
  cols: [
    {
      col: { xl: 8, md: 8, sm: 8, xs: 8 },
      id: 2,
      // Elimina la función disabled
      input: {
        name: 'finalDestination',
        type: 'time',
        id: 'finalDestination',
        placeholder: 'Ej. 08:30',
      },
      item: {
        label: '',
        name: 'finalDestination',
        htmlFor: 'finalDestination',
        type: 'input',
      },
    }
  ]
},
  {
    row: { gutter: [25, 0] },
    title: 'Desasociación de vehículo de ruta',
    id: 3,
    help: `Al habilitar esta opción podras configurar la desasociación de los 
    vehículos para que se haga automáticamente, de lo contrario tendras que 
    hacerlo de manera manual`,
    extraField: {
      input: {
        name: 'disassociateVehicle',
        type: 'switch',
        id: 'disassociateVehicle',
        label: 'Automático',
        unCheckedChildren: (
          <div style={{ color: 'black', fontSize: '13px' }}>
            Manual
          </div>),
        checkedChildren: (
          <div style={{ color: 'white', fontSize: '13px' }}>
            Automático
          </div>),
      },
      item: {
        label: '',
        name: 'disassociateVehicle',
        htmlFor: 'disassociateVehicle',
        style: { marginBottom: '0px', marginLeft: '0.5rem' },
        type: 'switch'
      }
    },
    cols: [
      {
        col: { xl: 24, md: 24, sm: 24, xs: 24 },
        id: 3,
        item: {
          type: 'custom'
        },
        custom: {
          content: (data:any, disabled: boolean) =>
            <DisassociateVehicle {...data} lastStep={lastStep} disabled={disabled} />
        }
      }
    ],
  },
  {
    row: { gutter: [25, 0] },
    title: 'Tolerancia de llegada a destino',
    id: 4,
    cols: [
      {
        col: { xl: 24, md: 24, sm: 24, xs: 24 },
        id: 4,
        item: {
          type: 'custom'
        },
        custom: {
          content: (data:any, disabled: boolean) =>
            <ToleranceConfig {...data} disabled={disabled} />
        }
      }
    ],
  },
]);

/**
 * Definicion del esquema de validaciones
 */
export const routeSchema = Yup.object().shape({
  description: Yup.string(),
  //finalDestinationAuto: Yup.boolean(),
  
  finalDestination: Yup.string().when('finalDestinationAuto', {
    is: true,
    then: Yup.string(),
    otherwise: Yup.string().required('Hora de llegada es un campo obligatorio')
  }),
  disassociateVehicle: Yup.boolean(),
  disassociateVehicleTime: Yup.number().when('disassociateVehicle', {
    is: false,
    then: Yup.number(),
    otherwise: Yup.number().required('Minutos para desasociar es un campo obligatorio')
  }),
  disassociateVehicleTrigger: Yup.string().when('disassociateVehicle', {
    is: false,
    then: Yup.string(),
    otherwise: Yup.string().required('Opción para desasociar es un campo obligatorio')
  }),
  toleranceOnTime: Yup.number().required('Tolerancia a tiempo es un campo obligatorio'),
  toleranceDelay: Yup.number().required('Tolerancia de retraso es un campo obligatorio')
});

/**
 * @const {Object} routeMessages - Es un objeto el cual contiene los mensajes
 * que se mostraran al mandarlos como parametro de algún componente.
 */
export const routeMessages = {
  deletePrompt: {
    title: 'Eliminar ruta',
    confirm: '¿Estas seguro de que deseas eliminar la ruta?',
  },
  success: {
    create: 'La ruta se ha creado de forma exitosa',
    update: 'La ruta se ha editado de forma exitosa',
    remove: 'La ruta se ha eliminado de forma exitosa',
  },
  error: {
    create: 'Error al crear ruta, verifíca la información e intenta de nuevo.',
    update: 'Error al editar ruta, verifíca la información e intenta de nuevo.',
    remove: 'Error al eliminar ruta, intenta de nuevo.',
    load: 'Error al cargar el ruta',
  },
};
