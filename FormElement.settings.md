## FormElement

### En el siguiente documento se especifican las configuraciones
### que puede recibir el componente de **FormElement**

***El componente recibe un objeto de configuraciones que se compone***
***de las siguientes propiedades:*** 

**Indica el id del elemento a mostrar, se utiliza para las queries que necesitan en su path un id *"Propiedad de nostros (Para uso en react-query)"***
```
id: '456'
```
**Dirección path a donde nos redirigiremos cuando el usuario navege para atras *"Propiedad de nosotros"***
```
back: '/config/exmaple/'
```
**Titulo para el header del componente *"Propiedad de antd"***
```
title: 'Example1'
```
**Indica que se esta editando un registro *"Propiedad de nosotros"***
```
edition: true,
```
**Objeto con los permisos de cosas que puede hacer el usuario**
- **delete**: Indica si puede eliminar el registro actual *"Propiedad de nosotros"*
```
can: { 
        delete: true, 
    },
```
**En este ejemplo a excepción de initialValues y disabledFields todas son propiedades para el Formulario de formik-antd**
- **initialValues**: Valores iniciales para formik y para usarlos a manera de remplazo en mensajes personalizados *"Propiedad de nostros (Para uso en formik y propio)"*
- **disabledFields**: Campos los cuales estaran deshabilitados 
*"Propiedad de nosotros (Para uso en formik-antd)"*
```
form: { 
      className: 'user-form',
      layout: 'vertical',
      name: 'newUser',
      initialValues: { superuser: false }, 
      requiredMark: false,
      disabledFields: ['imei', 'name'] 
    }
```
**Objeto el cual contiene todos los mensajes que puede mostrar la vista**
```
messages: vehicleMessages
```
**Objeto Schema hecho en yup para validar campos mediante formik *"Propiedad de Yup & Formik"***
```
validationSchema: vehicleSchema
```
**Objeto para hacer peticiones *"Propiedad de nosotros (Para uso en react-query)"***
- **url**: Para completar la ruta a la cual se hará la petición 
*"Propiedad de nostros (Para uso en react-query)"*
- **key**: Se utiliza para hacer una key compuesta para distinguir la cache que genera react-query 
*"Propiedad de nostros (Para uso en react-query)"*
- **options**: Opciones que se agregan a la petición como side-effects en react-query 
*"Propiedad de nostros (Para uso en react-query)"*
- **extraParams**: Parametros que se agregan a la petición de react-query
*"Propiedad de nostros (Para uso en react-query)"*
```
source: { 
      url: 'vehicles', 
      key: 'vehicles', 
      options: {}, 
      extraParams: {} 
    },
```
**Arreglo para generar los campos del formulario *"Propiedad de nostros (Para uso en antd & formik)"***
```
fieldset: vehicleFields
```
**Arreglo de campos *donde cada objeto representa un renglon o fila en la UI***
- **row**: Propiedades de antd para el componente [Row](https://ant.design/components/grid/#Row).
- **title**: Titulo para mostrarlo arriba de un "renglon" de campos, como si fuera una sección 
*"Propiedades de nosotros"*.
- **cols**: Arreglo de objetos, donde cada objeto viene siendo un campo
- **col**: Propiedades de antd para el componente [Col](https://ant.design/components/grid/#Col).
- **input**: Objeto con las propiedades necesarias para el componente Input de *"Propiedad de formik-antd"*.
- **item**: Objeto con las propiedades necesarias para el componente Form.Item de *"Propiedad de formik-antd"*\
***En este caso es importante revisar muy bien el ejemplo, dado que se puede tener diferentes tipos de campos y se requieren propiedades diferentes para cada tipo.***\
***Hay algunos comentarios en el codigo para ayudar.***
```
const vehicleFields = [
    { 
      row: { gutter: [25, 0] }, 
      title: "FakeTitle", 
      cols: [ 
        {
          col: { xl: 8, md: 8, sm: 8, xs: 8 }, 
          input: { 
            name: 'number',
            type: 'text',
            id: 'number',
            placeholder: 'Ej. 123',
          },
          item: { 
            label: 'Número de unidad',
            name: 'number',
            htmlFor: 'number',
            type: 'input',
            tooltip: 'Puedes solicitar este dato al personal de easytrack',
          },
        },
        {
          col: { xl: 8, md: 8, sm: 8, xs: 8 },
          button: { // Propiedades de antd, para el componente Button
            onClick: () => {}, 
          }, 
          item: { // Propiedad de nosotros para saber el tipo y agregar el texto del boton
            content: "fakeButton", // texto del botón
            type: 'button',
          },
        },
        {
          col: { xl: 8, md: 8, sm: 8, xs: 8, gutter: [10, 0] },
          input: {  // Objeto con las propiedades necesarias para el componente Switch de "Propiedad de formik-antd"
            name: 'plate',
          },
          item: { // Objeto con las propiedades necesarias para el componente Form.Item de "Propiedad de formik-antd"
            label: 'Matrícula',
            name: 'plate',
            htmlFor: 'plate',
            type: 'switch',
          },
        },
      ],
    },
    {
      row: { gutter: [25, 0] },
      cols: [
        {
          col: { xl: 8, md: 8, sm: 8, xs: 8, gutter: [10, 0] },
          input: { // Objeto con las propiedades necesarias para el componente Select de "Propiedad de formik-antd"
            name: 'imei',
            type: 'text',
            id: 'imei',
            placeholder: 'Ej. 2342342332',
          },
          item: { // Objeto con las propiedades necesarias para el componente Form.Item de "Propiedad de formik-antd"
            label: 'IMEI',
            name: 'imei',
            htmlFor: 'imei',
            type: 'select',
          },
        },
        { // Esto es cuando es un componente custom, no tengo ejemplos por el momento.
            col: { xl: 8, md: 8, sm: 8, xs: 8, gutter: [10, 0] },
            custom: { 
              content: ''
            },
            item: { 
              type: 'custom',
            },
          },
      ],
    },
];
```