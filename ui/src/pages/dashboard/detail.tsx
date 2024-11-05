import React, { useMemo } from 'react';
import { Drawer, Tabs, Descriptions, Divider, Image } from 'antd';
import { StatusComponent } from './status';

interface Props {
  visible: boolean;
  record?: Record<string, any>;
  onClose: () => void;
}

export const Detail: React.FC<Props> = (props) => {
  const formatJsonResponse = useMemo(() => {
    const { responseData = '' } = props.record || {};
    const contentType = props.record?.responseHeader?.['content-type'];

    if (contentType === 'image/png') {
      // 设置图片的Base64源
      return `data:${contentType};base64,${props.record?.responseData}`;
    }

    try {
      return JSON.stringify(JSON.parse(responseData), null, '  ');
    } catch (err) {
      return responseData;
    }
  }, [props.record]);

  const items = useMemo(() => {
    const {
      requestHeaders = {},
      responseHeader = {},
      url,
      method,
      status,
      params = {},
    } = props.record || {};
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
          <>
            <Descriptions
              column={1}
              labelStyle={{ width: 250 }}
              items={[
                {
                  label: 'request-url',
                  children: url?.indexOf('?') > -1 ? url.split('?')[0] : url,
                },
                {
                  label: 'method',
                  children: method,
                },
                {
                  label: 'status',
                  children: <StatusComponent status={status} />,
                },
                {
                  label: 'params',
                  children: JSON.stringify(params),
                },
              ]}
            />
            <Divider />
            <Descriptions column={1} labelStyle={{ width: 250 }} items={requestHeaderItems} />
          </>
        ),
      },
      {
        label: 'Response',
        key: 'Response',
        children: (
          <>
            <Descriptions column={1} labelStyle={{ width: 250 }} items={responseHeaderItems} />
            <Divider>Body</Divider>
            {responseHeader['content-type'] === 'image/png' ? <Image src={formatJsonResponse} /> : <pre style={{ overflow: 'auto' }}>{formatJsonResponse}</pre>}
          </>
        ),
      },
    ];
  }, [formatJsonResponse, props.record]);

  return (
    <Drawer
      title="详情"
      placement="right"
      closable={false}
      width="40%"
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
