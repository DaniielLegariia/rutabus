import * as _ from 'underscore';

/**
 * Función para sustituir en una cadena de texto variables.
 * @name stringWithVariables
 * @function
 *
 * @param {String} string - Cadena de texto donde se sustituiran vairiables
 * @param {Object} data - Objeto de data donde encontramos las variables que tomarán lugar
 * en la cadena de texto
 *
 * @returns {String} - Cadena de texto ya sustituida por valores de data.
 */
function stringWithVariables(string: string, data: object): string {
  // data = object / data.name = "rutas"
  if (!string) {
    return string;
  }
  const matches = string.match(/\{.*?\}/g); // string = "No se encontro {Name} en la busqueda".
  /**
   * matches = ["{Name}"]
   */
  if (!matches || !matches.length) {
    return string;
  }
  // variables = [{ variable: "Name", full: "{Name}" }]
  const variables = _.uniq(matches).map((d) => ({
      variable: d.replace(/[\{\}']+/g, ''), // se eliminan las llaves = "Name"
      full: d
  }));

  for (const v of variables) {
    // .replace("{Name}", data[Name])
    string = string.replace(new RegExp(v.full, 'g'), data[v.variable]);
  }
  return string; // string = "No se encontro rutas en la busqueda".
}

export default stringWithVariables;
