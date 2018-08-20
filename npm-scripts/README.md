# nmp-scripts

代理 grunt、gulp 等重量工具的前端工作流解决方案。

## 如何运行多个 npm script

**串行**

```bash
npm run lint:js && npm run lint:css && npm run lint:json && npm run lint:markdown && mocha tests/
```

串行执行如果前序命令失败（进程退出码非 0），后续命令全部终止。

**并行**

```bash
npm run lint:js & npm run lint:css & npm run lint:json & npm run lint:markdown & mocha tests/
```

命令的输出有可能在进程退出之后

增加`& wait`可以等待命令执行完毕再退出进程

```bash
npm run lint:js & npm run lint:css & npm run lint:json & npm run lint:markdown & mocha tests/ & wait
```

**npm-run-all**

管理多命令运行

**串行**

```bash
npm-run-all lint:* mocha
```

**并行**

```bash
npm-run-all --parallel lint:* mocha
# 不需要&wait npm-run-all已经做了
```

[文档](https://github.com/mysticatea/npm-run-all/blob/HEAD/docs/npm-run-all.md)

## 给 npm script 传递参数，添加注释

传递参数：使用`--`分割符

```bash
npm run eslint:js -- --fix
```

注释：shell 风格的注释

```json
{
  "scripts": {
    "eslint": "# 运行代码检测 \n  eslint src/*.js"
  }
}
```

## 调整npm script运行时日志输出

通过控制运行时日志输出级别

**默认日志输出级别**

能看到执行的命令、命令执行的结果。

**显示尽可能少的有用信息**

`--loglevel silent`或者`--silent`或者`-s`

**显示尽可能多的运行时状态**

用于排查脚本问题 `--loglevel verbose`或者`--verbose`或者`-d`

## npm script 钩子

`pre`,`post`分别指定执行前后钩子命令

## 在npm script中使用变量

npm 提供了`$PATH`之外更多变量

**使用预定义变量**

运行`npm run env`能拿到完整的变量列表

通过`npm run env | grep npm_package | sort`拿到预定义环境变量

在想要引用的变量前面加`$`就可以引用预定义环境变量

**使用自定义变量**

在package.json中定义变量

```json
{
  "config": {
    "port": 3000,
  }
}
```

在npm script中使用变量

```json
{
  "scripts": {
    "server": "http-server -p $npm_package_config_port",
  }
}
```

## npm script跨平台兼容

**文件系统操作**

npm包中的工具

- rimraf: `rm -rf`
- cpr: `cp -r`
- make-dir-cli: `mkdir -p`

**cross-var引用变量**

**cross-env设置环境变量**

## 把庞大的npm script拆到单独的文件中

借助`scripty`可以将npm script剥离到单独的文件中。

**安装**

```bash
npm install scripty --save-dev
```

**准备目录和文件**

```bash
mkdir -p scripty/cover
```

默认为`scripts`文件夹

文件和命令的对应关系

| 命令        | 文件                   |
| ----------- | ---------------------- |
| cover       | scripts/cover.sh       |
| cover:serve | scripts/cover/serve.sh |
| cover:open  | scripts/cover/open.sh  |

> 给所有脚本添加可执行权限

```bash
chmod -R a+x scripts/**/*.sh
```