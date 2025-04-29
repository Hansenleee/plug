import React, { useCallback, useMemo, useState } from 'react';
import { Table, Space, message } from 'antd';
import axios from 'axios';
import { useMount } from 'ahooks';
import { Search } from './search';
import { AddUpdate } from './add-update';
import { AddProject } from './add-project';
import { Setting } from './setting';
import { getColumns } from './columns';
import { ProjectList } from './project-list';
import { DataEditor } from './data-editor';
import './style.scss';

export default function YapiMock() {
  const [addVisible, setAddVisible] = useState(false);
  const [activeProject, setActiveProject] = useState<Record<string, string> | undefined>(undefined);
  const [projectVisible, setProjectVisible] = useState(false);
  const [settingVisible, setSettingVisible] = useState(false);
  const [projectListVisible, setProjectListVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiList, setApiList] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [page, setPage] = useState({ current: 1, pageSize: 15, total: 0 });
  const [searchValue, setSearchValue] = useState({ name: '', project: undefined });
  const [editDataItem, setEditDataItem] = useState<Record<string, string> | undefined>(undefined);

  const searchByPage = useCallback(
    (pageNo = 1) => {
      setLoading(true);
      return axios
        .post('/api/mock/interface/list/page', {
          ...searchValue,
          page: { pageNo, pageSize: page.pageSize },
        })
        .then((result: any) => {
          setApiList(result.data);
          setPage(result.page);
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [page.pageSize, searchValue]
  );

  const handleEditMock = (record: Record<string, string>) => {
    setEditDataItem(record);
  };

  const fetchProjectList = () => {
    return axios.get('/api/mock/project/list').then((list: any) => setProjectList(list));
  };

  const columns = useMemo(
    () => getColumns({ onRefresh: searchByPage, onEdit: handleEditMock }),
    [searchByPage]
  );

  const checkInitConfig = () => {
    return axios.get('/api/mock/common/config').then((initSetting: any) => {
      if (!initSetting?.host) {
        message.warning('请先配置 yapi 配置');
        setSettingVisible(true);

        return false;
      }

      return true;
    });
  };

  const handleAdded = () => {
    searchByPage();
    setAddVisible(false);
    setProjectVisible(false);
    fetchProjectList();
  };

  const handleCloseProject = () => {
    setProjectVisible(false);
    setActiveProject(undefined);
  };

  const handleEditProject = (project: Record<string, string>) => {
    setActiveProject(project);
    setProjectVisible(true);
  };

  const handleRefresh = () => {
    searchByPage();
    fetchProjectList();
  };

  const handleSaveDataEdit = () => {
    setEditDataItem(undefined);
    searchByPage();
  };

  useMount(() => {
    return checkInitConfig().then((inited) => {
      if (inited) {
        handleRefresh();
      }
    });
  });

  return (
    <Space direction="vertical" style={{ paddingBottom: 20 }}>
      <Search
        projectList={projectList}
        searchValue={searchValue}
        onSearch={searchByPage}
        onSearchValueChange={(map) => setSearchValue((pre) => ({ ...pre, ...map }))}
        onAdd={() => setAddVisible(true)}
        onSetting={() => setSettingVisible(true)}
        onProjectManage={() => setProjectListVisible(true)}
      />
      <Table
        className="mock-table-list"
        bordered
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={apiList}
        pagination={{
          ...page,
          showTotal: (total) => `共 ${total} 条`,
          showSizeChanger: false,
          onChange: searchByPage,
        }}
        scroll={{ x: '100%' }}
        sticky={{ offsetHeader: -10 }}
        size="middle"
      />
      <AddUpdate open={addVisible} onClose={() => setAddVisible(false)} onOk={handleAdded} />
      <AddProject
        open={projectVisible}
        project={activeProject}
        onClose={handleCloseProject}
        onOk={handleAdded}
      />
      <Setting open={settingVisible} onClose={() => setSettingVisible(false)} />
      <ProjectList
        visible={projectListVisible}
        projectList={projectList}
        onClose={() => setProjectListVisible(false)}
        onEdit={handleEditProject}
        onRefresh={handleRefresh}
        onAddProject={() => setProjectVisible(true)}
      />
      <DataEditor
        visible={!!editDataItem}
        record={editDataItem}
        onClose={() => setEditDataItem(undefined)}
        onSave={handleSaveDataEdit}
      />
    </Space>
  );
}
