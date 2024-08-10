import React from 'react';
import { Space, Input, Button } from 'antd';
import { PlusOutlined, SettingOutlined } from '@ant-design/icons';

interface Props {
  onAdd: () => void;
  onSetting: () => void;
}

export const Search: React.FC<Props> = (props) => {
  return (
    <Space style={{ marginBottom: 20 }}>
      <Input.Search
        placeholder="请输入接口地址或名称"
        onSearch={() => {}}
        size="large"
        style={{ width: 300 }}
      />
      <Button type="primary" icon={<PlusOutlined />} size="large" onClick={props.onAdd}>
        添加接口
      </Button>
      <Button type="primary" icon={<PlusOutlined />} size="large">
        添加项目
      </Button>
      <Button icon={<SettingOutlined />} size="large" onClick={props.onSetting}>
        yapi 配置
      </Button>
    </Space>
  );
};
