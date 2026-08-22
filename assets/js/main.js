(() => {
	'use strict';

	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
	const html = document.documentElement;

	/* ---------------------------------------------------------------------
	   Preloader
	   ------------------------------------------------------------------- */
	function initPreloader() {
		const bar = document.querySelector('.preloader__bar span');
		let progress = 0;
		const tick = setInterval(() => {
			progress = Math.min(progress + Math.random() * 22, 92);
			if (bar) bar.style.width = progress + '%';
		}, 140);

		let finished = false;
		function finish() {
			if (finished) return;
			finished = true;
			clearInterval(tick);
			if (bar) bar.style.width = '100%';
			setTimeout(() => {
				document.body.classList.remove('is-loading');
				revealHero();
			}, reducedMotion ? 0 : 380);
		}
		window.addEventListener('load', finish);
		// safety net: never let a slow/blocked subresource strand the page behind the preloader
		setTimeout(finish, 6000);
	}

	/* Hero content always plays its entrance the moment the preloader clears —
	   it must never depend on IntersectionObserver, since on short viewports
	   the stats row can sit just below the "in view" threshold at load. */
	function revealHero() {
		document.querySelectorAll('.hero [data-reveal], .hero [data-split-lines]').forEach((el) => {
			el.classList.add('in-view');
		});
	}

	/* ---------------------------------------------------------------------
	   Split headline lines into an inner span for the reveal animation
	   (uses innerHTML so <em>/.grad-text markup inside a line survives)
	   ------------------------------------------------------------------- */
	function initTextSplitHTML() {
		document.querySelectorAll('[data-split-lines]').forEach((el) => {
			Array.from(el.children).forEach((line, i) => {
				if (!line.classList.contains('line')) return;
				const html = line.innerHTML;
				line.innerHTML = '';
				line.style.setProperty('--i', i);
				const inner = document.createElement('span');
				inner.className = 'line-inner';
				inner.innerHTML = html;
				line.appendChild(inner);
			});
		});
	}

	/* ---------------------------------------------------------------------
	   Scroll reveal (IntersectionObserver)
	   ------------------------------------------------------------------- */
	function initReveal() {
		// hero has its own load-triggered entrance (see revealHero) and is excluded here
		const targets = document.querySelectorAll('[data-reveal]:not(.hero *), [data-split-lines]:not(.hero *)');
		if (!('IntersectionObserver' in window) || reducedMotion) {
			targets.forEach((el) => el.classList.add('in-view'));
			return;
		}
		const io = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add('in-view');
					io.unobserve(entry.target);
				}
			});
		}, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
		targets.forEach((el) => io.observe(el));
	}

	/* ---------------------------------------------------------------------
	   Header: scrolled state, progress bar, active nav link
	   ------------------------------------------------------------------- */
	function initHeader() {
		const header = document.getElementById('siteHeader');
		const progress = document.getElementById('scrollProgress');
		const navLinks = document.querySelectorAll('[data-nav-link]');
		const sections = Array.from(navLinks)
			.map((a) => document.querySelector(a.getAttribute('href')))
			.filter(Boolean);

		let ticking = false;
		function onScroll() {
			const y = window.scrollY;
			const max = document.documentElement.scrollHeight - window.innerHeight;
			header.classList.toggle('is-scrolled', y > 40);
			if (progress) progress.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
			ticking = false;
		}
		window.addEventListener('scroll', () => {
			if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
		}, { passive: true });
		onScroll();

		if ('IntersectionObserver' in window && sections.length) {
			const io = new IntersectionObserver((entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const id = '#' + entry.target.id;
						navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === id));
					}
				});
			}, { rootMargin: '-45% 0px -45% 0px' });
			sections.forEach((s) => io.observe(s));
		}
	}

	/* ---------------------------------------------------------------------
	   Mobile menu
	   ------------------------------------------------------------------- */
	function initMobileMenu() {
		const toggle = document.getElementById('menuToggle');
		const menu = document.getElementById('mobileMenu');
		if (!toggle || !menu) return;

		function close() {
			toggle.setAttribute('aria-expanded', 'false');
			menu.classList.remove('is-open');
			document.body.style.overflow = '';
		}
		function open() {
			toggle.setAttribute('aria-expanded', 'true');
			menu.classList.add('is-open');
			document.body.style.overflow = 'hidden';
		}
		toggle.addEventListener('click', () => {
			toggle.getAttribute('aria-expanded') === 'true' ? close() : open();
		});
		menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
		window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
	}

	/* ---------------------------------------------------------------------
	   Custom cursor + magnetic elements (fine pointer only)
	   ------------------------------------------------------------------- */
	function initCursor() {
		if (!isFinePointer || reducedMotion) return;
		const cursor = document.getElementById('cursor');
		if (!cursor) return;
		const dot = cursor.querySelector('.cursor__dot');
		const ring = cursor.querySelector('.cursor__ring');

		let mx = window.innerWidth / 2, my = window.innerHeight / 2;
		let rx = mx, ry = my;

		window.addEventListener('mousemove', (e) => {
			mx = e.clientX; my = e.clientY;
			dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
		});
		window.addEventListener('mousedown', () => cursor.classList.add('is-active'));
		window.addEventListener('mouseup', () => cursor.classList.remove('is-active'));
		document.addEventListener('mouseleave', () => cursor.classList.add('is-hidden'));
		document.addEventListener('mouseenter', () => cursor.classList.remove('is-hidden'));

		function raf() {
			rx += (mx - rx) * 0.16;
			ry += (my - ry) * 0.16;
			ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
			requestAnimationFrame(raf);
		}
		requestAnimationFrame(raf);

		document.querySelectorAll('a, button, [data-tilt], input, textarea').forEach((el) => {
			el.addEventListener('mouseenter', () => cursor.classList.add('is-active'));
			el.addEventListener('mouseleave', () => cursor.classList.remove('is-active'));
		});
	}

	function initMagnetic() {
		if (!isFinePointer || reducedMotion) return;
		document.querySelectorAll('[data-magnetic]').forEach((el) => {
			let bounds;
			el.addEventListener('mouseenter', () => { bounds = el.getBoundingClientRect(); });
			el.addEventListener('mousemove', (e) => {
				if (!bounds) bounds = el.getBoundingClientRect();
				const relX = e.clientX - bounds.left - bounds.width / 2;
				const relY = e.clientY - bounds.top - bounds.height / 2;
				el.style.transform = `translate(${relX * 0.28}px, ${relY * 0.32}px)`;
			});
			el.addEventListener('mouseleave', () => { el.style.transform = ''; });
		});
	}

	/* ---------------------------------------------------------------------
	   3D tilt cards + radial glow position
	   ------------------------------------------------------------------- */
	function initTilt() {
		if (!isFinePointer || reducedMotion) return;
		document.querySelectorAll('[data-tilt]').forEach((card) => {
			const max = 7;
			card.addEventListener('mousemove', (e) => {
				const r = card.getBoundingClientRect();
				const px = (e.clientX - r.left) / r.width;
				const py = (e.clientY - r.top) / r.height;
				const rotY = (px - 0.5) * max * 2;
				const rotX = (0.5 - py) * max * 2;
				card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
				card.style.setProperty('--mx', `${px * 100}%`);
				card.style.setProperty('--my', `${py * 100}%`);
			});
			card.addEventListener('mouseleave', () => {
				card.style.transform = 'perspective(900px) rotateX(0) rotateY(0) translateY(0)';
			});
		});
	}

	/* ---------------------------------------------------------------------
	   Parallax: hero orbs (scroll) + project media (scroll depth)
	   ------------------------------------------------------------------- */
	function initParallax() {
		if (reducedMotion) return;
		const orbs = document.querySelectorAll('[data-parallax]');
		const media = document.querySelectorAll('[data-parallax-inner]');
		if (!orbs.length && !media.length) return;

		let ticking = false;
		function update() {
			const y = window.scrollY;
			orbs.forEach((el) => {
				const speed = parseFloat(el.dataset.parallax) || 0.2;
				el.style.transform = `translate3d(0, ${y * speed}px, 0)`;
			});
			media.forEach((el) => {
				const r = el.getBoundingClientRect();
				const center = r.top + r.height / 2 - window.innerHeight / 2;
				el.style.setProperty('--parallax-y', `${center * -0.06}px`);
			});
			ticking = false;
		}
		window.addEventListener('scroll', () => {
			if (!ticking) { requestAnimationFrame(update); ticking = true; }
		}, { passive: true });
		update();
	}

	/* ---------------------------------------------------------------------
	   Animated counters
	   ------------------------------------------------------------------- */
	function initCounters() {
		const stats = document.querySelectorAll('[data-count]');
		if (!stats.length) return;

		function animate(el) {
			const target = parseFloat(el.dataset.target);
			const decimals = parseInt(el.dataset.decimal || '0', 10);
			const suffix = el.dataset.suffix || '';
			const valueEl = el.querySelector('.stat__value');
			const duration = reducedMotion ? 1 : 1600;
			const start = performance.now();

			function frame(now) {
				const t = Math.min((now - start) / duration, 1);
				const eased = 1 - Math.pow(1 - t, 3);
				const current = target * eased;
				valueEl.textContent = current.toFixed(decimals).replace('.', ',') + suffix;
				if (t < 1) requestAnimationFrame(frame);
			}
			requestAnimationFrame(frame);
		}

		if (!('IntersectionObserver' in window)) { stats.forEach(animate); return; }
		const io = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) { animate(entry.target); io.unobserve(entry.target); }
			});
		}, { threshold: 0.5 });
		stats.forEach((el) => io.observe(el));
	}

	/* ---------------------------------------------------------------------
	   Testimonials carousel: buttons, dots, drag-to-scroll
	   ------------------------------------------------------------------- */
	function initTestimonials() {
		const track = document.getElementById('testimonials');
		const dotsWrap = document.getElementById('testimonialDots');
		if (!track) return;
		const cards = Array.from(track.children);

		cards.forEach((_, i) => {
			const dot = document.createElement('button');
			dot.setAttribute('aria-label', `Bewertung ${i + 1} anzeigen`);
			if (i === 0) dot.classList.add('is-active');
			dot.addEventListener('click', () => {
				cards[i].scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', inline: 'start', block: 'nearest' });
			});
			dotsWrap.appendChild(dot);
		});
		const dots = Array.from(dotsWrap.children);

		document.querySelectorAll('[data-carousel-prev]').forEach((btn) => btn.addEventListener('click', () => {
			track.scrollBy({ left: -track.clientWidth * 0.85, behavior: 'smooth' });
		}));
		document.querySelectorAll('[data-carousel-next]').forEach((btn) => btn.addEventListener('click', () => {
			track.scrollBy({ left: track.clientWidth * 0.85, behavior: 'smooth' });
		}));

		let scrollTick = false;
		track.addEventListener('scroll', () => {
			if (scrollTick) return;
			scrollTick = true;
			requestAnimationFrame(() => {
				const center = track.scrollLeft + track.clientWidth / 2;
				let closest = 0, min = Infinity;
				cards.forEach((c, i) => {
					const d = Math.abs((c.offsetLeft + c.clientWidth / 2) - center);
					if (d < min) { min = d; closest = i; }
				});
				dots.forEach((d, i) => d.classList.toggle('is-active', i === closest));
				scrollTick = false;
			});
		}, { passive: true });

		// desktop drag-to-scroll
		if (isFinePointer) {
			let isDown = false, startX = 0, startScroll = 0;
			track.addEventListener('pointerdown', (e) => {
				isDown = true;
				startX = e.clientX;
				startScroll = track.scrollLeft;
				track.setPointerCapture(e.pointerId);
			});
			track.addEventListener('pointermove', (e) => {
				if (!isDown) return;
				track.scrollLeft = startScroll - (e.clientX - startX);
			});
			['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) =>
				track.addEventListener(ev, () => { isDown = false; })
			);
		}
	}

	/* ---------------------------------------------------------------------
	   Process timeline progress
	   ------------------------------------------------------------------- */
	function initTimeline() {
		const section = document.getElementById('prozess');
		const progress = document.getElementById('timelineProgress');
		if (!section || !progress) return;

		let ticking = false;
		function update() {
			const r = section.getBoundingClientRect();
			const total = r.height + window.innerHeight * 0.5;
			const covered = Math.min(Math.max(window.innerHeight - r.top, 0), total);
			progress.style.width = `${(covered / total) * 100}%`;
			ticking = false;
		}
		window.addEventListener('scroll', () => {
			if (!ticking) { requestAnimationFrame(update); ticking = true; }
		}, { passive: true });
		update();
	}

	/* ---------------------------------------------------------------------
	   Contact form (static site → mailto handoff, no backend)
	   ------------------------------------------------------------------- */
	function initContactForm() {
		const form = document.getElementById('contactForm');
		const status = document.getElementById('formStatus');
		if (!form) return;

		form.addEventListener('submit', (e) => {
			e.preventDefault();
			const name = form.name.value.trim();
			const email = form.email.value.trim();
			const company = form.company.value.trim();
			const message = form.message.value.trim();

			if (!name || !email || !message) {
				status.textContent = 'Bitte füllen Sie Name, E-Mail und Nachricht aus.';
				status.classList.remove('is-success');
				return;
			}

			const subject = encodeURIComponent(`Projektanfrage von ${name}`);
			const bodyLines = [message, '', `Name: ${name}`, `E-Mail: ${email}`];
			if (company) bodyLines.push(`Unternehmen: ${company}`);
			const body = encodeURIComponent(bodyLines.join('\n'));

			status.textContent = 'Ihr E-Mail-Programm wird geöffnet …';
			status.classList.add('is-success');
			window.location.href = `mailto:hallo@hue-studio.de?subject=${subject}&body=${body}`;
		});
	}

	/* ---------------------------------------------------------------------
	   Misc: back-to-top, footer year
	   ------------------------------------------------------------------- */
	function initMisc() {
		const year = document.getElementById('year');
		if (year) year.textContent = new Date().getFullYear();

		const backToTop = document.getElementById('backToTop');
		if (backToTop) {
			backToTop.addEventListener('click', () => {
				window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
			});
		}
	}

	/* ---------------------------------------------------------------------
	   Init
	   ------------------------------------------------------------------- */
	document.addEventListener('DOMContentLoaded', () => {
		initPreloader();
		initTextSplitHTML();
		initReveal();
		initHeader();
		initMobileMenu();
		initCursor();
		initMagnetic();
		initTilt();
		initParallax();
		initCounters();
		initTestimonials();
		initTimeline();
		initContactForm();
		initMisc();
	});
})();
