import { jsx as a, jsxs as s, Fragment as ye } from "react/jsx-runtime";
import { useMemo as $, useState as F, useRef as se, useEffect as ne, useCallback as z } from "react";
import { createPortal as je } from "react-dom";
function O(e) {
  return Math.round((e + Number.EPSILON) * 100) / 100;
}
const Ye = "11.0.0";
function _e(e, t) {
  const n = Math.floor(t.exit_year * 12), o = Math.min(e.number_of_payments, n), r = O(e.upfront_payment + e.monthly_payment * e.number_of_payments), c = O(e.upfront_payment + e.monthly_payment * o), i = r > 0 ? c / r : 0, m = e.property_value > 0 ? r / e.property_value : 0, u = m * i, b = O(t.fmv_override !== void 0 && t.fmv_override !== null && t.fmv_override > 0 ? t.fmv_override : e.property_value * Math.pow(1 + t.annual_appreciation, t.exit_year)), v = c, S = Math.max(0, b - e.property_value), y = O(S * u), d = O(v + y), w = O(Math.min(Math.max(r * e.setup_fee_pct, e.setup_fee_floor), e.setup_fee_cap)), A = n, B = O(w + e.servicing_fee_monthly * A + e.payment_admin_fee * o + e.exit_admin_fee_amount), L = O(d + e.exit_admin_fee_amount), P = He(e, t.exit_year), V = O(Ue(L, P, e)), M = Ge(e, V), Y = e.buyer_purchase_option_enabled ? O(b - d) : null, f = Ke(e, o);
  return {
    total_scheduled_buyer_funding: r,
    actual_buyer_funding_to_date: c,
    funding_completion_factor: i,
    scheduled_buyer_appreciation_share: m,
    effective_buyer_appreciation_share: u,
    buyer_base_capital_component: v,
    buyer_appreciation_claim: y,
    current_contract_value: b,
    current_participation_value: d,
    base_buyout_amount: L,
    extension_adjusted_buyout_amount: V,
    partial_buyout_amount_25: M[25],
    partial_buyout_amount_50: M[50],
    partial_buyout_amount_75: M[75],
    discount_purchase_price: Y,
    current_window: P,
    fractpath_setup_fee_amount: w,
    fractpath_revenue_to_date: B,
    realtor_fee_total_projected: f,
    compute_version: Ye
  };
}
function He(e, t) {
  return t < e.target_exit_window_start_year ? "pre_target" : t <= e.target_exit_window_end_year ? "target_exit" : t > e.long_stop_year ? "post_long_stop" : t >= e.first_extension_start_year && t <= e.first_extension_end_year ? "first_extension" : t >= e.second_extension_start_year && t <= e.second_extension_end_year ? "second_extension" : "post_long_stop";
}
function Ue(e, t, n) {
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
function qe(e, t, n) {
  if (e < t || n <= 0)
    return !1;
  const o = e / n;
  return Math.abs(o - Math.round(o)) < 1e-9;
}
function Ge(e, t) {
  if (!e.partial_buyout_allowed)
    return { 25: null, 50: null, 75: null };
  const n = [25, 50, 75], o = { 25: null, 50: null, 75: null };
  for (const r of n) {
    const c = r / 100;
    qe(c, e.partial_buyout_min_fraction, e.partial_buyout_increment_fraction) && (o[r] = O(t * c));
  }
  return o;
}
function Ke(e, t) {
  return e.realtor_representation_mode === "NONE" || e.realtor_commission_pct === 0 ? 0 : O((e.upfront_payment + e.monthly_payment * t) * e.realtor_commission_pct);
}
const Xe = 0.03, Je = 0.035, Qe = 0.045, Ze = 0.025, et = 1.1, tt = 2, nt = 0.01, at = 0.03, ot = 0.1, rt = 25e-4, he = {
  homeValue: 6e5,
  initialBuyAmount: 1e5,
  termYears: 10,
  annualGrowthRate: Xe,
  transferFeeRate_standard: Je,
  transferFeeRate_early: Qe,
  transferFeeRate_late: Ze,
  floorMultiple: et,
  capMultiple: tt,
  vesting: {
    upfrontEquityPct: ot,
    monthlyEquityPct: rt,
    months: 120
  },
  cpw: {
    startPct: nt,
    endPct: at
  }
}, x = {
  setup_fee_pct: 0.023,
  setup_fee_floor: 1750,
  setup_fee_cap: 18e3,
  servicing_fee_monthly: 59,
  payment_admin_fee: 4,
  exit_admin_fee_amount: 4500,
  first_extension_premium_pct: 0.06,
  second_extension_premium_pct: 0.12
}, it = (e, t, n) => Math.min(n, Math.max(t, e));
function lt(e) {
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
function st(e, t, n) {
  const o = n / 12;
  return e * Math.pow(1 + t, o);
}
function ct(e, t, n) {
  return it(e + t * n, 0, 1);
}
function ut(e, t) {
  const n = [];
  for (let o = 0; o <= t; o++) {
    const r = st(e.homeValue, e.annualGrowthRate, o), c = ct(
      e.vesting.upfrontEquityPct,
      e.vesting.monthlyEquityPct,
      o
    );
    n.push({
      month: o,
      year: o / 12,
      homeValue: r,
      equityPct: c
    });
  }
  return n;
}
function pe(e, t) {
  const n = e.vesting.months;
  return t === "standard" ? n : t === "early" ? Math.min(36, n) : t === "late" ? n + 24 : n;
}
function dt(e) {
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
    first_extension_premium_pct: x.first_extension_premium_pct,
    second_extension_start_year: t + 4,
    second_extension_end_year: t + 5,
    second_extension_premium_pct: x.second_extension_premium_pct,
    partial_buyout_allowed: !1,
    partial_buyout_min_fraction: 0.25,
    partial_buyout_increment_fraction: 0.25,
    buyer_purchase_option_enabled: !1,
    buyer_purchase_notice_days: 90,
    buyer_purchase_closing_days: 60,
    setup_fee_pct: x.setup_fee_pct,
    setup_fee_floor: x.setup_fee_floor,
    setup_fee_cap: x.setup_fee_cap,
    servicing_fee_monthly: x.servicing_fee_monthly,
    payment_admin_fee: x.payment_admin_fee,
    exit_admin_fee_amount: x.exit_admin_fee_amount,
    realtor_representation_mode: "NONE",
    realtor_commission_pct: 0
  };
}
function be(e, t) {
  const n = pe(e, t), o = n / 12, r = dt(e), c = _e(r, {
    annual_appreciation: e.annualGrowthRate,
    exit_year: o
  }), i = r.property_value * Math.pow(1 + e.annualGrowthRate, o), m = c.base_buyout_amount, u = c.extension_adjusted_buyout_amount;
  return {
    timing: t,
    settlementMonth: n,
    homeValueAtSettlement: i,
    equityPctAtSettlement: c.funding_completion_factor,
    rawPayout: m,
    clampedPayout: u,
    transferFeeAmount: 0,
    netPayout: u,
    clamp: { floor: 0, cap: 0, applied: "none" },
    transferFeeRate: 0
  };
}
function mt(e = {}) {
  const t = lt(e), n = Math.max(
    pe(t, "standard"),
    pe(t, "early"),
    pe(t, "late")
  ), o = ut(t, n), r = be(t, "standard"), c = be(t, "early"), i = be(t, "late");
  return {
    normalizedInputs: t,
    series: o,
    settlements: { standard: r, early: c, late: i }
  };
}
function pt(e) {
  const { early: t, standard: n, late: o } = e.settlements, r = {
    year: 0,
    label: "Start",
    contractValue: 0,
    participationValue: 0,
    buyoutAmount: 0,
    discountPurchasePrice: null
  };
  function c(u, b) {
    return {
      year: Math.round(u.settlementMonth / 12 * 10) / 10,
      label: b,
      contractValue: u.rawPayout,
      participationValue: u.rawPayout,
      buyoutAmount: u.netPayout,
      discountPurchasePrice: null
    };
  }
  const i = [
    r,
    c(t, "Early exit"),
    c(n, "Target exit"),
    c(o, "Late exit")
  ], m = [
    {
      timing: "early",
      year: Math.round(t.settlementMonth / 12 * 10) / 10,
      buyoutAmount: t.netPayout
    },
    {
      timing: "standard",
      year: Math.round(n.settlementMonth / 12 * 10) / 10,
      buyoutAmount: n.netPayout
    },
    {
      timing: "late",
      year: Math.round(o.settlementMonth / 12 * 10) / 10,
      buyoutAmount: o.netPayout
    }
  ];
  return { points: i, markers: m };
}
function _t(e, t, n) {
  return Math.min(n, Math.max(t, e));
}
function ft(e) {
  return e >= 1e6 ? `$${(e / 1e6).toFixed(1)}M` : e >= 1e3 ? `$${Math.round(e / 1e3)}k` : `$${Math.round(e)}`;
}
function yt(e) {
  return `Yr ${Math.round(e)}`;
}
function ht(e) {
  return e.timing === "early" ? "Early" : e.timing === "late" ? "Late" : "Std";
}
const bt = {
  early: "#ca8a04",
  standard: "#0891b2",
  late: "#c026d3"
};
function gt({ series: e, width: t = 640, height: n = 260 }) {
  const { points: o, markers: r } = e, c = $(
    () => `cv-${Math.random().toString(36).slice(2, 8)}`,
    []
  );
  if (!o.length)
    return /* @__PURE__ */ a("div", { style: { fontFamily: "system-ui, sans-serif" }, children: "No data" });
  const i = { top: 24, right: 24, bottom: 40, left: 64 }, m = Math.max(10, t - i.left - i.right), u = Math.max(10, n - i.top - i.bottom), b = o.map((f) => f.year), v = Math.min(...b), S = Math.max(...b), y = o.flatMap((f) => [f.buyoutAmount, f.contractValue]), d = 0, w = Math.max(...y, 1), A = (f) => S === v ? i.left : i.left + (f - v) / (S - v) * m, B = (f) => {
    const C = _t(f, d, w);
    return i.top + (1 - (C - d) / (w - d)) * u;
  }, L = o.map((f, C) => {
    const l = A(f.year), h = B(f.buyoutAmount);
    return `${C === 0 ? "M" : "L"} ${l.toFixed(2)} ${h.toFixed(2)}`;
  }).join(" "), P = o.length * 40, V = 4, M = Array.from({ length: V + 1 }, (f, C) => {
    const l = w * C / V;
    return { v: l, y: B(l), label: ft(l) };
  }), Y = o.map((f) => ({
    year: f.year,
    x: A(f.year),
    label: f.label
  }));
  return /* @__PURE__ */ s(
    "svg",
    {
      width: "100%",
      height: n,
      viewBox: `0 0 ${t} ${n}`,
      preserveAspectRatio: "xMidYMid meet",
      role: "img",
      "aria-label": "Contract value over time",
      style: { display: "block" },
      children: [
        /* @__PURE__ */ a("style", { children: `
        @keyframes ${c}-draw {
          from { stroke-dashoffset: ${P}; }
          to { stroke-dashoffset: 0; }
        }
      ` }),
        /* @__PURE__ */ a("rect", { x: 0, y: 0, width: t, height: n, fill: "white", rx: 8 }),
        M.map((f, C) => /* @__PURE__ */ s("g", { children: [
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
              x: i.left - 8,
              y: f.y + 4,
              fontSize: 11,
              textAnchor: "end",
              fill: "#9ca3af",
              fontFamily: "system-ui, sans-serif",
              children: f.label
            }
          )
        ] }, C)),
        /* @__PURE__ */ a(
          "line",
          {
            x1: i.left,
            x2: t - i.right,
            y1: i.top + u,
            y2: i.top + u,
            stroke: "#e5e7eb",
            strokeWidth: 1
          }
        ),
        Y.map((f) => /* @__PURE__ */ s("g", { children: [
          /* @__PURE__ */ a(
            "line",
            {
              x1: f.x,
              x2: f.x,
              y1: i.top + u,
              y2: i.top + u + 5,
              stroke: "#d1d5db",
              strokeWidth: 1
            }
          ),
          /* @__PURE__ */ a(
            "text",
            {
              x: f.x,
              y: i.top + u + 20,
              fontSize: 10,
              textAnchor: "middle",
              fill: "#9ca3af",
              fontFamily: "system-ui, sans-serif",
              children: f.label
            }
          ),
          /* @__PURE__ */ a(
            "text",
            {
              x: f.x,
              y: i.top + u + 33,
              fontSize: 9,
              textAnchor: "middle",
              fill: "#d1d5db",
              fontFamily: "system-ui, sans-serif",
              children: yt(f.year)
            }
          )
        ] }, f.year)),
        r.map((f) => {
          const C = A(f.year), l = bt[f.timing] || "#d1d5db";
          return /* @__PURE__ */ s("g", { children: [
            /* @__PURE__ */ a(
              "line",
              {
                x1: C,
                x2: C,
                y1: i.top,
                y2: i.top + u,
                stroke: l,
                strokeWidth: 1,
                strokeDasharray: "4 4"
              }
            ),
            /* @__PURE__ */ a(
              "rect",
              {
                x: C - 20,
                y: i.top - 4,
                width: 40,
                height: 18,
                rx: 9,
                fill: "#f9fafb",
                stroke: l,
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
                fill: l,
                fontFamily: "system-ui, sans-serif",
                fontWeight: 600,
                children: ht(f)
              }
            )
          ] }, f.timing);
        }),
        /* @__PURE__ */ a(
          "path",
          {
            d: L,
            fill: "none",
            stroke: "#0891b2",
            strokeWidth: 2.5,
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeDasharray: P,
            strokeDashoffset: 0,
            style: {
              animation: `${c}-draw 1s ease-out forwards`
            }
          }
        ),
        o.slice(1).map((f) => /* @__PURE__ */ a(
          "circle",
          {
            cx: A(f.year),
            cy: B(f.buyoutAmount),
            r: 4,
            fill: "#0891b2",
            stroke: "white",
            strokeWidth: 2
          },
          f.year
        )),
        /* @__PURE__ */ a(
          "text",
          {
            x: i.left,
            y: 14,
            fontSize: 12,
            fill: "#6b7280",
            fontFamily: "system-ui, sans-serif",
            fontWeight: 500,
            children: "Contract Value Over Time"
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
function K(e) {
  return `${(e * 100).toFixed(1)}%`;
}
function xt(e) {
  const t = Math.floor(e / 12), n = e % 12;
  return t === 0 ? `${n}mo` : n === 0 ? `${t}yr` : `${t}yr ${n}mo`;
}
const Pe = {
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
function kn(e) {
  return Pe[e] ?? Pe.homeowner;
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
function Z(e, t, n) {
  return vt[t]?.[e] ?? n;
}
const Me = {
  homeowner: ["hero", "net_payout", "settlement_timing", "total_invested", "fees"],
  buyer: ["hero", "net_payout", "total_invested", "settlement_timing", "fees"],
  investor: ["hero", "net_payout", "total_invested", "fees", "settlement_timing"],
  realtor: ["hero", "fees", "net_payout", "settlement_timing", "total_invested"],
  ops: ["hero", "net_payout", "fees", "total_invested", "settlement_timing"]
};
function Pn(e) {
  return Me[e] ?? Me.homeowner;
}
const ae = "11.0.0", oe = "1";
function Ce(e) {
  const t = {};
  for (const n of Object.keys(e).sort()) {
    const o = e[n];
    o !== null && typeof o == "object" && !Array.isArray(o) ? t[n] = Ce(o) : t[n] = o;
  }
  return JSON.stringify(t);
}
async function re(e) {
  const t = Ce(e), n = new TextEncoder().encode(t), o = await crypto.subtle.digest("SHA-256", n);
  return Array.from(new Uint8Array(o)).map((c) => c.toString(16).padStart(2, "0")).join("");
}
function Te(e) {
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
async function Mn(e, t, n) {
  const o = Te(t), r = wt(n), [c, i] = await Promise.all([
    re(o),
    re(r)
  ]);
  return {
    contract_version: ae,
    schema_version: oe,
    persona: e,
    mode: "marketing",
    inputs: o,
    basic_results: r,
    input_hash: c,
    output_hash: i,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
}
function Rn(e, t, n) {
  return {
    contract_version: ae,
    schema_version: oe,
    persona: e,
    inputs: Te(t),
    basic_results: St(n),
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
}
async function Fn(e, t, n) {
  const [o, r] = await Promise.all([
    re(t),
    re({
      standard: n.settlements.standard,
      early: n.settlements.early,
      late: n.settlements.late
    })
  ]);
  return {
    contract_version: ae,
    schema_version: oe,
    persona: e,
    mode: "app",
    inputs: t,
    outputs: n,
    input_hash: o,
    output_hash: r,
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
    setup_fee_pct: x.setup_fee_pct,
    setup_fee_floor: x.setup_fee_floor,
    setup_fee_cap: x.setup_fee_cap,
    servicing_fee_monthly: x.servicing_fee_monthly,
    payment_admin_fee: x.payment_admin_fee,
    exit_admin_fee_amount: x.exit_admin_fee_amount,
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
function Mt(e) {
  const t = kt(e), n = Pt(e), o = _e(t, n), r = (/* @__PURE__ */ new Date()).toISOString();
  return {
    contract_version: ae,
    schema_version: oe,
    deal_terms: t,
    assumptions: n,
    outputs: o,
    now_iso: r,
    created_at: r
  };
}
function W(e, t) {
  switch (t) {
    case "currency":
      return p(e);
    case "percent":
      return K(e);
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
function Rt(e, t, n, o) {
  switch (e) {
    case "homeowner":
      return At(t, n, o);
    case "realtor":
      return Et(t, n, o);
    default:
      return Ft(t, n, o);
  }
}
function Ft(e, t, n) {
  const o = n.extension_adjusted_buyout_amount, r = n.actual_buyer_funding_to_date, c = o - r, i = xe(e, t), m = r > 0 ? o / r : 1, u = i > 0 ? n.effective_buyer_appreciation_share : 0;
  return {
    hero: {
      label: "Projected Net Return",
      value: c,
      valueFormat: "currency",
      subtitle: `Profit at standard buyout (Year ${t.exit_year}).`
    },
    strip: [
      { label: "Net payout at buyout", value: o, valueFormat: "currency" },
      { label: "Total cash paid", value: r, valueFormat: "currency" },
      { label: "Projected home value", value: i, valueFormat: "currency" },
      { label: "Effective appreciation share", value: u, valueFormat: "percent" },
      { label: "Return multiple", value: m, valueFormat: "multiple" }
    ],
    chartSpec: {
      type: "bar",
      bars: [
        { label: "Total cash paid", value: r },
        { label: "Buyout payout", value: o },
        { label: "Projected home value", value: i }
      ]
    },
    marketingBullets: [
      `~${W(u, "percent")} effective appreciation share over ${t.exit_year} years — with no financing or interest.`,
      `You contribute ${W(r, "currency")} total. At buyout, payout is ${W(o, "currency")}.`,
      `Projected home value at buyout: ${W(i, "currency")} (base assumptions).`,
      `Assumes ${W(t.annual_appreciation, "percent")} annual appreciation — Save & Continue free to model different growth and timing.`
    ]
  };
}
function At(e, t, n) {
  const o = n.actual_buyer_funding_to_date, r = xe(e, t);
  return {
    hero: {
      label: "Lifetime Cash Unlocked",
      value: o,
      valueFormat: "currency",
      subtitle: "Cash received over the deal term (upfront + installments)."
    },
    strip: [
      { label: "Upfront cash received", value: e.upfront_payment, valueFormat: "currency" },
      { label: "Monthly cash received", value: e.monthly_payment, valueFormat: "currency" },
      { label: "Installment months", value: e.number_of_payments, valueFormat: "months" },
      { label: "Total cash unlocked", value: o, valueFormat: "currency" },
      { label: "Projected home value", value: r, valueFormat: "currency" }
    ],
    chartSpec: {
      type: "bar",
      bars: [
        { label: "Cash unlocked", value: o },
        { label: "Projected home value", value: r }
      ]
    },
    marketingBullets: [
      `Unlock ${W(o, "currency")} while continuing to own your home.`,
      `Upfront: ${W(e.upfront_payment, "currency")}. Monthly: ${W(e.monthly_payment, "currency")} for ${e.number_of_payments} months.`,
      `Projected home value at buyout: ${W(r, "currency")} (base assumptions).`,
      `Assumes ${W(t.annual_appreciation, "percent")} annual appreciation — Save & Continue free to model growth, protections, and timing.`
    ]
  };
}
function Et(e, t, n) {
  const o = n.realtor_fee_total_projected, r = n.extension_adjusted_buyout_amount, i = xe(e, t) - r, m = e.realtor_commission_pct * 100;
  return {
    hero: {
      label: "Projected Commission (Standard)",
      value: o,
      valueFormat: "currency",
      subtitle: `Based on ${m.toFixed(1)}% as ${e.realtor_representation_mode} representation.`
    },
    strip: [
      { label: "Commission rate", value: `${m.toFixed(1)}%`, valueFormat: "text" },
      { label: "Representation", value: e.realtor_representation_mode, valueFormat: "text" },
      { label: "Commission from this deal", value: o, valueFormat: "currency" },
      {
        label: "Remaining opportunity",
        value: i > 0 ? i : 0,
        valueFormat: "currency"
      }
    ],
    chartSpec: {
      type: "bar",
      bars: [
        { label: "Commission on this deal", value: o },
        { label: "Remaining opportunity", value: i > 0 ? i : 0 }
      ]
    },
    marketingBullets: [
      `Projected commission on this deal: ${W(o, "currency")} (standard timing).`,
      `Commission rate: ${m.toFixed(1)}% as ${e.realtor_representation_mode} representation.`,
      "Capture buyers and sellers earlier — without requiring an immediate full sale or full purchase.",
      `Remaining property value at buyout (conditional): ${W(i > 0 ? i : 0, "currency")}. Save free to model scenarios.`
    ]
  };
}
const Re = ["#0891b2", "#c026d3", "#ca8a04", "#6b7280", "#374151"];
function Ct({ bars: e, width: t = 400, height: n = 220 }) {
  const o = Math.max(...e.map((v) => v.value), 1), r = Math.min(80, (t - 60) / e.length - 20), c = 36, i = n - 44, m = i - c, u = (t - 40) / e.length, b = `bar-anim-${Math.random().toString(36).slice(2, 8)}`;
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
        @keyframes ${b} {
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
        e.map((v, S) => {
          const y = o > 0 ? v.value / o * m : 0, d = 20 + S * u + (u - r) / 2, w = i - y, A = Re[S % Re.length];
          return /* @__PURE__ */ s("g", { children: [
            /* @__PURE__ */ a(
              "rect",
              {
                x: d,
                y: w,
                width: r,
                height: Math.max(y, 2),
                rx: 6,
                ry: 6,
                fill: A,
                style: {
                  transformOrigin: `${d + r / 2}px ${i}px`,
                  animation: `${b} 0.5s ease-out ${S * 0.1}s both`
                }
              }
            ),
            /* @__PURE__ */ a(
              "text",
              {
                x: d + r / 2,
                y: w - 10,
                textAnchor: "middle",
                fontSize: 11,
                fontWeight: 600,
                fill: "#111827",
                fontFamily: "system-ui, sans-serif",
                children: p(v.value)
              }
            ),
            /* @__PURE__ */ a(
              "text",
              {
                x: d + r / 2,
                y: i + 18,
                textAnchor: "middle",
                fontSize: 10,
                fill: "#6b7280",
                fontFamily: "system-ui, sans-serif",
                children: v.label.length > 20 ? v.label.slice(0, 18) + "…" : v.label
              }
            )
          ] }, S);
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
      { label: "6%", value: 0.06 },
      { label: "10%", value: 0.1 }
    ],
    recommendedRange: { min: 0, max: 0.12 },
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
    recommendedRange: { min: 0, max: 5e3 },
    hardRange: { min: 0, max: 1e4 },
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
  return n ? n.percents.map((o) => {
    let r = o * t;
    n.maxPercentOfSource != null && (r = Math.min(r, n.maxPercentOfSource * t));
    const c = Math.round(r / 100) * 100, i = n.min != null ? Math.max(n.min, c) : c;
    return { label: p(i), value: i };
  }) : e.anchors ?? [];
}
const Fe = [
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
  const t = {}, { deal_terms: n, scenario: o } = e;
  return n.property_value <= 0 && (t["deal_terms.property_value"] = "Property value must be greater than 0"), n.upfront_payment < 0 && (t["deal_terms.upfront_payment"] = "Upfront payment cannot be negative"), n.monthly_payment < 0 && (t["deal_terms.monthly_payment"] = "Monthly payment cannot be negative"), n.number_of_payments < 0 && (t["deal_terms.number_of_payments"] = "Number of payments cannot be negative"), o.exit_year <= 0 && (t["scenario.exit_year"] = "Exit year must be greater than 0"), (o.annual_appreciation < -0.5 || o.annual_appreciation > 0.5) && (t["scenario.annual_appreciation"] = "Annual appreciation must be between -50% and 50%"), n.realtor_commission_pct !== void 0 && (n.realtor_commission_pct < 0 || n.realtor_commission_pct > 0.06) && (t["deal_terms.realtor_commission_pct"] = "Realtor commission must be between 0% and 6%"), n.realtor_representation_mode === "NONE" && n.realtor_commission_pct !== void 0 && n.realtor_commission_pct !== 0 && (t["deal_terms.realtor_commission_pct"] = "Commission must be 0% when representation mode is NONE"), t;
}
function De(e) {
  return Object.keys(e).length > 0;
}
const ze = {
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
}, $t = {
  ...ze,
  border: "2px solid #111827",
  background: "#111827",
  color: "#fff"
};
function Nt({
  value: e,
  anchors: t,
  unit: n,
  onSelectAnchor: o,
  customValue: r,
  onChangeCustom: c,
  onBlurCustom: i,
  disabled: m,
  error: u
}) {
  const b = t.some((d) => d.value === e), v = n === "currency" || n === "number" || n === "months" || n === "years" ? "numeric" : "decimal", S = n === "currency" ? "$" : "", y = n === "percent" ? "%" : n === "years" ? " yr" : n === "months" ? " mo" : "";
  return /* @__PURE__ */ s("div", { children: [
    /* @__PURE__ */ a("div", { style: { display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }, children: t.map((d) => /* @__PURE__ */ a(
      "button",
      {
        type: "button",
        disabled: m,
        onClick: () => o(d.value),
        style: {
          ...d.value === e ? $t : ze,
          opacity: m ? 0.5 : 1,
          cursor: m ? "not-allowed" : "pointer"
        },
        children: d.label
      },
      d.label
    )) }),
    /* @__PURE__ */ s("div", { style: { position: "relative" }, children: [
      S && /* @__PURE__ */ a(
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
          children: S
        }
      ),
      /* @__PURE__ */ a(
        "input",
        {
          type: "text",
          inputMode: v,
          disabled: m,
          value: b ? "" : r,
          placeholder: b ? "Custom" : "",
          onChange: (d) => c(d.target.value),
          onBlur: i,
          style: {
            width: "100%",
            padding: S ? "7px 10px 7px 22px" : "7px 10px",
            border: u ? "1px solid #ef4444" : "1px solid #d1d5db",
            borderRadius: 6,
            fontSize: 13,
            fontFamily: "system-ui, sans-serif",
            boxSizing: "border-box",
            background: m ? "#f3f4f6" : "#fff",
            color: m ? "#9ca3af" : "#111827"
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
    u && /* @__PURE__ */ a("div", { style: { color: "#ef4444", fontSize: 11, marginTop: 3 }, children: u })
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
function Bt({ tier1: e, status: t, error: n }) {
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
function ue({ simpleDefinition: e, impact: t }) {
  const [n, o] = F(!1), r = se(null), c = se(null);
  ne(() => {
    if (!n) return;
    function u(b) {
      r.current && !r.current.contains(b.target) && c.current && !c.current.contains(b.target) && o(!1);
    }
    return document.addEventListener("mousedown", u), () => document.removeEventListener("mousedown", u);
  }, [n]);
  const [i, m] = F({ top: 0, left: 0 });
  return ne(() => {
    if (!n || !r.current) return;
    const u = r.current.getBoundingClientRect();
    m({
      top: u.top + window.scrollY - 8,
      left: u.left + u.width / 2 + window.scrollX
    });
  }, [n]), /* @__PURE__ */ s("span", { style: { display: "inline-block", marginLeft: 4 }, children: [
    /* @__PURE__ */ a(
      "button",
      {
        ref: r,
        type: "button",
        onClick: () => o((u) => !u),
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
    n && je(
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
function It(e, t, n) {
  const o = t === "homeowner" ? "receive" : "pay";
  switch (e) {
    case "payments": {
      const r = [];
      return n.upfrontPayment != null && r.push(`You ${o} ${p(n.upfrontPayment)} upfront at closing.`), n.monthlyPayment != null && n.numberOfPayments != null && n.numberOfPayments > 0 && r.push(
        `Then ${p(n.monthlyPayment)}/mo for ${n.numberOfPayments} months.`
      ), r.length === 0 && r.push("The upfront amount is set at closing. Monthly installments, if any, follow."), r.push("These amounts make up the total scheduled buyer funding."), r;
    }
    case "ownership": {
      const r = [];
      return n.contractMaturityYears != null && r.push(`The contract lasts up to ${n.contractMaturityYears} years.`), n.minimumHoldYears != null && r.push(`Earliest allowed buyout is at year ${n.minimumHoldYears}.`), n.exitYear != null && r.push(`Expected buyout is at year ${n.exitYear}.`), r.length === 0 && r.push("This tab controls how long the deal lasts and when buyout can happen."), r;
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
      const r = [];
      return n.setupFeePct != null && r.push(`Setup fee: ${K(n.setupFeePct)} of upfront payment at closing.`), n.servicingFeeMonthly != null && r.push(`Monthly servicing: ${p(n.servicingFeeMonthly)}/mo for account management.`), n.exitAdminFeeAmount != null && r.push(`Exit admin fee: ${p(n.exitAdminFeeAmount)} flat at settlement.`), r.length === 0 && r.push("Fees include a setup fee at closing, monthly servicing, and an exit admin fee at settlement."), t === "realtor" && r.push("Realtor commission is tracked separately below."), r;
    }
    default:
      return [];
  }
}
function Lt(e, t) {
  if (t === "__disclosure__") return null;
  const [n, o] = t.split(".");
  return e[n][o];
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
}, Yt = {
  background: "#fff",
  borderRadius: 12,
  width: "min(680px, 95vw)",
  height: "min(85vh, 720px)",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 8px 32px rgba(0,0,0,0.18)"
}, Ht = {
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
  persona: o,
  permissions: r,
  setField: c,
  onBlurCompute: i,
  onSave: m,
  onClose: u
}) {
  const [b, v] = F("payments"), [S, y] = F({}), d = $(() => {
    const l = /* @__PURE__ */ new Map();
    for (const h of Tt) l.set(h.key, h);
    return l;
  }, []), w = !De(t) && o !== "realtor" && r?.canEdit !== !1, A = z(
    (l, h) => {
      if (c(l, h), y((g) => ({ ...g, [l]: "" })), l !== "deal_terms.realtor_representation_mode") {
        if (l === "deal_terms.realtor_commission_pct") {
          i();
          return;
        }
        i();
      }
    },
    [c, i]
  ), B = z(
    (l, h) => {
      if (l === "deal_terms.partial_buyout_allowed") {
        c(l, h === "true"), i();
        return;
      }
      if (c(l, h), l === "deal_terms.realtor_representation_mode") {
        h === "NONE" && c("deal_terms.realtor_commission_pct", 0), i();
        return;
      }
      i();
    },
    [c, i]
  ), L = z(
    (l, h) => {
      y((g) => ({ ...g, [l]: h }));
    },
    []
  ), P = z(
    (l, h) => {
      const g = S[l];
      if (g === void 0 || g === "") return;
      let D;
      h.unit === "percent" ? D = parseFloat(g) / 100 : D = parseFloat(g.replace(/,/g, "")), Number.isFinite(D) && (h.hardRange && (D = Math.max(h.hardRange.min, Math.min(h.hardRange.max, D))), c(l, D), i());
    },
    [S, c, i]
  ), V = z(() => {
    w && (m(e), u());
  }, [w, e, m, u]), M = (l) => l === "deal_terms.realtor_commission_pct" ? e.deal_terms.realtor_representation_mode === "NONE" : !1, Y = (l, h) => l == null ? "—" : h.unit === "percent" ? `${(l * 100).toFixed(2)}%` : h.unit === "currency" ? p(l) : h.unit === "years" ? `${l} yr` : h.unit === "months" ? `${l} mo` : typeof l == "boolean" ? l ? "Yes" : "No" : String(l), f = (l) => {
    const h = l.key, g = Lt(e, h), D = t[h], E = l.readOnly || M(h), X = Z(h, o, l.label);
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
        h
      );
    if (l.control === "enum") {
      const R = l.options ?? [], J = h === "deal_terms.partial_buyout_allowed" ? String(g) : g;
      return /* @__PURE__ */ s("div", { style: { marginBottom: 14 }, children: [
        /* @__PURE__ */ s("label", { style: de, children: [
          X,
          /* @__PURE__ */ a(ue, { simpleDefinition: l.simpleDefinition, impact: l.impact })
        ] }),
        /* @__PURE__ */ a(
          "select",
          {
            value: J,
            disabled: E,
            onChange: (T) => B(h, T.target.value),
            style: {
              ...qt,
              background: E ? "#f3f4f6" : "#fff",
              color: E ? "#9ca3af" : "#111827"
            },
            children: R.map((T) => /* @__PURE__ */ a("option", { value: T.value, children: T.label }, T.value))
          }
        ),
        D && /* @__PURE__ */ a("div", { style: Ae, children: D })
      ] }, h);
    }
    if (l.control === "readonly")
      return /* @__PURE__ */ s("div", { style: { marginBottom: 14 }, children: [
        /* @__PURE__ */ s("label", { style: de, children: [
          X,
          /* @__PURE__ */ a(ue, { simpleDefinition: l.simpleDefinition, impact: l.impact })
        ] }),
        /* @__PURE__ */ a("div", { style: Gt, children: Y(g, l) })
      ] }, h);
    if (l.control === "slider" && l.slider)
      return /* @__PURE__ */ s("div", { style: { marginBottom: 14 }, children: [
        /* @__PURE__ */ s("label", { style: de, children: [
          X,
          /* @__PURE__ */ a(ue, { simpleDefinition: l.simpleDefinition, impact: l.impact })
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
              disabled: E,
              onChange: (R) => c(h, parseFloat(R.target.value)),
              onMouseUp: i,
              onTouchEnd: i,
              style: { flex: 1 }
            }
          ),
          /* @__PURE__ */ a("span", { style: { fontSize: 13, fontWeight: 600, minWidth: 80, textAlign: "right" }, children: Y(g, l) })
        ] }),
        D && /* @__PURE__ */ a("div", { style: Ae, children: D })
      ] }, h);
    if (l.control === "kiosk") {
      const R = Vt(l, e), J = R.length >= 4 ? [R[0], R[1], R[2], R[3]] : [
        R[0] ?? { label: "—", value: 0 },
        R[1] ?? { label: "—", value: 0 },
        R[2] ?? { label: "—", value: 0 },
        R[3] ?? { label: "—", value: 0 }
      ];
      let T = S[h] ?? "";
      return !T && !J.some((H) => H.value === g) && (l.unit === "percent" ? T = (g * 100).toString() : T = String(g)), /* @__PURE__ */ s("div", { style: { marginBottom: 14 }, children: [
        /* @__PURE__ */ s("label", { style: de, children: [
          X,
          /* @__PURE__ */ a(ue, { simpleDefinition: l.simpleDefinition, impact: l.impact })
        ] }),
        /* @__PURE__ */ a(
          Nt,
          {
            value: g,
            anchors: J,
            unit: l.unit,
            onSelectAnchor: (H) => A(h, H),
            customValue: T,
            onChangeCustom: (H) => L(h, H),
            onBlurCustom: () => P(h, l),
            disabled: E,
            error: D
          }
        )
      ] }, h);
    }
    return null;
  }, C = Fe.find((l) => l.key === b);
  return /* @__PURE__ */ a("div", { style: jt, onClick: (l) => {
    l.target === l.currentTarget && u();
  }, children: /* @__PURE__ */ s("div", { style: Yt, role: "dialog", "aria-modal": "true", "data-testid": "deal-edit-modal", children: [
    /* @__PURE__ */ a("div", { style: { padding: "16px 20px 0", borderBottom: "none" }, children: /* @__PURE__ */ s("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
      /* @__PURE__ */ a("h2", { style: { margin: 0, fontSize: 18, color: "#111827" }, children: "Edit Deal Terms" }),
      /* @__PURE__ */ a(
        "button",
        {
          type: "button",
          onClick: u,
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
    /* @__PURE__ */ a("div", { style: Ht, children: Fe.map((l) => /* @__PURE__ */ a(
      "button",
      {
        type: "button",
        onClick: () => v(l.key),
        style: {
          padding: "10px 16px",
          border: "none",
          borderBottom: b === l.key ? "2px solid #111827" : "2px solid transparent",
          background: "none",
          fontSize: 13,
          fontWeight: b === l.key ? 600 : 400,
          color: b === l.key ? "#111827" : "#6b7280",
          cursor: "pointer",
          fontFamily: "system-ui, sans-serif",
          whiteSpace: "nowrap"
        },
        children: l.label
      },
      l.key
    )) }),
    /* @__PURE__ */ a("div", { style: { flex: 1, overflow: "auto", padding: "16px 20px" }, children: /* @__PURE__ */ s("div", { style: { display: "grid", gridTemplateColumns: "1fr 220px", gap: 20 }, children: [
      /* @__PURE__ */ a("div", { children: C.sections.map((l) => /* @__PURE__ */ s("div", { style: { marginBottom: 20 }, children: [
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
        l.fieldKeys.map((h) => {
          const g = d.get(h);
          return g ? f(g) : null;
        })
      ] }, l.label)) }),
      /* @__PURE__ */ s("div", { children: [
        /* @__PURE__ */ a(
          Bt,
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
              /* @__PURE__ */ a("ul", { style: { margin: 0, padding: "0 0 0 14px", fontSize: 11, lineHeight: 1.6, color: "#374151" }, children: It(b, o, {
                upfrontPayment: e.deal_terms.upfront_payment,
                monthlyPayment: e.deal_terms.monthly_payment,
                numberOfPayments: e.deal_terms.number_of_payments,
                contractMaturityYears: e.deal_terms.contract_maturity_years,
                minimumHoldYears: e.deal_terms.minimum_hold_years,
                exitYear: e.scenario.exit_year,
                setupFeePct: e.deal_terms.setup_fee_pct,
                servicingFeeMonthly: e.deal_terms.servicing_fee_monthly,
                exitAdminFeeAmount: e.deal_terms.exit_admin_fee_amount
              }).map((l, h) => /* @__PURE__ */ a("li", { style: { marginBottom: 2 }, children: l }, h)) })
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
              onClick: u,
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
              onClick: V,
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
const de = {
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
}, Ae = {
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
      first_extension_premium_pct: x.first_extension_premium_pct,
      second_extension_start_year: 11,
      second_extension_end_year: 15,
      second_extension_premium_pct: x.second_extension_premium_pct,
      partial_buyout_allowed: !1,
      partial_buyout_min_fraction: 0.25,
      partial_buyout_increment_fraction: 0.25,
      buyer_purchase_option_enabled: !1,
      buyer_purchase_notice_days: 90,
      buyer_purchase_closing_days: 60,
      setup_fee_pct: x.setup_fee_pct,
      setup_fee_floor: x.setup_fee_floor,
      setup_fee_cap: x.setup_fee_cap,
      servicing_fee_monthly: x.servicing_fee_monthly,
      payment_admin_fee: x.payment_admin_fee,
      exit_admin_fee_amount: x.exit_admin_fee_amount,
      realtor_representation_mode: "NONE",
      realtor_commission_pct: 0
    },
    scenario: {
      annual_appreciation: 0.04,
      closing_cost_pct: 0.02,
      exit_year: 7
    }
  };
}
function me(e) {
  const { upfront_payment: t, monthly_payment: n, number_of_payments: o } = e.deal_terms, { exit_year: r } = e.scenario, c = Math.floor(r * 12), i = Math.min(o, c), m = n * i, u = t + m, b = i === 0 ? "No installments" : `${i} payments of ${p(n)}`;
  return {
    upfrontCash: t,
    installmentsLabel: b,
    totalInstallments: m,
    totalCashPaid: u
  };
}
function Kt(e) {
  return _e(e.deal_terms, e.scenario);
}
function Xt(e, t, n) {
  const o = structuredClone(e), [r, c] = t.split(".");
  return o[r][c] = n, o;
}
function Jt(e) {
  const [t, n] = F(
    () => e ?? ge()
  ), [o, r] = F({}), [c, i] = F(() => ({
    tier1: me(e ?? ge()),
    status: "idle"
  })), m = z((v, S) => {
    n((y) => {
      const d = Xt(y, v, S);
      return i((w) => ({ ...w, tier1: me(d) })), d;
    });
  }, []), u = z(() => {
    n((v) => {
      const S = zt(v);
      if (r(S), De(S))
        return i((y) => ({
          ...y,
          status: "error",
          error: "Validation failed"
        })), v;
      i((y) => ({ ...y, status: "computing" }));
      try {
        const y = Kt(v);
        i({
          tier1: me(v),
          status: "ok",
          lastComputedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
          results: y
        });
      } catch (y) {
        i((d) => ({
          ...d,
          status: "error",
          error: y instanceof Error ? y.message : "Compute failed"
        }));
      }
      return v;
    });
  }, []), b = $(() => me(t), [t]);
  return {
    draft: t,
    errors: o,
    preview: { ...c, tier1: b },
    setField: m,
    onBlurCompute: u
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
    first_extension_premium_pct: x.first_extension_premium_pct,
    second_extension_start_year: t + 4,
    second_extension_end_year: t + 5,
    second_extension_premium_pct: x.second_extension_premium_pct,
    partial_buyout_allowed: !1,
    partial_buyout_min_fraction: 0.25,
    partial_buyout_increment_fraction: 0.25,
    buyer_purchase_option_enabled: !1,
    buyer_purchase_notice_days: 90,
    buyer_purchase_closing_days: 60,
    setup_fee_pct: x.setup_fee_pct,
    setup_fee_floor: x.setup_fee_floor,
    setup_fee_cap: x.setup_fee_cap,
    servicing_fee_monthly: x.servicing_fee_monthly,
    payment_admin_fee: x.payment_admin_fee,
    exit_admin_fee_amount: x.exit_admin_fee_amount,
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
const An = [
  "buyer",
  "homeowner",
  "realtor"
];
function en(e) {
  const t = $(() => {
    const m = ge();
    return {
      ...m,
      ...e.initial,
      deal_terms: {
        ...m.deal_terms,
        ...e.initial?.deal_terms ?? {}
      },
      scenario: {
        ...m.scenario,
        ...e.initial?.scenario ?? {}
      }
    };
  }, [e.initial]), { draft: n, errors: o, preview: r, setField: c, onBlurCompute: i } = Jt(t);
  return /* @__PURE__ */ a(
    Ut,
    {
      draft: n,
      errors: o,
      preview: r,
      persona: e.persona,
      setField: c,
      onBlurCompute: i,
      onSave: (m) => e.onSaved(m),
      onClose: e.onClose
    }
  );
}
function tn(e = 640) {
  const [t, n] = F(!1);
  return ne(() => {
    if (typeof window > "u") return;
    const o = window.matchMedia(`(max-width: ${e}px)`);
    n(o.matches);
    const r = (c) => n(c.matches);
    return o.addEventListener("change", r), () => o.removeEventListener("change", r);
  }, [e]), t;
}
function nn({ value: e, format: t }) {
  const n = se(null), o = se(e), r = se(0);
  ne(() => {
    const i = o.current, m = e;
    if (o.current = m, i === m || !n.current) return;
    const u = 300, b = performance.now(), v = (S) => {
      const y = S - b, d = Math.min(y / u, 1), w = 1 - Math.pow(1 - d, 3), A = i + (m - i) * w;
      n.current && (t === "currency" ? n.current.textContent = p(A) : t === "percent" ? n.current.textContent = K(A) : n.current.textContent = A.toLocaleString(void 0, { maximumFractionDigits: 1 })), d < 1 && (r.current = requestAnimationFrame(v));
    };
    return r.current = requestAnimationFrame(v), () => cancelAnimationFrame(r.current);
  }, [e, t]);
  let c;
  return t === "currency" ? c = p(e) : t === "percent" ? c = K(e) : c = e.toLocaleString(void 0, { maximumFractionDigits: 1 }), /* @__PURE__ */ a("span", { ref: n, children: c });
}
function an() {
  if (typeof window > "u") return !1;
  try {
    return new URLSearchParams(window.location.search).get("DEV_HARNESS") === "true" || !1;
  } catch {
    return !1;
  }
}
function on() {
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
function Ee(e, t) {
  if (typeof e == "string") return e;
  switch (t) {
    case "currency":
      return p(e);
    case "percent":
      return K(e);
    case "multiple":
      return `${e.toFixed(2)}×`;
    case "months":
      return `${e}`;
    default:
      return String(e);
  }
}
function rn(e) {
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
    canEdit: o,
    onEvent: r,
    onDraftSnapshot: c,
    onShareSummary: i,
    onSave: m
  } = e, u = n === "app", b = n === "marketing", [v, S] = F(t);
  ne(() => {
    S(t);
  }, [t]);
  const y = b ? v : t, d = tn(), w = on(), A = w === "editor" ? !0 : w === "viewer" || w === "loggedOut" ? !1 : o ?? !1, [B, L] = F(!1), [P, V] = F(6e5), [M, Y] = F(1e5), [f, C] = F(0), [l, h] = F(0), [g, D] = F(10), [E, X] = F(4), [R, J] = F("NONE"), [T, H] = F(0);
  ne(() => {
    r?.({ type: "calculator_used", persona: y });
  }, [y, r]);
  const ce = $(
    () => ({
      propertyValue: P,
      upfrontPayment: M,
      monthlyPayment: f,
      numberOfPayments: l,
      exitYear: g,
      growthRatePct: E,
      realtorMode: R,
      realtorPct: T
    }),
    [
      P,
      M,
      f,
      l,
      g,
      E,
      R,
      T
    ]
  ), ee = $(
    () => Qt(ce),
    [ce]
  ), te = $(
    () => Zt(ce),
    [ce]
  ), $e = $(
    () => ({ deal_terms: ee, scenario: te }),
    [ee, te]
  ), I = $(
    () => _e(ee, te),
    [ee, te]
  ), Q = $(
    () => Rt(
      y,
      ee,
      te,
      I
    ),
    [y, ee, te, I]
  ), ie = g * 12, j = $(
    () => u ? mt({
      homeValue: P,
      initialBuyAmount: M,
      termYears: g,
      annualGrowthRate: E / 100
    }) : null,
    [u, P, M, g, E]
  ), ve = $(
    () => j ? pt(j) : null,
    [j]
  ), fe = (_, k) => {
    const le = Number(_.replace(/,/g, ""));
    return Number.isFinite(le) && le >= 0 ? le : k;
  }, Ne = z(() => {
    if (r?.({ type: "save_clicked", persona: y }), m && j) {
      const _ = Mt(j.normalizedInputs);
      m(_);
    }
  }, [j, m, r, y]), Oe = z(async () => {
    if (r?.({ type: "save_continue_clicked", persona: y }), c) {
      const _ = {
        homeValue: P,
        initialBuyAmount: M,
        termYears: g,
        annualGrowthRate: E / 100
      }, k = {
        standard_net_payout: I.extension_adjusted_buyout_amount,
        early_net_payout: I.extension_adjusted_buyout_amount,
        late_net_payout: I.extension_adjusted_buyout_amount,
        standard_settlement_month: ie,
        early_settlement_month: ie,
        late_settlement_month: ie
      }, [le, Ve] = await Promise.all([
        re(_),
        re(k)
      ]);
      c({
        contract_version: ae,
        schema_version: oe,
        persona: y,
        mode: "marketing",
        inputs: _,
        basic_results: k,
        input_hash: le,
        output_hash: Ve,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  }, [
    y,
    P,
    M,
    g,
    E,
    I,
    ie,
    c,
    r
  ]), We = z(() => {
    r?.({ type: "share_clicked", persona: y }), i && i({
      contract_version: ae,
      schema_version: oe,
      persona: y,
      inputs: {
        homeValue: P,
        initialBuyAmount: M,
        termYears: g,
        annualGrowthRate: E / 100
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
    M,
    g,
    E,
    I,
    i,
    r
  ]), Be = $(() => {
    const _ = [
      { label: "Property", value: p(P) },
      { label: "Upfront", value: p(M) },
      { label: "Monthly", value: p(f) },
      { label: "# Months", value: String(l) },
      { label: "Exit Year", value: String(g) },
      { label: "Growth", value: K(E / 100) }
    ];
    return R !== "NONE" && _.push({ label: "Realtor", value: `${R} ${T}%` }), _;
  }, [
    P,
    M,
    f,
    l,
    g,
    E,
    R,
    T
  ]), Ie = P * Math.pow(1 + E / 100, g), U = {
    display: "block",
    fontSize: d ? 14 : 13,
    color: "#374151",
    marginBottom: 6,
    fontWeight: 500,
    letterSpacing: "-0.01em"
  }, q = {
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
  }, we = {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "5px 12px",
    background: "#f9fafb",
    borderRadius: 20,
    fontSize: d ? 11 : 12,
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
  }, Le = [
    {
      label: "Home Value Today",
      value: P,
      format: "currency"
    },
    {
      label: "Cash Unlocked Today",
      value: M,
      format: "currency"
    },
    {
      label: l > 0 ? `Monthly Contribution / ${l} Month${l === 1 ? "" : "s"}` : "Monthly Contribution",
      value: f,
      format: "currency"
    },
    {
      label: `Projected Value in ${rn(g)}`,
      value: Ie,
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
        u && /* @__PURE__ */ s("div", { style: { marginBottom: 20 }, children: [
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
              children: Be.map((_, k) => /* @__PURE__ */ s("span", { style: we, children: [
                /* @__PURE__ */ s("span", { style: Se, children: [
                  _.label,
                  ":"
                ] }),
                /* @__PURE__ */ a("span", { style: ke, children: _.value })
              ] }, k))
            }
          ),
          A && /* @__PURE__ */ a(
            "button",
            {
              type: "button",
              onClick: () => L(!0),
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
              gridTemplateColumns: u || d ? "1fr" : "minmax(0, 1fr) minmax(0, 2fr)",
              gap: d ? 16 : 24
            },
            children: [
              b && /* @__PURE__ */ s("div", { style: { minWidth: 0, overflow: "hidden" }, children: [
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
                  /* @__PURE__ */ a("label", { style: U, children: Z(
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
                      onChange: (_) => {
                        V(fe(_.target.value, P));
                      }
                    }
                  )
                ] }),
                /* @__PURE__ */ s("div", { style: G, children: [
                  /* @__PURE__ */ a("label", { style: U, children: Z(
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
                      value: M.toLocaleString(),
                      onChange: (_) => {
                        Y(
                          fe(_.target.value, M)
                        );
                      }
                    }
                  )
                ] }),
                /* @__PURE__ */ s("div", { style: G, children: [
                  /* @__PURE__ */ a("label", { style: U, children: Z(
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
                      value: f.toLocaleString(),
                      onChange: (_) => {
                        C(
                          fe(_.target.value, f)
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
                      onChange: (_) => {
                        const k = parseInt(_.target.value, 10);
                        Number.isFinite(k) && k >= 0 && k <= 360 && h(k);
                      }
                    }
                  )
                ] }),
                /* @__PURE__ */ s("div", { style: G, children: [
                  /* @__PURE__ */ a("label", { style: U, children: Z("scenario.exit_year", y, "Target Exit Year") }),
                  /* @__PURE__ */ a(
                    "input",
                    {
                      type: "number",
                      min: 1,
                      max: 30,
                      step: 1,
                      style: q,
                      value: g,
                      onChange: (_) => {
                        const k = parseInt(_.target.value, 10);
                        Number.isFinite(k) && k >= 1 && k <= 30 && D(k);
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
                      value: E,
                      onChange: (_) => {
                        const k = parseFloat(_.target.value);
                        Number.isFinite(k) && k >= 0 && k <= 20 && X(k);
                      }
                    }
                  )
                ] }),
                /* @__PURE__ */ s("div", { style: G, children: [
                  /* @__PURE__ */ a("label", { style: U, children: Z(
                    "deal_terms.realtor_representation_mode",
                    y,
                    "Realtor Representation"
                  ) }),
                  /* @__PURE__ */ s(
                    "select",
                    {
                      value: R,
                      onChange: (_) => {
                        J(_.target.value), _.target.value === "NONE" && H(0);
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
                  /* @__PURE__ */ a("label", { style: U, children: Z(
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
                      onChange: (_) => {
                        const k = parseFloat(_.target.value);
                        Number.isFinite(k) && k >= 0 && k <= 6 && H(k);
                      }
                    }
                  )
                ] }),
                b && /* @__PURE__ */ s("details", { style: { marginTop: 8 }, children: [
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
                              K(x.setup_fee_pct),
                              " (min ",
                              p(x.setup_fee_floor),
                              ", max ",
                              p(x.setup_fee_cap),
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
                              p(x.servicing_fee_monthly)
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
                              p(x.exit_admin_fee_amount)
                            ]
                          }
                        )
                      ]
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ s("div", { style: { minWidth: 0 }, children: [
                b && /* @__PURE__ */ a(
                  "div",
                  {
                    style: {
                      display: "grid",
                      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                      gap: d ? 8 : 10,
                      marginBottom: 20
                    },
                    "data-testid": "summary-cards",
                    children: Le.map((_) => /* @__PURE__ */ s(
                      "div",
                      {
                        style: {
                          padding: d ? "14px 8px" : "16px 12px",
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
                            fontSize: d ? 16 : 18,
                            fontWeight: 700,
                            color: "#111827",
                            letterSpacing: "-0.02em",
                            lineHeight: 1.2,
                            marginBottom: 4
                          }, children: /* @__PURE__ */ a(nn, { value: _.value, format: _.format }) }),
                          /* @__PURE__ */ a("div", { style: {
                            fontSize: d ? 9 : 10,
                            color: "#9ca3af",
                            fontWeight: 500,
                            textTransform: "uppercase",
                            letterSpacing: "0.03em",
                            lineHeight: 1.3,
                            wordBreak: "break-word",
                            hyphens: "auto"
                          }, children: _.label })
                        ]
                      },
                      _.label
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
                      marginBottom: 16,
                      textAlign: "center"
                    },
                    "data-testid": "hero-metric",
                    children: [
                      /* @__PURE__ */ a("div", { style: { fontSize: 13, color: "#6b7280", marginBottom: 4, fontWeight: 500 }, children: Q.hero.label }),
                      /* @__PURE__ */ a("div", { style: {
                        fontSize: d ? 22 : 26,
                        fontWeight: 700,
                        color: "#111827",
                        letterSpacing: "-0.02em"
                      }, children: Ee(
                        Q.hero.value,
                        Q.hero.valueFormat
                      ) }),
                      Q.hero.subtitle && /* @__PURE__ */ a("div", { style: { fontSize: 13, color: "#9ca3af", marginTop: 6, lineHeight: 1.4 }, children: Q.hero.subtitle })
                    ]
                  }
                ),
                b && /* @__PURE__ */ a("div", { style: { marginBottom: 20, padding: d ? "4px 0" : "8px 0", width: "100%", overflow: "hidden" }, children: /* @__PURE__ */ a(
                  Ct,
                  {
                    bars: Q.chartSpec.bars,
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
                      marginBottom: 16,
                      width: "100%",
                      overflow: "hidden"
                    },
                    "data-testid": "summary-strip",
                    children: Q.strip.map((_, k) => /* @__PURE__ */ s("span", { style: we, children: [
                      /* @__PURE__ */ s("span", { style: Se, children: [
                        _.label,
                        ":"
                      ] }),
                      /* @__PURE__ */ a("span", { style: ke, children: Ee(_.value, _.valueFormat) })
                    ] }, k))
                  }
                ),
                b && /* @__PURE__ */ a(
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
                      xt(ie),
                      " · Illustrative Buyout: ",
                      p(I.extension_adjusted_buyout_amount)
                    ] })
                  }
                ),
                !b && j && /* @__PURE__ */ s(ye, { children: [
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
                        { label: "Early", data: j.settlements.early },
                        {
                          label: "Standard",
                          data: j.settlements.standard
                        },
                        { label: "Late", data: j.settlements.late }
                      ].map((_) => /* @__PURE__ */ s(
                        "div",
                        {
                          style: {
                            padding: "12px 14px",
                            background: "#f9fafb",
                            borderRadius: 10,
                            border: "1px solid #f3f4f6",
                            display: "grid",
                            gridTemplateColumns: d ? "repeat(3, minmax(0, 1fr))" : "repeat(4, minmax(0, 1fr))",
                            gap: 8,
                            alignItems: "center"
                          },
                          children: [
                            /* @__PURE__ */ s("div", { children: [
                              /* @__PURE__ */ a("div", { style: { fontSize: 11, color: "#9ca3af" }, children: "Scenario" }),
                              /* @__PURE__ */ a("div", { style: { fontWeight: 600, fontSize: 13, color: "#111827" }, children: _.label })
                            ] }),
                            /* @__PURE__ */ s("div", { children: [
                              /* @__PURE__ */ a("div", { style: { fontSize: 11, color: "#9ca3af" }, children: "Exit Year" }),
                              /* @__PURE__ */ s("div", { style: { fontSize: 13, color: "#111827" }, children: [
                                "Yr ",
                                Math.round(_.data.settlementMonth / 12)
                              ] })
                            ] }),
                            /* @__PURE__ */ s("div", { children: [
                              /* @__PURE__ */ a("div", { style: { fontSize: 11, color: "#9ca3af" }, children: "Base Buyout" }),
                              /* @__PURE__ */ a("div", { style: { fontSize: 13, color: "#111827" }, children: p(_.data.rawPayout) })
                            ] }),
                            /* @__PURE__ */ s("div", { children: [
                              /* @__PURE__ */ a("div", { style: { fontSize: 11, color: "#9ca3af" }, children: "Adj. Buyout" }),
                              /* @__PURE__ */ a("div", { style: { fontWeight: 600, fontSize: 13, color: "#111827" }, children: p(_.data.netPayout) })
                            ] })
                          ]
                        },
                        _.label
                      ))
                    }
                  )
                ] }),
                !b && ve && /* @__PURE__ */ a("div", { style: { marginBottom: 20, width: "100%", overflow: "hidden" }, children: /* @__PURE__ */ a(gt, { series: ve, width: 520, height: d ? 200 : 260 }) }),
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
                      b && /* @__PURE__ */ s(ye, { children: [
                        /* @__PURE__ */ a(
                          "button",
                          {
                            type: "button",
                            onClick: Oe,
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
                            onClick: We,
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
                      !b && /* @__PURE__ */ a(
                        "button",
                        {
                          type: "button",
                          onClick: Ne,
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
                b && /* @__PURE__ */ a("p", { style: {
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
        B && A && /* @__PURE__ */ a(
          en,
          {
            initial: $e,
            persona: y,
            onClose: () => L(!1),
            onSaved: (_) => {
              V(_.deal_terms.property_value), Y(_.deal_terms.upfront_payment), C(_.deal_terms.monthly_payment), h(_.deal_terms.number_of_payments), D(_.scenario.exit_year), X(_.scenario.annual_appreciation * 100), J(_.deal_terms.realtor_representation_mode), H(_.deal_terms.realtor_commission_pct * 100), L(!1);
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
              w && /* @__PURE__ */ s(ye, { children: [
                " ",
                "·",
                " DEV_AUTH: ",
                /* @__PURE__ */ a("strong", { children: w })
              ] }),
              " · ",
              p(P),
              " home ",
              "·",
              " ",
              p(M),
              " ",
              "upfront ",
              "·",
              " ",
              p(f),
              "\\u00d7",
              l,
              "mo ",
              "·",
              " ",
              g,
              "yr ",
              "·",
              " ",
              K(E / 100),
              " growth"
            ]
          }
        )
      ]
    }
  );
}
function En(e) {
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
function un(e, t) {
  return t <= 0 ? 0 : Math.min(1, Math.max(0, e / t));
}
function dn({ results: e }) {
  const t = [
    {
      label: "Total Funded",
      value: e.actual_buyer_funding_to_date,
      color: "#9ca3af",
      sublabel: "Buyer funding to date"
    },
    {
      label: "Participation Value",
      value: e.current_participation_value,
      color: "#0891b2",
      sublabel: "Appreciation share × funding completion"
    },
    {
      label: "Base Buyout",
      value: e.base_buyout_amount,
      color: "#6366f1",
      sublabel: "Participation value + exit admin fee"
    },
    {
      label: "Adj. Buyout",
      value: e.extension_adjusted_buyout_amount,
      color: "#374151",
      sublabel: `Window: ${e.current_window}`
    }
  ];
  e.discount_purchase_price != null && e.discount_purchase_price > 0 && t.push({
    label: "Discount Price",
    value: e.discount_purchase_price,
    color: "#ca8a04",
    sublabel: "Buyer purchase option price"
  });
  const n = Math.max(...t.map((o) => o.value), 1);
  return /* @__PURE__ */ s(
    "div",
    {
      style: {
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: "16px",
        background: "#fafafa"
      },
      children: [
        /* @__PURE__ */ a(
          "div",
          {
            style: {
              fontSize: 13,
              fontWeight: 600,
              color: "#374151",
              marginBottom: 12,
              fontFamily: "system-ui, sans-serif"
            },
            children: "Contract Value Overview"
          }
        ),
        /* @__PURE__ */ a("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: t.map((o) => /* @__PURE__ */ s("div", { style: { fontFamily: "system-ui, sans-serif" }, children: [
          /* @__PURE__ */ s(
            "div",
            {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 3
              },
              children: [
                /* @__PURE__ */ a("span", { style: { fontSize: 11, color: "#6b7280" }, children: o.label }),
                /* @__PURE__ */ a("span", { style: { fontSize: 12, fontWeight: 600, color: "#111827" }, children: p(o.value) })
              ]
            }
          ),
          /* @__PURE__ */ a(
            "div",
            {
              style: {
                height: 6,
                background: "#f3f4f6",
                borderRadius: 3,
                overflow: "hidden"
              },
              children: /* @__PURE__ */ a(
                "div",
                {
                  style: {
                    height: "100%",
                    width: `${(un(o.value, n) * 100).toFixed(1)}%`,
                    background: o.color,
                    borderRadius: 3,
                    transition: "width 0.5s ease"
                  }
                }
              )
            }
          ),
          o.sublabel && /* @__PURE__ */ a("div", { style: { fontSize: 10, color: "#9ca3af", marginTop: 2 }, children: o.sublabel })
        ] }, o.label)) }),
        /* @__PURE__ */ s(
          "div",
          {
            style: {
              marginTop: 12,
              paddingTop: 10,
              borderTop: "1px solid #f3f4f6",
              display: "flex",
              gap: 16,
              flexWrap: "wrap"
            },
            children: [
              /* @__PURE__ */ s("div", { style: { fontFamily: "system-ui, sans-serif" }, children: [
                /* @__PURE__ */ a("div", { style: { fontSize: 10, color: "#9ca3af" }, children: "Funding completion" }),
                /* @__PURE__ */ s("div", { style: { fontSize: 12, fontWeight: 600, color: "#374151" }, children: [
                  (e.funding_completion_factor * 100).toFixed(1),
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ s("div", { style: { fontFamily: "system-ui, sans-serif" }, children: [
                /* @__PURE__ */ a("div", { style: { fontSize: 10, color: "#9ca3af" }, children: "Appreciation share" }),
                /* @__PURE__ */ s("div", { style: { fontSize: 12, fontWeight: 600, color: "#374151" }, children: [
                  (e.effective_buyer_appreciation_share * 100).toFixed(2),
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ s("div", { style: { fontFamily: "system-ui, sans-serif" }, children: [
                /* @__PURE__ */ a("div", { style: { fontSize: 10, color: "#9ca3af" }, children: "Current window" }),
                /* @__PURE__ */ a("div", { style: { fontSize: 12, fontWeight: 600, color: "#374151" }, children: e.current_window })
              ] })
            ]
          }
        )
      ]
    }
  );
}
const mn = [
  { key: "cash_flow", label: "Cash Flow" },
  { key: "ownership", label: "Ownership" },
  { key: "protections", label: "Exit Terms" },
  { key: "fees", label: "Fees" },
  { key: "assumptions", label: "Assumptions" }
];
function N(e) {
  return (e * 100).toFixed(2) + "%";
}
function pn({ rows: e }) {
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
function _n(e, t) {
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
      value: N(e.funding_completion_factor)
    },
    {
      label: "Appreciation Share",
      value: N(e.effective_buyer_appreciation_share)
    },
    {
      label: "Total Funding",
      value: p(e.actual_buyer_funding_to_date),
      sublabel: `${N(t.scenario.annual_appreciation)} / yr`
    }
  ], o = t.deal_terms.realtor_representation_mode, r = t.deal_terms.realtor_commission_pct;
  return o !== "NONE" ? n.push({
    label: "Realtor Fee (est.)",
    value: p(e.realtor_fee_total_projected),
    sublabel: `${N(r)} · ${o}`
  }) : n.push({
    label: "Realtor Fee",
    value: p(0),
    sublabel: "No realtor"
  }), n;
}
function fn(e) {
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
      value: N(e.funding_completion_factor)
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
function yn(e, t) {
  return [
    {
      label: "Scheduled appreciation share",
      value: N(t.scheduled_buyer_appreciation_share)
    },
    {
      label: "Effective appreciation share",
      value: N(t.effective_buyer_appreciation_share)
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
function hn(e, t) {
  const n = [
    {
      label: "First extension premium",
      value: N(e.deal_terms.first_extension_premium_pct)
    },
    {
      label: "Second extension premium",
      value: N(e.deal_terms.second_extension_premium_pct)
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
function bn(e, t) {
  const n = [
    {
      label: "Setup fee (%)",
      value: N(e.deal_terms.setup_fee_pct)
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
  ], o = e.deal_terms.realtor_representation_mode;
  return n.push({
    label: "Realtor representation",
    value: o === "NONE" ? "None" : o
  }), n.push({
    label: "Realtor commission",
    value: N(e.deal_terms.realtor_commission_pct)
  }), n.push({
    label: "Realtor fee (total projected)",
    value: p(t.realtor_fee_total_projected)
  }), n;
}
function gn(e) {
  const t = [
    {
      label: "Annual appreciation",
      value: N(e.scenario.annual_appreciation)
    },
    { label: "Exit year", value: `${e.scenario.exit_year} yr` },
    { label: "Closing costs", value: N(e.scenario.closing_cost_pct) },
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
function xn(e, t, n) {
  switch (e) {
    case "cash_flow":
      return fn(n);
    case "ownership":
      return yn(t, n);
    case "protections":
      return hn(t, n);
    case "fees":
      return bn(t, n);
    case "assumptions":
      return gn(t);
  }
}
function Cn({
  persona: e,
  status: t,
  inputs: n,
  results: o
}) {
  const [r, c] = F("cash_flow"), i = _n(o, n), m = xn(r, n, o);
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
        /* @__PURE__ */ a("div", { style: { padding: "0 18px 14px" }, children: /* @__PURE__ */ a(dn, { results: o }) }),
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
              children: mn.map((u) => /* @__PURE__ */ a(
                "button",
                {
                  type: "button",
                  onClick: () => c(u.key),
                  style: {
                    padding: "9px 14px",
                    border: "none",
                    borderBottom: r === u.key ? "2px solid #111827" : "2px solid transparent",
                    background: "none",
                    fontSize: 12,
                    fontWeight: r === u.key ? 600 : 400,
                    color: r === u.key ? "#111827" : "#6b7280",
                    cursor: "pointer",
                    fontFamily: "system-ui, sans-serif",
                    whiteSpace: "nowrap"
                  },
                  children: u.label
                },
                u.key
              ))
            }
          ),
          /* @__PURE__ */ a("div", { style: { padding: "14px 18px" }, children: /* @__PURE__ */ a(pn, { rows: m }) })
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
              o.compute_version,
              " · Read-only snapshot"
            ]
          }
        )
      ]
    }
  );
}
function Tn({ value: e, anchors: t, onCommit: n, parseRaw: o }) {
  const [r, c] = F(""), [i, m] = F(!1), u = t.some((w) => w.value === e), b = z(
    (w) => {
      m(!1), c(""), n(w);
    },
    [n]
  ), v = z(() => {
    m(!0);
  }, []), S = z((w) => {
    c(w);
  }, []), y = z(() => {
    if (!r) {
      m(!1);
      return;
    }
    const A = (o ?? ((B) => parseFloat(B.replace(/,/g, ""))))(r);
    Number.isFinite(A) && n(A), m(!1);
  }, [r, n, o]), d = i ? r : u ? "" : String(e);
  return {
    isAnchorMatch: u && !i,
    displayCustom: d,
    selectAnchor: b,
    focusCustom: v,
    changeCustom: S,
    blurCustom: y
  };
}
export {
  ae as CONTRACT_VERSION,
  en as DealEditModal,
  cn as DealKpiStrip,
  Cn as DealSnapshotView,
  gt as EquityChart,
  dn as EquityTransferChart,
  x as FEE_DEFAULTS,
  En as FractPathCalculatorWidget,
  An as MARKETING_PERSONAS,
  oe as SCHEMA_VERSION,
  pt as buildChartSeries,
  Mn as buildDraftSnapshot,
  Mt as buildFullDealSnapshotV1,
  Fn as buildSavePayload,
  Rn as buildShareSummary,
  mt as computeScenario,
  re as deterministicHash,
  Z as getLabel,
  kn as getPersonaConfig,
  Pn as getSummaryOrder,
  lt as normalizeInputs,
  Rt as resolvePersonaPresentation,
  Tn as useKioskInput
};
