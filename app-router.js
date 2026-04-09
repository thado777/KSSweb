(() => {
  if (window.__atomRouterReady || window.location.protocol === "file:") {
    return;
  }

  window.__atomRouterReady = true;

  const parser = new DOMParser();
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const routeFiles = new Set([
    "atommainpage.html",
    "atomguide.html",
    "atomskillpage.html",
    "atompatchnote.html",
    "atomstory.html",
  ]);
  const pageCache = new Map();

  const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

  const getRouteUrl = (href) => {
    try {
      const url = new URL(href, window.location.href);
      const fileName = url.pathname.split("/").pop();

      if (url.origin !== window.location.origin || !routeFiles.has(fileName)) {
        return null;
      }

      return url;
    } catch {
      return null;
    }
  };

  const getRouteFile = (url) => url.pathname.split("/").pop() || "atommainpage.html";

  const getPageStyleLink = () => document.querySelector("link[data-page-style]");

  const ensureBackdrop = () => {
    let backdrop = document.querySelector(".page-backdrop");

    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.className = "page-backdrop";
      backdrop.setAttribute("aria-hidden", "true");
      document.body.insertBefore(backdrop, document.body.firstChild);
    }

    return backdrop;
  };

  const ensureHomeBackdropMarkup = () => {
    const backdrop = ensureBackdrop();

    if (backdrop.querySelector(".video-background")) {
      return backdrop;
    }

    const videoSrc = document.body.dataset.homeVideoSrc;

    if (!videoSrc) {
      return backdrop;
    }

    backdrop.innerHTML = [
      '<video class="video-background" muted loop playsinline preload="metadata">',
      `  <source src="${videoSrc}" type="video/mp4">`,
      "</video>",
      '<div class="video-overlay"></div>',
    ].join("");

    return backdrop;
  };

  const syncBackdrop = async (isHomePage) => {
    const backdrop = ensureBackdrop();
    const video = backdrop.querySelector(".video-background");

    if (!isHomePage) {
      if (video) {
        video.pause();
      }

      return;
    }

    const homeBackdrop = ensureHomeBackdropMarkup();
    const homeVideo = homeBackdrop.querySelector(".video-background");

    if (!homeVideo) {
      return;
    }

    homeVideo.muted = true;
    homeVideo.autoplay = true;

    try {
      await homeVideo.play();
    } catch {
      // Ignore autoplay failures; the page still works without motion.
    }
  };

  const fetchPageDocument = async (url) => {
    const cacheKey = url.href;

    if (!pageCache.has(cacheKey)) {
      pageCache.set(
        cacheKey,
        fetch(cacheKey, { credentials: "same-origin" })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Failed to fetch ${cacheKey}`);
            }

            return response.text();
          })
          .then((html) => parser.parseFromString(html, "text/html")),
      );
    }

    return pageCache.get(cacheKey);
  };

  const updatePageStyle = async (href) => {
    if (!href) {
      return;
    }

    let styleLink = getPageStyleLink();

    if (!styleLink) {
      styleLink = document.createElement("link");
      styleLink.rel = "stylesheet";
      styleLink.setAttribute("data-page-style", "");
      document.head.append(styleLink);
    }

    if (styleLink.getAttribute("href") === href) {
      return;
    }

    await new Promise((resolve) => {
      const complete = () => resolve();

      styleLink.addEventListener("load", complete, { once: true });
      styleLink.addEventListener("error", complete, { once: true });
      styleLink.setAttribute("href", href);
    });
  };

  const updateBodyState = (nextBody) => {
    document.body.classList.toggle("home-page", nextBody.classList.contains("home-page"));

    if (nextBody.dataset.homeVideoSrc) {
      document.body.dataset.homeVideoSrc = nextBody.dataset.homeVideoSrc;
    }
  };

  const updateActiveNav = (targetFile) => {
    document.querySelectorAll(".navbar .nav-link").forEach((link) => {
      const href = link.getAttribute("href");
      const url = href ? getRouteUrl(href) : null;
      const isActive = Boolean(url) && getRouteFile(url) === targetFile;

      link.classList.toggle("active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    const shell = document.querySelector(".navbar .container-wide");
    shell?.dispatchEvent(new CustomEvent("nav-liquid:refresh"));
  };

  const closeMobileNav = () => {
    const collapse = document.querySelector(".navbar-collapse");

    if (!collapse?.classList.contains("show") || !window.bootstrap?.Collapse) {
      return;
    }

    window.bootstrap.Collapse.getOrCreateInstance(collapse, { toggle: false }).hide();
  };

  const replaceMainContent = (nextDocument) => {
    const currentMain = document.querySelector("main");
    const nextMainSource = nextDocument.querySelector("main");

    if (!currentMain || !nextMainSource) {
      throw new Error("Main content is missing.");
    }

    const nextMain = document.importNode(nextMainSource, true);
    nextMain.classList.add("route-is-entering");
    currentMain.replaceWith(nextMain);

    window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        nextMain.classList.remove("route-is-entering");
      }, reducedMotion.matches ? 0 : 340);
    });
  };

  let navigationToken = 0;

  const navigateTo = async (url, { replaceHistory = false } = {}) => {
    if (getRouteFile(url) === getRouteFile(new URL(window.location.href)) && url.hash === window.location.hash) {
      closeMobileNav();
      updateActiveNav(getRouteFile(url));
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: reducedMotion.matches ? "auto" : "smooth",
      });
      return;
    }

    const token = ++navigationToken;
    const currentMain = document.querySelector("main");
    currentMain?.classList.add("route-is-switching");
    closeMobileNav();

    if (!reducedMotion.matches) {
      await wait(120);
    }

    try {
      const nextDocument = await fetchPageDocument(url);

      if (token !== navigationToken) {
        return;
      }

      const nextStyleHref = nextDocument.querySelector("link[data-page-style]")?.getAttribute("href");
      await updatePageStyle(nextStyleHref);

      if (token !== navigationToken) {
        return;
      }

      updateBodyState(nextDocument.body);
      replaceMainContent(nextDocument);
      document.title = nextDocument.title || document.title;
      updateActiveNav(getRouteFile(url));
      await syncBackdrop(document.body.classList.contains("home-page"));

      window.scrollTo({ top: 0, left: 0, behavior: "auto" });

      if (replaceHistory) {
        history.replaceState({ route: url.href }, "", url.href);
      } else {
        history.pushState({ route: url.href }, "", url.href);
      }

      document.dispatchEvent(
        new CustomEvent("app:navigation-end", {
          detail: { route: getRouteFile(url) },
        }),
      );
    } catch {
      window.location.href = url.href;
    }
  };

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");

    if (!link) {
      return;
    }

    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      link.target === "_blank" ||
      link.hasAttribute("download") ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const href = link.getAttribute("href");
    const url = href ? getRouteUrl(href) : null;

    if (!url) {
      return;
    }

    event.preventDefault();
    navigateTo(url);
  });

  document.addEventListener("pointerenter", (event) => {
    const link = event.target.closest("a[href]");
    const href = link?.getAttribute("href");
    const url = href ? getRouteUrl(href) : null;

    if (url) {
      fetchPageDocument(url).catch(() => {});
    }
  }, true);

  document.addEventListener("focusin", (event) => {
    const link = event.target.closest("a[href]");
    const href = link?.getAttribute("href");
    const url = href ? getRouteUrl(href) : null;

    if (url) {
      fetchPageDocument(url).catch(() => {});
    }
  });

  window.addEventListener("popstate", () => {
    const url = getRouteUrl(window.location.href);

    if (url) {
      navigateTo(url, { replaceHistory: true });
    }
  });

  history.replaceState({ route: window.location.href }, "", window.location.href);
  updateActiveNav(getRouteFile(new URL(window.location.href)));
  syncBackdrop(document.body.classList.contains("home-page"));
})();
