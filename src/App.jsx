import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { supabase } from "./supabaseClient";

const ORG_KEY = "tutorias-org-v15";
const SESSION_KEY = "tutorias-sesion-v15";
const READ_KEY = "tutorias-leidas-v15";
const PRES = "Presencial";
const LINEA = "En línea";

/* ----------------------------- estilos ---------------------------- */
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');
    .tut-app * { box-sizing:border-box; }
    .tut-app {
      --bg:#EEF1F6; --surface:#fff; --ink:#16243D; --ink-soft:#5A6B86;
      --primary:#0F766E; --primary-dark:#0B5A54; --accent:#C2620A; --accent-soft:#FCEFE0;
      --line:#DCE2EC; --ok-soft:#E5F2F0; --pos:#0F766E; --neg:#B91C1C; --sky:#EAF1FA;
      font-family:'Inter',system-ui,sans-serif; color:var(--ink); background:var(--bg);
      min-height:100vh; padding:26px 18px 64px; line-height:1.5;
    }
    .tut-wrap { max-width:980px; margin:0 auto; }
    .tut-display { font-family:'Space Grotesk',sans-serif; letter-spacing:-0.02em; }

    .tut-top { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:24px; flex-wrap:wrap; }
    .tut-brand { display:flex; align-items:center; gap:12px; }
    .tut-logo { width:42px; height:42px; border-radius:11px; background:linear-gradient(135deg,var(--primary),var(--primary-dark));
      display:grid; place-items:center; color:#fff; font-family:'Space Grotesk'; font-weight:700; font-size:20px; }
    .tut-brand h1 { font-size:20px; margin:0; font-weight:700; }
    .tut-brand p { margin:2px 0 0; font-size:13px; color:var(--ink-soft); }
    .tut-who { display:flex; align-items:center; gap:12px; font-size:13.5px; color:var(--ink-soft); }
    .tut-who b { color:var(--ink); font-weight:600; }

    .tut-card { background:var(--surface); border:1px solid var(--line); border-radius:16px; padding:22px; }
    .tut-card + .tut-card { margin-top:16px; }
    .tut-card h2 { font-family:'Space Grotesk'; font-size:16px; margin:0 0 4px; font-weight:600; }
    .tut-card .sub { font-size:13px; color:var(--ink-soft); margin:0 0 18px; }
    .tut-subhead { font-family:'Space Grotesk'; font-size:13px; font-weight:600; color:var(--ink-soft); text-transform:uppercase; letter-spacing:.05em; margin:16px 0 9px; }

    .tut-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
    .tut-grid.three { grid-template-columns:1fr 1fr 1fr; }
    .tut-field { display:flex; flex-direction:column; gap:6px; }
    .tut-field.full { grid-column:1/-1; }
    .tut-field label { font-size:12.5px; font-weight:600; color:var(--ink-soft); }
    .tut-field input, .tut-field select, .tut-field textarea {
      font-family:'Inter'; font-size:14px; color:var(--ink); border:1px solid var(--line);
      border-radius:9px; padding:10px 12px; background:#fff; width:100%; transition:border-color .15s, box-shadow .15s; }
    .tut-field input.money { font-family:'Space Grotesk'; font-variant-numeric:tabular-nums; }
    .tut-field input[readonly] { background:var(--ok-soft); color:var(--primary-dark); font-weight:600; }
    .tut-field textarea { resize:vertical; min-height:58px; }
    .tut-field input:focus, .tut-field select:focus, .tut-field textarea:focus { outline:none; border-color:var(--primary); box-shadow:0 0 0 3px var(--ok-soft); }
    .tut-dur { display:flex; gap:10px; } .tut-dur>div { flex:1; }
    .tut-pin input { font-family:'Space Grotesk'; font-size:22px; letter-spacing:.5em; text-align:center; font-variant-numeric:tabular-nums; }

    .tut-btn { font-family:'Space Grotesk'; font-size:14px; font-weight:600; cursor:pointer; background:var(--primary);
      color:#fff; border:none; border-radius:10px; padding:11px 20px; transition:background .15s, transform .05s; }
    .tut-btn:hover { background:var(--primary-dark); } .tut-btn:active { transform:translateY(1px); }
    .tut-btn:focus-visible { outline:2px solid var(--ink); outline-offset:2px; }
    .tut-btn[disabled] { opacity:.5; cursor:not-allowed; }
    .tut-btn.ghost { background:transparent; color:var(--primary); border:1px solid var(--line); } .tut-btn.ghost:hover { background:var(--ok-soft); }
    .tut-btn.sm { padding:7px 13px; font-size:13px; }
    .tut-btn.danger { background:transparent; color:var(--neg); border:1px solid var(--line); } .tut-btn.danger:hover { background:#FBEAEA; }
    .tut-actions { display:flex; align-items:center; gap:14px; margin-top:18px; flex-wrap:wrap; }

    .tut-toast { position:fixed; left:50%; bottom:26px; transform:translateX(-50%); background:var(--ink); color:#fff;
      padding:13px 20px; border-radius:11px; font-size:14px; font-weight:500; box-shadow:0 10px 30px rgba(22,36,61,.25);
      display:flex; align-items:center; gap:10px; z-index:50; animation:toastIn .25s ease; }
    @keyframes toastIn { from{opacity:0;transform:translate(-50%,12px)} to{opacity:1;transform:translate(-50%,0)} }
    .tut-toast .dot { width:8px; height:8px; border-radius:50%; background:#5EEAD4; }

    .tut-tabs { display:flex; gap:6px; background:var(--surface); padding:5px; border-radius:12px; border:1px solid var(--line); margin-bottom:16px; flex-wrap:wrap; }
    .tut-tabs button { font-family:'Inter'; font-size:13.5px; font-weight:600; cursor:pointer; border:none; background:transparent;
      color:var(--ink-soft); padding:8px 15px; border-radius:8px; transition:all .15s; }
    .tut-tabs button[data-on="true"] { background:var(--ink); color:#fff; }
    .tut-tabs button:focus-visible { outline:2px solid var(--primary); outline-offset:2px; }
    .tut-tabs .pip { display:inline-block; min-width:18px; padding:0 5px; margin-left:7px; background:var(--accent); color:#fff; border-radius:20px; font-size:11px; font-weight:700; font-family:'Space Grotesk'; }

    .tut-monthbar { display:flex; align-items:center; gap:10px; margin-bottom:16px; flex-wrap:wrap; }
    .tut-monthbar .nav { width:34px; height:34px; border-radius:9px; border:1px solid var(--line); background:#fff; color:var(--ink);
      font-size:18px; line-height:1; cursor:pointer; display:grid; place-items:center; }
    .tut-monthbar .nav:hover { background:var(--ok-soft); } .tut-monthbar .nav[disabled] { opacity:.4; cursor:not-allowed; }
    .tut-monthbar .lbl { font-family:'Space Grotesk'; font-weight:600; font-size:15px; min-width:150px; text-align:center; text-transform:capitalize; }
    .tut-monthbar .toggle { margin-left:auto; font-family:'Inter'; font-size:13px; font-weight:600; color:var(--primary);
      background:transparent; border:1px solid var(--line); border-radius:9px; padding:8px 13px; cursor:pointer; }
    .tut-monthbar .toggle:hover { background:var(--ok-soft); }

    .tut-dias { display:flex; gap:6px; flex-wrap:wrap; }
    .tut-dias button { font-family:'Inter'; font-size:12.5px; font-weight:600; border:1px solid var(--line); background:#fff; color:var(--ink-soft); border-radius:8px; padding:7px 11px; cursor:pointer; transition:all .12s; }
    .tut-dias button[data-on="true"] { background:var(--primary); color:#fff; border-color:var(--primary); }
    .tut-dias button:focus-visible { outline:2px solid var(--ink); outline-offset:2px; }
    .tut-dia-chip { display:inline-block; font-size:11.5px; font-weight:600; background:var(--ok-soft); color:var(--primary-dark); border-radius:6px; padding:2px 8px; margin:0 4px 4px 0; }
    .tut-horario { display:flex; flex-direction:column; gap:0; }
    .tut-horario .dia { display:flex; gap:12px; padding:10px 0; border-bottom:1px solid var(--line); }
    .tut-horario .dia:last-child { border-bottom:none; }
    .tut-horario .dia .d { font-family:'Space Grotesk'; font-weight:600; width:54px; flex-shrink:0; }
    .tut-horario .dia .items { display:flex; flex-wrap:wrap; gap:6px; }
    .tut-horario .dia .it { font-size:13px; background:var(--sky); color:#1E4E8C; border-radius:7px; padding:3px 9px; }
    .tut-horario .dia .vacio { font-size:13px; color:var(--ink-soft); }

    .tut-table { width:100%; border-collapse:collapse; font-size:13.5px; }
    .tut-table th { text-align:left; font-family:'Space Grotesk'; font-weight:600; color:var(--ink-soft); font-size:11.5px; text-transform:uppercase; letter-spacing:.03em; padding:8px 10px; border-bottom:1px solid var(--line); }
    .tut-table td { padding:9px 10px; border-bottom:1px solid var(--line); }
    .tut-table td.num, .tut-table th.num { text-align:right; font-variant-numeric:tabular-nums; font-family:'Space Grotesk'; }
    .tut-table tr:last-child td { border-bottom:none; }
    .tut-table td.pos { color:var(--pos); font-weight:600; } .tut-table td.neg { color:var(--neg); font-weight:600; }
    .tut-table-wrap { overflow-x:auto; }

    .tut-bars { display:flex; flex-direction:column; gap:8px; }
    .tut-bar-row { display:flex; align-items:center; gap:10px; }
    .tut-bar-row .lbl { width:60px; font-size:12.5px; color:var(--ink-soft); flex-shrink:0; text-transform:capitalize; }
    .tut-bar-row .track { flex:1; background:var(--ok-soft); border-radius:6px; height:22px; position:relative; overflow:hidden; min-width:60px; }
    .tut-bar-row .fill { position:absolute; left:0; top:0; bottom:0; background:linear-gradient(90deg,var(--primary),var(--primary-dark)); border-radius:6px; transition:width .3s; }
    .tut-bar-row .fill.neg { background:var(--neg); }
    .tut-bar-row .val { width:104px; text-align:right; font-family:'Space Grotesk'; font-variant-numeric:tabular-nums; font-size:13px; font-weight:600; flex-shrink:0; }
    @media (prefers-reduced-motion:reduce){ .tut-bar-row .fill{ transition:none } }

    .tut-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:16px; }
    .tut-stat { background:var(--surface); border:1px solid var(--line); border-radius:14px; padding:15px 16px; }
    .tut-stat .v { font-family:'Space Grotesk'; font-size:22px; font-weight:700; font-variant-numeric:tabular-nums; }
    .tut-stat .v.pos { color:var(--pos); } .tut-stat .v.neg { color:var(--neg); }
    .tut-stat .l { font-size:12px; color:var(--ink-soft); margin-top:2px; }

    .tut-notif { border-left:3px solid var(--accent); background:var(--accent-soft); border-radius:12px; padding:15px 18px; margin-bottom:16px; }
    .tut-notif-head { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:9px; }
    .tut-notif-head strong { font-family:'Space Grotesk'; font-size:14.5px; }
    .tut-badge { background:var(--accent); color:#fff; font-size:12px; font-weight:700; border-radius:20px; padding:2px 9px; font-family:'Space Grotesk'; }
    .tut-notif ul { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:6px; }
    .tut-notif li { font-size:13.5px; } .tut-notif li b { font-weight:600; }
    .tut-link { background:none; border:none; color:var(--accent); font-weight:600; font-size:13px; cursor:pointer; padding:0; font-family:'Inter'; }
    .tut-link:hover { text-decoration:underline; }

    .tut-list { display:flex; flex-direction:column; gap:10px; }
    .tut-item { border:1px solid var(--line); border-radius:13px; padding:14px 16px; background:#fff; }
    .tut-item.fresh { border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-soft); }
    .tut-item-row { display:flex; justify-content:space-between; align-items:flex-start; gap:14px; flex-wrap:wrap; }
    .tut-item .name { font-weight:600; font-size:15px; }
    .tut-item .meta { font-size:13px; color:var(--ink-soft); margin-top:3px; }
    .tut-item .meta b { color:var(--ink); font-weight:500; }
    .tut-pill { font-size:11.5px; font-weight:600; padding:3px 9px; border-radius:20px; background:var(--ok-soft); color:var(--primary-dark); }
    .tut-pill.linea { background:var(--sky); color:#1E4E8C; }
    .tut-newtag { font-size:10.5px; font-weight:700; color:var(--accent); letter-spacing:.04em; margin-left:8px; }

    .tut-money { display:flex; gap:16px; align-items:center; flex-wrap:wrap; margin-top:10px; padding-top:10px; border-top:1px dashed var(--line); }
    .tut-money .blk { display:flex; flex-direction:column; gap:3px; }
    .tut-money .blk label { font-size:11px; color:var(--ink-soft); font-weight:600; }
    .tut-money .blk input { font-family:'Space Grotesk'; font-variant-numeric:tabular-nums; width:108px; font-size:14px; border:1px solid var(--line); border-radius:8px; padding:7px 9px; }
    .tut-money .blk input:focus { outline:none; border-color:var(--primary); box-shadow:0 0 0 3px var(--ok-soft); }
    .tut-money .margen { margin-left:auto; text-align:right; }
    .tut-money .margen .v { font-family:'Space Grotesk'; font-size:18px; font-weight:700; font-variant-numeric:tabular-nums; }
    .tut-money .margen .v.pos { color:var(--pos); } .tut-money .margen .v.neg { color:var(--neg); }
    .tut-money .margen .l { font-size:11px; color:var(--ink-soft); }

    /* tabla de montos por modalidad (relaciones) */
    .tut-rate { display:grid; grid-template-columns:90px 1fr 1fr 1fr; gap:8px 12px; align-items:end; }
    .tut-rate .rh { font-size:11px; font-weight:600; color:var(--ink-soft); }
    .tut-rate .rl { font-family:'Space Grotesk'; font-weight:600; font-size:13.5px; align-self:center; }
    .tut-rate input { font-family:'Space Grotesk'; font-variant-numeric:tabular-nums; font-size:14px; border:1px solid var(--line); border-radius:8px; padding:8px 9px; width:100%; }
    .tut-rate input:focus { outline:none; border-color:var(--primary); box-shadow:0 0 0 3px var(--ok-soft); }
    .tut-rate input.calc { background:var(--ok-soft); color:var(--primary-dark); font-weight:600; }
    .tut-rate .gain { font-family:'Space Grotesk'; font-variant-numeric:tabular-nums; font-weight:700; align-self:center; }
    .tut-rate .gain.pos { color:var(--pos); } .tut-rate .gain.neg { color:var(--neg); }

    .tut-sumrow { display:flex; justify-content:space-between; padding:9px 0; border-bottom:1px solid var(--line); font-size:14px; }
    .tut-sumrow:last-child { border-bottom:none; }
    .tut-sumrow .amt { font-family:'Space Grotesk'; font-weight:700; font-variant-numeric:tabular-nums; }
    .tut-twocol { display:grid; grid-template-columns:1fr 1fr; gap:16px; }

    .tut-filters { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:14px; }
    .tut-filters input, .tut-filters select { font-family:'Inter'; font-size:13.5px; border:1px solid var(--line); border-radius:9px; padding:9px 11px; background:#fff; color:var(--ink); }
    .tut-filters input { flex:1; min-width:150px; }
    .tut-filters input:focus, .tut-filters select:focus { outline:none; border-color:var(--primary); box-shadow:0 0 0 3px var(--ok-soft); }

    .tut-empty { text-align:center; padding:34px 20px; color:var(--ink-soft); }
    .tut-empty .big { font-family:'Space Grotesk'; font-size:16px; color:var(--ink); font-weight:600; margin-bottom:6px; }

    .tut-login { max-width:420px; margin:6vh auto 0; }
    .tut-login .hint { font-size:12.5px; color:var(--ink-soft); background:var(--accent-soft); border-radius:10px; padding:11px 13px; margin-top:14px; }
    .tut-err { color:var(--neg); font-size:13px; margin-top:10px; }

    @media (max-width:680px){
      .tut-grid,.tut-grid.three{grid-template-columns:1fr} .tut-stats{grid-template-columns:1fr 1fr}
      .tut-money .margen{margin-left:0;text-align:left;width:100%}
      .tut-twocol{grid-template-columns:1fr}
      .tut-rate{grid-template-columns:1fr 1fr; }
      .tut-rate .rh:first-child,.tut-rate .rl{grid-column:1/-1}
    }
    @media (prefers-reduced-motion:reduce){ .tut-toast{animation:none} }
  `}</style>
);

/* --------------------------- utilidades --------------------------- */
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const hoy = () => new Date().toISOString().slice(0, 10);
const num = (v) => (v === "" || v == null || isNaN(+v) ? 0 : +v);
const SIM = { Q: "Q", USD: "$" };
const fmtMon = (n, mon) => (SIM[mon] || "Q") + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtQ = (n) => fmtMon(n, "Q");
function fmtFecha(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  const mm = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return `${d} ${mm[+m - 1]} ${y}`;
}
function fmtDur(min) { const h = Math.floor(min / 60), m = min % 60; if (h && m) return `${h}h ${m}m`; if (h) return `${h}h`; return `${m}m`; }
const emptyOrg = () => ({ coordinador: null, tutores: [], alumnos: [], relaciones: [], sesiones: [], cobros: [], pagos: [], pagosUSD: [], materias: [], auditoria: [], conciliacion: { guardado: 0, banco: 0 } });
const MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const mesActual = () => new Date().toISOString().slice(0, 7);
const fmtMes = (ym) => { const [y, m] = ym.split("-"); return `${MESES[+m - 1]} ${y}`; };
const addMes = (ym, d) => { let [y, m] = ym.split("-").map(Number); m += d; while (m < 1) { m += 12; y--; } while (m > 12) { m -= 12; y++; } return `${y}-${String(m).padStart(2, "0")}`; };
const enMes = (fecha, p) => {
  if (!p || p === "todos" || p === "todo") return true;
  if (typeof p === "string" && p.startsWith("anio:")) return (fecha || "").slice(0, 4) === p.slice(5);
  return (fecha || "").slice(0, 7) === p;
};
const fmtPeriodo = (p) => {
  if (!p || p === "todos" || p === "todo") return "Todos los años";
  if (typeof p === "string" && p.startsWith("anio:")) return "Año " + p.slice(5);
  return fmtMes(p);
};
const anioActual = () => String(new Date().getFullYear());
const pinOk = (p) => /^\d{4}$/.test(p);
const DOW = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const fmtDias = (arr) => (arr && arr.length) ? [...arr].sort((a, b) => a - b).map((i) => DOW[i]).join(", ") : "Sin días fijos";

/* ----------------------------- PIN input -------------------------- */
function PinInput({ value, onChange, onEnter, id }) {
  return (
    <input id={id} inputMode="numeric" maxLength={4} value={value} placeholder="••••"
      onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
      onKeyDown={(e) => e.key === "Enter" && onEnter && onEnter()} />
  );
}

/* ----------------------------- Días selector ---------------------- */
function DiasSelector({ value, onChange }) {
  const v = value || [];
  const toggle = (i) => onChange(v.includes(i) ? v.filter((x) => x !== i) : [...v, i].sort((a, b) => a - b));
  return (
    <div className="tut-dias">
      {DOW.map((d, i) => <button type="button" key={i} data-on={v.includes(i)} onClick={() => toggle(i)}>{d}</button>)}
    </div>
  );
}

/* Botón con confirmación de dos toques (no usa el confirm del navegador, que el visor bloquea) */
function BotonConfirma({ onConfirm, children = "Eliminar", className = "tut-btn danger sm" }) {
  const [armado, setArmado] = useState(false);
  useEffect(() => { if (!armado) return; const t = setTimeout(() => setArmado(false), 3000); return () => clearTimeout(t); }, [armado]);
  return (
    <button className={className} onClick={() => { if (armado) { setArmado(false); onConfirm(); } else setArmado(true); }}>
      {armado ? "¿Seguro?" : children}
    </button>
  );
}

/* Campo de monto editable con texto libre (permite borrar y decimales) */
function MoneyInput({ value, onCommit, className = "money", style }) {
  const [txt, setTxt] = useState(value === 0 || value ? String(value) : "");
  const [foco, setFoco] = useState(false);
  useEffect(() => { if (!foco) setTxt(value === 0 || value ? String(value) : ""); }, [value, foco]);
  return (
    <input className={className} style={style} inputMode="decimal" value={txt}
      onFocus={() => setFoco(true)} onBlur={() => setFoco(false)}
      onChange={(e) => { const v = e.target.value.replace(/[^\d.]/g, ""); setTxt(v); onCommit(num(v)); }} />
  );
}

/* Trío pago / ganancia / cobro: al llenar 2, calcula el 3ro. cobro = pago + ganancia */
function TrioMontos({ pago, cobro, onChange }) {
  const r2 = (x) => Math.round(x * 100) / 100;
  const init = () => ({
    pago: (pago || pago === 0) && (pago !== 0 || cobro) ? String(pago) : "",
    gan: (cobro || cobro === 0) && (pago || pago === 0) && (cobro || pago) ? String(r2((cobro || 0) - (pago || 0))) : "",
    cobro: (cobro || cobro === 0) && cobro !== 0 ? String(cobro) : (cobro === 0 && pago ? "0" : ""),
  });
  const [t, setT] = useState(init);
  const [orden, setOrden] = useState(["pago", "cobro"]);

  const editar = (campo, valorRaw) => {
    const valor = valorRaw.replace(/[^\d.]/g, "");
    const nv = { ...t, [campo]: valor };
    const no = [campo, ...orden.filter((c) => c !== campo)].slice(0, 2);
    const tercero = ["pago", "gan", "cobro"].find((c) => !no.includes(c));
    const P = num(nv.pago), G = num(nv.gan), C = num(nv.cobro);
    if (tercero === "cobro") nv.cobro = String(r2(P + G));
    else if (tercero === "gan") nv.gan = String(r2(C - P));
    else if (tercero === "pago") nv.pago = String(r2(C - G));
    setT(nv); setOrden(no);
    onChange({ pago: num(nv.pago), cobro: num(nv.cobro) });
  };

  const calc = (campo) => !orden.includes(campo); // el campo que se calcula solo
  const cls = (campo) => "money" + (calc(campo) ? " calc" : "");
  return (
    <>
      <input className={cls("pago")} inputMode="decimal" value={t.pago} placeholder="0" onChange={(e) => editar("pago", e.target.value)} title={calc("pago") ? "Se calcula solo" : ""} />
      <input className={cls("gan")} inputMode="decimal" value={t.gan} placeholder="0" onChange={(e) => editar("gan", e.target.value)} title={calc("gan") ? "Se calcula solo" : ""} />
      <input className={cls("cobro")} inputMode="decimal" value={t.cobro} placeholder="0" onChange={(e) => editar("cobro", e.target.value)} title={calc("cobro") ? "Se calcula solo" : ""} />
    </>
  );
}

/* ------------------------------ Debug banner ------------------------------- */
const VITE_URL = import.meta.env.VITE_SUPABASE_URL;
const VITE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

function DebugBanner({ dbError, onDismiss }) {
  const missingUrl = !VITE_URL;
  const missingKey = !VITE_KEY;
  const hasEnvProblem = missingUrl || missingKey;
  if (!hasEnvProblem && !dbError) return null;
  return (
    <div style={{ background: "#B91C1C", color: "#fff", padding: "14px 18px", borderRadius: 12, marginBottom: 16, fontSize: 13.5, lineHeight: 1.6 }}>
      <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 15 }}>⚠ Error de conexión con Supabase</div>
      {missingUrl && <div><b>VITE_SUPABASE_URL</b> no está definida en el entorno de build.</div>}
      {missingKey && <div><b>VITE_SUPABASE_ANON_KEY</b> no está definida en el entorno de build.</div>}
      {!hasEnvProblem && <div>Variables de entorno detectadas — URL: <code style={{ background: "rgba(0,0,0,.3)", padding: "1px 5px", borderRadius: 4 }}>{VITE_URL?.slice(0, 40)}…</code></div>}
      {dbError && <div style={{ marginTop: 6 }}><b>Error Supabase:</b> {dbError}</div>}
      {onDismiss && <button onClick={onDismiss} style={{ marginTop: 10, background: "rgba(255,255,255,.2)", border: "none", color: "#fff", borderRadius: 7, padding: "5px 12px", cursor: "pointer", fontWeight: 600 }}>Cerrar</button>}
    </div>
  );
}

/* ------------------------------ App ------------------------------- */
export default function App() {
  const [org, setOrg] = useState(emptyOrg());
  const [sesion, setSesion] = useState(null);
  const [leidas, setLeidas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [toast, setToast] = useState(null);
  const [dbError, setDbError] = useState(null);
  const lastSaveRef = useRef(0);
  const showToast = useCallback((m) => { setToast(m); setTimeout(() => setToast(null), 2600); }, []);

  const cargar = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("app_estado").select("data").eq("id", "singleton").single();
      if (error) {
        console.error("[supabase] cargar error:", error);
        if (error.code !== "PGRST116") setDbError(error.message + " (code: " + error.code + ")");
      } else {
        setDbError(null);
        if (data?.data) setOrg({ ...emptyOrg(), ...data.data });
      }
    } catch (e) {
      console.error("[supabase] cargar exception:", e);
      setDbError(String(e?.message || e));
    }
    try { const v = localStorage.getItem(SESSION_KEY); if (v) setSesion(JSON.parse(v)); } catch {}
    try { const v = localStorage.getItem(READ_KEY); if (v) setLeidas(JSON.parse(v)); } catch {}
    setCargando(false);
  }, []);
  useEffect(() => { cargar(); }, [cargar]);

  const guardarOrg = useCallback(async (next, accion) => {
    let final = next;
    if (accion) {
      const now = new Date();
      const actor = sesion
        ? (sesion.tipo === "coordinador" ? `coordinador:${org.coordinador?.usuario || ""}` : `tutor:${(org.tutores.find((t) => t.id === sesion.tutorId) || {}).nombre || ""}`)
        : "sistema";
      const entrada = { ts: now.getTime(), fecha: now.toISOString().slice(0, 10), hora: now.toTimeString().slice(0, 8), actor, accion };
      final = { ...next, auditoria: [entrada, ...(next.auditoria || [])].slice(0, 1000) };
    }
    setOrg(final);
    lastSaveRef.current = Date.now();
    try {
      const { error } = await supabase.from("app_estado").upsert({ id: "singleton", data: final, actualizado_en: new Date().toISOString() });
      if (error) {
        console.error("[supabase] guardar error:", error);
        setDbError(error.message + " (code: " + error.code + ")");
        showToast("No se pudo guardar: " + error.message);
      } else {
        setDbError(null);
      }
    } catch (e) {
      console.error("[supabase] guardar exception:", e);
      setDbError(String(e?.message || e));
      showToast("No se pudo guardar.");
    }
  }, [showToast, sesion, org]);
  const iniciarSesion = useCallback(async (s) => { setSesion(s); try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch {} }, []);
  const cerrarSesion = useCallback(async () => { setSesion(null); try { localStorage.setItem(SESSION_KEY, JSON.stringify(null)); } catch {} }, []);
  const marcarLeidas = useCallback(async () => { const ids = org.sesiones.map((x) => x.id); setLeidas(ids); try { localStorage.setItem(READ_KEY, JSON.stringify(ids)); } catch {} }, [org.sesiones]);

  useEffect(() => {
    if (sesion?.tipo !== "coordinador") return;
    const t = setInterval(async () => {
      try {
        if (Date.now() - lastSaveRef.current < 6000) return;
        const { data } = await supabase.from("app_estado").select("data").eq("id", "singleton").single();
        if (data?.data) setOrg({ ...emptyOrg(), ...data.data });
      } catch {}
    }, 8000);
    return () => clearInterval(t);
  }, [sesion]);

  const noLeidas = useMemo(() => org.sesiones.filter((x) => !leidas.includes(x.id)), [org.sesiones, leidas]);

  if (cargando) return (
    <div className="tut-app"><Styles /><div className="tut-wrap">
      <DebugBanner dbError={dbError} />
      <div className="tut-card"><div className="tut-empty">Cargando…</div></div>
    </div></div>
  );

  if (!org.coordinador) return (
    <div className="tut-app"><Styles /><div className="tut-wrap">
      <DebugBanner dbError={dbError} onDismiss={() => setDbError(null)} />
      <SetupCoordinador onCrear={(c) => { guardarOrg({ ...org, coordinador: c }); showToast("Cuenta de coordinador creada."); }} />
    </div>{toast && <div className="tut-toast"><span className="dot" />{toast}</div>}</div>
  );

  if (!sesion) return (
    <div className="tut-app"><Styles /><div className="tut-wrap">
      <DebugBanner dbError={dbError} onDismiss={() => setDbError(null)} />
      <Login org={org} onEntrar={iniciarSesion} />
    </div>{toast && <div className="tut-toast"><span className="dot" />{toast}</div>}</div>
  );

  const tutorActual = sesion.tipo === "tutor" ? org.tutores.find((t) => t.id === sesion.tutorId) : null;
  if (sesion.tipo === "tutor" && !tutorActual) { cerrarSesion(); return null; }

  return (
    <div className="tut-app"><Styles /><div className="tut-wrap">
      <DebugBanner dbError={dbError} onDismiss={() => setDbError(null)} />
      <header className="tut-top">
        <div className="tut-brand">
          <div className="tut-logo">T</div>
          <div><h1 className="tut-display">Registro de Tutorías</h1>
            <p>{sesion.tipo === "coordinador" ? "Panel de administración" : "Registra tus sesiones"}</p></div>
        </div>
        <div className="tut-who">
          <span>Sesión: <b>{sesion.tipo === "coordinador" ? org.coordinador.usuario : tutorActual.nombre}</b></span>
          <button className="tut-btn ghost sm" onClick={cerrarSesion}>Cerrar sesión</button>
        </div>
      </header>
      {sesion.tipo === "coordinador"
        ? <PanelCoordinador org={org} guardarOrg={guardarOrg} showToast={showToast} noLeidas={noLeidas} onMarcarLeidas={marcarLeidas} />
        : <VistaTutor org={org} tutor={tutorActual} guardarOrg={guardarOrg} showToast={showToast} />}
    </div>{toast && <div className="tut-toast"><span className="dot" />{toast}</div>}</div>
  );
}

/* ----------------------- Setup coordinador ------------------------ */
function SetupCoordinador({ onCrear }) {
  const [u, setU] = useState(""); const [p, setP] = useState(""); const [p2, setP2] = useState("");
  const err = p && p2 && p !== p2 ? "Los códigos no coinciden." : "";
  const ok = u.trim() && pinOk(p) && p === p2;
  return (
    <div className="tut-card tut-login">
      <h2>Crea tu cuenta de coordinador</h2>
      <p className="sub">Eres el administrador. Aquí darás de alta tutores, alumnos y los precios de cada relación.</p>
      <div className="tut-field"><label>Tu nombre (usuario)</label><input value={u} onChange={(e) => setU(e.target.value)} placeholder="Ej. Diego" /></div>
      <div className="tut-field tut-pin" style={{ marginTop: 12 }}><label>Código de 4 dígitos</label><PinInput value={p} onChange={setP} /></div>
      <div className="tut-field tut-pin" style={{ marginTop: 12 }}><label>Repite el código</label><PinInput value={p2} onChange={setP2} /></div>
      {err && <div className="tut-err">{err}</div>}
      <div className="tut-actions"><button className="tut-btn" disabled={!ok} onClick={() => onCrear({ usuario: u.trim(), pin: p })}>Crear cuenta</button></div>
      <div className="hint">Versión de prueba: los datos se guardan en este navegador. Elige un código de 4 dígitos que recuerdes; con él entrarás como coordinador.</div>
    </div>
  );
}

/* ------------------------------ Login ----------------------------- */
function Login({ org, onEntrar }) {
  const [u, setU] = useState(""); const [p, setP] = useState(""); const [err, setErr] = useState("");
  const entrar = () => {
    const user = u.trim().toLowerCase();
    if (user === org.coordinador.usuario.toLowerCase() && p === org.coordinador.pin) return onEntrar({ tipo: "coordinador" });
    const t = org.tutores.find((x) => x.nombre.toLowerCase() === user && x.pin === p);
    if (t) return onEntrar({ tipo: "tutor", tutorId: t.id });
    setErr("Nombre o código incorrecto.");
  };
  return (
    <div className="tut-card tut-login">
      <h2>Iniciar sesión</h2>
      <p className="sub">Escribe tu nombre y tu código de 4 dígitos.</p>
      <div className="tut-field"><label>Tu nombre</label><input value={u} onChange={(e) => { setU(e.target.value); setErr(""); }} placeholder="Ej. María" /></div>
      <div className="tut-field tut-pin" style={{ marginTop: 12 }}><label>Código</label><PinInput value={p} onChange={(v) => { setP(v); setErr(""); }} onEnter={entrar} /></div>
      {err && <div className="tut-err">{err}</div>}
      <div className="tut-actions"><button className="tut-btn" onClick={entrar} disabled={!u.trim() || !pinOk(p)}>Entrar</button></div>
    </div>
  );
}

/* ------------------------ Panel coordinador ----------------------- */
function SelectorMes({ mes, setMes }) {
  const modo = mes === "todo" || mes === "todos" ? "todo" : (typeof mes === "string" && mes.startsWith("anio:")) ? "anio" : "mes";
  return (
    <div className="tut-monthbar" style={{ flexWrap: "wrap" }}>
      <div className="tut-tabs" style={{ margin: 0, padding: 4 }}>
        <button data-on={modo === "mes"} onClick={() => setMes(mesActual())} style={{ padding: "6px 12px" }}>Mensual</button>
        <button data-on={modo === "anio"} onClick={() => setMes("anio:" + anioActual())} style={{ padding: "6px 12px" }}>Anual</button>
        <button data-on={modo === "todo"} onClick={() => setMes("todo")} style={{ padding: "6px 12px" }}>Todo</button>
      </div>
      {modo === "mes" && (<>
        <button className="nav" aria-label="Mes anterior" onClick={() => setMes(addMes(mes, -1))}>‹</button>
        <span className="lbl">{fmtMes(mes)}</span>
        <button className="nav" aria-label="Mes siguiente" onClick={() => setMes(addMes(mes, 1))}>›</button>
      </>)}
      {modo === "anio" && (<>
        <button className="nav" aria-label="Año anterior" onClick={() => setMes("anio:" + (+mes.slice(5) - 1))}>‹</button>
        <span className="lbl">Año {mes.slice(5)}</span>
        <button className="nav" aria-label="Año siguiente" onClick={() => setMes("anio:" + (+mes.slice(5) + 1))}>›</button>
      </>)}
      {modo === "todo" && <span className="lbl" style={{ minWidth: 0 }}>Todos los años</span>}
    </div>
  );
}

function PanelCoordinador({ org, guardarOrg, showToast, noLeidas, onMarcarLeidas }) {
  const [tab, setTab] = useState("dinero");
  const [mes, setMes] = useState(mesActual());
  const conMes = tab === "dinero";
  return (
    <>
      <div className="tut-tabs" role="tablist">
        <button data-on={tab === "dinero"} onClick={() => setTab("dinero")}>Clases y dinero{noLeidas.length > 0 && <span className="pip">{noLeidas.length}</span>}</button>
        <button data-on={tab === "cuentas"} onClick={() => setTab("cuentas")}>Cuentas y pagos</button>
        <button data-on={tab === "analisis"} onClick={() => setTab("analisis")}>Análisis</button>
        <button data-on={tab === "relaciones"} onClick={() => setTab("relaciones")}>Relaciones (precios)</button>
        <button data-on={tab === "tutores"} onClick={() => setTab("tutores")}>Tutores</button>
        <button data-on={tab === "alumnos"} onClick={() => setTab("alumnos")}>Alumnos</button>
        <button data-on={tab === "materias"} onClick={() => setTab("materias")}>Materias</button>
      </div>
      {(conMes || tab === "analisis") && <SelectorMes mes={mes} setMes={setMes} />}
      {tab === "dinero" && <TabDinero org={org} guardarOrg={guardarOrg} noLeidas={noLeidas} onMarcarLeidas={onMarcarLeidas} mes={mes} showToast={showToast} />}
      {tab === "cuentas" && <TabCuentas org={org} guardarOrg={guardarOrg} showToast={showToast} mes={mes} />}
      {tab === "analisis" && <TabAnalisis org={org} mes={mes} />}
      {tab === "relaciones" && <TabRelaciones org={org} guardarOrg={guardarOrg} showToast={showToast} />}
      {tab === "tutores" && <TabTutores org={org} guardarOrg={guardarOrg} showToast={showToast} />}
      {tab === "alumnos" && <TabAlumnos org={org} guardarOrg={guardarOrg} showToast={showToast} />}
      {tab === "materias" && <TabMaterias org={org} guardarOrg={guardarOrg} showToast={showToast} />}
    </>
  );
}

/* ---- Tab Tutores ---- */
/* ---- Historial de sesiones (por alumno o por tutor) ---- */
function DetalleSesiones({ sesiones, mostrar, org }) {
  // mostrar: "tutor" => muestra con quién (el tutor); "alumno" => muestra a quién (el alumno)
  const nT = (id) => org.tutores.find((t) => t.id === id)?.nombre || "—";
  const nA = (id) => org.alumnos.find((a) => a.id === id)?.nombre || "—";
  if (sesiones.length === 0) return <div className="meta" style={{ marginTop: 10 }}>Sin sesiones registradas todavía.</div>;
  const orden = [...sesiones].sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));
  return (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px dashed var(--line)", display: "flex", flexDirection: "column", gap: 9 }}>
      {orden.map((s) => (
        <div key={s.id} style={{ fontSize: 13.5 }}>
          <div style={{ fontWeight: 600 }}>
            {mostrar === "tutor" ? nT(s.tutorId) : nA(s.alumnoId)}
            <span style={{ color: "var(--ink-soft)", fontWeight: 400 }}> · {fmtFecha(s.fecha)} · {fmtDur(s.duracion)} </span>
            <span className={`tut-pill${s.modalidad === LINEA ? " linea" : ""}`}>{s.modalidad}</span>
          </div>
          {s.materia && <div style={{ color: "var(--ink-soft)" }}>Materia: {s.materia}</div>}
          {s.notas && <div style={{ color: "var(--ink-soft)" }}>Comentarios: {s.notas}</div>}
        </div>
      ))}
    </div>
  );
}

function TabTutores({ org, guardarOrg, showToast }) {
  const [nombre, setNombre] = useState(""); const [pin, setPin] = useState(""); const [genero, setGenero] = useState("M");
  const [verId, setVerId] = useState(null);
  const libre = nombre.trim() && nombre.trim().toLowerCase() !== org.coordinador.usuario.toLowerCase() && !org.tutores.some((t) => t.nombre.toLowerCase() === nombre.trim().toLowerCase());
  const ok = libre && pinOk(pin);
  const crear = () => { if (!ok) return; guardarOrg({ ...org, tutores: [...org.tutores, { id: uid(), nombre: nombre.trim(), pin, genero }] }, "creó tutor"); setNombre(""); setPin(""); setGenero("M"); showToast("Tutor agregado."); };
  const eliminar = (id) => guardarOrg({ ...org, tutores: org.tutores.filter((t) => t.id !== id), relaciones: org.relaciones.filter((r) => r.tutorId !== id), personalTutorId: org.personalTutorId === id ? null : org.personalTutorId }, "eliminó tutor");
  const togglePersonal = (id) => guardarOrg({ ...org, personalTutorId: org.personalTutorId === id ? null : id }, "cambió tutor personal");
  return (
    <>
      <div className="tut-card">
        <h2>Agregar tutor</h2>
        <p className="sub">El tutor entrará con su nombre y este código. Los precios no se definen aquí, sino en cada relación con un alumno.</p>
        <div className="tut-grid">
          <div className="tut-field"><label>Nombre del tutor (usuario)</label><input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. María López" />
            {nombre && !libre && <span className="tut-err">Ese nombre ya está en uso.</span>}</div>
          <div className="tut-field tut-pin"><label>Código de 4 dígitos</label><PinInput value={pin} onChange={setPin} /></div>
          <div className="tut-field"><label>Género</label><select value={genero} onChange={(e) => setGenero(e.target.value)}><option value="M">Masculino</option><option value="F">Femenino</option></select></div>
        </div>
        <div className="tut-actions"><button className="tut-btn" disabled={!ok} onClick={crear}>Agregar tutor</button></div>
      </div>
      <div className="tut-card">
        <h2>Tutores ({org.tutores.length})</h2>
        <p className="sub">Toca "Ver clases" para el detalle. Marca un tutor como "Cuenta personal" si eres tú mismo dando clases: sus ingresos se rastrean por separado y no afectan la ganancia de la empresa.</p>
        {org.tutores.length === 0 ? <div className="tut-empty">Aún no hay tutores.</div> : (
          <div className="tut-list">
            {org.tutores.map((t) => {
              const esPersonal = org.personalTutorId === t.id;
              const ses = org.sesiones.filter((s) => s.tutorId === t.id);
              const pagado = ses.reduce((a, s) => a + (s.pago || 0), 0);
              const nrel = org.relaciones.filter((r) => r.tutorId === t.id).length;
              return (
                <div className="tut-item" key={t.id}>
                  <div className="tut-item-row">
                    <div><div className="name">{t.nombre}{esPersonal && <span className="tut-newtag" style={{ color: "var(--accent)", marginLeft: 8 }}>CUENTA PERSONAL</span>}</div>
                      <div className="meta">Código: <b>{t.pin}</b> · {nrel} alumno(s) · {ses.length} clase(s) · {esPersonal ? "generado personal" : "pagado"} <b>{fmtQ(pagado)}</b></div></div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <button className={`tut-btn sm ${esPersonal ? "" : "ghost"}`} style={esPersonal ? { background: "var(--accent)" } : {}} onClick={() => togglePersonal(t.id)}>{esPersonal ? "Personal ✓" : "Marcar personal"}</button>
                      <button className="tut-btn ghost sm" onClick={() => setVerId(verId === t.id ? null : t.id)}>{verId === t.id ? "Ocultar" : "Ver clases"}</button>
                      <BotonConfirma onConfirm={() => eliminar(t.id)} />
                    </div>
                  </div>
                  {verId === t.id && <DetalleSesiones sesiones={ses} mostrar="alumno" org={org} />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

/* ---- Tab Alumnos ---- */
function TabAlumnos({ org, guardarOrg, showToast }) {
  const [nombre, setNombre] = useState("");
  const [moneda, setMoneda] = useState("Q");
  const [genero, setGenero] = useState("M");
  const [verId, setVerId] = useState(null);
  const libre = nombre.trim() && !org.alumnos.some((a) => a.nombre.toLowerCase() === nombre.trim().toLowerCase());
  const crear = () => { if (!libre) return; guardarOrg({ ...org, alumnos: [...org.alumnos, { id: uid(), nombre: nombre.trim(), moneda, genero }] }, "creó alumno"); setNombre(""); setMoneda("Q"); setGenero("M"); showToast("Alumno agregado."); };
  const eliminar = (id) => guardarOrg({ ...org, alumnos: org.alumnos.filter((a) => a.id !== id), relaciones: org.relaciones.filter((r) => r.alumnoId !== id) }, "eliminó alumno");
  return (
    <>
      <div className="tut-card">
        <h2>Agregar alumno</h2>
        <p className="sub">El nombre, en qué moneda te paga y el género. A los tutores siempre se les paga en quetzales; la moneda es solo de lo que cobras al alumno.</p>
        <div className="tut-grid">
          <div className="tut-field"><label>Nombre del alumno</label><input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Juan Pérez" />
            {nombre && !libre && <span className="tut-err">Ese alumno ya existe.</span>}</div>
          <div className="tut-field"><label>Te paga en</label><select value={moneda} onChange={(e) => setMoneda(e.target.value)}><option value="Q">Quetzales (Q)</option><option value="USD">Dólares (US$)</option></select></div>
          <div className="tut-field"><label>Género</label><select value={genero} onChange={(e) => setGenero(e.target.value)}><option value="M">Masculino</option><option value="F">Femenino</option></select></div>
        </div>
        <div className="tut-actions"><button className="tut-btn" disabled={!libre} onClick={crear}>Agregar alumno</button></div>
      </div>
      <div className="tut-card">
        <h2>Alumnos ({org.alumnos.length})</h2>
        <p className="sub">Toca "Ver clases" para el detalle de qué profesor le dio, qué día, cuánto tiempo, la modalidad y los comentarios.</p>
        {org.alumnos.length === 0 ? <div className="tut-empty">Aún no hay alumnos.</div> : (
          <div className="tut-list">
            {org.alumnos.map((a) => {
              const mon = a.moneda || "Q";
              const ses = org.sesiones.filter((s) => s.alumnoId === a.id);
              const cobrado = ses.reduce((x, s) => x + (s.cobro || 0), 0);
              const tutores = org.relaciones.filter((r) => r.alumnoId === a.id).map((r) => org.tutores.find((t) => t.id === r.tutorId)?.nombre).filter(Boolean);
              return (
                <div className="tut-item" key={a.id}>
                  <div className="tut-item-row">
                    <div><div className="name">{a.nombre} <span className={`tut-pill${mon === "USD" ? " linea" : ""}`}>{mon === "USD" ? "US$" : "Q"}</span></div>
                      <div className="meta">{tutores.length ? <>Con: <b>{tutores.join(", ")}</b> · </> : "Sin relaciones aún · "}{ses.length} clase(s) · cobrado <b>{fmtMon(cobrado, mon)}</b></div></div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="tut-btn ghost sm" onClick={() => setVerId(verId === a.id ? null : a.id)}>{verId === a.id ? "Ocultar" : "Ver clases"}</button>
                      <BotonConfirma onConfirm={() => eliminar(a.id)} />
                    </div>
                  </div>
                  {verId === a.id && <DetalleSesiones sesiones={ses} mostrar="tutor" org={org} />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

/* ---- Tab Relaciones (precios alumno-tutor) ---- */
function TabRelaciones({ org, guardarOrg, showToast }) {
  const blank = { alumnoId: "", tutorId: "", cobroPres: "", cobroLin: "", pagoPres: "", pagoLin: "", dias: [] };
  const [f, setF] = useState(blank);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value.replace(/[^\d.]/g, "") }));
  const setSel = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const dup = f.alumnoId && f.tutorId && org.relaciones.some((r) => r.alumnoId === f.alumnoId && r.tutorId === f.tutorId);
  const ok = f.alumnoId && f.tutorId && !dup;

  const crear = () => {
    if (!ok) return;
    guardarOrg({ ...org, relaciones: [...org.relaciones, {
      id: uid(), alumnoId: f.alumnoId, tutorId: f.tutorId,
      cobroPres: num(f.cobroPres), cobroLin: num(f.cobroLin), pagoPres: num(f.pagoPres), pagoLin: num(f.pagoLin), dias: f.dias,
    }] }, "creó relación");
    setF(blank); showToast("Relación creada.");
  };
  const editar = (id, campo, valor) => guardarOrg({ ...org, relaciones: org.relaciones.map((r) => r.id === id ? { ...r, [campo]: num(valor) } : r) }, "editó precio de relación");
  const editarPar = (id, suf, pago, cobro) => guardarOrg({ ...org, relaciones: org.relaciones.map((r) => r.id === id ? { ...r, ["pago" + suf]: pago, ["cobro" + suf]: cobro } : r) }, "editó precio de relación");
  const editarDias = (id, dias) => guardarOrg({ ...org, relaciones: org.relaciones.map((r) => r.id === id ? { ...r, dias } : r) }, "cambió días de relación");
  const eliminar = (id) => guardarOrg({ ...org, relaciones: org.relaciones.filter((r) => r.id !== id) }, "eliminó relación");

  const nA = (id) => org.alumnos.find((a) => a.id === id)?.nombre || "—";
  const nT = (id) => org.tutores.find((t) => t.id === id)?.nombre || "—";
  const monA = (id) => org.alumnos.find((a) => a.id === id)?.moneda || "Q";
  const monNuevo = f.alumnoId ? monA(f.alumnoId) : "Q";
  const esUSD = monNuevo === "USD";

  const horario = DOW.map((d, i) => ({ dia: d, items: org.relaciones.filter((r) => (r.dias || []).includes(i)).map((r) => `${nA(r.alumnoId)} · ${nT(r.tutorId)}`) }));
  const hayHorario = horario.some((h) => h.items.length > 0);

  if (org.alumnos.length === 0 || org.tutores.length === 0) return (
    <div className="tut-card"><div className="tut-empty"><div className="big">Primero agrega tutores y alumnos</div>Las relaciones de precio conectan a un alumno con un tutor, así que necesitas al menos uno de cada uno.</div></div>
  );

  return (
    <>
      <div className="tut-card">
        <h2>Crear relación de precio</h2>
        <p className="sub">El precio es por esta pareja: el mismo alumno con otro tutor puede tener montos y días distintos. El cobro va en la moneda del alumno; al tutor siempre se le paga en quetzales.</p>
        <div className="tut-grid">
          <div className="tut-field"><label>Alumno</label><select value={f.alumnoId} onChange={setSel("alumnoId")}><option value="">Elige</option>{org.alumnos.map((a) => <option key={a.id} value={a.id}>{a.nombre} ({(a.moneda || "Q") === "USD" ? "US$" : "Q"})</option>)}</select></div>
          <div className="tut-field"><label>Tutor</label><select value={f.tutorId} onChange={setSel("tutorId")}><option value="">Elige</option>{org.tutores.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}</select></div>
        </div>
        {dup && <div className="tut-err">Esa relación ya existe. Edítala en la lista de abajo.</div>}

        <div className="tut-subhead">Días de la semana</div>
        <DiasSelector value={f.dias} onChange={(d) => setF((p) => ({ ...p, dias: d }))} />

        <div className="tut-subhead">Montos por modalidad{f.alumnoId ? ` · pago en Q${esUSD ? ", cobro en US$" : ", cobro en Q"}` : ""}</div>
        {esUSD ? (
          <div className="tut-rate">
            <div className="rh"></div><div className="rh">Pago al tutor (Q)</div><div className="rh">Cobro al alumno (US$)</div><div className="rh"></div>
            <div className="rl">Presencial</div>
            <input className="money" inputMode="decimal" value={f.pagoPres} onChange={set("pagoPres")} placeholder="0" />
            <input className="money" inputMode="decimal" value={f.cobroPres} onChange={set("cobroPres")} placeholder="0" />
            <div className="gain" style={{ color: "var(--ink-soft)", fontWeight: 400, fontSize: 12 }}>—</div>
            <div className="rl">En línea</div>
            <input className="money" inputMode="decimal" value={f.pagoLin} onChange={set("pagoLin")} placeholder="0" />
            <input className="money" inputMode="decimal" value={f.cobroLin} onChange={set("cobroLin")} placeholder="0" />
            <div className="gain" style={{ color: "var(--ink-soft)", fontWeight: 400, fontSize: 12 }}>—</div>
          </div>
        ) : (
          <>
            <div className="tut-rate">
              <div className="rh"></div><div className="rh">Pago al tutor</div><div className="rh">Ganancia</div><div className="rh">Cobro al alumno</div>
              <div className="rl">Presencial</div>
              <TrioMontos pago={num(f.pagoPres)} cobro={num(f.cobroPres)} onChange={({ pago, cobro }) => setF((p) => ({ ...p, pagoPres: String(pago), cobroPres: String(cobro) }))} />
              <div className="rl">En línea</div>
              <TrioMontos pago={num(f.pagoLin)} cobro={num(f.cobroLin)} onChange={({ pago, cobro }) => setF((p) => ({ ...p, pagoLin: String(pago), cobroLin: String(cobro) }))} />
            </div>
            <p className="sub" style={{ margin: "8px 0 0" }}>Llena dos de los tres y el otro se calcula solo (el calculado se ve resaltado).</p>
          </>
        )}
        <div className="tut-actions"><button className="tut-btn" disabled={!ok} onClick={crear}>Crear relación</button></div>
      </div>

      {hayHorario && (
        <div className="tut-card">
          <h2>Horario semanal</h2>
          <p className="sub">Quién tiene clase cada día, según los días marcados en cada relación.</p>
          <div className="tut-horario">
            {horario.map((h) => (
              <div className="dia" key={h.dia}>
                <div className="d">{h.dia}</div>
                <div className="items">{h.items.length ? h.items.map((it, k) => <span className="it" key={k}>{it}</span>) : <span className="vacio">—</span>}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="tut-card">
        <h2>Relaciones ({org.relaciones.length})</h2>
        <p className="sub">Edita los montos o los días directamente; todo se guarda al instante. Cambiar un precio solo afecta a las tutorías nuevas: las ya registradas conservan el monto que tenían.</p>
        {org.relaciones.length === 0 ? <div className="tut-empty">Aún no hay relaciones. Crea la primera arriba.</div> : (
          <div className="tut-list">
            {org.relaciones.map((r) => {
              const rUSD = monA(r.alumnoId) === "USD";
              return (
              <div className="tut-item" key={r.id}>
                <div className="tut-item-row" style={{ marginBottom: 10 }}>
                  <div className="name">{nA(r.alumnoId)} <span style={{ color: "var(--ink-soft)", fontWeight: 400 }}>con</span> {nT(r.tutorId)} <span className={`tut-pill${rUSD ? " linea" : ""}`}>{rUSD ? "US$" : "Q"}</span></div>
                  <BotonConfirma onConfirm={() => eliminar(r.id)} />
                </div>
                <div className="tut-subhead" style={{ marginTop: 0 }}>Días ({fmtDias(r.dias)})</div>
                <DiasSelector value={r.dias} onChange={(d) => editarDias(r.id, d)} />
                <div className="tut-subhead">Montos · pago en Q{rUSD ? ", cobro en US$" : ", cobro en Q"}</div>
                {rUSD ? (
                  <div className="tut-rate">
                    <div className="rh"></div><div className="rh">Pago al tutor (Q)</div><div className="rh">Cobro al alumno (US$)</div><div className="rh"></div>
                    <div className="rl">Presencial</div>
                    <MoneyInput value={r.pagoPres} onCommit={(v) => editar(r.id, "pagoPres", v)} />
                    <MoneyInput value={r.cobroPres} onCommit={(v) => editar(r.id, "cobroPres", v)} />
                    <div className="gain" style={{ color: "var(--ink-soft)", fontWeight: 400, fontSize: 12 }}>—</div>
                    <div className="rl">En línea</div>
                    <MoneyInput value={r.pagoLin} onCommit={(v) => editar(r.id, "pagoLin", v)} />
                    <MoneyInput value={r.cobroLin} onCommit={(v) => editar(r.id, "cobroLin", v)} />
                    <div className="gain" style={{ color: "var(--ink-soft)", fontWeight: 400, fontSize: 12 }}>—</div>
                  </div>
                ) : (
                  <div className="tut-rate">
                    <div className="rh"></div><div className="rh">Pago al tutor</div><div className="rh">Ganancia</div><div className="rh">Cobro al alumno</div>
                    <div className="rl">Presencial</div>
                    <TrioMontos key={"p" + r.id} pago={r.pagoPres} cobro={r.cobroPres} onChange={({ pago, cobro }) => editarPar(r.id, "Pres", pago, cobro)} />
                    <div className="rl">En línea</div>
                    <TrioMontos key={"l" + r.id} pago={r.pagoLin} cobro={r.cobroLin} onChange={({ pago, cobro }) => editarPar(r.id, "Lin", pago, cobro)} />
                  </div>
                )}
              </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

/* ---- Tab Dinero / Sesiones ---- */
function TabDinero({ org, guardarOrg, noLeidas, onMarcarLeidas, mes, showToast }) {
  const [q, setQ] = useState(""); const [fTutor, setFTutor] = useState(""); const [fAlumno, setFAlumno] = useState(""); const [fMod, setFMod] = useState("");
  const [editId, setEditId] = useState(null);
  const [abrirReg, setAbrirReg] = useState(false);
  const [regTutor, setRegTutor] = useState("");
  const nT = (id) => org.tutores.find((t) => t.id === id)?.nombre || "—";
  const nA = (id) => org.alumnos.find((a) => a.id === id)?.nombre || "—";
  const idsNuevas = useMemo(() => new Set(noLeidas.map((x) => x.id)), [noLeidas]);
  const editarMonto = (id, campo, valor) => guardarOrg({ ...org, sesiones: org.sesiones.map((s) => s.id === id ? { ...s, [campo]: num(valor) } : s) });
  const guardarSesion = (ses) => { guardarOrg({ ...org, sesiones: org.sesiones.map((s) => s.id === ses.id ? ses : s) }, "editó clase"); setEditId(null); };
  const eliminarSesion = (id) => guardarOrg({ ...org, sesiones: org.sesiones.filter((s) => s.id !== id) }, "eliminó clase");
  const registrarAdmin = (ses) => { guardarOrg({ ...org, sesiones: [ses, ...org.sesiones] }, "registró clase (coordinador)"); showToast && showToast("Clase registrada."); };
  // alumnos disponibles para el tutor elegido en el registro admin
  const alumnosDeRegTutor = org.alumnos.filter((a) => org.relaciones.some((r) => r.tutorId === regTutor && r.alumnoId === a.id));

  const sesionesMes = useMemo(() => org.sesiones.filter((s) => enMes(s.fecha, mes)), [org.sesiones, mes]);

  const filtradas = useMemo(() => {
    const term = q.trim().toLowerCase();
    return [...sesionesMes]
      .filter((s) => !fTutor || s.tutorId === fTutor)
      .filter((s) => !fAlumno || s.alumnoId === fAlumno)
      .filter((s) => !fMod || s.modalidad === fMod)
      .filter((s) => !term || `${nA(s.alumnoId)} ${nT(s.tutorId)} ${s.materia} ${s.notas}`.toLowerCase().includes(term))
      .sort((a, b) => (b.fecha || "").localeCompare(a.fecha || "") || b.subidaEn - a.subidaEn);
  }, [sesionesMes, q, fTutor, fAlumno, fMod]);
  const horasFiltradas = filtradas.reduce((a, s) => a + (s.duracion || 0), 0);

  const monS = (s) => s.moneda || "Q";
  const pid = org.personalTutorId || null;
  const esP = (s) => pid && s.tutorId === pid;
  const sesionesMesEmpresa = sesionesMes.filter((s) => !esP(s));
  const minTotal = sesionesMesEmpresa.filter((s) => monS(s) === "Q").reduce((a, s) => a + (s.duracion || 0), 0);
  const ingresosQ = sesionesMesEmpresa.filter((s) => monS(s) === "Q").reduce((a, s) => a + (s.cobro || 0), 0);
  const ingresosUSD = sesionesMesEmpresa.filter((s) => monS(s) === "USD").reduce((a, s) => a + (s.cobro || 0), 0);
  const pagosQ = sesionesMesEmpresa.filter((s) => monS(s) === "Q").reduce((a, s) => a + (s.pago || 0), 0);
  const gananciaQ = ingresosQ - pagosQ;
  const hayUSD = sesionesMesEmpresa.some((s) => monS(s) === "USD");
  const dineroDiegoQ = pid ? sesionesMes.filter((s) => esP(s) && monS(s) === "Q").reduce((a, s) => a + (s.cobro || 0), 0) : 0;
  const nombrePersonal = pid ? (org.tutores.find((t) => t.id === pid)?.nombre || "Personal") : "";
  const porAlumnoPersonal = pid ? org.alumnos.map((a) => { const ss = sesionesMes.filter((s) => esP(s) && s.alumnoId === a.id); return { nombre: a.nombre, total: ss.reduce((x, s) => x + (s.cobro || 0), 0), min: ss.reduce((x, s) => x + s.duracion, 0), n: ss.length }; }).filter((x) => x.n > 0).sort((a, b) => b.total - a.total) : [];

  const porAlumno = useMemo(() => org.alumnos.map((a) => { const ss = sesionesMesEmpresa.filter((s) => s.alumnoId === a.id); return { nombre: a.nombre, moneda: a.moneda || "Q", total: ss.reduce((x, s) => x + (s.cobro || 0), 0), min: ss.reduce((x, s) => x + s.duracion, 0), n: ss.length }; }).filter((x) => x.n > 0).sort((x, y) => y.total - x.total), [org.alumnos, sesionesMesEmpresa]);
  const porTutor = useMemo(() => org.tutores.filter((t) => t.id !== pid).map((t) => { const ss = sesionesMes.filter((s) => s.tutorId === t.id); return { nombre: t.nombre, total: ss.reduce((x, s) => x + (s.pago || 0), 0), min: ss.reduce((x, s) => x + s.duracion, 0), n: ss.length }; }).filter((x) => x.n > 0).sort((x, y) => y.total - x.total), [org.tutores, sesionesMes, pid]);

  const periodo = fmtPeriodo(mes);

  return (
    <>
      <div className="tut-stats">
        <div className="tut-stat"><div className="v">{sesionesMes.length}</div><div className="l">Clases · {periodo}</div></div>
        <div className="tut-stat"><div className="v">{(minTotal / 60).toFixed(1)}</div><div className="l">Horas dadas (solo Q)</div></div>
        <div className="tut-stat"><div className="v">{fmtQ(ingresosQ)}</div><div className="l">Ingresos empresa (Q)</div></div>
        <div className="tut-stat"><div className="v">{fmtQ(pagosQ)}</div><div className="l">Pagos a tutores (Q)</div></div>
        <div className="tut-stat"><div className={`v ${gananciaQ >= 0 ? "pos" : "neg"}`}>{fmtQ(gananciaQ)}</div><div className="l">Ganancia empresa (Q)</div></div>
        <div className="tut-stat"><div className="v">{fmtMon(ingresosUSD, "USD")}</div><div className="l">Ingresos en US$</div></div>
        {pid && <div className="tut-stat"><div className="v" style={{ color: "var(--accent)" }}>{fmtQ(dineroDiegoQ)}</div><div className="l">Dinero personal · {nombrePersonal}</div></div>}
      </div>

      <div className="tut-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div><h2 style={{ margin: 0 }}>Registrar una tutoría (como coordinador)</h2><p className="sub" style={{ margin: "4px 0 0" }}>Útil para registrar a nombre de un tutor.</p></div>
          <button className="tut-btn ghost sm" onClick={() => setAbrirReg((v) => !v)}>{abrirReg ? "Cerrar" : "Registrar tutoría"}</button>
        </div>
        {abrirReg && (
          <div style={{ marginTop: 14 }}>
            <FormSesion org={org} tutorId={regTutor} alumnosDisponibles={alumnosDeRegTutor} onRegistrar={(s) => { registrarAdmin(s); }} mostrarTutor tutoresDisponibles={org.tutores} onTutorChange={setRegTutor} registradoPor="coordinador" />
          </div>
        )}
      </div>

      {noLeidas.length > 0 && (
        <div className="tut-notif">
          <div className="tut-notif-head"><strong>Nuevas clases subidas <span className="tut-badge">{noLeidas.length}</span></strong>
            <button className="tut-link" onClick={onMarcarLeidas}>Marcar como leídas</button></div>
          <ul>{noLeidas.slice(0, 6).map((s) => <li key={s.id}><b>{nT(s.tutorId)}</b> registró clase con <b>{nA(s.alumnoId)}</b> · {fmtFecha(s.fecha)} · {fmtDur(s.duracion)}</li>)}
            {noLeidas.length > 6 && <li>…y {noLeidas.length - 6} más.</li>}</ul>
        </div>
      )}

      {(porAlumno.length > 0 || porTutor.length > 0) && (
        <div className="tut-twocol">
          <div className="tut-card">
            <h2>Ingresos por alumno</h2>
            <p className="sub">Lo generado por cada alumno en {periodo.toLowerCase()}, en su moneda.</p>
            {porAlumno.map((x) => <div className="tut-sumrow" key={x.nombre}><span>{x.nombre} <span style={{ color: "var(--ink-soft)" }}>· {x.n} ses · {fmtDur(x.min)}</span></span><span className="amt">{fmtMon(x.total, x.moneda)}</span></div>)}
            <div className="tut-sumrow" style={{ marginTop: 4 }}><b>Total en Q</b><span className="amt">{fmtQ(ingresosQ)}</span></div>
            {hayUSD && <div className="tut-sumrow"><b>Total en US$</b><span className="amt">{fmtMon(ingresosUSD, "USD")}</span></div>}
          </div>
          <div className="tut-card">
            <h2>Por pagar a cada tutor (Q)</h2>
            <p className="sub">Lo generado a favor de cada tutor en {periodo.toLowerCase()}. Siempre en quetzales. El detalle por cuenta está en Cuentas y pagos.</p>
            {porTutor.map((x) => <div className="tut-sumrow" key={x.nombre}><span>{x.nombre} <span style={{ color: "var(--ink-soft)" }}>· {x.n} ses · {fmtDur(x.min)}</span></span><span className="amt">{fmtQ(x.total)}</span></div>)}
          </div>
        </div>
      )}

      {pid && (
        <div className="tut-card" style={{ marginTop: 16, borderColor: "var(--accent)", boxShadow: "0 0 0 3px var(--accent-soft)" }}>
          <h2 style={{ color: "var(--accent)" }}>Ingresos personales · {nombrePersonal}</h2>
          <p className="sub">Clases dadas por {nombrePersonal} en {periodo.toLowerCase()}. Estos ingresos son de cuenta separada y no entran en los totales de la empresa.</p>
          {porAlumnoPersonal.length === 0
            ? <div className="tut-empty">Sin clases personales en {periodo.toLowerCase()}.</div>
            : <>
                {porAlumnoPersonal.map((x) => (
                  <div className="tut-sumrow" key={x.nombre}>
                    <span>{x.nombre} <span style={{ color: "var(--ink-soft)" }}>· {x.n} ses · {fmtDur(x.min)}</span></span>
                    <span className="amt" style={{ color: "var(--accent)" }}>{fmtQ(x.total)}</span>
                  </div>
                ))}
                <div className="tut-sumrow" style={{ marginTop: 4 }}>
                  <b>Total personal</b>
                  <span className="amt" style={{ color: "var(--accent)", fontFamily: "Space Grotesk", fontWeight: 700 }}>{fmtQ(dineroDiegoQ)}</span>
                </div>
              </>
          }
        </div>
      )}

      <div className="tut-card" style={{ marginTop: 16 }}>
        <h2>Clases registradas</h2>
        <p className="sub">{filtradas.length} clase(s) · {fmtDur(horasFiltradas)} en total. Edita los montos para casos especiales, o usa "Editar" para corregir. La ganancia se recalcula.</p>
        <div className="tut-filters">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar alumno, tutor, materia…" />
          <select value={fTutor} onChange={(e) => setFTutor(e.target.value)}><option value="">Todos los tutores</option>{org.tutores.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}</select>
          <select value={fAlumno} onChange={(e) => setFAlumno(e.target.value)}><option value="">Todos los alumnos</option>{org.alumnos.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}</select>
          <select value={fMod} onChange={(e) => setFMod(e.target.value)}><option value="">Toda modalidad</option><option>{PRES}</option><option>{LINEA}</option></select>
        </div>
        {filtradas.length === 0 ? (
          <div className="tut-empty"><div className="big">{sesionesMes.length === 0 ? `Sin clases en ${periodo.toLowerCase()}` : "Sin resultados"}</div>
            {sesionesMes.length === 0 ? "Cambia de mes con el selector de arriba o espera a que se registren sesiones." : "Prueba con otros filtros."}</div>
        ) : (
          <div className="tut-list">
            {filtradas.map((s) => {
              const sm = monS(s);
              const m = (s.cobro || 0) - (s.pago || 0);
              const relTutor = org.relaciones.filter((r) => r.tutorId === s.tutorId);
              return (
                <div className={`tut-item${idsNuevas.has(s.id) ? " fresh" : ""}`} key={s.id}>
                  <div className="tut-item-row">
                    <div>
                      <div className="name">{nA(s.alumnoId)}{sm === "USD" && <span className="tut-pill linea" style={{ marginLeft: 8 }}>US$</span>}{esP(s) && <span className="tut-pill" style={{ marginLeft: 8, background: "var(--accent-soft)", color: "var(--accent)" }}>personal</span>}{idsNuevas.has(s.id) && <span className="tut-newtag">NUEVA</span>}</div>
                      <div className="meta">Tutor: <b>{nT(s.tutorId)}</b>{s.materia ? <> · {s.materia}</> : null} · {fmtFecha(s.fecha)} · {fmtDur(s.duracion)} <span className={`tut-pill${s.modalidad === LINEA ? " linea" : ""}`}>{s.modalidad}</span>{s.registradoPor ? <span style={{ color: "var(--ink-soft)" }}> · registró: {s.registradoPor === "coordinador" ? "coordinador" : "tutor"}</span> : null}</div>
                      {s.notas && <div className="meta" style={{ marginTop: 5 }}>{s.notas}</div>}
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="tut-btn ghost sm" onClick={() => setEditId(editId === s.id ? null : s.id)}>{editId === s.id ? "Cerrar" : "Editar"}</button>
                      <BotonConfirma onConfirm={() => eliminarSesion(s.id)} />
                    </div>
                  </div>
                  {editId === s.id ? (
                    <EditorSesion sesion={s} alumnos={org.alumnos} relacionesTutor={relTutor} materias={org.materias} onGuardar={guardarSesion} onCancelar={() => setEditId(null)} />
                  ) : (
                    <div className="tut-money">
                      <div className="blk"><label>Cobro al alumno ({SIM[sm]})</label><MoneyInput value={s.cobro ?? 0} onCommit={(v) => editarMonto(s.id, "cobro", v)} style={{ width: 108, fontFamily: "Space Grotesk", fontSize: 14, border: "1px solid var(--line)", borderRadius: 8, padding: "7px 9px" }} /></div>
                      <div className="blk"><label>Pago al tutor (Q)</label><MoneyInput value={s.pago ?? 0} onCommit={(v) => editarMonto(s.id, "pago", v)} style={{ width: 108, fontFamily: "Space Grotesk", fontSize: 14, border: "1px solid var(--line)", borderRadius: 8, padding: "7px 9px" }} /></div>
                      {sm === "Q"
                        ? <div className="margen"><div className={`v ${m >= 0 ? "pos" : "neg"}`}>{fmtQ(m)}</div><div className="l">ganancia</div></div>
                        : <div className="margen"><div className="l" style={{ maxWidth: 130 }}>Cobro en US$, pago en Q (otra cuenta)</div></div>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

/* ---- Tab Materias (catálogo global que define el coordinador) ---- */
function TabMaterias({ org, guardarOrg, showToast }) {
  const [nombre, setNombre] = useState("");
  const materias = org.materias || [];
  const libre = nombre.trim() && !materias.some((m) => m.toLowerCase() === nombre.trim().toLowerCase());
  const crear = () => { if (!libre) return; guardarOrg({ ...org, materias: [...materias, nombre.trim()] }, "creó materia"); setNombre(""); showToast("Materia agregada."); };
  const eliminar = (m) => guardarOrg({ ...org, materias: materias.filter((x) => x !== m) }, "eliminó materia");
  const usos = (m) => org.sesiones.filter((s) => s.materia === m).length;
  return (
    <>
      <div className="tut-card">
        <h2>Materias y temas</h2>
        <p className="sub">Tú defines la lista. Al registrar una tutoría, el tutor (o tú) elige de aquí, y es obligatorio. Aplica para todos los tutores y todos los alumnos.</p>
        <div className="tut-grid">
          <div className="tut-field full"><label>Nombre de la materia o tema</label><input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Cálculo I" onKeyDown={(e) => e.key === "Enter" && crear()} />
            {nombre && !libre && <span className="tut-err">Esa materia ya existe.</span>}</div>
        </div>
        <div className="tut-actions"><button className="tut-btn" disabled={!libre} onClick={crear}>Agregar materia</button></div>
      </div>
      <div className="tut-card">
        <h2>Materias creadas ({materias.length})</h2>
        {materias.length === 0 ? <div className="tut-empty">Aún no hay materias. Agrega la primera arriba; sin materias, no se podrán registrar tutorías.</div> : (
          <div className="tut-list">
            {materias.map((m) => (
              <div className="tut-item" key={m}><div className="tut-item-row">
                <div><div className="name">{m}</div><div className="meta">{usos(m)} tutoría(s) registradas con esta materia</div></div>
                <BotonConfirma onConfirm={() => eliminar(m)} />
              </div></div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* ---- Tab Análisis ---- */
function TabAnalisis({ org, mes }) {
  const nT = (id) => org.tutores.find((t) => t.id === id)?.nombre || "—";
  const nA = (id) => org.alumnos.find((a) => a.id === id)?.nombre || "—";
  const monAl = (id) => org.alumnos.find((a) => a.id === id)?.moneda || "Q";
  const genTutor = (id) => org.tutores.find((t) => t.id === id)?.genero || "—";
  const horas = (min) => (min / 60);
  const fHoras = (min) => `${(min / 60).toFixed(1)} h`;
  const periodo = fmtPeriodo(mes);

  const pidA = org.personalTutorId || null;
  const ses = useMemo(() => org.sesiones.filter((s) => enMes(s.fecha, mes)), [org.sesiones, mes]);
  const sesEmpresa = ses.filter((s) => !pidA || s.tutorId !== pidA);
  const sesQ = sesEmpresa.filter((s) => (s.moneda || "Q") === "Q");
  const sesUSD = sesEmpresa.filter((s) => s.moneda === "USD");

  const minTotal = sesEmpresa.reduce((a, s) => a + (s.duracion || 0), 0);
  const ingresosQ = sesQ.reduce((a, s) => a + (s.cobro || 0), 0);
  const pagosQ = sesQ.reduce((a, s) => a + (s.pago || 0), 0);
  const gananciaQ = ingresosQ - pagosQ;
  const ingresosUSD = sesUSD.reduce((a, s) => a + (s.cobro || 0), 0);
  const margenPct = ingresosQ > 0 ? (gananciaQ / ingresosQ) * 100 : 0;

  // Agrupador genérico
  const agrupar = (lista, keyFn) => {
    const m = new Map();
    lista.forEach((s) => { const k = keyFn(s); if (!m.has(k)) m.set(k, []); m.get(k).push(s); });
    return m;
  };

  // Tutores por horas
  const porTutorHoras = [...agrupar(ses, (s) => s.tutorId).entries()]
    .map(([id, ss]) => ({ id, min: ss.reduce((a, s) => a + s.duracion, 0), n: ss.length, pagado: ss.reduce((a, s) => a + (s.pago || 0), 0) }))
    .sort((a, b) => b.min - a.min);

  // Alumnos por horas
  const porAlumnoHoras = [...agrupar(ses, (s) => s.alumnoId).entries()]
    .map(([id, ss]) => ({ id, min: ss.reduce((a, s) => a + s.duracion, 0), n: ss.length, cobrado: ss.reduce((a, s) => a + (s.cobro || 0), 0), moneda: monAl(id) }))
    .sort((a, b) => b.min - a.min);

  // Con quién gano más (por alumno, solo Q)
  const gananciaPorAlumno = [...agrupar(sesQ, (s) => s.alumnoId).entries()]
    .map(([id, ss]) => { const ing = ss.reduce((a, s) => a + (s.cobro || 0), 0); const pg = ss.reduce((a, s) => a + (s.pago || 0), 0); return { id, ganancia: ing - pg, ing, pct: ing > 0 ? ((ing - pg) / ing) * 100 : 0 }; })
    .sort((a, b) => b.ganancia - a.ganancia);

  // Ganancia por mes (TODOS los meses, no solo el seleccionado)
  const porMes = (() => {
    const m = agrupar(org.sesiones.filter((s) => (s.moneda || "Q") === "Q" && (!pidA || s.tutorId !== pidA)), (s) => (s.fecha || "").slice(0, 7));
    const arr = [...m.entries()].map(([ym, ss]) => { const ing = ss.reduce((a, s) => a + (s.cobro || 0), 0); const pg = ss.reduce((a, s) => a + (s.pago || 0), 0); return { ym, ing, pg, gan: ing - pg, n: ss.length, pct: ing > 0 ? ((ing - pg) / ing) * 100 : 0 }; });
    return arr.sort((a, b) => a.ym.localeCompare(b.ym));
  })();
  const maxGan = Math.max(1, ...porMes.map((m) => Math.abs(m.gan)));

  // Por modalidad (periodo, Q)
  const porModalidad = [PRES, LINEA].map((mod) => {
    const ss = sesQ.filter((s) => s.modalidad === mod);
    const ing = ss.reduce((a, s) => a + (s.cobro || 0), 0); const pg = ss.reduce((a, s) => a + (s.pago || 0), 0);
    return { mod, min: ss.reduce((a, s) => a + s.duracion, 0), n: ss.length, ing, gan: ing - pg };
  });

  // Por género de alumno (periodo): horas e ingresos (Q)
  const generoAlumno = ["M", "F"].map((g) => {
    const ss = ses.filter((s) => (org.alumnos.find((a) => a.id === s.alumnoId)?.genero || "") === g);
    const ssQ = ss.filter((s) => (s.moneda || "Q") === "Q");
    return { g, min: ss.reduce((a, s) => a + s.duracion, 0), n: ss.length, ing: ssQ.reduce((a, s) => a + (s.cobro || 0), 0) };
  });
  // Por género de tutor (periodo): horas y pagado (Q)
  const generoTutor = ["M", "F"].map((g) => {
    const ss = ses.filter((s) => genTutor(s.tutorId) === g);
    return { g, min: ss.reduce((a, s) => a + s.duracion, 0), n: ss.length, pagado: ss.reduce((a, s) => a + (s.pago || 0), 0) };
  });
  const gLabel = (g) => g === "M" ? "Masculino" : g === "F" ? "Femenino" : "—";

  if (org.sesiones.length === 0) return (
    <div className="tut-card"><div className="tut-empty"><div className="big">Aún no hay datos para analizar</div>Cuando se registren tutorías, aquí verás los reportes.</div></div>
  );

  return (
    <>
      <div className="tut-stats">
        <div className="tut-stat"><div className="v">{(minTotal / 60).toFixed(1)}</div><div className="l">Horas dadas · {periodo.toLowerCase()}</div></div>
        <div className="tut-stat"><div className="v">{ses.length}</div><div className="l">Clases</div></div>
        <div className="tut-stat"><div className={`v ${gananciaQ >= 0 ? "pos" : "neg"}`}>{fmtQ(gananciaQ)}</div><div className="l">Ganancia en Q</div></div>
        <div className="tut-stat"><div className="v">{margenPct.toFixed(1)}%</div><div className="l">Margen promedio (Q)</div></div>
      </div>

      <div className="tut-card">
        <h2>Ganancia por mes (Q)</h2>
        <p className="sub">Todos los meses con tutorías de alumnos en quetzales. El margen es la ganancia sobre los ingresos.</p>
        {porMes.length === 0 ? <div className="tut-empty">Sin datos en quetzales.</div> : (
          <>
            <div className="tut-bars" style={{ marginBottom: 18 }}>
              {porMes.map((m) => (
                <div className="tut-bar-row" key={m.ym}>
                  <div className="lbl">{MESES[+m.ym.slice(5) - 1].slice(0, 3)} {m.ym.slice(2, 4)}</div>
                  <div className="track"><div className={`fill ${m.gan < 0 ? "neg" : ""}`} style={{ width: `${Math.max(2, (Math.abs(m.gan) / maxGan) * 100)}%` }} /></div>
                  <div className="val">{fmtQ(m.gan)}</div>
                </div>
              ))}
            </div>
            <div className="tut-table-wrap">
              <table className="tut-table">
                <thead><tr><th>Mes</th><th className="num">Clases</th><th className="num">Ingresos</th><th className="num">Pagos</th><th className="num">Ganancia</th><th className="num">Margen</th></tr></thead>
                <tbody>
                  {[...porMes].reverse().map((m) => (
                    <tr key={m.ym}>
                      <td style={{ textTransform: "capitalize" }}>{fmtMes(m.ym)}</td>
                      <td className="num">{m.n}</td>
                      <td className="num">{fmtQ(m.ing)}</td>
                      <td className="num">{fmtQ(m.pg)}</td>
                      <td className={`num ${m.gan >= 0 ? "pos" : "neg"}`}>{fmtQ(m.gan)}</td>
                      <td className="num">{m.pct.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <div className="tut-twocol">
        <div className="tut-card">
          <h2>Tutores que más horas dan</h2>
          <p className="sub">En {periodo.toLowerCase()}.</p>
          <div className="tut-table-wrap"><table className="tut-table">
            <thead><tr><th>Tutor</th><th className="num">Horas</th><th className="num">Clases</th><th className="num">Pagado (Q)</th></tr></thead>
            <tbody>{porTutorHoras.map((t) => <tr key={t.id}><td>{nT(t.id)}</td><td className="num">{fHoras(t.min)}</td><td className="num">{t.n}</td><td className="num">{fmtQ(t.pagado)}</td></tr>)}</tbody>
          </table></div>
        </div>
        <div className="tut-card">
          <h2>Alumnos que más horas reciben</h2>
          <p className="sub">En {periodo.toLowerCase()}.</p>
          <div className="tut-table-wrap"><table className="tut-table">
            <thead><tr><th>Alumno</th><th className="num">Horas</th><th className="num">Clases</th><th className="num">Cobrado</th></tr></thead>
            <tbody>{porAlumnoHoras.map((a) => <tr key={a.id}><td>{nA(a.id)}</td><td className="num">{fHoras(a.min)}</td><td className="num">{a.n}</td><td className="num">{fmtMon(a.cobrado, a.moneda)}</td></tr>)}</tbody>
          </table></div>
        </div>
      </div>

      <div className="tut-card">
        <h2>Con quién ganas más (Q)</h2>
        <p className="sub">Alumnos que pagan en quetzales, ordenados por la ganancia que te dejan en {periodo.toLowerCase()}.</p>
        {gananciaPorAlumno.length === 0 ? <div className="tut-empty">Sin datos en quetzales.</div> : (
          <div className="tut-table-wrap"><table className="tut-table">
            <thead><tr><th>Alumno</th><th className="num">Ingresos</th><th className="num">Ganancia</th><th className="num">Margen</th></tr></thead>
            <tbody>{gananciaPorAlumno.map((a) => <tr key={a.id}><td>{nA(a.id)}</td><td className="num">{fmtQ(a.ing)}</td><td className={`num ${a.ganancia >= 0 ? "pos" : "neg"}`}>{fmtQ(a.ganancia)}</td><td className="num">{a.pct.toFixed(1)}%</td></tr>)}</tbody>
          </table></div>
        )}
      </div>

      <div className="tut-twocol">
        <div className="tut-card">
          <h2>Por modalidad (Q)</h2>
          <p className="sub">Presencial vs en línea en {periodo.toLowerCase()}.</p>
          <div className="tut-table-wrap"><table className="tut-table">
            <thead><tr><th>Modalidad</th><th className="num">Horas</th><th className="num">Clases</th><th className="num">Ingresos</th><th className="num">Ganancia</th></tr></thead>
            <tbody>{porModalidad.map((m) => <tr key={m.mod}><td>{m.mod}</td><td className="num">{fHoras(m.min)}</td><td className="num">{m.n}</td><td className="num">{fmtQ(m.ing)}</td><td className={`num ${m.gan >= 0 ? "pos" : "neg"}`}>{fmtQ(m.gan)}</td></tr>)}</tbody>
          </table></div>
        </div>
        <div className="tut-card">
          <h2>Por género</h2>
          <p className="sub">Horas en {periodo.toLowerCase()}.</p>
          <div className="tut-subhead" style={{ marginTop: 0 }}>Alumnos</div>
          <div className="tut-table-wrap"><table className="tut-table">
            <thead><tr><th>Género</th><th className="num">Horas</th><th className="num">Clases</th><th className="num">Ingresos (Q)</th></tr></thead>
            <tbody>{generoAlumno.map((x) => <tr key={x.g}><td>{gLabel(x.g)}</td><td className="num">{fHoras(x.min)}</td><td className="num">{x.n}</td><td className="num">{fmtQ(x.ing)}</td></tr>)}</tbody>
          </table></div>
          <div className="tut-subhead">Tutores</div>
          <div className="tut-table-wrap"><table className="tut-table">
            <thead><tr><th>Género</th><th className="num">Horas</th><th className="num">Clases</th><th className="num">Pagado (Q)</th></tr></thead>
            <tbody>{generoTutor.map((x) => <tr key={x.g}><td>{gLabel(x.g)}</td><td className="num">{fHoras(x.min)}</td><td className="num">{x.n}</td><td className="num">{fmtQ(x.pagado)}</td></tr>)}</tbody>
          </table></div>
        </div>
      </div>

      {ingresosUSD > 0 && (
        <div className="tut-card">
          <h2>Ingresos en dólares (US$)</h2>
          <p className="sub">Las tutorías en dólares se llevan aparte. En {periodo.toLowerCase()} suman {fmtMon(ingresosUSD, "USD")} en {sesUSD.length} clase(s).</p>
        </div>
      )}
    </>
  );
}

/* ---- Tab Cuentas (cobros de alumnos / pagos a tutores) ---- */
function TabCuentas({ org, guardarOrg, showToast, mes }) {

  const agregarMov = (lista, registro) => guardarOrg({ ...org, [lista]: [registro, ...org[lista]] }, "registró " + (lista === "cobros" ? "cobro de alumno" : lista === "pagosUSD" ? "pago a tutor (otra cuenta)" : "pago a tutor"));
  const eliminarMov = (lista, id) => guardarOrg({ ...org, [lista]: org[lista].filter((m) => m.id !== id) }, "eliminó movimiento de dinero");
  const monA = (id) => org.alumnos.find((a) => a.id === id)?.moneda || "Q";

  const periodo = fmtPeriodo(mes);

  const pidC = org.personalTutorId || null;
  const nombrePersonal = pidC ? (org.tutores.find((t) => t.id === pidC)?.nombre || "Diego") : "";

  // --- ALUMNOS, separados por moneda ---
  const filaAlumno = (a) => {
    const mon = a.moneda || "Q";
    const todasSes = org.sesiones.filter((s) => s.alumnoId === a.id);
    const facturado = todasSes.reduce((x, s) => x + (s.cobro || 0), 0);
    const facturadoEmpresa = todasSes.filter((s) => !pidC || s.tutorId !== pidC).reduce((x, s) => x + (s.cobro || 0), 0);
    const facturadoDiego = pidC ? todasSes.filter((s) => s.tutorId === pidC).reduce((x, s) => x + (s.cobro || 0), 0) : 0;
    const movs = org.cobros.filter((c) => c.alumnoId === a.id);
    const recibido = movs.reduce((x, c) => x + (c.monto || 0), 0);
    return { id: a.id, nombre: a.nombre, moneda: mon, generado: facturado, facturadoEmpresa, facturadoDiego, diegoNombre: facturadoDiego > 0 ? nombrePersonal : null, pagado: recibido, movs };
  };
  const [soloDeudores, setSoloDeudores] = useState(false);
  const sortSaldo = (arr) => [...arr].sort((a, b) => (b.generado - b.pagado) - (a.generado - a.pagado));
  const alumnosQ = sortSaldo(org.alumnos.filter((a) => (a.moneda || "Q") === "Q").map(filaAlumno)).filter((f) => !soloDeudores || f.generado - f.pagado > 0.005);
  const alumnosUSD = sortSaldo(org.alumnos.filter((a) => a.moneda === "USD").map(filaAlumno)).filter((f) => !soloDeudores || f.generado - f.pagado > 0.005);

  // --- TUTORES: separar el devengado según la moneda del alumno de cada sesión ---
  const filasTutoresQ = org.tutores.filter((t) => t.id !== pidC).map((t) => {
    const devengado = org.sesiones.filter((s) => s.tutorId === t.id && (s.moneda || "Q") === "Q").reduce((x, s) => x + (s.pago || 0), 0);
    const movs = org.pagos.filter((p) => p.tutorId === t.id);
    const pagado = movs.reduce((x, p) => x + (p.monto || 0), 0);
    return { id: t.id, nombre: t.nombre, moneda: "Q", generado: devengado, pagado, movs };
  }).filter((f) => f.generado > 0 || f.pagado > 0);
  // Tutorías de alumnos en US$: el pago al tutor es en Q pero de otra cuenta. Solo registro, sin cuadre.
  const tutoresOtraCuenta = org.tutores.map((t) => {
    const devengado = org.sesiones.filter((s) => s.tutorId === t.id && s.moneda === "USD").reduce((x, s) => x + (s.pago || 0), 0);
    const movs = (org.pagosUSD || []).filter((p) => p.tutorId === t.id);
    const pagado = movs.reduce((x, p) => x + (p.monto || 0), 0);
    return { id: t.id, nombre: t.nombre, moneda: "Q", generado: devengado, pagado, movs };
  }).filter((f) => f.generado > 0 || f.pagado > 0);

  // --- Totales de cabecera ---
  const debenQ = alumnosQ.reduce((x, f) => x + Math.max(0, f.generado - f.pagado), 0);
  const debenEmpresaQ = alumnosQ.reduce((x, f) => {
    if (!f.facturadoDiego) return x + Math.max(0, f.generado - f.pagado);
    return x + Math.max(0, f.facturadoEmpresa - f.pagado);
  }, 0);
  const debenUSD = alumnosUSD.reduce((x, f) => x + Math.max(0, f.generado - f.pagado), 0);
  const debesTutoresQ = filasTutoresQ.reduce((x, f) => x + Math.max(0, f.generado - f.pagado), 0);
  const debesOtraCuenta = tutoresOtraCuenta.reduce((x, f) => x + Math.max(0, f.generado - f.pagado), 0);

  // --- Conciliación: SOLO quetzales (cuenta principal). Los dólares no entran. ---
  const conc = org.conciliacion || { guardado: 0, banco: 0 };
  const cobradoQ = org.cobros.filter((c) => monA(c.alumnoId) === "Q").reduce((x, c) => x + (c.monto || 0), 0);
  const cobradoEmpresaQ = alumnosQ.reduce((x, f) => {
    if (!f.facturadoDiego) return x + f.pagado;
    return x + Math.min(f.pagado, f.facturadoEmpresa);
  }, 0);
  const pagadoTutores = org.pagos.reduce((x, p) => x + (p.monto || 0), 0);
  const gananciaAnio = cobradoEmpresaQ - pagadoTutores;
  const balance = num(conc.guardado) + gananciaAnio - debenEmpresaQ;
  const diff = num(conc.banco) - balance;
  const cuadra = Math.abs(diff) < 0.005;
  const setConc = (campo, valor) => guardarOrg({ ...org, conciliacion: { ...conc, [campo]: num(valor) } });

  return (
    <>
      <div className="tut-stats">
        <div className="tut-stat"><div className="v neg">{fmtQ(debenQ)}</div><div className="l">Te deben (Q)</div></div>
        <div className="tut-stat"><div className="v neg">{fmtMon(debenUSD, "USD")}</div><div className="l">Te deben (US$)</div></div>
        <div className="tut-stat"><div className="v neg">{fmtQ(debesTutoresQ)}</div><div className="l">Debes a tutores (Q)</div></div>
        <div className="tut-stat"><div className="v neg">{fmtQ(debesOtraCuenta)}</div><div className="l">Tutores otra cuenta (Q)</div></div>
      </div>

      {/* Conciliación: solo quetzales */}
      <div className="tut-card" style={{ marginBottom: 16 }}>
        <h2>Conciliación de caja (solo Q)</h2>
        <p className="sub">Verifica si tu banco cuadra con lo cobrado y lo pendiente de alumnos. Las tutorías en dólares no entran aquí.</p>
        <div style={{ maxWidth: 460 }}>
          <div className="tut-sumrow">
            <span>Saldo guardado (inicial)</span>
            <MoneyInput value={conc.guardado || 0} onCommit={(v) => setConc("guardado", v)}
              style={{ width: 120, fontFamily: "Space Grotesk", textAlign: "right", border: "1px solid var(--line)", borderRadius: 8, padding: "6px 9px" }} />
          </div>
          <div className="tut-sumrow">
            <span>+ Ganancia del año <span style={{ color: "var(--ink-soft)", fontWeight: 400, fontSize: "0.85em" }}>({fmtQ(cobradoEmpresaQ)} cobrado − {fmtQ(pagadoTutores)} tutores)</span></span>
            <span className="amt" style={{ color: "var(--pos)" }}>{fmtQ(gananciaAnio)}</span>
          </div>
          <div className="tut-sumrow">
            <span>− Cuentas por cobrar <span style={{ color: "var(--ink-soft)", fontWeight: 400, fontSize: "0.85em" }}>(empresa)</span></span>
            <span className="amt" style={{ color: "var(--neg)" }}>{fmtQ(debenEmpresaQ)}</span>
          </div>
          <div className="tut-sumrow" style={{ borderTop: "1px solid var(--line)", marginTop: 6, paddingTop: 8 }}>
            <b>= Balance</b>
            <span className="amt" style={{ fontFamily: "Space Grotesk", fontWeight: 700 }}>{fmtQ(balance)}</span>
          </div>
          <div className="tut-sumrow" style={{ marginTop: 10 }}>
            <span>Banco actual</span>
            <MoneyInput value={conc.banco || 0} onCommit={(v) => setConc("banco", v)}
              style={{ width: 120, fontFamily: "Space Grotesk", textAlign: "right", border: "1px solid var(--line)", borderRadius: 8, padding: "6px 9px" }} />
          </div>
          <div className="tut-sumrow" style={{ marginTop: 4 }}>
            <b>{cuadra ? "Cuadra" : "Descuadre"}</b>
            <span className="amt" style={{ color: cuadra ? "var(--pos)" : diff < 0 ? "var(--neg)" : "var(--accent)" }}>
              {cuadra ? "✓ Q0.00" : (diff > 0 ? `+${fmtQ(diff)}` : fmtQ(diff))}
            </span>
          </div>
        </div>
      </div>

      <div className="tut-twocol">
        {/* Columna izquierda: cobros de alumnos */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="tut-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 4 }}>
              <h2 style={{ margin: 0 }}>Cobros de alumnos (Q)</h2>
              <button className={`tut-btn sm ${soloDeudores ? "" : "ghost"}`} onClick={() => setSoloDeudores((v) => !v)}>
                {soloDeudores ? "Solo deudores" : "Todos"}
              </button>
            </div>
            <p className="sub">Ordenado por saldo pendiente. Registra cada pago con su fecha.</p>
            {alumnosQ.length === 0 ? <div className="tut-empty">{soloDeudores ? "Nadie debe nada." : "Ninguno todavía."}</div> : (
              <div className="tut-list">{alumnosQ.map((f) => (
                <FilaCuenta key={f.id} fila={f} modo="alumnos" mon="Q"
                  onRegistrar={(monto, fecha, nota) => { agregarMov("cobros", { id: uid(), alumnoId: f.id, monto, fecha, nota, moneda: "Q" }); showToast("Pago del alumno registrado."); }}
                  onEliminar={(mid) => eliminarMov("cobros", mid)} />
              ))}</div>
            )}
          </div>
          {alumnosUSD.length > 0 && (
            <div className="tut-card">
              <h2>Cobros de alumnos (US$)</h2>
              <p className="sub">Pista aparte en dólares. No entra en el cuadre del banco.</p>
              <div className="tut-list">{alumnosUSD.map((f) => (
                <FilaCuenta key={f.id} fila={f} modo="alumnos" mon="USD"
                  onRegistrar={(monto, fecha, nota) => { agregarMov("cobros", { id: uid(), alumnoId: f.id, monto, fecha, nota, moneda: "USD" }); showToast("Pago del alumno registrado."); }}
                  onEliminar={(mid) => eliminarMov("cobros", mid)} />
              ))}</div>
            </div>
          )}
        </div>

        {/* Columna derecha: pagos a tutores */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="tut-card">
            <h2>Pagos a tutores (Q)</h2>
            <p className="sub">Lo generado menos lo que ya le pagaste. Cuadra con el banco principal.</p>
            {filasTutoresQ.length === 0 ? <div className="tut-empty">Nada por aquí todavía.</div> : (
              <div className="tut-list">{filasTutoresQ.map((f) => (
                <FilaCuenta key={f.id} fila={f} modo="tutores" mon="Q"
                  onRegistrar={(monto, fecha, nota) => { agregarMov("pagos", { id: uid(), tutorId: f.id, monto, fecha, nota }); showToast("Pago al tutor registrado."); }}
                  onEliminar={(mid) => eliminarMov("pagos", mid)} />
              ))}</div>
            )}
          </div>
          {tutoresOtraCuenta.length > 0 && (
            <div className="tut-card">
              <h2>Pagos a tutores · tutorías US$ (otra cuenta)</h2>
              <p className="sub">En quetzales, de otra cuenta. No entra en el cuadre del banco.</p>
              <div className="tut-list">{tutoresOtraCuenta.map((f) => (
                <FilaCuenta key={f.id} fila={f} modo="tutores" mon="Q"
                  onRegistrar={(monto, fecha, nota) => { agregarMov("pagosUSD", { id: uid(), tutorId: f.id, monto, fecha, nota }); showToast("Pago al tutor registrado (otra cuenta)."); }}
                  onEliminar={(mid) => eliminarMov("pagosUSD", mid)} />
              ))}</div>
              <div className="tut-sumrow" style={{ marginTop: 8 }}><b>Total pendiente de otra cuenta</b><span className="amt">{fmtQ(debesOtraCuenta)}</span></div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function FilaCuenta({ fila, modo, mon = "Q", onRegistrar, onEliminar }) {
  const [abrirForm, setAbrirForm] = useState(false);
  const [verMovs, setVerMovs] = useState(false);
  const [monto, setMonto] = useState(""); const [fecha, setFecha] = useState(hoy()); const [nota, setNota] = useState("");
  const saldo = fila.generado - fila.pagado;
  const ok = num(monto) > 0 && fecha;
  const movsOrden = [...fila.movs].sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));

  const registrar = () => { if (!ok) return; onRegistrar(num(monto), fecha, nota.trim()); setMonto(""); setNota(""); setFecha(hoy()); setAbrirForm(false); setVerMovs(true); };

  const estado = saldo > 0.001 ? { txt: `Saldo: ${fmtMon(saldo, mon)}`, cls: "neg" } : saldo < -0.001 ? { txt: `A favor: ${fmtMon(-saldo, mon)}`, cls: "pos" } : { txt: "Al día", cls: "pos" };

  return (
    <div className="tut-item">
      <div className="tut-item-row">
        <div>
          <div className="name">{fila.nombre}</div>
          <div className="meta">{modo === "alumnos" ? "Facturado" : "Generado"} <b>{fmtMon(fila.generado, mon)}</b> · {modo === "alumnos" ? "pagado por el alumno" : "ya pagado"} <b>{fmtMon(fila.pagado, mon)}</b></div>
          {fila.diegoNombre && <div className="meta" style={{ marginTop: 2 }}>Tutorías <b>{fmtMon(fila.facturadoEmpresa, mon)}</b> <span style={{ color: "var(--accent)" }}>· {fila.diegoNombre} <b>{fmtMon(fila.facturadoDiego, mon)}</b></span></div>}
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="name" style={{ color: estado.cls === "neg" ? "var(--neg)" : "var(--pos)" }}>{estado.txt}</div>
          <button className="tut-btn ghost sm" style={{ marginTop: 6 }} onClick={() => setAbrirForm((v) => !v)}>{modo === "alumnos" ? "Registrar pago" : "Pagar al tutor"}</button>
        </div>
      </div>

      {abrirForm && (
        <div className="tut-money" style={{ alignItems: "flex-end" }}>
          <div className="blk"><label>Fecha</label><input type="date" value={fecha} max={hoy()} onChange={(e) => setFecha(e.target.value)} style={{ width: 150 }} /></div>
          <div className="blk"><label>Monto ({SIM[mon]})</label><input inputMode="decimal" value={monto} onChange={(e) => setMonto(e.target.value.replace(/[^\d.]/g, ""))} placeholder="0" /></div>
          <div className="blk" style={{ flex: 1, minWidth: 140 }}><label>Nota (opcional)</label><input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Efectivo, transferencia…" style={{ width: "100%", fontFamily: "Inter" }} /></div>
          <button className="tut-btn sm" disabled={!ok} onClick={registrar}>Guardar</button>
        </div>
      )}

      {fila.movs.length > 0 && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px dashed var(--line)" }}>
          <button className="tut-link" onClick={() => setVerMovs((v) => !v)}>{verMovs ? "Ocultar" : "Ver"} pagos registrados ({fila.movs.length})</button>
          {verMovs && (
            <div style={{ marginTop: 8 }}>
              {movsOrden.map((m) => (
                <div className="tut-sumrow" key={m.id}>
                  <span>{fmtFecha(m.fecha)}{m.nota ? <span style={{ color: "var(--ink-soft)" }}> · {m.nota}</span> : null}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 12 }}><span className="amt">{fmtMon(m.monto, mon)}</span>
                    <button className="tut-link" style={{ color: "var(--neg)" }} onClick={() => onEliminar(m.id)}>Quitar</button></span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---- Formulario de registro de tutoría (compartido tutor/admin) ---- */
function modalidadesDisponibles(rel, esUSD) {
  // una modalidad está disponible si tiene cobro > 0
  if (!rel) return [];
  const out = [];
  if ((rel.cobroPres || 0) > 0) out.push(PRES);
  if ((rel.cobroLin || 0) > 0) out.push(LINEA);
  return out;
}

function FormSesion({ org, tutorId, alumnosDisponibles, onRegistrar, mostrarTutor, tutoresDisponibles, onTutorChange, registradoPor = "tutor" }) {
  const materias = org.materias || [];
  const blank = { alumnoId: "", materia: "", fecha: hoy(), horas: "1", minutos: "0", modalidad: "", notas: "" };
  const [f, setF] = useState(blank);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const rel = org.relaciones.find((r) => r.tutorId === tutorId && r.alumnoId === f.alumnoId);
  const mods = modalidadesDisponibles(rel);
  // si el alumno elegido ya no está disponible (cambió el tutor), limpiarlo
  useEffect(() => { if (f.alumnoId && !alumnosDisponibles.some((a) => a.id === f.alumnoId)) setF((p) => ({ ...p, alumnoId: "", modalidad: "" })); }, [tutorId]);
  // ajustar modalidad si la elegida ya no aplica
  useEffect(() => { if (f.alumnoId && !mods.includes(f.modalidad)) setF((p) => ({ ...p, modalidad: mods[0] || "" })); }, [f.alumnoId, mods.join(",")]);
  const dur = (+f.horas || 0) * 60 + (+f.minutos || 0);
  const ok = tutorId && f.alumnoId && f.materia && f.modalidad && f.fecha && dur > 0;

  const enviar = () => {
    if (!ok) return;
    const alumno = org.alumnos.find((a) => a.id === f.alumnoId);
    const enLinea = f.modalidad === LINEA;
    const horas = dur / 60;
    const r2 = (x) => Math.round(x * 100) / 100;
    const cobro = rel ? r2((enLinea ? rel.cobroLin : rel.cobroPres) * horas) : 0;
    const pago = rel ? r2((enLinea ? rel.pagoLin : rel.pagoPres) * horas) : 0;
    onRegistrar({ id: uid(), tutorId, alumnoId: f.alumnoId, materia: f.materia, fecha: f.fecha, duracion: dur, modalidad: f.modalidad, notas: f.notas.trim(), cobro, pago, moneda: (alumno?.moneda || "Q"), registradoPor, subidaEn: Date.now() });
    setF(blank);
  };

  const sinMaterias = materias.length === 0;
  return (
    <div className="tut-grid">
      {mostrarTutor && (
        <div className="tut-field"><label>Tutor</label>
          <select value={tutorId || ""} onChange={(e) => onTutorChange(e.target.value)}><option value="">Elige un tutor</option>{tutoresDisponibles.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}</select></div>
      )}
      <div className="tut-field"><label>Alumno</label>
        <select value={f.alumnoId} onChange={set("alumnoId")} disabled={!tutorId}><option value="">{tutorId ? "Elige un alumno" : "Elige primero el tutor"}</option>{alumnosDisponibles.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}</select></div>
      <div className="tut-field"><label>Materia o tema (obligatorio)</label>
        <select value={f.materia} onChange={set("materia")}><option value="">{sinMaterias ? "No hay materias creadas" : "Elige"}</option>{materias.map((m) => <option key={m} value={m}>{m}</option>)}</select>
        {sinMaterias && <span className="tut-err">El coordinador debe crear materias primero.</span>}</div>
      <div className="tut-field"><label>Modalidad</label>
        <select value={f.modalidad} onChange={set("modalidad")} disabled={!f.alumnoId || mods.length === 0}>
          {mods.length === 0 ? <option value="">{f.alumnoId ? "Sin precio definido" : "Elige un alumno"}</option> : mods.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        {f.alumnoId && mods.length === 0 && <span className="tut-err">Ese alumno no tiene precio para ninguna modalidad.</span>}</div>
      <div className="tut-field"><label>Fecha</label><input type="date" value={f.fecha} max={hoy()} onChange={set("fecha")} /></div>
      <div className="tut-field"><label>Duración</label>
        <div className="tut-dur">
          <div><select value={f.horas} onChange={set("horas")} aria-label="Horas">{[0,1,2,3,4,5,6].map((h) => <option key={h} value={h}>{h} h</option>)}</select></div>
          <div><select value={f.minutos} onChange={set("minutos")} aria-label="Minutos">{[0,15,30,45].map((m) => <option key={m} value={m}>{m} min</option>)}</select></div>
        </div></div>
      <div className="tut-field full"><label>Notas (opcional)</label><textarea value={f.notas} onChange={set("notas")} placeholder="Temas vistos, tareas, observaciones…" /></div>
      <div className="tut-field full"><div className="tut-actions" style={{ margin: 0 }}><button className="tut-btn" disabled={!ok} onClick={enviar}>Registrar tutoría</button></div></div>
    </div>
  );
}

/* ---- Editor de sesión (corregir alumno, modalidad, fecha...) ---- */
function EditorSesion({ sesion, alumnos, relacionesTutor, materias = [], onGuardar, onCancelar }) {
  const [f, setF] = useState({
    alumnoId: sesion.alumnoId, materia: sesion.materia || "", fecha: sesion.fecha,
    horas: String(Math.floor(sesion.duracion / 60)), minutos: String(sesion.duracion % 60),
    modalidad: sesion.modalidad, notas: sesion.notas || "",
  });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const dur = (+f.horas || 0) * 60 + (+f.minutos || 0);
  const ok = f.alumnoId && f.materia && f.fecha && dur > 0;
  // incluir la materia actual aunque ya no esté en el catálogo, para no perderla
  const opcionesMat = materias.includes(f.materia) || !f.materia ? materias : [f.materia, ...materias];

  const guardar = () => {
    if (!ok) return;
    const cambioMontos = f.alumnoId !== sesion.alumnoId || f.modalidad !== sesion.modalidad || dur !== sesion.duracion;
    let cobro = sesion.cobro, pago = sesion.pago;
    if (cambioMontos) {
      const rel = relacionesTutor.find((r) => r.alumnoId === f.alumnoId);
      const enLin = f.modalidad === LINEA;
      const horas = dur / 60;
      const r2 = (x) => Math.round(x * 100) / 100;
      cobro = rel ? r2((enLin ? rel.cobroLin : rel.cobroPres) * horas) : 0;
      pago = rel ? r2((enLin ? rel.pagoLin : rel.pagoPres) * horas) : 0;
    }
    const nuevaMon = (alumnos.find((a) => a.id === f.alumnoId)?.moneda) || sesion.moneda || "Q";
    onGuardar({ ...sesion, alumnoId: f.alumnoId, materia: f.materia, fecha: f.fecha, duracion: dur, modalidad: f.modalidad, notas: f.notas.trim(), cobro, pago, moneda: nuevaMon });
  };

  return (
    <div style={{ marginTop: 10, paddingTop: 12, borderTop: "1px dashed var(--line)" }}>
      <div className="tut-grid">
        <div className="tut-field"><label>Alumno</label><select value={f.alumnoId} onChange={set("alumnoId")}>{alumnos.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}</select></div>
        <div className="tut-field"><label>Materia o tema (obligatorio)</label><select value={f.materia} onChange={set("materia")}><option value="">Elige</option>{opcionesMat.map((m) => <option key={m} value={m}>{m}</option>)}</select></div>
        <div className="tut-field"><label>Fecha</label><input type="date" value={f.fecha} max={hoy()} onChange={set("fecha")} /></div>
        <div className="tut-field"><label>Modalidad</label><select value={f.modalidad} onChange={set("modalidad")}><option>{PRES}</option><option>{LINEA}</option></select></div>
        <div className="tut-field"><label>Duración</label><div className="tut-dur">
          <div><select value={f.horas} onChange={set("horas")}>{[0,1,2,3,4,5,6].map((h) => <option key={h} value={h}>{h} h</option>)}</select></div>
          <div><select value={f.minutos} onChange={set("minutos")}>{[0,15,30,45].map((m) => <option key={m} value={m}>{m} min</option>)}</select></div>
        </div></div>
        <div className="tut-field full"><label>Comentarios</label><textarea value={f.notas} onChange={set("notas")} /></div>
      </div>
      <div className="tut-actions">
        <button className="tut-btn sm" disabled={!ok} onClick={guardar}>Guardar cambios</button>
        <button className="tut-btn ghost sm" onClick={onCancelar}>Cancelar</button>
      </div>
    </div>
  );
}

/* ---------------------------- Vista Tutor ------------------------- */
function VistaTutor({ org, tutor, guardarOrg, showToast }) {
  const misRel = useMemo(() => org.relaciones.filter((r) => r.tutorId === tutor.id), [org.relaciones, tutor.id]);
  const misAlumnos = useMemo(() => misRel.map((r) => org.alumnos.find((a) => a.id === r.alumnoId)).filter(Boolean), [misRel, org.alumnos]);
  const [per, setPer] = useState(mesActual());
  const [fAlumno, setFAlumno] = useState("");
  const [fMod, setFMod] = useState("");

  const registrar = (ses) => { guardarOrg({ ...org, sesiones: [ses, ...org.sesiones] }, "registró clase (tutor)"); showToast("Clase registrada. El coordinador recibirá el aviso."); };

  const mias = useMemo(() => org.sesiones
    .filter((s) => s.tutorId === tutor.id)
    .filter((s) => enMes(s.fecha, per))
    .filter((s) => !fAlumno || s.alumnoId === fAlumno)
    .filter((s) => !fMod || s.modalidad === fMod)
    .sort((a, b) => (b.fecha || "").localeCompare(a.fecha || "")), [org.sesiones, tutor.id, per, fAlumno, fMod]);
  const totalMin = mias.reduce((a, s) => a + s.duracion, 0);

  // Financiero: sobre TODAS las sesiones del periodo (sin filtro alumno/mod)
  const todasEnPeriodo = useMemo(() => org.sesiones.filter((s) => s.tutorId === tutor.id && enMes(s.fecha, per)), [org.sesiones, tutor.id, per]);
  const totalDevengado = todasEnPeriodo.reduce((a, s) => a + (s.pago || 0), 0);
  const pagosRecibidos = useMemo(() => (org.pagos || []).filter((p) => p.tutorId === tutor.id && enMes(p.fecha, per)), [org.pagos, tutor.id, per]);
  const totalRecibido = pagosRecibidos.reduce((a, p) => a + (p.monto || 0), 0);
  const pendiente = totalDevengado - totalRecibido;

  if (misAlumnos.length === 0) return (
    <div className="tut-card"><div className="tut-empty"><div className="big">Todavía no tienes alumnos asignados</div>El coordinador te asignará alumnos y aparecerán aquí para registrar tus clases.</div></div>
  );

  return (
    <>
      <div className="tut-card">
        <h2>Registrar una clase</h2>
        <p className="sub">Solo aparecen tus alumnos. La materia es obligatoria y la modalidad depende del precio que tenga cada alumno. Si te equivocas, avísale al coordinador para que lo corrija.</p>
        <FormSesion org={org} tutorId={tutor.id} alumnosDisponibles={misAlumnos} onRegistrar={registrar} registradoPor="tutor" />
      </div>

      <div className="tut-card">
        <h2>Tus clases y pagos</h2>
        <div className="tut-filters" style={{ marginBottom: 8 }}>
          <SelectorMes mes={per} setMes={setPer} />
          <select value={fAlumno} onChange={(e) => setFAlumno(e.target.value)}><option value="">Todos mis alumnos</option>{misAlumnos.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}</select>
          <select value={fMod} onChange={(e) => setFMod(e.target.value)}><option value="">Toda modalidad</option><option>{PRES}</option><option>{LINEA}</option></select>
        </div>

        <div className="tut-stats" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 16 }}>
          <div className="tut-stat"><div className="v">{fmtQ(totalDevengado)}</div><div className="l">Generado en {fmtPeriodo(per)}</div></div>
          <div className="tut-stat"><div className="v pos">{fmtQ(totalRecibido)}</div><div className="l">Ya cobrado</div></div>
          <div className="tut-stat"><div className={`v ${pendiente > 0.005 ? "neg" : "pos"}`}>{fmtQ(pendiente)}</div><div className="l">Pendiente por cobrar</div></div>
        </div>

        <p className="sub" style={{ marginBottom: 10 }}>{mias.length} clase(s) · {fmtDur(totalMin)} en total. Esta es solo tu vista; las correcciones las hace el coordinador.</p>
        {mias.length === 0 ? <div className="tut-empty">Sin clases en este filtro.</div> : (
          <div className="tut-list">
            {mias.map((s) => {
              const a = org.alumnos.find((x) => x.id === s.alumnoId);
              return (
                <div className="tut-item" key={s.id}>
                  <div className="tut-item-row">
                    <div>
                      <div className="name">{a?.nombre || "Alumno"}</div>
                      <div className="meta">{s.materia ? <>{s.materia} · </> : null}{fmtFecha(s.fecha)} · {fmtDur(s.duracion)} <span className={`tut-pill${s.modalidad === LINEA ? " linea" : ""}`}>{s.modalidad}</span></div>
                      {s.notas && <div className="meta" style={{ marginTop: 4 }}>{s.notas}</div>}
                    </div>
                    {(s.pago || 0) > 0 && <div style={{ textAlign: "right", flexShrink: 0 }}><div className="v" style={{ fontFamily: "Space Grotesk", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{fmtQ(s.pago)}</div></div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
