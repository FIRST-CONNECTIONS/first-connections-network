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

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const SOURCE = path.join(ROOT, "index.html");
const OG_IMAGE = "https://first-connections.co.uk/images/ne/img-gala-event.jpg";
const SITE_URL = "https://first-connections.co.uk";

// ── Reusable schema fragments ──────────────────────────────────────────
const ORGANIZATION_REF = { "@id": SITE_URL + "/#organization" };

function breadcrumb(label, urlPath) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL + "/" },
      {
        "@type": "ListItem",
        position: 2,
        name: label,
        item: SITE_URL + urlPath,
      },
    ],
  };
}

// EventSeries lets Google understand a recurring event pattern without
// requiring specific future dates (which live on Eventbrite and rotate).
// Schema.org accepts EventSeries for the "monthly, rotating venues"
// pattern used by Darlington First and Newcastle First.
function eventSeries({ name, description, city, region, url, eventbrite }) {
  return {
    "@context": "https://schema.org",
    "@type": "EventSeries",
    name: name,
    description: description,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: "Rotating local venues in " + city,
      address: {
        "@type": "PostalAddress",
        addressLocality: city,
        addressRegion: region,
        addressCountry: "GB",
      },
    },
    organizer: {
      "@type": "Organization",
      name: "First Connections",
      url: SITE_URL,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "GBP",
      availability: "https://schema.org/InStock",
      url: eventbrite,
    },
    url: url,
  };
}

// Each hero heading carries a stable id (added directly in index.html) so
// the swap below survives HTML reformatting — it no longer depends on
// matching exact whitespace/attribute layout.
const HOME_HERO_ID = "home-hero";

