import { jsx as a, jsxs as s, Fragment as ue } from "react/jsx-runtime";
import { useMemo as N, useState as M, useRef as se, useEffect as ne, useCallback as z } from "react";
import { createPortal as He } from "react-dom";
function O(e) {
  return Math.round((e + Number.EPSILON) * 100) / 100;
}
const Ye = "11.0.0";
function fe(e, t) {
  const n = Math.floor(t.exit_year * 12), r = Math.min(e.number_of_payments, n), o = O(e.upfront_payment + e.monthly_payment * e.number_of_payments), c = O(e.upfront_payment + e.monthly_payment * r), i = o > 0 ? c / o : 0, _ = e.property_value > 0 ? o / e.property_value : 0, d = _ * i, h = O(t.fmv_override !== void 0 && t.fmv_override !== null && t.fmv_override > 0 ? t.fmv_override : e.property_value * Math.pow(1 + t.annual_appreciation, t.exit_year)), x = c, w = Math.max(0, h - e.property_value), y = O(w * d), u = O(x + y), v = O(Math.min(Math.max(o * e.setup_fee_pct, e.setup_fee_floor), e.setup_fee_cap)), E = n, L = O(v + e.servicing_fee_monthly * E + e.payment_admin_fee * r + e.exit_admin_fee_amount), B = O(u + e.exit_admin_fee_amount), P = Ue(e, t.exit_year), j = O(qe(B, P, e)), f = Ke(e, j), C = e.buyer_purchase_option_enabled ? O(h - u) : null, A = Xe(e, r);
  return {
    total_scheduled_buyer_funding: o,
    actual_buyer_funding_to_date: c,
    funding_completion_factor: i,
    scheduled_buyer_appreciation_share: _,
    effective_buyer_appreciation_share: d,
    buyer_base_capital_component: x,
    buyer_appreciation_claim: y,
    current_contract_value: h,
    current_participation_value: u,
    base_buyout_amount: B,
    extension_adjusted_buyout_amount: j,
    partial_buyout_amount_25: f[25],
    partial_buyout_amount_50: f[50],
    partial_buyout_amount_75: f[75],
    discount_purchase_price: C,
    current_window: P,
    fractpath_setup_fee_amount: v,
    fractpath_revenue_to_date: L,
    realtor_fee_total_projected: A,
    compute_version: Ye
  };
}
function Ue(e, t) {
  return t < e.target_exit_window_start_year ? "pre_target" : t <= e.target_exit_window_end_year ? "target_exit" : t > e.long_stop_year ? "post_long_stop" : t >= e.first_extension_start_year && t <= e.first_extension_end_year ? "first_extension" : t >= e.second_extension_start_year && t <= e.second_extension_end_year ? "second_extension" : "post_long_stop";
}
function qe(e, t, n) {
  switch (t) {
    case "pre_target":
    case "target_exit":
      return e;
    case "first_extension":
      return e * (1 + n.first_extension_premium_pct);
    case "second_extension":
      return e * (1 + n.second_extension_premium_pct);
    case "post_long_stop":
      return e * (1 + n.second_extension_premium_pct);
  }
}
function Ge(e, t, n) {
  if (e < t || n <= 0)
    return !1;
  const r = e / n;
  return Math.abs(r - Math.round(r)) < 1e-9;
}
function Ke(e, t) {
  if (!e.partial_buyout_allowed)
    return { 25: null, 50: null, 75: null };
  const n = [25, 50, 75], r = { 25: null, 50: null, 75: null };
  for (const o of n) {
    const c = o / 100;
    Ge(c, e.partial_buyout_min_fraction, e.partial_buyout_increment_fraction) && (r[o] = O(t * c));
  }
  return r;
}
function Xe(e, t) {
  return e.realtor_representation_mode === "NONE" || e.realtor_commission_pct === 0 ? 0 : O((e.upfront_payment + e.monthly_payment * t) * e.realtor_commission_pct);
}
const Je = 0.03, Qe = 0.035, Ze = 0.045, et = 0.025, tt = 1.1, nt = 2, at = 0.01, rt = 0.03, ot = 0.1, it = 25e-4, he = {
  homeValue: 6e5,
  initialBuyAmount: 1e5,
  termYears: 10,
  annualGrowthRate: Je,
  transferFeeRate_standard: Qe,
  transferFeeRate_early: Ze,
  transferFeeRate_late: et,
  floorMultiple: tt,
  capMultiple: nt,
  vesting: {
    upfrontEquityPct: ot,
    monthlyEquityPct: it,
    months: 120
  },
  cpw: {
    startPct: at,
    endPct: rt
  }
}, lt = (e, t, n) => Math.min(n, Math.max(t, e));
function st(e) {
  const t = {
    ...he,
    ...e,
    vesting: {
      ...he.vesting,
      ...e.vesting ?? {}
    },
    cpw: {
      ...he.cpw,
      ...e.cpw ?? {}
    }
  }, n = Math.max(0, Math.round(t.termYears * 12));
  return t.vesting.months = n, t;
}
function ct(e, t, n) {
  const r = n / 12;
  return e * Math.pow(1 + t, r);
}
function ut(e, t, n) {
  return lt(e + t * n, 0, 1);
}
function dt(e, t) {
  const n = [];
  for (let r = 0; r <= t; r++) {
    const o = ct(e.homeValue, e.annualGrowthRate, r), c = ut(
      e.vesting.upfrontEquityPct,
      e.vesting.monthlyEquityPct,
      r
    );
    n.push({
      month: r,
      year: r / 12,
      homeValue: o,
      equityPct: c
    });
  }
  return n;
}
function _e(e, t) {
  const n = e.vesting.months;
  return t === "standard" ? n : t === "early" ? Math.min(36, n) : t === "late" ? n + 24 : n;
}
function mt(e) {
  const t = e.termYears;
  return {
    property_value: e.homeValue,
    upfront_payment: e.initialBuyAmount,
    monthly_payment: e.vesting.monthlyEquityPct * e.homeValue,
    number_of_payments: e.vesting.months,
    minimum_hold_years: 2,
    contract_maturity_years: Math.max(t + 5, 15),
    target_exit_year: t,
    target_exit_window_start_year: Math.max(1, t - 1),
    target_exit_window_end_year: t + 1,
    long_stop_year: t + 5,
    first_extension_start_year: t + 1,
    first_extension_end_year: t + 4,
    first_extension_premium_pct: 0.05,
    second_extension_start_year: t + 4,
    second_extension_end_year: t + 5,
    second_extension_premium_pct: 0.08,
    partial_buyout_allowed: !1,
    partial_buyout_min_fraction: 0.25,
    partial_buyout_increment_fraction: 0.25,
    buyer_purchase_option_enabled: !1,
    buyer_purchase_notice_days: 90,
    buyer_purchase_closing_days: 60,
    setup_fee_pct: 0.02,
    setup_fee_floor: 1e3,
    setup_fee_cap: 5e3,
    servicing_fee_monthly: 0,
    payment_admin_fee: 0,
    exit_admin_fee_amount: 0,
    realtor_representation_mode: "NONE",
    realtor_commission_pct: 0
  };
}
function be(e, t) {
  const n = _e(e, t), r = n / 12, o = mt(e), c = fe(o, {
    annual_appreciation: e.annualGrowthRate,
    exit_year: r
  }), i = o.property_value * Math.pow(1 + e.annualGrowthRate, r), _ = c.base_buyout_amount, d = c.extension_adjusted_buyout_amount;
  return {
    timing: t,
    settlementMonth: n,
    homeValueAtSettlement: i,
    equityPctAtSettlement: c.funding_completion_factor,
    rawPayout: _,
    clampedPayout: d,
    transferFeeAmount: 0,
    netPayout: d,
    clamp: { floor: 0, cap: 0, applied: "none" },
    transferFeeRate: 0
  };
}
function pt(e = {}) {
  const t = st(e), n = Math.max(
    _e(t, "standard"),
    _e(t, "early"),
    _e(t, "late")
  ), r = dt(t, n), o = be(t, "standard"), c = be(t, "early"), i = be(t, "late");
  return {
    normalizedInputs: t,
    series: r,
    settlements: { standard: o, early: c, late: i }
  };
}
function _t(e) {
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
function ft(e, t, n) {
  return Math.min(n, Math.max(t, e));
}
function yt(e) {
  return `${Math.round(e * 100)}%`;
}
function ht(e) {
  return `${Math.round(e * 10) / 10}y`;
}
function bt(e) {
  return e.timing === "early" ? "Early" : e.timing === "late" ? "Late" : "Std";
}
const gt = {
  early: "#ca8a04",
  standard: "#0891b2",
  late: "#c026d3"
};
function xt({ series: e, width: t = 640, height: n = 260 }) {
  const { points: r, markers: o } = e, c = N(
    () => `eq-${Math.random().toString(36).slice(2, 8)}`,
    []
  );
  if (!r.length)
    return /* @__PURE__ */ a("div", { style: { fontFamily: "system-ui, sans-serif" }, children: "No data" });
  const i = { top: 20, right: 24, bottom: 36, left: 50 }, _ = Math.max(10, t - i.left - i.right), d = Math.max(10, n - i.top - i.bottom), h = r[0].month, x = r[r.length - 1].month, w = 0, y = 1, u = (f) => x === h ? i.left : i.left + (f - h) / (x - h) * _, v = (f) => {
    const C = ft(f, w, y);
    return i.top + (1 - (C - w) / (y - w)) * d;
  }, E = r.map((f, C) => {
    const A = u(f.month), Z = v(f.equityPct);
    return `${C === 0 ? "M" : "L"} ${A.toFixed(2)} ${Z.toFixed(2)}`;
  }).join(" "), L = r.length * 20, B = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    v: f,
    y: v(f),
    label: yt(f)
  })), P = Math.round((h + x) / 2), j = [h, P, x].map((f) => ({
    m: f,
    x: u(f),
    label: ht(f / 12)
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
        @keyframes ${c}-draw {
          from { stroke-dashoffset: ${L}; }
          to { stroke-dashoffset: 0; }
        }
      ` }),
        /* @__PURE__ */ a("rect", { x: 0, y: 0, width: t, height: n, fill: "white", rx: 8 }),
        B.map((f) => /* @__PURE__ */ s("g", { children: [
          /* @__PURE__ */ a(
            "line",
            {
              x1: i.left,
              x2: t - i.right,
              y1: f.y,
              y2: f.y,
              stroke: "#f3f4f6",
              strokeWidth: 1
            }
          ),
          /* @__PURE__ */ a(
            "text",
            {
              x: i.left - 10,
              y: f.y + 4,
              fontSize: 11,
              textAnchor: "end",
              fill: "#9ca3af",
              fontFamily: "system-ui, sans-serif",
              children: f.label
            }
          )
        ] }, f.v)),
        /* @__PURE__ */ a(
          "line",
          {
            x1: i.left,
            x2: t - i.right,
            y1: i.top + d,
            y2: i.top + d,
            stroke: "#e5e7eb",
            strokeWidth: 1
          }
        ),
        j.map((f) => /* @__PURE__ */ s("g", { children: [
          /* @__PURE__ */ a(
            "line",
            {
              x1: f.x,
              x2: f.x,
              y1: i.top + d,
              y2: i.top + d + 6,
              stroke: "#d1d5db",
              strokeWidth: 1
            }
          ),
          /* @__PURE__ */ a(
            "text",
            {
              x: f.x,
              y: i.top + d + 24,
              fontSize: 11,
              textAnchor: "middle",
              fill: "#9ca3af",
              fontFamily: "system-ui, sans-serif",
              children: f.label
            }
          )
        ] }, f.m)),
        o.map((f) => {
          const C = u(f.month), A = gt[f.timing] || "#d1d5db";
          return /* @__PURE__ */ s("g", { children: [
            /* @__PURE__ */ a(
              "line",
              {
                x1: C,
                x2: C,
                y1: i.top,
                y2: i.top + d,
                stroke: A,
                strokeWidth: 1,
                strokeDasharray: "4 4"
              }
            ),
            /* @__PURE__ */ a(
              "rect",
              {
                x: C - 18,
                y: i.top - 4,
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
                x: C,
                y: i.top + 10,
                fontSize: 10,
                textAnchor: "middle",
                fill: A,
                fontFamily: "system-ui, sans-serif",
                fontWeight: 600,
                children: bt(f)
              }
            )
          ] }, f.timing);
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
            strokeDasharray: L,
            strokeDashoffset: 0,
            style: {
              animation: `${c}-draw 1s ease-out forwards`
            }
          }
        ),
        /* @__PURE__ */ a(
          "text",
          {
            x: i.left,
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
function p(e) {
  return e.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });
}
function Y(e) {
  return `${(e * 100).toFixed(1)}%`;
}
function Pe(e) {
  const t = Math.floor(e / 12), n = e % 12;
  return t === 0 ? `${n}mo` : n === 0 ? `${t}yr` : `${t}yr ${n}mo`;
}
const Re = {
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
function Sn(e) {
  return Re[e] ?? Re.homeowner;
}
const vt = {
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
function Q(e, t, n) {
  return vt[t]?.[e] ?? n;
}
const Me = {
  homeowner: ["hero", "net_payout", "settlement_timing", "total_invested", "fees"],
  buyer: ["hero", "net_payout", "total_invested", "settlement_timing", "fees"],
  investor: ["hero", "net_payout", "total_invested", "fees", "settlement_timing"],
  realtor: ["hero", "fees", "net_payout", "settlement_timing", "total_invested"],
  ops: ["hero", "net_payout", "fees", "total_invested", "settlement_timing"]
};
function kn(e) {
  return Me[e] ?? Me.homeowner;
}
const k = {
  setup_fee_pct: 0.02,
  setup_fee_floor: 1e3,
  setup_fee_cap: 5e3,
  servicing_fee_monthly: 49,
  payment_admin_fee: 5,
  exit_admin_fee_amount: 500
}, ae = "11.0.0", re = "1";
function Te(e) {
  const t = {};
  for (const n of Object.keys(e).sort()) {
    const r = e[n];
    r !== null && typeof r == "object" && !Array.isArray(r) ? t[n] = Te(r) : t[n] = r;
  }
  return JSON.stringify(t);
}
async function oe(e) {
  const t = Te(e), n = new TextEncoder().encode(t), r = await crypto.subtle.digest("SHA-256", n);
  return Array.from(new Uint8Array(r)).map((c) => c.toString(16).padStart(2, "0")).join("");
}
function De(e) {
  return {
    homeValue: e.homeValue,
    initialBuyAmount: e.initialBuyAmount,
    termYears: e.termYears,
    annualGrowthRate: e.annualGrowthRate
  };
}
function wt(e) {
  return {
    standard_net_payout: e.settlements.standard.netPayout,
    early_net_payout: e.settlements.early.netPayout,
    late_net_payout: e.settlements.late.netPayout,
    standard_settlement_month: e.settlements.standard.settlementMonth,
    early_settlement_month: e.settlements.early.settlementMonth,
    late_settlement_month: e.settlements.late.settlementMonth
  };
}
function St(e) {
  return {
    standard_net_payout: e.settlements.standard.netPayout,
    early_net_payout: e.settlements.early.netPayout,
    late_net_payout: e.settlements.late.netPayout
  };
}
async function Pn(e, t, n) {
  const r = De(t), o = wt(n), [c, i] = await Promise.all([
    oe(r),
    oe(o)
  ]);
  return {
    contract_version: ae,
    schema_version: re,
    persona: e,
    mode: "marketing",
    inputs: r,
    basic_results: o,
    input_hash: c,
    output_hash: i,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
}
function Rn(e, t, n) {
  return {
    contract_version: ae,
    schema_version: re,
    persona: e,
    inputs: De(t),
    basic_results: St(n),
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
}
async function Mn(e, t, n) {
  const [r, o] = await Promise.all([
    oe(t),
    oe({
      standard: n.settlements.standard,
      early: n.settlements.early,
      late: n.settlements.late
    })
  ]);
  return {
    contract_version: ae,
    schema_version: re,
    persona: e,
    mode: "app",
    inputs: t,
    outputs: n,
    input_hash: r,
    output_hash: o,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
}
function kt(e) {
  const t = e.termYears;
  return {
    property_value: e.homeValue,
    upfront_payment: e.initialBuyAmount,
    monthly_payment: e.vesting?.monthlyEquityPct ? e.vesting.monthlyEquityPct * e.homeValue : 0,
    number_of_payments: e.vesting?.months ?? t * 12,
    minimum_hold_years: 2,
    contract_maturity_years: Math.max(t + 5, 15),
    target_exit_year: t,
    target_exit_window_start_year: Math.max(1, t - 1),
    target_exit_window_end_year: t + 1,
    long_stop_year: t + 5,
    first_extension_start_year: t + 1,
    first_extension_end_year: t + 4,
    first_extension_premium_pct: 0.05,
    second_extension_start_year: t + 4,
    second_extension_end_year: t + 5,
    second_extension_premium_pct: 0.08,
    partial_buyout_allowed: !1,
    partial_buyout_min_fraction: 0.25,
    partial_buyout_increment_fraction: 0.25,
    buyer_purchase_option_enabled: !1,
    buyer_purchase_notice_days: 90,
    buyer_purchase_closing_days: 60,
    setup_fee_pct: k.setup_fee_pct,
    setup_fee_floor: k.setup_fee_floor,
    setup_fee_cap: k.setup_fee_cap,
    servicing_fee_monthly: k.servicing_fee_monthly,
    payment_admin_fee: k.payment_admin_fee,
    exit_admin_fee_amount: k.exit_admin_fee_amount,
    realtor_representation_mode: "NONE",
    realtor_commission_pct: 0
  };
}
function Pt(e) {
  return {
    annual_appreciation: e.annualGrowthRate,
    closing_cost_pct: 0.02,
    exit_year: e.termYears
  };
}
function Rt(e) {
  const t = kt(e), n = Pt(e), r = fe(t, n), o = (/* @__PURE__ */ new Date()).toISOString();
  return {
    contract_version: ae,
    schema_version: re,
    deal_terms: t,
    assumptions: n,
    outputs: r,
    now_iso: o,
    created_at: o
  };
}
function W(e, t) {
  switch (t) {
    case "currency":
      return p(e);
    case "percent":
      return Y(e);
    case "multiple":
      return `${e.toFixed(2)}×`;
    case "months":
      return `${e}`;
    case "text":
      return String(e);
  }
}
function xe(e, t) {
  return e.property_value * Math.pow(1 + t.annual_appreciation, t.exit_year);
}
function Mt(e, t, n, r) {
  switch (e) {
    case "homeowner":
      return At(t, n, r);
    case "realtor":
      return Et(t, n, r);
    default:
      return Ft(t, n, r);
  }
}
function Ft(e, t, n) {
  const r = n.extension_adjusted_buyout_amount, o = n.actual_buyer_funding_to_date, c = r - o, i = xe(e, t), _ = o > 0 ? r / o : 1, d = i > 0 ? n.effective_buyer_appreciation_share : 0;
  return {
    hero: {
      label: "Projected Net Return",
      value: c,
      valueFormat: "currency",
      subtitle: `Profit at standard buyout (Year ${t.exit_year}).`
    },
    strip: [
      { label: "Net payout at buyout", value: r, valueFormat: "currency" },
      { label: "Total cash paid", value: o, valueFormat: "currency" },
      { label: "Projected home value", value: i, valueFormat: "currency" },
      { label: "Effective appreciation share", value: d, valueFormat: "percent" },
      { label: "Return multiple", value: _, valueFormat: "multiple" }
    ],
    chartSpec: {
      type: "bar",
      bars: [
        { label: "Total cash paid", value: o },
        { label: "Buyout payout", value: r },
        { label: "Projected home value", value: i }
      ]
    },
    marketingBullets: [
      `~${W(d, "percent")} effective appreciation share over ${t.exit_year} years — with no financing or interest.`,
      `You contribute ${W(o, "currency")} total. At buyout, payout is ${W(r, "currency")}.`,
      `Projected home value at buyout: ${W(i, "currency")} (base assumptions).`,
      `Assumes ${W(t.annual_appreciation, "percent")} annual appreciation — Save & Continue free to model different growth and timing.`
    ]
  };
}
function At(e, t, n) {
  const r = n.actual_buyer_funding_to_date, o = xe(e, t);
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
      `Unlock ${W(r, "currency")} while continuing to own your home.`,
      `Upfront: ${W(e.upfront_payment, "currency")}. Monthly: ${W(e.monthly_payment, "currency")} for ${e.number_of_payments} months.`,
      `Projected home value at buyout: ${W(o, "currency")} (base assumptions).`,
      `Assumes ${W(t.annual_appreciation, "percent")} annual appreciation — Save & Continue free to model growth, protections, and timing.`
    ]
  };
}
function Et(e, t, n) {
  const r = n.realtor_fee_total_projected, o = n.extension_adjusted_buyout_amount, i = xe(e, t) - o, _ = e.realtor_commission_pct * 100;
  return {
    hero: {
      label: "Projected Commission (Standard)",
      value: r,
      valueFormat: "currency",
      subtitle: `Based on ${_.toFixed(1)}% as ${e.realtor_representation_mode} representation.`
    },
    strip: [
      { label: "Commission rate", value: `${_.toFixed(1)}%`, valueFormat: "text" },
      { label: "Representation", value: e.realtor_representation_mode, valueFormat: "text" },
      { label: "Commission from this deal", value: r, valueFormat: "currency" },
      {
        label: "Remaining opportunity",
        value: i > 0 ? i : 0,
        valueFormat: "currency"
      }
    ],
    chartSpec: {
      type: "bar",
      bars: [
        { label: "Commission on this deal", value: r },
        { label: "Remaining opportunity", value: i > 0 ? i : 0 }
      ]
    },
    marketingBullets: [
      `Projected commission on this deal: ${W(r, "currency")} (standard timing).`,
      `Commission rate: ${_.toFixed(1)}% as ${e.realtor_representation_mode} representation.`,
      "Capture buyers and sellers earlier — without requiring an immediate full sale or full purchase.",
      `Remaining property value at buyout (conditional): ${W(i > 0 ? i : 0, "currency")}. Save free to model scenarios.`
    ]
  };
}
const Fe = ["#0891b2", "#c026d3", "#ca8a04", "#6b7280", "#374151"];
function Ct({ bars: e, width: t = 400, height: n = 220 }) {
  const r = Math.max(...e.map((x) => x.value), 1), o = Math.min(80, (t - 60) / e.length - 20), c = 36, i = n - 44, _ = i - c, d = (t - 40) / e.length, h = `bar-anim-${Math.random().toString(36).slice(2, 8)}`;
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
        @keyframes ${h} {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
      ` }),
        /* @__PURE__ */ a(
          "line",
          {
            x1: 20,
            x2: t - 20,
            y1: i,
            y2: i,
            stroke: "#e5e7eb",
            strokeWidth: 1
          }
        ),
        e.map((x, w) => {
          const y = r > 0 ? x.value / r * _ : 0, u = 20 + w * d + (d - o) / 2, v = i - y, E = Fe[w % Fe.length];
          return /* @__PURE__ */ s("g", { children: [
            /* @__PURE__ */ a(
              "rect",
              {
                x: u,
                y: v,
                width: o,
                height: Math.max(y, 2),
                rx: 6,
                ry: 6,
                fill: E,
                style: {
                  transformOrigin: `${u + o / 2}px ${i}px`,
                  animation: `${h} 0.5s ease-out ${w * 0.1}s both`
                }
              }
            ),
            /* @__PURE__ */ a(
              "text",
              {
                x: u + o / 2,
                y: v - 10,
                textAnchor: "middle",
                fontSize: 11,
                fontWeight: 600,
                fill: "#111827",
                fontFamily: "system-ui, sans-serif",
                children: p(x.value)
              }
            ),
            /* @__PURE__ */ a(
              "text",
              {
                x: u + o / 2,
                y: i + 18,
                textAnchor: "middle",
                fontSize: 10,
                fill: "#6b7280",
                fontFamily: "system-ui, sans-serif",
                children: x.label.length > 20 ? x.label.slice(0, 18) + "…" : x.label
              }
            )
          ] }, w);
        })
      ]
    }
  );
}
const Tt = [
  {
    key: "deal_terms.property_value",
    label: "Property value (FMV)",
    unit: "currency",
    control: "slider",
    simpleDefinition: "How much the home is worth right now.",
    impact: "It affects how much funding is provided and how future appreciation is shared.",
    formula: "total_scheduled_buyer_funding = upfront_payment + monthly_payment * number_of_payments",
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
    impact: "It funds the homeowner at closing and contributes to the total scheduled funding.",
    formula: "total_scheduled_buyer_funding = upfront_payment + monthly_payment * number_of_payments",
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
    impact: "Monthly payments add to total scheduled funding and affect the funding completion factor.",
    formula: "total_scheduled_buyer_funding = upfront_payment + monthly_payment * number_of_payments",
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
    impact: "More months means more total funding and a higher funding completion factor.",
    formula: "actual_buyer_funding_to_date = upfront_payment + monthly_payment * payments_made_by_exit",
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
    impact: "It changes the projected home value and the appreciation share at buyout.",
    formula: "projected_fmv = property_value * (1 + annual_appreciation)^exit_year",
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
    simpleDefinition: "When the scenario models buyout (like 5 years).",
    impact: "It determines which contract window applies and whether extension premiums are included.",
    formula: "current_window = classify(exit_year vs target_exit_window, extensions, long_stop_year)",
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
    impact: "Closing costs reduce the net proceeds at exit and can reduce the effective buyout amount.",
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
    key: "deal_terms.minimum_hold_years",
    label: "Minimum hold (years)",
    unit: "years",
    control: "kiosk",
    simpleDefinition: "The shortest time the deal must stay active before it can end.",
    impact: "It prevents very early exits and sets the floor on the contract timeline.",
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
      { label: "10", value: 10 },
      { label: "15", value: 15 },
      { label: "30", value: 30 }
    ],
    recommendedRange: { min: 5, max: 30 },
    hardRange: { min: 1, max: 50 },
    sectionHint: "Ownership"
  },
  {
    key: "deal_terms.target_exit_year",
    label: "Target exit year",
    unit: "years",
    control: "kiosk",
    simpleDefinition: "The year FractPath and the homeowner are targeting for a standard buyout.",
    impact: "It defines the target window and determines whether extension premiums apply at buyout.",
    formula: "current_window depends on exit_year vs target_exit_window_start/end and extensions",
    anchors: [
      { label: "5", value: 5 },
      { label: "7", value: 7 },
      { label: "10", value: 10 },
      { label: "15", value: 15 }
    ],
    recommendedRange: { min: 3, max: 15 },
    hardRange: { min: 1, max: 30 },
    sectionHint: "Ownership"
  },
  {
    key: "deal_terms.first_extension_premium_pct",
    label: "First extension premium (%)",
    unit: "percent",
    control: "kiosk",
    simpleDefinition: "Extra percentage added to the buyout if the deal runs into the first extension window.",
    impact: "A higher premium increases the buyout amount for late exits, compensating FractPath for the extended hold.",
    formula: "extension_adjusted_buyout = base_buyout * (1 + premium_pct) if in first extension window",
    anchors: [
      { label: "0%", value: 0 },
      { label: "3%", value: 0.03 },
      { label: "5%", value: 0.05 },
      { label: "8%", value: 0.08 }
    ],
    recommendedRange: { min: 0, max: 0.1 },
    hardRange: { min: 0, max: 0.5 },
    sectionHint: "Exit Terms"
  },
  {
    key: "deal_terms.second_extension_premium_pct",
    label: "Second extension premium (%)",
    unit: "percent",
    control: "kiosk",
    simpleDefinition: "Extra percentage added to the buyout if the deal runs into the second extension window.",
    impact: "A higher premium further increases the buyout for very late exits.",
    formula: "extension_adjusted_buyout = base_buyout * (1 + premium_pct) if in second extension window",
    anchors: [
      { label: "0%", value: 0 },
      { label: "5%", value: 0.05 },
      { label: "8%", value: 0.08 },
      { label: "12%", value: 0.12 }
    ],
    recommendedRange: { min: 0, max: 0.15 },
    hardRange: { min: 0, max: 0.5 },
    sectionHint: "Exit Terms"
  },
  {
    key: "deal_terms.partial_buyout_allowed",
    label: "Partial buyout allowed",
    unit: "enum",
    control: "enum",
    simpleDefinition: "Whether the homeowner can buy out FractPath's stake in portions rather than all at once.",
    impact: "When enabled, partial buyouts at 25%, 50%, or 75% of the total stake become available.",
    formula: "partial_buyout_amount_N = base_buyout * N (fractional, if allowed)",
    options: [
      { label: "Not allowed", value: "false" },
      { label: "Allowed", value: "true" }
    ],
    sectionHint: "Exit Terms"
  },
  {
    key: "deal_terms.setup_fee_pct",
    label: "Setup fee (%)",
    unit: "percent",
    control: "readonly",
    readOnly: !0,
    simpleDefinition: "A one-time fee at closing, calculated as a percent of the upfront payment.",
    impact: "This is set by the system and is deducted from the setup fee calculation.",
    formula: "setup_fee = clamp(upfront_payment * setup_fee_pct, setup_fee_floor, setup_fee_cap)",
    recommendedRange: { min: 0, max: 0.05 },
    hardRange: { min: 0, max: 0.1 },
    sectionHint: "Fees"
  },
  {
    key: "deal_terms.servicing_fee_monthly",
    label: "Servicing fee (monthly)",
    unit: "currency",
    control: "readonly",
    readOnly: !0,
    simpleDefinition: "A monthly fee for servicing the deal.",
    impact: "It accumulates over the life of the deal and adds to FractPath's revenue.",
    formula: "fractpath_revenue_to_date = setup_fee + servicing_fee_monthly * months_elapsed + ...",
    recommendedRange: { min: 0, max: 100 },
    hardRange: { min: 0, max: 500 },
    sectionHint: "Fees"
  },
  {
    key: "deal_terms.payment_admin_fee",
    label: "Payment admin fee ($)",
    unit: "currency",
    control: "readonly",
    readOnly: !0,
    simpleDefinition: "A flat fee charged per monthly payment event.",
    impact: "This is set by the system and adds to FractPath's total revenue over the deal term.",
    formula: "payment_admin_total = payment_admin_fee * payments_made_by_exit",
    recommendedRange: { min: 0, max: 25 },
    hardRange: { min: 0, max: 100 },
    sectionHint: "Fees"
  },
  {
    key: "deal_terms.exit_admin_fee_amount",
    label: "Exit admin fee ($)",
    unit: "currency",
    control: "readonly",
    readOnly: !0,
    simpleDefinition: "A flat administrative fee charged when the deal exits.",
    impact: "This is set by the system and reduces net proceeds at settlement.",
    formula: "fractpath_revenue_to_date includes exit_admin_fee_amount at settlement",
    recommendedRange: { min: 0, max: 1e3 },
    hardRange: { min: 0, max: 5e3 },
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
    formula: "commission_amount = realtor_commission_pct * buyout_value (conceptual, at exit)",
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
    key: "__disclosure__",
    label: "Disclosures & assumptions",
    unit: "info",
    control: "info",
    simpleDefinition: "These numbers are estimates based on the inputs you choose.",
    impact: "Projections depend on home prices, timing, fees, and contract window classification—real outcomes can be different.",
    formula: "Model uses: FMV + appreciation assumption + buyer funding schedule + window classification + extension premiums. Not financial advice; projections aren’t guarantees.",
    sectionHint: "Assumptions"
  }
];
function Dt(e, t) {
  const n = e.dynamicPercentAnchors;
  return n ? n.percents.map((r) => {
    let o = r * t;
    n.maxPercentOfSource != null && (o = Math.min(o, n.maxPercentOfSource * t));
    const c = Math.round(o / 100) * 100, i = n.min != null ? Math.max(n.min, c) : c;
    return { label: p(i), value: i };
  }) : e.anchors ?? [];
}
const Ae = [
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
          "deal_terms.target_exit_year"
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
    label: "Exit Terms",
    sections: [
      {
        label: "Extension premiums",
        fieldKeys: [
          "deal_terms.first_extension_premium_pct",
          "deal_terms.second_extension_premium_pct"
        ]
      },
      {
        label: "Partial buyout",
        fieldKeys: [
          "deal_terms.partial_buyout_allowed"
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
          "deal_terms.setup_fee_pct",
          "deal_terms.servicing_fee_monthly",
          "deal_terms.payment_admin_fee",
          "deal_terms.exit_admin_fee_amount"
        ]
      },
      {
        label: "Realtor commission",
        fieldKeys: [
          "deal_terms.realtor_representation_mode",
          "deal_terms.realtor_commission_pct"
        ]
      }
    ]
  }
];
function zt(e) {
  const t = {}, { deal_terms: n, scenario: r } = e;
  return n.property_value <= 0 && (t["deal_terms.property_value"] = "Property value must be greater than 0"), n.upfront_payment < 0 && (t["deal_terms.upfront_payment"] = "Upfront payment cannot be negative"), n.monthly_payment < 0 && (t["deal_terms.monthly_payment"] = "Monthly payment cannot be negative"), n.number_of_payments < 0 && (t["deal_terms.number_of_payments"] = "Number of payments cannot be negative"), r.exit_year <= 0 && (t["scenario.exit_year"] = "Exit year must be greater than 0"), (r.annual_appreciation < -0.5 || r.annual_appreciation > 0.5) && (t["scenario.annual_appreciation"] = "Annual appreciation must be between -50% and 50%"), n.realtor_commission_pct !== void 0 && (n.realtor_commission_pct < 0 || n.realtor_commission_pct > 0.06) && (t["deal_terms.realtor_commission_pct"] = "Realtor commission must be between 0% and 6%"), n.realtor_representation_mode === "NONE" && n.realtor_commission_pct !== void 0 && n.realtor_commission_pct !== 0 && (t["deal_terms.realtor_commission_pct"] = "Commission must be 0% when representation mode is NONE"), t;
}
function ze(e) {
  return Object.keys(e).length > 0;
}
const Ne = {
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
}, Nt = {
  ...Ne,
  border: "2px solid #111827",
  background: "#111827",
  color: "#fff"
};
function $t({
  value: e,
  anchors: t,
  unit: n,
  onSelectAnchor: r,
  customValue: o,
  onChangeCustom: c,
  onBlurCustom: i,
  disabled: _,
  error: d
}) {
  const h = t.some((u) => u.value === e), x = n === "currency" || n === "number" || n === "months" || n === "years" ? "numeric" : "decimal", w = n === "currency" ? "$" : "", y = n === "percent" ? "%" : n === "years" ? " yr" : n === "months" ? " mo" : "";
  return /* @__PURE__ */ s("div", { children: [
    /* @__PURE__ */ a("div", { style: { display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }, children: t.map((u) => /* @__PURE__ */ a(
      "button",
      {
        type: "button",
        disabled: _,
        onClick: () => r(u.value),
        style: {
          ...u.value === e ? Nt : Ne,
          opacity: _ ? 0.5 : 1,
          cursor: _ ? "not-allowed" : "pointer"
        },
        children: u.label
      },
      u.label
    )) }),
    /* @__PURE__ */ s("div", { style: { position: "relative" }, children: [
      w && /* @__PURE__ */ a(
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
          children: w
        }
      ),
      /* @__PURE__ */ a(
        "input",
        {
          type: "text",
          inputMode: x,
          disabled: _,
          value: h ? "" : o,
          placeholder: h ? "Custom" : "",
          onChange: (u) => c(u.target.value),
          onBlur: i,
          style: {
            width: "100%",
            padding: w ? "7px 10px 7px 22px" : "7px 10px",
            border: d ? "1px solid #ef4444" : "1px solid #d1d5db",
            borderRadius: 6,
            fontSize: 13,
            fontFamily: "system-ui, sans-serif",
            boxSizing: "border-box",
            background: _ ? "#f3f4f6" : "#fff",
            color: _ ? "#9ca3af" : "#111827"
          }
        }
      ),
      y && /* @__PURE__ */ a(
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
          children: y
        }
      )
    ] }),
    d && /* @__PURE__ */ a("div", { style: { color: "#ef4444", fontSize: 11, marginTop: 3 }, children: d })
  ] });
}
const Ot = `
@keyframes fpShimmer {
  0% { background-position: -200px 0; }
  100% { background-position: 200px 0; }
}
`, Wt = {
  display: "inline-block",
  width: 60,
  height: 12,
  borderRadius: 4,
  background: "linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)",
  backgroundSize: "200px 100%",
  animation: "fpShimmer 1.5s infinite"
};
function It({ tier1: e, status: t, error: n }) {
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
        /* @__PURE__ */ a("style", { children: Ot }),
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
              t === "computing" && /* @__PURE__ */ a("span", { style: Wt })
            ]
          }
        ),
        /* @__PURE__ */ s("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }, children: [
          /* @__PURE__ */ s("div", { children: [
            /* @__PURE__ */ a("div", { style: { fontSize: 11, color: "#9ca3af" }, children: "Upfront cash" }),
            /* @__PURE__ */ a("div", { style: { fontSize: 15, fontWeight: 600, color: "#111827" }, children: p(e.upfrontCash) })
          ] }),
          /* @__PURE__ */ s("div", { children: [
            /* @__PURE__ */ a("div", { style: { fontSize: 11, color: "#9ca3af" }, children: "Installments" }),
            /* @__PURE__ */ a("div", { style: { fontSize: 13, color: "#374151" }, children: e.installmentsLabel })
          ] }),
          /* @__PURE__ */ s("div", { children: [
            /* @__PURE__ */ a("div", { style: { fontSize: 11, color: "#9ca3af" }, children: "Total installments" }),
            /* @__PURE__ */ a("div", { style: { fontSize: 13, color: "#374151" }, children: p(e.totalInstallments) })
          ] }),
          /* @__PURE__ */ s("div", { children: [
            /* @__PURE__ */ a("div", { style: { fontSize: 11, color: "#9ca3af" }, children: "Total cash paid" }),
            /* @__PURE__ */ a("div", { style: { fontSize: 15, fontWeight: 600, color: "#111827" }, children: p(e.totalCashPaid) })
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
function de({ simpleDefinition: e, impact: t }) {
  const [n, r] = M(!1), o = se(null), c = se(null);
  ne(() => {
    if (!n) return;
    function d(h) {
      o.current && !o.current.contains(h.target) && c.current && !c.current.contains(h.target) && r(!1);
    }
    return document.addEventListener("mousedown", d), () => document.removeEventListener("mousedown", d);
  }, [n]);
  const [i, _] = M({ top: 0, left: 0 });
  return ne(() => {
    if (!n || !o.current) return;
    const d = o.current.getBoundingClientRect();
    _({
      top: d.top + window.scrollY - 8,
      left: d.left + d.width / 2 + window.scrollX
    });
  }, [n]), /* @__PURE__ */ s("span", { style: { display: "inline-block", marginLeft: 4 }, children: [
    /* @__PURE__ */ a(
      "button",
      {
        ref: o,
        type: "button",
        onClick: () => r((d) => !d),
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
    n && He(
      /* @__PURE__ */ s(
        "div",
        {
          ref: c,
          style: {
            position: "absolute",
            top: i.top,
            left: i.left,
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
function Lt(e, t, n) {
  const r = t === "homeowner" ? "receive" : "pay";
  switch (e) {
    case "payments": {
      const o = [];
      return n.upfrontPayment != null && o.push(`You ${r} ${p(n.upfrontPayment)} upfront at closing.`), n.monthlyPayment != null && n.numberOfPayments != null && n.numberOfPayments > 0 && o.push(
        `Then ${p(n.monthlyPayment)}/mo for ${n.numberOfPayments} months.`
      ), o.length === 0 && o.push("The upfront amount is set at closing. Monthly installments, if any, follow."), o.push("These amounts make up the total scheduled buyer funding."), o;
    }
    case "ownership": {
      const o = [];
      return n.contractMaturityYears != null && o.push(`The contract lasts up to ${n.contractMaturityYears} years.`), n.minimumHoldYears != null && o.push(`Earliest allowed buyout is at year ${n.minimumHoldYears}.`), n.exitYear != null && o.push(`Expected buyout is at year ${n.exitYear}.`), o.length === 0 && o.push("This tab controls how long the deal lasts and when buyout can happen."), o;
    }
    case "protections":
      return [
        "Extension premiums apply if the deal extends beyond the target exit window.",
        "A higher premium compensates FractPath for a longer hold period.",
        "Partial buyouts let the homeowner buy out FractPath’s stake in stages."
      ];
    case "assumptions":
      return [
        "Growth rate and exit year are assumptions, not guarantees.",
        "Changing these values updates the projected results in real time."
      ];
    case "fees": {
      const o = [];
      return n.setupFeePct != null && o.push(`Setup fee: ${Y(n.setupFeePct)} of upfront payment at closing.`), n.servicingFeeMonthly != null && o.push(`Monthly servicing: ${p(n.servicingFeeMonthly)}/mo for account management.`), n.exitAdminFeeAmount != null && o.push(`Exit admin fee: ${p(n.exitAdminFeeAmount)} flat at settlement.`), o.length === 0 && o.push("Fees include a setup fee at closing, monthly servicing, and an exit admin fee at settlement."), t === "realtor" && o.push("Realtor commission is tracked separately below."), o;
    }
    default:
      return [];
  }
}
function Bt(e, t) {
  if (t === "__disclosure__") return null;
  const [n, r] = t.split(".");
  return e[n][r];
}
function Vt(e, t) {
  return e.dynamicPercentAnchors ? Dt(e, t.deal_terms.property_value) : e.anchors ?? [];
}
const jt = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  paddingTop: "5vh",
  zIndex: 9999,
  fontFamily: "system-ui, sans-serif"
}, Ht = {
  background: "#fff",
  borderRadius: 12,
  width: "min(680px, 95vw)",
  height: "min(85vh, 720px)",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 8px 32px rgba(0,0,0,0.18)"
}, Yt = {
  display: "flex",
  gap: 0,
  borderBottom: "1px solid #e5e7eb",
  padding: "0 16px",
  overflowX: "auto"
};
function Ut({
  draft: e,
  errors: t,
  preview: n,
  persona: r,
  permissions: o,
  setField: c,
  onBlurCompute: i,
  onSave: _,
  onClose: d
}) {
  const [h, x] = M("payments"), [w, y] = M({}), u = N(() => {
    const l = /* @__PURE__ */ new Map();
    for (const b of Tt) l.set(b.key, b);
    return l;
  }, []), v = !ze(t) && r !== "realtor" && o?.canEdit !== !1, E = z(
    (l, b) => {
      if (c(l, b), y((g) => ({ ...g, [l]: "" })), l !== "deal_terms.realtor_representation_mode") {
        if (l === "deal_terms.realtor_commission_pct") {
          i();
          return;
        }
        i();
      }
    },
    [c, i]
  ), L = z(
    (l, b) => {
      if (l === "deal_terms.partial_buyout_allowed") {
        c(l, b === "true"), i();
        return;
      }
      if (c(l, b), l === "deal_terms.realtor_representation_mode") {
        b === "NONE" && c("deal_terms.realtor_commission_pct", 0), i();
        return;
      }
      i();
    },
    [c, i]
  ), B = z(
    (l, b) => {
      y((g) => ({ ...g, [l]: b }));
    },
    []
  ), P = z(
    (l, b) => {
      const g = w[l];
      if (g === void 0 || g === "") return;
      let D;
      b.unit === "percent" ? D = parseFloat(g) / 100 : D = parseFloat(g.replace(/,/g, "")), Number.isFinite(D) && (b.hardRange && (D = Math.max(b.hardRange.min, Math.min(b.hardRange.max, D))), c(l, D), i());
    },
    [w, c, i]
  ), j = z(() => {
    v && (_(e), d());
  }, [v, e, _, d]), f = (l) => l === "deal_terms.realtor_commission_pct" ? e.deal_terms.realtor_representation_mode === "NONE" : !1, C = (l, b) => l == null ? "—" : b.unit === "percent" ? `${(l * 100).toFixed(2)}%` : b.unit === "currency" ? p(l) : b.unit === "years" ? `${l} yr` : b.unit === "months" ? `${l} mo` : typeof l == "boolean" ? l ? "Yes" : "No" : String(l), A = (l) => {
    const b = l.key, g = Bt(e, b), D = t[b], F = l.readOnly || f(b), K = Q(b, r, l.label);
    if (l.control === "info")
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
            /* @__PURE__ */ a("div", { style: { fontWeight: 600, marginBottom: 4 }, children: l.simpleDefinition }),
            /* @__PURE__ */ a("div", { children: l.impact })
          ]
        },
        b
      );
    if (l.control === "enum") {
      const R = l.options ?? [], X = b === "deal_terms.partial_buyout_allowed" ? String(g) : g;
      return /* @__PURE__ */ s("div", { style: { marginBottom: 14 }, children: [
        /* @__PURE__ */ s("label", { style: me, children: [
          K,
          /* @__PURE__ */ a(de, { simpleDefinition: l.simpleDefinition, impact: l.impact })
        ] }),
        /* @__PURE__ */ a(
          "select",
          {
            value: X,
            disabled: F,
            onChange: (T) => L(b, T.target.value),
            style: {
              ...qt,
              background: F ? "#f3f4f6" : "#fff",
              color: F ? "#9ca3af" : "#111827"
            },
            children: R.map((T) => /* @__PURE__ */ a("option", { value: T.value, children: T.label }, T.value))
          }
        ),
        D && /* @__PURE__ */ a("div", { style: Ee, children: D })
      ] }, b);
    }
    if (l.control === "readonly")
      return /* @__PURE__ */ s("div", { style: { marginBottom: 14 }, children: [
        /* @__PURE__ */ s("label", { style: me, children: [
          K,
          /* @__PURE__ */ a(de, { simpleDefinition: l.simpleDefinition, impact: l.impact })
        ] }),
        /* @__PURE__ */ a("div", { style: Gt, children: C(g, l) })
      ] }, b);
    if (l.control === "slider" && l.slider)
      return /* @__PURE__ */ s("div", { style: { marginBottom: 14 }, children: [
        /* @__PURE__ */ s("label", { style: me, children: [
          K,
          /* @__PURE__ */ a(de, { simpleDefinition: l.simpleDefinition, impact: l.impact })
        ] }),
        /* @__PURE__ */ s("div", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [
          /* @__PURE__ */ a(
            "input",
            {
              type: "range",
              min: l.slider.min,
              max: l.slider.max,
              step: l.slider.step,
              value: g,
              disabled: F,
              onChange: (R) => c(b, parseFloat(R.target.value)),
              onMouseUp: i,
              onTouchEnd: i,
              style: { flex: 1 }
            }
          ),
          /* @__PURE__ */ a("span", { style: { fontSize: 13, fontWeight: 600, minWidth: 80, textAlign: "right" }, children: C(g, l) })
        ] }),
        D && /* @__PURE__ */ a("div", { style: Ee, children: D })
      ] }, b);
    if (l.control === "kiosk") {
      const R = Vt(l, e), X = R.length >= 4 ? [R[0], R[1], R[2], R[3]] : [
        R[0] ?? { label: "—", value: 0 },
        R[1] ?? { label: "—", value: 0 },
        R[2] ?? { label: "—", value: 0 },
        R[3] ?? { label: "—", value: 0 }
      ];
      let T = w[b] ?? "";
      return !T && !X.some((H) => H.value === g) && (l.unit === "percent" ? T = (g * 100).toString() : T = String(g)), /* @__PURE__ */ s("div", { style: { marginBottom: 14 }, children: [
        /* @__PURE__ */ s("label", { style: me, children: [
          K,
          /* @__PURE__ */ a(de, { simpleDefinition: l.simpleDefinition, impact: l.impact })
        ] }),
        /* @__PURE__ */ a(
          $t,
          {
            value: g,
            anchors: X,
            unit: l.unit,
            onSelectAnchor: (H) => E(b, H),
            customValue: T,
            onChangeCustom: (H) => B(b, H),
            onBlurCustom: () => P(b, l),
            disabled: F,
            error: D
          }
        )
      ] }, b);
    }
    return null;
  }, Z = Ae.find((l) => l.key === h);
  return /* @__PURE__ */ a("div", { style: jt, onClick: (l) => {
    l.target === l.currentTarget && d();
  }, children: /* @__PURE__ */ s("div", { style: Ht, role: "dialog", "aria-modal": "true", "data-testid": "deal-edit-modal", children: [
    /* @__PURE__ */ a("div", { style: { padding: "16px 20px 0", borderBottom: "none" }, children: /* @__PURE__ */ s("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
      /* @__PURE__ */ a("h2", { style: { margin: 0, fontSize: 18, color: "#111827" }, children: "Edit Deal Terms" }),
      /* @__PURE__ */ a(
        "button",
        {
          type: "button",
          onClick: d,
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
    /* @__PURE__ */ a("div", { style: Yt, children: Ae.map((l) => /* @__PURE__ */ a(
      "button",
      {
        type: "button",
        onClick: () => x(l.key),
        style: {
          padding: "10px 16px",
          border: "none",
          borderBottom: h === l.key ? "2px solid #111827" : "2px solid transparent",
          background: "none",
          fontSize: 13,
          fontWeight: h === l.key ? 600 : 400,
          color: h === l.key ? "#111827" : "#6b7280",
          cursor: "pointer",
          fontFamily: "system-ui, sans-serif",
          whiteSpace: "nowrap"
        },
        children: l.label
      },
      l.key
    )) }),
    /* @__PURE__ */ a("div", { style: { flex: 1, overflow: "auto", padding: "16px 20px" }, children: /* @__PURE__ */ s("div", { style: { display: "grid", gridTemplateColumns: "1fr 220px", gap: 20 }, children: [
      /* @__PURE__ */ a("div", { children: Z.sections.map((l) => /* @__PURE__ */ s("div", { style: { marginBottom: 20 }, children: [
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
            children: l.label
          }
        ),
        l.fieldKeys.map((b) => {
          const g = u.get(b);
          return g ? A(g) : null;
        })
      ] }, l.label)) }),
      /* @__PURE__ */ s("div", { children: [
        /* @__PURE__ */ a(
          It,
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
              /* @__PURE__ */ a("ul", { style: { margin: 0, padding: "0 0 0 14px", fontSize: 11, lineHeight: 1.6, color: "#374151" }, children: Lt(h, r, {
                upfrontPayment: e.deal_terms.upfront_payment,
                monthlyPayment: e.deal_terms.monthly_payment,
                numberOfPayments: e.deal_terms.number_of_payments,
                contractMaturityYears: e.deal_terms.contract_maturity_years,
                minimumHoldYears: e.deal_terms.minimum_hold_years,
                exitYear: e.scenario.exit_year,
                setupFeePct: e.deal_terms.setup_fee_pct,
                servicingFeeMonthly: e.deal_terms.servicing_fee_monthly,
                exitAdminFeeAmount: e.deal_terms.exit_admin_fee_amount
              }).map((l, b) => /* @__PURE__ */ a("li", { style: { marginBottom: 2 }, children: l }, b)) })
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
              onClick: d,
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
              onClick: j,
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
const me = {
  display: "block",
  fontSize: 12,
  color: "#374151",
  marginBottom: 5,
  fontWeight: 500
}, qt = {
  width: "100%",
  padding: "7px 10px",
  border: "1px solid #d1d5db",
  borderRadius: 6,
  fontSize: 13,
  fontFamily: "system-ui, sans-serif",
  boxSizing: "border-box"
}, Gt = {
  padding: "7px 10px",
  background: "#f3f4f6",
  border: "1px solid #e5e7eb",
  borderRadius: 6,
  fontSize: 13,
  color: "#6b7280"
}, Ee = {
  color: "#ef4444",
  fontSize: 11,
  marginTop: 3
};
function ge() {
  return {
    deal_terms: {
      property_value: 6e5,
      upfront_payment: 5e4,
      monthly_payment: 0,
      number_of_payments: 0,
      minimum_hold_years: 3,
      contract_maturity_years: 30,
      target_exit_year: 7,
      target_exit_window_start_year: 6,
      target_exit_window_end_year: 8,
      long_stop_year: 15,
      first_extension_start_year: 8,
      first_extension_end_year: 11,
      first_extension_premium_pct: 0.05,
      second_extension_start_year: 11,
      second_extension_end_year: 15,
      second_extension_premium_pct: 0.08,
      partial_buyout_allowed: !1,
      partial_buyout_min_fraction: 0.25,
      partial_buyout_increment_fraction: 0.25,
      buyer_purchase_option_enabled: !1,
      buyer_purchase_notice_days: 90,
      buyer_purchase_closing_days: 60,
      setup_fee_pct: k.setup_fee_pct,
      setup_fee_floor: k.setup_fee_floor,
      setup_fee_cap: k.setup_fee_cap,
      servicing_fee_monthly: k.servicing_fee_monthly,
      payment_admin_fee: k.payment_admin_fee,
      exit_admin_fee_amount: k.exit_admin_fee_amount,
      realtor_representation_mode: "NONE",
      realtor_commission_pct: 0
    },
    scenario: {
      annual_appreciation: 0.03,
      closing_cost_pct: 0.02,
      exit_year: 7
    }
  };
}
function pe(e) {
  const { upfront_payment: t, monthly_payment: n, number_of_payments: r } = e.deal_terms, { exit_year: o } = e.scenario, c = Math.floor(o * 12), i = Math.min(r, c), _ = n * i, d = t + _, h = i === 0 ? "No installments" : `${i} payments of ${p(n)}`;
  return {
    upfrontCash: t,
    installmentsLabel: h,
    totalInstallments: _,
    totalCashPaid: d
  };
}
function Kt(e) {
  return fe(e.deal_terms, e.scenario);
}
function Xt(e, t, n) {
  const r = structuredClone(e), [o, c] = t.split(".");
  return r[o][c] = n, r;
}
function Jt(e) {
  const [t, n] = M(
    () => e ?? ge()
  ), [r, o] = M({}), [c, i] = M(() => ({
    tier1: pe(e ?? ge()),
    status: "idle"
  })), _ = z((x, w) => {
    n((y) => {
      const u = Xt(y, x, w);
      return i((v) => ({ ...v, tier1: pe(u) })), u;
    });
  }, []), d = z(() => {
    n((x) => {
      const w = zt(x);
      if (o(w), ze(w))
        return i((y) => ({
          ...y,
          status: "error",
          error: "Validation failed"
        })), x;
      i((y) => ({ ...y, status: "computing" }));
      try {
        const y = Kt(x);
        i({
          tier1: pe(x),
          status: "ok",
          lastComputedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
          results: y
        });
      } catch (y) {
        i((u) => ({
          ...u,
          status: "error",
          error: y instanceof Error ? y.message : "Compute failed"
        }));
      }
      return x;
    });
  }, []), h = N(() => pe(t), [t]);
  return {
    draft: t,
    errors: r,
    preview: { ...c, tier1: h },
    setField: _,
    onBlurCompute: d
  };
}
function Qt(e) {
  const t = e.exitYear;
  return {
    property_value: e.propertyValue,
    upfront_payment: e.upfrontPayment,
    monthly_payment: e.monthlyPayment,
    number_of_payments: e.numberOfPayments,
    minimum_hold_years: 2,
    contract_maturity_years: Math.max(t + 5, 15),
    target_exit_year: t,
    target_exit_window_start_year: Math.max(1, t - 1),
    target_exit_window_end_year: t + 1,
    long_stop_year: t + 5,
    first_extension_start_year: t + 1,
    first_extension_end_year: t + 4,
    first_extension_premium_pct: 0.05,
    second_extension_start_year: t + 4,
    second_extension_end_year: t + 5,
    second_extension_premium_pct: 0.08,
    partial_buyout_allowed: !1,
    partial_buyout_min_fraction: 0.25,
    partial_buyout_increment_fraction: 0.25,
    buyer_purchase_option_enabled: !1,
    buyer_purchase_notice_days: 90,
    buyer_purchase_closing_days: 60,
    setup_fee_pct: k.setup_fee_pct,
    setup_fee_floor: k.setup_fee_floor,
    setup_fee_cap: k.setup_fee_cap,
    servicing_fee_monthly: k.servicing_fee_monthly,
    payment_admin_fee: k.payment_admin_fee,
    exit_admin_fee_amount: k.exit_admin_fee_amount,
    realtor_representation_mode: e.realtorMode,
    realtor_commission_pct: e.realtorPct / 100
  };
}
function Zt(e) {
  return {
    annual_appreciation: e.growthRatePct / 100,
    closing_cost_pct: 0,
    exit_year: e.exitYear
  };
}
const Fn = [
  "buyer",
  "homeowner",
  "realtor"
];
function en(e) {
  const t = N(() => {
    const _ = ge();
    return {
      ..._,
      ...e.initial,
      deal_terms: {
        ..._.deal_terms,
        ...e.initial?.deal_terms ?? {}
      },
      scenario: {
        ..._.scenario,
        ...e.initial?.scenario ?? {}
      }
    };
  }, [e.initial]), { draft: n, errors: r, preview: o, setField: c, onBlurCompute: i } = Jt(t);
  return /* @__PURE__ */ a(
    Ut,
    {
      draft: n,
      errors: r,
      preview: o,
      persona: e.persona,
      setField: c,
      onBlurCompute: i,
      onSave: (_) => e.onSaved(_),
      onClose: e.onClose
    }
  );
}
function tn(e = 640) {
  const [t, n] = M(!1);
  return ne(() => {
    if (typeof window > "u") return;
    const r = window.matchMedia(`(max-width: ${e}px)`);
    n(r.matches);
    const o = (c) => n(c.matches);
    return r.addEventListener("change", o), () => r.removeEventListener("change", o);
  }, [e]), t;
}
function nn({ value: e, format: t }) {
  const n = se(null), r = se(e), o = se(0);
  ne(() => {
    const i = r.current, _ = e;
    if (r.current = _, i === _ || !n.current) return;
    const d = 300, h = performance.now(), x = (w) => {
      const y = w - h, u = Math.min(y / d, 1), v = 1 - Math.pow(1 - u, 3), E = i + (_ - i) * v;
      n.current && (t === "currency" ? n.current.textContent = p(E) : t === "percent" ? n.current.textContent = Y(E) : n.current.textContent = E.toLocaleString(void 0, { maximumFractionDigits: 1 })), u < 1 && (o.current = requestAnimationFrame(x));
    };
    return o.current = requestAnimationFrame(x), () => cancelAnimationFrame(o.current);
  }, [e, t]);
  let c;
  return t === "currency" ? c = p(e) : t === "percent" ? c = Y(e) : c = e.toLocaleString(void 0, { maximumFractionDigits: 1 }), /* @__PURE__ */ a("span", { ref: n, children: c });
}
function an() {
  if (typeof window > "u") return !1;
  try {
    return new URLSearchParams(window.location.search).get("DEV_HARNESS") === "true" || !1;
  } catch {
    return !1;
  }
}
function rn() {
  if (!an() || typeof window > "u") return null;
  try {
    const e = new URLSearchParams(window.location.search).get("devAuth");
    if (e === "editor" || e === "viewer" || e === "loggedOut")
      return e;
    const t = void 0;
  } catch {
  }
  return null;
}
function Ce(e, t) {
  if (typeof e == "string") return e;
  switch (t) {
    case "currency":
      return p(e);
    case "percent":
      return Y(e);
    case "multiple":
      return `${e.toFixed(2)}×`;
    case "months":
      return `${e}`;
    default:
      return String(e);
  }
}
function on(e) {
  return e === 1 ? "1 Year" : `${e} Years`;
}
const ln = `
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
  [data-fractpath-widget] svg {
    max-width: 100%;
    height: auto;
  }
`;
function sn(e) {
  const {
    persona: t,
    mode: n = "marketing",
    canEdit: r,
    onEvent: o,
    onDraftSnapshot: c,
    onShareSummary: i,
    onSave: _
  } = e, d = n === "app", h = n === "marketing", [x, w] = M(t);
  ne(() => {
    w(t);
  }, [t]);
  const y = h ? x : t, u = tn(), v = rn(), E = v === "editor" ? !0 : v === "viewer" || v === "loggedOut" ? !1 : r ?? !1, [L, B] = M(!1), [P, j] = M(6e5), [f, C] = M(1e5), [A, Z] = M(0), [l, b] = M(0), [g, D] = M(10), [F, K] = M(3), [R, X] = M("NONE"), [T, H] = M(0);
  ne(() => {
    o?.({ type: "calculator_used", persona: y });
  }, [y, o]);
  const ce = N(
    () => ({
      propertyValue: P,
      upfrontPayment: f,
      monthlyPayment: A,
      numberOfPayments: l,
      exitYear: g,
      growthRatePct: F,
      realtorMode: R,
      realtorPct: T
    }),
    [
      P,
      f,
      A,
      l,
      g,
      F,
      R,
      T
    ]
  ), ee = N(
    () => Qt(ce),
    [ce]
  ), te = N(
    () => Zt(ce),
    [ce]
  ), $e = N(
    () => ({ deal_terms: ee, scenario: te }),
    [ee, te]
  ), I = N(
    () => fe(ee, te),
    [ee, te]
  ), J = N(
    () => Mt(
      y,
      ee,
      te,
      I
    ),
    [y, ee, te, I]
  ), ie = g * 12, V = N(
    () => d ? pt({
      homeValue: P,
      initialBuyAmount: f,
      termYears: g,
      annualGrowthRate: F / 100
    }) : null,
    [d, P, f, g, F]
  ), ve = N(
    () => V ? _t(V) : null,
    [V]
  ), ye = (m, S) => {
    const le = Number(m.replace(/,/g, ""));
    return Number.isFinite(le) && le >= 0 ? le : S;
  }, Oe = z(() => {
    if (o?.({ type: "save_clicked", persona: y }), _ && V) {
      const m = Rt(V.normalizedInputs);
      _(m);
    }
  }, [V, _, o, y]), We = z(async () => {
    if (o?.({ type: "save_continue_clicked", persona: y }), c) {
      const m = {
        homeValue: P,
        initialBuyAmount: f,
        termYears: g,
        annualGrowthRate: F / 100
      }, S = {
        standard_net_payout: I.extension_adjusted_buyout_amount,
        early_net_payout: I.extension_adjusted_buyout_amount,
        late_net_payout: I.extension_adjusted_buyout_amount,
        standard_settlement_month: ie,
        early_settlement_month: ie,
        late_settlement_month: ie
      }, [le, je] = await Promise.all([
        oe(m),
        oe(S)
      ]);
      c({
        contract_version: ae,
        schema_version: re,
        persona: y,
        mode: "marketing",
        inputs: m,
        basic_results: S,
        input_hash: le,
        output_hash: je,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  }, [
    y,
    P,
    f,
    g,
    F,
    I,
    ie,
    c,
    o
  ]), Ie = z(() => {
    o?.({ type: "share_clicked", persona: y }), i && i({
      contract_version: ae,
      schema_version: re,
      persona: y,
      inputs: {
        homeValue: P,
        initialBuyAmount: f,
        termYears: g,
        annualGrowthRate: F / 100
      },
      basic_results: {
        standard_net_payout: I.extension_adjusted_buyout_amount,
        early_net_payout: I.extension_adjusted_buyout_amount,
        late_net_payout: I.extension_adjusted_buyout_amount
      },
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    });
  }, [
    y,
    P,
    f,
    g,
    F,
    I,
    i,
    o
  ]), Le = N(() => {
    const m = [
      { label: "Property", value: p(P) },
      { label: "Upfront", value: p(f) },
      { label: "Monthly", value: p(A) },
      { label: "# Months", value: String(l) },
      { label: "Exit Year", value: String(g) },
      { label: "Growth", value: Y(F / 100) }
    ];
    return R !== "NONE" && m.push({ label: "Realtor", value: `${R} ${T}%` }), m;
  }, [
    P,
    f,
    A,
    l,
    g,
    F,
    R,
    T
  ]), Be = P * Math.pow(1 + F / 100, g), U = {
    display: "block",
    fontSize: u ? 14 : 13,
    color: "#374151",
    marginBottom: 6,
    fontWeight: 500,
    letterSpacing: "-0.01em"
  }, q = {
    width: "100%",
    padding: u ? "12px 14px" : "10px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    fontSize: u ? 16 : 14,
    fontFamily: "system-ui, sans-serif",
    boxSizing: "border-box",
    color: "#111827",
    background: "#fafafa",
    transition: "border-color 0.15s, box-shadow 0.15s"
  }, G = {
    marginBottom: u ? 20 : 16
  }, we = {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "5px 12px",
    background: "#f9fafb",
    borderRadius: 20,
    fontSize: u ? 11 : 12,
    color: "#374151",
    border: "1px solid #e5e7eb",
    whiteSpace: "normal",
    wordBreak: "break-word",
    maxWidth: "100%"
  }, Se = {
    color: "#9ca3af",
    fontWeight: 400
  }, ke = {
    fontWeight: 600,
    color: "#111827"
  }, Ve = [
    {
      label: "Home Value Today",
      value: P,
      format: "currency"
    },
    {
      label: "Cash Unlocked Today",
      value: f,
      format: "currency"
    },
    {
      label: l > 0 ? `Monthly Contribution / ${l} Month${l === 1 ? "" : "s"}` : "Monthly Contribution",
      value: A,
      format: "currency"
    },
    {
      label: `Projected Value in ${on(g)}`,
      value: Be,
      format: "currency"
    }
  ];
  return /* @__PURE__ */ s(
    "div",
    {
      style: {
        fontFamily: "system-ui, sans-serif",
        maxWidth: 960,
        width: "100%",
        overflow: "hidden"
      },
      "data-fractpath-widget": !0,
      "data-persona": y,
      "data-mode": n,
      children: [
        /* @__PURE__ */ a("style", { children: ln }),
        d && /* @__PURE__ */ s("div", { style: { marginBottom: 20 }, children: [
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
              children: Le.map((m, S) => /* @__PURE__ */ s("span", { style: we, children: [
                /* @__PURE__ */ s("span", { style: Se, children: [
                  m.label,
                  ":"
                ] }),
                /* @__PURE__ */ a("span", { style: ke, children: m.value })
              ] }, S))
            }
          ),
          E && /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              onClick: () => B(!0),
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
              gridTemplateColumns: d || u ? "1fr" : "minmax(0, 1fr) minmax(0, 2fr)",
              gap: u ? 16 : 24
            },
            children: [
              h && /* @__PURE__ */ s("div", { style: { minWidth: 0, overflow: "hidden" }, children: [
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
                /* @__PURE__ */ s("div", { style: G, children: [
                  /* @__PURE__ */ a("label", { style: U, children: Q(
                    "deal_terms.property_value",
                    y,
                    "Home Value ($)"
                  ) }),
                  /* @__PURE__ */ a(
                    "input",
                    {
                      type: "text",
                      inputMode: "numeric",
                      style: q,
                      value: P.toLocaleString(),
                      onChange: (m) => {
                        j(ye(m.target.value, P));
                      }
                    }
                  )
                ] }),
                /* @__PURE__ */ s("div", { style: G, children: [
                  /* @__PURE__ */ a("label", { style: U, children: Q(
                    "deal_terms.upfront_payment",
                    y,
                    "Upfront Payment ($)"
                  ) }),
                  /* @__PURE__ */ a(
                    "input",
                    {
                      type: "text",
                      inputMode: "numeric",
                      style: q,
                      value: f.toLocaleString(),
                      onChange: (m) => {
                        C(
                          ye(m.target.value, f)
                        );
                      }
                    }
                  )
                ] }),
                /* @__PURE__ */ s("div", { style: G, children: [
                  /* @__PURE__ */ a("label", { style: U, children: Q(
                    "deal_terms.monthly_payment",
                    y,
                    "Monthly Installment ($)"
                  ) }),
                  /* @__PURE__ */ a(
                    "input",
                    {
                      type: "text",
                      inputMode: "numeric",
                      style: q,
                      value: A.toLocaleString(),
                      onChange: (m) => {
                        Z(
                          ye(m.target.value, A)
                        );
                      }
                    }
                  )
                ] }),
                /* @__PURE__ */ s("div", { style: G, children: [
                  /* @__PURE__ */ a("label", { style: U, children: "Number of Monthly Payments" }),
                  /* @__PURE__ */ a(
                    "input",
                    {
                      type: "number",
                      min: 0,
                      max: 360,
                      step: 1,
                      style: q,
                      value: l,
                      onChange: (m) => {
                        const S = parseInt(m.target.value, 10);
                        Number.isFinite(S) && S >= 0 && S <= 360 && b(S);
                      }
                    }
                  )
                ] }),
                /* @__PURE__ */ s("div", { style: G, children: [
                  /* @__PURE__ */ a("label", { style: U, children: Q("scenario.exit_year", y, "Target Exit Year") }),
                  /* @__PURE__ */ a(
                    "input",
                    {
                      type: "number",
                      min: 1,
                      max: 30,
                      step: 1,
                      style: q,
                      value: g,
                      onChange: (m) => {
                        const S = parseInt(m.target.value, 10);
                        Number.isFinite(S) && S >= 1 && S <= 30 && D(S);
                      }
                    }
                  )
                ] }),
                /* @__PURE__ */ s("div", { style: G, children: [
                  /* @__PURE__ */ a("label", { style: U, children: "Annual Growth Rate (assumption)" }),
                  /* @__PURE__ */ a(
                    "input",
                    {
                      type: "number",
                      min: 0,
                      max: 20,
                      step: 0.1,
                      style: q,
                      value: F,
                      onChange: (m) => {
                        const S = parseFloat(m.target.value);
                        Number.isFinite(S) && S >= 0 && S <= 20 && K(S);
                      }
                    }
                  )
                ] }),
                /* @__PURE__ */ s("div", { style: G, children: [
                  /* @__PURE__ */ a("label", { style: U, children: Q(
                    "deal_terms.realtor_representation_mode",
                    y,
                    "Realtor Representation"
                  ) }),
                  /* @__PURE__ */ s(
                    "select",
                    {
                      value: R,
                      onChange: (m) => {
                        X(m.target.value), m.target.value === "NONE" && H(0);
                      },
                      style: {
                        ...q,
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
                R !== "NONE" && /* @__PURE__ */ s("div", { style: G, children: [
                  /* @__PURE__ */ a("label", { style: U, children: Q(
                    "deal_terms.realtor_commission_pct",
                    y,
                    "Commission (%)"
                  ) }),
                  /* @__PURE__ */ a(
                    "input",
                    {
                      type: "number",
                      min: 0,
                      max: 6,
                      step: 0.5,
                      style: q,
                      value: T,
                      onChange: (m) => {
                        const S = parseFloat(m.target.value);
                        Number.isFinite(S) && S >= 0 && S <= 6 && H(S);
                      }
                    }
                  )
                ] }),
                h && /* @__PURE__ */ s("details", { style: { marginTop: 8 }, children: [
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
                              "Setup fee: ",
                              Y(k.setup_fee_pct),
                              " (min ",
                              p(k.setup_fee_floor),
                              ", max ",
                              p(k.setup_fee_cap),
                              ")"
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
                              p(k.servicing_fee_monthly)
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
                              "Exit admin fee: ",
                              p(k.exit_admin_fee_amount)
                            ]
                          }
                        )
                      ]
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ s("div", { style: { minWidth: 0 }, children: [
                h && /* @__PURE__ */ a(
                  "div",
                  {
                    style: {
                      display: "grid",
                      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                      gap: u ? 8 : 10,
                      marginBottom: 20
                    },
                    "data-testid": "summary-cards",
                    children: Ve.map((m) => /* @__PURE__ */ s(
                      "div",
                      {
                        style: {
                          padding: u ? "14px 8px" : "16px 12px",
                          background: "#f9fafb",
                          borderRadius: 12,
                          border: "1px solid #f3f4f6",
                          textAlign: "center",
                          animation: "fp-fadeIn 0.3s ease-out",
                          overflow: "hidden",
                          minWidth: 0
                        },
                        children: [
                          /* @__PURE__ */ a("div", { style: {
                            fontSize: u ? 16 : 18,
                            fontWeight: 700,
                            color: "#111827",
                            letterSpacing: "-0.02em",
                            lineHeight: 1.2,
                            marginBottom: 4
                          }, children: /* @__PURE__ */ a(nn, { value: m.value, format: m.format }) }),
                          /* @__PURE__ */ a("div", { style: {
                            fontSize: u ? 9 : 10,
                            color: "#9ca3af",
                            fontWeight: 500,
                            textTransform: "uppercase",
                            letterSpacing: "0.03em",
                            lineHeight: 1.3,
                            wordBreak: "break-word",
                            hyphens: "auto"
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
                      padding: u ? "14px" : "16px 20px",
                      background: "#f9fafb",
                      borderRadius: 12,
                      border: "1px solid #f3f4f6",
                      marginBottom: 16,
                      textAlign: "center"
                    },
                    "data-testid": "hero-metric",
                    children: [
                      /* @__PURE__ */ a("div", { style: { fontSize: 13, color: "#6b7280", marginBottom: 4, fontWeight: 500 }, children: J.hero.label }),
                      /* @__PURE__ */ a("div", { style: {
                        fontSize: u ? 22 : 26,
                        fontWeight: 700,
                        color: "#111827",
                        letterSpacing: "-0.02em"
                      }, children: Ce(
                        J.hero.value,
                        J.hero.valueFormat
                      ) }),
                      J.hero.subtitle && /* @__PURE__ */ a("div", { style: { fontSize: 13, color: "#9ca3af", marginTop: 6, lineHeight: 1.4 }, children: J.hero.subtitle })
                    ]
                  }
                ),
                h && /* @__PURE__ */ a("div", { style: { marginBottom: 20, padding: u ? "4px 0" : "8px 0", width: "100%", overflow: "hidden" }, children: /* @__PURE__ */ a(
                  Ct,
                  {
                    bars: J.chartSpec.bars,
                    height: u ? 180 : 220
                  }
                ) }),
                /* @__PURE__ */ a(
                  "div",
                  {
                    style: {
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 6,
                      marginBottom: 16,
                      width: "100%",
                      overflow: "hidden"
                    },
                    "data-testid": "summary-strip",
                    children: J.strip.map((m, S) => /* @__PURE__ */ s("span", { style: we, children: [
                      /* @__PURE__ */ s("span", { style: Se, children: [
                        m.label,
                        ":"
                      ] }),
                      /* @__PURE__ */ a("span", { style: ke, children: Ce(m.value, m.valueFormat) })
                    ] }, S))
                  }
                ),
                h && /* @__PURE__ */ a(
                  "div",
                  {
                    style: {
                      padding: "10px 14px",
                      background: "#f9fafb",
                      borderRadius: 10,
                      border: "1px solid #f3f4f6",
                      marginBottom: 16
                    },
                    children: /* @__PURE__ */ s("div", { style: { fontSize: 12, color: "#9ca3af" }, children: [
                      /* @__PURE__ */ a("strong", { style: { color: "#374151" }, children: "Standard" }),
                      " · ",
                      Pe(ie),
                      " · Illustrative Buyout: ",
                      p(I.extension_adjusted_buyout_amount)
                    ] })
                  }
                ),
                !h && V && /* @__PURE__ */ s(ue, { children: [
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
                        { label: "Early", data: V.settlements.early },
                        {
                          label: "Standard",
                          data: V.settlements.standard
                        },
                        { label: "Late", data: V.settlements.late }
                      ].map((m) => /* @__PURE__ */ s(
                        "div",
                        {
                          style: {
                            padding: "12px 14px",
                            background: "#f9fafb",
                            borderRadius: 10,
                            border: "1px solid #f3f4f6",
                            display: "grid",
                            gridTemplateColumns: u ? "repeat(3, minmax(0, 1fr))" : "repeat(6, minmax(0, 1fr))",
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
                              /* @__PURE__ */ a("div", { style: { fontSize: 13, color: "#111827" }, children: Pe(m.data.settlementMonth) })
                            ] }),
                            /* @__PURE__ */ s("div", { children: [
                              /* @__PURE__ */ a("div", { style: { fontSize: 11, color: "#9ca3af" }, children: "Net Payout" }),
                              /* @__PURE__ */ a("div", { style: { fontWeight: 600, fontSize: 13, color: "#111827" }, children: p(m.data.netPayout) })
                            ] }),
                            !u && /* @__PURE__ */ s(ue, { children: [
                              /* @__PURE__ */ s("div", { children: [
                                /* @__PURE__ */ a("div", { style: { fontSize: 11, color: "#9ca3af" }, children: "Raw Payout" }),
                                /* @__PURE__ */ a("div", { style: { fontSize: 13, color: "#111827" }, children: p(m.data.rawPayout) })
                              ] }),
                              /* @__PURE__ */ s("div", { children: [
                                /* @__PURE__ */ a("div", { style: { fontSize: 11, color: "#9ca3af" }, children: "Transfer Fee" }),
                                /* @__PURE__ */ s("div", { style: { fontSize: 13, color: "#111827" }, children: [
                                  p(m.data.transferFeeAmount),
                                  " (",
                                  Y(m.data.transferFeeRate),
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
                !h && ve && /* @__PURE__ */ a("div", { style: { marginBottom: 20, width: "100%", overflow: "hidden" }, children: /* @__PURE__ */ a(xt, { series: ve, width: 520, height: u ? 200 : 260 }) }),
                /* @__PURE__ */ s(
                  "div",
                  {
                    style: {
                      display: "flex",
                      flexDirection: u ? "column" : "row",
                      gap: 10,
                      marginTop: 20
                    },
                    children: [
                      h && /* @__PURE__ */ s(ue, { children: [
                        /* @__PURE__ */ a(
                          "button",
                          {
                            type: "button",
                            onClick: We,
                            style: {
                              padding: u ? "14px 20px" : "12px 24px",
                              borderRadius: 10,
                              border: "none",
                              fontSize: u ? 16 : 15,
                              fontWeight: 600,
                              cursor: "pointer",
                              fontFamily: "system-ui, sans-serif",
                              background: "#111827",
                              color: "#fff",
                              width: u ? "100%" : "auto",
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
                            onClick: Ie,
                            style: {
                              padding: u ? "14px 20px" : "12px 24px",
                              borderRadius: 10,
                              border: "1px solid #e5e7eb",
                              fontSize: u ? 16 : 15,
                              fontWeight: 600,
                              cursor: "pointer",
                              fontFamily: "system-ui, sans-serif",
                              background: "#fff",
                              color: "#111827",
                              width: u ? "100%" : "auto",
                              transition: "opacity 0.15s"
                            },
                            "data-cta": "share",
                            children: "Share"
                          }
                        )
                      ] }),
                      !h && /* @__PURE__ */ a(
                        "button",
                        {
                          type: "button",
                          onClick: Oe,
                          style: {
                            padding: u ? "14px 20px" : "12px 24px",
                            borderRadius: 10,
                            border: "none",
                            fontSize: u ? 16 : 15,
                            fontWeight: 600,
                            cursor: "pointer",
                            fontFamily: "system-ui, sans-serif",
                            background: "#111827",
                            color: "#fff",
                            width: u ? "100%" : "auto"
                          },
                          "data-cta": "save",
                          children: "Save"
                        }
                      )
                    ]
                  }
                ),
                h && /* @__PURE__ */ a("p", { style: {
                  margin: "12px 0 0 0",
                  fontSize: 13,
                  color: "#9ca3af",
                  lineHeight: 1.4,
                  textAlign: u ? "center" : "left"
                }, children: "Create a free account to save your scenario and continue in FractPath." })
              ] })
            ]
          }
        ),
        L && E && /* @__PURE__ */ a(
          en,
          {
            initial: $e,
            persona: y,
            onClose: () => B(!1),
            onSaved: (m) => {
              j(m.deal_terms.property_value), C(m.deal_terms.upfront_payment), Z(m.deal_terms.monthly_payment), b(m.deal_terms.number_of_payments), D(m.scenario.exit_year), K(m.scenario.annual_appreciation * 100), X(m.deal_terms.realtor_representation_mode), H(m.deal_terms.realtor_commission_pct * 100), B(!1);
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
              /* @__PURE__ */ a("strong", { children: y }),
              " · ",
              "Mode: ",
              /* @__PURE__ */ a("strong", { children: n }),
              v && /* @__PURE__ */ s(ue, { children: [
                " ",
                "·",
                " DEV_AUTH: ",
                /* @__PURE__ */ a("strong", { children: v })
              ] }),
              " · ",
              p(P),
              " home ",
              "·",
              " ",
              p(f),
              " ",
              "upfront ",
              "·",
              " ",
              p(A),
              "\\u00d7",
              l,
              "mo ",
              "·",
              " ",
              g,
              "yr ",
              "·",
              " ",
              Y(F / 100),
              " growth"
            ]
          }
        )
      ]
    }
  );
}
function An(e) {
  return /* @__PURE__ */ a(sn, { ...e });
}
function cn({ items: e }) {
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
function un({ results: e }) {
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
const dn = [
  { key: "cash_flow", label: "Cash Flow" },
  { key: "ownership", label: "Ownership" },
  { key: "protections", label: "Exit Terms" },
  { key: "fees", label: "Fees" },
  { key: "assumptions", label: "Assumptions" }
];
function $(e) {
  return (e * 100).toFixed(2) + "%";
}
function mn({ rows: e }) {
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
function pn(e, t) {
  const n = [
    {
      label: "Buyout Amount",
      value: p(e.extension_adjusted_buyout_amount),
      sublabel: `Window: ${e.current_window}`
    },
    {
      label: "Participation Value",
      value: p(e.current_participation_value)
    },
    {
      label: "Funding Completion",
      value: $(e.funding_completion_factor)
    },
    {
      label: "Appreciation Share",
      value: $(e.effective_buyer_appreciation_share)
    },
    {
      label: "Total Funding",
      value: p(e.actual_buyer_funding_to_date),
      sublabel: `${$(t.scenario.annual_appreciation)} / yr`
    }
  ], r = t.deal_terms.realtor_representation_mode, o = t.deal_terms.realtor_commission_pct;
  return r !== "NONE" ? n.push({
    label: "Realtor Fee (est.)",
    value: p(e.realtor_fee_total_projected),
    sublabel: `${$(o)} · ${r}`
  }) : n.push({
    label: "Realtor Fee",
    value: p(0),
    sublabel: "No realtor"
  }), n;
}
function _n(e) {
  return [
    {
      label: "Total scheduled funding",
      value: p(e.total_scheduled_buyer_funding)
    },
    {
      label: "Actual funding to date",
      value: p(e.actual_buyer_funding_to_date)
    },
    {
      label: "Funding completion factor",
      value: $(e.funding_completion_factor)
    },
    {
      label: "Base buyout amount",
      value: p(e.base_buyout_amount)
    },
    {
      label: "Extension-adjusted buyout",
      value: p(e.extension_adjusted_buyout_amount)
    },
    {
      label: "Buyer appreciation claim",
      value: p(e.buyer_appreciation_claim)
    },
    {
      label: "Current window",
      value: e.current_window
    }
  ];
}
function fn(e, t) {
  return [
    {
      label: "Scheduled appreciation share",
      value: $(t.scheduled_buyer_appreciation_share)
    },
    {
      label: "Effective appreciation share",
      value: $(t.effective_buyer_appreciation_share)
    },
    {
      label: "Current participation value",
      value: p(t.current_participation_value)
    },
    {
      label: "Current contract value",
      value: p(t.current_contract_value)
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
      label: "Target exit year",
      value: `${e.deal_terms.target_exit_year} yr`
    }
  ];
}
function yn(e, t) {
  const n = [
    {
      label: "First extension premium",
      value: $(e.deal_terms.first_extension_premium_pct)
    },
    {
      label: "Second extension premium",
      value: $(e.deal_terms.second_extension_premium_pct)
    },
    {
      label: "Partial buyout allowed",
      value: e.deal_terms.partial_buyout_allowed ? "Yes" : "No"
    }
  ];
  return e.deal_terms.partial_buyout_allowed && n.push(
    {
      label: "Partial buyout 25%",
      value: t.partial_buyout_amount_25 != null ? p(t.partial_buyout_amount_25) : "—"
    },
    {
      label: "Partial buyout 50%",
      value: t.partial_buyout_amount_50 != null ? p(t.partial_buyout_amount_50) : "—"
    },
    {
      label: "Partial buyout 75%",
      value: t.partial_buyout_amount_75 != null ? p(t.partial_buyout_amount_75) : "—"
    }
  ), t.discount_purchase_price != null && n.push({
    label: "Discount purchase price",
    value: p(t.discount_purchase_price)
  }), n;
}
function hn(e, t) {
  const n = [
    {
      label: "Setup fee (%)",
      value: $(e.deal_terms.setup_fee_pct)
    },
    {
      label: "Setup fee (amount)",
      value: p(t.fractpath_setup_fee_amount)
    },
    {
      label: "Servicing fee (monthly)",
      value: p(e.deal_terms.servicing_fee_monthly)
    },
    {
      label: "Payment admin fee",
      value: p(e.deal_terms.payment_admin_fee)
    },
    {
      label: "Exit admin fee",
      value: p(e.deal_terms.exit_admin_fee_amount)
    },
    {
      label: "FractPath revenue to date",
      value: p(t.fractpath_revenue_to_date)
    }
  ], r = e.deal_terms.realtor_representation_mode;
  return n.push({
    label: "Realtor representation",
    value: r === "NONE" ? "None" : r
  }), n.push({
    label: "Realtor commission",
    value: $(e.deal_terms.realtor_commission_pct)
  }), n.push({
    label: "Realtor fee (total projected)",
    value: p(t.realtor_fee_total_projected)
  }), n;
}
function bn(e) {
  const t = [
    {
      label: "Annual appreciation",
      value: $(e.scenario.annual_appreciation)
    },
    { label: "Exit year", value: `${e.scenario.exit_year} yr` },
    { label: "Closing costs", value: $(e.scenario.closing_cost_pct) },
    {
      label: "Property value",
      value: p(e.deal_terms.property_value)
    },
    {
      label: "Upfront payment",
      value: p(e.deal_terms.upfront_payment)
    },
    {
      label: "Monthly payment",
      value: p(e.deal_terms.monthly_payment)
    },
    {
      label: "Number of payments",
      value: `${e.deal_terms.number_of_payments}`
    },
    {
      label: "Target exit window",
      value: `${e.deal_terms.target_exit_window_start_year}–${e.deal_terms.target_exit_window_end_year} yr`
    },
    {
      label: "Long-stop year",
      value: `${e.deal_terms.long_stop_year} yr`
    }
  ];
  return e.scenario.fmv_override != null && t.push({
    label: "FMV override",
    value: p(e.scenario.fmv_override)
  }), t;
}
function gn(e, t, n) {
  switch (e) {
    case "cash_flow":
      return _n(n);
    case "ownership":
      return fn(t, n);
    case "protections":
      return yn(t, n);
    case "fees":
      return hn(t, n);
    case "assumptions":
      return bn(t);
  }
}
function En({
  persona: e,
  status: t,
  inputs: n,
  results: r
}) {
  const [o, c] = M("cash_flow"), i = pn(r, n), _ = gn(o, n, r);
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
        /* @__PURE__ */ s(
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
            children: [
              /* @__PURE__ */ a("h2", { style: { margin: 0, fontSize: 17, color: "#111827" }, children: "Deal Snapshot" }),
              t && /* @__PURE__ */ a("span", { style: { fontSize: 11, color: "#9ca3af" }, children: t })
            ]
          }
        ),
        /* @__PURE__ */ a("div", { style: { padding: "14px 18px" }, children: /* @__PURE__ */ a(cn, { items: i }) }),
        /* @__PURE__ */ a("div", { style: { padding: "0 18px 14px" }, children: /* @__PURE__ */ a(un, { results: r }) }),
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
              children: dn.map((d) => /* @__PURE__ */ a(
                "button",
                {
                  type: "button",
                  onClick: () => c(d.key),
                  style: {
                    padding: "9px 14px",
                    border: "none",
                    borderBottom: o === d.key ? "2px solid #111827" : "2px solid transparent",
                    background: "none",
                    fontSize: 12,
                    fontWeight: o === d.key ? 600 : 400,
                    color: o === d.key ? "#111827" : "#6b7280",
                    cursor: "pointer",
                    fontFamily: "system-ui, sans-serif",
                    whiteSpace: "nowrap"
                  },
                  children: d.label
                },
                d.key
              ))
            }
          ),
          /* @__PURE__ */ a("div", { style: { padding: "14px 18px" }, children: /* @__PURE__ */ a(mn, { rows: _ }) })
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
function Cn({ value: e, anchors: t, onCommit: n, parseRaw: r }) {
  const [o, c] = M(""), [i, _] = M(!1), d = t.some((v) => v.value === e), h = z(
    (v) => {
      _(!1), c(""), n(v);
    },
    [n]
  ), x = z(() => {
    _(!0);
  }, []), w = z((v) => {
    c(v);
  }, []), y = z(() => {
    if (!o) {
      _(!1);
      return;
    }
    const E = (r ?? ((L) => parseFloat(L.replace(/,/g, ""))))(o);
    Number.isFinite(E) && n(E), _(!1);
  }, [o, n, r]), u = i ? o : d ? "" : String(e);
  return {
    isAnchorMatch: d && !i,
    displayCustom: u,
    selectAnchor: h,
    focusCustom: x,
    changeCustom: w,
    blurCustom: y
  };
}
export {
  ae as CONTRACT_VERSION,
  en as DealEditModal,
  cn as DealKpiStrip,
  En as DealSnapshotView,
  xt as EquityChart,
  un as EquityTransferChart,
  k as FEE_DEFAULTS,
  An as FractPathCalculatorWidget,
  Fn as MARKETING_PERSONAS,
  re as SCHEMA_VERSION,
  _t as buildChartSeries,
  Pn as buildDraftSnapshot,
  Rt as buildFullDealSnapshotV1,
  Mn as buildSavePayload,
  Rn as buildShareSummary,
  pt as computeScenario,
  oe as deterministicHash,
  Q as getLabel,
  Sn as getPersonaConfig,
  kn as getSummaryOrder,
  st as normalizeInputs,
  Mt as resolvePersonaPresentation,
  Cn as useKioskInput
};
