import { MockApiItem } from '../types';
import { RequestParser } from '../shared/request-parser';

export interface BaseMockOptions {
  stream?: boolean;
  socketId?: string;
}

export abstract class BaseMocker {
  static async create<T extends BaseMocker>(
    this: { new (...args: any[]): T },
    mockItem: MockApiItem,
    requestParser: RequestParser,
    options?: BaseMockOptions
  ) {
    const ins = new this(mockItem, requestParser, options);

    await ins.invoke();

    return ins;
  }

  protected mockData: any;

  constructor(
    protected mockItem: MockApiItem,
    protected requestParser: RequestParser,
    protected options?: BaseMockOptions
  ) {}

  stringify() {
    return JSON.stringify(this.mockData);
  }

  abstract invoke(): Promise<void>;
}
