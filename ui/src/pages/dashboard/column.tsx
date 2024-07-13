import { Badge } from 'antd';
import type { TableProps } from 'antd';

export const columns: TableProps['columns'] = [
  {
    title: '',
    dataIndex: '',
    width: 80,
    align: 'center',
    fixed: 'left',
    render: () => {
      return <Badge className="column-badge" status="success" size="default" />
    }
  },
  {
    title: 'Status',
    dataIndex: 'status',
    width: 80,
  },
  {
    title: 'URL',
    dataIndex: 'url',
    width: 200,
    render: (url) => {
      return url
    }
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
    dataIndex: 'start',
    width: 150,
  },
  {
    title: 'Duration',
    dataIndex: 'duration',
    width: 80,
  },
  {
    title: 'Size',
    dataIndex: 'size',
    width: 80,
  }
];
