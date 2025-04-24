// 针对于 mock 后的接口，需要处理跨域问题
import http from 'http';

export const cors = (request: http.IncomingMessage) => {
  const requestHeaderList = [...Object.keys(request.headers), 'Content-Type'];

  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': requestHeaderList.join(','),
    // 跨域时 options 请求有效性，FireFox 上限是 24h = 86400秒
    'Access-Control-Max-Age': 86400,
  };
};
