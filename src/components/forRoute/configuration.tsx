/* eslint-disable no-unused-vars */
import React from 'react';
import { Button, Space, Tooltip } from 'antd';
import {
    ArrowDownOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    MenuOutlined,
    QuestionCircleOutlined,
    DeleteOutlined,
    EditOutlined,
    CheckOutlined,
    CloseOutlined
} from '@ant-design/icons';

interface IRecord {
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

interface IColumns {
  title: string | React.ReactElement,
  dataIndex: string,
  width?: number | string,
  search?: boolean,
  editable?: boolean,
  fixed?: string,
  align?: string,
  render?: (arg0: any, arg1?: IRecord) => React.ReactElement,
}

/**
 * Función que regresa el array de las columnas para la tabla de geocercas
 * @name columns
 * @function
 *
 * @param {Function} onDeleteRow - Función para eliminar una row de la tabla
 * @param {Function} onEditRow - Función para activar la edición de la fila
 * @param {Function} isEditing - Función para saber si se esta editando la fila
 * @param {Function} onSave - Función para guardar los cambios de la row
 * @param {Function} onCancel - Función para cancelar los cambios de la row y quitar el modo edición
 * @param {Boolean} disabled - Bandera para saber si los botones estan deshabilitados.
 *
 * @return {Array} - Array de columnas para la tabla de
 * geocercas al editar o crear ruta
 */
const columns = (
  onDeleteRow: (arg0: number) => void,
  onEditRow: (arg0: IRecord) => void,
  isEditing: (arg0: IRecord) => boolean,
  onSave: (arg0: IRecord) => void,
  onCancel: () => void,
  disabled?: boolean
  
): Array<IColumns> => (
  [
    {
      title: 'Ordenar',
      dataIndex: 'sort',
      width: 90,
      render: () =>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <MenuOutlined style={{ cursor: disabled ? 'not-allowed' : 'grab', color: '#999' }} />
        </div>
    },
    {
      title: 'Punto de control',
      dataIndex: 'Name',
      search: false,
    },
    {
      title: (
        <div>
          Nombre corto
          <Tooltip title="Nombre con el que puedes identificar tus paradas" placement="top">
            <QuestionCircleOutlined style={{ cursor: 'pointer', marginLeft: '0.5rem' }} />
          </Tooltip>
        </div>
      ),
      dataIndex: 'ShortName',
      search: false,
      editable: false,
      render: (text: string) => (
        <div aria-label="geofencesTable-shortName">
          {text}
        </div>
      )
    },
    {
      title: (
        <div>
          Tiempo en sección
          <Tooltip title="Tiempo máximo permitido en sección" placement="top">
            <QuestionCircleOutlined style={{ cursor: 'pointer', marginLeft: '0.5rem' }} />
          </Tooltip>
        </div>
      ),
      dataIndex: 'SectionTime',
      search: false,
      editable: true,
      render: (text: number) => (
        (typeof text === 'number') ? (
          <div aria-label="geofencesTable-sectionTime">
            <ClockCircleOutlined style={{ marginRight: '0.5rem' }} />
            {text} minutos
          </div>
        ) : (
          <Tooltip title="Parada final">
            <CheckCircleOutlined style={{ color: 'green', cursor: 'pointer' }} />
          </Tooltip>
        )
      ),
    },
    {
      title: (
        <div>
          Traslado
          <Tooltip title="Tiempo máximo permitido en el traslado a la siguiente parada" placement="top">
            <QuestionCircleOutlined style={{ cursor: 'pointer', marginLeft: '0.5rem' }} />
          </Tooltip>
        </div>
      ),
      dataIndex: 'TransitSectionTime',
      search: false,
      editable: true,
      render: (text: number, record?: IRecord) => {
        const isLastRecord = record?.isFinal; // Verifica si es el último registro
        return isLastRecord ? (
          <Tooltip title="No editable para la última parada">
            <CheckCircleOutlined
              style={{ color: 'green', cursor: 'not-allowed' }}
              aria-label="geofencesTable-CheckCircleOutlined"
            />
          </Tooltip>
        ) : (
          <div aria-label="geofencesTable-transitSectionTime">
            <ArrowDownOutlined style={{ marginRight: '0.5rem' }} />
            {text}
            <div style={{ fontSize: 12 }}>
              {record?.TransitTo}
            </div>
          </div>
        );
      }
    },
    {
      title: 'Acciones',
      fixed: 'right',
      dataIndex: 'operation',
      align: 'center',
      width: 160,
      render: (_: any, record: any) => {
        const editable = isEditing(record);

        return (editable ? (
          <Space>
            <Tooltip title="Guardar">
              <Button
                aria-label="geofencesTable-saveButton"
                shape="round"
                type="primary"
                onClick={() => onSave(record)}
                icon={<CheckOutlined />}
              />
            </Tooltip>
            <Tooltip title="Cancelar">
              <Button
                aria-label="geofencesTable-cancelButton"
                shape="round"
                type="primary"
                danger
                onClick={onCancel}
                icon={<CloseOutlined />}
              />
            </Tooltip>
          </Space>
        ) : (
          <Space>
            <Tooltip title="Editar">
              <Button
                aria-label="geofencesTable-editButton"
                shape="round"
                type="default"
                disabled={disabled}
                onClick={() => onEditRow(record)}
                icon={<EditOutlined />}
              />
            </Tooltip>
            <Tooltip title="Eliminar">
              <Button
                aria-label="geofencesTable-deleteButton"
                shape="round"
                type="primary"
                danger
                disabled={disabled}
                onClick={() => onDeleteRow(record.index)} // Pasa el índice
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Space>
        ));
      },
    }
  ]
);

export default columns;
