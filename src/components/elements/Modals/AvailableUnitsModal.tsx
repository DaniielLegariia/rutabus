import React, { useEffect, useState } from 'react';
import { Modal, List, Typography, Skeleton, Button, Pagination, Input, Checkbox, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { getListAvailableUnits, setUnitToRoute } from '@/pages/api/Apis';

interface AvailableUnitsModalProps {
  isVisible: boolean;
  onClose: () => void;
  idcliente: string;
  onSave: (selectedUnits: any[]) => void;
  routeId: string;
  itemsPerPage?: number;
  maxItemsToSelect?: number;
}

const AvailableUnitsModal: React.FC<AvailableUnitsModalProps> = ({
  isVisible,
  onClose,
  idcliente,
  routeId,
  onSave,
  itemsPerPage = 10,
  maxItemsToSelect = 5,
}) => {
  const [units, setUnits] = useState<any[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<any[]>([]);
  const [selectedUnits, setSelectedUnits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchAvailableUnits = async () => {
    setIsLoading(true);
    try {
      const response = await getListAvailableUnits(idcliente);
      if (response?.body?.data) {
        setUnits(response.body.data);
        setFilteredUnits(response.body.data);
        //message.success('Unidades obtenidas correctamente');
      } else {
        setUnits([]);
        setFilteredUnits([]);
        message.warning('No se encontraron unidades disponibles');
      }
    } catch (error) {
      console.error('Error al obtener las unidades:', error);
      message.error('Error al obtener las unidades disponibles');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchAvailableUnits();
    }
  }, [isVisible]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const filtered = units.filter((unit) =>
      unit.short_name.toLowerCase().includes(value.toLowerCase()) ||
      unit.platform_name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredUnits(filtered);
  };

  const handleSelect = (unit: any) => {
    if (!selectedUnits.find((u) => u.imei === unit.imei)) {
      if (selectedUnits.length === maxItemsToSelect) {
        return message.error(`No puedes seleccionar más de ${maxItemsToSelect} unidades.`);
      }
      setSelectedUnits((prev) => [...prev, unit]);
    } else {
      setSelectedUnits((prev) => prev.filter((u) => u.imei !== unit.imei));
    }
  };

  const handleSave = async () => {
    try {
      const unitsToSend = selectedUnits.map((unit) => ({
        imei: unit.imei,
        short_name: unit.short_name,
        platform_name: unit.plataform_name,
      }));
  
      // Llamar a `setUnitToRoute` y procesar la respuesta
      const responseData = await setUnitToRoute(idcliente, routeId, unitsToSend);
  
      // Verificar el statusCode o el contenido del cuerpo
      if (responseData?.statusCode === 200) {
       
        console.log('Detalles de la respuesta:', responseData);
        message.success('Unidades Almacenadas correctamente')
        // Limpiar las unidades seleccionadas
        setSelectedUnits([]);
        setCurrentPage(1);
  
        // Recargar la lista de unidades disponibles
        await fetchAvailableUnits();
       // message.success('Unidades asignadas correctamente');
        // Cerrar el modal después de recargar la lista
       onClose();
        return; // Detener el flujo aquí
      } else {
        message.error(responseData?.body?.message || 'Error al asignar las unidades');
        return; // Detener el flujo aquí
      }
    } catch (error: any) {
      console.error('Error al asignar las unidades:', error);
      message.error(error.message || 'Error al asignar las unidades');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUnits = filteredUnits.slice(startIndex, endIndex);

  return (
    <Modal
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '30px' }}>
          <Typography.Text>Unidades disponibles</Typography.Text>
          <Input
            placeholder="Buscar unidad"
            prefix={<SearchOutlined />}
            onChange={handleSearch}
            style={{ width: 200 }}
          />
        </div>
      }
      open={isVisible}
      onCancel={onClose}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Pagination
            onChange={handlePageChange}
            pageSize={itemsPerPage}
            total={filteredUnits.length}
            current={currentPage}
            showSizeChanger={false}
            simple
            size="small"
          />
          <Button
            type="primary"
            onClick={handleSave}
            disabled={!selectedUnits.length}
          >
            Guardar
          </Button>
        </div>
      }
      centered
      bodyStyle={{ height: '70vh', overflow: 'auto' }}
    >
      {isLoading ? (
        <Skeleton active />
      ) : (
        <List
        bordered
        dataSource={paginatedUnits}
        renderItem={(unit) => (
          <List.Item onClick={() => handleSelect(unit)}>
            <Checkbox
              checked={!!selectedUnits.find((u) => u.imei === unit.imei)}
              disabled={
                selectedUnits.length === maxItemsToSelect &&
                !selectedUnits.find((u) => u.imei === unit.imei)
              }
            >
              <Typography.Text strong>
                {unit.plataform_name || 'Sin plataforma'} - {unit.short_name || 'Sin nombre corto'}
              </Typography.Text>
            </Checkbox>
          </List.Item>
        )}
      />
      )}
    </Modal>
  );
};

export default AvailableUnitsModal;