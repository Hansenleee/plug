import fetch from 'node-fetch';
import Container, { Service } from 'typedi';
import { Prompt } from './prompt';
import { LLMBase, MockParams } from './llm-base';
import { Logger } from '../../shared/log';
import { SocketIO } from '../../shared/socket';

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

  private async mockByJSON(params: MockParams) {
    const startTime = Date.now();
    const chatMessage = await this.chat(params);

    const chatMessageJson = await chatMessage.json();
    const chatMessageJsonParsed = this.parseLLMResult2Json(chatMessageJson);

    this.log.info(`Mock 生成耗时：${(Date.now() - startTime) / 1000}s`);

    if (params.jsonSchema.isPageSchema) {
      const paginationFactory = this.generatePagination({ requestParser: params.requestParser });

      return paginationFactory(chatMessageJsonParsed);
    }

    return chatMessageJsonParsed;
  }

  private async mockByStream(params: MockParams) {
    const startTime = Date.now();
    const chatMessage = await this.chat(params);
    const socket = Container.get(SocketIO);

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
                const paginationFactory = this.generatePagination({
                  requestParser: params.requestParser,
                });

                pagination = JSON.stringify(paginationFactory.pagination);
              }

              socket.emit(
                'MOCK_STREAM_ITEM',
                {
                  content: pagination,
                  end: true,
                  pagination: !!pagination,
                },
                { socketId: params.socketId }
              );

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
          socket.emit(
            'MOCK_STREAM_ITEM',
            {
              content: combinedStr,
              end: false,
            },
            { socketId: params.socketId }
          );
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
