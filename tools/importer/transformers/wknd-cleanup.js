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
 *
 * Tabbed category filter (adventures page): the "Current Adventures" grid is
 * wrapped in a `div.tabs.panelcontainer` whose active "All" tab panel holds the
 * complete card grid, while the other tab panels (Climbing/Cycling/Skiing/…)
 * duplicate a subset of those same cards. Before block parsing we strip the tab
 * UI so only the active panel's grid remains: remove the `.cmp-tabs__tablist`
 * (the "All/Climbing/…" labels) and every tab panel that is NOT
 * `.cmp-tabs__tabpanel--active`. The cards parser then converts the surviving
 * active-panel grid, giving one clean, de-duplicated adventures listing.
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Strip tabbed-filter chrome so only the active "All" panel's grid survives
    // into block parsing (avoids duplicate category cards + stray tab labels).
    // Guarded to the tabs component, so pages without tabs are unaffected.
    element.querySelectorAll('.tabs.panelcontainer .cmp-tabs__tablist').forEach((el) => el.remove());
    element.querySelectorAll('.tabs.panelcontainer .cmp-tabs__tabpanel:not(.cmp-tabs__tabpanel--active)').forEach((el) => el.remove());
  }

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
