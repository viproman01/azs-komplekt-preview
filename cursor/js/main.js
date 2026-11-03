(function () {
  "use strict";

  var burger = document.querySelector(".burger");
  var nav = document.getElementById("site-nav");
  var form = document.getElementById("lead-form");
  var success = document.getElementById("form-success");

  function closeNav() {
    if (!nav || !burger) return;
    nav.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
  }

  function openNav() {
    if (!nav || !burger) return;
    nav.classList.add("is-open");
    burger.setAttribute("aria-expanded", "true");
  }

  if (burger && nav) {
    burger.addEventListener("click", function () {
      if (nav.classList.contains("is-open")) {
        closeNav();
      } else {
        openNav();
      }
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeNav();
    });
  }

  function digitsOnly(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function setError(field, on) {
    if (!field) return;
    if (on) field.classList.add("has-error");
    else field.classList.remove("has-error");
  }

  function validateName(value) {
    return String(value || "").trim().length >= 2;
  }

  function validatePhone(value) {
    var digits = digitsOnly(value);
    if (digits.length === 11 && (digits[0] === "7" || digits[0] === "8")) {
      return true;
    }
    return digits.length >= 10;
  }

  function validateEmail(value) {
    var v = String(value || "").trim();
    if (!v) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function validateMessage(value) {
    return String(value || "").trim().length >= 10;
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var nameField = form.querySelector('[data-field="name"]');
      var phoneField = form.querySelector('[data-field="phone"]');
      var emailField = form.querySelector('[data-field="email"]');
      var messageField = form.querySelector('[data-field="message"]');

      var nameOk = validateName(form.name.value);
      var phoneOk = validatePhone(form.phone.value);
      var emailOk = validateEmail(form.email.value);
      var messageOk = validateMessage(form.message.value);

      setError(nameField, !nameOk);
      setError(phoneField, !phoneOk);
      setError(emailField, !emailOk);
      setError(messageField, !messageOk);

      if (!(nameOk && phoneOk && emailOk && messageOk)) {
        if (success) success.classList.remove("is-visible");
        var firstBad = form.querySelector(".has-error input, .has-error textarea");
        if (firstBad) firstBad.focus();
        return;
      }

      if (success) success.classList.add("is-visible");
      form.reset();
      [nameField, phoneField, emailField, messageField].forEach(function (f) {
        setError(f, false);
      });
    });

    form.addEventListener("input", function (event) {
      var target = event.target;
      if (!target || !target.name) return;
      var wrap = target.closest(".field");
      if (!wrap || !wrap.classList.contains("has-error")) return;

      var ok = true;
      if (target.name === "name") ok = validateName(target.value);
      if (target.name === "phone") ok = validatePhone(target.value);
      if (target.name === "email") ok = validateEmail(target.value);
      if (target.name === "message") ok = validateMessage(target.value);
      if (ok) setError(wrap, false);
    });
  }
})();
