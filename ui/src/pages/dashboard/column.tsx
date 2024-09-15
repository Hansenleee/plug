import { Space, TableProps, Tag, Typography } from 'antd';
import moment from 'moment';
import { StatusComponent } from './status';

export const columns: TableProps['columns'] = [
  {
    title: 'Status',
    dataIndex: 'status',
    width: 150,
    fixed: 'left',
    render: (status, record) => {
      const isMock = record.responseHeader?.['x-plug-mock-id'];

      return (
        <Space>
          <StatusComponent status={status} />
          {isMock ? <Tag color="blue">Mock</Tag> : null}
        </Space>
      );
    },
  },
  {
    title: 'URL',
    dataIndex: 'url',
    width: 350,
    render: (url: string, record) => {
      const shortUrl = record.path?.indexOf('?') > -1 ? record.path.split('?')[0] : record.path;

      return (
        <Space direction="vertical">
          <Typography.Text>{shortUrl}</Typography.Text>
          <Typography.Text type="secondary">{record.origin}</Typography.Text>
        </Space>
      )
    },
  },
  {
    title: 'Type',
    dataIndex: 'type',
    width: 140,
  },
  {
    title: 'Method',
    dataIndex: 'method',
    width: 90,
  },
  {
    title: 'Start',
    dataIndex: 'startTime',
    width: 150,
    render: (startTime) => {
      return moment(startTime).format('HH:mm:ss.SSS');
    },
  },
  {
    title: 'Duration',
    dataIndex: 'duration',
    width: 120,
    render: (_, record) => {
      const { startTime, endTime } = record;

      if (!startTime || !endTime) {
        return null;
      }

      return `${moment(endTime).diff(moment(startTime), 'ms')} ms`;
    },
  },
  {
    title: 'Size',
    dataIndex: 'size',
    width: 80,
  },
];
