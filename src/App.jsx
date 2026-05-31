import React, { useState, useEffect, useRef } from "react";
import { api } from "./api";

// ════════════════════════════════════════════════════════════════════
//  BACKEND CONNECTION
//  USE_BACKEND = false → standalone demo (in-memory, runs anywhere incl. chat)
//  USE_BACKEND = true  → talks to your live server via api.js
//  Flip this to true once your backend server is running.
// ════════════════════════════════════════════════════════════════════
const USE_BACKEND = true;

// ════════════════════════════════════════════════════════════
//  בנה את הזהות המנצחת שלך — v4
//  Auto morning questionnaire · energy rings (red→green) · day score
//  Summary diagrams (day/week) · AI coach · full feature set
// ════════════════════════════════════════════════════════════

const T = {
  bg: "#0c0d10", bg2: "#101216", card: "#16181e", cardHi: "#1c1f26",
  line: "rgba(255,255,255,0.06)", line2: "rgba(255,255,255,0.11)",
  gold: "#c9a84a", goldHi: "#e6cd7a", goldDim: "rgba(201,168,74,0.13)",
  text: "#f0ede6", soft: "#9a958c", mute: "#5f5b54",
  green: "#52c98a", greenDim: "rgba(82,201,138,0.12)",
  blue: "#7aa2f7", red: "#e0566b", redDim: "rgba(224,86,107,0.10)",
  violet: "#b18cf0", violetDim: "rgba(177,140,240,0.12)",
};

// energy 1..5 → ring color (red → orange → yellow → light green → green)
const ENERGY_COLORS = { 1: "#e0566b", 2: "#e8924a", 3: "#d9c24a", 4: "#8fd05a", 5: "#52c98a" };
const ENERGY_LABELS = ["", "מותש", "עייף", "סביר", "טוב", "אנרגטי"];

const ICON_POOL = ["💰", "💪", "🏡", "📚", "🎯", "🧘", "🎨", "🚀", "⚡", "🔥", "🌱", "♟️"];

const SEED_IDENTITIES = [
  { id: "trader", name: "סוחר זהב", icon: "💰", level: 7, pts: 240, max: 400, color: T.gold },
  { id: "athlete", name: "ספורטאי עילית", icon: "💪", level: 5, pts: 180, max: 300, color: T.green },
  { id: "family", name: "איש משפחה", icon: "🏡", level: 4, pts: 120, max: 300, color: T.blue },
];

const SEED_TASKS = [
  { id: 1, title: "סקירת שוק לפני הפתיחה", identity: "trader", time: "06:30", pts: 25, done: false, critical: true },
  { id: 2, title: "אימון כוח · 45 דקות", identity: "athlete", time: "07:15", pts: 30, done: true, critical: true },
  { id: 3, title: "ארוחת בוקר עם הילדים", identity: "family", time: "08:00", pts: 20, done: false, critical: true },
];

const TIERS = {
  free: { label: "Free", maxTasks: 3, maxIdentities: 0, identities: false, panic: false, focus: false, wisdom: false, reviews: false, coach: false, journey: false, habits: false },
  core: { label: "בסיס", maxTasks: 10, maxIdentities: 3, identities: true, panic: false, focus: false, wisdom: false, reviews: true, coach: false, journey: true, habits: true },
  ultimate: { label: "פרימיום", maxTasks: 99, maxIdentities: 99, identities: true, panic: true, focus: true, wisdom: true, reviews: true, coach: true, journey: true, habits: true },
};

const WISDOM = [
  "אתה לא עולה לגובה המטרות שלך — אתה צונח לגובה המערכות שבנית.",
  "כל פעולה היא קול שאתה נותן לסוג האדם שתרצה להיות.",
  "משמעת היא לבחור בין מה שתרצה עכשיו למה שתרצה יותר מכל.",
];

const TRIGGERS = [
  { icon: "📱", label: "טלפון / רשתות" }, { icon: "😴", label: "עייפות" },
  { icon: "🍔", label: "רעב" }, { icon: "😟", label: "מצב רוח" },
  { icon: "👥", label: "הסחות מאנשים" }, { icon: "📺", label: "בינג' טלוויזיה" },
];

const METHODS = [
  { icon: "🚗", name: "שיטת הטרמפ", en: "Habit Stacking", desc: "הצמד משימה חדשה להרגל קיים. אחרי הקפה → סקירת שוק.", color: T.gold },
  { icon: "🧹", name: "ניקוי מכשולים", en: "Environment Design", desc: "הסר חיכוך והסחות מהסביבה לפני שתתחיל.", color: T.green },
  { icon: "▶️", name: "רק להתחיל", en: "2-Minute Rule", desc: "התחייב ל-2 דקות בלבד. ההתחלה היא הקרב.", color: T.blue },
];

// ספריית הידע — קטעים קצרים ללמידה (קריאת ערב / זמן פנוי)
const LIBRARY = [
  { id: "l1", cat: "מחקר", icon: "🔬", min: 3, pts: 15, title: "66 ימים, לא 21",
    body: "המיתוס שאומר שלוקח 21 יום לבנות הרגל פשוט שגוי. מחקר מאוניברסיטת לונדון (Lally, 2009) עקב אחרי אנשים שניסו לאמץ הרגלים חדשים, ומצא שהזמן הממוצע עד שהתנהגות הופכת לאוטומטית הוא כ-66 יום — והטווח נע בין 18 ל-254 ימים. המסקנה: אם אתה לא מרגיש שזה 'טבעי' אחרי שבועיים, זה נורמלי לחלוטין. אל תוותר. ההתמדה היא שבונה את האוטומטיות, לא לוח הזמנים." },
  { id: "l2", cat: "פסיכולוגיה", icon: "🧠", min: 2, pts: 15, title: "כוח הרצון הוא שריר",
    body: "מחקרים על 'התשת האגו' (ego depletion) מראים שכוח הרצון מתנהג כמו שריר — הוא מתעייף ככל שמשתמשים בו במהלך היום. לכן החלטות קשות מתקבלות טוב יותר בבוקר, וגם למה אנשים נכשלים בדיאטה דווקא בערב. המסקנה המעשית: אל תסמוך על כוח רצון לבד. עצב את הסביבה כך שהבחירה הנכונה תהיה הקלה ביותר — וכך תחסוך את 'דלק' הרצון למה שבאמת חשוב." },
  { id: "l3", cat: "טיפ מעשי", icon: "🎯", min: 2, pts: 10, title: "כלל ה-2 דקות בפעולה",
    body: "כשמשימה מרגישה כבדה מדי, הקטן אותה לגרסה של 2 דקות. 'לקרוא ספר' הופך ל'לפתוח את הספר ולקרוא עמוד אחד'. 'להתאמן' הופך ל'ללבוש בגדי אימון'. הרעיון: ברגע שהתחלת, הרבה יותר קל להמשיך. ההתחלה היא המחסום הגדול ביותר, לא המאמץ עצמו. תתחיל קטן, וההמשך יבוא מעצמו." },
  { id: "l4", cat: "מחקר", icon: "🔬", min: 3, pts: 15, title: "כוונות יישום (Implementation Intentions)",
    body: "מחקר קלאסי של פטר גולוויצר מצא שאנשים שכתבו במדויק 'מתי' ו'איפה' יבצעו פעולה, הכפילו ואף שילשו את שיעור ההצלחה שלהם. במקום 'אתאמן השבוע', נסח: 'ביום שני ב-7:00 בבוקר, אלך לחדר הכושר ברחוב X'. המוח אוהב תוכניות ספציפיות — הן מסירות את ההתלבטות שגוזלת אנרגיה ומובילה לדחיינות." },
  { id: "l5", cat: "זהות", icon: "👤", min: 3, pts: 15, title: "כל פעולה היא הצבעה",
    body: "ג'יימס קליר מתאר כל פעולה קטנה כ'הצבעה' לסוג האדם שאתה רוצה להיות. אדם שמתאמן פעם אחת לא הפך לספורטאי — אבל הוא הצביע בעד הזהות הזו. השינוי האמיתי הוא לא 'אני רוצה לרזות' אלא 'אני אדם שמטפל בגוף שלו'. כשהזהות משתנה, ההרגלים נובעים ממנה באופן טבעי. אל תרדוף אחרי תוצאה — הפוך להיות האדם שמשיג אותה." },
  { id: "l6", cat: "פסיכולוגיה", icon: "🧠", min: 2, pts: 10, title: "אפקט הרצף (Don't Break the Chain)",
    body: "הקומיקאי ג'רי סיינפלד ייחס את הצלחתו לטריק פשוט: בכל יום שבו כתב בדיחות, סימן X אדום בלוח שנה. אחרי כמה ימים נוצר רצף — והמשימה הפכה ל'לא לשבור את השרשרת'. הרצף עצמו הופך למניע. זו הסיבה שמונה הרצף באפליקציה כל כך חזק: אתה לא רוצה להיות זה שמאפס את המספר." },
  { id: "l7", cat: "טיפ מעשי", icon: "🎯", min: 2, pts: 10, title: "תכנן את הכישלון מראש",
    body: "מנצחים לא מניחים שהכל ילך חלק. הם שואלים מראש: 'מה יכול להפיל אותי, ומה אעשה אז?'. אם אתה יודע שאחרי יום עבודה מתיש בא פיתוי לוותר על האימון — תכנן תגובה: 'גם אם אני עייף, אעשה 10 דקות בלבד'. ההיערכות מראש למכשול היא מה שמבדיל בין כוונה טובה לביצוע בפועל." },
  { id: "l8", cat: "מחקר", icon: "🔬", min: 3, pts: 15, title: "למה תגמול מיידי מנצח",
    body: "המוח שלנו התפתח להעדיף תגמול מיידי על פני תגמול עתידי — תופעה שנקראת 'הנחה היפרבולית'. זו הסיבה שקל לדחות חיסכון או אימון: הפרס רחוק. הפתרון? צור תגמול מיידי קטן להרגל הטוב (כמו נקודות, סימון וי, או חגיגה קטנה). כך אתה 'מרמה' את המוח לחבר הנאה מיידית להתנהגות שמשתלמת בטווח הארוך." },
];

