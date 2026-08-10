# 官方插件仓库（JuanNiang-Plugins）

> > 仓库地址：[https://github.com/JuanNiangDev/JuanNiang-Plugins](https://github.com/JuanNiangDev/JuanNiang-Plugins)

> 仓库地址：[https://github.com/JuanNiangDev/JuanNiang-Plugins](https://github.com/JuanNiangDev/JuanNiang-Plugins)

[JuanNiang-Plugins](https://github.com/JuanNiangDev/JuanNiang-Plugins) 是 JuanNiang-Neo 的官方插件仓库，用于**托管、分发和索引 Lua 插件**——插件商店（[插件商店](store.md)）正是从这里拉取元数据与安装包。

## 仓库结构

```
JuanNiang-Plugins/
├── hago                        ← CLI 入口二进制
├── plugins.json                ← 元数据分片索引
│
├── tool/                       ← CLI 源码（Go）
│   ├── main.go                    命令路由 + 美化输出
│   ├── init.go                    hago init 实现
│   ├── pack.go                    hago pack 实现
│   ├── scan.go                    hago scan 实现
│   └── paths.go                   自动定位仓库根目录
│
├── template/                   ← 脚手架模板（Go text/template）
│   ├── pluggin.yaml               {{.Name}} {{.Author}} 模板变量
│   └── main.lua                   插件入口模板
│
├── plugins/                    ← 插件源码（工作目录）
│   └── <plugin-name>/
│       ├── pluggin.yaml           元数据 · 必选
│       ├── main.lua               入口   · 必选
│       ├── config.yaml            动态配置声明（type: bool/string/list）
│       ├── README.md              说明文档（商店详情页渲染）
│       ├── avatar.png             图标（商店网格卡片展示）
│       └── jn.lua                 SDK 副本 · 可选（hago init 自动复制，IDE 提示用）
│
├── metadata/                   ← 分片元数据（hago scan 生成）
│   ├── chunk_1.json               [PluginEntry, ...] 最多 300 条
│   └── chunk_2.json
│
├── dist/                       ← 插件安装包（<name>.zip，每晚 workflow 强制提交）
├── sdk/                        ← SDK 文件（jn.lua）
└── docs/                       ← 仓库文档
```

## hago CLI（脚手架工具）

```bash
# 构建 CLI
cd tool && go build -o ../hago .
# 或使用仓库 Makefile
make build
```

| 命令 | 说明 |
|------|------|
| `./hago init <name>` | 交互式创建插件（输入作者/简介），生成 5 件套 + SDK 副本 |
| `./hago pack <name>` | 打包 `plugins/<name>.zip`（内部路径 `name/<文件>`，符合 upload API 规范） |
| `./hago scan` | 扫描 `plugins/` 全量重建 `metadata/chunk_*.json` 与 `plugins.json` |
| `./hago validate <name> --strict` | 校验插件格式（必需文件 / config.yaml schema / 版本） |

`hago` 从**任意目录**执行都能定位仓库根目录（从可执行文件位置向上找 `plugins.json`，找不到再从当前目录向上找，最后回退 `.`）。

### 仓库 Makefile

```bash
make init NAME=my-plugin   # 交互式创建新插件（5 件套）
make pack NAME=my-plugin   # 打包为 zip
make validate NAME=my-plugin  # 校验格式（--strict）
make scan                  # 更新元数据
make pack-all              # 打包全部插件
```

## 插件格式（新格式 5 件套）

每个插件位于 `plugins/<name>/` 目录，必须包含：

| 文件 | 必填 | 说明 |
|------|------|------|
| `main.lua` | ✅ | 插件入口（默认入口文件） |
| `pluggin.yaml` | ✅ | 插件元数据（name/version/author/description/entry/permissions/system/enabled） |
| `config.yaml` | ✅ | 动态配置声明（可选配置项为空时写 `configs: []`） |
| `README.md` | ✅ | 说明文档（商店详情页渲染） |
| `avatar.png` | ✅ | 图标（商店网格卡片展示，建议正方形） |

> `pluggin.yaml` + `main.lua` 为必需；`config.yaml` / `README.md` / `avatar.png` 缺失时插件仍可运行，但商店会标记缺项。

### pluggin.yaml

```yaml
name: my-plugin
version: "1.0.0"
author: me
description: "示例插件"
entry: main.lua
permissions:
  - onebot11
  # - file   # 插件目录内文本文件读写（可选，见 SDK jn.file）
system: false
enabled: true
```

### config.yaml（动态配置声明）

```yaml
configs:
  - key: admin_qq
    type: string
    label: 管理员QQ
    description: 可操作本插件的管理员
    default: ""
  - key: auto_reply
    type: bool
    label: 自动回复
    default: true
  - key: trigger_words
    type: list
    label: 触发关键词
    default: ["你好", "在吗"]
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `key` | string | 配置键（唯一） |
| `type` | string | `bool`\|`string`\|`list` |
| `label` | string | Web 展示名 |
| `description` | string | 说明（可选） |
| `default` | any | 默认值 |
| `value` | any | 用户当前值（缺省回退 default） |

插件内通过 `jn.config.get("key")` 读取配置（`value` 优先，回退 `default`）。

## 提交新插件（PR 即审核）

1. **Fork** 本仓库。
2. 在 `plugins/<name>/` 创建 5 件套（用 `hago init` 脚手架，不要手搓目录）。
3. 本地校验：
   ```bash
   make build                  # 编译 hago 工具
   ./hago validate <name> --strict
   ```
4. 提交 PR，CI（`plugin-review.yml`）自动校验格式与版本。

## 更新已有插件

- 修改 `plugins/<name>/` 下文件时，**必须递增** `pluggin.yaml` 的 `version`（CI 会检查）。
- 更新后运行 `./hago validate <name> --strict` 确认无误。

## 审核与发布流程

1. CI（`plugin-review.yml`）自动校验格式（必需文件 / config.yaml schema / 版本递增），失败时在 PR 留言提示
2. 维护者（`.github/CODEOWNERS`）**Review + Merge**
3. Merge 后，每晚 UTC 16:00 的 `metadata-update.yml`（或手动触发）自动 `hago scan` 更新元数据并打包 `dist/*.zip` 后提交，商店即可见新插件

## 元数据与商店的联动

- `./hago scan` 生成 `metadata/chunk_*.json`（每片最多 300 条）与 `plugins.json`（`{total, chunks, updated_at}`）
- 商店客户端按以下路径拉取：元数据在仓库根（`plugins.json` / `metadata/`），插件的 README/头像在 `plugins/<name>/` 下，安装包在 `dist/<name>.zip`
- **dist 说明**：商店安装依赖 `dist/<name>.zip`；`dist/` 在 `.gitignore` 中，由每晚 workflow `git add -f` 强制提交。若需立即安装未生成 zip 的新插件，请在插件仓库运行 `make pack-all` 并手动提交 `dist/`

> 完整插件开发 API 见 [插件开发指南](quickstart.md)；商店与镜像源细节见 [插件商店](store.md)。
