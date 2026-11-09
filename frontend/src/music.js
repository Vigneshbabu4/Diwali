// Traditional-style Indian background music, synthesised in the browser (Raga Bhoopali / Mohanam):
// tanpura drone + plucked veena-like melody + soft tabla. No audio file needed.
// To use your own track instead, put it at public/bgm.mp3 and it will be played automatically.

function synth() {
  let ctx, master, verb, timer, step = 0, next = 0, last = 12, on = false;
  const SA = 146.83; // D3
  const scale = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
  const hz = (semi) => SA * Math.pow(2, semi / 12);

  const impulse = () => {
    const len = ctx.sampleRate * 2.6, b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5); }
    return b;
  };

  const pluck = (f, t, dur, vol, type = "triangle", cut = 2600, glideFrom) => {
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
    o.type = type; o2.type = "sine";
    o.frequency.setValueAtTime(glideFrom || f, t);
    if (glideFrom) o.frequency.exponentialRampToValueAtTime(f, t + 0.12);
    o2.frequency.value = f * 2;
    lp.type = "lowpass"; lp.frequency.setValueAtTime(cut, t); lp.frequency.exponentialRampToValueAtTime(500, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(lp); o2.connect(lp); lp.connect(g); g.connect(master); g.connect(verb);
    o.start(t); o2.start(t); o.stop(t + dur + 0.1); o2.stop(t + dur + 0.1);
  };

  const drum = (t, f, vol, dur) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(f * 1.8, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.06);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
  };

  const schedule = (t, s) => {
    // tanpura: Pa, Sa, Sa, low Sa
    const tp = [0.5 * 7, 12, 12, 0];
    if (s % 1 === 0) pluck(hz(tp[s % 4] - 12), t, 2.4, 0.09, "sawtooth", 1400);
    // tabla (8-beat cycle)
    const m = s % 8;
    if ([0, 4].includes(m)) drum(t, 90, 0.34, 0.35);
    if ([2, 6].includes(m)) drum(t, 330, 0.12, 0.1);
    if (m === 3 || m === 7) drum(t, 220, 0.08, 0.08);
    // melody
    if (Math.random() < (m % 2 === 0 ? 0.8 : 0.45)) {
      const dir = Math.random() < 0.5 ? -1 : 1, jump = Math.random() < 0.25 ? 2 : 1;
      let idx = Math.min(scale.length - 1, Math.max(0, last + dir * jump));
      if (s % 16 === 15) idx = 5; // land on Sa
      const prev = hz(scale[last]);
      pluck(hz(scale[idx]), t, 1.6, 0.14, "triangle", 3200, prev);
      last = idx;
    }
  };

  const tick = () => {
    while (next < ctx.currentTime + 0.4) { schedule(next, step++); next += 0.46; }
  };

  return {
    start() {
      if (on) return; on = true;
      if (!ctx) {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        master = ctx.createGain(); master.gain.value = 0;
        verb = ctx.createConvolver(); verb.buffer = impulse();
        const vg = ctx.createGain(); vg.gain.value = 0.45; verb.connect(vg); vg.connect(master);
        master.connect(ctx.destination);
      }
      ctx.resume(); next = ctx.currentTime + 0.1;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 2.5);
      timer = setInterval(tick, 120);
    },
    stop() {
      if (!on) return; on = false; clearInterval(timer);
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
    },
  };
}

function fileTrack() {
  const a = new Audio("/bgm.mp3");
  a.loop = true;
  a.volume = 0.6;
  let synthFallback = null;

  return {
    start() {
      const p = a.play();
      if (p !== undefined) {
        return p.catch((err) => {
          if (err && err.name !== "NotAllowedError") {
            if (!synthFallback) synthFallback = synth();
            synthFallback.start();
          }
          throw err;
        });
      }
      return Promise.resolve();
    },
    stop() {
      a.pause();
      if (synthFallback) synthFallback.stop();
    },
  };
}

export async function createMusic() {
  return fileTrack();
}
