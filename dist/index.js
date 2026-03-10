import { jsx as a, jsxs as s, Fragment as ue } from "react/jsx-runtime";
import { useMemo as z, useState as P, useRef as de, useEffect as re, useCallback as N } from "react";
import { createPortal as Xe } from "react-dom";
function T(e) {
  return Math.round((e + Number.EPSILON) * 100) / 100;
}
function ze(e) {
  return Math.round((e + Number.EPSILON) * 1e6) / 1e6;
}
function Je(e) {
  return Math.round((e + Number.EPSILON) * 1e4) / 1e4;
}
const Ie = 1e3, Se = 1e-10;
function ce(e, t) {
  let n = 0;
  for (let r = 0; r < t.length; r++)
    n += t[r] / Math.pow(1 + e, r);
  return n;
}
function Qe(e, t) {
  let n = 0;
  for (let r = 1; r < t.length; r++)
    n += -r * t[r] / Math.pow(1 + e, r + 1);
  return n;
}
function Ze(e) {
  if (e.length < 2)
    return null;
  let t = 0.01;
  for (let n = 0; n < Ie; n++) {
    const r = ce(t, e), o = Qe(t, e);
    if (Math.abs(o) < 1e-20)
      return ge(e);
    const i = t - r / o;
    if (i <= -1)
      return ge(e);
    if (Math.abs(i - t) < Se)
      return ze(i);
    t = i;
  }
  return ge(e);
}
function ge(e) {
  let t = -0.999, n = 10;
  const r = ce(t, e), o = ce(n, e);
  if (r * o > 0)
    return null;
  for (let i = 0; i < Ie; i++) {
    const l = (t + n) / 2, f = ce(l, e);
    if (Math.abs(f) < Se || (n - t) / 2 < Se)
      return ze(l);
    f * ce(t, e) < 0 ? n = l : t = l;
  }
  return null;
}
function et(e) {
  const t = Math.pow(1 + e, 12) - 1;
  return Je(t);
}
function tt(e) {
  const t = Ze(e);
  return t === null ? 0 : et(t);
}
const nt = "10.2.0";
function he(e, t) {
  const n = Math.floor(t.exit_year * 12), r = Math.min(e.number_of_payments, n), o = T(e.upfront_payment + at(e.monthly_payment, r)), i = T(rt(e, t)), l = ot(e, t.annual_appreciation, r), f = T(i * l), p = T(f - o), y = it(e, t.exit_year), S = T(o + p * y), g = T(o * e.floor_multiple), u = T(o * e.ceiling_multiple), d = T(lt(e.downside_mode, S, g, u)), { isa_settlement: v, dyf_floor_amount: E, dyf_applied: I } = st(e, t.exit_year, o, d), q = T(v - o), k = T(o > 0 ? v / o : 0), B = ct(e, r, n, v), h = tt(B), M = dt(e, t.annual_appreciation, r);
  return {
    invested_capital_total: o,
    vested_equity_percentage: l,
    projected_fmv: i,
    base_equity_value: f,
    gain_above_capital: p,
    timing_factor_applied: y,
    isa_pre_floor_cap: S,
    floor_amount: g,
    ceiling_amount: u,
    isa_standard_pre_dyf: d,
    isa_settlement: v,
    dyf_floor_amount: E,
    dyf_applied: I,
    investor_profit: q,
    investor_multiple: k,
    investor_irr_annual: h,
    realtor_fee_total_projected: M.realtor_fee_total_projected,
    realtor_fee_upfront_projected: M.realtor_fee_upfront_projected,
    realtor_fee_installments_projected: M.realtor_fee_installments_projected,
    buyer_realtor_fee_total_projected: M.buyer_realtor_fee_total_projected,
    seller_realtor_fee_total_projected: M.seller_realtor_fee_total_projected,
    investor_irr_annual_net: null,
    compute_version: nt
  };
}
function at(e, t) {
  return e * t;
}
function rt(e, t) {
  return t.fmv_override !== void 0 && t.fmv_override !== null && t.fmv_override > 0 ? t.fmv_override : e.property_value * Math.pow(1 + t.annual_appreciation, t.exit_year);
}
function ot(e, t, n) {
  const r = e.upfront_payment / e.property_value;
  let o = 0;
  for (let i = 1; i <= n; i++) {
    const l = e.property_value * Math.pow(1 + t, i / 12);
    o += e.monthly_payment / l;
  }
  return r + o;
}
function it(e, t) {
  return t < e.payback_window_start_year ? e.timing_factor_early : t > e.payback_window_end_year ? e.timing_factor_late : 1;
}
function lt(e, t, n, r) {
  return Math.min(e === "HARD_FLOOR" ? Math.max(t, n) : t, r);
}
function st(e, t, n, r) {
  if (!e.duration_yield_floor_enabled || e.duration_yield_floor_start_year == null || e.duration_yield_floor_min_multiple == null)
    return { isa_settlement: r, dyf_floor_amount: null, dyf_applied: !1 };
  const o = T(n * e.duration_yield_floor_min_multiple);
  return t >= e.duration_yield_floor_start_year && r < o ? { isa_settlement: o, dyf_floor_amount: o, dyf_applied: !0 } : { isa_settlement: r, dyf_floor_amount: o, dyf_applied: !1 };
}
function ct(e, t, n, r) {
  const o = new Array(n + 1).fill(0);
  o[0] = -e.upfront_payment;
  for (let i = 1; i <= t; i++)
    o[i] = -e.monthly_payment;
  return o[n] += r, o;
}
function dt(e, t, n) {
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
  const o = T(e.upfront_payment * r), i = T(e.monthly_payment * n * r), l = T(o + i);
  let f = 0, p = 0, y = e.upfront_payment / e.property_value;
  const S = e.upfront_payment * r;
  f += S * y, p += S * (1 - y);
  for (let g = 1; g <= n; g++) {
    const u = e.property_value * Math.pow(1 + t, g / 12);
    y += e.monthly_payment / u;
    const d = e.monthly_payment * r;
    f += d * y, p += d * (1 - y);
  }
  return {
    realtor_fee_total_projected: l,
    realtor_fee_upfront_projected: o,
    realtor_fee_installments_projected: i,
    buyer_realtor_fee_total_projected: T(f),
    seller_realtor_fee_total_projected: T(p)
  };
}
const mt = 0.03, ut = 0.035, pt = 0.045, ft = 0.025, yt = 1.1, _t = 2, ht = 0.01, bt = 0.03, gt = 0.1, vt = 25e-4, ve = {
  homeValue: 6e5,
  initialBuyAmount: 1e5,
  termYears: 10,
  annualGrowthRate: mt,
  transferFeeRate_standard: ut,
  transferFeeRate_early: pt,
  transferFeeRate_late: ft,
  floorMultiple: yt,
  capMultiple: _t,
  vesting: {
    upfrontEquityPct: gt,
    monthlyEquityPct: vt,
    months: 120
  },
  cpw: {
    startPct: ht,
    endPct: bt
  }
}, xt = (e, t, n) => Math.min(n, Math.max(t, e));
function wt(e) {
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
function St(e, t, n) {
  const r = n / 12;
  return e * Math.pow(1 + t, r);
}
function kt(e, t, n) {
  return xt(e + t * n, 0, 1);
}
function Rt(e, t) {
  const n = [];
  for (let r = 0; r <= t; r++) {
    const o = St(e.homeValue, e.annualGrowthRate, r), i = kt(
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
function _e(e, t) {
  const n = e.vesting.months;
  return t === "standard" ? n : t === "early" ? Math.min(36, n) : t === "late" ? n + 24 : n;
}
function Pt(e) {
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
  const n = _e(e, t), r = n / 12, o = Pt(e), i = he(o, {
    annual_appreciation: e.annualGrowthRate,
    exit_year: r
  }), l = i.isa_settlement === i.isa_pre_floor_cap ? "none" : i.isa_settlement === i.floor_amount ? "floor" : i.isa_settlement === i.ceiling_amount ? "cap" : "none", f = 0, p = 0, y = i.isa_settlement;
  return {
    timing: t,
    settlementMonth: n,
    homeValueAtSettlement: i.projected_fmv,
    equityPctAtSettlement: i.vested_equity_percentage,
    rawPayout: i.isa_pre_floor_cap,
    clampedPayout: i.isa_settlement,
    transferFeeAmount: p,
    netPayout: y,
    clamp: { floor: i.floor_amount, cap: i.ceiling_amount, applied: l },
    transferFeeRate: f
  };
}
function Mt(e = {}) {
  const t = wt(e), n = Math.max(
    _e(t, "standard"),
    _e(t, "early"),
    _e(t, "late")
  ), r = Rt(t, n), o = xe(t, "standard"), i = xe(t, "early"), l = xe(t, "late");
  return {
    normalizedInputs: t,
    series: r,
    settlements: { standard: o, early: i, late: l }
  };
}
function Ft(e) {
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
function Et(e, t, n) {
  return Math.min(n, Math.max(t, e));
}
function At(e) {
  return `${Math.round(e * 100)}%`;
}
function Tt(e) {
  return `${Math.round(e * 10) / 10}y`;
}
function Dt(e) {
  return e.timing === "early" ? "Early" : e.timing === "late" ? "Late" : "Std";
}
function Ct({ series: e, width: t = 640, height: n = 260 }) {
  const { points: r, markers: o } = e, i = z(
    () => `eq-${Math.random().toString(36).slice(2, 8)}`,
    []
  );
  if (!r.length)
    return /* @__PURE__ */ a("div", { style: { fontFamily: "system-ui, sans-serif" }, children: "No data" });
  const l = { top: 20, right: 24, bottom: 36, left: 50 }, f = Math.max(10, t - l.left - l.right), p = Math.max(10, n - l.top - l.bottom), y = r[0].month, S = r[r.length - 1].month, g = 0, u = 1, d = (h) => S === y ? l.left : l.left + (h - y) / (S - y) * f, v = (h) => {
    const M = Et(h, g, u);
    return l.top + (1 - (M - g) / (u - g)) * p;
  }, E = r.map((h, M) => {
    const O = d(h.month), ne = v(h.equityPct);
    return `${M === 0 ? "M" : "L"} ${O.toFixed(2)} ${ne.toFixed(2)}`;
  }).join(" "), I = r.length * 20, q = [0, 0.25, 0.5, 0.75, 1].map((h) => ({
    v: h,
    y: v(h),
    label: At(h)
  })), k = Math.round((y + S) / 2), B = [y, k, S].map((h) => ({
    m: h,
    x: d(h),
    label: Tt(h / 12)
  }));
  return /* @__PURE__ */ s(
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
          from { stroke-dashoffset: ${I}; }
          to { stroke-dashoffset: 0; }
        }
      ` }),
        /* @__PURE__ */ a("rect", { x: 0, y: 0, width: t, height: n, fill: "white", rx: 8 }),
        q.map((h) => /* @__PURE__ */ s("g", { children: [
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
            y1: l.top + p,
            y2: l.top + p,
            stroke: "#e5e7eb",
            strokeWidth: 1
          }
        ),
        B.map((h) => /* @__PURE__ */ s("g", { children: [
          /* @__PURE__ */ a(
            "line",
            {
              x1: h.x,
              x2: h.x,
              y1: l.top + p,
              y2: l.top + p + 6,
              stroke: "#d1d5db",
              strokeWidth: 1
            }
          ),
          /* @__PURE__ */ a(
            "text",
            {
              x: h.x,
              y: l.top + p + 24,
              fontSize: 11,
              textAnchor: "middle",
              fill: "#9ca3af",
              fontFamily: "system-ui, sans-serif",
              children: h.label
            }
          )
        ] }, h.m)),
        o.map((h) => {
          const M = d(h.month);
          return /* @__PURE__ */ s("g", { children: [
            /* @__PURE__ */ a(
              "line",
              {
                x1: M,
                x2: M,
                y1: l.top,
                y2: l.top + p,
                stroke: "#d1d5db",
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
                stroke: "#e5e7eb",
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
                fill: "#6b7280",
                fontFamily: "system-ui, sans-serif",
                fontWeight: 500,
                children: Dt(h)
              }
            )
          ] }, h.timing);
        }),
        /* @__PURE__ */ a(
          "path",
          {
            d: E,
            fill: "none",
            stroke: "#111827",
            strokeWidth: 2.5,
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeDasharray: I,
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
function _(e) {
  return e.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });
}
function j(e) {
  return `${(e * 100).toFixed(1)}%`;
}
function Ee(e) {
  const t = Math.floor(e / 12), n = e % 12;
  return t === 0 ? `${n}mo` : n === 0 ? `${t}yr` : `${t}yr ${n}mo`;
}
const Ae = {
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
function zn(e) {
  return Ae[e] ?? Ae.homeowner;
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
function te(e, t, n) {
  return Nt[t]?.[e] ?? n;
}
const Te = {
  homeowner: ["hero", "net_payout", "settlement_timing", "total_invested", "fees"],
  buyer: ["hero", "net_payout", "total_invested", "settlement_timing", "fees"],
  investor: ["hero", "net_payout", "total_invested", "fees", "settlement_timing"],
  realtor: ["hero", "fees", "net_payout", "settlement_timing", "total_invested"],
  ops: ["hero", "net_payout", "fees", "total_invested", "settlement_timing"]
};
function In(e) {
  return Te[e] ?? Te.homeowner;
}
const $ = {
  platform_fee: 2500,
  servicing_fee_monthly: 49,
  exit_fee_pct: 0.01
}, oe = "10.2.0", ie = "1";
function Oe(e) {
  const t = {};
  for (const n of Object.keys(e).sort()) {
    const r = e[n];
    r !== null && typeof r == "object" && !Array.isArray(r) ? t[n] = Oe(r) : t[n] = r;
  }
  return JSON.stringify(t);
}
async function le(e) {
  const t = Oe(e), n = new TextEncoder().encode(t), r = await crypto.subtle.digest("SHA-256", n);
  return Array.from(new Uint8Array(r)).map((i) => i.toString(16).padStart(2, "0")).join("");
}
function Ye(e) {
  return {
    homeValue: e.homeValue,
    initialBuyAmount: e.initialBuyAmount,
    termYears: e.termYears,
    annualGrowthRate: e.annualGrowthRate
  };
}
function zt(e) {
  return {
    standard_net_payout: e.settlements.standard.netPayout,
    early_net_payout: e.settlements.early.netPayout,
    late_net_payout: e.settlements.late.netPayout,
    standard_settlement_month: e.settlements.standard.settlementMonth,
    early_settlement_month: e.settlements.early.settlementMonth,
    late_settlement_month: e.settlements.late.settlementMonth
  };
}
function It(e) {
  return {
    standard_net_payout: e.settlements.standard.netPayout,
    early_net_payout: e.settlements.early.netPayout,
    late_net_payout: e.settlements.late.netPayout
  };
}
async function On(e, t, n) {
  const r = Ye(t), o = zt(n), [i, l] = await Promise.all([
    le(r),
    le(o)
  ]);
  return {
    contract_version: oe,
    schema_version: ie,
    persona: e,
    mode: "marketing",
    inputs: r,
    basic_results: o,
    input_hash: i,
    output_hash: l,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
}
function Yn(e, t, n) {
  return {
    contract_version: oe,
    schema_version: ie,
    persona: e,
    inputs: Ye(t),
    basic_results: It(n),
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
}
async function $n(e, t, n) {
  const [r, o] = await Promise.all([
    le(t),
    le({
      standard: n.settlements.standard,
      early: n.settlements.early,
      late: n.settlements.late
    })
  ]);
  return {
    contract_version: oe,
    schema_version: ie,
    persona: e,
    mode: "app",
    inputs: t,
    outputs: n,
    input_hash: r,
    output_hash: o,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
}
function Ot(e) {
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
    platform_fee: $.platform_fee,
    servicing_fee_monthly: $.servicing_fee_monthly,
    exit_fee_pct: $.exit_fee_pct,
    // Default realtor: NONE with 0 commission, PER_PAYMENT_EVENT locked
    realtor_representation_mode: "NONE",
    realtor_commission_pct: 0,
    realtor_commission_payment_mode: "PER_PAYMENT_EVENT"
  };
}
function Yt(e) {
  return {
    annual_appreciation: e.annualGrowthRate,
    // Default: 2% closing costs
    closing_cost_pct: 0.02,
    exit_year: e.termYears
  };
}
function $t(e) {
  const t = Ot(e), n = Yt(e), r = he(t, n), o = (/* @__PURE__ */ new Date()).toISOString();
  return {
    contract_version: oe,
    schema_version: ie,
    deal_terms: t,
    assumptions: n,
    outputs: r,
    now_iso: o,
    created_at: o
  };
}
function Y(e, t) {
  switch (t) {
    case "currency":
      return _(e);
    case "percent":
      return j(e);
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
  const r = n.investor_profit, o = n.isa_settlement, i = n.invested_capital_total, l = n.projected_fmv, f = n.investor_multiple, p = l > 0 ? o / l : 0;
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
      { label: "Implied equity share", value: p, valueFormat: "percent" },
      { label: "Return multiple", value: f, valueFormat: "multiple" }
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
      `~${Y(p, "percent")} equity built over ${t.exit_year} years — with no financing or interest.`,
      `You contribute ${Y(i, "currency")} total. At settlement, payout is ${Y(o, "currency")}.`,
      `Projected home value at settlement: ${Y(l, "currency")} (base assumptions).`,
      `Assumes ${Y(t.annual_appreciation, "percent")} annual appreciation — Save & Continue free to model different growth and timing.`
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
      `Unlock ${Y(r, "currency")} while continuing to own your home.`,
      `Upfront: ${Y(e.upfront_payment, "currency")}. Monthly: ${Y(e.monthly_payment, "currency")} for ${e.number_of_payments} months.`,
      `Projected home value at settlement: ${Y(o, "currency")} (base assumptions).`,
      `Assumes ${Y(t.annual_appreciation, "percent")} annual appreciation — Save & Continue free to model growth, protections, and timing.`
    ]
  };
}
function qt(e, t, n) {
  const r = n.realtor_fee_total_projected, o = n.isa_settlement, l = n.projected_fmv - o, f = e.realtor_commission_pct * 100;
  return {
    hero: {
      label: "Projected Commission (Standard)",
      value: r,
      valueFormat: "currency",
      subtitle: `Based on ${f.toFixed(1)}% as ${e.realtor_representation_mode} representation.`
    },
    strip: [
      { label: "Commission rate", value: `${f.toFixed(1)}%`, valueFormat: "text" },
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
      `Projected commission on this deal: ${Y(r, "currency")} (standard timing).`,
      `Commission rate: ${f.toFixed(1)}% as ${e.realtor_representation_mode} representation.`,
      "Capture buyers and sellers earlier — without requiring an immediate full sale or full purchase.",
      `Remaining property value at settlement (conditional): ${Y(l > 0 ? l : 0, "currency")}. Save free to model scenarios.`
    ]
  };
}
function Wt({ bars: e, width: t = 480, height: n = 220 }) {
  const r = Math.max(...e.map((g) => g.value), 1), o = Math.min(80, (t - 60) / e.length - 20), i = 36, l = n - 44, f = l - i, p = (t - 40) / e.length, y = ["#111827", "#6b7280", "#d1d5db", "#9ca3af", "#374151"], S = `bar-anim-${Math.random().toString(36).slice(2, 8)}`;
  return /* @__PURE__ */ s(
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
        @keyframes ${S} {
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
        e.map((g, u) => {
          const d = r > 0 ? g.value / r * f : 0, v = 20 + u * p + (p - o) / 2, E = l - d, I = y[u % y.length];
          return /* @__PURE__ */ s("g", { children: [
            /* @__PURE__ */ a(
              "rect",
              {
                x: v,
                y: E,
                width: o,
                height: Math.max(d, 2),
                rx: 6,
                ry: 6,
                fill: I,
                opacity: u === 0 ? 1 : 0.7,
                style: {
                  transformOrigin: `${v + o / 2}px ${l}px`,
                  animation: `${S} 0.5s ease-out ${u * 0.1}s both`
                }
              }
            ),
            /* @__PURE__ */ a(
              "text",
              {
                x: v + o / 2,
                y: E - 10,
                textAnchor: "middle",
                fontSize: 11,
                fontWeight: 600,
                fill: "#111827",
                fontFamily: "system-ui, sans-serif",
                children: _(g.value)
              }
            ),
            /* @__PURE__ */ a(
              "text",
              {
                x: v + o / 2,
                y: l + 18,
                textAnchor: "middle",
                fontSize: 10,
                fill: "#6b7280",
                fontFamily: "system-ui, sans-serif",
                children: g.label.length > 20 ? g.label.slice(0, 18) + "…" : g.label
              }
            )
          ] }, u);
        })
      ]
    }
  );
}
const Bt = [
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
function Vt(e, t) {
  const n = e.dynamicPercentAnchors;
  return n ? n.percents.map((r) => {
    let o = r * t;
    n.maxPercentOfSource != null && (o = Math.min(o, n.maxPercentOfSource * t));
    const i = Math.round(o / 100) * 100, l = n.min != null ? Math.max(n.min, i) : i;
    return { label: _(l), value: l };
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
function $e(e) {
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
  disabled: f,
  error: p
}) {
  const y = t.some((d) => d.value === e), S = n === "currency" || n === "number" || n === "months" || n === "years" ? "numeric" : "decimal", g = n === "currency" ? "$" : "", u = n === "percent" ? "%" : n === "years" ? " yr" : n === "months" ? " mo" : "";
  return /* @__PURE__ */ s("div", { children: [
    /* @__PURE__ */ a("div", { style: { display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }, children: t.map((d) => /* @__PURE__ */ a(
      "button",
      {
        type: "button",
        disabled: f,
        onClick: () => r(d.value),
        style: {
          ...d.value === e ? Gt : Le,
          opacity: f ? 0.5 : 1,
          cursor: f ? "not-allowed" : "pointer"
        },
        children: d.label
      },
      d.label
    )) }),
    /* @__PURE__ */ s("div", { style: { position: "relative" }, children: [
      g && /* @__PURE__ */ a(
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
          children: g
        }
      ),
      /* @__PURE__ */ a(
        "input",
        {
          type: "text",
          inputMode: S,
          disabled: f,
          value: y ? "" : o,
          placeholder: y ? "Custom" : "",
          onChange: (d) => i(d.target.value),
          onBlur: l,
          style: {
            width: "100%",
            padding: g ? "7px 10px 7px 22px" : "7px 10px",
            border: p ? "1px solid #ef4444" : "1px solid #d1d5db",
            borderRadius: 6,
            fontSize: 13,
            fontFamily: "system-ui, sans-serif",
            boxSizing: "border-box",
            background: f ? "#f3f4f6" : "#fff",
            color: f ? "#9ca3af" : "#111827"
          }
        }
      ),
      u && /* @__PURE__ */ a(
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
          children: u
        }
      )
    ] }),
    p && /* @__PURE__ */ a("div", { style: { color: "#ef4444", fontSize: 11, marginTop: 3 }, children: p })
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
  return /* @__PURE__ */ s(
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
        /* @__PURE__ */ s(
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
        /* @__PURE__ */ s("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }, children: [
          /* @__PURE__ */ s("div", { children: [
            /* @__PURE__ */ a("div", { style: { fontSize: 11, color: "#9ca3af" }, children: "Upfront cash" }),
            /* @__PURE__ */ a("div", { style: { fontSize: 15, fontWeight: 600, color: "#111827" }, children: _(e.upfrontCash) })
          ] }),
          /* @__PURE__ */ s("div", { children: [
            /* @__PURE__ */ a("div", { style: { fontSize: 11, color: "#9ca3af" }, children: "Installments" }),
            /* @__PURE__ */ a("div", { style: { fontSize: 13, color: "#374151" }, children: e.installmentsLabel })
          ] }),
          /* @__PURE__ */ s("div", { children: [
            /* @__PURE__ */ a("div", { style: { fontSize: 11, color: "#9ca3af" }, children: "Total installments" }),
            /* @__PURE__ */ a("div", { style: { fontSize: 13, color: "#374151" }, children: _(e.totalInstallments) })
          ] }),
          /* @__PURE__ */ s("div", { children: [
            /* @__PURE__ */ a("div", { style: { fontSize: 11, color: "#9ca3af" }, children: "Total cash paid" }),
            /* @__PURE__ */ a("div", { style: { fontSize: 15, fontWeight: 600, color: "#111827" }, children: _(e.totalCashPaid) })
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
  re(() => {
    if (!n) return;
    function p(y) {
      o.current && !o.current.contains(y.target) && i.current && !i.current.contains(y.target) && r(!1);
    }
    return document.addEventListener("mousedown", p), () => document.removeEventListener("mousedown", p);
  }, [n]);
  const [l, f] = P({ top: 0, left: 0 });
  return re(() => {
    if (!n || !o.current) return;
    const p = o.current.getBoundingClientRect();
    f({
      top: p.top + window.scrollY - 8,
      left: p.left + p.width / 2 + window.scrollX
    });
  }, [n]), /* @__PURE__ */ s("span", { style: { display: "inline-block", marginLeft: 4 }, children: [
    /* @__PURE__ */ a(
      "button",
      {
        ref: o,
        type: "button",
        onClick: () => r((p) => !p),
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
    n && Xe(
      /* @__PURE__ */ s(
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
      return n.upfrontPayment != null && i.push(`You ${r} ${_(n.upfrontPayment)} upfront at closing.`), n.monthlyPayment != null && n.numberOfPayments != null && n.numberOfPayments > 0 && i.push(
        `Then ${_(n.monthlyPayment)}/mo for ${n.numberOfPayments} months.`
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
      return n.platformFee != null && i.push(`Platform fee: ${_(n.platformFee)} (one-time at closing).`), n.servicingFeeMonthly != null && i.push(`Monthly servicing: ${_(n.servicingFeeMonthly)}/mo for account management.`), n.exitFeePct != null && i.push(`Exit fee: ${j(n.exitFeePct)} of the settlement amount at exit.`), i.length === 0 && i.push("Fees include a platform fee, monthly servicing, and an exit fee at settlement."), t === "realtor" && i.push("Realtor commission is tracked separately below."), i;
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
  return e.dynamicPercentAnchors ? Vt(e, t.deal_terms.property_value) : e.anchors ?? [];
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
  onSave: f,
  onClose: p
}) {
  const [y, S] = P("payments"), [g, u] = P({}), d = z(() => {
    const c = /* @__PURE__ */ new Map();
    for (const b of Bt) c.set(b.key, b);
    return c;
  }, []), v = !$e(t) && r !== "realtor" && o?.canEdit !== !1, E = N(
    (c, b) => {
      if (i(c, b), u((x) => ({ ...x, [c]: "" })), c !== "deal_terms.realtor_representation_mode") {
        if (c === "deal_terms.realtor_commission_pct") {
          l();
          return;
        }
        l();
      }
    },
    [i, l]
  ), I = N(
    (c, b) => {
      if (c === "deal_terms.duration_yield_floor_enabled") {
        i(c, b === "true"), l();
        return;
      }
      if (i(c, b), c === "deal_terms.realtor_representation_mode") {
        b === "NONE" && i("deal_terms.realtor_commission_pct", 0), l();
        return;
      }
      l();
    },
    [i, l]
  ), q = N(
    (c, b) => {
      u((x) => ({ ...x, [c]: b }));
    },
    []
  ), k = N(
    (c, b) => {
      const x = g[c];
      if (x === void 0 || x === "") return;
      let D;
      b.unit === "percent" ? D = parseFloat(x) / 100 : D = parseFloat(x.replace(/,/g, "")), Number.isFinite(D) && (b.hardRange && (D = Math.max(b.hardRange.min, Math.min(b.hardRange.max, D))), i(c, D), l());
    },
    [g, i, l]
  ), B = N(() => {
    v && (f(e), p());
  }, [v, e, f, p]), h = (c) => c === "deal_terms.realtor_commission_pct" ? e.deal_terms.realtor_representation_mode === "NONE" : c === "deal_terms.realtor_commission_payment_mode", M = (c, b) => c == null ? "—" : b.unit === "percent" ? `${(c * 100).toFixed(2)}%` : b.unit === "currency" ? _(c) : b.unit === "years" ? `${c} yr` : b.unit === "months" ? `${c} mo` : typeof c == "boolean" ? c ? "Yes" : "No" : String(c), O = (c) => {
    const b = c.key, x = en(e, b), D = t[b], F = c.readOnly || h(b), J = te(b, r, c.label);
    if (c.control === "info")
      return /* @__PURE__ */ s(
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
            /* @__PURE__ */ a("div", { style: { fontWeight: 600, marginBottom: 4 }, children: c.simpleDefinition }),
            /* @__PURE__ */ a("div", { children: c.impact })
          ]
        },
        b
      );
    if (c.control === "enum") {
      const R = c.options ?? [], Q = b === "deal_terms.duration_yield_floor_enabled" ? String(x) : x;
      return /* @__PURE__ */ s("div", { style: { marginBottom: 14 }, children: [
        /* @__PURE__ */ s("label", { style: fe, children: [
          J,
          /* @__PURE__ */ a(pe, { simpleDefinition: c.simpleDefinition, impact: c.impact })
        ] }),
        /* @__PURE__ */ a(
          "select",
          {
            value: Q,
            disabled: F,
            onChange: (A) => I(b, A.target.value),
            style: {
              ...ln,
              background: F ? "#f3f4f6" : "#fff",
              color: F ? "#9ca3af" : "#111827"
            },
            children: R.map((A) => /* @__PURE__ */ a("option", { value: A.value, children: A.label }, A.value))
          }
        ),
        D && /* @__PURE__ */ a("div", { style: Ce, children: D })
      ] }, b);
    }
    if (c.control === "readonly")
      return /* @__PURE__ */ s("div", { style: { marginBottom: 14 }, children: [
        /* @__PURE__ */ s("label", { style: fe, children: [
          J,
          /* @__PURE__ */ a(pe, { simpleDefinition: c.simpleDefinition, impact: c.impact })
        ] }),
        /* @__PURE__ */ a("div", { style: sn, children: M(x, c) })
      ] }, b);
    if (c.control === "slider" && c.slider)
      return /* @__PURE__ */ s("div", { style: { marginBottom: 14 }, children: [
        /* @__PURE__ */ s("label", { style: fe, children: [
          J,
          /* @__PURE__ */ a(pe, { simpleDefinition: c.simpleDefinition, impact: c.impact })
        ] }),
        /* @__PURE__ */ s("div", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [
          /* @__PURE__ */ a(
            "input",
            {
              type: "range",
              min: c.slider.min,
              max: c.slider.max,
              step: c.slider.step,
              value: x,
              disabled: F,
              onChange: (R) => i(b, parseFloat(R.target.value)),
              onMouseUp: l,
              onTouchEnd: l,
              style: { flex: 1 }
            }
          ),
          /* @__PURE__ */ a("span", { style: { fontSize: 13, fontWeight: 600, minWidth: 80, textAlign: "right" }, children: M(x, c) })
        ] }),
        D && /* @__PURE__ */ a("div", { style: Ce, children: D })
      ] }, b);
    if (c.control === "kiosk") {
      const R = tn(c, e), Q = R.length >= 4 ? [R[0], R[1], R[2], R[3]] : [
        R[0] ?? { label: "—", value: 0 },
        R[1] ?? { label: "—", value: 0 },
        R[2] ?? { label: "—", value: 0 },
        R[3] ?? { label: "—", value: 0 }
      ];
      let A = g[b] ?? "";
      return !A && !Q.some((W) => W.value === x) && (c.unit === "percent" ? A = (x * 100).toString() : A = String(x)), /* @__PURE__ */ s("div", { style: { marginBottom: 14 }, children: [
        /* @__PURE__ */ s("label", { style: fe, children: [
          J,
          /* @__PURE__ */ a(pe, { simpleDefinition: c.simpleDefinition, impact: c.impact })
        ] }),
        /* @__PURE__ */ a(
          Kt,
          {
            value: x,
            anchors: Q,
            unit: c.unit,
            onSelectAnchor: (W) => E(b, W),
            customValue: A,
            onChangeCustom: (W) => q(b, W),
            onBlurCustom: () => k(b, c),
            disabled: F,
            error: D
          }
        )
      ] }, b);
    }
    return null;
  }, ne = De.find((c) => c.key === y);
  return /* @__PURE__ */ a("div", { style: nn, onClick: (c) => {
    c.target === c.currentTarget && p();
  }, children: /* @__PURE__ */ s("div", { style: an, role: "dialog", "aria-modal": "true", "data-testid": "deal-edit-modal", children: [
    /* @__PURE__ */ a("div", { style: { padding: "16px 20px 0", borderBottom: "none" }, children: /* @__PURE__ */ s("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
      /* @__PURE__ */ a("h2", { style: { margin: 0, fontSize: 18, color: "#111827" }, children: "Edit Deal Terms" }),
      /* @__PURE__ */ a(
        "button",
        {
          type: "button",
          onClick: p,
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
    /* @__PURE__ */ a("div", { style: rn, children: De.map((c) => /* @__PURE__ */ a(
      "button",
      {
        type: "button",
        onClick: () => S(c.key),
        style: {
          padding: "10px 16px",
          border: "none",
          borderBottom: y === c.key ? "2px solid #111827" : "2px solid transparent",
          background: "none",
          fontSize: 13,
          fontWeight: y === c.key ? 600 : 400,
          color: y === c.key ? "#111827" : "#6b7280",
          cursor: "pointer",
          fontFamily: "system-ui, sans-serif",
          whiteSpace: "nowrap"
        },
        children: c.label
      },
      c.key
    )) }),
    /* @__PURE__ */ a("div", { style: { flex: 1, overflow: "auto", padding: "16px 20px" }, children: /* @__PURE__ */ s("div", { style: { display: "grid", gridTemplateColumns: "1fr 220px", gap: 20 }, children: [
      /* @__PURE__ */ a("div", { children: ne.sections.map((c) => /* @__PURE__ */ s("div", { style: { marginBottom: 20 }, children: [
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
            children: c.label
          }
        ),
        c.fieldKeys.map((b) => {
          const x = d.get(b);
          return x ? O(x) : null;
        })
      ] }, c.label)) }),
      /* @__PURE__ */ s("div", { children: [
        /* @__PURE__ */ a(
          Qt,
          {
            tier1: n.tier1,
            status: n.status,
            error: n.error
          }
        ),
        /* @__PURE__ */ s(
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
              /* @__PURE__ */ a("ul", { style: { margin: 0, padding: "0 0 0 14px", fontSize: 11, lineHeight: 1.6, color: "#374151" }, children: Zt(y, r, {
                upfrontPayment: e.deal_terms.upfront_payment,
                monthlyPayment: e.deal_terms.monthly_payment,
                numberOfPayments: e.deal_terms.number_of_payments,
                contractMaturityYears: e.deal_terms.contract_maturity_years,
                minimumHoldYears: e.deal_terms.minimum_hold_years,
                exitYear: e.scenario.exit_year,
                platformFee: e.deal_terms.platform_fee,
                servicingFeeMonthly: e.deal_terms.servicing_fee_monthly,
                exitFeePct: e.deal_terms.exit_fee_pct
              }).map((c, b) => /* @__PURE__ */ a("li", { style: { marginBottom: 2 }, children: c }, b)) })
            ]
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ s(
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
              onClick: p,
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
              onClick: B,
              disabled: !v,
              style: {
                padding: "8px 24px",
                borderRadius: 8,
                border: "none",
                background: v ? "#111827" : "#d1d5db",
                color: v ? "#fff" : "#9ca3af",
                fontSize: 13,
                fontWeight: 600,
                cursor: v ? "pointer" : "not-allowed",
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
function ke() {
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
      platform_fee: $.platform_fee,
      servicing_fee_monthly: $.servicing_fee_monthly,
      exit_fee_pct: $.exit_fee_pct,
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
function ye(e) {
  const { upfront_payment: t, monthly_payment: n, number_of_payments: r } = e.deal_terms, { exit_year: o } = e.scenario, i = Math.floor(o * 12), l = Math.min(r, i), f = n * l, p = t + f, y = l === 0 ? "No installments" : `${l} payments of ${_(n)}`;
  return {
    upfrontCash: t,
    installmentsLabel: y,
    totalInstallments: f,
    totalCashPaid: p
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
    () => e ?? ke()
  ), [r, o] = P({}), [i, l] = P(() => ({
    tier1: ye(e ?? ke()),
    status: "idle"
  })), f = N((S, g) => {
    n((u) => {
      const d = dn(u, S, g);
      return l((v) => ({ ...v, tier1: ye(d) })), d;
    });
  }, []), p = N(() => {
    n((S) => {
      const g = Ut(S);
      if (o(g), $e(g))
        return l((u) => ({
          ...u,
          status: "error",
          error: "Validation failed"
        })), S;
      l((u) => ({ ...u, status: "computing" }));
      try {
        const u = cn(S);
        l({
          tier1: ye(S),
          status: "ok",
          lastComputedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
          results: u
        });
      } catch (u) {
        l((d) => ({
          ...d,
          status: "error",
          error: u instanceof Error ? u.message : "Compute failed"
        }));
      }
      return S;
    });
  }, []), y = z(() => ye(t), [t]);
  return {
    draft: t,
    errors: r,
    preview: { ...i, tier1: y },
    setField: f,
    onBlurCompute: p
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
    platform_fee: $.platform_fee,
    servicing_fee_monthly: $.servicing_fee_monthly,
    exit_fee_pct: $.exit_fee_pct,
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
function yn(e) {
  const t = z(() => {
    const f = ke();
    return {
      ...f,
      ...e.initial,
      deal_terms: {
        ...f.deal_terms,
        ...e.initial?.deal_terms ?? {}
      },
      scenario: {
        ...f.scenario,
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
      onSave: (f) => e.onSaved(f),
      onClose: e.onClose
    }
  );
}
function _n(e = 640) {
  const [t, n] = P(!1);
  return re(() => {
    if (typeof window > "u") return;
    const r = window.matchMedia(`(max-width: ${e}px)`);
    n(r.matches);
    const o = (i) => n(i.matches);
    return r.addEventListener("change", o), () => r.removeEventListener("change", o);
  }, [e]), t;
}
function hn({ value: e, format: t }) {
  const n = de(null), r = de(e), o = de(0);
  re(() => {
    const l = r.current, f = e;
    if (r.current = f, l === f || !n.current) return;
    const p = 300, y = performance.now(), S = (g) => {
      const u = g - y, d = Math.min(u / p, 1), v = 1 - Math.pow(1 - d, 3), E = l + (f - l) * v;
      n.current && (t === "currency" ? n.current.textContent = _(E) : t === "percent" ? n.current.textContent = j(E) : n.current.textContent = E.toLocaleString(void 0, { maximumFractionDigits: 1 })), d < 1 && (o.current = requestAnimationFrame(S));
    };
    return o.current = requestAnimationFrame(S), () => cancelAnimationFrame(o.current);
  }, [e, t]);
  let i;
  return t === "currency" ? i = _(e) : t === "percent" ? i = j(e) : i = e.toLocaleString(void 0, { maximumFractionDigits: 1 }), /* @__PURE__ */ a("span", { ref: n, children: i });
}
const we = {
  homeowner: {
    headline: "Unlock value tied to future home appreciation",
    body: "Model a structured agreement where a homeowner receives capital today while sharing a portion of future appreciation.",
    chips: ["Access value today", "Stay in the home", "Model future outcomes"]
  },
  buyer: {
    headline: "Explore participation in future home appreciation",
    body: "Model a scenario where a buyer participates in future property appreciation through a structured agreement.",
    chips: ["Model appreciation scenarios", "Compare outcomes", "Save and continue in FractPath"]
  }
};
function je() {
  if (typeof window > "u") return !1;
  try {
    return new URLSearchParams(window.location.search).get("DEV_HARNESS") === "true" || !1;
  } catch {
    return !1;
  }
}
function bn() {
  if (!je() || typeof window > "u") return null;
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
      return _(e);
    case "percent":
      return j(e);
    case "multiple":
      return `${e.toFixed(2)}×`;
    case "months":
      return `${e}`;
    default:
      return String(e);
  }
}
const gn = `
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
function vn(e) {
  const {
    persona: t,
    mode: n = "marketing",
    canEdit: r,
    onEvent: o,
    onDraftSnapshot: i,
    onShareSummary: l,
    onSave: f
  } = e, p = n === "app", y = n === "marketing", [S, g] = P(t);
  re(() => {
    g(t);
  }, [t]);
  const u = y ? S : t, d = _n(), v = bn(), E = v === "editor" ? !0 : v === "viewer" || v === "loggedOut" ? !1 : r ?? !1, [I, q] = P(!1), [k, B] = P(6e5), [h, M] = P(1e5), [O, ne] = P(0), [c, b] = P(0), [x, D] = P(10), [F, J] = P(3), [R, Q] = P("NONE"), [A, W] = P(0);
  re(() => {
    o?.({ type: "calculator_used", persona: u });
  }, [u, o]);
  const me = z(
    () => ({
      propertyValue: k,
      upfrontPayment: h,
      monthlyPayment: O,
      numberOfPayments: c,
      exitYear: x,
      growthRatePct: F,
      realtorMode: R,
      realtorPct: A
    }),
    [
      k,
      h,
      O,
      c,
      x,
      F,
      R,
      A
    ]
  ), Z = z(
    () => un(me),
    [me]
  ), ee = z(
    () => pn(me),
    [me]
  ), He = z(
    () => ({ deal_terms: Z, scenario: ee }),
    [Z, ee]
  ), C = z(
    () => he(Z, ee),
    [Z, ee]
  ), V = z(
    () => Lt(
      u,
      Z,
      ee,
      C
    ),
    [u, Z, ee, C]
  ), se = x * 12, L = z(
    () => p ? Mt({
      homeValue: k,
      initialBuyAmount: h,
      termYears: x,
      annualGrowthRate: F / 100
    }) : null,
    [p, k, h, x, F]
  ), Re = z(
    () => L ? Ft(L) : null,
    [L]
  ), be = (m, w) => {
    const ae = Number(m.replace(/,/g, ""));
    return Number.isFinite(ae) && ae >= 0 ? ae : w;
  }, qe = N(() => {
    if (o?.({ type: "save_clicked", persona: u }), f && L) {
      const m = $t(L.normalizedInputs);
      f(m);
    }
  }, [L, f, o, u]), We = N(async () => {
    if (o?.({ type: "save_continue_clicked", persona: u }), i) {
      const m = {
        homeValue: k,
        initialBuyAmount: h,
        termYears: x,
        annualGrowthRate: F / 100
      }, w = {
        standard_net_payout: C.isa_settlement,
        early_net_payout: C.isa_settlement,
        late_net_payout: C.isa_settlement,
        standard_settlement_month: se,
        early_settlement_month: se,
        late_settlement_month: se
      }, [ae, Ke] = await Promise.all([
        le(m),
        le(w)
      ]);
      i({
        contract_version: oe,
        schema_version: ie,
        persona: u,
        mode: "marketing",
        inputs: m,
        basic_results: w,
        input_hash: ae,
        output_hash: Ke,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  }, [
    u,
    k,
    h,
    x,
    F,
    C,
    se,
    i,
    o
  ]), Be = N(() => {
    o?.({ type: "share_clicked", persona: u }), l && l({
      contract_version: oe,
      schema_version: ie,
      persona: u,
      inputs: {
        homeValue: k,
        initialBuyAmount: h,
        termYears: x,
        annualGrowthRate: F / 100
      },
      basic_results: {
        standard_net_payout: C.isa_settlement,
        early_net_payout: C.isa_settlement,
        late_net_payout: C.isa_settlement
      },
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    });
  }, [
    u,
    k,
    h,
    x,
    F,
    C,
    l,
    o
  ]), Ve = z(() => {
    const m = [
      { label: "Property", value: _(k) },
      { label: "Upfront", value: _(h) },
      { label: "Monthly", value: _(O) },
      { label: "# Months", value: String(c) },
      { label: "Exit Year", value: String(x) },
      { label: "Growth", value: j(F / 100) }
    ];
    return R !== "NONE" && m.push({ label: "Realtor", value: `${R} ${A}%` }), m;
  }, [
    k,
    h,
    O,
    c,
    x,
    F,
    R,
    A
  ]), Ue = k * Math.pow(1 + F / 100, x), Ge = fn.filter(
    (m) => m === "homeowner" || m === "buyer"
  ), U = {
    display: "block",
    fontSize: d ? 14 : 13,
    color: "#374151",
    marginBottom: 6,
    fontWeight: 500,
    letterSpacing: "-0.01em"
  }, G = {
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
  }, K = {
    marginBottom: d ? 20 : 16
  }, Pe = {
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
  }, Me = {
    color: "#9ca3af",
    fontWeight: 400
  }, Fe = {
    fontWeight: 600,
    color: "#111827"
  };
  return /* @__PURE__ */ s(
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
      "data-persona": u,
      "data-mode": n,
      children: [
        /* @__PURE__ */ a("style", { children: gn }),
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
        y && /* @__PURE__ */ s("div", { style: { marginBottom: 24 }, children: [
          /* @__PURE__ */ a("div", { style: {
            display: "flex",
            gap: 0,
            borderBottom: "1px solid #e5e7eb",
            marginBottom: 20
          }, children: Ge.map((m) => {
            const w = u === m;
            return /* @__PURE__ */ a(
              "button",
              {
                type: "button",
                onClick: () => g(m),
                style: {
                  padding: d ? "10px 16px" : "10px 24px",
                  fontSize: d ? 14 : 15,
                  fontWeight: w ? 600 : 400,
                  color: w ? "#111827" : "#9ca3af",
                  background: "transparent",
                  border: "none",
                  borderBottom: w ? "2px solid #111827" : "2px solid transparent",
                  cursor: "pointer",
                  fontFamily: "system-ui, sans-serif",
                  transition: "color 0.2s, border-color 0.2s",
                  marginBottom: -1
                },
                "aria-selected": w,
                role: "tab",
                children: m === "homeowner" ? "Homeowner" : "Buyer"
              },
              m
            );
          }) }),
          (u === "homeowner" || u === "buyer") && /* @__PURE__ */ s(
            "div",
            {
              style: {
                animation: "fp-tabSwitch 0.25s ease-out",
                marginBottom: 4
              },
              children: [
                /* @__PURE__ */ a("h3", { style: {
                  margin: "0 0 6px 0",
                  fontSize: d ? 18 : 20,
                  fontWeight: 600,
                  color: "#111827",
                  letterSpacing: "-0.01em"
                }, children: we[u].headline }),
                /* @__PURE__ */ a("p", { style: {
                  margin: "0 0 12px 0",
                  fontSize: d ? 14 : 15,
                  color: "#6b7280",
                  lineHeight: 1.5
                }, children: we[u].body }),
                /* @__PURE__ */ a("div", { style: { display: "flex", flexWrap: "wrap", gap: 8 }, children: we[u].chips.map((m) => /* @__PURE__ */ a(
                  "span",
                  {
                    style: {
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "6px 14px",
                      background: "#f9fafb",
                      borderRadius: 20,
                      fontSize: 13,
                      color: "#374151",
                      border: "1px solid #e5e7eb",
                      fontWeight: 500
                    },
                    children: m
                  },
                  m
                )) })
              ]
            },
            u
          )
        ] }),
        p && /* @__PURE__ */ s("div", { style: { marginBottom: 20 }, children: [
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
              children: Ve.map((m, w) => /* @__PURE__ */ s("span", { style: Pe, children: [
                /* @__PURE__ */ s("span", { style: Me, children: [
                  m.label,
                  ":"
                ] }),
                /* @__PURE__ */ a("span", { style: Fe, children: m.value })
              ] }, w))
            }
          ),
          E && /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              onClick: () => q(!0),
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
        /* @__PURE__ */ s(
          "div",
          {
            style: {
              display: "grid",
              gridTemplateColumns: p || d ? "1fr" : "minmax(240px, 1fr) minmax(340px, 2fr)",
              gap: d ? 16 : 24
            },
            children: [
              y && /* @__PURE__ */ s("div", { children: [
                /* @__PURE__ */ a(
                  "h3",
                  {
                    style: {
                      margin: "0 0 16px 0",
                      fontSize: 14,
                      color: "#9ca3af",
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em"
                    },
                    children: "Scenario Inputs"
                  }
                ),
                /* @__PURE__ */ s("div", { style: K, children: [
                  /* @__PURE__ */ a("label", { style: U, children: te(
                    "deal_terms.property_value",
                    u,
                    "Home Value ($)"
                  ) }),
                  /* @__PURE__ */ a(
                    "input",
                    {
                      type: "text",
                      inputMode: "numeric",
                      style: G,
                      value: k.toLocaleString(),
                      onChange: (m) => {
                        B(be(m.target.value, k));
                      }
                    }
                  )
                ] }),
                /* @__PURE__ */ s("div", { style: K, children: [
                  /* @__PURE__ */ a("label", { style: U, children: te(
                    "deal_terms.upfront_payment",
                    u,
                    "Upfront Payment ($)"
                  ) }),
                  /* @__PURE__ */ a(
                    "input",
                    {
                      type: "text",
                      inputMode: "numeric",
                      style: G,
                      value: h.toLocaleString(),
                      onChange: (m) => {
                        M(
                          be(m.target.value, h)
                        );
                      }
                    }
                  )
                ] }),
                /* @__PURE__ */ s("div", { style: K, children: [
                  /* @__PURE__ */ a("label", { style: U, children: te(
                    "deal_terms.monthly_payment",
                    u,
                    "Monthly Installment ($)"
                  ) }),
                  /* @__PURE__ */ a(
                    "input",
                    {
                      type: "text",
                      inputMode: "numeric",
                      style: G,
                      value: O.toLocaleString(),
                      onChange: (m) => {
                        ne(
                          be(m.target.value, O)
                        );
                      }
                    }
                  )
                ] }),
                /* @__PURE__ */ s("div", { style: K, children: [
                  /* @__PURE__ */ a("label", { style: U, children: "Number of Monthly Payments" }),
                  /* @__PURE__ */ a(
                    "input",
                    {
                      type: "number",
                      min: 0,
                      max: 360,
                      step: 1,
                      style: G,
                      value: c,
                      onChange: (m) => {
                        const w = parseInt(m.target.value, 10);
                        Number.isFinite(w) && w >= 0 && w <= 360 && b(w);
                      }
                    }
                  )
                ] }),
                /* @__PURE__ */ s("div", { style: K, children: [
                  /* @__PURE__ */ a("label", { style: U, children: te("scenario.exit_year", u, "Target Exit Year") }),
                  /* @__PURE__ */ a(
                    "input",
                    {
                      type: "number",
                      min: 1,
                      max: 30,
                      step: 1,
                      style: G,
                      value: x,
                      onChange: (m) => {
                        const w = parseInt(m.target.value, 10);
                        Number.isFinite(w) && w >= 1 && w <= 30 && D(w);
                      }
                    }
                  )
                ] }),
                /* @__PURE__ */ s("div", { style: K, children: [
                  /* @__PURE__ */ a("label", { style: U, children: "Annual Growth Rate (assumption)" }),
                  /* @__PURE__ */ a(
                    "input",
                    {
                      type: "number",
                      min: 0,
                      max: 20,
                      step: 0.1,
                      style: G,
                      value: F,
                      onChange: (m) => {
                        const w = parseFloat(m.target.value);
                        Number.isFinite(w) && w >= 0 && w <= 20 && J(w);
                      }
                    }
                  )
                ] }),
                /* @__PURE__ */ s("div", { style: K, children: [
                  /* @__PURE__ */ a("label", { style: U, children: te(
                    "deal_terms.realtor_representation_mode",
                    u,
                    "Realtor Representation"
                  ) }),
                  /* @__PURE__ */ s(
                    "select",
                    {
                      value: R,
                      onChange: (m) => {
                        Q(m.target.value), m.target.value === "NONE" && W(0);
                      },
                      style: {
                        ...G,
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
                R !== "NONE" && /* @__PURE__ */ s("div", { style: K, children: [
                  /* @__PURE__ */ a("label", { style: U, children: te(
                    "deal_terms.realtor_commission_pct",
                    u,
                    "Commission (%)"
                  ) }),
                  /* @__PURE__ */ a(
                    "input",
                    {
                      type: "number",
                      min: 0,
                      max: 6,
                      step: 0.5,
                      style: G,
                      value: A,
                      onChange: (m) => {
                        const w = parseFloat(m.target.value);
                        Number.isFinite(w) && w >= 0 && w <= 6 && W(w);
                      }
                    }
                  )
                ] }),
                y && /* @__PURE__ */ s("details", { style: { marginTop: 8 }, children: [
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
                  /* @__PURE__ */ s(
                    "div",
                    {
                      style: { display: "flex", flexDirection: "column", gap: 6, marginTop: 8 },
                      children: [
                        /* @__PURE__ */ s(
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
                              _($.platform_fee)
                            ]
                          }
                        ),
                        /* @__PURE__ */ s(
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
                              _($.servicing_fee_monthly)
                            ]
                          }
                        ),
                        /* @__PURE__ */ s(
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
                              j($.exit_fee_pct)
                            ]
                          }
                        )
                      ]
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ s("div", { children: [
                y && /* @__PURE__ */ a(
                  "div",
                  {
                    style: {
                      display: "grid",
                      gridTemplateColumns: d ? "1fr 1fr" : "1fr 1fr 1fr 1fr",
                      gap: d ? 10 : 12,
                      marginBottom: 24
                    },
                    "data-testid": "summary-cards",
                    children: [
                      { label: "Home Value", value: k, format: "currency" },
                      { label: "Agreement Amount", value: h, format: "currency" },
                      { label: "Monthly Contribution", value: O, format: "currency" },
                      { label: "Projected Appreciation", value: Ue, format: "currency" }
                    ].map((m) => /* @__PURE__ */ s(
                      "div",
                      {
                        style: {
                          padding: d ? "14px 12px" : "16px",
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
                          }, children: /* @__PURE__ */ a(hn, { value: m.value, format: m.format }) }),
                          /* @__PURE__ */ a("div", { style: {
                            fontSize: d ? 11 : 12,
                            color: "#9ca3af",
                            fontWeight: 500,
                            textTransform: "uppercase",
                            letterSpacing: "0.04em"
                          }, children: m.label })
                        ]
                      },
                      m.label
                    ))
                  }
                ),
                /* @__PURE__ */ s(
                  "div",
                  {
                    style: {
                      padding: d ? "14px" : "16px 20px",
                      background: "#f9fafb",
                      borderRadius: 12,
                      border: "1px solid #f3f4f6",
                      marginBottom: 20,
                      textAlign: "center"
                    },
                    "data-testid": "hero-metric",
                    children: [
                      /* @__PURE__ */ a("div", { style: { fontSize: 13, color: "#6b7280", marginBottom: 4, fontWeight: 500 }, children: V.hero.label }),
                      /* @__PURE__ */ a("div", { style: {
                        fontSize: d ? 28 : 34,
                        fontWeight: 700,
                        color: "#111827",
                        letterSpacing: "-0.02em"
                      }, children: Ne(
                        V.hero.value,
                        V.hero.valueFormat
                      ) }),
                      V.hero.subtitle && /* @__PURE__ */ a("div", { style: { fontSize: 13, color: "#9ca3af", marginTop: 6, lineHeight: 1.4 }, children: V.hero.subtitle })
                    ]
                  }
                ),
                /* @__PURE__ */ a(
                  "div",
                  {
                    style: {
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 6,
                      marginBottom: 20
                    },
                    "data-testid": "summary-strip",
                    children: V.strip.map((m, w) => /* @__PURE__ */ s("span", { style: Pe, children: [
                      /* @__PURE__ */ s("span", { style: Me, children: [
                        m.label,
                        ":"
                      ] }),
                      /* @__PURE__ */ a("span", { style: Fe, children: Ne(m.value, m.valueFormat) })
                    ] }, w))
                  }
                ),
                y && /* @__PURE__ */ s(
                  "div",
                  {
                    style: {
                      padding: "12px 14px",
                      background: "#fafafa",
                      border: "1px solid #f3f4f6",
                      borderRadius: 10,
                      fontSize: 13,
                      lineHeight: 1.6,
                      color: "#6b7280",
                      marginBottom: 20
                    },
                    children: [
                      /* @__PURE__ */ s("div", { children: [
                        "Projections assume ",
                        j(F / 100),
                        " annual appreciation."
                      ] }),
                      /* @__PURE__ */ a("div", { style: { marginTop: 4 }, children: "Register free to model different growth scenarios, protections (floor/cap), and early/late settlement timing." })
                    ]
                  }
                ),
                y && /* @__PURE__ */ a("div", { style: { marginBottom: 24, padding: d ? "8px 0" : "12px 0" }, children: /* @__PURE__ */ a(
                  Wt,
                  {
                    bars: V.chartSpec.bars,
                    width: 480,
                    height: d ? 180 : 220
                  }
                ) }),
                y && /* @__PURE__ */ a(
                  "div",
                  {
                    style: {
                      padding: "10px 14px",
                      background: "#f9fafb",
                      borderRadius: 10,
                      border: "1px solid #f3f4f6",
                      marginBottom: 20
                    },
                    children: /* @__PURE__ */ s("div", { style: { fontSize: 12, color: "#9ca3af" }, children: [
                      /* @__PURE__ */ a("strong", { style: { color: "#374151" }, children: "Standard" }),
                      " · ",
                      Ee(se),
                      " · Net Payout: ",
                      _(C.isa_settlement)
                    ] })
                  }
                ),
                !y && L && /* @__PURE__ */ s(ue, { children: [
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
                      ].map((m) => /* @__PURE__ */ s(
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
                            /* @__PURE__ */ s("div", { children: [
                              /* @__PURE__ */ a("div", { style: { fontSize: 11, color: "#9ca3af" }, children: "Timing" }),
                              /* @__PURE__ */ a("div", { style: { fontWeight: 600, fontSize: 13, color: "#111827" }, children: m.label })
                            ] }),
                            /* @__PURE__ */ s("div", { children: [
                              /* @__PURE__ */ a("div", { style: { fontSize: 11, color: "#9ca3af" }, children: "When" }),
                              /* @__PURE__ */ a("div", { style: { fontSize: 13, color: "#111827" }, children: Ee(m.data.settlementMonth) })
                            ] }),
                            /* @__PURE__ */ s("div", { children: [
                              /* @__PURE__ */ a("div", { style: { fontSize: 11, color: "#9ca3af" }, children: "Net Payout" }),
                              /* @__PURE__ */ a("div", { style: { fontWeight: 600, fontSize: 13, color: "#111827" }, children: _(m.data.netPayout) })
                            ] }),
                            !d && /* @__PURE__ */ s(ue, { children: [
                              /* @__PURE__ */ s("div", { children: [
                                /* @__PURE__ */ a("div", { style: { fontSize: 11, color: "#9ca3af" }, children: "Raw Payout" }),
                                /* @__PURE__ */ a("div", { style: { fontSize: 13, color: "#111827" }, children: _(m.data.rawPayout) })
                              ] }),
                              /* @__PURE__ */ s("div", { children: [
                                /* @__PURE__ */ a("div", { style: { fontSize: 11, color: "#9ca3af" }, children: "Transfer Fee" }),
                                /* @__PURE__ */ s("div", { style: { fontSize: 13, color: "#111827" }, children: [
                                  _(m.data.transferFeeAmount),
                                  " (",
                                  j(m.data.transferFeeRate),
                                  ")"
                                ] })
                              ] }),
                              /* @__PURE__ */ s("div", { children: [
                                /* @__PURE__ */ a("div", { style: { fontSize: 11, color: "#9ca3af" }, children: "Clamp" }),
                                /* @__PURE__ */ a("div", { style: { fontSize: 13, color: "#111827" }, children: m.data.clamp.applied === "none" ? "—" : m.data.clamp.applied === "floor" ? "Floor" : "Cap" })
                              ] })
                            ] })
                          ]
                        },
                        m.label
                      ))
                    }
                  )
                ] }),
                !y && Re && /* @__PURE__ */ a("div", { style: { marginBottom: 20 }, children: /* @__PURE__ */ a(Ct, { series: Re, width: 520, height: d ? 200 : 260 }) }),
                y && /* @__PURE__ */ a(
                  "ul",
                  {
                    style: {
                      margin: "0 0 16px 0",
                      padding: "0 0 0 20px",
                      fontSize: d ? 14 : 13,
                      lineHeight: 1.7,
                      color: "#374151"
                    },
                    "data-testid": "marketing-bullets",
                    children: V.marketingBullets.map((m, w) => /* @__PURE__ */ a("li", { style: { marginBottom: 4 }, children: m }, w))
                  }
                ),
                /* @__PURE__ */ s(
                  "div",
                  {
                    style: {
                      display: "flex",
                      flexDirection: d ? "column" : "row",
                      gap: 10,
                      marginTop: 20
                    },
                    children: [
                      y && /* @__PURE__ */ s(ue, { children: [
                        /* @__PURE__ */ a(
                          "button",
                          {
                            type: "button",
                            onClick: We,
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
                            onClick: Be,
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
                      !y && /* @__PURE__ */ a(
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
                            width: d ? "100%" : "auto"
                          },
                          "data-cta": "save",
                          children: "Save"
                        }
                      )
                    ]
                  }
                ),
                y && /* @__PURE__ */ a("p", { style: {
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
        y && je() && /* @__PURE__ */ s("details", { style: { marginTop: 16, fontSize: 11, color: "#6b7280" }, children: [
          /* @__PURE__ */ a("summary", { style: { cursor: "pointer" }, children: "Canonical deal_terms (debug)" }),
          /* @__PURE__ */ a(
            "pre",
            {
              style: {
                whiteSpace: "pre-wrap",
                background: "#f9fafb",
                padding: 10,
                borderRadius: 8,
                marginTop: 4,
                fontSize: 11
              },
              children: JSON.stringify(
                {
                  deal_terms: Z,
                  assumptions: ee,
                  result: {
                    isa_settlement: C.isa_settlement,
                    invested_capital_total: C.invested_capital_total,
                    vested_equity_percentage: C.vested_equity_percentage
                  }
                },
                null,
                2
              )
            }
          )
        ] }),
        I && E && /* @__PURE__ */ a(
          yn,
          {
            initial: He,
            persona: u,
            onClose: () => q(!1),
            onSaved: (m) => {
              B(m.deal_terms.property_value), M(m.deal_terms.upfront_payment), ne(m.deal_terms.monthly_payment), b(m.deal_terms.number_of_payments), D(m.scenario.exit_year), J(m.scenario.annual_appreciation * 100), Q(m.deal_terms.realtor_representation_mode), W(m.deal_terms.realtor_commission_pct * 100), q(!1);
            }
          }
        ),
        /* @__PURE__ */ s(
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
              /* @__PURE__ */ a("strong", { children: u }),
              " · ",
              "Mode: ",
              /* @__PURE__ */ a("strong", { children: n }),
              v && /* @__PURE__ */ s(ue, { children: [
                " ",
                "· DEV_AUTH: ",
                /* @__PURE__ */ a("strong", { children: v })
              ] }),
              " · ",
              _(k),
              " home · ",
              _(h),
              " ",
              "upfront · ",
              _(O),
              "×",
              c,
              "mo ·",
              " ",
              x,
              "yr · ",
              j(F / 100),
              " growth"
            ]
          }
        )
      ]
    }
  );
}
function Ln(e) {
  return /* @__PURE__ */ a(vn, { ...e });
}
function xn({ items: e }) {
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
      children: e.map((t, n) => /* @__PURE__ */ s(
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
function wn({ results: e }) {
  return /* @__PURE__ */ s(
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
        /* @__PURE__ */ s("svg", { width: "48", height: "48", viewBox: "0 0 48 48", fill: "none", children: [
          /* @__PURE__ */ a("rect", { x: "4", y: "28", width: "8", height: "16", rx: "2", fill: "#d1d5db" }),
          /* @__PURE__ */ a("rect", { x: "16", y: "18", width: "8", height: "26", rx: "2", fill: "#9ca3af" }),
          /* @__PURE__ */ a("rect", { x: "28", y: "10", width: "8", height: "34", rx: "2", fill: "#6b7280" }),
          /* @__PURE__ */ a("rect", { x: "40", y: "4", width: "4", height: "40", rx: "2", fill: "#374151" })
        ] }),
        /* @__PURE__ */ a("div", { style: { fontSize: 13, fontWeight: 600, color: "#374151" }, children: "Equity Transfer Chart" }),
        /* @__PURE__ */ s("div", { style: { fontSize: 11, color: "#9ca3af", maxWidth: 320, lineHeight: 1.5 }, children: [
          "Will render when schedule series is exposed in canonical compute outputs. Currently, compute v",
          e.compute_version,
          " returns summary results only."
        ] })
      ]
    }
  );
}
const Sn = [
  { key: "cash_flow", label: "Cash Flow" },
  { key: "ownership", label: "Ownership" },
  { key: "protections", label: "Protections" },
  { key: "fees", label: "Fees" },
  { key: "assumptions", label: "Assumptions" }
];
function H(e) {
  return (e * 100).toFixed(2) + "%";
}
function X(e) {
  return e.toFixed(2) + "×";
}
function kn({ rows: e }) {
  return /* @__PURE__ */ a("dl", { style: { margin: 0 }, children: e.map((t, n) => /* @__PURE__ */ s(
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
function Rn(e, t) {
  const n = [
    {
      label: "Settlement",
      value: _(e.isa_settlement),
      sublabel: e.dyf_applied ? "DYF applied" : void 0
    },
    {
      label: "Investor Profit",
      value: _(e.investor_profit)
    },
    {
      label: "Return Multiple",
      value: X(e.investor_multiple)
    },
    {
      label: "Annual IRR",
      value: H(e.investor_irr_annual)
    },
    {
      label: "Projected FMV",
      value: _(e.projected_fmv),
      sublabel: `${H(t.scenario.annual_appreciation)} / yr`
    }
  ], r = t.deal_terms.realtor_representation_mode, o = t.deal_terms.realtor_commission_pct;
  return r !== "NONE" ? n.push({
    label: "Realtor Fee (est.)",
    value: _(e.realtor_fee_total_projected),
    sublabel: `${H(o)} · ${r}`
  }) : n.push({
    label: "Realtor Fee",
    value: _(0),
    sublabel: "No realtor"
  }), n;
}
function Pn(e) {
  return [
    {
      label: "Invested capital (total)",
      value: _(e.invested_capital_total)
    },
    { label: "ISA settlement", value: _(e.isa_settlement) },
    {
      label: "Investor profit",
      value: _(e.investor_profit)
    },
    { label: "Return multiple", value: X(e.investor_multiple) },
    { label: "Annual IRR", value: H(e.investor_irr_annual) },
    {
      label: "Annual IRR (net)",
      value: e.investor_irr_annual_net != null ? H(e.investor_irr_annual_net) : "Not computed"
    },
    {
      label: "Timing factor applied",
      value: X(e.timing_factor_applied)
    }
  ];
}
function Mn(e, t) {
  return [
    { label: "Vested equity", value: H(t.vested_equity_percentage) },
    {
      label: "Base equity value",
      value: _(t.base_equity_value)
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
function Fn(e, t) {
  const n = [
    {
      label: "Floor multiple",
      value: X(e.deal_terms.floor_multiple)
    },
    { label: "Floor amount", value: _(t.floor_amount) },
    {
      label: "Ceiling multiple",
      value: X(e.deal_terms.ceiling_multiple)
    },
    { label: "Ceiling amount", value: _(t.ceiling_amount) },
    {
      label: "Downside mode",
      value: e.deal_terms.downside_mode === "HARD_FLOOR" ? "Hard floor" : "No floor"
    },
    {
      label: "Pre-floor/cap value",
      value: _(t.isa_pre_floor_cap)
    },
    {
      label: "Gain above capital",
      value: _(t.gain_above_capital)
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
      value: e.deal_terms.duration_yield_floor_min_multiple != null ? X(e.deal_terms.duration_yield_floor_min_multiple) : "—"
    },
    {
      label: "DYF floor amount",
      value: t.dyf_floor_amount != null ? _(t.dyf_floor_amount) : "—"
    },
    { label: "DYF applied", value: t.dyf_applied ? "Yes" : "No" }
  ) : n.push({ label: "DYF enabled", value: "No" }), n;
}
function En(e, t) {
  const n = [
    {
      label: "Platform fee",
      value: _(e.deal_terms.platform_fee)
    },
    {
      label: "Servicing fee (monthly)",
      value: _(e.deal_terms.servicing_fee_monthly)
    },
    { label: "Exit fee", value: H(e.deal_terms.exit_fee_pct) }
  ], r = e.deal_terms.realtor_representation_mode;
  return n.push({
    label: "Realtor representation",
    value: r === "NONE" ? "None" : r
  }), n.push({
    label: "Realtor commission",
    value: H(e.deal_terms.realtor_commission_pct)
  }), n.push({
    label: "Commission payment mode",
    value: e.deal_terms.realtor_commission_payment_mode
  }), n.push({
    label: "Realtor fee (upfront)",
    value: _(t.realtor_fee_upfront_projected)
  }), n.push({
    label: "Realtor fee (installments)",
    value: _(t.realtor_fee_installments_projected)
  }), n.push({
    label: "Buyer attribution",
    value: _(t.buyer_realtor_fee_total_projected)
  }), n.push({
    label: "Seller attribution",
    value: _(t.seller_realtor_fee_total_projected)
  }), n;
}
function An(e) {
  const t = [
    {
      label: "Annual appreciation",
      value: H(e.scenario.annual_appreciation)
    },
    { label: "Exit year", value: `${e.scenario.exit_year} yr` },
    { label: "Closing costs", value: H(e.scenario.closing_cost_pct) },
    {
      label: "Property value",
      value: _(e.deal_terms.property_value)
    },
    {
      label: "Upfront payment",
      value: _(e.deal_terms.upfront_payment)
    },
    {
      label: "Monthly payment",
      value: _(e.deal_terms.monthly_payment)
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
      value: X(e.deal_terms.timing_factor_early)
    },
    {
      label: "Timing factor (late)",
      value: X(e.deal_terms.timing_factor_late)
    }
  ];
  return e.scenario.fmv_override != null && t.push({
    label: "FMV override",
    value: _(e.scenario.fmv_override)
  }), t;
}
function Tn(e, t, n) {
  switch (e) {
    case "cash_flow":
      return Pn(n);
    case "ownership":
      return Mn(t, n);
    case "protections":
      return Fn(t, n);
    case "fees":
      return En(t, n);
    case "assumptions":
      return An(t);
  }
}
function jn({
  persona: e,
  status: t,
  inputs: n,
  results: r
}) {
  const [o, i] = P("cash_flow"), l = Rn(r, n), f = Tn(o, n, r);
  return /* @__PURE__ */ s(
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
        /* @__PURE__ */ a("div", { style: { padding: "14px 18px" }, children: /* @__PURE__ */ a(xn, { items: l }) }),
        /* @__PURE__ */ a("div", { style: { padding: "0 18px 14px" }, children: /* @__PURE__ */ a(wn, { results: r }) }),
        /* @__PURE__ */ s("div", { style: { borderTop: "1px solid #e5e7eb" }, children: [
          /* @__PURE__ */ a(
            "div",
            {
              style: {
                display: "flex",
                borderBottom: "1px solid #e5e7eb",
                padding: "0 18px",
                overflowX: "auto"
              },
              children: Sn.map((p) => /* @__PURE__ */ a(
                "button",
                {
                  type: "button",
                  onClick: () => i(p.key),
                  style: {
                    padding: "9px 14px",
                    border: "none",
                    borderBottom: o === p.key ? "2px solid #111827" : "2px solid transparent",
                    background: "none",
                    fontSize: 12,
                    fontWeight: o === p.key ? 600 : 400,
                    color: o === p.key ? "#111827" : "#6b7280",
                    cursor: "pointer",
                    fontFamily: "system-ui, sans-serif",
                    whiteSpace: "nowrap"
                  },
                  children: p.label
                },
                p.key
              ))
            }
          ),
          /* @__PURE__ */ a("div", { style: { padding: "14px 18px" }, children: /* @__PURE__ */ a(kn, { rows: f }) })
        ] }),
        /* @__PURE__ */ s(
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
function Hn({ value: e, anchors: t, onCommit: n, parseRaw: r }) {
  const [o, i] = P(""), [l, f] = P(!1), p = t.some((v) => v.value === e), y = N(
    (v) => {
      f(!1), i(""), n(v);
    },
    [n]
  ), S = N(() => {
    f(!0);
  }, []), g = N((v) => {
    i(v);
  }, []), u = N(() => {
    if (!o) {
      f(!1);
      return;
    }
    const E = (r ?? ((I) => parseFloat(I.replace(/,/g, ""))))(o);
    Number.isFinite(E) && n(E), f(!1);
  }, [o, n, r]), d = l ? o : p ? "" : String(e);
  return {
    isAnchorMatch: p && !l,
    displayCustom: d,
    selectAnchor: y,
    focusCustom: S,
    changeCustom: g,
    blurCustom: u
  };
}
export {
  oe as CONTRACT_VERSION,
  yn as DealEditModal,
  xn as DealKpiStrip,
  jn as DealSnapshotView,
  Ct as EquityChart,
  wn as EquityTransferChart,
  $ as FEE_DEFAULTS,
  Ln as FractPathCalculatorWidget,
  fn as MARKETING_PERSONAS,
  ie as SCHEMA_VERSION,
  Ft as buildChartSeries,
  On as buildDraftSnapshot,
  $t as buildFullDealSnapshotV1,
  $n as buildSavePayload,
  Yn as buildShareSummary,
  Mt as computeScenario,
  le as deterministicHash,
  te as getLabel,
  zn as getPersonaConfig,
  In as getSummaryOrder,
  wt as normalizeInputs,
  Lt as resolvePersonaPresentation,
  Hn as useKioskInput
};
