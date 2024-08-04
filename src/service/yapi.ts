import { Service } from 'typedi';
import fetch from 'node-fetch';

@Service()
export class YapiService {
  private static readonly HOST = 'https://yapi.iguming.net';

  async fetchInterface(params) {
    return this.baseFetch('/api/interface/get', { method: 'get', data: params });
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

    const yapiResult = await fetch(`${YapiService.HOST}${formattedPath}`, {
      method: options.method,
      headers: { 'Content-Type': 'application/json' },
      body: options.method === 'get' ? null : JSON.stringify(data),
    });

    const jsonResult = (await yapiResult.json()) as { errcode: number; data: unknown };

    if (jsonResult.errcode !== 0) {
      return Promise.reject(jsonResult);
    }

    return jsonResult.data;
  }
}
