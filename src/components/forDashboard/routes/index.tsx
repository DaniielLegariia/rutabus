import React, { useEffect, useState } from 'react';
import { Layout, List, message } from 'antd';
import { useApi } from '@/hooks/Api';
import RouteCard from './routeCard';
import { getListRutas} from '@/pages/api/Apis';
import ProtectedRoute from '@/hocs/ProtectedRoute';
interface routesDataType {
    Name: string,
    RouteID: string
}

interface getRoutesData {
    Count: number,
    Items: routesDataType[],
    LastEvaluatedKey: any
}

/**
 * Componente de rutas
 * @component
 *
 * @returns {Component} - Componente para mostrar las rutas en el dashboard
 */
function RoutesView({ user }: { user: User }): React.ReactElement {
  if (!user || !user.idcliente) {
    return <div>Cargando datos del usuario...</div>; // Muestra un mensaje de carga o un spinner
  }
  const { idcliente } = user; // Extraer idcliente del usuario
  const [routesData, setRoutesData] = useState<routesDataType[]>([]);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const data = await getListRutas(idcliente); // Llamar a la API con el idcliente
        console.log('Data:', data);
        if (data.body.routes) {
          setRoutesData(data.body.routes.map((route: any) => ({
            Name: route.Name,
            RouteID: route.id,
          })));
        } else {
          message.error('No se encontraron rutas.');
        }
      } catch (error) {
        console.error('Error al obtener las rutas:', error);
        message.error('Error al cargar las rutas.');
      }
    };

    fetchRoutes();
  }, [idcliente]); // Ejecutar el efecto cuando cambie el idcliente

  return (
    <Layout.Content aria-label="routesView">
      <List
        itemLayout="vertical"
        size="large"
        loading={!routesData.length} // Mostrar loading si no hay datos
        dataSource={routesData}
        renderItem={(item: routesDataType) => (
          <RouteCard routeId={item.RouteID} name={item.Name} user={user}/>
        )}
      />
    </Layout.Content>
  );
}
const component: any = ProtectedRoute(RoutesView);
component.Layout = true;
export default component;