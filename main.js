// ── NAV — handled by initNav() below ──

// ── SCROLL ANIMATIONS ──
const observer = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) e.target.classList.add("visible");
    });
  },
  { threshold: 0.1 },
);
document.querySelectorAll(".fade-in").forEach(function (el) {
  observer.observe(el);
});

// ── MODALS ──
function openModal(id) {
  document.getElementById(id).classList.add("active");
  document.body.style.overflow = "hidden";
}
function closeModal(id) {
  document.getElementById(id).classList.remove("active");
  document.body.style.overflow = "";
}
// Close on overlay click
document.querySelectorAll(".modal-overlay").forEach(function (overlay) {
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeModal(overlay.id);
  });
});
// Close on Escape
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    document
      .querySelectorAll(".modal-overlay.active")
      .forEach(function (m) {
        closeModal(m.id);
      });
    if (typeof closeOfferDetail === "function") closeOfferDetail();
    if (typeof closeOfferModal === "function") closeOfferModal();
  }
});

// ── FORM SUBMISSIONS ──
function getVal(id) {
  return document.getElementById(id)
    ? document.getElementById(id).value.trim()
    : "";
}

async function submitContact() {
  var first = getVal("cf-first");
  var last = getVal("cf-last");
  var email = getVal("cf-email");
  var phone = getVal("cf-phone");
  var company = getVal("cf-company");
  var subject = getVal("cf-subject");
  var message = getVal("cf-message");

  if (!first || !last || !email || !message) {
    alert("Please fill in your name, email and message.");
    return;
  }

  // Disable button to prevent double-submit
  var btn = document.querySelector("#contactFormWrap .modal-submit");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Sending...";
  }

  try {
    var res = await fetch("/.netlify/functions/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: first,
        lastName: last,
        email: email,
        phone: phone,
        company: company,
        subject: subject,
        message: message,
      }),
    });

    if (res.ok) {
      document.getElementById("contactFormWrap").style.display = "none";
      document.getElementById("contactSuccess").style.display = "block";
      setTimeout(function () {
        closeModal("contactModal");
        document.getElementById("contactFormWrap").style.display =
          "block";
        document.getElementById("contactSuccess").style.display = "none";
        if (btn) {
          btn.disabled = false;
          btn.textContent = "Send Message →";
        }
      }, 3500);
    } else {
      var errData = await res.json().catch(function () {
        return {};
      });
      // silent
      alert(
        "Something went wrong. Please try again or email hello@first-connections.co.uk directly.",
      );
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Send Message →";
      }
    }
  } catch (err) {
    // silent
    alert(
      "Something went wrong. Please check your connection and try again.",
    );
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Send Message →";
    }
  }
}

// ── FUNDING SUPPORT: interest-chip toggling ──
document.addEventListener("click", function (e) {
  var chip = e.target.closest && e.target.closest(".fs-chip");
  if (!chip) return;
  var group = chip.parentElement;
  group.querySelectorAll(".fs-chip").forEach(function (c) {
    c.classList.remove("active");
  });
  chip.classList.add("active");
});

async function submitFunding() {
  var name = getVal("fs-name");
  var email = getVal("fs-email");
  var company = getVal("fs-company");
  var phone = getVal("fs-phone");
  var stage = getVal("fs-stage");
  var message = getVal("fs-message");
  var activeChip = document.querySelector(
    "#fs-interest-chips .fs-chip.active",
  );
  var interest = activeChip
    ? activeChip.getAttribute("data-interest")
    : "";

  if (!name || !email || !message) {
    alert(
      "Please add your name, email, and a short note about your project.",
    );
    return;
  }

  var nameParts = name.trim().split(/\s+/);
  var first = nameParts.shift();
  var last = nameParts.join(" ") || "";

  var btn = document.getElementById("fs-submit-btn");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Sending...";
  }

  var body =
    "Interest area: " +
    (interest || "Not specified") +
    "\n" +
    "Business stage: " +
    (stage || "Not specified") +
    "\n\n" +
    "About the project:\n" +
    message;

  try {
    var res = await fetch("/.netlify/functions/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: first,
        lastName: last,
        email: email,
        phone: phone,
        company: company,
        subject:
          "Funding Support Enquiry — " +
          (interest || "General") +
          " (Metrick)",
        message: body,
      }),
    });

    if (res.ok) {
      document.getElementById("fs-form-wrap").style.display = "none";
      document.getElementById("fs-form-success").classList.add("show");
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Register interest →";
      }
    } else {
      alert(
        "Something went wrong. Please try again or email hello@first-connections.co.uk directly.",
      );
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Register interest →";
      }
    }
  } catch (err) {
    alert(
      "Something went wrong. Please check your connection and try again.",
    );
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Register interest →";
    }
  }
}

