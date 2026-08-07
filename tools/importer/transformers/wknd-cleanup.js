/* eslint-disable */
/* global WebImporter */

/**
 * WKND site-wide cleanup transformer.
 *
 * Removes non-authorable page shell / global chrome so the import contains only
 * page-level authorable content. WKND (AEM Core Components) renders its header
 * and footer as experience fragments and injects a mobile-nav drawer plus an
 * Adobe ID-syncing iframe into the page shell — none of which an author would
 * create when authoring a page. The global header/footer are handled separately
 * as site nav/footer.
 *
 * Every selector below is verified against migration-work/cleaned.html:
 *  - header.experiencefragment.cmp-experiencefragment--header
 *      global header XF: sign-in, language nav, main nav, search   [cleaned.html:5]
 *  - footer.experiencefragment.cmp-experiencefragment--footer
 *      global footer XF: nav, social buttons, copyright            [cleaned.html:471]
 *  - #toggleNav      mobile-nav hamburger toggle                   [cleaned.html:568]
 *  - #mobileNav      mobile navigation drawer                      [cleaned.html:574]
 *  - iframe          Adobe ID-syncing iframe (demdex)              [cleaned.html:566]
 *  - meta            stray <meta> tags left inside cmp-image wraps  [cleaned.html:183,204,227,271,334,378]
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    // Non-authorable global chrome + page-shell artifacts. Removed after block
    // parsing; none of these match the WKND block selectors, so parsing is
    // unaffected. Selectors are from the captured DOM (see header comment).
    WebImporter.DOMUtils.remove(element, [
      'header.experiencefragment.cmp-experiencefragment--header',
      'footer.experiencefragment.cmp-experiencefragment--footer',
      '#toggleNav',
      '#mobileNav',
      'iframe',
      'meta',
    ]);
  }
}
