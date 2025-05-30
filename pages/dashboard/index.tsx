import React, { useState,useEffect } from 'react';
import dynamic from 'next/dynamic';
import ProtectedRoute from '@/hocs/ProtectedRoute';
import { Button, Space } from 'antd';
import { CarOutlined, DashboardOutlined } from '@ant-design/icons';
import PageHeader from '@/components/elements/PageHeader';
import styles from './dashboard.module.scss';

/**
 * Importación dinamica de nuestro componente
 * @name RoutesView
 * @constant
 */
const RoutesView = dynamic(() => import('@/components/forDashboard/routes'));

/**
 * Importación dinamica de nuestra tabla
 * @name VehiclesView
 * @constant
 */
const VehiclesView = dynamic(() => import('@/components/forDashboard/vehicles'));

/**
 * Vista de dashboard
 * @view
 *
 * @returns {Component} - Regresa la vista del dashboard
 */
function Dashboard():React.ReactElement {
  const [filter, setFilter] = useState('routes');
  const [currentTime, setCurrentTime] = useState<string>(() =>
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    );

    useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);  

  /**
   * Componente para poder cambiar de vistas entre
   * rutas,vehículo y geocercas
   * @component
   */
  const extraMenuComponent = (
    <Space>
      <Button
        className={styles.buttonsTab}
        icon={<DashboardOutlined />}
        type={filter === 'routes' ? 'link' : 'text'}
        onClick={() => setFilter('routes')}
      >
        Rutas
      </Button>
      <Button
        className={styles.buttonsTab}
        icon={<CarOutlined />}
        type={filter === 'vehicles' ? 'link' : 'text'}
        onClick={() => setFilter('vehicles')}
      >
        Vehículos
      </Button>
    </Space>
  );

  return (
    <div aria-label="dashboard-container">
      <PageHeader
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <span>Torre de control</span>
            <span className={styles.clockContainer}>
              <span className={styles.clockIcon} role="img" aria-label="clock">🕒</span>
              <span className={styles.clockText}>{currentTime}</span>
            </span>
          </div>
        }
        extra={extraMenuComponent}
      />
      {(filter === 'routes') ? (
        <RoutesView />
      ) : (
        <VehiclesView />
      )}
    </div>
  );
}

const component:any = ProtectedRoute(Dashboard, 'dashboard');
component.Layout = true;
export default component;
