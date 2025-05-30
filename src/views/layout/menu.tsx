/**
 * @const {Array} menu - Es un array de objetos el cual define el menu de la aplicación
 * y contiene la ruta para mostrar dichas vistas.
 */
const menu = [
  {
    label: 'Torre de control',
    key: 'dashboard',
  },
  {
    label: 'Configuración',
    key: 'config',
    children: [
      { key: 'vehicle', label: 'Vehículos' },
      { key: 'route', label: 'Rutas' },
      { key: 'geofences', label: 'Geocercas' },
    //  { key: 'user', label: 'Usuarios' }
    ],
  },
  {
    label: 'Reportes',
    key: 'report',
    children: [
      { key: 'vehicles', label: 'Vehículos' }
    ]
  },
];

/**
 * @const {Array} userMenu - Es un array de objetos el cual
 * define el menu del usuario
 */
export const userMenu = [
  {
    label: 'Cerrar sesión',
    key: 'logout',
  },
];

export default menu;
