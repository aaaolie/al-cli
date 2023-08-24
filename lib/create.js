// lib/create.js 创建项目
const commander = require("commander");
const path = require("path");
const fs = require("fs-extra")
const Inquirer = require("inquirer");
const Generator = require("./generator");

module.exports = async function (projectName, options) {
  // 获取当前工作目录
  const cwd = process.cwd();

  // 拼接得到项目目录
  const targetDirectory = path.join(cwd, projectName);

  // 判断目录是否存在
  if (fs.existsSync(targetDirectory)) {
    // 如果存在 force
    if (options.force) {
      await fs.remove(targetDirectory);
    } else {
      // 询问用户是否确定要覆盖
      let { isOverwrite } = await Inquirer.prompt([
        {
          name: "isOverwrite",
          type: "list",
          message: "目标目录已经存在。选择一个操作:",
          choices: [
            {
              name: "覆盖",
              value: true,
            },
            {
              name: "取消",
              value: false,
            },
          ],
        },
      ]);
      if (!isOverwrite) {
        console.log("取消");
        return;
      } else if (isOverwrite) {
        // 移除已存在的目录
        console.log(`\r\nRemoving...`)
        await fs.remove(targetDirectory)
        
      }
    }
  }

  // 创建项目
  const generator = new Generator(projectName, targetDirectory);
  generator.create();
};