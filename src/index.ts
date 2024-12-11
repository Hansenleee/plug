import 'reflect-metadata';
import './shared/polyfill';
import { Container } from 'typedi';
import chalk from 'chalk';
import { CoreApp } from './app';
import { Guardian } from './guardian';
import { Configuration } from './configuration';
import { commonLogger, clearLogger } from './shared/log';

export const start = (option) => {
  const coreApp = Container.get(CoreApp);

  Configuration.init(option);
  coreApp.start();
};

export const run = async () => {
  const [command, ...args] = process.argv;
  const guardian = Container.get(Guardian);

  guardian.permanent.createOrphan(
    command,
    args.map((arg) => (arg === 'run' ? 'start' : arg))
  );
};

export const status = () => {
  const guardian = Container.get(Guardian);

  guardian.orphan.status();
};

export const stop = () => {
  const coreApp = Container.get(CoreApp);

  coreApp.stop();
};

export const clear = (option: { log?: boolean; storage?: boolean }) => {
  if (option.storage) {
    const storage = Container.get(Storage);

    storage.clear();
    commonLogger.info('storage 清理完成', { force: true });
  }

  if (option.log) {
    clearLogger();
    global.console.log(chalk.bold.blue('log 清理完成，请重新启动'));
  }

  process.exit();
};