const JOURNEY = [
  { month: "ינואר", level: 9 }, { month: "פברואר", level: 11 }, { month: "מרץ", level: 12 },
  { month: "אפריל", level: 14 }, { month: "מאי", level: 16 },
];
const ACHIEVEMENTS = [
  { icon: "🔥", name: "רצף 12 ימים", got: true }, { icon: "🌅", name: "30 בקרים", got: true },
  { icon: "💎", name: "1000 נקודות", got: true }, { icon: "⚡", name: "100 משימות", got: true },
  { icon: "🏆", name: "רמה 20", got: false }, { icon: "👑", name: "100 ימי רצף", got: false },
];
const WEEK_DATA = [
  { d: "א'", tasks: 80, energy: 4 }, { d: "ב'", tasks: 100, energy: 5 }, { d: "ג'", tasks: 45, energy: 2 },
  { d: "ד'", tasks: 90, energy: 4 }, { d: "ה'", tasks: 70, energy: 3 }, { d: "ו'", tasks: 60, energy: 4 }, { d: "ש'", tasks: 33, energy: 3 },
];

export default function App() {
  const [tier, setTier] = useState("free");
  const [screen, setScreen] = useState("home");
  const [tasks, setTasks] = useState(SEED_TASKS);
  const [identities, setIdentities] = useState(SEED_IDENTITIES);
  const [paywall, setPaywall] = useState(null);
  const [focus, setFocus] = useState(null);
  const [toast, setToast] = useState(null);
  const [morningOpen, setMorningOpen] = useState(true); // auto-opens on entry
  const [summary, setSummary] = useState(null); // null | 'day' | 'week'
  const [identEditor, setIdentEditor] = useState(null);
  const [todayEnergy, setTodayEnergy] = useState(3);
  const [watchOut, setWatchOut] = useState([]);
  const [energyLog, setEnergyLog] = useState([3, 4, 2, 5, 3, 4]);
  const [streak] = useState(12);
  const [wisdomIdx] = useState(() => Math.floor(Math.random() * WISDOM.length));
  const [notif, setNotif] = useState(null); // motivational reminder banner
  const [readArticles, setReadArticles] = useState(new Set()); // library: marked-as-read article ids

  const cfg = TIERS[tier];
  const idMap = Object.fromEntries(identities.map((i) => [i.id, i]));
  const doneCount = tasks.filter((t) => t.done).length;
  const totalPts = identities.reduce((s, i) => s + i.pts, 0);

  // Day Score 0-100: 70% task completion + 30% energy
  const completion = tasks.length ? doneCount / tasks.length : 0;
  const dayScore = Math.round(completion * 70 + (todayEnergy / 5) * 30);

  // ── Motivational reminder engine (demo) ──
  // In production: replace this with real push notifications
  // scheduled via service worker / FCM, triggered X minutes before task.time.
  // Tone: warm encouragement + clear directness (combined 1+2).
  function reminderText(task) {
    const idn = idMap[task.identity];
    const who = idn ? idn.name : "המנצח שבך";
    const lines = [
      `⏰ "${task.title}" מחכה — זה הזמן. ${who} סופר עליך. 2 דקות וזה זז.`,
      `⏰ הגיע הזמן ל"${task.title}". כל פעולה היא קול ל${who} שאתה בונה. קדימה.`,
      `⏰ עוד לא סימנת את "${task.title}". אל תיתן ליום לחמוק — התחל עכשיו, רק להתחיל.`,
    ];
    return lines[task.id % lines.length];
  }
  // Demo trigger: 6s after morning closes, nudge the first unfinished task once.
  const nudgedRef = useRef(false);
  useEffect(() => {
    if (morningOpen || nudgedRef.current) return;
    const pending = tasks.find((t) => !t.done);
    if (!pending) return;
    const id = setTimeout(() => { setNotif(reminderText(pending)); nudgedRef.current = true; setTimeout(() => setNotif(null), 6000); }, 6000);
    return () => clearTimeout(id);
  }, [morningOpen, tasks]);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 2200); }

  // ── Load today's state from the server (when connected) ──
  useEffect(() => {
    if (!USE_BACKEND) return;
    api.getToday()
      .then((data) => {
        // map server tasks → UI shape
        setTasks((data.tasks || []).map((t) => ({
          id: t.id, title: t.title, identity: t.identity_id, time: t.exec_time || "היום",
          pts: t.points, done: t.is_done, critical: t.is_critical, note: t.note,
        })));
        if (data.energy) setTodayEnergy(data.energy.energy_level);
        setWatchOut(data.triggers || []);
        if (data.energy) setMorningOpen(false); // already did morning today
      })
      .catch((e) => showToast("שגיאת חיבור לשרת: " + e.message));
  }, []);

  function markArticleRead(article) {
    if (readArticles.has(article.id)) return; // already read — no double points
    setReadArticles((prev) => { const next = new Set(prev); next.add(article.id); return next; });
    // Award points to the first identity (knowledge benefits all identities — first one is the primary)
    setIdentities((ids) => ids.map((idn, i) => i === 0 ? { ...idn, pts: Math.min(idn.max, idn.pts + article.pts) } : idn));
    showToast(`+${article.pts} נקודות · קראת קטע ידע 📚`);
  }

  function toggleTask(id) {
    setTasks((prev) => prev.map((t) => {
      if (t.id !== id) return t;
      const nowDone = !t.done;
      setIdentities((ids) => ids.map((idn) => idn.id === t.identity ? { ...idn, pts: Math.max(0, Math.min(idn.max, idn.pts + (nowDone ? t.pts : -t.pts))) } : idn));
      if (nowDone) showToast(`+${t.pts} נקודות · ${idMap[t.identity]?.name || ""}`);
      return { ...t, done: nowDone };
    }));
    if (USE_BACKEND) api.toggleTask(id).catch((e) => showToast("שגיאה: " + e.message));
  }
  function addTask(data) {
    if (tasks.length >= cfg.maxTasks) return setPaywall("task");
    const nid = tasks.length ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
    const newTask = { id: nid, title: data?.title || `משימה חדשה ${tasks.length + 1}`, identity: cfg.identities ? (data?.identity || identities[0]?.id) : null, time: data?.time || "היום", pts: data?.pts || 10, done: false, critical: !!data?.critical, emoji: ICON_POOL[nid % ICON_POOL.length], note: data?.note };
    setTasks((p) => [...p, newTask]);
    if (USE_BACKEND) {
      api.createTask({ title: newTask.title, identityId: newTask.identity, execTime: data?.time, points: newTask.pts, isCritical: newTask.critical, note: newTask.note })
        .catch((e) => showToast("שגיאה: " + e.message));
    }
  }
  function saveIdentity(idn) {
    if (idn.id && identities.find((i) => i.id === idn.id)) { setIdentities((p) => p.map((i) => (i.id === idn.id ? { ...i, ...idn } : i))); showToast("הזהות עודכנה"); }
    else { if (identities.length >= cfg.maxIdentities) { setIdentEditor(null); return setPaywall("identity"); } setIdentities((p) => [...p, { id: "id_" + Date.now(), name: idn.name, icon: idn.icon, level: 1, pts: 0, max: 100, color: idn.color }]); showToast("זהות חדשה נוצרה"); }
    setIdentEditor(null);
  }
  function tryFocus() { if (!cfg.focus) return setPaywall("focus"); setFocus({ mode: "focus" }); }
  function tryPanic() { if (!cfg.panic) return setPaywall("panic"); setFocus({ mode: "panic" }); }
  function navTo(s, gate) { if (gate && !cfg[gate]) return setPaywall(gate); setScreen(s); }
  function openSummary(kind) { if (!cfg.reviews && kind === "week") return setPaywall("reviews"); setSummary(kind); }

  return (
    <div dir="rtl" style={SS.root}>
      <style>{CSS}</style>
      <FontLink />
      <div style={SS.frame}>
        <TierSwitcher tier={tier} setTier={setTier} />
        <div style={SS.scroll} className="wi-scroll">
          {screen === "home" && <Home {...{ cfg, tasks, identities, doneCount, totalPts, dayScore, streak, watchOut, wisdom: WISDOM[wisdomIdx], idMap, onToggle: toggleTask, onAdd: () => setMorningOpen("addTask"), onFocus: tryFocus, onPanic: tryPanic, onMorning: () => setMorningOpen(true), onSummary: openSummary, onEditIdent: (i) => setIdentEditor(i), onNewIdent: () => (cfg.identities ? setIdentEditor("new") : setPaywall("identity")), onTestNotif: () => { const p = tasks.find((t) => !t.done); setNotif(reminderText(p || tasks[0])); setTimeout(() => setNotif(null), 6000); } }} />}
          {screen === "coach" && <Coach cfg={cfg} identities={identities} doneCount={doneCount} total={tasks.length} streak={streak} energy={todayEnergy} />}
          {screen === "habits" && <Habits cfg={cfg} readArticles={readArticles} onRead={markArticleRead} />}
          {screen === "journey" && <Journey cfg={cfg} totalPts={totalPts} streak={streak} />}
          {screen === "stats" && <Stats cfg={cfg} identities={identities} energyLog={energyLog} />}
        </div>
        <BottomNav screen={screen} go={navTo} />
      </div>

      {paywall && <Paywall kind={paywall} onClose={() => setPaywall(null)} onPick={(t) => { setTier(t); setPaywall(null); }} />}
      {focus && <FocusScreen mode={focus.mode} tasks={tasks} onExit={() => setFocus(null)} onComplete={(id) => { toggleTask(id); setFocus(null); }} />}
      {morningOpen && <MorningFlow mode={morningOpen} identities={identities} cfg={cfg} initialEnergy={todayEnergy}
        onClose={() => setMorningOpen(false)}
        onAddOne={(t) => { addTask(t); setMorningOpen(false); }}
        onComplete={({ energy, picks, watch }) => { setTodayEnergy(energy); setEnergyLog((p) => [...p.slice(-5), energy]); picks.forEach((p) => addTask(p)); setWatchOut(watch); setMorningOpen(false); showToast("הבוקר שלך מוכן · קדימה לנצח"); if (USE_BACKEND) api.submitMorning({ energyLevel: energy, triggers: watch }).catch(() => {}); }} />}
      {summary && <SummaryView kind={summary} tasks={tasks} doneCount={doneCount} dayScore={dayScore} energy={todayEnergy} totalPts={totalPts} onClose={() => setSummary(null)} />}
      {identEditor && <IdentityEditor base={identEditor === "new" ? null : identEditor} onClose={() => setIdentEditor(null)} onSave={saveIdentity} />}
      {toast && <div style={SS.toast} className="wi-toast">{toast}</div>}
      {notif && (
        <div style={SS.notifBanner} className="wi-notif" onClick={() => setNotif(null)}>
          <div style={SS.notifIcon}>🏆</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: T.gold, fontWeight: 700, marginBottom: 2 }}>תזכורת · הזהות המנצחת</div>
            <div style={{ fontSize: 13, color: T.text, lineHeight: 1.4 }}>{notif}</div>
          </div>
          <span style={{ color: T.mute, fontSize: 18, alignSelf: "flex-start" }}>×</span>
        </div>
      )}
    </div>
  );
}

