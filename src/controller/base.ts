import { Service, Inject } from 'typedi';
import { Services } from '../service';

@Service()
export class BaseController {
  private static readonly SUCCESS_CODE = 0;

  @Inject()
  service: Services;

  protected success<T = any>(data: T) {
    return {
      code: BaseController.SUCCESS_CODE,
      data,
    };
  }
}
