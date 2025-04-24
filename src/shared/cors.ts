// 针对于 mock 后的接口，需要处理跨域问题
import http from 'http';

export const cors = (request: http.IncomingMessage) => {
  const requestHeaderList = [...Object.keys(request.headers), 'Content-Type'];

  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': requestHeaderList.join(','),
  };
};
