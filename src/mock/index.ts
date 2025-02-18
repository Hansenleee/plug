import { Service } from 'typedi';
import { StorageMocker } from './storage-mocker';
import { RemoteMocker } from './remote-mocker';
import { IntelligentMocker } from './intelligent-mocker';
import { MockApiItem } from '../types';
import { HttpException } from '../shared/exception';
import { RequestParser } from '../shared/request-parser';

export interface MockOptions {
  mockType?: 'intelligent';
}

@Service()
export class Mock {
  static StorageMocker = StorageMocker;
  static RemoteMocker = RemoteMocker;
  static IntelligentMocker = IntelligentMocker;

  async invoke(mockItem: MockApiItem, requestParser: RequestParser, options: MockOptions = {}) {
    const { dataType, intelligent } = mockItem;

    if (dataType === 'define' && !options.mockType) {
      return StorageMocker.create(mockItem, requestParser);
    }

    if (intelligent || options.mockType === 'intelligent') {
      const intelligentMockIns = await IntelligentMocker.create(mockItem, requestParser);

      if (intelligentMockIns.mockResult === false) {
        return RemoteMocker.create(mockItem, requestParser);
      }

      return intelligentMockIns;
    }

    if (dataType === 'url') {
      return RemoteMocker.create(mockItem, requestParser);
    }

    throw new HttpException(-9999, 'Mock Server Error, Mock dateType not found');
  }
}
