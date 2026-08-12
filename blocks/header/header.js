import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates desktop width (WKND switches at 1200px;
// below this the header uses the mobile hamburger navigation)
const isDesktop = window.matchMedia('(min-width: 1200px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  if (!sections) return;
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  if (navSections) {
    const navDrops = navSections.querySelectorAll('.nav-drop');
    if (isDesktop.matches) {
      navDrops.forEach((drop) => {
        if (!drop.hasAttribute('tabindex')) {
          drop.setAttribute('tabindex', 0);
          drop.addEventListener('focus', focusNavSection);
        }
      });
    } else {
      navDrops.forEach((drop) => {
        drop.removeAttribute('tabindex');
        drop.removeEventListener('focus', focusNavSection);
      });
    }
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
// Site-wide page index that feeds the search autocomplete. On the dev server
// content lives under a /content/ prefix; preview/live serve it at the root.
const SEARCH_INDEX_PATH = '/query-index.json';
const SEARCH_MAX_RESULTS = 6;

/**
 * Fetch and cache the page index once. Resolves to an array of {path, title}
 * entries, or [] on any failure (so the search box degrades to a plain field).
 * @returns {Promise<Array<{path:string,title:string}>>}
 */
let searchIndexPromise;
function loadSearchIndex() {
  if (!searchIndexPromise) {
    const onContentPrefix = window.location.pathname.startsWith('/content/');
    const url = onContentPrefix ? `/content${SEARCH_INDEX_PATH}` : SEARCH_INDEX_PATH;
    searchIndexPromise = fetch(url)
      .then((resp) => (resp.ok ? resp.json() : { data: [] }))
      .then((json) => (Array.isArray(json.data) ? json.data : []))
      .catch(() => []);
  }
  return searchIndexPromise;
}

/**
 * Turns a placeholder paragraph whose text is "Search" into an autocomplete
 * search form. As the user types, matching page titles from the site index are
 * shown in a dropdown; selecting one navigates to that page. Content stays
 * authorable in nav.plain.html; the control is built here. Degrades to a plain
 * search field (submitting to the search page) if the index is unavailable.
 * @param {Element} container The nav-tools section
 */
function decorateSearch(container) {
  if (!container) return;
  const placeholder = [...container.querySelectorAll('p')]
    .find((p) => p.textContent.trim().toLowerCase() === 'search' && !p.querySelector('a'));
  if (!placeholder) return;

  const form = document.createElement('form');
  form.className = 'nav-search';
  form.setAttribute('role', 'search');
  form.action = '/us/en/search.html';
  form.method = 'get';

  const label = document.createElement('label');
  label.className = 'nav-search-label';
  label.setAttribute('for', 'nav-search-input');
  label.textContent = 'Search';

  const input = document.createElement('input');
  input.type = 'search';
  input.id = 'nav-search-input';
  input.name = 'q';
  input.placeholder = 'Search';
  input.setAttribute('aria-label', 'Search');
  input.setAttribute('autocomplete', 'off');
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-expanded', 'false');
  input.setAttribute('aria-controls', 'nav-search-suggestions');

  const results = document.createElement('ul');
  results.className = 'nav-search-suggestions';
  results.id = 'nav-search-suggestions';
  results.setAttribute('role', 'listbox');
  results.hidden = true;

  form.append(label, input, results);
  placeholder.replaceWith(form);

  let activeIndex = -1;

  const closeSuggestions = () => {
    results.hidden = true;
    results.replaceChildren();
    input.setAttribute('aria-expanded', 'false');
    activeIndex = -1;
  };

  const rebasePath = (path) => (window.location.pathname.startsWith('/content/') ? `/content${path}` : path);

  const setActive = (idx) => {
    const items = [...results.children];
    items.forEach((li, i) => li.classList.toggle('is-active', i === idx));
    activeIndex = idx;
    if (items[idx]) items[idx].scrollIntoView({ block: 'nearest' });
  };

  const renderSuggestions = (matches) => {
    results.replaceChildren();
    if (!matches.length) {
      closeSuggestions();
      return;
    }
    matches.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'nav-search-suggestion';
      li.setAttribute('role', 'option');
      const a = document.createElement('a');
      a.href = rebasePath(item.path);
      a.textContent = item.title;
      li.append(a);
      results.append(li);
    });
    results.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    activeIndex = -1;
  };

  const update = async () => {
    const q = input.value.trim().toLowerCase();
    if (!q) {
      closeSuggestions();
      return;
    }
    const data = await loadSearchIndex();
    // Match against the title OR the path, so a section query (e.g. "magazine")
    // also surfaces that section's pages (its articles live under /magazine/…).
    const matches = data
      .filter((e) => e.path && e.title
        && (e.title.toLowerCase().includes(q) || e.path.toLowerCase().includes(q)))
      .slice(0, SEARCH_MAX_RESULTS);
    renderSuggestions(matches);
  };

  input.addEventListener('input', update);
  input.addEventListener('focus', () => { loadSearchIndex(); if (input.value.trim()) update(); });

  input.addEventListener('keydown', (e) => {
    const items = [...results.children];
    if (e.key === 'ArrowDown' && items.length) {
      e.preventDefault();
      setActive((activeIndex + 1) % items.length);
    } else if (e.key === 'ArrowUp' && items.length) {
      e.preventDefault();
      setActive((activeIndex - 1 + items.length) % items.length);
    } else if (e.key === 'Enter' && activeIndex >= 0 && items[activeIndex]) {
      e.preventDefault();
      items[activeIndex].querySelector('a').click();
    } else if (e.key === 'Escape') {
      closeSuggestions();
    }
  });

  // close when focus/click leaves the search form
  document.addEventListener('click', (e) => {
    if (!form.contains(e.target)) closeSuggestions();
  });
}

/**
 * Restructures each country row of the locale panel into a grid-friendly shape:
 * moves the leading flag <img> out of the country-name <p> so it can sit to the
 * left, spanning the country label and the language-code row (matches the WKND
 * locale-panel reference: flag | [country name / codes]).
 * @param {Element} navDrop The locale .nav-drop element
 */
function decorateLocalePanel(navDrop) {
  if (!navDrop) return;
  const panel = navDrop.querySelector(':scope > ul');
  // only the locale selector has per-row flags; skip plain nav dropdowns.
  // EDS may wrap the flag in a <picture>, so match both p>img and p>picture>img.
  if (!panel || !panel.querySelector(':scope > li > p > img, :scope > li > p > picture > img')) return;
  panel.classList.add('locale-panel');
  panel.querySelectorAll(':scope > li').forEach((row) => {
    row.classList.add('locale-row');
    const label = row.querySelector(':scope > p');
    // move the whole <picture> (or bare <img>) so the flag becomes the left cell
    const flag = label && (label.querySelector(':scope > picture') || label.querySelector(':scope > img'));
    if (flag) {
      flag.classList.add('locale-flag');
      row.insertBefore(flag, row.firstChild); // flag becomes the grid's left cell
    }
    if (label) label.classList.add('locale-country');
    const codes = row.querySelector(':scope > ul');
    if (codes) codes.classList.add('locale-codes');
  });
}

/**
 * Builds the Sign In panel (a dark dropdown form) and toggles it when the
 * "Sign In" link in the utility bar is clicked. The form controls are created
 * here (per the nav.plain.html contract — the fragment holds only the link).
 * @param {Element} navUtility The utility-bar section containing the Sign In link
 * @param {Element} host The element the panel is appended to (nav-wrapper)
 */
function decorateSignIn(navUtility, host) {
  if (!navUtility || !host) return;
  // Find the "Sign In" control. Prefer the intended #sign-in anchor, but fall
  // back to matching by label so a reverted nav fragment (where the href slips
  // back to "/" or similar) still yields the toggle — the decoration is driven
  // by code, not by the authored href, so it survives DA content reverts.
  const link = navUtility.querySelector('a[href="#sign-in"]')
    || [...navUtility.querySelectorAll('a')].find((a) => a.textContent.trim().toLowerCase() === 'sign in');
  if (!link) return;

  // Replace the fragment's anchor with a real <button> (the fragment can't hold
  // a <button>, so it's created here). A button is the correct control for
  // toggling a panel and avoids anchor default-navigation quirks.
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'sign-in-toggle';
  trigger.textContent = link.textContent.trim() || 'Sign In';
  trigger.setAttribute('aria-haspopup', 'dialog');
  link.replaceWith(trigger);

  const panel = document.createElement('div');
  panel.className = 'sign-in-panel';
  panel.setAttribute('aria-hidden', 'true');
  panel.innerHTML = `
    <h2 class="sign-in-title">Sign In</h2>
    <form class="sign-in-form" novalidate>
      <p class="sign-in-welcome">Welcome Back</p>
      <label class="sign-in-field">
        <span class="sr-only">Username</span>
        <input type="text" name="username" autocomplete="username" placeholder="USERNAME">
      </label>
      <label class="sign-in-field">
        <span class="sr-only">Password</span>
        <input type="password" name="password" autocomplete="current-password" placeholder="PASSWORD">
      </label>
      <a class="sign-in-forgot" href="#forgot-password">Forgot your password?</a>
      <button type="submit" class="sign-in-submit">Sign In</button>
    </form>`;
  host.append(panel);

  const setOpen = (open) => {
    panel.classList.toggle('is-open', open);
    panel.setAttribute('aria-hidden', open ? 'false' : 'true');
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      const firstInput = panel.querySelector('input');
      if (firstInput) firstInput.focus();
    }
  };

  trigger.setAttribute('aria-expanded', 'false');
  // stopPropagation keeps this click from reaching the document outside-click
  // listener below, so opening the panel can never immediately close it.
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    setOpen(!panel.classList.contains('is-open'));
  });

  // clicks inside the panel should not bubble out and close it
  panel.addEventListener('click', (e) => e.stopPropagation());

  // close on submit (demo form — no backend) or escape
  panel.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && panel.classList.contains('is-open')) setOpen(false);
  });
  // one permanent outside-click listener; closes only when open & click is elsewhere
  document.addEventListener('click', () => {
    if (panel.classList.contains('is-open')) setOpen(false);
  });
}

