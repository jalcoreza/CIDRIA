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
// Para cambiar un clip: reemplaza el .mp4 en assets/video/ o edita el <figure class="feed"> en index.html.
(() => {
  const feeds = [...document.querySelectorAll(".feed")];
  if (!feeds.length) return;
  const pad = (n) => String(n).padStart(2, "0");
  const io = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      const v = target.querySelector("video");
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
