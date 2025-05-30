import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/hocs/ProtectedRoute';
import ListElements from '@/views/page/ListElements';
import Link from 'next/link';
import { Button, Space, Tooltip, message,Table } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { getListRutas } from '@/pages/api/Apis';

/**
 * Vista para mostrar el listado de rutas registrados.
 * @view
 *
 * @returns {Component} - Regresa la vista del listado de rutas.
 */
function RoutesList({ user }: { user: User }): React.ReactElement {
  const { idcliente } = user; // Extraer idcliente del usuario
  const [routesData, setRoutesData] = useState<any[]>([]); // Estado para almacenar las rutas
  const [loading, setLoading] = useState(true); // Estado para manejar el indicador de carga

  // Llamar a getListRutas para obtener las rutas
  useEffect(() => {
    const fetchRoutes = async () => {
      setLoading(true); // Mostrar indicador de carga
      try {
        const data = await getListRutas(idcliente); // Llamar a la función con el idcliente
        if (data.body.routes) {
          message.success('Rutas cargadas correctamente');
          const transformedRoutes = data.body.routes.map((route: any) => ({
            RouteID: route.id, // Mapear `id` a `RouteID`
            Name: route.Name, // Usar `Name` directamente
            Description: route.Description, // Usar `Description` directamente
          }));
          setRoutesData(transformedRoutes);
        } else {
          message.info('No se encontraron rutas.');
        }
      } catch (error) {
        console.error('Error al obtener las rutas:', error);
        message.error('Error al cargar las rutas.');
      } finally {
        setLoading(false); // Ocultar indicador de carga
      }
    };

    fetchRoutes();
  }, [idcliente]); // Ejecutar el efecto cuando cambie el idcliente

  /**
   * @const {Object} settings - Objeto con las configuraciones necesarias
   * para mostrar el listado de rutas registradas.
   */
  const settings = {
    title: 'Rutas', // Titulo de la lista
    extras: [
      {
        link: '/config/route/new/', // Ruta si le damos a agregar nueva ruta
        text: 'Agregar', // Texto del boton para agregar ruta
        button: { // Objeto de la configuración del boton
          type: 'primary',
          shape: 'round',
        },
        key: 'add',
      },
    ],
    table: { // Configuración de la tabla
      pagination: false,
      bordered: true,
      showSorterTooltip: false,
      columns: [ // Columnas de la tabla
        {
          title: 'Nombre de la ruta',
          dataIndex: 'Name',
          search: false,
        },
        {
          title: 'Descripción de la ruta',
          dataIndex: 'Description',
          search: false,
        },
        {
          title: 'Acciones',
          fixed: 'right',
          dataIndex: 'operation',
          align: 'center',
          width: 200,
          render: (_: any, record: any) => (
            <Space>
              <Link href={`/config/route/edit/${record.RouteID}`}>
                <Tooltip title="Editar">
                  <Button
                    aria-label="route-editButton"
                    shape="round"
                    type="default"
                    icon={<EditOutlined />}
                  />
                </Tooltip>
              </Link>
            </Space>
          ),
        },
      ],
    },
  };
console.log('routesData', routesData);
return (
  <div aria-label="route-container">
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
      {settings.extras.map((extra) => (
        <Link href={extra.link} key={extra.key}>
          <Button type={extra.button.type} shape={extra.button.shape}>
            {extra.text}
          </Button>
        </Link>
      ))}
    </div>
    <Table
      dataSource={routesData} // Pasar los datos obtenidos
      columns={settings.table.columns} // Usar las columnas configuradas
      loading={loading} // Mostrar indicador de carga
      rowKey="RouteID" // Clave única para identificar cada fila
    />
  </div>
);
}

const component: any = ProtectedRoute(RoutesList);
component.Layout = true;
export default component;