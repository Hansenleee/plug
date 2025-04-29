import { Service } from 'typedi';
import { BaseStorage } from './base';
import { ProxyItem } from '../types';

@Service()
export class ProxyStorage extends BaseStorage {
  private static readonly NS = 'proxy';

  private static readonly PROXY_ITEMS_KEY = 'PROXY_ITEMS_KEY';

  constructor() {
    super(ProxyStorage.NS);
  }

  getProxy(id: string) {
    const proxyList = this.getProxyList();

    return proxyList.find((item) => item.id === id);
  }

  getProxyList() {
    return this.persistence.get(ProxyStorage.PROXY_ITEMS_KEY, []) as ProxyItem[];
  }

  batchInsertProxy(item: ProxyItem | ProxyItem[]) {
    const items = Array.isArray(item) ? item : [item];

    return this.persistence.batchAppend(
      ProxyStorage.PROXY_ITEMS_KEY,
      items.map((_) => ({ ..._, updateTime: Date.now() }))
    );
  }

  batchUpdateProxy(items: Array<Partial<ProxyItem>>) {
    const itemIds = items.map((_) => _.id);
    const itemList = this.persistence.get(ProxyStorage.PROXY_ITEMS_KEY, []) as ProxyItem[];

    itemList.forEach((item, index) => {
      const targetIndex = itemIds.indexOf(item.id);

      if (targetIndex >= 0) {
        itemList[index] = { ...itemList[index], ...items[targetIndex], updateTime: Date.now() };
      }
    });

    this.persistence.set(ProxyStorage.PROXY_ITEMS_KEY, itemList);
  }

  deleteProxy(id: string) {
    const apiList = this.persistence.get(ProxyStorage.PROXY_ITEMS_KEY, []) as ProxyItem[];

    this.persistence.set(
      ProxyStorage.PROXY_ITEMS_KEY,
      apiList.filter((item) => item.id !== id)
    );
  }
}
