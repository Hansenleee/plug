import 'reflect-metadata';
import './shared/polyfill';
import { Container } from 'typedi';
import { CoreApp } from './app';
import { Guardian } from './guardian';
import { Configuration } from './configuration';

export const start = (option) => {
  const coreApp = Container.get(CoreApp);

  Configuration.init(option);
  coreApp.start();
};

export const run = async () => {
  const [command, ...args] = process.argv;
  const guardian = Container.get(Guardian);

  guardian.orphan.createOrphan(
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
