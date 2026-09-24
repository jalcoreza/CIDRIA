# CIDRIA — landing

Sitio estático (HTML + CSS + JS, sin build).

- `index.html` — estructura y textos
- `assets/css/styles.css` — estilos (tokens de marca en `:root`)
- `assets/js/main.js` — menú móvil, muro de cámaras, formulario
- `assets/video/` y `assets/img/` — clips (mp4 H.264, sin audio, ~1–2 MB) y fotos del muro de cámaras. Para agregar uno, copia un `<figure class="feed">` en index.html

## Probar local
    python3 -m http.server 8080    # abre http://localhost:8080

## Deploy
Netlify → Add new site → Import from Git → elige el repo. No hay build command; publica la raíz (`netlify.toml` ya lo define).
El formulario usa Netlify Forms: los envíos aparecen en Netlify → Forms (activa notificaciones por email ahí).
