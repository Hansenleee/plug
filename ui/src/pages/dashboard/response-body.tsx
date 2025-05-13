import React, { useMemo } from 'react';
import { Image } from 'antd';

interface Props {
  contentType: string;
  responseData?: string;
}

export const ResponseBody: React.FC<Props> = (props) => {
  const formatJsonResponse = useMemo(() => {
    const { contentType, responseData = '' } = props;

    if (contentType?.startsWith?.('image')) {
      // 设置图片的Base64源
      return `data:${contentType};base64,${responseData}`;
    }

    try {
      return JSON.stringify(JSON.parse(responseData as string), null, '  ');
    } catch (err) {
      return responseData;
    }
  }, [props]);

  return props.contentType?.startsWith?.('image') ? (
    <Image src={formatJsonResponse} />
  ) : (
    <pre style={{ overflow: 'auto' }}>{formatJsonResponse}</pre>
  );
};
