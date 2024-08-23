import path from 'path';
import fs from 'fs';

const pkg = fs.readFileSync(path.join(__dirname, '..', 'package.json'), { encoding: 'utf-8' });

export const pkgJson = JSON.parse(pkg);
