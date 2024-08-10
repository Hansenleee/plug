export class HttpException extends Error {
  errorConent!: { code: number; message: string };

  constructor(private readonly code: number, private readonly msg: string) {
    super(`code: ${code}, msg: ${msg}`);

    this.errorConent = {
      code,
      message: msg,
    };
  }
}
