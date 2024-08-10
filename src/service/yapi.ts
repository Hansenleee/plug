import { Service } from 'typedi';
import fetch from 'node-fetch';
import { Logger } from '../shared/log';

@Service()
export class YapiService {
  private static readonly HOST = 'https://yapi.iguming.net';

  private log = new Logger('yapi-service');

  async fetchInterface(params) {
    return this.baseFetch('/api/interface/get', { method: 'get', data: params });
  }

  async fetchProjectInfo(token: string) {
    return this.baseFetch('/api/project/get', { method: 'get', data: { token } });
  }

  private async baseFetch(path: string, options: { method: 'get' | 'post'; data: object }) {
    let formattedPath = path;
    const data = {
      ...(options.data || {}),
    };

    if (options.method === 'get') {
      Object.entries(data).forEach(([key, value]) => {
        formattedPath = `${formattedPath}${formattedPath.includes('?') ? '&' : '?'}${key}=${value}`;
      });
    }

    try {
      const yapiResult = await fetch(`${YapiService.HOST}${formattedPath}`, {
        method: options.method,
        headers: { 'Content-Type': 'application/json' },
        body: options.method === 'get' ? null : JSON.stringify(data),
      });

      const jsonResult = (await yapiResult.json()) as { errcode: number; data: any };

      if (jsonResult.errcode !== 0) {
        return Promise.reject(jsonResult);
      }

      return jsonResult.data;
    } catch (err) {
      this.log.warn(`三方接口 ${formattedPath} 请求出错: err`, { force: true });

      throw err;
    }
  }
}
