/* eslint-disable react/require-default-props */
import React from 'react';
import { FormikConfig, FormikProvider, FormikValues, useFormik } from 'formik';
import { Form as FormAntd } from 'antd';
import { FormLayout } from 'antd/lib/form/Form';

interface IForm {
    children: React.ReactChild,
    settings: FormikConfig<FormikValues>,
    name?: string | undefined,
    className?: string | undefined,
    layout?: FormLayout | undefined,
    requiredMark?: boolean | undefined,
    initialValues?: object | undefined,
}

function Form(props: IForm) {
  const { children, settings, ...formProps } = props;
  const formik = useFormik<FormikValues>(settings);

  return (
    <FormikProvider value={formik}>
      <FormAntd {...formProps} requiredMark>
        {children}
      </FormAntd>
    </FormikProvider>
  );
}

export default Form;
