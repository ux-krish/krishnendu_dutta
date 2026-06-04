/* ============================================
   KRISHNENDU DUTTA — PORTFOLIO INTERACTIONS
   GSAP · ScrollTrigger · Lenis · Custom Cursor
   ============================================ */

(() => {
  "use strict";

  // ---------- Helpers ----------
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const isTouch = matchMedia("(hover: none)").matches || window.innerWidth < 900;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Footer year ----------
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Live clock (Kolkata, IST) ----------
  const clockEl = $("#liveClock");
  if (clockEl) {
    const tick = () => {
      const t = new Date().toLocaleTimeString("en-GB", {
        timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false
      });
      clockEl.textContent = `${t} IST`;
    };
    tick(); setInterval(tick, 30_000);
  }

  // ---------- Custom cursor ----------
  const cursor = $(".cursor");
  const dot = $(".cursor__dot");
  const ring = $(".cursor__ring");
  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let ringX = mouseX, ringY = mouseY;

  if (cursor && !isTouch) {
    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    }, { passive: true });

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(animateRing);
    };
    animateRing();

    // hover / magnetic states
    const hoverables = "a, button, .project, .skill-card, .stat, .nav__link, [data-magnetic]";
    document.body.addEventListener("mouseover", (e) => {
      const t = e.target.closest(hoverables);
      if (!t) return;
      cursor.classList.add("is-hover");
      if (t.hasAttribute("data-magnetic") || t.matches(".btn, .nav__link, .project__link, .contact__email")) {
        cursor.classList.add("is-magnetic");
      }
    });
    document.body.addEventListener("mouseout", (e) => {
      const t = e.target.closest(hoverables);
      if (!t) return;
      cursor.classList.remove("is-hover", "is-magnetic");
    });
    window.addEventListener("mouseleave", () => { cursor.style.opacity = "0"; });
    window.addEventListener("mouseenter", () => { cursor.style.opacity = "1"; });
  }

  // ---------- Magnetic buttons ----------
  if (!isTouch && !reduced) {
    $$("[data-magnetic]").forEach((el) => {
      const strength = 0.35;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "";
      });
    });
  }

  // ---------- Smooth scroll (Lenis + GSAP) ----------
  let lenis = null;
  if (window.Lenis && !reduced) {
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
    });
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  // ---------- Header on scroll ----------
  const header = $("#header");
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---------- Mobile menu ----------
  const ham = $("#hamburger");
  const mobMenu = $("#mobileMenu");
  const mobileMenuClose = $("#mobileMenuClose");
  if (ham && mobMenu) {
    const close = () => {
      ham.classList.remove("is-active");
      mobMenu.classList.remove("is-open");
      mobMenu.setAttribute("aria-hidden", "true");
      ham.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    };
    const open = () => {
      ham.classList.add("is-active");
      mobMenu.classList.add("is-open");
      mobMenu.setAttribute("aria-hidden", "false");
      ham.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    };
    ham.addEventListener("click", () => {
      mobMenu.classList.contains("is-open") ? close() : open();
    });
    if (mobileMenuClose) {
      mobileMenuClose.addEventListener("click", close);
    }
    $$(".mobile-menu__link").forEach((l) => l.addEventListener("click", close));
  }

  // ---------- Theme toggle ----------
  const themeToggle = $("#themeToggle");
  const html = document.documentElement;
  
  // Read saved theme or system preference
  const getSavedTheme = () => localStorage.getItem("theme");
  const getSystemTheme = () => matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  const initTheme = () => {
    const saved = getSavedTheme();
    const theme = saved || getSystemTheme();
    setTheme(theme, false); // false = don't save on init
  };

  const setTheme = (theme, save = true) => {
    const isDark = theme === "dark";
    html.setAttribute("data-theme", theme);
    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", isDark);
    }
    if (save) {
      localStorage.setItem("theme", theme);
    }
  };

  const toggleTheme = () => {
    const current = html.getAttribute("data-theme") || getSystemTheme();
    const next = current === "dark" ? "light" : "dark";
    setTheme(next, true);
  };

  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }

  // Initialize theme on page load
  initTheme();

  // ---------- Anchor smooth scroll (Lenis) ----------
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(target, { offset: -40, duration: 1.4 });
      } else {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // ============================================
  // GSAP ANIMATIONS
  // ============================================
  const gsapReady = () => typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
  const onGsapReady = (fn) => {
    if (gsapReady()) fn();
    else window.addEventListener("load", () => { if (gsapReady()) fn(); });
  };

  onGsapReady(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (lenis) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }

    // ---------- LOADER ----------
    const loader = $("#loader");
    const loaderCount = $("#loaderCount");
    const loaderBar = $("#loaderBar");

    if (reduced) {
      if (loader) loader.style.display = "none";
      return runAnimations();
    }

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(loader, {
          yPercent: -100, duration: 1, ease: "power4.inOut",
          onComplete: () => { if (loader) loader.style.display = "none"; }
        });
        runAnimations();
      }
    });

    const counterObj = { v: 0 };
    tl.to(counterObj, {
      v: 100, duration: 1.8, ease: "power2.inOut",
      onUpdate: () => { if (loaderCount) loaderCount.textContent = String(Math.round(counterObj.v)).padStart(2, "0"); }
    }, 0);
    tl.to(loaderBar, { width: "100%", duration: 1.8, ease: "power2.inOut" }, 0);
    tl.to(".loader__label", { opacity: 0.6, duration: 0.4 }, 0.4);

    // ---------- MAIN ANIMATIONS ----------
    function runAnimations() {
      // Hero intro — use .from() with explicit yPercent so the title is always visible by default
      const heroTl = gsap.timeline({ defaults: { ease: "power4.out" } });
      heroTl
        .from(".hero__chip", { y: 20, opacity: 0, duration: 0.8 }, 0.2)
        .from(".hero__location", { y: 20, opacity: 0, duration: 0.8 }, 0.3)
        .from(".hero__title .line__inner", {
          yPercent: 110, duration: 1.2, stagger: 0.12, ease: "power4.out"
        }, 0.2)
        .from(".hero__role-line", { width: 0, duration: 0.8 }, 1.0)
        .from(".hero__role-text", { y: 20, opacity: 0, duration: 0.9 }, 1.1)
        .from(".hero__bottom > *", { y: 24, opacity: 0, duration: 0.8, stagger: 0.1 }, 1.2);

      // Parallax hero shapes
      $$(".hero__shape").forEach((shape, i) => {
        gsap.to(shape, {
          yPercent: -30 - i * 10,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      });

      // Hero title subtle move
      gsap.to(".hero__title", {
        yPercent: -8,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
      });

      // Scroll progress
      gsap.to("#scrollProgress", {
        scaleX: 1, transformOrigin: "left center", ease: "none",
        scrollTrigger: { start: 0, end: "max", scrub: 0.4 }
      });

      // Marquee
      gsap.to(".marquee__track", {
        xPercent: -50,
        repeat: -1,
        ease: "none",
        duration: 28,
      });

      // Section heads
      $$(".section-head").forEach((sh) => {
        gsap.from(sh.children, {
          y: 30, opacity: 0, duration: 0.9, stagger: 0.1, ease: "power4.out",
          scrollTrigger: { trigger: sh, start: "top 80%" }
        });
      });

      // About reveal
      gsap.from(".about__lead", {
        y: 40, opacity: 0, duration: 1, ease: "power4.out",
        scrollTrigger: { trigger: ".about__lead", start: "top 85%" }
      });
      gsap.from(".about__bio p:not(.about__lead)", {
        y: 24, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power3.out",
        scrollTrigger: { trigger: ".about__bio", start: "top 80%" }
      });
      gsap.from(".about__cta > *", {
        y: 20, opacity: 0, duration: 0.7, stagger: 0.1, ease: "power3.out",
        scrollTrigger: { trigger: ".about__cta", start: "top 90%" }
      });

      // Stat counters
      $$(".stat").forEach((stat) => {
        const num = $(".stat__num", stat);
        const target = parseInt(num.dataset.count, 10) || 0;
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target, duration: 1.8, ease: "power2.out",
          onUpdate: () => { num.textContent = Math.round(obj.v); },
          scrollTrigger: { trigger: stat, start: "top 85%", once: true }
        });
        gsap.from(stat, {
          y: 30, opacity: 0, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: stat, start: "top 90%" }
        });
      });

      // Skill cards stagger
      gsap.from(".skill-card", {
        y: 40, opacity: 0, duration: 0.8, stagger: 0.08, ease: "power3.out",
        scrollTrigger: { trigger: ".skills__grid", start: "top 80%" }
      });

      // Timeline
      gsap.from(".timeline__item", {
        x: -40, opacity: 0, duration: 1, ease: "power4.out",
        scrollTrigger: { trigger: ".timeline", start: "top 80%" }
      });
      gsap.from(".timeline__points li", {
        y: 14, opacity: 0, duration: 0.6, stagger: 0.06, ease: "power3.out",
        scrollTrigger: { trigger: ".timeline__points", start: "top 85%" }
      });
      // Timeline markers fade in
      $$(".timeline__marker span").forEach((marker, i) => {
        gsap.from(marker, {
          scale: 0.5, opacity: 0, duration: 0.5, delay: i * 0.1, ease: "back.out",
          scrollTrigger: { trigger: marker.closest(".timeline__item"), start: "top 85%" }
        });
      });

      // Projects reveal
      $$(".project").forEach((p) => {
        gsap.from(p, {
          y: 60, opacity: 0, duration: 1, ease: "power4.out",
          scrollTrigger: { trigger: p, start: "top 85%" }
        });
        const title = $(".project__title", p);
        if (title) {
          gsap.from(title.querySelectorAll("span, .project__title"), {
            yPercent: 100, duration: 0.9, ease: "power4.out", stagger: 0.05,
            scrollTrigger: { trigger: p, start: "top 80%" }
          });
        }
      });

      // Education
      $$(".edu-item").forEach((item, i) => {
        gsap.from(item, {
          y: 30, opacity: 0, duration: 0.7, delay: i * 0.05, ease: "power3.out",
          scrollTrigger: { trigger: item, start: "top 88%" }
        });
      });

      // Contact
      gsap.from(".contact__lead", {
        y: 50, opacity: 0, duration: 1, ease: "power4.out",
        scrollTrigger: { trigger: ".contact__lead", start: "top 80%" }
      });
      gsap.from(".contact__email, .contact__meta", {
        y: 30, opacity: 0, duration: 0.8, stagger: 0.12, ease: "power3.out",
        scrollTrigger: { trigger: ".contact__wrap", start: "top 80%" }
      });

      // Footer
      gsap.from(".footer > *", {
        y: 14, opacity: 0, duration: 0.6, ease: "power2.out",
        scrollTrigger: { trigger: ".footer", start: "top 95%" }
      });
    }

    // ---------- Refresh ScrollTrigger after fonts ----------
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
    window.addEventListener("load", () => ScrollTrigger.refresh());
  });
})();
