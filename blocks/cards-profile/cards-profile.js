import { createOptimizedPicture } from '../../scripts/aem.js';

// Brand glyphs for the social row. Keyed by the authored link label (lower-cased).
// Rendered as white icons inside the dark square; the text label is preserved
// visually-hidden for accessibility.
const SOCIAL_ICONS = {
  facebook: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M13.5 21v-8h2.69l.4-3.12h-3.09V7.89c0-.9.25-1.52 1.54-1.52h1.65V3.57c-.29-.04-1.27-.12-2.41-.12-2.39 0-4.02 1.46-4.02 4.13v2.3H7.56V13h2.7v8h3.24z"/></svg>',
  twitter: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M23 4.9c-.8.36-1.66.6-2.56.7a4.48 4.48 0 0 0 1.96-2.47c-.86.51-1.82.88-2.84 1.08a4.47 4.47 0 0 0-7.62 4.08A12.68 12.68 0 0 1 2.7 3.6a4.47 4.47 0 0 0 1.38 5.97c-.72-.02-1.4-.22-2-.55v.06a4.47 4.47 0 0 0 3.59 4.38c-.66.18-1.35.2-2.02.08a4.48 4.48 0 0 0 4.18 3.1A8.97 8.97 0 0 1 2 18.56a12.65 12.65 0 0 0 6.85 2.01c8.22 0 12.72-6.81 12.72-12.72l-.01-.58A9.05 9.05 0 0 0 23 4.9z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 4.04c2.6 0 2.9.01 3.93.06.95.04 1.46.2 1.8.34.46.17.78.38 1.12.72.34.34.55.66.72 1.12.13.34.3.85.34 1.8.05 1.02.06 1.33.06 3.92s-.01 2.9-.06 3.93c-.04.95-.2 1.46-.34 1.8-.17.46-.38.78-.72 1.12-.34.34-.66.55-1.12.72-.34.13-.85.3-1.8.34-1.02.05-1.33.06-3.93.06s-2.9-.01-3.92-.06c-.95-.04-1.46-.2-1.8-.34a3.02 3.02 0 0 1-1.12-.72 3.02 3.02 0 0 1-.72-1.12c-.13-.34-.3-.85-.34-1.8-.05-1.02-.06-1.33-.06-3.93s.01-2.9.06-3.92c.04-.95.2-1.46.34-1.8.17-.46.38-.78.72-1.12.34-.34.66-.55 1.12-.72.34-.13.85-.3 1.8-.34 1.02-.05 1.33-.06 3.92-.06M12 2.3c-2.64 0-2.97.01-4 .06-1.04.05-1.75.21-2.36.45-.64.25-1.18.58-1.72 1.12-.54.54-.87 1.08-1.12 1.72-.24.61-.4 1.32-.45 2.36-.05 1.03-.06 1.36-.06 4s.01 2.97.06 4c.05 1.04.21 1.75.45 2.36.25.64.58 1.18 1.12 1.72.54.54 1.08.87 1.72 1.12.61.24 1.32.4 2.36.45 1.03.05 1.36.06 4 .06s2.97-.01 4-.06c1.04-.05 1.75-.21 2.36-.45a4.75 4.75 0 0 0 1.72-1.12c.54-.54.87-1.08 1.12-1.72.24-.61.4-1.32.45-2.36.05-1.03.06-1.36.06-4s-.01-2.97-.06-4c-.05-1.04-.21-1.75-.45-2.36a4.75 4.75 0 0 0-1.12-1.72 4.75 4.75 0 0 0-1.72-1.12c-.61-.24-1.32-.4-2.36-.45-1.03-.05-1.36-.06-4-.06zm0 4.68a5.02 5.02 0 1 0 0 10.04 5.02 5.02 0 0 0 0-10.04zm0 8.28a3.26 3.26 0 1 1 0-6.52 3.26 3.26 0 0 1 0 6.52zm5.21-8.48a1.17 1.17 0 1 0 0 2.34 1.17 1.17 0 0 0 0-2.34z"/></svg>',
};

/**
 * loads and decorates the cards-profile block
 * Content model (per card row): cell 1 = profile image, cell 2 = name (heading)
 * + role/subtitle + social links.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-profile-card-image';
      else div.className = 'cards-profile-card-body';
    });

    const body = li.querySelector('.cards-profile-card-body');
    if (body) {
      /* role/subtitle: first text paragraph that is not a social link */
      const roleP = [...body.querySelectorAll('p')]
        .find((p) => p.textContent.trim() && !p.querySelector('a'));
      if (roleP) roleP.className = 'cards-profile-card-role';

      /* collect social links into a single row */
      const links = [...body.querySelectorAll('a')];
      if (links.length) {
        const social = document.createElement('ul');
        social.className = 'cards-profile-social';
        links.forEach((a) => {
          a.className = 'cards-profile-social-link';
          // Swap the text label for the matching brand glyph; keep the label
          // as an accessible name (visually hidden) and a title tooltip.
          const label = a.textContent.trim();
          const icon = SOCIAL_ICONS[label.toLowerCase()];
          if (icon) {
            if (!a.getAttribute('aria-label')) a.setAttribute('aria-label', label);
            if (!a.title) a.title = label;
            a.innerHTML = `${icon}<span class="cards-profile-social-label">${label}</span>`;
          }
          const item = document.createElement('li');
          item.append(a);
          social.append(item);
        });
        body.append(social);
        /* remove now-empty wrappers left behind by the moved links */
        [...body.querySelectorAll('p')].forEach((p) => {
          if (!p.textContent.trim() && !p.querySelector('img, picture, a')) p.remove();
        });
      }
    }

    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.textContent = '';
  block.append(ul);
}
