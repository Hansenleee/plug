import React, { useMemo } from 'react';
import { Space, Input, Button, Select, Dropdown } from 'antd';
import { PlusOutlined, SettingOutlined, SearchOutlined, DownOutlined, ProjectOutlined } from '@ant-design/icons';

interface Props {
  searchValue: Record<string, any>;
  projectList: Array<Record<string, string>>;
  onAdd: () => void;
  onSearchValueChange: (value: object) => void;
  onAddProject: () => void;
  onProjectManage: () => void;
  onSetting: () => void;
  onSearch: () => void;
}

const DropdownMenu = [
  {
    label: '接口',
    key: 'interface',
  },
  {
    label: '项目',
    key: 'project',
  }
];

export const Search: React.FC<Props> = (props) => {
  const projectOptions = useMemo(() => {
    return props.projectList?.map((item) => ({
      label: item.projectName,
      value: item.id,
    }));
  }, [props.projectList]);

  const handleAdd = (value: any) => {
    if (value.key === 'project') {
      return props.onAddProject();
    }

    return props.onAdd();
  };

  return (
    <Space style={{ marginBottom: 20 }}>
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
      <Button
        type="primary"
        icon={<SearchOutlined />}
        onClick={() => props.onSearch()}
      >
        搜索
      </Button>
      <Dropdown menu={{ items: DropdownMenu, onClick: handleAdd}}>
        <Button type="primary" icon={<PlusOutlined />}>
          添加 <DownOutlined />
        </Button>
      </Dropdown>
      <Button icon={<ProjectOutlined />} size="middle" onClick={props.onProjectManage}>
        项目管理
      </Button>
      <Button icon={<SettingOutlined />} size="middle" onClick={props.onSetting}>
        yapi 配置
      </Button>
    </Space>
  );
};
