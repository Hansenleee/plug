import { Badge, TableProps, Space, Typography, Popconfirm, Tooltip, Tag, Modal } from 'antd';
import { message } from 'antd/lib';
import axios from 'axios';

export const getColumns: (value: any) => TableProps['columns'] = ({ onRefresh, onEdit }) => [
  {
    title: 'path',
    dataIndex: 'path',
    width: 300,
    fixed: 'left',
    render: (value: string) => {
      return <Typography.Link>{value}</Typography.Link>;
    },
  },
  {
    title: 'title',
    dataIndex: 'title',
    width: 300,
  },
  {
    title: 'method',
    dataIndex: 'method',
    width: 90,
    render: (text) => {
      if (!text) {
        return <Tag color="#2db7f5">ALL</Tag>;
      }

      if (text === 'POST') {
        return <Tag color="#87d068">{text}</Tag>;
      }

      return <Tag color="#ecc853">{text}</Tag>;
    }
  },
  {
    title: '数据来源',
    dataIndex: 'dataType',
    width: 90,
    render: (value, record) => {
      if (value === 'url') {
        return (
          <Tooltip placement="top" title={record.mockUrl}>
            <Tag color="lime">yapi</Tag>
          </Tooltip>
        );
      }

      return <Tag color="red">自定义</Tag>;
    },
  },
  {
    title: '状态',
    dataIndex: 'enable',
    width: 90,
    render: (value) => {
      return value ? (
        <Badge status="success" text="已启用" />
      ) : (
        <Badge status="error" text="已禁用" />
      );
    },
  },
  {
    title: '操作',
    dataIndex: 'opt',
    width: 160,
    render: (_: any, record: any) => {
      const handleDelete = () => {
        return axios
          .post('/api/mock/yapi/delete', {
            id: record.id,
          })
          .then(() => {
            message.success('删除成功');
            onRefresh();
          });
      };

      const handleToggle = () => {
        return axios.post('/api/mock/yapi/status/toggle', {
          id: record.id,
        }).then(() => {
          message.success('操作成功');
          onRefresh();
        });
      };

      const handleSync = () => {
        Modal.confirm({
          title: '更新接口后会丢失之前改动的数据，是否确认更新？',
          onOk: () => {
            return axios.post('/api/mock/yapi/upgrade', {
              id: record.id,
            }).then(() => {
              message.success('更新成功');
              onRefresh();
            })
          }
        });
      };

      return (
        <Space>
          <Typography.Link onClick={() => onEdit(record)}>Mock</Typography.Link>
          {record.apiType === 'yapi' ? <Typography.Link onClick={handleSync}>更新</Typography.Link> : null}
          {record.enable ? (
            <Typography.Link onClick={handleToggle}>禁用</Typography.Link>
          ) : (
            <Typography.Link onClick={handleToggle}>启用</Typography.Link>
          )}
          <Popconfirm title="确定删除当前记录" onConfirm={handleDelete}>
            <Typography.Text type="danger" style={{ cursor: 'pointer' }}>
              删除
            </Typography.Text>
          </Popconfirm>
        </Space>
      );
    },
  },
];
