/**
 * Akropolis Restaurant — scroll & motion design (GSAP)
 * Hero text reveal, parallax layers, scroll reveals, animated counters.
 */
(function () {
  "use strict";
  if (!window.gsap) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger);

  if (window.__lenis) {
    window.__lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => window.__lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------------- Split hero title into words for reveal ---------------- */
  document.querySelectorAll("[data-split-words]").forEach((el) => {
    const text = el.textContent.trim();
    el.innerHTML = text
      .split(" ")
      .map((w) => `<span>${w}</span>`)
      .join(" ");
  });

  /* ---------------- Hero intro timeline ---------------- */
  const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
  if (!prefersReducedMotion) {
    heroTl
      .to(".hero-badge", { opacity: 1, y: 0, duration: 0.7, delay: 0.15 })
      .from(
        ".hero-title .line span",
        { yPercent: 120, opacity: 0, duration: 1, stagger: 0.09, ease: "expo.out" },
        "-=0.35"
      )
      .to(".hero-lead, .hero-actions, .hero-rating", { opacity: 1, y: 0, duration: 0.8, stagger: 0.12 }, "-=0.5")
      .to(".scroll-cue", { opacity: 1, duration: 0.6 }, "-=0.3");
  } else {
    gsap.set(
      [".hero-badge", ".hero-title .line span", ".hero-lead", ".hero-actions", ".hero-rating", ".scroll-cue"],
      { opacity: 1, y: 0, yPercent: 0 }
    );
  }

  /* ---------------- Generic scroll reveals ---------------- */
  const revealEls = gsap.utils.toArray(".reveal, .reveal-fade, .reveal-scale, .stagger");
  revealEls.forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: "top 88%",
      once: true,
      onEnter: () => el.classList.add("is-visible"),
    });
  });

  /* ---------------- Hero parallax blobs ---------------- */
  if (!prefersReducedMotion) {
    gsap.to(".hero-blob--a", { y: 120, x: 40, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 } });
    gsap.to(".hero-blob--b", { y: -90, x: -30, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 } });
    gsap.to(".hero-blob--c", { y: 60, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 } });
    gsap.to(".hero-inner", { yPercent: 18, opacity: 0.4, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 } });

    /* floating blob idle motion */
    gsap.to(".hero-blob--a", { x: "+=30", y: "+=20", duration: 9, repeat: -1, yoyo: true, ease: "sine.inOut" });
    gsap.to(".hero-blob--b", { x: "-=24", y: "-=18", duration: 11, repeat: -1, yoyo: true, ease: "sine.inOut" });
  }

  /* ---------------- About image parallax ---------------- */
  if (!prefersReducedMotion && document.querySelector(".about-frame img")) {
    gsap.to(".about-frame img", {
      yPercent: -8,
      ease: "none",
      scrollTrigger: { trigger: ".about-frame", start: "top bottom", end: "bottom top", scrub: 0.6 },
    });
  }

  /* ---------------- Gallery parallax (subtle, alternating) ---------------- */
  if (!prefersReducedMotion) {
    document.querySelectorAll(".gallery-item img").forEach((img, i) => {
      gsap.to(img, {
        yPercent: i % 2 === 0 ? 6 : -6,
        ease: "none",
        scrollTrigger: { trigger: img, start: "top bottom", end: "bottom top", scrub: 0.7 },
      });
    });
  }

  /* ---------------- Animated counters ---------------- */
  document.querySelectorAll("[data-count]").forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = el.dataset.count.includes(".") ? el.dataset.count.split(".")[1].length : 0;
    const obj = { val: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: target,
          duration: 1.6,
          ease: "power2.out",
          onUpdate: () => (el.textContent = obj.val.toFixed(decimals).replace(".", ",")),
        });
      },
    });
  });

  /* ---------------- Section navy -> cream mask reveal on dish rows ---------------- */
  ScrollTrigger.batch(".dish-row", {
    start: "top 92%",
    onEnter: (batch) => gsap.to(batch, { opacity: 1, x: 0, stagger: 0.08, duration: 0.7, ease: "power2.out" }),
  });
  gsap.set(".dish-row", { opacity: 0, x: -24 });

  /* ---------------- Sticky header shrink extra polish handled in main.js ---------------- */

  ScrollTrigger.refresh();
})();
