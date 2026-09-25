// CIDRIA landing — menú móvil, carrusel de muestras, formulario y reveals.

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- Menú móvil ----------
const toggle = document.querySelector(".menu-toggle");
const menu = document.getElementById("main-menu");
toggle?.addEventListener("click", () => {
  const open = menu.classList.toggle("main-menu-open");
  toggle.setAttribute("aria-expanded", String(open));
  toggle.querySelector("b").textContent = open ? "×" : "+";
});
menu?.addEventListener("click", (e) => {
  if (e.target.closest("a") && menu.classList.contains("main-menu-open")) toggle.click();
});

// ---------- Muro de cámaras ----------
// Cada recuadro rota entre sus clips. Para agregar uno: pon el .mp4 y su -poster.jpg
// en esta carpeta y suma una línea en la lista del recuadro que corresponda.
const PLAYLISTS = [
  [ // CAM-04 · laboratorio
    { v: "lab", t: "Farma", l: "Área controlada" },
    { v: "lab-microbiologia", t: "Microbiología", l: "Farma · siembra" },
    { v: "lab-placas", t: "Placas de cultivo", l: "Laboratorio · control de calidad" },
    { v: "lab-mesa", t: "Mesa de trabajo", l: "Laboratorio · análisis" },
    { v: "lab-dosificacion", t: "Dosificación", l: "Laboratorio · preparación" },
  ],
  [ // CAM-05 · empaque farma
    { v: "farma-empaque", t: "Empaque", l: "Farma · fin de línea", p: "farma-poster" },
    { v: "farma-cajas", t: "Estuchado", l: "Farma · empaque secundario" },
    { v: "etiquetado", t: "Etiquetado", l: "Farma · área limpia" },
    { v: "farma-encajonado", t: "Encajonado", l: "Farma · despacho" },
  ],
  [ // CAM-02 · plásticos
    { v: "plasticos-empaque", t: "Pesaje", l: "Plásticos · soplado" },
    { v: "plasticos-ensamblaje", t: "Ensamblaje", l: "Plásticos · línea" },
    { v: "plasticos-acabado", t: "Acabado", l: "Plásticos · control de calidad" },
    { v: "plasticos-envasado", t: "Envasado", l: "Plásticos · fin de línea" },
    { v: "plasticos-empaque-tubos", t: "Empaque", l: "Plásticos · embolsado" },
  ],
  [ // CAM-07 · operación y logística
    { v: "logistica", t: "Logística", l: "Almacén · apilador" },
    { v: "maquina-limpieza", t: "Operación de máquina", l: "Inyección · limpieza de molde" },
    { v: "logistica-pallets", t: "Paletizado", l: "Almacén · transpaleta" },
    { v: "lavado-piezas", t: "Lavado de piezas", l: "Planta · mantenimiento" },
  ],
];

(() => {
  const feeds = [...document.querySelectorAll(".feed")];
  if (!feeds.length) return;
  const pad = (n) => String(n).padStart(2, "0");

  feeds.forEach((feed, k) => {
    const list = PLAYLISTS[k];
    const video = feed.querySelector("video");
    if (!list || !video) return;
    let i = 0;
    video.loop = list.length < 2;
    const warm = new Image(); // precarga el poster del siguiente clip

    const show = (n) => {
      const c = list[n];
      feed.classList.add("is-switching");
      setTimeout(() => {
        video.src = `${c.v}.mp4`;
        video.poster = `${c.p || c.v + "-poster"}.jpg`;
        feed.querySelector("figcaption b").textContent = c.t;
        feed.querySelector("figcaption span").textContent = c.l;
        if (feed.dataset.visible === "1" && !reduceMotion) video.play().catch(() => {});
        feed.classList.remove("is-switching");
        const nx = list[(n + 1) % list.length];
        warm.src = `${nx.p || nx.v + "-poster"}.jpg`;
      }, 350);
    };
    video.addEventListener("ended", () => { i = (i + 1) % list.length; show(i); });
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      const v = target.querySelector("video");
      target.dataset.visible = isIntersecting ? "1" : "0";
      if (isIntersecting && !reduceMotion) v.play().catch(() => {});
      else v.pause();
    });
  }, { threshold: 0.25 });
  feeds.forEach((f) => io.observe(f));

  setInterval(() => {
    feeds.forEach((f) => {
      const s = Math.floor(f.querySelector("video").currentTime);
      f.querySelector(".feed-tc").textContent = `00:${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
    });
  }, 250);
})();

// ---------- Formulario (Netlify Forms) ----------
const form = document.querySelector(".interest-form");
if (form) {
  const status = form.querySelector(".form-status");
  if (new URLSearchParams(location.search).has("sent")) {
    status.textContent = "Gracias, recibimos tu mensaje.";
    form.classList.add("is-sent");
  }
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (window.CIDRIA_PREVIEW) {
      status.textContent = "Vista previa: el formulario envía de verdad cuando el sitio esté en Netlify.";
      return;
    }
    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    status.textContent = "Enviando…";
    try {
      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(form)).toString(),
      });
      if (!res.ok) throw new Error(res.status);
      form.reset();
      form.classList.add("is-sent");
      status.textContent = "Gracias, recibimos tu mensaje. Te escribimos pronto.";
      if (typeof gtag === "function") gtag("event", "generate_lead", { form_name: "interest" });
    } catch {
      status.textContent = "No se pudo enviar. Intenta de nuevo en un momento.";
    } finally {
      btn.disabled = false;
    }
  });
}

// ---------- Reveal al hacer scroll ----------
const reveals = document.querySelectorAll(".reveal-on-scroll");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add("is-visible");
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.15 });
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add("is-visible"));
}

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

// ---------- HUD del hero: timecode, frames, confianza ----------
(() => {
  const tc = document.getElementById("hero-tc");
  const fr = document.getElementById("hero-frame");
  const confs = document.querySelectorAll("[data-conf]");
  if (!tc) return;
  const t0 = performance.now();
  const pad = (n, l = 2) => String(n).padStart(l, "0");
  const loop = () => {
    const ms = performance.now() - t0;
    const f = Math.floor(ms / (1000 / 30));
    const s = Math.floor(ms / 1000);
    tc.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(f % 30)}`;
    fr.textContent = pad(f, 6);
    if (f % 12 === 0) confs.forEach((c) => {
      const base = parseFloat(c.dataset.conf);
      c.textContent = Math.min(0.99, base + (Math.random() - 0.5) * 0.04).toFixed(2);
    });
    if (!reduceMotion) requestAnimationFrame(loop);
  };
  loop();
})();

// ---------- Texto que se "decodifica" al cargar ----------
(() => {
  if (reduceMotion) return;
  const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/·+";
  document.querySelectorAll("[data-scramble]").forEach((el, k) => {
    const final = el.textContent;
    let frame = 0;
    const total = 22 + k * 4;
    const run = () => {
      el.textContent = final.split("").map((ch, i) => {
        if (ch === " " || frame / total > i / final.length) return ch;
        return glyphs[Math.floor(Math.random() * glyphs.length)];
      }).join("");
      if (++frame <= total) requestAnimationFrame(run); else el.textContent = final;
    };
    setTimeout(run, 150 + k * 120);
  });
})();

// ---------- Brillo que sigue al cursor en la retícula del hero ----------
(() => {
  const hero = document.querySelector(".hero");
  if (!hero || reduceMotion || !matchMedia("(pointer:fine)").matches) return;
  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    hero.style.setProperty("--mx", `${e.clientX - r.left}px`);
    hero.style.setProperty("--my", `${e.clientY - r.top}px`);
  });
})();