async function submitNewsletter() {
  var first = getVal("nf-first");
  var last = getVal("nf-last");
  var email = getVal("nf-email");
  var phone = getVal("nf-phone");
  var company = getVal("nf-company");
  var interest = getVal("nf-interest");

  if (!first || !email) {
    alert("Please enter your name and email address.");
    return;
  }

  // Disable button to prevent double-submit
  var btn = document.querySelector("#newsletterFormWrap .modal-submit");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Sending...";
  }

  try {
    var res = await fetch("/.netlify/functions/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: first,
        lastName: last,
        email: email,
        phone: phone,
        company: company,
        interest: interest,
      }),
    });

    if (res.ok) {
      // Show success state
      document.getElementById("newsletterFormWrap").style.display =
        "none";
      document.getElementById("newsletterSuccess").style.display =
        "block";
      setTimeout(function () {
        closeModal("newsletterModal");
        document.getElementById("newsletterFormWrap").style.display =
          "block";
        document.getElementById("newsletterSuccess").style.display =
          "none";
        if (btn) {
          btn.disabled = false;
          btn.textContent = "Subscribe Now →";
        }
      }, 3500);
    } else {
      var errData = await res.json().catch(function () {
        return {};
      });
      console.error("Newsletter submit failed:", res.status, errData);
      alert(
        "Something went wrong submitting your details. Please try again or email hello@first-connections.co.uk directly.",
      );
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Subscribe Now →";
      }
    }
  } catch (err) {
    console.error("Newsletter submit network error:", err);
    alert(
      "Something went wrong. Please check your connection and try again.",
    );
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Subscribe Now →";
    }
  }
}

function submitSponsor() {
  var first = getVal("sf-first"),
    email = getVal("sf-email"),
    company = getVal("sf-company");
  if (!first || !email || !company) {
    alert("Please fill in your name, email and company name.");
    return;
  }
  var subject = encodeURIComponent("Sponsorship Enquiry from " + company);
  var body = encodeURIComponent(
    "Sponsorship Enquiry\n\nName: " +
      first +
      " " +
      getVal("sf-last") +
      "\nEmail: " +
      email +
      "\nPhone: " +
      getVal("sf-phone") +
      "\nCompany: " +
      company +
      "\nInterest: " +
      getVal("sf-interest") +
      "\n\nMessage:\n" +
      getVal("sf-message"),
  );
  window.location.href =
    "mailto:hello@first-connections.co.uk?subject=" +
    subject +
    "&body=" +
    body;
  document.getElementById("sponsorFormWrap").style.display = "none";
  document.getElementById("sponsorSuccess").style.display = "block";
  setTimeout(function () {
    closeModal("sponsorModal");
    document.getElementById("sponsorFormWrap").style.display = "block";
    document.getElementById("sponsorSuccess").style.display = "none";
  }, 3500);
}

// ── PAGE SWITCHING ──
// ── URL ROUTING ──
var PAGE_ROUTES = {
  "page-main": "/",
  "page-events": "/events",
  "page-resources": "/resources",
  "page-offers": "/fc-offers",
  "page-funding": "/funding-support",
};
var ROUTE_PAGES = {};
Object.keys(PAGE_ROUTES).forEach(function (k) {
  ROUTE_PAGES[PAGE_ROUTES[k]] = k;
});

