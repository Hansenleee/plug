import http from 'http';
import Mock from 'mockjs';
import { MockApiItem } from '../../types';

export class IntelligentMock {
  private static readonly DEFAULT_PAGE_TOTAL_SIZE = 100;
  private static readonly DEFAULT_PAGE_SIZE = 15;

  constructor(
    private mockData: any,
    private mockInfo: MockApiItem,
    private request: http.IncomingMessage
  ) {}

  get isIntelligent() {
    return !!this.mockInfo.intelligent;
  }

  get isDefine() {
    return this.mockInfo.dataType === 'define';
  }

  mock() {
    if (this.isIntelligent) {
      this.intellignet();
    }

    if (this.mockInfo.dataType === 'define') {
      return this.mockData;
    }

    this.mockData.code = 0;

    return this.mockData;
  }

  private intellignet() {
    if (this.mockData?.data?.page) {
      this.intelligentWithPage();
    }
  }

  private intelligentWithPage() {
    const requestBodyPage = this.request.body?.page || {};
    const originPageInfo = this.mockData.data.page || {};
    const totalSize = this.isDefine
      ? originPageInfo?.totalSize
      : IntelligentMock.DEFAULT_PAGE_TOTAL_SIZE;
    const curPage = requestBodyPage?.pageNo || 1;
    const pageSize = requestBodyPage?.pageSize || IntelligentMock.DEFAULT_PAGE_SIZE;

    this.mockData.data.page = {
      ...originPageInfo,
      curPage,
      pageSize,
      totalSize,
    };

    const remainedSize = totalSize - (curPage - 1) * pageSize;
    const currentPageSize = remainedSize > pageSize ? pageSize : Math.max(remainedSize, 0);

    this.mockData.data = {
      ...this.mockData.data,
      ...Mock.mock({
        [`data|${currentPageSize}`]: [{}],
      }),
    };
  }
}
