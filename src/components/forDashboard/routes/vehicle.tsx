import React from 'react';
import { Tag, Tooltip } from 'antd';
import statusFormat from '@/utils/statusFormat';
import styles from './routes.module.scss';

interface VehicleProps {
  vehicle: VehicleAtt;
  index: number;
  inStep: boolean;
  isTheFirst: boolean;
}

interface VehicleAtt {
  Data: any;
  RouteStatus: string;
  ShortName: string;
}

const getBadgeColor = (status: string) => {
  switch (status) {
    case 'ontime':
    case 'a tiempo':
    case 'arrivedtodestination':
    case 'llegó a destino':
      return '#52c41a'; // verde
    case 'delay':
    case 'retraso':
      return '#faad14'; // amarillo
    case 'late':
    case 'tarde':
      return '#f5222d'; // rojo
    case 'waiting':
    case 'noRoute':
    case 'en espera':
    case 'sin ruta':
    default:
      return '#bfbfbf'; // gris
  }
};

function Vehicle({ vehicle, index, isTheFirst, inStep }: VehicleProps) {
  const { Data, RouteStatus, ShortName } = vehicle;
  console.log('vehicle', vehicle);
  console.log('RouteStatus', RouteStatus);
  const firstStepInRow: string[] = ['1', '9', '17'];
  let status = RouteStatus.toLowerCase();
  console.log('status', status);
  if (status === 'en espera') status = 'waiting';
  if (status === 'sin ruta') status = 'noRoute';
  if (status === 'llegó a destino') status = 'arrivedtodestination';
  if (status === 'a tiempo') status = 'ontime';
  if (status === 'retraso') status = 'delay';
  if (status === 'tarde') status = 'late';
  if (status === 'Tarde') status = 'late';

  const { color = 'grey' } = RouteStatus
    ? statusFormat('RouteStatus', RouteStatus)
    : {};

  return (
    <>
      <Tooltip
        title={ShortName}
        placement="top"
        arrowPointAtCenter
        overlayInnerStyle={{
          background: '#DEDEDE',
          color: '#474747',
          border: '#707070 solid 1px',
          maxWidth: '6rem',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          textAlign: 'center',
          fontWeight: 'bold',
        }}
      >
<div
  className={`${styles[status]} ${(inStep) ? styles.bus : styles.busInTransit}
    ${(firstStepInRow.includes(String(index)) && !inStep) && styles.busInFirstTransit}`}
  style={{
    background: 'none',
    position: status === 'arrivedtodestination' ? 'absolute' : 'relative'
  }}
>
  <img
    alt="bus"
    src="/images/svg/bus.svg"
    aria-label="bus"
    width={30}
    height={28}
    style={{ cursor: 'pointer' }}
  />
{(status === 'delay' || status === 'late' || status === 'tarde' || status === 'a tiempo' || status === 'ontime' || status === 'arrivedtodestination' || status === 'llegó a destino') && (
  Data?.DestinationTime?.delayToDestination !== undefined && Data.DestinationTime.delayToDestination > 0 ? (
    <div className={styles.exceededTime}
      style={{
        background: getBadgeColor(status),
        position: 'absolute',
        left: '50%',
        transform: inStep ? 'translateX(0%)' : 'translateX(170%)',
        top: inStep ? 45 : 15,
        minWidth: 32,
        textAlign: 'center',
        borderRadius: 8,
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        zIndex: 2,
        padding: '2px 8px',
      }}
    >
      {`${Math.sign(Data.DestinationTime.delayToDestination) === 1 ? '+' : ''}${Data.DestinationTime.delayToDestination}`}
    </div>
  ) : Data?.currentSection?.exceededTime !== undefined && Data.currentSection.exceededTime > 0 && (
    <div className={styles.exceededTime}
      style={{
        background: getBadgeColor(status),
        position: 'absolute',
        left: '50%',
        transform: inStep ? 'translateX(-110%)' : 'translateX(75%)',
        top: inStep ? 80 : 45,
        minWidth: 32,
        textAlign: 'center',
        borderRadius: 8,
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        zIndex: 2,
        padding: '2px 8px',
      }}
    >
      {`${Math.sign(Data.currentSection.exceededTime) === 1 ? '+' : ''}${Data.currentSection.exceededTime}`}
    </div>
  )
)}
</div>
      </Tooltip>
      {(!inStep) && (<div className={`${styles[status]} ${styles.inTransit}`} />)}
    </>
  );
}

export default Vehicle;