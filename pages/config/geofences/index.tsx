import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/hocs/ProtectedRoute';
import ListElements from '@/views/page/ListElements';
import { message, Tooltip, Modal, Select, Space, Popconfirm, Button, Input } from 'antd';
import { DeleteOutlined, EditOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import useLoading from '@/providers/LoadingProvider';
import VehiclesModal from '@/components/elements/Modals/VehiclesModal';
import {getListGeofences,getGeofences,insertGeofence,updateGeofence, deleteGeofence } from '@/pages/api/Apis';
import GeoFencesModal from '@/components/elements/Modals/GeofencesModal';

interface Vehicle {
  id: string;
  name: string;
  idUnidad: string;
  imei: string;
  idCliente: string;
  ShortName?: string; // Hacer opcional esta propiedad
}

interface editGeofenceData extends Vehicle {
  ShortName: string;
}

interface registeredVechiclesArray {
  name: string
}

interface registeredVehiclesProps {
  message: string,
  createdVehicles: registeredVechiclesArray[]
}

interface Views {
  name: string,
  viewId: number
}

interface recordProps {
  imei: string,
}

interface User {
  tcvUserId: string;
  idcliente: string;
}

function VehicleComponent({ user }: { user: User }): React.ReactElement {
  const [vehicleId, setVehicleId] = useState('');
  const [showLoading, hideLoading] = useLoading();
  const [vehiclesData, setVehiclesData] = useState<Vehicle[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const { tcvUserId, idcliente } = user;
  const [savedVehiclesData, setSavedVehiclesData] = useState<Vehicle[]>([]); // Nuevo estado para los vehículos guardados
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editGeofenceData, setGeofenceData] = useState<editGeofenceData | null>(null);
  const [geofencesData, setGeofencesData] = useState<any[]>([]);
  const [geoAPIfencesData, setGeoAPIfencesData] = useState<any[]>([]);
  const isModalVisible = useState(false);
  const [, setModal] = isModalVisible;
  useEffect(() => {
    console.log('VehiclesData para el Modal:', vehiclesData); // Confirma que los datos se actualizan.
  }, [vehiclesData]);


  const onDeleteGeofence = async (record: any) => {
    console.log('ID de la geocerca a eliminar:', record.id); // Log para depurar  
   // showLoading('Eliminando geocerca...');
    try {
      const response = await deleteGeofence(record.id, idcliente); // Usar `id` de la geocerca y `idcliente`
  
      if (response) {
        message.success('Geocerca eliminada exitosamente.');
        fetchGeofences(); // Refrescar la tabla después de la eliminación
      } else {
        message.error('Error al eliminar la geocerca.');
      }
    } catch (error) {
      console.error('Error al eliminar la geocerca:', error);
      message.error('Error al eliminar la geocerca.');
    } finally {
      hideLoading();
    }
  };

  const fetchGeofences = async () => {
    showLoading('Cargando geocercas...');
    try {
      const response = await getListGeofences(idcliente);
      console.log('Respuesta completa de la API:', response);
  
      // Verificar si la respuesta contiene el cuerpo esperado
      if (response?.body?.GEOCERCAS) {
        const geofences = response.body.GEOCERCAS;
  
        // Transformar los datos si es necesario
        const transformedGeofences = geofences.map((geofence: any) => ({
          id: geofence.id_geocerca, // Usar `id_geocerca` como ID único
          name: geofence.name_plataforma,
          coordinates: geofence.coordinates,
          type: geofence.tipogeo,
          sectionTime: geofence.sectionTime,
          transitSectionTime: geofence.transitSectionTime,
          shortName: geofence.shortName || '', // Asegúrate de que tenga un valor por defecto
        }));
  
        setGeofencesData(transformedGeofences);
        console.log('Geocercas transformadas:', transformedGeofences);
      } else {
        throw new Error('La respuesta de la API no contiene el formato esperado.');
      }
    } catch (error) {
      console.error('Error al obtener las geocercas:', error);
      message.error('Error al cargar las geocercas.');
    } finally {
      hideLoading();
    }
  };

  useEffect(() => {
    fetchGeofences();
  }, []);

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const closeGeoModal = () => {
    setModal(false);
  };

  const openGeoModal = async () => {
      setModal(true);
      showLoading();
      try {
        const geofences = await getGeofences(idcliente, tcvUserId);
        console.log('Geocercas obtenidas:', geofences);
        setGeoAPIfencesData(geofences);
      } catch (error) {
        message.error('Error al obtener las geocercas');
      } finally {
        hideLoading();
      }
  };

  const handleSaveGeofence = async (selectedItems: any[]) => {
    console.log('Geocercas seleccionadas recibidas:', selectedItems); // Verificar que los datos lleguen aquí
  
    const formattedItems = selectedItems.map((item) => ({
      idgeo: item.id_geocerca,
      name: item.name,
      shortName: item.shortName,
      sectionTime: item.sectionTime,
      transitSectionTime: item.transitSectionTime,
      coordinates: item.coordinates,
      tipogeo: item.tipogeo,
    }));
  
    console.log('Formatted Items:', formattedItems);
  
    try {
      for (const geofence of formattedItems) {
        const response = await insertGeofence(
          geofence.idgeo,
          geofence.name,
          geofence.shortName,
          idcliente, // Asegúrate de pasar el ID del cliente
          geofence.sectionTime,
          geofence.transitSectionTime,
          geofence.coordinates,
          geofence.tipogeo
        );
  
        if (response?.ok) {
          console.log(`Geocerca ${geofence.name} insertada correctamente.`);
        } else {
          console.error(`Error al insertar la geocerca ${geofence.name}.`);
        }
      }
  
      message.success('Geocercas guardadas exitosamente.');
      fetchGeofences(); // Refrescar la tabla después de guardar
      setModal(false); // Cerrar el modal
    } catch (error) {
      console.error('Error al guardar las geocercas:', error);
      message.error('Error al guardar las geocercas.');
    }
  };

  const handleEditClick = (record: any) => {
    setGeofenceData({
      idgeo: record.id, // ID de la geocerca
      name: record.name, // Nombre de la geocerca
      shortName: record.shortName || '', // Nombre corto (editable)
      sectionTime: record.sectionTime, // Tiempo en sección
      transitSectionTime: record.transitSectionTime, // Tiempo de traslado
      idCliente: idcliente, // ID del cliente
    });
    setEditModalVisible(true); // Mostrar el modal de edición
  };

  const handleEditModalClose = () => {
    setEditModalVisible(false);
    setGeofenceData(null);
  };

  const handleEditSave = async () => {
    if (editGeofenceData) {
      const { idgeo, name, shortName, sectionTime, transitSectionTime, idCliente } = editGeofenceData;
  
      console.log('Valor de shortName antes de guardar:', shortName); // Log para depurar
  
      if (shortName.trim() === '') {
        message.warning('El nombre corto no puede estar vacío.');
        return;
      }
  
     // showLoading('Guardando cambios...');
      try {
        const response = await updateGeofence(
          idgeo,
          name,
          shortName.trim(),
          sectionTime,
          transitSectionTime,
          idCliente
        );
  
        if (response?.ok) {
          message.success('Geocerca actualizada exitosamente.');
          fetchGeofences(); // Refrescar la tabla con los datos actualizados
          setEditModalVisible(false); // Cerrar el modal
        } else {
          message.error('Error al actualizar la geocerca.');
        }
      } catch (error) {
        console.error('Error al actualizar la geocerca:', error);
        message.error('Error al actualizar la geocerca.');
      } finally {
        hideLoading();
      }
    }
  };

  const settings = {
    title: 'Geocercas',
    extras: [
      {
        link: '',
        text: 'Agregar',
        button: {
          onClick: () => openGeoModal(), // Abre el modal para agregar geocercas
          type: 'primary',
          shape: 'round',
        },
        key: 'add',
      },
    ],
    source: {
      url: 'geofence',
      key: 'geofence',
      id: 'name',
      extraParams: {
        limit: 20,
      },
      options: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
    table: {
      pagination: false,
      bordered: true,
      showSorterTooltip: false,
      dataSource: geofencesData, // Usar los datos de geocercas
      columns: [
        {
          title: 'Nombre',
          dataIndex: 'name',
          search: false,
        },
       {
          title: 'Nombre corto',
          dataIndex: 'shortName',
          search: false,
          editable: true,
          render: (text: string, record: any) => (
            <div
              aria-label="geofences-shortName"
              style={{ cursor: 'pointer' }}
              onClick={() => handleEditClick(record)}
            >
              <Tooltip title="Nombre editable" placement="right">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {text}
                  </div>
                  <EditOutlined style={{ marginLeft: '0.5rem', color: '#045678' }} />
                </div>
              </Tooltip>
            </div>
          ),
        },
        {
          title: 'Tipo',
          dataIndex: 'type',
          search: false,
        },
        {
          title: 'Acciones',
          fixed: 'right',
          dataIndex: 'operation',
          align: 'center',
          width: 150,
          render: (_: any, record: any) => (
            <Space>
              <Tooltip title="Eliminar">
                <Popconfirm
                  aria-label="geofence-deletePopconfirm"
                  title="¿Estás seguro de eliminar esta geocerca?"
                  placement="leftBottom"
                  arrowPointAtCenter
                  onCancel={() => setVehicleId('')}
                  onConfirm={() => onDeleteGeofence(record)}
                >
                  <Button
                    aria-label="geofence-deleteButton"
                    shape="round"
                    type="primary"
                    danger
                    onClick={() => setVehicleId('')}
                    icon={<DeleteOutlined />}
                  />
                </Popconfirm>
              </Tooltip>
            </Space>
          ),
        },
      ],
    },
  };

  return (
    <div aria-label="vehicles-container">
     <GeoFencesModal
        visible={isModalVisible[0]}
        onClose={closeGeoModal}
        geofencesData={geoAPIfencesData}
        itemsPerPage={20}
        maxItemsToSelect={25}
        onSave={handleSaveGeofence}
      />
      <Modal
        title="Editar Nombre Corto"
        visible={editModalVisible}
        onCancel={handleEditModalClose}
        onOk={handleEditSave}
      >
        <Input
          value={editGeofenceData?.shortName} // Cambiar a `shortName`
          onChange={(e) => {
            console.log('Nuevo valor de shortName:', e.target.value); // Log para depurar
            setGeofenceData({
              ...editGeofenceData,
              shortName: e.target.value,
            } as editGeofenceData);
          }}
        />
      </Modal>
      <ListElements settings={settings} /> {/* Pasar los datos obtenidos a la tabla */}
    </div>
  );
}

const component: any = ProtectedRoute(VehicleComponent);
component.Layout = true;
export default component;