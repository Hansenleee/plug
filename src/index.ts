import 'reflect-metadata';
import './shared/polyfill';
import { Container } from 'typedi';
import { CoreApp } from './app';
import { Configuration } from './configuration';

export const start = (option) => {
  const coreApp = Container.get(CoreApp);

  Configuration.init(option);
  coreApp.start();
};

export const stop = () => {
  const coreApp = Container.get(CoreApp);

  coreApp.stop();
};
