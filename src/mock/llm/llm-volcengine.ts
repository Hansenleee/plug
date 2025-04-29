import fetch from 'node-fetch';
import Container, { Service } from 'typedi';
import { Prompt } from './prompt';
import { LLMBase } from './llm-base';
import { Logger } from '../../shared/log';
import type { MockParams } from './types';

@Service()
export class LLMVolcengine extends LLMBase {
  static chatUrl = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
  static STREAM_PREFIX = /^data:\s/;
  static STREAM_END_FLAG = '[DONE]';

  private readonly prompt = Container.get(Prompt);
  private readonly log = new Logger('LLMVolcengine');

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
    const startTime = Date.now();
    const chatMessage = await this.chat(params);

    try {
      for await (const chunk of chatMessage.body) {
        const chunkStr = chunk.toString();
        let combinedStr = '';

        chunkStr
          .split('\n')
          .filter((str) => !!str)
          .forEach((str) => {
            const replacedStr = str.replace(LLMVolcengine.STREAM_PREFIX, '');

            if (replacedStr === LLMVolcengine.STREAM_END_FLAG) {
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

              return;
            }

            try {
              const parsed = JSON.parse(replacedStr).choices[0].delta.content;

              combinedStr += parsed;

              return parsed;
            } catch (err) {
              this.log.warn(`llm 转换失败，原始数据: ${str}，失败原因:${err.message}`);
            }
          });

        if (combinedStr) {
          this.emitMockDataBySocket({
            content: combinedStr,
            socketId: params.socketId,
          });
        }
      }
    } catch (err) {
      this.log.warn(`llm 数据处理失败，失败原因:${err.message}`);
    }

    this.log.info(`Mock 生成耗时：${(Date.now() - startTime) / 1000}s`);
  }

  private async chat({ modelId, jsonSchema, requestParser, token, stream }: MockParams) {
    return fetch(LLMVolcengine.chatUrl, {
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
        stream: !!stream,
      }),
    });
  }
}
