# 🌐 AURA CHROMA — ARGB Canvas Clock & World Regions System

A futuristic, high-precision HTML5 Canvas clock engineered with dynamic Addressable RGB (ARGB) lighting controls, multi-timezone world regions synchronization, and responsive glassmorphism UI.

---

## ✨ Key Features

### 1. 🌈 Dynamic ARGB Lighting Engine
- **Chroma Spectrum**: 360-degree rainbow hue cycle with customizable rotation speed.
- **Curated Lighting Presets**: *Cyberpunk Neon*, *Aurora Boreal*, *Solar Flare*, *Glacier Pulse*, and *Synthwave 80s*.
- **Precision ARGB Sliders**:
  - **Alpha (A)**: Adjust transparency and atmospheric glow intensity (10% to 100%).
  - **Red (R)**: 0 – 255 channel control.
  - **Green (G)**: 0 – 255 channel control.
  - **Blue (B)**: 0 – 255 channel control.
- **Ambient Aura**: Background ambient lighting and canvas glow synchronize in real-time with the active ARGB values.
- **Animation Speed & Glow Controls**: Adjust cycle frequency and glow blur radius.

---

### 2. ⚡ High-Precision Canvas Clock (60FPS / 120FPS)
- **High-DPI Retina Support**: Automatically scales to device pixel ratio (`window.devicePixelRatio`) for razor-sharp rendering on 4K/Retina displays.
- **Rolex-Style Smooth Sweep**: Fluid sweeping second hand with millisecond precision, toggleable to traditional quartz **Tick** motion.
- **Dynamic Watch Face Styles**:
  - **Cyber Neo**: Futuristic segmented bezel, glowing ARGB tracks, and dynamic second-hand proximity illumination.
  - **Pure Minimal**: Ultra-clean Swiss Bauhaus aesthetic with sleek luminous hands.
  - **Chronograph**: Precision sub-dials and instrument markers.
  - **Holo Grid**: Holographic circular telemetry and crosshairs.

---

### 3. 🌍 Global World Regions & Timezones
- **Multi-Zone Engine**: Powered by native `Intl.DateTimeFormat` with IANA timezone support.
- **Curated Global Capitals**: London, New York, Tokyo, Paris, Dubai, Sydney, Singapore, Los Angeles, Berlin, Seoul, Mumbai, and more.
- **Interactive Switching**: Click on any region card in the list or the bottom Global Grid to switch the main Canvas Clock and Digital HUD to that city's live time.
- **Day / Night Indicators**: Automatic calculation of daytime (☀️) vs nighttime (🌙) for each timezone.
- **Time Difference Delta**: Shows relative time shift compared to your local device time (e.g. `+5 hrs`, `-4 hrs`, `Same time`).
- **Live Search & Category Filter**: Fast filtering by Americas, Europe, Asia/Pacific, or Major Hubs.

---

### 4. 🎛️ Audio & Controls
- **Mechanical Tick & Chime**: Built-in Web Audio API synthesizer for acoustic mechanical ticking and top-of-the-hour chime (muted by default).
- **12H / 24H Format Toggle**: One-click switch between 24-hour military time and 12-hour AM/PM display.
- **Fullscreen Mode**: Dedicated toggle for clean ambient wall clock display.

---

## 🚀 How to Run

Simply open `index.html` in any modern web browser:
- Double-click `index.html` on your desktop or file explorer.
- Or right-click `index.html` -> **Open with Google Chrome / Microsoft Edge / Firefox / Safari**.
