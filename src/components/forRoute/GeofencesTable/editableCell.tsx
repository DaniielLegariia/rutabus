import React from 'react';
import { Draggable } from 'react-beautiful-dnd';

import { Input, Form, InputNumber, Tooltip } from 'antd';
import { ArrowDownOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

interface IRecord {
  Name: string | React.ReactNode,
  SectionTime: number,
  ShortName: string,
  Type: string,
  isFinal: boolean,
  key: React.Key,
  TransitSectionTime: number,
  TransitTo: string,
  index: number
}

interface EditableCellProps {
  title: any,
  editable: boolean,
  disabled: boolean,
  children: React.ReactNode,
  dataIndex: string,
  record: IRecord,
  isRequired: boolean,
  editing: boolean
}

interface EditableRowProps {
  index: number,
  dataSource: any,
  dragdisabled: boolean
}

/**
 * Componente que nos permite tener una fila draggable.
 * @component
 *
 * @property {Array} dataSource - Array de data de la tabla
 * @property {Number} index - Index de la fila
 * @property {Boolean} dragdisabled - Deshabilita el drag de la tabla
 *
 * @return {Component} - Regresa un componente de fila draggable.
 */
export function EditableRow({
  dataSource,
  index,
  dragdisabled,
  ...props
}: EditableRowProps):React.ReactElement {
  const { className, style, ...restProps }:any = props;
  const draggIndex = dataSource?.findIndex((x: IRecord) => x.index === restProps['data-row-key']);

  return (
    <Draggable
      isDragDisabled={dragdisabled}
      key={`key-${draggIndex}`}
      draggableId={`row-${draggIndex}`}
      index={draggIndex}
    >
      {(provided) => (
        <tr
          ref={provided.innerRef}
          {...restProps}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        />
      )}
    </Draggable>
  );
}

/**
 * Componente que nos permite tener una fila editable.
 * @component
 *
 * @property {String} title - Titulo de la columna.
 * @property {Boolean} editing - Variable que nos indica si es se esta editando o no.
 * @property {String} dataIndex - Key del objeto de la data.
 * @property {Object} record - Objeto data.
 * @property {Component} children - Componente hijo.
 * @property {Boolean} isRequired - Bandera para saber si el campo es requerido
 *
 * @returns {Component} - Regresa un componente de celda editable.
 */
export function EditableCell({
    title,
    editing,
    dataIndex,
    record,
    children,
    isRequired,
    ...restProps
}: EditableCellProps): React.ReactElement {
  /**
   * Función para definir que tipo de input mostrar
   * @name selectInputType
   * @function
   *
   * @param {String} type - Tipo de columna
   *
   * @returns {Component} - Componente según el tipo de columna
   */
  const selectInputType = (type: string): React.ReactElement => {
    switch (type) {
      case 'SectionTime':
        return (
          <InputNumber
            aria-label="geofencesTable-editSectionTime"
            min={0}
            max={Number.MAX_SAFE_INTEGER}
            prefix={<ClockCircleOutlined style={{ color: 'green' }} />}
          />
        );

      case 'TransitSectionTime':
        return (
          (record.isFinal ? (
            <Tooltip title="Parada final">
              <CheckCircleOutlined
                style={{ color: 'green', cursor: 'pointer' }}
                aria-label="geofencesTable-CheckCircleOutlined"
              />
            </Tooltip>
          ) : (
            <InputNumber
              aria-label="geofencesTable-editTransitSectionTime"
              min={0}
              max={Number.MAX_SAFE_INTEGER}
              prefix={<ArrowDownOutlined style={{ color: 'green' }} />}
            />
          ))
        );

      default:
        return (
          <Input aria-label="geofencesTable-editShortName" />
        );
    }
  };

  /**
   * Si la celda es editable entonces transformamos el childNode
   * en lo que nos convenga según el tipo de dato de la celda o si esta
   * siendo editado o no.
   */
  return (
    <td {...restProps}>
      {editing ? (
        <>
          <Form.Item
            style={{ margin: 0 }}
            name={dataIndex}
            rules={[
              {
                required: !isRequired,
                message: `${title?.props?.children[0]} es requerido.`
              }
            ]}
          >
            {selectInputType(dataIndex)}
          </Form.Item>
          {dataIndex === 'TransitSectionTime' && (
            <div style={{ fontSize: 12, paddingRight: 24 }}>
              {record.TransitTo}
            </div>
          )}
        </>
      ) : (
        children
      )}
    </td>
  );
}
