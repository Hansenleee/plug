import { program } from 'commander';
import { Container } from 'typedi';
import { pkgJson } from './shared/pkg';
import { start, stop, run, status } from './index';
import { Storage } from './storage';

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
  .description('clear plug storage cache')
  .action(() => {
    const storage = Container.get(Storage);

    storage.clear();
  });

program.parse(process.argv);
