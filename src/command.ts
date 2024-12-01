import { program } from 'commander';
import { pkgJson } from './shared/pkg';
import { start, stop, run, status, clear } from './index';

program.version(pkgJson.version, '-v, --version');

program
  .command('start')
  .description('start plug proxy')
  .option('-p, --port <port>', 'listening port')
  .option('-d, --debug', 'listening port')
  .option('-op, --originProxyPort <originProxyPort>', 'origin proxy port')
  .option('-s, --source <source>', 'origin proxy port')
  .option('-su, --skipUpgrade', 'skip auto upgrade')
  .action((option) => {
    start(option);
  });

program
  .command('run')
  .description('run plug proxy persistently')
  .option('-p, --port <port>', 'listening port')
  .option('-d, --debug', 'listening port')
  .option('-op, --originProxyPort <originProxyPort>', 'origin proxy port')
  .option('-s, --source <source>', 'origin proxy port')
  .option('-su, --skipUpgrade', 'skip auto upgrade')
  .action(() => {
    run();
  });

program
  .command('status')
  .description('plug running status')
  .action(() => {
    status();
  });

program
  .command('stop')
  .description('stop plug proxy')
  .action(() => {
    stop();
  });

program
  .command('clear')
  .description('clear plug cache')
  .option('-l, --log', 'clear log data')
  .option('-s, --storage', 'clear storage data')
  .action((option) => {
    clear(option);
  });

program.parse(process.argv);
