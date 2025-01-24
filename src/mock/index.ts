import { Service } from 'typedi';
import { StorageMocker } from './storage-mocker';
import { RemoteMocker } from './remote-mocker';
import { IntelligentMocker } from './intelligent-mocker';
import { MockApiItem } from '../types';
import { HttpException } from '../shared/exception';
import { RequestParams } from './base-mocker';

@Service()
export class Mock {
  static StorageMocker = StorageMocker;
  static RemoteMocker = RemoteMocker;
  static IntelligentMocker = IntelligentMocker;

  async invoke(mockItem: MockApiItem, request: RequestParams) {
    const { dataType, intelligent } = mockItem;

    if (dataType === 'define') {
      return StorageMocker.create(mockItem, request);
    }

    if (intelligent) {
      const intelligentMockIns = await IntelligentMocker.create(mockItem, request);

      if (intelligentMockIns.mockResult === false) {
        return RemoteMocker.create(mockItem, request);
      }

      return intelligentMockIns;
    }

    if (dataType === 'url') {
      return RemoteMocker.create(mockItem, request);
    }

    throw new HttpException(-9999, 'Mock Server Error, Mock dateType not found');
  }
}
