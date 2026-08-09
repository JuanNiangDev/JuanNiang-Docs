/**
 * webpack 按需 chunk 加载失败自动重试
 *
 * 背景：mermaid 等按需加载的 chunk 首次请求偶发被浏览器中断
 * （net::ERR_ABORTED / canceled，多见于资源调度激进的环境），
 * 此时 webpack 的动态 import 直接 reject，Docusaurus 错误边界会显示
 * “Loading chunk xxx failed”，需要手动点“重试”。
 *
 * 原理：webpack 用 <script> 标签加载 chunk（JSONP）。本脚本 hook
 * document.head.appendChild，给 chunk script 的 onerror 打补丁：
 * 失败后静默重建 script 重试（不调用原 onerror，避免 webpack 立刻
 * reject）；重试成功后 chunk 内容通过 JSONP push 自动 resolve 原
 * Promise。重试次数耗尽后才透传原 onerror。
 *
 * 只匹配 /assets/js/*.js 的 chunk script，其他脚本不受影响。
 */
(function () {
  'use strict';

  var MAX_RETRIES = 2; // 首次失败后再重试 2 次（共最多 3 次尝试）
  var CHUNK_RE = /\/assets\/js\/[^/]+\.js(\?|$)/;

  function patchHeadAppend() {
    var head = document.head;
    if (!head || head.__chunkRetryPatched) return;
    head.__chunkRetryPatched = true;

    var origAppendChild = head.appendChild.bind(head);

    head.appendChild = function (node) {
      if (
        node &&
        node.tagName === 'SCRIPT' &&
        node.src &&
        CHUNK_RE.test(node.src)
      ) {
        var retries = node.__chunkRetryCount || 0;
        if (retries <= MAX_RETRIES) {
          var origOnError = node.onerror;
          node.onerror = function (e) {
            if (retries < MAX_RETRIES) {
              var ns = document.createElement('script');
              ns.src = node.src;
              ns.async = node.async !== false;
              if (node.crossOrigin) ns.crossOrigin = node.crossOrigin;
              ns.__chunkRetryCount = retries + 1;
              setTimeout(function () {
                head.appendChild(ns);
              }, 300 * (retries + 1));
              // 不调用原 onerror：保持 webpack 的 Promise 处于 pending，
              // 重试的 script 加载成功后 JSONP push 会自动 resolve 它。
            } else {
              if (typeof origOnError === 'function') origOnError.call(node, e);
            }
          };
        }
      }
      return origAppendChild(node);
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchHeadAppend);
  } else {
    patchHeadAppend();
  }
})();
