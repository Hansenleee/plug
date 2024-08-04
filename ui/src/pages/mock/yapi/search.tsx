import React from 'react';
import { Space, Input, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

interface Props {
  onAdd: () => void;
}

export const Search: React.FC<Props> = (props) => {
  return (
    <Space style={{ marginBottom: 20 }}>
      <Input.Search placeholder="" onSearch={() => {}} size="large" style={{ width: 300 }} />
      <Button type="primary" icon={<PlusOutlined />} size="large" onClick={props.onAdd}>
        添加接口
      </Button>
      <Button type="primary" icon={<PlusOutlined />} size="large">
        添加项目
      </Button>
    </Space>
  );
};