function showPage(pageId) {
  document.querySelectorAll(".page").forEach(function (p) {
    p.classList.remove("active");
  });
  document.getElementById(pageId).classList.add("active");
  window.scrollTo(0, 0);
  document.body.style.overflow = "";
  ["navMenu", "navMenuR", "navMenuE", "navMenuO", "navMenuF"].forEach(
    function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.remove("open");
    },
  );
  ["menuBtn", "menuBtnR", "menuBtnE", "menuBtnO", "menuBtnF"].forEach(
    function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.remove("open");
    },
  );
  if (pageId === "page-offers") loadCommunityOffers();
  // Update browser URL
  var route = PAGE_ROUTES[pageId] || "/";
  if (window.history && window.history.pushState) {
    window.history.pushState({ pageId: pageId }, "", route);
  }
}

// Handle back/forward navigation
window.addEventListener("popstate", function (e) {
  var pageId = e.state && e.state.pageId ? e.state.pageId : "page-main";
  document.querySelectorAll(".page").forEach(function (p) {
    p.classList.remove("active");
  });
  var target = document.getElementById(pageId);
  if (target) {
    target.classList.add("active");
    window.scrollTo(0, 0);
  }
  if (pageId === "page-offers") loadCommunityOffers();
});

// Direct URL init — runs after all functions defined (see bottom of script)

// ── NAV HAMBURGER — unified handler for all three navs ──
function initNav(btnId, menuId) {
  var btn = document.getElementById(btnId);
  var menu = document.getElementById(menuId);
  if (!btn || !menu) return;

  btn.addEventListener("click", function (e) {
    e.stopPropagation();
    var isOpen = menu.classList.toggle("open");
    btn.classList.toggle("open", isOpen);
    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  // Close on outside click
  document.addEventListener("click", function (e) {
    if (
      menu.classList.contains("open") &&
      !menu.contains(e.target) &&
      !btn.contains(e.target)
    ) {
      menu.classList.remove("open");
      btn.classList.remove("open");
      document.body.style.overflow = "";
    }
  });

  // Close on link click
  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      menu.classList.remove("open");
      btn.classList.remove("open");
      document.body.style.overflow = "";
    });
  });

  // Close on scroll
  window.addEventListener(
    "scroll",
    function () {
      if (window.innerWidth < 1024 && menu.classList.contains("open")) {
        menu.classList.remove("open");
        btn.classList.remove("open");
        document.body.style.overflow = "";
      }
    },
    { passive: true },
  );
}

initNav("menuBtn", "navMenu");
initNav("menuBtnR", "navMenuR");
initNav("menuBtnE", "navMenuE");
initNav("menuBtnO", "navMenuO");
initNav("menuBtnF", "navMenuF");

// ── RESOURCES FILTER ──
// ── RESOURCES FILTER ──
var resourceCards = document.querySelectorAll(".resource-card");
var countEl = document.getElementById("filterCount");
var emptyState = document.getElementById("emptyState");
var activeLocation = "all";
var activeCat = "all";

function filterResources() {
  var query = (
    (document.getElementById("resSearchInput") || {}).value || ""
  )
    .toLowerCase()
    .trim();
  var visible = 0;
  resourceCards.forEach(function (card) {
    var locs = card.getAttribute("data-locations") || "";
    var cats = card.getAttribute("data-category") || "";
    var text = card.textContent.toLowerCase();
    var matchLoc =
      activeLocation === "all" || locs.includes(activeLocation);
    var matchCat = activeCat === "all" || cats.includes(activeCat);
    var matchSearch = !query || text.includes(query);
    var show = matchLoc && matchCat && matchSearch;
    card.classList.toggle("hidden", !show);
    // Also show/hide parent section headers if all cards in section hidden
    if (show) visible++;
  });
  if (countEl) {
    countEl.textContent =
      visible === resourceCards.length
        ? resourceCards.length + " resources"
        : visible + " of " + resourceCards.length + " resources";
  }
  if (emptyState) emptyState.classList.toggle("visible", visible === 0);
}

