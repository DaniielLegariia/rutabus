import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Row } from 'antd';
import ProtectedRoute from '@/hocs/ProtectedRoute';
import styles from './login.module.scss';

/**
 * Importación dinamica de nuestro componente
 * @name SignIn
 * @constant
 */
const SignIn = dynamic(() => import('@/views/login/SignIn'));

/**
 * Importación dinamica de nuestro componente
 * @name ChangePassword
 * @constant
 */
const ChangePassword = dynamic(() => import('@/views/login/ChangePassword'));

/**
 * Importación dinamica de nuestro componente
 * @name ResetPassword
 * @constant
 */
const ResetPassword = dynamic(() => import('@/views/login/ResetPassword'));

/**
 * Importación dinamica de nuestro componente
 * @name RecoverPassword
 * @constant
 */
const RecoverPassword = dynamic(() => import('@/views/login/RecoverPassword'));

/**
 * @const {Object} LoginStates - Es un objeto el cual nos sirve para manejar nuestra maquina de
 * estados de la vista de login.
 */
export const LoginStates = {
  SignIn: 1,
  RecoverPassword: 2,
  ResetPassword: 3,
  ChangePassword: 4
};

/**
 * Vista de login
 * @view
 *
 * @returns {Component} - Regresa la vista de login.
 */
function Login():React.ReactElement {
  /**
   * Hook para cambiar de estado en nuestra maquina de estados.
   */
  const [state, setState] = useState(LoginStates.SignIn);

  /**
   * Hook para guardar el email proporcionado por el usuario y
   * poderlo pasar a las demas vistas.
   */
  const [email, setEmail] = useState('');

  /**
   * Hook para guardar la información del usuario que nes regresa AWS.
   */
  const [user, setUser] = useState(null);

  /**
   * Función para renderizar algún componente dependiendo del estado en el
   * que nos encontremos.
   * @name renderForm
   * @function
   *
   * @returns {Component} - Componente a mostrar dependiendo del estado.
   */
  function renderForm():React.ReactElement | null {
    switch (state) {
      case LoginStates.SignIn:
        return <SignIn setState={setState} setUser={setUser} setEmail={setEmail} email={email} />;
      case LoginStates.ChangePassword:
        return <ChangePassword user={user} setState={setState} />;
      case LoginStates.ResetPassword:
        return <ResetPassword setState={setState} email={email} setEmail={setEmail} />;
      case LoginStates.RecoverPassword:
        return <RecoverPassword setState={setState} email={email} setEmail={setEmail} />;
      default:
        return null;
    }
  }

  return (
    <div data-testid="login-container" className={styles.bg_login}>
      <Row justify="center" align="middle" className={styles.row_form}>
        {renderForm()}
      </Row>
    </div>
  );
}

export default ProtectedRoute(Login, '/dashboard', false);
