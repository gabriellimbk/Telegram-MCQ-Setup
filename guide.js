(() => {
  'use strict';
  const all = (selector) => [...document.querySelectorAll(selector)];
  const checks = all('[data-check]');
  const storeKey = 'telegram-mcq-guide-checklist-v1';
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(storeKey) || '{}') || {}; } catch { saved = {}; }
  function updateChecklist() {
    const values = Object.fromEntries(checks.map(c => [c.dataset.check, c.checked]));
    const done = checks.filter(c => c.checked).length;
    document.getElementById('checklist-count').textContent = `${done} of ${checks.length} complete`;
    document.getElementById('checklist-progress').style.width = `${done / checks.length * 100}%`;
    try { localStorage.setItem(storeKey, JSON.stringify(values)); } catch { /* browser storage may be unavailable */ }
  }
  checks.forEach(c => { c.checked = saved[c.dataset.check] === true; c.addEventListener('change', updateChecklist); });
  updateChecklist();
  document.getElementById('reset-checklist').addEventListener('click', () => { checks.forEach(c => c.checked = false); updateChecklist(); });

  const sidebar = document.getElementById('guide-sidebar');
  const menu = document.getElementById('menu-toggle');
  function closeMenu() { sidebar.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); }
  menu.addEventListener('click', () => { const open = !sidebar.classList.contains('open'); sidebar.classList.toggle('open', open); menu.setAttribute('aria-expanded', String(open)); });
  all('#section-nav a').forEach(a => a.addEventListener('click', closeMenu));

  const sections = all('.guide-section');
  const search = document.getElementById('guide-search');
  const searchState = document.getElementById('search-state');
  const index = new Map(sections.map(s => [s, (s.dataset.title + ' ' + s.textContent).toLowerCase()]));
  function searchGuide() {
    const query = search.value.toLowerCase().trim();
    const terms = query.split(/\s+/).filter(Boolean);
    let found = 0;
    sections.forEach(s => {
      const match = !query || terms.every(term => index.get(s).includes(term));
      s.hidden = !match;
      s.classList.toggle('search-match', !!query && match);
      if (match) found++;
      const nav = document.querySelector(`#section-nav a[href="#${s.id}"]`);
      if (nav) nav.hidden = !match;
    });
    searchState.hidden = !query;
    searchState.replaceChildren();
    if (query) {
      const message = document.createElement('span');
      message.textContent = found ? `${found} guide ${found === 1 ? 'section matches' : 'sections match'} “${search.value.trim()}”.` : 'No sections found. Try “images”, “Active”, “webhook” or “schedule”.';
      const clear = document.createElement('button');
      clear.className = 'inline-button'; clear.textContent = 'Clear search';
      clear.addEventListener('click', () => { search.value = ''; searchGuide(); });
      searchState.append(message, clear);
    }
  }
  search.addEventListener('input', searchGuide);
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link || !search.value.trim()) return;
    const target = document.getElementById(link.getAttribute('href').slice(1));
    if (target && target.hidden) { search.value = ''; searchGuide(); }
  });
  search.addEventListener('keydown', e => { if (e.key === 'Enter') { closeMenu(); if (search.value.trim()) document.getElementById('main').scrollIntoView(); } });
  document.addEventListener('keydown', e => {
    if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
      e.preventDefault(); if (matchMedia('(max-width:760px)').matches) { sidebar.classList.add('open'); menu.setAttribute('aria-expanded','true'); }
      search.focus();
    }
    if (e.key === 'Escape') { if (document.activeElement === search) { search.value = ''; searchGuide(); } closeMenu(); }
  });

  const navLinks = all('#section-nav a');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.hidden) {
          navLinks.forEach(a => { const active = a.hash === `#${entry.target.id}`; a.classList.toggle('active', active); if (active) a.setAttribute('aria-current','location'); else a.removeAttribute('aria-current'); });
        }
      });
    }, {rootMargin:'-90px 0px -65% 0px', threshold:0});
    sections.forEach(s => observer.observe(s));
  }

  const daily = document.getElementById('daily-count');
  const winOne = document.getElementById('window-one');
  const winTwo = document.getElementById('window-two');
  function updateSchedule() {
    const days = all('#planner-days input:checked').map(c => c.value);
    const count = Number(daily.value);
    document.getElementById('second-window-label').hidden = count !== 2;
    document.getElementById('weekly-total').textContent = days.length * count;
    document.getElementById('weekly-caption').textContent = 'planned quizzes per week';
    let text;
    if (!days.length) text = 'No scheduled sends with every weekday unticked. Manual SEND still works.';
    else {
      text = `Tick ${days.join(', ')} in Dashboard. Create ${count === 1 ? 'one fullCode Day timer trigger' : 'two fullCode Day timer triggers'}: ${winOne.value}${count === 2 ? ' and ' + winTwo.value : ''}. Times are approximate.`;
      if (count === 2 && winOne.value === winTwo.value) text += ' Choose different windows to avoid two deliveries in the same period.';
    }
    document.getElementById('schedule-summary').textContent = text;
  }
  all('#planner-days input').forEach(c => c.addEventListener('change', updateSchedule));
  [daily,winOne,winTwo].forEach(c => c.addEventListener('change',updateSchedule));
  updateSchedule();

  const openBeforePrint = new Map();
  window.addEventListener('beforeprint', () => {
    all('details').forEach(d => { openBeforePrint.set(d,d.open); d.open = true; });
  });
  window.addEventListener('afterprint', () => { openBeforePrint.forEach((open,d) => d.open = open); openBeforePrint.clear(); });
  document.getElementById('print-guide').addEventListener('click', () => window.print());
})();
