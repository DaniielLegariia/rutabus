import React, { useMemo, useState } from 'react';
import { Form, Table, Button, Space, Tooltip } from 'antd';
import { CheckOutlined, CloseOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { arrayMoveImmutable } from '@/utils/arrayMove';
import type { DropResult } from 'react-beautiful-dnd';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import columns from '@/components/forRoute/configuration';

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
  handleOnDeleteRow: (idgeo: number) => void;
  handleEdit: (record: IRecord) => void;
  setDataSource: (data: IRecord[]) => void;
  loading: boolean;
  disabled: boolean;
}

const EditableRow: React.FC<any> = ({ index, ...props }) => {
  return <tr {...props} />;
};

const EditableCell: React.FC<any> = ({
  editing,
  dataIndex,
  title,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = <input />;

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
              message: `Por favor ingresa ${title}`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

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
      const row = (await form.validateFields()) as any;
      handleEdit({ ...record, ...row });
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
        (el: any) => !!el,
      );

      const updatedData = newData.map((geofence, index) => ({
        ...geofence,
        index,
        isFinal: index === newData.length - 1,
        SectionTime: index === newData.length - 1 ? null : geofence.SectionTime || 0,
        TransitSectionTime: index === newData.length - 1 ? null : geofence.TransitSectionTime || 0,
        TransitTo: index !== newData.length - 1 ? `Traslado a ${newData[index + 1].Name}` : '',
      }));

      setDataSource(updatedData);
    }
  };

  const _columns = useMemo(() => {
    const generatedColumns = columns(
      (id_geocerca: number, idcliente: number) => handleOnDeleteRow(id_geocerca),
      onEditRow,
      isEditing,
      onSave,
      onCancel,
      disabled
    );

    return generatedColumns?.map((col: any) => {
      if (col.dataIndex === 'operation') {
        return {
          ...col,
          render: (_: any, record: IRecord) => {
            const editable = isEditing(record);

            return (
              <Space>
                {editable ? (
                  <>
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
                  </>
                ) : (
                  <>
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
                        onClick={() => handleOnDeleteRow(record.idgeo)}
                        icon={<DeleteOutlined />}
                      />
                    </Tooltip>
                  </>
                )}
              </Space>
            );
          },
        };
      }
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: (record: IRecord) => ({
          record,
          dataIndex: col.dataIndex,
          title: col.title,
          editing: isEditing(record),
        }),
      };
    });
  }, [columns, editingKey, disabled]);

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  return (
    <DragDropContext onDragEnd={onSortEnd}>
      <Form form={form} component={false}>
        <Table
          components={components}
          rowClassName={() => 'editable-row'}
          bordered
          dataSource={dataSource}
          columns={_columns}
          rowKey="idgeo"
          loading={loading}
          pagination={false}
        />
      </Form>
    </DragDropContext>
  );
}

export default EditableGeofencesTable;