// Location pills
document.querySelectorAll(".filter-pill").forEach(function (pill) {
  pill.addEventListener("click", function () {
    document.querySelectorAll(".filter-pill").forEach(function (p) {
      p.classList.remove("active");
    });
    pill.classList.add("active");
    activeLocation = pill.getAttribute("data-location");
    filterResources();
  });
});

// Category pills
document.querySelectorAll(".filter-cat").forEach(function (btn) {
  btn.addEventListener("click", function () {
    document.querySelectorAll(".filter-cat").forEach(function (b) {
      b.classList.remove("active");
    });
    btn.classList.add("active");
    activeCat = btn.getAttribute("data-cat");
    filterResources();
  });
});

filterResources();

// ── RESOURCES SCROLL ANIMATIONS ──
var resObserver = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) e.target.classList.add("visible");
    });
  },
  { threshold: 0.08 },
);
document
  .querySelectorAll("#page-resources .fade-in")
  .forEach(function (el) {
    resObserver.observe(el);
  });

/* ── AIRTABLE COMMUNITY OFFERS ── */
var _t1 = "patGMsRmnhKEdu3i9.6c",
  _t2 = "c95e575e7bc045354ad23d46104665",
  _t3 = "03d56e649b2aa3c5fb93738445e1314b";
var AT_TOKEN = _t1 + _t2 + _t3;
var AT_BASE = "appzNaWxLuQstEUSX";
var AT_TABLE = "tblrQUho0RGnhh03V";
var AT_SITE = "First Connections";
var AT_API = "https://api.airtable.com/v0/";
var offersLoaded = false;

function loadCommunityOffers() {
  if (offersLoaded) return;
  var grid = document.getElementById("community-offers-grid");
  if (!grid) return;
  // Filter works for both Single and Multiple select Site fields
  var filter =
    'AND({Approved}=1,OR(FIND("' +
    AT_SITE +
    '",{Site}),FIND("All Sites",{Site})))';
  var url =
    AT_API +
    AT_BASE +
    "/" +
    AT_TABLE +
    "?filterByFormula=" +
    encodeURIComponent(filter) +
    "&fields[]=Business+Name&fields[]=Sector&fields[]=Description" +
    "&fields[]=Offer+Headline&fields[]=Offer+Detail&fields[]=Discount+Code" +
    "&fields[]=Website+URL&fields[]=Logo+URL&fields[]=Town+%2F+City" +
    "&sort[0][field]=Business+Name&sort[0][direction]=asc";
  fetch(url, {
    headers: {
      Authorization: "Bearer " + AT_TOKEN,
      "Content-Type": "application/json",
    },
  })
    .then(function (r) {
      return r.json();
    })
    .then(function (data) {
      offersLoaded = true;
      allOfferRecords = data.records || [];
      buildCategoryPills(allOfferRecords);
      var countEl = document.getElementById("offers-count");
      if (countEl)
        countEl.textContent =
          allOfferRecords.length +
          " offer" +
          (allOfferRecords.length !== 1 ? "s" : "");
      renderOfferCards(allOfferRecords, grid);
    })
    .catch(function () {
      grid.innerHTML =
        '<div class="coc-empty">Could not load offers. Please try again later.</div>';
      appendSubmitCard(grid);
    });
}

/* ── OFFERS CATEGORY + SEARCH FILTER ── */
var allOfferRecords = [];

function setOffersCat(btn) {
  document.querySelectorAll(".offers-cat-pill").forEach(function (p) {
    p.classList.remove("active");
  });
  btn.classList.add("active");
  filterOffers();
}

function filterOffers() {
  var cat =
    (
      document.querySelector(".offers-cat-pill.active") || {}
    ).getAttribute("data-cat") || "all";
  var query = (
    (document.getElementById("offers-search-input") || {}).value || ""
  )
    .toLowerCase()
    .trim();
  var grid = document.getElementById("community-offers-grid");
  if (!grid) return;
  var filtered = allOfferRecords.filter(function (rec) {
    var f = rec.fields;
    var matchCat =
      cat === "all" || (f["Sector"] || "").toLowerCase() === cat;
    var matchSearch =
      !query ||
      (f["Business Name"] || "").toLowerCase().includes(query) ||
      (f["Offer Headline"] || "").toLowerCase().includes(query) ||
      (f["Sector"] || "").toLowerCase().includes(query) ||
      (f["Description"] || "").toLowerCase().includes(query);
    return matchCat && matchSearch;
  });
  renderOfferCards(filtered, grid, true);
  var countEl = document.getElementById("offers-count");
  if (countEl)
    countEl.textContent =
      filtered.length + " offer" + (filtered.length !== 1 ? "s" : "");
}

