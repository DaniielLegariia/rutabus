import React from 'react';
import { Typography, Space, Select, InputNumber, Row } from 'antd';
import { FormItem } from '@/components/elements/Form';

const { Option } = Select;

interface disassociateVehicleProps {
  values: any,
  lastStep: string,
  disabled: boolean
}

/**
 * Componente para la desasociación de vehículos
 * @component
 *
 * @property {Object} values - Objeto de valores de formik
 * @property {String} lastStep - Nombre de la ultima parada de la ruta
 * @property {Boolean} disabled - Campo deshabilitado
 *
 * @returns {Component} - Componente de desasociación de vehículos
 */
function DisassociateVehicle({
  values,
  lastStep = 'destino',
  disabled
}: disassociateVehicleProps):React.ReactElement {
    const { disassociateVehicle } = values;

    return (
      <Space direction="vertical" style={{ marginBottom: '24px' }}>
        <Typography.Text>
          <Row align="middle">
            Desasociar
            <FormItem
              name="disassociateVehicleTime"
              htmlFor="disassociateVehicleTime"
              className="hide-error"
              style={{
                marginBottom: '0px',
              }}
            >
              <InputNumber
                style={{ margin: '0px 6px', width: '4rem' }}
                size="small"
                min={0}
                name="disassociateVehicleTime"
                id="disassociateVehicleTime"
                disabled={!disassociateVehicle || disabled}
              />
            </FormItem>
            minutos después de
            <FormItem
              name="disassociateVehicleTrigger"
              htmlFor="disassociateVehicleTrigger"
              className="hide-error"
              style={{
                marginBottom: '0px',
              }}
            >
              <Select
                style={{ margin: '0px 6px', width: '7rem' }}
                size="small"
                name="disassociateVehicleTrigger"
                id="disassociateVehicleTrigger"
                disabled={!disassociateVehicle || disabled}
              >
                <Option key="ingresar a">ingresar a</Option>
                <Option key="salir de">salir de</Option>
              </Select>
            </FormItem>
            {lastStep}
          </Row>
        </Typography.Text>
      </Space>
    );
}

export default DisassociateVehicle;
