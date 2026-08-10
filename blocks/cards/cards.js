import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));

  // Make the card image a clickable link to the same destination as the title.
  // The title link already provides an accessible route to the article, so the
  // image link is hidden from assistive tech (aria-hidden + tabindex=-1) to
  // avoid announcing the same destination twice.
  ul.querySelectorAll(':scope > li').forEach((li) => {
    const imageCol = li.querySelector('.cards-card-image');
    const picture = imageCol && imageCol.querySelector('picture');
    const titleLink = li.querySelector('.cards-card-body a[href]');
    if (!imageCol || !picture || !titleLink || imageCol.querySelector('a')) return;
    const link = document.createElement('a');
    link.href = titleLink.getAttribute('href');
    link.setAttribute('aria-hidden', 'true');
    link.setAttribute('tabindex', '-1');
    // preserve any link behavior authored on the title (e.g. new-tab CTAs)
    if (titleLink.target) link.target = titleLink.target;
    if (titleLink.rel) link.rel = titleLink.rel;
    link.append(picture);
    imageCol.append(link);
  });

  block.replaceChildren(ul);
}
