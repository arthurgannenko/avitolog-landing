'use strict';

const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#site-navigation');
const dropdowns = [...document.querySelectorAll('.dropdown')];
const desktop = matchMedia('(min-width: 901px)');
const hoverTimers = new Map();

function cancelHover(dropdown) {
  clearTimeout(hoverTimers.get(dropdown));
  hoverTimers.delete(dropdown);
}

function setDropdown(dropdown, open) {
  cancelHover(dropdown);
  dropdown.querySelector('.dropdown-toggle').setAttribute('aria-expanded', String(open));
  dropdown.querySelector('.dropdown-panel').hidden = !open;
}

function closeDropdowns(except = null) {
  dropdowns.forEach(dropdown => {
    if (dropdown !== except) setDropdown(dropdown, false);
  });
}

function closeNavigation() {
  navigation.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.querySelector('.sr-only').textContent = 'Открыть меню';
  closeDropdowns();
}

menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  navigation.classList.toggle('is-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.querySelector('.sr-only').textContent = open ? 'Закрыть меню' : 'Открыть меню';
  if (!open) closeDropdowns();
});

dropdowns.forEach(dropdown => {
  const button = dropdown.querySelector('.dropdown-toggle');
  button.addEventListener('click', () => {
    cancelHover(dropdown);
    const open = button.getAttribute('aria-expanded') !== 'true';
    closeDropdowns(dropdown);
    setDropdown(dropdown, open);
  });
  // Desktop dropdowns work with hover as well as clicks and keyboard focus.
  dropdown.addEventListener('pointerenter', event => {
    if (desktop.matches && event.pointerType === 'mouse') {
      closeDropdowns(dropdown);
      // A short delay avoids opening on an incidental pointer pass and
      // prevents pointerenter from immediately reversing the first click.
      hoverTimers.set(dropdown, setTimeout(() => setDropdown(dropdown, true), 160));
    }
  });
  dropdown.addEventListener('pointerleave', event => {
    cancelHover(dropdown);
    if (desktop.matches && event.pointerType === 'mouse' && !dropdown.contains(document.activeElement)) {
      setDropdown(dropdown, false);
    }
  });
  dropdown.addEventListener('focusout', event => {
    if (!dropdown.contains(event.relatedTarget)) setDropdown(dropdown, false);
  });
});

navigation.addEventListener('click', event => {
  if (event.target.closest('a')) closeNavigation();
});

document.addEventListener('click', event => {
  if (!event.target.closest('.dropdown')) closeDropdowns();
  if (!navigation.contains(event.target) && !menuToggle.contains(event.target)) closeNavigation();
});

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const activeDropdown = dropdowns.find(dropdown => dropdown.querySelector('.dropdown-toggle').getAttribute('aria-expanded') === 'true');
  if (activeDropdown) {
    setDropdown(activeDropdown, false);
    activeDropdown.querySelector('.dropdown-toggle').focus();
  } else if (menuToggle.getAttribute('aria-expanded') === 'true') {
    closeNavigation();
    menuToggle.focus();
  }
});

desktop.addEventListener('change', closeNavigation);

const themeToggle = document.querySelector('.theme-toggle');
themeToggle.addEventListener('click', () => {
  const light = document.body.classList.toggle('light-theme');
  themeToggle.setAttribute('aria-pressed', String(light));
  themeToggle.setAttribute('aria-label', light ? 'Включить тёмную тему' : 'Включить светлую тему');
  themeToggle.querySelector('use').setAttribute('href', light ? '#i-moon' : '#i-sun');
});

document.querySelector('#year').textContent = new Date().getFullYear();
