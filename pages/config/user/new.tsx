/* eslint-disable no-unused-vars */
import React from 'react';
import ProtectedRoute from '@/hocs/ProtectedRoute';
import useLoading from '@/providers/LoadingProvider';
import FormElement from '@/views/page/FormElement';
import { userFields, userMessages, userSchema } from '@/fields/user/fields';
import { useApi } from '@/hooks/Api';
import { useNavigation } from '@/views/layout/Layout';
import { message } from 'antd';

interface resProps {
    Email: string,
}

interface userProps {
    Email: string,
    Name: string
}

interface IGetSettings {
    handleOnSave: (arg0: userProps) => void
}

/**
 * Función para obtener un objeto con las configuraciones necesarias para
 * crear una nueva ruta en el componente de formElement.
 * @name getSettings
 * @function
 *
 * @property {Function} handleOnSave - Función para guardar los cambios
 * @return {Object} - Objeto con las configuraciones necesarias para nuestro formElement
 */
const getSettings = ({ handleOnSave }: IGetSettings):object => ({
    back: '/config/user/', // Ruta a cambiar cuando navega para atras
    title: 'Nuevo usuario', // Titulo del formulario
    edition: false,
    handleOnSave, // Función para obtener los valores del formulario a la hora de guardar
    form: { // Configuraciones de la parte del formulario
        className: 'user-form',
        layout: 'vertical',
        name: 'newUser',
        initialValues: {
            Email: '',
            Name: ''
        },
        requiredMark: true,
    },
    validationSchema: userSchema,
    messages: userMessages, // Mensajes que se usaran en el formulario
    source: { // configuración para las queries
        url: 'user',
        key: 'user',
    },
    fieldset: userFields
});

/**
 * Vista para mostrar el registro de un usuario.
 * @view
 *
 * @returns {Component} - Regresa la vista del registro de un usuario.
 */
function NewUser():React.ReactElement {
    const { back } = useNavigation();
    const { post } = useApi();
    const [showLoading, hideLoading] = useLoading();

    /**
     * Query POST donde guardamos el usuario en DB y cognito
     * @hook
     */
    const { mutateAsync: createUser } = post('user', {
        onSuccess: ({ Email }: resProps) => {
            message.success(`Usuario ${Email} se creo con exito!`);
            hideLoading();
            back('/config/user/');
        },
        onError: () => {
            message.error('Error al crear usuario, verifíca la información e intenta de nuevo');
            hideLoading();
        },
    });

    /**
     * Función para registrar el usuario
     * @name handleOnSave
     * @function
     *
     * @param {Object} user - Contiene la información del usuario a registrar
     */
    const handleOnSave = async (user: userProps) => {
        showLoading();
        await createUser(user);
    };

    return (
      <div aria-label="newUser-container">
        <FormElement settings={getSettings({ handleOnSave })} />
      </div>
    );
}

const component: any = ProtectedRoute(NewUser);
component.Layout = true;
export default component;
