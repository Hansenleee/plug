import fetch from 'node-fetch';
import Container from 'typedi';
import { BaseMocker } from './base-mocker';
import { Services } from '../service';
import { Logger } from '../shared/log';

const PROMPT_REQUIRED = [
  'mock 内容需要尽量语义化且真实',
  // '接口返回内容里如果有 data.page，那就代表接口是分页的，data.page.totalSize 代表总数量，data.page.curPage 代表当前是第几页，data.page.pageSize 代表当前分页 size',
  // '如果接口是分页的，mock 数据里的 data.page.pageSize 就设置为 15 吧，且 totalSize 和 curPage 和 pageSize 必须相互满足',
  // '如果接口是分页的，接口返回内容里的 data.data 代表分页数据，它需要和分页的 totalSize、curPage、pageSize 逻辑互相满足',
];

const YAPI_TYPE_2_SCHEMA_TYPE = {
  integer: 'number',
};

export class IntelligentMocker extends BaseMocker {
  mockResult?: boolean;
  private readonly service = Container.get(Services);
  private log = new Logger('intelligentMock');

  async invoke() {
    const jsonSchema = await this.getInterfaceJsonSchema();

    if (!jsonSchema) {
      this.mockResult = false;
      return;
    }

    this.mockData = await this.callLLMtoMock(jsonSchema);
  }

  // 获取标准的接口响应的 json schema
  private async getInterfaceJsonSchema() {
    try {
      const mockItemInfo = await this.service.yapi.fetchInterface({
        id: this.mockItem.yapiId,
        token: this.mockItem.token,
      });
      const resBodyParsed = JSON.parse(mockItemInfo.res_body);
      const schema = {
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        $id: 'https://example.com/product.schema.json',
        type: 'object',
        properties: {},
      };
      const traverseBody = (body: Record<string, any>) => {
        const partSchema = {};

        Object.entries(body).forEach(([key, value]) => {
          const { type, description, properties, items } = value;

          partSchema[key] = {
            type: YAPI_TYPE_2_SCHEMA_TYPE[type] || type,
          };

          if (description) {
            partSchema[key].description = description;
          }

          if (properties) {
            partSchema[key].properties = traverseBody(properties);
          }

          if (items) {
            partSchema[key].items = traverseBody(items.properties || {});
          }
        });

        return partSchema;
      };

      schema.properties = traverseBody(resBodyParsed?.properties || {});

      return schema;
    } catch (err) {
      this.log.warn('解析成 json schema 失败');

      return false;
    }
  }

  private async callLLMtoMock(jsonSchema: object) {
    const llmGenerateData = await fetch('http://localhost:11434/api/generate', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2:3b',
        prompt: `我会发你一份 http 接口返回内容的 json schema 描述，帮我 mock 一份数据，同时需要满足以下要求：${PROMPT_REQUIRED.join(
          '、'
        )} 。这个是 json schema :${JSON.stringify(jsonSchema)}`,
        format: 'json',
        stream: false,
      }),
    });

    const stringMockData = await llmGenerateData.text();
    let jsonMockData: { response?: string } = {};

    try {
      jsonMockData = JSON.parse(stringMockData);
      jsonMockData = JSON.parse(jsonMockData.response);
      // eslint-disable-next-line no-empty
    } catch (_) {}

    return jsonMockData;
  }
}
