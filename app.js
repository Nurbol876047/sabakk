(() => {
  "use strict";

  /* ---------------- helpers ---------------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const num = (v, d = 1) => v.toFixed(d).replace(".", ",");
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
  };

  /* ---------------- chapters ---------------- */
  const CHAPTERS = [
    { t: 0,   n: "Кіріспе: Әлем мен атом",        img: "c3" },
    { t: 16,  n: "Сәлемдесу",                      img: "c18" },
    { t: 24,  n: "Physics AI көмекшісі",            img: "c26" },
    { t: 45,  n: "Кристалдық және аморф денелер",   img: "c50" },
    { t: 64,  n: "Деформация түрлері",              img: "c66" },
    { t: 71,  n: "Гук заңы",                        img: "c74" },
    { t: 98,  n: "2-тапсырма",                      img: "c101" },
    { t: 115, n: "Қаныққан бу",                     img: "c117" },
    { t: 129, n: "Ауа ылғалдылығы",                 img: "c131" },
    { t: 148, n: "Шық нүктесі: тәжірибе",           img: "c150" },
    { t: 168, n: "Булану",                          img: "c170" },
    { t: 186, n: "Беттік керілу және сулану",       img: "c192" },
    { t: 213, n: "Психрометр",                      img: "c215" },
    { t: 220, n: "Проблемалық сұрақ",               img: "c221" },
    { t: 226, n: "Қорытынды: ағашты кептіру",       img: "c229" },
  ];

  const video = $("#lessonVideo");
  const list = $("#chapList");
  const bar = $("#chapbar");
  const nowTitle = $("#nowTitle");
  let duration = 233.9;

  $("#chapCount").textContent = CHAPTERS.length;

  CHAPTERS.forEach((c, i) => {
    const li = document.createElement("li");
    li.innerHTML = `<button class="chap" data-i="${i}">
        <img src="assets/ch/${c.img}.jpg" alt="" loading="lazy" width="84" height="47">
        <span><span class="chap__t">${fmt(c.t)}</span><br><span class="chap__n">${c.n}</span></span>
      </button>`;
    list.appendChild(li);

    const seg = document.createElement("button");
    seg.title = `${fmt(c.t)} · ${c.n}`;
    seg.tabIndex = -1;
    seg.innerHTML = "<i></i>";
    seg.addEventListener("click", () => seekTo(c.t));
    bar.appendChild(seg);
  });

  const chapBtns = $$(".chap", list);
  const segs = $$("button", bar);

  function layoutSegments() {
    CHAPTERS.forEach((c, i) => {
      const end = i + 1 < CHAPTERS.length ? CHAPTERS[i + 1].t : duration;
      segs[i].style.flex = `${Math.max(end - c.t, 1)} 1 0`;
    });
  }
  layoutSegments();

  video.addEventListener("loadedmetadata", () => {
    if (isFinite(video.duration)) duration = video.duration;
    layoutSegments();
  });

  chapBtns.forEach((b) => b.addEventListener("click", () => seekTo(CHAPTERS[+b.dataset.i].t)));

  let activeIdx = -1;
  function update() {
    const t = video.currentTime;
    let idx = 0;
    for (let i = 0; i < CHAPTERS.length; i++) if (t >= CHAPTERS[i].t - 0.05) idx = i;

    CHAPTERS.forEach((c, i) => {
      const end = i + 1 < CHAPTERS.length ? CHAPTERS[i + 1].t : duration;
      const p = t >= end ? 100 : t <= c.t ? 0 : ((t - c.t) / (end - c.t)) * 100;
      segs[i].firstChild.style.width = p + "%";
    });

    if (idx !== activeIdx) {
      activeIdx = idx;
      chapBtns.forEach((b, i) => b.classList.toggle("on", i === idx));
      nowTitle.textContent = CHAPTERS[idx].n;
      // keep active chapter visible inside the list only (not the page)
      const btn = chapBtns[idx];
      const box = list.getBoundingClientRect();
      const r = btn.getBoundingClientRect();
      const horizontal = list.scrollWidth > list.clientWidth + 2;
      if (horizontal) {
        if (r.left < box.left || r.right > box.right)
          list.scrollTo({ left: list.scrollLeft + (r.left - box.left) - 12, behavior: "smooth" });
      } else if (r.top < box.top || r.bottom > box.bottom) {
        list.scrollTo({ top: list.scrollTop + (r.top - box.top) - box.height / 2 + r.height / 2, behavior: "smooth" });
      }
    }
  }
  video.addEventListener("timeupdate", update);
  video.addEventListener("seeked", update);
  update();

  function seekTo(t, scroll = false) {
    const go = () => {
      video.currentTime = t;
      const p = video.play();
      if (p && p.catch) p.catch(() => {});
    };
    if (video.readyState >= 1) go();
    else video.addEventListener("loadedmetadata", go, { once: true });
    if (scroll) $("#video").scrollIntoView({ behavior: "smooth" });
  }

  // any [data-seek] button anywhere on the page
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-seek]");
    if (!b) return;
    e.preventDefault();
    seekTo(+b.dataset.seek, true);
  });

  // hero "play" links
  $$("[data-play]").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      $("#video").scrollIntoView({ behavior: "smooth" });
      const p = video.play();
      if (p && p.catch) p.catch(() => {});
    })
  );

  // speed
  $$(".speed button").forEach((b) =>
    b.addEventListener("click", () => {
      video.playbackRate = +b.dataset.speed;
      $$(".speed button").forEach((x) => x.classList.toggle("on", x === b));
    })
  );

  // wide mode
  const wideBtn = $("#wideBtn");
  wideBtn.addEventListener("click", () => {
    const on = $("#player").classList.toggle("wide");
    wideBtn.setAttribute("aria-pressed", on);
  });

  /* ---------------- mobile menu ---------------- */
  const burger = $("#burger");
  const navBox = $("#navLinks");
  const setMenu = (open) => {
    navBox.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open);
  };
  burger.addEventListener("click", (e) => { e.stopPropagation(); setMenu(!navBox.classList.contains("open")); });
  navBox.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("click", (e) => { if (!e.target.closest(".nav")) setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  /* ---------------- nav highlight + reveal ---------------- */
  const navLinks = $$(".nav__links a");
  const sections = navLinks.map((a) => $(a.getAttribute("href")));
  const navObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          navLinks.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#" + en.target.id));
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => s && navObs.observe(s));

  const revObs = new IntersectionObserver(
    (entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); revObs.unobserve(en.target); } }),
    { rootMargin: "0px 0px -8% 0px" }
  );
  $$(".reveal").forEach((el, i) => {
    el.style.transitionDelay = `${(i % 3) * 70}ms`;
    revObs.observe(el);
  });

  /* ---------------- range fill ---------------- */
  function paintRange(r) {
    const p = ((r.value - r.min) / (r.max - r.min)) * 100;
    r.style.setProperty("--p", p + "%");
  }
  $$("input[type=range]").forEach((r) => { paintRange(r); r.addEventListener("input", () => paintRange(r)); });

  /* ---------------- Hooke lab ---------------- */
  const G = 9.8;
  const X_LIMIT = 0.12; // m — "серпімділік шегі" for the demo spring
  const kIn = $("#kIn"), mIn = $("#mIn");
  const springPath = $("#springPath"), weight = $("#weight"), weightLabel = $("#weightLabel");
  const chart = $("#hookeChart");
  const ctx = chart.getContext("2d");

  // ruler ticks
  (() => {
    const g = $("#ruler");
    let h = "";
    // 0 cm = top of the weight at rest (y = 76), 1 cm = 12 px
    for (let i = 0; i <= 20; i++) {
      const y = 76 + i * 12;
      const long = i % 5 === 0;
      h += `<line x1="${long ? 128 : 134}" y1="${y}" x2="140" y2="${y}" stroke="var(--muted)" stroke-width="1" opacity=".6"/>`;
      if (long) h += `<text x="124" y="${y + 4}" font-size="9" fill="var(--muted)" text-anchor="end">${i}</text>`;
    }
    // elastic limit marker
    const yl = 76 + X_LIMIT * 100 * 12;
    h += `<line x1="96" y1="${yl}" x2="140" y2="${yl}" stroke="var(--bad)" stroke-width="1.5" stroke-dasharray="3 3"/>`;
    g.innerHTML = h;
  })();

  function cssVar(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }

  function drawSpring(len) {
    const top = 16, x0 = 80, coils = 14, amp = 18;
    const lead = 10;
    const pts = [[x0, top], [x0, top + lead]];
    const body = len - lead * 2;
    for (let i = 1; i <= coils * 2; i++) {
      const y = top + lead + (body * i) / (coils * 2 + 1);
      pts.push([x0 + (i % 2 ? amp : -amp), y]);
    }
    pts.push([x0, top + len - lead], [x0, top + len]);
    springPath.setAttribute("points", pts.map((p) => p.join(",")).join(" "));
    weight.setAttribute("transform", `translate(0 ${top + len})`);
  }

  function drawChart(k, x, F) {
    const dpr = window.devicePixelRatio || 1;
    const w = chart.clientWidth || 420, h = Math.round(w * 0.43);
    if (chart.width !== Math.round(w * dpr)) { chart.width = Math.round(w * dpr); chart.height = Math.round(h * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const pad = { l: 44, r: 14, t: 14, b: 30 };
    const xMax = 0.2, fMax = 30;
    const X = (v) => pad.l + (v / xMax) * (w - pad.l - pad.r);
    const Y = (v) => h - pad.b - (v / fMax) * (h - pad.t - pad.b);
    const muted = cssVar("--muted"), accent = cssVar("--accent"), warm = cssVar("--warm"), line = "rgba(16,52,72,.10)";

    ctx.font = "11px Inter, sans-serif";
    ctx.fillStyle = muted; ctx.strokeStyle = line; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const xv = (xMax / 4) * i, yv = (fMax / 3) * Math.min(i, 3);
      ctx.beginPath(); ctx.moveTo(X(xv), pad.t); ctx.lineTo(X(xv), h - pad.b); ctx.stroke();
      ctx.textAlign = "center"; ctx.fillText(Math.round(xv * 100) + "", X(xv), h - pad.b + 16);
      if (i <= 3) {
        ctx.beginPath(); ctx.moveTo(pad.l, Y(yv)); ctx.lineTo(w - pad.r, Y(yv)); ctx.stroke();
        ctx.textAlign = "right"; ctx.fillText(Math.round(yv) + "", pad.l - 8, Y(yv) + 4);
      }
    }
    ctx.textAlign = "left"; ctx.fillText("F, Н", 6, pad.t + 4);
    ctx.textAlign = "right"; ctx.fillText("x, см", w - pad.r, h - 4);

    // elastic-limit zone
    ctx.fillStyle = "rgba(224,65,59,.07)";
    ctx.fillRect(X(X_LIMIT), pad.t, X(xMax) - X(X_LIMIT), h - pad.t - pad.b);

    // F = kx line
    ctx.strokeStyle = accent; ctx.lineWidth = 2.5; ctx.beginPath();
    ctx.moveTo(X(0), Y(0));
    const xEnd = Math.min(xMax, fMax / k);
    ctx.lineTo(X(xEnd), Y(k * xEnd)); ctx.stroke();

    // point
    if (x <= xMax) {
      ctx.setLineDash([4, 4]); ctx.strokeStyle = warm; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(X(x), Y(0)); ctx.lineTo(X(x), Y(F)); ctx.lineTo(X(0), Y(F)); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = warm; ctx.beginPath(); ctx.arc(X(x), Y(F), 6, 0, Math.PI * 2); ctx.fill();
    }
  }

  function updateHooke() {
    const k = +kIn.value, m = +mIn.value;
    const F = m * G, x = F / k;
    $("#kOut").textContent = `${k} Н/м`;
    $("#mOut").textContent = `${num(m)} кг`;
    $("#fOut").textContent = `${num(F)} Н`;
    $("#xOut").textContent = `${num(x * 100)} см`;
    weightLabel.textContent = `${num(m)} кг`;
    // 1 cm == 12 px on the ruler; rest length 60px
    const len = 60 + Math.min(x * 100, 21) * 12;
    drawSpring(len);
    $("#hookeWarn").hidden = x <= X_LIMIT;
    springPath.style.stroke = x > X_LIMIT ? cssVar("--bad") : "";
    drawChart(k, x, F);
  }
  kIn.addEventListener("input", updateHooke);
  mIn.addEventListener("input", updateHooke);
  window.addEventListener("resize", updateHooke);
  updateHooke();

  /* ---------------- Psychrometer lab ---------------- */
  // Magnus formula, saturated vapour pressure (hPa)
  const es = (t) => 6.112 * Math.exp((17.62 * t) / (243.12 + t));
  const A = 6.62e-4, P = 1013; // ventilated psychrometer constant, normal pressure
  const tIn = $("#tIn"), dIn = $("#dIn");

  function updatePsy() {
    const t = +tIn.value;
    const d = Math.min(+dIn.value, t + 10);
    const tw = t - d;
    const e = Math.max(es(tw) - A * P * (t - tw), 0.01);
    const rh = Math.max(0, Math.min(100, (e / es(t)) * 100));
    const lnr = Math.log(e / 6.112);
    const dew = (243.12 * lnr) / (17.62 - lnr);
    const abs = (216.7 * e) / (273.15 + t); // g/m³

    $("#tOut").textContent = `${t} °C`;
    $("#dOut").textContent = `${num(d, d % 1 ? 1 : 0)} °C`;
    $("#dryVal").textContent = `${t} °C`;
    $("#wetVal").textContent = `${num(tw, tw % 1 ? 1 : 0)} °C`;
    const toH = (v) => Math.max(4, Math.min(100, ((v + 10) / 50) * 100)) + "%";
    $("#dryFill").style.height = toH(t);
    $("#wetFill").style.height = toH(tw);

    const r = Math.round(rh);
    $("#rhOut").textContent = r + "%";
    $("#rhOut2").textContent = r + "%";
    $("#dewOut").textContent = rh < 1 ? "—" : `${num(dew, 0)} °C`;
    $("#absOut").textContent = `${num(abs, 1)} г/м³`;

    const arc = $("#gaugeArc");
    arc.style.strokeDashoffset = 314.16 * (1 - rh / 100);
    let note, col;
    if (rh < 30) { note = "өте құрғақ"; col = cssVar("--warm"); }
    else if (rh < 40) { note = "құрғақ"; col = cssVar("--warm"); }
    else if (rh <= 60) { note = "қолайлы"; col = cssVar("--good"); }
    else if (rh < 85) { note = "ылғалды"; col = cssVar("--accent-2"); }
    else { note = "өте ылғалды"; col = cssVar("--accent-2"); }
    $("#rhNote").textContent = note;
    arc.style.stroke = col;
  }
  tIn.addEventListener("input", updatePsy);
  dIn.addEventListener("input", updatePsy);
  updatePsy();

  /* ---------------- Quiz ---------------- */
  const QUIZ = [
    {
      q: "Төмендегі денелердің қайсысы аморф дене?",
      o: ["Ас тұзы", "Алмаз", "Шыны", "Мұз"],
      a: 2,
      e: "Шыны — аморф дене: оның бөлшектері ретсіз орналасқан, белгілі балқу температурасы жоқ, қыздырғанда біртіндеп жұмсарады.",
      t: 45,
    },
    {
      q: "Кристалдық денелерге тән қасиет:",
      o: ["Балқу температурасы тұрақты", "Қыздырғанда біртіндеп жұмсарады", "Бөлшектері ретсіз орналасқан", "Барлық бағытта қасиеттері бірдей"],
      a: 0,
      e: "Кристалдардың бөлшектері реттелген торда орналасқан, сондықтан олар белгілі бір температурада балқиды және анизотропты болады.",
      t: 45,
    },
    {
      q: "Қатаңдығы 200 Н/м серіппе 5 см-ге созылды. Серпімділік күшінің модулі неге тең?",
      o: ["1000 Н", "40 Н", "10 Н", "4 Н"],
      a: 2,
      e: "F = kx = 200 Н/м · 0,05 м = 10 Н. Сантиметрді метрге айналдыруды ұмытпа!",
      t: 71,
    },
    {
      q: "Қаныққан бу дегеніміз —",
      o: ["Өте жоғары температурадағы бу", "Өз сұйығымен динамикалық тепе-теңдікте тұрған бу", "Сұйықтан бөлек тұрған кез келген бу", "Қысымы көлемге тура пропорционал бу"],
      a: 1,
      e: "Қаныққан буда булану мен конденсация жылдамдықтары тең: ұшып шыққан молекулалар саны қайта оралғандар санына тең.",
      t: 115,
    },
    {
      q: "Психрометрдің құрғақ термометрі 21 °C, ылғал термометрі 16 °C көрсетеді. Ауаның салыстырмалы ылғалдылығы шамамен қанша?",
      o: ["≈ 30%", "≈ 60%", "≈ 85%", "100%"],
      a: 1,
      e: "Айырмасы Δt = 5 °C. Психрометрлік кесте бойынша 21 °C-та бұл ≈ 60%. Зертханадағы психрометрде тексеріп көр!",
      t: 213,
    },
    {
      q: "Үйрек судан шыққанда неге құрғақ болып қалады?",
      o: ["Қауырсыны суды тез буландырады", "Су қауырсынды суландырмайды — майлы қабат және беттік керілу", "Үйректің денесі өте ыстық", "Су қауырсынның ішіне сіңіп кетеді"],
      a: 1,
      e: "Қауырсындағы майлы қабат суланбайды, ал беттік керілу әсерінен су шар тәрізді тамшыларға жиналып, домалап түседі.",
      t: 186,
    },
  ];

  const stage = $("#quizStage");
  const qBar = $("#quizBar");
  const qCount = $("#quizCount");
  let qi = 0, score = 0, answered = false;

  function renderQ() {
    answered = false;
    const item = QUIZ[qi];
    qCount.textContent = `${qi + 1} / ${QUIZ.length}`;
    qBar.style.width = `${(qi / QUIZ.length) * 100}%`;
    stage.innerHTML = `
      <div class="q__text">${item.q}</div>
      <div class="q__opts">${item.o.map((o, i) => `<button class="opt" data-o="${i}"><i>${"ABCD"[i]}</i><span>${o}</span></button>`).join("")}</div>
      <div class="q__slot"></div>
      <div class="q__nav">
        <button class="seek" data-seek="${item.t}">▶ Бейнеден қарау · ${fmt(item.t)}</button>
        <button class="btn btn--primary btn--sm" id="qNext" hidden>${qi + 1 < QUIZ.length ? "Келесі сұрақ →" : "Нәтижені көру"}</button>
      </div>`;
    $$(".opt", stage).forEach((b) => b.addEventListener("click", () => pick(+b.dataset.o)));
    $("#qNext", stage).addEventListener("click", next);
  }

  function pick(i) {
    if (answered) return;
    answered = true;
    const item = QUIZ[qi];
    const opts = $$(".opt", stage);
    opts.forEach((b, j) => {
      b.disabled = true;
      if (j === item.a) b.classList.add("right");
      else if (j === i) b.classList.add("wrong");
    });
    if (i === item.a) score++;
    $(".q__slot", stage).innerHTML = `<div class="q__explain"><b>${i === item.a ? "✅ Дұрыс!" : "❌ Қате."}</b> ${item.e}</div>`;
    const nb = $("#qNext", stage);
    nb.hidden = false;
    nb.focus({ preventScroll: true });
  }

  function next() {
    qi++;
    if (qi < QUIZ.length) return renderQ();
    qBar.style.width = "100%";
    qCount.textContent = `${QUIZ.length} / ${QUIZ.length}`;
    const pct = score / QUIZ.length;
    const msg = pct === 1 ? "Керемет! Барлық сұраққа дұрыс жауап бердің 🏆"
      : pct >= 0.67 ? "Жақсы нәтиже! Қате кеткен тақырыптарды бейнеден тағы бір қара."
      : "Бейнесабақты қайта көріп, тағы бір рет байқап көр — міндетті түрде шығады!";
    stage.innerHTML = `<div class="result">
        <div class="result__score">${score} / ${QUIZ.length}</div>
        <p>${msg}</p>
        <button class="btn btn--ghost" id="qAgain">Қайтадан бастау ↺</button>
      </div>`;
    store.set("quiz-score", `${score}/${QUIZ.length}`);
    $("#qAgain").addEventListener("click", () => { qi = 0; score = 0; renderQ(); });
  }
  renderQ();

  /* ---------------- Reflection ---------------- */
  const lights = $$(".light");
  function setMood(m) {
    lights.forEach((l) => {
      const on = l.dataset.mood === m;
      l.classList.toggle("on", on);
      l.setAttribute("aria-checked", on);
    });
  }
  lights.forEach((l) => l.addEventListener("click", () => {
    setMood(l.dataset.mood);
    store.set("reflect-mood", l.dataset.mood);
    flashSaved();
  }));
  const savedMood = store.get("reflect-mood");
  if (savedMood) setMood(savedMood);

  const ta = $("#reflectText");
  ta.value = store.get("reflect-text") || "";
  let tmr;
  ta.addEventListener("input", () => {
    clearTimeout(tmr);
    tmr = setTimeout(() => { store.set("reflect-text", ta.value); flashSaved(); }, 500);
  });
  function flashSaved() {
    const el = $("#reflectSaved");
    el.textContent = "✓ Сақталды";
    clearTimeout(flashSaved.t);
    flashSaved.t = setTimeout(() => (el.textContent = ""), 1800);
  }
})();
