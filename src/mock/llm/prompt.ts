import { Service } from 'typedi';
import { LLMBase } from './llm-base';
import { JsonSchemaParser } from './json-schema-parser';
import { RequestParser } from '../../shared/request-parser';

interface Meta {
  jsonSchema: JsonSchemaParser;
  requestParser: RequestParser;
}

@Service()
export class Prompt {
  static JSON_RESULT_TAG = 'mock_result';
  private static BASE_PROMPT =
    '我会发你一份 http 接口返回内容的 json schema 描述，你需要基于此 json schema 进行合理化的 Mock，同时要满足以下要求：';
  private static PROMPT_REQUIRED = [
    '字段的 description 里如果有枚举描述，Mock 的内容需要参考枚举描述，如果没有尽量返回中文的 Mock 内容',
    `请直接进行 Mock 并在 <${Prompt.JSON_RESULT_TAG}> 标签内以 json 形式给出你的结果`,
    '返回的结果里，所有对象下的属性的值，都不能是空字符串',
  ];

  createSystemPrompt(meta: Meta) {
    const { jsonSchema, requestParser } = meta;
    const requestParams = requestParser.getJSONRequestParams();
    const promptRequired = [...Prompt.PROMPT_REQUIRED];

    if (jsonSchema.isPageSchema) {
      promptRequired.push(
        `data 的长度为 ${requestParams?.page?.pageSize || LLMBase.DEFAULT_MOCK_PAGE_SIZE}`
      );
    }

    return `
    ${Prompt.BASE_PROMPT}
    ${promptRequired.map((text, index) => `${index + 1}:${text}`).join('\n')}
    `;
  }

  createUserPrompt(meta: Meta) {
    const { jsonSchema } = meta;
    let promptSchema = { ...jsonSchema };

    if (jsonSchema.isPageSchema) {
      promptSchema = jsonSchema.pageDataJsonSchema;
    }

    return JSON.stringify(promptSchema);
  }
}
