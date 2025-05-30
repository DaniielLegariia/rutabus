/* eslint-disable no-unused-vars */
import React, { useMemo, useState } from 'react';
import { Form, Table } from 'antd';
import { arrayMoveImmutable } from '@/utils/arrayMove';
import type { DropResult } from 'react-beautiful-dnd';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import columns from '@/components/forRoute/configuration';

import { EditableCell, EditableRow } from './editableCell';

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

interface geofencesTables {
  dataSource: any[],
  handleOnDeleteRow: (id_geocerca: number, idcliente: number) => void; // Cambiado para aceptar dos argumentos
  handleEdit: (arg0: IRecord) => void,
  setDataSource: (arg0: any) => void,
  loading: boolean,
  disabled: boolean
}

/**
 * Componente contenedor para la tabla y hacer sus filas draggables
 * @component
 *
 * @returns {Component} - Componente contenedor para hacer la tabla draggable
 */
function DroppableTable(props: React.HTMLAttributes<HTMLTableSectionElement>): React.ReactElement {
  return (
    <Droppable droppableId="table">
      {(provided) => (
        <tbody
          ref={provided.innerRef}
          {...provided.droppableProps}
          {...props}
        >
          {props.children}
          {provided.placeholder}
        </tbody>
        )}
    </Droppable>
  );
}

/**
 * Componente custom para la vista de geocercas
 * @component
 *
 * @property {Array} dataSource - Data de la tabla
 * @property {Array} columns - Columnas de la tabla
 * @property {Function} handleEdit - Función para la edición de alguna celda
 * @property {Function} setDataSource - Función para modificar la data de la tabla
 * @property {Boolean} loading - Variable para saber si esta cargando
 * @property {Boolean} disabled - Variable para deshabilitar los campos que se pueden editar
 *
 * @returns {Component} - Componente de tabla especial para las geocercas
 */
function GeofencesTable({
  dataSource,
  handleOnDeleteRow,
  handleEdit,
  setDataSource,
  loading,
  disabled = false
}: geofencesTables): React.ReactElement {
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState<React.Key>('');
  console.log('Datos pasados a GeofencesTable:', dataSource);  /**
   * Función para saber si se esta editando alguna row
   * @name isEditing
   * @function
   *
   * @param {Object} record - Objeto con la información de una row
   * @returns {Boolean} - Regresa una bandera para saber si se esta editando
   */
  const isEditing = (record: IRecord): boolean => record.key === editingKey;

  /**
   * Función para cancelar el estado de editable de una row
   * @name onCancel
   * @function
   */
  const onCancel = () => setEditingKey('');

  /**
   * Función para inicializar una row y que se pueda editar
   * @name onEditRow
   * @function
   *
   * @param {Object} record - Objeto con la información de una row
   */
  const onEditRow = (record: IRecord) => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.key);
  };

  /**
   * Función para guardar la fila editada
   * @name onSave
   * @function
   *
   * @param {Object} record - Objeto con la información de una row
   */
  const onSave = async (record: IRecord) => {
    try {
      const row = (await form.validateFields()) as any;
      handleEdit({ ...record, ...row });
      setEditingKey('');
    } catch (e) {
      // console.log('Validate Failed:', e);
    }
  };

  /**
   * Función para hacer los movimientos de la fila de la tabla
   * @name onSortEnd
   * @function
   *
   * @property {Object} source - Objeto con la posición original de la fila
   * @property {Object} destination - Objeto con la posición nueva de la fila
   */
  const onSortEnd = ({ source, destination }: DropResult) => {
    if (!source || !destination) return;

    const { index: oldIndex } = source;
    const { index: newIndex } = destination;

    if (oldIndex !== newIndex) {
      const newData = arrayMoveImmutable(dataSource.slice(), oldIndex, newIndex).filter(
        (el: any) => !!el,
      );

      // Se le da forma a las geocercas
      const dataModel:any[] = [];
      newData.forEach((geofence, index) => {
        dataModel.push({
          Type: 'Step',
          key: geofence.Name,
          Name: geofence.Name,
          ShortName: (geofence.ShortName) ? geofence.ShortName : geofence.Name,
          SectionTime: (index === newData.length - 1)
            ? null : geofence.SectionTime || 0,
          isFinal: (index === newData.length - 1),
          index,
          TransitSectionTime: (index === newData.length - 1)
            ? null : geofence.TransitSectionTime || 0,
          TransitTo: (index !== newData.length - 1) ? `Traslado a ${newData[index + 1].Name}` : ''
        });
      });

      setDataSource(dataModel);
    }
  };

  /**
   * @const {Object} components - Objeto de componentes para la creación
   * de la tabla.
   */
  const components = {
    body: {
      wrapper: DroppableTable,
      row: (props: any) => EditableRow({ ...props, dataSource, dragdisabled: disabled }),
      cell: EditableCell,
    },
  };

  /**
   * @const {Array} _columns - Array de columnas, en el cual metemos algunas propiedades
   * necesarias para poder editar las celdas
   */
  const _columns = useMemo(() =>
    columns(
      handleOnDeleteRow,
      onEditRow,
      isEditing,
      onSave,
      onCancel,
      disabled
    )?.map((col: any) => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: (record: IRecord) => ({
          record,
          type: col.dataIndex, // Asegúrate de que esto sea correcto
          dataIndex: col.dataIndex,
          title: col.title,
          editing: isEditing(record),
          isRequired: (record.isFinal && col.dataIndex === 'TransitSectionTime')
            || (record.isFinal && col.dataIndex === 'SectionTime'),
        }),
      };
    }),
    [columns, editingKey, disabled]
  );

  return (
    <DragDropContext onDragEnd={onSortEnd}>
      <Form form={form} component={false}>
        <Table
          aria-label="geofencesTable-Table"
          scroll={{ y: '50vh' }}
          style={{ marginBottom: '2rem' }}
          pagination={false}
          loading={loading}
          components={components}
          rowClassName={() => 'editable-row'}
          rowKey="index"
          bordered
          dataSource={dataSource}
          columns={_columns}
        />
      </Form>
    </DragDropContext>
  );
}

export default GeofencesTable;
