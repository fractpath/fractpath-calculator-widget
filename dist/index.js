import { jsx as a, jsxs as c, Fragment as ue } from "react/jsx-runtime";
import { useMemo as O, useState as P, useRef as de, useEffect as ae, useCallback as N } from "react";
import { createPortal as Ke } from "react-dom";
function D(e) {
  return Math.round((e + Number.EPSILON) * 100) / 100;
}
function Oe(e) {
  return Math.round((e + Number.EPSILON) * 1e6) / 1e6;
}
function Xe(e) {
  return Math.round((e + Number.EPSILON) * 1e4) / 1e4;
}
const ze = 1e3, we = 1e-10;
function ce(e, t) {
  let n = 0;
  for (let r = 0; r < t.length; r++)
    n += t[r] / Math.pow(1 + e, r);
  return n;
}
function Je(e, t) {
  let n = 0;
  for (let r = 1; r < t.length; r++)
    n += -r * t[r] / Math.pow(1 + e, r + 1);
  return n;
}
function Qe(e) {
  if (e.length < 2)
    return null;
  let t = 0.01;
  for (let n = 0; n < ze; n++) {
    const r = ce(t, e), o = Je(t, e);
    if (Math.abs(o) < 1e-20)
      return ge(e);
    const i = t - r / o;
    if (i <= -1)
      return ge(e);
    if (Math.abs(i - t) < we)
      return Oe(i);
    t = i;
  }
  return ge(e);
}
function ge(e) {
  let t = -0.999, n = 10;
  const r = ce(t, e), o = ce(n, e);
  if (r * o > 0)
    return null;
  for (let i = 0; i < ze; i++) {
    const l = (t + n) / 2, p = ce(l, e);
    if (Math.abs(p) < we || (n - t) / 2 < we)
      return Oe(l);
    p * ce(t, e) < 0 ? n = l : t = l;
  }
  return null;
}
function Ze(e) {
  const t = Math.pow(1 + e, 12) - 1;
  return Xe(t);
}
function et(e) {
  const t = Qe(e);
  return t === null ? 0 : Ze(t);
}
const tt = "10.2.0";
function he(e, t) {
  const n = Math.floor(t.exit_year * 12), r = Math.min(e.number_of_payments, n), o = D(e.upfront_payment + nt(e.monthly_payment, r)), i = D(at(e, t)), l = rt(e, t.annual_appreciation, r), p = D(i * l), m = D(p - o), _ = ot(e, t.exit_year), g = D(o + m * _), x = D(o * e.floor_multiple), f = D(o * e.ceiling_multiple), d = D(it(e.downside_mode, g, x, f)), { isa_settlement: w, dyf_floor_amount: E, dyf_applied: Y } = lt(e, t.exit_year, o, d), H = D(w - o), k = D(o > 0 ? w / o : 0), W = st(e, r, n, w), h = et(W), M = ct(e, t.annual_appreciation, r);
  return {
    invested_capital_total: o,
    vested_equity_percentage: l,
    projected_fmv: i,
    base_equity_value: p,
    gain_above_capital: m,
    timing_factor_applied: _,
    isa_pre_floor_cap: g,
    floor_amount: x,
    ceiling_amount: f,
    isa_standard_pre_dyf: d,
    isa_settlement: w,
    dyf_floor_amount: E,
    dyf_applied: Y,
    investor_profit: H,
    investor_multiple: k,
    investor_irr_annual: h,
    realtor_fee_total_projected: M.realtor_fee_total_projected,
    realtor_fee_upfront_projected: M.realtor_fee_upfront_projected,
    realtor_fee_installments_projected: M.realtor_fee_installments_projected,
    buyer_realtor_fee_total_projected: M.buyer_realtor_fee_total_projected,
    seller_realtor_fee_total_projected: M.seller_realtor_fee_total_projected,
    investor_irr_annual_net: null,
    compute_version: tt
  };
}
function nt(e, t) {
  return e * t;
}
function at(e, t) {
  return t.fmv_override !== void 0 && t.fmv_override !== null && t.fmv_override > 0 ? t.fmv_override : e.property_value * Math.pow(1 + t.annual_appreciation, t.exit_year);
}
function rt(e, t, n) {
  const r = e.upfront_payment / e.property_value;
  let o = 0;
  for (let i = 1; i <= n; i++) {
    const l = e.property_value * Math.pow(1 + t, i / 12);
    o += e.monthly_payment / l;
  }
  return r + o;
}
function ot(e, t) {
  return t < e.payback_window_start_year ? e.timing_factor_early : t > e.payback_window_end_year ? e.timing_factor_late : 1;
}
function it(e, t, n, r) {
  return Math.min(e === "HARD_FLOOR" ? Math.max(t, n) : t, r);
}
function lt(e, t, n, r) {
  if (!e.duration_yield_floor_enabled || e.duration_yield_floor_start_year == null || e.duration_yield_floor_min_multiple == null)
    return { isa_settlement: r, dyf_floor_amount: null, dyf_applied: !1 };
  const o = D(n * e.duration_yield_floor_min_multiple);
  return t >= e.duration_yield_floor_start_year && r < o ? { isa_settlement: o, dyf_floor_amount: o, dyf_applied: !0 } : { isa_settlement: r, dyf_floor_amount: o, dyf_applied: !1 };
}
function st(e, t, n, r) {
  const o = new Array(n + 1).fill(0);
  o[0] = -e.upfront_payment;
  for (let i = 1; i <= t; i++)
    o[i] = -e.monthly_payment;
  return o[n] += r, o;
}
function ct(e, t, n) {
  if (e.realtor_commission_payment_mode !== "PER_PAYMENT_EVENT")
    throw new Error(`realtor_commission_payment_mode must be "PER_PAYMENT_EVENT" in v10.2, got "${e.realtor_commission_payment_mode}"`);
  const r = e.realtor_representation_mode !== "NONE" ? e.realtor_commission_pct : 0;
  if (r === 0)
    return {
      realtor_fee_total_projected: 0,
      realtor_fee_upfront_projected: 0,
      realtor_fee_installments_projected: 0,
      buyer_realtor_fee_total_projected: 0,
      seller_realtor_fee_total_projected: 0
    };
  const o = D(e.upfront_payment * r), i = D(e.monthly_payment * n * r), l = D(o + i);
  let p = 0, m = 0, _ = e.upfront_payment / e.property_value;
  const g = e.upfront_payment * r;
  p += g * _, m += g * (1 - _);
  for (let x = 1; x <= n; x++) {
    const f = e.property_value * Math.pow(1 + t, x / 12);
    _ += e.monthly_payment / f;
    const d = e.monthly_payment * r;
    p += d * _, m += d * (1 - _);
  }
  return {
    realtor_fee_total_projected: l,
    realtor_fee_upfront_projected: o,
    realtor_fee_installments_projected: i,
    buyer_realtor_fee_total_projected: D(p),
    seller_realtor_fee_total_projected: D(m)
  };
}
const dt = 0.03, mt = 0.035, ut = 0.045, pt = 0.025, ft = 1.1, _t = 2, yt = 0.01, ht = 0.03, bt = 0.1, gt = 25e-4, ve = {
  homeValue: 6e5,
  initialBuyAmount: 1e5,
  termYears: 10,
  annualGrowthRate: dt,
  transferFeeRate_standard: mt,
  transferFeeRate_early: ut,
  transferFeeRate_late: pt,
  floorMultiple: ft,
  capMultiple: _t,
  vesting: {
    upfrontEquityPct: bt,
    monthlyEquityPct: gt,
    months: 120
  },
  cpw: {
    startPct: yt,
    endPct: ht
  }
}, vt = (e, t, n) => Math.min(n, Math.max(t, e));
function xt(e) {
  const t = {
    ...ve,
    ...e,
    vesting: {
      ...ve.vesting,
      ...e.vesting ?? {}
    },
    cpw: {
      ...ve.cpw,
      ...e.cpw ?? {}
    }
  }, n = Math.max(0, Math.round(t.termYears * 12));
  return t.vesting.months = n, t;
}
function wt(e, t, n) {
  const r = n / 12;
  return e * Math.pow(1 + t, r);
}
function St(e, t, n) {
  return vt(e + t * n, 0, 1);
}
function kt(e, t) {
  const n = [];
  for (let r = 0; r <= t; r++) {
    const o = wt(e.homeValue, e.annualGrowthRate, r), i = St(
      e.vesting.upfrontEquityPct,
      e.vesting.monthlyEquityPct,
      r
    );
    n.push({
      month: r,
      year: r / 12,
      homeValue: o,
      equityPct: i
    });
  }
  return n;
}
function ye(e, t) {
  const n = e.vesting.months;
  return t === "standard" ? n : t === "early" ? Math.min(36, n) : t === "late" ? n + 24 : n;
}
function Rt(e) {
  return {
    property_value: e.homeValue,
    upfront_payment: e.initialBuyAmount,
    monthly_payment: e.vesting.monthlyEquityPct * e.homeValue,
    number_of_payments: e.vesting.months,
    // Payback window + timing factors:
    // The legacy widget had TF as a transfer fee rate; canonical compute uses timing factor multipliers.
    // Until UI collects these, we default to neutral (1) and place window across the term.
    payback_window_start_year: Math.max(0, Math.floor(e.termYears / 3)),
    payback_window_end_year: Math.max(1, Math.ceil(e.termYears * 2 / 3)),
    timing_factor_early: 1,
    timing_factor_late: 1,
    floor_multiple: e.floorMultiple,
    ceiling_multiple: e.capMultiple,
    downside_mode: "HARD_FLOOR",
    // Not currently modeled in widget UI; keep deterministic defaults.
    contract_maturity_years: 30,
    liquidity_trigger_year: 13,
    minimum_hold_years: 2,
    platform_fee: 0,
    servicing_fee_monthly: 0,
    exit_fee_pct: 0,
    // DYF defaults (disabled)
    duration_yield_floor_enabled: !1,
    duration_yield_floor_start_year: null,
    duration_yield_floor_min_multiple: null,
    realtor_representation_mode: "NONE",
    realtor_commission_pct: 0,
    realtor_commission_payment_mode: "PER_PAYMENT_EVENT"
  };
}
function xe(e, t) {
  const n = ye(e, t), r = n / 12, o = Rt(e), i = he(o, {
    annual_appreciation: e.annualGrowthRate,
    exit_year: r
  }), l = i.isa_settlement === i.isa_pre_floor_cap ? "none" : i.isa_settlement === i.floor_amount ? "floor" : i.isa_settlement === i.ceiling_amount ? "cap" : "none", p = 0, m = 0, _ = i.isa_settlement;
  return {
    timing: t,
    settlementMonth: n,
    homeValueAtSettlement: i.projected_fmv,
    equityPctAtSettlement: i.vested_equity_percentage,
    rawPayout: i.isa_pre_floor_cap,
    clampedPayout: i.isa_settlement,
    transferFeeAmount: m,
    netPayout: _,
    clamp: { floor: i.floor_amount, cap: i.ceiling_amount, applied: l },
    transferFeeRate: p
  };
}
function Pt(e = {}) {
  const t = xt(e), n = Math.max(
    ye(t, "standard"),
    ye(t, "early"),
    ye(t, "late")
  ), r = kt(t, n), o = xe(t, "standard"), i = xe(t, "early"), l = xe(t, "late");
  return {
    normalizedInputs: t,
    series: r,
    settlements: { standard: o, early: i, late: l }
  };
}
function Mt(e) {
  const t = e.series.map((r) => ({
    month: r.month,
    year: r.year,
    homeValue: r.homeValue,
    equityPct: r.equityPct
  })), n = ["early", "standard", "late"].map((r) => {
    const o = e.settlements[r];
    return {
      timing: r,
      month: o.settlementMonth,
      year: o.settlementMonth / 12,
      homeValueAtSettlement: o.homeValueAtSettlement,
      equityPctAtSettlement: o.equityPctAtSettlement,
      netPayout: o.netPayout
    };
  });
  return { points: t, markers: n };
}
function Ft(e, t, n) {
  return Math.min(n, Math.max(t, e));
}
function Et(e) {
  return `${Math.round(e * 100)}%`;
}
function At(e) {
  return `${Math.round(e * 10) / 10}y`;
}
function Tt(e) {
  return e.timing === "early" ? "Early" : e.timing === "late" ? "Late" : "Std";
}
const Dt = {
  early: "#ca8a04",
  standard: "#0891b2",
  late: "#c026d3"
};
function Ct({ series: e, width: t = 640, height: n = 260 }) {
  const { points: r, markers: o } = e, i = O(
    () => `eq-${Math.random().toString(36).slice(2, 8)}`,
    []
  );
  if (!r.length)
    return /* @__PURE__ */ a("div", { style: { fontFamily: "system-ui, sans-serif" }, children: "No data" });
  const l = { top: 20, right: 24, bottom: 36, left: 50 }, p = Math.max(10, t - l.left - l.right), m = Math.max(10, n - l.top - l.bottom), _ = r[0].month, g = r[r.length - 1].month, x = 0, f = 1, d = (h) => g === _ ? l.left : l.left + (h - _) / (g - _) * p, w = (h) => {
    const M = Ft(h, x, f);
    return l.top + (1 - (M - x) / (f - x)) * m;
  }, E = r.map((h, M) => {
    const A = d(h.month), ee = w(h.equityPct);
    return `${M === 0 ? "M" : "L"} ${A.toFixed(2)} ${ee.toFixed(2)}`;
  }).join(" "), Y = r.length * 20, H = [0, 0.25, 0.5, 0.75, 1].map((h) => ({
    v: h,
    y: w(h),
    label: Et(h)
  })), k = Math.round((_ + g) / 2), W = [_, k, g].map((h) => ({
    m: h,
    x: d(h),
    label: At(h / 12)
  }));
  return /* @__PURE__ */ c(
    "svg",
    {
      width: "100%",
      height: n,
      viewBox: `0 0 ${t} ${n}`,
      preserveAspectRatio: "xMidYMid meet",
      role: "img",
      "aria-label": "Equity over time",
      style: { display: "block" },
      children: [
        /* @__PURE__ */ a("style", { children: `
        @keyframes ${i}-draw {
          from { stroke-dashoffset: ${Y}; }
          to { stroke-dashoffset: 0; }
        }
      ` }),
        /* @__PURE__ */ a("rect", { x: 0, y: 0, width: t, height: n, fill: "white", rx: 8 }),
        H.map((h) => /* @__PURE__ */ c("g", { children: [
          /* @__PURE__ */ a(
            "line",
            {
              x1: l.left,
              x2: t - l.right,
              y1: h.y,
              y2: h.y,
              stroke: "#f3f4f6",
              strokeWidth: 1
            }
          ),
          /* @__PURE__ */ a(
            "text",
            {
              x: l.left - 10,
              y: h.y + 4,
              fontSize: 11,
              textAnchor: "end",
              fill: "#9ca3af",
              fontFamily: "system-ui, sans-serif",
              children: h.label
            }
          )
        ] }, h.v)),
        /* @__PURE__ */ a(
          "line",
          {
            x1: l.left,
            x2: t - l.right,
            y1: l.top + m,
            y2: l.top + m,
            stroke: "#e5e7eb",
            strokeWidth: 1
          }
        ),
        W.map((h) => /* @__PURE__ */ c("g", { children: [
          /* @__PURE__ */ a(
            "line",
            {
              x1: h.x,
              x2: h.x,
              y1: l.top + m,
              y2: l.top + m + 6,
              stroke: "#d1d5db",
              strokeWidth: 1
            }
          ),
          /* @__PURE__ */ a(
            "text",
            {
              x: h.x,
              y: l.top + m + 24,
              fontSize: 11,
              textAnchor: "middle",
              fill: "#9ca3af",
              fontFamily: "system-ui, sans-serif",
              children: h.label
            }
          )
        ] }, h.m)),
        o.map((h) => {
          const M = d(h.month), A = Dt[h.timing] || "#d1d5db";
          return /* @__PURE__ */ c("g", { children: [
            /* @__PURE__ */ a(
              "line",
              {
                x1: M,
                x2: M,
                y1: l.top,
                y2: l.top + m,
                stroke: A,
                strokeWidth: 1,
                strokeDasharray: "4 4"
              }
            ),
            /* @__PURE__ */ a(
              "rect",
              {
                x: M - 18,
                y: l.top - 4,
                width: 36,
                height: 18,
                rx: 9,
                fill: "#f9fafb",
                stroke: A,
                strokeWidth: 1
              }
            ),
            /* @__PURE__ */ a(
              "text",
              {
                x: M,
                y: l.top + 10,
                fontSize: 10,
                textAnchor: "middle",
                fill: A,
                fontFamily: "system-ui, sans-serif",
                fontWeight: 600,
                children: Tt(h)
              }
            )
          ] }, h.timing);
        }),
        /* @__PURE__ */ a(
          "path",
          {
            d: E,
            fill: "none",
            stroke: "#0891b2",
            strokeWidth: 2.5,
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeDasharray: Y,
            strokeDashoffset: 0,
            style: {
              animation: `${i}-draw 1s ease-out forwards`
            }
          }
        ),
        /* @__PURE__ */ a(
          "text",
          {
            x: l.left,
            y: 14,
            fontSize: 12,
            fill: "#6b7280",
            fontFamily: "system-ui, sans-serif",
            fontWeight: 500,
            children: "Equity ownership over time"
          }
        )
      ]
    }
  );
}
function y(e) {
  return e.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });
}
function V(e) {
  return `${(e * 100).toFixed(1)}%`;
}
function Fe(e) {
  const t = Math.floor(e / 12), n = e % 12;
  return t === 0 ? `${n}mo` : n === 0 ? `${t}yr` : `${t}yr ${n}mo`;
}
const Ee = {
  homeowner: {
    heroLabel: "Your Net Payout",
    heroValue: (e) => e.settlements.standard.netPayout,
    helperText: "Estimated net payout at standard settlement timing."
  },
  buyer: {
    heroLabel: "Projected Net Return",
    heroValue: (e) => e.settlements.standard.netPayout,
    helperText: "Projected net return at standard settlement timing."
  },
  investor: {
    heroLabel: "Projected Net Return",
    heroValue: (e) => e.settlements.standard.netPayout,
    helperText: "Projected net return at standard settlement timing."
  },
  realtor: {
    heroLabel: "Standard Net Payout",
    heroValue: (e) => e.settlements.standard.netPayout,
    helperText: "Standard net payout for commission reference."
  },
  ops: {
    heroLabel: "Standard Net Payout",
    heroValue: (e) => e.settlements.standard.netPayout,
    helperText: "Standard net payout at projected settlement."
  }
};
function Yn(e) {
  return Ee[e] ?? Ee.homeowner;
}
const Nt = {
  homeowner: {
    "deal_terms.property_value": "Your Home Value",
    "deal_terms.upfront_payment": "Initial Payment",
    "scenario.exit_year": "When You'd Settle"
  },
  buyer: {
    "deal_terms.property_value": "Property Value",
    "deal_terms.upfront_payment": "Upfront Investment",
    "scenario.exit_year": "Target Exit Year"
  },
  investor: {
    "deal_terms.property_value": "Asset Value",
    "deal_terms.upfront_payment": "Capital Deployed",
    "scenario.exit_year": "Target Exit Year",
    "deal_terms.monthly_payment": "Monthly Tranche"
  },
  realtor: {
    "deal_terms.property_value": "Property Value",
    "deal_terms.upfront_payment": "Upfront Payment",
    "deal_terms.realtor_commission_pct": "Your Commission (%)",
    "deal_terms.realtor_representation_mode": "Your Representation"
  },
  ops: {
    "deal_terms.property_value": "Property Value (FMV)",
    "deal_terms.upfront_payment": "Upfront Payment"
  }
};
function Z(e, t, n) {
  return Nt[t]?.[e] ?? n;
}
const Ae = {
  homeowner: ["hero", "net_payout", "settlement_timing", "total_invested", "fees"],
  buyer: ["hero", "net_payout", "total_invested", "settlement_timing", "fees"],
  investor: ["hero", "net_payout", "total_invested", "fees", "settlement_timing"],
  realtor: ["hero", "fees", "net_payout", "settlement_timing", "total_invested"],
  ops: ["hero", "net_payout", "fees", "total_invested", "settlement_timing"]
};
function Ln(e) {
  return Ae[e] ?? Ae.homeowner;
}
const I = {
  platform_fee: 2500,
  servicing_fee_monthly: 49,
  exit_fee_pct: 0.01
}, re = "10.2.0", oe = "1";
function Ie(e) {
  const t = {};
  for (const n of Object.keys(e).sort()) {
    const r = e[n];
    r !== null && typeof r == "object" && !Array.isArray(r) ? t[n] = Ie(r) : t[n] = r;
  }
  return JSON.stringify(t);
}
async function ie(e) {
  const t = Ie(e), n = new TextEncoder().encode(t), r = await crypto.subtle.digest("SHA-256", n);
  return Array.from(new Uint8Array(r)).map((i) => i.toString(16).padStart(2, "0")).join("");
}
function $e(e) {
  return {
    homeValue: e.homeValue,
    initialBuyAmount: e.initialBuyAmount,
    termYears: e.termYears,
    annualGrowthRate: e.annualGrowthRate
  };
}
function Ot(e) {
  return {
    standard_net_payout: e.settlements.standard.netPayout,
    early_net_payout: e.settlements.early.netPayout,
    late_net_payout: e.settlements.late.netPayout,
    standard_settlement_month: e.settlements.standard.settlementMonth,
    early_settlement_month: e.settlements.early.settlementMonth,
    late_settlement_month: e.settlements.late.settlementMonth
  };
}
function zt(e) {
  return {
    standard_net_payout: e.settlements.standard.netPayout,
    early_net_payout: e.settlements.early.netPayout,
    late_net_payout: e.settlements.late.netPayout
  };
}
async function jn(e, t, n) {
  const r = $e(t), o = Ot(n), [i, l] = await Promise.all([
    ie(r),
    ie(o)
  ]);
  return {
    contract_version: re,
    schema_version: oe,
    persona: e,
    mode: "marketing",
    inputs: r,
    basic_results: o,
    input_hash: i,
    output_hash: l,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
}
function Hn(e, t, n) {
  return {
    contract_version: re,
    schema_version: oe,
    persona: e,
    inputs: $e(t),
    basic_results: zt(n),
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
}
async function qn(e, t, n) {
  const [r, o] = await Promise.all([
    ie(t),
    ie({
      standard: n.settlements.standard,
      early: n.settlements.early,
      late: n.settlements.late
    })
  ]);
  return {
    contract_version: re,
    schema_version: oe,
    persona: e,
    mode: "app",
    inputs: t,
    outputs: n,
    input_hash: r,
    output_hash: o,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
}
function It(e) {
  return {
    property_value: e.homeValue,
    upfront_payment: e.initialBuyAmount,
    // Default: monthly_payment derived from vesting schedule; 0 if absent
    monthly_payment: e.vesting?.monthlyEquityPct ? e.vesting.monthlyEquityPct * e.homeValue : 0,
    number_of_payments: e.vesting?.months ?? e.termYears * 12,
    // Default payback windows: start at year 3, end at contract maturity
    payback_window_start_year: 3,
    payback_window_end_year: e.termYears,
    // Default timing factors: 0.85 early penalty, 1.10 late bonus
    timing_factor_early: 0.85,
    timing_factor_late: 1.1,
    floor_multiple: e.floorMultiple,
    ceiling_multiple: e.capMultiple,
    downside_mode: "HARD_FLOOR",
    contract_maturity_years: e.termYears,
    // Default: liquidity trigger at 70% of term
    liquidity_trigger_year: Math.floor(e.termYears * 0.7),
    // Default: minimum 1-year hold
    minimum_hold_years: 1,
    platform_fee: I.platform_fee,
    servicing_fee_monthly: I.servicing_fee_monthly,
    exit_fee_pct: I.exit_fee_pct,
    // Default realtor: NONE with 0 commission, PER_PAYMENT_EVENT locked
    realtor_representation_mode: "NONE",
    realtor_commission_pct: 0,
    realtor_commission_payment_mode: "PER_PAYMENT_EVENT"
  };
}
function $t(e) {
  return {
    annual_appreciation: e.annualGrowthRate,
    // Default: 2% closing costs
    closing_cost_pct: 0.02,
    exit_year: e.termYears
  };
}
function Yt(e) {
  const t = It(e), n = $t(e), r = he(t, n), o = (/* @__PURE__ */ new Date()).toISOString();
  return {
    contract_version: re,
    schema_version: oe,
    deal_terms: t,
    assumptions: n,
    outputs: r,
    now_iso: o,
    created_at: o
  };
}
function z(e, t) {
  switch (t) {
    case "currency":
      return y(e);
    case "percent":
      return V(e);
    case "multiple":
      return `${e.toFixed(2)}×`;
    case "months":
      return `${e}`;
    case "text":
      return String(e);
  }
}
function Lt(e, t, n, r) {
  switch (e) {
    case "homeowner":
      return Ht(t, n, r);
    case "realtor":
      return qt(t, n, r);
    default:
      return jt(t, n, r);
  }
}
function jt(e, t, n) {
  const r = n.investor_profit, o = n.isa_settlement, i = n.invested_capital_total, l = n.projected_fmv, p = n.investor_multiple, m = l > 0 ? o / l : 0;
  return {
    hero: {
      label: "Projected Net Return",
      value: r,
      valueFormat: "currency",
      subtitle: `Profit at standard settlement (Year ${t.exit_year}).`
    },
    strip: [
      { label: "Net payout at settlement", value: o, valueFormat: "currency" },
      { label: "Total cash paid", value: i, valueFormat: "currency" },
      { label: "Projected home value", value: l, valueFormat: "currency" },
      { label: "Implied equity share", value: m, valueFormat: "percent" },
      { label: "Return multiple", value: p, valueFormat: "multiple" }
    ],
    chartSpec: {
      type: "bar",
      bars: [
        { label: "Total cash paid", value: i },
        { label: "Settlement payout", value: o },
        { label: "Projected home value", value: l }
      ]
    },
    marketingBullets: [
      `~${z(m, "percent")} equity built over ${t.exit_year} years — with no financing or interest.`,
      `You contribute ${z(i, "currency")} total. At settlement, payout is ${z(o, "currency")}.`,
      `Projected home value at settlement: ${z(l, "currency")} (base assumptions).`,
      `Assumes ${z(t.annual_appreciation, "percent")} annual appreciation — Save & Continue free to model different growth and timing.`
    ]
  };
}
function Ht(e, t, n) {
  const r = n.invested_capital_total, o = n.projected_fmv;
  return {
    hero: {
      label: "Lifetime Cash Unlocked",
      value: r,
      valueFormat: "currency",
      subtitle: "Cash received over the deal term (upfront + installments)."
    },
    strip: [
      { label: "Upfront cash received", value: e.upfront_payment, valueFormat: "currency" },
      { label: "Monthly cash received", value: e.monthly_payment, valueFormat: "currency" },
      { label: "Installment months", value: e.number_of_payments, valueFormat: "months" },
      { label: "Total cash unlocked", value: r, valueFormat: "currency" },
      { label: "Projected home value", value: o, valueFormat: "currency" }
    ],
    chartSpec: {
      type: "bar",
      bars: [
        { label: "Cash unlocked", value: r },
        { label: "Projected home value", value: o }
      ]
    },
    marketingBullets: [
      `Unlock ${z(r, "currency")} while continuing to own your home.`,
      `Upfront: ${z(e.upfront_payment, "currency")}. Monthly: ${z(e.monthly_payment, "currency")} for ${e.number_of_payments} months.`,
      `Projected home value at settlement: ${z(o, "currency")} (base assumptions).`,
      `Assumes ${z(t.annual_appreciation, "percent")} annual appreciation — Save & Continue free to model growth, protections, and timing.`
    ]
  };
}
function qt(e, t, n) {
  const r = n.realtor_fee_total_projected, o = n.isa_settlement, l = n.projected_fmv - o, p = e.realtor_commission_pct * 100;
  return {
    hero: {
      label: "Projected Commission (Standard)",
      value: r,
      valueFormat: "currency",
      subtitle: `Based on ${p.toFixed(1)}% as ${e.realtor_representation_mode} representation.`
    },
    strip: [
      { label: "Commission rate", value: `${p.toFixed(1)}%`, valueFormat: "text" },
      { label: "Representation", value: e.realtor_representation_mode, valueFormat: "text" },
      { label: "Commission from this deal", value: r, valueFormat: "currency" },
      {
        label: "Remaining opportunity",
        value: l > 0 ? l : 0,
        valueFormat: "currency"
      }
    ],
    chartSpec: {
      type: "bar",
      bars: [
        { label: "Commission on this deal", value: r },
        { label: "Remaining opportunity", value: l > 0 ? l : 0 }
      ]
    },
    marketingBullets: [
      `Projected commission on this deal: ${z(r, "currency")} (standard timing).`,
      `Commission rate: ${p.toFixed(1)}% as ${e.realtor_representation_mode} representation.`,
      "Capture buyers and sellers earlier — without requiring an immediate full sale or full purchase.",
      `Remaining property value at settlement (conditional): ${z(l > 0 ? l : 0, "currency")}. Save free to model scenarios.`
    ]
  };
}
const Te = ["#0891b2", "#c026d3", "#ca8a04", "#6b7280", "#374151"];
function Vt({ bars: e, width: t = 480, height: n = 220 }) {
  const r = Math.max(...e.map((g) => g.value), 1), o = Math.min(80, (t - 60) / e.length - 20), i = 36, l = n - 44, p = l - i, m = (t - 40) / e.length, _ = `bar-anim-${Math.random().toString(36).slice(2, 8)}`;
  return /* @__PURE__ */ c(
    "svg",
    {
      width: "100%",
      height: n,
      viewBox: `0 0 ${t} ${n}`,
      preserveAspectRatio: "xMidYMid meet",
      style: { display: "block" },
      role: "img",
      "aria-label": "Scenario comparison chart",
      "data-testid": "simple-bar-chart",
      children: [
        /* @__PURE__ */ a("style", { children: `
        @keyframes ${_} {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
      ` }),
        /* @__PURE__ */ a(
          "line",
          {
            x1: 20,
            x2: t - 20,
            y1: l,
            y2: l,
            stroke: "#e5e7eb",
            strokeWidth: 1
          }
        ),
        e.map((g, x) => {
          const f = r > 0 ? g.value / r * p : 0, d = 20 + x * m + (m - o) / 2, w = l - f, E = Te[x % Te.length];
          return /* @__PURE__ */ c("g", { children: [
            /* @__PURE__ */ a(
              "rect",
              {
                x: d,
                y: w,
                width: o,
                height: Math.max(f, 2),
                rx: 6,
                ry: 6,
                fill: E,
                style: {
                  transformOrigin: `${d + o / 2}px ${l}px`,
                  animation: `${_} 0.5s ease-out ${x * 0.1}s both`
                }
              }
            ),
            /* @__PURE__ */ a(
              "text",
              {
                x: d + o / 2,
                y: w - 10,
                textAnchor: "middle",
                fontSize: 11,
                fontWeight: 600,
                fill: "#111827",
                fontFamily: "system-ui, sans-serif",
                children: y(g.value)
              }
            ),
            /* @__PURE__ */ a(
              "text",
              {
                x: d + o / 2,
                y: l + 18,
                textAnchor: "middle",
                fontSize: 10,
                fill: "#6b7280",
                fontFamily: "system-ui, sans-serif",
                children: g.label.length > 20 ? g.label.slice(0, 18) + "…" : g.label
              }
            )
          ] }, x);
        })
      ]
    }
  );
}
const Wt = [
  {
    key: "deal_terms.property_value",
    label: "Property value (FMV)",
    unit: "currency",
    control: "slider",
    simpleDefinition: "How much the home is worth right now.",
    impact: "It affects how much equity your payments buy and how the deal grows over time.",
    formula: "equity_upfront = upfront_payment / property_value; property_value_m starts from property_value",
    slider: { min: 1e5, max: 3e6, step: 1e4 },
    recommendedRange: { min: 2e5, max: 15e5 },
    hardRange: { min: 1e5, max: 3e6 },
    sectionHint: "Payments"
  },
  {
    key: "deal_terms.upfront_payment",
    label: "Upfront payment",
    unit: "currency",
    control: "kiosk",
    simpleDefinition: "Money paid at the start of the deal.",
    impact: "It buys equity right away. For MVP, upfront payment is capped so total equity transfer can't exceed a safe share of the home value.",
    formula: "invested_capital_total = upfront_payment + monthly_payment * payments_made_by_exit; equity_upfront = upfront_payment / property_value",
    dynamicPercentAnchors: {
      sourceKey: "deal_terms.property_value",
      percents: [0.05, 0.1, 0.15, 0.2],
      rounding: "nearest_100",
      min: 0,
      maxPercentOfSource: 0.5,
      labelPercents: ["5%", "10%", "15%", "20%"]
    },
    recommendedRange: { min: 0, max: 3e5 },
    hardRange: { min: 0, max: 15e5 },
    sectionHint: "Payments"
  },
  {
    key: "deal_terms.monthly_payment",
    label: "Monthly payment",
    unit: "currency",
    control: "kiosk",
    simpleDefinition: "Money paid each month during the deal.",
    impact: "Monthly payments buy equity over time, based on the home value each month.",
    formula: "equity_m = monthly_payment / property_value_m",
    dynamicPercentAnchors: {
      sourceKey: "deal_terms.property_value",
      percents: [0, 1e-3, 2e-3, 3e-3],
      rounding: "nearest_100",
      min: 0,
      labelPercents: ["0%", "0.1%", "0.2%", "0.3%"]
    },
    recommendedRange: { min: 0, max: 3e3 },
    hardRange: { min: 0, max: 25e3 },
    sectionHint: "Payments"
  },
  {
    key: "deal_terms.number_of_payments",
    label: "Number of monthly payments",
    unit: "months",
    control: "slider",
    simpleDefinition: "How many monthly payments you plan to make.",
    impact: "More months means more total payments and more equity purchased over time.",
    formula: "payments_made_by_exit = min(number_of_payments, exit_month)",
    slider: { min: 0, max: 120, step: 1 },
    recommendedRange: { min: 0, max: 120 },
    hardRange: { min: 0, max: 120 },
    sectionHint: "Payments"
  },
  {
    key: "scenario.annual_appreciation",
    label: "Annual appreciation",
    unit: "percent",
    control: "kiosk",
    simpleDefinition: "How fast the home value grows (or drops) each year.",
    impact: "It changes the future home value, which changes how much equity each monthly payment buys.",
    formula: "property_value_m = property_value * (1 + annual_appreciation)^(m/12)",
    anchors: [
      { label: "0%", value: 0 },
      { label: "2%", value: 0.02 },
      { label: "4%", value: 0.04 },
      { label: "6%", value: 0.06 }
    ],
    recommendedRange: { min: -0.05, max: 0.08 },
    hardRange: { min: -0.5, max: 0.5 },
    sectionHint: "Assumptions"
  },
  {
    key: "scenario.exit_year",
    label: "Exit year",
    unit: "years",
    control: "kiosk",
    simpleDefinition: "When the deal ends (like 5 years).",
    impact: "It sets how long the equity has to grow and how many payments count before exit.",
    formula: "exit_month = floor(exit_year * 12); projected_fmv = property_value * (1 + annual_appreciation)^exit_year",
    anchors: [
      { label: "3", value: 3 },
      { label: "5", value: 5 },
      { label: "7", value: 7 },
      { label: "10", value: 10 }
    ],
    recommendedRange: { min: 3, max: 10 },
    hardRange: { min: 0.5, max: 30 },
    sectionHint: "Assumptions"
  },
  {
    key: "scenario.closing_cost_pct",
    label: "Closing costs (%)",
    unit: "percent",
    control: "kiosk",
    simpleDefinition: "Extra costs paid when the deal closes (as a percent).",
    impact: "Closing costs reduce the net proceeds at exit and can change the settlement amount.",
    formula: "net_at_exit = gross_at_exit - (closing_cost_pct * projected_fmv) (conceptual)",
    anchors: [
      { label: "0%", value: 0 },
      { label: "1%", value: 0.01 },
      { label: "2%", value: 0.02 },
      { label: "3%", value: 0.03 }
    ],
    recommendedRange: { min: 0, max: 0.04 },
    hardRange: { min: 0, max: 0.1 },
    sectionHint: "Assumptions"
  },
  {
    key: "deal_terms.floor_multiple",
    label: "Floor multiple",
    unit: "number",
    control: "kiosk",
    simpleDefinition: "The minimum return multiple allowed at settlement.",
    impact: "It protects one side from getting too little back if the home performs poorly.",
    formula: "settlement_multiple = max(floor_multiple, raw_multiple) (then capped by ceiling)",
    anchors: [
      { label: "1.00×", value: 1 },
      { label: "1.05×", value: 1.05 },
      { label: "1.10×", value: 1.1 },
      { label: "1.20×", value: 1.2 }
    ],
    recommendedRange: { min: 1, max: 1.2 },
    hardRange: { min: 0.5, max: 2 },
    sectionHint: "Protections"
  },
  {
    key: "deal_terms.ceiling_multiple",
    label: "Ceiling multiple",
    unit: "number",
    control: "kiosk",
    simpleDefinition: "The maximum return multiple allowed at settlement.",
    impact: "It caps outcomes so the settlement can't grow beyond the agreed maximum.",
    formula: "settlement_multiple = min(ceiling_multiple, settlement_multiple_after_floor)",
    anchors: [
      { label: "1.30×", value: 1.3 },
      { label: "1.50×", value: 1.5 },
      { label: "1.75×", value: 1.75 },
      { label: "2.00×", value: 2 }
    ],
    recommendedRange: { min: 1.3, max: 2 },
    hardRange: { min: 1, max: 3 },
    sectionHint: "Protections"
  },
  {
    key: "deal_terms.downside_mode",
    label: "Downside protection",
    unit: "enum",
    control: "enum",
    simpleDefinition: "A rule for what happens if the home value goes down.",
    impact: "It changes how the floor is enforced and how downside risk is shared.",
    formula: "downside_mode adjusts settlement floor rules in negative scenarios (conceptual)",
    options: [
      { label: "Hard floor", value: "HARD_FLOOR" },
      { label: "No floor", value: "NO_FLOOR" }
    ],
    sectionHint: "Protections"
  },
  {
    key: "deal_terms.payback_window_start_year",
    label: "Payback window start",
    unit: "years",
    control: "kiosk",
    simpleDefinition: "When the 'timing window' starts.",
    impact: "Timing rules can change equity earned depending on when payments happen in this window.",
    formula: "window_start_month = floor(payback_window_start_year * 12)",
    anchors: [
      { label: "0", value: 0 },
      { label: "1", value: 1 },
      { label: "2", value: 2 },
      { label: "3", value: 3 }
    ],
    recommendedRange: { min: 0, max: 3 },
    hardRange: { min: 0, max: 30 },
    sectionHint: "Protections"
  },
  {
    key: "deal_terms.payback_window_end_year",
    label: "Payback window end",
    unit: "years",
    control: "kiosk",
    simpleDefinition: "When the 'timing window' ends.",
    impact: "It defines how long timing adjustments can apply to equity earned.",
    formula: "window_end_month = floor(payback_window_end_year * 12)",
    anchors: [
      { label: "3", value: 3 },
      { label: "5", value: 5 },
      { label: "7", value: 7 },
      { label: "10", value: 10 }
    ],
    recommendedRange: { min: 3, max: 10 },
    hardRange: { min: 0, max: 30 },
    sectionHint: "Protections"
  },
  {
    key: "deal_terms.timing_factor_early",
    label: "Timing factor (early)",
    unit: "number",
    control: "kiosk",
    simpleDefinition: "A multiplier that can reward earlier payments (inside the timing window).",
    impact: "It can increase or decrease equity earned for payments made earlier in the window.",
    formula: "equity_adjusted_m = equity_m * timing_factor_early (when 'early' in window)",
    anchors: [
      { label: "0.90×", value: 0.9 },
      { label: "1.00×", value: 1 },
      { label: "1.10×", value: 1.1 },
      { label: "1.20×", value: 1.2 }
    ],
    recommendedRange: { min: 0.9, max: 1.2 },
    hardRange: { min: 0.5, max: 2 },
    sectionHint: "Protections"
  },
  {
    key: "deal_terms.timing_factor_late",
    label: "Timing factor (late)",
    unit: "number",
    control: "kiosk",
    simpleDefinition: "A multiplier that can reward or penalize later payments (inside the timing window).",
    impact: "It can increase or decrease equity earned for payments made later in the window.",
    formula: "equity_adjusted_m = equity_m * timing_factor_late (when 'late' in window)",
    anchors: [
      { label: "0.80×", value: 0.8 },
      { label: "0.90×", value: 0.9 },
      { label: "1.00×", value: 1 },
      { label: "1.10×", value: 1.1 }
    ],
    recommendedRange: { min: 0.8, max: 1.1 },
    hardRange: { min: 0.5, max: 2 },
    sectionHint: "Protections"
  },
  {
    key: "deal_terms.minimum_hold_years",
    label: "Minimum hold (years)",
    unit: "years",
    control: "kiosk",
    simpleDefinition: "The shortest time the deal must stay active before it can end.",
    impact: "It prevents very early exits and can change settlement timing and outcomes.",
    formula: "minimum_hold_month = floor(minimum_hold_years * 12) (conceptual constraint)",
    anchors: [
      { label: "1", value: 1 },
      { label: "2", value: 2 },
      { label: "3", value: 3 },
      { label: "5", value: 5 }
    ],
    recommendedRange: { min: 0, max: 3 },
    hardRange: { min: 0, max: 10 },
    sectionHint: "Ownership"
  },
  {
    key: "deal_terms.contract_maturity_years",
    label: "Contract maturity (years)",
    unit: "years",
    control: "kiosk",
    simpleDefinition: "The maximum time the agreement can run before it must settle or convert.",
    impact: "It defines a hard endpoint so deals can't run forever.",
    formula: "maturity_month = floor(contract_maturity_years * 12) (conceptual limit)",
    anchors: [
      { label: "5", value: 5 },
      { label: "7", value: 7 },
      { label: "10", value: 10 },
      { label: "15", value: 15 }
    ],
    recommendedRange: { min: 5, max: 15 },
    hardRange: { min: 1, max: 30 },
    sectionHint: "Ownership"
  },
  {
    key: "deal_terms.liquidity_trigger_year",
    label: "Liquidity trigger year",
    unit: "years",
    control: "kiosk",
    simpleDefinition: "The year when a liquidity event can be triggered.",
    impact: "It sets when the deal may allow early buyout or conversion options.",
    formula: "liquidity_trigger_month = floor(liquidity_trigger_year * 12) (conceptual threshold)",
    anchors: [
      { label: "5", value: 5 },
      { label: "10", value: 10 },
      { label: "15", value: 15 },
      { label: "20", value: 20 }
    ],
    recommendedRange: { min: 5, max: 20 },
    hardRange: { min: 1, max: 30 },
    sectionHint: "Ownership"
  },
  {
    key: "deal_terms.platform_fee",
    label: "Platform fee (system)",
    unit: "currency",
    control: "readonly",
    readOnly: !0,
    simpleDefinition: "A fee paid to FractPath for running the deal.",
    impact: "This is set by the system and reduces the net proceeds at settlement.",
    formula: "net_settlement = gross_settlement - platform_fee (conceptual)",
    recommendedRange: { min: 0, max: 5e3 },
    hardRange: { min: 0, max: 5e4 },
    sectionHint: "Fees"
  },
  {
    key: "deal_terms.servicing_fee_monthly",
    label: "Servicing fee (monthly)",
    unit: "currency",
    control: "readonly",
    readOnly: !0,
    simpleDefinition: "A monthly fee for servicing the deal.",
    impact: "It accumulates over the life of the deal and reduces net investor returns.",
    formula: "servicing_total = servicing_fee_monthly * payments_made_by_exit",
    recommendedRange: { min: 0, max: 100 },
    hardRange: { min: 0, max: 500 },
    sectionHint: "Fees"
  },
  {
    key: "deal_terms.exit_fee_pct",
    label: "Exit fee (%) (system)",
    unit: "percent",
    control: "readonly",
    readOnly: !0,
    simpleDefinition: "A fee charged when the deal ends (as a percent).",
    impact: "This is set by the system and reduces the net settlement at exit.",
    formula: "exit_fee = exit_fee_pct * gross_settlement; net_settlement = gross_settlement - exit_fee",
    recommendedRange: { min: 0, max: 0.02 },
    hardRange: { min: 0, max: 0.1 },
    sectionHint: "Fees"
  },
  {
    key: "deal_terms.realtor_representation_mode",
    label: "Realtor representation",
    unit: "enum",
    control: "enum",
    simpleDefinition: "Whether a realtor is involved and which side they represent.",
    impact: "It determines if a realtor commission applies and how it is allocated.",
    formula: "if mode = NONE then realtor_commission_pct is treated as 0 in compute",
    options: [
      { label: "None", value: "NONE" },
      { label: "Buyer", value: "BUYER" },
      { label: "Seller", value: "SELLER" },
      { label: "Dual", value: "DUAL" }
    ],
    sectionHint: "Fees"
  },
  {
    key: "deal_terms.realtor_commission_pct",
    label: "Realtor commission (%)",
    unit: "percent",
    control: "kiosk",
    simpleDefinition: "The percentage paid to the realtor for their services.",
    impact: "It reduces net proceeds. Capped at 6%. Must be 0 when representation is NONE.",
    formula: "commission_amount = realtor_commission_pct * settlement_value (conceptual, per payment event)",
    anchors: [
      { label: "0%", value: 0 },
      { label: "2%", value: 0.02 },
      { label: "3%", value: 0.03 },
      { label: "6%", value: 0.06 }
    ],
    recommendedRange: { min: 0, max: 0.06 },
    hardRange: { min: 0, max: 0.06 },
    sectionHint: "Fees"
  },
  {
    key: "deal_terms.realtor_commission_payment_mode",
    label: "Commission payment mode",
    unit: "enum",
    control: "readonly",
    readOnly: !0,
    simpleDefinition: "How and when the realtor commission is paid.",
    impact: "Locked to per-payment-event: commission is deducted at each payment event.",
    formula: "realtor_commission_payment_mode = PER_PAYMENT_EVENT (locked in v10.2)",
    options: [
      { label: "Per payment event", value: "PER_PAYMENT_EVENT" }
    ],
    sectionHint: "Fees"
  },
  {
    key: "deal_terms.duration_yield_floor_enabled",
    label: "Duration Yield Floor (enabled)",
    unit: "enum",
    control: "enum",
    simpleDefinition: "Whether the Duration Yield Floor protection is active.",
    impact: "When enabled, it can raise settlement above the ceiling for long-duration deals.",
    formula: "if enabled AND exit_year >= start_year, DYF may override standard ceiling",
    options: [
      { label: "Disabled", value: "false" },
      { label: "Enabled", value: "true" }
    ],
    sectionHint: "Protections"
  },
  {
    key: "deal_terms.duration_yield_floor_start_year",
    label: "DYF start year",
    unit: "years",
    control: "kiosk",
    simpleDefinition: "The year when Duration Yield Floor protection kicks in.",
    impact: "After this year, the DYF minimum return guarantee becomes active.",
    formula: "DYF activates if exit_year >= duration_yield_floor_start_year",
    anchors: [
      { label: "5", value: 5 },
      { label: "7", value: 7 },
      { label: "10", value: 10 },
      { label: "15", value: 15 }
    ],
    recommendedRange: { min: 5, max: 15 },
    hardRange: { min: 1, max: 30 },
    sectionHint: "Protections"
  },
  {
    key: "deal_terms.duration_yield_floor_min_multiple",
    label: "DYF minimum multiple",
    unit: "number",
    control: "kiosk",
    simpleDefinition: "The minimum return multiple guaranteed by the Duration Yield Floor.",
    impact: "If DYF activates, settlement cannot be below invested_capital * this multiple.",
    formula: "dyf_floor_amount = invested_capital_total * duration_yield_floor_min_multiple",
    anchors: [
      { label: "1.50×", value: 1.5 },
      { label: "1.75×", value: 1.75 },
      { label: "2.00×", value: 2 },
      { label: "2.50×", value: 2.5 }
    ],
    recommendedRange: { min: 1.2, max: 3 },
    hardRange: { min: 1, max: 5 },
    sectionHint: "Protections"
  },
  {
    key: "__disclosure__",
    label: "Disclosures & assumptions",
    unit: "info",
    control: "info",
    simpleDefinition: "These numbers are estimates based on the inputs you choose.",
    impact: "Projections depend on home prices, timing, fees, and rules like floors/ceilings—real outcomes can be different.",
    formula: "Model uses: FMV + appreciation assumption + monthly equity purchase + settlement rules (floors/ceilings/fees). Not financial advice; projections aren't guarantees.",
    sectionHint: "Assumptions"
  }
];
function Bt(e, t) {
  const n = e.dynamicPercentAnchors;
  return n ? n.percents.map((r) => {
    let o = r * t;
    n.maxPercentOfSource != null && (o = Math.min(o, n.maxPercentOfSource * t));
    const i = Math.round(o / 100) * 100, l = n.min != null ? Math.max(n.min, i) : i;
    return { label: y(l), value: l };
  }) : e.anchors ?? [];
}
const De = [
  {
    key: "payments",
    label: "Payments",
    sections: [
      {
        label: "Payment terms",
        fieldKeys: [
          "deal_terms.property_value",
          "deal_terms.upfront_payment",
          "deal_terms.monthly_payment",
          "deal_terms.number_of_payments"
        ]
      }
    ]
  },
  {
    key: "ownership",
    label: "Ownership",
    sections: [
      {
        label: "Hold & maturity",
        fieldKeys: [
          "deal_terms.minimum_hold_years",
          "deal_terms.contract_maturity_years",
          "deal_terms.liquidity_trigger_year"
        ]
      }
    ]
  },
  {
    key: "assumptions",
    label: "Assumptions",
    sections: [
      {
        label: "Market & timing",
        fieldKeys: [
          "scenario.annual_appreciation",
          "scenario.exit_year",
          "scenario.closing_cost_pct"
        ]
      },
      {
        label: "Disclosures",
        fieldKeys: ["__disclosure__"]
      }
    ]
  },
  {
    key: "protections",
    label: "Protections",
    sections: [
      {
        label: "Floor & ceiling",
        fieldKeys: [
          "deal_terms.floor_multiple",
          "deal_terms.ceiling_multiple",
          "deal_terms.downside_mode"
        ]
      },
      {
        label: "Timing window",
        fieldKeys: [
          "deal_terms.payback_window_start_year",
          "deal_terms.payback_window_end_year",
          "deal_terms.timing_factor_early",
          "deal_terms.timing_factor_late"
        ]
      },
      {
        label: "Duration Yield Floor",
        fieldKeys: [
          "deal_terms.duration_yield_floor_enabled",
          "deal_terms.duration_yield_floor_start_year",
          "deal_terms.duration_yield_floor_min_multiple"
        ]
      }
    ]
  },
  {
    key: "fees",
    label: "Fees",
    sections: [
      {
        label: "System fees",
        fieldKeys: [
          "deal_terms.platform_fee",
          "deal_terms.servicing_fee_monthly",
          "deal_terms.exit_fee_pct"
        ]
      },
      {
        label: "Realtor commission",
        fieldKeys: [
          "deal_terms.realtor_representation_mode",
          "deal_terms.realtor_commission_pct",
          "deal_terms.realtor_commission_payment_mode"
        ]
      }
    ]
  }
];
function Ut(e) {
  const t = {}, { deal_terms: n, scenario: r } = e;
  return n.property_value <= 0 && (t["deal_terms.property_value"] = "Property value must be greater than 0"), n.upfront_payment < 0 && (t["deal_terms.upfront_payment"] = "Upfront payment cannot be negative"), n.monthly_payment < 0 && (t["deal_terms.monthly_payment"] = "Monthly payment cannot be negative"), n.number_of_payments < 0 && (t["deal_terms.number_of_payments"] = "Number of payments cannot be negative"), r.exit_year <= 0 && (t["scenario.exit_year"] = "Exit year must be greater than 0"), (r.annual_appreciation < -0.5 || r.annual_appreciation > 0.5) && (t["scenario.annual_appreciation"] = "Annual appreciation must be between -50% and 50%"), n.realtor_commission_pct !== void 0 && (n.realtor_commission_pct < 0 || n.realtor_commission_pct > 0.06) && (t["deal_terms.realtor_commission_pct"] = "Realtor commission must be between 0% and 6%"), n.realtor_representation_mode === "NONE" && n.realtor_commission_pct !== void 0 && n.realtor_commission_pct !== 0 && (t["deal_terms.realtor_commission_pct"] = "Commission must be 0% when representation mode is NONE"), t;
}
function Ye(e) {
  return Object.keys(e).length > 0;
}
const Le = {
  padding: "5px 10px",
  borderRadius: 6,
  border: "1px solid #d1d5db",
  background: "#fff",
  color: "#374151",
  fontSize: 12,
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: "system-ui, sans-serif",
  transition: "all 0.15s"
}, Gt = {
  ...Le,
  border: "2px solid #111827",
  background: "#111827",
  color: "#fff"
};
function Kt({
  value: e,
  anchors: t,
  unit: n,
  onSelectAnchor: r,
  customValue: o,
  onChangeCustom: i,
  onBlurCustom: l,
  disabled: p,
  error: m
}) {
  const _ = t.some((d) => d.value === e), g = n === "currency" || n === "number" || n === "months" || n === "years" ? "numeric" : "decimal", x = n === "currency" ? "$" : "", f = n === "percent" ? "%" : n === "years" ? " yr" : n === "months" ? " mo" : "";
  return /* @__PURE__ */ c("div", { children: [
    /* @__PURE__ */ a("div", { style: { display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }, children: t.map((d) => /* @__PURE__ */ a(
      "button",
      {
        type: "button",
        disabled: p,
        onClick: () => r(d.value),
        style: {
          ...d.value === e ? Gt : Le,
          opacity: p ? 0.5 : 1,
          cursor: p ? "not-allowed" : "pointer"
        },
        children: d.label
      },
      d.label
    )) }),
    /* @__PURE__ */ c("div", { style: { position: "relative" }, children: [
      x && /* @__PURE__ */ a(
        "span",
        {
          style: {
            position: "absolute",
            left: 10,
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: 13,
            color: "#9ca3af",
            pointerEvents: "none"
          },
          children: x
        }
      ),
      /* @__PURE__ */ a(
        "input",
        {
          type: "text",
          inputMode: g,
          disabled: p,
          value: _ ? "" : o,
          placeholder: _ ? "Custom" : "",
          onChange: (d) => i(d.target.value),
          onBlur: l,
          style: {
            width: "100%",
            padding: x ? "7px 10px 7px 22px" : "7px 10px",
            border: m ? "1px solid #ef4444" : "1px solid #d1d5db",
            borderRadius: 6,
            fontSize: 13,
            fontFamily: "system-ui, sans-serif",
            boxSizing: "border-box",
            background: p ? "#f3f4f6" : "#fff",
            color: p ? "#9ca3af" : "#111827"
          }
        }
      ),
      f && /* @__PURE__ */ a(
        "span",
        {
          style: {
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: 12,
            color: "#9ca3af",
            pointerEvents: "none"
          },
          children: f
        }
      )
    ] }),
    m && /* @__PURE__ */ a("div", { style: { color: "#ef4444", fontSize: 11, marginTop: 3 }, children: m })
  ] });
}
const Xt = `
@keyframes fpShimmer {
  0% { background-position: -200px 0; }
  100% { background-position: 200px 0; }
}
`, Jt = {
  display: "inline-block",
  width: 60,
  height: 12,
  borderRadius: 4,
  background: "linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)",
  backgroundSize: "200px 100%",
  animation: "fpShimmer 1.5s infinite"
};
function Qt({ tier1: e, status: t, error: n }) {
  return /* @__PURE__ */ c(
    "div",
    {
      style: {
        background: "#f9fafb",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: 14
      },
      children: [
        /* @__PURE__ */ a("style", { children: Xt }),
        /* @__PURE__ */ c(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10
            },
            children: [
              /* @__PURE__ */ a("span", { style: { fontWeight: 600, fontSize: 13, color: "#374151" }, children: "Preview" }),
              t === "computing" && /* @__PURE__ */ a("span", { style: Jt })
            ]
          }
        ),
        /* @__PURE__ */ c("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }, children: [
          /* @__PURE__ */ c("div", { children: [
            /* @__PURE__ */ a("div", { style: { fontSize: 11, color: "#9ca3af" }, children: "Upfront cash" }),
            /* @__PURE__ */ a("div", { style: { fontSize: 15, fontWeight: 600, color: "#111827" }, children: y(e.upfrontCash) })
          ] }),
          /* @__PURE__ */ c("div", { children: [
            /* @__PURE__ */ a("div", { style: { fontSize: 11, color: "#9ca3af" }, children: "Installments" }),
            /* @__PURE__ */ a("div", { style: { fontSize: 13, color: "#374151" }, children: e.installmentsLabel })
          ] }),
          /* @__PURE__ */ c("div", { children: [
            /* @__PURE__ */ a("div", { style: { fontSize: 11, color: "#9ca3af" }, children: "Total installments" }),
            /* @__PURE__ */ a("div", { style: { fontSize: 13, color: "#374151" }, children: y(e.totalInstallments) })
          ] }),
          /* @__PURE__ */ c("div", { children: [
            /* @__PURE__ */ a("div", { style: { fontSize: 11, color: "#9ca3af" }, children: "Total cash paid" }),
            /* @__PURE__ */ a("div", { style: { fontSize: 15, fontWeight: 600, color: "#111827" }, children: y(e.totalCashPaid) })
          ] })
        ] }),
        t === "error" && n && /* @__PURE__ */ a(
          "div",
          {
            style: {
              marginTop: 8,
              fontSize: 11,
              color: "#dc2626",
              background: "#fef2f2",
              padding: "6px 8px",
              borderRadius: 6
            },
            children: n
          }
        )
      ]
    }
  );
}
function pe({ simpleDefinition: e, impact: t }) {
  const [n, r] = P(!1), o = de(null), i = de(null);
  ae(() => {
    if (!n) return;
    function m(_) {
      o.current && !o.current.contains(_.target) && i.current && !i.current.contains(_.target) && r(!1);
    }
    return document.addEventListener("mousedown", m), () => document.removeEventListener("mousedown", m);
  }, [n]);
  const [l, p] = P({ top: 0, left: 0 });
  return ae(() => {
    if (!n || !o.current) return;
    const m = o.current.getBoundingClientRect();
    p({
      top: m.top + window.scrollY - 8,
      left: m.left + m.width / 2 + window.scrollX
    });
  }, [n]), /* @__PURE__ */ c("span", { style: { display: "inline-block", marginLeft: 4 }, children: [
    /* @__PURE__ */ a(
      "button",
      {
        ref: o,
        type: "button",
        onClick: () => r((m) => !m),
        "aria-label": "Help",
        style: {
          width: 16,
          height: 16,
          borderRadius: "50%",
          border: "1px solid #9ca3af",
          background: n ? "#111827" : "#fff",
          color: n ? "#fff" : "#6b7280",
          fontSize: 10,
          fontWeight: 700,
          cursor: "pointer",
          padding: 0,
          lineHeight: "14px",
          textAlign: "center",
          verticalAlign: "middle"
        },
        children: "?"
      }
    ),
    n && Ke(
      /* @__PURE__ */ c(
        "div",
        {
          ref: i,
          style: {
            position: "absolute",
            top: l.top,
            left: l.left,
            transform: "translate(-50%, -100%)",
            background: "#1f2937",
            color: "#f9fafb",
            borderRadius: 8,
            padding: "10px 12px",
            fontSize: 12,
            lineHeight: 1.5,
            width: 240,
            zIndex: 99999,
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            pointerEvents: "auto"
          },
          children: [
            /* @__PURE__ */ a("div", { style: { fontWeight: 600, marginBottom: 4 }, children: e }),
            /* @__PURE__ */ a("div", { style: { color: "#d1d5db" }, children: t })
          ]
        }
      ),
      document.body
    )
  ] });
}
function Zt(e, t, n) {
  const r = t === "homeowner" ? "receive" : "pay", o = t === "homeowner" ? "payout" : "return";
  switch (e) {
    case "payments": {
      const i = [];
      return n.upfrontPayment != null && i.push(`You ${r} ${y(n.upfrontPayment)} upfront at closing.`), n.monthlyPayment != null && n.numberOfPayments != null && n.numberOfPayments > 0 && i.push(
        `Then ${y(n.monthlyPayment)}/mo for ${n.numberOfPayments} months.`
      ), i.length === 0 && i.push("The upfront amount is set at closing. Monthly installments, if any, follow."), i.push("These amounts go directly toward the equity position."), i;
    }
    case "ownership": {
      const i = [];
      return n.contractMaturityYears != null && i.push(`The contract lasts up to ${n.contractMaturityYears} years.`), n.minimumHoldYears != null && i.push(`Earliest allowed settlement is at year ${n.minimumHoldYears}.`), n.exitYear != null && i.push(`Expected settlement is at year ${n.exitYear}.`), i.length === 0 && i.push("This tab controls how long the deal lasts and when settlement can happen."), i;
    }
    case "protections":
      return [
        `A floor sets the minimum ${o} — the ${o} won't go below this level.`,
        `A ceiling caps the maximum ${o}. Both are adjustable in this tab.`,
        "Duration yield floor, if enabled, adds extra protection for longer hold periods."
      ];
    case "assumptions":
      return [
        "Growth rate and exit year are assumptions, not guarantees.",
        "Changing these values updates the projected results in real time."
      ];
    case "fees": {
      const i = [];
      return n.platformFee != null && i.push(`Platform fee: ${y(n.platformFee)} (one-time at closing).`), n.servicingFeeMonthly != null && i.push(`Monthly servicing: ${y(n.servicingFeeMonthly)}/mo for account management.`), n.exitFeePct != null && i.push(`Exit fee: ${V(n.exitFeePct)} of the settlement amount at exit.`), i.length === 0 && i.push("Fees include a platform fee, monthly servicing, and an exit fee at settlement."), t === "realtor" && i.push("Realtor commission is tracked separately below."), i;
    }
    default:
      return [];
  }
}
function en(e, t) {
  if (t === "__disclosure__") return null;
  const [n, r] = t.split(".");
  return e[n][r];
}
function tn(e, t) {
  return e.dynamicPercentAnchors ? Bt(e, t.deal_terms.property_value) : e.anchors ?? [];
}
const nn = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  paddingTop: "5vh",
  zIndex: 9999,
  fontFamily: "system-ui, sans-serif"
}, an = {
  background: "#fff",
  borderRadius: 12,
  width: "min(680px, 95vw)",
  height: "min(85vh, 720px)",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 8px 32px rgba(0,0,0,0.18)"
}, rn = {
  display: "flex",
  gap: 0,
  borderBottom: "1px solid #e5e7eb",
  padding: "0 16px",
  overflowX: "auto"
};
function on({
  draft: e,
  errors: t,
  preview: n,
  persona: r,
  permissions: o,
  setField: i,
  onBlurCompute: l,
  onSave: p,
  onClose: m
}) {
  const [_, g] = P("payments"), [x, f] = P({}), d = O(() => {
    const s = /* @__PURE__ */ new Map();
    for (const b of Wt) s.set(b.key, b);
    return s;
  }, []), w = !Ye(t) && r !== "realtor" && o?.canEdit !== !1, E = N(
    (s, b) => {
      if (i(s, b), f((v) => ({ ...v, [s]: "" })), s !== "deal_terms.realtor_representation_mode") {
        if (s === "deal_terms.realtor_commission_pct") {
          l();
          return;
        }
        l();
      }
    },
    [i, l]
  ), Y = N(
    (s, b) => {
      if (s === "deal_terms.duration_yield_floor_enabled") {
        i(s, b === "true"), l();
        return;
      }
      if (i(s, b), s === "deal_terms.realtor_representation_mode") {
        b === "NONE" && i("deal_terms.realtor_commission_pct", 0), l();
        return;
      }
      l();
    },
    [i, l]
  ), H = N(
    (s, b) => {
      f((v) => ({ ...v, [s]: b }));
    },
    []
  ), k = N(
    (s, b) => {
      const v = x[s];
      if (v === void 0 || v === "") return;
      let C;
      b.unit === "percent" ? C = parseFloat(v) / 100 : C = parseFloat(v.replace(/,/g, "")), Number.isFinite(C) && (b.hardRange && (C = Math.max(b.hardRange.min, Math.min(b.hardRange.max, C))), i(s, C), l());
    },
    [x, i, l]
  ), W = N(() => {
    w && (p(e), m());
  }, [w, e, p, m]), h = (s) => s === "deal_terms.realtor_commission_pct" ? e.deal_terms.realtor_representation_mode === "NONE" : s === "deal_terms.realtor_commission_payment_mode", M = (s, b) => s == null ? "—" : b.unit === "percent" ? `${(s * 100).toFixed(2)}%` : b.unit === "currency" ? y(s) : b.unit === "years" ? `${s} yr` : b.unit === "months" ? `${s} mo` : typeof s == "boolean" ? s ? "Yes" : "No" : String(s), A = (s) => {
    const b = s.key, v = en(e, b), C = t[b], F = s.readOnly || h(b), X = Z(b, r, s.label);
    if (s.control === "info")
      return /* @__PURE__ */ c(
        "div",
        {
          style: {
            padding: "10px 12px",
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: 8,
            fontSize: 12,
            lineHeight: 1.6,
            color: "#92400e"
          },
          children: [
            /* @__PURE__ */ a("div", { style: { fontWeight: 600, marginBottom: 4 }, children: s.simpleDefinition }),
            /* @__PURE__ */ a("div", { children: s.impact })
          ]
        },
        b
      );
    if (s.control === "enum") {
      const R = s.options ?? [], J = b === "deal_terms.duration_yield_floor_enabled" ? String(v) : v;
      return /* @__PURE__ */ c("div", { style: { marginBottom: 14 }, children: [
        /* @__PURE__ */ c("label", { style: fe, children: [
          X,
          /* @__PURE__ */ a(pe, { simpleDefinition: s.simpleDefinition, impact: s.impact })
        ] }),
        /* @__PURE__ */ a(
          "select",
          {
            value: J,
            disabled: F,
            onChange: (T) => Y(b, T.target.value),
            style: {
              ...ln,
              background: F ? "#f3f4f6" : "#fff",
              color: F ? "#9ca3af" : "#111827"
            },
            children: R.map((T) => /* @__PURE__ */ a("option", { value: T.value, children: T.label }, T.value))
          }
        ),
        C && /* @__PURE__ */ a("div", { style: Ce, children: C })
      ] }, b);
    }
    if (s.control === "readonly")
      return /* @__PURE__ */ c("div", { style: { marginBottom: 14 }, children: [
        /* @__PURE__ */ c("label", { style: fe, children: [
          X,
          /* @__PURE__ */ a(pe, { simpleDefinition: s.simpleDefinition, impact: s.impact })
        ] }),
        /* @__PURE__ */ a("div", { style: sn, children: M(v, s) })
      ] }, b);
    if (s.control === "slider" && s.slider)
      return /* @__PURE__ */ c("div", { style: { marginBottom: 14 }, children: [
        /* @__PURE__ */ c("label", { style: fe, children: [
          X,
          /* @__PURE__ */ a(pe, { simpleDefinition: s.simpleDefinition, impact: s.impact })
        ] }),
        /* @__PURE__ */ c("div", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [
          /* @__PURE__ */ a(
            "input",
            {
              type: "range",
              min: s.slider.min,
              max: s.slider.max,
              step: s.slider.step,
              value: v,
              disabled: F,
              onChange: (R) => i(b, parseFloat(R.target.value)),
              onMouseUp: l,
              onTouchEnd: l,
              style: { flex: 1 }
            }
          ),
          /* @__PURE__ */ a("span", { style: { fontSize: 13, fontWeight: 600, minWidth: 80, textAlign: "right" }, children: M(v, s) })
        ] }),
        C && /* @__PURE__ */ a("div", { style: Ce, children: C })
      ] }, b);
    if (s.control === "kiosk") {
      const R = tn(s, e), J = R.length >= 4 ? [R[0], R[1], R[2], R[3]] : [
        R[0] ?? { label: "—", value: 0 },
        R[1] ?? { label: "—", value: 0 },
        R[2] ?? { label: "—", value: 0 },
        R[3] ?? { label: "—", value: 0 }
      ];
      let T = x[b] ?? "";
      return !T && !J.some((q) => q.value === v) && (s.unit === "percent" ? T = (v * 100).toString() : T = String(v)), /* @__PURE__ */ c("div", { style: { marginBottom: 14 }, children: [
        /* @__PURE__ */ c("label", { style: fe, children: [
          X,
          /* @__PURE__ */ a(pe, { simpleDefinition: s.simpleDefinition, impact: s.impact })
        ] }),
        /* @__PURE__ */ a(
          Kt,
          {
            value: v,
            anchors: J,
            unit: s.unit,
            onSelectAnchor: (q) => E(b, q),
            customValue: T,
            onChangeCustom: (q) => H(b, q),
            onBlurCustom: () => k(b, s),
            disabled: F,
            error: C
          }
        )
      ] }, b);
    }
    return null;
  }, ee = De.find((s) => s.key === _);
  return /* @__PURE__ */ a("div", { style: nn, onClick: (s) => {
    s.target === s.currentTarget && m();
  }, children: /* @__PURE__ */ c("div", { style: an, role: "dialog", "aria-modal": "true", "data-testid": "deal-edit-modal", children: [
    /* @__PURE__ */ a("div", { style: { padding: "16px 20px 0", borderBottom: "none" }, children: /* @__PURE__ */ c("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
      /* @__PURE__ */ a("h2", { style: { margin: 0, fontSize: 18, color: "#111827" }, children: "Edit Deal Terms" }),
      /* @__PURE__ */ a(
        "button",
        {
          type: "button",
          onClick: m,
          "aria-label": "Close",
          style: {
            background: "none",
            border: "none",
            fontSize: 20,
            cursor: "pointer",
            color: "#6b7280",
            padding: "4px 8px"
          },
          children: "×"
        }
      )
    ] }) }),
    /* @__PURE__ */ a("div", { style: rn, children: De.map((s) => /* @__PURE__ */ a(
      "button",
      {
        type: "button",
        onClick: () => g(s.key),
        style: {
          padding: "10px 16px",
          border: "none",
          borderBottom: _ === s.key ? "2px solid #111827" : "2px solid transparent",
          background: "none",
          fontSize: 13,
          fontWeight: _ === s.key ? 600 : 400,
          color: _ === s.key ? "#111827" : "#6b7280",
          cursor: "pointer",
          fontFamily: "system-ui, sans-serif",
          whiteSpace: "nowrap"
        },
        children: s.label
      },
      s.key
    )) }),
    /* @__PURE__ */ a("div", { style: { flex: 1, overflow: "auto", padding: "16px 20px" }, children: /* @__PURE__ */ c("div", { style: { display: "grid", gridTemplateColumns: "1fr 220px", gap: 20 }, children: [
      /* @__PURE__ */ a("div", { children: ee.sections.map((s) => /* @__PURE__ */ c("div", { style: { marginBottom: 20 }, children: [
        /* @__PURE__ */ a(
          "h4",
          {
            style: {
              margin: "0 0 10px 0",
              fontSize: 12,
              color: "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: 0.5
            },
            children: s.label
          }
        ),
        s.fieldKeys.map((b) => {
          const v = d.get(b);
          return v ? A(v) : null;
        })
      ] }, s.label)) }),
      /* @__PURE__ */ c("div", { children: [
        /* @__PURE__ */ a(
          Qt,
          {
            tier1: n.tier1,
            status: n.status,
            error: n.error
          }
        ),
        /* @__PURE__ */ c(
          "div",
          {
            style: {
              marginTop: 12,
              padding: "10px 12px",
              background: "#f9fafb",
              borderRadius: 8,
              border: "1px solid #e5e7eb"
            },
            "data-testid": "tab-explainer",
            children: [
              /* @__PURE__ */ a("div", { style: { fontSize: 11, fontWeight: 600, color: "#6b7280", marginBottom: 6 }, children: "What this means" }),
              /* @__PURE__ */ a("ul", { style: { margin: 0, padding: "0 0 0 14px", fontSize: 11, lineHeight: 1.6, color: "#374151" }, children: Zt(_, r, {
                upfrontPayment: e.deal_terms.upfront_payment,
                monthlyPayment: e.deal_terms.monthly_payment,
                numberOfPayments: e.deal_terms.number_of_payments,
                contractMaturityYears: e.deal_terms.contract_maturity_years,
                minimumHoldYears: e.deal_terms.minimum_hold_years,
                exitYear: e.scenario.exit_year,
                platformFee: e.deal_terms.platform_fee,
                servicingFeeMonthly: e.deal_terms.servicing_fee_monthly,
                exitFeePct: e.deal_terms.exit_fee_pct
              }).map((s, b) => /* @__PURE__ */ a("li", { style: { marginBottom: 2 }, children: s }, b)) })
            ]
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ c(
      "div",
      {
        style: {
          padding: "12px 20px",
          borderTop: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        },
        children: [
          /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              onClick: m,
              style: {
                padding: "8px 20px",
                borderRadius: 8,
                border: "1px solid #d1d5db",
                background: "#fff",
                color: "#374151",
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "system-ui, sans-serif"
              },
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              onClick: W,
              disabled: !w,
              style: {
                padding: "8px 24px",
                borderRadius: 8,
                border: "none",
                background: w ? "#111827" : "#d1d5db",
                color: w ? "#fff" : "#9ca3af",
                fontSize: 13,
                fontWeight: 600,
                cursor: w ? "pointer" : "not-allowed",
                fontFamily: "system-ui, sans-serif"
              },
              children: "Save"
            }
          )
        ]
      }
    )
  ] }) });
}
const fe = {
  display: "block",
  fontSize: 12,
  color: "#374151",
  marginBottom: 5,
  fontWeight: 500
}, ln = {
  width: "100%",
  padding: "7px 10px",
  border: "1px solid #d1d5db",
  borderRadius: 6,
  fontSize: 13,
  fontFamily: "system-ui, sans-serif",
  boxSizing: "border-box"
}, sn = {
  padding: "7px 10px",
  background: "#f3f4f6",
  border: "1px solid #e5e7eb",
  borderRadius: 6,
  fontSize: 13,
  color: "#6b7280"
}, Ce = {
  color: "#ef4444",
  fontSize: 11,
  marginTop: 3
};
function Se() {
  return {
    deal_terms: {
      property_value: 6e5,
      upfront_payment: 5e4,
      monthly_payment: 0,
      number_of_payments: 0,
      payback_window_start_year: 5,
      payback_window_end_year: 10,
      timing_factor_early: 0.8,
      timing_factor_late: 1,
      floor_multiple: 1,
      ceiling_multiple: 3.25,
      downside_mode: "HARD_FLOOR",
      contract_maturity_years: 30,
      liquidity_trigger_year: 15,
      minimum_hold_years: 3,
      platform_fee: I.platform_fee,
      servicing_fee_monthly: I.servicing_fee_monthly,
      exit_fee_pct: I.exit_fee_pct,
      realtor_representation_mode: "NONE",
      realtor_commission_pct: 0,
      realtor_commission_payment_mode: "PER_PAYMENT_EVENT"
    },
    scenario: {
      annual_appreciation: 0.03,
      closing_cost_pct: 0.02,
      exit_year: 7
    }
  };
}
function _e(e) {
  const { upfront_payment: t, monthly_payment: n, number_of_payments: r } = e.deal_terms, { exit_year: o } = e.scenario, i = Math.floor(o * 12), l = Math.min(r, i), p = n * l, m = t + p, _ = l === 0 ? "No installments" : `${l} payments of ${y(n)}`;
  return {
    upfrontCash: t,
    installmentsLabel: _,
    totalInstallments: p,
    totalCashPaid: m
  };
}
function cn(e) {
  return he(e.deal_terms, e.scenario);
}
function dn(e, t, n) {
  const r = structuredClone(e), [o, i] = t.split(".");
  return r[o][i] = n, r;
}
function mn(e) {
  const [t, n] = P(
    () => e ?? Se()
  ), [r, o] = P({}), [i, l] = P(() => ({
    tier1: _e(e ?? Se()),
    status: "idle"
  })), p = N((g, x) => {
    n((f) => {
      const d = dn(f, g, x);
      return l((w) => ({ ...w, tier1: _e(d) })), d;
    });
  }, []), m = N(() => {
    n((g) => {
      const x = Ut(g);
      if (o(x), Ye(x))
        return l((f) => ({
          ...f,
          status: "error",
          error: "Validation failed"
        })), g;
      l((f) => ({ ...f, status: "computing" }));
      try {
        const f = cn(g);
        l({
          tier1: _e(g),
          status: "ok",
          lastComputedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
          results: f
        });
      } catch (f) {
        l((d) => ({
          ...d,
          status: "error",
          error: f instanceof Error ? f.message : "Compute failed"
        }));
      }
      return g;
    });
  }, []), _ = O(() => _e(t), [t]);
  return {
    draft: t,
    errors: r,
    preview: { ...i, tier1: _ },
    setField: p,
    onBlurCompute: m
  };
}
function un(e) {
  return {
    property_value: e.propertyValue,
    upfront_payment: e.upfrontPayment,
    monthly_payment: e.monthlyPayment,
    number_of_payments: e.numberOfPayments,
    payback_window_start_year: Math.max(0, Math.floor(e.exitYear / 3)),
    payback_window_end_year: Math.max(1, Math.ceil(e.exitYear * 2 / 3)),
    timing_factor_early: 1,
    timing_factor_late: 1,
    floor_multiple: 1.1,
    ceiling_multiple: 2,
    downside_mode: "HARD_FLOOR",
    contract_maturity_years: 30,
    liquidity_trigger_year: 13,
    minimum_hold_years: 2,
    platform_fee: I.platform_fee,
    servicing_fee_monthly: I.servicing_fee_monthly,
    exit_fee_pct: I.exit_fee_pct,
    duration_yield_floor_enabled: !1,
    duration_yield_floor_start_year: null,
    duration_yield_floor_min_multiple: null,
    realtor_representation_mode: e.realtorMode,
    realtor_commission_pct: e.realtorPct / 100,
    realtor_commission_payment_mode: "PER_PAYMENT_EVENT"
  };
}
function pn(e) {
  return {
    annual_appreciation: e.growthRatePct / 100,
    closing_cost_pct: 0,
    exit_year: e.exitYear
  };
}
const fn = [
  "buyer",
  "homeowner",
  "realtor"
];
function _n(e) {
  const t = O(() => {
    const p = Se();
    return {
      ...p,
      ...e.initial,
      deal_terms: {
        ...p.deal_terms,
        ...e.initial?.deal_terms ?? {}
      },
      scenario: {
        ...p.scenario,
        ...e.initial?.scenario ?? {}
      }
    };
  }, [e.initial]), { draft: n, errors: r, preview: o, setField: i, onBlurCompute: l } = mn(t);
  return /* @__PURE__ */ a(
    on,
    {
      draft: n,
      errors: r,
      preview: o,
      persona: e.persona,
      setField: i,
      onBlurCompute: l,
      onSave: (p) => e.onSaved(p),
      onClose: e.onClose
    }
  );
}
function yn(e = 640) {
  const [t, n] = P(!1);
  return ae(() => {
    if (typeof window > "u") return;
    const r = window.matchMedia(`(max-width: ${e}px)`);
    n(r.matches);
    const o = (i) => n(i.matches);
    return r.addEventListener("change", o), () => r.removeEventListener("change", o);
  }, [e]), t;
}
function hn({ value: e, format: t }) {
  const n = de(null), r = de(e), o = de(0);
  ae(() => {
    const l = r.current, p = e;
    if (r.current = p, l === p || !n.current) return;
    const m = 300, _ = performance.now(), g = (x) => {
      const f = x - _, d = Math.min(f / m, 1), w = 1 - Math.pow(1 - d, 3), E = l + (p - l) * w;
      n.current && (t === "currency" ? n.current.textContent = y(E) : t === "percent" ? n.current.textContent = V(E) : n.current.textContent = E.toLocaleString(void 0, { maximumFractionDigits: 1 })), d < 1 && (o.current = requestAnimationFrame(g));
    };
    return o.current = requestAnimationFrame(g), () => cancelAnimationFrame(o.current);
  }, [e, t]);
  let i;
  return t === "currency" ? i = y(e) : t === "percent" ? i = V(e) : i = e.toLocaleString(void 0, { maximumFractionDigits: 1 }), /* @__PURE__ */ a("span", { ref: n, children: i });
}
const bn = {
  homeowner: "Model how a homeowner could unlock value today while sharing future appreciation.",
  buyer: "Model how a buyer could participate in future appreciation through a structured agreement.",
  realtor: "Explore structured scenarios to help clients evaluate flexible paths to homeownership.",
  investor: "Model how an investor could participate in future appreciation through a structured agreement.",
  ops: "Model how a structured agreement works across different scenarios."
}, gn = {
  homeowner: "Homeowner",
  buyer: "Buyer",
  realtor: "Realtor",
  investor: "Investor",
  ops: "Ops"
};
function vn() {
  if (typeof window > "u") return !1;
  try {
    return new URLSearchParams(window.location.search).get("DEV_HARNESS") === "true" || !1;
  } catch {
    return !1;
  }
}
function xn() {
  if (!vn() || typeof window > "u") return null;
  try {
    const e = new URLSearchParams(window.location.search).get("devAuth");
    if (e === "editor" || e === "viewer" || e === "loggedOut")
      return e;
    const t = void 0;
  } catch {
  }
  return null;
}
function Ne(e, t) {
  if (typeof e == "string") return e;
  switch (t) {
    case "currency":
      return y(e);
    case "percent":
      return V(e);
    case "multiple":
      return `${e.toFixed(2)}×`;
    case "months":
      return `${e}`;
    default:
      return String(e);
  }
}
function wn(e) {
  return e === 1 ? "1 Year" : `${e} Years`;
}
const Sn = `
  @keyframes fp-fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fp-tabSwitch {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  [data-fractpath-widget] * {
    box-sizing: border-box;
  }
  [data-fractpath-widget] input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: #e5e7eb;
    outline: none;
    cursor: pointer;
  }
  [data-fractpath-widget] input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #111827;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
  [data-fractpath-widget] input[type="range"]::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #111827;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
  [data-fractpath-widget] button:focus-visible {
    outline: 2px solid #111827;
    outline-offset: 2px;
  }
  [data-fractpath-widget] input:focus-visible,
  [data-fractpath-widget] select:focus-visible {
    outline: 2px solid #111827;
    outline-offset: 1px;
    border-color: #111827;
  }
`;
function kn(e) {
  const {
    persona: t,
    mode: n = "marketing",
    canEdit: r,
    onEvent: o,
    onDraftSnapshot: i,
    onShareSummary: l,
    onSave: p
  } = e, m = n === "app", _ = n === "marketing", [g, x] = P(t);
  ae(() => {
    x(t);
  }, [t]);
  const f = _ ? g : t, d = yn(), w = xn(), E = w === "editor" ? !0 : w === "viewer" || w === "loggedOut" ? !1 : r ?? !1, [Y, H] = P(!1), [k, W] = P(6e5), [h, M] = P(1e5), [A, ee] = P(0), [s, b] = P(0), [v, C] = P(10), [F, X] = P(3), [R, J] = P("NONE"), [T, q] = P(0);
  ae(() => {
    o?.({ type: "calculator_used", persona: f });
  }, [f, o]);
  const me = O(
    () => ({
      propertyValue: k,
      upfrontPayment: h,
      monthlyPayment: A,
      numberOfPayments: s,
      exitYear: v,
      growthRatePct: F,
      realtorMode: R,
      realtorPct: T
    }),
    [
      k,
      h,
      A,
      s,
      v,
      F,
      R,
      T
    ]
  ), te = O(
    () => un(me),
    [me]
  ), ne = O(
    () => pn(me),
    [me]
  ), je = O(
    () => ({ deal_terms: te, scenario: ne }),
    [te, ne]
  ), $ = O(
    () => he(te, ne),
    [te, ne]
  ), Q = O(
    () => Lt(
      f,
      te,
      ne,
      $
    ),
    [f, te, ne, $]
  ), le = v * 12, L = O(
    () => m ? Pt({
      homeValue: k,
      initialBuyAmount: h,
      termYears: v,
      annualGrowthRate: F / 100
    }) : null,
    [m, k, h, v, F]
  ), ke = O(
    () => L ? Mt(L) : null,
    [L]
  ), be = (u, S) => {
    const se = Number(u.replace(/,/g, ""));
    return Number.isFinite(se) && se >= 0 ? se : S;
  }, He = N(() => {
    if (o?.({ type: "save_clicked", persona: f }), p && L) {
      const u = Yt(L.normalizedInputs);
      p(u);
    }
  }, [L, p, o, f]), qe = N(async () => {
    if (o?.({ type: "save_continue_clicked", persona: f }), i) {
      const u = {
        homeValue: k,
        initialBuyAmount: h,
        termYears: v,
        annualGrowthRate: F / 100
      }, S = {
        standard_net_payout: $.isa_settlement,
        early_net_payout: $.isa_settlement,
        late_net_payout: $.isa_settlement,
        standard_settlement_month: le,
        early_settlement_month: le,
        late_settlement_month: le
      }, [se, Ge] = await Promise.all([
        ie(u),
        ie(S)
      ]);
      i({
        contract_version: re,
        schema_version: oe,
        persona: f,
        mode: "marketing",
        inputs: u,
        basic_results: S,
        input_hash: se,
        output_hash: Ge,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  }, [
    f,
    k,
    h,
    v,
    F,
    $,
    le,
    i,
    o
  ]), Ve = N(() => {
    o?.({ type: "share_clicked", persona: f }), l && l({
      contract_version: re,
      schema_version: oe,
      persona: f,
      inputs: {
        homeValue: k,
        initialBuyAmount: h,
        termYears: v,
        annualGrowthRate: F / 100
      },
      basic_results: {
        standard_net_payout: $.isa_settlement,
        early_net_payout: $.isa_settlement,
        late_net_payout: $.isa_settlement
      },
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    });
  }, [
    f,
    k,
    h,
    v,
    F,
    $,
    l,
    o
  ]), We = O(() => {
    const u = [
      { label: "Property", value: y(k) },
      { label: "Upfront", value: y(h) },
      { label: "Monthly", value: y(A) },
      { label: "# Months", value: String(s) },
      { label: "Exit Year", value: String(v) },
      { label: "Growth", value: V(F / 100) }
    ];
    return R !== "NONE" && u.push({ label: "Realtor", value: `${R} ${T}%` }), u;
  }, [
    k,
    h,
    A,
    s,
    v,
    F,
    R,
    T
  ]), Be = k * Math.pow(1 + F / 100, v), B = {
    display: "block",
    fontSize: d ? 14 : 13,
    color: "#374151",
    marginBottom: 6,
    fontWeight: 500,
    letterSpacing: "-0.01em"
  }, U = {
    width: "100%",
    padding: d ? "12px 14px" : "10px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    fontSize: d ? 16 : 14,
    fontFamily: "system-ui, sans-serif",
    boxSizing: "border-box",
    color: "#111827",
    background: "#fafafa",
    transition: "border-color 0.15s, box-shadow 0.15s"
  }, G = {
    marginBottom: d ? 20 : 16
  }, Re = {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "5px 12px",
    background: "#f9fafb",
    borderRadius: 20,
    fontSize: 12,
    color: "#374151",
    border: "1px solid #e5e7eb",
    whiteSpace: "nowrap"
  }, Pe = {
    color: "#9ca3af",
    fontWeight: 400
  }, Me = {
    fontWeight: 600,
    color: "#111827"
  }, Ue = [
    {
      label: "Home Value Today",
      value: k,
      format: "currency"
    },
    {
      label: "Cash Unlocked Today",
      value: h,
      format: "currency"
    },
    {
      label: s > 0 ? `Monthly Contribution / ${s} Month${s === 1 ? "" : "s"}` : "Monthly Contribution",
      value: A,
      format: "currency"
    },
    {
      label: `Projected Value in ${wn(v)}`,
      value: Be,
      format: "currency"
    }
  ];
  return /* @__PURE__ */ c(
    "div",
    {
      style: {
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: 16,
        padding: d ? 16 : 24,
        fontFamily: "system-ui, sans-serif",
        maxWidth: 960,
        background: "#ffffff",
        boxShadow: "0 10px 30px rgba(0,0,0,0.06)"
      },
      "data-fractpath-widget": !0,
      "data-persona": f,
      "data-mode": n,
      children: [
        /* @__PURE__ */ a("style", { children: Sn }),
        /* @__PURE__ */ a("h2", { style: {
          margin: 0,
          marginBottom: 4,
          fontSize: d ? 26 : 32,
          fontWeight: 700,
          color: "#111827",
          letterSpacing: "-0.02em",
          lineHeight: 1.2
        }, children: "Model Your Scenario" }),
        /* @__PURE__ */ a("p", { style: {
          margin: "0 0 20px 0",
          fontSize: d ? 14 : 16,
          color: "#6b7280",
          lineHeight: 1.5
        }, children: "Estimate how a home appreciation agreement could work based on your scenario." }),
        _ && /* @__PURE__ */ c("div", { style: { marginBottom: 20 }, children: [
          /* @__PURE__ */ a(
            "div",
            {
              style: {
                display: "inline-flex",
                gap: 4,
                padding: 4,
                background: "#f3f4f6",
                borderRadius: 10,
                marginBottom: 12
              },
              role: "tablist",
              children: fn.map((u) => {
                const S = f === u;
                return /* @__PURE__ */ a(
                  "button",
                  {
                    type: "button",
                    onClick: () => x(u),
                    style: {
                      padding: d ? "8px 14px" : "8px 20px",
                      fontSize: d ? 13 : 14,
                      fontWeight: S ? 600 : 400,
                      color: S ? "#fff" : "#6b7280",
                      background: S ? "#111827" : "transparent",
                      border: "none",
                      borderRadius: 7,
                      cursor: "pointer",
                      fontFamily: "system-ui, sans-serif",
                      transition: "all 0.15s"
                    },
                    "aria-selected": S,
                    role: "tab",
                    children: gn[u]
                  },
                  u
                );
              })
            }
          ),
          /* @__PURE__ */ a(
            "p",
            {
              style: {
                margin: 0,
                fontSize: d ? 14 : 15,
                color: "#6b7280",
                lineHeight: 1.5,
                animation: "fp-tabSwitch 0.2s ease-out"
              },
              children: bn[f]
            },
            f
          )
        ] }),
        m && /* @__PURE__ */ c("div", { style: { marginBottom: 20 }, children: [
          /* @__PURE__ */ a(
            "div",
            {
              style: {
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                alignItems: "center"
              },
              "data-testid": "deal-term-chips",
              children: We.map((u, S) => /* @__PURE__ */ c("span", { style: Re, children: [
                /* @__PURE__ */ c("span", { style: Pe, children: [
                  u.label,
                  ":"
                ] }),
                /* @__PURE__ */ a("span", { style: Me, children: u.value })
              ] }, S))
            }
          ),
          E && /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              onClick: () => H(!0),
              style: {
                marginTop: 10,
                padding: "8px 18px",
                borderRadius: 10,
                border: "1px solid #e5e7eb",
                background: "#fff",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "system-ui, sans-serif",
                color: "#374151",
                transition: "background 0.15s"
              },
              "data-testid": "edit-button",
              children: "Edit"
            }
          )
        ] }),
        /* @__PURE__ */ c(
          "div",
          {
            style: {
              display: "grid",
              gridTemplateColumns: m || d ? "1fr" : "minmax(240px, 1fr) minmax(340px, 2fr)",
              gap: d ? 16 : 24
            },
            children: [
              _ && /* @__PURE__ */ c("div", { children: [
                /* @__PURE__ */ a(
                  "h3",
                  {
                    style: {
                      margin: "0 0 16px 0",
                      fontSize: 13,
                      color: "#9ca3af",
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em"
                    },
                    children: "Scenario Inputs"
                  }
                ),
                /* @__PURE__ */ c("div", { style: G, children: [
                  /* @__PURE__ */ a("label", { style: B, children: Z(
                    "deal_terms.property_value",
                    f,
                    "Home Value ($)"
                  ) }),
                  /* @__PURE__ */ a(
                    "input",
                    {
                      type: "text",
                      inputMode: "numeric",
                      style: U,
                      value: k.toLocaleString(),
                      onChange: (u) => {
                        W(be(u.target.value, k));
                      }
                    }
                  )
                ] }),
                /* @__PURE__ */ c("div", { style: G, children: [
                  /* @__PURE__ */ a("label", { style: B, children: Z(
                    "deal_terms.upfront_payment",
                    f,
                    "Upfront Payment ($)"
                  ) }),
                  /* @__PURE__ */ a(
                    "input",
                    {
                      type: "text",
                      inputMode: "numeric",
                      style: U,
                      value: h.toLocaleString(),
                      onChange: (u) => {
                        M(
                          be(u.target.value, h)
                        );
                      }
                    }
                  )
                ] }),
                /* @__PURE__ */ c("div", { style: G, children: [
                  /* @__PURE__ */ a("label", { style: B, children: Z(
                    "deal_terms.monthly_payment",
                    f,
                    "Monthly Installment ($)"
                  ) }),
                  /* @__PURE__ */ a(
                    "input",
                    {
                      type: "text",
                      inputMode: "numeric",
                      style: U,
                      value: A.toLocaleString(),
                      onChange: (u) => {
                        ee(
                          be(u.target.value, A)
                        );
                      }
                    }
                  )
                ] }),
                /* @__PURE__ */ c("div", { style: G, children: [
                  /* @__PURE__ */ a("label", { style: B, children: "Number of Monthly Payments" }),
                  /* @__PURE__ */ a(
                    "input",
                    {
                      type: "number",
                      min: 0,
                      max: 360,
                      step: 1,
                      style: U,
                      value: s,
                      onChange: (u) => {
                        const S = parseInt(u.target.value, 10);
                        Number.isFinite(S) && S >= 0 && S <= 360 && b(S);
                      }
                    }
                  )
                ] }),
                /* @__PURE__ */ c("div", { style: G, children: [
                  /* @__PURE__ */ a("label", { style: B, children: Z("scenario.exit_year", f, "Target Exit Year") }),
                  /* @__PURE__ */ a(
                    "input",
                    {
                      type: "number",
                      min: 1,
                      max: 30,
                      step: 1,
                      style: U,
                      value: v,
                      onChange: (u) => {
                        const S = parseInt(u.target.value, 10);
                        Number.isFinite(S) && S >= 1 && S <= 30 && C(S);
                      }
                    }
                  )
                ] }),
                /* @__PURE__ */ c("div", { style: G, children: [
                  /* @__PURE__ */ a("label", { style: B, children: "Annual Growth Rate (assumption)" }),
                  /* @__PURE__ */ a(
                    "input",
                    {
                      type: "number",
                      min: 0,
                      max: 20,
                      step: 0.1,
                      style: U,
                      value: F,
                      onChange: (u) => {
                        const S = parseFloat(u.target.value);
                        Number.isFinite(S) && S >= 0 && S <= 20 && X(S);
                      }
                    }
                  )
                ] }),
                /* @__PURE__ */ c("div", { style: G, children: [
                  /* @__PURE__ */ a("label", { style: B, children: Z(
                    "deal_terms.realtor_representation_mode",
                    f,
                    "Realtor Representation"
                  ) }),
                  /* @__PURE__ */ c(
                    "select",
                    {
                      value: R,
                      onChange: (u) => {
                        J(u.target.value), u.target.value === "NONE" && q(0);
                      },
                      style: {
                        ...U,
                        cursor: "pointer"
                      },
                      children: [
                        /* @__PURE__ */ a("option", { value: "NONE", children: "None" }),
                        /* @__PURE__ */ a("option", { value: "BUYER", children: "Buyer" }),
                        /* @__PURE__ */ a("option", { value: "SELLER", children: "Seller" }),
                        /* @__PURE__ */ a("option", { value: "DUAL", children: "Dual" })
                      ]
                    }
                  )
                ] }),
                R !== "NONE" && /* @__PURE__ */ c("div", { style: G, children: [
                  /* @__PURE__ */ a("label", { style: B, children: Z(
                    "deal_terms.realtor_commission_pct",
                    f,
                    "Commission (%)"
                  ) }),
                  /* @__PURE__ */ a(
                    "input",
                    {
                      type: "number",
                      min: 0,
                      max: 6,
                      step: 0.5,
                      style: U,
                      value: T,
                      onChange: (u) => {
                        const S = parseFloat(u.target.value);
                        Number.isFinite(S) && S >= 0 && S <= 6 && q(S);
                      }
                    }
                  )
                ] }),
                _ && /* @__PURE__ */ c("details", { style: { marginTop: 8 }, children: [
                  /* @__PURE__ */ a(
                    "summary",
                    {
                      style: {
                        fontSize: 13,
                        color: "#9ca3af",
                        cursor: "pointer",
                        fontWeight: 500,
                        userSelect: "none"
                      },
                      children: "Fee details"
                    }
                  ),
                  /* @__PURE__ */ c(
                    "div",
                    {
                      style: { display: "flex", flexDirection: "column", gap: 6, marginTop: 8 },
                      children: [
                        /* @__PURE__ */ c(
                          "div",
                          {
                            style: {
                              padding: "8px 12px",
                              background: "#f9fafb",
                              borderRadius: 8,
                              fontSize: 13,
                              color: "#6b7280",
                              border: "1px solid #f3f4f6"
                            },
                            children: [
                              "Platform fee: ",
                              y(I.platform_fee)
                            ]
                          }
                        ),
                        /* @__PURE__ */ c(
                          "div",
                          {
                            style: {
                              padding: "8px 12px",
                              background: "#f9fafb",
                              borderRadius: 8,
                              fontSize: 13,
                              color: "#6b7280",
                              border: "1px solid #f3f4f6"
                            },
                            children: [
                              "Monthly servicing:",
                              " ",
                              y(I.servicing_fee_monthly)
                            ]
                          }
                        ),
                        /* @__PURE__ */ c(
                          "div",
                          {
                            style: {
                              padding: "8px 12px",
                              background: "#f9fafb",
                              borderRadius: 8,
                              fontSize: 13,
                              color: "#6b7280",
                              border: "1px solid #f3f4f6"
                            },
                            children: [
                              "Exit fee: ",
                              V(I.exit_fee_pct)
                            ]
                          }
                        )
                      ]
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ c("div", { children: [
                _ && /* @__PURE__ */ a(
                  "div",
                  {
                    style: {
                      display: "grid",
                      gridTemplateColumns: d ? "1fr 1fr" : "1fr 1fr 1fr 1fr",
                      gap: d ? 10 : 12,
                      marginBottom: 20
                    },
                    "data-testid": "summary-cards",
                    children: Ue.map((u) => /* @__PURE__ */ c(
                      "div",
                      {
                        style: {
                          padding: d ? "14px 10px" : "16px",
                          background: "#f9fafb",
                          borderRadius: 12,
                          border: "1px solid #f3f4f6",
                          textAlign: "center",
                          animation: "fp-fadeIn 0.3s ease-out"
                        },
                        children: [
                          /* @__PURE__ */ a("div", { style: {
                            fontSize: d ? 20 : 24,
                            fontWeight: 700,
                            color: "#111827",
                            letterSpacing: "-0.02em",
                            lineHeight: 1.2,
                            marginBottom: 4
                          }, children: /* @__PURE__ */ a(hn, { value: u.value, format: u.format }) }),
                          /* @__PURE__ */ a("div", { style: {
                            fontSize: d ? 10 : 11,
                            color: "#9ca3af",
                            fontWeight: 500,
                            textTransform: "uppercase",
                            letterSpacing: "0.03em",
                            lineHeight: 1.3
                          }, children: u.label })
                        ]
                      },
                      u.label
                    ))
                  }
                ),
                /* @__PURE__ */ c(
                  "div",
                  {
                    style: {
                      padding: d ? "14px" : "16px 20px",
                      background: "#f9fafb",
                      borderRadius: 12,
                      border: "1px solid #f3f4f6",
                      marginBottom: 16,
                      textAlign: "center"
                    },
                    "data-testid": "hero-metric",
                    children: [
                      /* @__PURE__ */ a("div", { style: { fontSize: 13, color: "#6b7280", marginBottom: 4, fontWeight: 500 }, children: Q.hero.label }),
                      /* @__PURE__ */ a("div", { style: {
                        fontSize: d ? 28 : 34,
                        fontWeight: 700,
                        color: "#111827",
                        letterSpacing: "-0.02em"
                      }, children: Ne(
                        Q.hero.value,
                        Q.hero.valueFormat
                      ) }),
                      Q.hero.subtitle && /* @__PURE__ */ a("div", { style: { fontSize: 13, color: "#9ca3af", marginTop: 6, lineHeight: 1.4 }, children: Q.hero.subtitle })
                    ]
                  }
                ),
                _ && /* @__PURE__ */ a("div", { style: { marginBottom: 20, padding: d ? "4px 0" : "8px 0" }, children: /* @__PURE__ */ a(
                  Vt,
                  {
                    bars: Q.chartSpec.bars,
                    width: 480,
                    height: d ? 180 : 220
                  }
                ) }),
                /* @__PURE__ */ a(
                  "div",
                  {
                    style: {
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 6,
                      marginBottom: 16
                    },
                    "data-testid": "summary-strip",
                    children: Q.strip.map((u, S) => /* @__PURE__ */ c("span", { style: Re, children: [
                      /* @__PURE__ */ c("span", { style: Pe, children: [
                        u.label,
                        ":"
                      ] }),
                      /* @__PURE__ */ a("span", { style: Me, children: Ne(u.value, u.valueFormat) })
                    ] }, S))
                  }
                ),
                _ && /* @__PURE__ */ a(
                  "div",
                  {
                    style: {
                      padding: "10px 14px",
                      background: "#f9fafb",
                      borderRadius: 10,
                      border: "1px solid #f3f4f6",
                      marginBottom: 16
                    },
                    children: /* @__PURE__ */ c("div", { style: { fontSize: 12, color: "#9ca3af" }, children: [
                      /* @__PURE__ */ a("strong", { style: { color: "#374151" }, children: "Standard" }),
                      " · ",
                      Fe(le),
                      " · Net Payout: ",
                      y($.isa_settlement)
                    ] })
                  }
                ),
                !_ && L && /* @__PURE__ */ c(ue, { children: [
                  /* @__PURE__ */ a(
                    "h3",
                    {
                      style: { margin: "0 0 10px 0", fontSize: 15, color: "#374151", fontWeight: 600 },
                      children: "Settlement Scenarios"
                    }
                  ),
                  /* @__PURE__ */ a(
                    "div",
                    {
                      style: {
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        marginBottom: 20
                      },
                      children: [
                        { label: "Early", data: L.settlements.early },
                        {
                          label: "Standard",
                          data: L.settlements.standard
                        },
                        { label: "Late", data: L.settlements.late }
                      ].map((u) => /* @__PURE__ */ c(
                        "div",
                        {
                          style: {
                            padding: "12px 14px",
                            background: "#f9fafb",
                            borderRadius: 10,
                            border: "1px solid #f3f4f6",
                            display: "grid",
                            gridTemplateColumns: d ? "1fr 1fr 1fr" : "1fr 1fr 1fr 1fr 1fr 1fr",
                            gap: 8,
                            alignItems: "center"
                          },
                          children: [
                            /* @__PURE__ */ c("div", { children: [
                              /* @__PURE__ */ a("div", { style: { fontSize: 11, color: "#9ca3af" }, children: "Timing" }),
                              /* @__PURE__ */ a("div", { style: { fontWeight: 600, fontSize: 13, color: "#111827" }, children: u.label })
                            ] }),
                            /* @__PURE__ */ c("div", { children: [
                              /* @__PURE__ */ a("div", { style: { fontSize: 11, color: "#9ca3af" }, children: "When" }),
                              /* @__PURE__ */ a("div", { style: { fontSize: 13, color: "#111827" }, children: Fe(u.data.settlementMonth) })
                            ] }),
                            /* @__PURE__ */ c("div", { children: [
                              /* @__PURE__ */ a("div", { style: { fontSize: 11, color: "#9ca3af" }, children: "Net Payout" }),
                              /* @__PURE__ */ a("div", { style: { fontWeight: 600, fontSize: 13, color: "#111827" }, children: y(u.data.netPayout) })
                            ] }),
                            !d && /* @__PURE__ */ c(ue, { children: [
                              /* @__PURE__ */ c("div", { children: [
                                /* @__PURE__ */ a("div", { style: { fontSize: 11, color: "#9ca3af" }, children: "Raw Payout" }),
                                /* @__PURE__ */ a("div", { style: { fontSize: 13, color: "#111827" }, children: y(u.data.rawPayout) })
                              ] }),
                              /* @__PURE__ */ c("div", { children: [
                                /* @__PURE__ */ a("div", { style: { fontSize: 11, color: "#9ca3af" }, children: "Transfer Fee" }),
                                /* @__PURE__ */ c("div", { style: { fontSize: 13, color: "#111827" }, children: [
                                  y(u.data.transferFeeAmount),
                                  " (",
                                  V(u.data.transferFeeRate),
                                  ")"
                                ] })
                              ] }),
                              /* @__PURE__ */ c("div", { children: [
                                /* @__PURE__ */ a("div", { style: { fontSize: 11, color: "#9ca3af" }, children: "Clamp" }),
                                /* @__PURE__ */ a("div", { style: { fontSize: 13, color: "#111827" }, children: u.data.clamp.applied === "none" ? "—" : u.data.clamp.applied === "floor" ? "Floor" : "Cap" })
                              ] })
                            ] })
                          ]
                        },
                        u.label
                      ))
                    }
                  )
                ] }),
                !_ && ke && /* @__PURE__ */ a("div", { style: { marginBottom: 20 }, children: /* @__PURE__ */ a(Ct, { series: ke, width: 520, height: d ? 200 : 260 }) }),
                /* @__PURE__ */ c(
                  "div",
                  {
                    style: {
                      display: "flex",
                      flexDirection: d ? "column" : "row",
                      gap: 10,
                      marginTop: 20
                    },
                    children: [
                      _ && /* @__PURE__ */ c(ue, { children: [
                        /* @__PURE__ */ a(
                          "button",
                          {
                            type: "button",
                            onClick: qe,
                            style: {
                              padding: d ? "14px 20px" : "12px 24px",
                              borderRadius: 10,
                              border: "none",
                              fontSize: d ? 16 : 15,
                              fontWeight: 600,
                              cursor: "pointer",
                              fontFamily: "system-ui, sans-serif",
                              background: "#111827",
                              color: "#fff",
                              width: d ? "100%" : "auto",
                              transition: "opacity 0.15s"
                            },
                            "data-cta": "save-continue",
                            children: "Save and Continue"
                          }
                        ),
                        /* @__PURE__ */ a(
                          "button",
                          {
                            type: "button",
                            onClick: Ve,
                            style: {
                              padding: d ? "14px 20px" : "12px 24px",
                              borderRadius: 10,
                              border: "1px solid #e5e7eb",
                              fontSize: d ? 16 : 15,
                              fontWeight: 600,
                              cursor: "pointer",
                              fontFamily: "system-ui, sans-serif",
                              background: "#fff",
                              color: "#111827",
                              width: d ? "100%" : "auto",
                              transition: "opacity 0.15s"
                            },
                            "data-cta": "share",
                            children: "Share"
                          }
                        )
                      ] }),
                      !_ && /* @__PURE__ */ a(
                        "button",
                        {
                          type: "button",
                          onClick: He,
                          style: {
                            padding: d ? "14px 20px" : "12px 24px",
                            borderRadius: 10,
                            border: "none",
                            fontSize: d ? 16 : 15,
                            fontWeight: 600,
                            cursor: "pointer",
                            fontFamily: "system-ui, sans-serif",
                            background: "#111827",
                            color: "#fff",
                            width: d ? "100%" : "auto"
                          },
                          "data-cta": "save",
                          children: "Save"
                        }
                      )
                    ]
                  }
                ),
                _ && /* @__PURE__ */ a("p", { style: {
                  margin: "12px 0 0 0",
                  fontSize: 13,
                  color: "#9ca3af",
                  lineHeight: 1.4,
                  textAlign: d ? "center" : "left"
                }, children: "Create a free account to save your scenario and continue in FractPath." })
              ] })
            ]
          }
        ),
        Y && E && /* @__PURE__ */ a(
          _n,
          {
            initial: je,
            persona: f,
            onClose: () => H(!1),
            onSaved: (u) => {
              W(u.deal_terms.property_value), M(u.deal_terms.upfront_payment), ee(u.deal_terms.monthly_payment), b(u.deal_terms.number_of_payments), C(u.scenario.exit_year), X(u.scenario.annual_appreciation * 100), J(u.deal_terms.realtor_representation_mode), q(u.deal_terms.realtor_commission_pct * 100), H(!1);
            }
          }
        ),
        /* @__PURE__ */ c(
          "div",
          {
            style: {
              marginTop: 16,
              color: "#d1d5db",
              fontSize: 11,
              textAlign: "center"
            },
            children: [
              "Viewing as ",
              /* @__PURE__ */ a("strong", { children: f }),
              " · ",
              "Mode: ",
              /* @__PURE__ */ a("strong", { children: n }),
              w && /* @__PURE__ */ c(ue, { children: [
                " ",
                "·",
                " DEV_AUTH: ",
                /* @__PURE__ */ a("strong", { children: w })
              ] }),
              " · ",
              y(k),
              " home ",
              "·",
              " ",
              y(h),
              " ",
              "upfront ",
              "·",
              " ",
              y(A),
              "\\u00d7",
              s,
              "mo ",
              "·",
              " ",
              v,
              "yr ",
              "·",
              " ",
              V(F / 100),
              " growth"
            ]
          }
        )
      ]
    }
  );
}
function Vn(e) {
  return /* @__PURE__ */ a(kn, { ...e });
}
function Rn({ items: e }) {
  return /* @__PURE__ */ a(
    "div",
    {
      style: {
        display: "flex",
        gap: 1,
        background: "#e5e7eb",
        borderRadius: 8,
        overflow: "hidden"
      },
      children: e.map((t, n) => /* @__PURE__ */ c(
        "div",
        {
          style: {
            flex: 1,
            background: "#fff",
            padding: "12px 14px",
            minWidth: 0,
            textAlign: "center"
          },
          children: [
            /* @__PURE__ */ a("div", { style: { fontSize: 11, color: "#9ca3af", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }, children: t.label }),
            /* @__PURE__ */ a("div", { style: { fontSize: 18, fontWeight: 700, color: "#111827", whiteSpace: "nowrap" }, children: t.value }),
            t.sublabel && /* @__PURE__ */ a("div", { style: { fontSize: 10, color: "#6b7280", marginTop: 2 }, children: t.sublabel })
          ]
        },
        n
      ))
    }
  );
}
function Pn({ results: e }) {
  return /* @__PURE__ */ c(
    "div",
    {
      style: {
        border: "1px dashed #d1d5db",
        borderRadius: 8,
        padding: "32px 20px",
        textAlign: "center",
        background: "#f9fafb",
        minHeight: 180,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8
      },
      children: [
        /* @__PURE__ */ c("svg", { width: "48", height: "48", viewBox: "0 0 48 48", fill: "none", children: [
          /* @__PURE__ */ a("rect", { x: "4", y: "28", width: "8", height: "16", rx: "2", fill: "#d1d5db" }),
          /* @__PURE__ */ a("rect", { x: "16", y: "18", width: "8", height: "26", rx: "2", fill: "#9ca3af" }),
          /* @__PURE__ */ a("rect", { x: "28", y: "10", width: "8", height: "34", rx: "2", fill: "#6b7280" }),
          /* @__PURE__ */ a("rect", { x: "40", y: "4", width: "4", height: "40", rx: "2", fill: "#374151" })
        ] }),
        /* @__PURE__ */ a("div", { style: { fontSize: 13, fontWeight: 600, color: "#374151" }, children: "Equity Transfer Chart" }),
        /* @__PURE__ */ c("div", { style: { fontSize: 11, color: "#9ca3af", maxWidth: 320, lineHeight: 1.5 }, children: [
          "Will render when schedule series is exposed in canonical compute outputs. Currently, compute v",
          e.compute_version,
          " returns summary results only."
        ] })
      ]
    }
  );
}
const Mn = [
  { key: "cash_flow", label: "Cash Flow" },
  { key: "ownership", label: "Ownership" },
  { key: "protections", label: "Protections" },
  { key: "fees", label: "Fees" },
  { key: "assumptions", label: "Assumptions" }
];
function j(e) {
  return (e * 100).toFixed(2) + "%";
}
function K(e) {
  return e.toFixed(2) + "×";
}
function Fn({ rows: e }) {
  return /* @__PURE__ */ a("dl", { style: { margin: 0 }, children: e.map((t, n) => /* @__PURE__ */ c(
    "div",
    {
      style: {
        display: "flex",
        justifyContent: "space-between",
        padding: "7px 0",
        borderBottom: n < e.length - 1 ? "1px solid #f3f4f6" : "none"
      },
      children: [
        /* @__PURE__ */ a("dt", { style: { fontSize: 13, color: "#6b7280" }, children: t.label }),
        /* @__PURE__ */ a(
          "dd",
          {
            style: {
              fontSize: 13,
              fontWeight: 500,
              color: "#111827",
              margin: 0
            },
            children: t.value
          }
        )
      ]
    },
    n
  )) });
}
function En(e, t) {
  const n = [
    {
      label: "Settlement",
      value: y(e.isa_settlement),
      sublabel: e.dyf_applied ? "DYF applied" : void 0
    },
    {
      label: "Investor Profit",
      value: y(e.investor_profit)
    },
    {
      label: "Return Multiple",
      value: K(e.investor_multiple)
    },
    {
      label: "Annual IRR",
      value: j(e.investor_irr_annual)
    },
    {
      label: "Projected FMV",
      value: y(e.projected_fmv),
      sublabel: `${j(t.scenario.annual_appreciation)} / yr`
    }
  ], r = t.deal_terms.realtor_representation_mode, o = t.deal_terms.realtor_commission_pct;
  return r !== "NONE" ? n.push({
    label: "Realtor Fee (est.)",
    value: y(e.realtor_fee_total_projected),
    sublabel: `${j(o)} · ${r}`
  }) : n.push({
    label: "Realtor Fee",
    value: y(0),
    sublabel: "No realtor"
  }), n;
}
function An(e) {
  return [
    {
      label: "Invested capital (total)",
      value: y(e.invested_capital_total)
    },
    { label: "ISA settlement", value: y(e.isa_settlement) },
    {
      label: "Investor profit",
      value: y(e.investor_profit)
    },
    { label: "Return multiple", value: K(e.investor_multiple) },
    { label: "Annual IRR", value: j(e.investor_irr_annual) },
    {
      label: "Annual IRR (net)",
      value: e.investor_irr_annual_net != null ? j(e.investor_irr_annual_net) : "Not computed"
    },
    {
      label: "Timing factor applied",
      value: K(e.timing_factor_applied)
    }
  ];
}
function Tn(e, t) {
  return [
    { label: "Vested equity", value: j(t.vested_equity_percentage) },
    {
      label: "Base equity value",
      value: y(t.base_equity_value)
    },
    {
      label: "Minimum hold",
      value: `${e.deal_terms.minimum_hold_years} yr`
    },
    {
      label: "Contract maturity",
      value: `${e.deal_terms.contract_maturity_years} yr`
    },
    {
      label: "Liquidity trigger",
      value: `${e.deal_terms.liquidity_trigger_year} yr`
    }
  ];
}
function Dn(e, t) {
  const n = [
    {
      label: "Floor multiple",
      value: K(e.deal_terms.floor_multiple)
    },
    { label: "Floor amount", value: y(t.floor_amount) },
    {
      label: "Ceiling multiple",
      value: K(e.deal_terms.ceiling_multiple)
    },
    { label: "Ceiling amount", value: y(t.ceiling_amount) },
    {
      label: "Downside mode",
      value: e.deal_terms.downside_mode === "HARD_FLOOR" ? "Hard floor" : "No floor"
    },
    {
      label: "Pre-floor/cap value",
      value: y(t.isa_pre_floor_cap)
    },
    {
      label: "Gain above capital",
      value: y(t.gain_above_capital)
    }
  ];
  return e.deal_terms.duration_yield_floor_enabled ? n.push(
    { label: "DYF enabled", value: "Yes" },
    {
      label: "DYF start year",
      value: `${e.deal_terms.duration_yield_floor_start_year ?? "—"} yr`
    },
    {
      label: "DYF min multiple",
      value: e.deal_terms.duration_yield_floor_min_multiple != null ? K(e.deal_terms.duration_yield_floor_min_multiple) : "—"
    },
    {
      label: "DYF floor amount",
      value: t.dyf_floor_amount != null ? y(t.dyf_floor_amount) : "—"
    },
    { label: "DYF applied", value: t.dyf_applied ? "Yes" : "No" }
  ) : n.push({ label: "DYF enabled", value: "No" }), n;
}
function Cn(e, t) {
  const n = [
    {
      label: "Platform fee",
      value: y(e.deal_terms.platform_fee)
    },
    {
      label: "Servicing fee (monthly)",
      value: y(e.deal_terms.servicing_fee_monthly)
    },
    { label: "Exit fee", value: j(e.deal_terms.exit_fee_pct) }
  ], r = e.deal_terms.realtor_representation_mode;
  return n.push({
    label: "Realtor representation",
    value: r === "NONE" ? "None" : r
  }), n.push({
    label: "Realtor commission",
    value: j(e.deal_terms.realtor_commission_pct)
  }), n.push({
    label: "Commission payment mode",
    value: e.deal_terms.realtor_commission_payment_mode
  }), n.push({
    label: "Realtor fee (upfront)",
    value: y(t.realtor_fee_upfront_projected)
  }), n.push({
    label: "Realtor fee (installments)",
    value: y(t.realtor_fee_installments_projected)
  }), n.push({
    label: "Buyer attribution",
    value: y(t.buyer_realtor_fee_total_projected)
  }), n.push({
    label: "Seller attribution",
    value: y(t.seller_realtor_fee_total_projected)
  }), n;
}
function Nn(e) {
  const t = [
    {
      label: "Annual appreciation",
      value: j(e.scenario.annual_appreciation)
    },
    { label: "Exit year", value: `${e.scenario.exit_year} yr` },
    { label: "Closing costs", value: j(e.scenario.closing_cost_pct) },
    {
      label: "Property value",
      value: y(e.deal_terms.property_value)
    },
    {
      label: "Upfront payment",
      value: y(e.deal_terms.upfront_payment)
    },
    {
      label: "Monthly payment",
      value: y(e.deal_terms.monthly_payment)
    },
    {
      label: "Number of payments",
      value: `${e.deal_terms.number_of_payments}`
    },
    {
      label: "Payback window",
      value: `${e.deal_terms.payback_window_start_year}–${e.deal_terms.payback_window_end_year} yr`
    },
    {
      label: "Timing factor (early)",
      value: K(e.deal_terms.timing_factor_early)
    },
    {
      label: "Timing factor (late)",
      value: K(e.deal_terms.timing_factor_late)
    }
  ];
  return e.scenario.fmv_override != null && t.push({
    label: "FMV override",
    value: y(e.scenario.fmv_override)
  }), t;
}
function On(e, t, n) {
  switch (e) {
    case "cash_flow":
      return An(n);
    case "ownership":
      return Tn(t, n);
    case "protections":
      return Dn(t, n);
    case "fees":
      return Cn(t, n);
    case "assumptions":
      return Nn(t);
  }
}
function Wn({
  persona: e,
  status: t,
  inputs: n,
  results: r
}) {
  const [o, i] = P("cash_flow"), l = En(r, n), p = On(o, n, r);
  return /* @__PURE__ */ c(
    "div",
    {
      style: {
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        fontFamily: "system-ui, sans-serif",
        overflow: "hidden"
      },
      "data-testid": "deal-snapshot-view",
      "data-persona": e,
      children: [
        /* @__PURE__ */ a(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 18px",
              borderBottom: "1px solid #e5e7eb",
              background: "#fafafa"
            },
            children: /* @__PURE__ */ a("h2", { style: { margin: 0, fontSize: 17, color: "#111827" }, children: "Deal Snapshot" })
          }
        ),
        /* @__PURE__ */ a("div", { style: { padding: "14px 18px" }, children: /* @__PURE__ */ a(Rn, { items: l }) }),
        /* @__PURE__ */ a("div", { style: { padding: "0 18px 14px" }, children: /* @__PURE__ */ a(Pn, { results: r }) }),
        /* @__PURE__ */ c("div", { style: { borderTop: "1px solid #e5e7eb" }, children: [
          /* @__PURE__ */ a(
            "div",
            {
              style: {
                display: "flex",
                borderBottom: "1px solid #e5e7eb",
                padding: "0 18px",
                overflowX: "auto"
              },
              children: Mn.map((m) => /* @__PURE__ */ a(
                "button",
                {
                  type: "button",
                  onClick: () => i(m.key),
                  style: {
                    padding: "9px 14px",
                    border: "none",
                    borderBottom: o === m.key ? "2px solid #111827" : "2px solid transparent",
                    background: "none",
                    fontSize: 12,
                    fontWeight: o === m.key ? 600 : 400,
                    color: o === m.key ? "#111827" : "#6b7280",
                    cursor: "pointer",
                    fontFamily: "system-ui, sans-serif",
                    whiteSpace: "nowrap"
                  },
                  children: m.label
                },
                m.key
              ))
            }
          ),
          /* @__PURE__ */ a("div", { style: { padding: "14px 18px" }, children: /* @__PURE__ */ a(Fn, { rows: p }) })
        ] }),
        /* @__PURE__ */ c(
          "div",
          {
            style: {
              padding: "8px 18px",
              borderTop: "1px solid #f3f4f6",
              background: "#fafafa",
              fontSize: 10,
              color: "#9ca3af",
              textAlign: "center"
            },
            children: [
              "Compute v",
              r.compute_version,
              " · Read-only snapshot"
            ]
          }
        )
      ]
    }
  );
}
function Bn({ value: e, anchors: t, onCommit: n, parseRaw: r }) {
  const [o, i] = P(""), [l, p] = P(!1), m = t.some((w) => w.value === e), _ = N(
    (w) => {
      p(!1), i(""), n(w);
    },
    [n]
  ), g = N(() => {
    p(!0);
  }, []), x = N((w) => {
    i(w);
  }, []), f = N(() => {
    if (!o) {
      p(!1);
      return;
    }
    const E = (r ?? ((Y) => parseFloat(Y.replace(/,/g, ""))))(o);
    Number.isFinite(E) && n(E), p(!1);
  }, [o, n, r]), d = l ? o : m ? "" : String(e);
  return {
    isAnchorMatch: m && !l,
    displayCustom: d,
    selectAnchor: _,
    focusCustom: g,
    changeCustom: x,
    blurCustom: f
  };
}
export {
  re as CONTRACT_VERSION,
  _n as DealEditModal,
  Rn as DealKpiStrip,
  Wn as DealSnapshotView,
  Ct as EquityChart,
  Pn as EquityTransferChart,
  I as FEE_DEFAULTS,
  Vn as FractPathCalculatorWidget,
  fn as MARKETING_PERSONAS,
  oe as SCHEMA_VERSION,
  Mt as buildChartSeries,
  jn as buildDraftSnapshot,
  Yt as buildFullDealSnapshotV1,
  qn as buildSavePayload,
  Hn as buildShareSummary,
  Pt as computeScenario,
  ie as deterministicHash,
  Z as getLabel,
  Yn as getPersonaConfig,
  Ln as getSummaryOrder,
  xt as normalizeInputs,
  Lt as resolvePersonaPresentation,
  Bn as useKioskInput
};
