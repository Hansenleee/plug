import chalk from 'chalk';
import log4js from 'log4js';
import path from 'path';
import fs from 'fs';
import { Configuration } from '../configuration';

interface BaseOption {
  force?: boolean;
}

const LOG_LAYOUT = {
  type: 'pattern',
  pattern: '[%d] [%p] - %m',
};

export class Logger {
  static readonly PRE_FIX = 'plug';
  static readonly DIR = path.join(Configuration.BASE_CACHE_DIR, 'log');

  namespace: string;

  private infoLogger!: log4js.Logger;
  private warnLogger!: log4js.Logger;

  constructor(namespace?: string) {
    initLogger();
    this.namespace = namespace ? `${Logger.PRE_FIX}-${namespace}` : Logger.PRE_FIX;
    this.infoLogger = log4js.getLogger('info');
    this.warnLogger = log4js.getLogger('warn');
  }

  info(content: string | Record<string, unknown>, option: BaseOption = {}) {
    if (typeof content === 'string') {
      if (Configuration.IS_DEBUG || option.force) {
        this.infoLogger.info(`${chalk.bold.blue(this.namespace)} ${content}`);
      }

      return;
    }

    return this.baseDir(content, option);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  warn(content: string, option: BaseOption = {}) {
    return this.warnLogger.warn(`${chalk.bold.red(this.namespace)} ${content}`);
  }

  private baseDir(content: Record<string, unknown>, option: BaseOption = {}) {
    if (Configuration.IS_DEBUG || option.force) {
      global.console.dir(content);
    }
  }
}

const initLogger = () => {
  if (log4js.isConfigured()) {
    return;
  }

  log4js.configure({
    appenders: {
      console: {
        type: 'console',
        layout: LOG_LAYOUT,
      },
      infoFile: {
        type: 'dateFile',
        filename: path.join(Logger.DIR, 'info'),
        pattern: 'yyyy-MM-dd.log',
        alwaysIncludePattern: true,
        layout: LOG_LAYOUT,
      },
      warnFile: {
        type: 'dateFile',
        filename: path.join(Logger.DIR, 'warn'),
        pattern: 'yyyy-MM-dd.log',
        alwaysIncludePattern: true,
        layout: LOG_LAYOUT,
      },
    },
    categories: {
      default: {
        appenders: ['console', 'infoFile', 'warnFile'],
        level: 'all',
      },
      info: {
        appenders: ['console', 'infoFile'],
        level: 'all',
      },
      warn: {
        appenders: ['console', 'warnFile'],
        level: 'all',
      },
    },
  });
};

export const clearLogger = () => {
  fs.rmSync(Logger.DIR, { recursive: true });
};

export const commonLogger = new Logger('');
