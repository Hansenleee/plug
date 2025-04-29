import { Service } from 'typedi';
import type { MockParams } from './types';

@Service()
export class LLMPaginationHelper<T = any> {
  static DEFAULT_PAGE_SIZE = 15;
  static DEFAULT_TOTAL_SIZE = 100;

  static getPage(options: Pick<MockParams, 'requestParser'>) {
    const ins = new LLMPaginationHelper([], options);

    return ins.getPagination();
  }

  static getPageData<T = any>(data: T[], options: Pick<MockParams, 'requestParser'>) {
    const ins = new LLMPaginationHelper(data, options);

    return ins.getPaginationWithData();
  }

  constructor(
    private readonly data: T[],
    private readonly options: Pick<MockParams, 'requestParser'>
  ) {}

  getPagination() {
    const requestParams = this.options.requestParser.getJSONRequestParams();
    const pageParams = requestParams?.page || {
      pageNo: 1,
      pageSize: LLMPaginationHelper.DEFAULT_PAGE_SIZE,
    };

    const curPage = pageParams?.pageNo;
    const pageSize = pageParams.pageSize || LLMPaginationHelper.DEFAULT_PAGE_SIZE;
    const totalSize = LLMPaginationHelper.DEFAULT_TOTAL_SIZE;
    const totalPage = Math.ceil(totalSize / pageSize);

    return {
      curPage,
      pageSize,
      totalSize,
      totalPage,
    };
  }

  getPaginationWithData() {
    const pagination = this.getPagination();
    const { curPage, totalPage, pageSize, totalSize } = pagination;
    const curPageSize = curPage < totalPage ? pageSize : totalSize - (curPage - 1) * pageSize;

    return {
      data: curPageSize < 0 ? [] : this.data?.slice(0, curPageSize),
      page: pagination,
    };
  }
}
