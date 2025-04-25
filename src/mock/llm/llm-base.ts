import Container, { Service } from 'typedi';
import { JsonSchemaParser } from './json-schema-parser';
import { RequestParser } from '../../shared/request-parser';
import { SocketIO } from '../../shared/socket';

export interface MockParams {
  model?: string;
  modelId?: string;
  jsonSchema: JsonSchemaParser;
  requestParser: RequestParser;
  token?: string;
  stream?: boolean;
  socketId?: string;
}

export interface SocketEmitData {
  content: string;
  end?: boolean;
  pagination?: boolean;
  socketId: string;
}

@Service()
export abstract class LLMBase {
  static DEFAULT_MOCK_PAGE_SIZE = 15;
  static DEFAULT_MOCK_TOTAL_SIZE = 100;

  private static readonly SOCKET_MOCK_STEAM_EVENT = 'MOCK_STREAM_ITEM';

  private socket = Container.get(SocketIO);

  emitMockDataBySocket(data: SocketEmitData) {
    return this.socket.emit(LLMBase.SOCKET_MOCK_STEAM_EVENT, data, { socketId: data.socketId });
  }

  protected generatePagination<T = any>(params: Pick<MockParams, 'requestParser'>) {
    const requestParams = params.requestParser.getJSONRequestParams();
    const pageParams = requestParams?.page || {
      pageNo: 1,
      pageSize: LLMBase.DEFAULT_MOCK_PAGE_SIZE,
    };

    const curPage = pageParams?.pageNo;
    const pageSize = pageParams.pageSize || LLMBase.DEFAULT_MOCK_PAGE_SIZE;
    const totalSize = LLMBase.DEFAULT_MOCK_TOTAL_SIZE;
    const totalPage = Math.ceil(totalSize / pageSize);
    const curPageSize = curPage < totalPage ? pageSize : totalSize - (curPage - 1) * pageSize;

    const returnFn = (data: { data: T[] }) => ({
      data: curPageSize < 0 ? [] : data?.data?.slice(0, curPageSize),
      page: {
        curPage,
        pageSize,
        totalSize,
        totalPage,
      },
    });

    returnFn.pagination = {
      curPage,
      pageSize,
      totalSize,
      totalPage,
    };

    return returnFn;
  }

  abstract mock(params: MockParams): Promise<any>;
}
