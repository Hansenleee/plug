import { JsonSchemaParser } from './json-schema-parser';
import { RequestParser } from '../../shared/request-parser';

export interface MockParams {
  model?: string;
  modelId?: string;
  jsonSchema: JsonSchemaParser;
  requestParser: RequestParser;
  token?: string;
  stream?: boolean;
  socketId?: string;
}
