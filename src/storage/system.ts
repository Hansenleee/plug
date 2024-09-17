import { Service } from 'typedi';
import { BaseStorage } from './base';
import { SystemConfig } from '../types';

@Service()
export class SystemStorage extends BaseStorage {
  private static readonly NS = 'system';

  // 用来存储 system 相关的基础配置
  private static readonly CONFIG_KEY = 'config';

  // 内存中储存 system config 的 key
  private static readonly MEM_CONFIG_KEY = 'config';

  constructor() {
    super(SystemStorage.NS);
  }

  init() {
    this.memorySysConfig();
  }

  getConfig(): SystemConfig;
  getConfig(key: keyof SystemConfig): string | number;
  getConfig(key?: keyof SystemConfig) {
    const config = this.persistence.get(SystemStorage.CONFIG_KEY, {});

    return key ? config[key] : config;
  }

  setConfig(partConfig: Partial<SystemConfig>) {
    const originConfig = this.getConfig();

    this.persistence.setMap(SystemStorage.CONFIG_KEY, { ...originConfig, ...partConfig });
    this.memorySysConfig();
  }

  getMemoryConfig(): Partial<SystemConfig> {
    return this.memory.get(SystemStorage.MEM_CONFIG_KEY) || {};
  }

  private memorySysConfig() {
    const systemConfig = this.getConfig();

    this.memory.set(SystemStorage.MEM_CONFIG_KEY, systemConfig);
  }
}
