(() => {
  document.documentElement.classList.add("has-js");

  const appScript = [...document.scripts].find((script) => /\/assets\/app\.js(?:\?|$)/.test(script.src));
  const siteRoot = appScript ? new URL("../", appScript.src) : new URL("./", window.location.href);
  const siteUrl = (value) => new URL(String(value).replace(/^\//, ""), siteRoot).href;

  const escapeHtml = (value) => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const navItems = [
    ["/", "Home"],
    ["/store-directory/", "Store Directory"],
    ["/leasing/", "Leasing"],
    ["/exhibitions/", "Exhibitions"],
    ["/floor-plan/", "Floor Plan"],
    ["/contact/", "Contact"]
  ];

  const normalisePath = (path) => {
    if (!path || path === "/index.html") return "/";
    return path.replace(/index\.html$/, "").replace(/\/+$/, "/");
  };

  function resolveInternalLinks() {
    document.querySelectorAll('a[href^="/"]').forEach((link) => {
      link.href = siteUrl(link.getAttribute("href"));
    });
  }

  function renderShell() {
    const rootPath = siteRoot.pathname.replace(/\/+$/, "/");
    const localPath = rootPath !== "/" && window.location.pathname.startsWith(rootPath)
      ? `/${window.location.pathname.slice(rootPath.length)}`
      : window.location.pathname;
    const currentPath = normalisePath(localPath);
    const navMarkup = navItems.map(([href, label]) => {
      const active = href === "/" ? currentPath === "/" : currentPath.startsWith(href);
      return `<a href="${siteUrl(href)}"${active ? ' aria-current="page"' : ""}>${label}</a>`;
    }).join("");

    const headerMount = document.querySelector("[data-site-header]");
    if (headerMount) {
      headerMount.outerHTML = `
        <header class="site-header" data-header>
          <div class="header-inner">
            <a class="brand" href="${siteUrl("/")}" aria-label="Sandown Retail Crossing home">
              <img src="${siteUrl("/assets/sandown-logo.png")}" alt="Sandown Retail Crossing" width="377" height="107">
            </a>
            <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="primary-nav" data-menu-toggle>
              <span class="sr-only">Open menu</span>
              <span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>
            </button>
            <nav class="primary-nav" id="primary-nav" aria-label="Main navigation" data-primary-nav>
              ${navMarkup}
              <a class="nav-directions" href="https://www.google.com/maps/dir/?api=1&destination=Sandown+Retail+Crossing%2C+Cnr+Wood+Drive+and+Sandown+Road%2C+Parklands%2C+Cape+Town%2C+7441" target="_blank" rel="noreferrer">Directions</a>
            </nav>
          </div>
        </header>`;
    }

    const footerMount = document.querySelector("[data-site-footer]");
    if (footerMount) {
      footerMount.outerHTML = `
        <footer class="site-footer">
          <div class="footer-main shell">
            <div class="footer-brand">
              <a class="footer-logo" href="${siteUrl("/")}" aria-label="Sandown Retail Crossing home">
                <img src="${siteUrl("/assets/sandown-logo.png")}" alt="Sandown Retail Crossing" width="377" height="107">
              </a>
              <p>Good things meet here</p>
            </div>
            <div class="footer-links">
              <h2>Explore</h2>
              <nav aria-label="Footer navigation">${navMarkup}</nav>
            </div>
            <div class="footer-visit">
              <h2>Visit us</h2>
              <p>Cnr Wood Drive &amp; Sandown Road<br>Parklands, Cape Town, 7441</p>
              <a href="https://www.google.com/maps/dir/?api=1&destination=Sandown+Retail+Crossing%2C+Cnr+Wood+Drive+and+Sandown+Road%2C+Parklands%2C+Cape+Town%2C+7441" target="_blank" rel="noreferrer">Get directions <span aria-hidden="true">↗</span></a>
            </div>
            <div class="footer-connect">
              <h2>Connect</h2>
              <a href="mailto:mubaseer@fpggroup.co.za">mubaseer@fpggroup.co.za</a>
              <a href="tel:+27720707499">072 070 7499</a>
              <div class="social-links" aria-label="Social media">
                <a href="https://www.facebook.com/SandownRetailCrossing" target="_blank" rel="noreferrer" aria-label="Sandown Retail Crossing on Facebook">f</a>
                <a href="https://www.instagram.com/sandownretail/" target="_blank" rel="noreferrer" aria-label="Sandown Retail Crossing on Instagram">ig</a>
              </div>
            </div>
          </div>
          <div class="footer-legal shell">
            <p>© <span data-year></span> Sandown Retail Crossing. All rights reserved.</p>
            <div>
              <a href="https://www.sandownretailcrossing.co.za/privacy-policy/" target="_blank" rel="noreferrer">Privacy policy</a>
              <a href="https://www.sandownretailcrossing.co.za/cookie-policy/" target="_blank" rel="noreferrer">Cookie policy</a>
            </div>
          </div>
        </footer>`;
    }

    document.querySelectorAll("[data-year]").forEach((node) => {
      node.textContent = new Date().getFullYear();
    });
  }

  function initMenu() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const nav = document.querySelector("[data-primary-nav]");
    if (!toggle || !nav) return;

    const closeMenu = () => {
      toggle.setAttribute("aria-expanded", "false");
      toggle.querySelector(".sr-only").textContent = "Open menu";
      nav.removeAttribute("data-open");
      document.body.classList.remove("menu-open");
    };

    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.querySelector(".sr-only").textContent = open ? "Open menu" : "Close menu";
      nav.toggleAttribute("data-open", !open);
      document.body.classList.toggle("menu-open", !open);
    });

    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    window.matchMedia("(min-width: 961px)").addEventListener("change", (event) => {
      if (event.matches) closeMenu();
    });
  }

  function getInitials(name) {
    return name
      .replace(/&/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }

  function storeCard(store) {
    const shopQuery = encodeURIComponent(store.shop.split(/[\s/&]+/)[0]);
    return `
      <article class="store-card">
        <div class="store-card__mark" aria-hidden="true">${escapeHtml(getInitials(store.name))}</div>
        <div class="store-card__body">
          <p class="store-card__category">${escapeHtml(store.category)}</p>
          <h2>${escapeHtml(store.name)}</h2>
          <p class="store-card__shop">Shop ${escapeHtml(store.shop)}</p>
        </div>
        <a href="${siteUrl(`/floor-plan/?store=${shopQuery}`)}" aria-label="Find ${escapeHtml(store.name)} on the floor plan">View on plan <span aria-hidden="true">→</span></a>
      </article>`;
  }

  function initDirectory() {
    const root = document.querySelector("[data-store-directory]");
    if (!root || !Array.isArray(window.SANDOWN_STORES)) return;

    const input = root.querySelector("[data-store-search]");
    const grid = root.querySelector("[data-store-grid]");
    const count = root.querySelector("[data-store-count]");
    const empty = root.querySelector("[data-store-empty]");
    const buttons = [...root.querySelectorAll("[data-store-category]")];
    const queryCategory = new URLSearchParams(window.location.search).get("category");
    let category = queryCategory && buttons.some((button) => button.dataset.storeCategory === queryCategory)
      ? queryCategory
      : "All";

    const render = () => {
      const term = (input?.value || "").trim().toLowerCase();
      const filtered = window.SANDOWN_STORES.filter((store) => {
        const categoryMatch = category === "All" || store.category === category;
        const searchText = `${store.name} ${store.category} ${store.shop}`.toLowerCase();
        return categoryMatch && searchText.includes(term);
      });

      grid.innerHTML = filtered.map(storeCard).join("");
      count.textContent = `${filtered.length} ${filtered.length === 1 ? "store" : "stores"}`;
      empty.hidden = filtered.length !== 0;
      grid.hidden = filtered.length === 0;
      buttons.forEach((button) => {
        const selected = button.dataset.storeCategory === category;
        button.setAttribute("aria-pressed", String(selected));
      });
    };

    input?.addEventListener("input", render);
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        category = button.dataset.storeCategory;
        render();
      });
    });

    render();
  }

  function initPlanDirectory() {
    const list = document.querySelector("[data-plan-store-list]");
    const input = document.querySelector("[data-plan-search]");
    const count = document.querySelector("[data-plan-count]");
    if (!list || !input || !Array.isArray(window.SANDOWN_STORES)) return;

    const initialStore = new URLSearchParams(window.location.search).get("store");
    if (initialStore) input.value = initialStore;

    const render = () => {
      const term = input.value.trim().toLowerCase();
      const filtered = window.SANDOWN_STORES.filter((store) =>
        `${store.name} ${store.category} ${store.shop}`.toLowerCase().includes(term)
      );
      list.innerHTML = filtered.map((store) => `
        <li>
          <span class="plan-shop">${escapeHtml(store.shop)}</span>
          <span><strong>${escapeHtml(store.name)}</strong><small>${escapeHtml(store.category)}</small></span>
        </li>`).join("");
      count.textContent = `${filtered.length} ${filtered.length === 1 ? "match" : "matches"}`;
      list.parentElement.classList.toggle("is-empty", filtered.length === 0);
    };

    input.addEventListener("input", render);
    render();
  }

  function initFloorPlan() {
    const viewport = document.querySelector("[data-plan-viewport]");
    const image = document.querySelector("[data-plan-image]");
    const value = document.querySelector("[data-zoom-value]");
    if (viewport && image && value) {
      let zoom = 1;
      const update = () => {
        image.style.width = `${zoom * 100}%`;
        value.textContent = `${Math.round(zoom * 100)}%`;
        document.querySelector("[data-zoom-out]")?.toggleAttribute("disabled", zoom <= 1);
        document.querySelector("[data-zoom-in]")?.toggleAttribute("disabled", zoom >= 2.5);
      };
      document.querySelector("[data-zoom-in]")?.addEventListener("click", () => {
        zoom = Math.min(2.5, +(zoom + 0.25).toFixed(2));
        update();
      });
      document.querySelector("[data-zoom-out]")?.addEventListener("click", () => {
        zoom = Math.max(1, +(zoom - 0.25).toFixed(2));
        update();
      });
      document.querySelector("[data-zoom-reset]")?.addEventListener("click", () => {
        zoom = 1;
        viewport.scrollTo({ top: 0, left: 0, behavior: "smooth" });
        update();
      });
      update();
    }

    const dialog = document.querySelector("[data-plan-dialog]");
    const open = document.querySelector("[data-plan-open]");
    const close = document.querySelector("[data-plan-close]");
    if (dialog && open && close && typeof dialog.showModal === "function") {
      open.addEventListener("click", () => dialog.showModal());
      close.addEventListener("click", () => dialog.close());
      dialog.addEventListener("click", (event) => {
        if (event.target === dialog) dialog.close();
      });
    }
  }

  function initMailForms() {
    document.querySelectorAll("form[data-mailto]").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!form.reportValidity()) return;

        const recipient = form.dataset.mailto;
        const subject = form.dataset.subject || "Website enquiry";
        const values = [...new FormData(form).entries()]
          .filter(([, value]) => String(value).trim())
          .map(([key, value]) => `${key.replaceAll("-", " ").replace(/^./, (char) => char.toUpperCase())}: ${value}`)
          .join("\n");
        const status = form.querySelector("[data-form-status]");
        if (status) status.textContent = "Your email app is opening with the enquiry details filled in.";
        window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(values)}`;
      });
    });
  }

  function initReveals() {
    const items = [...document.querySelectorAll(".reveal")];
    if (!items.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px" });
    items.forEach((item) => observer.observe(item));
  }

  resolveInternalLinks();
  renderShell();
  initMenu();
  initDirectory();
  initPlanDirectory();
  initFloorPlan();
  initMailForms();
  initReveals();
})();
