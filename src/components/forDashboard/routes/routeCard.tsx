import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { message, Button, Skeleton, Row, Space, Popover, Divider, Col } from 'antd';
import { WarningOutlined } from '@ant-design/icons';
import { useApi } from '@/hooks/Api';
import Step from './step';
import styles from './routes.module.scss';
import ProtectedRoute from '@/hocs/ProtectedRoute';
import { getListRutas, getListAssignedUnits, getLastEventUnits,disassociateVehicles } from '@/pages/api/Apis';
import AvailableUnitsModal from '@/components/elements/Modals/AvailableUnitsModal';

interface routeCardProps {
  routeId: string;
  name: string;
  user: User;
}

interface configStep {
  MinutesToDestination: number;
  tolerance: {
    SectionTime: number;
    OnTime: number;
    Delay: number;
  };
}

interface transitStep {
  MinutesToDestination: number;
  Name: string;
  tolerance: {
    SectionTime: number;
  };
}

interface stepsDataType {
  Name: string;
  ShortName: string;
  StepID: number;
  IsFinal: boolean;
  Config: configStep;
  Transit: transitStep;
  vehiclesInStep: any[];
  vehiclesInTransit: any[];
  idgeo: string;
}

interface vehicleData {
  GPSStatus: string;
  Name: string;
  RouteStatus: string;
  Server: string;
  ShortName: string;
  VehicleId: string;
}

interface vehicleProps {
  status: string;
  Name: string;
  VehicleId: string;
}

interface vehicleWithExceededTimeProps {
  Name: string;
  RouteStatus: string;
  ShortName: string;
  stepShortName: string;
  delayToDestination?: number;
  statusColor?: string;
}

interface DataProps {
  DestinationTime: {
    ETA: number;
    delayToDestination: number;
    target: number;
  };
  GPSTimestamp: string;
  currentSection: {
    elapsedTime: number;
    exceededTime: number;
    name: string;
  };
  dissociateTime: number;
  lastTransition: {
    name: string;
    timestamp: string;
    type: string;
  };
}

interface vehiclePropsInStep {
  Name: string;
  RouteStatus: string;
  ShortName: string;
  PK: string;
  Data: DataProps;
  stepShortName: string;
  delayToDestination?: number;
  statusColor?: string;
  vehicleIconColor?: string;
}

