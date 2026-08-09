# =====================================================================
# JuanNiang-Docs（Docusaurus 文档站）打包镜像
#
# 多阶段构建：Node 构建静态站点 → nginx 提供服务
#
# 用法：
#   docker build -t juan-docs .
#   docker run -d --name juan-docs -p 8080:80 juan-docs
#   访问 http://localhost:8080
#
# 国内网络可在构建时指定镜像源加速：
#   docker build --build-arg NPM_REGISTRY=https://registry.npmmirror.com -t juan-docs .
# =====================================================================

# ---------- 阶段一：构建静态站点 ----------
FROM docker.jiaxin.site/library/node:22-alpine AS build

WORKDIR /app

# npm 镜像源（默认官方源，可 --build-arg 覆盖）
ARG NPM_REGISTRY=https://registry.npmmirror.com/

# 先复制依赖清单：package.json / package-lock.json 未变化时可命中缓存，跳过 npm ci
COPY package.json package-lock.json ./
RUN npm ci --registry=${NPM_REGISTRY}

# 复制源码并构建
COPY . .
RUN npm run build

# ---------- 阶段二：nginx 运行 ----------
FROM docker.jiaxin.site/library/nginx:alpine AS runtime

# 站点静态产物
COPY --from=build /app/build /usr/share/nginx/html
# nginx 配置（SPA 路由回退 + gzip + 静态资源缓存 + 健康检查）
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz >/dev/null 2>&1 || exit 1
