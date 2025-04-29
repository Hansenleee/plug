import { Service } from 'typedi';
import { JsonController, Post, Body } from 'routing-controllers';
import { BaseController } from '../base';

interface ListSearchBody {
  page: { pageNo: number; pageSize: number };
  name?: string;
  url?: string;
  [key: string]: any;
}

@Service()
@JsonController('/proxy')
export class ProxyController extends BaseController {
  @Post('/list/page')
  async getProxyListByPage(@Body() info: ListSearchBody) {
    const { page, name, url } = info;
    const isValidName = !!name || (name as unknown as number) === 0;

    this.required(info, ['page']);

    const proxyList = this.storage.proxy
      .getProxyList()
      .filter((item) => {
        const isMatchName = !isValidName || item.name.includes(name);
        const isMatchUrl = !url || item.matchValue === url;

        return isMatchName && isMatchUrl;
      })
      .sort((pre, cur) => cur.updateTime - pre.updateTime);

    return this.page(proxyList, page);
  }
}
