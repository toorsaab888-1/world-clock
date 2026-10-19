/**
 * AURA CHROMA — Next-Gen ARGB Canvas Clock & World Regions Engine
 * High-performance 60fps canvas renderer, dynamic ARGB lighting, and world time engine.
 */

// ============================================================================
// 1. WORLD REGIONS DATABASE
// ============================================================================
const WORLD_REGIONS = [
  { id: 'london', city: 'London', country: 'United Kingdom', timezone: 'Europe/London', category: 'europe', major: true },
  { id: 'new-york', city: 'New York', country: 'United States', timezone: 'America/New_York', category: 'americas', major: true },
  { id: 'tokyo', city: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo', category: 'asia', major: true },
  { id: 'paris', city: 'Paris', country: 'France', timezone: 'Europe/Paris', category: 'europe', major: true },
  { id: 'dubai', city: 'Dubai', country: 'United Arab Emirates', timezone: 'Asia/Dubai', category: 'asia', major: true },
  { id: 'sydney', city: 'Sydney', country: 'Australia', timezone: 'Australia/Sydney', category: 'asia', major: true },
  { id: 'singapore', city: 'Singapore', country: 'Singapore', timezone: 'Asia/Singapore', category: 'asia', major: true },
  { id: 'los-angeles', city: 'Los Angeles', country: 'United States', timezone: 'America/Los_Angeles', category: 'americas', major: true },
  { id: 'hong-kong', city: 'Hong Kong', country: 'China', timezone: 'Asia/Hong_Kong', category: 'asia', major: false },
  { id: 'berlin', city: 'Berlin', country: 'Germany', timezone: 'Europe/Berlin', category: 'europe', major: false },
  { id: 'toronto', city: 'Toronto', country: 'Canada', timezone: 'America/Toronto', category: 'americas', major: false },
  { id: 'seoul', city: 'Seoul', country: 'South Korea', timezone: 'Asia/Seoul', category: 'asia', major: false },
  { id: 'mumbai', city: 'Mumbai', country: 'India', timezone: 'Asia/Kolkata', category: 'asia', major: false },
  { id: 'sao-paulo', city: 'São Paulo', country: 'Brazil', timezone: 'America/Sao_Paulo', category: 'americas', major: false },
  { id: 'cairo', city: 'Cairo', country: 'Egypt', timezone: 'Africa/Cairo', category: 'asia', major: false },
  { id: 'reykjavik', city: 'Reykjavik', country: 'Iceland', timezone: 'Atlantic/Reykjavik', category: 'europe', major: false }
];

// ============================================================================
// 2. APPLICATION STATE
// ============================================================================
const state = {
  // Active Timezone for Main Clock (null means local device time)
  activeTimezone: null,
  activeRegionName: 'Local Time',
  
  // Format & Motion settings
  is24Hour: true,
  isSweepMotion: true,
  faceStyle: 'futuristic', // 'futuristic', 'minimal', 'classic', 'skeleton'
  soundEnabled: false,
  
  // ARGB System State
  argb: {
    mode: 'rainbow', // 'rainbow', 'cyberpunk', 'aurora', 'solar', 'ice', 'synthwave', 'custom'
    a: 1.0,
    r: 0,
    g: 240,
    b: 255,
    speed: 5,        // 1 to 10 scale
    glow: 0.75,      // 0.2 to 1.0
    phase: 0         // Animation angle/phase in radians
  },

  // Audio Context
  audioCtx: null,
  lastTickSecond: -1,

  // Search & Filter
  regionFilter: 'all',
  regionSearchQuery: ''
};

// ============================================================================
// 3. ARGB COLOR ENGINE
// ============================================================================
const ARGBEngine = {
  update(deltaMs) {
    const speedFactor = (state.argb.speed / 5) * 0.0015;
    state.argb.phase = (state.argb.phase + deltaMs * speedFactor) % (Math.PI * 2);

    if (state.argb.mode === 'rainbow') {
      // Smooth 360-degree HSL hue rotation
      const hue = (state.argb.phase / (Math.PI * 2)) * 360;
      const rgb = this.hslToRgb(hue, 1.0, 0.55);
      state.argb.r = rgb[0];
      state.argb.g = rgb[1];
      state.argb.b = rgb[2];
    } else if (state.argb.mode === 'cyberpunk') {
      // Oscillate between Cyber Cyan (0, 240, 255) and Neon Magenta (255, 0, 127)
      const t = (Math.sin(state.argb.phase) + 1) / 2;
      state.argb.r = Math.round(this.lerp(0, 255, t));
      state.argb.g = Math.round(this.lerp(240, 0, t));
      state.argb.b = Math.round(this.lerp(255, 127, t));
    } else if (state.argb.mode === 'aurora') {
      // Cosmic wave: Emerald (0, 255, 155) -> Deep Violet (114, 9, 183)
      const t = (Math.sin(state.argb.phase * 0.8) + 1) / 2;
      state.argb.r = Math.round(this.lerp(0, 114, t));
      state.argb.g = Math.round(this.lerp(255, 9, t));
      state.argb.b = Math.round(this.lerp(155, 183, t));
    } else if (state.argb.mode === 'solar') {
      // Blazing solar: Crimson (255, 30, 0) -> Golden Amber (255, 190, 0)
      const t = (Math.sin(state.argb.phase * 1.2) + 1) / 2;
      state.argb.r = 255;
      state.argb.g = Math.round(this.lerp(30, 190, t));
      state.argb.b = 0;
    } else if (state.argb.mode === 'ice') {
      // Glacial pulse: Deep blue (0, 132, 255) -> Icy white-cyan (160, 233, 255)
      const t = (Math.sin(state.argb.phase) + 1) / 2;
      state.argb.r = Math.round(this.lerp(0, 160, t));
      state.argb.g = Math.round(this.lerp(132, 233, t));
      state.argb.b = 255;
    } else if (state.argb.mode === 'synthwave') {
      // Synthwave: Hot pink (247, 37, 133) -> Violet (114, 9, 183) -> Neon Blue (76, 201, 240)
      const sinVal = Math.sin(state.argb.phase);
      if (sinVal < 0) {
        const t = -sinVal;
        state.argb.r = Math.round(this.lerp(247, 114, t));
        state.argb.g = Math.round(this.lerp(37, 9, t));
        state.argb.b = Math.round(this.lerp(133, 183, t));
      } else {
        const t = sinVal;
        state.argb.r = Math.round(this.lerp(114, 76, t));
        state.argb.g = Math.round(this.lerp(9, 201, t));
        state.argb.b = Math.round(this.lerp(183, 240, t));
      }
    }
    // In 'custom' mode, values are set directly via sliders

    this.applyCssTokens();
  },

  applyCssTokens() {
    const root = document.documentElement;
    root.style.setProperty('--argb-r', state.argb.r);
    root.style.setProperty('--argb-g', state.argb.g);
    root.style.setProperty('--argb-b', state.argb.b);
    root.style.setProperty('--argb-a', state.argb.a);
    root.style.setProperty('--argb-glow-intensity', state.argb.glow);

    // Update hex badge
    const badge = document.getElementById('color-hex-badge');
    if (badge) {
      badge.textContent = `ARGB(${state.argb.a.toFixed(2)}, ${state.argb.r}, ${state.argb.g}, ${state.argb.b})`;
    }

    const customSwatch = document.getElementById('custom-preview-swatch');
    if (customSwatch && state.argb.mode === 'custom') {
      customSwatch.style.background = `rgba(${state.argb.r}, ${state.argb.g}, ${state.argb.b}, ${state.argb.a})`;
    }
  },

  lerp(a, b, t) {
    return a + (b - a) * t;
  },

  hslToRgb(h, s, l) {
    let r, g, b;
    h = h / 360;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  },

  getColor(alphaOverride = null) {
    const a = alphaOverride !== null ? alphaOverride : state.argb.a;
    return `rgba(${state.argb.r}, ${state.argb.g}, ${state.argb.b}, ${a})`;
  }
};

// ============================================================================
// 4. TIME ENGINE & REGIONAL CALCULATIONS
// ============================================================================
const TimeEngine = {
  getTimeData(timeZone = null) {
    const now = new Date();
    
    let hours, minutes, seconds, milliseconds;
    let dateStr, tzAbbr, offsetStr;

    if (!timeZone) {
      // Local Time
      hours = now.getHours();
      minutes = now.getMinutes();
      seconds = now.getSeconds();
      milliseconds = now.getMilliseconds();
      
      const offsetMin = -now.getTimezoneOffset();
      const sign = offsetMin >= 0 ? '+' : '-';
      const absMin = Math.abs(offsetMin);
      const offH = String(Math.floor(absMin / 60)).padStart(2, '0');
      const offM = String(absMin % 60).padStart(2, '0');
      offsetStr = `UTC${sign}${offH}:${offM}`;
      
      dateStr = now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } else {
      // Target Timezone via Intl
      try {
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone,
          hourCycle: 'h23',
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          weekday: 'long'
        });

        const parts = formatter.formatToParts(now);
        const map = {};
        for (const p of parts) map[p.type] = p.value;

        hours = parseInt(map.hour, 10);
        minutes = parseInt(map.minute, 10);
        seconds = parseInt(map.second, 10);
        milliseconds = now.getMilliseconds();

        dateStr = now.toLocaleDateString('en-US', {
          timeZone,
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });

        // Compute offset
        offsetStr = this.getTimezoneOffsetString(timeZone);
      } catch (e) {
        hours = now.getHours();
        minutes = now.getMinutes();
        seconds = now.getSeconds();
        milliseconds = now.getMilliseconds();
        offsetStr = 'UTC';
        dateStr = now.toDateString();
      }
    }

    return {
      hours,
      minutes,
      seconds,
      milliseconds,
      dateStr,
      offsetStr,
      rawDate: now
    };
  },

  getTimezoneOffsetString(timeZone) {
    try {
      const now = new Date();
      const tzDate = new Date(now.toLocaleString('en-US', { timeZone }));
      const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
      const diffMinutes = Math.round((tzDate.getTime() - utcDate.getTime()) / 60000);
      const sign = diffMinutes >= 0 ? '+' : '-';
      const abs = Math.abs(diffMinutes);
      const h = String(Math.floor(abs / 60)).padStart(2, '0');
      const m = String(abs % 60).padStart(2, '0');
      return `UTC${sign}${h}:${m}`;
    } catch {
      return 'UTC+00:00';
    }
  },

  getTimeDifferenceTag(targetTz) {
    try {
      const now = new Date();
      const targetDate = new Date(now.toLocaleString('en-US', { timeZone: targetTz }));
      const localDate = new Date(now.toLocaleString('en-US'));
      const diffHours = (targetDate.getTime() - localDate.getTime()) / 3600000;
      const rounded = Math.round(diffHours * 2) / 2;
      if (rounded === 0) return 'Same time';
      return rounded > 0 ? `+${rounded} hrs` : `${rounded} hrs`;
    } catch {
      return '';
    }
  },

  isDaytime(hours) {
    return hours >= 6 && hours < 18;
  }
};

