import { Badge, TableProps, Space, Typography, Popconfirm } from 'antd';
import { message } from 'antd/lib';
import axios from 'axios';

export const getColumns: (value: any) => TableProps['columns'] = ({ onRefresh }) => [
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
    width: 160,
  },
  {
    title: 'method',
    dataIndex: 'method',
    width: 140,
  },
  {
    title: '数据来源',
    dataIndex: 'dataType',
    width: 140,
    render: (value) => {
      return value === 'define' ? '自定义 Mock' : 'yapi Mock';
    },
  },
  {
    title: '状态',
    dataIndex: 'enable',
    width: 100,
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

      return (
        <Space>
          <Typography.Link>自定义 Mock</Typography.Link>
          {record.enable ? (
            <Typography.Link>禁用</Typography.Link>
          ) : (
            <Typography.Link>启用</Typography.Link>
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
