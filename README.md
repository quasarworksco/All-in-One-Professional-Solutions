# All in One Professional Services — Sitio web

Sitio estático en español para **All in One Professional Services**: contabilidad, nómina,
impuestos, trámites e impuestos internacionales. La estructura sigue suarezcamarena.com (la
referencia del cliente) y el diseño usa el mismo lenguaje editorial que JP Real Estate:

- fotografía real a sangre;
- tipografía grande en Inter Tight (alojada en el sitio), con acentos dorados en peso fino en lugar de una serif;
- líneas finas en lugar de tarjetas;
- paleta de tinta verde casi negra, papel cálido y un oro discreto.

Dominio: `allinone.dgp-link.com` (GitHub Pages, ver `CNAME`).

## Páginas

| Página | Archivo | Contenido |
| --- | --- | --- |
| Inicio | `index.html` | Hero con foto y palabras que rotan, promesa, 8 servicios en filas con vista previa, marquesina, trámites, por qué elegirnos, internacional, galería horizontal “A quién ayudamos”, quiénes somos, proceso, FAQ y banda final |
| Quiénes Somos | `quienes-somos.html` | Historia, grupo de trabajo con biografías, misión, visión y valores |
| Servicios | `servicios.html` | Contabilidad, Nómina, Sales Tax, Impuestos personales, Impuestos empresariales, Resolución de problemas, Estrategias fiscales y Notaría |
| Trámites | `tramites.html` | Creación y registro de empresas, Solicitud y renovación de ITIN, Cierre y disolución de empresas |
| Impuestos Internacionales | `impuestos-internacionales.html` | Personas con ingresos internacionales, empresas con socios extranjeros y asesoría en requisitos de ley |
| Contacto | `contacto.html` | Datos de contacto y formulario (preselecciona el servicio desde cualquier botón “Cotizar/Agendar”) |
| 404 | `404.html` | Página de error |

## Cómo se edita

Los HTML de la raíz **se generan**, no se editan a mano.

```
src/site.json          Teléfono, correo, dirección, horario y redes (se usan en todo el sitio)
src/pages/*.html       Contenido de cada página
src/partials/          head, header (menú y menú móvil), footer, banda final e íconos
assets/css/styles.css  Sistema de diseño
assets/js/main.js      Menús, animaciones (GSAP + ScrollTrigger + Lenis), cursor y formulario
assets/fonts/          Inter Tight (variable 300–700)
assets/img/photos/     Fotografías (WebP)
assets/vendor/         GSAP 3.12.5, ScrollTrigger y Lenis
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

- Loader de 1.2 s (el logo se dibuja como una gráfica y la pantalla se abre en dos); sale solo la primera vez que alguien entra al sitio
- Hero con zoom de la foto, títulos por líneas y palabras que rotan (“en regla / al día / en orden / sin estrés”)
- Scroll suave con Lenis y parallax en heroes e imágenes
- Navegación que se oculta al bajar y reaparece al subir
- Títulos que se revelan palabra por palabra y texto que se ilumina con el scroll
- Lista de servicios con relleno al pasar el mouse y vista previa de la foto que sigue al cursor
- Marquesina que reacciona a la velocidad del scroll
- Galería horizontal anclada (“A quién ayudamos”)
- Imágenes con cortina, sello giratorio, contadores y banda final que se expande
- Cursor con inversión de color, botones magnéticos y texto que rueda en botones y menú

Con “reducir movimiento” activado, o si GSAP no carga, el sitio se muestra completo y estático.

## Fotografías

Son de [Unsplash](https://unsplash.com/license), con licencia gratuita para uso comercial.
Las del hero y la banda final son del skyline de Houston (la oficina está en Richmond, TX). Se pueden reemplazar
por fotos propias del cliente manteniendo el mismo nombre de archivo en `assets/img/photos/`.

## Pendiente del cliente

- [ ] Logo oficial (hoy se usa un isotipo provisional en SVG)
- [ ] Dirección completa de la oficina en Richmond, TX, confirmar que el WhatsApp es el mismo teléfono y enlaces de redes → `src/site.json`
- [ ] Nombres, cargos, fotos y biografías del equipo → `src/pages/quienes-somos.html`
- [ ] Confirmar el notario asociado (Joshua) para Servicios de notaría
- [ ] Revisar textos de misión, visión y valores
- [ ] Versión en inglés
- [ ] Conectar el formulario a un CRM o correo (hoy abre el correo del visitante con el mensaje listo)
