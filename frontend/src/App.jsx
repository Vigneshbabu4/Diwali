import { useEffect, useRef, useState } from "react";
import Fireworks from "./Fireworks.jsx";
import { createMusic } from "./music.js";

export default function App() {
  const fx = useRef(null);
  const [page, setPage] = useState("wishes");
  const [nightSky, setNightSky] = useState(false);
  const [isFiring, setIsFiring] = useState(false);

  // Automatically start music as soon as the site opens (with interaction fallback if blocked by browser policy)
  useEffect(() => {
    let unmounted = false;
    let musicInstance = null;

    const events = ["pointerdown", "touchstart", "click", "keydown", "scroll"];
    const onUserInteraction = () => {
      tryPlay();
    };

    const removeListeners = () => {
      events.forEach((ev) => window.removeEventListener(ev, onUserInteraction));
    };

    const tryPlay = () => {
      if (!musicInstance) return;
      const res = musicInstance.start();
      if (res && typeof res.then === "function") {
        res
          .then(() => removeListeners())
          .catch(() => {
            // Browser autoplay restricted unprompted audio; will play on first interaction
          });
      } else {
        removeListeners();
      }
    };

    events.forEach((ev) => window.addEventListener(ev, onUserInteraction, { passive: true }));

    createMusic().then((m) => {
      if (unmounted) {
        m.stop();
        return;
      }
      musicInstance = m;
      tryPlay();
    });

    return () => {
      unmounted = true;
      removeListeners();
      if (musicInstance) musicInstance.stop();
    };
  }, []);

  const handleFireCrackers = () => {
    setNightSky(true);
    setIsFiring(true);
    fx.current?.grandFinale?.();
    setTimeout(() => setIsFiring(false), 3200);
  };

  const share = () => {
    const msg = `Happy Diwali! Wishing you and your whole family endless joy, good health, and boundless prosperity. ✨ - Warm wishes from Vignesh Babu Guthi ${window.location.href}`;
    window.open("https://wa.me/?text=" + encodeURIComponent(msg), "_blank", "noopener");
  };

  return (
    <>
      <Fireworks onReady={(api) => (fx.current = api)} />
      
      {/* Dark Night Sky Backdrop (activates when firing crackers) */}
      <div className={`night-sky-backdrop ${nightSky ? "active" : ""}`} aria-hidden="true">
        <div className="stars-layer" />
        <div className="night-moon" />
      </div>

      <div className="glow" aria-hidden="true" />

      {/* Distinct Floating Fire Crackers Button on the Right Side of the screen */}
      <aside aria-label="Cracker firing controls">
        <button
          className={`side-cracker-btn ${isFiring ? "firing" : ""}`}
          onClick={handleFireCrackers}
          aria-label="Fire Crackers in Dark Night Sky"
          title="Fire Diwali crackers and turn the sky dark!"
        >
          <span className="cracker-icon">{isFiring ? "💥" : "🚀"}</span>
          <span className="cracker-title">Fire Crackers</span>
          <span className="cracker-subtitle">
            {nightSky ? "✨ Midnight Sky" : "🌙 Night Sky"}
          </span>
        </button>
        {nightSky && (
          <button
            className="sky-reset-pill"
            onClick={() => setNightSky(false)}
            title="Switch back to twilight background"
          >
            ☀️ Reset Sky
          </button>
        )}
      </aside>

      <main className="stage">
        <header className="hero">
          <Diya />
          <h1>Happy Diwali</h1>

          {/* Highlighted VIGNESH BABU GUTHI banner */}
          <div className="author-highlight" aria-label="Wishes from Vignesh Babu Guthi">
            <span className="author-tag">✨ Warm Diwali Wishes From ✨</span>
            <h2 className="author-name">VIGNESH BABU GUTHI</h2>
          </div>

          <p className="sub">Wishing you and your entire family a festival glowing with light, love, prosperity, and sweetest moments.</p>

          {/* Page Navigation */}
          <nav className="page-nav" aria-label="Page selection">
            <button
              className={`page-pill ${page === "wishes" ? "active" : ""}`}
              onClick={() => { setPage("wishes"); fx.current?.show(); }}
            >
              🪔 Family Wish
            </button>
            <button
              className={`page-pill ${page === "crackers" ? "active" : ""}`}
              onClick={() => { setPage("crackers"); setNightSky(true); fx.current?.show(); }}
            >
              🎆 Crackers & Joy
            </button>
            <button
              className={`page-pill ${page === "blessings" ? "active" : ""}`}
              onClick={() => { setPage("blessings"); fx.current?.show(); }}
            >
              🌟 Divine Blessings
            </button>
          </nav>
        </header>

        {/* Page 1: Single Block Container Family Wish */}
        {page === "wishes" && (
          <section className="card single-block-card" aria-live="polite">
            <div className="card-badge">✨ Heartfelt Blessing ✨</div>
            <h2 className="card-title">Wishing You & Your Whole Family Eternal Happiness</h2>
            <p className="card-message">
              May the divine glow of Diwali fill every corner of your home with boundless peace,
              robust health, sweet harmony, and prosperous beginnings. May this auspicious festival
              draw you and your loved ones closer together and bless your entire family with endless smiles,
              warmth, and joyful celebrations!
            </p>
            <div className="family-blessing-box">
              🪔 &ldquo;May the light of a thousand lamps illuminate your path with wisdom and fortune, and may your home forever be blessed with family togetherness and joy.&rdquo; 🪔
            </div>
            <div className="actions">
              <button className="btn wa" onClick={share}>Share This Wish on WhatsApp</button>
            </div>
            <p className="hint">Tap anywhere on the night sky or press the Fire Crackers button on the right!</p>
          </section>
        )}

        {/* Page 2: Interactive Crackers Station */}
        {page === "crackers" && (
          <section className="card single-block-card crackers-panel" aria-live="polite">
            <div className="card-badge">🎆 Festive Cracker Station 🎆</div>
            <h2 className="card-title">Light Up The Sky In Celebration!</h2>
            <p className="card-message">
              Celebrate the triumph of light with radiant cracker displays. Tap anywhere on the sky to burst colorful rockets or launch spectacular shows below:
            </p>
            <div className="cracker-triggers">
              <button className="btn primary" onClick={() => { setNightSky(true); fx.current?.grandFinale?.(); }}>Grand Rocket Finale 🚀</button>
              <button className="btn" onClick={() => {
                setNightSky(true);
                for (let s = 0; s < 6; s++) {
                  setTimeout(() => fx.current?.at?.(window.innerWidth * (0.15 + s * 0.14), window.innerHeight * 0.4), s * 220);
                }
              }}>Flowerpot Fountain 🌺</button>
              <button className="btn" onClick={() => {
                setNightSky(true);
                for (let s = 0; s < 10; s++) {
                  setTimeout(() => fx.current?.at?.(Math.random() * window.innerWidth, Math.random() * window.innerHeight * 0.45 + 50), s * 140);
                }
              }}>Sparkler Shower ✨</button>
            </div>
            <p className="hint">Tap anywhere on the sky to launch rockets at that exact position!</p>
          </section>
        )}

        {/* Page 3: Sacred Blessings */}
        {page === "blessings" && (
          <section className="card single-block-card" aria-live="polite">
            <div className="card-badge">🌟 Divine Diwali Blessings 🌟</div>
            <h2 className="card-title">Four Auspicious Gifts For Your Family</h2>
            <div className="blessings-grid">
              <div className="blessing-card">
                <div className="blessing-icon">🪔</div>
                <h3 className="blessing-title">Shubh Deepavali</h3>
                <p className="blessing-desc">May the brilliance of the sacred lamps banish all shadows and usher in renewed hope, peace, and clarity.</p>
              </div>
              <div className="blessing-card">
                <div className="blessing-icon">💰</div>
                <h3 className="blessing-title">Dhan & Samriddhi</h3>
                <p className="blessing-desc">May Goddess Lakshmi bless your household with abundance, thriving ventures, and steadfast prosperity.</p>
              </div>
              <div className="blessing-card">
                <div className="blessing-icon">🌸</div>
                <h3 className="blessing-title">Aarogyam (Health)</h3>
                <p className="blessing-desc">Wishing vibrant wellness, vitality, longevity, and peaceful minds to every elder, youth, and child in your home.</p>
              </div>
              <div className="blessing-card">
                <div className="blessing-icon">❤️</div>
                <h3 className="blessing-title">Family Togetherness</h3>
                <p className="blessing-desc">May affection, patience, mutual respect, and unconditional love keep your family bond unbreakable.</p>
              </div>
            </div>
            <div className="actions" style={{ marginTop: "1.8rem" }}>
              <button className="btn wa" onClick={share}>Share Blessings on WhatsApp</button>
            </div>
          </section>
        )}
      </main>

      <footer className="foot">
        <span>Made with love by Vignesh Babu Guthi</span>
        <nav aria-label="Links">
          <a href="https://gvignesh.in" target="_blank" rel="noopener noreferrer">gvignesh.in</a>
          <a href="https://github.com/Vigneshbabu4" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://www.linkedin.com/in/guthi-vignesh-babu" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </nav>
      </footer>
    </>
  );
}

function Diya() {
  return (
    <svg className="diya" viewBox="0 0 120 110" role="img" aria-label="A glowing diya lamp">
      <defs>
        <radialGradient id="fl" cx="50%" cy="70%" r="60%"><stop offset="0" stopColor="#fff6c9" /><stop offset=".5" stopColor="#ffb627" /><stop offset="1" stopColor="#e4572e" /></radialGradient>
        <linearGradient id="bw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f08a24" /><stop offset="1" stopColor="#a8321c" /></linearGradient>
      </defs>
      <path className="flame" d="M60 6c10 16 18 24 8 38-4 6-12 6-16 0C44 30 52 22 60 6z" fill="url(#fl)" />
      <path d="M14 58h92c0 24-20 40-46 40S14 82 14 58z" fill="url(#bw)" />
      <path d="M14 58h92" stroke="#ffd37a" strokeWidth="4" strokeLinecap="round" />
      <circle cx="40" cy="74" r="3" fill="#ffd37a" /><circle cx="60" cy="80" r="3" fill="#ffd37a" /><circle cx="80" cy="74" r="3" fill="#ffd37a" />
    </svg>
  );
}