// ============================================================================
// 5. AUDIO SYNTHESIZER (WEB AUDIO API)
// ============================================================================
const SoundSynthesizer = {
  init() {
    if (!state.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        state.audioCtx = new AudioCtx();
      }
    }
    if (state.audioCtx && state.audioCtx.state === 'suspended') {
      state.audioCtx.resume();
    }
  },

  playTick() {
    if (!state.soundEnabled || !state.audioCtx) return;
    try {
      const now = state.audioCtx.currentTime;
      const osc = state.audioCtx.createOscillator();
      const gain = state.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.025);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

      osc.connect(gain);
      gain.connect(state.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.03);
    } catch (e) {
      // Audio context error handle
    }
  },

  playHourChime() {
    if (!state.soundEnabled || !state.audioCtx) return;
    try {
      const now = state.audioCtx.currentTime;
      [880, 1320].forEach((freq, i) => {
        const osc = state.audioCtx.createOscillator();
        const gain = state.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
        gain.gain.setValueAtTime(0.08, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.1 + 0.35);
        osc.connect(gain);
        gain.connect(state.audioCtx.destination);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.4);
      });
    } catch (e) {}
  }
};

// ============================================================================
// 6. CANVAS CLOCK RENDERER (60FPS HIGH-PRECISION)
// ============================================================================
class CanvasClock {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.setupDPI();
    window.addEventListener('resize', () => this.setupDPI());
  }

  setupDPI() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = rect.width > 20 ? rect.width : 500;
    const h = rect.height > 20 ? rect.height : 500;
    const size = Math.min(w, h);

    this.width = size;
    this.height = size;
    this.canvas.width = Math.round(size * dpr);
    this.canvas.height = Math.round(size * dpr);
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    this.radius = size / 2;
  }

  render(timeData) {
    const ctx = this.ctx;
    const r = this.radius;

    // Clear frame
    ctx.clearRect(0, 0, this.width, this.height);

    ctx.save();
    ctx.translate(r, r);

    // Calculate exact hand angles
    let secFraction = timeData.seconds;
    if (state.isSweepMotion) {
      secFraction += timeData.milliseconds / 1000;
    }
    const secAngle = (secFraction * Math.PI) / 30;
    const minAngle = ((timeData.minutes + secFraction / 60) * Math.PI) / 30;
    const hourAngle = (((timeData.hours % 12) + (timeData.minutes + secFraction / 60) / 60) * Math.PI) / 6;

    // Draw clock components based on chosen watch face style
    this.drawOuterRing(ctx, r);
    this.drawFaceGrid(ctx, r);
    this.drawTicksAndNumerals(ctx, r, secAngle);
    this.drawSubDials(ctx, r, timeData);
    this.drawHands(ctx, r, hourAngle, minAngle, secAngle);
    this.drawCenterPivot(ctx, r);

    ctx.restore();
  }

  drawOuterRing(ctx, r) {
    const ringRadius = r * 0.94;
    
    // Outer subtle boundary ring
    ctx.beginPath();
    ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Vibrant ARGB Bezel Track
    ctx.beginPath();
    ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
    ctx.strokeStyle = ARGBEngine.getColor(0.35);
    ctx.lineWidth = 3.5;
    ctx.shadowColor = ARGBEngine.getColor(0.85);
    ctx.shadowBlur = 18 * state.argb.glow;
    ctx.stroke();
    ctx.shadowBlur = 0; // reset shadow

    // Futuristic rotating halo notch
    if (state.faceStyle === 'futuristic' || state.faceStyle === 'skeleton') {
      const notchAngle = state.argb.phase * 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, ringRadius, notchAngle, notchAngle + Math.PI * 0.4);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.shadowColor = ARGBEngine.getColor(1);
      ctx.shadowBlur = 16;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }

  drawFaceGrid(ctx, r) {
    if (state.faceStyle === 'skeleton') {
      // Holographic concentric circles & crosshairs
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.65, 0, Math.PI * 2);
      ctx.arc(0, 0, r * 0.4, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(-r * 0.8, 0); ctx.lineTo(r * 0.8, 0);
      ctx.moveTo(0, -r * 0.8); ctx.lineTo(0, r * 0.8);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.stroke();
    } else if (state.faceStyle === 'classic') {
      // Classic chronograph subtle sub-dials
      ctx.beginPath();
      ctx.arc(0, -r * 0.35, r * 0.18, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  }

  drawTicksAndNumerals(ctx, r, currentSecAngle) {
    const tickOuter = r * 0.90;
    const tickMajorInner = r * 0.82;
    const tickMinorInner = r * 0.86;

    // 60 tick marks
    for (let i = 0; i < 60; i++) {
      const angle = (i * Math.PI) / 30;
      const isMajor = i % 5 === 0;
      const inner = isMajor ? tickMajorInner : tickMinorInner;

      // Calculate distance to current second hand for dynamic proximity lighting
      let angleDiff = Math.abs(angle - currentSecAngle) % (Math.PI * 2);
      if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;
      const isNearSecondHand = angleDiff < 0.12;

      ctx.save();
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, -inner);
      ctx.lineTo(0, -tickOuter);

      if (isNearSecondHand) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = isMajor ? 3.5 : 2;
        ctx.shadowColor = ARGBEngine.getColor(1);
        ctx.shadowBlur = 10;
      } else if (isMajor) {
        ctx.strokeStyle = ARGBEngine.getColor(0.9);
        ctx.lineWidth = 3;
        ctx.shadowColor = ARGBEngine.getColor(0.4);
        ctx.shadowBlur = 6;
      } else {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1.2;
      }

      ctx.stroke();
      ctx.restore();

      // Numerals (1 to 12)
      if (isMajor && state.faceStyle !== 'minimal') {
        const hourNum = i === 0 ? 12 : i / 5;
        const textDist = r * 0.72;
        const tx = Math.sin(angle) * textDist;
        const ty = -Math.cos(angle) * textDist;

        ctx.save();
        ctx.font = state.faceStyle === 'futuristic' ? '600 15px "Space Grotesk"' : '500 14px "Outfit"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = isNearSecondHand ? '#ffffff' : 'rgba(240, 244, 252, 0.75)';
        ctx.fillText(hourNum.toString(), tx, ty);
        ctx.restore();
      }
    }
  }

  drawSubDials(ctx, r, timeData) {
    if (state.faceStyle === 'futuristic') {
      // Dynamic ARGB inner status arc
      const innerRadius = r * 0.52;
      ctx.beginPath();
      ctx.arc(0, 0, innerRadius, -Math.PI / 2, -Math.PI / 2 + (timeData.seconds / 60) * Math.PI * 2);
      ctx.strokeStyle = ARGBEngine.getColor(0.25);
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
  }

  drawHands(ctx, r, hourAngle, minAngle, secAngle) {
    // 1. Hour Hand
    ctx.save();
    ctx.rotate(hourAngle);
    this.drawBroadHand(ctx, r * 0.50, 7.5, 'rgba(255, 255, 255, 0.95)', ARGBEngine.getColor(0.5));
    ctx.restore();

    // 2. Minute Hand
    ctx.save();
    ctx.rotate(minAngle);
    this.drawBroadHand(ctx, r * 0.74, 5.5, 'rgba(240, 244, 255, 0.95)', ARGBEngine.getColor(0.7));
    ctx.restore();

    // 3. Second Hand (ARGB Precision Needle)
    ctx.save();
    ctx.rotate(secAngle);
    this.drawNeedleSecondHand(ctx, r);
    ctx.restore();
  }

  drawBroadHand(ctx, length, width, bodyColor, glowColor) {
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 12 * state.argb.glow;

    // Tapered hand body
    ctx.beginPath();
    ctx.moveTo(-width / 2, 12);
    ctx.lineTo(width / 2, 12);
    ctx.lineTo(width * 0.35, -length);
    ctx.lineTo(0, -length - width * 0.6);
    ctx.lineTo(-width * 0.35, -length);
    ctx.closePath();
    ctx.fillStyle = bodyColor;
    ctx.fill();

    // Luminescent center line
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.lineTo(0, -length * 0.85);
    ctx.strokeStyle = ARGBEngine.getColor(0.8);
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.shadowBlur = 0;
  }

  drawNeedleSecondHand(ctx, r) {
    const length = r * 0.86;
    const tail = r * 0.22;
    const argbColor = ARGBEngine.getColor(1.0);

    ctx.shadowColor = argbColor;
    ctx.shadowBlur = 16 * state.argb.glow;

    // Tail counterbalance
    ctx.beginPath();
    ctx.moveTo(0, tail);
    ctx.lineTo(0, 0);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Tail diamond / circle
    ctx.beginPath();
    ctx.arc(0, tail * 0.6, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Main sweeping needle
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -length);
    ctx.strokeStyle = argbColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Needle arrow tip
    ctx.beginPath();
    ctx.moveTo(-3, -length + 15);
    ctx.lineTo(3, -length + 15);
    ctx.lineTo(0, -length);
    ctx.closePath();
    ctx.fillStyle = argbColor;
    ctx.fill();

    ctx.shadowBlur = 0;
  }

  drawCenterPivot(ctx, r) {
    const pivotSize = 9;

    // Outer metal cap
    ctx.beginPath();
    ctx.arc(0, 0, pivotSize, 0, Math.PI * 2);
    ctx.fillStyle = '#0b0f17';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Glowing ARGB jewel core
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fillStyle = ARGBEngine.getColor(1.0);
    ctx.shadowColor = ARGBEngine.getColor(1.0);
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

// ============================================================================
// 7. UI MANAGER & DOM INTERACTION
// ============================================================================
const UIManager = {
  clockRenderer: null,
  lastFrameTime: performance.now(),

  init() {
    const canvas = document.getElementById('clock-canvas');
    this.clockRenderer = new CanvasClock(canvas);

    this.bindControls();
    this.renderWorldRegionsList();
    this.renderFeaturedCarousel();
    this.detectLocalTimezone();

    // Start 60FPS main rendering loop
    requestAnimationFrame((timestamp) => this.loop(timestamp));
  },

  detectLocalTimezone() {
    try {
      const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const el = document.getElementById('local-iana-tz');
      if (el) el.textContent = localTz;
      
      const offsetPill = document.getElementById('active-region-offset');
      if (offsetPill) {
        offsetPill.textContent = TimeEngine.getTimezoneOffsetString(localTz);
      }
    } catch {
      // fallback
    }
  },

  bindControls() {
    // 1. Time Format Toggle (12h vs 24h)
    const formatBtn = document.getElementById('toggle-time-format');
    const formatLabel = document.getElementById('format-label');
    formatBtn.addEventListener('click', () => {
      state.is24Hour = !state.is24Hour;
      formatLabel.textContent = state.is24Hour ? '24H' : '12H';
      this.renderWorldRegionsList();
      this.renderFeaturedCarousel();
    });

    // 2. Sweep Mode Toggle (Sweep vs Tick)
    const sweepBtn = document.getElementById('toggle-sweep-mode');
    const sweepLabel = document.getElementById('sweep-label');
    sweepBtn.addEventListener('click', () => {
      state.isSweepMotion = !state.isSweepMotion;
      sweepLabel.textContent = state.isSweepMotion ? 'Sweep' : 'Tick';
    });

    // 3. Sound FX Toggle
    const soundBtn = document.getElementById('toggle-sound');
    const soundIcon = document.getElementById('sound-icon');
    soundBtn.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      soundIcon.textContent = state.soundEnabled ? '🔔' : '🔇';
      if (state.soundEnabled) SoundSynthesizer.init();
    });

    // 4. Fullscreen Button
    const fsBtn = document.getElementById('btn-fullscreen');
    fsBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });

    // 5. Watch Face Style Selectors (Pill Tabs)
    const faceTabs = document.querySelectorAll('.dial-mode-selectors .pill-tab');
    faceTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        faceTabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        state.faceStyle = tab.dataset.face;
      });
    });

    // 6. Navigation Tabs (ARGB vs World Regions)
    const tabBtns = document.querySelectorAll('.panel-tab-btn');
    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        tabBtns.forEach((b) => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach((tc) => tc.classList.remove('active'));
        btn.classList.add('active');
        const targetId = btn.dataset.tab;
        const targetContent = document.getElementById(targetId);
        if (targetContent) targetContent.classList.add('active');
      });
    });

    // 7. ARGB Preset Selectors
    const presetBtns = document.querySelectorAll('.preset-btn');
    presetBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        presetBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state.argb.mode = btn.dataset.preset;
      });
    });

    // 8. ARGB Precision Sliders
    const sAlpha = document.getElementById('slider-alpha');
    const sRed = document.getElementById('slider-red');
    const sGreen = document.getElementById('slider-green');
    const sBlue = document.getElementById('slider-blue');
    const sSpeed = document.getElementById('slider-speed');
    const sGlow = document.getElementById('slider-glow');

    const updateFromSliders = () => {
      state.argb.mode = 'custom';
      // Mark custom preset active
      presetBtns.forEach((b) => {
        b.classList.toggle('active', b.dataset.preset === 'custom');
      });

      state.argb.a = parseInt(sAlpha.value, 10) / 100;
      state.argb.r = parseInt(sRed.value, 10);
      state.argb.g = parseInt(sGreen.value, 10);
      state.argb.b = parseInt(sBlue.value, 10);

      document.getElementById('val-alpha').textContent = `${Math.round(state.argb.a * 100)}%`;
      document.getElementById('val-red').textContent = state.argb.r;
      document.getElementById('val-green').textContent = state.argb.g;
      document.getElementById('val-blue').textContent = state.argb.b;

      ARGBEngine.applyCssTokens();
    };

    [sAlpha, sRed, sGreen, sBlue].forEach((s) => {
      s.addEventListener('input', updateFromSliders);
    });

    sSpeed.addEventListener('input', (e) => {
      state.argb.speed = parseFloat(e.target.value);
    });

    sGlow.addEventListener('input', (e) => {
      state.argb.glow = parseInt(e.target.value, 10) / 100;
    });

    // 9. Quick Swatch Color Picks
    const quickPicks = document.querySelectorAll('.swatch-pick');
    quickPicks.forEach((p) => {
      p.addEventListener('click', () => {
        sRed.value = p.dataset.r;
        sGreen.value = p.dataset.g;
        sBlue.value = p.dataset.b;
        updateFromSliders();
      });
    });

    // 10. Region Filter Chips
    const filterChips = document.querySelectorAll('.filter-chip');
    filterChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        filterChips.forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        state.regionFilter = chip.dataset.filter;
        this.renderWorldRegionsList();
      });
    });

    // 11. Region Search Input
    const searchInput = document.getElementById('region-search-input');
    const clearBtn = document.getElementById('clear-search-btn');
    searchInput.addEventListener('input', (e) => {
      state.regionSearchQuery = e.target.value.toLowerCase().trim();
      this.renderWorldRegionsList();
    });
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      state.regionSearchQuery = '';
      this.renderWorldRegionsList();
    });

    // 12. Reset to Local Time button
    const resetLocalBtn = document.getElementById('btn-reset-local');
    resetLocalBtn.addEventListener('click', () => {
      this.setActiveRegion(null, 'Local Time');
    });
  },

  setActiveRegion(timezone, name) {
    state.activeTimezone = timezone;
    state.activeRegionName = name;

    const nameEl = document.getElementById('active-region-name');
    const offsetEl = document.getElementById('active-region-offset');

    if (nameEl) nameEl.textContent = name;
    if (offsetEl) {
      offsetEl.textContent = timezone ? TimeEngine.getTimezoneOffsetString(timezone) : TimeEngine.getTimeData(null).offsetStr;
    }

    // Refresh active highlights in cards
    this.renderWorldRegionsList();
    this.renderFeaturedCarousel();
  },

  renderWorldRegionsList() {
    const container = document.getElementById('regions-list-container');
    if (!container) return;

    let filtered = WORLD_REGIONS.filter((reg) => {
      // Category filter
      if (state.regionFilter === 'major' && !reg.major) return false;
      if (state.regionFilter === 'americas' && reg.category !== 'americas') return false;
      if (state.regionFilter === 'europe' && reg.category !== 'europe') return false;
      if (state.regionFilter === 'asia' && reg.category !== 'asia') return false;

      // Search query
      if (state.regionSearchQuery) {
        const query = state.regionSearchQuery;
        return reg.city.toLowerCase().includes(query) ||
               reg.country.toLowerCase().includes(query) ||
               reg.timezone.toLowerCase().includes(query);
      }
      return true;
    });

    // Update count badge
    const badge = document.getElementById('regions-count-badge');
    if (badge) badge.textContent = filtered.length;

    if (filtered.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding: 24px; color: var(--text-dim); font-size: 0.88rem;">No matching regions found</div>`;
      return;
    }

    container.innerHTML = filtered.map((reg) => {
      const timeData = TimeEngine.getTimeData(reg.timezone);
      const isDay = TimeEngine.isDaytime(timeData.hours);
      const icon = isDay ? '☀️' : '🌙';
      const diffTag = TimeEngine.getTimeDifferenceTag(reg.timezone);
      const formattedTime = this.formatDigitalTime(timeData.hours, timeData.minutes, state.is24Hour);
      const isActive = state.activeTimezone === reg.timezone;

      return `
        <div class="region-row-card ${isActive ? 'active-region' : ''}" data-tz="${reg.timezone}" data-city="${reg.city}">
          <div class="region-info-left">
            <div class="region-city-row">
              <span class="region-day-night-icon" title="${isDay ? 'Daytime' : 'Nighttime'}">${icon}</span>
              <span class="region-city-name">${reg.city}</span>
            </div>
            <span class="region-country-name">${reg.country}</span>
          </div>
          <div class="region-info-right">
            <span class="region-digital-time">${formattedTime.time} <small style="font-size:0.65em; color:var(--text-muted)">${formattedTime.period}</small></span>
            <span class="region-diff-tag">${diffTag}</span>
          </div>
        </div>
      `;
    }).join('');

    // Attach click listeners to switch main clock
    container.querySelectorAll('.region-row-card').forEach((card) => {
      card.addEventListener('click', () => {
        this.setActiveRegion(card.dataset.tz, card.dataset.city);
      });
    });
  },

  renderFeaturedCarousel() {
    const container = document.getElementById('featured-cards-carousel');
    if (!container) return;

    // Show top 6 major international hubs
    const featured = WORLD_REGIONS.filter((r) => r.major).slice(0, 6);

    container.innerHTML = featured.map((reg) => {
      const timeData = TimeEngine.getTimeData(reg.timezone);
      const isDay = TimeEngine.isDaytime(timeData.hours);
      const formatted = this.formatDigitalTime(timeData.hours, timeData.minutes, state.is24Hour);
      const isActive = state.activeTimezone === reg.timezone;
      const secStr = String(timeData.seconds).padStart(2, '0');

      return `
        <div class="featured-card ${isActive ? 'active-region' : ''}" data-tz="${reg.timezone}" data-city="${reg.city}">
          <div class="card-top">
            <div>
              <div class="card-city-name">${reg.city}</div>
              <div class="card-country-name">${reg.country}</div>
            </div>
            <div class="card-badge-daynight">
              <span>${isDay ? '☀️' : '🌙'}</span>
              <span>${isDay ? 'Day' : 'Night'}</span>
            </div>
          </div>
          
          <div class="card-time-display">
            ${formatted.time}<span class="sec">:${secStr}</span> <span style="font-size: 0.9rem; color: var(--argb-primary)">${formatted.period}</span>
          </div>

          <div class="card-bottom">
            <span class="card-date">${timeData.dateStr.split(',')[0]}</span>
            <span class="card-offset">${timeData.offsetStr}</span>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.featured-card').forEach((card) => {
      card.addEventListener('click', () => {
        this.setActiveRegion(card.dataset.tz, card.dataset.city);
      });
    });
  },

  updateLiveDigitalHud(timeData) {
    const formatted = this.formatDigitalTime(timeData.hours, timeData.minutes, state.is24Hour);
    const secStr = String(timeData.seconds).padStart(2, '0');

    const timeEl = document.getElementById('digital-time-display');
    const periodEl = document.getElementById('digital-period-display');
    const millisEl = document.getElementById('digital-millis-display');
    const dateEl = document.getElementById('digital-date-display');
    const tzEl = document.getElementById('digital-tz-display');

    if (timeEl) timeEl.textContent = `${formatted.time}:${secStr}`;
    if (periodEl) periodEl.textContent = formatted.period;
    if (millisEl) millisEl.textContent = `.${String(timeData.milliseconds).padStart(3, '0')}`;
    if (dateEl) dateEl.textContent = timeData.dateStr;
    if (tzEl) tzEl.textContent = timeData.offsetStr;

    // Check for acoustic second tick
    if (timeData.seconds !== state.lastTickSecond) {
      state.lastTickSecond = timeData.seconds;
      SoundSynthesizer.playTick();

      // Check on top of the hour chime
      if (timeData.minutes === 0 && timeData.seconds === 0) {
        SoundSynthesizer.playHourChime();
      }
    }
  },

  formatDigitalTime(h, m, is24) {
    let hours = h;
    let period = '';
    if (!is24) {
      period = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
    }
    const hh = String(hours).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    return { time: `${hh}:${mm}`, period };
  },

  loop(timestamp) {
    const deltaMs = timestamp - this.lastFrameTime;
    this.lastFrameTime = timestamp;

    // 1. Update ARGB lighting animations
    ARGBEngine.update(deltaMs);

    // 2. Fetch high-precision time data for the active region
    const timeData = TimeEngine.getTimeData(state.activeTimezone);

    // 3. Render Canvas Clock
    this.clockRenderer.render(timeData);

    // 4. Update HUD text display
    this.updateLiveDigitalHud(timeData);

    requestAnimationFrame((t) => this.loop(t));
  }
};

// Periodic update for World Region Cards (Every 1 second)
setInterval(() => {
  UIManager.renderFeaturedCarousel();
  UIManager.renderWorldRegionsList();
}, 1000);

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  UIManager.init();
});
