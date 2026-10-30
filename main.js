/* =========================================================
   1페이지 소개 사이트 — 인터랙션
   1) 모바일 메뉴  2) 스크롤 시 내비 스타일  3) 현재 섹션 표시
   4) 이메일 복사  5) 등장 애니메이션
   ========================================================= */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  /* ---------- 1. 모바일 메뉴 ---------- */
  var nav = document.querySelector('.nav');
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('nav-menu');

  function isMenuOpen() {
    return !!menu && menu.classList.contains('is-open');
  }

  function closeMenu(returnFocus) {
    if (!menu || !toggle) return;
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', '메뉴 열기');
    if (returnFocus) toggle.focus();
  }

  if (toggle && menu && nav) {
    toggle.addEventListener('click', function () {
      var willOpen = !isMenuOpen();
      menu.classList.toggle('is-open', willOpen);
      toggle.setAttribute('aria-expanded', String(willOpen));
      toggle.setAttribute('aria-label', willOpen ? '메뉴 닫기' : '메뉴 열기');
    });

    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) closeMenu(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && isMenuOpen()) closeMenu(true);
    });

    document.addEventListener('click', function (event) {
      if (isMenuOpen() && !nav.contains(event.target)) closeMenu(false);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) closeMenu(false);
    });
  }

  /* ---------- 2. 스크롤 시 내비 스타일 ---------- */
  if (nav) {
    var updateNav = function () {
      nav.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    updateNav();
    window.addEventListener('scroll', updateNav, { passive: true });
  }

  /* ---------- 3. 현재 섹션 표시 ---------- */
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll('.nav__link[href^="#"]')
  );
  var sections = navLinks
    .map(function (link) {
      return document.querySelector(link.getAttribute('href'));
    })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (link) {
            var isActive = link.getAttribute('href') === '#' + entry.target.id;
            if (isActive) {
              link.setAttribute('aria-current', 'true');
            } else {
              link.removeAttribute('aria-current');
            }
          });
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach(function (section) { spy.observe(section); });
  }

  /* ---------- 4. 이메일 복사 ---------- */
  var copyButton = document.querySelector('[data-copy]');
  var toast = document.querySelector('.toast');
  var toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 2200);
  }

  function fallbackCopy(value) {
    var field = document.createElement('textarea');
    field.value = value;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.top = '-1000px';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    var copied = false;
    try {
      copied = document.execCommand('copy');
    } catch (error) {
      copied = false;
    }
    document.body.removeChild(field);
    return copied;
  }

  if (copyButton) {
    copyButton.addEventListener('click', function () {
      var value = copyButton.getAttribute('data-copy') || '';

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(value).then(
          function () { showToast('이메일 주소를 복사했습니다.'); },
          function () { showToast('복사에 실패했습니다. 주소를 직접 선택해 주세요.'); }
        );
        return;
      }

      if (fallbackCopy(value)) {
        showToast('이메일 주소를 복사했습니다.');
      } else {
        showToast('복사에 실패했습니다. 주소를 직접 선택해 주세요.');
      }
    });
  }

  /* ---------- 5. 등장 애니메이션 ---------- */
  var revealItems = document.querySelectorAll('.reveal');

  if (
    prefersReducedMotion ||
    !('IntersectionObserver' in window) ||
    !revealItems.length
  ) {
    // 애니메이션을 쓰지 않는 환경에서는 그냥 보이게 둡니다.
    Array.prototype.forEach.call(revealItems, function (item) {
      item.classList.add('is-visible');
    });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.08 }
    );
    Array.prototype.forEach.call(revealItems, function (item) {
      revealObserver.observe(item);
    });
  }
})();
