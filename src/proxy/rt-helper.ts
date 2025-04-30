export class RtHelper {
  static promisify<T = any>(func: () => Promise<T>, rt: number) {
    if (!rt) {
      return func();
    }

    return Promise.all([
      func(),
      (() => {
        return RtHelper.sleep(rt);
      })(),
    ]).then(([result]) => result);
  }

  static start(rt: number) {
    return new RtHelper(rt);
  }

  private static sleep(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  private startTime = Date.now();

  constructor(private readonly rt: number) {}

  async end() {
    if (!this.rt) {
      return;
    }

    const endTime = Date.now();
    const end2StartTime = endTime - this.startTime;

    if (end2StartTime > this.rt) {
      return;
    }

    await RtHelper.sleep(this.rt - end2StartTime);
  }
}
