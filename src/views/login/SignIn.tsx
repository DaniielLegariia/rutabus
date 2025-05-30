/* eslint-disable no-unused-vars */
import { message, Row, Col, Card, Input } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Auth } from 'aws-amplify';
import useLoading from '@/providers/LoadingProvider';
import styles from '@/pages/login/login.module.scss';
import { Form, FormItem, FormButton } from '@/components/elements/Form';
import * as Yup from 'yup';
import { LoginStates } from '@/pages/login';
import { UsernamePasswordOpts } from '@aws-amplify/auth/lib-esm/types';
import React from 'react';
import { useRouter } from 'next/router';
import { useFormikContext } from 'formik';

interface IFormValues {
  username: string,
  password: string
}

interface IUseContext {
  values: IFormValues
}
interface IForgotPassword {
  forgotPassword: (arg0: IFormValues) => void
}

/**
 * Definicion del esquema de validaciones
 */
const SignInSchema = Yup.object().shape({
  username: Yup.string().email().required(),
  password: Yup.string().required(),
});

/**
 * Componente que nos movera de vista para cambiar la contraseña del usuario
 * @name ForgotPassword
 * @component
 *
 * @property {Function} forgotPassword - Función para obtener los valores del formulario
 * @returns {React.ReactElement} - Componente de texto para cambiar su contraseña
 */
function ForgotPassword({ forgotPassword }: IForgotPassword): React.ReactElement {
  const { values }: IUseContext = useFormikContext();
  return (
    <Row>
      <Col
        span={24}
        style={{
          textAlign: 'right',
          marginTop: '5px',
          marginBottom: '25px',
        }}
      >
        <a
          className={styles.loginFormForgot}
          onClick={() => forgotPassword(values)}
          style={{ float: 'right' }}
        >
          ¿Olvidaste tu contraseña?
        </a>
      </Col>
    </Row>
  );
}

/**
 * Vista de login que se muestra como principal, permite al usuario iniciar sesión
 *
 * @view
 *
 * @property {Function} setState - funcion para cambiar la vista de login.
 * @property {Function} setUser - guarda el usuario que regresa aws para pasarlo a las demás vistas.
 * @property {Function} setEmail - funcion para cambiar el correo y pasarlo a la siguiente vista,
 * esto nos permite precargar los datos.
 * @property {String} email - sirve para precargar el correo del usuario cuando es
 * redireccionado desde cambio de contraseña u otra vista
 */
export default function SignIn({
  setState,
  setUser,
  setEmail,
  email,
}: {
  setState: Function;
  setUser: Function;
  setEmail: Function;
  email: string;
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
   * Funcion que se ejecuta cuando el usuario da click en ¿Olvide mi contraseña?
   * @name forgotPassword
   * @function
   */
  const forgotPassword = ({ username }: IFormValues) => {
    setEmail(username);
    setState(LoginStates.RecoverPassword);
  };

  /**
   * Funcion encargada de enviar la peticion de inicio de sesión a aws
   * @name submit
   * @function
   * @param {Object} form - valores del formulario.
   */
  const submit = async (form: { username: String; password: String }) => {
    try {
      showLoading('Iniciando sesión...');
      /**
       * Llama la funcion de aws con los datos del formulario
       */
      const _user = await Auth.signIn(form as UsernamePasswordOpts);
      /**
       * guarda el objeto regresado y el email para pasarlo a las otras vistas
       */
      setUser(_user);
      setEmail(form.username);
      hideLoading();
      /**
       * Revisa el estatus de la respuesta de aws:
       * - si es NEW_PASSWORD_REQUIRED, quiere decir que la contraseña del usuario necesita
       * ser modificada y manda a la vista ChangePassword
       * - si es MFA_SETUP, quiere decir que el usuario necesita configurar su verificación
       * de 2 factores y manda a SetUpTOTP
       * - si es SOFTWARE_TOKEN_MFA, significa que tiene activada la verificación de 2 factores
       * y necesita proporcionar un código TOTP, manda a la vista VerifyTOTP
       */
      switch (_user.challengeName) {
        case 'NEW_PASSWORD_REQUIRED':
          return setState(LoginStates.ChangePassword);
        default:
          hideLoading();
          message.success('Autenticado correctamente.');
          /**
           * si el usuario es autenticado exitosamente redirecciona a home.
           */
          router.push('/dashboard');
          return null;
      }
    } catch (error:any) {
      hideLoading();
      /**
       * En caso de error se verifica la respuesta, si es PasswordResetRequiredException,
       * significa que el usuario necesita cambiar su contraseña por petición de aws
       */
      switch (error.code) {
        case 'PasswordResetRequiredException':
          setEmail(form.username);
          return setState(LoginStates.ResetPassword);
        default:
          message.error('Usuario o contraseña incorrecta.');
          return false;
      }
    }
  };

  return (
    <Col xl={7} md={12} sm={15} xs={24}>
      <img
        src="/images/svg/newLogo.png"
        alt="logo"
        width={160}
        height={100}
        style={{
          position: 'absolute',
          top: '-100px',
        }}
      />
      <Card
        title={<div className="text-center">Inicia sesión en tu cuenta</div>}
        bodyStyle={{
          paddingTop: '30px',
        }}
      >
        <Form
          settings={{
            initialValues: {
              username: email,
              password: ''
            },
            validationSchema: SignInSchema,
            onSubmit: (form: any) => submit(form)
          }}
          className="login-form"
          layout="vertical"
          requiredMark={false}
        >
          <div>
            <FormItem
              label="Correo electrónico"
              name="username"
              className="hide-error"
              htmlFor="username"
            >
              <Input
                name="username"
                id="username"
                prefix={<UserOutlined className={`site-form-item-icon ${styles.icon}`} />}
                placeholder="correo@gmail.com"
              />
            </FormItem>
            <FormItem
              label="Contraseña"
              name="password"
              className="hide-error"
              htmlFor="password"
              style={{
                marginBottom: '0px',
              }}
            >
              <Input
                name="password"
                id="password"
                prefix={<LockOutlined className={`site-form-item-icon ${styles.icon}`} />}
                type="password"
                placeholder="**********"
              />
            </FormItem>
            <ForgotPassword forgotPassword={forgotPassword} />
            <Row>
              <Col
                span={12}
                offset={6}
                style={{
                  textAlign: 'center',
                }}
              >
                <FormButton block className="login-form-button">
                  Entrar
                </FormButton>
              </Col>
            </Row>
          </div>
        </Form>
      </Card>
    </Col>
  );
}
