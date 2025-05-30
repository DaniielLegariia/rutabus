/* eslint-disable react/require-default-props */
import React from 'react';
import { Button } from 'antd';
import { Field } from 'formik';

interface IFormButton {
    children: React.ReactChild,
    block?: boolean | undefined,
    className?: string | undefined,
    shape?: 'circle' | 'default' | 'round' | undefined,
    disabled?: boolean | undefined
}

interface IFormField {
    form: {
        isSubmitting: boolean,
        isValid: boolean,
        handleSubmit: () => void
    }
}

export function FormButton({ children, ...restProps }: IFormButton) {
  return (
    <Field>
      {({ form: { isSubmitting, handleSubmit } }: IFormField) => (
        <Button
          loading={isSubmitting}
          onClick={handleSubmit}
          type="primary"
          htmlType="submit"
          {...restProps}
        >
          {children}
        </Button>
      )}
    </Field>
  );
}

export default FormButton;
