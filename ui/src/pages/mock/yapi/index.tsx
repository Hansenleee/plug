import React, { useCallback, useMemo, useState } from 'react';
import { Typography, Table, Space, message } from 'antd';
import axios from 'axios';
import { useMount } from 'ahooks';
import { Search } from './search';
import { AddUpdate } from './add-update';
import { Setting } from './setting';
import { getColumns } from './columns';

export default function YapiMock() {
  const [addVisible, setAddVisible] = useState(false);
  const [settingVisible, setSettingVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiList, setApiList] = useState([]);
  const [page, setPage] = useState({ current: 1, pageSize: 15, total: 0 });

  const searchByPage = useCallback(
    (pageNo = 1) => {
      return axios
        .post('/api/mock/yapi/list/page', {
          apiType: 'yapi',
          page: { pageNo, pageSize: page.pageSize },
        })
        .then((result: any) => {
          setApiList(result.data);
          setPage(result.page);
        });
    },
    [page.pageSize]
  );

  const columns = useMemo(() => getColumns({ onRefresh: searchByPage }), [searchByPage]);

  const checkInitConfig = () => {
    setLoading(true);
    return axios
      .get('/api/mock/yapi/config')
      .then((initSetting: any) => {
        if (!initSetting?.host) {
          message.warning('请先配置 yapi 配置');
          setSettingVisible(true);

          return false;
        }

        return true;
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useMount(() => {
    return checkInitConfig().then((inited) => {
      if (inited) {
        searchByPage();
      }
    });
  });

  return (
    <Space direction="vertical">
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        Mock - Yapi 配置
      </Typography.Title>
      <Search onAdd={() => setAddVisible(true)} onSetting={() => setSettingVisible(true)} />
      <Table
        bordered
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={apiList}
        pagination={page}
        scroll={{ x: '100%' }}
        sticky
      />
      <AddUpdate open={addVisible} onClose={() => setAddVisible(false)} onOk={() => {}} />
      <Setting open={settingVisible} onClose={() => setSettingVisible(false)} />
    </Space>
  );
}
