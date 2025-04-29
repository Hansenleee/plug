import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import { visualizer } from 'rollup-plugin-visualizer';
import copy from 'rollup-plugin-copy';

const IS_DEV = process.env.NODE_ENV === 'dev';
const IS_ANALYZE = !!process.env.BUILD_ANALYZE;

// 这是一个 commonjs 的 npm 包，不能被转换成 es 模块
const DEP_CJS_CROSS_PROXY = 'cross-os-proxy';

export default {
  external: ['chalk'],
  input: ['src/index.ts', 'src/command.ts'],
  output: {
    dir: 'dist',
    format: 'es',
    // 启用代码分割
    chunkFileNames: (chunk) => {
      if (chunk.name.includes(DEP_CJS_CROSS_PROXY)) {
        return '[name]-[hash].cjs';
      }
      return '[name]-[hash].js';
    },
    manualChunks(id) {
      // 如果模块来自 cross-os-proxy
      if (id.includes(DEP_CJS_CROSS_PROXY)) {
        const moduleName = id.split('platforms/')[1].split('/')[0];
        return `vendor-cross-os-proxy-${moduleName}`;
      }
    },
  },
  plugins: [
    // 这里额外说明：根目录下的 tsconfig 需要配置 ui 路径（因为需要配合 eslint 做格式校验），但是打包时需要过滤掉，ui 侧的打包和 node 分离
		typescript({
      tsconfigOverride: { exclude: ['ui']}
    }),
    nodeResolve({}),
    commonjs({
      extensions: ['.js', '.mjs', '.cjs'],
      exclude: [
        'node_modules/cross-os-proxy/**/*.js',
      ],
      transformMixedEsModules: true,
    }),
    json(),
    copy({
      targets: [
        { src: 'node_modules/cross-os-proxy/**/*.sh', dest: 'dist' },
      ]
    }),
    !IS_DEV && terser(),
    IS_ANALYZE && visualizer({
      open: true,
      gzipSize: true
    })
	]
};