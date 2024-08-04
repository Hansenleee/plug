import React, { useState } from 'react';
import { Typography, Table, Space } from 'antd';
import { Search } from './search';
import { AddUpdate } from './add-update';

export default function YapiMock() {
  const [open, setOpen] = useState(false);

  return (
    <Space direction="vertical">
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        Mock - Yapi 配置
      </Typography.Title>
      <Search onAdd={() => setOpen(true)} />
      <Table bordered rowKey="id" columns={[]} dataSource={[]} scroll={{ x: '100%' }} sticky />
      <AddUpdate open={open} onClose={() => setOpen(false)} />
    </Space>
  );
}
