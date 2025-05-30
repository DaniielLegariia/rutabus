import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import ProtectedRoute from '@/hocs/ProtectedRoute';
import useLoading from '@/providers/LoadingProvider';
import { useApi } from '@/hooks/Api';
import { routeFields, routeMessages, routeSchema } from '@/fields/route/fields';
import {
  Layout,
  Button,
  message,
  Divider,
} from 'antd';
import GeofencesTable from '@/components/forRoute/GeofencesTable';
import FormElement from '@/views/page/FormElement';
import { useNavigation } from '@/views/layout/Layout';
import GeoFencesModal from '@/components/elements/Modals/GeofencesModal';
import EditGeofencesModal from '@/components/elements/Modals/EditGeofencesModal';
import { getGeofences, getListGeofences, insertRoute} from '@/pages/api/Apis';

interface rowTable {
  Name: string,
  SectionTime: number,
  ShortName: string,
  Type: string,
  isFinal: boolean,
  key: React.Key,
  TransitSectionTime: number,
  TransitTo: string,
  index: number,
  idcliente: string, // Added idcliente property,
  coodinates: string, // Added coordinates property
  tipogeo:number
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
  name: string,
  ShortName: string,
  SectionTime: number,
  TransitSectionTime: number
}

/*interface Geofence {
  id: number,
  name: string,
  ShortName: string,
  SectionTime: number,
  TransitSectionTime: number
}/*

interface IGetSettings {
  routeName: string,
  handleOnSave: (arg0: routeValues) => void,
  dataSource: any[]
}

/**
 * Importación dinamica de nuestro modal
 * @name AsyncModal
 * @constant
 */
const AsyncModal = dynamic(() => import('@/components/elements/Modals/AsyncModal'));

/**
 * Función para obtener un objeto con las configuraciones necesarias para
 * crear una nueva ruta en el componente de formElement.
 * @name getSettings
 * @function
 *
 * @property {String} routeName - Nombre de la ruta
 * @property {Function} handleOnSave - Función para guardar los cambios
 * @property {Array} dataSource - Array con la información de la nueva ruta
 * @return {Object} - Objeto con las configuraciones necesarias para nuestro formElement
 */
const getSettings = ({ routeName, handleOnSave, dataSource }: IGetSettings):object => ({
  back: '/config/route/', // Ruta a cambiar cuando navega para atras
  title: `Nueva ruta: ${routeName}`, // Titulo del formulario
  edition: false,
  handleOnSave, // Función para obtener los valores
  // del formulario a la hora de guardar
  form: { // Configuraciones de la parte del formulario
      className: 'user-form',
      layout: 'vertical',
      name: 'newRoute',
      initialValues: {
        finalDestinationAuto: false,
        finalDestination: '',
        disassociateVehicle: false,
        disassociateVehicleTime: '',
        disassociateVehicleTrigger: '',
        toleranceOnTime: '',
        toleranceDelay: ''
      },
      requiredMark: true,
  },
  validationSchema: routeSchema,
  messages: routeMessages, // Mensajes que se usaran en el formulario
  source: { // configuración para las queries
      url: 'route',
      key: 'route',
  },
  fieldset: routeFields(dataSource[dataSource.length - 1]?.Name)
});

/**
 * Vista para crear una nueva ruta
 * @view
 *
 * @returns {Component} - Regresa vista para crear ruta
 */
