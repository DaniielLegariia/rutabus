/* eslint-disable no-unused-vars */
import React, { useState,useEffect } from 'react';
import {
  Modal,
  Layout,
  Divider,
  Row,
  Col,
  Button,
  Skeleton,
  message,
  Result,
  Tooltip,
  Input,
  Switch,
  Select
} from 'antd';
import { Form, FormItem, FormButton } from '@/components/elements/Form';
import { useFormikContext } from 'formik';
import _, { object } from 'underscore';
import useLoading from '@/providers/LoadingProvider';
//import { useApi } from '@/hooks/Api';
import { useNavigation } from '@/views/layout/Layout';
import stringWithVariables from '@/utils/stringWithVariables';
import { ArrowLeftOutlined } from '@ant-design/icons';
import PageHeader from '@/components/elements/PageHeader';
import { getRoute,updateRoute,DeleteRoute } from '@/pages/api/Apis';


interface ICol {
  item: {
    type: string,
    name: string,
    content: any,
  },
  condition?: boolean | any,
  input: {
    id: string
  },
  disabled?: boolean | any,
  button: {
    onClick: (arg0: object) => void
  },
  custom: {
    content: (arg0: object, arg1: boolean) => React.ReactElement
  }
}

interface ISettings {
  form: {
    disabledFields: any[]
  },
  fieldset: any[]
}

interface IGetContent {
  col: ICol,
  settings: ISettings,
  disabledSave: boolean
}

/**
 * Función para construir los diferentes tipos de componentes que puede
 * llevar nuestro formulario.
 * @name GetContent
 * @function
 *
 * @property {Object} col - Objeto de valores para la creacion del componente
 * @property {Object} settings - Valores proporcionados por formik
 * @property {Boolean} disabledSave - Bandera para saber si se deshabilitan los campos en el
 * componente custom
 * @returns {Component} - Regresa un componente dependiendo de su tipo.
 */
function GetContent({
  col,
  settings,
  disabledSave
}: IGetContent): React.ReactElement | null {
  const formik = useFormikContext();

  switch (col.item.type) {
    case 'input':
      return (
        !col.condition || col.condition(formik?.values) ? (
          <FormItem hasFeedback {...col?.item}>
            <Input
              {...col?.input}
              disabled={
                settings?.form?.disabledFields?.indexOf(col?.input?.id) >= 0
                || (col.disabled && col.disabled(formik?.values))
              }
            />
          </FormItem>
        ) : null
      );
    case 'button':
      return (
        <Button
          {...col.button}
          onClick={
            col?.button?.onClick
              ? () => col.button.onClick(formik) : () => {}
          }
        >
          {col.item.content}
        </Button>
      );
    case 'switch':
      return (
        <FormItem hasFeedback {...col?.item}>
          <Switch
            {...col?.input}
            disabled={
              settings?.form?.disabledFields?.indexOf(col?.input?.id) >= 0
              || (col.disabled && col.disabled(formik?.values))
            }
          />
        </FormItem>
      );
    case 'select':
      return (
        <FormItem hasFeedback {...col?.item}>
          <Select {...col?.input} />
        </FormItem>
      );
    case 'custom':
      return col.custom.content(formik, disabledSave);
    default:
      return null;
  }
}

/**
 * Vista o componente generico para la creación o edición de registros,
 * se crea un formulario a partir de las configuraciones que se le
 * manden al componente.
 *
 * @view
 *
 * @param {Object} settings - Es el objeto de las configuraciones con las que se construirá
 * el formulario.
 */
