import http from 'http';

export type Protocol = 'http' | 'https';

export interface ResponseDataInfo {
  statusCode: number;
  headers: http.OutgoingHttpHeaders;
  data: string;
}
