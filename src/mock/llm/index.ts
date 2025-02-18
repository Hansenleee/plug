import { Service, Inject } from 'typedi';
import { LLMVolcengine } from './llm-volcengine';
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
  private storage: Storage;

  mock(params: Pick<MockParams, 'jsonSchema' | 'requestParser'>) {
    const systemConfig = this.storage.system.getMemoryConfig();

    return this.llMVolcengine.mock({
      ...params,
      token: systemConfig.LLMApiToken,
      modelId: systemConfig.LLMId,
    });
  }
}
