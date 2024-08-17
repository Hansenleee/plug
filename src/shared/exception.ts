export class HttpException extends Error {
  errorContent!: { code: number; message: string };

  constructor(private readonly code: number, private readonly msg: string) {
    super(`code: ${code}, msg: ${msg}`);

    this.errorContent = {
      code,
      message: msg,
    };
  }
}
