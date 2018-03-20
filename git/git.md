## 创建版本库

### `git init`

创建版本库（创建 *.git* 目录）

### `git add`

把文件添加到版本库

`git add .`：将所有文件添加到版本库

### `git commit`

将文件提交到仓库

`git commit -m 'add new file'`

`-m`参数后面跟本次提交说明

## 时光穿梭

### `git status`

查看仓库当前状态

### `git diff`

查看difference，比较本地文件和版本库文件的修改

`git diff HEAD -- readme.txt`：查看工作区和版本库里面最新版本的区别

### `git log`

显示从最近到最远的提交日志

`git log --pretty=online` 格式化输出日志

`--graph` 参数可以看到分支合并图

### `git reset`

`git reset --hard HEAD^`: 回退到上一个版本

- `HEAD^`: 上一版本
- `HEAD^^`: 上两个版本
- `HEAD~100`: 上一百个版本

`git reset --hard 724b042`: 回退到指定版本号版本

### `git reflog`

查看每次命令

### `git checkout`

使用版本库的版本替换工作区版本

`git checkout -- readme.txt`: 把`readme.txt`在工作区的修改全部撤销，两种情况：

1. `readme.txt`自修改后还没有被放到暂存区，现在，撤销修改就回到和版本库一模一样的状态
2. `readme.txt`已经添加到暂存区，又做了修改，撤销修改就回到添加到暂存区后的状态

### `git rm`

删除文件

```shell
git rm test.txt
git commit -m "remove test.txt"
```

## 远程仓库

### 关联远程仓库

`git remote add origin git@server-name:path/repo-name.gi`: 关联一个远程库

`git push -u origin master`: 第一次推送master分支，`-u`参数可以关联本地master和远程master

`git push origin master`: 推送最新修改

### 从远程仓库克隆

`git clone https://github.com/path/repo-name.git`

## 分支管理

### `git branch dev`

创建dev分支

### `git checkout dev`

切换到dev分支

### `git checkout -b dev`

创建并切换到dev分支

### `git branch`

查看分支

### `git merge dev`

合并dev分支到当前分支

`--no-ff` 参数可以禁用 *Fast forward* 模式的合并，在merge时生成一个新的commit，这样从分支历史上就可以看出分支信息

### `git branch -d dev`

删除dev分支

`git branch -D dev`：强行删除一个没有合并过的分支

### `git stash`

保存工作区现场

### `git stash list`

查看保存的工作区现场

### `git stash apply`

恢复工作区现场但不删除stash

### `git stash drop`

删除工作区现场stash

### `git stash pop`

恢复并删除工作区现场stash

### `git push origin branch`

推送分支到远程库

### `git checkout -b branch origin/branch`

同步远程分支到本地

### `git branch --set-upstream dev origin/dev`

指定本地分支和远程分支的链接

### `git pull`

从远程仓库抓取分支

## 标签管理

### `git tag <name>`

打一个新的标签

`git tag v0.9 6224937`: 为commit id是*6224937*的修改打标签

`-a`: 参数指定标签名
`-m`: 指定说明文字
`-s`: 私钥签名一个标签

### `git tag`

查看标签

### `git show <tagname>`

查看标签说明文字

### `git tag -d v0.1`

删除标签

### `git push origin <tagname>`

推送标签到远程库

`--tags`: 参数一次性推送全部尚未推送到远程的本地标签

### `git push origin :refs/tags/v0.9`

删除远程库的标签（要先删除本地标签）