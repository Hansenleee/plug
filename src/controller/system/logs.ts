import { Service } from 'typedi';
import fs from 'fs';
import { JsonController, Get, QueryParams } from 'routing-controllers';
import { BaseController } from '../base';
import { Logger } from '../../shared/log';
import path from 'path';

@Service()
@JsonController('/system')
export class SystemLogsController extends BaseController {
  @Get('/logs/logsTypes')
  async getSystemLogsTypes() {
    const logsDirPath = Logger.DIR;
    const typesSet = new Set<string>();

    fs.readdirSync(logsDirPath, { recursive: false }).forEach((file) => {
      const fileType = file.split('.')?.[0];

      if (fileType) {
        typesSet.add(fileType);
      }
    });

    return this.success(Array.from(typesSet));
  }

  @Get('/logs/logsDates')
  async getSystemLogsDates() {
    const logsDirPath = Logger.DIR;
    const datesSet = new Set<string>();

    fs.readdirSync(logsDirPath, { recursive: false }).forEach((file) => {
      const date = file.split('.')?.[1];

      if (date) {
        datesSet.add(date);
      }
    });

    return this.success(
      Array.from(datesSet).sort((pre, current) => {
        return new Date(current).getTime() - new Date(pre).getTime();
      })
    );
  }

  @Get('/logs/search')
  async getSystemLogs(@QueryParams() query: { logsType?: string; logsDate?: string }) {
    const { logsType, logsDate } = query;
    const logsDirPath = Logger.DIR;

    const logsContent = fs.readFileSync(
      path.join(logsDirPath, `${logsType}.${logsDate}.log`),
      'utf8'
    );

    return this.success(logsContent);
  }
}