const PAGES = [
  {
    file: "events.html",
    canonicalPath: "/events",
    title:
      "Free Business Networking Events in the North East — First Connections",
    heroId: "events-hero",
    description:
      "Monthly free networking events in Darlington, Newcastle, Durham & Tees Valley. Meet the region's business community — no membership fees, all welcome.",
    ogTitle: "Free Business Networking Events Across the North East",
    ogDescription:
      "Monthly free networking in Darlington, Newcastle, Durham & Tees Valley. Meet the region's business community — no membership fees.",
    twTitle: "Free Business Networking Events in the North East",
    twDescription:
      "Monthly free networking events in Darlington, Newcastle, Durham & Tees Valley — no membership fees, all welcome.",
    schemas: () => [
      breadcrumb("Events", "/events"),
      eventSeries({
        name: "Darlington First — Business Networking",
        description:
          "Free monthly business networking in Darlington. Events rotate around local cafés and venues.",
        city: "Darlington",
        region: "County Durham",
        url: "https://www.darlingtonfirst.network/",
        eventbrite:
          "https://www.eventbrite.com/cc/darlington-first-business-networking-4823611",
      }),
      eventSeries({
        name: "Newcastle First — Business Networking",
        description:
          "Free monthly business networking in Newcastle. Rotating venues across the city.",
        city: "Newcastle upon Tyne",
        region: "Tyne and Wear",
        url: "https://www.newcastlefirst.network/",
        eventbrite:
          "https://www.eventbrite.co.uk/o/newcastle-first-business-networking-121173246510",
      }),
    ],
  },
  {
    file: "resources.html",
    canonicalPath: "/resources",
    title:
      "Business Resources & Partner Offers — North East UK — First Connections",
    heroId: "resources-hero",
    description:
      "Trusted local services, exclusive discounts and business tools for North East companies — curated by First Connections across Newcastle, Darlington & Durham.",
    ogTitle: "Business Resources & Offers for North East Businesses",
    ogDescription:
      "Trusted local services & exclusive discounts curated by the First Connections community across Newcastle, Darlington & Durham.",
    twTitle: "Business Resources & Offers — North East UK",
    twDescription:
      "Trusted local services & exclusive discounts curated by the First Connections community across the North East.",
    schemas: () => [
      breadcrumb("Resources", "/resources"),
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Business Resources & Offers for North East Businesses",
        description:
          "Trusted local services, exclusive discounts and business tools for North East companies, curated by the First Connections community.",
        url: SITE_URL + "/resources",
        isPartOf: { "@id": SITE_URL + "/#website" },
        about: ORGANIZATION_REF,
      },
    ],
  },
  {
    file: "fc-offers.html",
    canonicalPath: "/fc-offers",
    title: "Exclusive Deals for North East Business Owners — FC Offers",
    heroId: "offers-hero",
    description:
      "Discounts on accountancy, marketing, workspace, tech and more — from North East businesses to the First Connections community.",
    ogTitle: "Exclusive Deals from the North East Business Community",
    ogDescription:
      "Member discounts on accountancy, marketing, workspace, tech & more — from North East businesses to the First Connections community.",
    twTitle: "Exclusive Deals for North East Business Owners",
    twDescription:
      "Member discounts on accountancy, marketing, workspace & more from North East businesses.",
    schemas: () => [
      breadcrumb("FC Offers", "/fc-offers"),
      {
        "@context": "https://schema.org",
        "@type": "OfferCatalog",
        name: "FC Offers — Exclusive Deals from the North East Business Community",
        description:
          "Member discounts submitted by North East businesses. Categories include accountancy, marketing, workspace, tech and professional services.",
        url: SITE_URL + "/fc-offers",
        provider: ORGANIZATION_REF,
        areaServed: {
          "@type": "AdministrativeArea",
          name: "North East England",
        },
      },
    ],
  },
  {
    file: "funding-support.html",
    canonicalPath: "/funding-support",
    title:
      "Grants, Business Funding & Tenders — North East UK — Powered by Metrick",
    heroId: "funding-hero",
    description:
      "Grants, R&D tax relief, tenders & ISO accreditations for North East businesses. Free discovery call for FC members with Metrick.",
    ogTitle: "Grants, Business Funding & Tenders for North East Businesses",
    ogDescription:
      "Grants, R&D tax relief, tenders & accreditations. Free discovery call for FC members with Metrick, the North East's funding specialists.",
    twTitle: "Grants, Funding & Tenders for North East Businesses",
    twDescription:
      "Grants, R&D tax relief, tenders & accreditations. Free discovery call for FC members with Metrick.",
    schemas: () => [
      breadcrumb("Funding Support", "/funding-support"),
      {
        "@context": "https://schema.org",
        "@type": "Service",
        serviceType: "Grants, Business Funding, Tenders & Accreditations",
        name: "First Connections Funding Support — powered by Metrick",
        description:
          "Grant identification & applications, R&D tax relief, tender writing, business funding introductions and ISO / Cyber Essentials accreditations. Priority access for First Connections members includes a free, no-obligation discovery call with Metrick.",
        provider: {
          "@type": "Organization",
          name: "Metrick",
          description:
            "The North East's specialist grants, funding and accreditations consultancy. Founded 2021 in Newton Aycliffe.",
        },
        brand: ORGANIZATION_REF,
        areaServed: {
          "@type": "AdministrativeArea",
          name: "North East England",
        },
        audience: {
          "@type": "BusinessAudience",
          audienceType:
            "Small and medium enterprises, start-ups, charities and CICs",
        },
        offers: {
          "@type": "Offer",
          name: "Free discovery call for First Connections members",
          price: "0",
          priceCurrency: "GBP",
          availability: "https://schema.org/InStock",
          url: SITE_URL + "/funding-support",
        },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Funding services",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Grant Funding",
                description:
                  "Full grant identification, application and submission — Innovate UK, R&D tax credits, Made Smarter, regional growth and decarbonisation schemes.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Business Funding",
                description:
                  "Investment introductions, lender-ready business plans, forecasts and pitch decks for start-ups, scale-ups and growth-stage SMEs.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Tender Support",
                description:
                  "Public and private-sector tender writing, bid management and PQQ support.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Accreditations",
                description:
                  "ISO 9001, ISO 14001, ISO 27001, Cyber Essentials, SafeContractor and other credentials that unlock tenders and larger contracts.",
              },
            },
          ],
        },
      },
    ],
  },
];

