import { MockApiItem } from '../types';
import { RequestParser } from '../shared/request-parser';

export abstract class BaseMocker {
  static async create<T extends BaseMocker>(
    this: { new (...args: any[]): T },
    mockItem: MockApiItem,
    requestParser: RequestParser
  ) {
    const ins = new this(mockItem, requestParser);

    await ins.invoke();

    return ins;
  }

  protected mockData: any;

  constructor(protected mockItem: MockApiItem, protected requestParser: RequestParser) {}

  stringify() {
    return JSON.stringify(this.mockData);
  }

  abstract invoke(): Promise<void>;
}
