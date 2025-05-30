import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTable, useGlobalFilter } from 'react-table';
import { Table, Skeleton, Form, Input, Button } from 'antd';
import type { FormInstance } from 'antd/es/form';
import type { InputRef } from 'antd';
import { useApi } from '@/hooks/Api';
import CustomFilter from '@/components/elements/CustomTable/filter';
import { LeftOutlined, RightOutlined, SearchOutlined } from '@ant-design/icons';
import * as _ from 'underscore';

const EditableContext = React.createContext<FormInstance<any> | null >(null);

interface EditableRowProps {
  index: number
}

interface EditableCellProps {
  title: any,
  editable: boolean,
  children: React.ReactNode,
  dataIndex: string,
  record: any,
  handleSave: any
}

/**
 * Componente para que una row de la tabla pueda ser editable
 * @component
 *
 * @property {Number} index - Indice de la row a editar
 *
 * @returns {Component} - Componente para una row editable
 */
function EditableRow({ index, ...props }: EditableRowProps):React.ReactElement {
  const [form] = Form.useForm();

  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
}

/**
 * Componente para que la celda sea editable y poder manipularla
 * @component
 *
 * @property {ReactNode} title - Texto de lo que se esta editando
 * @property {Boolean} editable - Booleano para saber si es editable o no
 * @property {ReactNode} children - Nodo hijo a renderizar
 * @property {String} dataIndex - Index de la columna
 * @property {Object} record - Información de la celda, sus propiedades
 * @property {Function} handleSave - Función para guardar los cambios
 *
 * @returns {Component} - Componente de una celda de tabla editable
 */
function EditableCell({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}: EditableCellProps):React.ReactElement {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<InputRef>(null);
  const form = useContext(EditableContext)!;

  useEffect(() => {
    if (editing) {
      inputRef.current!.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({ ...record, ...values }, record);
    } catch (error) {
      // console.log('Save failed: ', error);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: typeof title === 'string'
              ? `${title} es requerido.`
              : `${title?.props?.children[0]} es requerido.`
          }
        ]}
      >
        <Input aria-label="inputEdit" ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div className="editable.cell-value-wrap" style={{ paddingRight: 24 }} onClick={toggleEdit}>
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
}

/**
 * Función para setear las propiedades de busqueda de una columna.
 * @name getColumnSearchProps
 * @function
 *
 * @param {Object} column - Objeto con las propiedades de una columna.
 *
 * @returns {Object} - Regresa un objeto con las propiedades de busqueda de una columna.
 */
function getColumnSearchProps(
  column: any,
  setFilteredByBack: any,
  setFilteredByDateTime: any,
  setPageI: any
) {
  return {
    filterDropdown: (filterProps: any) => (
      <CustomFilter
        {...filterProps}
        searchType={column.searchType}
        field={column.title}
        dataIndex={column.dataIndex}
        setPageI={setPageI}
        setFilteredByBack={setFilteredByBack}
        setFilteredByDateTime={setFilteredByDateTime}
      />
    ),
    filterIcon: (filtered: any) => (
      <SearchOutlined style={{ color: filtered ? '#000000' : undefined }} />
    ),
    onFilter: () => true,
  };
}

/**
 * Componente para crear una tabla personalizada.
 * @component
 *
 * @param {Object} props - Propiedades para la configuración de la tabla.
 *
 * @returns {Component} - Regresa una tabla completamente personalizada, según la
 * configuración que se le haga llegar.
 */
