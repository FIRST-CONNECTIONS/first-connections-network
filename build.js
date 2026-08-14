#!/usr/bin/env node
/*
 * build.js — generates per-page HTML files from index.html.
 *
 * The site is a single-file SPA with client-side routing. For SEO we need
 * each URL (/events, /resources, /fc-offers, /funding-support) to serve
 * its OWN HTML with its OWN <title>, description, canonical, and OG tags —
 * otherwise all five "pages" share the same social preview and Google
 * only ranks the home version.
 *
 * This script reads index.html as the source of truth, applies per-page
 * head overrides from the PAGES config below, and writes the results
 * alongside index.html. Netlify's build step runs `node build.js` before
 * publishing, so the generated files ship with every deploy — no manual
 * duplication, single source of truth.
 *
 * The existing showPage() routing IIFE in index.html already opens the
 * correct page-block based on window.location.pathname, so no extra
 * client-side init is needed — swapping the head is enough.
 */

const fs = require('fs');
const path = require('path');

const ROOT       = __dirname;
const SOURCE     = path.join(ROOT, 'index.html');
const OG_IMAGE   = 'https://raw.githubusercontent.com/FIRST-CONNECTIONS/first-connections-network/main/NE%20website%20Images/img-gala-event.jpg';
const SITE_URL   = 'https://first-connections.co.uk';

const PAGES = [
  {
    file:        'events.html',
    canonicalPath: '/events',
    title:       'Free Business Networking Events in the North East — First Connections',
    description: 'Monthly free networking events in Darlington, Newcastle, Durham & Tees Valley. Meet the region\'s business community — no membership fees, all welcome.',
    ogTitle:     'Free Business Networking Events Across the North East',
    ogDescription: 'Monthly free networking in Darlington, Newcastle, Durham & Tees Valley. Meet the region\'s business community — no membership fees.',
    twTitle:     'Free Business Networking Events in the North East',
    twDescription: 'Monthly free networking events in Darlington, Newcastle, Durham & Tees Valley — no membership fees, all welcome.'
  },
  {
    file:        'resources.html',
    canonicalPath: '/resources',
    title:       'Business Resources & Partner Offers — North East UK — First Connections',
    description: 'Trusted local services, exclusive discounts and business tools for North East companies. Curated by the First Connections community across Newcastle, Darlington & Durham.',
    ogTitle:     'Business Resources & Offers for North East Businesses',
    ogDescription: 'Trusted local services & exclusive discounts curated by the First Connections community across Newcastle, Darlington & Durham.',
    twTitle:     'Business Resources & Offers — North East UK',
    twDescription: 'Trusted local services & exclusive discounts curated by the First Connections community across the North East.'
  },
  {
    file:        'fc-offers.html',
    canonicalPath: '/fc-offers',
    title:       'Exclusive Deals for North East Business Owners — FC Offers',
    description: 'Discounts on accountancy, marketing, workspace, tech and more — offered by North East businesses to the First Connections community across Newcastle, Darlington & Durham.',
    ogTitle:     'Exclusive Deals from the North East Business Community',
    ogDescription: 'Member discounts on accountancy, marketing, workspace, tech & more — from North East businesses to the First Connections community.',
    twTitle:     'Exclusive Deals for North East Business Owners',
    twDescription: 'Member discounts on accountancy, marketing, workspace & more from North East businesses.'
  },
  {
    file:        'funding-support.html',
    canonicalPath: '/funding-support',
    title:       'Grants, Business Funding & Tenders — North East UK — Powered by Metrick',
    description: 'Grants, R&D tax relief, tenders & ISO accreditations for North East businesses. Free discovery call for FC members with Metrick, the region\'s funding specialists.',
    ogTitle:     'Grants, Business Funding & Tenders for North East Businesses',
    ogDescription: 'Grants, R&D tax relief, tenders & accreditations. Free discovery call for FC members with Metrick, the North East\'s funding specialists.',
    twTitle:     'Grants, Funding & Tenders for North East Businesses',
    twDescription: 'Grants, R&D tax relief, tenders & accreditations. Free discovery call for FC members with Metrick.'
  }
];

// ── Anchored regexes for the tags we replace. Each pattern intentionally
// matches the exact source lines in index.html; if the head is refactored,
// the swap will fail loudly rather than silently miss.
const REPLACERS = [
  {
    label: '<title>',
    pattern: /<title>[^<]*<\/title>/,
    build:   p => `<title>${escapeHtml(p.title)}</title>`
  },
  {
    label: '<meta name="description">',
    pattern: /<meta\s+name="description"\s+content="[^"]*">/,
    build:   p => `<meta name="description" content="${escapeAttr(p.description)}">`
  },
  {
    label: '<link rel="canonical">',
    pattern: /<link\s+rel="canonical"\s+href="[^"]*">/,
    build:   p => `<link rel="canonical" href="${SITE_URL}${p.canonicalPath}">`
  },
  {
    label: 'og:title',
    pattern: /<meta\s+property="og:title"\s+content="[^"]*">/,
    build:   p => `<meta property="og:title" content="${escapeAttr(p.ogTitle)}">`
  },
  {
    label: 'og:description',
    pattern: /<meta\s+property="og:description"\s+content="[^"]*">/,
    build:   p => `<meta property="og:description" content="${escapeAttr(p.ogDescription)}">`
  },
  {
    label: 'og:url',
    pattern: /<meta\s+property="og:url"\s+content="[^"]*">/,
    build:   p => `<meta property="og:url" content="${SITE_URL}${p.canonicalPath}">`
  },
  {
    label: 'twitter:title',
    pattern: /<meta\s+name="twitter:title"\s+content="[^"]*">/,
    build:   p => `<meta name="twitter:title" content="${escapeAttr(p.twTitle)}">`
  },
  {
    label: 'twitter:description',
    pattern: /<meta\s+name="twitter:description"\s+content="[^"]*">/,
    build:   p => `<meta name="twitter:description" content="${escapeAttr(p.twDescription)}">`
  }
];

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function escapeAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function build() {
  if (!fs.existsSync(SOURCE)) {
    console.error(`build.js: source not found at ${SOURCE}`);
    process.exit(1);
  }
  const source = fs.readFileSync(SOURCE, 'utf8');

  let failures = 0;
  for (const page of PAGES) {
    let html = source;
    for (const r of REPLACERS) {
      if (!r.pattern.test(html)) {
        console.error(`build.js: pattern for ${r.label} not found in index.html — refusing to write ${page.file}`);
        failures++;
        break;
      }
      html = html.replace(r.pattern, r.build(page));
    }
    if (failures > 0) continue;

    // OG image stays the same as home for now (single shared campaign image).
    // The canonical, title, and description are enough to disambiguate the
    // pages in search results and social previews.
    fs.writeFileSync(path.join(ROOT, page.file), html);
    console.log(`build.js: wrote ${page.file} (${html.length} bytes)`);
  }

  if (failures > 0) {
    console.error(`build.js: ${failures} page(s) failed — aborting deploy.`);
    process.exit(1);
  }
  console.log(`build.js: generated ${PAGES.length} per-page HTML files successfully.`);
}

build();