function buildCategoryPills(records) {
  var sectors = {};
  records.forEach(function (rec) {
    var s = (rec.fields["Sector"] || "").trim();
    if (s) sectors[s] = (sectors[s] || 0) + 1;
  });
  var pillsEl = document.getElementById("offers-cat-pills");
  if (!pillsEl) return;
  pillsEl.innerHTML =
    '<button class="offers-cat-pill active" data-cat="all" onclick="setOffersCat(this)">All ' +
    records.length +
    "</button>";
  Object.keys(sectors)
    .sort()
    .forEach(function (s) {
      pillsEl.insertAdjacentHTML(
        "beforeend",
        '<button class="offers-cat-pill" data-cat="' +
          s.toLowerCase() +
          '" onclick="setOffersCat(this)">' +
          s +
          " " +
          sectors[s] +
          "</button>",
      );
    });
}

function renderOfferCards(records, grid, skipSubmit) {
  grid.innerHTML = "";
  records.forEach(function (rec) {
    var f = rec.fields;
    var biz = f["Business Name"] || "";
    var initials = biz
      .split(" ")
      .map(function (w) {
        return w[0] || "";
      })
      .join("")
      .substring(0, 2)
      .toUpperCase();
    var logo = f["Logo URL"] || "";
    var logoHtml = logo
      ? '<img src="' +
        logo +
        '" alt="' +
        biz +
        '" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">'
      : initials;
    var code = f["Discount Code"] || "";
    var detail = f["Offer Detail"] || "";
    var town = f["Town / City"] || "";
    // Store record data on card for modal
    var recData = encodeURIComponent(
      JSON.stringify({
        id: rec.id,
        biz: biz,
        sector: f["Sector"] || "",
        town: town,
        headline: f["Offer Headline"] || "",
        detail: detail,
        desc: f["Description"] || "",
        code: code,
        url: f["Website URL"] || "#",
      }),
    );
    var shareUrl = "https://first-connections.co.uk/offer/" + rec.id;
    var shareTitle = encodeURIComponent(
      (f["Offer Headline"] || biz) + " | First Connections",
    );
    var waUrl =
      "https://wa.me/?text=" +
      shareTitle +
      "%20" +
      encodeURIComponent(shareUrl);
    var fbUrl =
      "https://www.facebook.com/sharer/sharer.php?u=" +
      encodeURIComponent(shareUrl);
    var liUrl =
      "https://www.linkedin.com/sharing/share-offsite/?url=" +
      encodeURIComponent(shareUrl);
    var twUrl =
      "https://twitter.com/intent/tweet?text=" +
      shareTitle +
      "&url=" +
      encodeURIComponent(shareUrl);
    var cardHtml =
      '<div class="community-offer-card" onclick="openOfferDetail(this)" data-offer="' +
      recData +
      '">';
    cardHtml += '<div class="coc-header">';
    cardHtml +=
      '<p class="coc-offer-value">' +
      esc(f["Offer Headline"] || "") +
      "</p>";
    if (detail)
      cardHtml += '<p class="coc-offer-detail">' + esc(detail) + "</p>";
    if (code)
      cardHtml += '<p class="coc-offer-code">' + esc(code) + "</p>";
    cardHtml += "</div>";
    cardHtml += '<div class="coc-body">';
    cardHtml += '<p class="coc-name">' + esc(biz) + "</p>";
    cardHtml +=
      '<p class="coc-sector">' +
      esc(f["Sector"] || "") +
      (town ? " &middot; " + esc(town) : "") +
      "</p>";
    cardHtml +=
      '<p class="coc-desc">' + esc(f["Description"] || "") + "</p>";
    cardHtml += "</div>";
    cardHtml +=
      '<div class="coc-footer" onclick="event.stopPropagation()">';
    if (code)
      cardHtml += '<span class="coc-code-pill">' + esc(code) + "</span>";
    else cardHtml += "<span></span>";
    cardHtml += '<div class="coc-share-icons">';
    cardHtml +=
      '<button class="coc-share-icon" title="Copy link" onclick="copyCardLink(\'' +
      rec.id +
      '\')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg></button>';
    cardHtml +=
      '<a class="coc-share-icon wa" title="WhatsApp" target="_blank" rel="noopener" href="' +
      waUrl +
      '"><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/><path d="M12 2C6.477 2 2 6.477 2 12a9.94 9.94 0 001.361 5.013L2 22l5.14-1.347A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg></a>';
    cardHtml +=
      '<a class="coc-share-icon fb" title="Facebook" target="_blank" rel="noopener" href="' +
      fbUrl +
      '"><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.514c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg></a>';
    cardHtml +=
      '<a class="coc-share-icon li" title="LinkedIn" target="_blank" rel="noopener" href="' +
      liUrl +
      '"><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>';
    cardHtml +=
      '<a class="coc-share-icon tw" title="X / Twitter" target="_blank" rel="noopener" href="' +
      twUrl +
      '"><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>';
    cardHtml += "</div>";
    cardHtml += '<span class="coc-view-link">View &rarr;</span>';
    cardHtml += "</div>";
    cardHtml += "</div>";
    grid.insertAdjacentHTML("beforeend", cardHtml);
  });
  if (!records.length) {
    grid.insertAdjacentHTML(
      "beforeend",
      '<div class="coc-empty">No offers match your search — try a different filter or <span style="color:var(--gold);cursor:pointer;font-weight:600;" onclick="openOfferModal()">submit your own</span>!</div>',
    );
  }
  if (!skipSubmit) appendSubmitCard(grid);
}

