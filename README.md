# All in One Professional Services — Sitio web

Sitio estático en español para **All in One Professional Services**: contabilidad, nómina,
impuestos, trámites e impuestos internacionales. Estructura inspirada en
suarezcamarena.com, con la paleta propia de la marca (verde bosque + oro, base marfil) y el
mismo motor de animación que JP Real Estate (GSAP + ScrollTrigger + Lenis).

Dominio: `allinone.dgp-link.com` (GitHub Pages, ver `CNAME`).

## Páginas

| Página | Archivo | Contenido |
| --- | --- | --- |
| Inicio | `index.html` | Hero con tablero animado, marquesina, promesa, 8 servicios, 3 trámites, impuestos internacionales, quiénes somos, proceso, por qué elegirnos, FAQ y CTA |
| Quiénes Somos | `quienes-somos.html` | Historia, grupo de trabajo con biografías, lo que nos caracteriza, misión, visión y valores |
| Servicios | `servicios.html` | Contabilidad, Nómina, Sales Tax, Impuestos personales, Impuestos empresariales, Resolución de problemas, Estrategias fiscales y Notaría |
| Trámites | `tramites.html` | Creación y registro de empresas, Solicitud y renovación de ITIN, Cierre y disolución de empresas |
| Impuestos Internacionales | `impuestos-internacionales.html` | Declaraciones personales con ingresos internacionales, empresariales con socios extranjeros y asesoría en requisitos de ley |
| Contacto | `contacto.html` | Datos de contacto, horario y formulario (preselecciona el servicio desde cualquier botón “Cotizar/Agendar”) |
| 404 | `404.html` | Página de error |

## Cómo se edita

Los HTML de la raíz **se generan**: no se editan a mano.

```
src/site.json        Teléfono, correo, dirección, horario y redes (se usan en todo el sitio)
src/pages/*.html     Contenido de cada página
src/partials/        head, header (menú), footer, cta e íconos — compartidos por todas las páginas
assets/css/styles.css  Sistema de diseño y estilos
assets/js/main.js      Menús, panel móvil, sub-navegación, biografías y formulario
assets/js/motion.js    Animaciones (preloader, títulos, parallax, marquesina, magnéticos…)
assets/vendor/         GSAP 3.12.5, ScrollTrigger y Lenis (locales, sin CDN)
```

Después de cambiar algo en `src/`:

```bash
node build.mjs
```

Para verlo en local:

```bash
python3 -m http.server 8080
```

## Animaciones

- Preloader con el logo (solo en la primera página de la sesión)
- Títulos que se revelan palabra por palabra y texto que se ilumina con el scroll
- Scroll suave (Lenis), parallax en los heroes y el globo internacional que gira
- Tablero del hero con inclinación 3D según el mouse
- Marquesina que acelera y se inclina con la velocidad del scroll
- Contadores, cortina en la imagen de “Quiénes somos”, CTA que se expande
- Botones magnéticos y foco de luz que sigue al cursor en las tarjetas
- Wordmark gigante en el footer

Con “reducir movimiento” activado, o si GSAP no carga, el sitio se muestra completo y estático.

## Pendiente del cliente

- [ ] Logo oficial (hoy se usa un isotipo provisional en SVG)
- [ ] Teléfono, WhatsApp, correo, dirección y redes → `src/site.json`
- [ ] Nombres, cargos, fotos y biografías del equipo → `src/pages/quienes-somos.html`
- [ ] Confirmar el notario asociado (Joshua) para Servicios de notaría
- [ ] Revisar textos de misión, visión y valores
- [ ] Versión en inglés (el sitio ya indica atención ES · EN)
- [ ] Conectar el formulario a un CRM o correo (hoy abre el correo del visitante con el mensaje listo)
