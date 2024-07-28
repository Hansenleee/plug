import type { TableProps } from 'antd';
import moment from 'moment';
import { StatusComponent } from './status';

export const columns: TableProps['columns'] = [
  {
    title: 'Status',
    dataIndex: 'status',
    width: 120,
    fixed: 'left',
    render: (status) => {
      return <StatusComponent status={status} />;
    },
  },
  {
    title: 'URL',
    dataIndex: 'url',
    width: 350,
    render: (url) => {
      return url;
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
