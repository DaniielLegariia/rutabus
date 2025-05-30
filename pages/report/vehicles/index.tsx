/* eslint-disable react/no-unused-prop-types */
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import ProtectedRoute from '@/hocs/ProtectedRoute';
import statusFormat from '@/utils/statusFormat';
import { useApi } from '@/hooks/Api';

import { Col, Row, Select, Tag, DatePicker, Button, Tooltip } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Option } = Select;

interface vehicleProps {
  Name: string,
  Server: string,
  VehicleId: string
}

/**
 * Importación dinamica de nuestra tabla
 * @name ListElements
 * @constant
 */
const ListElements = dynamic(() => import('@/views/page/ListElements'));

/**
 * Componente de vista de historial de uno o todos los vehículos
 * @name Vehicle
 * @view
 *
 * @returns {Component} - Componente de la vista de historial de los vehículos
 */
function Vehicle():React.ReactElement {
  const { get } = useApi();
  const [vehicleSelected, setVehicleSelected] = useState('');
  const [selectVal, setSelectVal] = useState('');
  const [dateTime, setDateTime] = useState('');

  /**
   * Función para estructurar el parametro dateTime
   * y mandar el filtro de la tabla
   * @name onDateFilter
   * @function
   */
  const onDateFilter = () => {
    if (selectVal) {
      const initDate = new Date(`${selectVal} 00:00:00`).toISOString();
      const endDate = new Date(`${selectVal} 23:59:59`).toISOString();
      const date = `${initDate}|${endDate}`;

      setDateTime(date);
    } else {
      setDateTime(selectVal);
    }
  };

  /**
   * Query GET para obtener los vehículos registrados
   * @hook
   */
  const { isLoading, data } = get(
    ['vehicle'],
    'vehicle',
    {},
    { refetchOnWindowFocus: false }
  );

  /**
   * @const {Object} settings - Objeto con las configuraciones necesarias
   * para mostrar el listado del historial del vehículo.
   */
  const settings = {
    title: '',
    extras: [],
    source: {
      url: `vehicle/${vehicleSelected.split('#')[1]}/record`,
      key: `vehicle/${vehicleSelected.split('#')[1]}/record`,
      id: 'ID',
      extraParams: {
        server: vehicleSelected.split('#')[0],
        dateTime
      },
      options: {
        retry: false,
        refetchOnWindowFocus: false,
        enabled: (vehicleSelected !== ''),
      },
    },
    table: { // Configuración de la tabla
      pagination: false,
      style: { marginTop: '-1.5rem' },
      bordered: true,
      showSorterTooltip: false,
      columns: [
        {
          title: 'Fecha de actualización',
          dataIndex: 'Data',
          key: 'GPSTimestamp',
          width: 210,
          // search: true,
          // searchType: 'dateTime',
          sorter: (a: any, b: any) => {
            const gpsA = a?.Data?.GPSTimestamp;
            const gpsB = b?.Data?.GPSTimestamp;
            if (gpsA && gpsB) {
              return String(gpsA).localeCompare(String(gpsB));
            }

            return 0;
          },
          render: ({ GPSTimestamp, GPSStatus, GPSStatusTime }: any) => {
            const gpsStatus = GPSStatus?.toLowerCase();
            const time = new Date(Number(GPSTimestamp));
            const { color } = statusFormat('', gpsStatus);
            return ((GPSTimestamp) ? (
              <div>
                {`${time.toDateString()} - ${time.toLocaleTimeString()}`}
                <div style={{ color }}>
                  {GPSStatusTime <= 0 ? 'Online' : `(hace ${GPSStatusTime} min)`}
                </div>
              </div>
            ) : (null));
          }
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
            ) : (null));
          }
        },
        {
          title: 'Tiempo Estimado Destino Final',
          dataIndex: 'Data',
          key: 'DestinationETATime',
          width: 210,
          search: false,
          render: ({ DestinationTime }: any) => {
            const time = new Date(Number(DestinationTime?.ETA));
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
          search: false,
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
    }
  };

  return (
    <div aria-label="vehicleRecordView">
      <Row style={{ marginBottom: '1rem' }}>
        <Col>
          <div>Historial de vehículo: </div>
          <Select
            style={{ width: '10rem' }}
            disabled={isLoading}
            value={vehicleSelected}
            onChange={setVehicleSelected}
          >
            {data?.Items?.map(({ Name, Server, VehicleId }: vehicleProps) => (
              <Option key={VehicleId} value={`${Server}#${VehicleId}`}>{Name}</Option>
            ))}
          </Select>
        </Col>
        <Col style={{ marginLeft: '1.5rem' }}>
          <div>Filtro por fecha: </div>
          <div style={{ display: 'flex' }}>
            <DatePicker
              aria-label="datePicker"
              style={{ marginBottom: 8, display: 'block' }}
              size="middle"
              format="YYYY-MM-DD"
              disabled={!vehicleSelected}
              showToday={false}
              onChange={(val) => val
                ? setSelectVal(val.format('YYYY-MM-DD'))
                : setSelectVal('')}
            />
            <Tooltip title="Buscar">
              <Button
                aria-label="search-button"
                icon={<SearchOutlined />}
                disabled={!vehicleSelected}
                style={{ marginLeft: '5px' }}
                onClick={onDateFilter}
                type="primary"
              />
            </Tooltip>
          </div>
        </Col>
      </Row>
      {vehicleSelected && <ListElements settings={settings} />}
    </div>
  );
}

const component: any = ProtectedRoute(Vehicle);
component.Layout = true;
export default component;
