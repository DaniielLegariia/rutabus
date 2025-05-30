import React from 'react';
import { Divider, Tooltip, Typography } from 'antd';
import dynamic from 'next/dynamic';
import statusFormat from '@/utils/statusFormat';
import styles from './routes.module.scss';

interface StepProps {
  index: number,
  step: StepAtt & { allUnits?: any[] }, // <-- agrega allUnits opcional
  stepsCount: number
}

interface StepAtt {
  vehiclesInStep: VehicleProps[],
  vehiclesInTransit: VehicleProps[],
  ShortName: string,
  StepID: number,
}

interface VehicleProps {
  Name: string,
  ShortName: string,
  RouteStatus: string,
  Data: Data
}

interface Data {
  DestinationTime: {
    ETA: number,
    delayToDestination: number,
    target: number
  },
  GPSTimestamp: string,
  currentSection: {
    elapsedTime: number,
    exceededTime: number,
    name: string
  },
  dissociateTime: number,
  lastTransition: {
    name: string,
    timestamp: string,
    type: string
  }
}

/**
 * Importación dinamica de nuestro componente
 * @name Vehicle
 * @constant
 */
const Vehicle = dynamic(() => import('./vehicle'));

/**
 * Importación dinamica de nuestro componente
 * @name Vehicles
 * @constant
 */
const Vehicles = dynamic(() => import('./vehicles'));

/**
 * Componente el cual renderiza el step de la ruta
 * @name Step
 * @component
 *
 * @property {Number} index - Numero del step a rederizar
 * @property {Object} step - Objeto con los atributos necesarios para renderizar el step
 * @property {Number} stepsCount - Total de steps de la ruta
 * @returns {React.ReactElement} - Componente para renderizar el step
 */
function Step({ index, step, stepsCount }: StepProps): React.ReactElement {
  const haveVehiclesInStep: boolean = step.vehiclesInStep?.length > 0;
  const statusWithoutExceededTime: string[] = ['ontime', 'arrivedtodestination','En espera','A tiempo','Tarde','Muy tarde','Llegó a destino', 'llegó a destino'];
  const showStepName: boolean = ((step.vehiclesInStep.length === 1)
    && (!statusWithoutExceededTime.includes(step.vehiclesInStep[0].RouteStatus)));

  const statusColor = () => {
    if (step.vehiclesInStep.length === 1) {
      const { color } = statusFormat('RouteStatus', step.vehiclesInStep[0].RouteStatus);
      return { background: color, borderColor: color };
    } if (step.vehiclesInStep.length > 1) {
      let status = '';
      for (let i = 0; i < step.vehiclesInStep.length; i += 1) {
        if (step.vehiclesInStep[i + 1]) {
          if (step.vehiclesInStep[i].RouteStatus.length
            < step.vehiclesInStep[i + 1].RouteStatus.length) {
            status = step.vehiclesInStep[i].RouteStatus;
          } else {
            status = step.vehiclesInStep[i + 1].RouteStatus;
          }
        }
      }
      const { color } = statusFormat('RouteStatus', status);
      return { background: color, borderColor: color };
    }

    return {};
  };

  let stepEta = '';
  if (step.stepEtas && step.ShortName && step.stepEtas[step.ShortName]) {
    const etaDate = new Date(step.stepEtas[step.ShortName]);
    stepEta = etaDate.toLocaleTimeString(); // Solo la hora
  }
    
function getEntryTimeForStep(vehicles: any[], stepId: number, stepName: string): string | null {
  for (const vehicle of vehicles) {
    if (vehicle.stepHistory && Array.isArray(vehicle.stepHistory)) {
      const history = vehicle.stepHistory.find(
        (h: any) =>
          (h.stepId === stepId) ||
          (h.stepName && h.stepName.toLowerCase() === stepName.toLowerCase())
      );
      if (history && history.entryTime) {
        const entryDate = new Date(history.entryTime);
        return entryDate.toLocaleTimeString();
      }
    }
  }
  return null;
}

const entryTime = getEntryTimeForStep(step.allUnits || [], step.StepID, step.ShortName);

return (
  <div key={step.StepID} className={styles.stepContainer}>
    {/* Nombre del step arriba */}
    {(!showStepName) && (
      <div className={styles.stepNameCont}>
        <Typography.Paragraph className={entryTime || stepEta ? styles.stepName : styles.stepName}>
          {step.ShortName}
        </Typography.Paragraph>
      </div>
    )}

    {/* Punto de la ruta/camión en medio */}
    {(index === stepsCount - 1) ? (
  <div className={styles.last}>
    {/* Punto */}
    <Tooltip arrowPointAtCenter title={step.ShortName} placement="rightBottom">
      <div
        className={`${styles.step} ${haveVehiclesInStep ? styles.in : ''}`}
        style={statusColor()}
      />
    </Tooltip>
    {/* Hora debajo del punto */}
    {(!showStepName) && (entryTime || stepEta) && (
      <div className={styles.stepEta} style={{ marginTop: '2.9rem', marginLeft: '-7.5rem' }}>
        {entryTime ? entryTime : stepEta}
      </div>
    )}
  </div>
) : (
  <>
    <Divider
      className={styles.divChild}
      plain={false}
      dashed
      orientation="left"
      orientationMargin="0px"
      style={{ borderTopColor: 'grey' }}
    >
      <Tooltip arrowPointAtCenter title={step.ShortName} placement="rightBottom">
        <div
          className={`${styles.step} ${haveVehiclesInStep ? styles.in : ''} `}
          style={statusColor()}
        />
      </Tooltip>
    </Divider>
    {/* Hora debajo para steps normales */}
    {(!showStepName) && (entryTime || stepEta) && (
      <div className={styles.stepEta}>
        {entryTime ? entryTime : stepEta}
      </div>
    )}
  </>
)}

    {/* Vehículos en el step */}
    {(step.vehiclesInStep.length > 1) && (
      step.vehiclesInStep.map((vehicle: VehicleProps) =>
        <Vehicle
          key={vehicle.Name}
          vehicle={vehicle}
          inStep
          index={index}
          isTheFirst={index === 1}
        />
      )
    )}
    {(step.vehiclesInStep.length === 1) && (
      step.vehiclesInStep?.map((vehicle: VehicleProps) =>
        <Vehicle
          key={vehicle.Name}
          vehicle={vehicle}
          inStep
          index={index}
          isTheFirst={index === 1}
        />
      )
    )}
    {(step.vehiclesInTransit.length > 1) && (
      <Vehicles
        inStep={false}
        vehicles={step.vehiclesInTransit}
        index={index}
      />
    )}
    {(step.vehiclesInTransit.length === 1) && (
      step.vehiclesInTransit?.map((vehicle: VehicleProps) =>
        <Vehicle
          key={vehicle.Name}
          vehicle={vehicle}
          inStep={false}
          index={index}
          isTheFirst={index === 1}
        />
      )
    )}
  </div>
);
}

export default Step;
