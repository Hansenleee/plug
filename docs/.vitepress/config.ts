import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Plug proxy",
  description: "An https/http proxy tool",
  base: '/plug/',
  themeConfig: {
    logo: { src: 'https://leebucket01.oss-cn-shanghai.aliyuncs.com/Statics/images/plug-logo-opacity.png' },
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Doc', link: '/install' }
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
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Hansenleee/plug' }
    ]
  }
})
