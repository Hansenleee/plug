import { program } from 'commander';
import fs from 'fs';
import path from 'path';
import { start } from './index';

const pkg = fs.readFileSync(path.join(process.cwd(), 'package.json'), { encoding: 'utf-8' });
const pkgJson = JSON.parse(pkg);

program.version(pkgJson.version, '-v, --version').usage('<command> [options]');

program
  .command('start')
  .description('start plug proxy')
  .option('-p, --port <port>', 'listening port')
  .option('-d, --debug', 'listening port')
  .option('-op, --originProxyPort <originProxyPort>', 'origin proxy port')
  .action((option) => {
    start(option);
  });

program.parse(process.argv);
