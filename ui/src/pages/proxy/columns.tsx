import { Badge, TableProps, Space, Typography, Popconfirm, Tooltip, Tag, Modal } from 'antd';
import { message } from 'antd/lib';
import axios from 'axios';

export const getColumns: (value: any) => TableProps['columns'] = ({}) => [
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
    width: 200,
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
    title: '更新时间',
    dataIndex: 'updateTime',
    width: 200,
  },
  {
    title: '操作',
    dataIndex: 'opt',
    width: 180,
    render: (_: any, record: any) => {
      return (
        <Space>
          <Typography.Link onClick={() => {}}>修改</Typography.Link>
          {record.enable ? (
            <Typography.Link onClick={() => {}}>停用</Typography.Link>
          ) : (
            <Typography.Link onClick={() => {}}>启用</Typography.Link>
          )}
          <Popconfirm title="确定删除当前记录" onConfirm={() => {}}>
            <Typography.Text type="danger" style={{ cursor: 'pointer' }}>
              删除
            </Typography.Text>
          </Popconfirm>
        </Space>
      );
    },
  },
];
