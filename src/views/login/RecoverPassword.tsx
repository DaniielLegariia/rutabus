import { message, Row, Col, Card, Input } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { Auth } from 'aws-amplify';
import useLoading from '@/providers/LoadingProvider';
import { Form, FormItem, FormButton } from '@/components/elements/Form';
import * as Yup from 'yup';
import styles from '@/pages/login/login.module.scss';
import { LoginStates } from '@/pages/login';
import React from 'react';
/**
 * Definicion del esquema de validaciones
 */
const RecoverPasswordSchema = Yup.object().shape({
  email: Yup.string().email().required(),
});
/**
 * Vista de login que se muestra cuando el usuario da click en el botón de ¿Olvidaste
 * tu contraseña?, se proporciona el email para enviar código de verificación
 *
 * @view
 * @param {Function} setState - funcion para cambiar la vista de login.
 * @param {String} email - email del usuario que dio click, solo se recibe si lo proporcionó
 * en login.
 * @param {Function} setEmail - funcion para cambiar el correo y pasarlo a la siguiente vista,
 * esto nos permite pregargar los datos.
 */
export default function RecoverPassword({
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
   * Funcion encargada de enviar la peticion de envio de código de verificación
   * a aws
   * @name submit
   * @function
   * @param {Object} form - valores del formulario.
   */
  async function submit(form: any) {
    try {
      showLoading('Enviando correo...');
      /**
       * Llama la funcion de aws con el correo electrónico del usuario
       */
      await Auth.forgotPassword(form.email);
      /**
       * Pasa el email a la siguiente pantalla y cambia de vista a ResetPassword
       */
      setEmail(form.email);
      setState(LoginStates.ResetPassword);
      message.success('Se ha enviado el correo de recuperación.');
      hideLoading();
    } catch (error) {
      hideLoading();
      message.error('Error al recuperar contraseña.');
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
            <div className="text-center">Recuperar contraseña</div>
          </>
        }
        bodyStyle={{
          paddingTop: '30px',
        }}
      >
        <Form
          settings={{
            initialValues: {
              email
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
              Para ayudarte a recuperar tu contraseña te enviaremos un correo electrónico con un
              código de verificación, esto nos ayudara a validar tu identidad. Proporciona tu
              correo electrónico registrado para enviarte tu código de autenticación.
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
            <Row>
              <Col
                span={12}
                offset={6}
                style={{
                    textAlign: 'center',
                  }}
              >
                <FormButton block className="login-form-button">
                  Enviar
                </FormButton>
              </Col>
            </Row>
          </div>
        </Form>
      </Card>
    </Col>
  );
}
