import React, { useState, useMemo } from 'react';
import { Descriptions, Space, Button, Divider } from 'antd';
import ReactJson from 'react-json-view';
import { StatusComponent } from './status';
import { transformQuery2Obj } from '../../utils/helper';

interface Props {
  url: string;
  method: string;
  status: string;
  params: string;
  requestHeaders: Record<string, string>;
}

export const RequestBody: React.FC<Props> = (props) => {
  const { url, method, status } = props;
  const [viewFormatRequestParams, setViewFormatRequestParams] = useState(false);

  const requestHeaderItems = useMemo(
    () =>
      Object.entries(props.requestHeaders).map(([key, value]) => ({
        label: key,
        children: value as any,
      })),
    [props.requestHeaders]
  );

  const requestParamsNode = useMemo(() => {
    if (!viewFormatRequestParams) {
      return <pre style={{ margin: 0 }}>{props.params}</pre>;
    }

    let jsonData = {};

    if (method?.toUpperCase() === 'GET') {
      jsonData = transformQuery2Obj(props.params);
    } else {
      try {
        jsonData = JSON.parse(props.params);
      } catch (_err) {
        return <pre style={{ margin: 0 }}>{props.params}</pre>;
      }
    }

    return <ReactJson src={jsonData} />;
  }, [props.params, viewFormatRequestParams, method]);

  return (
    <>
      <Descriptions
        column={1}
        styles={{ label: { width: 250 } }}
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
                <Button size="small" onClick={() => setViewFormatRequestParams((pre) => !pre)}>
                  {viewFormatRequestParams ? '查看源码' : '查看格式化'}
                </Button>
              </Space>
            ),
            children: requestParamsNode,
          },
        ]}
      />
      <Divider />
      <Descriptions column={1} styles={{ label: { width: 250 } }} items={requestHeaderItems} />
    </>
  );
};
