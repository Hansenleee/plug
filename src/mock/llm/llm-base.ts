import Container, { Service } from 'typedi';
import { Prompt } from './prompt';
import { SocketIO } from '../../shared/socket';
import { LLMPaginationHelper } from './llm-pagination-helper';
import { LLMStreamHelper } from './llm-stream-helper';
import type { MockParams } from './types';

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
  static HELP = {
    Pagination: LLMPaginationHelper,
    Stream: LLMStreamHelper,
  };

  private static readonly SOCKET_MOCK_STEAM_EVENT = 'MOCK_STREAM_ITEM';

  private socket = Container.get(SocketIO);

  emitMockDataBySocket(data: SocketEmitData) {
    return this.socket.emit(LLMBase.SOCKET_MOCK_STEAM_EVENT, data, { socketId: data.socketId });
  }

  protected parseLLMResult2Json(llmResult: Record<string, any>) {
    try {
      let content = llmResult.choices?.[0]?.message?.content;
      content = content
        .replace(`<${Prompt.JSON_RESULT_TAG}>`, '')
        .replace(`</${Prompt.JSON_RESULT_TAG}>`, '');

      return JSON.parse(content);
    } catch (_err) {
      return [];
    }
  }

  abstract mock(params: MockParams): Promise<any>;

  // 所有子类需要实现基于 json 格式的 mock 方法
  protected abstract mockByJSON(params: MockParams): Promise<any>;

  // 所有子类需要实现基于 stream 格式的 mock 方法
  protected abstract mockByStream(params: MockParams): Promise<any>;
}
