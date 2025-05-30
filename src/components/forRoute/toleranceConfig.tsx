import React from 'react';
import { Typography, Space, Tag, Row, InputNumber } from 'antd';
import { FormItem } from '@/components/elements/Form';

interface toleranceConfigProps {
  values: any,
  disabled: boolean
}

/**
 * Componente para añadir los tiempos de tolerancia a la ruta
 * @component
 *
 * @property {Object} values - Objeto de valores de formik
 * @property {Boolean} disabled - Campo deshabilitado
 *
 * @returns {Component} - Componente de tiempos de tolerancia
 */
function ToleranceConfig({ values, disabled }: toleranceConfigProps):React.ReactElement {
  return (
    <Space direction="vertical">

      <Typography.Text>
        <Row align="middle">
          <Tag color="green">A tiempo</Tag>
          - Hasta
          <FormItem
            name="toleranceOnTime"
            htmlFor="toleranceOnTime"
            className="hide-error"
            style={{
              marginBottom: '0px',
            }}
          >
            <InputNumber
              style={{ margin: '0px 6px', width: '4rem' }}
              size="small"
              min={0}
              name="toleranceOnTime"
              id="toleranceOnTime"
              aria-label="toleranceOnTime-Input"
              disabled={disabled}
            />
          </FormItem>
          minutos antes
        </Row>
      </Typography.Text>

      <Typography.Text>
        <Row align="middle">
          <Tag color="gold">Retraso</Tag>
          - Entre {values?.toleranceOnTime} minutos antes y
          <FormItem
            name="toleranceDelay"
            htmlFor="toleranceDelay"
            className="hide-error"
            style={{
              marginBottom: '0px',
            }}
          >
            <InputNumber
              style={{ margin: '0px 6px', width: '4rem' }}
              size="small"
              min={0}
              name="toleranceDelay"
              id="toleranceDelay"
              aria-label="toleranceDelay-Input"
              disabled={disabled}
            />
          </FormItem>
          minutos después
        </Row>
      </Typography.Text>

      <Typography.Text>
        <Tag color="error">Tarde</Tag>
        - Después de {values?.toleranceDelay} minutos
      </Typography.Text>
    </Space>
  );
}

export default ToleranceConfig;
