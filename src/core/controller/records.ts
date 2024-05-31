import Container, { Service } from 'typedi';
import http from 'http';
import type { Context } from 'koa';
import { RecordsStorage } from '../storage';

@Service()
export class RecordController {
  saveRecords(request: http.IncomingMessage) {
    const recordsStorage = Container.get<RecordsStorage>(RecordsStorage);

    recordsStorage.storeRecord({
      url: request.url,
    });
  }

  getRecords(ctx: Context) {
    ctx.body = '1111';
  }
}
