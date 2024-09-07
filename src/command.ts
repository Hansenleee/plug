import { program } from 'commander';
import { pkgJson } from './shared/pkg';
import { start } from './index';

program.version(pkgJson.version, '-v, --version');

program
  .command('start')
  .description('start plug proxy')
  .option('-p, --port <port>', 'listening port')
  .option('-d, --debug', 'listening port')
  .option('-op, --originProxyPort <originProxyPort>', 'origin proxy port')
  .option('-s, --source <source>', 'origin proxy port')
  .action((option) => {
    start(option);
  });

program.parse(process.argv);
