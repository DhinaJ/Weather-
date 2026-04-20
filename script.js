/* ─── Skye Weather App ─────────────────────────────────── */

const result        = document.getElementById("result");
const searchBtn     = document.getElementById("searchbtn");
const cityRef       = document.getElementById("city");
const timeBadge     = document.getElementById("timeBadge");
const stars         = document.getElementById("stars");
const celestial     = document.getElementById("celestial");
const core          = document.querySelector(".core");
const shootingStars = document.getElementById("shootingStars");
const ufoLayer      = document.getElementById("ufoLayer");
const modeToggle    = document.getElementById("modeToggle");

/* ─── Manual override ────────────────────────────────────── */
let manualOverride = null; // null = auto, 'day' or 'night'

modeToggle.addEventListener("click", () => {
  const isNightNow = document.body.classList.contains("night");
  manualOverride = isNightNow ? "day" : "night";
  applyTheme();
});

/* ─── Time helpers ───────────────────────────────────────── */
function getTimeInfo() {
  const now = new Date();
  const h = now.getHours(), m = now.getMinutes();
  const pad  = n => String(n).padStart(2,"0");
  const ampm = h >= 12 ? "PM" : "AM";
  const timeStr = `${((h%12)||12)}:${pad(m)} ${ampm}`;
  const autoNight   = h >= 19 || h < 6;
  const isMorning   = h >= 6  && h < 10;
  const isDawn      = h >= 5  && h < 7;
  const isDusk      = h >= 17 && h < 19;
  const isNight     = manualOverride === "night" ? true
                    : manualOverride === "day"   ? false
                    : autoNight;
  return { h, m, timeStr, isNight, isMorning, isDawn, isDusk, autoNight };
}

/* ─── Celestial position ─────────────────────────────────── */
function setCelestialPosition(h, m, isNight) {
  const totalMinutes = h * 60 + m;
  if (!isNight) {
    const dayMin   = Math.max(0, Math.min(720, totalMinutes - 360));
    const progress = dayMin / 720;
    const x        = 5 + progress * 85;
    const y        = 8 - 10 * Math.sin(Math.PI * progress);
    celestial.style.left  = `calc(${x}vw - 60px)`;
    celestial.style.top   = `${Math.max(1, y)}vh`;
    celestial.style.right = "auto";
  } else {
    celestial.style.left  = "auto";
    celestial.style.right = "3vw";
    celestial.style.top   = "4vh";
  }
}

/* ─── Stars ──────────────────────────────────────────────── */
function generateStars(count = 130) {
  stars.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const s    = document.createElement("div");
    s.className = "star";
    const sz   = 1 + Math.random() * 2.5;
    s.style.cssText = `width:${sz}px;height:${sz}px;left:${Math.random()*100}%;top:${Math.random()*75}%;--dur:${2+Math.random()*4}s;--delay:-${Math.random()*6}s;`;
    stars.appendChild(s);
  }
}

/* ─── 🌠 COMET shooting stars (right → left, full screen) ── */
function launchComet() {
  const el = document.createElement("div");
  el.className = "comet";

  // Start from RIGHT side of screen, slightly off-screen
  const startX = 100 + Math.random() * 10;  // vw (just beyond right edge)
  const startY = 5 + Math.random() * 55;    // vh (upper portion of sky)

  // Always travel left — small downward angle like the reference image
  const angle    = 8 + Math.random() * 20;  // gentle downward slope
  const distance = window.innerWidth * 1.25; // cross full screen + extra
  const rad      = (angle * Math.PI) / 180;
  const cx       = -(distance * Math.cos(rad));  // negative = leftward
  const cy       =   distance * Math.sin(rad);   // positive = downward

  const tailLen  = 180 + Math.random() * 140;    // longer tail for full-screen feel
  const headSize = 10  + Math.random() * 6;
  const tailThick= 3   + Math.random() * 2;
  const dur      = 3.0 + Math.random() * 1.5;    // slower for full-screen cross

  // Build sparks HTML — scattered above/below tail
  let sparksHTML = "";
  for (let i = 0; i < 6; i++) {
    sparksHTML += `<div class="spark" style="
      left:${Math.random()*70}px;
      top:${3+Math.random()*8}px;
      --sp-dur:${0.5+Math.random()*0.7}s;
      --sp-del:-${Math.random()*0.6}s;
      --sdy:${(Math.random()>0.5?1:-1)*(3+Math.random()*8)}px;
    "></div>`;
  }

  el.innerHTML = `
    <div class="comet-tail" style="--tlen:${tailLen}px;--tthick:${tailThick}px;--hsize:${headSize}px;"></div>
    <div class="comet-sparks">${sparksHTML}</div>
    <div class="comet-head" style="--hsize:${headSize}px;"></div>
  `;

  // Rotate comet in direction of travel (left + slightly down)
  const rotDeg = 180 + angle; // pointing left+down
  el.style.cssText = `
    left:${startX}vw; top:${startY}vh;
    transform: rotate(${rotDeg}deg);
    --cx:${cx}px; --cy:${cy}px; --cdur:${dur}s;
  `;

  shootingStars.appendChild(el);
  setTimeout(() => el.remove(), dur * 1000 + 500);
}

