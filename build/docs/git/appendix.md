# 附录：邮件列表项目与学习资源

> **不是所有项目都用 GitHub**。Linux 内核、Git 本身、PostgreSQL、FreeBSD、QEMU、U-Boot、coreutils、BusyBox、GCC、GDB、Binutils 等重量级开源项目**不用 GitHub PR**，而是用**邮件列表（mailing list）**协作——代码以邮件附件形式发到列表，维护者在邮件里评审、回复，最后用脚本把邮件里的补丁合进树里。

## 8. 通过邮件列表维护的项目

**不是所有项目都用 GitHub**。Linux 内核、Git 本身、PostgreSQL、FreeBSD、QEMU、U-Boot、coreutils、BusyBox、GCC、GDB、Binutils 等重量级开源项目**不用 GitHub PR**，而是用**邮件列表（mailing list）**协作——代码以邮件附件形式发到列表，维护者在邮件里评审、回复，最后用脚本把邮件里的补丁合进树里。

### 8.1 邮件列表工作流 vs GitHub PR

| 维度 | GitHub PR | 邮件列表 |
|---|---|---|
| 提交载体 | 网页推分支、点 Compare & PR | `git format-patch` 生成 `.patch` 邮件 |
| 发送方式 | 网页表单 | `git send-email` SMTP 发邮件 |
| 评审载体 | PR 评论 | 邮件回复 |
| 归档 | PR 列表 | lore.kernel.org 等归档站 |
| 工具链 | git + github 网页 | git + send-email + 客户端 + b4 |

### 8.2 典型流程（以 Linux 内核为例）

```bash
# 1. 改完代码、在特性分支上 commit
git checkout -b fix/some-bug
vim drivers/net/foo.c
git add drivers/net/foo.c
git commit -s -m "drivers/net: foo: fix integer overflow"   # -s 加 Signed-off-by

# 2. 生成补丁邮件（含标准头、diff、Signed-off-by）
git format-patch -1 --subject-prefix="PATCH" -o /tmp/patches

# 3. 自动确定收件人：用脚本查 MAINTAINERS 文件
scripts/get_maintainer.pl --rolestats /tmp/patches/*.patch

# 4. 把补丁邮件发出
git send-email --suppress-cc=all --confirm=never \
  --subject-prefix="RFC PATCH" /tmp/patches/*.patch

# 5. 评审反馈以邮件回复；要改就同一分支再 commit 再发新版本
#    （v2 标题用 [PATCH v2]，正文加 changelog）
```

### 8.3 常见邮件列表（订阅方式见下）

| 列表 | 项目 | 订阅地址 |
|---|---|---|
| `netdev@vger.kernel.org` | Linux 内核网络子系统 | `netdev+subscribe@vger.kernel.org` |
| `bpf@vger.kernel.org` | Linux 内核 BPF 子系统 | `bpf+subscribe@vger.kernel.org` |
| `linux-kernel@vger.kernel.org` | Linux 内核主列表（流量极大，慎订） | `linux-kernel+subscribe@vger.kernel.org` |
| `git@vger.kernel.org` | Git 本身开发 | `git+subscribe@vger.kernel.org` |
| `qemu-devel@nongnu.org` | QEMU 开发 | 见 https://savannah.nongnu.org/mail/?group=qemu |
| `u-boot@lists.denx.de` | U-Boot 开发 | 见 https://lists.denx.de/listinfo/u-boot |

订阅方式：用你的邮箱发一封空邮件到对应的 `列表名+subscribe@vger.kernel.org`，主题和正文留空即可。退订把 `+subscribe` 换成 `+unsubscribe`。

> **注意**：Gmail 用户注意：netdev、bpf、linux-kernel 等是高流量列表，全量订阅会撑爆 Gmail 的 60 封/分钟配额。建议要么订阅 digest 版（`列表名+subscribe-digest@...`），要么不订阅只看归档（https://lore.kernel.org/），要么在 Gmail 里加过滤器把列表邮件挡出收件箱（匹配 `list:(列表ID)` → 加标签 → 跳过收件箱）。

### 8.4 邮件列表协作的几条铁律

1. **必须用纯文本（plain text），不要 HTML**——HTML 邮件会被列表拒收或被维护者无视
2. **必须正确 inline diff 或附件 patch**——别贴截图、别贴 Word
3. **每条 commit 必须 `Signed-off-by`**——`git commit -s` 自动加，等同于勾选 CLA
4. **不要"顶帖"（top-post）**——回复风格是引用原文相关行后在下面写答复，这是邮件列表的传统
5. **新版补丁标题加 `v2`/`v3`**——`[PATCH v2 0/3]`，并在 cover letter 里写 changelog
6. **不要在 GitHub 上给这些项目发 PR**——Linux 内核官方明确不接受 GitHub PR，发邮件才是正道

### 8.5 邮件列表专用工具

- `git format-patch` / `git send-email`：内核已自带
- `b4`：现代邮件列表补丁拉取与回复工具，`b4 am <msgid>` 拉某补丁并自动 apply
- `scripts/get_maintainer.pl`（内核自带）：自动从 MAINTAINERS 文件找收件人
- `checkpatch.pl`（内核自带）：提交前自检补丁格式
- 归档搜索：https://lore.kernel.org/

> 邮件列表项目的特点是**门槛前置**：配 SMTP、懂邮件礼仪、补丁格式严格。但这是大多数底层系统项目的标准，学会一次受用终身。GitHub PR 简单直观适合应用层；邮件列表严谨适合内核/底层——两套都掌握，覆盖整个开源世界。

## 9. 进一步学习资源

- **Pro Git 中文版**（官方，免费）：https://git-scm.com/book/zh/v2
- **GitHub 官方快速入门**：https://docs.github.com/zh/get-started/quickstart
- **Learn Git Branching**（可视化练习）：https://learngitbranching.js.org/?locale=zh_CN
- **Oh My Git!**（游戏化学习）
- **GitHub 官方 gitignore 模板**：https://github.com/github/gitignore

---

> 记住三句话：
> 1. **git 是本地的时光机**——commit 先在本地拍快照，不联网也能用。
> 2. **github 是云端保险箱**——push 把本地快照同步到云端，需要联网。
> 3. **贡献别人项目走 Fork + 特性分支 + PR**——main 永远保持稳定，改动另开分支，同一 PR 反复迭代直到被合并；而邮件列表项目用 `git send-email` 直接发，没有 Fork。
