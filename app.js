/* =====================================================================
   Invitación XV — lógica de la página
   No necesitas editar este archivo: todo se configura en config.js
   ===================================================================== */
(function () {
  "use strict";
  var C = window.INVITACION || {};
  var $ = function (id) { return document.getElementById(id); };
  var reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;

  /* ---------- 1. Colores y tipografías desde la configuración ---------- */
  var colorMap = { noche: "--noche", ciruela: "--ciruela", rosa: "--rosa", dorado: "--dorado", champagne: "--champagne", plata: "--plata" };
  Object.keys(C.colores || {}).forEach(function (k) { if (colorMap[k]) root.style.setProperty(colorMap[k], C.colores[k]); });
  var T = C.tipografias || {};
  if (T.nombre || T.titulos || T.texto) {
    var fams = [];
    if (T.nombre) fams.push("family=" + encodeURIComponent(T.nombre));
    if (T.titulos) fams.push("family=" + encodeURIComponent(T.titulos) + ":ital,wght@0,400;0,500;1,400");
    if (T.texto) fams.push("family=" + encodeURIComponent(T.texto) + ":wght@300;400;500;600");
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?" + fams.join("&") + "&display=swap";
    document.head.appendChild(link);
    if (T.nombre) root.style.setProperty("--f-nombre", '"' + T.nombre + '", "Snell Roundhand", cursive');
    if (T.titulos) root.style.setProperty("--f-titulos", '"' + T.titulos + '", Garamond, Georgia, serif');
    if (T.texto) root.style.setProperty("--f-texto", '"' + T.texto + '", "Segoe UI", system-ui, sans-serif');
  }

  /* ---------- 2. Textos ---------- */
  function get(path) { return path.split(".").reduce(function (o, k) { return o == null ? o : o[k]; }, C); }
  document.querySelectorAll("[data-bind]").forEach(function (el) {
    var v = get(el.getAttribute("data-bind"));
    if (v != null && v !== "") el.textContent = v;
  });
  document.title = "XV años de " + (C.nombre || "");
  $("demoRibbon").hidden = !C.demo;
  $("horaRango").textContent = C.horaTexto + (C.horaFin ? " a " + C.horaFin : "");
  if (!C.codigoVestimenta) $("dressRow").hidden = true;
  var msg = $("messageText");
  String(C.mensaje || "").split(/\n+/).forEach(function (p) {
    if (!p.trim()) return;
    var el = document.createElement("p"); el.textContent = p.trim(); msg.appendChild(el);
  });
  if (C.fechaLimiteConfirmacion) {
    $("rsvpDeadline").hidden = false;
    $("rsvpDeadline").textContent = "Por favor confirma antes del " + C.fechaLimiteConfirmacion + ".";
  }
  $("waNumber").textContent = "+" + String(C.whatsapp || "").replace(/\D/g, "");

  /* ---------- 3. Invitado y cupo ---------- */
  function readCode() {
    var h = decodeURIComponent((location.hash || "").replace(/^#/, "")).trim().toLowerCase();
    if (!h) { var m = location.search.match(/[?&](?:i|invitado)=([^&]+)/); if (m) h = decodeURIComponent(m[1]).toLowerCase(); }
    return h;
  }
  var guest = { codigo: "general", nombre: "", cupo: Math.max(1, +C.cupoGeneral || 1) };
  function resolveGuest() {
    var code = readCode();
    var found = (C.invitados || []).filter(function (g) { return String(g.codigo).toLowerCase() === code; })[0];
    guest = found ? { codigo: found.codigo, nombre: found.nombre, cupo: Math.max(1, +found.cupo || 1) }
                  : { codigo: "general", nombre: "", cupo: Math.max(1, +C.cupoGeneral || 1) };
    paintGuest();
    // Si hay backend, el cupo oficial viene de la base de datos
    if (hasBackend() && code) {
      rpc("obtener_invitado", { p_codigo: code }).then(function (r) {
        if (r && r.encontrado) { guest = { codigo: r.codigo, nombre: r.nombre, cupo: Math.max(1, +r.cupo || 1) }; paintGuest(); }
      }).catch(function () {});
    }
  }
  function plural(n) { return n === 1 ? "1 persona" : n + " personas"; }
  function paintGuest() {
    var named = !!guest.nombre;
    $("coverGuest").hidden = !named;
    $("heroGuest").hidden = !named;
    if (named) {
      $("coverGuest").textContent = "Para: " + guest.nombre;
      $("heroGuest").innerHTML = "";
      $("heroGuest").append("Invitación para ", strong(guest.nombre), " · válida para ", strong(plural(guest.cupo)));
    }
    $("rsvpPass").innerHTML = "";
    $("rsvpPass").append("Esta invitación es válida para ", strong(plural(guest.cupo)), ".");
    setCount(Math.min(count, guest.cupo));
  }
  function strong(t) { var s = document.createElement("strong"); s.textContent = t; return s; }
  window.addEventListener("hashchange", resolveGuest);

  /* ---------- 4. Bola disco (canvas) ---------- */
  function DiscoBall(canvas) {
    var ctx = canvas.getContext("2d"), dpr = Math.min(2, window.devicePixelRatio || 1);
    var size = canvas.width; canvas.width = canvas.height = size * dpr; ctx.scale(dpr, dpr);
    var R = size * 0.44, cx = size / 2, cy = size / 2, NL = 14, NM = 28, rot = 0;
    var seeds = []; for (var i = 0; i < NL * NM; i++) seeds.push(Math.random());
    var L = [-0.45, -0.55, 0.7], ln = Math.hypot(L[0], L[1], L[2]); L = L.map(function (v) { return v / ln; });
    function draw() {
      ctx.clearRect(0, 0, size, size);
      ctx.beginPath(); ctx.arc(cx, cy, R + 2, 0, 7); ctx.fillStyle = "#0c070b"; ctx.fill();
      for (var i = 0; i < NL; i++) {
        var t0 = -Math.PI / 2 + Math.PI * i / NL, t1 = -Math.PI / 2 + Math.PI * (i + 1) / NL;
        for (var j = 0; j < NM; j++) {
          var p0 = rot + 2 * Math.PI * j / NM, p1 = rot + 2 * Math.PI * (j + 1) / NM;
          var pm = (p0 + p1) / 2, tm = (t0 + t1) / 2;
          var nz = Math.cos(tm) * Math.cos(pm); if (nz <= 0.02) continue;
          var nx = Math.cos(tm) * Math.sin(pm), ny = Math.sin(tm);
          var d = Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]);
          var s = seeds[i * NM + j], tw = Math.sin(rot * 6 + s * 40) * 0.5 + 0.5;
          var v = Math.round(60 + 150 * Math.pow(d, 1.5) + 40 * s + (tw > 0.93 ? 60 : 0)); v = Math.min(255, v);
          ctx.fillStyle = s > 0.94 ? "rgba(246,210,214," + (0.6 + 0.4 * d) + ")" : "rgb(" + v + "," + v + "," + Math.min(255, v + 12) + ")";
          ctx.beginPath();
          var e = 0.018, pts = [[t0 + e, p0 + e], [t0 + e, p1 - e], [t1 - e, p1 - e], [t1 - e, p0 + e]];
          for (var k = 0; k < 4; k++) {
            var t = pts[k][0], p = pts[k][1];
            var x = cx + R * Math.cos(t) * Math.sin(p), y = cy + R * Math.sin(t);
            k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
          }
          ctx.closePath(); ctx.fill();
        }
      }
      var g = ctx.createRadialGradient(cx - R * .4, cy - R * .45, 0, cx - R * .4, cy - R * .45, R * .5);
      g.addColorStop(0, "rgba(255,255,255,.55)"); g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
    }
    return { step: function (dt) { rot += dt * 0.00035; draw(); }, draw: draw };
  }
  var balls = [new DiscoBall($("coverBall")), new DiscoBall($("heroBall"))];

  /* ---------- 5. Destellos y reflejos de fondo ---------- */
  var fx = $("fx"), fctx = fx.getContext("2d"), W = 0, H = 0, parts = [], spots = [];
  function resize() {
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    W = innerWidth; H = innerHeight; fx.width = W * dpr; fx.height = H * dpr; fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.round(Math.min(70, (W * H) / 9000));
    parts = []; for (var i = 0; i < n; i++) parts.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.6 + .4, ph: Math.random() * 6.28, sp: Math.random() * .002 + .0008, vy: Math.random() * .012 + .004 });
    spots = []; for (var j = 0; j < 14; j++) spots.push({ a: Math.random() * 6.28, d: Math.random() * .8 + .25, r: Math.random() * 26 + 10, c: ["243,229,200", "232,180,184", "255,255,255", "201,204,214"][j % 4] });
  }
  function star(x, y, r, a) {
    fctx.globalAlpha = a; fctx.beginPath();
    fctx.moveTo(x, y - r * 3); fctx.quadraticCurveTo(x, y, x + r * 3, y); fctx.quadraticCurveTo(x, y, x, y + r * 3);
    fctx.quadraticCurveTo(x, y, x - r * 3, y); fctx.quadraticCurveTo(x, y, x, y - r * 3); fctx.fill();
  }
  var spin = 0;
  function drawFx(t, dt) {
    fctx.clearRect(0, 0, W, H);
    spin += dt * 0.00005;
    var cx = W / 2, cy = H * 0.15, rad = Math.max(W, H);
    for (var j = 0; j < spots.length; j++) {
      var s = spots[j], a = s.a + spin, x = cx + Math.cos(a) * rad * s.d * 0.7, y = cy + Math.sin(a) * rad * s.d * 0.55 + H * .25;
      var g = fctx.createRadialGradient(x, y, 0, x, y, s.r);
      g.addColorStop(0, "rgba(" + s.c + ",.22)"); g.addColorStop(1, "rgba(" + s.c + ",0)");
      fctx.globalAlpha = 1; fctx.fillStyle = g; fctx.beginPath(); fctx.arc(x, y, s.r, 0, 7); fctx.fill();
    }
    fctx.fillStyle = "#fff8ec";
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i]; p.y -= p.vy * dt; if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
      var tw = Math.pow(Math.sin(t * p.sp + p.ph) * .5 + .5, 3);
      if (tw > .75) star(p.x, p.y, p.r, tw); else { fctx.globalAlpha = .25 + tw * .5; fctx.beginPath(); fctx.arc(p.x, p.y, p.r * .7, 0, 7); fctx.fill(); }
    }
    fctx.globalAlpha = 1;
  }
  resize(); addEventListener("resize", resize);
  var last = performance.now(), opened = false;
  function loop(t) {
    var dt = Math.min(50, t - last); last = t;
    if (!document.hidden) {
      drawFx(t, dt);
      (opened ? balls[1] : balls[0]).step(dt);
    }
    requestAnimationFrame(loop);
  }
  if (reduceMotion) { balls[0].draw(); balls[1].draw(); drawFx(0, 0); } else requestAnimationFrame(loop);

  /* ---------- 6. Música ---------- */
  var music = (function () {
    var mode = C.musica && C.musica.archivo ? "file" : "synth", audio = null, ctx = null, master = null, timer = null, playing = false;
    // Melodía ambiental original: progresión Am9 – Fmaj7 – Cmaj7 – G6 a 112 bpm
    var BPM = 112, beat = 60 / BPM, nextT = 0, step = 0;
    var chords = [[57, 60, 64, 67, 71], [53, 57, 60, 64, 69], [48, 55, 59, 64, 67], [55, 59, 62, 64, 71]];
    var arpOrder = [0, 2, 4, 3, 1, 3, 2, 4];
    function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }
    function initSynth() {
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
      ctx = new AC(); master = ctx.createGain(); master.gain.value = 0;
      var comp = ctx.createDynamicsCompressor(); master.connect(comp); comp.connect(ctx.destination);
      var delay = ctx.createDelay(); delay.delayTime.value = beat * .75;
      var fb = ctx.createGain(); fb.gain.value = .32; var wet = ctx.createGain(); wet.gain.value = .3;
      delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(master);
      ctx._send = delay;
      var buf = ctx.createBuffer(1, ctx.sampleRate * .2, ctx.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      ctx._noise = buf;
      return true;
    }
    function tone(freq, t, dur, type, vol, send, attack) {
      var o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.value = freq;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + (attack || .01)); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(g); g.connect(master); if (send) g.connect(ctx._send); o.start(t); o.stop(t + dur + .05);
    }
    function hat(t, vol) {
      var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      s.buffer = ctx._noise; f.type = "highpass"; f.frequency.value = 8000;
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + .06);
      s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + .08);
    }
    function kick(t) {
      var o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(45, t + .12);
      g.gain.setValueAtTime(.32, t); g.gain.exponentialRampToValueAtTime(.0001, t + .3); o.connect(g); g.connect(master); o.start(t); o.stop(t + .32);
    }
    function schedule() {
      while (nextT < ctx.currentTime + .25) {
        var bar = Math.floor(step / 16) % 4, s16 = step % 16, ch = chords[bar], t = nextT;
        if (s16 === 0) ch.forEach(function (m) { tone(hz(m), t, beat * 4.2, "triangle", .028, false, .6); tone(hz(m) * 1.004, t, beat * 4.2, "sine", .02, false, .8); });
        if (s16 % 2 === 0) tone(hz(ch[arpOrder[(s16 / 2) % 8]] + 12), t, .45, "sine", .07, true);
        if (s16 % 4 === 0) kick(t);
        if (s16 % 4 === 2) { hat(t, .05); tone(hz(ch[0] - 12 + (s16 % 8 === 2 ? 0 : 12)), t, beat * .45, "sine", .14); }
        if (s16 % 4 === 0) tone(hz(ch[0] - 24), t, beat * .4, "sine", .16);
        if (s16 % 2 === 1) hat(t, .015);
        nextT += beat / 4; step++;
      }
    }
    function start() {
      if (mode === "file") {
        if (!audio) { audio = new Audio(C.musica.archivo); audio.loop = true; audio.preload = "auto"; }
        var p = audio.play(); if (p && p.catch) p.catch(function () { setUI(false); playing = false; });
      } else {
        if (!ctx && !initSynth()) return;
        if (ctx.state === "suspended") ctx.resume();
        if (!timer) { nextT = ctx.currentTime + .1; timer = setInterval(schedule, 60); }
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
        master.gain.linearRampToValueAtTime(.55, ctx.currentTime + 1.5);
      }
      playing = true; setUI(true);
    }
    function stop() {
      if (mode === "file") { if (audio) audio.pause(); }
      else if (ctx) { master.gain.setValueAtTime(master.gain.value, ctx.currentTime); master.gain.linearRampToValueAtTime(0, ctx.currentTime + .3); setTimeout(function () { if (!playing) ctx.suspend(); }, 400); }
      playing = false; setUI(false);
    }
    function setUI(on) {
      var b = $("musicBtn"); b.classList.toggle("paused", !on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
      b.setAttribute("aria-label", on ? "Pausar música" : "Reproducir música");
      $("musicLbl").textContent = on ? "Pausar" : "Música";
    }
    var resumeOnShow = false;
    document.addEventListener("visibilitychange", function () {
      if (document.hidden && playing) { resumeOnShow = true; stop(); }
      else if (!document.hidden && resumeOnShow) { resumeOnShow = false; start(); }
    });
    return { start: start, toggle: function () { playing ? stop() : start(); } };
  })();
  $("musicBtn").addEventListener("click", music.toggle);

  /* ---------- 7. Abrir invitación ---------- */
  document.body.classList.add("locked");
  $("openBtn").addEventListener("click", function () {
    music.start();                       // dentro del clic: lo exigen iPhone y Chrome
    var cover = $("cover");
    cover.classList.add("opening");
    $("main").removeAttribute("aria-hidden");
    $("musicBtn").hidden = false;
    opened = true;
    setTimeout(function () {
      cover.classList.add("gone"); document.body.classList.remove("locked");
      $("main").focus && $("main").setAttribute("tabindex", "-1");
    }, reduceMotion ? 50 : 1500);
  });

  /* Aparición al hacer scroll (solo si hay animación) */
  if (!reduceMotion && "IntersectionObserver" in window) {
    root.classList.add("js-anim");
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.remove("pending"); io.unobserve(e.target); } });
    }, { threshold: .12 });
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("pending"); io.observe(el); });
    setTimeout(function () { document.querySelectorAll(".reveal.pending").forEach(function (el) { el.classList.remove("pending"); }); }, 9000);
  }

  /* ---------- 8. Cuenta regresiva ---------- */
  var target = new Date(C.fechaHoraISO).getTime();
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function tick() {
    var ms = target - Date.now();
    if (isNaN(ms) || ms <= 0) { $("countdown").hidden = true; $("cdDone").hidden = false; return; }
    var s = Math.floor(ms / 1000);
    $("cdD").textContent = Math.floor(s / 86400);
    $("cdH").textContent = pad(Math.floor(s % 86400 / 3600));
    $("cdM").textContent = pad(Math.floor(s % 3600 / 60));
    $("cdS").textContent = pad(s % 60);
  }
  tick(); setInterval(tick, 1000);

  /* ---------- 9. Galería + visor ---------- */
  var fotos = C.fotos || [], track = $("track"), dots = $("dots"), current = 0;
  fotos.forEach(function (f, i) {
    var b = document.createElement("button"); b.type = "button"; b.className = "slide" + (i === 0 ? " active" : "");
    b.setAttribute("aria-label", "Ampliar foto " + (i + 1) + " de " + fotos.length);
    var img = document.createElement("img"); img.src = f.src; img.alt = f.alt || ""; img.decoding = "async";
    if (i > 0) img.loading = "lazy";
    b.appendChild(img); b.addEventListener("click", function () { openLb(i); }); track.appendChild(b);
    var d = document.createElement("button"); d.type = "button"; d.setAttribute("role", "tab");
    d.setAttribute("aria-label", "Foto " + (i + 1)); d.setAttribute("aria-selected", i === 0 ? "true" : "false");
    d.addEventListener("click", function () { go(i); }); dots.appendChild(d);
  });
  function go(i) {
    i = (i + fotos.length) % fotos.length; var s = track.children[i];
    track.scrollTo({ left: s.offsetLeft - (track.clientWidth - s.clientWidth) / 2, behavior: reduceMotion ? "auto" : "smooth" });
  }
  function setActive(i) {
    current = i;
    Array.prototype.forEach.call(track.children, function (s, k) { s.classList.toggle("active", k === i); });
    Array.prototype.forEach.call(dots.children, function (d, k) { d.setAttribute("aria-selected", k === i ? "true" : "false"); });
  }
  var raf = 0;
  track.addEventListener("scroll", function () {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function () {
      var mid = track.scrollLeft + track.clientWidth / 2, best = 0, bd = 1e9;
      Array.prototype.forEach.call(track.children, function (s, k) { var c = s.offsetLeft + s.clientWidth / 2, dd = Math.abs(c - mid); if (dd < bd) { bd = dd; best = k; } });
      if (best !== current) setActive(best);
    });
  }, { passive: true });
  $("prevBtn").addEventListener("click", function () { go(current - 1); });
  $("nextBtn").addEventListener("click", function () { go(current + 1); });
  track.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft") go(current - 1); if (e.key === "ArrowRight") go(current + 1); });
  var autoTimer = null;
  function auto() { clearInterval(autoTimer); if (!reduceMotion && fotos.length > 1) autoTimer = setInterval(function () { if (!document.hidden && $("lightbox").hidden) go(current + 1); }, 5500); }
  ["pointerdown", "touchstart", "wheel"].forEach(function (ev) { track.addEventListener(ev, auto, { passive: true }); });
  auto();
  addEventListener("load", function () { go(0); });

  var lb = $("lightbox"), lbIdx = 0, lastFocus = null;
  function showLb(i) {
    lbIdx = (i + fotos.length) % fotos.length; var img = $("lbImg");
    img.style.animation = "none"; void img.offsetWidth; img.style.animation = "";
    img.src = fotos[lbIdx].src; img.alt = fotos[lbIdx].alt || "";
    $("lbCount").textContent = (lbIdx + 1) + " / " + fotos.length;
  }
  function openLb(i) { lastFocus = document.activeElement; showLb(i); lb.hidden = false; document.body.classList.add("locked"); $("lbClose").focus(); }
  function closeLb() { lb.hidden = true; document.body.classList.remove("locked"); if (lastFocus) lastFocus.focus(); }
  $("lbClose").addEventListener("click", closeLb);
  $("lbPrev").addEventListener("click", function () { showLb(lbIdx - 1); });
  $("lbNext").addEventListener("click", function () { showLb(lbIdx + 1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb(); if (e.key === "ArrowLeft") showLb(lbIdx - 1); if (e.key === "ArrowRight") showLb(lbIdx + 1);
  });
  var tx = null;
  lb.addEventListener("touchstart", function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    if (tx == null) return; var dx = e.changedTouches[0].clientX - tx; tx = null;
    if (Math.abs(dx) > 50) showLb(lbIdx + (dx < 0 ? 1 : -1));
  });

  /* ---------- 10. Mapas ---------- */
  var lugar = C.lugar || {}, hasCoords = lugar.lat != null && lugar.lng != null;
  var dest = hasCoords ? lugar.lat + "," + lugar.lng : encodeURIComponent(lugar.direccion || "");
  $("mapsBtn").href = "https://www.google.com/maps/dir/?api=1&destination=" + dest;
  $("wazeBtn").href = hasCoords ? "https://waze.com/ul?ll=" + dest + "&navigate=yes" : "https://waze.com/ul?q=" + dest + "&navigate=yes";
  $("appleBtn").href = "https://maps.apple.com/?daddr=" + dest + "&q=" + encodeURIComponent(lugar.nombre || "");

  /* ---------- 11. Confirmación de asistencia ---------- */
  var count = 1;
  function setCount(n) {
    count = Math.max(1, Math.min(guest.cupo, n));
    $("fCant").textContent = count;
    $("minus").disabled = count <= 1;
    $("plus").disabled = count >= guest.cupo;
    $("cupoHint").textContent = guest.cupo === 1 ? "Tu invitación es individual." :
      "Máximo " + plural(guest.cupo) + ", incluyéndote.";
    renderAcomp();
  }
  function renderAcomp() {
    var list = $("acompList"), need = count - 1, prev = [];
    list.querySelectorAll("input").forEach(function (i) { prev.push(i.value); });
    list.innerHTML = "";
    for (var i = 0; i < need; i++) {
      var inp = document.createElement("input"); inp.type = "text"; inp.id = "fAcomp" + i; inp.maxLength = 80;
      inp.autocomplete = "off"; inp.placeholder = "Acompañante " + (i + 1); inp.value = prev[i] || "";
      inp.setAttribute("aria-label", "Nombre del acompañante " + (i + 1));
      list.appendChild(inp);
    }
    $("acompWrap").hidden = need === 0;
  }
  $("minus").addEventListener("click", function () { setCount(count - 1); });
  $("plus").addEventListener("click", function () { setCount(count + 1); });

  function hasBackend() { return !!(C.supabase && C.supabase.url && C.supabase.anonKey); }
  function rpc(fn, body) {
    return fetch(C.supabase.url.replace(/\/$/, "") + "/rest/v1/rpc/" + fn, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: C.supabase.anonKey, Authorization: "Bearer " + C.supabase.anonKey },
      body: JSON.stringify(body)
    }).then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.json(); });
  }
  function waLink(text) { return "https://wa.me/" + String(C.whatsapp || "").replace(/\D/g, "") + "?text=" + encodeURIComponent(text); }
  function showError(t) { var e = $("formError"); e.textContent = t; e.hidden = !t; }

  function finish(asiste, nombre, acomp) {
    var who = C.nombreCompleto || C.nombre, text;
    if (asiste) {
      text = "¡Hola! Confirmo mi asistencia a los 15 años de " + who + ".\n\n" +
        "Invitado principal: " + nombre + "\n" +
        "Personas que asistirán: " + count + " de " + guest.cupo + " autorizadas" +
        (acomp.length ? "\nAcompañantes: " + acomp.join(", ") : "") +
        (guest.nombre ? "\nInvitación: " + guest.nombre + " (" + guest.codigo + ")" : "");
      $("doneTitle").textContent = "¡Te esperamos!";
      $("doneText").textContent = "Último paso: envía tu confirmación por WhatsApp para que los organizadores la reciban.";
    } else {
      text = "¡Hola! Soy " + nombre + ". Lamentablemente no podré asistir a los 15 años de " + who + ". ¡Le deseo una noche maravillosa!" +
        (guest.nombre ? "\nInvitación: " + guest.nombre + " (" + guest.codigo + ")" : "");
      $("doneTitle").textContent = "Gracias por avisar";
      $("doneText").textContent = "Envía tu respuesta por WhatsApp para que los organizadores lo sepan.";
    }
    $("waBtn").href = waLink(text);
    $("rsvpForm").hidden = true; $("rsvpDone").hidden = false;
    $("rsvpDone").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  }

  function submit(asiste) {
    showError("");
    var nameEl = $("fNombre"), nombre = nameEl.value.trim().replace(/\s+/g, " ");
    nameEl.classList.toggle("invalid", nombre.length < 3);
    if (nombre.length < 3) { showError("Escribe tu nombre y apellido para confirmar."); nameEl.focus(); return; }
    var acomp = [];
    if (asiste) {
      if (count > guest.cupo) { showError("Tu invitación permite máximo " + plural(guest.cupo) + "."); return; }
      var missing = null;
      $("acompList").querySelectorAll("input").forEach(function (i) {
        var v = i.value.trim(); i.classList.toggle("invalid", !v); if (!v && !missing) missing = i; if (v) acomp.push(v);
      });
      if (missing) { showError("Escribe el nombre de cada acompañante, o reduce la cantidad de personas."); missing.focus(); return; }
    }
    if (!hasBackend()) { finish(asiste, nombre, acomp); return; }
    var btn = $("confirmBtn"); btn.disabled = true; btn.firstElementChild.textContent = "Guardando…";
    rpc("confirmar_asistencia", {
      p_codigo: guest.codigo, p_nombre: nombre, p_cantidad: asiste ? count : 0, p_acompanantes: acomp, p_asiste: asiste
    }).then(function (r) {
      if (r && r.ok) finish(asiste, nombre, acomp);
      else showError((r && r.mensaje) || "No pudimos guardar tu confirmación. Inténtalo de nuevo.");
    }).catch(function () {
      // Si el servidor no responde, el invitado igual puede confirmar por WhatsApp
      finish(asiste, nombre, acomp);
    }).then(function () { btn.disabled = false; btn.firstElementChild.textContent = "Confirmar asistencia"; });
  }
  $("rsvpForm").addEventListener("submit", function (e) { e.preventDefault(); submit(true); });
  $("declineBtn").addEventListener("click", function () { submit(false); });
  $("editBtn").addEventListener("click", function () { $("rsvpDone").hidden = true; $("rsvpForm").hidden = false; });
  $("rsvpForm").addEventListener("input", function (e) { if (e.target.classList) e.target.classList.remove("invalid"); });

  resolveGuest();
})();
