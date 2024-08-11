import http from 'http';

export type Protocol = 'http' | 'https';

export interface ResponseDataInfo {
  statusCode: number;
  headers: http.OutgoingHttpHeaders;
  data: string;
}

export interface HttpIncomingMessage extends http.IncomingMessage {
  bodyParse: any;
}
