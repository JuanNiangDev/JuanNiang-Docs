/**
 * 顶栏滚动状态。
 * 未滚动时导航条不铺底色（页面上只留圆角盒子），滚动后补上底色与分隔线，
 * 避免正文从盒子左右两侧的空白处穿过去。
 *
 * 注意：导航项的「当前页 / 上级分组」高亮是纯 CSS 实现的（custom.css 里用
 * .navbar__link--active 与 .navbar__item.dropdown:has(.dropdown__link--active)），
 * 不在这里打类——脚本打的类会被 React 重渲染冲掉。
 */
(function () {
  function setScrolled() {
    var nav = document.querySelector('.navbar');
    if (nav) nav.classList.toggle('navbar--scrolled', window.scrollY > 8);
  }

  function init() {
    var nav = document.querySelector('.navbar');
    if (!nav) return false;
    setScrolled();
    window.addEventListener('scroll', setScrolled, {passive: true});
    return true;
  }

  if (!init()) {
    var tries = 0;
    var timer = window.setInterval(function () {
      if (init() || ++tries > 40) window.clearInterval(timer);
    }, 100);
  }
})();
