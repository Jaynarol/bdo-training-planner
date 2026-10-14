(() => {
  "use strict";

  // EXP required ตามตารางในเกม: แถว N = EXP เต็มหลอดเพื่อขึ้นจากเลเวล N ไป N+1
  // (ไม่ใช่ค่าสะสม — หลอดรีเซ็ตเป็น 0 ทุกครั้งที่เลเวลอัป)
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

  // Base EXP ต่อ tick ที่ Boost 0% (วัดจากเกม: 6,228,198 ÷ 28.75)
  const BASE_EXP = "216632.965879";
  // บัฟแฝงที่ไม่แสดงในหน้าต่างสถานะ — มีอยู่ 100% เสมอ (ในเกมเห็น 2675% แต่ได้จริงเท่า 2775%)
  const HIDDEN_BUFF = 100;

  const DEFAULTS = {
    level: 61,
    currentExp: "0",
    expUnit: "pct",
    boost: "2675",
    tickExp: "",
    tickSource: "boost", // "boost" = คำนวณ EXP ต่อ tick จาก Boost, "tick" = ใช้ EXP ต่อ tick ที่กรอกโดยตรง
    hoursPerDay: "10",
    baseExp: BASE_EXP,
    tickMinutes: "3",
    silverPerHour: "1000000",
  };

  // ชื่อ query param สั้นๆ สำหรับลิงก์แชร์
  const URL_KEYS = {
    level: "lv",
    currentExp: "exp",
    expUnit: "unit",
    boost: "boost",
    tickExp: "tpt",
    hoursPerDay: "h",
    baseExp: "base",
    tickMinutes: "tick",
    silverPerHour: "silver",
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
      tickExp: "EXP ที่ได้ต่อ tick",
      hoursPerDay: "ชั่วโมงที่เทรนต่อวัน",
      howToFind: "ดูวิธีหาค่านี้ในเกม",
      close: "ปิด",
      tickEvery: "1 tick ทุก {n} นาที",
      boostHint: "≈ {n} EXP ต่อ tick",
      tickHint: "≈ Boost (ต่อสู้) {n}%",
      advanced: "ตั้งค่าขั้นสูง",
      baseExp: "Base EXP ต่อ tick (Boost 0%)",
      tickMinutes: "นาทีต่อ 1 tick",
      silverPerHour: "Silver ที่ใช้ต่อชั่วโมง",
      silverCost: "Silver ที่ต้องใช้ (ชม. ละ {r})",
      thRate: "ได้ต่อชม.",
      perTickShort: "{n} / tick",
      errSilver: "Silver ต่อชั่วโมงต้องเป็นตัวเลขตั้งแต่ 0 ขึ้นไป",
      formula: "สูตร: EXP ต่อ tick = round(Base × (1 + (Boost + 100) ÷ 100)) — รวมบัฟแฝง 100% ที่ไม่แสดงในเกมให้แล้ว · แก้ Base ได้เผื่อย้ายที่เก็บเลเวล",
      expHintPct: "≈ {a} / {b} EXP",
      expHintExp: "จาก {b} EXP ({p}%)",
      levelCard: "ความคืบหน้า Lv {a} › {b}",
      pctPerTick: "ต่อ tick",
      pctPerHour: "ต่อชั่วโมง",
      nextLevel: "ถึง Lv {n} (วันละ {h} ชม.)",
      nextFoot: "เปิด 24 ชม.: {v}",
      expRemaining: "EXP ที่ยังขาดถึง Lv {max}",
      ticks: "{n} ticks",
      perHour: "{n} EXP / ชม.",
      continuous: "เปิดต่อเนื่อง 24 ชม.",
      limited: "เปิดวันละ {h} ชม.",
      finishOn: "เสร็จประมาณ",
      inDays: "คิดเป็นวัน",
      totalHours: "ชั่วโมงรวม",
      andRest: "และอีก {v}",
      tableTitle: "สรุปรายเลเวล",
      thLevel: "เลเวล",
      thDelta: "EXP ที่ต้องเก็บ",
      thTime24: "เวลา (24 ชม.)",
      thLimited: "เวลาจริง (วันละ {h} ชม.)",
      thCumulative: "สะสม (วันละ {h} ชม.)",
      thStep: "ช่วง",
      fromReq: "จาก {n}",
      totalRow: "รวม {a} › {b}",
      daysCount: "{n} วัน",
      refTitle: "ตาราง EXP ที่ใช้ในการคำนวณ",
      refNote: "ค่า EXP ของเลเวล N = EXP เต็มหลอดที่ต้องใช้เพื่อขึ้นจากเลเวล N ไปเป็นเลเวล N+1 (หลอดรีเซ็ตเป็น 0 ทุกเลเวล)",
      you: "คุณ",
      madeBy: "สร้างโดย",
      storageNote: "ข้อมูลทั้งหมดเก็บไว้ในเบราว์เซอร์ของคุณ (localStorage) เท่านั้น",
      copied: "คัดลอกลิงก์แล้ว",
      copyPrompt: "คัดลอกลิงก์นี้",
      errLevel: "เลเวลไม่ถูกต้อง หรือไม่มีข้อมูล EXP ในโหมดตารางนี้",
      errBoost: "กรุณากรอก EXP Boost เป็นตัวเลข",
      errEffective: "Boost รวมต้องมากกว่า −100%",
      errTickExp: "EXP ต่อ tick ต้องมากกว่า 0",
      errHours: "ชั่วโมงต่อวันต้องอยู่ระหว่าง 0–24",
      errBase: "Base EXP ต้องมากกว่า 0",
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
        "กรอกค่าในแถว <b>ต่อสู้</b> ได้เลย (ระบบบวกบัฟแฝง 100% ที่ไม่แสดงในเกมให้เอง)",
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
      tickExp: "EXP gained per tick",
      hoursPerDay: "Training hours per day",
      howToFind: "How to find this in game",
      close: "Close",
      tickEvery: "1 tick every {n} min",
      boostHint: "≈ {n} EXP per tick",
      tickHint: "≈ Combat boost {n}%",
      advanced: "Advanced settings",
      baseExp: "Base EXP per tick (0% boost)",
      tickMinutes: "Minutes per tick",
      silverPerHour: "Silver cost per hour",
      silverCost: "Silver needed ({r} / hr)",
      thRate: "Per hour",
      perTickShort: "{n} / tick",
      errSilver: "Silver per hour must be a number ≥ 0",
      formula: "Formula: EXP per tick = round(Base × (1 + (Boost + 100) ÷ 100)) — includes the hidden 100% buff not shown in game · change Base if you train somewhere else",
      expHintPct: "≈ {a} / {b} EXP",
      expHintExp: "of {b} EXP ({p}%)",
      levelCard: "Progress Lv {a} › {b}",
      pctPerTick: "Per tick",
      pctPerHour: "Per hour",
      nextLevel: "To Lv {n} ({h} hrs/day)",
      nextFoot: "24 hrs a day: {v}",
      expRemaining: "EXP left to Lv {max}",
      ticks: "{n} ticks",
      perHour: "{n} EXP / hr",
      continuous: "Online 24 hrs a day",
      limited: "{h} hrs a day",
      finishOn: "Done around",
      inDays: "In days",
      totalHours: "Total hours",
      andRest: "and {v}",
      tableTitle: "Per-level breakdown",
      thLevel: "Level",
      thDelta: "EXP needed",
      thTime24: "Time (24 hrs)",
      thLimited: "Actual ({h} hrs/day)",
      thCumulative: "Cumulative ({h} hrs/day)",
      thStep: "Step",
      fromReq: "of {n}",
      totalRow: "Total {a} › {b}",
      daysCount: "{n} days",
      refTitle: "EXP table used",
      refNote: "EXP for level N = the full bar needed to go from level N to N+1 (the bar resets to 0 every level)",
      you: "You",
      madeBy: "Made by",
      storageNote: "All data stays in your browser (localStorage)",
      copied: "Link copied",
      copyPrompt: "Copy this link",
      errLevel: "Invalid level, or no EXP data for it in this table mode",
      errBoost: "EXP Boost must be a number",
      errEffective: "Total boost must be greater than −100%",
      errTickExp: "EXP per tick must be greater than 0",
      errHours: "Hours per day must be between 0 and 24",
      errBase: "Base EXP must be greater than 0",
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
        "Enter the value in the <b>Combat</b> row as-is (the hidden 100% buff not shown in game is added for you)",
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

  const $ = (id) => document.getElementById(id);
  const el = {
    level: $("level"),
    currentExp: $("currentExp"),
    boost: $("boost"),
    boostLabel: $("boostLabel"),
    sourceBtns: document.querySelectorAll("[data-source]"),
    tickExp: $("tickExp"),
    hoursPerDay: $("hoursPerDay"),
    baseExp: $("baseExp"),
    tickMinutes: $("tickMinutes"),
    silverPerHour: $("silverPerHour"),
    silverLabel: $("silverLabel"),
    silverValue: $("silverValue"),
    silverFoot: $("silverFoot"),
    unitBtns: document.querySelectorAll("[data-unit]"),
    langBtns: document.querySelectorAll("[data-lang]"),
    subtitle: $("subtitle"),
    expHint: $("expHint"),
    boostHint: $("boostHint"),
    tickEveryHint: $("tickEveryHint"),
    error: $("error"),
    summary: $("summary"),
    levelCardLabel: $("levelCardLabel"),
    levelPct: $("levelPct"),
    progress: $("progress"),
    progressFill: $("progressFill"),
    pctPerTick: $("pctPerTick"),
    pctPerHour: $("pctPerHour"),
    nextLevelLabel: $("nextLevelLabel"),
    nextLevelTime: $("nextLevelTime"),
    nextLevelFoot: $("nextLevelFoot"),
    expRemainingLabel: $("expRemainingLabel"),
    totalDelta: $("totalDelta"),
    totalTicks: $("totalTicks"),
    perHour: $("perHour"),
    limitedLabel: $("limitedLabel"),
    dur24Main: $("dur24Main"),
    dur24Rest: $("dur24Rest"),
    dur24Finish: $("dur24Finish"),
    dur24Days: $("dur24Days"),
    dur24Hours: $("dur24Hours"),
    durLimMain: $("durLimMain"),
    durLimRest: $("durLimRest"),
    durLimFinish: $("durLimFinish"),
    durLimDays: $("durLimDays"),
    durLimHours: $("durLimHours"),
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
    // ล้าง query ออกจาก URL เพื่อให้การแก้ไขต่อจากนี้ไม่ถูกทับเมื่อรีเฟรช
    history.replaceState(null, "", location.pathname + location.hash);
  }

  // ---------- storage ----------
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        const out = {};
        for (const k of Object.keys(DEFAULTS)) if (k in saved) out[k] = saved[k];
        return { ...DEFAULTS, ...out };
      }
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

  // ---------- EXP table ----------
  // EXP ที่ต้องใช้เพื่อเดินหลอดจากเลเวล lv ไป lv+1 (null = ไม่มีข้อมูล)
  function costOf(lv) {
    return EXP_TABLE[lv] ?? null;
  }

  // เลือกได้เฉพาะเลเวลที่มีข้อมูล EXP ต่อเนื่องไปจนถึง MAX_LEVEL
  function selectableLevels() {
    const levels = [];
    for (let lv = MAX_LEVEL - 1; lv >= 1; lv--) {
      if (costOf(lv) == null) break;
      levels.unshift(lv);
    }
    return levels;
  }

  // ---------- boost <-> EXP per tick ----------
  function round2(n) {
    return Math.round(n * 100) / 100;
  }

  function hiddenValue() {
    return HIDDEN_BUFF;
  }

  function tickFromBoost() {
    const base = parseNum(state.baseExp);
    const total = parseNum(state.boost) + hiddenValue();
    if (!(base > 0) || !Number.isFinite(total)) return NaN;
    return Math.round(base * (1 + total / 100));
  }

  function boostFromTick() {
    const base = parseNum(state.baseExp);
    const tick = parseNum(state.tickExp);
    const hidden = hiddenValue();
    if (!(base > 0) || !(tick > 0) || !Number.isFinite(hidden)) return NaN;
    return round2((tick / base - 1) * 100 - hidden);
  }

  // อัปเดตช่องฝั่งตรงข้ามตาม tickSource (ไม่แตะช่องที่ผู้ใช้กำลังพิมพ์)
  function syncDerived() {
    if (state.tickSource === "tick") {
      const b = boostFromTick();
      if (Number.isFinite(b)) {
        state.boost = String(b);
        if (document.activeElement !== el.boost) el.boost.value = state.boost;
      }
    } else {
      const tick = tickFromBoost();
      if (Number.isFinite(tick)) {
        state.tickExp = String(tick);
        if (document.activeElement !== el.tickExp) el.tickExp.value = nf.format(tick);
      }
    }
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
    if ("tickExp" in out) out.tickSource = "tick";
    else if ("boost" in out) out.tickSource = "boost";
    return out;
  }

  function buildShareUrl() {
    const params = new URLSearchParams();
    // ใส่เฉพาะค่าที่ไม่ใช่ค่าเริ่มต้น (ยกเว้นข้อมูลหลัก) เพื่อให้ลิงก์สั้น
    const always = ["level", "currentExp", "expUnit", "hoursPerDay"];
    for (const [key, param] of Object.entries(URL_KEYS)) {
      const v = String(state[key] ?? "").replace(/[,\s]/g, "");
      if (v === "") continue;
      if (key === "boost" && state.tickSource === "tick") continue;
      if (key === "tickExp" && state.tickSource !== "tick") continue;
      if (key === "boost" || key === "tickExp" || always.includes(key) || v !== DEFAULTS[key]) {
        params.set(param, v);
      }
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
  let nf, nf2, nf3, pf, df;
  function setupFormatters() {
    nf = new Intl.NumberFormat("en-US");
    nf2 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
    nf3 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 });
    pf = new Intl.NumberFormat("en-US", { maximumSignificantDigits: 3 });
    df = new Intl.DateTimeFormat(t("locale"), { day: "numeric", month: "short", year: "numeric" });
  }

  function fmtPct(n) {
    return n >= 100 ? nf2.format(n) : pf.format(n);
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
  // จำนวนวัน = เวลาเล่นรวม ÷ ชั่วโมงต่อวัน (เช่น 3,724 ชม. ÷ 10 = 372 วัน 4 ชม.)
  function breakdown(totalMin, hoursPerDay, startDayOffset = 0) {
    const minPerDay = hoursPerDay * 60;
    const m = Math.round(totalMin);
    const days = Math.floor(m / minPerDay);
    const rest = m - days * minPerDay;
    const start = addDays(today(), startDayOffset);
    const { y, mo, d } = calendarDiff(start, addDays(start, days));
    return { y, mo, d, h: Math.floor(rest / 60), mi: Math.round(rest % 60), days };
  }

  // แบบย่อ เช่น "1 ปี 2 เดือน 3 วัน 4 ชม. 5 นาที" / "1y 2mo 3d 4h 5m"
  function fmtShort(b) {
    const u = t("short");
    const parts = ["y", "mo", "d", "h", "mi"]
      .filter((k) => b[k] > 0)
      .map((k) => `${nf.format(b[k])}${u[k]}`);
    return parts.length ? parts.join(" ") : `0${u.mi}`;
  }

  // สำหรับตาราง: แสดงแค่ 3 หน่วยนับจากหน่วยใหญ่สุด หน่วยที่เล็กกว่านั้นปัดทิ้ง
  // เช่น "1 ปี 2 เดือน 3 วัน" หรือ "5 วัน 4 ชม. 3 นาที"
  function fmtDuration(totalMin, hoursPerDay, startDayOffset = 0) {
    const b = breakdown(totalMin, hoursPerDay, startDayOffset);
    const keys = ["y", "mo", "d", "h", "mi"];
    const first = keys.findIndex((k) => b[k] > 0);
    if (first < 0) return fmtShort(b);
    const out = { y: 0, mo: 0, d: 0, h: 0, mi: 0 };
    keys.slice(first, first + 3).forEach((k) => { out[k] = b[k]; });
    return fmtShort(out);
  }

  // ช่องในตาราง: ถ้าถูกตัดหน่วย ให้ hover ดูแบบเต็มได้
  function durHtml(totalMin, hoursPerDay, startDayOffset = 0) {
    const short = fmtDuration(totalMin, hoursPerDay, startDayOffset);
    const full = fmtShort(breakdown(totalMin, hoursPerDay, startDayOffset));
    return short === full
      ? short
      : `<span class="trunc" tabindex="0" title="${full}" data-short="${short}" data-full="${full}">${short}</span>`;
  }

  function fmtHoursOnly(totalMin) {
    return `${nf.format(Math.floor(totalMin / 60))}${t("short").h}`;
  }

  // 9,759,550,000 → "9.76B"
  function fmtCompact(n) {
    const units = [[1e12, "T"], [1e9, "B"], [1e6, "M"], [1e3, "K"]];
    for (const [v, u] of units) {
      if (n >= v) return `${nf2.format(n / v)}${u}`;
    }
    return nf.format(Math.round(n));
  }

  // วัน + ชม. + นาที (ไม่แปลงเป็นเดือน/ปี)
  function fmtDaysHM(totalMin, hoursPerDay) {
    const b = breakdown(totalMin, hoursPerDay);
    return fmtShort({ y: 0, mo: 0, d: b.days, h: b.h, mi: b.mi });
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
    const hoursPerDay = parseNum(state.hoursPerDay);
    const baseExp = parseNum(state.baseExp);
    const tickMinutes = parseNum(state.tickMinutes);
    const boost = parseNum(state.boost);
    const hidden = hiddenValue();
    const expInput = state.currentExp === "" ? 0 : parseNum(state.currentExp);

    const errors = [];
    let expError = false;
    const firstReq = costOf(level) || 0;
    if (!selectableLevels().includes(level)) errors.push(t("errLevel"));
    if (!(baseExp > 0)) errors.push(t("errBase"));
    if (!(hoursPerDay > 0 && hoursPerDay <= 24)) errors.push(t("errHours"));
    if (!(tickMinutes > 0)) errors.push(t("errTick"));
    if (!(parseNum(state.silverPerHour) >= 0)) errors.push(t("errSilver"));

    let expPerTick;
    if (state.tickSource === "tick") {
      expPerTick = parseNum(state.tickExp);
      if (!(expPerTick > 0)) errors.push(t("errTickExp"));
    } else {
      if (!Number.isFinite(boost)) errors.push(t("errBoost"));
      else if (!(boost + hidden > -100)) errors.push(t("errEffective"));
      expPerTick = tickFromBoost();
    }

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
      if (firstReq && expInput >= firstReq) {
        errors.push(t("errExpMax", { n: nf.format(firstReq) }));
        expError = true;
      }
      currentExp = Math.floor(expInput);
    }

    if (errors.length) return { errors, expError, level, firstReq, currentExp };

    const effectiveBoost = (expPerTick / baseExp - 1) * 100;

    const rows = [];
    let cumDelta = 0;
    let prevCumTicks = 0;
    for (let lv = level; lv < MAX_LEVEL; lv++) {
      const req = costOf(lv);
      const delta = lv === level ? req - currentExp : req;
      cumDelta += delta;
      // จำนวน tick = ceil(EXP ÷ EXP ต่อ tick) นับแบบสะสม เพื่อให้ EXP ส่วนเกินยกไปเลเวลถัดไป
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
      effectiveBoost,
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
  function setSeg(btns, attr, value) {
    btns.forEach((b) => {
      const active = b.dataset[attr] === value;
      b.classList.toggle("active", active);
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", active);
    });
  }

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
    setSeg(el.langBtns, "lang", lang);
  }

  function renderLevelOptions() {
    const levels = selectableLevels();
    el.level.innerHTML = levels.map((lv) => `<option value="${lv}">Lv ${lv}</option>`).join("");
    if (!levels.includes(Number(state.level)) && levels.length) {
      // เลเวลเดิมไม่มีข้อมูลในโหมดนี้ — เลือกเลเวลที่ใกล้ที่สุด
      const cur = Number(state.level);
      state.level = levels.reduce((a, b) => (Math.abs(b - cur) < Math.abs(a - cur) ? b : a));
    }
    el.level.value = String(state.level);
  }

  function clearResults() {
    el.summary.classList.add("is-empty");
    el.totalDelta.textContent = el.levelPct.textContent = "–";
    el.totalTicks.textContent = el.perHour.textContent = "";
    [el.pctPerTick, el.pctPerHour, el.nextLevelTime,
      el.dur24Main, el.durLimMain, el.dur24Finish, el.durLimFinish,
      el.dur24Days, el.durLimDays, el.dur24Hours, el.durLimHours]
      .forEach((n) => { n.textContent = "–"; });
    el.nextLevelFoot.textContent = el.dur24Rest.textContent = el.durLimRest.textContent = "";
    el.progressFill.style.width = "0%";
    el.silverValue.textContent = "–";
    el.silverFoot.textContent = "";
    el.tbody.innerHTML = "";
    el.tfoot.innerHTML = "";
  }

  function render() {
    const r = compute();
    const hpd = parseNum(state.hoursPerDay);
    const hpdLabel = hpd > 0 ? nf2.format(hpd) : "–";
    const tickMin = parseNum(state.tickMinutes);
    const level = Number(state.level);

    el.limitedLabel.textContent = t("limited", { h: hpdLabel });
    el.thLimited.textContent = t("thLimited", { h: hpdLabel });
    el.thCumulative.textContent = t("thCumulative", { h: hpdLabel });
    el.tickEveryHint.textContent = t("tickEvery", { n: tickMin > 0 ? nf2.format(tickMin) : "–" });
    el.levelCardLabel.textContent = t("levelCard", { a: level, b: level + 1 });
    const silverRateLabel = parseNum(state.silverPerHour);
    el.silverLabel.textContent = t("silverCost", { r: silverRateLabel >= 0 ? fmtCompact(silverRateLabel) : "–" });
    el.nextLevelLabel.textContent = t("nextLevel", { n: level + 1, h: hpdLabel });

    if (r.firstReq) {
      el.expHint.textContent = state.expUnit === "pct"
        ? t("expHintPct", { a: nf.format(r.currentExp), b: nf.format(r.firstReq) })
        : t("expHintExp", { b: nf.format(r.firstReq), p: nf2.format((r.currentExp / r.firstReq) * 100) });
    } else {
      el.expHint.textContent = "";
    }

    const byTick = state.tickSource === "tick";
    el.boost.hidden = byTick;
    el.tickExp.hidden = !byTick;
    el.boostLabel.textContent = t(byTick ? "tickExp" : "boost");
    el.boostLabel.htmlFor = byTick ? "tickExp" : "boost";
    setSeg(el.sourceBtns, "source", state.tickSource);
    el.currentExp.setAttribute("aria-invalid", String(!!r.expError));
    renderRefTable();

    if (r.errors.length) {
      el.error.hidden = false;
      el.error.textContent = r.errors.join(" · ");
      el.boostHint.textContent = "";
      clearResults();
      return;
    }
    el.error.hidden = true;
    el.summary.classList.remove("is-empty");

    const perHour = (r.expPerTick * 60) / r.tickMinutes;
    el.boostHint.textContent = state.tickSource === "tick"
      ? t("tickHint", { n: nf2.format(r.effectiveBoost - HIDDEN_BUFF) })
      : t("boostHint", { n: nf.format(Math.round(r.expPerTick)) });

    // ความคืบหน้าในเลเวลปัจจุบัน
    const curPct = (r.currentExp / r.firstReq) * 100;
    el.levelPct.textContent = `${nf3.format(curPct)}%`;
    el.progressFill.style.width = `${Math.min(100, curPct)}%`;
    el.progress.setAttribute("aria-valuenow", curPct.toFixed(2));
    el.pctPerTick.textContent = `+${fmtPct((r.expPerTick / r.firstReq) * 100)}%`;
    el.pctPerHour.textContent = `+${fmtPct((perHour / r.firstReq) * 100)}%`;
    const first = r.rows[0];
    el.nextLevelTime.textContent = fmtDaysHM(first.minutes, r.hoursPerDay);
    el.nextLevelFoot.textContent = t("nextFoot", { v: fmtDaysHM(first.minutes, 24) });

    el.totalDelta.textContent = nf.format(r.totalDelta);
    el.totalTicks.textContent = t("ticks", { n: nf.format(r.totalTicks) });
    el.perHour.textContent = t("perHour", { n: nf.format(Math.round(perHour)) });

    // ค่า Silver = ชั่วโมงเทรนรวม × Silver ต่อชั่วโมง
    const silverRate = parseNum(state.silverPerHour);
    const silver = (r.totalMinutes / 60) * silverRate;
    el.silverValue.textContent = fmtCompact(silver);
    el.silverFoot.textContent = `${nf.format(Math.round(silver))} Silver`;

    renderDuration(el.dur24Main, el.dur24Rest, r.totalMinutes, 24);
    el.dur24Finish.textContent = df.format(new Date(Date.now() + r.totalMinutes * 60000));
    el.dur24Days.textContent = fmtDaysHM(r.totalMinutes, 24);
    el.dur24Hours.textContent = fmtHM(r.totalMinutes);

    renderDuration(el.durLimMain, el.durLimRest, r.totalMinutes, r.hoursPerDay);
    el.durLimFinish.textContent = df.format(finishDate(r.totalMinutes, r.hoursPerDay));
    el.durLimDays.textContent = fmtDaysHM(r.totalMinutes, r.hoursPerDay);
    el.durLimHours.textContent = fmtHM(r.totalMinutes);

    const minPerDay = r.hoursPerDay * 60;
    const daysLimited = Math.floor(r.totalMinutes / minPerDay);
    el.tbody.innerHTML = r.rows
      .map((row) => {
        // เริ่มนับปฏิทินของแต่ละเลเวลจากวันที่เลเวลก่อนหน้าจบ
        const prevMin = row.cumMinutes - row.minutes;
        return `
        <tr>
          <td class="lv">${row.from}<span class="arrow">›</span>${row.to}</td>
          <td class="num">${nf.format(row.delta)}${row.delta !== row.req ? `<span class="sub-cell">${t("fromReq", { n: nf.format(row.req) })}</span>` : ""}</td>
          <td class="num rate">+${fmtPct((perHour / row.req) * 100)}%<span class="sub-cell">${t("perTickShort", { n: `+${fmtPct((r.expPerTick / row.req) * 100)}%` })}</span></td>
          <td class="num">${durHtml(row.minutes, 24, Math.floor(prevMin / 1440))}<span class="sub-cell">${row.minutes >= 1440 ? `${fmtHoursOnly(row.minutes)} · ` : ""}${t("ticks", { n: nf.format(row.ticks) })}</span></td>
          <td class="num">${durHtml(row.minutes, r.hoursPerDay, Math.floor(prevMin / minPerDay))}</td>
          <td class="num">${durHtml(row.cumMinutes, r.hoursPerDay)}</td>
        </tr>`;
      })
      .join("");

    el.tfoot.innerHTML = `
      <tr>
        <td>${t("totalRow", { a: r.level, b: MAX_LEVEL })}</td>
        <td class="num">${nf.format(r.totalDelta)}</td>
        <td class="num"></td>
        <td class="num">${durHtml(r.totalMinutes, 24)}<span class="sub-cell">${fmtHoursOnly(r.totalMinutes)}</span></td>
        <td class="num">${durHtml(r.totalMinutes, r.hoursPerDay)}<span class="sub-cell">${t("daysCount", { n: nf.format(daysLimited) })}</span></td>
        <td class="num"></td>
      </tr>`;
  }

  function renderRefTable() {
    const level = Number(state.level);
    el.refBody.innerHTML = Object.keys(EXP_TABLE)
      .map(Number)
      .sort((a, b) => b - a)
      .map((row) => {
        const isYou = row === level;
        return `<tr${isYou ? ' class="is-you"' : ""}>
          <td>${row}${isYou ? ` <span class="badge">${t("you")}</span>` : ""}</td>
          <td>${row}<span class="arrow">›</span>${row + 1}</td>
          <td class="num">${nf.format(EXP_TABLE[row])}</td>
        </tr>`;
      })
      .join("");
  }

  // ---------- inputs ----------
  function syncInputs() {
    el.level.value = String(state.level);
    el.currentExp.value = state.currentExp;
    el.boost.value = state.boost;
    el.tickExp.value = state.tickExp === "" ? "" : nf.format(parseNum(state.tickExp));
    el.hoursPerDay.value = state.hoursPerDay;
    el.baseExp.value = state.baseExp;
    el.tickMinutes.value = state.tickMinutes;
    el.silverPerHour.value = state.silverPerHour;
    setSeg(el.unitBtns, "unit", state.expUnit);
    el.currentExp.placeholder = state.expUnit === "pct" ? "0.00" : "0";
  }

  function update() {
    syncDerived();
    saveState();
    render();
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
    applyStaticText();
    renderLevelOptions();
    syncDerived();
    saveState();
    syncInputs();
    render();

    el.level.addEventListener("change", () => {
      state.level = Number(el.level.value);
      update();
    });

    ["currentExp", "hoursPerDay", "tickMinutes", "silverPerHour"].forEach((key) => {
      el[key].addEventListener("input", () => {
        state[key] = el[key].value;
        update();
      });
    });

    el.boost.addEventListener("input", () => {
      state.boost = el.boost.value;
      state.tickSource = "boost";
      update();
    });

    el.tickExp.addEventListener("input", () => {
      state.tickExp = el.tickExp.value.replace(/[,\s]/g, "");
      state.tickSource = "tick";
      update();
    });

    // จัดรูปแบบตัวเลขเมื่อออกจากช่อง
    el.tickExp.addEventListener("blur", () => {
      const v = parseNum(state.tickExp);
      if (v > 0) el.tickExp.value = nf.format(v);
    });
    el.boost.addEventListener("blur", () => { el.boost.value = state.boost; });

    el.baseExp.addEventListener("input", () => {
      state.baseExp = el.baseExp.value;
      update();
    });

    // สลับว่าจะกรอก Boost หรือ EXP ต่อ tick (ค่าอีกฝั่งคำนวณไว้แล้ว ผลจึงไม่เปลี่ยน)
    el.sourceBtns.forEach((b) =>
      b.addEventListener("click", () => {
        if (b.dataset.source === state.tickSource) return;
        state.tickSource = b.dataset.source;
        syncInputs();
        update();
      })
    );

    el.unitBtns.forEach((b) =>
      b.addEventListener("click", () => {
        const unit = b.dataset.unit;
        if (unit === state.expUnit) return;
        // แปลงค่าเดิมให้อยู่ในหน่วยใหม่
        const req = costOf(Number(state.level));
        const v = parseNum(state.currentExp);
        if (v >= 0 && req) {
          state.currentExp = unit === "pct"
            ? String(Math.floor(((v / req) * 100) * 10000) / 10000)
            : String(Math.floor((req * v) / 100));
        }
        state.expUnit = unit;
        syncInputs();
        update();
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

    // แตะ/คลิกเวลาที่ถูกตัดหน่วยเพื่อสลับดูแบบเต็ม (สำหรับมือถือที่ hover ไม่ได้)
    el.tbody.parentElement.addEventListener("click", (e) => {
      const span = e.target.closest(".trunc");
      if (!span) return;
      const showFull = span.textContent === span.dataset.short;
      span.textContent = showFull ? span.dataset.full : span.dataset.short;
    });

    el.shareBtn.addEventListener("click", share);

    el.resetBtn.addEventListener("click", () => {
      state = { ...DEFAULTS };
      renderLevelOptions();
      syncDerived();
      syncInputs();
      update();
    });
  }

  init();
})();
