/* Carmelina Santoro Designs — light progressive enhancement.
   Everything here is optional: the site is fully readable with JS disabled. */
(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");

  /* --- current year in footer --- */
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* --- mobile nav toggle --- */
  var toggle = document.querySelector(".nav__toggle");
  var links = document.getElementById("nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        links.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* --- contact form (Web3Forms — no backend needed) --- */
  var form = document.querySelector(".contact-form");
  if (form) {
    var statusEl = form.querySelector(".form-status");
    var setStatus = function (msg, state) {
      if (!statusEl) return;
      statusEl.textContent = msg || "";
      if (state) statusEl.setAttribute("data-state", state);
      else statusEl.removeAttribute("data-state");
    };
    var markField = function (input, invalid) {
      var wrap = input.closest(".form-field");
      if (wrap) wrap.classList.toggle("has-error", invalid);
    };
    // clear a field's error as soon as it becomes valid again
    form.addEventListener("input", function (e) {
      var f = e.target;
      if (f.matches("input, textarea") && f.checkValidity()) markField(f, false);
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var required = form.querySelectorAll("input[required], textarea[required]");
      var firstBad = null;
      required.forEach(function (f) {
        var ok = f.checkValidity();
        markField(f, !ok);
        if (!ok && !firstBad) firstBad = f;
      });
      if (firstBad) {
        setStatus("Please complete the highlighted fields.", "error");
        firstBad.focus();
        return;
      }
      var btn = form.querySelector("button[type=submit]");
      var label = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
      setStatus("", null);
      var payload = Object.fromEntries(new FormData(form).entries());
      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (r) { return r.json(); })
        .then(function (json) {
          if (json && json.success) {
            form.reset();
            setStatus("Thank you — your message has been sent.", "success");
          } else {
            throw new Error((json && json.message) || "Submission failed");
          }
        })
        .catch(function () {
          setStatus("Sorry, something went wrong. Please email carmelinasantoro@gmail.com directly.", "error");
        })
        .then(function () {
          if (btn) { btn.disabled = false; btn.textContent = label; }
        });
    });
  }

  /* --- Approach: scroll-linked, sticky-pinned clip reveal --- */
  var approach = document.querySelector(".approach");
  if (approach) {
    var track = approach.querySelector(".approach__track");
    var layers = Array.prototype.slice.call(approach.querySelectorAll(".approach__layer"));
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (track && layers.length > 1 && !reduce) {
      approach.classList.add("is-enhanced");
      var ticking = false;
      var render = function () {
        ticking = false;
        var top = track.getBoundingClientRect().top;
        var total = track.offsetHeight - window.innerHeight;
        var p = total > 0 ? Math.min(1, Math.max(0, -top / total)) : 0;
        var T = layers.length - 1;          // number of wipe transitions
        var head = 0.06, span = 1 - head - 0.06;
        var seg = span / T;
        for (var i = 0; i < layers.length; i++) {
          if (i === 0) { layers[i].style.clipPath = "inset(0 0 0 0)"; layers[i].style.setProperty("--rev", 1); continue; }
          var local = Math.min(1, Math.max(0, (p - (head + (i - 1) * seg)) / seg));
          layers[i].style.clipPath = "inset(" + ((1 - local) * 100) + "% 0 0 0)";
          layers[i].style.setProperty("--rev", local.toFixed(3));
        }
      };
      var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(render); } };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      render();
    }
  }

  /* --- Selected projects: client-side category filter --- */
  var gallery = document.getElementById("project-gallery");
  var filterBar = document.querySelector(".gallery-filter");
  if (gallery && filterBar) {
    var buttons = Array.prototype.slice.call(filterBar.querySelectorAll(".gallery-filter__btn"));
    var tiles = Array.prototype.slice.call(gallery.querySelectorAll(".gallery-tile"));
    var VALID = { all: 1, residential: 1, hospitality: 1, retail: 1 };
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* Show/hide tiles for a category. Matching tiles are forced visible
       (is-in) so they never depend on the scroll-reveal observer once the
       gallery has been reflowed by a filter. */
    var swapTiles = function (cat) {
      tiles.forEach(function (tile) {
        /* data-hide-all tiles are excluded from the 'All' view but still
           appear when their own category filter is active. */
        var match = cat === "all"
          ? tile.getAttribute("data-hide-all") !== "true"
          : tile.getAttribute("data-category") === cat;
        tile.hidden = !match;
        if (match) tile.classList.add("is-in");
      });
    };

    var applyFilter = function (cat, animate) {
      buttons.forEach(function (b) {
        var on = b.getAttribute("data-filter") === cat;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      if (reduceMotion || animate === false) {
        swapTiles(cat);
        return;
      }
      /* cross-fade: fade the grid out, reflow while invisible, fade back in */
      gallery.classList.add("is-switching");
      window.setTimeout(function () {
        swapTiles(cat);
        requestAnimationFrame(function () { gallery.classList.remove("is-switching"); });
      }, 220);
    };

    filterBar.addEventListener("click", function (e) {
      var btn = e.target.closest(".gallery-filter__btn");
      if (btn) applyFilter(btn.getAttribute("data-filter"), true);
    });

    /* deep-link support: nav submenu points at #residential / #hospitality /
       #retail; apply the matching filter on load (no fade) and on hash change. */
    var syncFromHash = function (initial) {
      var h = (location.hash || "").replace(/^#/, "");
      if (VALID[h]) applyFilter(h, !initial);
    };
    window.addEventListener("hashchange", function () { syncFromHash(false); });
    syncFromHash(true);
  }

  /* --- project image lightbox ---
     On project pages, clicking any hero/gallery image opens it full-screen.
     Progressive enhancement: with JS off the images simply stay inline. */
  var lbScopes = document.querySelectorAll(".project-hero, .project-gallery, .locations");
  if (lbScopes.length) {
    var lbImgs = [];
    lbScopes.forEach(function (scope) {
      Array.prototype.forEach.call(scope.querySelectorAll("img"), function (img) {
        lbImgs.push(img);
      });
    });
  }
  if (lbScopes.length && lbImgs.length) {
    var lbOverlay = null;
    var lbFigure = null;
    var lbImage = null;
    var lbCaption = null;
    var lbPrevBtn = null;
    var lbNextBtn = null;
    var lbLastFocus = null;
    var lbIndex = -1;

    var buildOverlay = function () {
      lbOverlay = document.createElement("div");
      lbOverlay.className = "lightbox";
      lbOverlay.setAttribute("role", "dialog");
      lbOverlay.setAttribute("aria-modal", "true");
      lbOverlay.setAttribute("aria-label", "Image viewer");
      lbOverlay.hidden = true;

      var closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.className = "lightbox__close";
      closeBtn.setAttribute("aria-label", "Close image");
      closeBtn.innerHTML = "×";

      lbPrevBtn = document.createElement("button");
      lbPrevBtn.type = "button";
      lbPrevBtn.className = "lightbox__nav lightbox__nav--prev";
      lbPrevBtn.setAttribute("aria-label", "Previous image");
      lbPrevBtn.innerHTML = "‹"; /* ‹ */

      lbNextBtn = document.createElement("button");
      lbNextBtn.type = "button";
      lbNextBtn.className = "lightbox__nav lightbox__nav--next";
      lbNextBtn.setAttribute("aria-label", "Next image");
      lbNextBtn.innerHTML = "›"; /* › */

      lbFigure = document.createElement("figure");
      lbFigure.className = "lightbox__figure";
      lbImage = document.createElement("img");
      lbImage.className = "lightbox__img";
      lbImage.alt = "";
      lbCaption = document.createElement("figcaption");
      lbCaption.className = "lightbox__caption";
      lbFigure.appendChild(lbImage);
      lbFigure.appendChild(lbCaption);

      lbOverlay.appendChild(closeBtn);
      lbOverlay.appendChild(lbPrevBtn);
      lbOverlay.appendChild(lbNextBtn);
      lbOverlay.appendChild(lbFigure);
      document.body.appendChild(lbOverlay);

      closeBtn.addEventListener("click", closeLightbox);
      /* arrows step through images without closing */
      lbPrevBtn.addEventListener("click", function (e) { e.stopPropagation(); showAt(lbIndex - 1); });
      lbNextBtn.addEventListener("click", function (e) { e.stopPropagation(); showAt(lbIndex + 1); });
      /* click on the backdrop or the image closes it */
      lbOverlay.addEventListener("click", closeLightbox);
    };

    /* show the image at position i, wrapping around at either end */
    var showAt = function (i) {
      if (!lbImgs.length) return;
      lbIndex = (i + lbImgs.length) % lbImgs.length;
      var img = lbImgs[lbIndex];
      lbImage.src = img.currentSrc || img.src;
      lbImage.alt = img.alt || "";
      lbCaption.textContent = img.alt || "";
      lbCaption.hidden = !img.alt;
      var solo = lbImgs.length < 2;
      lbPrevBtn.hidden = solo;
      lbNextBtn.hidden = solo;
    };

    var openLightbox = function (i) {
      if (!lbOverlay) buildOverlay();
      lbLastFocus = document.activeElement;
      showAt(i);
      lbOverlay.hidden = false;
      document.documentElement.classList.add("lightbox-open");
      lbOverlay.querySelector(".lightbox__close").focus();
    };

    var closeLightbox = function () {
      if (!lbOverlay || lbOverlay.hidden) return;
      lbOverlay.hidden = true;
      document.documentElement.classList.remove("lightbox-open");
      lbImage.removeAttribute("src");
      if (lbLastFocus && typeof lbLastFocus.focus === "function") lbLastFocus.focus();
    };

    lbImgs.forEach(function (img, i) {
      img.classList.add("is-zoomable");
      img.setAttribute("tabindex", "0");
      img.setAttribute("role", "button");
      if (!img.getAttribute("aria-label")) {
        img.setAttribute("aria-label", (img.alt ? img.alt + " — " : "") + "view larger");
      }
      img.addEventListener("click", function () { openLightbox(i); });
      img.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLightbox(i);
        }
      });
    });

    document.addEventListener("keydown", function (e) {
      if (!lbOverlay || lbOverlay.hidden) return;
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowRight") { e.preventDefault(); showAt(lbIndex + 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); showAt(lbIndex - 1); }
    });
  }

  /* --- subtle scroll reveals --- */
  var reveals = document.querySelectorAll(".reveal");
  if (!reveals.length) return;
  if (!("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  reveals.forEach(function (el) { io.observe(el); });
})();
