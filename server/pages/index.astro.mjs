import { c as createComponent, m as maybeRenderHead, a as renderScript, b as renderTemplate, r as renderComponent } from '../chunks/astro/server_BncSQn_2.mjs';
import 'piccolore';
import { $ as $$Image } from '../chunks/_astro_assets_CG3dKhMS.mjs';
import 'clsx';
/* empty css                                 */
import { $ as $$Layout } from '../chunks/Layout_BZp-PQ8r.mjs';
import { a as app_logo } from '../chunks/app_logo_WeZS9VJZ.mjs';
export { renderers } from '../renderers.mjs';

const $$LoginForm = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div class="login-form" data-astro-cid-d557plfe> <button id="google-login-btn" class="google-login-btn" data-astro-cid-d557plfe> <svg class="google-icon" viewBox="0 0 24 24" width="20" height="20" data-astro-cid-d557plfe> <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" data-astro-cid-d557plfe></path> <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" data-astro-cid-d557plfe></path> <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" data-astro-cid-d557plfe></path> <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" data-astro-cid-d557plfe></path> </svg>
Continue with Google
</button> <button id="discord-login-btn" class="discord-login-btn" data-astro-cid-d557plfe> <svg class="discord-icon" width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" data-astro-cid-d557plfe> <path fill="#ffffff" d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z" data-astro-cid-d557plfe></path> </svg>
Continue with Discord
</button> <div id="error-message" class="error-message" style="display: none;" data-astro-cid-d557plfe></div> <div id="loading" class="loading" style="display: none;" data-astro-cid-d557plfe>Signing in...</div> </div> ${renderScript($$result, "/home/runner/work/fanpickems/fanpickems/src/components/LoginForm/LoginForm.astro?astro&type=script&index=0&lang.ts")} `;
}, "/home/runner/work/fanpickems/fanpickems/src/components/LoginForm/LoginForm.astro", void 0);

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "LCK Pickems - Login", "data-astro-cid-j7pv25f6": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="login-container" data-astro-cid-j7pv25f6> ${renderComponent($$result2, "Image", $$Image, { "src": app_logo, "alt": "LCK Fan Pickems", "class": "login-logo", "data-astro-cid-j7pv25f6": true })} <p data-astro-cid-j7pv25f6>Login to make your tournament predictions</p> ${renderComponent($$result2, "LoginForm", $$LoginForm, { "data-astro-cid-j7pv25f6": true })} </div> ` })} ${renderScript($$result, "/home/runner/work/fanpickems/fanpickems/src/pages/index.astro?astro&type=script&index=0&lang.ts")} `;
}, "/home/runner/work/fanpickems/fanpickems/src/pages/index.astro", void 0);

const $$file = "/home/runner/work/fanpickems/fanpickems/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
