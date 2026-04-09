(() => {
  const compactMedia = window.matchMedia("(max-width: 991.98px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobilePressClass = "mobile-press";

  const setLiquidFrame = (liquid, x, y, width, height, opacity = 1) => {
    liquid.style.width = `${width}px`;
    liquid.style.height = `${height}px`;
    liquid.style.opacity = `${opacity}`;
    liquid.style.transform = `translate3d(${x - width / 2}px, ${y - height / 2}px, 0)`;
  };

  const moveToLink = (shell, liquid, link, opacity = 0.92) => {
    if (!link) {
      return;
    }

    const shellRect = shell.getBoundingClientRect();
    const rect = link.getBoundingClientRect();
    const width = rect.width + 20;
    const height = Math.max(rect.height + 12, compactMedia.matches ? 48 : 54);
    const x = rect.left - shellRect.left + rect.width / 2;
    const y = rect.top - shellRect.top + rect.height / 2;

    setLiquidFrame(liquid, x, y, width, height, opacity);
  };

  const attachNavbarLiquid = (shell) => {
    if (shell.dataset.navLiquidReady === "true") {
      shell.dispatchEvent(new CustomEvent("nav-liquid:refresh"));
      return;
    }

    shell.dataset.navLiquidReady = "true";

    const collapse = shell.querySelector(".navbar-collapse");
    const links = Array.from(shell.querySelectorAll(".nav-link"));

    if (!collapse || links.length === 0) {
      return;
    }

    const liquid = document.createElement("span");
    liquid.className = "nav-liquid";
    liquid.setAttribute("aria-hidden", "true");
    shell.prepend(liquid);

    const activeLink = () =>
      shell.querySelector(".nav-link.active") || shell.querySelector(".nav-link");

    const clearMobilePress = () => {
      links.forEach((item) => {
        item.classList.remove(mobilePressClass);

        if (item.__mobilePressTimeout) {
          window.clearTimeout(item.__mobilePressTimeout);
          item.__mobilePressTimeout = null;
        }
      });
    };

    const pulseMobileLink = (link) => {
      if (!compactMedia.matches || !link) {
        return;
      }

      clearMobilePress();
      link.classList.add(mobilePressClass);
      link.__mobilePressTimeout = window.setTimeout(() => {
        link.classList.remove(mobilePressClass);
        link.__mobilePressTimeout = null;
      }, 220);
    };

    const settle = () => {
      if (compactMedia.matches) {
        const shellRect = shell.getBoundingClientRect();

        setLiquidFrame(
          liquid,
          shellRect.width / 2,
          shellRect.height / 2,
          112,
          48,
          0,
        );
        return;
      }

      const current = activeLink();

      if (current) {
        moveToLink(shell, liquid, current, compactMedia.matches ? 0.78 : 0.88);
      } else {
        const shellRect = shell.getBoundingClientRect();
        setLiquidFrame(
          liquid,
          shellRect.width / 2,
          compactMedia.matches ? 42 : 36,
          compactMedia.matches ? 108 : 118,
          compactMedia.matches ? 48 : 54,
          0.4,
        );
      }
    };

    links.forEach((link) => {
      link.addEventListener("pointerenter", () => {
        if (compactMedia.matches) {
          return;
        }

        moveToLink(shell, liquid, link, 0.98);
      });

      link.addEventListener("focus", () => {
        if (compactMedia.matches) {
          pulseMobileLink(link);
          return;
        }

        moveToLink(shell, liquid, link, 0.98);
      });

      link.addEventListener("pointerdown", () => {
        if (compactMedia.matches) {
          pulseMobileLink(link);
          return;
        }

        moveToLink(shell, liquid, link, 1);
      });

      link.addEventListener("touchstart", () => pulseMobileLink(link), { passive: true });
    });

    shell.addEventListener("pointermove", (event) => {
      if (reducedMotion.matches) {
        return;
      }

      if (compactMedia.matches) {
        return;
      }

      const hoveredLink = event.target.closest(".nav-link");

      if (hoveredLink) {
        moveToLink(shell, liquid, hoveredLink, 1);
      }
    });

    shell.addEventListener("pointerleave", settle);
    shell.addEventListener("touchstart", (event) => {
      if (compactMedia.matches) {
        return;
      }

      const touch = event.touches[0];

      if (!touch) {
        return;
      }

      const touched = document.elementFromPoint(touch.clientX, touch.clientY)?.closest(".nav-link");

      if (touched) {
        moveToLink(shell, liquid, touched, 1);
      }
    }, { passive: true });

    shell.addEventListener("touchmove", (event) => {
      if (reducedMotion.matches) {
        return;
      }

      if (compactMedia.matches) {
        return;
      }

      const touch = event.touches[0];

      if (!touch) {
        return;
      }

      const touched = document.elementFromPoint(touch.clientX, touch.clientY)?.closest(".nav-link");

      if (touched) {
        moveToLink(shell, liquid, touched, 1);
      }
    }, { passive: true });

    shell.addEventListener("touchend", settle, { passive: true });
    shell.addEventListener("touchcancel", settle, { passive: true });
    collapse.addEventListener("shown.bs.collapse", () => requestAnimationFrame(settle));
    collapse.addEventListener("hidden.bs.collapse", () => {
      clearMobilePress();
      requestAnimationFrame(settle);
    });
    window.addEventListener("resize", settle);
    window.addEventListener("load", settle, { once: true });

    if (document.fonts?.ready) {
      document.fonts.ready.then(settle);
    }

    requestAnimationFrame(settle);

    shell.addEventListener("nav-liquid:refresh", settle);
    shell.__navLiquidSettle = settle;
  };

  document.querySelectorAll(".navbar .container-wide").forEach(attachNavbarLiquid);
})();
