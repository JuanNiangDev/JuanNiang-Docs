---
title: 注册 GitHub 账号
sidebar_position: 3
---

## 3.1 注册 GitHub 账号详细步骤

1. 打开浏览器，访问 https://github.com
2. 右上角点 **Sign up**（注册）
3. **Enter your email**：填你的邮箱（**一定填和安装时 `git config user.email` 一致的那个邮箱**）
4. **Create a password**：设密码（至少 15 位，或 8 位含数字+字母；建议用密码管理器生成并存好）
5. **Enter a username**：起一个用户名，会出现在你的仓库地址里（`github.com/用户名/仓库名`），建议全小写英文，起好后点 **Check availability** 看是否被人占了
6. 勾选 **Email preferences**（可选，要不要收 GitHub 的产品邮件，一般不勾）
7. 解 puzzle（拼图验证码）——若加载不出，换浏览器（Chrome/Edge）或刷新重试
8. 点 **Create account**
9. GitHub 会往你邮箱发一个 6 位验证码，打开邮箱查收，输入验证码
10. 进入欢迎页，会问几个问题（你打算怎么用、你的经验水平），如实选或一路 skip 都行

到这一步账号就建好了。

## 3.2 把 SSH 公钥粘到 GitHub（让本地能免密推送）

还记得安装时生成的 `id_ed25519.pub` 内容吗？现在用它：

1. 登录 GitHub 后，右上角点头像 → **Settings**（设置）
2. 左侧菜单找到 **SSH and GPG keys**（SSH 和 GPG 密钥）
3. 点右上角 **New SSH key**（新建 SSH 密钥）
4. **Title**：随便起一个，比如 "我的 MacBook Air" 或 "宿舍台式机"——方便以后知道这是哪台机的钥匙
5. **Key type**：保持 **Authentication Key** 默认
6. **Key**：把 `id_ed25519.pub` 的整行内容粘进来（以 `ssh-ed25519 AAAA...` 开头的那一整行）
7. 点 **Add SSH key**

> **提示**：为什么要这步：以后你 `git push` 推代码到 GitHub，GitHub 靠这把公钥认你——"这人是带着正确私钥的，放行"。私钥在你本地电脑上，别人偷不走，比密码安全。

## 3.3 验证 SSH 连通

回到终端/cmd，输：

```bash
ssh -T git@github.com
```

第一次会问 `Are you sure you want to continue connecting`，输 `yes` 回车。

看到这行就成了：

```
Hi 你的用户名! You've successfully authenticated, but GitHub does not provide shell access.
```

看到这就说明你本地和 GitHub 已经打通了，可以开始实操了。下一步 [创建仓库并推送](repository)。