import { Container } from 'typedi';
import { RootPlugin } from '../plugins';
import http from 'http';
import { MockApiItem } from '../types';

export abstract class BaseMocker {
  static async create<T extends BaseMocker>(
    this: { new (...args: any[]): T },
    request: http.IncomingMessage,
    response: http.ServerResponse,
    mockItem: MockApiItem
  ) {
    const ins = new this(request, response, mockItem);

    await ins.invoke();
    ins.invokePlugins();

    return ins;
  }

  protected mockData: any;

  constructor(
    protected request: http.IncomingMessage,
    protected response: http.ServerResponse,
    protected mockItem: MockApiItem
  ) {}

  stringify() {
    return JSON.stringify(this.mockData);
  }

  private invokePlugins() {
    const rootPlugin = Container.get(RootPlugin);

    rootPlugin.mockData(this.mockData, this.mockItem, this.request);
  }

  abstract invoke(): Promise<void>;
}
