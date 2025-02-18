import { JsonSchemaParser } from './json-schema-parser';
import { RequestParser } from '../../shared/request-parser';

export interface MockParams {
  model?: string;
  modelId?: string;
  jsonSchema: JsonSchemaParser;
  requestParser: RequestParser;
  token?: string;
}

export abstract class LLMBase {
  static DEFAULT_MOCK_PAGE_SIZE = 15;
  static DEFAULT_MOCK_TOTAL_SIZE = 100;

  protected generatePagination<T = any>(params: Pick<MockParams, 'requestParser'>) {
    const requestParams = params.requestParser.getJSONRequestParams();
    const pageParams = requestParams?.page || { pageNo: 1, pageSize: 15 };

    const curPage = pageParams?.pageNo;
    const pageSize = pageParams.pageSize || LLMBase.DEFAULT_MOCK_PAGE_SIZE;
    const totalSize = LLMBase.DEFAULT_MOCK_TOTAL_SIZE;
    const totalPage = Math.ceil(totalSize / pageSize);
    const curPageSize = curPage < totalPage ? pageSize : totalSize - (curPage - 1) * pageSize;

    return (data: { data: T[] }) => ({
      data: curPageSize < 0 ? [] : data?.data?.slice(0, curPageSize),
      page: {
        curPage,
        pageSize,
        totalSize,
        totalPage,
      },
    });
  }

  abstract mock(params: MockParams): Promise<any>;
}
