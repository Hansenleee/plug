import { Table, Space } from 'antd';
import { useMount } from 'ahooks';
import React, { useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import { Search } from './search';
import { getColumns } from './columns';
import { ForwardingDetail } from './forwarding-detail';

export default () => {
  const [searchValue, setSearchValue] = useState({ name: '', url: '' });
  const [loading, setLoading] = useState(false);
  const [forwardList, setForwardList] = useState([]);
  const [page, setPage] = useState({ current: 1, pageSize: 15, total: 0 });
  const [forwardDetail, setForwardDetail] = useState<{
    visible: boolean;
    detail?: Record<string, any>;
  }>({ visible: false });

  const handleEdit = (record: Record<string, any>) => {
    setForwardDetail({
      visible: true,
      detail: record,
    });
  };

  const columns = useMemo(
    () =>
      getColumns({
        onRefresh: () => searchByPage(),
        onEdit: handleEdit,
      }),
    []
  );

  const searchByPage = useCallback(
    (pageNo = 1) => {
      setLoading(true);
      return axios
        .post('/api/forward/list/page', {
          ...searchValue,
          page: { pageNo, pageSize: page.pageSize },
        })
        .then((result: any) => {
          setForwardList(result.data);
          setPage(result.page);
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [page.pageSize, searchValue]
  );

  const handleSave = () => {
    searchByPage();
    setForwardDetail({ visible: false });
  };

  useMount(() => {
    searchByPage();
  });

  return (
    <Space direction="vertical" style={{ paddingBottom: 20 }}>
      <Search
        searchValue={searchValue}
        onSearch={searchByPage}
        onSearchValueChange={(map) => setSearchValue((pre) => ({ ...pre, ...map }))}
        onAdd={() => setForwardDetail({ visible: true })}
      />
      <Table
        bordered
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={forwardList}
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
      <ForwardingDetail
        {...forwardDetail}
        onSave={handleSave}
        onClose={() => setForwardDetail({ visible: false })}
      />
    </Space>
  );
};
