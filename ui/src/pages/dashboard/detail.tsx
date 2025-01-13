import { Drawer, Tabs, Descriptions, Divider, Image, Space, Button } from 'antd';
import React, { useMemo, useState } from 'react';
import { StatusComponent } from './status';

interface Props {
  visible: boolean;
  record?: Record<string, any>;
  onClose: () => void;
}

export const Detail: React.FC<Props> = (props) => {
  const [viewFormatRequestParams, setViewFormatRequestParams] = useState(false);

  const formatJsonRequest = useMemo(() => {
    if (!viewFormatRequestParams) {
      return props.record?.params;
    }

    try {
      return JSON.stringify(JSON.parse(props.record?.params), null, '  ');
    } catch (err) {
      return props.record?.params;
    }
  }, [props.record?.params, viewFormatRequestParams]);

  const formatJsonResponse = useMemo(() => {
    const { responseData = '' } = props.record || {};
    const contentType = props.record?.responseHeader?.['content-type'];

    if (contentType?.startsWith?.('image')) {
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
    const { requestHeaders = {}, responseHeader = {}, url, method, status } = props.record || {};
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
                  label: 'url',
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
                  label: (
                    <Space>
                      <span>params</span>
                      <Button
                        size="small"
                        onClick={() => setViewFormatRequestParams((pre) => !pre)}
                      >
                        {viewFormatRequestParams ? '查看源码' : '查看格式化'}
                      </Button>
                    </Space>
                  ),
                  children: <pre style={{ margin: 0 }}>{formatJsonRequest}</pre>,
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
            {responseHeader['content-type']?.startsWith?.('image') ? (
              <Image src={formatJsonResponse} />
            ) : (
              <pre style={{ overflow: 'auto' }}>{formatJsonResponse}</pre>
            )}
          </>
        ),
      },
    ];
  }, [formatJsonRequest, formatJsonResponse, props.record, viewFormatRequestParams]);

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
