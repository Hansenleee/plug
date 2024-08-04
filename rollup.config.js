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
    // file: 'dist/index.js',
    dir: 'dist',
    format: 'es',
  },
  plugins: [
    // 这里额外说明：根目录下的 tsconfig 需要配置 ui 路径（因为需要配合 esilnt 做格式校验），但是打包时需要过滤掉，ui 侧的打包和 node 分离
		typescript({
      tsconfigOverride: { exclude: ['ui']}
    }),
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