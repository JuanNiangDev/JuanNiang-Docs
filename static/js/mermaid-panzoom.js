/**
 * Mermaid 图表缩放 / 拖动交互（矢量级缩放，放大不糊）
 *
 * 关键点：不用 CSS transform: scale()（会把 SVG 栅格化成位图再拉伸，放大发虚），
 * 而是改写 SVG 的 width/height —— 浏览器按新尺寸矢量重绘，任意倍率都清晰。
 * 平移仅用 transform: translate()（纯位移不产生模糊）。
 *
 * 初始尺寸以容器宽度为基准（fitW = 容器宽度，fitH 按 viewBox 等比），
 * 等价于 Docusaurus 默认渲染效果；并固定容器高度，
 * 放大后的溢出部分被 overflow:hidden 裁剪，不挤占页面空间。
 *
 * 注意：mermaid 生成的 SVG 属性是 width="100%"（见 mermaid.core.mjs
 * appendDivSvgG），绝不能直接 parseFloat 该属性当真实尺寸，必须用 viewBox。
 *
 * 交互方式：
 *  - 滚轮：以光标位置为中心缩放（0.5x ~ 5x）
 *  - 按住左键拖动：平移图表
 *  - 双击：复位到初始自适应大小与位置
 *
 * 通过 MutationObserver 监听路由切换/水合后新出现的图表容器
 * （Docusaurus 的 mermaid 图表客户端渲染，容器类名 docusaurus-mermaid-container）。
 * 事件只绑定一次；若容器内 SVG 被替换（如 mermaid 重渲染），只更新状态重新接管。
 */
(function () {
  'use strict';

  var CONTAINER = 'docusaurus-mermaid-container';
  var MAX_SCALE = 5;
  var MIN_SCALE = 0.5;

  // 计算“自适应大小”：以容器宽度为基准，按 viewBox 等比算出高度
  function computeFit(container, svg) {
    var cw = container.clientWidth;
    if (!cw) return null; // 容器尚未布局（如折叠的 <details>），稍后由兜底逻辑重试

    var vb = svg.viewBox && svg.viewBox.baseVal;
    var fitW, fitH;
    if (vb && vb.width > 0 && vb.height > 0) {
      fitW = cw;
      fitH = Math.round((cw * vb.height) / vb.width);
    } else {
      // viewBox 缺失时回退到当前实际渲染尺寸
      var r = svg.getBoundingClientRect();
      fitW = r.width || cw;
      fitH = r.height || Math.round(cw * 0.75);
    }
    return {fitW: fitW, fitH: fitH};
  }

  function apply(container, svg, s) {
    svg.style.maxWidth = 'none';
    svg.style.width = Math.round(s.fitW * s.scale) + 'px';
    svg.style.height = Math.round(s.fitH * s.scale) + 'px';
    svg.style.transform = 'translate(' + s.tx + 'px, ' + s.ty + 'px)';
    // 固定容器高度：放大后的溢出由 overflow:hidden 裁剪，避免撑大页面
    container.style.height = s.fitH + 'px';
  }

  function bindEvents(container, getState) {
    if (container.__panzoomBound) return;
    container.__panzoomBound = true;

    var dragging = false;
    var startX = 0;
    var startY = 0;

    function zoomAt(clientX, clientY, factor) {
      var state = getState();
      var svg = container.querySelector('svg');
      if (!state || !svg) return;
      var rect = container.getBoundingClientRect();
      var px = clientX - rect.left - state.tx;
      var py = clientY - rect.top - state.ty;
      var next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, state.scale * factor));
      var k = next / state.scale;
      state.tx = clientX - rect.left - px * k;
      state.ty = clientY - rect.top - py * k;
      state.scale = next;
      apply(container, svg, state);
    }

    container.addEventListener(
      'wheel',
      function (e) {
        e.preventDefault();
        zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 1.12 : 1 / 1.12);
      },
      {passive: false}
    );

    container.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return;
      e.preventDefault();
      var state = getState();
      if (!state) return;
      dragging = true;
      startX = e.clientX - state.tx;
      startY = e.clientY - state.ty;
      container.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      var state = getState();
      var svg = container.querySelector('svg');
      if (!state || !svg) return;
      state.tx = e.clientX - startX;
      state.ty = e.clientY - startY;
      apply(container, svg, state);
    });

    window.addEventListener('mouseup', function () {
      dragging = false;
      container.style.cursor = '';
    });

    container.addEventListener('dblclick', function () {
      var state = getState();
      var svg = container.querySelector('svg');
      if (!state || !svg) return;
      state.scale = 1;
      state.tx = 0;
      state.ty = 0;
      apply(container, svg, state);
    });
  }

  function init(container) {
    var svg = container.querySelector('svg');
    if (!svg) return;

    var state = container.__panzoomState;
    if (state) {
      // 已初始化：仅当 SVG 被替换（如 mermaid 重渲染）时重新接管
      if (state.svg === svg) return;
      var refit = computeFit(container, svg);
      if (!refit) return;
      state.svg = svg;
      state.fitW = refit.fitW;
      state.fitH = refit.fitH;
      state.scale = 1;
      state.tx = 0;
      state.ty = 0;
      apply(container, svg, state);
      return;
    }

    state = computeFit(container, svg);
    if (!state) return;
    state.svg = svg;
    state.scale = 1;
    state.tx = 0;
    state.ty = 0;
    container.__panzoomState = state;

    bindEvents(
      container,
      function () {
        return container.__panzoomState;
      }
    );
    apply(container, svg, state);
  }

  function scan() {
    var nodes = document.querySelectorAll('.' + CONTAINER);
    for (var i = 0; i < nodes.length; i++) init(nodes[i]);
  }

  // 窗口尺寸变化时重新适配所有图表（回到自适应大小）
  function refitAll() {
    var nodes = document.querySelectorAll('.' + CONTAINER);
    for (var i = 0; i < nodes.length; i++) {
      var c = nodes[i];
      var s = c.__panzoomState;
      if (!s) continue;
      var svg = c.querySelector('svg');
      if (!svg) continue;
      var fit = computeFit(c, svg);
      if (!fit) continue;
      // 原地更新状态对象（事件闭包引用同一个对象），再复位
      s.fitW = fit.fitW;
      s.fitH = fit.fitH;
      s.scale = 1;
      s.tx = 0;
      s.ty = 0;
      apply(c, svg, s);
    }
  }

  var resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(refitAll, 200);
  });

  if (window.MutationObserver) {
    var observer = new MutationObserver(scan);
    observer.observe(document.body, {childList: true, subtree: true});
  }

  // 兜底：容器当时未布局（如折叠的 <details>）时，周期性地补初始化
  setInterval(function () {
    var nodes = document.querySelectorAll('.' + CONTAINER);
    for (var i = 0; i < nodes.length; i++) {
      if (!nodes[i].__panzoomState) init(nodes[i]);
    }
  }, 1000);

  scan();
})();
