/** robots.txt / sitemap.xml matnlari (vite.config.ts ham, testlar ham ishlatadi — alias'siz, toza). */
export function buildRobotsTxt(siteUrl: string | null): string {
  const lines = ["User-agent: *", "Allow: /", ""];
  if (siteUrl) lines.push(`Sitemap: ${siteUrl}/sitemap.xml`, "");
  return lines.join("\n");
}

export function buildSitemapXml(siteUrl: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${siteUrl}/</loc></url>\n</urlset>\n`;
}
