(() => {
	"use strict";

	const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;

	/* ---------------------------------------------------------------------
	   Loader
	--------------------------------------------------------------------- */
	window.addEventListener("load", () => {
		document.body.classList.remove("is-loading");
	});
	// Safety net in case load fires late / assets are slow
	setTimeout(() => document.body.classList.remove("is-loading"), 2500);

	/* ---------------------------------------------------------------------
	   Header scroll state + scroll progress
	--------------------------------------------------------------------- */
	const header = document.getElementById("siteHeader");
	const progressBar = document.getElementById("scrollProgress");
	const backToTop = document.getElementById("backToTop");

	function onScroll() {
		const y = window.scrollY;
		header.classList.toggle("is-scrolled", y > 40);
		backToTop.classList.toggle("is-visible", y > 700);

		const doc = document.documentElement;
		const scrollable = doc.scrollHeight - doc.clientHeight;
		const pct = scrollable > 0 ? (y / scrollable) * 100 : 0;
		progressBar.style.width = pct + "%";
	}
	window.addEventListener("scroll", onScroll, { passive: true });
	onScroll();

	backToTop.addEventListener("click", () => {
		window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
	});

	/* ---------------------------------------------------------------------
	   Mobile nav
	--------------------------------------------------------------------- */
	const navToggle = document.getElementById("navToggle");
	const mobileNav = document.getElementById("mobileNav");

	function closeMobileNav() {
		navToggle.setAttribute("aria-expanded", "false");
		mobileNav.classList.remove("is-open");
		mobileNav.setAttribute("aria-hidden", "true");
		document.body.style.overflow = "";
	}
	function openMobileNav() {
		navToggle.setAttribute("aria-expanded", "true");
		mobileNav.classList.add("is-open");
		mobileNav.setAttribute("aria-hidden", "false");
		document.body.style.overflow = "hidden";
	}
	navToggle.addEventListener("click", () => {
		const isOpen = mobileNav.classList.contains("is-open");
		isOpen ? closeMobileNav() : openMobileNav();
	});
	mobileNav.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMobileNav));

	/* ---------------------------------------------------------------------
	   Smooth anchor scrolling (accounts for fixed header)
	--------------------------------------------------------------------- */
	document.querySelectorAll('a[data-nav], a.btn[href^="#"], .scroll-cue[href^="#"]').forEach((link) => {
		link.addEventListener("click", (e) => {
			const href = link.getAttribute("href");
			if (!href || href === "#" || !href.startsWith("#")) return;
			const target = document.querySelector(href);
			if (!target) return;
			e.preventDefault();
			const offset = 84;
			const top = target.getBoundingClientRect().top + window.scrollY - offset;
			window.scrollTo({ top, behavior: reducedMotion ? "auto" : "smooth" });
		});
	});

	/* ---------------------------------------------------------------------
	   Scroll reveal (IntersectionObserver)
	--------------------------------------------------------------------- */
	const revealEls = document.querySelectorAll("[data-reveal]");
	if ("IntersectionObserver" in window && !reducedMotion) {
		const io = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add("is-visible");
						io.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
		);
		revealEls.forEach((el) => io.observe(el));
	} else {
		revealEls.forEach((el) => el.classList.add("is-visible"));
	}

	/* ---------------------------------------------------------------------
	   Animated counters
	--------------------------------------------------------------------- */
	const counters = document.querySelectorAll("[data-counter]");
	function animateCounter(el) {
		const target = parseFloat(el.dataset.target || "0");
		const duration = 1600;
		const start = performance.now();
		function tick(now) {
			const progress = Math.min((now - start) / duration, 1);
			const eased = 1 - Math.pow(1 - progress, 3);
			el.textContent = Math.round(target * eased);
			if (progress < 1) requestAnimationFrame(tick);
			else el.textContent = target;
		}
		requestAnimationFrame(tick);
	}
	if (counters.length) {
		if ("IntersectionObserver" in window) {
			const cio = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							animateCounter(entry.target);
							cio.unobserve(entry.target);
						}
					});
				},
				{ threshold: 0.6 }
			);
			counters.forEach((el) => cio.observe(el));
		} else {
			counters.forEach(animateCounter);
		}
	}

	/* ---------------------------------------------------------------------
	   Hero particles (lightweight floating dots, CSS-driven)
	--------------------------------------------------------------------- */
	const particlesHost = document.getElementById("heroParticles");
	if (particlesHost && !reducedMotion) {
		const count = isTouch ? 10 : 22;
		for (let i = 0; i < count; i++) {
			const span = document.createElement("span");
			const size = 2 + Math.random() * 4;
			span.style.width = size + "px";
			span.style.height = size + "px";
			span.style.left = Math.random() * 100 + "%";
			span.style.setProperty("--drift", (Math.random() * 80 - 40) + "px");
			const duration = 10 + Math.random() * 12;
			span.style.animationDuration = duration + "s";
			span.style.animationDelay = -(Math.random() * duration) + "s";
			particlesHost.appendChild(span);
		}
	}

	/* ---------------------------------------------------------------------
	   Hero mouse parallax (desktop only)
	--------------------------------------------------------------------- */
	const heroImg = document.getElementById("heroImg");
	const heroSection = document.querySelector(".hero");
	if (heroImg && heroSection && !isTouch && !reducedMotion) {
		heroSection.addEventListener("mousemove", (e) => {
			const rect = heroSection.getBoundingClientRect();
			const x = (e.clientX - rect.left) / rect.width - 0.5;
			const y = (e.clientY - rect.top) / rect.height - 0.5;
			heroImg.style.transform = `scale(1.18) translate(${x * -14}px, ${y * -10}px)`;
		});
		heroSection.addEventListener("mouseleave", () => {
			heroImg.style.transform = "";
		});
	}

	/* ---------------------------------------------------------------------
	   Custom cursor (desktop only, decorative)
	--------------------------------------------------------------------- */
	const cursorDot = document.getElementById("cursorDot");
	const cursorRing = document.getElementById("cursorRing");
	if (!isTouch && cursorDot && cursorRing) {
		let ringX = 0, ringY = 0, dotX = 0, dotY = 0;
		let mouseX = 0, mouseY = 0;
		window.addEventListener("mousemove", (e) => {
			mouseX = e.clientX;
			mouseY = e.clientY;
		});
		function loop() {
			dotX += (mouseX - dotX) * 0.35;
			dotY += (mouseY - dotY) * 0.35;
			ringX += (mouseX - ringX) * 0.15;
			ringY += (mouseY - ringY) * 0.15;
			cursorDot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%,-50%)`;
			cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%,-50%)`;
			requestAnimationFrame(loop);
		}
		requestAnimationFrame(loop);

		document.querySelectorAll("a, button, [data-tilt]").forEach((el) => {
			el.addEventListener("mouseenter", () => cursorRing.classList.add("is-active"));
			el.addEventListener("mouseleave", () => cursorRing.classList.remove("is-active"));
		});
	}

	/* ---------------------------------------------------------------------
	   Magnetic buttons
	--------------------------------------------------------------------- */
	if (!isTouch && !reducedMotion) {
		document.querySelectorAll("[data-magnetic]").forEach((btn) => {
			btn.addEventListener("mousemove", (e) => {
				const rect = btn.getBoundingClientRect();
				const x = e.clientX - rect.left - rect.width / 2;
				const y = e.clientY - rect.top - rect.height / 2;
				btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
			});
			btn.addEventListener("mouseleave", () => {
				btn.style.transform = "";
			});
		});
	}

	/* ---------------------------------------------------------------------
	   3D tilt cards (services + gallery)
	--------------------------------------------------------------------- */
	if (!isTouch && !reducedMotion) {
		document.querySelectorAll("[data-tilt]").forEach((card) => {
			card.addEventListener("mousemove", (e) => {
				const rect = card.getBoundingClientRect();
				const x = e.clientX - rect.left;
				const y = e.clientY - rect.top;
				const rx = ((y / rect.height) - 0.5) * -8;
				const ry = ((x / rect.width) - 0.5) * 8;
				card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
				card.style.setProperty("--mx", x + "px");
				card.style.setProperty("--my", y + "px");
			});
			card.addEventListener("mouseleave", () => {
				card.style.transform = "";
			});
		});
	}

	/* ---------------------------------------------------------------------
	   Testimonials carousel
	--------------------------------------------------------------------- */
	const track = document.getElementById("testimonialTrack");
	const viewport = track ? track.parentElement : null;
	const dotsHost = document.getElementById("tDots");
	const prevBtn = document.getElementById("tPrev");
	const nextBtn = document.getElementById("tNext");

	if (track && viewport) {
		const cards = Array.from(track.children);
		let index = 0;
		let perView = 1;
		let autoplayTimer = null;

		function computePerView() {
			const cardWidth = cards[0].getBoundingClientRect().width + 22;
			perView = Math.max(1, Math.round(viewport.clientWidth / cardWidth));
			return Math.max(1, cards.length - perView + 1);
		}

		function buildDots(pages) {
			dotsHost.innerHTML = "";
			for (let i = 0; i < pages; i++) {
				const b = document.createElement("button");
				b.setAttribute("aria-label", "Bewertung " + (i + 1));
				b.addEventListener("click", () => goTo(i));
				dotsHost.appendChild(b);
			}
		}

		function updateDots() {
			Array.from(dotsHost.children).forEach((d, i) => d.classList.toggle("is-active", i === index));
		}

		function goTo(i, pages) {
			const maxPages = pages || computePerView();
			index = Math.max(0, Math.min(i, maxPages - 1));
			const cardWidth = cards[0].getBoundingClientRect().width + 22;
			track.style.transform = `translateX(-${index * cardWidth}px)`;
			updateDots();
		}

		function init() {
			const pages = computePerView();
			buildDots(pages);
			goTo(0, pages);
		}

		prevBtn.addEventListener("click", () => {
			stopAutoplay();
			goTo(index - 1);
		});
		nextBtn.addEventListener("click", () => {
			stopAutoplay();
			goTo(index + 1);
		});

		function stopAutoplay() {
			if (autoplayTimer) clearInterval(autoplayTimer);
			autoplayTimer = null;
		}
		function startAutoplay() {
			if (reducedMotion) return;
			stopAutoplay();
			autoplayTimer = setInterval(() => {
				const pages = computePerView();
				goTo(index + 1 >= pages ? 0 : index + 1, pages);
			}, 5500);
		}

		// Drag / swipe support
		let isDown = false, startX = 0, startTranslate = 0;
		function getTranslate() {
			const cardWidth = cards[0].getBoundingClientRect().width + 22;
			return -index * cardWidth;
		}
		viewport.addEventListener("pointerdown", (e) => {
			isDown = true;
			startX = e.clientX;
			startTranslate = getTranslate();
			track.style.transition = "none";
			stopAutoplay();
		});
		window.addEventListener("pointermove", (e) => {
			if (!isDown) return;
			const dx = e.clientX - startX;
			track.style.transform = `translateX(${startTranslate + dx}px)`;
		});
		window.addEventListener("pointerup", (e) => {
			if (!isDown) return;
			isDown = false;
			track.style.transition = "";
			const dx = e.clientX - startX;
			const pages = computePerView();
			if (dx < -50) goTo(index + 1, pages);
			else if (dx > 50) goTo(index - 1, pages);
			else goTo(index, pages);
			startAutoplay();
		});

		window.addEventListener("resize", () => {
			const pages = computePerView();
			buildDots(pages);
			goTo(Math.min(index, pages - 1), pages);
		});

		init();
		startAutoplay();

		viewport.addEventListener("mouseenter", stopAutoplay);
		viewport.addEventListener("mouseleave", startAutoplay);
	}

	/* ---------------------------------------------------------------------
	   Contact form (no backend — opens the user's mail client)
	--------------------------------------------------------------------- */
	const form = document.getElementById("contactForm");
	const formNote = document.getElementById("formNote");
	if (form) {
		form.addEventListener("submit", (e) => {
			e.preventDefault();
			const name = form.name.value.trim();
			const email = form.email.value.trim();
			const message = form.message.value.trim();

			if (!name || !email || !message) {
				formNote.textContent = "Bitte füllen Sie alle Pflichtfelder aus.";
				formNote.classList.add("is-error");
				return;
			}

			const service = form.service.value ? `\nLeistung: ${form.service.value}` : "";
			const phone = form.phone.value ? `\nTelefon: ${form.phone.value}` : "";
			const subject = encodeURIComponent("Anfrage über die Website — " + name);
			const body = encodeURIComponent(`Name: ${name}\nE-Mail: ${email}${phone}${service}\n\nNachricht:\n${message}`);

			window.location.href = `mailto:gartenpflege.rehman@gmail.com?subject=${subject}&body=${body}`;

			formNote.classList.remove("is-error");
			formNote.textContent = "Ihr E-Mail-Programm öffnet sich mit Ihrer vorausgefüllten Nachricht.";
		});
	}

	/* ---------------------------------------------------------------------
	   Footer year
	--------------------------------------------------------------------- */
	const yearEl = document.getElementById("year");
	if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
