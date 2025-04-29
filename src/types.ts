import http from 'http';
import type { FormData } from 'node-fetch';
import type { RequestParser } from './shared/request-parser';

export type Protocol = 'http' | 'https';

export enum MockDataType {
  URL = 'url',
  DEFINE = 'define',
}

declare module 'http' {
  interface IncomingMessage {
    body?: any;
    rawBody: string;
    formData?: FormData;
    parser: RequestParser;
  }
}

export interface ResponseDataInfo {
  statusCode: number;
  headers: http.OutgoingHttpHeaders;
  data: string;
}

export interface MockConfig {
  host: string;
  mockHost?: string[];
}

export interface MockApiItem {
  id: string;
  path: string;
  prefix?: string;
  method?: string;
  title: string;
  dataType: 'url' | 'define';
  apiType: 'default' | 'yapi' | (string & {});
  mockUrl?: string;
  enable: boolean;
  intelligent?: boolean;
  yapiId?: string;
  token?: string;
  projectId?: string;
  updateTime?: number;
  // 单位毫秒，0 或者空时代表不限制
  responseTime?: number;
}

export interface ProjectItem {
  id: string;
  token: string;
  projectName: string;
  projectId: string;
  enable: boolean;
  intelligent?: boolean;
  updateTime?: number;
  prefix?: string;
}

export interface MockDataItem {
  apiId: string;
  mockString: string;
}

export interface SystemConfig {
  originSystemProxyPort?: number;
  LLMProvider?: 'volcengine' | 'baidu' | 'local';
  LLMType?: string;
  LLMId?: string;
  LLMApiToken?: string;
}

export type ProxyAddedType = Array<{ key: string; value: string }>;

export interface ProxyItem {
  id: string;
  name: string;
  matchValue: RegExp | string;
  enable: boolean;
  requestSetting?: {
    addedHeaders: ProxyAddedType;
    addedUrlParams: ProxyAddedType;
    addedBodyPrams: ProxyAddedType;
  };
  responseSetting?: {
    addedHeaders: ProxyAddedType;
    rt?: number;
  };
  updateTime: number;
}