/**
 * Marks list items that contain a nested list as dropdowns and wires click
 * toggling (used by both the main nav and the locale selector in nav-tools).
 * @param {Element} container The section to scan
 */
function decorateDropdowns(container) {
  if (!container) return;
  container.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((item) => {
    if (!item.querySelector('ul')) return;
    item.classList.add('nav-drop');
    decorateLocalePanel(item);
    item.addEventListener('click', (e) => {
      // let clicks on real links inside the open panel navigate
      if (e.target.closest('a')) return;
      const expanded = item.getAttribute('aria-expanded') === 'true';
      container.querySelectorAll('.nav-drop').forEach((d) => d.setAttribute('aria-expanded', 'false'));
      item.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    });
  });
}

/**
 * Adds scroll-reactive state classes to the fixed header:
 * - `is-scrolled`: past 50px (solid background + shadow)
 * - `is-shrunk`:   scrolling down (compact header)
 * removing `is-shrunk` when scrolling up (expanded header)
 * @param {Element} navWrapper The fixed header wrapper element
 */
function decorateScrollBehavior(navWrapper) {
  let lastScrollY = window.scrollY;
  let ticking = false;

  const update = () => {
    const currentY = window.scrollY;

    // solid + shadow after 50px
    navWrapper.classList.toggle('is-scrolled', currentY > 50);

    // shrink when scrolling down (past a small threshold), expand when up.
    // never shrink while near the top so the full header is always shown there.
    if (currentY <= 50) {
      navWrapper.classList.remove('is-shrunk');
    } else if (currentY > lastScrollY + 4) {
      navWrapper.classList.add('is-shrunk');
    } else if (currentY < lastScrollY - 4) {
      navWrapper.classList.remove('is-shrunk');
    }

    lastScrollY = currentY;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  // set the initial state (e.g. when loaded already scrolled)
  update();
}

export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  // The local dev server serves content under a /content/ prefix (e.g.
  // /content/us/en), where the fragment lives at /content/nav. Preview/live
  // serve it at /nav. Only try the /content/ path when we're actually on the
  // content-prefixed dev environment — otherwise fetching it on preview/live
  // just produces a noisy 404 before the fallback succeeds.
  const onContentPrefix = window.location.pathname.startsWith('/content/');
  let fragment = onContentPrefix ? await loadFragment('/content/nav') : null;
  if (!fragment) fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  // Rebase relative nav images (e.g. images/wknd-logo.svg) against the nav
  // fragment location so they resolve on any page depth, not the current page.
  // Use the same base the fragment loaded from (content-prefixed on dev).
  const navBase = new URL(onContentPrefix ? '/content/nav' : navPath, window.location);
  nav.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (src && !src.startsWith('/') && !/^https?:|^data:/.test(src)) {
      img.src = new URL(src, navBase).href;
    }
  });

  // 4 sections: utility bar (sign-in + locale), brand (logo), sections (menu), tools (search)
  const classes = ['utility', 'brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand && navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  // Convert the logo link into a real <button> that navigates home. The
  // destination is read from the original link (route not hardcoded); the logo
  // image is preserved inside the button.
  const brandAnchor = navBrand && navBrand.querySelector('a');
  if (brandAnchor) {
    const href = brandAnchor.getAttribute('href') || '/us/en.html';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-brand-button';
    btn.setAttribute('aria-label', brandAnchor.getAttribute('title') || 'WKND home');
    while (brandAnchor.firstChild) btn.append(brandAnchor.firstChild);
    btn.addEventListener('click', () => {
      // On the local preview, content is served under a /content/ prefix
      // (e.g. /content/us/en); production uses the plain path (/us/en.html).
      let dest = href;
      if (window.location.pathname.startsWith('/content/')) {
        dest = `/content${href.replace(/\.html$/, '')}`;
      }
      window.location.assign(new URL(dest, window.location).href);
    });
    brandAnchor.replaceWith(btn);
  }

  // utility bar: wire the locale selector dropdown
  const navUtility = nav.querySelector('.nav-utility');
  decorateDropdowns(navUtility);

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    // Convert each simple main-nav link into a real <button> (the fragment can
    // only hold <a>, so the conversion happens here). The button reads its
    // destination from the original link — routes are never hardcoded — and
    // opens it on click, honouring target="_blank" for a new window.
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li > a').forEach((link) => {
      if (link.closest('li').querySelector('ul')) return; // leave dropdown triggers alone
      const href = link.getAttribute('href');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'nav-link-button';
      btn.textContent = link.textContent.trim();
      if (href) btn.dataset.href = href;
      // Highlight the nav item for the section the current page belongs to
      // (e.g. ADVENTURES on /us/en/adventures or any /us/en/adventures/* page).
      if (href) {
        const base = href.replace(/\.html$/, '').replace(/\/$/, '');
        const here = window.location.pathname.replace(/^\/content/, '').replace(/\.html$/, '').replace(/\/$/, '');
        if (base && (here === base || here.startsWith(`${base}/`))) {
          btn.classList.add('nav-link-active');
          btn.setAttribute('aria-current', 'page');
        }
      }
      // Main nav items are primary destinations — always navigate in the same
      // tab (ignore any authored target="_blank") so every item behaves
      // consistently, e.g. Magazine -> the magazine page.
      btn.addEventListener('click', () => {
        if (!href) return;
        // On the local preview, content is served under a /content/ prefix
        // (e.g. /content/us/en/magazine); production uses the plain path
        // (/us/en/magazine.html). Rebase same-origin routes so they resolve
        // in both environments (mirrors the brand/logo button behaviour).
        let dest = href;
        if (href.startsWith('/') && window.location.pathname.startsWith('/content/')) {
          dest = `/content${href.replace(/\.html$/, '')}`;
        }
        window.location.assign(new URL(dest, window.location).href);
      });
      link.replaceWith(btn);
    });

    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
  }

  // tools: build the search input and wire the locale selector dropdown
  const navTools = nav.querySelector('.nav-tools');
  decorateSearch(navTools);
  decorateDropdowns(navTools);

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);

  // Sign In panel (built here per the fragment contract; opens on Sign In click)
  decorateSignIn(navUtility, navWrapper);

  // Sticky scroll behavior: solid + shadow past 50px, shrink on scroll-down,
  // expand on scroll-up. Runs inside requestAnimationFrame to stay smooth.
  decorateScrollBehavior(navWrapper);
}
