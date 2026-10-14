(() => {
  "use strict";

  // EXP ที่ต้องใช้เพื่อขึ้นจากเลเวล N ไปเป็นเลเวล N+1
  const EXP_TABLE = {
    15: 240,
    49: 126794,
    55: 4692537,
    56: 145468647,
    57: 160015511,
    58: 176017062,
    59: 193618768,
    60: 212980644,
    61: 234278708,
    62: 7262639948,
    63: 9441431932,
    64: 12462690150,
    65: 37388070450,
    66: 46361207358,
    67: 57024285050,
    68: 69569627761,
    69: 84179249590,
    70: 126268874385,
    71: 151522649262,
    72: 178796726129,
    73: 207404202309,
    74: 236440790632,
    75: 307373027821,
  };

  const MAX_LEVEL = 75;
  const STORAGE_KEY = "bdo-training-planner:v1";
  const LANG_KEY = "bdo-training-planner:lang";

  const DEFAULTS = {
    level: 61,
    currentExp: "0",
    expUnit: "exp",
    boost: "1805",
    hoursPerDay: "10",
    refExp: "4126858",
    refBoost: "1805",
    tickMinutes: "3",
  };

  // ชื่อ query param สั้นๆ สำหรับลิงก์แชร์
  const URL_KEYS = {
    level: "lv",
    currentExp: "exp",
    expUnit: "unit",
    boost: "boost",
    hoursPerDay: "h",
    refExp: "rexp",
    refBoost: "rboost",
    tickMinutes: "tick",
  };

  // ---------- i18n ----------
  const I18N = {
    th: {
      locale: "th-TH",
      subtitle: "คำนวณเวลาเก็บเลเวลด้วย Black Spirit's Training (หุ่นฟาง) จนถึงเลเวล {max}",
      inputTitle: "ข้อมูลตัวละคร",
      reset: "รีเซ็ตค่า",
      share: "แชร์",
      level: "เลเวลปัจจุบัน",
      currentExp: "EXP ปัจจุบันในเลเวลนี้",
      boost: "EXP Boost (ต่อสู้) %",
      hoursPerDay: "ชั่วโมงที่เทรนต่อวัน",
      howToFind: "ดูวิธีหาค่านี้ในเกม",
      close: "ปิด",
      tickEvery: "1 tick ทุก {n} นาที",
      advanced: "ตั้งค่าอ้างอิง (ขั้นสูง)",
      refExp: "EXP ต่อ tick อ้างอิง",
      refBoost: "ที่ Boost อ้างอิง (%)",
      tickMinutes: "นาทีต่อ 1 tick",
      formula: "สูตร: EXP ต่อ tick = (EXP อ้างอิง ÷ (100 + Boost อ้างอิง)) × (100 + Boost ของคุณ) — Boost +1805% หมายถึงได้ EXP เป็น 19.05 เท่าของค่าพื้นฐาน",
      expHintPct: "≈ {a} / {b} EXP",
      expHintExp: "จาก {b} EXP ({p}%)",
      tickHint: "≈ {a} EXP ต่อ tick",
      expRemaining: "EXP ที่ยังขาดถึง Lv {max}",
      ticks: "{n} ticks",
      perHour: "{n} EXP / ชม.",
      continuous: "เปิดต่อเนื่อง 24 ชม.",
      limited: "เปิดวันละ {h} ชม.",
      finishOn: "เสร็จประมาณ",
      total: "รวม",
      totalValue: "{d} วัน · {h} ชม.",
      andRest: "และอีก {v}",
      tableTitle: "สรุปรายเลเวล",
      thLevel: "เลเวล",
      thDelta: "EXP ที่ต้องเก็บ",
      thTime24: "เวลา (24 ชม.)",
      thLimited: "เวลาจริง (วันละ {h} ชม.)",
      thCumulative: "สะสม (วันละ {h} ชม.)",
      fromReq: "จาก {n}",
      totalRow: "รวม {a} › {b}",
      daysCount: "{n} วัน",
      refTitle: "ตาราง EXP ที่ใช้ในการคำนวณ",
      refNote: "ค่า EXP ของเลเวล N = EXP ที่ต้องใช้เพื่อขึ้นจากเลเวล N ไปเป็นเลเวล N+1",
      madeBy: "สร้างโดย",
      storageNote: "ข้อมูลทั้งหมดเก็บไว้ในเบราว์เซอร์ของคุณ (localStorage) เท่านั้น",
      copied: "คัดลอกลิงก์แล้ว",
      copyPrompt: "คัดลอกลิงก์นี้",
      errLevel: "เลเวลไม่ถูกต้อง",
      errBoost: "กรุณากรอก EXP Boost เป็นตัวเลขตั้งแต่ 0 ขึ้นไป",
      errHours: "ชั่วโมงต่อวันต้องอยู่ระหว่าง 0–24",
      errRefExp: "EXP ต่อ tick อ้างอิงต้องมากกว่า 0",
      errRefBoost: "Boost อ้างอิงไม่ถูกต้อง",
      errTick: "นาทีต่อ tick ต้องมากกว่า 0",
      errExp: "EXP ปัจจุบันต้องเป็นตัวเลขตั้งแต่ 0 ขึ้นไป",
      errPct: "EXP % ต้องน้อยกว่า 100",
      errExpMax: "EXP ปัจจุบันต้องน้อยกว่า {n}",
      helpExpTitle: "หาเลเวลและ EXP ปัจจุบัน",
      helpExpSteps: [
        "กดปุ่ม <kbd>P</kbd> เพื่อเปิดหน้าต่าง <b>ข้อมูลส่วนตัว</b>",
        "อยู่ที่แท็บแรก (รูปคน) จะเห็นเลเวลและหลอด EXP",
        "ตัวเลข<b>ด้านซ้ายของ /</b> คือ EXP ปัจจุบัน — หรือจะใช้ค่า % ข้างเลเวลแล้วสลับหน่วยเป็น <b>%</b> ก็ได้",
      ],
      helpBoostTitle: "หาค่า EXP Boost",
      helpBoostSteps: [
        "กดปุ่ม <kbd>P</kbd> เพื่อเปิดหน้าต่าง <b>ข้อมูลส่วนตัว</b>",
        "ไปที่แท็บสุดท้าย (ลูกศรขึ้น) <b>เพิ่มค่าประสบการณ์ทั่วไป</b>",
        "ใช้ค่าในแถว <b>ต่อสู้</b>",
      ],
      units: {
        y: () => "ปี", mo: () => "เดือน", d: () => "วัน", h: () => "ชม.", mi: () => "นาที",
      },
      short: { y: " ปี", mo: " เดือน", d: " วัน", h: " ชม.", mi: " นาที" },
    },
    en: {
      locale: "en-GB",
      subtitle: "Plan how long Black Spirit's Training (AFK scarecrow) takes to reach level {max}",
      inputTitle: "Character",
      reset: "Reset",
      share: "Share",
      level: "Current level",
      currentExp: "Current EXP in this level",
      boost: "EXP Boost (Combat) %",
      hoursPerDay: "Training hours per day",
      howToFind: "How to find this in game",
      close: "Close",
      tickEvery: "1 tick every {n} min",
      advanced: "Reference values (advanced)",
      refExp: "Reference EXP per tick",
      refBoost: "At reference boost (%)",
      tickMinutes: "Minutes per tick",
      formula: "Formula: EXP per tick = (reference EXP ÷ (100 + reference boost)) × (100 + your boost) — a +1805% boost means 19.05× the base EXP",
      expHintPct: "≈ {a} / {b} EXP",
      expHintExp: "of {b} EXP ({p}%)",
      tickHint: "≈ {a} EXP per tick",
      expRemaining: "EXP left to Lv {max}",
      ticks: "{n} ticks",
      perHour: "{n} EXP / hr",
      continuous: "Online 24 hrs a day",
      limited: "{h} hrs a day",
      finishOn: "Done around",
      total: "Total",
      totalValue: "{d} days · {h} hrs",
      andRest: "and {v}",
      tableTitle: "Per-level breakdown",
      thLevel: "Level",
      thDelta: "EXP needed",
      thTime24: "Time (24 hrs)",
      thLimited: "Actual ({h} hrs/day)",
      thCumulative: "Cumulative ({h} hrs/day)",
      fromReq: "of {n}",
      totalRow: "Total {a} › {b}",
      daysCount: "{n} days",
      refTitle: "EXP table used",
      refNote: "EXP for level N = EXP required to go from level N to N+1",
      madeBy: "Made by",
      storageNote: "All data stays in your browser (localStorage)",
      copied: "Link copied",
      copyPrompt: "Copy this link",
      errLevel: "Invalid level",
      errBoost: "EXP Boost must be a number ≥ 0",
      errHours: "Hours per day must be between 0 and 24",
      errRefExp: "Reference EXP per tick must be greater than 0",
      errRefBoost: "Invalid reference boost",
      errTick: "Minutes per tick must be greater than 0",
      errExp: "Current EXP must be a number ≥ 0",
      errPct: "EXP % must be less than 100",
      errExpMax: "Current EXP must be less than {n}",
      helpExpTitle: "Finding your level and EXP",
      helpExpSteps: [
        "Press <kbd>P</kbd> to open the <b>Profile</b> window",
        "Stay on the first tab (character icon) — your level and EXP bar are shown",
        "The number <b>left of the /</b> is your current EXP — or use the % next to your level and switch the unit to <b>%</b>",
      ],
      helpBoostTitle: "Finding your EXP Boost",
      helpBoostSteps: [
        "Press <kbd>P</kbd> to open the <b>Profile</b> window",
        "Open the last tab (double arrow) — <b>General EXP bonus</b>",
        "Use the value in the <b>Combat</b> row",
      ],
      units: {
        y: (n) => (n === 1 ? "year" : "years"),
        mo: (n) => (n === 1 ? "month" : "months"),
        d: (n) => (n === 1 ? "day" : "days"),
        h: (n) => (n === 1 ? "hr" : "hrs"),
        mi: () => "min",
      },
      short: { y: "y", mo: "mo", d: "d", h: "h", mi: "m" },
    },
  };

  let lang = loadLang();

  function t(key, params) {
    let s = I18N[lang][key];
    if (s == null) s = I18N.th[key];
    if (typeof s !== "string") return s;
    if (params) s = s.replace(/\{(\w+)\}/g, (_, k) => (params[k] != null ? params[k] : ""));
    return s;
  }

  // เลือกได้เฉพาะเลเวลที่มีข้อมูล EXP ต่อเนื่องไปจนถึง MAX_LEVEL
  const SELECTABLE_LEVELS = (() => {
    const levels = [];
    for (let lv = MAX_LEVEL - 1; lv >= 1; lv--) {
      if (EXP_TABLE[lv] == null) break;
      levels.unshift(lv);
    }
    return levels;
  })();

  const $ = (id) => document.getElementById(id);
  const el = {
    level: $("level"),
    currentExp: $("currentExp"),
    boost: $("boost"),
    hoursPerDay: $("hoursPerDay"),
    refExp: $("refExp"),
    refBoost: $("refBoost"),
    tickMinutes: $("tickMinutes"),
    unitBtns: document.querySelectorAll("[data-unit]"),
    langBtns: document.querySelectorAll("[data-lang]"),
    subtitle: $("subtitle"),
    expHint: $("expHint"),
    tickHint: $("tickHint"),
    tickEveryHint: $("tickEveryHint"),
    error: $("error"),
    summary: $("summary"),
    expRemainingLabel: $("expRemainingLabel"),
    totalDelta: $("totalDelta"),
    totalTicks: $("totalTicks"),
    perHour: $("perHour"),
    limitedLabel: $("limitedLabel"),
    dur24Main: $("dur24Main"),
    dur24Rest: $("dur24Rest"),
    dur24Finish: $("dur24Finish"),
    dur24Total: $("dur24Total"),
    durLimMain: $("durLimMain"),
    durLimRest: $("durLimRest"),
    durLimFinish: $("durLimFinish"),
    durLimTotal: $("durLimTotal"),
    thLimited: $("thLimited"),
    thCumulative: $("thCumulative"),
    tbody: $("tbody"),
    tfoot: $("tfoot"),
    refBody: $("refBody"),
    resetBtn: $("resetBtn"),
    shareBtn: $("shareBtn"),
    toast: $("toast"),
    helpDialog: $("helpDialog"),
    helpTitle: $("helpTitle"),
    helpSteps: $("helpSteps"),
    helpImg: $("helpImg"),
    helpClose: $("helpClose"),
  };

  let state = loadState();
  const sharedState = readUrlState();
  if (sharedState) {
    state = { ...state, ...sharedState };
    saveState();
    // ล้าง query ออกจาก URL เพื่อให้การแก้ไขต่อจากนี้ไม่ถูกทับเมื่อรีเฟรช
    history.replaceState(null, "", location.pathname + location.hash);
  }

  // ---------- storage ----------
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
    } catch (_) { /* ignore */ }
    return { ...DEFAULTS };
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) { /* ignore */ }
  }

  function loadLang() {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved && I18N[saved]) return saved;
    } catch (_) { /* ignore */ }
    return "th";
  }

  function saveLang() {
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch (_) { /* ignore */ }
  }

  // ---------- share ----------
  function readUrlState() {
    const params = new URLSearchParams(location.search);
    const out = {};
    for (const [key, param] of Object.entries(URL_KEYS)) {
      if (params.has(param)) out[key] = params.get(param);
    }
    if (!Object.keys(out).length) return null;
    if ("level" in out) out.level = Number(out.level);
    if ("expUnit" in out && out.expUnit !== "pct") out.expUnit = "exp";
    return out;
  }

  function buildShareUrl() {
    const params = new URLSearchParams();
    for (const [key, param] of Object.entries(URL_KEYS)) {
      const v = String(state[key] ?? "").replace(/[,\s]/g, "");
      // ค่าอ้างอิงขั้นสูงใส่เฉพาะเมื่อไม่ใช่ค่าเริ่มต้น เพื่อให้ลิงก์สั้น
      if (key.startsWith("ref") || key === "tickMinutes") {
        if (v === DEFAULTS[key]) continue;
      }
      if (v !== "") params.set(param, v);
    }
    return `${location.origin}${location.pathname}?${params}`;
  }

  async function share() {
    const url = buildShareUrl();
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch && navigator.share) {
      try {
        await navigator.share({ title: document.title, url });
        return;
      } catch (e) {
        if (e && e.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      showToast(t("copied"));
    } catch (_) {
      window.prompt(t("copyPrompt"), url);
    }
  }

  let toastTimer;
  function showToast(msg) {
    el.toast.textContent = msg;
    el.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.toast.classList.remove("show"), 2000);
  }

  // ---------- help ----------
  const HELP = {
    exp: { title: "helpExpTitle", steps: "helpExpSteps", img: "assets/help-exp.png" },
    boost: { title: "helpBoostTitle", steps: "helpBoostSteps", img: "assets/help-boost.png" },
  };

  function openHelp(kind) {
    const h = HELP[kind];
    el.helpTitle.textContent = t(h.title);
    el.helpSteps.innerHTML = t(h.steps).map((s) => `<li>${s}</li>`).join("");
    el.helpImg.src = h.img;
    el.helpImg.alt = t(h.title);
    el.helpDialog.showModal();
  }

  // ---------- formatting ----------
  let nf, nf2, df;
  function setupFormatters() {
    nf = new Intl.NumberFormat("en-US");
    nf2 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
    df = new Intl.DateTimeFormat(t("locale"), { day: "numeric", month: "short", year: "numeric" });
  }

  function parseNum(str) {
    if (str == null) return NaN;
    const s = String(str).replace(/[,\s]/g, "");
    if (s === "") return NaN;
    return Number(s);
  }

  // นับจำนวนปี/เดือน/วันตามปฏิทินจริงระหว่างสองวันที่ (แบบเดียวกับการนับอายุ)
  function calendarDiff(start, end) {
    let y = end.getFullYear() - start.getFullYear();
    let mo = end.getMonth() - start.getMonth();
    let d = end.getDate() - start.getDate();
    if (d < 0) {
      mo--;
      d += new Date(end.getFullYear(), end.getMonth(), 0).getDate();
    }
    if (mo < 0) {
      y--;
      mo += 12;
    }
    return { y, mo, d };
  }

  function today() {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  }

  function addDays(date, n) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);
  }

  // แตกเวลาเป็น ปี/เดือน/วัน (ตามปฏิทินจริง เริ่มจากวันนี้ + startDayOffset) + ชม./นาที ที่เหลือ
  function breakdown(totalMin, hoursPerDay, startDayOffset = 0) {
    const minPerDay = hoursPerDay * 60;
    const m = Math.round(totalMin);
    const days = Math.floor(m / minPerDay);
    const rest = m - days * minPerDay;
    const start = addDays(today(), startDayOffset);
    const { y, mo, d } = calendarDiff(start, addDays(start, days));
    return { y, mo, d, h: Math.floor(rest / 60), mi: Math.round(rest % 60), days };
  }

  // แบบย่อสำหรับตาราง เช่น "1 ปี 2 เดือน 3 วัน 4 ชม. 5 นาที" / "1y 2mo 3d 4h 5m"
  function fmtShort(b) {
    const u = t("short");
    const parts = ["y", "mo", "d", "h", "mi"]
      .filter((k) => b[k] > 0)
      .map((k) => `${nf.format(b[k])}${u[k]}`);
    return parts.length ? parts.join(" ") : `0${u.mi}`;
  }

  function fmtDuration(totalMin, hoursPerDay, startDayOffset = 0) {
    return fmtShort(breakdown(totalMin, hoursPerDay, startDayOffset));
  }

  function fmtHM(totalMin) {
    return fmtShort({ y: 0, mo: 0, d: 0, h: Math.floor(totalMin / 60), mi: Math.round(totalMin % 60) });
  }

  // ตัวเลขใหญ่ + หน่วยเล็ก สำหรับการ์ดสรุป
  function unitHtml(keys, b) {
    const units = t("units");
    return keys
      .filter((k) => b[k] > 0)
      .map((k) => `<span class="u"><b>${nf.format(b[k])}</b>${units[k](b[k])}</span>`)
      .join("");
  }

  function renderDuration(mainEl, restEl, totalMin, hoursPerDay) {
    const b = breakdown(totalMin, hoursPerDay);
    if (b.days > 0) {
      mainEl.innerHTML = unitHtml(["y", "mo", "d"], b);
      const rest = b.h > 0 || b.mi > 0 ? fmtShort({ y: 0, mo: 0, d: 0, h: b.h, mi: b.mi }) : "";
      restEl.textContent = rest ? t("andRest", { v: rest }) : "";
    } else {
      mainEl.innerHTML = unitHtml(["h", "mi"], b) || `<span class="u"><b>0</b>${t("units").mi(0)}</span>`;
      restEl.textContent = "";
    }
  }

  // ---------- calculation ----------
  function compute() {
    const level = Number(state.level);
    const boost = parseNum(state.boost);
    const hoursPerDay = parseNum(state.hoursPerDay);
    const refExp = parseNum(state.refExp);
    const refBoost = parseNum(state.refBoost);
    const tickMinutes = parseNum(state.tickMinutes);
    const expInput = state.currentExp === "" ? 0 : parseNum(state.currentExp);

    const errors = [];
    let expError = false;
    if (!SELECTABLE_LEVELS.includes(level)) errors.push(t("errLevel"));
    if (!(boost >= 0)) errors.push(t("errBoost"));
    if (!(hoursPerDay > 0 && hoursPerDay <= 24)) errors.push(t("errHours"));
    if (!(refExp > 0)) errors.push(t("errRefExp"));
    if (!(refBoost > -100)) errors.push(t("errRefBoost"));
    if (!(tickMinutes > 0)) errors.push(t("errTick"));

    const firstReq = EXP_TABLE[level] || 0;
    let currentExp = 0;
    if (!(expInput >= 0)) {
      errors.push(t("errExp"));
      expError = true;
    } else if (state.expUnit === "pct") {
      if (expInput >= 100) {
        errors.push(t("errPct"));
        expError = true;
      }
      currentExp = Math.floor((firstReq * expInput) / 100);
    } else {
      if (expInput >= firstReq) {
        errors.push(t("errExpMax", { n: nf.format(firstReq) }));
        expError = true;
      }
      currentExp = Math.floor(expInput);
    }

    if (errors.length) return { errors, expError, level, firstReq, currentExp };

    const expPerTick = (refExp / (100 + refBoost)) * (100 + boost);

    const rows = [];
    let cumDelta = 0;
    let prevCumTicks = 0;
    for (let lv = level; lv < MAX_LEVEL; lv++) {
      const req = EXP_TABLE[lv];
      const delta = lv === level ? req - currentExp : req;
      cumDelta += delta;
      // นับ tick แบบสะสม เพื่อให้ EXP ส่วนเกินยกไปเลเวลถัดไปและผลรวมตรงกับยอดรวม
      const cumTicks = Math.ceil(cumDelta / expPerTick);
      const ticks = cumTicks - prevCumTicks;
      prevCumTicks = cumTicks;
      rows.push({
        from: lv,
        to: lv + 1,
        req,
        delta,
        ticks,
        minutes: ticks * tickMinutes,
        cumMinutes: cumTicks * tickMinutes,
      });
    }

    return {
      errors,
      level,
      firstReq,
      currentExp,
      expPerTick,
      hoursPerDay,
      tickMinutes,
      rows,
      totalDelta: cumDelta,
      totalTicks: prevCumTicks,
      totalMinutes: prevCumTicks * tickMinutes,
    };
  }

  // วันที่คาดว่าจะเสร็จ ถ้าเทรนวันละ hoursPerDay ชม. เริ่มตอนนี้
  function finishDate(totalMin, hoursPerDay) {
    const minPerDay = hoursPerDay * 60;
    const fullDays = Math.floor(totalMin / minPerDay);
    const rest = totalMin - fullDays * minPerDay;
    return new Date(Date.now() + (fullDays * 1440 + rest) * 60000);
  }

  // ---------- render ----------
  function applyStaticText() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach((n) => {
      n.textContent = t(n.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-aria]").forEach((n) => {
      n.setAttribute("aria-label", t(n.dataset.i18nAria));
      n.title = t(n.dataset.i18nAria);
    });
    el.subtitle.textContent = t("subtitle", { max: MAX_LEVEL });
    el.expRemainingLabel.textContent = t("expRemaining", { max: MAX_LEVEL });
    el.langBtns.forEach((b) => {
      const active = b.dataset.lang === lang;
      b.classList.toggle("active", active);
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", active);
    });
  }

  function render() {
    const r = compute();
    const hpd = parseNum(state.hoursPerDay);
    const hpdLabel = hpd > 0 ? nf2.format(hpd) : "–";
    const tickMin = parseNum(state.tickMinutes);

    el.limitedLabel.textContent = t("limited", { h: hpdLabel });
    el.thLimited.textContent = t("thLimited", { h: hpdLabel });
    el.thCumulative.textContent = t("thCumulative", { h: hpdLabel });
    el.tickEveryHint.textContent = t("tickEvery", { n: tickMin > 0 ? nf2.format(tickMin) : "–" });

    if (r.firstReq) {
      el.expHint.textContent = state.expUnit === "pct"
        ? t("expHintPct", { a: nf.format(r.currentExp), b: nf.format(r.firstReq) })
        : t("expHintExp", { b: nf.format(r.firstReq), p: nf2.format((r.currentExp / r.firstReq) * 100) });
    } else {
      el.expHint.textContent = "";
    }

    el.currentExp.setAttribute("aria-invalid", String(!!r.expError));

    if (r.errors.length) {
      el.error.hidden = false;
      el.error.textContent = r.errors.join(" · ");
      el.summary.classList.add("is-empty");
      el.tickHint.textContent = "";
      el.totalDelta.textContent = "–";
      el.totalTicks.textContent = el.perHour.textContent = "";
      [el.dur24Main, el.durLimMain, el.dur24Finish, el.durLimFinish, el.dur24Total, el.durLimTotal]
        .forEach((n) => { n.textContent = "–"; });
      el.dur24Rest.textContent = el.durLimRest.textContent = "";
      el.tbody.innerHTML = "";
      el.tfoot.innerHTML = "";
      return;
    }
    el.error.hidden = true;
    el.summary.classList.remove("is-empty");

    const perHour = Math.round((r.expPerTick * 60) / r.tickMinutes);
    el.tickHint.textContent = t("tickHint", { a: nf.format(Math.round(r.expPerTick)) });

    el.totalDelta.textContent = nf.format(r.totalDelta);
    el.totalTicks.textContent = t("ticks", { n: nf.format(r.totalTicks) });
    el.perHour.textContent = t("perHour", { n: nf.format(perHour) });

    const totalHours = nf.format(Math.floor(r.totalMinutes / 60));
    const days24 = Math.floor(r.totalMinutes / 1440);
    const daysLimited = Math.floor(r.totalMinutes / (r.hoursPerDay * 60));

    renderDuration(el.dur24Main, el.dur24Rest, r.totalMinutes, 24);
    el.dur24Finish.textContent = df.format(new Date(Date.now() + r.totalMinutes * 60000));
    el.dur24Total.textContent = t("totalValue", { d: nf.format(days24), h: totalHours });

    renderDuration(el.durLimMain, el.durLimRest, r.totalMinutes, r.hoursPerDay);
    el.durLimFinish.textContent = df.format(finishDate(r.totalMinutes, r.hoursPerDay));
    el.durLimTotal.textContent = t("totalValue", { d: nf.format(daysLimited), h: totalHours });

    const minPerDay = r.hoursPerDay * 60;
    el.tbody.innerHTML = r.rows
      .map((row) => {
        // เริ่มนับปฏิทินของแต่ละเลเวลจากวันที่เลเวลก่อนหน้าจบ
        const prevMin = row.cumMinutes - row.minutes;
        return `
        <tr>
          <td class="lv">${row.from}<span class="arrow">›</span>${row.to}</td>
          <td class="num">${nf.format(row.delta)}${row.delta !== row.req ? `<span class="sub-cell">${t("fromReq", { n: nf.format(row.req) })}</span>` : ""}</td>
          <td class="num">${fmtDuration(row.minutes, 24, Math.floor(prevMin / 1440))}<span class="sub-cell">${row.minutes >= 1440 ? `${fmtHM(row.minutes)} · ` : ""}${t("ticks", { n: nf.format(row.ticks) })}</span></td>
          <td class="num">${fmtDuration(row.minutes, r.hoursPerDay, Math.floor(prevMin / minPerDay))}</td>
          <td class="num">${fmtDuration(row.cumMinutes, r.hoursPerDay)}</td>
        </tr>`;
      })
      .join("");

    el.tfoot.innerHTML = `
      <tr>
        <td>${t("totalRow", { a: r.level, b: MAX_LEVEL })}</td>
        <td class="num">${nf.format(r.totalDelta)}</td>
        <td class="num">${fmtDuration(r.totalMinutes, 24)}<span class="sub-cell">${fmtHM(r.totalMinutes)}</span></td>
        <td class="num">${fmtDuration(r.totalMinutes, r.hoursPerDay)}<span class="sub-cell">${t("daysCount", { n: nf.format(daysLimited) })}</span></td>
        <td class="num"></td>
      </tr>`;
  }

  function renderRefTable() {
    el.refBody.innerHTML = Object.keys(EXP_TABLE)
      .map(Number)
      .sort((a, b) => b - a)
      .map((lv) => `<tr><td>${lv}</td><td class="num">${nf.format(EXP_TABLE[lv])}</td></tr>`)
      .join("");
  }

  // ---------- inputs ----------
  function syncInputs() {
    el.level.value = String(state.level);
    el.currentExp.value = state.currentExp;
    el.boost.value = state.boost;
    el.hoursPerDay.value = state.hoursPerDay;
    el.refExp.value = state.refExp;
    el.refBoost.value = state.refBoost;
    el.tickMinutes.value = state.tickMinutes;
    el.unitBtns.forEach((b) => {
      const active = b.dataset.unit === state.expUnit;
      b.classList.toggle("active", active);
      b.setAttribute("aria-checked", active);
      b.setAttribute("role", "radio");
    });
    el.currentExp.placeholder = state.expUnit === "pct" ? "0.00" : "0";
  }

  function setLang(next) {
    lang = next;
    saveLang();
    setupFormatters();
    applyStaticText();
    render();
  }

  function init() {
    setupFormatters();
    el.level.innerHTML = SELECTABLE_LEVELS
      .map((lv) => `<option value="${lv}">Lv ${lv}</option>`)
      .join("");
    if (!SELECTABLE_LEVELS.includes(Number(state.level))) state.level = DEFAULTS.level;

    applyStaticText();
    renderRefTable();
    syncInputs();
    render();

    el.level.addEventListener("change", () => {
      state.level = Number(el.level.value);
      saveState();
      render();
    });

    ["currentExp", "boost", "hoursPerDay", "refExp", "refBoost", "tickMinutes"].forEach((key) => {
      el[key].addEventListener("input", () => {
        state[key] = el[key].value;
        saveState();
        render();
      });
    });

    el.unitBtns.forEach((b) =>
      b.addEventListener("click", () => {
        const unit = b.dataset.unit;
        if (unit === state.expUnit) return;
        // แปลงค่าเดิมให้อยู่ในหน่วยใหม่
        const req = EXP_TABLE[Number(state.level)];
        const v = parseNum(state.currentExp);
        if (v >= 0 && req) {
          state.currentExp = unit === "pct"
            ? String(Math.floor(((v / req) * 100) * 10000) / 10000)
            : String(Math.floor((req * v) / 100));
        }
        state.expUnit = unit;
        saveState();
        syncInputs();
        render();
      })
    );

    el.langBtns.forEach((b) =>
      b.addEventListener("click", () => {
        if (b.dataset.lang !== lang) setLang(b.dataset.lang);
      })
    );

    document.querySelectorAll("[data-help]").forEach((b) =>
      b.addEventListener("click", () => openHelp(b.dataset.help))
    );
    el.helpClose.addEventListener("click", () => el.helpDialog.close());
    // คลิกพื้นหลังนอกกล่องเพื่อปิด
    el.helpDialog.addEventListener("click", (e) => {
      if (e.target === el.helpDialog) el.helpDialog.close();
    });

    el.shareBtn.addEventListener("click", share);

    el.resetBtn.addEventListener("click", () => {
      state = { ...DEFAULTS };
      saveState();
      syncInputs();
      render();
    });
  }

  init();
})();
