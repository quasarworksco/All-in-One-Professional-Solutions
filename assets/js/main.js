/* All in One Professional Services — interacciones del sitio */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const desktop = matchMedia("(min-width:1101px)");
  // motion.js toma el control de las animaciones cuando GSAP está disponible.
  const motion = !!(window.gsap && window.ScrollTrigger) && !matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lenis = (on) => window.AIO?.lenis?.[on ? "start" : "stop"]();

  /* ---------- Header con sombra al hacer scroll ---------- */
  const header = $("#header");
  const onScroll = () => header.classList.toggle("is-scrolled", scrollY > 8);
  onScroll();
  addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Menús desplegables ---------- */
  const items = $$(".nav__item.has-menu");
  const setOpen = (item, open) => {
    item.classList.toggle("is-open", open);
    $(".nav__link", item).setAttribute("aria-expanded", String(open));
  };
  const closeAll = (except) => items.forEach((i) => i !== except && setOpen(i, false));

  items.forEach((item) => {
    const btn = $(".nav__link", item);
    let timer;
    btn.addEventListener("click", () => {
      const open = !item.classList.contains("is-open");
      closeAll(item);
      setOpen(item, open);
    });
    item.addEventListener("mouseenter", () => {
      if (!desktop.matches) return;
      clearTimeout(timer);
      closeAll(item);
      setOpen(item, true);
    });
    item.addEventListener("mouseleave", () => {
      if (!desktop.matches) return;
      timer = setTimeout(() => setOpen(item, false), 160);
    });
    item.addEventListener("focusout", (e) => {
      if (desktop.matches && !item.contains(e.relatedTarget)) setOpen(item, false);
    });
  });
  document.addEventListener("click", (e) => {
    if (desktop.matches && !e.target.closest(".nav__item.has-menu")) closeAll();
  });

  /* ---------- Menú móvil ---------- */
  const nav = $("#nav");
  const burger = $("[data-nav-open]");
  const scrim = $(".scrim");
  const openNav = (open) => {
    nav.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("is-locked", open);
    lenis(!open);
    if (open) {
      scrim.hidden = false;
      requestAnimationFrame(() => scrim.classList.add("is-on"));
      $("[data-nav-close]", nav).focus();
    } else {
      scrim.classList.remove("is-on");
      setTimeout(() => (scrim.hidden = true), 300);
    }
  };
  burger.addEventListener("click", () => openNav(true));
  $$("[data-nav-close]").forEach((el) => el.addEventListener("click", () => openNav(false)));
  // Al tocar un enlace del panel (incluidos los anclas de la misma página) se cierra.
  $$("a", nav).forEach((a) => a.addEventListener("click", () => nav.classList.contains("is-open") && openNav(false)));
  desktop.addEventListener("change", () => { openNav(false); closeAll(); });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const open = items.find((i) => i.classList.contains("is-open"));
    if (open) { setOpen(open, false); $(".nav__link", open).focus(); }
    if (nav.classList.contains("is-open")) { openNav(false); burger.focus(); }
  });

  /* ---------- Aparición al hacer scroll ---------- */
  const reveals = $$(".reveal");
  if (motion) {
    // motion.js anima los .reveal
  } else if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- Sub-navegación: resalta la sección visible ---------- */
  const subLinks = $$(".subnav a[href^='#']");
  if (subLinks.length) {
    const map = new Map(subLinks.map((a) => [a.getAttribute("href").slice(1), a]));
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        subLinks.forEach((a) => a.classList.remove("is-active"));
        const link = map.get(en.target.id);
        if (link) {
          link.classList.add("is-active");
          link.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    map.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* ---------- Biografías del equipo ---------- */
  $$("[data-bio]").forEach((btn) => {
    const dlg = document.getElementById(btn.dataset.bio);
    if (!dlg) return;
    btn.addEventListener("click", () => { dlg.showModal(); lenis(false); });
    dlg.addEventListener("close", () => lenis(true));
    $("[data-bio-close]", dlg)?.addEventListener("click", () => dlg.close());
    dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
  });

  /* ---------- Formulario de contacto ----------
     Sin servidor todavía: valida y abre el correo del visitante con el mensaje
     ya redactado. Para conectarlo a un CRM basta con reemplazar send(). */
  const form = $("#form-contacto");
  if (form) {
    const service = new URLSearchParams(location.search).get("servicio");
    if (service) {
      const opt = $$("option", form.servicio).find((o) => o.value === service);
      if (opt) form.servicio.value = service;
    }

    const validate = (field) => {
      const input = $("input,select,textarea", field);
      const ok = input.checkValidity();
      field.classList.toggle("is-invalid", !ok);
      return ok;
    };
    $$(".field", form).forEach((f) => {
      const input = $("input,select,textarea", f);
      input?.addEventListener("blur", () => input.value && validate(f));
      input?.addEventListener("input", () => f.classList.contains("is-invalid") && validate(f));
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
      const to = form.dataset.to;
      const subject = `Consulta web — ${data.get("servicio")}`;
      location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
    };

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fields = $$(".field", form).filter((f) => $("[required]", f));
      const bad = fields.filter((f) => !validate(f));
      if (bad.length) { $("input,select,textarea", bad[0]).focus(); return; }
      send(new FormData(form));
      form.classList.add("is-sent");
    });
  }

  /* ---------- Enlaces "Agendar" desde un servicio ---------- */
  // Los botones con data-servicio preseleccionan el servicio en el formulario.
  $$("a[data-servicio]").forEach((a) => {
    a.href = `contacto.html?servicio=${encodeURIComponent(a.dataset.servicio)}#agenda`;
  });
})();
