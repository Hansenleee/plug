import { Service } from 'typedi';
import { BaseMockOptions } from './base-mocker';
import { StorageMocker } from './storage-mocker';
import { RemoteMocker } from './remote-mocker';
import { IntelligentMocker } from './intelligent-mocker';
import { MockApiItem } from '../types';
import { HttpException } from '../shared/exception';
import { RequestParser } from '../shared/request-parser';

export interface MockOptions extends BaseMockOptions {
  mockType?: 'intelligent' | 'remote';
}

@Service()
export class Mock {
  static StorageMocker = StorageMocker;
  static RemoteMocker = RemoteMocker;
  static IntelligentMocker = IntelligentMocker;

  async invoke(mockItem: MockApiItem, requestParser: RequestParser, options: MockOptions = {}) {
    const { dataType } = mockItem;

    if (dataType === 'define' && !options.mockType) {
      return StorageMocker.create(mockItem, requestParser);
    }

    if (options.mockType === 'intelligent') {
      return IntelligentMocker.create(mockItem, requestParser, options);
    }

    if (dataType === 'url' || options.mockType === 'remote') {
      return RemoteMocker.create(mockItem, requestParser);
    }

    throw new HttpException(-9999, 'Mock Server Error, Mock dateType not found');
  }
}
