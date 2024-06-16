import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';

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
    commonjs(),
    json(),
    babel({
      "presets": ["@babel/preset-typescript"]
    }),
    terser()
	]
};