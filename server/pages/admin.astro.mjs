import { c as createComponent, r as renderComponent, a as renderScript, b as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_BncSQn_2.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_BZp-PQ8r.mjs';
import { $ as $$AuthGuard } from '../chunks/AuthGuard_Z7WDc2Th.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Admin = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "LCK Pickems - Admin Setup", "data-astro-cid-2zp6q64z": true }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "AuthGuard", $$AuthGuard, { "data-astro-cid-2zp6q64z": true }, { "default": ($$result3) => renderTemplate` ${maybeRenderHead()}<div class="admin-container" data-astro-cid-2zp6q64z> <div id="admin-check" class="admin-check" data-astro-cid-2zp6q64z> <p data-astro-cid-2zp6q64z>Checking admin access...</p> </div> <div id="admin-content" class="admin-content" style="display: none;" data-astro-cid-2zp6q64z> <h1 data-astro-cid-2zp6q64z>Admin Setup</h1> <p data-astro-cid-2zp6q64z>Initialize sample data for development</p> <div class="admin-actions" data-astro-cid-2zp6q64z> <button id="init-teams" class="admin-btn" data-astro-cid-2zp6q64z>Initialize Teams</button> <button id="init-tournament" class="admin-btn" data-astro-cid-2zp6q64z>Initialize Tournament</button> <button id="init-all" class="admin-btn primary" data-astro-cid-2zp6q64z>Initialize All Data</button> </div> <div id="status" class="status-area" data-astro-cid-2zp6q64z></div> </div> <div id="access-denied" class="access-denied" style="display: none;" data-astro-cid-2zp6q64z> <h1 data-astro-cid-2zp6q64z>Access Denied</h1> <p data-astro-cid-2zp6q64z>You don't have permission to access this page.</p> <a href="/picks" data-astro-cid-2zp6q64z>Return to Home</a> </div> </div> ` })} ` })} ${renderScript($$result, "/home/runner/work/fanpickems/fanpickems/src/pages/admin.astro?astro&type=script&index=0&lang.ts")} `;
}, "/home/runner/work/fanpickems/fanpickems/src/pages/admin.astro", void 0);

const $$file = "/home/runner/work/fanpickems/fanpickems/src/pages/admin.astro";
const $$url = "/admin";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Admin,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
