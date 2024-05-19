module.exports = {
  // 一行大卖的最大字符数，默认80
  printWidth: 100,
  // 箭头函数单个参数是否要包含省略号
  arrowParens: 'always',
  // object对象里面的key和value值和括号间的空格
  bracketSpacing: true,
  // 被引号包裹的代码是否进行格式化
  embeddedLanguageFormatting: 'auto',
  // html中的空格敏感性
  htmlWhitespaceSensitivity: 'ignore',
  // 自动插入pragma到已经完成的format的文件开头
  insertPragma: false,
  // 文章换行
  proseWrap: 'preserve',
  // object对象中key值是否加引号
  quoteProps: 'as-needed',
  // 格式化有特定开头编译指示的文件
  requirePragma: false,
  // 结尾是否添加分号
  semi: true,
  // 使用单引号
  singleQuote: true,
  // tab对应几个空格
  tabWidth: 2,
  // 尾部逗号设置，es5是尾部逗号兼容es5，none就是没有尾部逗号，all是指所有可能的情况 node8和es2017以上的环境 */
  trailingComma: 'es5',
  // 是否使用tab来缩进
  useTabs: false,
  // vue script和style标签中是否缩进开启可能会破坏编辑器的代码折叠
  vueIndentScriptAndStyle: false,
  'editor.tabSize': 2,
  // 行尾换行符：使用 Unix 风格的换行符，即 \n
  endOfLine: 'lf',
};