function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function appendSubmitCard(grid) {
  grid.insertAdjacentHTML(
    "beforeend",
    '<div class="coc-submit-card" onclick="openOfferModal()">' +
      '<div class="coc-submit-icon">+</div>' +
      '<p class="coc-submit-title">Submit your offer</p>' +
      '<p class="coc-submit-desc">Share a deal with the First Connections community — free, reviewed within 2 business days.</p>' +
      '<button style="background:var(--gold);color:white;border:none;border-radius:8px;padding:10px 22px;font-weight:700;font-size:0.84rem;cursor:pointer;font-family:Inter,sans-serif;box-shadow:0 4px 14px rgba(236,179,68,0.3);transition:background 0.2s;" onclick="openOfferModal();event.stopPropagation()">Get listed free</button>' +
      "</div>",
  );
}

/* ── OFFER SHARE ── */
function copyCardLink(recordId) {
  var url = "https://first-connections.co.uk/offer/" + recordId;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(function () {
      showCopyToast("Link copied!");
    });
  } else {
    var ta = document.createElement("textarea");
    ta.value = url;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showCopyToast("Link copied!");
  }
}
function showCopyToast(msg) {
  var t = document.getElementById("copy-toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "copy-toast";
    t.style.cssText =
      "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--navy);color:white;padding:10px 20px;border-radius:8px;font-size:0.85rem;font-weight:600;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,0.2);transition:opacity 0.3s;";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = "1";
  clearTimeout(t._timer);
  t._timer = setTimeout(function () {
    t.style.opacity = "0";
  }, 2000);
}

function shareOffer(platform) {
  var overlay = document.getElementById("offer-detail-overlay");
  var shareUrl =
    (overlay && overlay.dataset.shareUrl) ||
    "https://first-connections.co.uk/fc-offers";
  if (platform === "copy") {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(function () {
        var copied = document.getElementById("odm-copied");
        if (copied) {
          copied.classList.add("show");
          setTimeout(function () {
            copied.classList.remove("show");
          }, 2500);
        }
      });
    } else {
      // Fallback
      var ta = document.createElement("textarea");
      ta.value = shareUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      var copied = document.getElementById("odm-copied");
      if (copied) {
        copied.classList.add("show");
        setTimeout(function () {
          copied.classList.remove("show");
        }, 2500);
      }
    }
  }
}

