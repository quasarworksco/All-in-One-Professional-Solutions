# All in One Professional Services — Sitio web

Sitio estático en español para **All in One Professional Services**: contabilidad, nómina,
impuestos, trámites e impuestos internacionales. La estructura sigue suarezcamarena.com (la
referencia del cliente) y el diseño usa el mismo lenguaje editorial que JP Real Estate:

- fotografía real a sangre;
- tipografía grande en Inter Tight (alojada en el sitio), con acentos dorados en peso fino en lugar de una serif;
- líneas finas en lugar de tarjetas;
- paleta de tinta verde casi negra, papel cálido y un oro discreto.

Publicado en GitHub Pages: https://quasarworksco.github.io/All-in-One-Professional-Solutions/
(si más adelante se usa un dominio propio, se agrega un archivo `CNAME` y se cambian `url` y `basePath` en `src/site.json`).

## Páginas

| Página | Archivo | Contenido |
| --- | --- | --- |
| Inicio | `index.html` | Hero “Soluciones contables y fiscales para hacer crecer tu negocio”, 4 áreas de servicio, trámites, por qué elegirnos, International Tax Services, a quién ayudamos, quiénes somos, proceso, FAQ y banda final |
| Quiénes Somos | `quienes-somos.html` | Historia, equipo (6 personas), misión, visión y valores |
| Servicios | `servicios.html` | 1. Contabilidad y asesoría empresarial · 2. Preparación y planificación de impuestos · 3. Administración y cumplimiento empresarial · 4. Servicios tributarios especializados (incluye International Tax Services) |
| Trámites | `tramites.html` | Creación y registro de empresas, ITIN, cierre y disolución de empresas, servicios de notaría |
| Contacto | `contacto.html` | Datos de contacto y formulario (preselecciona el servicio desde cualquier botón “Cotizar/Agendar”) |
| 404 | `404.html` | Página de error |

`impuestos-internacionales.html` ya no es una página: redirige a Servicios → Servicios tributarios especializados.

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

## Publicar en Vercel (link gratis *.vercel.app)

1. En vercel.com → **Add New… → Project** → importar `quasarworksco/All-in-One-Professional-Solutions`.
2. No hay que configurar nada: `vercel.json` ya define el build (`node build.mjs`) y la carpeta de salida.
   El build toma el dominio de Vercel automáticamente para las URLs canónicas, el sitemap y la 404.
3. Cada push a `main` se publica solo.

GitHub Pages sigue funcionando en paralelo con su propia dirección.

## Animaciones

- Loader de 1.5 s (el logo se dibuja como una gráfica y la pantalla se abre en dos); sale solo la primera vez que alguien entra al sitio
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
- [ ] Dirección completa de la oficina en Richmond, TX y confirmar que el WhatsApp es el mismo teléfono → `src/site.json`
- [ ] Fotos de Nirilu y Joshua, y foto grupal del equipo para la sección “Quiénes somos” del inicio
- [ ] Revisar textos de misión, visión y valores
- [ ] Versión en inglés
- [ ] Conectar el formulario a un CRM o correo (hoy abre el correo del visitante con el mensaje listo)
