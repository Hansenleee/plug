import Container, { Service } from 'typedi';
import http from 'http';
import type { Context } from 'koa';
import { BaseController } from './base';
import { RecordsStorage } from '../storage';

@Service()
export class RecordController extends BaseController {
  saveRecords(request: http.IncomingMessage) {
    const recordsStorage = Container.get<RecordsStorage>(RecordsStorage);

    recordsStorage.storeRecord({
      url: request.url,
    });
  }

  getRecords(ctx: Context) {
    const recordsStorage = Container.get<RecordsStorage>(RecordsStorage);
    const records = recordsStorage.getRecords();

    ctx.body = this.success(records);
  }
}
