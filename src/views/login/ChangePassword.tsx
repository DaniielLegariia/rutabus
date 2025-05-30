import { message, Row, Col, Card, Input } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { Auth } from 'aws-amplify';
import useLoading from '@/providers/LoadingProvider';
import { Form, FormItem, FormButton } from '@/components/elements/Form';
import * as Yup from 'yup';
import styles from '@/pages/login/login.module.scss';
import { LoginStates } from '@/pages/login';
import validations from '@/utils/validations';
import React from 'react';
import { useRouter } from 'next/router';

/**
 * Definicion del esquema de validaciones
 */
const ChangePasswordSchema = Yup.object().shape({
  password: Yup.string().matches(validations.password).required(),
  repeatPassword: Yup.mixed().test('match', '', function match() {
    return this.parent.password === this.parent.repeatPassword;
  }),
});

/**
 * Vista de login que se muestra cuando el usuario necesita cambiar su contraseña por
 * indicación de aws, ya sea en su primer login o cuando se revocan sus credenciales.
 *
 * @view
 *
 * @property {Object} user - objeto de usuario regresado por aws-amplify.
 * @property {Function} setState - funcion para cambiar la vista de login.
 */
export default function ChangePassword({
  user,
  setState,
}: {
  user: Object | null;
  setState: Function;
}) {
  /**
   * Custom hook para mostrar el mensaje de cargando.
   * @hook
   */
  const [showLoading, hideLoading] = useLoading();
  /**
   * declara el router de next
   */
  const router = useRouter();
  /**
   * Funcion encargada de enviar la peticion de cambio de contraseña a aws
   * @name submit
   * @function
   */
  const submit = async (form: any) => {
    try {
      showLoading('Confirmando contraseña.');
      /**
       * Llama la funcion de aws con el objeto de usuario y la nueva contraseña
       */
      await Auth.completeNewPassword(user, form.password);
      /**
       * Se empieza a entrar al sistema
       */
      hideLoading();
      message.success('Autenticado correctamente.');
      return router.push('/dashboard');
    } catch (error) {
      hideLoading();
      message.error('Error al confirmar contraseña.');
      return false;
    }
  };
  return (
    <Col xl={7} md={12} sm={15} xs={24}>
      <Card
        title={
          <>
            <div
              className={styles.back_btn}
              onClick={() => {
                setState(LoginStates.SignIn);
              }}
            >
              Regresar
            </div>
            <div className="text-center">Cambia de contraseña</div>
          </>
        }
        bodyStyle={{
          paddingTop: '30px',
        }}
      >
        <Form
          settings={{
            initialValues: {
              code: '',
            },
            validationSchema: ChangePasswordSchema,
            onSubmit: submit
          }}
          name="form_code"
          className="login-form"
          layout="vertical"
          requiredMark={false}
        >
          <div>
            <p
              style={{
                textAlign: 'justify',
                color: '#717171',
              }}
            >
              Es necesario que cambies tu contraseña. Ingresa tu nueva contraseña, debe incluir al
              menos 8 dígitos utilizando mayúsculas, minúsculas, numeros y caracteres especiales.
            </p>
            <FormItem
              label="Contraseña"
              name="password"
              className="hide-error"
              htmlFor="password"
              tooltip="La contraseña debe incluir al menos 8 dígitos utilizando mayúsculas, minúsculas, numeros y caracteres especiales"
            >
              <Input
                id="password"
                name="password"
                prefix={<LockOutlined className={`site-form-item-icon ${styles.icon}`} />}
                type="password"
                placeholder="**********"
              />
            </FormItem>
            <FormItem
              label="Repetir contraseña"
              name="repeatPassword"
              className="hide-error"
              htmlFor="repeatPassword"
              tooltip="Las contraseñas deben coincidir"
            >
              <Input
                id="repeatPassword"
                name="repeatPassword"
                prefix={<LockOutlined className={`site-form-item-icon ${styles.icon}`} />}
                type="password"
                placeholder="**********"
              />
            </FormItem>
            <Row>
              <Col
                span={12}
                offset={6}
                style={{
                  textAlign: 'center',
                }}
              >
                <FormButton block className="login-form-button">
                  Cambiar contraseña
                </FormButton>
              </Col>
            </Row>
          </div>
        </Form>
      </Card>
    </Col>
  );
}
