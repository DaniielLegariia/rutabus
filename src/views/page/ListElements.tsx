import React from 'react';
import { Button, ConfigProvider, Empty, Layout } from 'antd';
import Link from 'next/link';
import SimpleTable from '@/components/elements/SimpleTable';
import PageHeader from '@/components/elements/PageHeader';

/**
 * Vista o componente generico para mostrar un listado de items, dependiendo
 * de la configuración que se le mande.
 *
 * @view
 *
 * @param {Object} settings - Objeto con las configuraciones para construir
 * el componente.
 */
function ListElements({ settings }: { settings: any }) {
  return (
    <>
      <PageHeader
        title={settings.title}
        extra={settings.extras.map((extra: any) => (
          <div key={extra.key}>
            {
              extra.link ? (
                <Link href={extra.link} key={extra.key}>
                  <Button aria-label="listElement-addButton" {...extra.button}>{extra?.text}</Button>
                </Link>
              ) : (
                <Button key={extra.key} aria-label="listElement-addButton" {...extra.button}>{extra?.text}</Button>
              )
            }
          </div>
        ))}
      />
      <Layout.Content>
        <ConfigProvider
          renderEmpty={() => (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={`No hay ${settings?.title?.toLowerCase()} para mostrar`}
            />
          )}
        >
          <SimpleTable dataSource={settings.table.dataSource} columns={settings.table.columns} {...settings.table} />
        </ConfigProvider>
      </Layout.Content>
    </>
  );
}
export default ListElements;