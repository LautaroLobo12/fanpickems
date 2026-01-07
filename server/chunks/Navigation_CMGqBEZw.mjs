import { c as createComponent, m as maybeRenderHead, r as renderComponent, a as renderScript, b as renderTemplate } from './astro/server_BncSQn_2.mjs';
import 'piccolore';
import { $ as $$Image } from './_astro_assets_CG3dKhMS.mjs';
import { a as app_logo } from './app_logo_WeZS9VJZ.mjs';
/* empty css                               */

const $$Navigation = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<nav class="navbar"> <div class="nav-container"> <div class="nav-brand"> <a href="/picks"> ${renderComponent($$result, "Image", $$Image, { "src": app_logo, "alt": "LCK Fan Pickems", "class": "nav-logo" })} </a> </div> <div class="nav-links"> <a href="/picks" class="nav-link">Picks</a> <a href="/leaderboard" class="nav-link">Leaderboard</a> <button id="logout-btn" class="logout-btn">Logout</button> </div> <div id="user-info" class="user-info"> <img id="user-avatar" class="user-avatar" alt="User Avatar" style="display: none;"> <span id="user-name" class="user-name"></span> </div> </div> </nav> ${renderScript($$result, "/home/runner/work/fanpickems/fanpickems/src/components/Navigation/Navigation.astro?astro&type=script&index=0&lang.ts")} `;
}, "/home/runner/work/fanpickems/fanpickems/src/components/Navigation/Navigation.astro", void 0);

export { $$Navigation as $ };
