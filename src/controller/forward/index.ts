import { Service } from 'typedi';
import { nanoid } from 'nanoid';
import { JsonController, Post, Body } from 'routing-controllers';
import { BaseController } from '../base';
import { ForwardItem } from '../../types';

interface ListSearchBody {
  page: { pageNo: number; pageSize: number };
  name?: string;
  url?: string;
  [key: string]: any;
}

@Service()
@JsonController('/forward')
export class ForwardController extends BaseController {
  @Post('/list/page')
  async getForwardListByPage(@Body() info: ListSearchBody) {
    const { page, name, url } = info;
    const isValidName = !!name || (name as unknown as number) === 0;

    this.required(info, ['page']);

    const forwardList = this.storage.forward
      .getForwardList()
      .filter((item) => {
        const isMatchName = !isValidName || item.name.includes(name);
        const isMatchUrl = !url || item.matchValue === url;

        return isMatchName && isMatchUrl;
      })
      .sort((pre, cur) => cur.updateTime - pre.updateTime);

    return this.page(forwardList, page);
  }

  @Post('/item/add')
  async addForwardItem(@Body() info: ForwardItem) {
    this.storage.forward.batchInsertForward({
      id: nanoid(),
      enable: true,
      ...info,
    });

    return this.success(true);
  }

  @Post('/item/delete')
  async deleteForwardItem(@Body() info: { id: string }) {
    this.required(info, ['id']);

    this.storage.forward.deleteForward(info.id);

    return this.success(true);
  }

  @Post('/item/toggle')
  async toggleForwardItem(@Body() info: { id: string }) {
    const { id } = info;

    this.required(info, ['id']);

    const forwardItem = this.storage.forward.getForward(id);

    this.storage.forward.batchUpdateForward([{ id, enable: !forwardItem.enable }]);

    return this.success(true);
  }
}
