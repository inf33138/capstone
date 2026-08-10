// Articles linked from teasers that are NOT part of this migration. Their CTAs
// would otherwise point at a local path that 404s, so we send them to the
// published wknd.site source page and open it in a new browser tab. Remove an
// entry here once the corresponding article is migrated into this site.
const EXTERNAL_ARTICLE_LINKS = {
  '/us/en/magazine/western-australia': 'https://wknd.site/us/en/magazine/western-australia.html',
};

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });

  // Retarget CTAs to un-migrated articles at their published source page and
  // open them in a new tab (keyed by the raw href, extension-insensitive).
  block.querySelectorAll('a[href]').forEach((a) => {
    const path = a.getAttribute('href').replace(/\.html$/, '');
    const external = EXTERNAL_ARTICLE_LINKS[path];
    if (external) {
      a.href = external;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }

    // Present the CTA as a proper button component (matches the boilerplate's
    // button decoration contract) so it reads as a button, not a text link.
    const p = a.closest('p');
    if (p && p.childElementCount === 1 && p.textContent.trim() === a.textContent.trim()) {
      p.classList.add('button-container');
      a.classList.add('button');
    }

    // Guarantee the new-tab open even inside preview/editor shells that
    // intercept default anchor navigation. A plain-left-click (no modifier keys)
    // opens exactly one new tab; ctrl/cmd/middle-click keep native behavior.
    if (a.target === '_blank') {
      a.addEventListener('click', (e) => {
        const modified = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
        if (e.defaultPrevented || e.button !== 0 || modified) return;
        e.preventDefault();
        window.open(a.href, '_blank', 'noopener,noreferrer');
      });
    }
  });
}
