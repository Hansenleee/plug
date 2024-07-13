export class BaseController {
  private static readonly SUCCESS_CODE = 0;

  protected success<T = any>(data: T) {
    return {
      code: BaseController.SUCCESS_CODE,
      data,
    };
  }
}
