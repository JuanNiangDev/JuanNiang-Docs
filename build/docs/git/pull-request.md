# 提交 Pull Request 的完整流程

> **Pull Request（简称 PR，"拉取请求"）** 是 GitHub 协作的核心机制。你改了别人的代码，发一个 PR 等于说："我改了这些，请你拉过来看看要不要合进你的主线。"

**Pull Request（简称 PR，"拉取请求"）** 是 GitHub 协作的核心机制。你改了别人的代码，发一个 PR 等于说："我改了这些，请你拉过来看看要不要合进你的主线。"

这里分两种情况：

- **情况 A**：你在自己仓库上改、自己合——这只是练手，不算真 PR
- **情况 B**：你给别人的项目贡献代码——这是 PR 的真正用途，下面重点讲这个

## 5.1 第一步：Fork（把别人的仓库复制一份到自己账号下）

1. 在 GitHub 上打开你想贡献的仓库（比如 `https://github.com/某人/某项目`）
2. 右上角点 **Fork** 按钮（叉子图标）
3. 弹窗里 Owner 选你自己的用户名 → **Create fork**
4. 现在你账号下就有了一份一模一样的仓库：`https://github.com/你的用户名/某项目`

> **提示**：为什么要 Fork：你没权限直接改别人的仓库。Fork 给你一份自己能随意改的副本，改完用 PR 通知原作者。

## 5.2 第二步：把你的 Fork 克隆到本地

在终端/cmd 里：

```bash
# 用 SSH 地址克隆（注意是 你的用户名 那份，不是原作者的）
git clone git@github.com:你的用户名/某项目.git
cd 某项目
```

克隆完，目录里就是项目全部代码，并且已经自动关联了 origin 远程（指向你的 Fork）。

## 5.3 第三步：关联上游（upstream）——关键一步别漏

你的 Fork 是一份死副本，原作者一直在更新他的仓库，你的 Fork 不会自动同步。要让本地 git 知道"原仓库在哪"以便日后同步：

```bash
# 添加一个叫 upstream 的远程，指向原作者的仓库
git remote add upstream git@github.com:原作者用户名/某项目.git

# 验证：应看到 origin（你的 Fork）和 upstream（原仓库）两个远程
git remote -v
```

## 5.4 第四步：新建特性分支——不要直接在 main 上改

```bash
# 先切到 main 并拉上游最新
git checkout main
git pull upstream main

# 新建并切换到特性分支（起名描述你要改什么，如 fix-typo、add-login）
git checkout -b fix-typo-in-readme
```

> **提示**：`git checkout -b 分支名` 等同于"新建分支 + 切过去"两步合一。新写法是 `git switch -c 分支名`。

## 5.5 第五步：改代码、提交

在特性分支上正常改代码：

```bash
# 比如修 README 里的错别字
vim README.md        # 或用你喜欢的编辑器：code README.md / nano README.md

# 改完保存退出，然后看改了啥
git status           # 哪些文件改了
git diff             # 具体改了哪些行

# 暂存并提交
git add README.md
git commit -m "docs: fix typo in README installation section"
```

## 5.6 第六步：推到你的 Fork 并发起 PR

```bash
# 推特性分支到 origin（你的 Fork）
git push -u origin fix-typo-in-readme
```

推送成功后，回到 GitHub 网页，你的 Fork 页面顶部会出现一条黄色提示：

> **fix-typo-in-readme had recent pushes** · **Compare & pull request**

点 **Compare & pull request**，进入 PR 创建页：

1. **确认方向**（这一步务必看清楚）：
   - **base repository** = 原作者用户名/某项目（你要贡献的目标）
   - **base branch** = main（要合进哪条分支）
   - **head repository** = 你的用户名/某项目（改动来源）
   - **compare branch** = fix-typo-in-readme
2. **写 PR 标题**：简明描述这次改动，比如 "docs: fix typo in README installation section"
3. **写 PR 说明**：讲清改了什么、为什么改、怎么测的。第一段就让人看懂目的
4. 点 **Create pull request**

PR 发出后，原作者会收到通知，他会在 PR 页面评审、留评论。

## 5.7 第七步：处理评审反馈——不要新开 PR

作者可能要求你修改。**关键：在同一分支继续提交，不要新开 PR**：

```bash
# 切回特性分支继续改
git checkout fix-typo-in-readme
vim README.md
git add README.md
git commit -m "docs: address review feedback"
git push           # 同一分支推送，PR 会自动追加这次新 commit
```

PR 页面会自动出现你的新提交，作者能继续看。反复几轮直到作者满意，他点 **Merge**，你的改动就并入原作者的主线了。

## 5.8 第八步：PR 合并后清理

合并后那条分支就没用了，删掉保持整洁：

```bash
# 切回 main 并拉上游最新（含你已合并的改动）
git checkout main
git pull upstream main

# 删本地分支（-d 是安全删，未合并会拒绝）
git branch -d fix-typo-in-readme

# 删远程分支（你的 Fork 上的那条）
git push origin --delete fix-typo-in-readme
```

## 5.9 同步上游新改动到你的 Fork

上游一直在更新，你的 Fork 会落后。定期同步：

```bash
git checkout main
git fetch upstream              # 拉上游所有分支信息
git merge upstream/main         # 合上游 main 到本地 main
git push origin main            # 把同步后的 main 推到你的 Fork
```

若已在本地 main 上做过改动导致冲突，更稳妥的做法是让本地 main 直接指向上游：

```bash
git checkout main
git reset --hard upstream/main     # 本地 main 重置为上游 main
git push origin main --force       # 强推到你的 Fork（覆盖旧 main）
```

> **注意**：`--force` 只在你清楚要覆盖远程时用，会对协作者造成困惑，谨慎。
