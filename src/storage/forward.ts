import { Service } from 'typedi';
import { BaseStorage } from './base';
import { ForwardItem } from '../types';

@Service()
export class ForwardStorage extends BaseStorage {
  private static readonly NS = 'forward';

  private static readonly FORWARD_ITEMS_KEY = 'forward-items';

  constructor() {
    super(ForwardStorage.NS);
  }

  getForward(id: string) {
    const forwardList = this.getForwardList();

    return forwardList.find((item) => item.id === id);
  }

  getForwardList() {
    return this.persistence.get(ForwardStorage.FORWARD_ITEMS_KEY, []) as ForwardItem[];
  }

  batchInsertForward(item: ForwardItem | ForwardItem[]) {
    const items = Array.isArray(item) ? item : [item];

    return this.persistence.batchAppend(
      ForwardStorage.FORWARD_ITEMS_KEY,
      items.map((_) => ({ ..._, updateTime: Date.now() }))
    );
  }

  batchUpdateForward(items: Array<Partial<ForwardItem>>) {
    const itemIds = items.map((_) => _.id);
    const itemList = this.persistence.get(ForwardStorage.FORWARD_ITEMS_KEY, []) as ForwardItem[];

    itemList.forEach((item, index) => {
      const targetIndex = itemIds.indexOf(item.id);

      if (targetIndex >= 0) {
        itemList[index] = { ...itemList[index], ...items[targetIndex], updateTime: Date.now() };
      }
    });

    this.persistence.set(ForwardStorage.FORWARD_ITEMS_KEY, itemList);
  }

  deleteForward(id: string) {
    const apiList = this.persistence.get(ForwardStorage.FORWARD_ITEMS_KEY, []) as ForwardItem[];

    this.persistence.set(
      ForwardStorage.FORWARD_ITEMS_KEY,
      apiList.filter((item) => item.id !== id)
    );
  }
}
