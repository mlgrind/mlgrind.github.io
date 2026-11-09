import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import * as helmetAsync from "react-helmet-async";
const { HelmetProvider } = (Reflect.get(helmetAsync, "default") ??
  helmetAsync) as typeof helmetAsync;
import { createElement } from "react";
import sharp from "sharp";
import {
  StaticContent,
  staticRoutes,
  routeContent,
} from "../src/components/SEO/StaticContent";

const origin = "https://mlgrind.dev";
const escape = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
const template = readFileSync("dist/index.html", "utf8");
const card = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg"><rect width="1200" height="630" fill="#10111b"/><circle cx="1100" cy="70" r="260" fill="#282042"/><text x="80" y="105" fill="#a79bff" font-family="sans-serif" font-weight="bold" font-size="36">ML GRIND</text><text x="80" y="250" fill="#ffffff" font-family="sans-serif" font-size="60" font-weight="bold">Learn machine learning</text><text x="80" y="330" fill="#a79bff" font-family="sans-serif" font-size="60">by building.</text><text x="80" y="450" fill="#c4c7d4" font-family="sans-serif" font-size="30">Real Python. Instant feedback. No setup.</text><text x="80" y="550" fill="#c4c7d4" font-family="sans-serif" font-size="26">mlgrind.dev</text></svg>`;
await sharp(Buffer.from(card)).png().toFile("dist/og-image.png");
await sharp(Buffer.from(card))
  .resize(480, 252)
  .png()
  .toFile("dist/preview.png");
for (const path of staticRoutes) {
  const content = routeContent(path);
  const title = path === "/" ? content.title : `${content.title} | ML Grind`;
  const canonical = origin + path;
  const metadata = `<title>${escape(title)}</title>
<meta name="description" content="${escape(content.description)}" data-rh="true" />
<link rel="canonical" href="${canonical}" data-rh="true" />
<meta property="og:title" content="${escape(title)}" data-rh="true" />
<meta property="og:description" content="${escape(content.description)}" data-rh="true" />
<meta property="og:url" content="${canonical}" data-rh="true" />
<meta property="og:image" content="${origin}/og-image.png" />
<meta property="og:image:width" content="1200" /><meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escape(title)}" data-rh="true" />
<meta name="twitter:description" content="${escape(content.description)}" data-rh="true" />
<meta name="twitter:image" content="${origin}/og-image.png" />`;
  let html = template
    .replace(/<title>[\s\S]*?<\/title>/g, "")
    .replace(
      /<meta\s+(?:name|property)="(?:title|description|og:(?:title|description|url|image)|twitter:(?:card|title|description|url|image))"[^>]*>/g,
      "",
    )
    .replace(/<link rel="canonical"[^>]*>/g, "")
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, "")
    .replace("</head>", `${metadata}\n</head>`)
    .replace(
      '<div id="root"></div>',
      `<div id="root">${renderToStaticMarkup(createElement(HelmetProvider, null, createElement(StaticContent, { path })))}</div>`,
    );
  const schema = {
    "@context": "https://schema.org",
    "@type": path === "/" ? "WebSite" : "LearningResource",
    name: content.title,
    description: content.description,
    url: canonical,
    isAccessibleForFree: true,
    inLanguage: "en",
  };
  html = html.replace(
    "</head>",
    `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, "\\u003c")}</script></head>`,
  );
  // "/section/cnn" -> dist/section/cnn.html. GitHub Pages serves an extensionless
  // URL from <path>.html with a 200, but from <path>/index.html only after a 301 to
  // "<path>/", which made every sitemap/canonical URL a redirect.
  const file =
    path === "/" ? resolve("dist", "index.html") : resolve("dist", `${path.slice(1)}.html`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}
writeFileSync(
  "dist/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...staticRoutes, "/ml-cheatsheet.html"].map((path) => `<url><loc>${origin}${path}</loc></url>`).join("\n")}</urlset>`,
);
writeFileSync(
  "dist/robots.txt",
  `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`,
);
writeFileSync("dist/.nojekyll", "");
console.log(
  `Generated ${staticRoutes.length} static routes, sitemap, robots.txt, and PNG previews.`,
);
