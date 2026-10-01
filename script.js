(function () {
  "use strict";

  var STORAGE_KEY = "rhythm-theme";

  var root = document.documentElement;
  var themeToggle = document.getElementById("themeToggle");
  var navToggle = document.getElementById("navToggle");
  var mobileNav = document.getElementById("mobileNav");
  var newsletterForm = document.getElementById("newsletterForm");
  var newsletterMessage = document.getElementById("newsletterMessage");

  function getSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function setStoredTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      /* ignore */
    }
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (themeToggle) {
      var isDark = theme === "dark";
      themeToggle.setAttribute("aria-pressed", String(isDark));
      themeToggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light mode" : "Switch to dark mode"
      );
    }
  }

  function initTheme() {
    var saved = getStoredTheme();
    var theme = saved === "dark" || saved === "light" ? saved : getSystemTheme();
    applyTheme(theme);

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
      if (!getStoredTheme()) {
        applyTheme(e.matches ? "dark" : "light");
      }
    });
  }

  function toggleTheme() {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    setStoredTheme(next);
  }

  function setMobileNavOpen(open) {
    if (!navToggle || !mobileNav) return;
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    mobileNav.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
  }

  function closeMobileNav() {
    setMobileNavOpen(false);
  }

  function initNav() {
    if (themeToggle) {
      themeToggle.addEventListener("click", toggleTheme);
    }

    if (navToggle && mobileNav) {
      navToggle.addEventListener("click", function () {
        var open = navToggle.getAttribute("aria-expanded") === "true";
        setMobileNavOpen(!open);
      });

      mobileNav.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", closeMobileNav);
      });

      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeMobileNav();
      });
    }

    var header = document.querySelector(".site-header");
    if (header) {
      header.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener("click", function (e) {
          var id = anchor.getAttribute("href");
          if (!id || id === "#") return;
          var target = document.querySelector(id);
          if (!target) return;
          e.preventDefault();
          closeMobileNav();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          history.pushState(null, "", id);
        });
      });
    }
  }

  function initNewsletter() {
    if (!newsletterForm || !newsletterMessage) return;

    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = newsletterForm.querySelector('input[type="email"]');
      if (!input || !input.value.trim()) return;

      newsletterMessage.hidden = false;
      newsletterMessage.textContent =
        "Thanks — newsletter signup can be connected to your email provider when you're ready.";
      input.value = "";
    });
  }

  function initContributionGraph() {
    var graph = document.querySelector(".github-contribution-graph");
    if (!graph) return;

    var encodedLevels = graph.getAttribute("data-levels");
    if (!encodedLevels) return;

    var fragment = document.createDocumentFragment();
    encodedLevels.split(",").forEach(function (segment) {
      var parts = segment.split(":");
      var count = Number(parts[0]);
      var level = Number(parts[1]);

      if (!Number.isInteger(count) || !Number.isInteger(level)) return;

      for (var i = 0; i < count; i += 1) {
        var day = document.createElement("span");
        day.className = "github-contribution-day";
        day.setAttribute("data-level", String(level));
        fragment.appendChild(day);
      }
    });

    graph.appendChild(fragment);
  }

  function initWorkHoverImg() {
    var container = document.getElementById("workHover");
    if (!container || typeof gsap === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(max-width: 768px)").matches) return;

    var projectThumbnail = container.querySelector(".hover-img-thumbnail-wrapper");
    var projectsContainer = container.querySelector(".hover-img-projects");
    if (!projectThumbnail || !projectsContainer) return;

    var projectElements = gsap.utils.toArray(".hover-img-project", projectsContainer);
    var thumbnails = gsap.utils.toArray(".hover-img-thumbnail", projectThumbnail);
    var isContained = container.classList.contains("is-contained");
    var xTo = null;
    var yTo = null;

    gsap.set(projectThumbnail, { scale: 0, xPercent: -50, yPercent: -50 });

    xTo = gsap.quickTo(projectThumbnail, "x", { duration: 0.4, ease: "power3.out" });
    yTo = gsap.quickTo(projectThumbnail, "y", { duration: 0.4, ease: "power3.out" });

    function handleMouseMove(e) {
      var x = e.clientX;
      var y = e.clientY;

      if (isContained) {
        var rect = container.getBoundingClientRect();
        var halfWidth = projectThumbnail.offsetWidth / 2;
        var halfHeight = projectThumbnail.offsetHeight / 2;
        var inset = 16;
        x = Math.max(
          halfWidth + inset,
          Math.min(rect.width - halfWidth - inset, e.clientX - rect.left)
        );
        y = Math.max(
          halfHeight + inset,
          Math.min(rect.height - halfHeight - inset, e.clientY - rect.top)
        );
      }

      xTo(x);
      yTo(y);
    }

    function handleMouseLeave() {
      gsap.to(projectThumbnail, {
        scale: 0,
        duration: 0.3,
        ease: "power2.out",
        overwrite: "auto",
      });
    }

    projectsContainer.addEventListener("mousemove", handleMouseMove);
    projectsContainer.addEventListener("mouseleave", handleMouseLeave);

    projectElements.forEach(function (project, index) {
      project.addEventListener("mouseenter", function () {
        gsap.to(projectThumbnail, {
          scale: 1,
          duration: 0.4,
          ease: "power2.out",
          overwrite: "auto",
        });

        gsap.to(thumbnails, {
          yPercent: -100 * index,
          duration: 0.4,
          ease: "power2.out",
          overwrite: "auto",
        });
      });
    });
  }

  function onReady() {
    initWorkHoverImg();
  }

  initTheme();
  initNav();
  initNewsletter();
  initContributionGraph();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }
})();
