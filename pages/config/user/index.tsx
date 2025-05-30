import React, { useState } from 'react';
import ProtectedRoute from '@/hocs/ProtectedRoute';
import ListElements from '@/views/page/ListElements';
import { Button, Space, Tooltip, message, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useApi } from '@/hooks/Api';
import useLoading from '@/providers/LoadingProvider';
import { useAuth } from '@/providers/AuthProvider';

interface recordProps {
  Email: string,
  Name: string,
  IsAdmin: boolean
}

interface editUserData {
  Name: string,
  Email: string,
  IsAdmin: boolean
}

/**
 * Vista para mostrar el listado de usuarios registrados en la app.
 * @view
 *
 * @returns {Component} - Regresa la vista del listado de usuarios.
 */
function User() {
  const { put, del } = useApi();
  const { user } = useAuth();
  const [showLoading, hideLoading] = useLoading();
  const [refetchData, setRefetchData] = useState(false);

  const [userEmail, setUserEmail] = useState('');

  /**
   * Hook para hacer la request y editar
   * el usuario deseado.
   * @hook
   */
  const { mutate: editUser } = put(`user/${userEmail}`,
    {
      onSuccess: () => {
        hideLoading();
        setUserEmail('');
        message.success('Usuario guardado correctamente');
        setRefetchData((preVal: boolean) => !preVal);
      },
      onError: () => {
        hideLoading();
        setUserEmail('');
        message.error('Error al guardar el usuario');
      },
      enabled: userEmail // Solo se ejecuta si este valor es true
    },
    {}
  );

  /**
   * Hook para hacer la request y eliminar
   * el usuario deseado.
   * @hook
   */
  const { mutate: deleteUser } = del(`user/${userEmail}`,
    {
      onSuccess: () => {
        hideLoading();
        setUserEmail('');
        message.success('Usuario eliminado correctamente');
        setRefetchData((preVal: boolean) => !preVal);
      },
      onError: () => {
        hideLoading();
        setUserEmail('');
        message.error('Error al eliminar el usuario');
      },
      enabled: userEmail // Solo se ejecuta si este valor es true
    },
  );

  /**
   * Función para editar los datos del usuario deseado
   * @name onEditUser
   * @function
   *
   * @param {Object} data - Datos ya modificados por el usuario
   * @param {Object} oldData - Datos originales
   */
  const onEditUser = (data:editUserData, oldData:editUserData) => {
    if (data.Name.trim() === oldData.Name.trim()) return;
    if (data.Name.trim() === '') return;

    setUserEmail(data.Email.toUpperCase());

    showLoading('Guardando usuario...');
    editUser({ Name: data.Name.trim() });
  };

  /**
   * Función para eliminar un usuario
   * @name onDeleteUser
   * @function
   *
   * @param {Object} data - Información del usuario seleccionado
   */
  const onDeleteUser = (data:recordProps) => {
    showLoading('Eliminando usuario...');
    deleteUser({ Name: data.Name.trim() });
  };

  /**
   * Función para determinar si mostrar el boton de eliminar usuario
   * @name canShowDeleteButton
   * @function
   *
   * @param {Object} record - Información de un usuario
   * @returns {Boolean} - Si puede o no mostrar el boton de eliminar usuario
   */
  const canShowDeleteButton = (record: recordProps) => (
    !record.IsAdmin && record.Email !== user.email
  );

  /**
   * @const {Object} settings - Objeto con las configuraciones necesarias
   * para mostrar el listado de usuarios registrados en la app.
   */
  const settings = {
    title: 'Usuarios', // Titulo de la lista
    extras: [
      {
        link: '/config/user/new/', // Ruta si le damos a agregar un nuevo usuario
        text: 'Agregar', // Texto del boton para agregar usuario
        button: { // Objeto de la configuración del boton
        type: 'primary',
        shape: 'round',
        },
        key: 'add',
      },
    ],
    source: { // Fuente de donde proviene esta configuración
      url: 'user',
      key: 'user',
      id: 'Email',
      extraParams: {
        limit: 20,
      },
      options: {
        retry: false,
        refetchOnWindowFocus: false
      },
    },
    table: { // Configuración de la tabla
      pagination: false,
      bordered: true,
      showSorterTooltip: false,
      onSaveEditCell: onEditUser,
      refetchData,
      columns: [ // Columnas de la tabla
        {
            title: 'Email',
            dataIndex: 'Email',
            search: false,
        },
        {
          title: 'Nombre de usuario',
          dataIndex: 'Name',
          search: false,
          editable: true,
          render: (text: string) => (
            <div aria-label="user-UserName" style={{ cursor: 'pointer' }}>
              <Tooltip title="Nombre editable" placement="right">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {text}
                  </div>
                  <EditOutlined style={{ marginLeft: '0.5rem', color: '#045678' }} />
                </div>
              </Tooltip>
            </div>
          ),
        },
        {
          title: 'Acciones',
          fixed: 'right',
          dataIndex: 'operation',
          align: 'center',
          width: 200,
          render: (_: any, record: recordProps) => (
            <Space>
              {canShowDeleteButton(record) && (
              <Tooltip title="Eliminar">
                <Popconfirm
                  aria-label="user-deletePopconfirm"
                  title="¿Estas seguro de eliminar este usuario?"
                  placement="leftBottom"
                  arrowPointAtCenter
                  onCancel={() => setUserEmail('')}
                  onConfirm={() => onDeleteUser(record)}
                >
                  <Button
                    aria-label="user-deleteButton"
                    shape="round"
                    type="primary"
                    danger
                    onClick={() => setUserEmail(record.Email.toUpperCase())}
                    icon={<DeleteOutlined />}
                  />
                </Popconfirm>
              </Tooltip>
              )}
            </Space>
          ),
        },
      ],
    },
  };

  return (
    <div aria-label="user-container">
      <ListElements settings={settings} />
    </div>
  );
}

const component: any = ProtectedRoute(User);
component.Layout = true;
export default component;
