import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

global.__filename = __filename;
global.__dirname = __dirname;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