function FormElement({ settings = {} }:any) {
  const { back } = useNavigation();
  const {
    edition,
    source,
    id,
    messages,
    handleOnSave,
   // loading = false,
    disabledSave = false,
    vehiclesInRoute = [], // Extraer vehiclesInRoute de settings
  } = settings;
  const [initialValues, setInitialValues] = useState(settings?.form?.initialValues);
  const [element, setElement]:any = useState(null);
 // const { get, post, put, del } = useApi();
  const [showLoading, hideLoading] = useLoading();
  const { disabledFields = [], ...formSettings } = settings.form ? settings.form : {};
  const [loading, setLoading] = useState(false);


  
  /**
   * Función para navegar a la vista anterior
   * @name goBack
   * @function
   *
   * @returns {Function} - Ejecuta una función para navegar a la ruta anterior.
   */
   async function goBack() {
    return back(settings?.back);
   }

  const isError = false; // Inicializar como false si no hay lógica para determinar errores
  useEffect(() => {
  
    const fetchData = async () => {
      if (!edition || !id || !settings?.idcliente) return; // Verificar que los parámetros sean válidos
  
      setLoading(true); // Mostrar indicador de carga
      showLoading('Cargando datos...');
      try {
        const data = await getRoute(id, settings.idcliente); // Llamar a la función `getRoute`
        console.log("dataSS", data);
  
        // Acceder correctamente a `data.body.route`
        if (data?.body?.route) {
          setElement(data.body.route); // Guardar los datos completos en el estado `element`
          setInitialValues({
            name: data.body.route.Name,
            description: data.body.route.Description,
            toleranceOnTime: data.body.route.tolerance.OnTime,
            toleranceDelay: data.body.route.tolerance.Delayed,
            finalDestinationAuto: !data.body.route.FinalDestination.time,
            finalDestination: data.body.route.FinalDestination.time
  ? data.body.route.FinalDestination.time.padStart(5, '0') // Asegura que tenga el formato HH:mm
  : '',
            disassociateVehicle: data.body.route.dissociate.config === 'auto',
            disassociateVehicleTrigger: data.body.route.dissociate.trigger,
            disassociateVehicleTime: data.body.route.dissociate.referenceTime,
          });
         
          message.success('Datos cargados correctamente.');
        } else {
          message.error('No se encontró el registro.');
          goBack();
        }
      } catch (error) {
        console.error('Error al cargar los datos:', error);
        message.error('Error al cargar los datos.');
        goBack();
      } finally {
        setLoading(false); // Ocultar indicador de carga
        hideLoading();
      }
    };
  
    fetchData();
  }, [edition, id, settings?.idcliente]);// Ejecutar cuando cambien estos valores




  /**
   * Función para desplegar un mensaje según la acción indicada y navegar
   * a la vista anterior
   * @name onSuccess
   * @function
   *
   * @param {String} type - Tipo de acción ejecutada.
   */
  async function onSuccess(type: string) {
    hideLoading();
    switch (type) {
      case 'create':
        message.success(
          stringWithVariables(messages?.success[type], initialValues) || 'creado de forma exitosa'
        );
        break;
      case 'update':
        message.success(
          stringWithVariables(messages?.success[type], initialValues) || 'editado de forma exitosa'
        );
        break;
      case 'remove':
        message.success(
          stringWithVariables(messages?.success[type], initialValues)
            || 'eliminado de forma exitosa'
        );
        break;
      default:
        break;
    }
    await goBack();
  }

  /**
   * Función para desplegar un mensaje de error según la acción indicada
   * @name onError
   * @function
   *
   * @param {String} type - Tipo de acción ejecutada.
   */

 

  /**
   * Función para ejecutar un POST o PUT de la información del formulario
   * dependiendo de si es edición o creación de un registro.
   * @name submitElement
   * @function
   *
   * @param {Object} value - Objeto de valores del formulario.
   */
  async function submitElement(value: any, object: any) {
    showLoading('Guardando...');
    console.log('Valores enviados a submitElement:', value, object);
    try {
      await updateRoute(id, value, object); // Llamar a la función `updateRoute` para guardar los cambios
      message.success('Registro actualizado con éxito.');
      goBack();
    } catch (error) {
      console.error('Error al guardar los cambios:', error);
      message.error('Error al guardar los cambios.');
    } finally {
      hideLoading();
    }
  }

  /**
   * Función que despliega un modal de confirmación para la eliminación
   * de algún elemento.
   * @name deleteElement
   * @function
   */
  async function deleteElement() {
    Modal.confirm({
      title:
        stringWithVariables(messages?.deletePrompt?.title, initialValues) || 'Eliminar elemento',
      icon: '',
      content:
        stringWithVariables(messages?.deletePrompt?.confirm, initialValues)
        || '¿Estás seguro de que deseas eliminar el elemento?',
      onOk: async () => {
        showLoading('Eliminando...');
        try {
          // Llamar a la función DeleteRoute con el id y el idcliente
          const response = await DeleteRoute(id, settings?.idcliente);
  
          if (response?.statusCode === 200) {
            const apiMessage = response.body?.message || 'Elemento eliminado con éxito.';
            message.success(apiMessage); // Mostrar el mensaje de la API
            await onSuccess('remove'); // Navegar a la vista anterior
            goBack();
          } else {
            const errorMessage = response?.body?.message || 'Error al eliminar el elemento.';
            message.error(errorMessage); // Mostrar mensaje de error de la API o genérico
          }
        } catch (error) {
          console.error('Error al eliminar el elemento:', error);
          message.error('Error al eliminar el elemento.'); // Mensaje genérico en caso de error
        } finally {
          hideLoading();
        }
      },
      onCancel() {
        // Opcional: lógica adicional si se cancela la acción
      },
    });
  }

    //console.log('settings.fieldset:', settings?.fieldset);
  //console.log('disabledSave:', disabledSave);
  //console.log('settings.disabledSave:', settings?.disabledSave);

  //console.log('settings.fieldset:', settings.fieldset);
  /*console.log('fieldset length:', settings?.fieldset?.length);
  console.log('disabledSave:', settings?.disabledSave);

  console.log('Estado del botón:', {
    fieldsetLength: settings?.fieldset?.length,
    disabledSave: settings?.disabledSave,
    isDisabled: !settings?.fieldset?.length || !!settings?.disabledSave,
  });*/
  console.log('Longitud de settings.fieldset:', settings?.fieldset?.length);

  return (
    <Form
    settings={{
      enableReinitialize: true,
      validationSchema: settings?.validationSchema,
      initialValues: settings?.form?.initialValues,
      onSubmit: (values, formikHelpers) => {
        console.log('Formulario enviado con valores:', values);
        handleOnSave(values, formikHelpers, goBack);
      },
      validateOnMount: true,
    }}
    {...formSettings}
    >
      <PageHeader
  title={settings?.title}
  subTitle={settings?.edition ? element?.name : null}
  onBack={() => goBack()}
  backIcon={<ArrowLeftOutlined title="back-btn" />}
  style={{ paddingRight: '32px' }}
  extra={
    (edition && loading) || isError
      ? []
      : _.compact([
          settings?.edition && settings?.can?.delete ? (
            <Button
              danger
              shape="round"
              key="delete"
              type="primary"
              disabled={disabledSave || vehiclesInRoute?.length > 0} // Deshabilitar si hay vehículos vinculados
              style={{ marginRight: '0.5rem' }}
              onClick={() => deleteElement()}
            >
              Eliminar
            </Button>
          ) : null,
          <FormButton
            key="save"
            shape="round"
            aria-label="formElement-submitButton"
            disabled={
              !settings?.fieldset?.length || 
              !!settings?.disabledSave || 
              vehiclesInRoute?.length > 0 // Deshabilitar si hay vehículos vinculados
            }
          >
            Guardar
          </FormButton>
        ])
  }
/>
      <Layout.Content style={{ padding: '0px 32px' }}>
        {loading ? (
          <Skeleton active />
        ) : settings?.fieldset?.length ? (
          settings?.fieldset?.map((r: any) => (
            <Row {...r.row} key={`row-${r.id}`}>
              {r.title ? (
                <Divider orientation="left" className="form_Divider">
                  <div style={{ alignItems: 'center', display: 'flex' }}>
                    {r.title}
                    {r.extraField ? (
                      <Tooltip title={r.help || ''} placement="top">
                        <div>
                          <GetContent
                            col={r.extraField}
                            settings={settings}
                            disabledSave={disabledSave}
                          />
                        </div>
                      </Tooltip>
                    ) : null}
                  </div>
                </Divider>
              ) : null}
              {r.cols.map((c: any) => (
                <Col {...c.col} key={`col-${c.id}`}>
                  <GetContent col={c} settings={settings} disabledSave={disabledSave} />
                </Col>
              ))}
            </Row>
          ))
        ) : (
          <Result
            status="500"
            title="En construcción"
            subTitle="Este módulo aún no ha sido implementado"
            extra={
              <Button type="primary" shape="round" onClick={() => goBack()}>
                Regresar
              </Button>
            }
          />
        )}
      </Layout.Content>
    </Form>
  );
}

export default FormElement;
