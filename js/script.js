(function () {
	"use strict";

	// Footer year
	var yearEl = document.getElementById("year");
	if (yearEl) yearEl.textContent = new Date().getFullYear();

	// Sticky header shadow on scroll
	var header = document.getElementById("site-header");
	var backToTop = document.getElementById("back-to-top");
	function onScroll() {
		var scrolled = window.scrollY > 12;
		if (header) header.classList.toggle("scrolled", scrolled);
		if (backToTop) backToTop.classList.toggle("visible", window.scrollY > 480);
	}
	document.addEventListener("scroll", onScroll, { passive: true });
	onScroll();

	// Mobile nav toggle
	var navToggle = document.getElementById("nav-toggle");
	var mainNav = document.getElementById("main-nav");
	if (navToggle && mainNav) {
		navToggle.addEventListener("click", function () {
			var isOpen = mainNav.classList.toggle("open");
			navToggle.classList.toggle("open", isOpen);
			navToggle.setAttribute("aria-expanded", String(isOpen));
		});
		mainNav.querySelectorAll("a").forEach(function (link) {
			link.addEventListener("click", function () {
				mainNav.classList.remove("open");
				navToggle.classList.remove("open");
				navToggle.setAttribute("aria-expanded", "false");
			});
		});
	}

	// Contact form
	var form = document.getElementById("contact-form");
	var note = document.getElementById("form-note");
	var CONTACT_EMAIL = "eveline.muller@gmx.de";

	function setFieldError(field, message) {
		var wrapper = field.closest(".field");
		var errorEl = wrapper ? wrapper.querySelector(".field-error") : null;
		if (wrapper) wrapper.classList.toggle("invalid", !!message);
		if (errorEl) errorEl.textContent = message || "";
	}

	function validateForm() {
		var valid = true;
		var name = form.querySelector("#cf-name");
		var email = form.querySelector("#cf-email");
		var message = form.querySelector("#cf-message");
		var privacy = form.querySelector("#cf-privacy");

		if (!name.value.trim()) {
			setFieldError(name, "Bitte geben Sie Ihren Namen ein.");
			valid = false;
		} else {
			setFieldError(name, "");
		}

		var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailPattern.test(email.value.trim())) {
			setFieldError(email, "Bitte geben Sie eine gültige E-Mail-Adresse ein.");
			valid = false;
		} else {
			setFieldError(email, "");
		}

		if (!message.value.trim()) {
			setFieldError(message, "Bitte geben Sie eine Nachricht ein.");
			valid = false;
		} else {
			setFieldError(message, "");
		}

		if (!privacy.checked) {
			setFieldError(privacy, "Bitte stimmen Sie der Datenschutzerklärung zu.");
			valid = false;
		} else {
			setFieldError(privacy, "");
		}

		return valid;
	}

	if (form) {
		form.addEventListener("submit", function (e) {
			e.preventDefault();
			note.classList.remove("error");

			if (!validateForm()) {
				note.textContent = "Bitte prüfen Sie Ihre Eingaben.";
				note.classList.add("error");
				return;
			}

			var data = {
				name: form.querySelector("#cf-name").value.trim(),
				email: form.querySelector("#cf-email").value.trim(),
				phone: form.querySelector("#cf-phone").value.trim(),
				subject: form.querySelector("#cf-subject").value,
				message: form.querySelector("#cf-message").value.trim()
			};

			var bodyLines = [
				"Name: " + data.name,
				"E-Mail: " + data.email,
				"Telefon: " + (data.phone || "-"),
				"Anliegen: " + data.subject,
				"",
				data.message
			];

			var mailtoUrl =
				"mailto:" + CONTACT_EMAIL +
				"?subject=" + encodeURIComponent("Kontaktanfrage: " + data.subject + " (" + data.name + ")") +
				"&body=" + encodeURIComponent(bodyLines.join("\n"));

			window.location.href = mailtoUrl;

			note.textContent = "Ihr E-Mail-Programm wird geöffnet, damit Sie die Nachricht an Eveline Muller senden können.";
			note.classList.remove("error");
		});
	}
})();
