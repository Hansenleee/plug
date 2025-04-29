import { Table, Space } from 'antd';
import { useMount } from 'ahooks';
import React, { useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import { Search } from './search';
import { getColumns } from './columns';
import { ProxyDetail } from './proxy-detail';
import './style.scss';

export default () => {
  const [searchValue, setSearchValue] = useState({ name: '', url: '' });
  const [loading, setLoading] = useState(false);
  const [proxyList, setProxyList] = useState([]);
  const [page, setPage] = useState({ current: 1, pageSize: 15, total: 0 });
  const [proxyDetail, setProxyDetail] = useState<{
    visible: boolean;
    detail?: Record<string, any>;
  }>({ visible: false });

  const columns = useMemo(() => getColumns({}), []);

  const searchByPage = useCallback(
    (pageNo = 1) => {
      setLoading(true);
      return axios
        .post('/api/proxy/list/page', {
          ...searchValue,
          page: { pageNo, pageSize: page.pageSize },
        })
        .then((result: any) => {
          setProxyList(result.data);
          setPage(result.page);
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [page.pageSize, searchValue]
  );

  useMount(() => {
    searchByPage();
  });

  return (
    <Space direction="vertical" style={{ paddingBottom: 20 }}>
      <Search
        searchValue={searchValue}
        onSearch={searchByPage}
        onSearchValueChange={(map) => setSearchValue((pre) => ({ ...pre, ...map }))}
        onAdd={() => setProxyDetail({ visible: true })}
      />
      <Table
        className="proxy-table-list"
        bordered
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={proxyList}
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
      <ProxyDetail
        {...proxyDetail}
        onSave={() => {}}
        onClose={() => setProxyDetail({ visible: false })}
      />
    </Space>
  );
};
