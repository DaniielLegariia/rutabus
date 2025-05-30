import React, { useMemo, useState } from 'react';
import { Form, Table, Button, Space, Tooltip } from 'antd';
import { CheckOutlined, CloseOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { arrayMoveImmutable } from '@/utils/arrayMove';
import type { DropResult } from 'react-beautiful-dnd';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import columns from '@/components/forRoute/configuration';

import { EditableCell, EditableRow } from './editableCell';

interface IRecord {
  idgeo: number;
  Name: string;
  SectionTime: number;
  ShortName: string;
  Type: string;
  isFinal: boolean;
  key: React.Key;
  TransitSectionTime: number;
  TransitTo: string;
  index: number;
}

interface EditableGeofencesTableProps {
  dataSource: IRecord[];
  handleOnDeleteRow: (index: number) => void;
  handleEdit: (record: IRecord) => void;
  setDataSource: (data: IRecord[]) => void;
  loading: boolean;
  disabled: boolean;
}

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

function EditableGeofencesTable({
  dataSource,
  handleOnDeleteRow,
  handleEdit,
  setDataSource,
  loading,
  disabled = false,
}: EditableGeofencesTableProps): React.ReactElement {
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState<React.Key>('');

  const isEditing = (record: IRecord): boolean => record.key === editingKey;

  const onEditRow = (record: IRecord) => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.key);
  };

  const onSave = async (record: IRecord) => {
    try {
      const row = (await form.validateFields()) as Partial<IRecord>;
      const updatedRecord = { ...record, ...row };

      setDataSource((prevData) => {
        const updatedData = prevData.map((item) =>
          item.index === updatedRecord.index ? updatedRecord : item
        );
        console.log('Updated DataSource:', updatedData); // Verifica los datos actualizados
        return [...updatedData]; // Crea una nueva referencia para forzar el renderizado
      });

      setEditingKey('');
    } catch (e) {
      console.error('Validate Failed:', e);
    }
  };

  const onCancel = () => {
    setEditingKey('');
  };

  const onSortEnd = ({ source, destination }: DropResult) => {
    if (!source || !destination) return;
  
    const { index: oldIndex } = source;
    const { index: newIndex } = destination;
  
    if (oldIndex !== newIndex) {
      const newData = arrayMoveImmutable(dataSource.slice(), oldIndex, newIndex).filter(
        (el: any) => !!el
      );
  
      const updatedData = newData.map((geofence, index) => ({
        ...geofence,
        index,
        isFinal: index === newData.length - 1,
        SectionTime: geofence.isFinal ? geofence.SectionTime : geofence.SectionTime ?? 0, // No sobrescribas con null
        TransitSectionTime: geofence.isFinal ? null : geofence.TransitSectionTime ?? 0,
        TransitTo: index !== newData.length - 1 ? `Traslado a ${newData[index + 1]?.Name}` : '',
      }));
  
      setDataSource(updatedData);
    }
  };

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

  const components = {
    body: {
      wrapper: DroppableTable,
      row: (props: any) => EditableRow({ ...props, dataSource, dragdisabled: disabled }),
      cell: EditableCell,
    },
  };

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

export default EditableGeofencesTable;