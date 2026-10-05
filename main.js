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

// ---------- Sala de clips ----------
// Para agregar un clip: pon el .mp4 y su -poster.jpg en esta carpeta y suma una línea aquí.
// cat = áreas donde aparece en los filtros (puede ser más de una).
// p = nombre del poster si no sigue el patrón <video>-poster.jpg
const AREAS = ["Laboratorio", "Farma", "Bebidas", "Plásticos", "Acabados", "Almacén", "Operación"];
const CLIPS = [
  { v: "lab", t: "Laboratorio", l: "Farma · área controlada", cat: ["Laboratorio", "Farma"] },
  { v: "plasticos-ensamblaje", t: "Ensamblaje", l: "Plásticos · línea", cat: ["Plásticos", "Acabados"] },
  { v: "logistica", t: "Almacén", l: "Bodega · apilador eléctrico", cat: ["Almacén"] },
  { v: "maquina-limpieza", t: "Operación de máquina", l: "Inyección · limpieza de molde", cat: ["Operación", "Plásticos"] },
  { v: "lab-microbiologia", t: "Microbiología", l: "Laboratorio · siembra", cat: ["Laboratorio"] },
  { v: "plasticos-acabado", t: "Acabado", l: "Plásticos · rebabeo", cat: ["Acabados", "Plásticos"] },
  { v: "etiquetado", t: "Etiquetado", l: "Farma · área limpia", cat: ["Farma", "Acabados"] },
  { v: "plasticos-empaque", t: "Pesaje", l: "Plásticos · soplado", cat: ["Plásticos"] },
  { v: "lab-placas", t: "Placas de cultivo", l: "Laboratorio · control de calidad", cat: ["Laboratorio", "Farma"] },
  { v: "lavado-piezas", t: "Lavado de piezas", l: "Planta · mantenimiento", cat: ["Operación"] },
  { v: "plasticos-empaque-tubos", t: "Embolsado", l: "Plásticos · empaque", cat: ["Plásticos", "Almacén"] },
];

(() => {
  const reel = document.querySelector(".reel");
  if (!reel) return;
  const $ = (id) => document.getElementById(id);
  const video = $("reel-video");
  const strip = $("reel-strip");
  const filtersWrap = reel.querySelector(".reel-filters");
  const pad = (n) => String(n).padStart(2, "0");
  const poster = (c) => `${c.p || c.v + "-poster"}.jpg`;
  let filter = "Todo";
  let list = CLIPS;
  let i = 0;
  let visible = false;

  $("reel-count").textContent = "Captura continua en plantas y laboratorios de la región";

  // Filtros
  ["Todo", ...AREAS.filter((a) => CLIPS.some((c) => c.cat.includes(a)))].forEach((cat) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = cat;
    b.setAttribute("role", "tab");
    b.addEventListener("click", () => setFilter(cat));
    filtersWrap.appendChild(b);
  });

  function buildStrip() {
    strip.innerHTML = "";
    list.forEach((c, n) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "reel-thumb";
      b.setAttribute("role", "listitem");
      b.setAttribute("aria-label", `${c.t}: ${c.l}`);
      b.innerHTML = `<img src="${poster(c)}" alt="" loading="lazy"><span class="reel-thumb-t">${c.t}</span><i></i>`;
      b.addEventListener("click", () => show(n));
      strip.appendChild(b);
    });
  }

  function setFilter(cat) {
    filter = cat;
    list = cat === "Todo" ? CLIPS : CLIPS.filter((c) => c.cat.includes(cat));
    [...filtersWrap.children].forEach((b) => {
      const on = b.textContent === cat;
      b.classList.toggle("active", on);
      b.setAttribute("aria-selected", String(on));
    });
    buildStrip();
    show(0);
  }

  function play() {
    if (visible && !reduceMotion) video.play().catch(() => {});
  }

  function show(n) {
    i = (n + list.length) % list.length;
    const c = list[i];
    reel.classList.add("is-switching");
    setTimeout(() => {
      video.src = `${c.v}.mp4`;
      video.poster = poster(c);
      $("reel-title").textContent = c.t;
      $("reel-label").textContent = c.l;
      $("reel-bar").style.width = "0%";
      [...strip.children].forEach((el, k) => el.classList.toggle("active", k === i));
      const active = strip.children[i];
      if (active) strip.scrollTo({ left: active.offsetLeft - strip.clientWidth / 2 + active.clientWidth / 2, behavior: reduceMotion ? "auto" : "smooth" });
      reel.classList.remove("is-switching");
      play();
    }, 300);
  }

  video.loop = false;
  video.addEventListener("ended", () => show(i + 1));
  video.addEventListener("timeupdate", () => {
    const s = Math.floor(video.currentTime);
    $("reel-tc").textContent = `00:${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
    const pct = video.duration ? (video.currentTime / video.duration) * 100 : 0;
    $("reel-bar").style.width = `${pct}%`;
    const bar = strip.children[i]?.querySelector("i");
    if (bar) bar.style.width = `${pct}%`;
  });
  reel.querySelectorAll(".reel-nav button").forEach((b) =>
    b.addEventListener("click", () => show(i + Number(b.dataset.dir)))
  );
  reel.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") show(i + 1);
    if (e.key === "ArrowLeft") show(i - 1);
  });

  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) play(); else video.pause();
  }, { threshold: 0.3 }).observe(video);

  setFilter("Todo");
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

// ---------- Hero: video real ↔ reconstrucción 3D ----------
// El clip ya trae la secuencia armada; aquí solo cambia la etiqueta según el tramo.
(() => {
  const v = document.getElementById("hero-video");
  const mode = document.getElementById("hero-mode");
  if (!v || !mode) return;
  const IN = 3.95, OUT = 8.55; // segundos del clip donde se ve la vista 3D
  const frame = v.closest(".pov-frame");
  v.addEventListener("timeupdate", () => {
    const is3d = v.currentTime >= IN && v.currentTime <= OUT;
    mode.textContent = is3d ? "RECONSTRUCCIÓN 3D DE LAS MANOS" : "VIDEO REAL · SEGUIMIENTO DE MANOS";
    frame.classList.toggle("is-3d", is3d);
  });
  if (reduceMotion) { v.removeAttribute("autoplay"); v.pause(); }
  else v.play().catch(() => {});
})();
