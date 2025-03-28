import { Service, Inject } from 'typedi';
import { LLMVolcengine } from './llm-volcengine';
import { LLMBaidu } from './llm-baidu';
import type { MockParams } from './llm-base';
import { Storage } from '../../storage';
import { JsonSchemaParser } from './json-schema-parser';

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

  mock(params: Pick<MockParams, 'jsonSchema' | 'requestParser'>) {
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

    return Promise.resolve({
      errorMessage: '模型配置有误，请检查',
    });
  }
}
