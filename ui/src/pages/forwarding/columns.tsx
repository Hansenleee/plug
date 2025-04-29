import { Badge, TableProps, Space, Typography, Popconfirm, message } from 'antd';
import axios from 'axios';
import moment from 'moment';

export const getColumns: (value: any) => TableProps['columns'] = ({ onRefresh, onEdit }) => [
  {
    title: '名称',
    dataIndex: 'name',
    width: 200,
    fixed: 'left',
    render: (value: string) => {
      return <Typography.Link>{value}</Typography.Link>;
    },
  },
  {
    title: '匹配内容',
    dataIndex: 'matchValue',
    width: 300,
  },
  {
    title: '状态',
    dataIndex: 'enable',
    width: 90,
    render: (value) => {
      return value ? (
        <Badge status="success" text="已启用" />
      ) : (
        <Badge status="error" text="已停用" />
      );
    },
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    width: 200,
    render: (value) => moment(value).format('YYYY-MM-DD HH:mm:ss'),
  },
  {
    title: '操作',
    dataIndex: 'opt',
    width: 180,
    render: (_: any, record: any) => {
      const handleToggle = () => {
        return axios.post('/api/forward/item/toggle', { id: record.id }).then(() => {
          message.success(record.enable ? '停用成功' : '启用成功');
          onRefresh();
        });
      };

      const handleDelete = () => {
        return axios.post('/api/forward/item/delete', { id: record.id }).then(() => {
          message.success('删除成功');
          onRefresh();
        });
      };

      return (
        <Space>
          <Typography.Link onClick={() => onEdit(record)}>修改</Typography.Link>
          {record.enable ? (
            <Typography.Link onClick={handleToggle}>停用</Typography.Link>
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
