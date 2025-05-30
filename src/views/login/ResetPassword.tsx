import { message, Row, Col, Card, Input } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { Auth } from 'aws-amplify';
import useLoading from '@/providers/LoadingProvider';
import { Form, FormItem, FormButton } from '@/components/elements/Form';
import * as Yup from 'yup';
import styles from '@/pages/login/login.module.scss';
import { LoginStates } from '@/pages/login';
import React from 'react';
import validations from '@/utils/validations';

/**
 * Definicion del esquema de validaciones
 */
const RecoverPasswordSchema = Yup.object().shape({
  email: Yup.string().email().required(),
  code: Yup.string().matches(validations.TOTPCode).min(6).max(6).required(),
  password: Yup.string().matches(validations.password).required(),
  repeatPassword: Yup.mixed().oneOf([Yup.ref('password'), null]).required()
});

/**
 * Vista de login que se muestra cuando el usuario solicito cambiar la contraseña
 * y cuenta con un código de recuperación.
 *
 * @view
 *
 * @property {Object} user - objeto de usuario regresado por aws-amplify.
 * @property {Function} setState - funcion para cambiar la vista de login.
 */
export default function ResetPassword({
  setState,
  email,
  setEmail,
}: {
  setState: Function;
  email: String;
  setEmail: Function;
}) {
  /**
   * Custom hook para mostrar el mensaje de cargando.
   * @hook
   */
  const [showLoading, hideLoading] = useLoading();

  /**
   * Funcion encargada de enviar la peticion de modificación de contraseña a aws
   * @name submit
   * @function
   * @param {Object} form - valores del formulario.
   */
  async function submit(form: any) {
    try {
      showLoading('Cambiando contraseña...');
      /**
       * Llama la funcion de aws con el correo electrónico del usuario, el código
       * de verificación y la nueva contraseña
       */
      await Auth.forgotPasswordSubmit(form.email, form.code, form.password);
      /**
       * Pasa el email a la siguiente pantalla y cambia de vista a SignIn
       */
      setEmail(form.email);
      setState(LoginStates.SignIn);
      message.success('La contrseña se ha cambiado con éxito.');
      hideLoading();
    } catch (error) {
      hideLoading();
      message.error('Error al reestablecer contraseña.');
    }
  }

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
              email,
              code: '',
              password: '',
              repeatPassword: ''
            },
            validationSchema: RecoverPasswordSchema,
            onSubmit: (form: any) => submit(form)
          }}
          name="form_code"
          className="login-form"
          layout="vertical"
          requiredMark={false}
          initialValues={{
            email
          }}
        >
          <div>
            <p
              style={{
                textAlign: 'justify',
                color: '#717171',
              }}
            >
              Es necesario que cambies tu contraseña, para esto te hemos enviado por correo
              electrónico un código de seguridad. Ingresa tu correo electrónico registrado,
              seguido por el código que recibiste y tu nueva contraseña.
            </p>
            <FormItem
              label="Correo electrónico"
              name="email"
              className="hide-error"
              htmlFor="email"
            >
              <Input
                id="email"
                name="email"
                prefix={<LockOutlined className={`site-form-item-icon ${styles.icon}`} />}
                type="email"
                placeholder="correo@gmail.com"
              />
            </FormItem>
            <FormItem
              label="Código de verificación"
              name="code"
              className="hide-error"
              htmlFor="code"
            >
              <Input
                id="code"
                name="code"
                prefix={<LockOutlined className={`site-form-item-icon ${styles.icon}`} />}
                placeholder="Código de 6 dígitos"
              />
            </FormItem>
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
