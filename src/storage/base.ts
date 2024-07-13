import userHome from 'user-home';

export class BaseStorage {
  static BASE_DIR_ROOT = userHome;

  static init() {}

  private memory: Record<string, any> = {};

  protected appendMemory<T = any>(key: string, ...values: T[]) {
    if (!this.memory[key]) {
      this.memory[key] = [];
    }

    this.memory[key] = this.memory[key].concat(values || []);
  }

  protected getMemory<T = any>(key: string) {
    return this.memory[key] as T;
  }
}
