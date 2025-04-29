import { Service } from 'typedi';
import type { Response } from 'node-fetch';
import { Logger } from '../../shared/log';

export type EventName = 'on-stream-end' | 'on-stream-each';
export type EventFunc = (content: string) => void;

@Service()
export class LLMStreamHelper {
  static STREAM_PREFIX = /^data:\s/;
  static STREAM_END_FLAG = '[DONE]';

  private eventMap: Partial<Record<EventName, EventFunc>> = {};
  private readonly log = new Logger('LLMStream');

  constructor(private readonly response: Response) {}

  on(name: EventName, callback: EventFunc) {
    this.eventMap[name] = callback;

    return this;
  }

  async start() {
    try {
      for await (const chunk of this.response.body) {
        const chunkStr = chunk.toString();
        let combinedStr = '';

        chunkStr
          .split('\n')
          .filter((str) => !!str)
          .forEach((str) => {
            const replacedStr = str.replace(LLMStreamHelper.STREAM_PREFIX, '');

            if (replacedStr === LLMStreamHelper.STREAM_END_FLAG) {
              return this.trigger('on-stream-end', [str]);
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
          this.trigger('on-stream-each', [combinedStr]);
        }
      }
    } catch (err) {
      this.log.warn(`llm 数据处理失败，失败原因:${err.message}`);
    }
  }

  private trigger(name: EventName, args: [string]) {
    const func = this.eventMap[name];

    if (typeof func !== 'function') {
      return;
    }

    try {
      func(...args);
    } catch (_err) {
      // eslint-disable-next-line no-empty
    }
  }
}
