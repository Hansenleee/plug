import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Space, Input, Button, Table } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import { getColumns } from './columns';
import { AddUpdate } from './add-update';

interface Props {
  checked?: boolean;
}

export const InterfaceTab: React.FC<Props> = (props) => {
  const [addVisible, setAddVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiList, setApiList] = useState([]);
  const [page, setPage] = useState({ current: 1, pageSize: 15, total: 0 });

  const searchByPage = useCallback(
    (pageNo = 1) => {
      setLoading(true);
      return axios
        .post('/api/mock/yapi/list/page', {
          apiType: 'yapi',
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
    [page.pageSize]
  );

  const columns = useMemo(() => getColumns({ onRefresh: searchByPage }), [searchByPage]);

  useEffect(() => {
    if (props.checked) {
      searchByPage();
    }
  }, [props.checked, searchByPage]);

  return (
    <>
      <Space style={{ marginBottom: 20 }}>
        <Input.Search
          placeholder="请输入接口地址或名称"
          onSearch={() => {}}
          size="large"
          style={{ width: 300 }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => setAddVisible(true)}
        >
          添加接口
        </Button>
      </Space>
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
    </>
  );
};
