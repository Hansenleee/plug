import { Badge } from 'antd';
import type { TableProps } from 'antd';
import moment from 'moment';

export const columns: TableProps['columns'] = [
  {
    title: 'Status',
    dataIndex: 'status',
    width: 80,
    fixed: 'left',
    render: (status) => {
      if (!status) {
        <Badge className="column-badge" status="processing" size="default" />;
      }

      if (status === 200) {
        return <Badge className="column-badge" status="success" size="default" text="200" />;
      }

      return <Badge className="column-badge" status="error" size="default" text={status} />;
    },
  },
  {
    title: 'URL',
    dataIndex: 'url',
    width: 200,
    render: (url) => {
      return url;
    },
  },
  {
    title: 'Type',
    dataIndex: 'type',
    width: 80,
  },
  {
    title: 'Method',
    dataIndex: 'method',
    width: 80,
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
    width: 80,
    render: (_, record) => {
      const { startTime, endTime } = record;

      if (!startTime || !endTime) {
        return null;
      }

      return `${moment(startTime).diff(moment(endTime), 'ms')} ms`;
    },
  },
  {
    title: 'Size',
    dataIndex: 'size',
    width: 80,
  },
];
