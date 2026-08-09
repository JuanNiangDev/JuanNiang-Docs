# ---------- 阶段二：nginx 运行 ----------
FROM docker.jiaxin.site/library/nginx:alpine AS runtime

# 站点静态产物
COPY ./build /usr/share/nginx/html
# nginx 配置（SPA 路由回退 + gzip + 静态资源缓存 + 健康检查）
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz >/dev/null 2>&1 || exit 1
