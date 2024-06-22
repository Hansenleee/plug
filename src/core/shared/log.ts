import chalk from 'chalk';
import { Configuration } from '../../configuration';

interface BaseOption {
  force?: boolean;
}

export class Logger {
  static readonly PRE_FIX = 'plug';

  namespace: string;

  constructor(namespace?: string) {
    this.namespace = namespace ? `${Logger.PRE_FIX}-${namespace}` : Logger.PRE_FIX;
  }

  info(content: string, option: BaseOption = {}) {
    return this.baseLog(chalk.bold.blue(this.namespace), content, option);
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
}
