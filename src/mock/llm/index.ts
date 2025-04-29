import Container, { Service, Inject } from 'typedi';
import { LLMVolcengine } from './llm-volcengine';
import { LLMBaidu } from './llm-baidu';
import { LLMBase } from './llm-base';
import { Storage } from '../../storage';
import { JsonSchemaParser } from './json-schema-parser';
import type { MockParams } from './types';

@Service()
export class LLM {
  @Service()
  static JsonSchemaParser = JsonSchemaParser;

  @Inject()
  private llMVolcengine: LLMVolcengine;

  @Inject()
  private llmBaidu: LLMBaidu;

  @Inject()
  private storage: Storage;

  mock(params: Pick<MockParams, 'jsonSchema' | 'requestParser' | 'stream' | 'socketId'>) {
    const systemConfig = this.storage.system.getMemoryConfig();

    if (systemConfig.LLMProvider === 'volcengine') {
      return this.llMVolcengine.mock({
        ...params,
        token: systemConfig.LLMApiToken,
        modelId: systemConfig.LLMId,
      });
    }

    if (systemConfig.LLMProvider === 'baidu') {
      return this.llmBaidu.mock({
        ...params,
        token: systemConfig.LLMApiToken,
        modelId: systemConfig.LLMId,
      });
    }

    return this.mockFail(params);
  }

  mockFail(params: Pick<MockParams, 'stream' | 'socketId'>) {
    if (params.stream) {
      const llmBase = Container.get(LLMBase);

      llmBase.emitMockDataBySocket({
        content: '',
        end: true,
        socketId: params.socketId,
      });

      return;
    }

    return Promise.resolve({
      errorMessage: '模型配置有误，请检查',
    });
  }
}
