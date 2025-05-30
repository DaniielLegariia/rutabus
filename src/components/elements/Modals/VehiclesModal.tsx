import React, { useState, useEffect } from 'react';
import { Modal, List, Typography, Checkbox, Button, Pagination, Input, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

interface Vehicle {
  id: string;
  name: string;
  idUnidad: string;
  imei: string;
  idCliente: number;
  ShortName?: string; // Hacer opcional esta propiedad
}

interface VehiclesModalProps {
  visible: boolean;
  onClose: () => void;
  vehiclesData: Vehicle[];
  itemsPerPage?: number;
  maxItemsToSelect?: number;
  onSave: (selectedItems: Vehicle[]) => void;
}

const VehiclesModal: React.FC<VehiclesModalProps> = ({
  visible,
  onClose,
  vehiclesData,
  itemsPerPage = 20,
  maxItemsToSelect = 25,
  onSave,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<Vehicle[]>([]);
  const [filteredData, setFilteredData] = useState<Vehicle[]>(vehiclesData);

  useEffect(() => {
    setFilteredData(vehiclesData);
  }, [vehiclesData]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const filtered = vehiclesData.filter((item) =>
      item.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const handleSelect = (item: Vehicle) => {
    if (!selectedItems.find((v) => v.id === item.id)) {
      if (selectedItems.length === maxItemsToSelect) {
        return message.error(`No puedes agregar más de ${maxItemsToSelect} elementos.`);
      }
      setSelectedItems((prev) => [...prev, item]);
    } else {
      setSelectedItems((prev) => prev.filter((v) => v.id !== item.id));
    }
  };

  const handleSave = () => {
    onSave(selectedItems);
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
        aria-label="VehiclesModal-SaveButton"
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
          <Typography.Text>Vehículos seleccionados</Typography.Text>
          <Input
            placeholder="Buscar vehículo"
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
      <List
        bordered
        dataSource={paginatedData}
        renderItem={(item) => (
          <List.Item onClick={() => handleSelect(item)}>
            <Checkbox
              checked={!!selectedItems.find((v) => v.id === item.id)}
              disabled={selectedItems.length === maxItemsToSelect && !selectedItems.find((v) => v.id === item.id)}
            >
              <Typography.Text>{item.name}</Typography.Text>
            </Checkbox>
          </List.Item>
        )}
      />
    </Modal>
  );
};

export default VehiclesModal;