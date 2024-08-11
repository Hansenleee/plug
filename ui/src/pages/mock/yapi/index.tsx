import React, { useCallback, useMemo, useState } from 'react';
import { Typography, Table, Space, message } from 'antd';
import axios from 'axios';
import { useMount } from 'ahooks';
import { Search } from './search';
import { AddUpdate } from './add-update';
import { AddProject } from './add-project';
import { Setting } from './setting';
import { getColumns } from './columns';

export default function YapiMock() {
  const [addVisible, setAddVisible] = useState(false);
  const [projectVisible, setProjectVisible] = useState(false);
  const [settingVisible, setSettingVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiList, setApiList] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [page, setPage] = useState({ current: 1, pageSize: 15, total: 0 });
  const [searchValue, setSearchValue] = useState({ name: '', project: undefined });

  const searchByPage = useCallback(
    (pageNo = 1) => {
      setLoading(true);
      return axios
        .post('/api/mock/yapi/list/page', {
          apiType: 'yapi',
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

  const fetchProjectList = () => {
    return axios.get('/api/mock/yapi/project/list').then((list: any) => setProjectList(list));
  };

  const columns = useMemo(() => getColumns({ onRefresh: searchByPage }), [searchByPage]);

  const checkInitConfig = () => {
    return axios.get('/api/mock/yapi/config').then((initSetting: any) => {
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
  };

  useMount(() => {
    return checkInitConfig().then((inited) => {
      if (inited) {
        searchByPage();
        fetchProjectList();
      }
    });
  });

  return (
    <Space direction="vertical">
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        Mock - Yapi 配置
      </Typography.Title>
      <Search
        projectList={projectList}
        searchValue={searchValue}
        onSearch={searchByPage}
        onSearchValueChange={(map) => setSearchValue((pre) => ({ ...pre, ...map }))}
        onAdd={() => setAddVisible(true)}
        onSetting={() => setSettingVisible(true)}
        onAddProject={() => setProjectVisible(true)}
      />
      <Table
        bordered
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={apiList}
        pagination={{
          ...page,
          showSizeChanger: false,
          onChange: searchByPage,
        }}
        scroll={{ x: '100%' }}
        sticky
      />
      <AddUpdate open={addVisible} onClose={() => setAddVisible(false)} onOk={handleAdded} />
      <AddProject
        open={projectVisible}
        onClose={() => setProjectVisible(false)}
        onOk={handleAdded}
      />
      <Setting open={settingVisible} onClose={() => setSettingVisible(false)} />
    </Space>
  );
}
