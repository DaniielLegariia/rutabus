import React from 'react';
import { Table } from 'antd';

const SimpleTable = ({ dataSource, columns, ...rest }: { dataSource: any[], columns: any[], [key: string]: any }) => {
  return (
    <Table dataSource={dataSource} columns={columns} {...rest} />
  );
};

export default SimpleTable;