function RouteCard({ routeId, name, user }: routeCardProps): React.ReactElement {
  const { get, put } = useApi();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const vehicleLink = useState(false);
  const [, setIsVehicleLink] = vehicleLink;
  const [refreshModalData, setRefreshModalData] = useState(false);
  const [vehiclesInRoute, setVehiclesInRoute] = useState<vehicleData[]>([]);
  const [vehiclesArray, setVehiclesArray] = useState<vehicleProps[]>([]);
  const [vehiclesToLink, setVehiclesToLink] = useState(0);
  const [successVehicles, setSuccessVehicles] = useState(0);
  const breakAssociate = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [stepsWithVehicles, setStepsWithVehicles]: any[] = useState([]);
  const [vehiclesWithExceededTime, setVehiclesWithExceededTime] = useState<vehicleWithExceededTimeProps[]>([]);
  const [disasociateLoading, setDisasociateLoading] = useState(false);


  const { mutateAsync: updateVehicle } = put<{ id: number }>(
    `route/${routeId}/associate`,
    {}
  );


  /*const { mutate: disasociateVehicle, isLoading: disasociateLoading } = put<{ id: number }>(
    'route/vehicle/disassociate',
    {
      onSuccess: () => {
        fetchAssignedUnits();
        message.success('Vehículo desasociado correctamente');
      },
    }
  );*/

  const handleDisassociate = async (imei: string) => {
  setDisasociateLoading(true);
  try {
    await disassociateVehicles({ imeis: [imei], idruta: routeId });
    message.success('Vehículo desasociado correctamente');
    fetchAssignedUnits();
  } catch (error) {
    message.error('Error al desasociar el vehículo');
  } finally {
    setDisasociateLoading(false);
  }
};

  const fetchAssignedUnits = async () => {
    if (!routeId || !user?.idcliente) return;

    setIsLoading(true);
    try {
      const response = await getListAssignedUnits(user.idcliente, Number(routeId));
      if (response?.body?.data) {
        setVehiclesInRoute(response.body.data);
      } else {
        setVehiclesInRoute([]);
        message.warning('No se encontraron vehículos asignados a esta ruta.');
      }
    } catch (error) {
      console.error('Error al obtener los vehículos asignados:', error);
      message.error('Error al cargar los vehículos asignados.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchRouteData = async () => {
      if (!user?.idcliente) {
        message.error('El usuario no tiene un ID válido.');
        return;
      }

      setIsLoading(true);
      try {
        const response = await getListRutas(user.idcliente);
        if (!response.body || !response.body.routes) {
          message.error('No se encontraron rutas en la respuesta.');
          return;
        }

        const routeData = response.body.routes.find((route: any) => route.id === routeId);

        if (!routeData) {
          message.error('No se encontró la ruta.');
          return;
        }

        setData(routeData);
        if (routeData.steps) {
          await processSteps(routeData.steps);
        }
      } catch (error) {
        console.error('Error al cargar la ruta:', error);
        message.error('Error al cargar la ruta.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRouteData();
  }, [routeId, user?.idcliente]);

  useEffect(() => {
    fetchAssignedUnits();
  }, [routeId, user?.idcliente]);

  const normalizeString = (str: string) => {
    if (!str) return '';
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
  };

  const calculateDelayAndStatusColor = (unit: any, step: any) => {
    console.log('calculateDelayAndStatusColor unit', unit);
    console.log('calculateDelayAndStatusColor step', step);
    const eta = new Date(unit.status.eta).getTime();
    const targetTime = step.Transit?.MinutesToDestination
      ? new Date().getTime() + step.Transit.MinutesToDestination * 60 * 1000
      : new Date().getTime();
    const delayToDestination = Math.round((eta - targetTime) / (60 * 1000));

    let statusColor = 'gray';
    let vehicleIconColor = 'blue';

    switch (unit.status.routeStatus.toLowerCase()) {
      case 'en espera':
        statusColor = 'waiting';
        vehicleIconColor = 'blue';
        break;
      case 'sin ruta':
        statusColor = 'noRoute';
        vehicleIconColor = 'gray';
        break;
      case 'llegó a destino':
        statusColor = 'arrivedtodestination';
        vehicleIconColor = 'green';
        break;
      case 'a tiempo':
        statusColor = 'ontime';
        vehicleIconColor = 'green';
        break;
      case 'retraso':
        statusColor = 'delay';
        vehicleIconColor = 'yellow';
        break;
      case 'tarde':
        statusColor = 'late';
        vehicleIconColor = 'red';
        break;
      default:
        const onTimeThreshold = step.Transit?.tolerance?.OnTime || -5;
        const delayThreshold = step.Transit?.tolerance?.Delay || 5;

        if (delayToDestination <= onTimeThreshold) {
          statusColor = 'ontime';
        } else if (delayToDestination > onTimeThreshold && delayToDestination <= delayThreshold) {
          statusColor = 'delay';
        } else if (delayToDestination > delayThreshold) {
          statusColor = 'late';
        }
        vehicleIconColor = 'blue';
        break;
    }

    return { delayToDestination, statusColor, vehicleIconColor };
  };

  const processSteps = async (steps: any[]) => {
    console.log('processSteps steps', steps);
    const stepsWithVehicle: any[] = [];
    const vehicleWithExceededTime: any[] = [];

    try {
      const response = await getLastEventUnits([user.idcliente]);
      const unitEvents = response?.body?.units || [];

      steps.forEach((step: any, idx: number) => {
      const vehiclesInStep: any[] = [];
      const vehiclesInTransit: any[] = [];

      unitEvents.forEach((unit: any) => {
        if (unit.routeId === routeId && unit.imei) {
          const normalizedStepShortName = normalizeString(step.ShortName);
          const normalizedCurrentStep = normalizeString(unit.status?.currentStep);
          const normalizedNextStep = normalizeString(unit.status?.nextStep);

          const lastEvent = unit.recentEvents && unit.recentEvents.length > 0
            ? unit.recentEvents[unit.recentEvents.length - 1]
            : null;

          const { delayToDestination, statusColor, vehicleIconColor } = calculateDelayAndStatusColor(unit, step);

          if (lastEvent) {
            if (lastEvent.type === 'ENTRY' && normalizedCurrentStep === normalizedStepShortName) {
              vehiclesInStep.push({
                ...unit,
                ShortName: unit.short_name,
                PK: `UNIT#${unit.imei}`,
                RouteStatus: unit.status?.routeStatus,
                delayToDestination,
                statusColor,
                vehicleIconColor,
                stepShortName: step.ShortName,
                Data: {
                    DestinationTime: {
                      delayToDestination: unit.delayMinutes ?? unit.status?.delayMinutes,
                      ETA: unit.status?.eta,
                      target: null // pon aquí el valor correcto si lo tienes
                    },
                    currentSection: {
                      exceededTime: unit.status?.exceededTime,
                      name: unit.status?.currentStep,
                      elapsedTime: unit.status?.sectionTime,
                    },
                    GPSTimestamp: unit.status?.lastUpdate,
                    dissociateTime: null,
                    lastTransition: {
                      name: '',
                      timestamp: '',
                      type: ''
                    }
                  }
                });
                } 
            // Cambia aquí: si el último evento es EXIT y el step es el de salida, ponlo en tránsito en este step
            else if (lastEvent.type === 'EXIT' && normalizedStepShortName === normalizeString(lastEvent.geofenceShortName)) {
              vehiclesInTransit.push({
                ...unit,
                ShortName: unit.short_name,
                PK: `UNIT#${unit.imei}`,
                RouteStatus: unit.status?.routeStatus,
                delayToDestination,
                statusColor,
                vehicleIconColor,
                stepShortName: step.ShortName,
                Data: {
                    DestinationTime: {
                      delayToDestination: unit.delayMinutes ?? unit.status?.delayMinutes,
                      ETA: unit.status?.eta,
                      target: null // pon aquí el valor correcto si lo tienes
                    },
                    currentSection: {
                      exceededTime: unit.status?.exceededTime,
                      name: unit.status?.currentStep,
                      elapsedTime: unit.status?.sectionTime,
                    },
                    GPSTimestamp: unit.status?.lastUpdate,
                    dissociateTime: null,
                    lastTransition: {
                      name: '',
                      timestamp: '',
                      type: ''
                    }
                  }
              });
            }
          } else {
            if (normalizedCurrentStep === normalizedStepShortName) {
              vehiclesInStep.push({
                ...unit,
                ShortName: unit.short_name,
                PK: `UNIT#${unit.imei}`,
                RouteStatus: unit.status?.routeStatus,
                delayToDestination,
                statusColor,
                vehicleIconColor,
                stepShortName: step.ShortName,
                Data: {
                    DestinationTime: {
                      delayToDestination: unit.delayMinutes ?? unit.status?.delayMinutes,
                      ETA: unit.status?.eta,
                      target: null // pon aquí el valor correcto si lo tienes
                    },
                    currentSection: {
                      exceededTime: unit.status?.exceededTime,
                      name: unit.status?.currentStep,
                      elapsedTime: unit.status?.sectionTime,
                    },
                    GPSTimestamp: unit.status?.lastUpdate,
                    dissociateTime: null,
                    lastTransition: {
                      name: '',
                      timestamp: '',
                      type: ''
                    }
                  }
              });
            }
          }
        }
      });

      stepsWithVehicle.push({ ...step, vehiclesInStep, vehiclesInTransit,  stepEtas: unitEvents.length > 0 ? unitEvents[0].stepEtas : {},allUnits: unitEvents, });
    });

      unitEvents.forEach((unit: any) => {
        console.log('unit in processSteps', unit);
        if (unit.routeId === routeId && unit.status?.exceededTime > 0) {
          const stepName = unit.status.currentStep;
          const normalizedStepName = normalizeString(stepName);
          const step = steps.find((s: any) => normalizeString(s.ShortName) === normalizedStepName);
          const { delayToDestination, statusColor } = calculateDelayAndStatusColor(unit, step || {});
          vehicleWithExceededTime.push({
            ShortName: unit.short_name,
            RouteStatus: unit.status?.routeStatus,
            PK: `UNIT#${unit.imei}`,
            stepShortName: step ? step.ShortName : `Traslado a ${unit.status?.nextStep || stepName}`,
            Data: {
              currentSection: {
                exceededTime: unit.status.exceededTime,
                name: stepName,
              },
            },
            delayToDestination,
            statusColor,
          });
        }
      });

      setStepsWithVehicles(stepsWithVehicle);
      setVehiclesWithExceededTime(vehicleWithExceededTime);
    } catch (error) {
      console.error('Error al procesar pasos:', error);
      message.error('Error al procesar los pasos de la ruta.');
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isModalVisible && data?.steps) {
        processSteps(data.steps);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isModalVisible, data?.steps]);

  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const handleSelectUnit = (unit: any) => {
    setIsModalVisible(false);
  };


  const vehiclesInRouteContent = (
    <Space
      aria-label="vehiclesInRouteContent"
      direction="vertical"
      style={{ maxHeight: '6rem', overflow: 'auto' }}
    >
      {vehiclesInRoute?.length ? (
        vehiclesInRoute.map((unit: any) => (
          console.log('unit', unit),
          <Row justify="space-between" key={unit.imei || unit.short_name} style={{ textAlign: 'left', alignItems: 'center' }}>
            <div
              className={styles.vehicleWithExceededTime}
              style={{ marginRight: '1rem', fontWeight: 'bold', width: '7rem' }}
            >
              {unit.short_name || unit.Name}
            </div>
            <Button
              danger
              type="primary"
              size="small"
              style={{ marginBottom: '5px' }}
              loading={disasociateLoading}
              onClick={() => handleDisassociate(unit.imei || (unit.PK && unit.PK.split('#')[1]))}
            >
              Desasociar
            </Button>
            <Divider style={{ margin: '0px 0px 5px 0px', background: '#cecece' }} />
          </Row>
        ))
      ) : (
        <>No hay vehículos en la ruta</>
      )}
    </Space>
  );

  const content = (
    <Space direction="vertical" style={{ maxHeight: '6rem', overflow: 'auto' }}>
      {vehiclesWithExceededTime.map(
        ({ ShortName, PK, Data, stepShortName, delayToDestination, statusColor }: vehiclePropsInStep | any) => (
          <Row justify="space-between" key={PK} style={{ textAlign: 'left' }}>
            <div
              className={styles.vehicleWithExceededTime}
              style={{ marginRight: '1rem', fontWeight: 'bold', width: '5rem' }}
            >
              {ShortName}
            </div>
            <div style={{ marginRight: '1rem', width: '10rem' }}>{stepShortName}</div>
            <div
              className={styles.vehicleWithExceededTime}
              style={{ color: statusColor === 'late' ? '#f5222d' : statusColor === 'delay' ? '#faad14' : '#52c41a', width: '3rem' }}
            >
              {delayToDestination !== undefined ? (delayToDestination > 0 ? `+${delayToDestination}` : delayToDestination) : `+${Data.currentSection.exceededTime}`}
            </div>
            <Divider style={{ margin: '0px 0px 5px 0px', background: '#cecece' }} />
          </Row>
        )
      )}
    </Space>
  );

  return (
    <div aria-label="RouteCard" key={routeId}>
      <div key={routeId} className={styles.card}>
        <Row style={{ alignItems: 'baseline' }} justify="space-between">
          <Row style={{ alignItems: 'baseline', padding: '0rem 1rem' }}>
            <h4 className={styles.title_card}>{name}</h4>
            <Popover
              placement="leftBottom"
              content={vehiclesInRouteContent}
              arrowPointAtCenter
              overlayInnerStyle={{ color: '#2d2d2d' }}
            >
              <Row className={styles.assignedVehiclesCont}>
                <div style={{ marginRight: '3px', fontWeight: 'bold' }}>
                  {vehiclesInRoute ? vehiclesInRoute.length : '0'}
                </div>
                <div>vehículo(s) asignado(s)</div>
              </Row>
            </Popover>
            {vehiclesWithExceededTime?.length ? (
              <Popover
                placement="rightBottom"
                content={content}
                arrowPointAtCenter
                overlayInnerStyle={{ color: '#2d2d2d' }}
              >
                <Row style={{ marginLeft: '1.2rem' }}>
                  <div style={{ fontSize: '12px', marginRight: '3px', fontWeight: 'bold' }}>
                    {vehiclesWithExceededTime?.length}
                  </div>
                  <WarningOutlined style={{ color: '#F14854', cursor: 'pointer', fontSize: 'initial' }} />
                </Row>
              </Popover>
            ) : null}
          </Row>
          <Row className={styles.addButton}>
            <Button
              aria-label="addVehiclesToRouteButton"
              onClick={handleOpenModal}
              type="default"
              size="small"
            >
              Asignar vehículo
            </Button>
          </Row>
          <Divider style={{ margin: '0.5rem 0rem', background: '#EBEBEB' }} />
        </Row>
        {isLoading ? (
          <Skeleton />
        ) : (
          <div aria-label="Steps">
            <Row className={styles.steps_box}>
              {stepsWithVehicles?.length > 0 ? (
                stepsWithVehicles.map((step: stepsDataType, index: number) => (
                  <Col key={step.idgeo} span={3} style={{ height: '5.5rem' }}>
                    <Step
                      key={step.idgeo}
                      index={index}
                      step={step}
                      stepsCount={stepsWithVehicles.length}
                    />
                  </Col>
                ))
              ) : (
                <div>No hay pasos disponibles</div>
              )}
            </Row>
          </div>
        )}
      </div>

      <AvailableUnitsModal
        isVisible={isModalVisible}
        onClose={handleCloseModal}
        idcliente={user.idcliente}
        routeId={routeId}
        onSave={async (selectedUnits) => {
          setIsLoading(true);
          try {
            for (const unit of selectedUnits) {
              await updateVehicle({
                server: unit.Server,
                vehicleId: unit.VehicleId,
                routeName: name,
              });
            }
            message.success('Unidades asociadas correctamente');
            await fetchAssignedUnits();
            if (data?.steps) {
              await processSteps(data.steps);
            }
          } catch (error) {
            console.error('Error al asociar unidades:', error);
            message.error('Error al asociar las unidades');
          } finally {
            setIsLoading(false);
            setIsModalVisible(false);
          }
        }}
        onSelectUnit={handleSelectUnit}
      />
    </div>
  );
}

const component: any = ProtectedRoute(RouteCard);
component.Layout = true;
export default RouteCard;