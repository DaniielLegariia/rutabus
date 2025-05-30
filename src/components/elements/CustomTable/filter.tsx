import React, { useState } from 'react';
import { Button, DatePicker, Input, Select, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const opc = [
  {
    label: 'Sin filtro',
    value: ''
  },
  {
    label: 'Llegó a destino',
    value: 'arrivedtodestination'
  },
  {
    label: 'A tiempo',
    value: 'ontime'
  },
  {
    label: 'Retraso',
    value: 'delay'
  },
  {
    label: 'Tarde',
    value: 'late'
  },
  {
    label: 'En espera',
    value: 'onhold'
  },
];

/**
 * Componente para crear un filtro personalizado.
 * @component
 *
 * @property {Array} selectedKeys - Array de opciones seleccionadas, en este caso es solo para
 * una opción "No es un multiselect", quiere decir que solo filtramos por una cadena de texto.
 * @property {Function} confirm - Función para ejecutar el filtro.
 * @property {Function} setSelectedKeys - Función para editar el texto por el cual filtraremos.
 * @property {Function} clearFilters - Función para limpiar el texto del filtro.
 * @property {String} field - Texto para saber que es lo que estamos filtrando.
 * @property {Function} setFilteredByBack - Función para guardar y enviar lo que filtraremos en back
 * siendo especificos el status del vehículo.
 * @property {String} searchType - Texto para saber si será un filtrado por status.
 * @property {Function} setFilteredByDateTime - Función para guardar y enviar lo que filtraremos
 * en back siendo especificos la fecha y hora de la transición del vehículo.
 *
 * @returns {Component} - Componente custom de filtrado.
 */
function CustomFilter({
    selectedKeys,
    confirm,
    setSelectedKeys,
    clearFilters,
    field,
    setFilteredByBack,
    searchType = '',
    setFilteredByDateTime,
    setPageI
  }: any) {
  const [selectVal, setSelectVal] = useState('');

  function handleSearch() {
    switch (searchType) {
      case 'select':
          setFilteredByBack(selectVal);
        break;
      case 'dateTime': {
          if (selectVal) {
            const initDate = new Date(`${selectVal} 00:00:00`).toISOString();
            const endDate = new Date(`${selectVal} 23:59:59`).toISOString();
            const dateTime = `${initDate}|${endDate}`;

            setPageI(0);
            setFilteredByDateTime(dateTime);
          } else {
            setFilteredByDateTime(selectVal);
          }
        break;
      }
      default:
          if (!selectVal) {
            setSelectedKeys([]);
          } else {
            setSelectedKeys([selectVal]);
          }
        break;
    }
    confirm();
  }

  function handleReset() {
    clearFilters();
  }

  const filterType = () => {
    switch (searchType) {
      case 'select':
        return <Select
          style={{ marginBottom: 8, display: 'block', width: '8rem' }}
          options={opc}
          value={selectVal}
          onChange={setSelectVal}
        />;
      case 'dateTime':
        return <DatePicker
          style={{ marginBottom: 8, display: 'block' }}
          format="YYYY-MM-DD"
          showToday={false}
          onChange={(val) => val
            ? setSelectVal(val.format('YYYY-MM-DD'))
            : setSelectVal('')}
        />;
      default:
        return <Input
          placeholder={`Buscar ${field}`}
          autoFocus
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch()}
          style={{ marginBottom: 8, display: 'block' }}
        />;
    }
  };

  return (
    <div style={{ padding: 8 }}>
      {filterType()}
      <Space>
        <Button
          type="primary"
          onClick={() => handleSearch()}
          icon={<SearchOutlined />}
          size="small"
          style={{ width: 90 }}
        >
          Buscar
        </Button>
        {!searchType && (
          <Button onClick={() => handleReset()} size="small" style={{ width: 90 }}>
            Limpiar
          </Button>
        )}
      </Space>
    </div>
  );
}
export default CustomFilter;
