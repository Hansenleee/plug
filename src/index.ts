import 'reflect-metadata';
import { Container } from 'typedi';
import { CoreApp } from './app';
import { Configuration } from './configuration';

export const start = (option) => {
  const coreApp = Container.get<CoreApp>(CoreApp);

  Configuration.init(option);
  coreApp.start();
};
