import Container, { Service } from 'typedi';
import fetch from 'node-fetch';
import { Logger } from '../shared/log';
import { HttpException } from '../shared/exception';
import { Storage } from '../storage';

@Service()
export class YapiService {
  private static readonly NS = 'yapi';

  private host = '';
  private log = new Logger('yapi-service');

  async fetchInterface(params) {
    return this.baseFetch('/api/interface/get', { method: 'get', data: params });
  }

  async fetchProjectInfo(token: string) {
    return this.baseFetch('/api/project/get', { method: 'get', data: { token } });
  }

  /**
   * 查询项目下的所有接口，默认不分页 limit = 1000
   */
  async fetchInterfaceList(params: { token: string; project_id: string }) {
    return this.baseFetch('/api/interface/list', {
      method: 'get',
      data: { limit: 1000, page: 1, ...params },
    });
  }

  private async baseFetch(path: string, options: { method: 'get' | 'post'; data: object }) {
    let formattedPath = path;
    const data = {
      ...(options.data || {}),
    };
    const storage = Container.get(Storage);

    this.host = storage.mock.getConfig(YapiService.NS)?.host;

    if (options.method === 'get') {
      Object.entries(data).forEach(([key, value]) => {
        formattedPath = `${formattedPath}${formattedPath.includes('?') ? '&' : '?'}${key}=${value}`;
      });
    }

    try {
      const yapiResult = await fetch(`${this.host}${formattedPath}`, {
        method: options.method,
        headers: { 'Content-Type': 'application/json' },
        body: options.method === 'get' ? null : JSON.stringify(data),
      });

      const jsonResult = (await yapiResult.json()) as {
        errcode: number;
        data: any;
        errmsg?: string;
      };

      if (jsonResult.errcode !== 0) {
        throw new HttpException(jsonResult.errcode, jsonResult.errmsg);
      }

      return jsonResult.data;
    } catch (err) {
      if (err instanceof HttpException) {
        this.log.warn(`三方接口 ${formattedPath} 请求出错: ${err.message}`, { force: true });

        throw err;
      }

      this.log.warn(`三方接口 ${formattedPath} 请求出错: ${err.code}`, { force: true });

      throw new HttpException(err.code, err.message);
    }
  }
}
