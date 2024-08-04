import React from 'react';
import { Typography, Table, Space } from 'antd';
import { Search } from './search';

export default function BaseMock() {
  return (
    <Space direction="vertical">
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        Mock - 基础配置
      </Typography.Title>
      <Search />
      <Table bordered rowKey="id" columns={[]} dataSource={[]} scroll={{ x: '100%' }} sticky />
    </Space>
  );
}
