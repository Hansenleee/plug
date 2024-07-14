import { Table } from 'antd';
import React, { useRef, useState } from 'react';
import { useMount, useUnmount } from 'ahooks';
import { io, Socket } from 'socket.io-client';
import { columns } from './column';
import { Search } from './search';
import './style.scss';

// const DEMO = [
//   {
//     id: '1',
//     url: 'https://minyi.zjzwfw.gov.cn/dczjnewls/dczj/survey/form_3022.html',
//     method: 'POST',
//     status: '200',
//     type: 'XHR',
//     start: '12:10:11.888',
//     duration: '0.8s',
//     size: '0.5kb',
//   },
// ];

// export const aa = { result: '11111111111111111111111111111111111111111111111111111111111111111111111111' };

const Dashbord: React.FC = () => {
  const [records, setRecords] = useState<Array<Record<string, string>>>([]);
  const socketRef = useRef<Socket>();

  useMount(() => {
    const socket = io('ws://127.0.0.1:9001', { retries: 3, transports: ['websocket'] });

    socket.on('connect', () => {
      socket.on('PLUG_SOCKET', (args) => {
        const { payload } = args;
        const payloadList = Array.isArray(payload) ? payload : [payload];

        if (args.name === 'PROXY_REQUEST_RECORD') {
          setRecords((pre) => [...pre, ...payloadList]);
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
      <Search />
      <Table pagination={false} rowKey="id" columns={columns} dataSource={records} />
    </div>
  );
};

export default Dashbord;
