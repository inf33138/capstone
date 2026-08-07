import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  // The local dev server serves content under a /content/ prefix, where the
  // fragment lives at /content/footer; preview/live serve it at /footer. Only
  // try the /content/ path on the content-prefixed dev environment so we don't
  // fire a noisy 404 on preview/live before the fallback succeeds.
  const onContentPrefix = window.location.pathname.startsWith('/content/');
  let fragment = onContentPrefix ? await loadFragment('/content/footer') : null;
  if (!fragment) fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // Rebase relative footer images (e.g. images/wknd-logo-light.svg) against the
  // footer fragment location so they resolve regardless of page depth. Use the
  // same base the fragment loaded from (content-prefixed on dev).
  const footerBase = new URL(onContentPrefix ? '/content/footer' : footerPath, window.location);
  footer.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (src && !src.startsWith('/') && !/^https?:|^data:/.test(src)) {
      img.src = new URL(src, footerBase).href;
    }
  });

  // Label the three sections for styling: brand + nav, social, legal.
  const classes = ['footer-brand', 'footer-social', 'footer-legal'];
  [...footer.children].forEach((section, i) => {
    if (classes[i]) section.classList.add(classes[i]);
  });

  block.append(footer);
}
