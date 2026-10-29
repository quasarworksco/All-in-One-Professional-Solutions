/* All in One Professional Services — interacciones (GSAP + ScrollTrigger + Lenis)
   Mismo motor que JP Real Estate. Sin GSAP o con "reducir movimiento" el sitio
   queda completo y estático. */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const body = document.body;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const desktop = matchMedia("(min-width: 1181px)");
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const motion = hasGsap && !reduced;

  if (!motion) root.classList.add("no-motion");
  if (hasGsap) { gsap.registerPlugin(ScrollTrigger); gsap.config({ nullTargetWarn: false }); }

  /* ---------- Botones: el texto rueda al pasar el mouse ---------- */
  $$(".btn__text").forEach((t) => {
    const label = t.textContent.trim();
    t.innerHTML = `<i data-text="${label}">${label}</i>`;
  });

  /* ---------- Scroll suave ---------- */
  let lenis = null;
  if (motion && window.Lenis) {
    lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const lock = (on) => { if (lenis) on ? lenis.stop() : lenis.start(); else body.classList.toggle("is-locked", on); };

  /* ---------- Menús desplegables (escritorio) ---------- */
  const items = $$(".nav__item.has-menu");
  const setOpen = (item, open) => { item.classList.toggle("is-open", open); $(".nav__link", item).setAttribute("aria-expanded", String(open)); };
  const closeAll = (except) => items.forEach((i) => i !== except && setOpen(i, false));
  items.forEach((item) => {
    let timer;
    $(".nav__link", item).addEventListener("click", () => { const o = !item.classList.contains("is-open"); closeAll(item); setOpen(item, o); });
    item.addEventListener("mouseenter", () => { clearTimeout(timer); closeAll(item); setOpen(item, true); });
    item.addEventListener("mouseleave", () => { timer = setTimeout(() => setOpen(item, false), 160); });
    item.addEventListener("focusout", (e) => { if (!item.contains(e.relatedTarget)) setOpen(item, false); });
  });
  document.addEventListener("click", (e) => { if (!e.target.closest(".nav__item.has-menu")) closeAll(); });

  /* ---------- Menú móvil a pantalla completa ---------- */
  const burger = $(".burger");
  const mmenu = $("#mmenu");
  const setMenu = (open) => {
    body.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    mmenu.setAttribute("aria-hidden", String(!open));
    lock(open);
  };
  burger.addEventListener("click", () => setMenu(!body.classList.contains("menu-open")));
  $$(".mmenu__row > button").forEach((b) => b.addEventListener("click", () => {
    const row = b.parentElement;
    const open = !row.classList.contains("is-open");
    $$(".mmenu__row.is-open").forEach((r) => { r.classList.remove("is-open"); $("button", r).setAttribute("aria-expanded", "false"); });
    row.classList.toggle("is-open", open);
    b.setAttribute("aria-expanded", String(open));
  }));
  desktop.addEventListener("change", () => setMenu(false));
  addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const open = items.find((i) => i.classList.contains("is-open"));
    if (open) { setOpen(open, false); $(".nav__link", open).focus(); }
    if (body.classList.contains("menu-open")) { setMenu(false); burger.focus(); }
  });

  /* ---------- Anclas de la misma página (incluye "servicios.html#nomina") ---------- */
  const offset = () => -(($(".subnav")?.offsetHeight || 0) + 24);
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href*='#']");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!target) return;
    e.preventDefault();
    history.replaceState(null, "", url.hash);
    const wasOpen = body.classList.contains("menu-open");
    if (wasOpen) setMenu(false);
    closeAll();
    const go = () => lenis ? lenis.scrollTo(target, { offset: offset(), duration: 1.6 }) : scrollTo({ top: target.getBoundingClientRect().top + scrollY + offset(), behavior: reduced ? "auto" : "smooth" });
    wasOpen ? setTimeout(go, 400) : go();
  });
  // Al llegar desde otra página con #ancla, compensar la barra de sub-navegación
  if (location.hash) {
    const t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (t) addEventListener("load", () => setTimeout(() => lenis ? lenis.scrollTo(t, { offset: offset(), immediate: true, force: true }) : scrollTo(0, t.getBoundingClientRect().top + scrollY + offset()), 60));
  }

  /* ---------- Imágenes que solo se usan al pasar el mouse ---------- */
  const lateImages = () => $$("img[data-src]").forEach((img) => { img.src = img.dataset.src; img.removeAttribute("data-src"); });
  if (finePointer && innerWidth > 760) document.readyState === "complete" ? lateImages() : addEventListener("load", lateImages, { once: true });

  /* ---------- Rotador de palabras del hero ---------- */
  const startRotator = () => {
    if (reduced) return;
    const words = $$(".rotator__item");
    if (words.length < 2) return;
    let i = 0;
    setInterval(() => {
      const cur = words[i];
      cur.classList.replace("is-active", "is-leaving");
      setTimeout(() => cur.classList.remove("is-leaving"), 1100);
      i = (i + 1) % words.length;
      words[i].classList.add("is-active");
    }, 3000);
  };

  /* ---------- Dividir texto en palabras enmascaradas (conserva <em> y <br>) ---------- */
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

  /* ---------- Nav sólida / oculta y WhatsApp (sin GSAP) ---------- */
  const nav = $("#nav");
  const wa = $(".wa-float");
  const hasHero = !!$(".hero, .phero");
  const navState = (y, down) => {
    const solid = !hasHero || y > innerHeight * 0.6;
    const hide = down && y > innerHeight && !body.classList.contains("menu-open") && !items.some((i) => i.classList.contains("is-open"));
    nav.classList.toggle("is-solid", solid);
    nav.classList.toggle("is-hidden", hide);
    body.classList.toggle("nav-solid", solid);
    body.classList.toggle("nav-hidden", hide);
    wa.classList.toggle("is-visible", y > innerHeight * 0.5);
  };
  navState(scrollY, false);

  if (!motion) {
    $(".preloader")?.remove();
    root.classList.remove("intro");
    startRotator();
    $$(".step").forEach((s) => s.classList.add("is-in"));
    let lastY = scrollY;
    addEventListener("scroll", () => { navState(scrollY, scrollY > lastY); lastY = scrollY; }, { passive: true });
  }

  /* =========================================================
     MOVIMIENTO (GSAP)
     ========================================================= */
  if (motion) {
    const expo = "expo.out";
    const pre = $(".preloader");
    const showPre = root.classList.contains("intro") && pre;
    lock(true);

    // Estado inicial del hero
    const heroImg = $(".hero__media img");
    const lines = $$(".hero__title .line__in");
    const pheroTitle = $(".phero__title");
    const pheroWords = pheroTitle ? splitWords(pheroTitle) : [];
    gsap.set(heroImg, { scale: 1.35 });
    gsap.set(lines, { yPercent: 115 });
    gsap.set(pheroWords, { yPercent: 115, rotate: 3 });
    gsap.set("[data-hero]", { y: 30, autoAlpha: 0 });
    gsap.set(nav, { yPercent: -100, autoAlpha: 0 });

    // El loader completo dura 1.5 s; el hero empieza a aparecer mientras se abre.
    const t = showPre ? 1 : 0;
    const intro = gsap.timeline({ paused: true });
    if (showPre) {
      // 1) el círculo se dibuja, 2) las barras suben como una gráfica (la dorada al final),
      // 3) aparece el nombre letra por letra, 4) la pantalla se abre en dos hacia arriba y abajo
      intro
        .to(".pl-ring", { strokeDashoffset: 0, duration: 0.562, ease: "power2.inOut" }, 0)
        .to(".pl-bar", { strokeDashoffset: 0, duration: 0.375, stagger: 0.075, ease: "power3.out" }, 0.188)
        .fromTo(".preloader__word span", { y: 0, yPercent: 105 }, { yPercent: 0, duration: 0.562, stagger: 0.025, ease: "expo.out" }, 0.312)
        .to(".preloader__tag", { opacity: 1, duration: 0.375, ease: "power2.out" }, 0.5)
        .to(".preloader__center", { scale: 0.94, autoAlpha: 0, duration: 0.25, ease: "power2.in" }, 0.85)
        .to(".preloader__panel--top", { yPercent: -100, duration: 0.562, ease: "expo.inOut" }, 0.938)
        .to(".preloader__panel--bottom", { yPercent: 100, duration: 0.562, ease: "expo.inOut" }, 0.938);
    }
    intro
      .to(heroImg, { scale: 1, duration: 2.2, ease: expo }, t + 0.05)
      .to($$(".phero .hero__media img"), { scale: 1, duration: 2.2, ease: expo }, t + 0.05)
      .to(lines, { yPercent: 0, duration: 1.4, stagger: 0.1, ease: expo }, t + 0.3)
      .to(pheroWords, { yPercent: 0, rotate: 0, duration: 1.3, stagger: 0.05, ease: expo }, t + 0.3)
      .to("[data-hero]", { y: 0, autoAlpha: 1, duration: 1.2, stagger: 0.08, ease: expo }, t + 0.5)
      .to(nav, { yPercent: 0, autoAlpha: 1, duration: 1.1, ease: expo, clearProps: "transform,opacity,visibility" }, t + 0.4)
      .add(() => {
        pre?.remove();
        root.classList.remove("intro");
        lock(false);
        startRotator();
        ScrollTrigger.refresh();
      }, showPre ? 1.5 : t + 0.5);
    gsap.set($$(".phero .hero__media img"), { scale: 1.25 });

    let started = false;
    const play = () => { if (!started) { started = true; intro.play(); } };
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(play);
    setTimeout(play, 800);

    /* ---------- Parallax del hero ---------- */
    $$(".hero, .phero").forEach((h) => {
      gsap.to($(".hero__media", h), { yPercent: 22, ease: "none", scrollTrigger: { trigger: h, start: "top top", end: "bottom top", scrub: true } });
      gsap.to($$(".hero__content, .hero__foot, .phero__in", h), { y: -80, autoAlpha: 0.2, ease: "none", scrollTrigger: { trigger: h, start: "40% top", end: "bottom top", scrub: true } });
    });

    /* ---------- Nav y WhatsApp según el scroll ---------- */
    ScrollTrigger.create({ start: 0, end: "max", onUpdate: (s) => navState(s.scroll(), s.direction === 1) });

    /* ---------- Títulos: palabras que suben ---------- */
    $$("[data-split]").forEach((el) => {
      const words = splitWords(el);
      gsap.from(words, { yPercent: 115, rotate: 4, duration: 1.4, stagger: 0.06, ease: expo, scrollTrigger: { trigger: el, start: "top 86%" } });
    });

    /* ---------- Texto que se ilumina con el scroll ---------- */
    $$("[data-words]").forEach((el) => {
      const words = splitWords(el);
      gsap.fromTo(words, { opacity: 0.12 }, { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 50%", scrub: true } });
    });

    /* ---------- Revelado general en lotes ---------- */
    gsap.set("[data-reveal]", { y: 60, autoAlpha: 0 });
    ScrollTrigger.batch("[data-reveal]", {
      start: "top 90%",
      onEnter: (batch) => {
        gsap.to(batch, { y: 0, autoAlpha: 1, duration: 1.3, stagger: 0.09, ease: expo, overwrite: "auto" });
        batch.forEach((el) => el.classList.add("is-in"));
      },
    });

    /* ---------- Imágenes: cortina + parallax ---------- */
    $$("[data-curtain]").forEach((f) => {
      gsap.fromTo(f, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.8, ease: "expo.inOut", scrollTrigger: { trigger: f, start: "top 82%" } });
      gsap.from($("img", f), { scale: 1.4, duration: 2.4, ease: expo, scrollTrigger: { trigger: f, start: "top 82%" } });
    });
    $$("[data-speed]").forEach((img) => {
      const amt = +img.dataset.speed * 100;
      gsap.fromTo(img, { yPercent: -amt / 2 }, { yPercent: amt / 2, ease: "none", scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
    });
    $$(".badge").forEach((b) => gsap.from(b, { scale: 0, rotate: -90, duration: 1.4, ease: "back.out(1.6)", scrollTrigger: { trigger: b.parentElement, start: "top 60%" } }));

    /* ---------- Marquesina que reacciona al scroll ---------- */
    const mTrack = $(".marquee__track");
    if (mTrack) {
      let mx = 0, dir = -1, boost = 0;
      ScrollTrigger.create({ trigger: ".marquee", start: "top bottom", end: "bottom top", onUpdate: (s) => { dir = s.direction === 1 ? -1 : 1; boost = Math.min(8, Math.abs(s.getVelocity()) / 250); } });
      gsap.ticker.add(() => {
        boost *= 0.93;
        mx += (0.045 + boost * 0.09) * dir;
        if (mx <= -50) mx += 50;
        if (mx > 0) mx -= 50;
        gsap.set(mTrack, { xPercent: mx, skewX: -boost * dir * 0.8 });
      });
    }

    /* ---------- Contadores ---------- */
    $$("[data-count]").forEach((el) => {
      const end = +el.dataset.count;
      const o = { v: 0 };
      el.textContent = "0";
      gsap.to(o, { v: end, duration: 2, ease: "power3.out", onUpdate: () => (el.textContent = Math.round(o.v)), scrollTrigger: { trigger: el, start: "top 90%" } });
    });

    /* ---------- Servicios: vista previa que sigue al cursor ---------- */
    const prev = $(".preview");
    const list = $(".srows");
    if (prev && list && finePointer && innerWidth > 760) {
      const inner = $(".preview__inner");
      const px = gsap.quickTo(prev, "x", { duration: 0.7, ease: "power3" });
      const py = gsap.quickTo(prev, "y", { duration: 0.7, ease: "power3" });
      const pr = gsap.quickTo(prev, "rotate", { duration: 0.8, ease: "power3" });
      gsap.set(prev, { scale: 0, autoAlpha: 0 });
      let lastX = 0;
      list.addEventListener("mouseenter", (e) => { gsap.set(prev, { x: e.clientX, y: e.clientY }); gsap.to(prev, { scale: 1, autoAlpha: 1, duration: 0.6, ease: expo }); });
      list.addEventListener("mouseleave", () => gsap.to(prev, { scale: 0, autoAlpha: 0, duration: 0.5, ease: "power3.in" }));
      list.addEventListener("mousemove", (e) => { px(e.clientX); py(e.clientY); pr(gsap.utils.clamp(-12, 12, (e.clientX - lastX) * 0.6)); lastX = e.clientX; });
      $$(".srow").forEach((row) => row.addEventListener("mouseenter", () => { inner.style.transform = `translateY(${-row.dataset.index * 100}%)`; }));
    }

    /* ---------- Galería horizontal anclada ---------- */
    const track = $(".hgallery__track");
    if (track) {
      const dist = () => Math.max(0, track.scrollWidth - innerWidth);
      gsap.to(track, {
        x: () => -dist(), ease: "none",
        scrollTrigger: { trigger: ".hgallery", start: "top top", end: () => `+=${dist()}`, pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1, onUpdate: (s) => gsap.set(".hgallery__progress i", { scaleX: s.progress }) },
      });
    }

    /* ---------- Banda final: la imagen se expande ---------- */
    $$(".band").forEach((b) => {
      const m = $(".band__media", b);
      gsap.fromTo(m, { clipPath: "inset(12% 16% 12% 16% round 8px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none", scrollTrigger: { trigger: b, start: "top 85%", end: "top top", scrub: true } });
      gsap.fromTo($("img", m), { scale: 1.3 }, { scale: 1, ease: "none", scrollTrigger: { trigger: b, start: "top bottom", end: "bottom top", scrub: true } });
    });

    /* ---------- Wordmark gigante del footer ---------- */
    gsap.from(".footer__big span", { yPercent: 105, duration: 1.6, stagger: 0.1, ease: expo, scrollTrigger: { trigger: ".footer__big", start: "top 95%" } });

    /* ---------- Botones magnéticos ---------- */
    if (finePointer) {
      $$(".magnetic").forEach((el) => {
        const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3" });
        const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3" });
        el.addEventListener("mousemove", (e) => {
          const r = el.getBoundingClientRect();
          xTo((e.clientX - r.left - r.width / 2) * 0.3);
          yTo((e.clientY - r.top - r.height / 2) * 0.4);
        });
        el.addEventListener("mouseleave", () => gsap.to(el, { x: 0, y: 0, duration: 1, ease: "elastic.out(1, .4)" }));
      });
    }

    addEventListener("load", () => ScrollTrigger.refresh());
  }

  /* =========================================================
     Cursor personalizado
     ========================================================= */
  if (finePointer && !reduced) {
    root.classList.add("has-cursor");
    const cursor = $(".cursor");
    const blob = $(".cursor__blob"), dot = $(".cursor__dot"), label = $(".cursor__label");
    const labelText = $("span", label);
    let mx = -100, my = -100, bx = mx, by = my, lx = mx, ly = my;
    addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      cursor.classList.remove("is-hidden");
    }, { passive: true });
    const loop = () => {
      bx += (mx - bx) * 0.18; by += (my - by) * 0.18;
      lx += (mx - lx) * 0.12; ly += (my - ly) * 0.12;
      blob.style.transform = `translate3d(${bx}px, ${by}px, 0)`;
      label.style.translate = `${lx}px ${ly}px`;
      requestAnimationFrame(loop);
    };
    loop();
    document.addEventListener("mouseover", (e) => {
      const t = e.target;
      const lab = t.closest("[data-cursor]");
      if (lab) { labelText.textContent = lab.dataset.cursor; cursor.classList.add("is-label"); cursor.classList.remove("is-hover"); return; }
      cursor.classList.remove("is-label");
      cursor.classList.toggle("is-hover", !!t.closest("a, button, label, summary, select"));
    });
    document.addEventListener("mousedown", () => cursor.classList.add("is-down"));
    document.addEventListener("mouseup", () => cursor.classList.remove("is-down"));
    document.addEventListener("mouseleave", () => cursor.classList.add("is-hidden"));
  }

  /* =========================================================
     Sub-navegación: resalta la sección visible
     ========================================================= */
  const subLinks = $$(".subnav a[href^='#']");
  if (subLinks.length && "IntersectionObserver" in window) {
    const map = new Map(subLinks.map((a) => [a.getAttribute("href").slice(1), a]));
    const spy = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      subLinks.forEach((a) => a.classList.remove("is-active"));
      const link = map.get(en.target.id);
      if (link) { link.classList.add("is-active"); const bar = link.parentElement; bar.scrollTo({ left: link.offsetLeft - bar.clientWidth / 2 + link.clientWidth / 2, behavior: "smooth" }); }
    }), { rootMargin: "-45% 0px -50% 0px" });
    map.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* ---------- Biografías del equipo ---------- */
  $$("[data-bio]").forEach((btn) => {
    const dlg = document.getElementById(btn.dataset.bio);
    if (!dlg) return;
    btn.addEventListener("click", () => { dlg.showModal(); lock(true); });
    dlg.addEventListener("close", () => lock(false));
    $("[data-bio-close]", dlg)?.addEventListener("click", () => dlg.close());
    dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
  });

  /* =========================================================
     Formulario de contacto
     Sin servidor todavía: valida y abre el correo del visitante con el
     mensaje ya redactado. Para conectarlo a un CRM basta con cambiar send().
     ========================================================= */
  $$("a[data-servicio]").forEach((a) => { a.href = `contacto.html?servicio=${encodeURIComponent(a.dataset.servicio)}#agenda`; });

  const form = $("#form-contacto");
  if (form) {
    const pre = new URLSearchParams(location.search).get("servicio");
    if (pre && [...form.servicio.options].some((o) => o.value === pre)) form.servicio.value = pre;

    const validate = (field) => {
      const input = $("input,select,textarea", field);
      const ok = input.checkValidity();
      field.classList.toggle("is-invalid", !ok);
      return ok;
    };
    $$(".field", form).forEach((f) => {
      const input = $("input,select,textarea", f);
      input.addEventListener("blur", () => input.value && validate(f));
      input.addEventListener("input", () => f.classList.contains("is-invalid") && validate(f));
    });

    const send = (data) => {
      const lines = [
        `Nombre: ${data.get("nombre")}`,
        `Teléfono: ${data.get("telefono")}`,
        `Correo: ${data.get("correo")}`,
        `Servicio: ${data.get("servicio")}`,
        `Soy: ${data.get("perfil") || "—"}`,
        `Prefiere contacto por: ${data.get("canal") || "—"}`,
        "",
        data.get("mensaje") || "",
      ];
      location.href = `mailto:${form.dataset.to}?subject=${encodeURIComponent(`Consulta web — ${data.get("servicio")}`)}&body=${encodeURIComponent(lines.join("\n"))}`;
    };

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const bad = $$(".field", form).filter((f) => $("[required]", f)).filter((f) => !validate(f));
      if (bad.length) { $("input,select,textarea", bad[0]).focus(); return; }
      send(new FormData(form));
      form.classList.add("is-sent");
    });
  }
})();
