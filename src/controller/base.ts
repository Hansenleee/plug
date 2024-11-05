import { Service, Inject } from 'typedi';
import { Services } from '../service';
import { Storage } from '../storage';
import { HttpException } from '../shared/exception';

@Service()
export class BaseController {
  // 存储标识
  protected static readonly YAPI_NS = 'yapi';
  // 接口标识
  private static readonly SUCCESS_CODE = 0;
  private static readonly ERROR_CODE_REQUIRED = 9999;

  @Inject()
  service: Services;

  @Inject()
  storage: Storage;

  protected required(params: Record<string, unknown>, requiredFields: string[]) {
    const emptyFields = requiredFields.filter((fieldKey) => {
      if (!params[fieldKey] && params[fieldKey] !== 0 && params[fieldKey] !== false) {
        return true;
      }

      return false;
    });

    if (emptyFields?.length) {
      throw new HttpException(
        BaseController.ERROR_CODE_REQUIRED,
        `${emptyFields.join('、')}字段不能为空`
      );
    }
  }

  protected success<T = any>(data: T) {
    return {
      code: BaseController.SUCCESS_CODE,
      data,
    };
  }

  protected error(code: number, message: string) {
    return {
      code,
      message,
    };
  }

  protected page<T = any>(dataList: T[], page: { pageNo: number; pageSize: number }) {
    const dataLength = dataList.length;
    const start = (page.pageNo - 1) * page.pageSize;

    return this.success({
      data: dataList.slice(start, start + page.pageSize),
      page: {
        current: page.pageNo,
        pageSize: page.pageSize,
        total: dataLength,
      },
    });
  }
}
