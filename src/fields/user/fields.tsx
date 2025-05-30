import * as Yup from 'yup';

/**
 * @const {Array} userFields - Es un array de objetos el cual contiene los campos
 * y configuración de los mismos los cuales se mostraran al mandarlos como
 * parametro de algún componente.
 */
export const userFields = [
  {
    row: { gutter: [25, 0] },
    id: 1,
    cols: [
      {
        col: { xl: 8, md: 8, sm: 8, xs: 8 },
        id: 1,
        input: {
          name: 'Name',
          type: 'text',
          id: 'Name',
          placeholder: 'Ej. Fernando Herrera',
        },
        item: {
          label: 'Nombre de usuario',
          name: 'Name',
          htmlFor: 'Name',
          type: 'input',
        },
      },
      {
        col: { xl: 8, md: 8, sm: 8, xs: 8, gutter: [10, 0] },
        id: 2,
        input: {
          name: 'Email',
          type: 'Email',
          id: 'Email',
          placeholder: 'Ej. fernando.herrera@easytrack.mx',
        },
        item: {
          label: 'Correo electrónico',
          name: 'Email',
          htmlFor: 'Email',
          type: 'input',
        },
      }
    ],
  },
];

/**
 * Definicion del esquema de validaciones
 */
export const userSchema = Yup.object().shape({
  Email: Yup.string()
    .label('Correo electrónico')
    .min(5)
    .max(350)
    .email('El formato de correo no es válido')
    .required('Correo electrónico es obligatorio'),
  Name: Yup.string()
    .min(3)
    .max(350)
    .required('Nombre de usuario es obligatorio')
    .label('Nombre de usuario')
});

/**
 * @const {Object} userMessages - Es un objeto el cual contiene los mensajes
 * que se mostraran al mandarlos como parametro de algún componente.
 */
export const userMessages = {
  deletePrompt: {
    title: 'Eliminar usuario',
    confirm: '¿Estas seguro de que deseas eliminar el usuario {email}?',
  },
  success: {
    create: 'El usuario se ha creado de forma exitosa',
    update: 'El usuario se ha editado de forma exitosa',
    remove: 'El usuario se ha eliminado de forma exitosa',
  },
  error: {
    create: 'Error al crear usuario, verifíca la información e intenta de nuevo.',
    update: 'Error al editar usuario, verifíca la información e intenta de nuevo.',
    remove: 'Error al eliminar usuario, intenta de nuevo.',
    load: 'Error al cargar el usuario',
  },
};
