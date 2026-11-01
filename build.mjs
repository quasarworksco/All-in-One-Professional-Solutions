// Ensambla las páginas de src/pages con los parciales de src/partials
// y escribe el HTML final en la raíz del repo (lo que sirve GitHub Pages).
//
//   node build.mjs
//
// Cada página empieza con un comentario de metadatos:
//   <!--meta {"title":"…","description":"…","nav":"servicios"} -->
// Marcadores disponibles en páginas y parciales:
//   {{site.clave}}      → valor de src/site.json
//   {{page.clave}}      → valor de los metadatos de la página
//   {{active:nav}}      → aria-current="page" si la página pertenece a ese menú
//   <!-- @include nombre -->  → contenido de src/partials/nombre.html

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const site = JSON.parse(readFileSync(join(root, "src/site.json"), "utf8"));
// Permite publicar en otro hosting sin tocar site.json: Vercel pasa su dominio en
// SITE_URL (ver vercel.json) y el sitio queda en la raíz, así que BASE_PATH es "/".
if (process.env.SITE_URL) site.url = process.env.SITE_URL.replace(/\/$/, "");
if (process.env.BASE_PATH) site.basePath = process.env.BASE_PATH;
const partial = (name) => readFileSync(join(root, "src/partials", `${name}.html`), "utf8");

function render(tpl, page) {
  let out = tpl;
  // Los includes pueden anidarse; se resuelven hasta que no quede ninguno.
  for (let i = 0; i < 5 && out.includes("<!-- @include"); i++) {
    out = out.replace(/<!-- @include ([\w-]+) -->/g, (_, n) => partial(n));
  }
  return out
    .replace(/\{\{active:([\w-]+)\}\}/g, (_, n) => (page.nav === n ? ' aria-current="page"' : ""))
    .replace(/\{\{site\.([\w]+)\}\}/g, (m, k) => (k in site ? site[k] : m))
    .replace(/\{\{page\.([\w]+)\}\}/g, (m, k) => (k in page ? page[k] : m))
    .replace(/\{\{year\}\}/g, String(new Date().getFullYear()));
}

const pages = readdirSync(join(root, "src/pages")).filter((f) => f.endsWith(".html"));
const urls = [];

for (const file of pages) {
  const raw = readFileSync(join(root, "src/pages", file), "utf8");
  const m = raw.match(/^<!--meta\s+([\s\S]*?)-->\s*/);
  if (!m) throw new Error(`${file}: falta el comentario <!--meta {...} -->`);
  const page = { path: file === "index.html" ? "" : file, bodyClass: "", ...JSON.parse(m[1]) };
  // La 404 se sirve desde cualquier ruta: necesita <base> para que los enlaces relativos funcionen.
  page.extraHead = page.noindex ? `<meta name="robots" content="noindex" />\n<base href="${site.basePath || "/"}" />` : "";
  page.canonical = `${site.url}/${page.path}`;
  // Imagen para compartir en redes (assets/img/og/<slug>.jpg); la de inicio por defecto.
  page.og = page.og || "inicio";
  page.ogAlt = page.ogAlt || `${site.name}: contabilidad, impuestos y trámites en Richmond, TX`;
  // Precarga la foto del hero de cada página para que aparezca sin parpadeo.
  page.preload = page.hero ? `<link rel="preload" as="image" href="assets/img/photos/${page.hero}" fetchpriority="high" />` : "";
  const body = raw.slice(m[0].length);
  const html = render(`<!-- @include head -->\n<!-- @include header -->\n<main id="contenido">\n${body}</main>\n<!-- @include footer -->\n`, page);
  writeFileSync(join(root, file), html);
  if (!page.noindex) urls.push(page.canonical);
  console.log("✓", file);
}

writeFileSync(
  join(root, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${u}</loc></url>`)
    .join("\n")}\n</urlset>\n`
);
console.log("✓ sitemap.xml");

writeFileSync(join(root, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);
console.log("✓ robots.txt");
