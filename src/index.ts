import 'reflect-metadata';
import { Container } from 'typedi';
import { CoreApp } from './core';

export const start = () => {
  const coreApp = Container.get<CoreApp>(CoreApp);

  coreApp.start();
}