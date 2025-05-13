import { Drawer, Tabs, Descriptions, Divider, Space, Button } from 'antd';
import React, { useMemo, useState } from 'react';
import { transformQuery2Obj } from '../../utils/helper';
import { StatusComponent } from './status';
import { ResponseBody } from './response-body';

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

    if (props.record?.method === 'GET') {
      return JSON.stringify(transformQuery2Obj(props.record?.params), null, '  ');
    }

    try {
      return JSON.stringify(JSON.parse(props.record?.params), null, '  ');
    } catch (err) {
      return props.record?.params;
    }
  }, [props.record?.params, viewFormatRequestParams]);

  const items = useMemo(() => {
    const {
      requestHeaders = {},
      responseHeader = {},
      url,
      method,
      status,
      responseData,
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
            <ResponseBody
              contentType={responseHeader['content-type']}
              responseData={responseData}
            />
          </>
        ),
      },
    ];
  }, [formatJsonRequest, props.record, viewFormatRequestParams]);

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
