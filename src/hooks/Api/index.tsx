import { useQuery, useMutation } from 'react-query';
import { Auth } from 'aws-amplify';
import API from '@aws-amplify/api';

const ApiName = 'Rutabus';

/**
 * Configuración de nuestra "API(REST)"" de amplify.
 * Se le manda un objeto con las siguientes propiedades.
 *
 * @property {String} id - Es el ID de nuestra API de amazon.
 * @property {String} name - Es el nombre de nuestra API de amazon.
 * @property {String} endpoint - Es la URL de nuestra API de amazon.
 * @property {String} region - Region donde se encuentra nuestra API de amazon.
 * @property {Array} paths - Array de dirreciones, en este caso se coloca solo el slash "/"
 * ya que es nuestra url base.
 * @property {Function} custom_header - Función con la cual customizamos los headers en este caso
 * para que el header Authorization mande el token.
 */
API.configure({
  endpoints: [
    {
      id: process.env.NEXT_PUBLIC_API_ID,
      name: ApiName,
      endpoint: process.env.NEXT_PUBLIC_API_URL,
      region: process.env.NEXT_PUBLIC_API_REGION,
      paths: ['/'],
      custom_header: async () => {
        try {
          const session = await Auth.currentSession();
          return session
            ? {
                Authorization: session.getIdToken().getJwtToken(),
              }
            : {};
        } catch (error) {
          return {};
        }
      },
    },
  ],
});

/**
 * Función para ejecutar una llamada tipo GET, para esto se utiliza la libreria "react-query"
 * @name get
 * @function
 *
 * @param {String} key - Key con la cual será guardada nuestra información en la cache.
 * @param {String} path - La ruta de la petición.
 * @param {Object} params - Son los parametros que le puedes pasar al endpoint.
 * @param {Object} options - Algunas configuraciones extra que le puedes mandar al hook useQuery.
 *
 * @returns {Object} - Regresa un objeto con la propiedad data y algunas propiedades extra
 * que son integradas por "react-query" como pueden ser "isLoading", "isError", etc.
 */
const get = (key: string | any[], path: string, params = {}, options = {}) =>
  useQuery(
    key,
    () =>
      API.get(ApiName, ``, {
        queryStringParameters: params,
      }),
    {
      retry: 3,
      ...options,
    }
  );

/**
 * Función para ejecutar una llamada tipo PUT, para esto se utiliza la libreria "react-query"
 * @name put
 * @function
 *
 * @param {String} path - La ruta de la petición.
 * @param {Object} options - Algunas configuraciones extra que le puedes mandar al hook useMutation.
 * @param {Object} params - Son los parametros que le puedes pasar al endpoint.
 *
 * @returns {Array} - Regresa un array donde la primera posición del array es la función que se debe
 * llamar para poder utilizar está función y la segunda posición es un objeto con información como
 * "isLoading", "isError", etc.
 */
const put = <T, >(path: string, options = {}, params = {}) =>
  useMutation<T, unknown, any>(
    (body: any) =>
      API.put(ApiName, `/${path}`, {
        body,
        queryStringParameters: params,
      }),
    {
      ...options,
    }
  );

/**
 * Función para ejecutar una llamada tipo POST, para esto se utiliza la libreria "react-query"
 * @name post
 * @function
 *
 * @param {String} path - La ruta de la petición.
 * @param {Object} options - Algunas configuraciones extra que le puedes mandar al hook useMutation.
 *
 * @returns {Array} - Regresa un array donde la primera posición del array es la función que se debe
 * llamar para poder utilizar está función y la segunda posición es un objeto con información como
 * "isLoading", "isError", etc.
 */
const post = (path: string, options = {}) =>
  useMutation(
    (params: any) =>
      API.post(ApiName, `/${path}`, {
        body: params,
      }),
    {
      ...options,
    }
  );

/**
 * Función para ejecutar una llamada tipo DELETE, para esto se utiliza la libreria "react-query"
 * @name del
 * @function
 * @param {String} path - La ruta de la petición.
 * @param {Object} options - Algunas configuraciones extra que le puedes mandar al hook useMutation.
 *
 * @returns {Array} - Regresa un array donde la primera posición del array es la función que se debe
 * llamar para poder utilizar está función y la segunda posición es un objeto con información como
 * "isLoading", "isError", etc.
 */
const del = (path: string, options = {}) =>
  useMutation(
    (params: any = {}) =>
      API.del(ApiName, `/${path}`, {
        body: params,
      }),
    {
      ...options,
    }
  );

  const fetchUnits = async (idusu: string, idcliente: string) => {
    try {
      const response = await API.get(ApiName, `/get/units/rutabus`, {
        queryStringParameters: {
          idusu,
          idcliente,
        },
      });
      return response.data || [];
    } catch (error) {
      console.error('Error al obtener las unidades:', error);
      throw error;
    }
  };

  
export const Api = {
  get,
  put,
  post,
  del,
  fetchUnits
};

/**
 * Custom hook para el uso de nuestra Api.
 * @hook
 *
 */
export const useApi = () => Api;
