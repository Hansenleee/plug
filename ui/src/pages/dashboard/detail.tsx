import React, { useMemo } from 'react';
import { Drawer, Tabs, Descriptions } from 'antd';

interface Props {
  visible: boolean;
  record?: Record<string, any>;
  onClose: () => void;
}

export const Detail: React.FC<Props> = (props) => {
  const items = useMemo(() => {
    const { requestHeaders = {}, responseHeader = {} } = props.record || {};
    const requestHeaderItems = Object.entries(requestHeaders).map(([key, value]) => ({
      label: key,
      children: value as any,
    }));
    const responseHeaderItems = Object.entries(responseHeader).map(([key, value]) => ({
      label: key,
      children: value as any,
    }));

    return [
      {
        label: 'Request',
        key: 'Request',
        children: (
          <Descriptions column={1} labelStyle={{ width: 250 }} items={requestHeaderItems} />
        ),
      },
      {
        label: 'Response',
        key: 'Response',
        children: (
          <Descriptions column={1} labelStyle={{ width: 250 }} items={responseHeaderItems} />
        ),
      },
    ];
  }, [props.record]);

  return (
    <Drawer
      title="详情"
      placement="right"
      closable={false}
      width="40%"
      open={props.visible}
      onClose={props.onClose}
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
