import { Table } from 'antd';
import React, { useRef, useState } from 'react';
import { useMount, useUnmount } from 'ahooks';
import { io, Socket } from 'socket.io-client';
import { columns } from './column';
import { Search } from './search';
import { Detail } from './detail';
import './style.scss';

const Dashbord: React.FC = () => {
  const [records, setRecords] = useState<Array<Record<string, string>>>([]);
  const [activeRecord, setActiveRecord] = useState<Record<string, string> | undefined>();
  const socketRef = useRef<Socket>();

  useMount(() => {
    const socket = io('ws://127.0.0.1:9001', { retries: 3, transports: ['websocket'] });

    socket.on('connect', () => {
      socket.on('PLUG_SOCKET', (args) => {
        const { payload } = args;
        const payloadList = Array.isArray(payload) ? payload : [payload];

        if (args.name === 'PROXY_REQUEST_RECORD') {
          setRecords((pre) => [...payloadList, ...pre]);
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
    <div>
      <Search onClear={() => setRecords([])} />
      <Table
        pagination={false}
        bordered
        rowKey="id"
        columns={columns}
        dataSource={records}
        scroll={{ x: '100%' }}
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

export default Dashbord;
