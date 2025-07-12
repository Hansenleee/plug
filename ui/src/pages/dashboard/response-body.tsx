import React, { useMemo } from 'react';
import { Image, Descriptions, Divider } from 'antd';
import ReactJson from 'react-json-view';

interface Props {
  responseHeader: Record<string, string>;
  responseData?: string;
}

export const ResponseBody: React.FC<Props> = (props) => {
  const contentType = props.responseHeader?.['content-type'] || '';

  const responseHeaderItems = useMemo(
    () =>
      Object.entries(props.responseHeader || {}).map(([key, value]) => ({
        label: key,
        children: value,
      })),
    [props.responseHeader]
  );

  const responseNode = useMemo(() => {
    if (contentType.startsWith('image')) {
      return <Image src={`data:${contentType};base64,${props.responseData}`} />;
    }

    if (contentType.includes('json')) {
      let jsonData = {};

      try {
        jsonData = JSON.parse(props.responseData as string);
      } catch (_) {
        /* empty */
      }

      return <ReactJson src={jsonData} />;
    }

    return <pre style={{ overflow: 'auto' }}>{props.responseData}</pre>;
  }, [contentType]);

  return (
    <>
      <Descriptions column={1} styles={{ label: { width: 250 } }} items={responseHeaderItems} />
      <Divider>Body</Divider>
      {responseNode}
    </>
  );
};
