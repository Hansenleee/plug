import { Service } from 'typedi';
import http from 'http';
import type { Context } from 'koa';

@Service()
export class RecordController {
  saveRecords(request: http.IncomingMessage) {}

  getRecords(ctx: Context) {
    ctx.body = '1111';
  }
}
