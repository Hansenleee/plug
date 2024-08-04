import { Service, Inject } from 'typedi';
import { Services } from '../service';
import { Storage } from '../storage';

@Service()
export class BaseController {
  private static readonly SUCCESS_CODE = 0;

  @Inject()
  service: Services;

  @Inject()
  storage: Storage;

  protected success<T = any>(data: T) {
    return {
      code: BaseController.SUCCESS_CODE,
      data,
    };
  }
}
