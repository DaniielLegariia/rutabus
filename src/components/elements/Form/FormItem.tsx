/* eslint-disable no-unused-vars */
/* eslint-disable react/require-default-props */
import React from 'react';
import { FormikContextType, FormikValues, useFormikContext } from 'formik';
import _ from 'underscore';
import { Form } from 'antd';

interface IFormItem {
    children: React.ReactElement | ((arg0: FormikValues) => React.ReactElement),
    name: string,
    label?: string | undefined,
    className?: string | undefined,
    style?: object | undefined,
    htmlFor?: string | undefined,
    tooltip?: string | undefined,
    hasFeedback?: boolean,
    type?: string | undefined
}

function FormItem(props: IFormItem) {
  const { children, ...itemProps } = props;
  const formik: FormikContextType<FormikValues> = useFormikContext();

  const getHelp = () => {
    const touched = _.get(formik.touched, itemProps?.name?.split('.'));
    const dirty = _.get(formik.dirty, itemProps?.name?.split('.'));
    const errored = _.get(formik.errors, itemProps?.name?.split('.'));
    return (touched || dirty) && errored ? errored : undefined;
  };
  const getStatus = () => {
    const touched = _.get(formik.touched, itemProps?.name?.split('.'));
    const dirty = _.get(formik.dirty, itemProps?.name?.split('.'));
    const errored = _.get(formik.errors, itemProps?.name?.split('.'));
    const valid = !errored && touched;
    return (touched || dirty) && errored ? 'error' : valid ? 'success' : null;
  };

  return (
    <Form.Item {..._.omit(itemProps, ['name'])} validateStatus={getStatus()} help={getHelp()}>
      {typeof children === 'function'
        ? children(formik)
        : {
            ...children,
            props: {
              ...children.props,
              onChange: (e: any) => {
                formik.setFieldValue(itemProps?.name, e?.target ? e?.target?.value : e);
                if (children?.props?.onChange) {
                  children?.props?.onChange(e, formik.setValues, formik);
                }
              },
              value: _.get(formik.values, itemProps?.name?.split('.')),
              checked: itemProps.type === 'switch' ? _.get(formik.values, itemProps?.name?.split('.')) : null,
              onBlur: (e: any) => {
                e.target.name = itemProps?.name;
                formik.handleBlur(e);
              },
            },
          }}
    </Form.Item>
  );
}

export default FormItem;
