import { defineConfig } from 'vitepress';
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'plug proxy',
  description: 'A free and open source https/http proxy tool',
  base: '/plug/',
  head: [
    [
      'link',
      {
        rel: 'icon',
        href: 'https://leebucket01.oss-cn-shanghai.aliyuncs.com/Statics/images/plug-logo-opacity.png',
      },
    ],
  ],
  themeConfig: {
    logo: {
      src: 'https://leebucket01.oss-cn-shanghai.aliyuncs.com/Statics/images/plug-logo-opacity.png',
    },
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Doc', link: '/install' },
    ],

    sidebar: [
      {
        text: '安装',
        link: '/install',
      },
      {
        text: '启动',
        link: '/start',
      },
      {
        text: '使用',
        items: [
          { text: 'pc 端使用', link: '/use-pc' },
          { text: '移动端使用', link: '/use-mobile' },
        ],
      },
      {
        text: '功能',
        items: [
          { text: '监控', link: '/monitoring' },
          { text: '转发', link: '/forward' },
          { text: 'mock', link: '/mock' },
        ],
      },
      {
        text: '系统配置',
        link: '/system-config',
      },
      {
        text: 'CLI 命令',
        link: '/cli',
      },
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/Hansenleee/plug' }],
  },
  markdown: {
    config(md) {
      md.use(groupIconMdPlugin)
    },
  },
  vite: {
    plugins: [
      groupIconVitePlugin()
    ],
  }
});