function TierSwitcher({ tier, setTier }) {
  return (
    <div style={SS.tierBar}>
      <span style={SS.tierHint}>הדגמה</span>
      <div style={SS.tierGroup}>{Object.entries(TIERS).map(([k, v]) => <button key={k} onClick={() => setTier(k)} style={{ ...SS.tierBtn, ...(tier === k ? SS.tierBtnOn : {}) }}>{v.label}</button>)}</div>
    </div>
  );
}

// ───────── ENERGY RING SELECTOR ─────────
// circles 1-5; on hover/select a colored ring appears (red→green)
function EnergyPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        {[1, 2, 3, 4, 5].map((n) => {
          const active = value === n;
          const showRing = active || hover === n;
          const ringColor = ENERGY_COLORS[n];
          return (
            <button key={n}
              onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
              onClick={() => onChange(n)} className="wi-press"
              style={{
                width: 52, height: 52, borderRadius: "50%", cursor: "pointer", fontFamily: FONT,
                fontSize: 19, fontWeight: 800,
                background: active ? ringColor : T.card,
                color: active ? "#0c0d10" : T.soft,
                border: showRing ? `3px solid ${ringColor}` : `2px solid ${T.line2}`,
                boxShadow: showRing ? `0 0 0 4px ${ringColor}33, 0 0 18px ${ringColor}55` : "none",
                transition: "all 0.2s ease",
              }}>{n}</button>
          );
        })}
      </div>
      <div style={{ textAlign: "center", fontSize: 13, color: hover ? ENERGY_COLORS[hover] : value ? ENERGY_COLORS[value] : T.mute, marginTop: 12, fontWeight: 700, height: 18, transition: "color 0.2s" }}>
        {ENERGY_LABELS[hover || value]}
      </div>
    </div>
  );
}