function NewRoute({ user }: { user: User }): React.ReactElement {
  const { back } = useNavigation();
  const { post } = useApi();
  const [showLoading, hideLoading] = useLoading();
  const { tcvUserId, idcliente } = user;
  const isModalVisible = useState(false);
  const [, setModal] = isModalVisible;
  const [dataSource, setDataSource]: any[] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [geofencesData, setGeofencesData] = useState([]); // Nuevo estado para almacenar las geocercas
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [selectedGeofences, setSelectedGeofences] = useState([]);
  const [routeName, setRouteName] = useState('');
  const [refreshTable, setRefreshTable] = useState(false); // Nuevo estado para refrescar la tabla
  const [steps, setSteps] = useState([]);
  const [cachedGeofences, setCachedGeofences] = useState<any[]>([]); // Nuevo estado para almacenar las geocercas

  useEffect(() => {
    const selectedItemsAux = dataSource?.map((data:rowTable) => ({
      ...data,
      name: data.Name
    }));

    setSelectedItems(selectedItemsAux);

    if (dataSource.length > 1) {
      setRouteName(`${dataSource[0]?.Name} - ${dataSource[dataSource.length - 1]?.Name}`);
    } else {
      setRouteName(dataSource.length ? `${dataSource[0]?.Name}` : '');
    }
  }, [dataSource]);

  /**
   * Query POST donde guardamos la ruta en DB
   * @hook
   */
  const { mutate: create } = post('route', {
    onSuccess: () => {
      message.success('La ruta se ha creado de forma exitosa');
      hideLoading();
      back('/config/route/');
    },
    onError: () => {
      message.error('Error al crear ruta, verifíca la información e intenta de nuevo');
      hideLoading();
    },
  });

  /**
   * Función para abrir el modal de las geofances
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
      console.log('Respuesta de la API:', response); // Depuración
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
        console.log('Geocercas transformadas:', geofences); // Depuración
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

  /**
   * Función para cerrar el modal de las geofances
   * @name closeGeoModal
   * @function
   */
  const closeGeoModal = () => {
    setModal(false);
  };


  const handleFirstModalSave = (items) => {
    console.log('Geocercas seleccionadas:', items); // Depuración
  
    // Transformar los datos seleccionados
    const transformedItems = items.map((item, idx) => ({
      id_geocerca: item.id_geocerca || item.id, // Asegúrate de usar el ID correcto
      Name: item.name || item.Name, // Nombre de la geocerca
      ShortName: item.shortName || item.ShortName || '', // Nombre corto
      SectionTime: Number(item.sectionTime || item.SectionTime || 0), // Tiempo en sección
      TransitSectionTime: Number(item.transitSectionTime || item.TransitSectionTime || 0), // Tiempo de tránsito
      coordinates: item.coordinates || item.coodinates, // Coordenadas
      tipogeo: item.tipogeo, // Tipo de geocerca
      idcliente: idcliente, // ID del cliente
      Type: 'Step', // Tipo de paso
      key: item.id_geocerca || item.id, // Clave única
      isFinal: false, // Esto se actualizará después
      TransitTo: '', // Esto se actualizará después
      index: steps.length + idx, // Índice basado en la longitud actual de `steps`
    }));
  
    // Combinar los datos seleccionados con los existentes en `steps`
    const updatedSteps = [...steps];
  
    transformedItems.forEach((item) => {
      // Si el elemento ya existe en `steps`, actualízalo
      const existingStepIndex = updatedSteps.findIndex((step) => step.id_geocerca === item.id_geocerca);
      if (existingStepIndex !== -1) {
        updatedSteps[existingStepIndex] = { ...updatedSteps[existingStepIndex], ...item };
      } else {
        // Si no existe, agrégalo
        updatedSteps.push(item);
      }
    });
  
    // Actualizar los índices y marcar el último elemento como final
    updatedSteps.forEach((step, index) => {
      step.isFinal = index === updatedSteps.length - 1;
      step.TransitTo = index !== updatedSteps.length - 1
        ? `Traslado a ${updatedSteps[index + 1]?.Name}`
        : '';
      step.index = index; // Actualizar el índice
    });
  
    console.log('Datos actualizados para la tabla:', updatedSteps); // Depuración
  
    // Actualizar `steps` y `dataSource`
    setSteps(updatedSteps);
    setDataSource(updatedSteps);
  
    // Mostrar mensaje de éxito
    message.success('Geocercas agregadas y actualizadas correctamente.');
  };
  /**
   * Función para agregar nuevas geocercar junto su traslado.
   * @name handleAdd
   * @function
   *
   * @param {Array} elements - Nuevos elementos a agregar.
   */


  /**
   * Función para guardar los cambios de la la celda editable de una row
   * @name handleOnEdit
   * @function
   *
   * @param {Object} row - Objeto con las propiedades de la row.
   */
  const handleOnEdit = (row: rowTable) => {
    console.log('Datos al editar registro:', row); // Depuración
  
    // Validar que el campo ShortName no esté vacío
    if (row.ShortName.trim() === '') {
      message.warning('El nombre corto no puede estar vacío.');
      return;
    }
  
    // Permitir editar el campo ShortName incluso si es la última parada
    /*if (row.isFinal && (row.SectionTime !== undefined || row.TransitSectionTime !== undefined)) {
      message.warning('No puedes editar el traslado o tiempo de la última parada.');
      return;
    }*/
  
    // Actualiza el objeto steps
    const updatedSteps = steps.map((step) =>
      step.id_geocerca === row.id_geocerca
        ? { ...step, ...row }
        : step
    );
  
    // Marca el último elemento como final y actualiza TransitTo
    updatedSteps.forEach((step, index) => {
      step.isFinal = index === updatedSteps.length - 1;
      step.TransitTo = index !== updatedSteps.length - 1
        ? `Traslado a ${updatedSteps[index + 1]?.Name}`
        : '';
    });
  
    console.log('Datos al editar registro en steps:', updatedSteps); // Depuración
  
    // Actualiza el estado de steps y dataSource
    setSteps(updatedSteps);
    setDataSource(updatedSteps);
  
    message.success('Geocerca actualizada exitosamente.');
  };

  /**
   * Función para eliminar un row de la tabla
   * @name handleOnDeleteRow
   * @function
   *
   * @param {String} name - Nombre de la geocerca (row) a eliminar
   */
  const handleOnDeleteRow = (indexToDelete: number) => {
    console.log('Índice a eliminar:', indexToDelete);
  
    // Actualizar el estado de steps y dataSource
    setSteps((prevSteps) => {
      const updatedSteps = prevSteps.filter((_, index) => index !== indexToDelete);
  
      // Reorganizar los datos restantes
      updatedSteps.forEach((step, index) => {
        step.isFinal = index === updatedSteps.length - 1;
        step.index = index;
        step.TransitTo = index !== updatedSteps.length - 1
          ? `Traslado a ${updatedSteps[index + 1]?.Name}`
          : '';
      });
  
      console.log('Pasos actualizados:', updatedSteps);
      return updatedSteps;
    });
  
    setDataSource((prevData) => {
      const updatedData = prevData.filter((_, index) => index !== indexToDelete);
  
      // Reorganizar los datos restantes
      updatedData.forEach((geofence, index) => {
        geofence.isFinal = index === updatedData.length - 1;
        geofence.index = index;
        geofence.SectionTime = index === updatedData.length - 1 ? null : geofence.SectionTime || 0;
        geofence.TransitSectionTime = index === updatedData.length - 1 ? null : geofence.TransitSectionTime || 0;
        geofence.TransitTo = index !== updatedData.length - 1
          ? `Traslado a ${updatedData[index + 1]?.Name}`
          : '';
      });
  
      console.log('Datos actualizados para la tabla:', updatedData);
      return updatedData;
    });
  
    message.success('Geocerca eliminada exitosamente');
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
  const getMinutesToDestination = (index: number): number => {
    let minutes = 0;

    for (let i = index; i < dataSource.length; i += 1) {
      minutes += (dataSource[i].SectionTime + dataSource[i].TransitSectionTime);
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
  const setHourInUTC = (hour: string): string => {
    const [hours, min] = hour.split(':');
    const targetTime = new Date().setHours(Number(hours), Number(min));

    const h = new Date(targetTime).getUTCHours();

    return `${h}:${min}`;
  };

  /**f
   * Función para guardar la ruta en la DB
   * @name handleOnSave
   * @function
   *
   * @param {Object} values - Valores del formulario de ruta
   */
  const handleOnSave = async (values: routeValues, { setSubmitting }: any, goBack: () => void) => {
    if (dataSource.length < 2) {
      setSubmitting(false); // Restablece isSubmitting
      return message.error('Debes tener como mínimo 2 paradas');
    }
  
    let error: boolean = false;
    console.log('Validando datos del formulario y la tabla...');
    // Transformar los datos de la tabla en el formato esperado
    const steps = dataSource.map((step: rowTable, index: number) => {
      if (!step.isFinal && (step.SectionTime === 0 || step.TransitSectionTime === 0)) {
        error = true;
      }
      const MinutesToDestination = getMinutesToDestination(index);
  
      return {
        Type: step.Type,
        Name: step.Name,
        ShortName: step.ShortName,
        Coordinates: step.coordinates,
        TipoGeo: step.tipogeo,
        idgeo: step.key,
        IsFinal: step.isFinal,
        Config: {
          MinutesToDestination,
          tolerance: {
            SectionTime: step.SectionTime || 0,
          },
        },
        Transit: step.isFinal
          ? {}
          : {
              MinutesToDestination: MinutesToDestination - step.SectionTime,
              Name: step.TransitTo,
              ShortName:
                index !== dataSource.length - 1
                  ? `Traslado a ${dataSource[index + 1].ShortName}`
                  : '',
              tolerance: {
                SectionTime: step.TransitSectionTime,
              },
            },
      };
    });
    console.log('Datos transformados (steps):', steps);

    if (error) {
      setSubmitting(false); // Restablece isSubmitting
      return message.error('Los tiempos de sección o traslado no pueden ser 0');
    }
    console.log('hora seteada: ',values.finalDestination)

    // Combinar los datos del formulario y la tabla en un único objeto
    const routeToSave = {
      Name: routeName,
      Description: values.description,
      tolerance: {
        OnTime: values.toleranceOnTime,
        Delayed: values.toleranceDelay,
        Late: values.toleranceDelay,
      },
      dissociate: {
        config: values.disassociateVehicle ? 'auto' : 'manual',
        trigger: values.disassociateVehicle ? values.disassociateVehicleTrigger : '',
        referenceTime: values.disassociateVehicle ? values.disassociateVehicleTime : 0,
        referenceDateTime: '',
      },
      FinalDestination: {
        time: values.finalDestinationAuto ? '' : setHourInUTC(values.finalDestination),
      },
      steps, // Datos transformados de la tabla
      idcliente,
    };
  
    console.log('Objeto final a guardar:', routeToSave); // Depuración
    console.log('Enviando datos a la API:', routeToSave);
    showLoading(); // Mueve esta línea aquí, después de las validaciones
    try {
      const response = await insertRoute([routeToSave]);
      console.log('response: ', response);
      const responseData = await response.json(); // Analiza el cuerpo de la respuesta

      if (response.ok && responseData.statusCode === 200) {
        message.success('Ruta creada correctamente');
        back('/config/route/');
      } else {
        const errorData = await response.json();
        console.error('Error al crear la ruta:', errorData);
        message.error(errorData.message || 'Error al crear la ruta');
      }
    } catch (err) {
      console.error('Error al guardar la ruta:', err);
      message.error('Error al guardar la ruta. Por favor, intenta de nuevo.');
    } finally {
      hideLoading(); // Asegúrate de que siempre se llame a hideLoading
      setSubmitting(false); // Restablece isSubmitting

    }
  };

  return (
    <div aria-label="newRoute-container">

      <FormElement settings={getSettings({ routeName, handleOnSave, dataSource })} />

      <Layout.Content style={{ marginBottom: 20 }}>
        <Divider orientation="right">
          <Button
            aria-label="newRoute-modalButton"
            onClick={openGeoModal}
            type="primary"
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

const component: any = ProtectedRoute(NewRoute);
component.Layout = true;
export default component;