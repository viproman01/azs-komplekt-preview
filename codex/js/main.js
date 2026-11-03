(() => {
  'use strict';

  const menuButton = document.querySelector('#menu-toggle');
  const navigation = document.querySelector('#site-nav');
  const mobileLayout = window.matchMedia('(max-width: 1000px)');

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
    const link = event.target.closest('a');
    if (!link || !mobileLayout.matches) return;
    closeMenu();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
    }
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
  const comment = document.querySelector('#message');
  const status = document.querySelector('#form-status');
  const result = document.querySelector('#request-result');
  const requestText = document.querySelector('#request-text');
  const whatsappLink = document.querySelector('#whatsapp-link');
  let validationAttempted = false;

  function checkField(input) {
    const value = input.value.trim();
    let error = '';
    if (input === nameInput) {
      if (value.length < 2) error = 'Введите имя — не менее двух букв.';
      else if (value.length > 80) error = 'Сократите имя до 80 символов.';
      else if (!/\p{L}.*\p{L}/u.test(value)) error = 'Укажите имя, используя буквы.';
    }
    if (input === phoneInput) {
      const digits = value.replace(/\D/g, '');
      if (!/^(?:[78]\d{10}|\d{10})$/.test(digits) || !/^[+\d\s().-]+$/.test(value) || value.length > 30) {
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
    result.hidden = true;
    requestText.textContent = '';
    whatsappLink.removeAttribute('href');
  }

  [nameInput, phoneInput].forEach((input) => {
    input.addEventListener('input', () => {
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
    clearStatus();
    const nameValid = checkField(nameInput);
    const phoneValid = checkField(phoneInput);
    status.hidden = false;
    status.classList.toggle('is-error', !nameValid || !phoneValid);
    if (!nameValid || !phoneValid) {
      status.textContent = 'Проверьте имя и телефон, чтобы сформировать заявку.';
      (!nameValid ? nameInput : phoneInput).focus();
      return;
    }

    const text = [
      'Заявка с сайта-прототипа',
      `Имя: ${nameInput.value.trim()}`,
      `Телефон: ${phoneInput.value.trim()}`,
      `Интерес / категория: ${equipment.value || 'Уточнить'}`,
      `Комментарий: ${comment.value.trim() || 'Уточнить'}`
    ].join('\n');
    const whatsappUrl = `https://wa.me/79225353969?text=${encodeURIComponent(text)}`;
    requestText.textContent = text;
    whatsappLink.href = whatsappUrl;
    result.hidden = false;
    status.textContent = 'Заявка сформирована. Текст и кнопки связи доступны ниже.';

    // Keep this synchronous inside submit so the browser can use the user's gesture.
    // With noopener a null return value does not reliably identify a blocked popup.
    try {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    } catch (_) {
      // The prepared text and explicit links remain usable if opening is disallowed.
    }
    result.focus({ preventScroll: true });
    result.scrollIntoView({ block: 'nearest' });
  });

  document.querySelectorAll('[data-category]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      equipment.value = link.dataset.category;
      clearStatus();
      equipment.focus({ preventScroll: true });
      form.scrollIntoView({ block: 'start' });
    });
  });

  const mapButton = document.querySelector('#map-load');
  const mapContainer = document.querySelector('#map-container');
  const mapPlaceholder = document.querySelector('#map-placeholder');
  const mapStatus = document.querySelector('#map-status');
  let mapTimer;
  let activeFrame;

  function loadMap() {
    window.clearTimeout(mapTimer);
    if (activeFrame) activeFrame.remove();
    const frame = document.createElement('iframe');
    activeFrame = frame;
    mapPlaceholder.hidden = false;
    mapButton.disabled = true;
    mapButton.textContent = 'Загружаем карту…';
    mapContainer.setAttribute('aria-busy', 'true');
    mapStatus.classList.remove('is-error');
    mapStatus.textContent = 'Загружаем карту Самары…';

    function failMap() {
      if (activeFrame !== frame) return;
      window.clearTimeout(mapTimer);
      activeFrame = null;
      frame.remove();
      mapPlaceholder.hidden = false;
      mapContainer.removeAttribute('aria-busy');
      mapButton.disabled = false;
      mapButton.textContent = 'Повторить загрузку';
      mapStatus.classList.add('is-error');
      mapStatus.textContent = 'Карта не загрузилась. Попробуйте ещё раз или откройте карту по ссылкам ниже. Маршрут можно уточнить по телефону.';
    }

    frame.title = 'Карта Самары — точное положение объекта уточнить';
    frame.referrerPolicy = 'no-referrer';
    frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups');
    frame.addEventListener('load', () => {
      if (activeFrame !== frame) return;
      window.clearTimeout(mapTimer);
      mapContainer.removeAttribute('aria-busy');
      mapButton.disabled = false;
      mapButton.textContent = 'Загрузить карту заново';
      // Cross-origin frame contents cannot be inspected; keep a visible fallback.
      mapStatus.textContent = 'Если карта не отображается, повторите загрузку или откройте её по ссылкам ниже. Точное положение на карте — уточнить.';
    }, { once: true });
    frame.addEventListener('error', failMap, { once: true });
    frame.src = 'https://www.openstreetmap.org/export/embed.html?bbox=49.9,53.1,50.4,53.35&layer=mapnik';
    mapPlaceholder.hidden = true;
    mapContainer.append(frame);
    mapTimer = window.setTimeout(failMap, 15000);
  }
  mapButton.addEventListener('click', loadMap);

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