let cometInterval = null;

function startComets() {
  if (cometInterval) return;
  launchComet();
  cometInterval = setInterval(() => {
    launchComet();
    if (Math.random() > 0.6) setTimeout(launchComet, 600 + Math.random() * 800);
  }, 5000);
}

function stopComets() {
  clearInterval(cometInterval);
  cometInterval = null;
  shootingStars.innerHTML = "";
}

/* ─── 🛸 UFO (sun/day mode) — 2 UFOs abduct humans ─────── */
const HUMANS = ['🧍','🧍‍♀️','🏃','🏃‍♀️','🧑‍🌾','👨‍💻','🧙','🧝'];

function buildUFO(withHuman) {
  const wrap = document.createElement("div");
  wrap.className = "ufo-wrap";

  const ufo = document.createElement("div");
  ufo.className = "ufo";
  ufo.innerHTML = `
    <div class="ufo-dome"></div>
    <div class="ufo-disc"></div>
    <div class="ufo-beam"></div>
    <div class="ufo-lights">
      <div class="ufo-light"></div>
      <div class="ufo-light"></div>
      <div class="ufo-light"></div>
    </div>`;

  if (withHuman) {
    const human = document.createElement("div");
    human.className = "ufo-human";
    human.textContent = HUMANS[Math.floor(Math.random() * HUMANS.length)];
    const abductDelay = 1.5 + Math.random() * 2;
    human.style.cssText = `--abduct-dur:2.8s; --abduct-delay:${abductDelay}s;`;
    ufo.appendChild(human);
  }

  wrap.appendChild(ufo);
  return wrap;
}

function launchUFO(withHuman = false) {
  const wrap = buildUFO(withHuman);

  // Random hover position in upper portion of screen
  const hoverX = 10 + Math.random() * 75;  // vw
  const hoverY = 15 + Math.random() * 40;  // vh

  // Entry from random screen edge
  const edge = Math.floor(Math.random() * 4);
  let x0, y0;
  if      (edge===0) { x0=-10;  y0=5+Math.random()*60; }
  else if (edge===1) { x0=110;  y0=5+Math.random()*60; }
  else if (edge===2) { x0=5+Math.random()*90; y0=-10; }
  else               { x0=5+Math.random()*90; y0=110; }

  // Exit to opposite area
  const exitEdge = (edge+2)%4;
  let x2, y2;
  if      (exitEdge===0) { x2=-10; y2=5+Math.random()*60; }
  else if (exitEdge===1) { x2=110; y2=5+Math.random()*60; }
  else if (exitEdge===2) { x2=5+Math.random()*90; y2=-10; }
  else                   { x2=5+Math.random()*90; y2=110; }

  const dur = 9 + Math.random() * 6;

  wrap.style.cssText = `
    position:absolute; left:0; top:0; opacity:0;
    animation: ufoFly ${dur}s ease-in-out forwards;
    --ux0:${x0}vw; --uy0:${y0}vh; --ur0:${-6+Math.random()*12}deg;
    --ux1:${hoverX}vw; --uy1:${hoverY}vh; --ur1:${-8+Math.random()*16}deg;
    --ux2:${x2}vw; --uy2:${y2}vh; --ur2:${-6+Math.random()*12}deg;
  `;

  ufoLayer.appendChild(wrap);
  setTimeout(() => wrap.remove(), (dur + 0.5) * 1000);
}

