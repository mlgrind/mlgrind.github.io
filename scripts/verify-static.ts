import { readFileSync, existsSync } from "node:fs";
import assert from "node:assert/strict";
import {
  staticRoutes,
  routeContent,
} from "../src/components/SEO/StaticContent";
const sitemap = readFileSync("dist/sitemap.xml", "utf8");
for (const route of staticRoutes) {
  const file = route === "/" ? "dist/index.html" : `dist${route}.html`;
  assert(existsSync(file), `Missing route: ${route}`);
  const html = readFileSync(file, "utf8");
  assert(
    html.includes(`href="https://mlgrind.dev${route}"`),
    `Missing canonical: ${route}`,
  );
  assert(
    sitemap.includes(`<loc>https://mlgrind.dev${route}</loc>`),
    `Missing sitemap entry: ${route}`,
  );
  assert(html.includes("<h1"), `Missing static text: ${route}`);
  assert(html.includes("og-image.png"), `Missing social card: ${route}`);
  assert(
    !html.includes('name="robots" content="noindex'),
    `Known route is noindex: ${route}`,
  );
  assert(routeContent(route).title !== "Page Not Found");
}
assert(existsSync("dist/og-image.png"));
assert(readFileSync("dist/404.html", "utf8").includes("noindex"));
console.log(
  `Verified ${staticRoutes.length} route files, canonicals, sitemap entries, static headings, and social cards.`,
);
