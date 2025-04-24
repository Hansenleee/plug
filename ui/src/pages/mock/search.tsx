import React, { useMemo } from 'react';
import { Space, Input, Button, Select } from 'antd';
import { PlusOutlined, SettingOutlined, SearchOutlined, ProjectOutlined } from '@ant-design/icons';

interface Props {
  searchValue: Record<string, any>;
  projectList: Array<Record<string, string>>;
  onAdd: () => void;
  onSearchValueChange: (value: object) => void;
  onProjectManage: () => void;
  onSetting: () => void;
  onSearch: () => void;
}

export const Search: React.FC<Props> = (props) => {
  const projectOptions = useMemo(() => {
    return props.projectList?.map((item) => ({
      label: item.projectName,
      value: item.id,
    }));
  }, [props.projectList]);

  return (
    <Space style={{ marginBottom: 20, width: '100%', overflow: 'auto' }}>
      <Input
        placeholder="请输入接口地址或名称"
        value={props.searchValue.name}
        allowClear
        onChange={(event) => props.onSearchValueChange({ name: event.target.value })}
        style={{ width: 300 }}
      />
      <Select
        placeholder="请选择项目"
        options={projectOptions}
        value={props.searchValue.project}
        onChange={(value) => props.onSearchValueChange({ project: value })}
        allowClear
        style={{ width: 300 }}
      />
      <Button type="primary" icon={<SearchOutlined />} onClick={() => props.onSearch()}>
        搜索
      </Button>
      <Button icon={<PlusOutlined />} onClick={props.onAdd}>
        添加接口
      </Button>
      <Button icon={<ProjectOutlined />} size="middle" onClick={props.onProjectManage}>
        项目管理
      </Button>
      <Button icon={<SettingOutlined />} size="middle" onClick={props.onSetting}>
        基础配置
      </Button>
    </Space>
  );
};
