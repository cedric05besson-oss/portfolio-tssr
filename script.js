/* ============================================================
   PORTFOLIO — Cédric BESSON · script.js
   ------------------------------------------------------------
   Chaque module est une fonction autonome (IIFE) : on peut en
   supprimer un sans casser les autres.
     1. Thème clair / sombre (mémorisé dans le navigateur)
     2. Texte tournant du Hero (postes visés)
     3. Compteurs animés
     4. Apparition des blocs au défilement
     5. Barre de progression + lien du menu actif
     6. Fermeture du menu mobile au clic
     7. Filtre de la timeline Parcours
     8. Formulaire de contact (ouvre la messagerie)
     9. Année automatique du pied de page
    10. Effet « spotlight » sur les cartes
    11. Bandeau défilant des technologies
   ============================================================ */
'use strict';

/* ---------- 1. THÈME CLAIR / SOMBRE ---------- */
(function () {
  const root  = document.documentElement;
  const btn   = document.getElementById('themeToggle');
  const icon  = document.getElementById('themeIcon');
  const label = document.getElementById('themeLabel');
  if (!btn) return;

  // localStorage peut être bloqué (navigation privée) : on protège chaque accès
  function load() { try { return localStorage.getItem('theme'); } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem('theme', v); } catch (e) { /* ignoré */ } }

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    const dark = theme === 'dark';
    icon.className    = dark ? 'fas fa-sun' : 'fas fa-moon';
    label.textContent = dark ? 'Mode clair' : 'Mode sombre';
  }

  // Thème enregistré, sinon préférence du système
  const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  apply(load() || (prefersLight ? 'light' : 'dark'));

  btn.addEventListener('click', function () {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    apply(next);
    save(next);
  });
})();

/* ---------- 2. TEXTE TOURNANT DU HERO ----------
   Modifier la liste ROLES pour changer les postes affichés. */
(function () {
  const ROLES = [
    'Administrateur Systèmes & Réseaux',
    'Technicien Support N2',
    'Exploitation & Supervision',
    'Assistant RSSI'
  ];
  const el = document.getElementById('typed-role');
  if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let role = 0, char = ROLES[0].length, deleting = true;

  function tick() {
    const word = ROLES[role];
    char += deleting ? -1 : 1;
    el.textContent = word.slice(0, char);

    let delay = deleting ? 35 : 70;
    if (!deleting && char === word.length) { delay = 2200; deleting = true; }   // pause, mot complet
    else if (deleting && char === 0) {                                          // mot effacé → suivant
      deleting = false;
      role = (role + 1) % ROLES.length;
      delay = 400;
    }
    setTimeout(tick, delay);
  }
  setTimeout(tick, 2500); // le premier poste reste affiché quelques secondes
})();

/* ---------- 3. COMPTEURS ANIMÉS ----------
   Tout élément .counter avec data-target="N" compte de 0 à N. */
(function () {
  const counters = document.querySelectorAll('.counter');
  if (!('IntersectionObserver' in window)) return; // valeur finale déjà écrite dans le HTML

  const obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const start = performance.now();
      const duration = 1400;

      (function step(now) {
        const p = Math.min((now - start) / duration, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))); // easing « ease-out »
        if (p < 1) requestAnimationFrame(step);
      })(start);

      obs.unobserve(el);
    });
  }, { threshold: 0.6 });

  counters.forEach(function (c) { obs.observe(c); });
})();

/* ---------- 4. APPARITION AU DÉFILEMENT ---------- */
(function () {
  const elems = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    elems.forEach(function (el) { el.classList.add('visible'); });
    return;
  }
  const obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  elems.forEach(function (el) { obs.observe(el); });
})();

/* ---------- 5. PROGRESSION DE LECTURE + LIEN ACTIF ---------- */
(function () {
  const bar      = document.getElementById('read-progress');
  const sections = document.querySelectorAll('main section[id]');
  const links    = document.querySelectorAll('#navContent .nav-link');

  function onScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';

    let current = '';
    sections.forEach(function (s) { if (s.getBoundingClientRect().top <= 100) current = s.id; });
    links.forEach(function (l) { l.classList.toggle('active', l.getAttribute('href') === '#' + current); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ---------- 6. FERMETURE DU MENU MOBILE ---------- */
(function () {
  const collapse = document.getElementById('navContent');
  if (!collapse || typeof bootstrap === 'undefined') return;
  collapse.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', function () {
      const bs = bootstrap.Collapse.getInstance(collapse);
      if (bs) bs.hide();
    });
  });
})();

/* ---------- 7. FILTRE DE LA TIMELINE ----------
   Un élément peut appartenir à plusieurs catégories : data-cat="formation it" */
(function () {
  const buttons = document.querySelectorAll('.filter-btn');
  const items   = document.querySelectorAll('.timeline-item');

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const filter = btn.dataset.filter;

      buttons.forEach(function (b) {
        const on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });

      items.forEach(function (item) {
        const cats = (item.dataset.cat || '').split(' ');
        const show = filter === 'all' || cats.indexOf(filter) !== -1;
        item.classList.toggle('is-hidden', !show);
        if (show) item.classList.add('visible'); // évite qu'un élément réaffiché reste invisible
      });
    });
  });
})();

/* ---------- 8. FORMULAIRE DE CONTACT ----------
   Pas de serveur : on prépare un e-mail dans la messagerie du visiteur. */
(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;
  const EMAIL    = 'cedric05.besson@gmail.com';
  const feedback = document.getElementById('cf-feedback');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Validation simple des champs obligatoires
    let ok = true;
    form.querySelectorAll('[required]').forEach(function (field) {
      const empty = !field.value.trim();
      field.classList.toggle('is-invalid', empty);
      if (empty) ok = false;
    });
    if (!ok) {
      feedback.style.color = 'var(--clr-danger)';
      feedback.textContent = '⚠ Merci de remplir les champs obligatoires (*).';
      return;
    }

    const name    = form.elements.name.value.trim();
    const company = form.elements.company.value.trim();
    const subject = form.elements.subject.value.trim();
    const body    = form.elements.message.value.trim() +
                    '\n\n— ' + name + (company ? ' (' + company + ')' : '');

    window.location.href = 'mailto:' + EMAIL +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);

    feedback.style.color = 'var(--clr-success)';
    feedback.textContent = '✓ Votre messagerie s\'ouvre avec le message pré-rempli.';
  });

  // Retire l'état d'erreur dès que l'utilisateur corrige un champ
  form.addEventListener('input', function (e) { e.target.classList.remove('is-invalid'); });
})();

/* ---------- 9. ANNÉE DU PIED DE PAGE ---------- */
(function () {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();

/* ---------- 10. EFFET « SPOTLIGHT » ----------
   Un halo suit la souris sur les cartes (style : .spot::after dans style.css). */
(function () {
  const cards = document.querySelectorAll('.glass-card, .skill-block, .project-card');
  cards.forEach(function (card) {
    card.classList.add('spot');
    card.addEventListener('pointermove', function (e) {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
})();

/* ---------- 11. BANDEAU DÉFILANT ----------
   On double la liste pour que l'animation CSS (translateX -50 %) boucle sans à-coup. */
(function () {
  const track = document.querySelector('.marquee-track');
  if (!track) return;
  Array.prototype.slice.call(track.children).forEach(function (li) {
    const clone = li.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true'); // les lecteurs d'écran ne lisent la liste qu'une fois
    track.appendChild(clone);
  });
})();
