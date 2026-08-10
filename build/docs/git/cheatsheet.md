# 速查表与常见报错

> | 情境 | 命令 |
|---|---|
| 看改了哪些文件 | `git status` |
| 看具体改了哪些行 | `git diff` |
| 暂存改动 | `git add <文件>` 或 `git add .`（全部） |
| 提交（拍快照） | `git commit -m "说明"` |
| 推送到 GitHub | `git push` |
| 拉最新 | `git pull` |
| 新建分支 | `git switch -c 分支名`（旧写法 `git checkout -b 分支名`） |
| 切换分支 | `git switch 分支名`（旧写法 `git checkout 分支名`） |
| 合并分支到当前 | `git merge 分支名` |
| 看历史 | `git log --oneline --graph --all` |
| 丢掉未提交的改动 | `git restore <文件>` |
| 同步上游 | `git fetch upstream` → `git merge upstream/main` → `git push` |
| 删本地分支 | `git branch -d 分支名` |
| 删远程分支 | `git push origin --delete 分支名` |

## 6. 日常工作流速查表

| 情境 | 命令 |
|---|---|
| 看改了哪些文件 | `git status` |
| 看具体改了哪些行 | `git diff` |
| 暂存改动 | `git add <文件>` 或 `git add .`（全部） |
| 提交（拍快照） | `git commit -m "说明"` |
| 推送到 GitHub | `git push` |
| 拉最新 | `git pull` |
| 新建分支 | `git switch -c 分支名`（旧写法 `git checkout -b 分支名`） |
| 切换分支 | `git switch 分支名`（旧写法 `git checkout 分支名`） |
| 合并分支到当前 | `git merge 分支名` |
| 看历史 | `git log --oneline --graph --all` |
| 丢掉未提交的改动 | `git restore <文件>` |
| 同步上游 | `git fetch upstream` → `git merge upstream/main` → `git push` |
| 删本地分支 | `git branch -d 分支名` |
| 删远程分支 | `git push origin --delete 分支名` |

## 7. 常见报错与解决办法

### Q1：`git push` 报 `non-fast-forward` 或 `Updates were rejected`

远程有你本地没有的提交。先拉再推：

```bash
git pull --rebase
git push
```

### Q2：`git clone` 卡住不动 / 报 `Connection reset`

网络不通或服务器慢。换浏览器（Chrome/Edge）、稍后重试，或换网络环境再 clone。

### Q3：GitHub 登录的验证码拼图加载不出

网络慢或验证服务被拦。换浏览器（Chrome/Edge）、换网络环境，或稍后再试。

### Q4：`git push` 报 `Permission denied (publickey)`

SSH 密钥没配好。依次检查：

```bash
ssh -T git@github.com              # 测试连通
ls ~/.ssh/id_ed25519.pub           # 确认公钥文件存在（Windows 路径是 C:\Users\你\.ssh\）
cat ~/.ssh/id_ed25519.pub          # 复制内容到 GitHub Settings → SSH and GPG keys
```

### Q5：中文文件名在 `git status` 里显示成 `\xxx` 转义

```bash
git config --global core.quotepath false
```

### Q6：想改最近一次提交的说明

```bash
git commit --amend -m "新的说明"
# 若已 push，需 git push --force（慎用，会对协作者造成困惑）
```

### Q7：不小心 commit 了不该 commit 的文件（如密钥 .env）

**还没 push**：

```bash
git restore --staged .env          # 从暂存区移除
git commit --amend --no-edit       # 修订最近提交，不再含 .env
```

**已经 push**：必须立即在 GitHub 撤销该密钥/重置服务，光删仓库不够——邮件列表里可能已被爬虫存档。然后：

```bash
git rm .env
git commit -m "Remove accidentally committed .env"
git push
```

### Q8：误删文件想恢复

```bash
git checkout HEAD -- <文件名>      # 从最近一次提交恢复
# 新写法：git restore <文件名>
```

### Q9：拉取时提示 `fatal: refusing to merge unrelated histories`

两个仓库历史不相关（比如本地 git init 后又想接上远程）。强制合并：

```bash
git pull origin main --allow-unrelated-histories
```
