import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

global.__filename = __filename;
global.__dirname = __dirname;

const origWarning = process.emitWarning;

process.emitWarning = function (...args) {
  if (args[2] !== 'DEP0005') {
    return origWarning.apply(process, args);
  }
};
