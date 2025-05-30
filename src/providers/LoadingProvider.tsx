import React, { createContext, useContext, useState, useMemo } from 'react';
import { Modal, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface ILoadingProvider {
  children: React.ReactElement
}

/**
 * Creación del context.
 */
const LoadingContext = createContext([] as Array<any>);

/**
 * Función provider para nuestro LoadingContext.
 * @param {Component} children - Componente el cual será envuelto en nuestro provider.
 *
 * @returns {Component} - Componente el cual insertará algunas props y funciones extra
 * a el componente hijo.
 */
export function LoadingProvider({ children }: ILoadingProvider):React.ReactElement {
  const [message, setMessage] = useState('Cargando...');
  const [visible, setVisible] = useState(false);

  /**
   * Función para desplegar el modal con algún mensaje y el icono de cargando.
   * @name show
   *
   * @function
   * @param {String} _message - Mensaje a mostrarse en el modal.
   */
  const show = (_message: string) => {
    console.log('Estado de carga activado:', _message);
    setMessage(_message || 'Cargando...');
    setVisible(true);
  };

  /**
   * Función para ocultar el modal
   * @name hide
   *
   * @function
   */
  const hide = () => {
    console.log('Estado de carga desactivado');
    setVisible(false);
  };;

  const value = useMemo(() => ([show, hide]), [show, hide]);

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <Modal
        centered
        closable={false}
        keyboard={false}
        maskClosable={false}
        footer={false}
        open={visible}
        width={300}
      >
        <Spin
          style={{
            display: 'inline-block',
            marginRight: '20px',
            color: '#f14854',
          }}
          indicator={
            <LoadingOutlined
              style={{
                fontSize: 24,
              }}
              spin
            />
          }
        />
        {message}
      </Modal>
    </LoadingContext.Provider>
  );
}

/**
 * Custom hook para el uso de nuestro LoadingContext.
 * @hook
 *
 * @returns {Array} - Regresa un array donde la primera posición es la funcion para desplegar
 * un modal con algún mensaje y la segunda posición es una función para ocultar este modal.
 */
export default function useLoading():any[] {
  const context = useContext(LoadingContext);
  return context;
}
