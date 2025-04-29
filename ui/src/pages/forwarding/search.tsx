import React from 'react';
import { Space, Input, Button } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';

interface Props {
  searchValue: { name: string; url: string };
  onAdd: () => void;
  onSearchValueChange: (value: object) => void;
  onSearch: () => void;
}

export const Search: React.FC<Props> = (props) => {
  return (
    <Space style={{ marginBottom: 20, width: '100%', overflow: 'auto' }}>
      <Input
        placeholder="请输入转发名称"
        value={props.searchValue.name}
        allowClear
        onChange={(event) => props.onSearchValueChange({ name: event.target.value })}
        style={{ width: 300 }}
      />
      <Input
        placeholder="请输入 url 地址"
        value={props.searchValue.url}
        allowClear
        onChange={(event) => props.onSearchValueChange({ url: event.target.value })}
        style={{ width: 300 }}
      />
      <Button type="primary" icon={<SearchOutlined />} onClick={() => props.onSearch()}>
        搜索
      </Button>
      <Button icon={<PlusOutlined />} onClick={props.onAdd}>
        添加转发规则
      </Button>
    </Space>
  );
};