function CustomTable(props: any) {
  const {
    source,
    pagination,
    columns: tableColumns,
    locale,
    onSaveEditCell,
    refetchData,
    style
  } = props;

  const { get } = useApi();
  const [tableData, setTableData] = useState([]);
  const [init, setInit] = useState(false);
  const [pageCount, setPageCount] = useState(-1);
  const [pageI, setPageI] = useState(0);
  const [lastEvaluatedKeys, setLastEvaluatedKeys]: any = useState({
    0: {}
  });
  const [filteredByBack, setFilteredByBack] = useState('');
  const [filteredByDateTime, setFilteredByDateTime] = useState('');

  /**
   * @const {Array} columns - Array de columnas que se crear a partir de nuestra property
   * "tableColumns", se aplica un compact para que solo queden elementos "truty" en el array
   * y todo esto se hace en un useMemo para evitar el re-renderizado si no a cambiado la property
   * "tableColumns".
   */
  const columns = useMemo(
    () =>
      _.compact(
        tableColumns.map((column: any) => {
          if (column.hidden) {
            return null;
          }
          if (column.search) {
            return {
              ...column,
              ...getColumnSearchProps(column, setFilteredByBack, setFilteredByDateTime, setPageI),
              accessor: column.key || column.dataIndex
            };
          }
          if (column.editable) {
            return {
              ...column,
              accessor: column.key || column.dataIndex,
              onCell: (record: any) => ({
                record,
                editable: column.editable,
                dataIndex: column.dataIndex,
                title: column.title,
                handleSave: onSaveEditCell
              }),
            };
          }
          return { ...column, accessor: column.key || column.dataIndex };
        })
      ),
    [tableColumns]
  );

  /**
   * @const {Object} instance - Objeto que se crea a partir de un hook "useTable" el cual sirve para
   * crear una tabla a partir de las columnas y la data que se le manden como parametros.
   */
  const instance = useTable(
    {
      columns, // Columnas
      getRowId: (row: any) => row[source.id], // Id de la fila
      data: tableData, // Data de la tabla
      initialState: { // Objeto con el estado inicial de la tabla
        pageIndex: 0, // Página actual de la tabla "Paginación"
        pageSize: source.maxResults, // Maximo de elementos por página
      },
      manualPagination: true, // Indica si la paginacion será manual.
      pageCount, // Páginas totales.
      manualGlobalFilter: pagination, // Indica la posición del paginado
    } as any,
    useGlobalFilter
  );

  /**
   * Se desestructuran las siguientes variables de nuestro objeto instance.
   */
  const {
    rows, // Filas de la tabla
    // setGlobalFilter,
    state, // Estado de la tabla
  } = instance as any;

  /**
   * Se hace un query GET para obtener la data y algunas otras variables mas,
   * de este get tambien se obtiene la propiedad "isLoading" para saber si
   * sigue cargando y la función "refetch" para ejecutar nuevamente el query.
   */
  const { isLoading, isFetching, refetch } = get(
    ['table', source.key, pageI],
    source.url,
    {
      ...source?.extraParams,
      routeStatus: source?.extraParams?.routeStatus || filteredByBack,
      dateTime: filteredByDateTime || source?.extraParams?.dateTime,
      pagination: Object.keys(lastEvaluatedKeys[pageI]).length // Manejo de la paginación
        ? JSON.stringify(lastEvaluatedKeys[pageI]) : undefined // Por medio de dynamoDB
    },
    {
      onSuccess: (data: any) => {
        // Se verifica que si hay pagina siguiente
        if (data.LastEvaluatedKey && Object.keys(data?.LastEvaluatedKey).length) {
          setLastEvaluatedKeys((prevVal:any) => ({
            ...prevVal,
            [pageI + 1]: data.LastEvaluatedKey
          }));
        }
        setPageCount(Math.ceil(data.Count / source.maxResults));
        setTableData(data?.Items?.map((content: any, i: number) => ({
          ...content,
          ID: i
        })) || []);
        setInit(true);
      },
      onError: () => {
        setTableData([]);
        setInit(true);
      },
      ...source?.options,
    }
  );

  /**
   * Función para obtener lo que se mostrará en el footer de la tabla.
   * @name getFooter
   * @component
   *
   * @returns - Botones personalizados para manejar el paginado de la tabla.
   */
  function getFooter() {
    if (init) {
      return (
        <div
          aria-label="customTable-footer"
          style={{ display: 'flex', justifyContent: 'right' }}
        >
          <Button
            type="primary"
            icon={<LeftOutlined />}
            style={{ marginRight: '0.5rem' }}
            disabled={!Object.keys(lastEvaluatedKeys).includes((pageI - 1).toString())}
            onClick={() => setPageI((preVal: number) => preVal - 1)}
          />
          <Button
            type="primary"
            icon={<RightOutlined />}
            disabled={!Object.keys(lastEvaluatedKeys).includes((pageI + 1).toString())}
            onClick={() => setPageI((preVal: number) => preVal + 1)}
          />
        </div>
      );
    }
      return 'Cargando...';
  }

  /**
   * @const {Object} components - Objeto de componentes para mandarselos de properties
   * a la tabla a crear.
   */
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell
    }
  };

  /**
   * Cada que cambien la url se resetea la paginación y el indice de pagina
   */
  useEffect(() => {
    setPageI(0);
    setLastEvaluatedKeys({ 0: {} });
  }, [source.url]);

  /**
   * Cada que cambien algun filtro se resetea la paginación, el indice de pagina
   * y se refreca la data
   */
  useEffect(() => {
    setPageI(0);
    setLastEvaluatedKeys({ 0: {} });
    refetch();
  }, [filteredByBack, filteredByDateTime, source.extraParams.dateTime]);

  /**
   * useEffect para ejecutar nuevamente el query GET si cambia la
   * variable "globalFilter", "refetchData", "pageI".
   */
  useEffect(() => {
    refetch();
  }, [state.globalFilter, refetchData, pageI]);

  return (
    <Table
      {...props}
      columns={columns}
      style={{ marginTop: '15px', ...style }}
      header
      locale={{
          ...locale,
          emptyText: !init ? (
            <Skeleton active title={false} paragraph={{ rows: 5, width: '100%' }} />
          ) : (
            locale?.emptyText
          ),
        }}
      rowKey={source.id}
      components={components}
      rowClassName={() => 'editable-row'}
        // onChange={tableChange}
      footer={() => getFooter()}
      loading={isLoading || (isFetching && source.url !== 'vehicle')}
      dataSource={rows.map((row: any) => row.original)}
    />
  );
}
export default CustomTable;
