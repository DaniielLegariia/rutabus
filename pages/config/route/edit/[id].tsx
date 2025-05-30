import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import ProtectedRoute from '@/hocs/ProtectedRoute';
import useLoading from '@/providers/LoadingProvider';
import { useApi } from '@/hooks/Api';
import { routeFields, routeMessages, routeSchema } from '@/fields/route/fields';
import GeoFencesModal from '@/components/elements/Modals/GeofencesModal';
import EditGeofencesModal from '@/components/elements/Modals/EditGeofencesModal';

import {
  Layout,
  Button,
  message,
  Divider,
  Alert,
  Space
} from 'antd';
import GeofencesTable from '@/components/forRoute/GeofencesTable';
import FormElement from '@/views/page/FormElement';
import { useNavigation } from '@/views/layout/Layout';
import { getRoute,getListAssignedUnits,updateRoute, getGeofences,disassociateVehicles,getListGeofences} from '@/pages/api/Apis';

interface rowTable {
  Name: string,
  SectionTime: number,
  ShortName: string,
  Type: string,
  isFinal: boolean,
  key: React.Key,
  TransitSectionTime: number,
  TransitTo: string,
  index: number
}

interface routeValues {
  delay: number,
  description: string,
  finalDestination: string,
  finalDestinationAuto: boolean,
  toleranceDelay: number,
  toleranceOnTime: number
  name: string,
  disassociateVehicle: boolean,
  disassociateVehicleTrigger: string,
  disassociateVehicleTime: number
}

interface easytrackGeofence {
  id: number,
  idgeo?: number, // Add the optional `idgeo` property
  name: string,
  ShortName: string,
  SectionTime: number,
  TransitSectionTime: number
}

interface vehicleProps {
  status: string,
  Name: string,
  VehicleId: string
}

/**
 * Importación dinamica de nuestro modal
 * @name AsyncModal
 * @constant
 */
const AsyncModal = dynamic(() => import('@/components/elements/Modals/AsyncModal'));

/**
 * Vista para modificar una ruta
 * @view
 *
 * @returns {Component} - Regresa vista para modificar ruta
 */
