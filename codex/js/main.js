(() => {
  'use strict';

  const menuButton = document.querySelector('#menu-toggle');
  const navigation = document.querySelector('#site-nav');
  const mobileLayout = window.matchMedia('(max-width: 700px)');

  function closeMenu(restoreFocus = false) {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Открыть меню');
    navigation.classList.remove('is-open');
    if (restoreFocus) menuButton.focus();
  }

  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
    navigation.classList.toggle('is-open', isOpen);
  });
  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') closeMenu(true);
  });
  document.addEventListener('click', (event) => {
    if (menuButton.getAttribute('aria-expanded') === 'true' && !event.target.closest('.header-inner')) closeMenu();
  });
  mobileLayout.addEventListener('change', () => closeMenu());

  const form = document.querySelector('#request-form');
  const nameInput = document.querySelector('#name');
  const phoneInput = document.querySelector('#phone');
  const equipment = document.querySelector('#equipment');
  const status = document.querySelector('#form-status');
  let validationAttempted = false;

  function checkField(input) {
    const value = input.value.trim();
    let error = '';
    if (input === nameInput) {
      if (value.length < 2) error = 'Введите имя — не менее двух букв.';
      else if (!/\p{L}.*\p{L}/u.test(value)) error = 'Укажите имя, используя буквы.';
    }
    if (input === phoneInput) {
      const digits = value.replace(/\D/g, '');
      if (!/^(?:[78]\d{10}|\d{10})$/.test(digits) || !/^[+\d\s().-]+$/.test(value)) {
        error = 'Введите 10 цифр номера или 11 цифр с кодом 7 / 8.';
      }
    }
    document.querySelector(`#${input.id}-error`).textContent = error;
    if (error) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
    return !error;
  }

  function clearStatus() {
    status.hidden = true;
    status.textContent = '';
    status.classList.remove('is-error');
  }

  [nameInput, phoneInput].forEach((input) => {
    input.addEventListener('input', () => {
      clearStatus();
      if (validationAttempted) checkField(input);
    });
    input.addEventListener('blur', () => {
      if (validationAttempted || input.value.trim()) checkField(input);
    });
  });
  form.addEventListener('input', clearStatus);
  form.addEventListener('change', clearStatus);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    validationAttempted = true;
    const nameValid = checkField(nameInput);
    const phoneValid = checkField(phoneInput);
    status.hidden = false;
    status.classList.toggle('is-error', !nameValid || !phoneValid);
    if (!nameValid || !phoneValid) {
      status.textContent = 'Проверьте имя и телефон. Заявка никуда не отправляется.';
      (!nameValid ? nameInput : phoneInput).focus();
      return;
    }
    status.textContent = 'Заявка заполнена корректно. Это демонстрация: данные не отправлены и не сохранены. Для получения предложения позвоните: 8 922 535 39 69.';
  });

  document.querySelectorAll('[data-category]').forEach((link) => {
    link.addEventListener('click', () => {
      equipment.value = link.dataset.category;
      clearStatus();
    });
  });

  const plateDialog = document.querySelector('#plate-dialog');
  const plateButton = document.querySelector('[data-open-plate]');
  const plateClose = document.querySelector('[data-close-plate]');

  plateButton.addEventListener('click', () => {
    plateDialog.showModal();
    document.body.classList.add('dialog-open');
    plateClose.focus();
  });
  plateClose.addEventListener('click', () => plateDialog.close());
  plateDialog.addEventListener('click', (event) => {
    if (event.target !== plateDialog) return;
    const box = plateDialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) plateDialog.close();
  });
  plateDialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    plateButton.focus({ preventScroll: true });
  });
})();
