import React, { useEffect, useState } from 'react';
import { Tag } from 'antd';
import statusFormat from '@/utils/statusFormat';
import ListElements from '@/views/page/ListElements';
import ProtectedRoute from '@/hocs/ProtectedRoute';

import { getLastEventUnits } from '@/pages/api/Apis';

interface VehiclesViewProps {
  user: { idcliente: string };
}

function VehiclesView({ user }: VehiclesViewProps) {

  const [refetchData, setRefetchData] = useState(false);
  const [units, setUnits] = useState<any[]>([]);

   useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await getLastEventUnits([user.idcliente]);
        setUnits(response.body.units || []);
      } catch (error) {
        setUnits([]);
      }
    };
    fetchUnits();
  }, [refetchData, user.idcliente]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefetchData((preVal: boolean) => !preVal);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Mapea los datos al formato que espera la tabla
  const dataSource = units.map((unit: any) => ({
    key: unit.imei,
    ShortName: unit.short_name,
    Name: unit.short_name,
    Data: {
      GPSTimestamp: unit.status?.entryTime || '',
      GPSStatus: unit.status?.receptionStatus || '',
      GPSStatusTime: 0, // Si tienes este dato, ponlo aquí
      routeName: unit.status?.currentStep || '',
      currentSection: {
        shortName: unit.status?.currentStep || '',
        name: unit.status?.currentStep || '',
        exceededTime: unit.status?.exceededTime || 0,
      },
      DestinationTime: {
        target: unit.status?.eta ? new Date(unit.status.eta).getTime() : null,
        ETA: unit.status?.eta ? new Date(unit.status.eta).getTime() : null,
        exceedETA: null,
        delayToDestination: unit.status?.exceededTime || 0,
      },
      routeStatus: unit.status?.routeStatus || '',
    },
  }));

  console.log('dataSource', dataSource);

  const settings = {
    title: '',
    extras: [],
    source: {
      url: '', // No necesitas url porque usas dataSource directamente
      key: 'vehicle',
      id: 'Name',
      extraParams: {},
      options: {},
    },
    table: {
      pagination: false,
      style: { marginTop: '-1.5rem' },
      bordered: true,
      showSorterTooltip: false,
      refetchData,
      columns: [
        {
          title: 'Hora de actualización',
          dataIndex: 'Data',
          key: 'GPSTimestamp',
          width: 210,
          search: false,
          sorter: (a: any, b: any) => a.Data.GPSTimestamp.localeCompare(b.Data.GPSTimestamp),
          render: ({ GPSTimestamp, GPSStatus, GPSStatusTime }: any) => {
          const gpsStatus = GPSStatus?.toLowerCase();
          const time = new Date(GPSTimestamp); // <-- CORREGIDO
          const { color } = statusFormat('', gpsStatus);
          return (GPSTimestamp ? (
            <div>
              {`${time.toDateString()} - ${time.toLocaleTimeString()}`}
              <div style={{ color }}>
                {GPSStatusTime <= 0 ? 'Online' : `(hace ${GPSStatusTime} min)`}
              </div>
            </div>
          ) : null);
        }
        },
        {
          title: 'Unidad',
          dataIndex: 'ShortName',
          width: 110,
          search: false,
          sorter: (a: any, b: any) => a.ShortName.localeCompare(b.ShortName),
        },
        {
          title: 'Ruta',
          dataIndex: 'Data',
          key: 'routeName',
          search: false,
          render: ({ routeName }: any) => (
            <div>
              {routeName}
            </div>
          )
        },
        {
          title: 'Ubicación',
          dataIndex: 'Data',
          key: 'currentSection',
          search: false,
          render: ({ currentSection }: any) => (
            <div>
              <div>{currentSection?.shortName || currentSection?.name}</div>
              <div style={{ color: '#F14854' }}>
                {currentSection?.exceededTime && currentSection.exceededTime > 0
                  ? `(+${currentSection?.exceededTime} min)` : ''}
              </div>
            </div>
          )
        },
        {
          title: 'Objetivo Destino Final',
          dataIndex: 'Data',
          key: 'DestinationTargetTime',
          width: 210,
          search: false,
          render: ({ DestinationTime }: any) => {
            const time = new Date(Number(DestinationTime?.target));
            return ((DestinationTime?.target) ? (
              <div>
                {`${time.toDateString()} - ${time.toLocaleTimeString()}`}
              </div>
              ) : (null)
            );
          }
        },
        {
          title: 'Tiempo Estimado Destino Final',
          dataIndex: 'Data',
          key: 'DestinationETATime',
          width: 210,
          search: false,
          render: ({ DestinationTime }: any) => {
            const time = new Date(
              Number(DestinationTime?.exceedETA
                ? DestinationTime?.exceedETA : DestinationTime?.ETA)
            );
            return ((DestinationTime?.ETA) ? (
              <div>
                {`${time.toDateString()} - ${time.toLocaleTimeString()}`}
              </div>
              ) : (null)
            );
          }
        },
        {
          title: 'Estatus ruta',
          dataIndex: 'Data',
          key: 'RouteStatus',
          search: true,
          searchType: 'select',
          sorter: (a: any, b: any) => {
            if (a.Data.routeStatus.includes('ONHOLD')) {
              return 3 - b.Data.routeStatus.length;
            } if (b.Data.routeStatus.includes('ONHOLD')) {
              return a.Data.routeStatus.length - 3;
            }
            return a.Data.routeStatus.length - b.Data.routeStatus.length;
          },
          render: ({ routeStatus, DestinationTime }: any) => {
            const status = routeStatus?.toLowerCase();
            const { color, text } = statusFormat('RouteStatus', status);
            const delayToDestination = DestinationTime?.delayToDestination <= 0
              ? `(${DestinationTime?.delayToDestination} MIN)`
              : `(+${DestinationTime?.delayToDestination} MIN)`;

            return (
              <div style={{ display: 'flex' }}>
                <Tag
                  color={color}
                  style={{ color: 'white', marginRight: '0.5rem' }}
                >
                  {text}
                </Tag>
                <div>
                  {(status !== 'onhold' && status !== 'arrivedtodestination')
                    ? delayToDestination : (null)}
                </div>
              </div>
            );
          }
        },
      ],
        dataSource, // <-- Aquí pasas el dataSource mapeado
    },
  };

  return (
    <div aria-label="vehiclesView">
      <ListElements settings={settings} />
    </div>
  );
}

const component: any = ProtectedRoute(VehiclesView);
component.Layout = true;
export default component;