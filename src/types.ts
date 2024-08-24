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

export interface MockConfig {
  host: string;
  mockHost?: string[];
}

export interface MockApiItem {
  id: string;
  path: string;
  method: string;
  title: string;
  dataType: 'url' | 'define';
  apiType: 'default' | 'yapi' | (string & {});
  mockUrl?: string;
  enable: boolean;
  projectId?: string;
}

export interface ProjectItem {
  id: string;
  token: string;
  projectName: string;
  projectId: string;
  enable: boolean;
}

export interface MockDataItem {
  apiId: string;
  mockString: string;
}
