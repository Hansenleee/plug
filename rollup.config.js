import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
// import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import { visualizer } from 'rollup-plugin-visualizer';

const IS_DEV = process.env.NODE_ENV === 'dev';
const IS_ANALYZE = !!process.env.BUILD_ANALYZE;

export default {
  external: ['chalk'],
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'es',
  },
  plugins: [
		typescript(),
    nodeResolve({
      resolveOnly: module => {
        return !module.includes('babel');
      }
    }),
    commonjs(),
    json(),
    // babel({
    //   "presets": ["@babel/preset-typescript"]
    // }),
    !IS_DEV && terser(),
    IS_ANALYZE && visualizer({
      open: true,
      gzipSize: true
    })
	]
};