function EditRoute({ user }: { user: User }): React.ReactElement {
  const { idcliente, tcvUserId} = user; // Extraer idcliente del usuario
  const { back } = useNavigation();
  const { query } = useRouter();
  const { put, get } = useApi();
  const [showLoading, hideLoading] = useLoading();

  const isModalVisible = useState(false);
  const [, setModal] = isModalVisible;
  const [dataSource, setDataSource]: any[] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  const [routeName, setRouteName] = useState('');
  const [initialValues, setInitialValues] = useState({});

  const vehicleLink = useState(false);
  const [, setIsVehicleLink] = vehicleLink;
  const [vehiclesArray, setVehiclesArray] = useState<vehicleProps[]>([]);
  const [successVehicles, setSuccessVehicles] = useState(0);
  const breakDisassociate = useRef(false);
  const [loading, setLoading] = useState(true); // Estado de carga
  const [geofencesData, setGeofencesData] = useState([]); // Nuevo estado para almacenar las geocercas
  const [selectedGeofences, setSelectedGeofences] = useState([]);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [vehiclesInRoute, setVehiclesInRoute] = useState<any[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState<boolean>(true);
  const [steps, setSteps] = useState([]);
  const [cachedGeofences, setCachedGeofences] = useState<any[]>([]); // Nuevo estado para almacenar las geocercas

  /**
   * Función para convertir las horas utc en locales
   * @name getHourInLocal
   * @function
   *
   * @param {String} hour - Horas y minutos deseados por el usuario
   * @returns {String} - Horas y minutos en formato local
   */
  const getHourInLocal = (hour: string): string => {
    if (!hour) return ''; // Si no hay hora, devuelve una cadena vacía
  
    const [hours, minutes] = hour.split(':'); // Divide la hora en horas y minutos
    const utcDate = new Date(Date.UTC(1970, 0, 1, Number(hours), Number(minutes))); // Crea una fecha en UTC
    const localTime = utcDate.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false, // Formato de 24 horas
    });
  
    return localTime; // Devuelve la hora local en formato "HH:mm"
  };
  /**
   * UseEffect para la creación del nombre de la ruta y para filtrar
   * las geocercas ya seleccionadas en el modal de geocercas.
   */
  useEffect(() => {
    const selectedItemsAux = dataSource?.map((data:rowTable) => ({
      ...data,
      name: data.Name
    }));

    setSelectedItems(selectedItemsAux);

    if (dataSource?.length > 1) {
      setRouteName(`${dataSource[0]?.Name} - ${dataSource[dataSource.length - 1]?.Name}`);
    } else {
      setRouteName(dataSource?.length ? `${dataSource[0]?.Name}` : '');
    }
  }, [dataSource]);

  /**
   * Query GET para obtener la información de la ruta en especifico
   * @hook
   */

  // Llamar a la API para obtener los datos de la ruta
  useEffect(() => {
    const fetchRoute = async () => {
      if (!query?.id) return; // Asegurarse de que el ID esté definido
      setLoading(true); // Mostrar indicador de carga
  
      try {
        const data = await getRoute(Number(query.id), idcliente); // Llamar a la función con el ID y el idcliente
        console.log('Data de la ruta:', data);
        if (data?.body.route) {
          const { route } = data.body;
          setRouteName(route.Name);
          setInitialValues({
            name: route.Name,
            description: route.Description,
            toleranceOnTime: route.tolerance.OnTime,
            toleranceDelay: route.tolerance.Delayed,
            finalDestinationAuto: !route.FinalDestination.time,
            finalDestination: getHourInLocal(route.FinalDestination.time), // Convertir a hora del centro de México
            disassociateVehicle: route.dissociate.config === 'auto',
            disassociateVehicleTrigger: route.dissociate.trigger,
            disassociateVehicleTime: route.dissociate.referenceTime,
          });
          
          const transformedSteps = route.steps.map((step: any, index: number) => ({
            idgeo: step.idgeo,
            Type: step.Type,
            key: step.Name,
            Name: step.Name,
            ShortName: step.ShortName,
            SectionTime: step.Config?.tolerance?.SectionTime ?? null,
            isFinal: step.IsFinal,
            index,
            TransitSectionTime: step.Transit?.tolerance?.SectionTime || 0,
            TransitTo: step.Transit?.Name,
          }));
  
          setSteps(transformedSteps);
          setDataSource(transformedSteps);
  
          message.success('Ruta cargada con éxito');
        } else {
          message.error('No se encontró la ruta.');
        }
      } catch (error) {
        console.error('Error al obtener la ruta:', error);
        message.error('Error al cargar la ruta.');
      } finally {
        setLoading(false); // Ocultar indicador de carga
      }
    };
  
    fetchRoute();
  }, [query?.id, idcliente]); // Ejecutar cuando cambie el ID o el idcliente

  /**
   * Query GET para obtener los vehiculos vinculados a esta ruta
   * @hook
   */

  useEffect(() => {
    const fetchAssignedUnits = async () => {
      if (!query?.id || !idcliente) return; // Asegurarse de que `query.id` e `idcliente` estén definidos
  
      setVehiclesLoading(true); // Mostrar indicador de carga
      try {
        const response = await getListAssignedUnits(idcliente, Number(query.id)); // Llamar a la función con `idcliente` y `idruta`
        console.log('Respuesta de la API:', response);
  
        // Verificar si la respuesta contiene el cuerpo esperado
        if (response?.body?.data) {
          setVehiclesInRoute(response.body.data); // Guardar los datos de las unidades asignadas
          message.success(`Se encontraron ${response.body.count} vehículo(s) asignado(s).`);
        } else {
          setVehiclesInRoute([]); // Si no hay datos, establecer un array vacío
          message.warning('No se encontraron vehículos asignados a esta ruta.');
        }
      } catch (error) {
        console.error('Error al obtener los vehículos asignados:', error);
        message.error('Error al cargar los vehículos asignados.');
      } finally {
        setVehiclesLoading(false); // Ocultar indicador de carga
      }
    };
  
    fetchAssignedUnits();
  }, [query?.id, idcliente]);
 
  /**
   * Query PUT donde guardamos la modificación al registro de vehículo 'desasociación'
   * @hook
   */
  const { mutateAsync: updateVehicle } = put<{ id: number }>(
    'route/vehicle/disassociate', {});

  /**
   * Función para abrir el modal de las geocercas
   * @name openGeoModal
   * @function
   */
 const openGeoModal = async () => {
     setModal(true);
   
     // Si ya hay datos en caché, reutilízalos
     if (cachedGeofences.length > 0) {
       console.log('Usando datos en caché:', cachedGeofences); // Depuración
       setGeofencesData(cachedGeofences);
       return;
     }
   
     showLoading();
     try {
       // Llamar a la nueva API
       const response = await getListGeofences(idcliente);
   
       // Verificar si la respuesta tiene el formato esperado
       if (response?.statusCode === 200 && response.body?.GEOCERCAS) {
         // Extraer y transformar los datos de las geocercas
         const geofences = response.body.GEOCERCAS.map((geofence: any) => ({
           ID_GEOCERCA: parseInt(geofence.id_geocerca, 10),
           GEOCERCA: geofence.name_plataforma,
           COORDENADAS: geofence.coordinates,
           sectionTime: parseInt(geofence.sectionTime, 10),
           shortName: geofence.shortName,
           ID_TIPO_GEOCERCA: geofence.tipogeo,
           transitSectionTime: parseInt(geofence.transitSectionTime, 10),
         }));
   
         // Guardar los datos en caché
         setCachedGeofences(geofences);
   
         // Actualizar el estado con los datos transformados
         setGeofencesData(geofences);
       } else {
         throw new Error('Formato de respuesta no válido');
       }
     } catch (error) {
       console.error('Error al obtener las geocercas:', error);
       message.error('Error al obtener las geocercas');
     } finally {
       hideLoading();
     }
   };

  const closeGeoModal = () => {
    setModal(false);
  };

  const handleFirstModalSave = (items: any) => {
    console.log('Datos recibidos en handleFirstModalSave:', items);
  
    // Transformar los datos seleccionados
    const newSteps = items.map((item: any) => ({
      idgeo: item.id_geocerca, // Conserva el campo `idgeo`
      Type: 'Step',
      key: item.id_geocerca || item.name, // Usa `idgeo` como clave si está disponible
      Name: item.name || item.Name, // Nombre de la geocerca
      ShortName: item.shortName || item.shortName || item.name, // Nombre corto
      SectionTime: Number(item.SectionTime || item.sectionTime) || 0, // Convertir a número
      TransitSectionTime: Number(item.TransitSectionTime || item.transitSectionTime) || 0, // Convertir a número
      coordinates: item.coordinates || item.COODENADAS, // Coordenadas
      tipogeo: item.tipogeo || item.type, // Tipo de geocerca
      isFinal: false, // Inicialmente no es final, se recalculará más adelante
      TransitTo: '', // Se recalculará más adelante
    }));
  
    // Actualizar `steps` y recalcular índices y propiedades
    setSteps((prevSteps) => {
      const updatedSteps = [...prevSteps, ...newSteps];
  
      // Recalcular índices y propiedades
      const recalculatedSteps = updatedSteps.map((step, index) => ({
        ...step,
        index,
        isFinal: index === updatedSteps.length - 1, // Solo el último registro es final
        SectionTime: step.SectionTime ?? 0, // Asegúrate de que tenga un valor por defecto
        TransitSectionTime: index === updatedSteps.length - 1
          ? null // El último registro no tiene TransitSectionTime
          : step.TransitSectionTime ?? 0, // Asegúrate de que tenga un valor por defecto
        TransitTo: index !== updatedSteps.length - 1
          ? `Traslado a ${updatedSteps[index + 1]?.Name}` // Solo si no es el último
          : '',
      }));
  
      setDataSource(recalculatedSteps); // Sincronizar con dataSource
      console.log('Steps después de agregar:', recalculatedSteps); // Depuración
      return recalculatedSteps;
    });
  
    message.success('Paradas agregadas exitosamente');
  };
  /**
   * Función para agregar nuevas geocercar junto su traslado.
   * @name handleAdd
   * @function
   *
   * @param {Array} elements - Nuevos elementos a agregar.
   */
  const handleAdd = (elements:easytrackGeofence[]) => {
    /**
     * Se crean los nuevos elementos
     */
    const newData: any[] = [];
    elements.forEach((geofence, index) => {
        newData.push({
          Type: 'Step',
          key: geofence.name,
          Name: geofence.name,
          ShortName: (geofence.ShortName) ? geofence.ShortName : geofence.name,
          SectionTime: (index === elements.length - 1)
            ? null : geofence.SectionTime || 0,
          isFinal: (index === elements.length - 1),
          index,
          TransitSectionTime: (index === elements.length - 1)
            ? null : geofence.TransitSectionTime || 0,
          TransitTo: (index !== elements.length - 1) ? `Traslado a ${elements[index + 1].name}` : ''
        });
    });

    setDataSource(newData);

    setModal(false);
  };

  /**
   * Función para guardar los cambios de la la celda editable de una row
   * @name handleOnEdit
   * @function
   *
   * @param {Object} row - Objeto con las propiedades de la row.
   */
  
  const handleOnEdit = (row: IRecord) => {
    if (row.ShortName.trim() === '') {
      message.warning('El nombre corto no puede estar vacío.');
      return;
    }
  
    setSteps((prevSteps) => {
      const updatedSteps = prevSteps.map((step) =>
        step.index === row.index ? { ...step, ...row } : step
      );
  
      // Recalcular índices y propiedades
      const recalculatedSteps = updatedSteps.map((step, index) => ({
        ...step,
        index,
        isFinal: index === updatedSteps.length - 1,
        TransitTo: index !== updatedSteps.length - 1
          ? `Traslado a ${updatedSteps[index + 1]?.Name}`
          : '',
      }));
  
      setDataSource(recalculatedSteps); // Sincronizar con dataSource
      console.log('Steps después de editar:', recalculatedSteps); // Depuración
      return recalculatedSteps;
    });
  
    message.success('Registro editado exitosamente.');
  };
  /**
   * Función para eliminar un row de la tabla
   * @name handleOnDeleteRow
   * @function
   *
   * @param {String} name - Nombre de la geocerca (row) a eliminar
   */
  const handleOnDeleteRow = (indexToDelete: number) => {
    console.log('Índice a eliminar:', indexToDelete); // Verificar el índice que se pasa
  
    setSteps((prevSteps) => {
      const filteredSteps = prevSteps.filter((step) => step.index !== indexToDelete);
  
      // Recalcular índices y propiedades
      const updatedSteps = filteredSteps.map((step, index) => ({
        ...step,
        index, // Recalcular los índices
        isFinal: index === filteredSteps.length - 1, // Solo el último registro es final
        TransitTo: index !== filteredSteps.length - 1
          ? `Traslado a ${filteredSteps[index + 1]?.Name}`
          : '',
      }));
  
      setDataSource(updatedSteps); // Sincronizar con dataSource
      console.log('Steps después de eliminar:', updatedSteps); // Depuración
      return updatedSteps;
    });
  
    message.success('Registro eliminado exitosamente.');
  };
  /**
   * Función donde obtenemos los minutos a destino desde alguna geocerca
   * @name getMinutesToDestination
   * @function
   *
   * @param {Number} index - Indice que nos indica a partir de donde recorre el arreglo
   *
   * @returns {Number} - Minutos a destino desde cierta geocerca
   */
  const getMinutesToDestination = (index: number):number => {
    let minutes = 0;

    for (let i = index; i < dataSource.length; i += 1) {
      if (dataSource[i].SectionTime && dataSource[i].TransitSectionTime) {
        minutes += (dataSource[i].SectionTime + dataSource[i].TransitSectionTime);
      }
    }

    return minutes;
  };

  /**
   * Función para convertir las horas locales en utc
   * @name setHourInUTC
   * @function
   *
   * @param {String} hour - Horas y minutos deseados por el usuario
   * @returns {String} - Horas y minutos en UTC
   */
  const setHourInUTC = (hour: string):string => {
    const [hours, min] = hour.split(':');
    const targetTime = new Date().setHours(Number(hours), Number(min));

    const h = new Date(targetTime).getUTCHours();

    return `${h}:${min}`;
  };

  /**
   * Función para guardar la ruta en la DB
   * @name handleOnSave
   * @function
   *
   * @param {Object} values - Valores del formulario de ruta
   */
  const handleOnSave = async (values: routeValues) => {
    try {
      if (dataSource.length < 2) {
        return message.error('Debes tener como mínimo 2 paradas');
      }
  
      // Reconstruir los pasos (steps) con la estructura original
      const steps = dataSource.map((step, index) => ({
        idgeo: step.idgeo,
        Type: step.Type,
        Name: step.Name,
        ShortName: step.ShortName,
        IsFinal: index === dataSource.length - 1,
        Config: {
          tolerance: {
            SectionTime: step.SectionTime || 0,
          },
        },
        Transit: index === dataSource.length - 1
          ? null
          : {
              Name: step.TransitTo,
              tolerance: {
                SectionTime: step.TransitSectionTime || 0,
              },
            },
      }));
      console.log('hora seteada: ',values.finalDestination)
      // Reconstruir el objeto `route` con la estructura original
      const routeToSave = {
        ...initialValues, // Mantener los valores originales del formulario
        Name: routeName,
        Description: values.description,
        tolerance: {
          OnTime: values.toleranceOnTime,
          Delayed: values.toleranceDelay,
        },
        dissociate: {
          config: values.disassociateVehicle ? 'auto' : 'manual',
          trigger: values.disassociateVehicle ? values.disassociateVehicleTrigger : '',
          referenceTime: values.disassociateVehicle ? values.disassociateVehicleTime : 0,
        },
        FinalDestination: {
          time: values.finalDestinationAuto ? '' : setHourInUTC(values.finalDestination),
        },
        steps, // Pasos actualizados
      };
  
      // Llamar a la API para guardar los cambios
      showLoading('Guardando cambios...');
      const response = await updateRoute(Number(query.id), idcliente, routeToSave);
  
      if (response && response.ok) {
        message.success('Ruta actualizada con éxito');
        back('/config/route/');
      } else {
        message.error('Error al actualizar la ruta');
      }
    } catch (error) {
      console.error('Error al guardar la ruta:', error);
      message.error('Error al guardar la ruta');
    } finally {
      hideLoading();
    }
  };

  /**
   * Función para abrir el modal para desvincular vehículos y comenzar
   * con el proceso de desvinculación
   * @name onDisassociateVehicles
   * @function
   */
  const onDisassociateVehicles = async () => {
    if (!vehiclesInRoute || vehiclesInRoute.length === 0) {
      return message.warning('No hay vehículos vinculados para desasociar.');
    }
  
    try {
      // Mostrar indicador de carga
      showLoading('Desasociando vehículos...');
  
      // Obtener los identificadores únicos (imeis) de los vehículos vinculados
      const imeis = vehiclesInRoute.map((vehicle: any) => vehicle.imei); // Ajusta `imei` según el campo correcto en tu API
  
      // Obtener el ID de la ruta desde `query?.id`
      const idruta = Array.isArray(query?.id) ? query.id[0] : query?.id;
  
      if (!idruta) {
        throw new Error('El ID de la ruta no está definido.');
      }
  
      // Llamar a la función `disassociateVehicles` para eliminar los vehículos
      const resp = await disassociateVehicles({ imeis, idruta });
      console.log('Respuesta de la API:', resp);
  
      if (resp && resp.statusCode === 200) {
        // Actualizar el estado para reflejar que ya no hay vehículos vinculados
        setVehiclesInRoute([]);
        message.success('Todos los vehículos han sido desasociados correctamente.');
      } else {
        message.error(resp?.message || 'Error al desasociar los vehículos.');
      }
    } catch (error) {
      console.error('Error al desasociar los vehículos:', error);
      message.error(error.message || 'Error al desasociar los vehículos.');
    } finally {
      // Ocultar indicador de carga
      hideLoading();
    }
  };
  /**
   * @const {Object} settings - Objeto con las configuraciones necesarias para
   * crear una nueva ruta en el componente de formElement.
   */
  const settings = {
    back: '/config/route/', // Ruta para regresar
    title: routeName, // Título del formulario
    id: query?.id, // ID del registro que se está editando
    edition: true, // Indica que el formulario está en modo de edición
    can: {
      delete: true, // Permitir eliminar el registro
    },
    loading,
    disabledSave: vehiclesInRoute?.length > 0, // Pasar esta lógica
    idcliente,
    handleOnSave, // Función para guardar los datos del formulario
    form: {
      className: 'user-form',
      layout: 'vertical',
      name: 'editRoute',
      initialValues,
      requiredMark: true,
      disabledFields: vehiclesInRoute?.length > 0
        ? [
            'description',
            'finalDestinationAuto',
            'finalDestination',
            'disassociateVehicle',
            'toleranceOnTime',
            'toleranceDelay',
          ]
        : [],
    },
    validationSchema: routeSchema, // Esquema de validación
    messages: routeMessages, // Mensajes personalizados para el formulario
    source: {
      url: 'route',
      key: 'route',
    },
    fieldset: routeFields(dataSource ? dataSource[dataSource.length - 1]?.Name : ''), // Generación dinámica de campos
    vehiclesInRoute,
  };

  return (
    <div aria-label="editRoute-container">

      {(!vehiclesLoading && vehiclesInRoute?.length > 0) && (
        <Alert
          style={{ marginBottom: '1rem' }}
          message={`No puedes editar la ruta, ya que tienes
            ${vehiclesInRoute?.length} vehículo(s) vinculado(s) a ella.`}
          showIcon
          type="warning"
          action={
            <Space>
              <Button
                aria-label="desasociateButton"
                danger
                type="primary"
                onClick={onDisassociateVehicles}
              >
                Desasociar todos
              </Button>
            </Space>
          }
        />
      )}

      <FormElement settings={settings} />

      <Layout.Content style={{ marginBottom: 20 }}>
        <Divider orientation="right">
          <Button
            aria-label="newRoute-modalButton"
            onClick={openGeoModal}
            type="primary"
            loading={loading}
            disabled={vehiclesInRoute?.length > 0}
            style={{ marginBottom: 10 }}
          >
            Agregar parada
          </Button>
        </Divider>
      </Layout.Content>

      <GeofencesTable
        dataSource={dataSource}
        handleOnDeleteRow={handleOnDeleteRow}
        handleEdit={handleOnEdit}
        setDataSource={setDataSource}
        loading={false}
        disabled={false}
      />
      <GeoFencesModal
        visible={isModalVisible[0]}
        onClose={closeGeoModal}
        geofencesData={geofencesData}
        itemsPerPage={20}
        maxItemsToSelect={25}
        onSave={handleFirstModalSave} // Llama directamente a la función modificada
      />
    </div>
  );
}

const component: any = ProtectedRoute(EditRoute);
component.Layout = true;
export default component;
