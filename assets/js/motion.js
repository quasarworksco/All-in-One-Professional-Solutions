/* All in One Professional Services — capa de movimiento
   GSAP + ScrollTrigger + Lenis (en assets/vendor), mismo motor que JP Real Estate.
   Sin GSAP o con "reducir movimiento" el sitio queda estático y completo. */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const motion = !!(window.gsap && window.ScrollTrigger) && !reduced;
  const pre = $(".preloader");

  const endIntro = () => {
    try { sessionStorage.setItem("aio-intro", "1"); } catch (e) {}
    root.classList.remove("intro");
    pre?.remove();
  };

  if (!motion) { endIntro(); return; }

  gsap.registerPlugin(ScrollTrigger);
  gsap.config({ nullTargetWarn: false });
  root.classList.add("motion");
  const expo = "expo.out";
  window.AIO = window.AIO || {};

  /* ---------- Scroll suave ---------- */
  let lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    window.AIO.lenis = lenis;

    // Anclas de esta misma página (incluye "servicios.html#nomina" estando en servicios)
    const offset = () => -(($("#header")?.offsetHeight || 0) + ($(".subnav")?.offsetHeight || 0) + 20);
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href*='#']");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
      const url = new URL(a.href, location.href);
      if (url.pathname !== location.pathname || !url.hash) return;
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;
      e.preventDefault();
      history.replaceState(null, "", url.hash);
      setTimeout(() => lenis.scrollTo(target, { offset: offset(), duration: 1.4 }), document.body.classList.contains("is-locked") ? 350 : 0);
    });
  }

  /* ---------- Dividir títulos en palabras enmascaradas (conserva <em>) ---------- */
  const splitWords = (el) => {
    const inners = [];
    const frag = document.createDocumentFragment();
    [...el.childNodes].forEach((node) => {
      const tag = node.nodeType === 1 ? node.tagName.toLowerCase() : null;
      if (tag === "br") { frag.appendChild(document.createElement("br")); return; }
      node.textContent.split(/\s+/).filter(Boolean).forEach((word) => {
        if (/^[.,;:!?]+$/.test(word) && inners.length) { inners[inners.length - 1].append(word); return; }
        const mask = document.createElement("span");
        mask.className = "w-mask";
        const inner = document.createElement("span");
        inner.className = "w-in";
        if (tag) { const t = document.createElement(tag); t.textContent = word; inner.appendChild(t); }
        else inner.textContent = word;
        mask.appendChild(inner);
        frag.append(mask, " ");
        inners.push(inner);
      });
    });
    el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    el.textContent = "";
    el.appendChild(frag);
    [...el.children].forEach((c) => c.setAttribute("aria-hidden", "true"));
    return inners;
  };

  /* ---------- Intro: preloader (1.ª visita) + entrada del hero ---------- */
  const heroTitle = $(".hero h1, .page-hero h1");
  const heroWords = heroTitle ? splitWords(heroTitle) : [];
  const heroBits = $$(".hero .eyebrow, .hero__lead, .hero__actions, .hero__chips, .page-hero .crumbs, .page-hero .eyebrow, .page-hero .lead");
  gsap.set(heroWords, { yPercent: 115, rotate: 3 });
  gsap.set(heroBits, { y: 26, autoAlpha: 0 });
  gsap.set($$(".board__card"), { y: 60, autoAlpha: 0, rotationX: 14 });
  gsap.set($$(".board__float"), { scale: 0.6, autoAlpha: 0 });
  gsap.set($$(".overview .card"), { y: 50, autoAlpha: 0 });

  const showPre = root.classList.contains("intro") && pre;
  const tl = gsap.timeline({ paused: true });
  let t0 = 0;
  if (showPre) {
    const num = $(".preloader__num");
    const c = { v: 0 };
    tl.to(".preloader__mark circle", { strokeDashoffset: 0, duration: 0.8, ease: "power2.inOut" }, 0)
      .to(".preloader__mark path", { strokeDashoffset: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }, 0.3)
      .to(".preloader__word span", { y: 0, duration: 0.7, stagger: 0.07, ease: expo }, 0.25)
      .to(".preloader__bar i", { scaleX: 1, duration: 0.95, ease: "power2.inOut" }, 0.1)
      .to(c, { v: 100, duration: 0.95, ease: "power2.inOut", onUpdate: () => (num.textContent = Math.round(c.v)) }, 0.1)
      .to(".preloader__in, .preloader__num", { y: -30, autoAlpha: 0, duration: 0.35, ease: "power2.in" }, 1.1)
      .to(pre, { yPercent: -100, duration: 0.85, ease: "expo.inOut" }, 1.2);
    t0 = 1.45;
  }
  tl.to(heroWords, { yPercent: 0, rotate: 0, duration: 1.3, stagger: 0.05, ease: expo }, t0)
    .to(heroBits, { y: 0, autoAlpha: 1, duration: 1.1, stagger: 0.08, ease: expo }, t0 + 0.2)
    .to($$(".board__card"), { y: 0, autoAlpha: 1, rotationX: 0, duration: 1.5, ease: expo }, t0 + 0.25)
    .to($$(".board__float"), { scale: 1, autoAlpha: 1, duration: 0.9, stagger: 0.15, ease: "back.out(1.8)" }, t0 + 0.7)
    .to($$(".overview .card"), { y: 0, autoAlpha: 1, duration: 1.1, stagger: 0.08, ease: expo }, t0 + 0.4)
    .add(() => { endIntro(); ScrollTrigger.refresh(); }, showPre ? 1.5 : 0);

  let started = false;
  const play = () => { if (!started) { started = true; tl.play(); } };
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(play);
  setTimeout(play, 900);

  /* ---------- Parallax del hero ---------- */
  $$(".hero, .page-hero").forEach((hero) => {
    const st = { trigger: hero, start: "top top", end: "bottom top", scrub: true };
    gsap.to($(".hero__grid-bg", hero), { yPercent: 25, ease: "none", scrollTrigger: st });
    gsap.to($(".hero__skyline", hero), { yPercent: 35, ease: "none", scrollTrigger: st });
    gsap.to($$(".board", hero), { y: -70, ease: "none", scrollTrigger: st });
  });

  /* ---------- Tablero del hero: inclinación 3D con el mouse ---------- */
  const card = $(".board__card");
  if (card && finePointer) {
    const rx = gsap.quickTo(card, "rotationX", { duration: 0.8, ease: "power3" });
    const ry = gsap.quickTo(card, "rotationY", { duration: 0.8, ease: "power3" });
    const hero = $(".hero");
    hero.addEventListener("mousemove", (e) => {
      const r = hero.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - 0.5) * 12);
      rx(-((e.clientY - r.top) / r.height - 0.5) * 10);
    });
    hero.addEventListener("mouseleave", () => { rx(0); ry(0); });
  }

  /* ---------- Títulos de sección: revelado palabra por palabra ---------- */
  $$(".h-section, .svc h2, .cta h2, .mission__card h3").forEach((el) => {
    if (el.closest(".hero, .page-hero")) return;
    const words = splitWords(el);
    gsap.from(words, { yPercent: 115, rotate: 3, duration: 1.25, stagger: 0.045, ease: expo, scrollTrigger: { trigger: el, start: "top 88%" } });
  });

  /* ---------- Revelado general en lotes ---------- */
  const reveals = $$(".reveal").filter((el) => !el.closest(".overview"));
  gsap.set(reveals, { y: 50, autoAlpha: 0 });
  ScrollTrigger.batch(reveals, {
    start: "top 90%",
    onEnter: (batch) => {
      gsap.to(batch, { y: 0, autoAlpha: 1, duration: 1.2, stagger: 0.08, ease: expo, overwrite: "auto" });
      batch.forEach((el) => el.classList.add("is-in"));
    },
  });
  $$(".overview .reveal").forEach((el) => el.classList.add("is-in"));

  /* ---------- Texto que se ilumina con el scroll ---------- */
  $$("[data-words]").forEach((el) => {
    const words = splitWords(el);
    gsap.fromTo(words, { opacity: 0.14 }, {
      opacity: 1, stagger: 0.1, ease: "none",
      scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true },
    });
  });

  /* ---------- Marquesina que reacciona a la velocidad del scroll ---------- */
  const mTrack = $(".marquee__track");
  if (mTrack) {
    let mx = 0, dir = -1, boost = 0;
    ScrollTrigger.create({
      trigger: ".marquee", start: "top bottom", end: "bottom top",
      onUpdate: (s) => { dir = s.direction === 1 ? -1 : 1; boost = Math.min(8, Math.abs(s.getVelocity()) / 250); },
    });
    gsap.ticker.add(() => {
      boost *= 0.93;
      mx += (0.03 + boost * 0.08) * dir;
      if (mx <= -50) mx += 50;
      if (mx > 0) mx -= 50;
      gsap.set(mTrack, { xPercent: mx, skewX: -boost * dir * 0.7 });
    });
  }

  /* ---------- Contadores ---------- */
  $$("[data-count]").forEach((el) => {
    const end = +el.dataset.count;
    const o = { v: 0 };
    el.textContent = "0";
    gsap.to(o, { v: end, duration: 1.8, ease: "power3.out", onUpdate: () => (el.textContent = Math.round(o.v)), scrollTrigger: { trigger: el, start: "top 90%" } });
  });

  /* ---------- Visual de "Quiénes somos": cortina + parallax ---------- */
  $$(".about-visual").forEach((v) => {
    const frame = $(".about-visual__frame", v);
    gsap.fromTo(frame, { clipPath: "inset(100% 0% 0% 0% round 28px)" }, { clipPath: "inset(0% 0% 0% 0% round 28px)", duration: 1.7, ease: "expo.inOut", scrollTrigger: { trigger: v, start: "top 80%" } });
    gsap.from($(".about-visual__mark", v), { scale: 0.4, rotate: -30, autoAlpha: 0, duration: 1.6, ease: expo, scrollTrigger: { trigger: v, start: "top 65%" } });
    gsap.from($(".about-visual__badge", v), { scale: 0, rotate: -12, duration: 1.2, ease: "back.out(1.7)", scrollTrigger: { trigger: v, start: "top 55%" } });
    gsap.to($(".about-visual__quote", v), { y: -40, ease: "none", scrollTrigger: { trigger: v, start: "top bottom", end: "bottom top", scrub: true } });
  });

  /* ---------- Globo internacional: gira con el scroll ---------- */
  const globe = $(".globe");
  if (globe) {
    gsap.fromTo($(".globe > svg", globe), { rotate: -25 }, { rotate: 25, ease: "none", scrollTrigger: { trigger: globe, start: "top bottom", end: "bottom top", scrub: true } });
    $$(".globe__tag", globe).forEach((tag, i) => gsap.fromTo(tag, { y: 40 + i * 20 }, { y: -40 - i * 20, ease: "none", scrollTrigger: { trigger: globe, start: "top bottom", end: "bottom top", scrub: true } }));
  }

  /* ---------- Línea de tiempo y checks de los paneles ---------- */
  $$(".panel").forEach((p) => {
    gsap.from($$(".checks li, .timeline li", p), { x: -16, autoAlpha: 0, duration: 0.8, stagger: 0.05, ease: "power3.out", scrollTrigger: { trigger: p, start: "top 80%" } });
  });

  /* ---------- CTA: el bloque se expande al entrar ---------- */
  $$(".cta").forEach((c) => {
    gsap.fromTo(c, { scale: 0.9 }, { scale: 1, ease: "none", scrollTrigger: { trigger: c, start: "top bottom", end: "top 55%", scrub: true } });
  });

  /* ---------- Wordmark gigante del footer ---------- */
  gsap.from(".footer__big span", { yPercent: 100, duration: 1.6, ease: expo, scrollTrigger: { trigger: ".footer__big", start: "top 98%" } });

  /* ---------- Botones magnéticos ---------- */
  if (finePointer) {
    $$(".btn--lg, .header__cta, .fab").forEach((el) => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3" });
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.25);
        yTo((e.clientY - r.top - r.height / 2) * 0.35);
      });
      el.addEventListener("mouseleave", () => gsap.to(el, { x: 0, y: 0, duration: 1, ease: "elastic.out(1, .4)" }));
    });

    /* ---------- Foco de luz que sigue al cursor ---------- */
    $$(".card, .panel, .pillar, .step, .value, .mission__card, .info, .list-feature a, .member").forEach((el) => {
      el.classList.add("spot");
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    });
  }

  addEventListener("load", () => ScrollTrigger.refresh());
})();
