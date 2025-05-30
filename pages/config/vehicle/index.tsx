import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/hocs/ProtectedRoute';
import ListElements from '@/views/page/ListElements';
import { message, Tooltip, Modal, Select, Space, Popconfirm, Button, Input } from 'antd';
import { DeleteOutlined, EditOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import useLoading from '@/providers/LoadingProvider';
import VehiclesModal from '@/components/elements/Modals/VehiclesModal';
import { insertVehicles, deleteVehicles, updateVehicles, getVehicles as fetchVehicles, getSavedRutabusVehicles } from '@/pages/api/Apis';

interface Vehicle {
  id: string;
  name: string;
  idUnidad: string;
  imei: string;
  idCliente: number;
  ShortName?: string; // Hacer opcional esta propiedad
}

interface editVehicleData extends Vehicle {
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
  const modalState = useState(false);
  const [, setModalState] = modalState;
  const [vehicleId, setVehicleId] = useState('');
  const [vehicleServer, setVehicleServer] = useState('');
  const [showLoading, hideLoading] = useLoading();
  const [refetchData, setRefetchData] = useState(false);
  const [openModal, setOpenModal] = useState<string>('');
  const [vehiclesData, setVehiclesData] = useState<Vehicle[]>([]);
  const [vehiclesFromApi, setVehiclesFromApi] = useState<any[]>([]);
  const [vehiclesFetched, setVehiclesFetched] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVehicles, setSelectedVehicles] = useState<Vehicle[]>([]);
  const { tcvUserId, idcliente } = user;
  const [savedVehiclesData, setSavedVehiclesData] = useState<Vehicle[]>([]); // Nuevo estado para los vehículos guardados
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editVehicleData, setEditVehicleData] = useState<editVehicleData | null>(null);

  useEffect(() => {
    GetSavedVehicles();
  }, []);

  useEffect(() => {
    console.log('VehiclesData para el Modal:', vehiclesData); // Confirma que los datos se actualizan.
  }, [vehiclesData]);

  const onEditVehicle = async (data: editVehicleData, oldData: editVehicleData) => {
    if (data.ShortName.trim() === oldData.ShortName.trim()) return;
    if (data.ShortName.trim() === '') return;
  
    //showLoading('Guardando vehículo...');
    try {
      const update = await updateVehicles([{
        imei: data.imei,
        nombre_plataforma: data.name,
        nombre_corto: data.ShortName.trim(),
        idcliente: data.idCliente,
      }]);
      showLoading('Guardando vehículo...');
      console.log('Vehículo actualizado:', update);
  
      // Evaluar la respuesta
      if (update?.statusCode === 200) {
        message.success('Vehículo actualizado correctamente');
      } else {
        message.error(update?.body?.message || 'Error al actualizar el vehículo');
      }
    } catch (error: any) {
      console.error('Error al actualizar el vehículo:', error);
      message.error(error.message || 'Error al actualizar el vehículo');
    } finally {
      hideLoading();
      setEditModalVisible(false);
      GetSavedVehicles(); // Refrescar la lista de vehículos guardados
    }
  };

  const onDeleteVehicle = async (data: recordProps) => {
    //showLoading('Eliminando vehículo...');
    await deleteVehicles([data.imei]);
    hideLoading();
    GetSavedVehicles(); // Refrescar la lista de vehículos guardados
  };

  const GetSavedVehicles = async () => {
    const savedVehicles = await getSavedRutabusVehicles(idcliente);
    console.log('Vehículos guardados:', savedVehicles);

    // Verificar si `savedVehicles` y `savedVehicles.data` están definidos
    if (savedVehicles && savedVehicles.data) {
      const transformedVehicles = savedVehicles.data.map((item: any) => ({
        id: item.imei,
        key: item.imei, // Asegurarse de que cada elemento tenga una propiedad `key` única
        Name: item.plataform_name,
        ShortName: item.short_name,
        imei: item.imei,
        idCliente: item.idcliente,
      }));

      setSavedVehiclesData(transformedVehicles);
    } else {
      console.error('La estructura de la respuesta no es la esperada:', savedVehicles);
      setSavedVehiclesData([]); // Establecer un estado vacío en caso de error
    }
  };

  const handleAddClick = async () => {
    // Asegurarse de que `savedVehiclesData` esté actualizado
    await GetSavedVehicles();
    const updatedSavedVehiclesData = savedVehiclesData;
    console.log("VehiculosGuardadosxd; ", updatedSavedVehiclesData);

    await fetchVehicles(1, 500, tcvUserId, idcliente, setVehiclesFromApi, setVehiclesData, showLoading, hideLoading, (vehiclesFromApi: any[]) => {
      // Filtrar las unidades que ya están en `savedVehiclesData`
      const filteredVehicles = vehiclesFromApi.filter(vehicle => 
        !updatedSavedVehiclesData.some((savedVehicle: Vehicle) => savedVehicle.imei === vehicle.IMEI)
      );
      console.log("Filtered Vehicles: ", filteredVehicles);
      return filteredVehicles;
    });
    setModalVisible(true);
  };

 

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const handleSaveVehicles = async (selectedItems: Vehicle[]) => {
    setSelectedVehicles(selectedItems);

    const registros = selectedItems.map(item => ({
      imei: item.imei,
      nombre_plataforma: item.name,
      nombre_corto: "", // De momento se almacena vacío
      idcliente: item.idCliente
    }));
    console.log('Registros:', registros);
    await insertVehicles(registros);
    GetSavedVehicles(); // Refrescar la lista de vehículos guardados
  };

  const handleEditClick = (record: Vehicle) => {
    setEditVehicleData({
      id: record.id,
      name: record.name,
      idUnidad: record.idUnidad,
      imei: record.imei,
      idCliente: record.idCliente,
      ShortName: record.ShortName || '', // Asegurarse de que siempre tenga un valor por defecto
    });
    setEditModalVisible(true);
  };

  const handleEditModalClose = () => {
    setEditModalVisible(false);
    setEditVehicleData(null);
  };

  const handleEditSave = () => {
    if (editVehicleData) {
      const oldData = savedVehiclesData.find(vehicle => vehicle.imei === editVehicleData.imei);
      if (oldData) {
        onEditVehicle(editVehicleData as editVehicleData, oldData as editVehicleData);
      }
    }
  };

  const settings = {
    title: 'Vehículos',
    extras: [
      {
        link: '',
        text: 'Agregar',
        button: {
          onClick: handleAddClick,
          type: 'primary',
          shape: 'round',
        },
        key: 'add',
      },
    ],
    source: {
      url: 'vehicle',
      key: 'vehicle',
      id: 'Name',
      extraParams: {
        limit: 20,
        routeStatus: ''
      },
      options: {
        retry: false,
        refetchOnWindowFocus: false
      },
    },
    table: {
      pagination: false,
      bordered: true,
      showSorterTooltip: false,
      onSaveEditCell: onEditVehicle,
      refetchData,
      dataSource: savedVehiclesData, // Pasar los datos obtenidos a la tabla
      columns: [
        {
          title: 'Nombre en plataforma',
          dataIndex: 'Name',
          search: false,
        },
        {
          title: (
            <div>
              Nombre corto
              <Tooltip title="Nombre con el que puedes identificar tu vehículo" placement="top">
                <QuestionCircleOutlined style={{ cursor: 'pointer', marginLeft: '0.5rem' }} />
              </Tooltip>
            </div>
          ),
          dataIndex: 'ShortName',
          search: false,
          editable: true,
          render: (text: string, record: Vehicle) => (
            <div aria-label="vehicles-ShortName" style={{ cursor: 'pointer' }} onClick={() => handleEditClick(record)}>
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
          title: 'Acciones',
          fixed: 'right',
          dataIndex: 'operation',
          align: 'center',
          width: 150,
          render: (_: any, record: recordProps) => (
            <Space>
              <Tooltip title="Eliminar">
                <Popconfirm
                  aria-label="vehicle-deletePopconfirm"
                  title="¿Estas seguro de eliminar este vehículo?"
                  placement="leftBottom"
                  arrowPointAtCenter
                  onCancel={() => setVehicleId('')}
                  onConfirm={() => onDeleteVehicle(record)}
                >
                  <Button
                    aria-label="vehicle-deleteButton"
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
      <VehiclesModal
        visible={modalVisible}
        onClose={handleModalClose}
        vehiclesData={vehiclesData}
        onSave={handleSaveVehicles}
      />
      <Modal
        title="Editar Nombre Corto"
        visible={editModalVisible}
        onCancel={handleEditModalClose}
        onOk={handleEditSave}
      >
        <Input
          value={editVehicleData?.ShortName}
          onChange={(e) => setEditVehicleData({ ...editVehicleData, ShortName: e.target.value } as editVehicleData)}
        />
      </Modal>
      <ListElements settings={settings} /> {/* Pasar los datos obtenidos a la tabla */}
    </div>
  );
}

const component: any = ProtectedRoute(VehicleComponent);
component.Layout = true;
export default component;