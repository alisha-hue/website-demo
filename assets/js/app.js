/* =========================================================
   LS Gartenbau & Hausmeisterservice — Premium Site Behaviour
   ========================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  /* ---------------- Footer year ---------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- Preloader ---------------- */
  var MIN_PRELOAD = 900;
  var startTime = Date.now();
  function endPreload() {
    var elapsed = Date.now() - startTime;
    var wait = Math.max(0, MIN_PRELOAD - elapsed);
    setTimeout(function () {
      document.body.classList.remove('is-loading');
      playHeroIntro();
    }, wait);
  }
  if (document.readyState === 'complete') {
    endPreload();
  } else {
    window.addEventListener('load', endPreload);
    setTimeout(endPreload, 2500); // safety fallback
  }

  /* ---------------- Smooth scroll (Lenis) ---------------- */
  var lenis = null;
  if (!reduceMotion && typeof window.Lenis !== 'undefined') {
    lenis = new window.Lenis({
      duration: 1.1,
      easing: function (t) { return Math.min(1, 1 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      touchMultiplier: 1.1
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  function scrollToTarget(target) {
    if (lenis) {
      lenis.scrollTo(target, { offset: -90 });
    } else if (typeof target === 'string') {
      var el = document.querySelector(target);
      if (el) el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href.length < 2) return;
    a.addEventListener('click', function (e) {
      var el = document.querySelector(href);
      if (!el) return;
      e.preventDefault();
      closeMobileNav();
      scrollToTarget(href);
    });
  });

  /* ---------------- Header scroll state ---------------- */
  var header = document.getElementById('siteHeader');
  function onScrollHeader() {
    if (!header) return;
    if (window.scrollY > 30) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------------- Scroll progress bar ---------------- */
  var progressBar = document.getElementById('scrollProgress');
  function onScrollProgress() {
    if (!progressBar) return;
    var h = document.documentElement;
    var scrollTop = h.scrollTop || document.body.scrollTop;
    var scrollHeight = (h.scrollHeight || document.body.scrollHeight) - h.clientHeight;
    var pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  }
  window.addEventListener('scroll', onScrollProgress, { passive: true });
  onScrollProgress();

  /* ---------------- Mobile nav ---------------- */
  var navToggle = document.getElementById('navToggle');
  function openMobileNav() {
    document.body.classList.add('nav-open');
    navToggle.setAttribute('aria-expanded', 'true');
  }
  function closeMobileNav() {
    document.body.classList.remove('nav-open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
  }
  if (navToggle) {
    navToggle.addEventListener('click', function () {
      var open = navToggle.getAttribute('aria-expanded') === 'true';
      if (open) closeMobileNav(); else openMobileNav();
    });
  }

  /* ---------------- Custom cursor ---------------- */
  var cursor = document.getElementById('cursor');
  if (cursor && !isTouch) {
    var cx = 0, cy = 0, dx = 0, dy = 0;
    var dot = cursor.querySelector('.cursor__dot');
    var ring = cursor.querySelector('.cursor__ring');
    window.addEventListener('mousemove', function (e) {
      cx = e.clientX; cy = e.clientY;
      dot.style.left = cx + 'px'; dot.style.top = cy + 'px';
    });
    (function loop() {
      dx += (cx - dx) * 0.18;
      dy += (cy - dy) * 0.18;
      ring.style.left = dx + 'px'; ring.style.top = dy + 'px';
      requestAnimationFrame(loop);
    })();
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest('[data-cursor="link"], a, button, input, textarea, select, .tilt-card')) {
        cursor.classList.add('is-hover');
      }
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest('[data-cursor="link"], a, button, input, textarea, select, .tilt-card')) {
        cursor.classList.remove('is-hover');
      }
    });
    document.addEventListener('mouseleave', function () { cursor.classList.add('is-hidden'); });
    document.addEventListener('mouseenter', function () { cursor.classList.remove('is-hidden'); });
  } else if (cursor) {
    cursor.style.display = 'none';
  }

  /* ---------------- Magnetic buttons ---------------- */
  if (!isTouch && !reduceMotion) {
    document.querySelectorAll('.btn-magnetic').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var relX = e.clientX - r.left - r.width / 2;
        var relY = e.clientY - r.top - r.height / 2;
        btn.style.transform = 'translate(' + relX * 0.28 + 'px,' + relY * 0.5 + 'px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = 'translate(0,0)';
      });
    });
  }

  /* ---------------- Hero mouse-follow glow ---------------- */
  var hero = document.getElementById('hero');
  if (hero && !isTouch) {
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      var mx = ((e.clientX - r.left) / r.width) * 100;
      var my = ((e.clientY - r.top) / r.height) * 100;
      hero.style.setProperty('--mx', mx + '%');
      hero.style.setProperty('--my', my + '%');
    });
  }

  /* ---------------- 3D tilt cards ---------------- */
  if (!isTouch && !reduceMotion) {
    document.querySelectorAll('[data-tilt]').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        var rx = (py - 0.5) * -8;
        var ry = (px - 0.5) * 10;
        card.style.transform = 'perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-4px)';
        card.style.setProperty('--mx', (px * 100) + '%');
        card.style.setProperty('--my', (py * 100) + '%');
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = 'perspective(900px) rotateX(0) rotateY(0) translateY(0)';
      });
    });
  }

  /* ---------------- Parallax layers ---------------- */
  var parallaxEls = document.querySelectorAll('[data-parallax]');
  if (parallaxEls.length && !reduceMotion) {
    function onParallaxScroll() {
      var scrollY = window.scrollY || window.pageYOffset;
      parallaxEls.forEach(function (el) {
        var speed = parseFloat(el.getAttribute('data-speed')) || 0.3;
        var rect = el.getBoundingClientRect();
        var elTop = rect.top + scrollY;
        var relative = (scrollY - elTop) * speed;
        el.style.transform = 'translate3d(0,' + relative + 'px,0)';
      });
    }
    window.addEventListener('scroll', onParallaxScroll, { passive: true });
    onParallaxScroll();
  }

  /* ---------------- Split words (headline reveal) ---------------- */
  function splitWords(el) {
    var text = el.textContent;
    var words = text.trim().split(/\s+/);
    el.innerHTML = words.map(function (w) {
      return '<span class="word"><span>' + w + '</span></span>';
    }).join(' ');
  }
  document.querySelectorAll('.split-words').forEach(splitWords);

  /* ---------------- Wrap split-line text (hero headline) ---------------- */
  document.querySelectorAll('.split-line').forEach(function (el) {
    el.innerHTML = '<span>' + el.textContent + '</span>';
  });

  /* ---------------- Intersection reveal ---------------- */
  var revealSelector = '.reveal-up, .reveal-line, .split-words, .reveal-clip, .service-card, .timeline__step';
  var revealEls = document.querySelectorAll(revealSelector);
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------------- Hero intro timeline (runs once, on load) ---------------- */
  function playHeroIntro() {
    var eyebrow = document.querySelector('.hero__eyebrow');
    var lines = document.querySelectorAll('.hero__title .split-line');
    var subtitle = document.querySelector('.hero__subtitle');
    var actions = document.querySelector('.hero__actions');
    var stats = document.querySelector('.hero__stats');

    if (reduceMotion) {
      [eyebrow, subtitle, actions, stats].forEach(function (el) { if (el) el.classList.add('is-visible'); });
      lines.forEach(function (l) { l.classList.add('is-visible'); });
      return;
    }

    setTimeout(function () { if (eyebrow) eyebrow.classList.add('is-visible'); }, 100);
    lines.forEach(function (line, i) {
      setTimeout(function () { line.classList.add('is-visible'); }, 260 + i * 140);
    });
    setTimeout(function () { if (subtitle) subtitle.classList.add('is-visible'); }, 260 + lines.length * 140 + 120);
    setTimeout(function () { if (actions) actions.classList.add('is-visible'); }, 260 + lines.length * 140 + 260);
    setTimeout(function () { if (stats) stats.classList.add('is-visible'); }, 260 + lines.length * 140 + 420);
  }

  /* ---------------- Animated counters ---------------- */
  var counters = document.querySelectorAll('.counter');
  if (counters.length && 'IntersectionObserver' in window) {
    var counterIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseFloat(el.getAttribute('data-target')) || 0;
        counterIO.unobserve(el);
        if (reduceMotion) { el.textContent = target; return; }
        var start = 0;
        var duration = 1200;
        var startTs = null;
        function step(ts) {
          if (!startTs) startTs = ts;
          var progress = Math.min(1, (ts - startTs) / duration);
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(start + (target - start) * eased);
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { counterIO.observe(c); });
  }

  /* ---------------- Star ratings ---------------- */
  document.querySelectorAll('.stars[data-rating]').forEach(function (el) {
    var rating = parseFloat(el.getAttribute('data-rating')) || 5;
    var pct = Math.max(0, Math.min(5, rating)) / 5 * 100;
    el.style.setProperty('--pct', pct + '%');
  });

  /* ---------------- Testimonial mobile dots ---------------- */
  var track = document.getElementById('testimonialTrack');
  var dotsWrap = document.getElementById('testimonialDots');
  if (track && dotsWrap) {
    var cards = track.querySelectorAll('.testimonial-card');
    cards.forEach(function (_, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Bewertung ' + (i + 1));
      if (i === 0) b.classList.add('is-active');
      b.addEventListener('click', function () {
        cards[i].scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
      });
      dotsWrap.appendChild(b);
    });
    if ('IntersectionObserver' in window) {
      var dotIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var idx = Array.prototype.indexOf.call(cards, entry.target);
            dotsWrap.querySelectorAll('button').forEach(function (b, i) {
              b.classList.toggle('is-active', i === idx);
            });
          }
        });
      }, { root: track, threshold: 0.6 });
      cards.forEach(function (c) { dotIO.observe(c); });
    }
  }

  /* ---------------- Contact form -> mailto fallback ---------------- */
  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var phone = form.phone.value.trim();
      var service = form.service.value;
      var message = form.message.value.trim();

      var subject = 'Rückruf-Anfrage: ' + service;
      var bodyLines = [
        'Name: ' + name,
        'Telefon: ' + phone,
        'Gewünschte Leistung: ' + service,
        '',
        'Nachricht:',
        message || '(keine Angabe)'
      ];
      var mailto = 'mailto:gala-sl@hotmail.com'
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(bodyLines.join('\n'));
      window.location.href = mailto;
    });
  }

  /* ---------------- Back to top ---------------- */
  var backToTop = document.getElementById('backToTop');
  if (backToTop) {
    backToTop.addEventListener('click', function () { scrollToTarget(0); });
  }

})();
