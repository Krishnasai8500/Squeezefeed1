import { useEffect, useRef } from "react";

const ORG = "#FF6A00";
const ORG2 = "#cc5200";

function ease(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}
function lerp(a, b, t) {
  return a + (b - a) * t;
}
function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export default function SplashScreen({ onDone }) {
  const splashRef = useRef(null);
  const canvasRef = useRef(null);
  const stateRef = useRef({ particles: [], rafId: null });

  useEffect(() => {
    const splash = splashRef.current;
    const canvas = canvasRef.current;
    if (!splash || !canvas) return;
    const s = stateRef.current;

    const W = () => splash.clientWidth;
    const H = () => splash.clientHeight;
    const CX = () => W() / 2;
    const CY = () => H() / 2;

    // ── Canvas particle loop ──────────────────────────────
    canvas.width = W();
    canvas.height = H();
    const ctx = canvas.getContext("2d");

    function spawnBurst(x, y, count, speed, life, size, colors) {
      for (let i = 0; i < count; i++) {
        const a = (Math.PI * 2 * i) / count + Math.random() * 0.3;
        const sp = speed * (0.5 + Math.random() * 0.8);
        s.particles.push({
          x,
          y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - Math.random() * 2,
          life,
          maxLife: life,
          size: size * (0.5 + Math.random()),
          color: colors[Math.floor(Math.random() * colors.length)],
          spin: (Math.random() - 0.5) * 0.3,
          shape: Math.random() > 0.5 ? "circle" : "rect",
        });
      }
    }

    function spawnTrail(x, y) {
      s.particles.push({
        x: x + (Math.random() - 0.5) * 4,
        y: y + (Math.random() - 0.5) * 4,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -Math.random() * 1.5,
        life: 20,
        maxLife: 20,
        size: 2 + Math.random() * 2,
        color: Math.random() > 0.5 ? ORG : "#fff",
        shape: "circle",
        spin: 0,
      });
    }

    function startLoop() {
      function loop() {
        s.rafId = requestAnimationFrame(loop);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        s.particles = s.particles.filter((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.06;
          p.vx *= 0.98;
          p.life--;
          const progress = p.life / p.maxLife;
          ctx.globalAlpha = progress * 0.9;
          ctx.fillStyle = p.color;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.spin * (1 - progress));
          if (p.shape === "rect") {
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
          return p.life > 0;
        });
        ctx.globalAlpha = 1;
      }
      loop();
    }

    function animate(ms, fn) {
      return new Promise((resolve) => {
        const t0 = performance.now();
        function frame(now) {
          const t = Math.min((now - t0) / ms, 1);
          fn(t, ease(t), easeOut(t));
          if (t < 1) requestAnimationFrame(frame);
          else resolve();
        }
        requestAnimationFrame(frame);
      });
    }

    // ── DOM helpers ───────────────────────────────────────
    function makeEl(css) {
      const el = document.createElement("div");
      el.style.cssText = css;
      splash.appendChild(el);
      return el;
    }

    // ── Scene elements ────────────────────────────────────
    let gridEl,
      scanEl,
      cornerEls = [],
      ringEls = [],
      barEls = [],
      dotEl;
    let titleEl, subtitleEl, taglineEl, glowEl;

    function buildGrid() {
      gridEl = makeEl(`
                position:absolute; inset:0; pointer-events:none; opacity:0;
                background-image:
                    linear-gradient(rgba(255,106,0,0.06) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,106,0,0.06) 1px, transparent 1px);
                background-size: 32px 32px;
                transition: opacity 0.5s;
            `);

      scanEl = makeEl(`
                position:absolute; left:0; right:0; height:3px; pointer-events:none;
                background:linear-gradient(90deg,transparent,rgba(255,106,0,0.6),transparent);
                box-shadow: 0 0 12px rgba(255,106,0,0.4);
                top:-3px; opacity:0;
            `);
    }

    function buildCorners() {
      const positions = [
        { top: 16, left: 16, borderTop: "2px solid", borderLeft: "2px solid" },
        {
          top: 16,
          right: 16,
          borderTop: "2px solid",
          borderRight: "2px solid",
        },
        {
          bottom: 16,
          left: 16,
          borderBottom: "2px solid",
          borderLeft: "2px solid",
        },
        {
          bottom: 16,
          right: 16,
          borderBottom: "2px solid",
          borderRight: "2px solid",
        },
      ];
      cornerEls = positions.map((pos) => {
        const css = Object.entries({
          position: "absolute",
          width: "32px",
          height: "32px",
          borderColor: "rgba(255,106,0,0.7)",
          opacity: 0,
          transition: "all 0.4s",
          ...pos,
        })
          .map(([k, v]) => `${k.replace(/([A-Z])/g, "-$1").toLowerCase()}:${v}`)
          .join(";");
        return makeEl(css);
      });
    }

    function buildRings() {
      ringEls = [0, 1, 2].map((i) => {
        const size = 220 + i * 80;
        return makeEl(`
                    position:absolute;
                    width:${size}px; height:${size}px;
                    border-radius:50%;
                    border:1px solid rgba(255,106,0,${0.3 - i * 0.08});
                    left:calc(50% - ${size / 2}px);
                    top:calc(50% - ${size / 2}px);
                    opacity:0;
                    box-shadow: inset 0 0 ${20 + i * 10}px rgba(255,106,0,${0.05 - i * 0.01}),
                                0 0 ${20 + i * 10}px rgba(255,106,0,${0.08 - i * 0.02});
                `);
      });
    }

    function buildBars() {
      const defs = [
        { w: 62, yOff: -95 },
        { w: 48, yOff: -66 },
        { w: 36, yOff: -37 },
        { w: 24, yOff: -8 },
        { w: 14, yOff: 21 },
      ];
      barEls = defs.map((d) =>
        makeEl(`
                position:absolute;
                width:${d.w}%; height:10px; border-radius:5px;
                background:linear-gradient(90deg,${ORG},${ORG2});
                left:50%; top:calc(50% + ${d.yOff}px);
                transform:translateX(-50%) scaleX(0);
                opacity:0;
                box-shadow: 0 0 12px rgba(255,106,0,0.5), 0 0 4px rgba(255,106,0,0.8);
            `),
      );

      dotEl = makeEl(`
                position:absolute; width:14px; height:14px; border-radius:50%;
                background:${ORG}; left:50%; top:calc(50% + 50px);
                transform:translateX(-50%) scale(0); opacity:0;
                box-shadow:0 0 20px ${ORG}, 0 0 40px rgba(255,106,0,0.5);
            `);
    }

    function buildTitle() {
      glowEl = makeEl(`
                position:absolute; width:300px; height:300px; border-radius:50%;
                background:radial-gradient(circle, rgba(255,106,0,0.15) 0%, transparent 70%);
                left:calc(50% - 150px); bottom:5%; pointer-events:none; opacity:0;
            `);

      titleEl = makeEl(`
                position:absolute; left:50%; bottom:22%;
                transform:translateX(-50%) translateY(30px);
                white-space:nowrap; opacity:0;
                display:flex; align-items:center; gap:0;
                font-family:'Space Grotesk',sans-serif;
                font-size:clamp(32px,8vw,52px); font-weight:900;
                letter-spacing:-2px; line-height:1;
            `);
      titleEl.innerHTML = `
                <span style="color:#ffffff">Squeeze</span>
                <span style="color:#FF6A00;text-shadow:0 0 30px rgba(255,106,0,0.8),0 0 60px rgba(255,106,0,0.4)">Feed</span>
            `;

      taglineEl = makeEl(`
                position:absolute; left:50%; bottom:14%;
                transform:translateX(-50%); opacity:0; white-space:nowrap;
                font-family:'Space Grotesk',sans-serif;
                font-size:clamp(9px,2.2vw,12px); color:rgba(255,255,255,0.35);
                letter-spacing:0.2em; text-transform:uppercase;
            `);
      taglineEl.textContent = "squeeze the noise  ·  keep the signal";
    }

    // ── Scenes ────────────────────────────────────────────

    async function sceneGrid() {
      buildGrid();
      buildCorners();
      gridEl.style.opacity = "0.6";
      // Animate scan line
      scanEl.style.opacity = "1";
      await animate(1200, (t, e) => {
        scanEl.style.top = `${e * 110}%`;
        // Trail particles along scan
        if (Math.random() > 0.6)
          spawnTrail(
            Math.random() * W(),
            (parseFloat(scanEl.style.top) / 100) * H(),
          );
      });
      scanEl.style.opacity = "0";

      // Corner brackets snap in
      await Promise.all(
        cornerEls.map(
          (el, i) =>
            new Promise((res) =>
              setTimeout(() => {
                animate(300, (t, e) => {
                  el.style.opacity = String(e);
                }).then(res);
              }, i * 60),
            ),
        ),
      );
      await wait(200);
    }

    async function sceneBars() {
      buildRings();
      buildBars();

      // Rings fade in
      ringEls.forEach((r, i) => {
        setTimeout(() => {
          animate(400, (t, e) => {
            r.style.opacity = String(e * 1);
          });
        }, i * 100);
      });
      await wait(300);

      // Bars sweep in one by one
      for (let i = 0; i < barEls.length; i++) {
        const bar = barEls[i];
        await animate(180, (t, e) => {
          bar.style.opacity = String(e);
          bar.style.transform = `translateX(-50%) scaleX(${e})`;
        });
        // Burst at bar tip
        const rect = bar.getBoundingClientRect();
        const sr = splash.getBoundingClientRect();
        spawnBurst(
          rect.right - sr.left,
          rect.top - sr.top + rect.height / 2,
          8,
          3,
          20,
          2,
          [ORG, "#fff", ORG2],
        );
        await wait(40);
      }

      // Dot pop
      await animate(250, (t, e) => {
        dotEl.style.opacity = String(e);
        dotEl.style.transform = `translateX(-50%) scale(${e * 1.2})`;
      });
      spawnBurst(CX(), CY() + 50, 24, 5, 35, 3, [ORG, "#fff", ORG2, "#ffaa00"]);
      await wait(400);
    }

    async function sceneExplode() {
      // Bars explode outward
      const cx = CX(),
        cy = CY();
      await animate(600, (t, e) => {
        barEls.forEach((bar, i) => {
          const dir = i % 2 === 0 ? 1 : -1;
          const dist = e * (i + 1) * W() * 0.08;
          bar.style.transform = `translateX(calc(-50% + ${dir * dist}px)) scaleX(${1 + e * 0.4})`;
          bar.style.opacity = String(1 - e);
        });
        dotEl.style.transform = `translateX(-50%) scale(${1 + e * 2})`;
        dotEl.style.opacity = String(1 - e);
        ringEls.forEach((r, i) => {
          r.style.transform = `scale(${1 + e * (0.3 + i * 0.15)})`;
          r.style.opacity = String((1 - e) * 1);
        });
      });

      // Mega burst
      for (let i = 0; i < 3; i++) {
        spawnBurst(cx, cy, 40, 8 + i * 3, 50 + i * 10, 3, [
          ORG,
          "#fff",
          ORG2,
          "#ffcc00",
        ]);
      }

      barEls.forEach((b) => b.remove());
      dotEl.remove();
      ringEls.forEach((r) => r.remove());
      barEls = [];
      ringEls = [];

      await wait(100);
    }

    async function sceneFinalReveal() {
      buildTitle();

      // Glow bloom
      await animate(400, (t, e) => {
        glowEl.style.opacity = String(e);
      });

      // Title slides up and fades in with shimmer
      await animate(700, (t, e) => {
        titleEl.style.opacity = String(e);
        titleEl.style.transform = `translateX(-50%) translateY(${(1 - e) * 24}px)`;
      });

      // Tagline fades in
      await animate(500, (t, e) => {
        taglineEl.style.opacity = String(e * 0.5);
      });

      // Hold for 1 second so user reads "SqueezeFeed"
      await wait(1000);

      // Final burst from title area
      const titleRect = titleEl.getBoundingClientRect();
      const sr = splash.getBoundingClientRect();
      spawnBurst(
        titleRect.left - sr.left + titleRect.width / 2,
        titleRect.top - sr.top + titleRect.height / 2,
        30,
        6,
        40,
        2.5,
        [ORG, "#fff", "#ffcc00"],
      );

      // Fade everything out
      await animate(500, (t, e) => {
        splash.style.opacity = String(1 - e);
      });

      cancelAnimationFrame(s.rafId);
      onDone?.();
    }

    async function run() {
      s.particles = [];
      startLoop();
      await sceneGrid();
      await sceneBars();
      await sceneExplode();
      await sceneFinalReveal();
    }

    run();
    return () => {
      cancelAnimationFrame(s.rafId);
    };
  }, []);

  return (
    <div
      ref={splashRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "#080808",
        overflow: "hidden",
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      {/* Radial glow center */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(255,106,0,0.08) 0%, transparent 70%)",
        }}
      />

      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}
