#!/usr/bin/env node

import { program } from 'commander';
import fs from 'fs';
import path from 'path';
import { start } from '../dist/index.js';

const pkg = fs.readFileSync(path.join(process.cwd(), 'package.json'), { encoding: 'utf-8' });
const pkgJson = JSON.parse(pkg);

program
  .version(pkgJson.version, '-v, --version')
  .usage('<command> [options]');

program
  .command('start')
  .description('start plug proxy')
  .option('-p, --port', 'listening port')
  .action(() => {
    start();
  });

program.parse(process.argv)