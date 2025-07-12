import { Table } from 'antd';
import React, { useMemo, useRef, useState } from 'react';
import { useMount, useUnmount } from 'ahooks';
import { io, Socket } from 'socket.io-client';
import { columns } from './column';
import { Search } from './search';
import { Detail } from './detail';
import { BASE_API_PORT } from '../../constants';
import './style.scss';
import { SearchContentType } from './shared';

export const MAX_RECORDS = 500;

const Dashboard: React.FC = () => {
  const [records, setRecords] = useState<Array<Record<string, any>>>([]);
  const [filterContent, setFilterContent] = useState('');
  const [activeRecord, setActiveRecord] = useState<Record<string, string> | undefined>();
  const [searchContentType, setSearchContentType] = useState<string | SearchContentType>(
    SearchContentType.ALL
  );
  const [tableScroll, setTableScroll] = useState({ x: 1000, y: 600 });
  const socketRef = useRef<Socket>();
  const tableRef = useRef<any>(null);

  const filterRecords = useMemo(() => {
    if (!filterContent && searchContentType === SearchContentType.ALL) {
      return records;
    }

    let innerFilterRecords = records.slice(0);

    if (filterContent) {
      innerFilterRecords = innerFilterRecords.filter((_) =>
        _.url.split('?')[0].includes(filterContent as string)
      );
    }

    if (searchContentType !== SearchContentType.ALL) {
      innerFilterRecords = innerFilterRecords.filter((_) => {
        if (!_.type) {
          return false;
        }

        return _.type.includes(searchContentType);
      });
    }

    return innerFilterRecords;
  }, [filterContent, records, searchContentType]);

  const handleSearch = (searchValue: string) => {
    setFilterContent(searchValue);
  };

  useMount(() => {
    setTableScroll({
      x: tableRef.current?.offsetWidth - 10,
      y: tableRef.current?.offsetHeight - 60,
    });
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
                requestHeaders: {
                  ...(preItem.requestHeaders || {}),
                  ...(payloadTarget.requestHeaders || {}),
                },
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
      <Search
        searchContentType={searchContentType}
        onSearch={handleSearch}
        onClear={() => setRecords([])}
        onSearchContentTypeChange={(val) => setSearchContentType(val)}
      />
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
