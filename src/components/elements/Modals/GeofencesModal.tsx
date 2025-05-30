import React, { useState, useEffect } from 'react';
import { Modal, List, Typography, Checkbox, Button, Pagination, Input, message, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

interface Geofence {
  ID_GEOCERCA: number;
  GEOCERCA: string;
  COORDENADAS: string; // Nuevo campo para las coordenadas
  ID_TIPO_GEOCERCA: string;
  shortName: string; // Campo opcional para el nombre corto
}

interface GeoFencesModalProps {
  visible: boolean;
  onClose: () => void;
  geofencesData: Geofence[];
  itemsPerPage?: number;
  maxItemsToSelect?: number;
  onSave: (selectedItems: Geofence[]) => void;
}

const GeoFencesModal: React.FC<GeoFencesModalProps> = ({
  visible,
  onClose,
  geofencesData,
  itemsPerPage = 20,
  maxItemsToSelect = 25,
  onSave,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<Geofence[]>([]);
  const [filteredData, setFilteredData] = useState<Geofence[]>(geofencesData);
  const [isLoading, setIsLoading] = useState(false); // Nuevo estado para controlar la carga

  useEffect(() => {
    setIsLoading(true); // Inicia la carga
    setTimeout(() => {
      setFilteredData(geofencesData);
      setIsLoading(false); // Finaliza la carga
    }, 500); // Simula un retraso de carga (puedes eliminar esto si no es necesario)
  }, [geofencesData]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const filtered = geofencesData.filter((item) =>
      item.GEOCERCA.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const handleSelect = (item: Geofence) => {
    if (!selectedItems.find((v) => v.ID_GEOCERCA === item.ID_GEOCERCA)) {
      if (selectedItems.length === maxItemsToSelect) {
        return message.error(`No puedes agregar más de ${maxItemsToSelect} elementos.`);
      }
      setSelectedItems((prev) => [...prev, item]);
    } else {
      setSelectedItems((prev) => prev.filter((v) => v.ID_GEOCERCA !== item.ID_GEOCERCA));
    }
  };

  const handleSave = () => {
    const formattedItems = selectedItems.map((item) => ({
      id_geocerca: item.ID_GEOCERCA, // Cambia `id` a `id_geocerca`
      name: item.GEOCERCA,
      shortName: item.shortName, // Valor inicial para el nombre corto
      sectionTime: 0, // Valor inicial para el tiempo en sección
      transitSectionTime: 0, // Valor inicial para el tiempo de traslado
      coordinates: item.COORDENADAS, // Almacenar las coordenadas
      tipogeo: item.ID_TIPO_GEOCERCA, // Almacenar el tipo de geocerca
    }));
    onSave(formattedItems); // Pasamos los datos al componente padre
    setSelectedItems([]);
    setCurrentPage(1);
    onClose();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const customFooter = (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <Pagination
        onChange={handlePageChange}
        pageSize={itemsPerPage}
        total={filteredData.length}
        current={currentPage}
        showSizeChanger={false}
        simple
        size="small"
      />
      <Button
        aria-label="GeoFencesModal-SaveButton"
        type="primary"
        onClick={handleSave}
        disabled={!selectedItems.length}
      >
        Guardar
      </Button>
    </div>
  );

  return (
    <Modal
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '30px' }}>
          <Typography.Text>Geocercas seleccionadas</Typography.Text>
          <Input
            placeholder="Buscar geocerca"
            prefix={<SearchOutlined />}
            onChange={handleSearch}
            style={{ width: 200 }}
          />
        </div>
      }
      visible={visible}
      onCancel={onClose}
      footer={customFooter}
      centered
      bodyStyle={{ height: '70vh', overflow: 'auto', margin: '0.5rem 0' }}
    >
      <Spin spinning={isLoading} tip="Cargando geocercas...">
        <List
          bordered
          dataSource={paginatedData}
          renderItem={(item) => (
            <List.Item onClick={() => handleSelect(item)}>
              <Checkbox
                checked={!!selectedItems.find((v) => v.ID_GEOCERCA === item.ID_GEOCERCA)}
                disabled={selectedItems.length === maxItemsToSelect && !selectedItems.find((v) => v.ID_GEOCERCA === item.ID_GEOCERCA)}
              >
                <Typography.Text>{item.GEOCERCA}</Typography.Text>
              </Checkbox>
            </List.Item>
          )}
        />
      </Spin>
    </Modal>
  );
};

export default GeoFencesModal;