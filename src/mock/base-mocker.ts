import http from 'http';
import { MockApiItem } from '../types';

export type RequestParams = Pick<http.IncomingMessage, 'url' | 'method' | 'body'>;

export abstract class BaseMocker {
  static async create<T extends BaseMocker>(
    this: { new (...args: any[]): T },
    mockItem: MockApiItem,
    request: RequestParams
  ) {
    const ins = new this(mockItem, request);

    await ins.invoke();

    return ins;
  }

  protected mockData: any;

  constructor(protected mockItem: MockApiItem, protected request: RequestParams) {}

  stringify() {
    return JSON.stringify(this.mockData);
  }

  abstract invoke(): Promise<void>;
}
