import fetch from 'node-fetch';
import Container, { Service } from 'typedi';
import { Prompt } from './prompt';
import { LLMBase, MockParams } from './llm-base';
import { Logger } from '../../shared/log';

@Service()
export class LLMBaidu extends LLMBase {
  static chatUrl = 'https://qianfan.baidubce.com/v2/chat/completions';

  private readonly prompt = Container.get(Prompt);
  private readonly log = new Logger('LLMBaidu');

  async mock({ modelId, jsonSchema, requestParser, token }: MockParams) {
    const startTime = Date.now();
    const chatMessage = await fetch(LLMBaidu.chatUrl, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          {
            content: this.prompt.createSystemPrompt({ jsonSchema, requestParser }),
            role: 'system',
          },
          {
            content: this.prompt.createUserPrompt({ jsonSchema, requestParser }),
            role: 'user',
          },
        ],
        temperature: 0.2,
        max_completion_tokens: 8192,
      }),
    });

    const chatMessageJson = await chatMessage.json();
    const chatMessageJsonParsed = this.parseLLMResult2Json(chatMessageJson);

    this.log.info(`Mock 生成耗时：${(Date.now() - startTime) / 1000}s`);

    if (jsonSchema.isPageSchema) {
      const paginationFactory = this.generatePagination({ requestParser });

      return paginationFactory(chatMessageJsonParsed);
    }

    return chatMessageJsonParsed;
  }

  private parseLLMResult2Json(llmResult: Record<string, any>) {
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
}
