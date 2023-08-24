#!/usr/bin/env node

// 命令行输入和参数解析插件 commander
// const program = require("commander");

// 如果程序较为复杂，用户需要以多种方式来使用 Commander，如单元测试等。
const { Command } = require("commander");
const chalk = require("chalk");
const program = new Command();

/* --------------------   version api ----------------------------*/

// 引入脚手架版本号
const { version } = require("../package");

// 定义命令程序的版本号 .version('0.0.1', '-v, --version')
// 第一个参数  版本号<必须>
// 第二个参数  自定义标志 < 可省略 >：默认为 - V 和--versio
// 输入 al_cli -v 或者 al_cli --version 既可以得出当前脚手架版本号
program.version(version);

/* --------------------   usage api ----------------------------*/

// usage 修改帮助信息的首行提示
program.usage("<command> [项目名称]");

/* --------------------   commander api ----------------------------*/

// 用于定义命令选项：.option('-n, --name  <name>', 'your name', 'GK')
// 第一个参数  自定义标志<必须>：分为短标识-、长标识--。中间用逗号、竖线或者空格分割；。
// 标志后面可跟参数, 可以用 <> 或者[]修饰, 前者意为必须参数，后者意为可选参数
// 第二个参数  选项描述 < 省略不报错 >：在使用--help 命令时显示标志描述
// 第三个参数  选项参数默认值，可选
/* program.option("-n, --name <name>", ["我的名字是"],'al');
program.option("-a --age [age]", ["我的年龄是"],30);
program.option("-s|--sex [sex]", ["我的性别是"],'man'); */

/* --------------------   parse api ----------------------------*/

/* 
  运行 al-cli-init.js 可以理解为：这个命令是截取的文件最后一个单词，
  当你有一个文件需要执行时，这个文件的命名需要与你在 package.json 中 bin 对象中指定的文件前缀一致，后缀自定义
  command 会注册这个指令，且自动取寻找 组合之后名称 的文件运行
  如果我注册的命令为 aa，但是我实际文件名后缀为 init，运行 al aa 则会报错
  program.command("aa", "创建新项目");

*/
// program.command("init", "创建新项目"); 

/* 当然我还是建议使用下面这种方式，看起来更清晰一点 */
program
  .command("create <project-name>")
  .description(chalk.cyan('创建新项目'))
  .option("-f, --force", "overwrite target directory if it exists") // 强制覆盖
  .action((projectName, options) => {
    require("../lib/create.js")(projectName, options);
  });

// 解析通过 option 设置的自定义命令参数，此api一般是最后调用，第一个参数是要解析的字符串数组，也可以省略参数而使用默认值process.argv
program.parse(process.argv); // 指明，按 node 约定
// 如果参数遵循与 node 不同的约定，可以在第二个参数中传递from选项：
// program.parse(["-f", "filename"], { from: "user" });

// 获取解析之后的所有命令
// const options = program.opts();

/* console.log("  -  name", options.name);
console.log("  -  age", options.age);
console.log("  -  sex", options.sex); */
