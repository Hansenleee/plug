import { Service } from 'typedi';
import http from 'http';
import { StorageMocker } from './storage-mocker';
import { RemoteMocker } from './remote-mocker';
import { MockApiItem } from '../types';
import { HttpException } from '../shared/exception';

@Service()
export class Mock {
  static StorageMocker = StorageMocker;
  static RemoteMocker = RemoteMocker;

  async invoke(
    request: http.IncomingMessage,
    response: http.ServerResponse,
    mockItem: MockApiItem
  ) {
    const { dataType } = mockItem;

    if (dataType === 'define') {
      return StorageMocker.create(request, response, mockItem);
    }

    if (dataType === 'url') {
      return RemoteMocker.create(request, response, mockItem);
    }

    throw new HttpException(-9999, 'Mock Server Error, Mock dateType not found');
  }
}