// ───────── MORNING FLOW (auto questionnaire) ─────────
function MorningFlow({ mode, identities, cfg, initialEnergy, onClose, onComplete, onAddOne }) {
  // mode: true = full morning; "addTask" = single task add with sub-fields
  const single = mode === "addTask";
  const [step, setStep] = useState(single ? 99 : 0);
  const [energy, setEnergy] = useState(initialEnergy || 0);
  const [watch, setWatch] = useState([]);

  // task-builder fields (single mode)
  const [tTitle, setTTitle] = useState("");
  const [tIdentity, setTIdentity] = useState(identities[0]?.id);
  const [tTime, setTTime] = useState("");
  const [tNote, setTNote] = useState("");
  const [tCrit, setTCrit] = useState(false);

  // morning: user fills 3 wins themselves (start empty)
  const [wins, setWins] = useState([
    { title: "", identity: identities[0]?.id, time: "" },
    { title: "", identity: identities[0]?.id, time: "" },
    { title: "", identity: identities[0]?.id, time: "" },
  ]);
  function updateWin(i, field, val) { setWins((p) => p.map((w, idx) => (idx === i ? { ...w, [field]: val } : w))); }
  const filledWins = wins.filter((w) => w.title.trim()).map((w) => ({ title: w.title.trim(), identity: w.identity, time: w.time || "היום", pts: 25, critical: true }));

  function toggleWatch(w) { setWatch((p) => p.includes(w.label) ? p.filter((x) => x !== w.label) : [...p, w.label]); }

  // ── single task builder ──
  if (single) {
    return (
      <Sheet onClose={onClose}>
        <h2 style={SS.modalTitle}>משימה חדשה</h2>
        <p style={SS.modalDesc}>מלא את הפרטים — שם, זהות, ושורת "להיזהר מ".</p>
        <Field label="שם המשימה"><input value={tTitle} onChange={(e) => setTTitle(e.target.value)} placeholder="מה צריך לעשות?" style={SS.fieldInput} /></Field>
        {cfg.identities && (
          <Field label="שייך לזהות">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {identities.map((i) => <button key={i.id} onClick={() => setTIdentity(i.id)} className="wi-press" style={{ ...SS.pillSelect, ...(tIdentity === i.id ? SS.pillSelectOn : {}) }}>{i.icon} {i.name}</button>)}
            </div>
          </Field>
        )}
        <div style={{ display: "flex", gap: 10 }}>
          <Field label="שעה" flex><input value={tTime} onChange={(e) => setTTime(e.target.value)} placeholder="08:00" style={SS.fieldInput} /></Field>
          <Field label="קריטית?" flex>
            <button onClick={() => setTCrit((v) => !v)} className="wi-press" style={{ ...SS.fieldInput, textAlign: "center", color: tCrit ? T.gold : T.soft, borderColor: tCrit ? T.gold : T.line2, cursor: "pointer" }}>{tCrit ? "★ כן, קריטית" : "סמן כקריטית"}</button>
          </Field>
        </div>
        <Field label="⚠️ ממה להיזהר במשימה הזו"><input value={tNote} onChange={(e) => setTNote(e.target.value)} placeholder="למשל: לא לפתוח טלפון תוך כדי" style={SS.fieldInput} /></Field>
        <button disabled={!tTitle.trim()} onClick={() => onAddOne({ title: tTitle.trim(), identity: tIdentity, time: tTime || "היום", note: tNote, critical: tCrit })} style={{ ...SS.primaryBtn, marginTop: 8, ...(tTitle.trim() ? {} : { opacity: 0.4 }) }} className="wi-press">הוסף משימה</button>
        <button onClick={onClose} style={SS.modalClose}>ביטול</button>
      </Sheet>
    );
  }

  // ── full morning ──
  return (
    <Sheet onClose={onClose} bg={`linear-gradient(180deg, #1c1810, ${T.bg2})`}>
      <div style={SS.stepDots}>{[0, 1, 2].map((s) => <div key={s} style={{ ...SS.stepDot, ...(s === step ? SS.stepDotOn : {}), ...(s < step ? { background: T.gold } : {}) }} />)}</div>

      {step === 0 && (
        <div className="wi-fade">
          <div style={{ fontSize: 44, textAlign: "center", marginBottom: 8 }}>🌅</div>
          <h2 style={SS.modalTitle}>בוקר טוב, אלוף</h2>
          <p style={SS.modalDesc}>לפני שמתחילים — איך האנרגיה שלך הבוקר?</p>
          <div style={{ margin: "24px 0" }}><EnergyPicker value={energy} onChange={setEnergy} /></div>
          <button disabled={!energy} onClick={() => setStep(1)} style={{ ...SS.primaryBtn, ...(energy ? {} : { opacity: 0.4 }) }} className="wi-press">המשך →</button>
        </div>
      )}

      {step === 1 && (
        <div className="wi-fade">
          <div style={{ fontSize: 40, textAlign: "center", marginBottom: 8 }}>🎯</div>
          <h2 style={SS.modalTitle}>3 הניצחונות של היום</h2>
          <p style={SS.modalDesc}>כתוב בעצמך את המשימות הקריטיות שיהפכו את היום למנצח.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
            {wins.map((w, i) => (
              <div key={i} style={SS.winRow}>
                <div style={SS.winNum}>{i + 1}</div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                  <input value={w.title} onChange={(e) => updateWin(i, "title", e.target.value)} placeholder={`ניצחון ${i + 1} — מה צריך לעשות?`} style={{ ...SS.fieldInput, padding: "10px 12px" }} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <input value={w.time} onChange={(e) => updateWin(i, "time", e.target.value)} placeholder="שעה (08:00)" style={{ ...SS.fieldInput, padding: "8px 10px", fontSize: 12, flex: 1 }} />
                    {cfg.identities && (
                      <select value={w.identity} onChange={(e) => updateWin(i, "identity", e.target.value)} style={{ ...SS.fieldInput, padding: "8px 10px", fontSize: 12, flex: 1, cursor: "pointer" }}>
                        {identities.map((idn) => <option key={idn.id} value={idn.id} style={{ background: T.bg2 }}>{idn.name}</option>)}
                      </select>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button disabled={!filledWins.length} onClick={() => setStep(2)} style={{ ...SS.primaryBtn, ...(filledWins.length ? {} : { opacity: 0.4 }) }} className="wi-press">המשך → ({filledWins.length})</button>
        </div>
      )}

      {step === 2 && (
        <div className="wi-fade">
          <div style={{ fontSize: 40, textAlign: "center", marginBottom: 8 }}>🛡️</div>
          <h2 style={SS.modalTitle}>ממה להיזהר היום?</h2>
          <p style={SS.modalDesc}>סמן את הטריגרים שעלולים להפיל אותך. נשמור עליך.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18, justifyContent: "center" }}>
            {TRIGGERS.map((w, i) => (
              <button key={i} onClick={() => toggleWatch(w)} className="wi-press" style={{ ...SS.triggerChip, ...(watch.includes(w.label) ? SS.triggerChipOn : {}) }}>
                <span style={{ fontSize: 16 }}>{w.icon}</span> {w.label}
              </button>
            ))}
          </div>
          <button onClick={() => onComplete({ energy, picks: filledWins, watch })} style={SS.primaryBtn} className="wi-press">סיום · קדימה לנצח 🔥</button>
        </div>
      )}
      <button onClick={onClose} style={SS.modalClose}>{step === 2 ? "דלג על השלב" : "דלג"}</button>
    </Sheet>
  );
}

function Field({ label, children, flex }) {
  return <div style={{ marginBottom: 14, flex: flex ? 1 : undefined }}><div style={{ fontSize: 12, color: T.soft, textAlign: "right", marginBottom: 6, fontWeight: 600 }}>{label}</div>{children}</div>;
}

// ───────── SUMMARY VIEW (day / week diagrams) ─────────
function SummaryView({ kind, tasks, doneCount, dayScore, energy, totalPts, onClose }) {
  const isWeek = kind === "week";
  const weekScore = Math.round(WEEK_DATA.reduce((s, d) => s + d.tasks, 0) / WEEK_DATA.length);
  const weekEnergy = (WEEK_DATA.reduce((s, d) => s + d.energy, 0) / WEEK_DATA.length).toFixed(1);
  return (
    <Sheet onClose={onClose} wide>
      <div style={{ fontSize: 40, textAlign: "center", marginBottom: 6 }}>{isWeek ? "📅" : "📊"}</div>
      <h2 style={SS.modalTitle}>{isWeek ? "סיכום השבוע" : "סיכום היום עד עכשיו"}</h2>

      {/* Score gauge */}
      <div style={{ display: "flex", justifyContent: "center", margin: "20px 0" }}>
        <ScoreGauge score={isWeek ? weekScore : dayScore} />
      </div>

      {/* Metrics row */}
      <div style={SS.metricRow}>
        <Metric num={isWeek ? `${weekScore}%` : `${doneCount}/${tasks.length}`} lbl={isWeek ? "השלמה ממוצעת" : "משימות"} />
        <Metric num={isWeek ? weekEnergy : energy} lbl="אנרגיה" color={ENERGY_COLORS[Math.round(isWeek ? weekEnergy : energy)] || T.gold} />
        <Metric num={isWeek ? "5/7" : `+${doneCount * 25}`} lbl={isWeek ? "ימים מנצחים" : "נקודות היום"} color={T.gold} />
      </div>

      {/* Chart */}
      {isWeek ? (
        <div style={SS.chartCard}>
          <div style={{ fontSize: 12, color: T.soft, marginBottom: 14, textAlign: "right", fontWeight: 600 }}>השלמת משימות · אנרגיה</div>
          <div style={SS.bars}>
            {WEEK_DATA.map((d, i) => (
              <div key={i} style={SS.barCol}>
                <div style={SS.barTrack}>
                  <div className="wi-bar" style={{ ...SS.barFill, height: `${d.tasks}%`, animationDelay: `${i * 0.05}s`, background: d.tasks === 100 ? T.green : T.gold }} />
                </div>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: ENERGY_COLORS[d.energy], marginTop: 6 }} />
                <span style={SS.barLbl}>{d.d}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={SS.chartCard}>
          <div style={{ fontSize: 12, color: T.soft, marginBottom: 14, textAlign: "right", fontWeight: 600 }}>פירוט המשימות</div>
          {tasks.map((t) => (
            <div key={t.id} style={SS.sumTaskRow}>
              <span style={{ fontSize: 16 }}>{t.done ? "✅" : "⬜"}</span>
              <span style={{ flex: 1, fontSize: 13, color: t.done ? T.soft : T.text, textDecoration: t.done ? "line-through" : "none" }}>{t.title}</span>
              <span style={{ fontSize: 12, color: T.gold, fontWeight: 700 }}>+{t.pts}</span>
            </div>
          ))}
        </div>
      )}

      <div style={SS.insightBox}>
        <span style={{ color: T.gold, fontWeight: 700 }}>💡 תובנה: </span>
        {isWeek ? "יום ג׳ היה החלש ביותר (אנרגיה 2). שקול להעביר משימות כבדות לימים חזקים." : dayScore >= 70 ? "יום חזק! אתה בכיוון מצוין." : "עוד לא מאוחר — משימה אחת תקפיץ את הציון שלך."}
      </div>
      <button onClick={onClose} style={{ ...SS.primaryBtn, marginTop: 8 }} className="wi-press">סגור</button>
    </Sheet>
  );
}

function ScoreGauge({ score }) {
  const r = 54, c = Math.PI * r; // semicircle
  const off = c - (score / 100) * c;
  const color = score >= 70 ? T.green : score >= 40 ? T.gold : T.red;
  return (
    <div style={{ position: "relative", width: 150, height: 90 }}>
      <svg width="150" height="90" viewBox="0 0 150 90">
        <path d="M 15 80 A 60 60 0 0 1 135 80" fill="none" stroke={T.line2} strokeWidth="10" strokeLinecap="round" />
        <path d="M 15 80 A 60 60 0 0 1 135 80" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)" }} />
      </svg>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontSize: 38, fontWeight: 800, color, lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: 10, color: T.mute, letterSpacing: 1 }}>ציון יום</div>
      </div>
    </div>
  );
}
function Metric({ num, lbl, color }) {
  return <div style={SS.metric}><div style={{ fontSize: 22, fontWeight: 800, color: color || T.text }}>{num}</div><div style={{ fontSize: 11, color: T.soft, marginTop: 2 }}>{lbl}</div></div>;
}

// ───────── HOME ─────────
function Home({ cfg, tasks, identities, doneCount, totalPts, dayScore, streak, watchOut, wisdom, idMap, onToggle, onAdd, onFocus, onPanic, onMorning, onSummary, onEditIdent, onNewIdent, onTestNotif }) {
  const pct = Math.round((doneCount / Math.max(tasks.length, 1)) * 100);
  return (
    <div className="wi-fade">
      <div style={SS.head}>
        <div><div style={SS.greetSmall}>בוקר טוב,</div><div style={SS.greetName}>סוחר זהב <span style={{ color: T.gold }}>◆</span></div></div>
        <div style={SS.streak}><span style={{ fontSize: 15 }}>🔥</span><b>{streak}</b></div>
      </div>

      {/* Day score + ring summary */}
      <div style={SS.summary} className="wi-rise">
        <Ring pct={pct} />
        <div style={{ flex: 1 }}>
          <div style={SS.sumTitle}>ציון היום: <b style={{ color: dayScore >= 70 ? T.green : T.gold }}>{dayScore}</b></div>
          <div style={SS.sumSub}>השלמת <b style={{ color: T.gold }}>{doneCount} מתוך {tasks.length}</b> ניצחונות</div>
        </div>
        <div style={SS.ptsChip}><div style={SS.ptsNum}>{totalPts.toLocaleString()}</div><div style={SS.ptsLbl}>נק׳</div></div>
      </div>

      {/* Watch-out bar */}
      {watchOut.length > 0 && (
        <div style={SS.watchBar} className="wi-rise">
          <span style={{ fontSize: 16 }}>🛡️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.red }}>היזהר היום מ:</div>
            <div style={{ fontSize: 13, color: T.soft, marginTop: 2 }}>{watchOut.join(" · ")}</div>
          </div>
        </div>
      )}

      <div style={SS.wisdom} className="wi-rise">
        <div style={SS.wisdomLabel}>השראת הבוקר</div>
        {cfg.wisdom ? <div style={SS.wisdomText}>{wisdom}</div> : (
          <div style={{ position: "relative" }}><span style={{ filter: "blur(6px)", userSelect: "none", fontSize: 17, fontWeight: 500 }}>{wisdom}</span><div style={SS.lockBadge}>🔒 נפתח ב־Ultimate</div></div>
        )}
      </div>

      {/* Summary buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
        <button onClick={() => onSummary("day")} className="wi-press" style={SS.summaryBtn}>
          <span style={{ fontSize: 18 }}>📊</span><div style={{ textAlign: "right" }}><div style={{ fontSize: 13, fontWeight: 700 }}>סיכום היום</div><div style={{ fontSize: 10.5, color: T.mute }}>גרף ומדדים</div></div>
        </button>
        <button onClick={() => onSummary("week")} className="wi-press" style={{ ...SS.summaryBtn, ...(cfg.reviews ? {} : { opacity: 0.7 }) }}>
          <span style={{ fontSize: 18 }}>📅</span><div style={{ textAlign: "right" }}><div style={{ fontSize: 13, fontWeight: 700 }}>סיכום השבוע {!cfg.reviews && "🔒"}</div><div style={{ fontSize: 10.5, color: T.mute }}>דיאגרמה מלאה</div></div>
        </button>
      </div>

      {cfg.identities && (
        <Section title="הזהויות שלי" action={{ label: "+ חדשה", onClick: onNewIdent }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {identities.map((idn, i) => <div key={idn.id} className="wi-rise" style={{ animationDelay: `${i * 0.05}s` }}><IdentityRow idn={idn} onClick={() => onEditIdent(idn)} /></div>)}
          </div>
        </Section>
      )}

      <Section title="ניצחונות הבוקר" count={`${tasks.length} משימות`}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {tasks.map((t, i) => <div key={t.id} className="wi-rise" style={{ animationDelay: `${i * 0.04}s` }}><TaskCard t={t} idMap={idMap} showPts={cfg.identities} showTag={cfg.identities} onToggle={() => onToggle(t.id)} /></div>)}
        </div>
        <button onClick={onAdd} className="wi-press" style={{ ...SS.addBtn, ...(tasks.length >= cfg.maxTasks ? SS.addBtnLocked : {}) }}>
          {tasks.length >= cfg.maxTasks ? "🔒  הגעת למקסימום היומי · שדרג" : "+  הוסף משימה"}
        </button>
      </Section>

      <div style={SS.actions}>
        <ActionTile icon="🎯" label="מצב פוקוס" sub="25 דקות, אפס הסחות" locked={!cfg.focus} accent={T.gold} onClick={onFocus} />
        <ActionTile icon="🆘" label="כפתור פאניקה" sub="יום קשה? התחל כאן" locked={!cfg.panic} accent={T.red} onClick={onPanic} />
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
        <button onClick={onMorning} className="wi-press" style={{ ...SS.replayMorning, flex: 1, marginTop: 0 }}>↻ שאלון הבוקר</button>
        <button onClick={onTestNotif} className="wi-press" style={{ ...SS.replayMorning, flex: 1, marginTop: 0 }}>🔔 הדגם התראה</button>
      </div>
      <div style={{ height: 20 }} />
    </div>
  );
}

// ───────── COACH (real AI) ─────────
function Coach({ cfg, identities, doneCount, total, streak, energy }) {
  const [msgs, setMsgs] = useState([{ role: "assistant", content: "בוקר טוב, אלוף. אני המאמן האישי שלך 🤖\nספר לי — מה במחשבות שלך היום? מה מעכב, מה מצליח?" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef();
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, loading]);

  const SYSTEM = `אתה מאמן אישי בעברית באפליקציית "בנה את הזהות המנצחת שלך". אתה מדבר בחום, בכנות ובאנרגיה מוטיבציונית לא קלישאתית. אתה משתמש בשיטות: "שיטת הטרמפ", "ניקוי מכשולים", "רק להתחיל", ובניית זהות. נהל שיחה אמיתית — הקשב, אל תחזור על מסרים, התאם את עצמך, שאל שאלות. תשובות קצרות (2-4 משפטים). הקשר: השלים ${doneCount}/${total} משימות, רצף ${streak} ימים, אנרגיה ${energy}/5, זהויות: ${identities.map((i) => i.name).join(", ")}.`;

  async function send(text) {
    const t = (text || input).trim();
    if (!t || loading) return;
    const next = [...msgs, { role: "user", content: t }];
    setMsgs(next); setInput(""); setLoading(true);
    try {
      let reply;
      if (USE_BACKEND) {
        // Connected mode: server handles RAG, memory, stats, and the API key.
        const data = await api.coachChat(t, "chat");
        reply = data.response || "סליחה, לא הצלחתי להגיב כרגע.";
      } else {
        // Demo mode: direct call (works inside this preview environment only).
        const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: SYSTEM, messages: next.map((m) => ({ role: m.role, content: m.content })) }) });
        const data = await res.json();
        reply = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n") || "סליחה, לא הצלחתי להגיב כרגע.";
      }
      setMsgs((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e) { setMsgs((m) => [...m, { role: "assistant", content: "אופס — בעיית חיבור. נסה שוב בעוד רגע." }]); } finally { setLoading(false); }
  }

  if (!cfg.coach) return (
    <div className="wi-fade" style={{ paddingTop: 8 }}>
      <div style={{ ...SS.head, marginBottom: 18 }}><div><div style={SS.greetSmall}>המאמן שלך</div><div style={SS.greetName}>מאמן AI אישי</div></div></div>
      <div style={SS.lockedFeature}><div style={{ fontSize: 48, marginBottom: 14 }}>🤖</div><div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>המאמן האישי נעול</div><div style={{ fontSize: 14, color: T.soft, lineHeight: 1.6 }}>מאמן AI אמיתי שמנהל איתך שיחה וזוכר את ההקשר — זמין במנוי פרימיום.</div></div>
    </div>
  );

  const quick = ["אני קצת תקוע היום", "אין לי אנרגיה", "סיימתי משימה!"];
  return (
    <div className="wi-fade" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ ...SS.head, marginBottom: 12 }}><div><div style={SS.greetSmall}>המאמן שלך</div><div style={SS.greetName}>שיחה חיה</div></div><div style={SS.coachAvatar}>🤖</div></div>
      <div style={SS.liveNote}>● מחובר ל-AI אמיתי</div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, overflowY: "auto", padding: "8px 2px" }} className="wi-scroll">
        {msgs.map((m, i) => <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-start" : "flex-end" }}><div style={{ ...SS.bubble, ...(m.role === "user" ? SS.bubbleMe : SS.bubbleCoach), whiteSpace: "pre-wrap" }}>{m.content}</div></div>)}
        {loading && <div style={{ display: "flex", justifyContent: "flex-end" }}><div style={{ ...SS.bubble, ...SS.bubbleCoach }}><span className="wi-typing">●●●</span></div></div>}
        <div ref={endRef} />
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "10px 0" }}>{quick.map((q) => <button key={q} onClick={() => send(q)} style={SS.quickChip} className="wi-press">{q}</button>)}</div>
      <div style={SS.inputBar}><input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="כתוב למאמן..." style={SS.input} /><button onClick={() => send()} style={SS.sendBtn} className="wi-press" disabled={loading}>↑</button></div>
    </div>
  );
}

function Habits({ cfg, readArticles, onRead }) {
  const [openId, setOpenId] = useState(null); // currently expanded article
  if (!cfg.habits) return (
    <div className="wi-fade" style={{ paddingTop: 8 }}>
      <div style={{ ...SS.head, marginBottom: 18 }}><div><div style={SS.greetSmall}>הכלים שלך</div><div style={SS.greetName}>השיטות</div></div></div>
      <div style={SS.lockedFeature}><div style={{ fontSize: 48, marginBottom: 14 }}>🧠</div><div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>השיטות נעולות</div><div style={{ fontSize: 14, color: T.soft, lineHeight: 1.6 }}>שיטות הביצוע המוכחות וספריית הידע זמינות במנוי בסיס ומעלה.</div></div>
    </div>
  );
  const readCount = readArticles?.size || 0;
  return (
    <div className="wi-fade">
      <div style={{ ...SS.head, marginBottom: 8 }}><div><div style={SS.greetSmall}>הכלים שלך</div><div style={SS.greetName}>השיטות</div></div></div>
      <p style={{ fontSize: 13, color: T.soft, lineHeight: 1.6, marginBottom: 22 }}>שלוש שיטות מוכחות שהופכות כוונות לפעולה.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {METHODS.map((m, i) => (
          <div key={i} style={{ ...SS.methodCard, borderRight: `3px solid ${m.color}` }} className="wi-rise wi-press">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}><div style={{ ...SS.methodIcon, background: `${m.color}1f` }}>{m.icon}</div><div><div style={{ fontSize: 17, fontWeight: 700 }}>{m.name}</div><div style={{ fontSize: 11, color: T.mute }}>{m.en}</div></div></div>
            <div style={{ fontSize: 13.5, color: T.soft, lineHeight: 1.55 }}>{m.desc}</div>
          </div>
        ))}
      </div>

      {/* ספריית הידע */}
      <div style={{ marginTop: 32 }}>
        <div style={SS.libHeader} className="wi-rise">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 20 }}>📚</span>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>חוברת קטעים ללמידה</h2>
            </div>
            <div style={{ fontSize: 12, color: T.mute }}>מחקרים וטיפים קצרים · נקודות על כל קריאה</div>
          </div>
          <div style={SS.libBadge}>{readCount}/{LIBRARY.length}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
          {LIBRARY.map((a, i) => {
            const isRead = readArticles?.has(a.id);
            const isOpen = openId === a.id;
            return (
              <div key={a.id} className="wi-rise" style={{ animationDelay: `${i * 0.04}s` }}>
                <button onClick={() => setOpenId(isOpen ? null : a.id)} className="wi-press" style={{ ...SS.libCard, ...(isRead ? SS.libCardRead : {}) }}>
                  <div style={{ ...SS.libIcon, background: isRead ? T.greenDim : T.goldDim }}>{a.icon}</div>
                  <div style={{ flex: 1, minWidth: 0, textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3, color: isRead ? T.soft : T.text }}>{a.title}</div>
                    <div style={{ fontSize: 11, color: T.mute, display: "flex", gap: 8 }}>
                      <span>{a.cat}</span><span>·</span><span>{a.min} דק׳ קריאה</span><span>·</span><span style={{ color: isRead ? T.green : T.gold, fontWeight: 700 }}>+{a.pts}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 14, color: T.mute, transition: "transform 0.2s", transform: isOpen ? "rotate(90deg)" : "rotate(0)" }}>‹</span>
                </button>
                {isOpen && (
                  <div style={SS.libBody} className="wi-fade">
                    <p style={{ fontSize: 14, lineHeight: 1.75, color: T.text, marginBottom: 14, textAlign: "right" }}>{a.body}</p>
                    {isRead ? (
                      <div style={SS.libReadBadge}>✓ סימנת כנקרא · +{a.pts} נקודות הוענקו</div>
                    ) : (
                      <button onClick={(e) => { e.stopPropagation(); onRead(a); }} className="wi-press" style={SS.libReadBtn}>סמן כנקרא · +{a.pts} נקודות</button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ height: 20 }} />
    </div>
  );
}

function Journey({ cfg, totalPts, streak }) {
  const maxLvl = Math.max(...JOURNEY.map((j) => j.level));
  return (
    <div className="wi-fade">
      <div style={{ ...SS.head, marginBottom: 18 }}><div><div style={SS.greetSmall}>הסיפור שלך</div><div style={SS.greetName}>מסע הזהות</div></div></div>
      <div style={SS.journeyStats}><JStat num={totalPts.toLocaleString()} lbl="נקודות" /><JStat num={streak} lbl="ימי רצף" /><JStat num="16" lbl="רמה" /></div>
      <Section title="קו הזמן">
        <div style={SS.timeline} className="wi-rise"><div style={SS.tlChart}>{JOURNEY.map((j, i) => (<div key={i} style={SS.tlCol}><div style={SS.tlBarWrap}><div className="wi-bar" style={{ ...SS.tlBar, height: `${(j.level / maxLvl) * 100}%`, animationDelay: `${i * 0.08}s`, background: i === JOURNEY.length - 1 ? T.gold : T.line2 }} /></div><div style={SS.tlLvl}>{j.level}</div><div style={SS.tlMonth}>{j.month}</div></div>))}</div></div>
      </Section>
      <Section title="ההישגים שלי">
        <div style={SS.achGrid}>{ACHIEVEMENTS.map((a, i) => (<div key={i} style={{ ...SS.achCard, ...(a.got ? {} : SS.achLocked) }} className="wi-rise"><div style={{ fontSize: 28, filter: a.got ? "none" : "grayscale(1) opacity(0.4)" }}>{a.icon}</div><div style={{ fontSize: 11, color: a.got ? T.text : T.mute, marginTop: 6, fontWeight: 600 }}>{a.name}</div>{!a.got && <div style={SS.achLock}>🔒</div>}</div>))}</div>
      </Section>
      <div style={{ height: 20 }} />
    </div>
  );
}
function JStat({ num, lbl }) { return <div style={SS.jStat} className="wi-rise"><div style={{ fontSize: 24, fontWeight: 800 }}>{num}</div><div style={{ fontSize: 11, color: T.soft, marginTop: 3 }}>{lbl}</div></div>; }

function Stats({ cfg, identities, energyLog }) {
  const days = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'"];
  return (
    <div className="wi-fade">
      <div style={{ ...SS.head, marginBottom: 18 }}><div><div style={SS.greetSmall}>הביצועים שלך</div><div style={SS.greetName}>סקירה שבועית</div></div></div>
      <div style={SS.aiCard} className="wi-rise">
        <div style={SS.aiLabel}>✦ ניתוח אנרגיה · AI</div>
        {cfg.coach ? <div style={SS.aiText}>האנרגיה שלך צונחת בימי ג׳ (2/5). נסה <b style={{ color: T.gold }}>"ניקוי מכשולים"</b> — הזז את המשימות הקשות לבוקר.</div> : (<div style={{ position: "relative" }}><span style={{ filter: "blur(6px)" }}>האנרגיה שלך צונחת בימי שלישי. נסה ניקוי מכשולים.</span><div style={SS.lockBadge}>🔒 נפתח ב־Ultimate</div></div>)}
      </div>
      <Section title="רמת אנרגיה (1-5)">
        <div style={SS.chartCard} className="wi-rise"><div style={SS.bars}>{energyLog.map((v, i) => (<div key={i} style={SS.barCol}><div style={SS.barTrack}><div className="wi-bar" style={{ ...SS.barFill, height: `${(v / 5) * 100}%`, animationDelay: `${i * 0.06}s`, background: ENERGY_COLORS[v] }} /></div><span style={SS.barLbl}>{days[i]}</span></div>))}</div></div>
      </Section>
      <Section title="התקדמות זהויות"><div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{identities.map((idn) => <IdentityRow key={idn.id} idn={idn} />)}</div></Section>
      <div style={{ height: 20 }} />
    </div>
  );
}

function IdentityEditor({ base, onClose, onSave }) {
  const [name, setName] = useState(base?.name || "");
  const [icon, setIcon] = useState(base?.icon || "🎯");
  const colors = [T.gold, T.green, T.blue, T.violet, T.red];
  const [color, setColor] = useState(base?.color || T.gold);
  return (
    <Sheet onClose={onClose}>
      <h2 style={SS.modalTitle}>{base ? "ערוך זהות" : "זהות חדשה"}</h2>
      <p style={SS.modalDesc}>מי האדם שאתה בונה?</p>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="לדוגמה: יזם, אמן, אבא מעולה" style={{ ...SS.fieldInput, marginBottom: 16 }} />
      <div style={{ fontSize: 12, color: T.soft, textAlign: "right", marginBottom: 8 }}>אייקון</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>{ICON_POOL.map((ic) => <button key={ic} onClick={() => setIcon(ic)} className="wi-press" style={{ ...SS.iconPick, ...(icon === ic ? SS.iconPickOn : {}) }}>{ic}</button>)}</div>
      <div style={{ fontSize: 12, color: T.soft, textAlign: "right", marginBottom: 8 }}>צבע</div>
      <div style={{ display: "flex", gap: 10, marginBottom: 20, justifyContent: "center" }}>{colors.map((c) => <button key={c} onClick={() => setColor(c)} className="wi-press" style={{ width: 38, height: 38, borderRadius: "50%", background: c, border: color === c ? `3px solid ${T.text}` : "3px solid transparent", cursor: "pointer" }} />)}</div>
      <button disabled={!name.trim()} onClick={() => onSave({ ...(base || {}), name: name.trim(), icon, color })} style={{ ...SS.primaryBtn, ...(name.trim() ? {} : { opacity: 0.4 }) }} className="wi-press">{base ? "שמור שינויים" : "צור זהות"}</button>
      <button onClick={onClose} style={SS.modalClose}>ביטול</button>
    </Sheet>
  );
}

// ───────── Shared ─────────
function Sheet({ children, onClose, bg, wide }) {
  return (
    <div style={SS.modalBack} onClick={onClose} className="wi-fade">
      <div style={{ ...SS.modal, ...(bg ? { background: bg } : {}) }} onClick={(e) => e.stopPropagation()} className="wi-sheet">
        <div style={SS.modalHandle} />
        {children}
      </div>
    </div>
  );
}
function Section({ title, count, action, children }) {
  return (
    <div style={{ marginTop: 26 }}>
      <div style={SS.secHead}><h2 style={SS.secTitle}>{title}</h2>{count && <span style={SS.secCount}>{count}</span>}{action && <button onClick={action.onClick} style={SS.secAction} className="wi-press">{action.label}</button>}</div>
      {children}
    </div>
  );
}
function Ring({ pct }) {
  const r = 26, c = 2 * Math.PI * r, off = c - (pct / 100) * c;
  return (
    <div style={{ position: "relative", width: 60, height: 60, flexShrink: 0 }}>
      <svg width="60" height="60" style={{ transform: "rotate(-90deg)" }}><circle cx="30" cy="30" r={r} fill="none" stroke={T.line2} strokeWidth="5" /><circle cx="30" cy="30" r={r} fill="none" stroke={T.gold} strokeWidth="5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)" }} /></svg>
      <div style={SS.ringText}>{pct}%</div>
    </div>
  );
}
function IdentityRow({ idn, onClick }) {
  const pct = Math.round((idn.pts / idn.max) * 100);
  return (
    <div style={SS.idRow} className="wi-press" onClick={onClick}>
      <div style={SS.idIcon}>{idn.icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}><div style={SS.idName}>{idn.name}</div><div style={SS.idTrack}><div style={{ ...SS.idFill, width: `${pct}%`, background: idn.color }} /></div></div>
      <div style={{ textAlign: "left", flexShrink: 0 }}><div style={{ fontSize: 18, fontWeight: 800 }}>{idn.level}</div><div style={{ fontSize: 10, color: T.mute, marginTop: 1 }}>{idn.pts}/{idn.max}</div></div>
    </div>
  );
}
function TaskCard({ t, idMap, showPts, showTag, onToggle }) {
  const idn = t.identity ? idMap[t.identity] : null;
  return (
    <div onClick={onToggle} className="wi-press" style={{ ...SS.task, ...(t.done ? SS.taskDone : {}), ...(t.critical ? SS.taskCrit : {}) }}>
      <div style={{ ...SS.check, ...(t.done ? SS.checkDone : {}) }}>{t.done && "✓"}</div>
      <div style={{ ...SS.taskIcon, ...(t.critical ? { background: T.goldDim } : {}) }}>{t.emoji || idn?.icon || "•"}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...SS.taskTitle, ...(t.done ? { textDecoration: "line-through", color: T.soft } : {}) }}>{t.title}</div>
        <div style={SS.taskMeta}>{showTag && idn && <span style={{ color: T.soft, fontWeight: 600 }}>{idn.name}</span>}{showTag && idn && <span>·</span>}<span>{t.time}</span></div>
        {t.note && <div style={{ fontSize: 11, color: T.red, marginTop: 4 }}>⚠️ {t.note}</div>}
      </div>
      {showPts && <div style={{ ...SS.taskPts, color: t.done ? T.green : T.gold }}>+{t.pts}</div>}
    </div>
  );
}
function ActionTile({ icon, label, sub, locked, accent, onClick }) {
  return (
    <button onClick={onClick} className="wi-press" style={{ ...SS.action, ...(locked ? { opacity: 0.6 } : {}) }}>
      {locked && <span style={SS.actionLock}>🔒</span>}
      <div style={{ ...SS.actionIcon, background: locked ? T.bg2 : `${accent}1f` }}>{icon}</div>
      <div><div style={SS.actionLabel}>{label}</div><div style={SS.actionSub}>{sub}</div></div>
    </button>
  );
}
function BottomNav({ screen, go }) {
  const items = [{ k: "home", icon: "⌂", label: "בית", gate: null }, { k: "coach", icon: "🤖", label: "מאמן", gate: "coach" }, { k: "habits", icon: "🧠", label: "שיטות", gate: "habits" }, { k: "journey", icon: "📈", label: "מסע", gate: "journey" }, { k: "stats", icon: "◴", label: "סקירות", gate: "reviews" }];
  return <div style={SS.nav}>{items.map((it) => <button key={it.k} onClick={() => go(it.k, it.gate)} style={{ ...SS.navBtn, ...(screen === it.k ? SS.navBtnOn : {}) }}><span style={{ fontSize: 16 }}>{it.icon}</span><span style={{ fontSize: 9, fontWeight: 600 }}>{it.label}</span></button>)}</div>;
}
function Paywall({ kind, onClose, onPick }) {
  const copy = {
    task: { icon: "🚀", title: "הגעת לפסגה של היום", desc: "מנצחים אמיתיים לא עוצרים ב-3 משימות. שדרג ופתח את מלוא העוצמה." },
    panic: { icon: "🆘", title: "ימים קשים — כאן ננצח", desc: "כפתור הפאניקה זמין במנוי פרימיום." },
    focus: { icon: "🎯", title: "פוקוס מוחלט", desc: "מצב הפוקוס הוא תכונת פרימיום." },
    reviews: { icon: "📊", title: "הסקירות נעולות", desc: "סיכום שבועי וניתוח AI זמינים במנוי בסיס ומעלה." },
    coach: { icon: "🤖", title: "המאמן האישי נעול", desc: "מאמן ה-AI זמין רק במנוי פרימיום." },
    journey: { icon: "📈", title: "מסע הזהות נעול", desc: "קו הזמן וההישגים זמינים במנוי בסיס ומעלה." },
    habits: { icon: "🧠", title: "השיטות נעולות", desc: "שיטות הביצוע זמינות במנוי בסיס ומעלה." },
    identity: { icon: "🎭", title: "מיפוי זהויות נעול", desc: "יצירת זהויות זמינה במנוי בסיס ומעלה." },
  }[kind];
  return (
    <Sheet onClose={onClose}>
      <div style={SS.modalIcon}>{copy.icon}</div>
      <h2 style={SS.modalTitle}>{copy.title}</h2>
      <p style={SS.modalDesc}>{copy.desc}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
        <PlanRow name="בסיס" desc="10 משימות · זהויות · שיטות · מסע" price="20" onClick={() => onPick("core")} />
        <PlanRow name="פרימיום" desc="ללא הגבלה משימות · מאמן AI · פוקוס · פאניקה" price="50" featured onClick={() => onPick("ultimate")} />
      </div>
      <button style={SS.modalClose} onClick={onClose}>אולי מאוחר יותר</button>
    </Sheet>
  );
}
function PlanRow({ name, desc, price, featured, onClick }) {
  return (
    <div onClick={onClick} className="wi-press" style={{ ...SS.plan, ...(featured ? SS.planFeat : {}) }}>
      {featured && <span style={SS.planBadge}>מומלץ</span>}
      <div><div style={{ fontSize: 16, fontWeight: 800 }}>{name}</div><div style={{ fontSize: 11, color: T.soft, marginTop: 2 }}>{desc}</div></div>
      <div style={{ fontSize: 22, fontWeight: 800 }}>{price}<span style={{ fontSize: 11, color: T.soft, fontWeight: 500 }}>₪/ח׳</span></div>
    </div>
  );
}
function FocusScreen({ mode, tasks, onExit, onComplete }) {
  const [phase, setPhase] = useState(mode === "panic" ? "ask" : "run");
  const [chosen, setChosen] = useState(null);
  const [secs, setSecs] = useState(25 * 60);
  const ref = useRef();
  useEffect(() => { if (phase !== "run") return; ref.current = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000); return () => clearInterval(ref.current); }, [phase]);
  const mm = String(Math.floor(secs / 60)).padStart(2, "0"), ss = String(secs % 60).padStart(2, "0");
  const open = tasks.filter((t) => !t.done);
  if (phase === "ask") return (
    <div style={SS.focusBack} className="wi-fade">
      <div style={SS.panicAsk} className="wi-rise">
        <div style={{ fontSize: 40, marginBottom: 16 }}>🆘</div>
        <div style={SS.panicQ}>מהי הפעולה האחת<br />שהופכת את היום לניצחון?</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", marginTop: 24 }}>{open.map((t) => <button key={t.id} onClick={() => setChosen(t)} className="wi-press" style={{ ...SS.panicOpt, ...(chosen?.id === t.id ? SS.panicOptOn : {}) }}>{t.title}</button>)}</div>
        <button disabled={!chosen} onClick={() => setPhase("run")} style={{ ...SS.primaryBtn, marginTop: 22, ...(chosen ? {} : { opacity: 0.4 }) }} className="wi-press">התחל פוקוס מלא →</button>
        <button style={SS.focusExit} onClick={onExit}>ביטול</button>
      </div>
    </div>
  );
  return (
    <div style={SS.focusBack} className="wi-fade">
      <div style={SS.focusEyebrow}>{mode === "panic" ? "מצב הצלה פעיל" : "מצב פוקוס פעיל"}</div>
      <div style={SS.focusTask}>{chosen ? <span style={{ color: T.gold }}>{chosen.title}</span> : <><span style={{ color: T.gold }}>משימה אחת.</span><br />שום דבר אחר לא קיים.</>}</div>
      <div style={SS.timer}>{mm}:{ss}</div>
      <div style={SS.timerLbl}>זמן נותר</div>
      <div style={{ display: "flex", gap: 10, marginTop: 40 }}>{chosen && <button style={SS.focusDone} onClick={() => onComplete(chosen.id)} className="wi-press">✓ סיימתי</button>}<button style={SS.focusExit} onClick={onExit}>{mode === "panic" ? "יציאה" : "סיים פוקוס"}</button></div>
    </div>
  );
}
function FontLink() { return <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />; }

