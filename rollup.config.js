import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  external: ['chalk'],
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'es',
  },
  plugins: [
		typescript(),
    nodeResolve(),
	]
};