let ufoInterval = null;
function startUFOs() {
  if (ufoInterval) return;
  // Launch 2 UFOs immediately — one with human abduction
  setTimeout(() => launchUFO(false), 800);
  setTimeout(() => launchUFO(true),  2200);
  // Periodically launch pairs
  ufoInterval = setInterval(() => {
    launchUFO(Math.random() > 0.4);
    setTimeout(() => launchUFO(Math.random() > 0.5), 2500 + Math.random()*2000);
  }, 14000 + Math.random()*5000);
}
function stopUFOs() {
  clearInterval(ufoInterval); ufoInterval = null; ufoLayer.innerHTML = "";
}

/* ─── Theme ──────────────────────────────────────────────── */
function applyTheme() {
  const { h, m, timeStr, isNight, isMorning, isDawn, isDusk } = getTimeInfo();
  timeBadge.textContent = timeStr;

  document.body.classList.toggle("night", isNight);
  setCelestialPosition(h, m, isNight);

  const skyEl = document.querySelector(".sky");
  if (isDawn || isDusk) {
    const d = isDusk;
    skyEl.style.background = `linear-gradient(170deg,${d?"#1a0838":"#3a1f6e"} 0%,${d?"#8b3a6b":"#c0663a"} 40%,${d?"#f9a05a":"#f4c06a"} 100%)`;
    core.style.background = d ? "#ff8c42" : "#ffb347";
  } else {
    skyEl.style.background = "";
    core.style.background  = "";
  }

  if (isNight) { startComets(); stopUFOs(); }
  else { stopComets(); startUFOs(); }
}

/* ─── Sunrise / sunset time formatter ───────────────────── */
function formatUnixTime(ts) {
  const d = new Date(ts * 1000);
  const h = d.getHours(), m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  const pad = n => String(n).padStart(2,"0");
  return `${((h%12)||12)}:${pad(m)} ${ampm}`;
}

function sunProgress(sunriseTs, sunsetTs) {
  const now   = Date.now() / 1000;
  const total = sunsetTs - sunriseTs;
  const elapsed = Math.max(0, Math.min(total, now - sunriseTs));
  return Math.round((elapsed / total) * 100);
}

function windDir(deg) {
  const dirs = ["N","NE","E","SE","S","SW","W","NW"];
  return dirs[Math.round(deg / 45) % 8];
}

function uvLabel(uvi) {
  if (uvi <= 2) return "Low";
  if (uvi <= 5) return "Moderate";
  if (uvi <= 7) return "High";
  if (uvi <= 10) return "Very High";
  return "Extreme";
}

/* ─── Weather UI ─────────────────────────────────────────── */
function showEmpty() {
  result.innerHTML = `
    <div class="state-msg">
      <span class="state-icon">🌐</span>
      <p>Enter a city to get started</p>
    </div>`;
}

function showLoading() {
  result.innerHTML = `
    <div class="state-msg">
      <span class="state-icon">🔍</span>
      <p>Fetching weather…</p>
    </div>`;
}

function showError(msg) {
  result.innerHTML = `
    <div class="state-msg">
      <span class="state-icon">⚠️</span>
      <p>${msg}</p>
    </div>`;
}

