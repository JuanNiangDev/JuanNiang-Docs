# 三平台安装并配置 git

> 1. 打开浏览器，访问官网下载页：https://git-scm.com/download/win
2. 页面会自动开始下载 `Git-2.xx.x-64-bit.exe`（如没自动下载，点 "Click here to download manually"）
3. 双击运行安装包，一路点 **Next**，这几个地方注意改一下：
   - **Select Components** 页：保持默认即可
   - **Choosing the default editor**：如果你没装 Vim，选 **"Use Visual Studio Code as Git's default editor"**（前提是装了 VS Code）；没装就选 **"Notepad++"** 或保持默认 Vim
   - **Adjusting your PATH environment**：**必须选第二个** "Git from the command line and also from 3rd-party software"——这样你在 PowerShell 和 CMD 里都能用 `git` 命令
   - **Choosing HTTPS transport backend**：选 "Use the native secure channel library"
   - **Configuring line ending conversions**：选第一个 "Checkout Windows-style, commit Unix-style"——这是默认
4. 装完点 Finish

## 2.1 Windows

### 安装

1. 打开浏览器，访问官网下载页：https://git-scm.com/download/win
2. 页面会自动开始下载 `Git-2.xx.x-64-bit.exe`（如没自动下载，点 "Click here to download manually"）
3. 双击运行安装包，一路点 **Next**，这几个地方注意改一下：
   - **Select Components** 页：保持默认即可
   - **Choosing the default editor**：如果你没装 Vim，选 **"Use Visual Studio Code as Git's default editor"**（前提是装了 VS Code）；没装就选 **"Notepad++"** 或保持默认 Vim
   - **Adjusting your PATH environment**：**必须选第二个** "Git from the command line and also from 3rd-party software"——这样你在 PowerShell 和 CMD 里都能用 `git` 命令
   - **Choosing HTTPS transport backend**：选 "Use the native secure channel library"
   - **Configuring line ending conversions**：选第一个 "Checkout Windows-style, commit Unix-style"——这是默认
4. 装完点 Finish

打开验证：按 `Win + R`，输入 `cmd` 回车，在黑窗口里输：

```cmd
git --version
```

应输出 `git version 2.xx.x.windows.x`。看到这个就装好了。

### 配置身份

git 每次拍快照都会记录"是谁拍的"，所以要告诉它你的名字和邮箱。在 cmd 或 PowerShell 里输：

```cmd
git config --global user.name  "你的真名或昵称"
git config --global user.email "你的邮箱@example.com"
```

> **注意**：这个邮箱**要和等会注册 github 用的邮箱一致**——github 靠邮箱匹配，把你的提交和你的 github 头像关联起来。

### 生成 SSH 密钥（免密推送用）

github 从 2021 年起不再支持用密码推送代码，要么用"个人访问令牌"（Personal Access Token，每次复制一长串很烦），要么用 SSH 密钥（一劳永逸）。推荐 SSH：

```cmd
ssh-keygen -t ed25519 -C "你的邮箱@example.com"
```

一路回车（密码留空即可）。它会生成两个文件：

- `C:\Users\你的用户名\.ssh\id_ed25519`（私钥，**千万别给别人**）
- `C:\Users\你的用户名\.ssh\id_ed25519.pub`（公钥，**等会要粘到 github**）

用记事本打开 `.pub` 那个文件，复制全部内容（以 `ssh-ed25519 AAAA...` 开头的一整行），等会第 3 步用。

## 2.2 macOS

### 安装

macOS 自带 Apple 版的 git，但版本偏旧。推荐用 Homebrew 装最新：

打开**终端**（Terminal）：按 `Cmd + Space` 输入 `terminal` 回车，或进 `/Applications/Utilities/Terminal.app`。

如果没装 Homebrew，先装 Homebrew（Homebrew 是 Mac 的软件管家）：

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

装完 Homebrew 后装 git：

```bash
brew install git
git --version          # 应输出 git version 2.x.x
```

> **提示**：如果你不想装 Homebrew，也可以去 https://git-scm.com/download/mac 下载 `.dmg` 安装包，双击装。

### 配置身份

```bash
git config --global user.name  "你的真名或昵称"
git config --global user.email "你的邮箱@example.com"
```

### 生成 SSH 密钥

```bash
ssh-keygen -t ed25519 -C "你的邮箱@example.com"
# 一路回车，密码留空
cat ~/.ssh/id_ed25519.pub
```

把输出的整行（以 `ssh-ed25519 AAAA...` 开头）复制出来，等会粘到 github。文件在 `/Users/你的用户名/.ssh/id_ed25519.pub`。

## 2.3 Linux（Debian/Ubuntu 系）

### 安装

打开终端（`Ctrl + Alt + T`）：

```bash
sudo apt update
sudo apt install git
git --version
```

（Fedora/RedHat 系把 `apt` 换成 `dnf`，Arch 系用 `sudo pacman -S git`）

### 配置身份

```bash
git config --global user.name  "你的真名或昵称"
git config --global user.email "你的邮箱@example.com"
```

### 生成 SSH 密钥

```bash
ssh-keygen -t ed25519 -C "你的邮箱@example.com"
cat ~/.ssh/id_ed25519.pub
```

复制输出的整行。

## 2.4 三个平台通用的几个推荐配置

不管哪个平台，装完 git 后建议再设这几条（在终端/cmd 里逐条输）：

```bash
# 默认分支名用 main（github 2020 年后的默认，旧版是 master）
git config --global init.defaultBranch main

# 凭据存进系统钥匙串，不用每次输密码
# Windows：安装包默认已配好，可跳过
# macOS：
git config --global credential.helper osxkeychain
# Linux：
git config --global credential.helper store

# pull 时默认用 rebase，历史更干净
git config --global pull.rebase true

# push 默认只推当前分支
git config --global push.default current

# 中文文件名不再显示成 \xxx 转义
git config --global core.quotepath false
```

到这一步，git 本身就配好了。下一步 [注册 GitHub 账号](account)。
