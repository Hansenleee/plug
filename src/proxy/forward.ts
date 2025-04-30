import Container, { Service } from 'typedi';
import http from 'http';
import { Storage } from '../storage';
import { Logger } from '../shared/log';
import { RequestParser } from '../shared/request-parser';
import { UrlParser } from '../shared/url-parser';
import { ForwardItem, ProxyAddedType } from '../types';
import { RequestHelper } from './request-helper';

const log = new Logger('proxy-forward');

interface ForwardMatchItem {
  forwardItem?: ForwardItem;
  urlMatch: Record<string, string>;
}

@Service()
export class Forward {
  has(request: http.IncomingMessage) {
    const storage = Container.get(Storage);
    let regMatch: Record<string, string> = {};
    const forward = storage.forward.getForwardList().find((forwardItem) => {
      const { enable, matchType, matchValue } = forwardItem;

      if (!enable) {
        return false;
      }

      if (matchType === 'string') {
        return request.parser.completeUrl.href === matchValue;
      }

      if (matchType === 'regExp') {
        try {
          const reg = new RegExp(matchValue);
          const matchResult = request.parser.completeUrl.href.match(reg);

          if (!matchResult) {
            return false;
          }

          regMatch = {};
          Object.keys(matchResult).forEach((key) => {
            if (Number.isInteger(+key)) {
              regMatch[+key] = matchResult[key];
            }
          });

          return true;
        } catch (err) {
          log.warn(`转发错误：${err.message}`);
        }
      }

      return false;
    });

    return {
      forwardItem: forward,
      urlMatch: regMatch,
    } satisfies ForwardMatchItem;
  }

  forward(request: http.IncomingMessage, response: http.ServerResponse, options: ForwardMatchItem) {
    const { forwardItem } = options;
    const requestParser = this.getForwardParser(request, options);
    const requestHelper = new RequestHelper(request, response, {
      parser: requestParser,
      extraReqHeader: this.transformHeaders2Object(forwardItem.requestSetting.addedHeaders),
      extraResHeader: {
        'x-plug-proxy': 'true',
        'x-plug-forward-id': forwardItem.id,
        ...this.transformHeaders2Object(forwardItem.responseSetting.addedHeaders),
      },
      rt: forwardItem.rt,
    });

    requestHelper
      .on('beforeRequest', () => {
        log.info(`${requestParser.completeUrl.pathname} 接口触发转发规则[${forwardItem.id}]`);
      })
      .on('errorRequest', (error) => {
        log.warn(`${requestParser.completeUrl.pathname} 接口转发异常: ${error.message}`, {
          force: true,
        });
      });

    return requestHelper.invokeRequest();
  }

  private getForwardParser(request: http.IncomingMessage, options: ForwardMatchItem) {
    const { forwardItem, urlMatch } = options;
    const { addedUrlParams = [] } = forwardItem.requestSetting;

    if (!forwardItem.forwardValue) {
      return request.parser;
    }

    if (Object.keys(urlMatch).length === 0) {
      return RequestParser.createByHref(
        UrlParser.appendSearch(forwardItem.forwardValue, addedUrlParams),
        { method: request.method }
      );
    }

    let finalForwardValue = forwardItem.forwardValue;

    Object.keys(urlMatch).forEach((key) => {
      const matchedKey = `$${key}`;

      finalForwardValue = finalForwardValue.replace(matchedKey, urlMatch[key]);
    });

    return RequestParser.createByHref(UrlParser.appendSearch(finalForwardValue, addedUrlParams), {
      method: request.method,
    });
  }

  private transformHeaders2Object(headers: ProxyAddedType = []) {
    return headers.reduce(
      (headersObj, current) => ({
        ...headersObj,
        [current.key]: current.value,
      }),
      {}
    );
  }
}