function showWeather(data) {
  const desc      = data.weather[0].description;
  const main      = data.weather[0].main;
  const icon      = data.weather[0].icon;
  const temp      = Math.round(data.main.temp);
  const tempMin   = Math.round(data.main.temp_min);
  const tempMax   = Math.round(data.main.temp_max);
  const feelsLike = Math.round(data.main.feels_like);
  const name      = data.name;
  const country   = data.sys?.country ?? "";
  const humidity  = data.main.humidity;
  const windSpeed = Math.round(data.wind.speed * 3.6); // m/s → km/h
  const windDeg   = data.wind.deg ?? 0;
  const visibility= data.visibility ? (data.visibility / 1000).toFixed(1) : "—";
  const pressure  = data.main.pressure;
  const cloudPct  = data.clouds?.all ?? 0;
  const sunriseTs = data.sys?.sunrise;
  const sunsetTs  = data.sys?.sunset;
  const srStr     = sunriseTs ? formatUnixTime(sunriseTs) : "—";
  const ssStr     = sunsetTs  ? formatUnixTime(sunsetTs)  : "—";
  const sunProg   = (sunriseTs && sunsetTs) ? sunProgress(sunriseTs, sunsetTs) : 50;

  result.innerHTML = `
    <div class="weather-block">
      <div class="city-name">${name}${country ? ", "+country : ""}</div>
      <div class="weather-desc">${desc}</div>
      <div class="weather-icon-wrap">
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${main}">
      </div>
      <div class="temp-main">${temp}<sup>°C</sup></div>
      <span class="condition-badge">${main}</span>

      <!-- Extra info grid -->
      <div class="info-grid">
        <div class="info-cell">
          <span class="info-cell-icon">🌡️</span>
          <span class="info-cell-label">Feels Like</span>
          <span class="info-cell-val">${feelsLike}°C</span>
        </div>
        <div class="info-cell">
          <span class="info-cell-icon">💧</span>
          <span class="info-cell-label">Humidity</span>
          <span class="info-cell-val">${humidity}%</span>
        </div>
        <div class="info-cell">
          <span class="info-cell-icon">💨</span>
          <span class="info-cell-label">Wind</span>
          <span class="info-cell-val">${windSpeed} km/h</span>
          <span class="info-cell-sub">${windDir(windDeg)}</span>
        </div>
        <div class="info-cell">
          <span class="info-cell-icon">👁️</span>
          <span class="info-cell-label">Visibility</span>
          <span class="info-cell-val">${visibility} km</span>
        </div>
        <div class="info-cell">
          <span class="info-cell-icon">🌀</span>
          <span class="info-cell-label">Pressure</span>
          <span class="info-cell-val">${pressure}</span>
          <span class="info-cell-sub">hPa</span>
        </div>
        <div class="info-cell">
          <span class="info-cell-icon">☁️</span>
          <span class="info-cell-label">Cloud Cover</span>
          <span class="info-cell-val">${cloudPct}%</span>
        </div>
      </div>

      <div class="divider"></div>

      <!-- Min / Max -->
      <div class="temp-row">
        <div class="temp-chip">
          <span class="chip-label">Min</span>
          <span class="chip-val">${tempMin}°</span>
        </div>
        <div class="temp-chip">
          <span class="chip-label">Max</span>
          <span class="chip-val">${tempMax}°</span>
        </div>
      </div>

      <!-- Sunrise / Sunset arc -->
      <div class="sun-bar-wrap">
        <div class="sun-bar-labels">
          <div class="sun-bar-label">
            <span>🌅</span>
            <span>Sunrise</span>
            <strong>${srStr}</strong>
          </div>
          <div class="sun-bar-label">
            <span>☀️</span>
            <span>Solar Arc</span>
          </div>
          <div class="sun-bar-label">
            <span>🌇</span>
            <span>Sunset</span>
            <strong>${ssStr}</strong>
          </div>
        </div>
        <div class="sun-bar-track">
          <div class="sun-bar-fill" style="width:${sunProg}%"></div>
          <div class="sun-bar-dot"  style="left:${sunProg}%"></div>
        </div>
      </div>

    </div>`;

  result.style.animation = "none";
  result.offsetHeight;
  result.style.animation = "";
}

function getWeather() {
  const cityValue = cityRef.value.trim();
  if (!cityValue) { showEmpty(); return; }
  showLoading();
  const url = `/api/weather?q=${encodeURIComponent(cityValue)}`;
  fetch(url)
    .then(r => r.json())
    .then(data => {
      if (data.cod !== 200) showError("City not found. Try another name.");
      else showWeather(data);
    })
    .catch(() => showError("Network error. Please try again."));
}

/* ─── Init ───────────────────────────────────────────────── */
generateStars();
applyTheme();
showEmpty();
setInterval(applyTheme, 60_000);
searchBtn.addEventListener("click", getWeather);
cityRef.addEventListener("keydown", e => { if (e.key === "Enter") getWeather(); });
