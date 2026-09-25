# CIDRIA — landing

Sitio estático (HTML + CSS + JS, sin build).

- Todo está en la raíz: `index.html`, `styles.css`, `main.js`, fotos (.jpg) y clips (.mp4 H.264 sin audio, ~1–2 MB).

## Probar local
    python3 -m http.server 8080    # abre http://localhost:8080

## Deploy
Netlify → Add new site → Import from Git → elige el repo. No hay build command; publica la raíz (`netlify.toml` ya lo define).
El formulario usa Netlify Forms: los envíos aparecen en Netlify → Forms (activa notificaciones por email ahí).
