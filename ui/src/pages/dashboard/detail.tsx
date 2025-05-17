import { Drawer, Tabs } from 'antd';
import React, { useMemo } from 'react';
import { RequestBody } from './request-body';
import { ResponseBody } from './response-body';

interface Props {
  visible: boolean;
  record?: Record<string, any>;
  onClose: () => void;
}

export const Detail: React.FC<Props> = (props) => {
  const items = useMemo(() => {
    const {
      requestHeaders = {},
      responseHeader = {},
      url,
      method,
      status,
      responseData,
    } = props.record || {};

    return [
      {
        label: 'Request',
        key: 'Request',
        children: (
          <RequestBody
            url={url}
            method={method}
            status={status}
            params={props.record?.params}
            requestHeaders={requestHeaders}
          />
        ),
      },
      {
        label: 'Response',
        key: 'Response',
        children: <ResponseBody responseHeader={responseHeader} responseData={responseData} />,
      },
    ];
  }, [props.record]);

  return (
    <Drawer
      title="详情"
      placement="right"
      closable={false}
      width="50%"
      style={{ minWidth: 600 }}
      rootClassName="dashboard-detail"
      open={props.visible}
      onClose={props.onClose}
      destroyOnClose
    >
      <Tabs
        defaultActiveKey="Request"
        type="card"
        size="small"
        items={items}
        style={{ height: '100%' }}
      />
    </Drawer>
  );
};
