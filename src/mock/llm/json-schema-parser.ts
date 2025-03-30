import Container from 'typedi';
import { Services } from '../../service';
import { MockApiItem } from '../../types';
import { Logger } from '../../shared/log';

export interface JsonSchema {
  type: string;
  description?: string;
  properties?: Record<string, JsonSchema>;
  items?: Record<string, JsonSchema>;
}

const log = new Logger('jsonSchemaParser');

export class JsonSchemaParser {
  private static BASE_SCHEMA = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'https://example.com/product.schema.json',
  };
  private static YAPI_TYPE_2_SCHEMA_TYPE = {
    integer: 'number',
  };

  static async getFromInterface(mockItem: MockApiItem) {
    try {
      const service = Container.get(Services);
      const mockItemInfo = await service.yapi.fetchInterface({
        id: mockItem.yapiId,
        token: mockItem.token,
      });
      const resBodyParsed = JSON.parse(mockItemInfo.res_body);
      const schema: JsonSchema = {
        ...JsonSchemaParser.BASE_SCHEMA,
        type: 'object',
        properties: {},
      };
      const traverseBody = (body: Record<string, any>) => {
        const partSchema = {};

        Object.entries(body).forEach(([key, value]) => {
          const { type, description, properties, items } = value;

          partSchema[key] = {
            type: JsonSchemaParser.YAPI_TYPE_2_SCHEMA_TYPE[type] || type,
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

      return new JsonSchemaParser(schema);
    } catch (err) {
      log.warn(`解析成 json schema 失败: ${err.message}`);

      return false;
    }
  }

  constructor(private readonly jsonSchema: JsonSchema) {}

  get isPageSchema() {
    return !!this.getValue(['properties', 'data', 'properties', 'page']);
  }

  get pageDataJsonSchema() {
    return {
      ...JsonSchemaParser.BASE_SCHEMA,
      type: 'object',
      properties: {
        data: this.getValue(['properties', 'data', 'properties', 'data']),
      },
    };
  }

  getValue(pathList?: string[]) {
    if (!pathList || !pathList?.length || !Array.isArray(pathList)) {
      return this.jsonSchema;
    }

    let value = { ...this.jsonSchema };
    pathList.forEach((pathItem) => {
      value = value?.[pathItem];
    });

    return value;
  }
}
