import React from 'react';
import { Popover, Badge, Space, Row, Divider, Tag } from 'antd';
import statusFormat from '@/utils/statusFormat';
import styles from './routes.module.scss';

interface VehiclesProps {
  vehicles: any[];
  index: number;
  inStep: boolean;
}

interface VehicleProps {
  Name: string;
  Data: any;
  RouteStatus: string;
  ShortName: string;
}

function Vehicles({ vehicles, index, inStep }: VehiclesProps) {
  const firstStepInRow: string[] = ['1', '9', '17'];

  const worstStatus = () => {
    let status = 'arrivedtodestination';
    for (let i = 0; i < vehicles.length; i += 1) {
      let vehicleStatus = vehicles[i].RouteStatus.toLowerCase();
      if (vehicleStatus === 'en espera') vehicleStatus = 'waiting';
      if (vehicleStatus === 'sin ruta') vehicleStatus = 'noRoute';
      if (vehicleStatus === 'llegó a destino') vehicleStatus = 'arrivedtodestination';
      if (vehicleStatus === 'a tiempo') vehicleStatus = 'ontime';
      if (vehicleStatus === 'retraso') vehicleStatus = 'delay';
      if (vehicleStatus === 'tarde') vehicleStatus = 'late';
      if (vehicleStatus.length < status.length) {
        status = vehicleStatus;
      }
    }
    return status;
  };

  const content = (
    <Space direction="vertical" style={{ maxHeight: '6rem', overflow: 'auto' }}>
      {vehicles.map(({ Name, Data, RouteStatus, ShortName }: VehicleProps | any) => (
        <Row justify="space-between" key={Name}>
          <div
            className={styles.vehicleWithExceededTime}
            style={{ marginRight: '0.5rem', fontWeight: 'bold', width: '5.5rem' }}
          >
            {ShortName}
          </div>
          {(RouteStatus.toLowerCase() === 'delay' || RouteStatus.toLowerCase() === 'late') && (
            <Tag
              color={statusFormat('RouteStatus', RouteStatus).color}
              style={{ color: 'white' }}
            >
              {`${Math.sign(Data.DestinationTime.delayToDestination) === 1 ? '+' : ''}${Data.DestinationTime.delayToDestination}`}
            </Tag>
          )}
          <Divider style={{ margin: '5px 0px', background: '#cecece' }} />
        </Row>
      ))}
    </Space>
  );

  const status = worstStatus();

  return (
    <>
      <Popover
        placement="leftTop"
        content={content}
        arrowPointAtCenter
        overlayInnerStyle={{ color: '#2d2d2d' }}
      >
        <div
          className={`${styles[status]} ${(inStep) ? styles.bus : styles.busInTransit}
            ${(firstStepInRow.includes(String(index)) && !inStep) && styles.busInFirstTransit}`}
          style={{ background: 'none' }}
        >
          <Badge
            style={{ backgroundColor: '#488cf1' }}
            count={vehicles.length}
          >
            <img
              alt="bus"
              src="/images/svg/bus.svg"
              aria-label="buses"
              width={30}
              height={28}
              style={{ cursor: 'pointer' }}
            />
          </Badge>
        </div>
      </Popover>
      {(!inStep) && (<div className={`${styles[status]} ${styles.inTransit}`} />)}
    </>
  );
}

export default Vehicles;