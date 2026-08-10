# 创建仓库并本地推送维护

> 1. 登录 GitHub，右上角 **+** → **New repository**（新建仓库）
2. **Repository name**：填仓库名，比如 `my-first-project`
3. **Description**（可选）：写一句话描述
4. **Public / Private**：选 Public（公开，别人能看）或 Private（私有，只有你能看）。第一次练手建议 Public
5. 下面三个勾选框**全部不要勾**（Add a README、.gitignore、license）——我们要在本地初始化后再推上来，勾了反而麻烦
6. 点 **Create repository**

## 4.1 在 GitHub 上创建你的第一个仓库

1. 登录 GitHub，右上角 **+** → **New repository**（新建仓库）
2. **Repository name**：填仓库名，比如 `my-first-project`
3. **Description**（可选）：写一句话描述
4. **Public / Private**：选 Public（公开，别人能看）或 Private（私有，只有你能看）。第一次练手建议 Public
5. 下面三个勾选框**全部不要勾**（Add a README、.gitignore、license）——我们要在本地初始化后再推上来，勾了反而麻烦
6. 点 **Create repository**

创建后页面会显示一段提示，关键看你仓库的 SSH 地址，形如：

```
git@github.com:你的用户名/my-first-project.git
```

把这段地址记下来，下一步用。

## 4.2 本地初始化并首次推送

回到本地（任意平台），在终端/cmd 里：

```bash
# 建项目目录并进去
mkdir my-first-project
cd my-first-project

# 初始化 git 仓库（在当前目录生成一个隐藏的 .git 文件夹，从此这个目录就是 git 仓库了）
git init

# 写一个 README 文件（首次提交总要有点东西）
echo "# my-first-project" > README.md

# 暂存（告诉 git：这次要拍快照，把这些文件包含进来）
git add README.md

# 拍快照（-m 后是这次改动的说明，必填，养成好习惯写清楚改了啥）
git commit -m "Initial commit"

# 关联远程仓库（origin 是远程仓库的别名，约定俗成叫 origin）
git remote add origin git@github.com:你的用户名/my-first-project.git

# 首次推送：把本地 main 分支推到远程 origin，并让本地 main 追踪远程 main
git push -u origin main
```

推完后刷新 GitHub 仓库网页，README.md 应已出现。**至此你打通了完整链路：本地改代码 → 推到 GitHub 云端**。

> **提示**：若本地已有项目目录（不是新建），进去后 `git init` → `git add .`（暂存全部）→ `git commit -m "Initial commit"` → 关联远程 → `git push -u origin main`，同样可行。

## 4.3 日常维护工作流

之后每次改代码，循环走这套：

```bash
# 改完代码后，先看改了哪些
git status                    # 哪些文件改了/新增了
git diff                      # 具体改了哪些行（未暂存的改动）

# 暂存并提交
git add <文件>                # 或 git add . 暂存全部
git commit -m "Fix: 描述这次改了什么"

# 推送到远程
git push                     # 因为之前 -u 设了追踪，之后直接 git push 就行
```

## 4.4 分支管理

**铁律：main 分支永远保持可发布的稳定状态，任何改动都另开分支。**

```bash
# 新建并切换到分支
git checkout -b feature/login     # 或新写法：git switch -c feature/login

# 在分支上正常 commit
git commit -m "Add login form"

# 把分支也推到远程
git push -u origin feature/login

# 切回 main
git checkout main                # 或 git switch main

# 把分支合并进 main（本地）
git merge feature/login
git push

# 删掉不再需要的本地分支
git branch -d feature/login
# 删掉远程分支
git push origin --delete feature/login
```

## 4.5 添加 .gitignore

避免把不该上传的文件（编译产物、密钥、依赖）推上去。在仓库根目录建 `.gitignore`：

```gitignore
# macOS
.DS_Store

# Node
node_modules/
dist/

# Python
__pycache__/
*.pyc
.venv/

# IDE
.vscode/
.idea/

# 密钥（千万别漏！）
.env
*.pem
id_rsa
```

GitHub 官方按语言维护的模板：https://github.com/github/gitignore

若文件已被 git 追踪过，再加进 .gitignore 不会停止追踪，要先取消追踪：

```bash
git rm --cached <文件>      # 从 git 索引移除但保留本地文件
git commit -m "Stop tracking <文件>"
```

## 4.6 查看历史与回退

```bash
git log --oneline --graph --all     # 树形简洁历史
git show HEAD                        # 看最新提交改了什么
git diff <旧commit> <新commit>       # 两次提交差异

# 误删文件想恢复
git checkout HEAD -- <文件>          # 从最新提交恢复（新写法：git restore <文件>）

# 改错后丢弃未提交的改动
git restore <文件>                   # 或旧写法 git checkout -- <文件>

# 让最新提交消失但保留改动（软回退）
git reset --soft HEAD~1

# 彻底回退到某版本（危险，会丢未提交改动）
git reset --hard <commit-hash>
```

> **注意**：`reset --hard` 不可逆，慎用。若已提交的内容想撤销更安全的是 `git revert <commit>`，它会生成一个反向提交。

第二步（可选进阶）：[提交 Pull Request 的完整流程](pull-request)。
