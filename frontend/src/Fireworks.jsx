import { useEffect, useRef } from "react";

const COLORS = ["#ffb627", "#ff5d73", "#ff9f1c", "#f72585", "#7ae582", "#4cc9f0", "#fff3b0", "#c77dff"];

export default function Fireworks({ onReady }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w, h, raf, auto;
    const rockets = [], sparks = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const newW = window.innerWidth;
      const newH = window.innerHeight;
      if (!w || Math.abs(newW - w) > 25 || Math.abs(newH - h) > 100) {
        w = newW; h = newH;
        canvas.width = w * dpr; canvas.height = h * dpr;
        canvas.style.width = w + "px"; canvas.style.height = h + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };
    resize();

    const burst = (x, y, big = false) => {
      const hue = COLORS[(Math.random() * COLORS.length) | 0];
      const alt = COLORS[(Math.random() * COLORS.length) | 0];
      const n = (big ? 120 : 80) + ((Math.random() * 40) | 0);
      const ring = Math.random() < 0.35;
      for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 * i) / n;
        const sp = ring ? 4.2 : Math.random() * 5 + 1;
        sparks.push({
          x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
          life: 1, decay: Math.random() * 0.012 + 0.008,
          color: Math.random() < 0.7 ? hue : alt, size: Math.random() * 1.6 + 1,
        });
      }
    };

    const launch = (tx, ty) => {
      rockets.push({ x: tx ?? Math.random() * w * 0.8 + w * 0.1, y: h, ty: ty ?? Math.random() * h * 0.45 + h * 0.08, vy: -(Math.random() * 3 + 9) });
    };

    const frame = () => {
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.y += r.vy; r.vy *= 0.985;
        ctx.fillStyle = "#ffe8a3";
        ctx.beginPath(); ctx.arc(r.x, r.y, 2, 0, 7); ctx.fill();
        if (r.y <= r.ty || r.vy > -1.5) { burst(r.x, r.y, true); rockets.splice(i, 1); }
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i];
        p.x += p.vx; p.y += p.vy; p.vx *= 0.97; p.vy = p.vy * 0.97 + 0.045; p.life -= p.decay;
        if (p.life <= 0) { sparks.splice(i, 1); continue; }
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 7); ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };
    frame();

    const onClick = (e) => {
      if (e.target.closest("button,a,input,.card,.page-nav,.author-highlight,.side-cracker-btn")) return;
      launch(e.clientX, e.clientY);
    };
    window.addEventListener("pointerdown", onClick);
    window.addEventListener("resize", resize);
    if (!reduce) auto = setInterval(() => launch(), 1100);
    onReady?.({
      show: () => { for (let i = 0; i < 6; i++) setTimeout(() => launch(), i * 220); },
      at: (x, y) => launch(x, y),
      grandFinale: () => {
        for (let i = 0; i < 16; i++) {
          setTimeout(() => {
            const rx = Math.random() * w * 0.85 + w * 0.075;
            const ry = Math.random() * h * 0.45 + 50;
            launch(rx, ry);
          }, i * 170);
        }
      },
    });
    setTimeout(() => { for (let i = 0; i < 4; i++) setTimeout(() => launch(), i * 300); }, 500);

    return () => {
      cancelAnimationFrame(raf); clearInterval(auto);
      window.removeEventListener("pointerdown", onClick);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="fx" aria-hidden="true" />;
}
