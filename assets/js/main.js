/**
 * Akropolis Restaurant — core interactions
 * Navigation, mobile drawer, header state, smooth scroll, cursor, lightbox, magnetic buttons.
 */
(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const html = document.documentElement;

  /* ---------------- Loader ---------------- */
  const loader = document.getElementById("loader");
  window.addEventListener("load", () => {
    if (!loader) return;
    setTimeout(() => loader.classList.add("is-hidden"), 250);
  });

  /* ---------------- Lenis smooth scroll ---------------- */
  let lenis = null;
  if (!prefersReducedMotion && window.Lenis) {
    lenis = new Lenis({
      duration: 1.05,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      touchMultiplier: 1.15,
    });
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
    if (window.gsap) {
      lenis.on("scroll", window.ScrollTrigger ? window.ScrollTrigger.update : null);
    }
  }
  window.__lenis = lenis;

  /* ---------------- Header scroll state ---------------- */
  const header = document.getElementById("siteHeader");
  const heroEl = document.querySelector(".hero, .menu-hero");
  const setHeaderState = () => {
    if (!header) return;
    const scrolled = window.scrollY > 40;
    header.classList.toggle("is-scrolled", scrolled);
    const overHero = heroEl && window.scrollY < heroEl.offsetHeight - 90;
    header.classList.toggle("hero-theme", !!overHero && !scrolled);
  };
  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  /* ---------------- Scroll progress bar ---------------- */
  const progressBar = document.getElementById("progressBar");
  const setProgress = () => {
    if (!progressBar) return;
    const h = document.documentElement;
    const scrollTop = h.scrollTop || document.body.scrollTop;
    const scrollHeight = h.scrollHeight - h.clientHeight;
    const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    progressBar.style.width = pct + "%";
  };
  window.addEventListener("scroll", setProgress, { passive: true });
  setProgress();

  /* ---------------- Back to top ---------------- */
  const backToTop = document.getElementById("backToTop");
  if (backToTop) {
    window.addEventListener(
      "scroll",
      () => backToTop.classList.toggle("is-visible", window.scrollY > 700),
      { passive: true }
    );
    backToTop.addEventListener("click", () => {
      if (lenis) lenis.scrollTo(0, { duration: 1.1 });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------------- Mobile drawer ---------------- */
  const navToggle = document.getElementById("navToggle");
  const drawer = document.getElementById("mobileDrawer");
  const backdrop = document.getElementById("mobileDrawerBackdrop");
  const drawerClose = document.getElementById("drawerClose");

  const openDrawer = () => {
    drawer?.classList.add("is-open");
    backdrop?.classList.add("is-open");
    navToggle?.classList.add("is-open");
    navToggle?.setAttribute("aria-expanded", "true");
    html.classList.add("no-scroll");
    if (lenis) lenis.stop();
  };
  const closeDrawer = () => {
    drawer?.classList.remove("is-open");
    backdrop?.classList.remove("is-open");
    navToggle?.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
    html.classList.remove("no-scroll");
    if (lenis) lenis.start();
  };
  navToggle?.addEventListener("click", () => {
    drawer?.classList.contains("is-open") ? closeDrawer() : openDrawer();
  });
  drawerClose?.addEventListener("click", closeDrawer);
  backdrop?.addEventListener("click", closeDrawer);
  drawer?.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeDrawer));
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });

  /* ---------------- Active nav link on scroll (index only) ---------------- */
  const sections = document.querySelectorAll("main [id]");
  const navLinks = document.querySelectorAll(".nav-link[href^='#'], .drawer-nav a[href^='#']");
  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.getAttribute("id");
          navLinks.forEach((link) => {
            const match = link.getAttribute("href") === "#" + id;
            link.classList.toggle("active", match);
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => obs.observe(s));
  }

  /* ---------------- Custom cursor (desktop only) ---------------- */
  const cursor = document.getElementById("cursor");
  if (cursor && !isTouch && !prefersReducedMotion) {
    let mx = window.innerWidth / 2,
      my = window.innerHeight / 2;
    let rx = mx,
      ry = my;
    const dot = cursor.querySelector(".cursor-dot");
    const ring = cursor.querySelector(".cursor-ring");
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      cursor.classList.remove("is-hidden");
      dot.style.left = mx + "px";
      dot.style.top = my + "px";
    });
    document.addEventListener("mouseleave", () => cursor.classList.add("is-hidden"));
    const tick = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.left = rx + "px";
      ring.style.top = ry + "px";
      requestAnimationFrame(tick);
    };
    tick();

    const hoverTargets = "a, button, .magnetic, .gallery-item, .review-card, .highlight-card";
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest(hoverTargets)) cursor.classList.add("is-active");
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest(hoverTargets)) cursor.classList.remove("is-active");
    });
  } else if (cursor) {
    cursor.remove();
  }

  /* ---------------- Magnetic buttons (desktop only) ---------------- */
  if (!isTouch && !prefersReducedMotion) {
    document.querySelectorAll(".magnetic").forEach((el) => {
      const strength = 22;
      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const relX = e.clientX - rect.left - rect.width / 2;
        const relY = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${(relX / rect.width) * strength}px, ${(relY / rect.height) * strength}px)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "translate(0,0)";
      });
    });
  }

  /* ---------------- 3D tilt cards (desktop only) ---------------- */
  if (!isTouch && !prefersReducedMotion) {
    document.querySelectorAll(".highlight-card, .about-badge").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        el.style.transform = `perspective(700px) rotateX(${py * -7}deg) rotateY(${px * 7}deg) translateY(-4px)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "";
      });
    });
  }

  /* ---------------- Lightbox (gallery) ---------------- */
  const lightbox = document.getElementById("lightbox");
  if (lightbox) {
    const lbImg = lightbox.querySelector("img");
    const lbCaption = lightbox.querySelector(".lightbox-caption");
    const lbClose = lightbox.querySelector(".lightbox-close");
    const openLightbox = (src, alt, caption) => {
      lbImg.src = src;
      lbImg.alt = alt || "";
      lbCaption.textContent = caption || "";
      lightbox.classList.add("is-open");
      html.classList.add("no-scroll");
      if (lenis) lenis.stop();
    };
    const closeLightbox = () => {
      lightbox.classList.remove("is-open");
      html.classList.remove("no-scroll");
      if (lenis) lenis.start();
    };
    document.querySelectorAll("[data-lightbox]").forEach((item) => {
      item.addEventListener("click", () => {
        const img = item.querySelector("img");
        openLightbox(img.src, img.alt, item.dataset.caption || img.alt);
      });
    });
    lbClose?.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeLightbox();
    });
  }

  /* ---------------- Smooth in-page anchor scroll with header offset ---------------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(target, { offset: -84, duration: 1.15 });
      } else {
        const top = target.getBoundingClientRect().top + window.scrollY - 84;
        window.scrollTo({ top, behavior: "smooth" });
      }
    });
  });

  /* ---------------- Current year + today highlight helper ---------------- */
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
})();
