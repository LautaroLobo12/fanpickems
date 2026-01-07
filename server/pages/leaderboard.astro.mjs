import { c as createComponent, m as maybeRenderHead, a as renderScript, b as renderTemplate, r as renderComponent } from '../chunks/astro/server_BncSQn_2.mjs';
import 'piccolore';
import { $ as $$AuthGuard } from '../chunks/AuthGuard_Z7WDc2Th.mjs';
import 'clsx';
/* empty css                                       */
import { $ as $$Navigation } from '../chunks/Navigation_CMGqBEZw.mjs';
import { $ as $$Layout } from '../chunks/Layout_BZp-PQ8r.mjs';
export { renderers } from '../renderers.mjs';

const $$Leaderboard$1 = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div class="leaderboard-container"> <div id="loading" class="loading"> <div class="loading-spinner"></div> <p>Loading leaderboard...</p> </div> <div id="leaderboard-content" class="leaderboard-content" style="display: none;"> <div class="tournament-info"> <h2 id="tournament-name">Tournament Leaderboard</h2> </div> <div class="leaderboard-list" id="leaderboard-list"> <!-- Leaderboard entries will be populated here --> </div> <div class="user-position" id="user-position" style="display: none;"> <h3>Your Position</h3> <div class="user-rank-info" id="user-rank-info"> <!-- User rank info will be populated here --> </div> </div> </div> <div id="error-message" class="error-message" style="display: none;"> <h3>Unable to Load Leaderboard</h3> <p>There was a problem loading the leaderboard data.</p> <button onclick="location.reload()">Try Again</button> </div> </div> ${renderScript($$result, "/home/runner/work/fanpickems/fanpickems/src/components/Leaderboard/Leaderboard.astro?astro&type=script&index=0&lang.ts")} `;
}, "/home/runner/work/fanpickems/fanpickems/src/components/Leaderboard/Leaderboard.astro", void 0);

const $$Leaderboard = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "LCK Pickems - Leaderboard", "data-astro-cid-qw5dklun": true }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "AuthGuard", $$AuthGuard, { "data-astro-cid-qw5dklun": true }, { "default": ($$result3) => renderTemplate` ${renderComponent($$result3, "Navigation", $$Navigation, { "data-astro-cid-qw5dklun": true })} ${maybeRenderHead()}<div class="leaderboard-page" data-astro-cid-qw5dklun> <div class="leaderboard-container" data-astro-cid-qw5dklun> <div class="page-header" data-astro-cid-qw5dklun> <h1 data-astro-cid-qw5dklun>Leaderboard</h1> <p class="page-description" data-astro-cid-qw5dklun>Top tournament predictors</p> </div> ${renderComponent($$result3, "LeaderboardComponent", $$Leaderboard$1, { "data-astro-cid-qw5dklun": true })} </div> </div> ` })} ` })} `;
}, "/home/runner/work/fanpickems/fanpickems/src/pages/leaderboard.astro", void 0);

const $$file = "/home/runner/work/fanpickems/fanpickems/src/pages/leaderboard.astro";
const $$url = "/leaderboard";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Leaderboard,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
