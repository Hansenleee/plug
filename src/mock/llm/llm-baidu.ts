import fetch from 'node-fetch';
import Container, { Service } from 'typedi';
import { Prompt } from './prompt';
import { LLMBase } from './llm-base';
import { Logger } from '../../shared/log';
import type { MockParams } from './types';

@Service()
export class LLMBaidu extends LLMBase {
  static chatUrl = 'https://qianfan.baidubce.com/v2/chat/completions';

  private readonly prompt = Container.get(Prompt);
  private readonly log = new Logger('LLMBaidu');

  async mock(params: MockParams) {
    return params.stream ? this.mockByStream(params) : this.mockByJSON(params);
  }

  protected async mockByJSON(params: MockParams) {
    const startTime = Date.now();
    const chatMessage = await this.chat(params);

    const chatMessageJson = await chatMessage.json();
    const chatMessageJsonParsed = this.parseLLMResult2Json(chatMessageJson);

    this.log.info(`Mock 生成耗时：${(Date.now() - startTime) / 1000}s`);

    if (params.jsonSchema.isPageSchema) {
      return LLMBase.HELP.Pagination.getPageData(chatMessageJsonParsed.data, {
        requestParser: params.requestParser,
      });
    }

    return chatMessageJsonParsed;
  }

  protected async mockByStream(params: MockParams) {
    // return this.mockByJSON(params);
    const startTime = Date.now();
    const chatMessage = await this.chat(params);
    const stream = new LLMBase.HELP.Stream(chatMessage);

    stream
      .on('on-stream-each', (content) => {
        this.emitMockDataBySocket({
          content,
          socketId: params.socketId,
        });
      })
      .on('on-stream-end', () => {
        let pagination = '';

        if (params.jsonSchema.isPageSchema) {
          pagination = JSON.stringify(
            LLMBase.HELP.Pagination.getPage({ requestParser: params.requestParser })
          );
        }

        this.emitMockDataBySocket({
          content: pagination,
          end: true,
          pagination: !!pagination,
          socketId: params.socketId,
        });
      });

    await stream.start();

    this.log.info(`Mock 生成耗时：${(Date.now() - startTime) / 1000}s`);
  }

  private async chat({ modelId, jsonSchema, requestParser, token, stream }: MockParams) {
    return fetch(LLMBaidu.chatUrl, {
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
        stream: !!stream,
      }),
    });
  }
}
