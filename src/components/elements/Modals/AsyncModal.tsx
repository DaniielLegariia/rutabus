/* eslint-disable react/require-default-props */
import React, { useState, useEffect } from 'react';
import { useApi } from '@/hooks/Api';
import { Modal, List, Typography, Skeleton, Input, Checkbox, Pagination, Button, message, Popconfirm } from 'antd';
import { usePagination } from 'react-use-pagination';

import { CheckOutlined, CloseOutlined, LoadingOutlined } from '@ant-design/icons';
import style from './AsyncModal.module.css';

const { Search } = Input;

interface AsyncModalProps {
    state: any[],
    dataSource: string,
    action: any,
    avoidElements: any[],
    selectedItems: any[],
    title: string,
    element: string,
    apiElement: string,
    itemsPerPage: number,
    maxItemsToSelect: number,
    haveLimitToSelect: boolean,
    dataKey: string,
    extraParams: any,
    refetchData: boolean,
    vehicleLink: any,
    vehicleLinkConfig: any,
    isGetVehicles?: boolean
}

/**
 * Componente para mostrar un listado de items en un modal.
 * @component
 *
 * @property {Function} state - Hook para cambiar si es visible o no el modal.
 * @property {String} dataSource - Texto para determinar nuestra key y path del query get.
 * @property {Function} action - Función para ejecutar la accion deseada una vez que se
 * selecciona algún item de la lista.
 * @property {Array} avoidElements - Array de elementos los cuales se tienen que evitar
 * porque ya fueron seleccionados.
 * @property {Array} selectedItems - Array de elementos ya seleccionados.
 * @property {String} title - Texto que se mostrará como titulo del modal.
 * @property {String} element - Texto que se mostrará en el placeholder de buscar.
 * @property {String} apiElement - Texto con el cual decidimos que atributo de los elementos se
 * mostrará en la lista y como los vamos a filtrar.
 * @property {Number} itemsPerPage - Elementos maximos a mostrar por página (paginación).
 * @property {Number} maxItemsToSelect - Maximo de elementos que se pueden seleccionar.
 * @property {Boolean} haveLimitToSelect - Sirve para saber si tiene limite de selección.
 * @property {String} keyData - Cuando la data es un objeto, esta propiedad indica de que key se
 * tiene que sacar la data a utilizar.
 * @property {Object} extraParams - Parametros extra para la petición get del modal
 * @property {Boolean} refetchData - Sirve para saber cuando se tiene que refrescar la data.
 * @property {Function} vehicleLink - Para saber que vista mostrará el modal
 * @property {Object} vehicleLinkConfig - Objeto de configuración para la vinculación de vehículos
 * @property {Boolean} isGetVehicles - Bandera para saber si es para obtener vehículos
 */
