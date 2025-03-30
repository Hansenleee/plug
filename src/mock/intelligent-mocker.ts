import Container from 'typedi';
import { BaseMocker } from './base-mocker';
import { LLM } from './llm';

export class IntelligentMocker extends BaseMocker {
  mockResult?: boolean;

  private readonly llm = Container.get(LLM);

  async invoke() {
    const jsonSchema = await LLM.JsonSchemaParser.getFromInterface(this.mockItem);

    if (!jsonSchema) {
      this.mockResult = false;
      this.mockData = { message: 'Mock 失败' };
      return;
    }

    this.mockData = await this.llm.mock({ jsonSchema, requestParser: this.requestParser });
  }
}
