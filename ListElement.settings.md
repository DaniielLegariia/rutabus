## ListElement

### En el siguiente documento se especifican las configuraciones
### que puede recibir el componente de **ListElement**

***El componente recibe un objeto de configuraciones que se compone***
***de las siguientes propiedades:*** 

**Titulo para el header del componente *"Propiedad de antd"***
```
title: 'Example1'
```
**Arreglo de objetos, con el cual podemos configurar algunos botones extras**
- **link**: Path al cual redirecciona el botón *"Propiedad de Next/Link"*.
- **text**: Texto del botón *"Propiedad de antd"*.
- **button**: Objeto de configuraciones de propiedades del botón, se puede agregar cualquier 
propiedad de antd [Button](https://ant.design/components/button/#API) *"Propiedades de antd"*
- **key**: Key para el Link, como es un array, cada componente debe tener 
su key unica *"Propiedad de Next/Link"*

```
extras: [ 
      {
        link: '/config/example/newExample/', 
        text: 'new', 
        button: { 
          type: 'primary', 
          danger: true, 
          shape: 'round', 
        },
        key: 'add', 
      },
    ],
```
**Objeto donde se encuentran configuraciones a usar en la creación de la tabla y la configuración de las peticiones**
- **url**: Para completar la ruta a la cual se hará la petición 
*"Propiedad de nostros (Para uso en react-query)"*.
- **key**: Se utiliza para hacer una key compuesta para distinguir la cache que genera react-query 
*"Propiedad de nostros (Para uso en react-query)"*.
- **maxResults**: Maximo de resultados mostrados por página 
*"Propiedad de nostros (Para uso en react-table & propio )"*.
- **id**: Se proporciona para darle un ID y key a cada row (De la data se toma el campo "name") 
*"Propiedad de nosotros (Para uso en react-table & antd)"*.
- **extraParams**: Parametros que se agregan a la petición de react-query 
*"Propiedad de nostros (Para uso en react-query)"*.
- **options**: Opciones que se agregan a la petición como side-effects en react-query 
*"Propiedad de nostros (Para uso en react-query)"*.
```
source: { 
      url: 'examples', 
      key: 'examples', 
      maxResults: 10, 
      id: 'name', 
      extraParams: {}, 
      options: { 
        retry: false,
      },
    }
```
**Propiedades directamente aplicables a la table, se puede agregar cualquier propiedad de antd [Table](https://ant.design/components/table/#API)**
- **pagination**: Objeto para indicar si queremos un paginador y en que posición lo queremos 
*"Propiedad de nosotros (Para uso en react-table)"*.
- **locale**: Objeto para agregar texto personalizado a algunos textos de la tabla "i18n" *"Propiedad de antd"*.
- **columns**: Arreglo de columnas que formaran parte de la tabla se puede agregar cualquier propiedad de antd [Column](https://ant.design/components/table/#Column) 
*"Propiedad de nosotros (Para uso en react-table & antd)"*.
- **search**: Booleano para saber si se agregar un filtro de busqueda en la columna 
*"Propiedad de nosotros (Para uso en antd)"*.
- **hidden**: Booleano para saber si se tiene que mostrar la columna *"Propiedad de nosotros"*
```
table: { 
    pagination: { position: ['bottomRight'] }, 
    locale: {}, 
    bordered: true, 
    showSorterTooltip: false, 
    columns: [ 
        {
          title: 'Número', 
          dataIndex: 'number', 
          search: false, 
          hidden: false, 
        },
        { 
          title: 'Estatus',
          fixed: 'right', 
          align: 'center', 
          dataIndex: 'status',
          search: false,
          render: (text) => { 
            const color = text === 'CONFIRMED' ? '#52c41a' : '#fe871a';
            return <Badge count={text} style={{ backgroundColor: color }} />;
          },
        },
    ]
}
```