const FONT = "'Heebo', -apple-system, sans-serif";
const SS = {
  root: { minHeight: "100vh", background: T.bg, fontFamily: FONT, color: T.text, display: "flex", justifyContent: "center" },
  frame: { width: "100%", maxWidth: 440, height: "100vh", minHeight: 600, position: "relative", display: "flex", flexDirection: "column", background: T.bg, boxShadow: "0 0 80px rgba(0,0,0,0.5)" },
  scroll: { flex: 1, overflowY: "auto", padding: "70px 20px 96px" },
  tierBar: { position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", zIndex: 60, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 },
  tierHint: { fontSize: 8, letterSpacing: 2, color: T.mute, textTransform: "uppercase" },
  tierGroup: { display: "flex", gap: 2, background: "rgba(16,18,22,0.92)", backdropFilter: "blur(16px)", border: `1px solid ${T.line2}`, borderRadius: 100, padding: 4 },
  tierBtn: { border: "none", background: "transparent", color: T.soft, padding: "6px 15px", borderRadius: 100, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: FONT, transition: "all 0.25s" },
  tierBtnOn: { background: T.gold, color: "#1a1407" },
  head: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  greetSmall: { fontSize: 13, color: T.soft, fontWeight: 500, marginBottom: 3 },
  greetName: { fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px" },
  streak: { display: "flex", alignItems: "center", gap: 6, background: T.card, border: `1px solid ${T.line}`, padding: "8px 14px", borderRadius: 100, fontSize: 14 },
  summary: { display: "flex", alignItems: "center", gap: 16, background: T.card, border: `1px solid ${T.line}`, borderRadius: 18, padding: 18, marginBottom: 14 },
  ringText: { position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 15, fontWeight: 800 },
  sumTitle: { fontSize: 15, fontWeight: 700, marginBottom: 3 },
  sumSub: { fontSize: 13, color: T.soft },
  ptsChip: { textAlign: "center", paddingRight: 14, borderRight: `1px solid ${T.line}` },
  ptsNum: { fontSize: 19, fontWeight: 800, color: T.gold, lineHeight: 1 },
  ptsLbl: { fontSize: 9, color: T.mute, marginTop: 3 },
  watchBar: { display: "flex", alignItems: "center", gap: 12, background: T.redDim, border: `1px solid rgba(224,86,107,0.25)`, borderRadius: 14, padding: "12px 14px", marginBottom: 14 },
  wisdom: { background: `linear-gradient(135deg, ${T.card}, ${T.bg2})`, border: `1px solid ${T.line}`, borderRadius: 18, padding: "18px 20px" },
  wisdomLabel: { fontSize: 10, fontWeight: 700, letterSpacing: 2, color: T.gold, textTransform: "uppercase", marginBottom: 8 },
  wisdomText: { fontSize: 17, fontWeight: 500, lineHeight: 1.5 },
  lockBadge: { position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 12, fontWeight: 600, color: T.gold },
  summaryBtn: { display: "flex", alignItems: "center", gap: 10, background: T.card, border: `1px solid ${T.line}`, borderRadius: 14, padding: "14px 14px", cursor: "pointer", fontFamily: FONT, color: T.text },
  replayMorning: { marginTop: 18, width: "100%", padding: 12, background: "transparent", border: `1px solid ${T.line}`, borderRadius: 12, color: T.mute, fontFamily: FONT, fontSize: 12.5, fontWeight: 600, cursor: "pointer" },
  secHead: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 10 },
  secTitle: { fontSize: 16, fontWeight: 700, letterSpacing: "-0.3px", margin: 0, marginLeft: "auto" },
  secCount: { fontSize: 12, color: T.mute, fontWeight: 600 },
  secAction: { background: T.goldDim, border: "none", color: T.gold, fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 100, cursor: "pointer", fontFamily: FONT },
  idRow: { display: "flex", alignItems: "center", gap: 13, background: T.card, border: `1px solid ${T.line}`, borderRadius: 14, padding: "13px 14px", cursor: "pointer" },
  idIcon: { width: 40, height: 40, borderRadius: 11, display: "grid", placeItems: "center", fontSize: 20, flexShrink: 0, border: `1px solid ${T.line}`, background: T.bg2 },
  idName: { fontSize: 14, fontWeight: 700, marginBottom: 7 },
  idTrack: { height: 5, background: T.bg2, borderRadius: 100, overflow: "hidden" },
  idFill: { height: "100%", borderRadius: 100, transition: "width 0.9s cubic-bezier(0.4,0,0.2,1)" },
  task: { display: "flex", alignItems: "center", gap: 13, background: T.card, border: `1px solid ${T.line}`, borderRadius: 14, padding: "13px 14px", cursor: "pointer", position: "relative", overflow: "hidden", transition: "background 0.2s" },
  taskCrit: { borderRight: `2px solid ${T.gold}` },
  taskDone: { background: T.greenDim, borderColor: "transparent" },
  check: { width: 25, height: 25, borderRadius: "50%", border: `2px solid ${T.mute}`, flexShrink: 0, display: "grid", placeItems: "center", fontSize: 13, fontWeight: 800, color: "#fff", transition: "all 0.2s" },
  checkDone: { background: T.green, borderColor: T.green },
  taskIcon: { width: 40, height: 40, borderRadius: 11, background: T.bg2, display: "grid", placeItems: "center", fontSize: 20, flexShrink: 0 },
  taskTitle: { fontSize: 15, fontWeight: 600, marginBottom: 3, lineHeight: 1.2 },
  taskMeta: { fontSize: 12, color: T.mute, display: "flex", gap: 7, alignItems: "center" },
  taskPts: { fontSize: 14, fontWeight: 800, flexShrink: 0 },
  addBtn: { marginTop: 12, width: "100%", padding: 14, background: "transparent", border: `1.5px dashed ${T.line2}`, borderRadius: 14, color: T.soft, fontFamily: FONT, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.25s" },
  addBtnLocked: { borderColor: "rgba(224,86,107,0.4)", color: T.red, borderStyle: "solid", background: T.redDim },
  actions: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 26 },
  action: { display: "flex", flexDirection: "column", gap: 11, background: T.card, border: `1px solid ${T.line}`, borderRadius: 16, padding: "18px 16px", cursor: "pointer", position: "relative", textAlign: "right", fontFamily: FONT, color: T.text },
  actionLock: { position: "absolute", top: 13, left: 13, fontSize: 13, opacity: 0.6 },
  actionIcon: { width: 44, height: 44, borderRadius: 12, display: "grid", placeItems: "center", fontSize: 22 },
  actionLabel: { fontSize: 15, fontWeight: 700 },
  actionSub: { fontSize: 11, color: T.mute, marginTop: 3 },
  coachAvatar: { width: 46, height: 46, borderRadius: 13, background: T.goldDim, display: "grid", placeItems: "center", fontSize: 24 },
  liveNote: { fontSize: 11, color: T.green, textAlign: "center", padding: "6px 0", borderBottom: `1px solid ${T.line}`, marginBottom: 6, fontWeight: 600 },
  lockedFeature: { background: T.card, border: `1px solid ${T.line}`, borderRadius: 18, padding: "40px 24px", textAlign: "center" },
  bubble: { maxWidth: "82%", padding: "11px 14px", borderRadius: 16, fontSize: 14, lineHeight: 1.5 },
  bubbleMe: { background: T.gold, color: "#1a1407", borderTopRightRadius: 4, fontWeight: 500 },
  bubbleCoach: { background: T.card, border: `1px solid ${T.line}`, color: T.text, borderTopLeftRadius: 4 },
  quickChip: { padding: "8px 12px", background: T.card, border: `1px solid ${T.line2}`, borderRadius: 100, color: T.soft, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: FONT },
  inputBar: { display: "flex", gap: 8, alignItems: "center" },
  input: { flex: 1, background: T.card, border: `1px solid ${T.line2}`, borderRadius: 100, padding: "12px 16px", color: T.text, fontFamily: FONT, fontSize: 14, outline: "none" },
  sendBtn: { width: 42, height: 42, borderRadius: "50%", background: T.gold, border: "none", color: "#1a1407", fontSize: 18, fontWeight: 800, cursor: "pointer", flexShrink: 0 },
  methodCard: { background: T.card, border: `1px solid ${T.line}`, borderRadius: 16, padding: 18 },
  libHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", background: `linear-gradient(135deg, ${T.goldDim}, ${T.card})`, border: `1px solid rgba(201,168,74,0.18)`, borderRadius: 14, padding: "14px 16px" },
  libBadge: { background: T.gold, color: "#1a1407", fontSize: 12, fontWeight: 800, padding: "6px 12px", borderRadius: 100 },
  libCard: { width: "100%", display: "flex", alignItems: "center", gap: 12, background: T.card, border: `1px solid ${T.line}`, borderRadius: 14, padding: "12px 14px", cursor: "pointer", fontFamily: FONT, color: T.text },
  libCardRead: { background: T.greenDim, borderColor: "rgba(82,201,138,0.18)" },
  libIcon: { width: 38, height: 38, borderRadius: 10, display: "grid", placeItems: "center", fontSize: 18, flexShrink: 0 },
  libBody: { background: T.bg2, border: `1px solid ${T.line}`, borderRadius: 14, padding: "16px 18px", marginTop: 8 },
  libReadBtn: { width: "100%", padding: 12, background: T.gold, color: "#1a1407", border: "none", borderRadius: 10, fontFamily: FONT, fontSize: 14, fontWeight: 800, cursor: "pointer" },
  libReadBadge: { padding: 10, background: T.greenDim, color: T.green, borderRadius: 10, fontSize: 13, fontWeight: 700, textAlign: "center" },
  methodIcon: { width: 44, height: 44, borderRadius: 12, display: "grid", placeItems: "center", fontSize: 22 },
  journeyStats: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 4 },
  jStat: { background: T.card, border: `1px solid ${T.line}`, borderRadius: 14, padding: "16px 8px", textAlign: "center" },
  timeline: { background: T.card, border: `1px solid ${T.line}`, borderRadius: 18, padding: "20px 14px" },
  tlChart: { display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: 140, gap: 10 },
  tlCol: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%" },
  tlBarWrap: { flex: 1, width: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center" },
  tlBar: { width: "70%", borderRadius: "6px 6px 0 0", minHeight: 6 },
  tlLvl: { fontSize: 14, fontWeight: 800, marginTop: 6 },
  tlMonth: { fontSize: 10, color: T.mute, marginTop: 2 },
  achGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 },
  achCard: { background: T.card, border: `1px solid ${T.line}`, borderRadius: 14, padding: "16px 8px", textAlign: "center", position: "relative" },
  achLocked: { opacity: 0.7 },
  achLock: { position: "absolute", top: 8, left: 8, fontSize: 11 },
  aiCard: { background: `linear-gradient(135deg, ${T.goldDim}, transparent)`, border: `1px solid rgba(201,168,74,0.25)`, borderRadius: 18, padding: 18 },
  aiLabel: { fontSize: 11, fontWeight: 700, color: T.gold, letterSpacing: 1, marginBottom: 8 },
  aiText: { fontSize: 14, lineHeight: 1.55, color: T.text },
  chartCard: { background: T.card, border: `1px solid ${T.line}`, borderRadius: 18, padding: "20px 16px" },
  bars: { display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: 120, gap: 8 },
  barCol: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%" },
  barTrack: { flex: 1, width: "100%", display: "flex", alignItems: "flex-end" },
  barFill: { width: "100%", borderRadius: 6, minHeight: 4 },
  barLbl: { fontSize: 11, color: T.mute, fontWeight: 600 },
  metricRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 },
  metric: { background: T.card, border: `1px solid ${T.line}`, borderRadius: 14, padding: "14px 8px", textAlign: "center" },
  sumTaskRow: { display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: `1px solid ${T.line}` },
  insightBox: { background: T.goldDim, borderRadius: 12, padding: "12px 14px", fontSize: 13, color: T.text, lineHeight: 1.5, marginTop: 14, textAlign: "right" },
  nav: { position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 2, background: "rgba(16,18,22,0.94)", backdropFilter: "blur(16px)", border: `1px solid ${T.line2}`, borderRadius: 100, padding: 6, zIndex: 50, boxShadow: "0 16px 40px rgba(0,0,0,0.5)" },
  navBtn: { display: "flex", flexDirection: "column", alignItems: "center", gap: 2, width: 56, padding: "8px 0", borderRadius: 100, border: "none", background: "transparent", color: T.soft, cursor: "pointer", fontFamily: FONT, transition: "all 0.2s" },
  navBtnOn: { background: T.goldDim, color: T.gold },
  modalBack: { position: "fixed", inset: 0, background: "rgba(5,6,8,0.78)", backdropFilter: "blur(10px)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 200 },
  modal: { width: "100%", maxWidth: 440, background: T.bg2, borderTop: `1px solid ${T.line2}`, borderRadius: "26px 26px 0 0", padding: "22px 22px 26px", textAlign: "center", maxHeight: "90vh", overflowY: "auto" },
  modalHandle: { width: 38, height: 4, background: T.line2, borderRadius: 100, margin: "0 auto 18px" },
  modalIcon: { width: 58, height: 58, borderRadius: 16, background: T.goldDim, display: "grid", placeItems: "center", fontSize: 28, margin: "0 auto 14px" },
  modalTitle: { fontSize: 22, fontWeight: 800, lineHeight: 1.2, marginBottom: 8 },
  modalDesc: { fontSize: 14, color: T.soft, lineHeight: 1.5, marginBottom: 16, padding: "0 6px" },
  plan: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 16px", border: `1.5px solid ${T.line}`, borderRadius: 14, cursor: "pointer", textAlign: "right", position: "relative" },
  planFeat: { borderColor: T.gold, background: T.goldDim },
  planBadge: { position: "absolute", top: -9, right: 14, background: T.gold, color: "#1a1407", fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 100 },
  modalClose: { background: "transparent", border: "none", color: T.mute, fontSize: 14, fontWeight: 600, cursor: "pointer", padding: 8, fontFamily: FONT, marginTop: 4 },
  primaryBtn: { width: "100%", padding: 15, background: T.gold, color: "#1a1407", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: FONT },
  fieldInput: { width: "100%", background: T.card, border: `1px solid ${T.line2}`, borderRadius: 12, padding: "12px 14px", color: T.text, fontFamily: FONT, fontSize: 14, outline: "none", textAlign: "right" },
  pillSelect: { padding: "8px 12px", background: T.card, border: `1px solid ${T.line2}`, borderRadius: 100, color: T.soft, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: FONT },
  pillSelectOn: { background: T.goldDim, borderColor: T.gold, color: T.gold },
  stepDots: { display: "flex", gap: 6, justifyContent: "center", marginBottom: 16 },
  stepDot: { width: 7, height: 7, borderRadius: "50%", background: T.line2, transition: "all 0.3s" },
  stepDotOn: { width: 20, background: T.gold },
  morningOpt: { display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", background: T.card, border: `1.5px solid ${T.line}`, borderRadius: 12, cursor: "pointer", fontFamily: FONT, color: T.text },
  winRow: { display: "flex", gap: 10, alignItems: "flex-start", background: T.card, border: `1px solid ${T.line}`, borderRadius: 14, padding: 12 },
  winNum: { width: 26, height: 26, borderRadius: "50%", background: T.goldDim, color: T.gold, display: "grid", placeItems: "center", fontSize: 13, fontWeight: 800, flexShrink: 0, marginTop: 8 },
  morningOptOn: { borderColor: T.gold, background: T.goldDim },
  morningCheck: { width: 22, height: 22, borderRadius: "50%", border: `2px solid ${T.mute}`, flexShrink: 0, display: "grid", placeItems: "center", fontSize: 12, fontWeight: 800, color: "#1a1407" },
  morningCheckOn: { background: T.gold, borderColor: T.gold },
  triggerChip: { display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", background: T.card, border: `1.5px solid ${T.line}`, borderRadius: 100, color: T.soft, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: FONT },
  triggerChipOn: { borderColor: T.red, background: T.redDim, color: T.red },
  iconPick: { width: 42, height: 42, borderRadius: 11, background: T.card, border: `1px solid ${T.line2}`, fontSize: 20, cursor: "pointer" },
  iconPickOn: { background: T.goldDim, border: `1.5px solid ${T.gold}` },
  focusBack: { position: "fixed", inset: 0, background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 32, backgroundImage: `radial-gradient(ellipse at center, ${T.goldDim}, transparent 65%)` },
  focusEyebrow: { fontSize: 12, fontWeight: 700, letterSpacing: 3, color: T.gold, textTransform: "uppercase", marginBottom: 28 },
  focusTask: { fontSize: 30, fontWeight: 700, textAlign: "center", lineHeight: 1.25, marginBottom: 44, maxWidth: 340 },
  timer: { fontSize: 110, fontWeight: 800, letterSpacing: "-4px", lineHeight: 1 },
  timerLbl: { fontSize: 12, color: T.mute, fontWeight: 500, letterSpacing: 2, textTransform: "uppercase", marginTop: 8 },
  focusExit: { background: "transparent", border: `1px solid ${T.line2}`, color: T.soft, padding: "13px 26px", borderRadius: 100, fontFamily: FONT, fontSize: 13, fontWeight: 700, cursor: "pointer" },
  focusDone: { background: T.green, border: "none", color: "#06281a", padding: "13px 26px", borderRadius: 100, fontFamily: FONT, fontSize: 13, fontWeight: 800, cursor: "pointer" },
  panicAsk: { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", maxWidth: 360, width: "100%" },
  panicQ: { fontSize: 24, fontWeight: 700, lineHeight: 1.3 },
  panicOpt: { padding: "14px 16px", background: T.card, border: `1.5px solid ${T.line}`, borderRadius: 12, color: T.text, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: FONT, textAlign: "right" },
  panicOptOn: { borderColor: T.gold, background: T.goldDim },
  toast: { position: "fixed", bottom: 88, left: "50%", transform: "translateX(-50%)", background: T.green, color: "#06281a", padding: "12px 22px", borderRadius: 100, fontSize: 14, fontWeight: 800, zIndex: 400, boxShadow: "0 10px 30px rgba(82,201,138,0.3)" },
  notifBanner: { position: "fixed", top: 56, left: "50%", transform: "translateX(-50%)", width: "calc(100% - 32px)", maxWidth: 410, display: "flex", alignItems: "center", gap: 12, background: "rgba(22,24,30,0.97)", backdropFilter: "blur(20px)", border: `1px solid ${T.line2}`, borderRadius: 16, padding: "13px 15px", zIndex: 500, boxShadow: "0 20px 50px rgba(0,0,0,0.6)", cursor: "pointer" },
  notifIcon: { width: 38, height: 38, borderRadius: 10, background: T.goldDim, display: "grid", placeItems: "center", fontSize: 19, flexShrink: 0 },
};

const CSS = `
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  .wi-scroll::-webkit-scrollbar { width: 0; }
  .wi-press { transition: transform 0.12s ease, background 0.2s ease; }
  .wi-press:active { transform: scale(0.97); }
  .wi-fade { animation: wiFade 0.4s ease; }
  @keyframes wiFade { from { opacity: 0; } to { opacity: 1; } }
  .wi-rise { animation: wiRise 0.55s cubic-bezier(0.16,1,0.3,1) backwards; }
  @keyframes wiRise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
  .wi-sheet { animation: wiSheet 0.4s cubic-bezier(0.16,1,0.3,1); }
  @keyframes wiSheet { from { transform: translateY(100%); } to { transform: translateY(0); } }
  .wi-bar { animation: wiBar 0.7s cubic-bezier(0.16,1,0.3,1) backwards; transform-origin: bottom; }
  @keyframes wiBar { from { transform: scaleY(0); } to { transform: scaleY(1); } }
  .wi-toast { animation: wiToast 0.3s ease; }
  @keyframes wiToast { from { opacity: 0; transform: translate(-50%, 10px); } to { opacity: 1; transform: translate(-50%, 0); } }
  .wi-typing { letter-spacing: 2px; animation: wiBlink 1.2s ease infinite; }
  @keyframes wiBlink { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }
  .wi-notif { animation: wiNotif 0.5s cubic-bezier(0.16,1,0.3,1); }
  @keyframes wiNotif { from { opacity: 0; transform: translate(-50%, -20px); } to { opacity: 1; transform: translate(-50%, 0); } }
  input::placeholder { color: ${T.mute}; }
`;
