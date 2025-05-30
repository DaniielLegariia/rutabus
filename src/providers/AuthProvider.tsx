import React, { createContext, useContext, useMemo, useState } from 'react';

/**
 * Creación del context.
 * Creación de la interfaz para la funcion "AuthProvider".
 */
const AuthContext = createContext({} as any);
interface IAuthProps {
  children: React.ReactElement;
  // eslint-disable-next-line react/no-unused-prop-types
  props: any;
}

/**
 * Función provider para nuestro AuthContext.
 * @name AuthProvider
 *
 * @function
 * @param {Component} children - Componente el cual será envuelto en nuestro provider.
 *
 * @returns {Component} - Componente el cual insertará algunas props extra a el componente hijo.
 */
export function AuthProvider({ children }: IAuthProps):React.ReactElement {
  const [value, setValue] = useState({ loaded: false });
  const values = useMemo(() => ({ ...value, setValue, getValue: () => value }),
    [value, setValue]
  );

  return (
    <AuthContext.Provider
      value={values}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook para el uso de nuestro AuthContext.
 * @hook
 *
 * @returns {Object} - Objeto con todo los valores que se asignaron en nuestro provider
 * en la parte de arriba.
 */
export const useAuth = (): object => useContext(AuthContext);
