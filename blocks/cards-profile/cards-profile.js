import { createOptimizedPicture } from '../../scripts/aem.js';

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
