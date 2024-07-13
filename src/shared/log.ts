import chalk from 'chalk';
import { Configuration } from '../configuration';

interface BaseOption {
  force?: boolean;
}

export class Logger {
  static readonly PRE_FIX = 'plug';

  namespace: string;

  constructor(namespace?: string) {
    this.namespace = namespace ? `${Logger.PRE_FIX}-${namespace}` : Logger.PRE_FIX;
  }

  info(content: string | Record<string, unknown>, option: BaseOption = {}) {
    if (typeof content === 'string') {
      return this.baseLog(chalk.bold.blue(this.namespace), content, option);
    }

    return this.baseDir(content, option);
  }

  warn(content: string, option: BaseOption = {}) {
    return this.baseLog(chalk.bold.red(this.namespace), content, {
      ...option,
      force: true,
    });
  }

  private getFormatDate() {
    const date = new Date(Date.now());
    const time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${time}`;
  }

  private baseLog(namespace: string, content: string, option: BaseOption = {}) {
    if (Configuration.IS_DEBUG || option.force) {
      global.console.log(namespace, chalk.yellow(this.getFormatDate()), content);
    }
  }

  private baseDir(content: Record<string, unknown>, option: BaseOption = {}) {
    if (Configuration.IS_DEBUG || option.force) {
      global.console.dir(content);
    }
  }
}
