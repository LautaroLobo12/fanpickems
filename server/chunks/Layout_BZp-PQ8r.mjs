import { c as createComponent, j as createAstro, o as renderHead, e as renderSlot, b as renderTemplate } from './astro/server_BncSQn_2.mjs';
import 'piccolore';
import 'clsx';
/* empty css                         */

const $$Astro = createAstro();
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const { title } = Astro2.props;
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><meta name="description" content="LCK Pickems - Tournament bracket predictions"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="icon" type="image/x-icon" href="/favicon.ico"><title>${title}</title>${renderHead()}</head> <body> <main> ${renderSlot($$result, $$slots["default"])} </main> </body></html>`;
}, "/home/runner/work/fanpickems/fanpickems/src/layouts/Layout.astro", void 0);

export { $$Layout as $ };
