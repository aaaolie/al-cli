// lib/Generator.js

const { getRepoList, getTagList } = require("./http.js");
const ora = require("ora");
const inquirer = require("inquirer");
const util = require("util");
const downloadGitRepo = require("download-git-repo"); // 不支持 Promise
const chalk = require("chalk");
const path = require("path");
const fs = require("fs-extra");

// 添加加载动画
async function wrapLoading(fn, message, ...args) {
  // 使用 ora 初始化，传入提示信息 message
  const spinner = ora(message);
  // 开始加载动画
  spinner.start();

  try {
    // 执行传入方法 fn
    const result = await fn(...args);
    // 状态为修改为成功
    spinner.succeed();
    return result;
  } catch (error) {
    // 状态为修改为失败
    console.log(error, "error");
    if (error.response.status === 401) {
      spinner.fail("请求要求用户的身份认证！");
    } else if (error.response.status === 403) {
      spinner.fail("没有权限访问！");
    } else if (error.response.status === 404) {
      spinner.fail("请求资源不存在！");
    } 
    spinner.stop();
    return false;
  }
}

class Generator {
  constructor(name, targetDir) {
    // 目录名称
    this.name = name;
    // 创建位置
    this.targetDir = targetDir;
    // 对 download-git-repo 进行 promise 化改造
    this.downloadGitRepo = util.promisify(downloadGitRepo);
  }

  // 获取用户选择的模板
  // 1）从远程拉取模板数据
  // 2）用户选择自己新下载的模板名称
  // 3）return 用户选择的名称

  async getRepo() {
    // 1）从远程拉取模板数据
    const repoList = await wrapLoading(getRepoList, "waiting fetch template");
    // console.log(repoList, "repoList");

    if (!repoList) return;
    // 过滤我们需要的模板名称
    const repos = repoList.map((item) => item.name);

    // 2）用户选择自己新下载的模板名称
    const { repo } = await inquirer.prompt({
      name: "repo",
      type: "list",
      message: "请选择需要拉取的模板！",
      choices: repos,
    });

    // 3）return 用户选择的名称
    return repo;
  }

  // 获取用户选择的版本
  // 1）基于 repo 结果，远程拉取对应的 tag 列表
  // 2）自动选择最新版的 tag

  async getTag(repo) {
    // 1）基于 repo 结果，远程拉取对应的 tag 列表
    const tags = await wrapLoading(getTagList, "waiting fetch tag", repo);

    if (!tags) {
      return
    } else { 
      if (tags.length !== 0) {
        // 过滤我们需要的 tag 名称
        const tagsList = tags.map((item) => item?.name);
        console.log(tagsList, "tagsList");

        // 2）return 用户选择的 tag
        let { tag } = await new inquirer.prompt([
          {
            name: "tag",
            type: "list",
            message: "请选择版本分支",
            choices: tagsList,
          },
        ]);

        return tag;
      } else {
        return;
      }
    }
  }

  // 下载远程模板
  // 1）拼接下载地址
  // 2）调用下载方法
  async download(repo, tag) {
    // 1）拼接下载地址
    const requestUrl = `al-cli/${repo}${tag ? "#" + tag : ""}`;
    console.log(requestUrl, "requestUrl");

    // 2）调用下载方法
    let isRequest = await wrapLoading(
      this.downloadGitRepo, // 远程下载方法
      "waiting download template", // 加载提示信息
      requestUrl, // 参数1: 下载地址
      path.resolve(process.cwd(), this.targetDir) // 参数2: 创建位置
    )
    return isRequest;
  }

  // 核心创建逻辑
  // 1）获取模板名称
  // 2）获取 tag 名称
  // 3）下载模板到模板目录
  // 4) 对uniapp模板中部分文件进行读写
  // 5) 模板使用提示
  async create() {
    let repo = undefined
    let tag = undefined;
    const spinner = ora();

    // 1）获取模板名称
    repo = await this.getRepo()

    // 2) 获取 tag 名称
    if (repo) {
      tag = await this.getTag(repo);

      // 3）下载模板到模板目录
      await this.download(repo, tag).then(res => {
        if (res == undefined) {
          // gitCmd(this.name);
          spinner.succeed("创建完成");
          console.log();
          console.log(chalk.green(`cd ${this.name}`));
          console.log(chalk.green("npm install"), "or", chalk.green("yarn"));
          console.log(
            chalk.green("npm start"),
            "or",
            chalk.green("yarn run start")
          );
        } else {
          return;
        }
      });
    }
  }
}

// 手动执行git
function gitCmd(root) {
  /*
     上一条命令不会影响下条命令的工作目录
  cwd: 指定子进程的工作目录
   */
  exec("git init", { cwd: root }, (err) => {
    if (err) {
      throw err;
    }
    exec("git add .", { cwd: root }, (err2) => {
      if (err2) {
        throw err2;
      }
      exec('git commit -a -m "init project"', { cwd: root });
    });
  });
}

module.exports = Generator;
