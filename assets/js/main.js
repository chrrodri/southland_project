// Southland Building and Remodel — modern static-site behavior.
// Uses: IntersectionObserver, the Popover API (with fallback), the native
// <dialog> element, the View Transitions API, the Web Share / Clipboard
// APIs, the FormData / Constraint Validation APIs, and a Service Worker.

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function withViewTransition(update) {
  if (prefersReducedMotion || typeof document.startViewTransition !== "function") {
    update();
    return;
  }
  document.startViewTransition(update);
}

/* ----------------------------- Header state ----------------------------- */

const header = document.querySelector("[data-header]");

if (header) {
  const sentinel = document.createElement("div");
  sentinel.setAttribute("aria-hidden", "true");
  sentinel.style.cssText = "position:absolute; top:0; left:0; height:18px; width:1px;";
  document.body.prepend(sentinel);

  if ("IntersectionObserver" in window) {
    const headerObserver = new IntersectionObserver(
      ([entry]) => header.classList.toggle("scrolled", !entry.isIntersecting),
      { threshold: 0 }
    );
    headerObserver.observe(sentinel);
  } else {
    const syncHeader = () => header.classList.toggle("scrolled", window.scrollY > 18);
    window.addEventListener("scroll", syncHeader, { passive: true });
    syncHeader();
  }
}

/* -------------------------------- Nav menu ------------------------------- */

const navToggle = document.getElementById("nav-toggle");
const siteNav = document.getElementById("site-nav");
const supportsPopover = navToggle && siteNav && "popover" in HTMLElement.prototype;

function closeLegacyNav() {
  header?.classList.remove("open");
  navToggle?.setAttribute("aria-expanded", "false");
}

if (supportsPopover) {
  // Progressive enhancement: only turn the nav into a popover on narrow
  // viewports, where it behaves as a dismissible menu. On wider viewports
  // it stays a normal, always-visible <nav> with no popover semantics.
  const mql = window.matchMedia("(max-width: 720px)");

  const applyPopoverMode = (isNarrow) => {
    if (isNarrow) {
      siteNav.setAttribute("popover", "auto");
      navToggle.setAttribute("popovertarget", "site-nav");
      navToggle.removeAttribute("aria-expanded");
    } else {
      if (siteNav.hasAttribute("popover")) {
        try {
          siteNav.hidePopover();
        } catch {
          /* not open, ignore */
        }
      }
      siteNav.removeAttribute("popover");
      navToggle.removeAttribute("popovertarget");
    }
  };

  applyPopoverMode(mql.matches);
  mql.addEventListener("change", (event) => applyPopoverMode(event.matches));

  siteNav.addEventListener("toggle", (event) => {
    navToggle.setAttribute("aria-expanded", String(event.newState === "open"));
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (siteNav.matches(":popover-open")) siteNav.hidePopover();
    });
  });
} else if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeLegacyNav);
  });
}

/* ------------------------------ Reveal on view ---------------------------- */

const supportsScrollTimeline = CSS.supports("animation-timeline: view()");

if (!supportsScrollTimeline && "IntersectionObserver" in window && !prefersReducedMotion) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll(".reveal").forEach((section) => {
    section.dataset.observe = "true";
    revealObserver.observe(section);
  });
}

/* --------------------------- Project filtering ---------------------------- */

const filters = document.querySelectorAll("[data-filter]");
const cards = document.querySelectorAll(".project-card");

filters.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    withViewTransition(() => {
      filters.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");

      cards.forEach((card) => {
        const show = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("hidden", !show);
      });
    });
  });
});

/* ------------------------------ Project modal ------------------------------ */

const modal = document.querySelector("[data-modal]");
const modalImage = document.querySelector("[data-modal-image]");
const modalTitle = document.querySelector("[data-modal-title]");
const closeModalButton = document.querySelector("[data-close-modal]");
const shareButton = document.querySelector("[data-modal-share]");

if (modal && typeof modal.showModal === "function") {
  const canShare = typeof navigator.share === "function";
  const canCopy = navigator.clipboard && typeof navigator.clipboard.writeText === "function";
  if (shareButton && (canShare || canCopy)) shareButton.hidden = false;

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      modalImage.src = card.dataset.image;
      modalImage.alt = card.dataset.title;
      modalTitle.textContent = card.dataset.title;
      modal.showModal();
    });
  });

  closeModalButton?.addEventListener("click", () => modal.close());

  // Clicking the ::backdrop fires a click with target === the dialog itself.
  modal.addEventListener("click", (event) => {
    if (event.target === modal) modal.close();
  });

  modal.addEventListener("close", () => {
    modalImage.removeAttribute("src");
  });

  shareButton?.addEventListener("click", async () => {
    const shareData = {
      title: `${modalTitle.textContent} — Southland Building and Remodel`,
      text: "A remodeling project from Southland Building and Remodel in Los Angeles.",
      url: `${location.origin}${location.pathname}#projects`,
    };

    try {
      if (canShare) {
        await navigator.share(shareData);
      } else if (canCopy) {
        await navigator.clipboard.writeText(shareData.url);
        shareButton.textContent = "Link copied";
        setTimeout(() => (shareButton.textContent = "Share this project"), 2000);
      }
    } catch {
      /* user cancelled the share sheet — nothing to do */
    }
  });
}

/* --------------------------------- Form ----------------------------------- */

const leadForm = document.querySelector("[data-lead-form]");
const formStatus = document.querySelector("[data-form-status]");

leadForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!leadForm.reportValidity()) return;

  const data = new FormData(leadForm);
  const lines = [
    `Name: ${data.get("name")}`,
    `Email: ${data.get("email")}`,
    `Project type: ${data.get("project_type")}`,
    "",
    String(data.get("message")),
  ];

  const params = new URLSearchParams({
    subject: `Project inquiry — ${data.get("project_type")}`,
    body: lines.join("\n"),
  });

  window.location.href = `mailto:SLBR323@GMAIL.COM?${params.toString()}`;

  if (formStatus) {
    formStatus.textContent = "Opening your email app to send this request…";
  }
});

/* ---------------------------- Service worker ------------------------------ */

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {
      /* offline caching is an enhancement, not a requirement */
    });
  });
}
