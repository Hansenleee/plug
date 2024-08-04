import React from 'react';
import { Space, Input, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

export const Search = () => {
  return (
    <Space style={{ marginBottom: 20 }}>
      <Input.Search placeholder="" onSearch={() => {}} size="large" style={{ width: 300 }} />
      <Button type="primary" icon={<PlusOutlined />} size="large">
        添加
      </Button>
    </Space>
  );
};