/* ── OFFER DETAIL MODAL ── */
function openOfferDetail(card) {
  var raw = card.getAttribute("data-offer");
  if (!raw) return;
  var d;
  try {
    d = JSON.parse(decodeURIComponent(raw));
  } catch (e) {
    return;
  }
  document.getElementById("odm-meta").textContent =
    d.biz +
    (d.sector ? " · " + d.sector : "") +
    (d.town ? " · " + d.town : "");
  document.getElementById("odm-headline").textContent = d.headline;
  document.getElementById("odm-detail").textContent = d.detail || "";
  document.getElementById("odm-sector").textContent = d.sector || "—";
  document.getElementById("odm-town").textContent = d.town || "—";
  document.getElementById("odm-biz").textContent = d.biz || "—";
  document.getElementById("odm-desc").textContent = d.desc || "";
  var codeBlock = document.getElementById("odm-code-block");
  if (d.code) {
    document.getElementById("odm-code").textContent = d.code;
    codeBlock.style.display = "flex";
  } else {
    codeBlock.style.display = "none";
  }
  var visitBtn = document.getElementById("odm-visit");
  visitBtn.href = d.url || "#";
  visitBtn.textContent = "Visit " + d.biz + " →";

  // Build share URL
  var shareUrl = d.id
    ? "https://first-connections.co.uk/offer/" + d.id
    : "https://first-connections.co.uk/fc-offers";
  var shareText = encodeURIComponent(
    d.headline + " — " + d.biz + " | First Connections",
  );
  var shareDesc = encodeURIComponent(
    (d.detail || d.desc || "").substring(0, 100),
  );

  // Store current share URL for copy function
  document.getElementById("offer-detail-overlay").dataset.shareUrl =
    shareUrl;

  // WhatsApp
  var waLink = document.getElementById("odm-wa");
  if (waLink)
    waLink.href =
      "https://wa.me/?text=" +
      shareText +
      "%20" +
      encodeURIComponent(shareUrl);

  // Facebook
  var fbLink = document.getElementById("odm-fb");
  if (fbLink)
    fbLink.href =
      "https://www.facebook.com/sharer/sharer.php?u=" +
      encodeURIComponent(shareUrl);

  // LinkedIn
  var liLink = document.getElementById("odm-li");
  if (liLink)
    liLink.href =
      "https://www.linkedin.com/sharing/share-offsite/?url=" +
      encodeURIComponent(shareUrl);

  // Twitter / X
  var twLink = document.getElementById("odm-tw");
  if (twLink)
    twLink.href =
      "https://twitter.com/intent/tweet?text=" +
      shareText +
      "&url=" +
      encodeURIComponent(shareUrl);

  var overlay = document.getElementById("offer-detail-overlay");
  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeOfferDetail(e) {
  if (
    e &&
    e.type === "click" &&
    e.target !== document.getElementById("offer-detail-overlay")
  )
    return;
  document
    .getElementById("offer-detail-overlay")
    .classList.remove("open");
  document.body.style.overflow = "";
}
function openOfferModal() {
  var o = document.getElementById("offer-modal-overlay");
  if (o) {
    o.classList.add("open");
    document.body.style.overflow = "hidden";
  }
}
function closeOfferModal(e) {
  if (
    e &&
    e.type === "click" &&
    e.target !== document.getElementById("offer-modal-overlay")
  )
    return;
  var o = document.getElementById("offer-modal-overlay");
  if (o) o.classList.remove("open");
  document.body.style.overflow = "";
}

function submitOfferForm() {
  var biz = (document.getElementById("of-bizname") || {}).value || "";
  var sector = (document.getElementById("of-sector") || {}).value || "";
  var desc = (document.getElementById("of-desc") || {}).value || "";
  var headline =
    (document.getElementById("of-headline") || {}).value || "";
  var detail = (document.getElementById("of-detail") || {}).value || "";
  var code = (document.getElementById("of-code") || {}).value || "";
  var url = (document.getElementById("of-url") || {}).value || "";
  var logo = (document.getElementById("of-logo") || {}).value || "";
  var town = (document.getElementById("of-town") || {}).value || "";
  var cname = (document.getElementById("of-cname") || {}).value || "";
  var cemail = (document.getElementById("of-cemail") || {}).value || "";
  biz = biz.trim();
  sector = sector.trim();
  desc = desc.trim();
  headline = headline.trim();
  url = url.trim();
  town = town.trim();
  cname = cname.trim();
  cemail = cemail.trim();
  if (
    !biz ||
    !sector ||
    !desc ||
    !headline ||
    !url ||
    !town ||
    !cname ||
    !cemail
  ) {
    alert("Please fill in all required fields.");
    return;
  }
  var btn = document.getElementById("of-submit-btn");
  var txt = document.getElementById("of-submit-txt");
  if (btn) btn.disabled = true;
  if (txt) txt.textContent = "Submitting...";
  var fields = {
    "Business Name": biz,
    Sector: sector,
    Description: desc,
    "Offer Headline": headline,
    Site: [AT_SITE],
    "Town / City": town,
    "Contact Name": cname,
    "Contact Email": cemail,
  };
  if (detail.trim()) fields["Offer Detail"] = detail.trim();
  if (code.trim()) fields["Discount Code"] = code.trim();
  if (url) fields["Website URL"] = url;
  if (logo.trim()) fields["Logo URL"] = logo.trim();
  fetch(AT_API + AT_BASE + "/" + AT_TABLE, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + AT_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields: fields, typecast: true }),
  })
    .then(function (r) {
      if (r.ok || r.status === 200 || r.status === 201) {
        document.getElementById("offer-form-wrap").style.display = "none";
        document.getElementById("offer-success").style.display = "block";
        offersLoaded = false;
        setTimeout(function () {
          closeOfferModal();
          document.getElementById("offer-form-wrap").style.display = "";
          document.getElementById("offer-success").style.display = "none";
          if (btn) btn.disabled = false;
          if (txt) txt.textContent = "Submit for review";
        }, 4000);
      } else {
        r.json()
          .then(function (err) {
            console.error("Offer submit failed:", r.status, err);
            var detail =
              (err &&
                err.error &&
                (err.error.message || err.error.type)) ||
              "HTTP " + r.status;
            alert(
              "Something went wrong submitting your offer.\n\n" +
                detail +
                "\n\nPlease try again, or email hello@first-connections.co.uk with the details.",
            );
          })
          .catch(function () {
            console.error(
              "Offer submit failed with non-JSON body, status:",
              r.status,
            );
            alert(
              "Something went wrong submitting your offer (HTTP " +
                r.status +
                "). Please try again or email hello@first-connections.co.uk.",
            );
          });
        if (btn) btn.disabled = false;
        if (txt) txt.textContent = "Submit for review";
      }
    })
    .catch(function (err) {
      console.error("Offer submit network error:", err);
      if (btn) btn.disabled = false;
      if (txt) txt.textContent = "Submit for review";
      alert(
        "Connection error. Please check your internet and try again.",
      );
    });
}

// ── DIRECT URL INIT ── runs last, after all functions are defined
// Handle direct URL on page load
(function () {
  var path = window.location.pathname.replace(/[/]+$/, "") || "/";
  var pageId = ROUTE_PAGES[path] || "page-main";
  if (pageId !== "page-main") {
    document.querySelectorAll(".page").forEach(function (p) {
      p.classList.remove("active");
    });
    var target = document.getElementById(pageId);
    if (target) target.classList.add("active");
    if (pageId === "page-offers") setTimeout(loadCommunityOffers, 150);
  }
  if (window.history && window.history.replaceState) {
    window.history.replaceState(
      { pageId: pageId },
      "",
      window.location.pathname,
    );
  }
})();