// ── Anchored regexes for the tags we replace. Each pattern intentionally
// matches the exact source lines in index.html; if the head is refactored,
// the swap will fail loudly rather than silently miss.
// Attributes may be spread across multiple lines and tags may be
// self-closed ("/>") depending on how index.html was last formatted, so
// these patterns tolerate whitespace/newlines between attributes and an
// optional trailing slash before the closing ">".
const REPLACERS = [
  {
    label: "<title>",
    pattern: /<title>[^<]*<\/title>/,
    build: (p) => `<title>${escapeHtml(p.title)}</title>`,
  },
  {
    label: '<meta name="description">',
    pattern: /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    build: (p) =>
      `<meta name="description" content="${escapeAttr(p.description)}">`,
  },
  {
    label: '<link rel="canonical">',
    pattern: /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
    build: (p) => `<link rel="canonical" href="${SITE_URL}${p.canonicalPath}">`,
  },
  {
    label: "og:title",
    pattern: /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
    build: (p) =>
      `<meta property="og:title" content="${escapeAttr(p.ogTitle)}">`,
  },
  {
    label: "og:description",
    pattern: /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
    build: (p) =>
      `<meta property="og:description" content="${escapeAttr(p.ogDescription)}">`,
  },
  {
    label: "og:url",
    pattern: /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
    build: (p) =>
      `<meta property="og:url" content="${SITE_URL}${p.canonicalPath}">`,
  },
  {
    label: "twitter:title",
    pattern: /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
    build: (p) =>
      `<meta name="twitter:title" content="${escapeAttr(p.twTitle)}">`,
  },
  {
    label: "twitter:description",
    pattern: /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
    build: (p) =>
      `<meta name="twitter:description" content="${escapeAttr(p.twDescription)}">`,
  },
];

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function escapeAttr(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

// Renames the <h{fromLevel}> ... </h{fromLevel}> element identified by
// `id` to <h{toLevel}>, preserving all of its attributes and content.
// Returns null if the id isn't found (caller treats that as a build
// failure) rather than silently leaving two H1s/no H1 on the page.
function swapHeadingLevel(html, id, fromLevel, toLevel) {
  const openPattern = new RegExp(
    `<h${fromLevel}\\b([^>]*\\bid="${id}"[^>]*)>`,
  );
  const openMatch = openPattern.exec(html);
  if (!openMatch) return null;

  const openStart = openMatch.index;
  const openEnd = openStart + openMatch[0].length;
  const closePattern = new RegExp(`</h${fromLevel}>`);
  const closeMatch = closePattern.exec(html.slice(openEnd));
  if (!closeMatch) return null;

  const closeStart = openEnd + closeMatch.index;
  const closeEnd = closeStart + closeMatch[0].length;

  return (
    html.slice(0, openStart) +
    `<h${toLevel}${openMatch[1]}>` +
    html.slice(openEnd, closeStart) +
    `</h${toLevel}>` +
    html.slice(closeEnd)
  );
}

const SCHEMA_MARKER = "<!-- PAGE-JSON-LD-INJECT -->";

function renderSchemas(schemas) {
  if (!schemas || !schemas.length) return "";
  return schemas
    .map(function (s) {
      return (
        '<script type="application/ld+json">\n' +
        JSON.stringify(s, null, 2) +
        "\n</script>"
      );
    })
    .join("\n");
}

function build() {
  if (!fs.existsSync(SOURCE)) {
    console.error("build.js: source not found at " + SOURCE);
    process.exit(1);
  }
  const source = fs.readFileSync(SOURCE, "utf8");

  if (!source.includes(SCHEMA_MARKER)) {
    console.error(
      "build.js: SCHEMA_MARKER (" +
        SCHEMA_MARKER +
        ") not found in index.html — refusing to build. The build depends on this marker to inject per-page JSON-LD.",
    );
    process.exit(1);
  }

  if (!new RegExp(`<h1\\b[^>]*\\bid="${HOME_HERO_ID}"[^>]*>`).test(source)) {
    console.error(
      `build.js: home hero (id="${HOME_HERO_ID}") not found in index.html — refusing to build. The single-H1-per-page swap depends on this id.`,
    );
    process.exit(1);
  }

  let failures = 0;
  for (const page of PAGES) {
    let html = source;
    for (const r of REPLACERS) {
      if (!r.pattern.test(html)) {
        console.error(
          "build.js: pattern for " +
            r.label +
            " not found in index.html — refusing to write " +
            page.file,
        );
        failures++;
        break;
      }
      html = html.replace(r.pattern, r.build(page));
    }
    if (failures > 0) continue;

    // Enforce a single H1 per generated page: demote the home hero to H2,
    // then promote this page's own hero (authored as H2 in the source)
    // back to H1. Both are located by id, not exact string match, so
    // this survives HTML reformatting.
    const demoted = swapHeadingLevel(html, HOME_HERO_ID, 1, 2);
    if (demoted === null) {
      console.error(
        `build.js: could not demote home hero (id="${HOME_HERO_ID}") — refusing to write ` +
          page.file,
      );
      failures++;
      continue;
    }
    const promoted = swapHeadingLevel(demoted, page.heroId, 2, 1);
    if (promoted === null) {
      console.error(
        `build.js: could not promote hero (id="${page.heroId}") — refusing to write ` +
          page.file,
      );
      failures++;
      continue;
    }
    html = promoted;

    // Inject per-page JSON-LD (EventSeries, Service, BreadcrumbList, etc.)
    // right after the site-wide Organization + WebSite + FAQPage @graph.
    const schemaBlock = renderSchemas(
      typeof page.schemas === "function" ? page.schemas() : [],
    );
    html = html.replace(SCHEMA_MARKER, SCHEMA_MARKER + "\n" + schemaBlock);

    fs.writeFileSync(path.join(ROOT, page.file), html);
    console.log(
      "build.js: wrote " + page.file + " (" + html.length + " bytes)",
    );
  }

  if (failures > 0) {
    console.error(
      "build.js: " + failures + " page(s) failed — aborting deploy.",
    );
    process.exit(1);
  }
  console.log(
    "build.js: generated " +
      PAGES.length +
      " per-page HTML files successfully.",
  );
}

build();