function AsyncModal({
    state,
    dataSource,
    action,
    avoidElements = [],
    selectedItems = [],
    title,
    element,
    apiElement,
    itemsPerPage,
    maxItemsToSelect,
    haveLimitToSelect = true,
    dataKey = '',
    extraParams = {},
    refetchData,
    vehicleLink = [],
    vehicleLinkConfig = {},
    isGetVehicles = false
    }: AsyncModalProps) {
    const { get } = useApi();
    const [isVisible, setIsVisible] = state;
    const [isVehicleLink, setIsVehicleLink] = vehicleLink;
    const [elements, setElements]:any[] = useState([]);
    const [elementsList, setElementsList] = useState([]);
    const [selectedElements, setSelectedElements]:any[] = useState(selectedItems);

    const {
      breakAssociate,
      setSuccessVehicles,
      setVehiclesArray,
      vehiclesArray,
      successVehicles,
      vehiclesToLink
    } = vehicleLinkConfig;

    /**
     * Se previene que el usuario a medio proceso quiera actualizar
     * o cerrar la pagina, le aparecerá un mensaje de si esta seguro
     * en cerrar el navegador
     */
    useEffect(() => {
      if (!isVisible
        || !isVehicleLink
        || breakAssociate?.current
      ) return;

      const onBeforeUnload = (event: Event) => {
        event.preventDefault();
        event.returnValue = true;
        return '';
      };

      window.addEventListener('beforeunload', onBeforeUnload);

      // eslint-disable-next-line consistent-return
      return () => window.removeEventListener('beforeunload', onBeforeUnload);
    }, [isVisible, isVehicleLink, breakAssociate?.current]);

    /**
     * Query GET para conseguir la data deseada.
     */
    const { isLoading, isRefetching, data, refetch } = get(
        [dataSource],
        dataSource,
        { ...extraParams }
    );

    /**
     * Custom hook para manejar la paginación
     */
    const {
        currentPage,
        startIndex,
        endIndex,
        setPage
    } = usePagination({
        totalItems: elementsList?.length,
        initialPageSize: itemsPerPage
    });

    /**
     * Función para filtrar la lista final y solo mostrar los elementos que
     * no estan en nuestro array de "avoidElements".
     * @name filterElements
     * @function
     *
     * @returns {Array} - Regresa un array que contiene los elementos ya filtrados.
     */
    const filterElements = () => {
        let tempArr:any[] = [];

        for (const avoidElement of avoidElements) {
            if (tempArr?.length === 0) {
              const dataElements = data
                ? Array.isArray(data) ? data : data[dataKey] : [];
                tempArr = dataElements?.filter((item:any) =>
                    !item[apiElement].includes(avoidElement[apiElement])
                );
            } else {
                tempArr = tempArr?.filter((item:any) =>
                    !item[apiElement].includes(avoidElement[apiElement])
                );
            }
        }
        return tempArr;
    };

    /**
     * useEffect para si hay elementos a evitar los filtremos y
     * si no los hay solo pasamos la data tal cual llega.
     */
    useEffect(() => {
        let finalElements = [];
        if (!isGetVehicles) {
            setSelectedElements(selectedItems);
        }

        if (avoidElements.length > 0) {
            finalElements = filterElements();
            setElements(finalElements);
        } else {
            finalElements = data
              ? Array.isArray(data) ? data : data[dataKey] : [];
            setElements(finalElements);
          }

        setElementsList(finalElements);

      return () => {
        setElements([]);
      };
    }, [data, avoidElements]);

    /**
     * Refrescamos la data
     */
    useEffect(() => {
      refetch();
    }, [refetchData]);

    /**
     * Función para hacer el filtro de busqueda.
     * @name onSearch
     * @function
     *
     * @param {Object} e - Objeto de donde sacamos el valor por el cual estaremos filtrando.
     */
    const onSearch = (e:React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        const filteredElements = elements.filter((item:any) =>
            item[apiElement].toLowerCase().includes(value.toLowerCase())
        );
        setElementsList(filteredElements);
    };

    /**
     * Función para seleccionar algún item de la lista.
     * @name selectElement
     * @function
     *
     * @param item - Elemento de la lista el cual fue seleccionado.
     */
    const selectElement = (item:any) => {
        // Si el elemento no ha sido seleccionado
        if (!selectedElements.find((v:any) => v[apiElement] === item[apiElement])) {
            // Si se llegó al maximo de items a seleccionar mandamos un mensaje de error
            if (selectedElements.length === maxItemsToSelect && haveLimitToSelect) {
                return message.error(`No puedes agregar mas de ${maxItemsToSelect} elementos.`);
            }

            // Si no, agregamos el item a los elementos seleccionados
            setSelectedElements((preVal:any) => ([
                ...preVal,
                item
            ]));
        } else {
            // Se elimina el item a los elementos seleccionados
            setSelectedElements((preVal:any) => ([
                ...preVal.filter((v:any) => v[apiElement] !== item[apiElement])
            ]));
        }

        return null;
    };

    /**
     * Función que se ejecuta la cerrar el modal
     * @name onCancel
     * @function
     */
    const onCancel = () => {
        setIsVisible(false); // Cierra el modal
        setPage(0); // La pagina actual del paginador se resetea
        setSelectedElements([]); // Se limpian los elementos seleccionados
        if (isVehicleLink) {
          setIsVehicleLink(false);
          refetch();
          setVehiclesArray([]);
          setSuccessVehicles(0);
          vehicleLinkConfig.refetch();
          breakAssociate.current = null;
        }
    };

    /**
     * Función para cambiar la página actual del paginado
     * @name onChangePagination
     * @function
     *
     * @param {Number} page - Numero de página a cambiar.
     * @returns - función para setear la página actual del paginado
     */
    const onChangePagination = (page:number) => setPage(page - 1);

    /**
     * Función para guardar los elementos seleccionados
     * @name onSave
     * @function
     */
    const onSave = () => {
        action(selectedElements); // Se mandan los elementos seleccionados
        setPage(0); // La pagina actual del paginador se resetea
        setSelectedElements([]); // Se limpian los elementos seleccionados
    };

    /**
     * Componente para el titulo del modal
     * @component
     */
    const customTitle = (
      <div className={style.customTitle}>
        <Search
          aria-label="AsyncModal-SearchInput"
          className={style.searchStyle}
          placeholder={`Buscar ${element}`}
          onChange={onSearch}
        />
        <Typography.Text className={style.textTitleStyle} type="secondary">
          {haveLimitToSelect
            ? `${title} ${selectedElements.length} / ${maxItemsToSelect}`
            : `${title} ${selectedElements.length}`}
        </Typography.Text>
      </div>
    );

    /**
     * Componente para el titulo del modal
     * cuando es para asociar o desasociar vehículos de ruta
     * @component
     */
    const customTitleVehicleLink = (
      <div>
        <Typography.Text
          className={style.textTitleStyle}
          type="secondary"
        >
          {`${vehicleLinkConfig?.title} 
            ${successVehicles} / ${vehiclesToLink}`}
        </Typography.Text>
      </div>
    );

    /**
     * Función para seleccionar el icono según el estatus del
     * elemento de la lista.
     * @name selectIcon
     * @function
     *
     * @param {String} type - El estatus del elemento de la lista
     *
     * @returns {JSX.Element} - Icono según el estatus
     */
    const selectIcon = (type: string) => {
      switch (type) {
        case 'success':
          return <CheckOutlined style={{ color: 'green' }} />;

        case 'failed':
          return <CloseOutlined style={{ color: 'red' }} />;

        default:
          return <LoadingOutlined spin />;
      }
    };

    /**
     * Componente para el footer del modal
     * @component
     */
    const customFooter = (
      <div className={style.customFooter}>
        <Pagination
          onChange={onChangePagination}
          pageSize={itemsPerPage}
          total={elementsList?.length}
          current={currentPage + 1}
          showSizeChanger={false}
          simple
          size="small"
        />
        <Button
          aria-label="AsyncModal-SaveButton"
          type="primary"
          onClick={onSave}
          disabled={!selectedElements.length}
        >
          Guardar
        </Button>
      </div>
    );

    /**
     * Componente para el footer del modal cuando
     * es para asociar o desasociar vehículos de ruta
     * @component
     */
    const customFooterVehicleLink = (
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {(successVehicles === vehiclesToLink)
          || (breakAssociate?.current)
          ? (
            <Button
              aria-label="AsyncModal-CloseButton"
              type="primary"
              onClick={onCancel}
            >
              Cerrar
            </Button>
        ) : (
          <Popconfirm
            title="Estas seguro de cancelar la vinculación?"
            onConfirm={() => {
              breakAssociate.current = true;
              refetch();
            }}
            okText="Si"
            cancelText="No"
          >
            <Button
              aria-label="AsyncModal-CancelButton"
              type="primary"
              danger
            >
              Cancelar
            </Button>
          </Popconfirm>
        )}
      </div>
    );

    return (
      <Modal
        title={isVehicleLink ? customTitleVehicleLink : customTitle}
        open={isVisible}
        footer={isVehicleLink ? customFooterVehicleLink : customFooter}
        destroyOnClose
        zIndex={990}
        onCancel={onCancel}
        closable={!isVehicleLink}
        maskClosable={!isVehicleLink}
        centered
        bodyStyle={{ height: '70vh', overflow: 'auto', margin: '0.5rem 0' }}
      >
        {((isLoading && !isVehicleLink))
                ? <Skeleton />
                : (
                  <div>
                    <List
                      bordered
                      loading={(isRefetching && !isVehicleLink)}
                      dataSource={(Array.isArray(elementsList) && !isVehicleLink)
                                ? elementsList?.slice(startIndex, endIndex + 1)
                                : vehiclesArray}
                      renderItem={(item:any) => (
                        <List.Item
                          style={isVehicleLink ? { justifyContent: 'flex-start' } : {}}
                          aria-label="AsyncModal-ListItem"
                          onClick={() => selectElement(item)}
                        >
                          {isVehicleLink ? (
                            <>
                              <Typography.Text style={{ marginRight: '0.5rem' }}>
                                {selectIcon(item?.status || '')}
                              </Typography.Text>
                              <Typography.Text>{item.Name}</Typography.Text>
                            </>
                          ) : (
                            <Checkbox
                              aria-label="AsyncModal-CheckboxItem"
                              checked={selectedElements.find((v:any) =>
                                v[apiElement] === item[apiElement]
                              )}
                              disabled={haveLimitToSelect
                                  && selectedElements.length === maxItemsToSelect
                                  && !selectedElements.find((v:any) =>
                                    v[apiElement] === item[apiElement])}
                            >
                              <Typography.Text>{item[apiElement]}</Typography.Text>
                            </Checkbox>
                          )}
                        </List.Item>
                      )}
                    />
                  </div>
                )}
      </Modal>
    );
}

export default AsyncModal;
