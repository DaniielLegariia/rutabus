/* eslint-disable react/require-default-props */
import React from 'react';
import styles from './pageHeader.module.scss';

interface IPageHeader {
  title: string,
  className?: string,
  style?: object,
  extra?: React.ReactElement | null,
  onBack?: null | (() => void),
  backIcon?: React.ReactElement | null
}

/**
 * Componente que sustituye el PageHeader de ant design
 * @name PageHeader
 * @component
 *
 * @property {String} title - Titulo del Header
 * @property {String} className - Clase css para aplicar estilo al container del componente
 * @property {Object} style - Objeto para aplicar estilo al container del componente
 * @property {ReactElement} extra - Elemento react que se colocará en la parte derecha del header
 * @property {Function} onBack - Función a ejecutarse al dar click en la flecha de navegación
 * @property {ReactElement} backIcon - Icono a tomarse como señal de retorno en la navegación
 * @returns {ReactElement} - Regresa el header parecido al de antd.
 */
function PageHeader({
  title,
  className = '',
  style = {},
  extra = null,
  onBack = null,
  backIcon = null
}: IPageHeader):React.ReactElement {
  return (
    <div className={`${styles.pageHeader} ${className}`} style={style}>
      {onBack
      ? (
        <button
          type="button"
          onClick={onBack}
          className={styles.backButton}
          aria-label="Volver"
        >
          <span
            role="img"
            aria-label="close"
            className="anticon anticon-close"
          >
            {backIcon && backIcon}
          </span>
        </button>
      ) : null}
      <div className={styles.title}>
        <h2 className={styles.h2} title={title}>{title}</h2>
      </div>
      {extra && <div className="extra">{extra}</div>}
    </div>
  );
}

export default PageHeader;
