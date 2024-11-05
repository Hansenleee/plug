import { Table } from 'antd';
import React, { useMemo, useRef, useState } from 'react';
import { useMount, useUnmount } from 'ahooks';
import { io, Socket } from 'socket.io-client';
import { columns } from './column';
import { Search } from './search';
import { Detail } from './detail';
import { BASE_API_PORT } from '../../constants';
import './style.scss';

export const MAX_RECORDS = 500;

const Dashboard: React.FC = () => {
  const [records, setRecords] = useState<Array<Record<string, string>>>([]);
  const [filterContent, setFilterContent] = useState('');
  const [activeRecord, setActiveRecord] = useState<Record<string, string> | undefined>();
  const [tableScroll, setTableScroll] = useState({ x: 1000, y: 600 })
  const socketRef = useRef<Socket>();
  const tableRef = useRef<any>(null);

  const filterRecords = useMemo(() => {
    if (!filterContent) {
      return records;
    }

    return records.filter((_) => _.url.split('?')[0].includes(filterContent as string))
  }, [filterContent, records]);

  const handleSearch = (searchValue: string) => {
    setFilterContent(searchValue);
  };

  useMount(() => {
    setTableScroll({
      x: tableRef.current?.offsetWidth - 10,
      y: tableRef.current?.offsetHeight - 60,
    })
  });

  useMount(() => {
    if (socketRef.current) {
      return;
    }

    const socket = io(`ws://127.0.0.1:${BASE_API_PORT}`, { retries: 3, transports: ['websocket'] });

    socket.on('connect', () => {
      socket.on('PLUG_SOCKET', (args) => {
        const { payload } = args;
        const payloadList = Array.isArray(payload) ? payload : [payload];

        if (args.name === 'PROXY_REQUEST_RECORD') {
          setRecords((pre) => {
            const finalRecords = [...payloadList, ...pre];

            if (finalRecords.length > MAX_RECORDS) {
              return finalRecords.slice(0, MAX_RECORDS);
            }

            return finalRecords;
          });
        }

        if (args.name === 'PROXY_RESPONSE_RECORD') {
          setRecords((pre) => {
            return pre.map((preItem) => {
              const payloadTarget = payloadList.find((_) => _.id === preItem.id);

              if (!payloadTarget) {
                return preItem;
              }

              return {
                ...preItem,
                ...payloadTarget,
              };
            });
          });
        }
      });
    });

    socketRef.current = socket;
  });

  useUnmount(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  });

  return (
    <div className="dashboard-container">
      <Search onSearch={handleSearch} onClear={() => setRecords([])} />
      <Table
        ref={tableRef}
        pagination={false}
        bordered
        rowKey="id"
        size="middle"
        columns={columns}
        dataSource={filterRecords}
        scroll={tableScroll}
        sticky
        virtual
        onRow={(record) => {
          return {
            onClick: () => setActiveRecord(record),
          };
        }}
      />
      <Detail
        visible={!!activeRecord}
        record={activeRecord}
        onClose={() => setActiveRecord(undefined)}
      />
    </div>
  );
};

export default Dashboard;
