import { c as createComponent, m as maybeRenderHead, e as renderSlot, a as renderScript, b as renderTemplate } from './astro/server_BncSQn_2.mjs';
import 'piccolore';
import 'clsx';
/* empty css                         */

const $$AuthGuard = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div id="auth-guard" data-astro-cid-r5r6ix2d> <div id="loading-state" class="loading-container" data-astro-cid-r5r6ix2d> <div class="spinner" data-astro-cid-r5r6ix2d></div> <p data-astro-cid-r5r6ix2d>Loading...</p> </div> <div id="authenticated-content" style="display: none;" data-astro-cid-r5r6ix2d> ${renderSlot($$result, $$slots["default"])} </div> </div> ${renderScript($$result, "/home/runner/work/fanpickems/fanpickems/src/components/AuthGuard/AuthGuard.astro?astro&type=script&index=0&lang.ts")} `;
}, "/home/runner/work/fanpickems/fanpickems/src/components/AuthGuard/AuthGuard.astro", void 0);

export { $$AuthGuard as $ };
