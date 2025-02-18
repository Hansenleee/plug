import http from 'http';
import { Protocol } from '../types';

export type RequestParserCtxBase = Pick<http.IncomingMessage, 'method' | 'body' | 'url'>;
export type RequestParserCtx = RequestParserCtxBase & { headers: { host?: string } };

export class RequestParser {
  static create(params: RequestParserCtxBase & { host: string; protocol: Protocol }) {
    return new RequestParser(
      {
        ...params,
        headers: { host: params.host },
      },
      params.protocol
    );
  }

  constructor(private readonly request: RequestParserCtx, private readonly protocol: Protocol) {}

  get host() {
    return this.request.headers.host;
  }

  get method() {
    return this.request.method;
  }

  get body() {
    return this.request.body;
  }

  /**
   * 在 https 情况下，request.url 返回的是 path，需要拼接完整
   */
  get completeUrl() {
    const { url } = this.request;

    if (url.startsWith('/')) {
      return new URL(`${this.protocol}://${this.host}${url}`);
    }

    return new URL(url);
  }

  getJSONRequestParams() {
    const { searchParams } = this.completeUrl;
    const jsonParams: Record<string, any> = {};

    if (this.request.method.toUpperCase() === 'POST') {
      try {
        return JSON.parse(this.request.body);
      } catch (_err) {
        return {};
      }
    }

    searchParams.forEach((value, key) => {
      jsonParams[key] = value;
    });

    return jsonParams;
  }
}
