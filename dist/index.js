import { jsx as a, jsxs as s, Fragment as Se } from "react/jsx-runtime";
import { useState as P, useCallback as T, useMemo as B, useRef as ye, useEffect as ce } from "react";
import { createPortal as Ze } from "react-dom";
function ae(e, t, n = {}) {
  const {
    parse: o = (u) => parseFloat(u.replace(/,/g, "")),
    validate: r = () => !0,
    format: c = (u) => u.toLocaleString()
  } = n, [i, p] = P(null), d = i !== null ? i : c(e), h = i !== null && (i.trim() === "" || !Number.isFinite(o(i)) || !r(o(i))), v = T(
    (u) => {
      const g = u.currentTarget;
      p(String(e)), setTimeout(() => g.select(), 0);
    },
    [e]
  ), S = T(
    (u) => {
      const g = u.target.value;
      p(g);
      const k = o(g);
      g.trim() !== "" && Number.isFinite(k) && r(k) && t(k);
    },
    [o, r, t]
  ), f = T(() => {
    p(null);
  }, []);
  return { displayValue: d, isInvalid: h, onFocus: v, onChange: S, onBlur: f };
}
function I(e) {
  return Math.round((e + Number.EPSILON) * 100) / 100;
}
const et = "11.0.0";
function we(e, t) {
  const n = Math.floor(t.exit_year * 12), o = Math.min(e.number_of_payments, n), r = I(e.upfront_payment + e.monthly_payment * e.number_of_payments), c = I(e.upfront_payment + e.monthly_payment * o), i = r > 0 ? c / r : 0, p = e.property_value > 0 ? r / e.property_value : 0, d = p * i, h = I(t.fmv_override !== void 0 && t.fmv_override !== null && t.fmv_override > 0 ? t.fmv_override : e.property_value * Math.pow(1 + t.annual_appreciation, t.exit_year)), v = c, S = Math.max(0, h - e.property_value), f = I(S * d), u = I(v + f), g = I(Math.min(Math.max(r * e.setup_fee_pct, e.setup_fee_floor), e.setup_fee_cap)), k = n, D = I(g + e.servicing_fee_monthly * k + e.payment_admin_fee * o + e.exit_admin_fee_amount), L = I(u + e.exit_admin_fee_amount), M = tt(e, t.exit_year), j = I(nt(L, M, e)), F = ot(e, j), U = e.buyer_purchase_option_enabled ? I(h - u) : null, y = rt(e, o);
  return {
    total_scheduled_buyer_funding: r,
    actual_buyer_funding_to_date: c,
    funding_completion_factor: i,
    scheduled_buyer_appreciation_share: p,
    effective_buyer_appreciation_share: d,
    buyer_base_capital_component: v,
    buyer_appreciation_claim: f,
    current_contract_value: h,
    current_participation_value: u,
    base_buyout_amount: L,
    extension_adjusted_buyout_amount: j,
    partial_buyout_amount_25: F[25],
    partial_buyout_amount_50: F[50],
    partial_buyout_amount_75: F[75],
    discount_purchase_price: U,
    current_window: M,
    fractpath_setup_fee_amount: g,
    fractpath_revenue_to_date: D,
    realtor_fee_total_projected: y,
    compute_version: et
  };
}
function tt(e, t) {
  return t < e.target_exit_window_start_year ? "pre_target" : t <= e.target_exit_window_end_year ? "target_exit" : t > e.long_stop_year ? "post_long_stop" : t >= e.first_extension_start_year && t <= e.first_extension_end_year ? "first_extension" : t >= e.second_extension_start_year && t <= e.second_extension_end_year ? "second_extension" : "post_long_stop";
}
function nt(e, t, n) {
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
function at(e, t, n) {
  if (e < t || n <= 0)
    return !1;
  const o = e / n;
  return Math.abs(o - Math.round(o)) < 1e-9;
}
function ot(e, t) {
  if (!e.partial_buyout_allowed)
    return { 25: null, 50: null, 75: null };
  const n = [25, 50, 75], o = { 25: null, 50: null, 75: null };
  for (const r of n) {
    const c = r / 100;
    at(c, e.partial_buyout_min_fraction, e.partial_buyout_increment_fraction) && (o[r] = I(t * c));
  }
  return o;
}
function rt(e, t) {
  return e.realtor_representation_mode === "NONE" || e.realtor_commission_pct === 0 ? 0 : I((e.upfront_payment + e.monthly_payment * t) * e.realtor_commission_pct);
}
const it = 0.03, lt = 0.035, st = 0.045, ct = 0.025, ut = 1.1, dt = 2, mt = 0.01, pt = 0.03, _t = 0.1, ft = 25e-4, ke = {
  homeValue: 6e5,
  initialBuyAmount: 1e5,
  termYears: 10,
  annualGrowthRate: it,
  transferFeeRate_standard: lt,
  transferFeeRate_early: st,
  transferFeeRate_late: ct,
  floorMultiple: ut,
  capMultiple: dt,
  vesting: {
    upfrontEquityPct: _t,
    monthlyEquityPct: ft,
    months: 120
  },
  cpw: {
    startPct: mt,
    endPct: pt
  }
}, w = {
  setup_fee_pct: 0.023,
  setup_fee_floor: 1750,
  setup_fee_cap: 18e3,
  servicing_fee_monthly: 59,
  payment_admin_fee: 4,
  exit_admin_fee_amount: 4500,
  first_extension_premium_pct: 0.06,
  second_extension_premium_pct: 0.12
}, yt = (e, t, n) => Math.min(n, Math.max(t, e));
function ht(e) {
  const t = {
    ...ke,
    ...e,
    vesting: {
      ...ke.vesting,
      ...e.vesting ?? {}
    },
    cpw: {
      ...ke.cpw,
      ...e.cpw ?? {}
    }
  }, n = Math.max(0, Math.round(t.termYears * 12));
  return t.vesting.months = n, t;
}
function bt(e, t, n) {
  const o = n / 12;
  return e * Math.pow(1 + t, o);
}
function gt(e, t, n) {
  return yt(e + t * n, 0, 1);
}
function xt(e, t) {
  const n = [];
  for (let o = 0; o <= t; o++) {
    const r = bt(e.homeValue, e.annualGrowthRate, o), c = gt(
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
function ve(e, t) {
  const n = e.vesting.months;
  return t === "standard" ? n : t === "early" ? Math.min(36, n) : t === "late" ? n + 24 : n;
}
function vt(e) {
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
    first_extension_premium_pct: w.first_extension_premium_pct,
    second_extension_start_year: t + 4,
    second_extension_end_year: t + 5,
    second_extension_premium_pct: w.second_extension_premium_pct,
    partial_buyout_allowed: !1,
    partial_buyout_min_fraction: 0.25,
    partial_buyout_increment_fraction: 0.25,
    buyer_purchase_option_enabled: !1,
    buyer_purchase_notice_days: 90,
    buyer_purchase_closing_days: 60,
    setup_fee_pct: w.setup_fee_pct,
    setup_fee_floor: w.setup_fee_floor,
    setup_fee_cap: w.setup_fee_cap,
    servicing_fee_monthly: w.servicing_fee_monthly,
    payment_admin_fee: w.payment_admin_fee,
    exit_admin_fee_amount: w.exit_admin_fee_amount,
    realtor_representation_mode: "NONE",
    realtor_commission_pct: 0
  };
}
function Pe(e, t) {
  const n = ve(e, t), o = n / 12, r = vt(e), c = we(r, {
    annual_appreciation: e.annualGrowthRate,
    exit_year: o
  }), i = r.property_value * Math.pow(1 + e.annualGrowthRate, o), p = c.base_buyout_amount, d = c.extension_adjusted_buyout_amount;
  return {
    timing: t,
    settlementMonth: n,
    homeValueAtSettlement: i,
    equityPctAtSettlement: c.funding_completion_factor,
    rawPayout: p,
    clampedPayout: d,
    transferFeeAmount: 0,
    netPayout: d,
    clamp: { floor: 0, cap: 0, applied: "none" },
    transferFeeRate: 0
  };
}
function wt(e = {}) {
  const t = ht(e), n = Math.max(
    ve(t, "standard"),
    ve(t, "early"),
    ve(t, "late")
  ), o = xt(t, n), r = Pe(t, "standard"), c = Pe(t, "early"), i = Pe(t, "late");
  return {
    normalizedInputs: t,
    series: o,
    settlements: { standard: r, early: c, late: i }
  };
}
function St(e) {
  const { early: t, standard: n, late: o } = e.settlements, r = {
    year: 0,
    label: "Start",
    contractValue: 0,
    participationValue: 0,
    buyoutAmount: 0,
    discountPurchasePrice: null
  };
  function c(d, h) {
    return {
      year: Math.round(d.settlementMonth / 12 * 10) / 10,
      label: h,
      contractValue: d.rawPayout,
      participationValue: d.rawPayout,
      buyoutAmount: d.netPayout,
      discountPurchasePrice: null
    };
  }
  const i = [
    r,
    c(t, "Early exit"),
    c(n, "Target exit"),
    c(o, "Late exit")
  ], p = [
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
  return { points: i, markers: p };
}
function kt(e, t, n) {
  return Math.min(n, Math.max(t, e));
}
function Pt(e) {
  return e >= 1e6 ? `$${(e / 1e6).toFixed(1)}M` : e >= 1e3 ? `$${Math.round(e / 1e3)}k` : `$${Math.round(e)}`;
}
function Mt(e) {
  return `Yr ${Math.round(e)}`;
}
function Ft(e) {
  return e.timing === "early" ? "Early" : e.timing === "late" ? "Late" : "Std";
}
const Rt = {
  early: "#ca8a04",
  standard: "#0891b2",
  late: "#c026d3"
};
function Et({ series: e, width: t = 640, height: n = 260 }) {
  const { points: o, markers: r } = e, c = B(
    () => `cv-${Math.random().toString(36).slice(2, 8)}`,
    []
  );
  if (!o.length)
    return /* @__PURE__ */ a("div", { style: { fontFamily: "system-ui, sans-serif" }, children: "No data" });
  const i = { top: 24, right: 24, bottom: 40, left: 64 }, p = Math.max(10, t - i.left - i.right), d = Math.max(10, n - i.top - i.bottom), h = o.map((y) => y.year), v = Math.min(...h), S = Math.max(...h), f = o.flatMap((y) => [y.buyoutAmount, y.contractValue]), u = 0, g = Math.max(...f, 1), k = (y) => S === v ? i.left : i.left + (y - v) / (S - v) * p, D = (y) => {
    const C = kt(y, u, g);
    return i.top + (1 - (C - u) / (g - u)) * d;
  }, L = o.map((y, C) => {
    const R = k(y.year), re = D(y.buyoutAmount);
    return `${C === 0 ? "M" : "L"} ${R.toFixed(2)} ${re.toFixed(2)}`;
  }).join(" "), M = o.length * 40, j = 4, F = Array.from({ length: j + 1 }, (y, C) => {
    const R = g * C / j;
    return { v: R, y: D(R), label: Pt(R) };
  }), U = o.map((y) => ({
    year: y.year,
    x: k(y.year),
    label: y.label
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
          from { stroke-dashoffset: ${M}; }
          to { stroke-dashoffset: 0; }
        }
      ` }),
        /* @__PURE__ */ a("rect", { x: 0, y: 0, width: t, height: n, fill: "white", rx: 8 }),
        F.map((y, C) => /* @__PURE__ */ s("g", { children: [
          /* @__PURE__ */ a(
            "line",
            {
              x1: i.left,
              x2: t - i.right,
              y1: y.y,
              y2: y.y,
              stroke: "#f3f4f6",
              strokeWidth: 1
            }
          ),
          /* @__PURE__ */ a(
            "text",
            {
              x: i.left - 8,
              y: y.y + 4,
              fontSize: 11,
              textAnchor: "end",
              fill: "#9ca3af",
              fontFamily: "system-ui, sans-serif",
              children: y.label
            }
          )
        ] }, C)),
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
        U.map((y) => /* @__PURE__ */ s("g", { children: [
          /* @__PURE__ */ a(
            "line",
            {
              x1: y.x,
              x2: y.x,
              y1: i.top + d,
              y2: i.top + d + 5,
              stroke: "#d1d5db",
              strokeWidth: 1
            }
          ),
          /* @__PURE__ */ a(
            "text",
            {
              x: y.x,
              y: i.top + d + 20,
              fontSize: 10,
              textAnchor: "middle",
              fill: "#9ca3af",
              fontFamily: "system-ui, sans-serif",
              children: y.label
            }
          ),
          /* @__PURE__ */ a(
            "text",
            {
              x: y.x,
              y: i.top + d + 33,
              fontSize: 9,
              textAnchor: "middle",
              fill: "#d1d5db",
              fontFamily: "system-ui, sans-serif",
              children: Mt(y.year)
            }
          )
        ] }, y.year)),
        r.map((y) => {
          const C = k(y.year), R = Rt[y.timing] || "#d1d5db";
          return /* @__PURE__ */ s("g", { children: [
            /* @__PURE__ */ a(
              "line",
              {
                x1: C,
                x2: C,
                y1: i.top,
                y2: i.top + d,
                stroke: R,
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
                stroke: R,
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
                fill: R,
                fontFamily: "system-ui, sans-serif",
                fontWeight: 600,
                children: Ft(y)
              }
            )
          ] }, y.timing);
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
            strokeDasharray: M,
            strokeDashoffset: 0,
            style: {
              animation: `${c}-draw 1s ease-out forwards`
            }
          }
        ),
        o.slice(1).map((y) => /* @__PURE__ */ a(
          "circle",
          {
            cx: k(y.year),
            cy: D(y.buyoutAmount),
            r: 4,
            fill: "#0891b2",
            stroke: "white",
            strokeWidth: 2
          },
          y.year
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
function _(e) {
  return e.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });
}
function J(e) {
  return `${(e * 100).toFixed(1)}%`;
}
function At(e) {
  const t = Math.floor(e / 12), n = e % 12;
  return t === 0 ? `${n}mo` : n === 0 ? `${t}yr` : `${t}yr ${n}mo`;
}
const De = {
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
  return De[e] ?? De.homeowner;
}
const Ct = {
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
function oe(e, t, n) {
  return Ct[t]?.[e] ?? n;
}
const ze = {
  homeowner: ["hero", "net_payout", "settlement_timing", "total_invested", "fees"],
  buyer: ["hero", "net_payout", "total_invested", "settlement_timing", "fees"],
  investor: ["hero", "net_payout", "total_invested", "fees", "settlement_timing"],
  realtor: ["hero", "fees", "net_payout", "settlement_timing", "total_invested"],
  ops: ["hero", "net_payout", "fees", "total_invested", "settlement_timing"]
};
function $n(e) {
  return ze[e] ?? ze.homeowner;
}
const ue = "11.0.0", de = "1";
function We(e) {
  const t = {};
  for (const n of Object.keys(e).sort()) {
    const o = e[n];
    o !== null && typeof o == "object" && !Array.isArray(o) ? t[n] = We(o) : t[n] = o;
  }
  return JSON.stringify(t);
}
async function me(e) {
  const t = We(e), n = new TextEncoder().encode(t), o = await crypto.subtle.digest("SHA-256", n);
  return Array.from(new Uint8Array(o)).map((c) => c.toString(16).padStart(2, "0")).join("");
}
function Ve(e) {
  return {
    homeValue: e.homeValue,
    initialBuyAmount: e.initialBuyAmount,
    termYears: e.termYears,
    annualGrowthRate: e.annualGrowthRate
  };
}
function Tt(e) {
  return {
    standard_net_payout: e.settlements.standard.netPayout,
    early_net_payout: e.settlements.early.netPayout,
    late_net_payout: e.settlements.late.netPayout,
    standard_settlement_month: e.settlements.standard.settlementMonth,
    early_settlement_month: e.settlements.early.settlementMonth,
    late_settlement_month: e.settlements.late.settlementMonth
  };
}
function Dt(e) {
  return {
    standard_net_payout: e.settlements.standard.netPayout,
    early_net_payout: e.settlements.early.netPayout,
    late_net_payout: e.settlements.late.netPayout
  };
}
async function Bn(e, t, n) {
  const o = Ve(t), r = Tt(n), [c, i] = await Promise.all([
    me(o),
    me(r)
  ]);
  return {
    contract_version: ue,
    schema_version: de,
    persona: e,
    mode: "marketing",
    inputs: o,
    basic_results: r,
    input_hash: c,
    output_hash: i,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
}
function Nn(e, t, n) {
  return {
    contract_version: ue,
    schema_version: de,
    persona: e,
    inputs: Ve(t),
    basic_results: Dt(n),
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
}
async function In(e, t, n) {
  const [o, r] = await Promise.all([
    me(t),
    me({
      standard: n.settlements.standard,
      early: n.settlements.early,
      late: n.settlements.late
    })
  ]);
  return {
    contract_version: ue,
    schema_version: de,
    persona: e,
    mode: "app",
    inputs: t,
    outputs: n,
    input_hash: o,
    output_hash: r,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
}
function zt(e) {
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
    setup_fee_pct: w.setup_fee_pct,
    setup_fee_floor: w.setup_fee_floor,
    setup_fee_cap: w.setup_fee_cap,
    servicing_fee_monthly: w.servicing_fee_monthly,
    payment_admin_fee: w.payment_admin_fee,
    exit_admin_fee_amount: w.exit_admin_fee_amount,
    realtor_representation_mode: "NONE",
    realtor_commission_pct: 0
  };
}
function $t(e) {
  return {
    annual_appreciation: e.annualGrowthRate,
    closing_cost_pct: 0.02,
    exit_year: e.termYears
  };
}
function Bt(e) {
  const t = zt(e), n = $t(e), o = we(t, n), r = (/* @__PURE__ */ new Date()).toISOString();
  return {
    contract_version: ue,
    schema_version: de,
    deal_terms: t,
    assumptions: n,
    outputs: o,
    now_iso: r,
    created_at: r
  };
}
function O(e, t) {
  switch (t) {
    case "currency":
      return _(e);
    case "percent":
      return J(e);
    case "multiple":
      return `${e.toFixed(2)}×`;
    case "months":
      return `${e}`;
    case "text":
      return String(e);
  }
}
function Re(e, t) {
  return e.property_value * Math.pow(1 + t.annual_appreciation, t.exit_year);
}
function Nt(e, t, n, o) {
  switch (e) {
    case "homeowner":
      return Ot(t, n, o);
    case "realtor":
      return Wt(t, n, o);
    default:
      return It(t, n, o);
  }
}
function It(e, t, n) {
  const o = n.extension_adjusted_buyout_amount, r = n.actual_buyer_funding_to_date, c = o - r, i = Re(e, t), p = r > 0 ? o / r : 1, d = i > 0 ? n.effective_buyer_appreciation_share : 0;
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
      { label: "Effective appreciation share", value: d, valueFormat: "percent" },
      { label: "Return multiple", value: p, valueFormat: "multiple" }
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
      `~${O(d, "percent")} effective appreciation share over ${t.exit_year} years — with no financing or interest.`,
      `You contribute ${O(r, "currency")} total. At buyout, payout is ${O(o, "currency")}.`,
      `Projected home value at buyout: ${O(i, "currency")} (base assumptions).`,
      `Assumes ${O(t.annual_appreciation, "percent")} annual appreciation — Save & Continue free to model different growth and timing.`
    ]
  };
}
function Ot(e, t, n) {
  const o = n.actual_buyer_funding_to_date, r = Re(e, t);
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
      `Unlock ${O(o, "currency")} while continuing to own your home.`,
      `Upfront: ${O(e.upfront_payment, "currency")}. Monthly: ${O(e.monthly_payment, "currency")} for ${e.number_of_payments} months.`,
      `Projected home value at buyout: ${O(r, "currency")} (base assumptions).`,
      `Assumes ${O(t.annual_appreciation, "percent")} annual appreciation — Save & Continue free to model growth, protections, and timing.`
    ]
  };
}
function Wt(e, t, n) {
  const o = n.realtor_fee_total_projected, r = n.extension_adjusted_buyout_amount, i = Re(e, t) - r, p = e.realtor_commission_pct * 100;
  return {
    hero: {
      label: "Projected Commission (Standard)",
      value: o,
      valueFormat: "currency",
      subtitle: `Based on ${p.toFixed(1)}% as ${e.realtor_representation_mode} representation.`
    },
    strip: [
      { label: "Commission rate", value: `${p.toFixed(1)}%`, valueFormat: "text" },
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
      `Projected commission on this deal: ${O(o, "currency")} (standard timing).`,
      `Commission rate: ${p.toFixed(1)}% as ${e.realtor_representation_mode} representation.`,
      "Capture buyers and sellers earlier — without requiring an immediate full sale or full purchase.",
      `Remaining property value at buyout (conditional): ${O(i > 0 ? i : 0, "currency")}. Save free to model scenarios.`
    ]
  };
}
const $e = ["#0891b2", "#c026d3", "#ca8a04", "#6b7280", "#374151"];
function Vt({ bars: e, width: t = 400, height: n = 220 }) {
  const o = Math.max(...e.map((v) => v.value), 1), r = Math.min(80, (t - 60) / e.length - 20), c = 36, i = n - 44, p = i - c, d = (t - 40) / e.length, h = `bar-anim-${Math.random().toString(36).slice(2, 8)}`;
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
        e.map((v, S) => {
          const f = o > 0 ? v.value / o * p : 0, u = 20 + S * d + (d - r) / 2, g = i - f, k = $e[S % $e.length];
          return /* @__PURE__ */ s("g", { children: [
            /* @__PURE__ */ a(
              "rect",
              {
                x: u,
                y: g,
                width: r,
                height: Math.max(f, 2),
                rx: 6,
                ry: 6,
                fill: k,
                style: {
                  transformOrigin: `${u + r / 2}px ${i}px`,
                  animation: `${h} 0.5s ease-out ${S * 0.1}s both`
                }
              }
            ),
            /* @__PURE__ */ a(
              "text",
              {
                x: u + r / 2,
                y: g - 10,
                textAnchor: "middle",
                fontSize: 11,
                fontWeight: 600,
                fill: "#111827",
                fontFamily: "system-ui, sans-serif",
                children: _(v.value)
              }
            ),
            /* @__PURE__ */ a(
              "text",
              {
                x: u + r / 2,
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
const Lt = [
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
function jt(e, t) {
  const n = e.dynamicPercentAnchors;
  return n ? n.percents.map((o) => {
    let r = o * t;
    n.maxPercentOfSource != null && (r = Math.min(r, n.maxPercentOfSource * t));
    const c = Math.round(r / 100) * 100, i = n.min != null ? Math.max(n.min, c) : c;
    return { label: _(i), value: i };
  }) : e.anchors ?? [];
}
const Be = [
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
function Yt(e) {
  const t = {}, { deal_terms: n, scenario: o } = e;
  return n.property_value <= 0 && (t["deal_terms.property_value"] = "Property value must be greater than 0"), n.upfront_payment < 0 && (t["deal_terms.upfront_payment"] = "Upfront payment cannot be negative"), n.monthly_payment < 0 && (t["deal_terms.monthly_payment"] = "Monthly payment cannot be negative"), n.number_of_payments < 0 && (t["deal_terms.number_of_payments"] = "Number of payments cannot be negative"), o.exit_year <= 0 && (t["scenario.exit_year"] = "Exit year must be greater than 0"), (o.annual_appreciation < -0.5 || o.annual_appreciation > 0.5) && (t["scenario.annual_appreciation"] = "Annual appreciation must be between -50% and 50%"), n.realtor_commission_pct !== void 0 && (n.realtor_commission_pct < 0 || n.realtor_commission_pct > 0.06) && (t["deal_terms.realtor_commission_pct"] = "Realtor commission must be between 0% and 6%"), n.realtor_representation_mode === "NONE" && n.realtor_commission_pct !== void 0 && n.realtor_commission_pct !== 0 && (t["deal_terms.realtor_commission_pct"] = "Commission must be 0% when representation mode is NONE"), t;
}
function Le(e) {
  return Object.keys(e).length > 0;
}
const je = {
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
}, Ht = {
  ...je,
  border: "2px solid #111827",
  background: "#111827",
  color: "#fff"
};
function Ut({
  value: e,
  anchors: t,
  unit: n,
  onSelectAnchor: o,
  customValue: r,
  onChangeCustom: c,
  onBlurCustom: i,
  disabled: p,
  error: d
}) {
  const h = t.some((u) => u.value === e), v = n === "currency" || n === "number" || n === "months" || n === "years" ? "numeric" : "decimal", S = n === "currency" ? "$" : "", f = n === "percent" ? "%" : n === "years" ? " yr" : n === "months" ? " mo" : "";
  return /* @__PURE__ */ s("div", { children: [
    /* @__PURE__ */ a("div", { style: { display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }, children: t.map((u) => /* @__PURE__ */ a(
      "button",
      {
        type: "button",
        disabled: p,
        onClick: () => o(u.value),
        style: {
          ...u.value === e ? Ht : je,
          opacity: p ? 0.5 : 1,
          cursor: p ? "not-allowed" : "pointer"
        },
        children: u.label
      },
      u.label
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
          disabled: p,
          value: h ? "" : r,
          placeholder: h ? "Custom" : "",
          onChange: (u) => c(u.target.value),
          onBlur: i,
          style: {
            width: "100%",
            padding: S ? "7px 10px 7px 22px" : "7px 10px",
            border: d ? "1px solid #ef4444" : "1px solid #d1d5db",
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
    d && /* @__PURE__ */ a("div", { style: { color: "#ef4444", fontSize: 11, marginTop: 3 }, children: d })
  ] });
}
const qt = `
@keyframes fpShimmer {
  0% { background-position: -200px 0; }
  100% { background-position: 200px 0; }
}
`, Gt = {
  display: "inline-block",
  width: 60,
  height: 12,
  borderRadius: 4,
  background: "linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)",
  backgroundSize: "200px 100%",
  animation: "fpShimmer 1.5s infinite"
};
function Kt({ tier1: e, status: t, error: n }) {
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
        /* @__PURE__ */ a("style", { children: qt }),
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
              t === "computing" && /* @__PURE__ */ a("span", { style: Gt })
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
function be({ simpleDefinition: e, impact: t }) {
  const [n, o] = P(!1), r = ye(null), c = ye(null);
  ce(() => {
    if (!n) return;
    function d(h) {
      r.current && !r.current.contains(h.target) && c.current && !c.current.contains(h.target) && o(!1);
    }
    return document.addEventListener("mousedown", d), () => document.removeEventListener("mousedown", d);
  }, [n]);
  const [i, p] = P({ top: 0, left: 0 });
  return ce(() => {
    if (!n || !r.current) return;
    const d = r.current.getBoundingClientRect();
    p({
      top: d.top + window.scrollY - 8,
      left: d.left + d.width / 2 + window.scrollX
    });
  }, [n]), /* @__PURE__ */ s("span", { style: { display: "inline-block", marginLeft: 4 }, children: [
    /* @__PURE__ */ a(
      "button",
      {
        ref: r,
        type: "button",
        onClick: () => o((d) => !d),
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
    n && Ze(
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
function Xt(e, t, n) {
  const o = t === "homeowner" ? "receive" : "pay";
  switch (e) {
    case "payments": {
      const r = [];
      return n.upfrontPayment != null && r.push(`You ${o} ${_(n.upfrontPayment)} upfront at closing.`), n.monthlyPayment != null && n.numberOfPayments != null && n.numberOfPayments > 0 && r.push(
        `Then ${_(n.monthlyPayment)}/mo for ${n.numberOfPayments} months.`
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
      return n.setupFeePct != null && r.push(`Setup fee: ${J(n.setupFeePct)} of upfront payment at closing.`), n.servicingFeeMonthly != null && r.push(`Monthly servicing: ${_(n.servicingFeeMonthly)}/mo for account management.`), n.exitAdminFeeAmount != null && r.push(`Exit admin fee: ${_(n.exitAdminFeeAmount)} flat at settlement.`), r.length === 0 && r.push("Fees include a setup fee at closing, monthly servicing, and an exit admin fee at settlement."), t === "realtor" && r.push("Realtor commission is tracked separately below."), r;
    }
    default:
      return [];
  }
}
function Jt(e, t) {
  if (t === "__disclosure__") return null;
  const [n, o] = t.split(".");
  return e[n][o];
}
function Qt(e, t) {
  return e.dynamicPercentAnchors ? jt(e, t.deal_terms.property_value) : e.anchors ?? [];
}
const Zt = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  paddingTop: "5vh",
  zIndex: 9999,
  fontFamily: "system-ui, sans-serif"
}, en = {
  background: "#fff",
  borderRadius: 12,
  width: "min(680px, 95vw)",
  height: "min(85vh, 720px)",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 8px 32px rgba(0,0,0,0.18)"
}, tn = {
  display: "flex",
  gap: 0,
  borderBottom: "1px solid #e5e7eb",
  padding: "0 16px",
  overflowX: "auto"
};
function nn({
  draft: e,
  errors: t,
  preview: n,
  persona: o,
  permissions: r,
  setField: c,
  onBlurCompute: i,
  onSave: p,
  onClose: d
}) {
  const [h, v] = P("payments"), [S, f] = P({}), [u, g] = P({}), k = B(() => {
    const l = /* @__PURE__ */ new Map();
    for (const b of Lt) l.set(b.key, b);
    return l;
  }, []), D = !Le(t) && o !== "realtor" && r?.canEdit !== !1, L = T(
    (l, b) => {
      if (c(l, b), f((x) => ({ ...x, [l]: "" })), g((x) => ({ ...x, [l]: "" })), l !== "deal_terms.realtor_representation_mode") {
        if (l === "deal_terms.realtor_commission_pct") {
          i();
          return;
        }
        i();
      }
    },
    [c, i]
  ), M = T(
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
  ), j = T(
    (l, b) => {
      f((x) => ({ ...x, [l]: b }));
    },
    []
  ), F = T(
    (l, b) => {
      const x = S[l];
      if (x === void 0) return;
      if (x.trim() === "") {
        g((E) => ({ ...E, [l]: "Required" }));
        return;
      }
      let z;
      if (b.unit === "percent" ? z = parseFloat(x) / 100 : z = parseFloat(x.replace(/,/g, "")), !Number.isFinite(z)) {
        g((E) => ({ ...E, [l]: "Enter a valid number" }));
        return;
      }
      b.hardRange && (z = Math.max(b.hardRange.min, Math.min(b.hardRange.max, z))), g((E) => ({ ...E, [l]: "" })), c(l, z), i();
    },
    [S, c, i]
  ), U = T(() => {
    D && (p(e), d());
  }, [D, e, p, d]), y = (l) => l === "deal_terms.realtor_commission_pct" ? e.deal_terms.realtor_representation_mode === "NONE" : !1, C = (l, b) => l == null ? "—" : b.unit === "percent" ? `${(l * 100).toFixed(2)}%` : b.unit === "currency" ? _(l) : b.unit === "years" ? `${l} yr` : b.unit === "months" ? `${l} mo` : typeof l == "boolean" ? l ? "Yes" : "No" : String(l), R = (l) => {
    const b = l.key, x = Jt(e, b), z = t[b], E = l.readOnly || y(b), Q = oe(b, o, l.label);
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
      const A = l.options ?? [], q = b === "deal_terms.partial_buyout_allowed" ? String(x) : x;
      return /* @__PURE__ */ s("div", { style: { marginBottom: 14 }, children: [
        /* @__PURE__ */ s("label", { style: ge, children: [
          Q,
          /* @__PURE__ */ a(be, { simpleDefinition: l.simpleDefinition, impact: l.impact })
        ] }),
        /* @__PURE__ */ a(
          "select",
          {
            value: q,
            disabled: E,
            onChange: ($) => M(b, $.target.value),
            style: {
              ...an,
              background: E ? "#f3f4f6" : "#fff",
              color: E ? "#9ca3af" : "#111827"
            },
            children: A.map(($) => /* @__PURE__ */ a("option", { value: $.value, children: $.label }, $.value))
          }
        ),
        z && /* @__PURE__ */ a("div", { style: Ne, children: z })
      ] }, b);
    }
    if (l.control === "readonly")
      return /* @__PURE__ */ s("div", { style: { marginBottom: 14 }, children: [
        /* @__PURE__ */ s("label", { style: ge, children: [
          Q,
          /* @__PURE__ */ a(be, { simpleDefinition: l.simpleDefinition, impact: l.impact })
        ] }),
        /* @__PURE__ */ a("div", { style: on, children: C(x, l) })
      ] }, b);
    if (l.control === "slider" && l.slider)
      return /* @__PURE__ */ s("div", { style: { marginBottom: 14 }, children: [
        /* @__PURE__ */ s("label", { style: ge, children: [
          Q,
          /* @__PURE__ */ a(be, { simpleDefinition: l.simpleDefinition, impact: l.impact })
        ] }),
        /* @__PURE__ */ s("div", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [
          /* @__PURE__ */ a(
            "input",
            {
              type: "range",
              min: l.slider.min,
              max: l.slider.max,
              step: l.slider.step,
              value: x,
              disabled: E,
              onChange: (A) => c(b, parseFloat(A.target.value)),
              onMouseUp: i,
              onTouchEnd: i,
              style: { flex: 1 }
            }
          ),
          /* @__PURE__ */ a("span", { style: { fontSize: 13, fontWeight: 600, minWidth: 80, textAlign: "right" }, children: C(x, l) })
        ] }),
        z && /* @__PURE__ */ a("div", { style: Ne, children: z })
      ] }, b);
    if (l.control === "kiosk") {
      const A = Qt(l, e), q = A.length >= 4 ? [A[0], A[1], A[2], A[3]] : [
        A[0] ?? { label: "—", value: 0 },
        A[1] ?? { label: "—", value: 0 },
        A[2] ?? { label: "—", value: 0 },
        A[3] ?? { label: "—", value: 0 }
      ], $ = S[b];
      let H = $ ?? "";
      $ === void 0 && !q.some((W) => W.value === x) && (l.unit === "percent" ? H = (x * 100).toString() : H = String(x));
      const Z = u[b] || "", ee = z || Z || void 0;
      return /* @__PURE__ */ s("div", { style: { marginBottom: 14 }, children: [
        /* @__PURE__ */ s("label", { style: ge, children: [
          Q,
          /* @__PURE__ */ a(be, { simpleDefinition: l.simpleDefinition, impact: l.impact })
        ] }),
        /* @__PURE__ */ a(
          Ut,
          {
            value: x,
            anchors: q,
            unit: l.unit,
            onSelectAnchor: (W) => L(b, W),
            customValue: H,
            onChangeCustom: (W) => j(b, W),
            onBlurCustom: () => F(b, l),
            disabled: E,
            error: ee
          }
        )
      ] }, b);
    }
    return null;
  }, re = Be.find((l) => l.key === h);
  return /* @__PURE__ */ a("div", { style: Zt, onClick: (l) => {
    l.target === l.currentTarget && d();
  }, children: /* @__PURE__ */ s("div", { style: en, role: "dialog", "aria-modal": "true", "data-testid": "deal-edit-modal", children: [
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
    /* @__PURE__ */ a("div", { style: tn, children: Be.map((l) => /* @__PURE__ */ a(
      "button",
      {
        type: "button",
        onClick: () => v(l.key),
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
      /* @__PURE__ */ a("div", { children: re.sections.map((l) => /* @__PURE__ */ s("div", { style: { marginBottom: 20 }, children: [
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
          const x = k.get(b);
          return x ? R(x) : null;
        })
      ] }, l.label)) }),
      /* @__PURE__ */ s("div", { children: [
        /* @__PURE__ */ a(
          Kt,
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
              /* @__PURE__ */ a("ul", { style: { margin: 0, padding: "0 0 0 14px", fontSize: 11, lineHeight: 1.6, color: "#374151" }, children: Xt(h, o, {
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
              onClick: U,
              disabled: !D,
              style: {
                padding: "8px 24px",
                borderRadius: 8,
                border: "none",
                background: D ? "#111827" : "#d1d5db",
                color: D ? "#fff" : "#9ca3af",
                fontSize: 13,
                fontWeight: 600,
                cursor: D ? "pointer" : "not-allowed",
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
const ge = {
  display: "block",
  fontSize: 12,
  color: "#374151",
  marginBottom: 5,
  fontWeight: 500
}, an = {
  width: "100%",
  padding: "7px 10px",
  border: "1px solid #d1d5db",
  borderRadius: 6,
  fontSize: 13,
  fontFamily: "system-ui, sans-serif",
  boxSizing: "border-box"
}, on = {
  padding: "7px 10px",
  background: "#f3f4f6",
  border: "1px solid #e5e7eb",
  borderRadius: 6,
  fontSize: 13,
  color: "#6b7280"
}, Ne = {
  color: "#ef4444",
  fontSize: 11,
  marginTop: 3
};
function Fe() {
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
      first_extension_premium_pct: w.first_extension_premium_pct,
      second_extension_start_year: 11,
      second_extension_end_year: 15,
      second_extension_premium_pct: w.second_extension_premium_pct,
      partial_buyout_allowed: !1,
      partial_buyout_min_fraction: 0.25,
      partial_buyout_increment_fraction: 0.25,
      buyer_purchase_option_enabled: !1,
      buyer_purchase_notice_days: 90,
      buyer_purchase_closing_days: 60,
      setup_fee_pct: w.setup_fee_pct,
      setup_fee_floor: w.setup_fee_floor,
      setup_fee_cap: w.setup_fee_cap,
      servicing_fee_monthly: w.servicing_fee_monthly,
      payment_admin_fee: w.payment_admin_fee,
      exit_admin_fee_amount: w.exit_admin_fee_amount,
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
function xe(e) {
  const { upfront_payment: t, monthly_payment: n, number_of_payments: o } = e.deal_terms, { exit_year: r } = e.scenario, c = Math.floor(r * 12), i = Math.min(o, c), p = n * i, d = t + p, h = i === 0 ? "No installments" : `${i} payments of ${_(n)}`;
  return {
    upfrontCash: t,
    installmentsLabel: h,
    totalInstallments: p,
    totalCashPaid: d
  };
}
function rn(e) {
  return we(e.deal_terms, e.scenario);
}
function ln(e, t, n) {
  const o = structuredClone(e), [r, c] = t.split(".");
  return o[r][c] = n, o;
}
function sn(e) {
  const [t, n] = P(
    () => e ?? Fe()
  ), [o, r] = P({}), [c, i] = P(() => ({
    tier1: xe(e ?? Fe()),
    status: "idle"
  })), p = T((v, S) => {
    n((f) => {
      const u = ln(f, v, S);
      return i((g) => ({ ...g, tier1: xe(u) })), u;
    });
  }, []), d = T(() => {
    n((v) => {
      const S = Yt(v);
      if (r(S), Le(S))
        return i((f) => ({
          ...f,
          status: "error",
          error: "Validation failed"
        })), v;
      i((f) => ({ ...f, status: "computing" }));
      try {
        const f = rn(v);
        i({
          tier1: xe(v),
          status: "ok",
          lastComputedAtIso: (/* @__PURE__ */ new Date()).toISOString(),
          results: f
        });
      } catch (f) {
        i((u) => ({
          ...u,
          status: "error",
          error: f instanceof Error ? f.message : "Compute failed"
        }));
      }
      return v;
    });
  }, []), h = B(() => xe(t), [t]);
  return {
    draft: t,
    errors: o,
    preview: { ...c, tier1: h },
    setField: p,
    onBlurCompute: d
  };
}
function cn(e) {
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
    first_extension_premium_pct: w.first_extension_premium_pct,
    second_extension_start_year: t + 4,
    second_extension_end_year: t + 5,
    second_extension_premium_pct: w.second_extension_premium_pct,
    partial_buyout_allowed: !1,
    partial_buyout_min_fraction: 0.25,
    partial_buyout_increment_fraction: 0.25,
    buyer_purchase_option_enabled: !1,
    buyer_purchase_notice_days: 90,
    buyer_purchase_closing_days: 60,
    setup_fee_pct: w.setup_fee_pct,
    setup_fee_floor: w.setup_fee_floor,
    setup_fee_cap: w.setup_fee_cap,
    servicing_fee_monthly: w.servicing_fee_monthly,
    payment_admin_fee: w.payment_admin_fee,
    exit_admin_fee_amount: w.exit_admin_fee_amount,
    realtor_representation_mode: e.realtorMode,
    realtor_commission_pct: e.realtorPct / 100
  };
}
function un(e) {
  return {
    annual_appreciation: e.growthRatePct / 100,
    closing_cost_pct: 0,
    exit_year: e.exitYear
  };
}
const On = [
  "buyer",
  "homeowner",
  "realtor"
];
function dn(e) {
  const t = B(() => {
    const p = Fe();
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
  }, [e.initial]), { draft: n, errors: o, preview: r, setField: c, onBlurCompute: i } = sn(t);
  return /* @__PURE__ */ a(
    nn,
    {
      draft: n,
      errors: o,
      preview: r,
      persona: e.persona,
      setField: c,
      onBlurCompute: i,
      onSave: (p) => e.onSaved(p),
      onClose: e.onClose
    }
  );
}
function mn(e = 640) {
  const [t, n] = P(!1);
  return ce(() => {
    if (typeof window > "u") return;
    const o = window.matchMedia(`(max-width: ${e}px)`);
    n(o.matches);
    const r = (c) => n(c.matches);
    return o.addEventListener("change", r), () => o.removeEventListener("change", r);
  }, [e]), t;
}
function pn({ value: e, format: t }) {
  const n = ye(null), o = ye(e), r = ye(0);
  ce(() => {
    const i = o.current, p = e;
    if (o.current = p, i === p || !n.current) return;
    const d = 300, h = performance.now(), v = (S) => {
      const f = S - h, u = Math.min(f / d, 1), g = 1 - Math.pow(1 - u, 3), k = i + (p - i) * g;
      n.current && (t === "currency" ? n.current.textContent = _(k) : t === "percent" ? n.current.textContent = J(k) : n.current.textContent = k.toLocaleString(void 0, { maximumFractionDigits: 1 })), u < 1 && (r.current = requestAnimationFrame(v));
    };
    return r.current = requestAnimationFrame(v), () => cancelAnimationFrame(r.current);
  }, [e, t]);
  let c;
  return t === "currency" ? c = _(e) : t === "percent" ? c = J(e) : c = e.toLocaleString(void 0, { maximumFractionDigits: 1 }), /* @__PURE__ */ a("span", { ref: n, children: c });
}
function _n() {
  if (typeof window > "u") return !1;
  try {
    return new URLSearchParams(window.location.search).get("DEV_HARNESS") === "true" || !1;
  } catch {
    return !1;
  }
}
function fn() {
  if (!_n() || typeof window > "u") return null;
  try {
    const e = new URLSearchParams(window.location.search).get("devAuth");
    if (e === "editor" || e === "viewer" || e === "loggedOut")
      return e;
    const t = void 0;
  } catch {
  }
  return null;
}
function Ie(e, t) {
  if (typeof e == "string") return e;
  switch (t) {
    case "currency":
      return _(e);
    case "percent":
      return J(e);
    case "multiple":
      return `${e.toFixed(2)}×`;
    case "months":
      return `${e}`;
    default:
      return String(e);
  }
}
function yn(e) {
  return e === 1 ? "1 Year" : `${e} Years`;
}
const hn = `
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
`, Me = (e) => parseFloat(e.replace(/,/g, "")), Oe = (e) => {
  const t = parseInt(e, 10);
  return Number.isInteger(t) ? t : NaN;
};
function bn(e) {
  const {
    persona: t,
    mode: n = "marketing",
    canEdit: o,
    onEvent: r,
    onDraftSnapshot: c,
    onShareSummary: i,
    onSave: p
  } = e, d = n === "app", h = n === "marketing", [v, S] = P(t);
  ce(() => {
    S(t);
  }, [t]);
  const f = h ? v : t, u = mn(), g = fn(), k = g === "editor" ? !0 : g === "viewer" || g === "loggedOut" ? !1 : o ?? !1, [D, L] = P(!1), [M, j] = P(6e5), [F, U] = P(1e5), [y, C] = P(0), [R, re] = P(0), [l, b] = P(10), [x, z] = P(4), [E, Q] = P("NONE"), [A, q] = P(0), $ = ae(M, j, {
    format: (m) => m.toLocaleString(),
    parse: Me,
    validate: (m) => m > 0
  }), H = ae(F, U, {
    format: (m) => m.toLocaleString(),
    parse: Me,
    validate: (m) => m >= 0
  }), Z = ae(y, C, {
    format: (m) => m.toLocaleString(),
    parse: Me,
    validate: (m) => m >= 0
  }), ee = ae(R, re, {
    format: String,
    parse: Oe,
    validate: (m) => Number.isInteger(m) && m >= 0 && m <= 360
  }), W = ae(l, b, {
    format: String,
    parse: Oe,
    validate: (m) => Number.isInteger(m) && m >= 1 && m <= 30
  }), pe = ae(x, z, {
    format: String,
    parse: parseFloat,
    validate: (m) => m >= -50 && m <= 50
  }), _e = ae(A, q, {
    format: String,
    parse: parseFloat,
    validate: (m) => m >= 0 && m <= 6
  });
  ce(() => {
    r?.({ type: "calculator_used", persona: f });
  }, [f, r]);
  const he = B(
    () => ({
      propertyValue: M,
      upfrontPayment: F,
      monthlyPayment: y,
      numberOfPayments: R,
      exitYear: l,
      growthRatePct: x,
      realtorMode: E,
      realtorPct: A
    }),
    [
      M,
      F,
      y,
      R,
      l,
      x,
      E,
      A
    ]
  ), ie = B(
    () => cn(he),
    [he]
  ), le = B(
    () => un(he),
    [he]
  ), Ye = B(
    () => ({ deal_terms: ie, scenario: le }),
    [ie, le]
  ), V = B(
    () => we(ie, le),
    [ie, le]
  ), te = B(
    () => Nt(
      f,
      ie,
      le,
      V
    ),
    [f, ie, le, V]
  ), fe = l * 12, Y = B(
    () => d ? wt({
      homeValue: M,
      initialBuyAmount: F,
      termYears: l,
      annualGrowthRate: x / 100
    }) : null,
    [d, M, F, l, x]
  ), Ee = B(
    () => Y ? St(Y) : null,
    [Y]
  ), He = T(() => {
    if (r?.({ type: "save_clicked", persona: f }), p && Y) {
      const m = Bt(Y.normalizedInputs);
      p(m);
    }
  }, [Y, p, r, f]), Ue = T(async () => {
    if (r?.({ type: "save_continue_clicked", persona: f }), c) {
      const m = {
        homeValue: M,
        initialBuyAmount: F,
        termYears: l,
        annualGrowthRate: x / 100
      }, se = {
        standard_net_payout: V.extension_adjusted_buyout_amount,
        early_net_payout: V.extension_adjusted_buyout_amount,
        late_net_payout: V.extension_adjusted_buyout_amount,
        standard_settlement_month: fe,
        early_settlement_month: fe,
        late_settlement_month: fe
      }, [Je, Qe] = await Promise.all([
        me(m),
        me(se)
      ]);
      c({
        contract_version: ue,
        schema_version: de,
        persona: f,
        mode: "marketing",
        inputs: m,
        basic_results: se,
        input_hash: Je,
        output_hash: Qe,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  }, [
    f,
    M,
    F,
    l,
    x,
    V,
    fe,
    c,
    r
  ]), qe = T(() => {
    r?.({ type: "share_clicked", persona: f }), i && i({
      contract_version: ue,
      schema_version: de,
      persona: f,
      inputs: {
        homeValue: M,
        initialBuyAmount: F,
        termYears: l,
        annualGrowthRate: x / 100
      },
      basic_results: {
        standard_net_payout: V.extension_adjusted_buyout_amount,
        early_net_payout: V.extension_adjusted_buyout_amount,
        late_net_payout: V.extension_adjusted_buyout_amount
      },
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    });
  }, [
    f,
    M,
    F,
    l,
    x,
    V,
    i,
    r
  ]), Ge = B(() => {
    const m = [
      { label: "Property", value: _(M) },
      { label: "Upfront", value: _(F) },
      { label: "Monthly", value: _(y) },
      { label: "# Months", value: String(R) },
      { label: "Exit Year", value: String(l) },
      { label: "Growth", value: J(x / 100) }
    ];
    return E !== "NONE" && m.push({ label: "Realtor", value: `${E} ${A}%` }), m;
  }, [
    M,
    F,
    y,
    R,
    l,
    x,
    E,
    A
  ]), Ke = M * Math.pow(1 + x / 100, l), G = {
    display: "block",
    fontSize: u ? 14 : 13,
    color: "#374151",
    marginBottom: 6,
    fontWeight: 500,
    letterSpacing: "-0.01em"
  }, K = {
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
  }, X = {
    marginBottom: u ? 20 : 16
  }, ne = {
    marginTop: 4,
    fontSize: 11,
    color: "#b91c1c",
    fontWeight: 500
  }, Ae = {
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
  }, Ce = {
    color: "#9ca3af",
    fontWeight: 400
  }, Te = {
    fontWeight: 600,
    color: "#111827"
  }, Xe = [
    {
      label: "Home Value Today",
      value: M,
      format: "currency"
    },
    {
      label: "Cash Unlocked Today",
      value: F,
      format: "currency"
    },
    {
      label: R > 0 ? `Monthly Contribution / ${R} Month${R === 1 ? "" : "s"}` : "Monthly Contribution",
      value: y,
      format: "currency"
    },
    {
      label: `Projected Value in ${yn(l)}`,
      value: Ke,
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
      "data-persona": f,
      "data-mode": n,
      children: [
        /* @__PURE__ */ a("style", { children: hn }),
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
              children: Ge.map((m, se) => /* @__PURE__ */ s("span", { style: Ae, children: [
                /* @__PURE__ */ s("span", { style: Ce, children: [
                  m.label,
                  ":"
                ] }),
                /* @__PURE__ */ a("span", { style: Te, children: m.value })
              ] }, se))
            }
          ),
          k && /* @__PURE__ */ a(
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
                /* @__PURE__ */ s("div", { style: X, children: [
                  /* @__PURE__ */ a("label", { style: G, children: oe("deal_terms.property_value", f, "Home Value ($)") }),
                  /* @__PURE__ */ a(
                    "input",
                    {
                      type: "text",
                      inputMode: "numeric",
                      style: K,
                      value: $.displayValue,
                      onFocus: $.onFocus,
                      onChange: $.onChange,
                      onBlur: $.onBlur
                    }
                  ),
                  $.isInvalid && /* @__PURE__ */ a("div", { style: ne, children: "Enter a valid positive amount" })
                ] }),
                /* @__PURE__ */ s("div", { style: X, children: [
                  /* @__PURE__ */ a("label", { style: G, children: oe("deal_terms.upfront_payment", f, "Upfront Payment ($)") }),
                  /* @__PURE__ */ a(
                    "input",
                    {
                      type: "text",
                      inputMode: "numeric",
                      style: K,
                      value: H.displayValue,
                      onFocus: H.onFocus,
                      onChange: H.onChange,
                      onBlur: H.onBlur
                    }
                  ),
                  H.isInvalid && /* @__PURE__ */ a("div", { style: ne, children: "Enter a valid amount (0 or more)" })
                ] }),
                /* @__PURE__ */ s("div", { style: X, children: [
                  /* @__PURE__ */ a("label", { style: G, children: oe("deal_terms.monthly_payment", f, "Monthly Installment ($)") }),
                  /* @__PURE__ */ a(
                    "input",
                    {
                      type: "text",
                      inputMode: "numeric",
                      style: K,
                      value: Z.displayValue,
                      onFocus: Z.onFocus,
                      onChange: Z.onChange,
                      onBlur: Z.onBlur
                    }
                  ),
                  Z.isInvalid && /* @__PURE__ */ a("div", { style: ne, children: "Enter a valid amount (0 or more)" })
                ] }),
                /* @__PURE__ */ s("div", { style: X, children: [
                  /* @__PURE__ */ a("label", { style: G, children: "Number of Monthly Payments" }),
                  /* @__PURE__ */ a(
                    "input",
                    {
                      type: "text",
                      inputMode: "numeric",
                      style: K,
                      value: ee.displayValue,
                      onFocus: ee.onFocus,
                      onChange: ee.onChange,
                      onBlur: ee.onBlur
                    }
                  ),
                  ee.isInvalid && /* @__PURE__ */ a("div", { style: ne, children: "Enter a whole number 0–360" })
                ] }),
                /* @__PURE__ */ s("div", { style: X, children: [
                  /* @__PURE__ */ a("label", { style: G, children: oe("scenario.exit_year", f, "Target Exit Year") }),
                  /* @__PURE__ */ a(
                    "input",
                    {
                      type: "text",
                      inputMode: "numeric",
                      style: K,
                      value: W.displayValue,
                      onFocus: W.onFocus,
                      onChange: W.onChange,
                      onBlur: W.onBlur
                    }
                  ),
                  W.isInvalid && /* @__PURE__ */ a("div", { style: ne, children: "Enter a year between 1 and 30" })
                ] }),
                /* @__PURE__ */ s("div", { style: X, children: [
                  /* @__PURE__ */ a("label", { style: G, children: "Annual Growth Rate (assumption)" }),
                  /* @__PURE__ */ a(
                    "input",
                    {
                      type: "text",
                      inputMode: "decimal",
                      style: K,
                      value: pe.displayValue,
                      onFocus: pe.onFocus,
                      onChange: pe.onChange,
                      onBlur: pe.onBlur
                    }
                  ),
                  pe.isInvalid && /* @__PURE__ */ a("div", { style: ne, children: "Enter a growth rate (e.g. 4)" })
                ] }),
                /* @__PURE__ */ s("div", { style: X, children: [
                  /* @__PURE__ */ a("label", { style: G, children: oe(
                    "deal_terms.realtor_representation_mode",
                    f,
                    "Realtor Representation"
                  ) }),
                  /* @__PURE__ */ s(
                    "select",
                    {
                      value: E,
                      onChange: (m) => {
                        Q(m.target.value), m.target.value === "NONE" && q(0);
                      },
                      style: {
                        ...K,
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
                E !== "NONE" && /* @__PURE__ */ s("div", { style: X, children: [
                  /* @__PURE__ */ a("label", { style: G, children: oe("deal_terms.realtor_commission_pct", f, "Commission (%)") }),
                  /* @__PURE__ */ a(
                    "input",
                    {
                      type: "text",
                      inputMode: "decimal",
                      style: K,
                      value: _e.displayValue,
                      onFocus: _e.onFocus,
                      onChange: _e.onChange,
                      onBlur: _e.onBlur
                    }
                  ),
                  _e.isInvalid && /* @__PURE__ */ a("div", { style: ne, children: "Enter a commission % between 0 and 6" })
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
                              J(w.setup_fee_pct),
                              " (min ",
                              _(w.setup_fee_floor),
                              ", max ",
                              _(w.setup_fee_cap),
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
                              _(w.servicing_fee_monthly)
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
                              _(w.exit_admin_fee_amount)
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
                    children: Xe.map((m) => /* @__PURE__ */ s(
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
                          }, children: /* @__PURE__ */ a(pn, { value: m.value, format: m.format }) }),
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
                      /* @__PURE__ */ a("div", { style: { fontSize: 13, color: "#6b7280", marginBottom: 4, fontWeight: 500 }, children: te.hero.label }),
                      /* @__PURE__ */ a("div", { style: {
                        fontSize: u ? 22 : 26,
                        fontWeight: 700,
                        color: "#111827",
                        letterSpacing: "-0.02em"
                      }, children: Ie(
                        te.hero.value,
                        te.hero.valueFormat
                      ) }),
                      te.hero.subtitle && /* @__PURE__ */ a("div", { style: { fontSize: 13, color: "#9ca3af", marginTop: 6, lineHeight: 1.4 }, children: te.hero.subtitle })
                    ]
                  }
                ),
                h && /* @__PURE__ */ a("div", { style: { marginBottom: 20, padding: u ? "4px 0" : "8px 0", width: "100%", overflow: "hidden" }, children: /* @__PURE__ */ a(
                  Vt,
                  {
                    bars: te.chartSpec.bars,
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
                    children: te.strip.map((m, se) => /* @__PURE__ */ s("span", { style: Ae, children: [
                      /* @__PURE__ */ s("span", { style: Ce, children: [
                        m.label,
                        ":"
                      ] }),
                      /* @__PURE__ */ a("span", { style: Te, children: Ie(m.value, m.valueFormat) })
                    ] }, se))
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
                      At(fe),
                      " · Illustrative Buyout: ",
                      _(V.extension_adjusted_buyout_amount)
                    ] })
                  }
                ),
                !h && Y && /* @__PURE__ */ s(Se, { children: [
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
                        { label: "Early", data: Y.settlements.early },
                        {
                          label: "Standard",
                          data: Y.settlements.standard
                        },
                        { label: "Late", data: Y.settlements.late }
                      ].map((m) => /* @__PURE__ */ s(
                        "div",
                        {
                          style: {
                            padding: "12px 14px",
                            background: "#f9fafb",
                            borderRadius: 10,
                            border: "1px solid #f3f4f6",
                            display: "grid",
                            gridTemplateColumns: u ? "repeat(3, minmax(0, 1fr))" : "repeat(4, minmax(0, 1fr))",
                            gap: 8,
                            alignItems: "center"
                          },
                          children: [
                            /* @__PURE__ */ s("div", { children: [
                              /* @__PURE__ */ a("div", { style: { fontSize: 11, color: "#9ca3af" }, children: "Scenario" }),
                              /* @__PURE__ */ a("div", { style: { fontWeight: 600, fontSize: 13, color: "#111827" }, children: m.label })
                            ] }),
                            /* @__PURE__ */ s("div", { children: [
                              /* @__PURE__ */ a("div", { style: { fontSize: 11, color: "#9ca3af" }, children: "Exit Year" }),
                              /* @__PURE__ */ s("div", { style: { fontSize: 13, color: "#111827" }, children: [
                                "Yr ",
                                Math.round(m.data.settlementMonth / 12)
                              ] })
                            ] }),
                            /* @__PURE__ */ s("div", { children: [
                              /* @__PURE__ */ a("div", { style: { fontSize: 11, color: "#9ca3af" }, children: "Base Buyout" }),
                              /* @__PURE__ */ a("div", { style: { fontSize: 13, color: "#111827" }, children: _(m.data.rawPayout) })
                            ] }),
                            /* @__PURE__ */ s("div", { children: [
                              /* @__PURE__ */ a("div", { style: { fontSize: 11, color: "#9ca3af" }, children: "Adj. Buyout" }),
                              /* @__PURE__ */ a("div", { style: { fontWeight: 600, fontSize: 13, color: "#111827" }, children: _(m.data.netPayout) })
                            ] })
                          ]
                        },
                        m.label
                      ))
                    }
                  )
                ] }),
                !h && Ee && /* @__PURE__ */ a("div", { style: { marginBottom: 20, width: "100%", overflow: "hidden" }, children: /* @__PURE__ */ a(Et, { series: Ee, width: 520, height: u ? 200 : 260 }) }),
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
                      h && /* @__PURE__ */ s(Se, { children: [
                        /* @__PURE__ */ a(
                          "button",
                          {
                            type: "button",
                            onClick: Ue,
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
                            onClick: qe,
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
                          onClick: He,
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
        D && k && /* @__PURE__ */ a(
          dn,
          {
            initial: Ye,
            persona: f,
            onClose: () => L(!1),
            onSaved: (m) => {
              j(m.deal_terms.property_value), U(m.deal_terms.upfront_payment), C(m.deal_terms.monthly_payment), re(m.deal_terms.number_of_payments), b(m.scenario.exit_year), z(m.scenario.annual_appreciation * 100), Q(m.deal_terms.realtor_representation_mode), q(m.deal_terms.realtor_commission_pct * 100), L(!1);
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
              /* @__PURE__ */ a("strong", { children: f }),
              " · ",
              "Mode: ",
              /* @__PURE__ */ a("strong", { children: n }),
              g && /* @__PURE__ */ s(Se, { children: [
                " ",
                "·",
                " DEV_AUTH: ",
                /* @__PURE__ */ a("strong", { children: g })
              ] }),
              " · ",
              _(M),
              " home ",
              "·",
              " ",
              _(F),
              " ",
              "upfront ",
              "·",
              " ",
              _(y),
              "\\u00d7",
              R,
              "mo ",
              "·",
              " ",
              l,
              "yr ",
              "·",
              " ",
              J(x / 100),
              " growth"
            ]
          }
        )
      ]
    }
  );
}
function Wn(e) {
  return /* @__PURE__ */ a(bn, { ...e });
}
function gn({ items: e }) {
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
function xn(e, t) {
  return t <= 0 ? 0 : Math.min(1, Math.max(0, e / t));
}
function vn({ results: e }) {
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
                /* @__PURE__ */ a("span", { style: { fontSize: 12, fontWeight: 600, color: "#111827" }, children: _(o.value) })
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
                    width: `${(xn(o.value, n) * 100).toFixed(1)}%`,
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
const wn = [
  { key: "cash_flow", label: "Cash Flow" },
  { key: "ownership", label: "Ownership" },
  { key: "protections", label: "Exit Terms" },
  { key: "fees", label: "Fees" },
  { key: "assumptions", label: "Assumptions" }
];
function N(e) {
  return (e * 100).toFixed(2) + "%";
}
function Sn({ rows: e }) {
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
function kn(e, t) {
  const n = [
    {
      label: "Buyout Amount",
      value: _(e.extension_adjusted_buyout_amount),
      sublabel: `Window: ${e.current_window}`
    },
    {
      label: "Participation Value",
      value: _(e.current_participation_value)
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
      value: _(e.actual_buyer_funding_to_date),
      sublabel: `${N(t.scenario.annual_appreciation)} / yr`
    }
  ], o = t.deal_terms.realtor_representation_mode, r = t.deal_terms.realtor_commission_pct;
  return o !== "NONE" ? n.push({
    label: "Realtor Fee (est.)",
    value: _(e.realtor_fee_total_projected),
    sublabel: `${N(r)} · ${o}`
  }) : n.push({
    label: "Realtor Fee",
    value: _(0),
    sublabel: "No realtor"
  }), n;
}
function Pn(e) {
  return [
    {
      label: "Total scheduled funding",
      value: _(e.total_scheduled_buyer_funding)
    },
    {
      label: "Actual funding to date",
      value: _(e.actual_buyer_funding_to_date)
    },
    {
      label: "Funding completion factor",
      value: N(e.funding_completion_factor)
    },
    {
      label: "Base buyout amount",
      value: _(e.base_buyout_amount)
    },
    {
      label: "Extension-adjusted buyout",
      value: _(e.extension_adjusted_buyout_amount)
    },
    {
      label: "Buyer appreciation claim",
      value: _(e.buyer_appreciation_claim)
    },
    {
      label: "Current window",
      value: e.current_window
    }
  ];
}
function Mn(e, t) {
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
      value: _(t.current_participation_value)
    },
    {
      label: "Current contract value",
      value: _(t.current_contract_value)
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
function Fn(e, t) {
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
      value: t.partial_buyout_amount_25 != null ? _(t.partial_buyout_amount_25) : "—"
    },
    {
      label: "Partial buyout 50%",
      value: t.partial_buyout_amount_50 != null ? _(t.partial_buyout_amount_50) : "—"
    },
    {
      label: "Partial buyout 75%",
      value: t.partial_buyout_amount_75 != null ? _(t.partial_buyout_amount_75) : "—"
    }
  ), t.discount_purchase_price != null && n.push({
    label: "Discount purchase price",
    value: _(t.discount_purchase_price)
  }), n;
}
function Rn(e, t) {
  const n = [
    {
      label: "Setup fee (%)",
      value: N(e.deal_terms.setup_fee_pct)
    },
    {
      label: "Setup fee (amount)",
      value: _(t.fractpath_setup_fee_amount)
    },
    {
      label: "Servicing fee (monthly)",
      value: _(e.deal_terms.servicing_fee_monthly)
    },
    {
      label: "Payment admin fee",
      value: _(e.deal_terms.payment_admin_fee)
    },
    {
      label: "Exit admin fee",
      value: _(e.deal_terms.exit_admin_fee_amount)
    },
    {
      label: "FractPath revenue to date",
      value: _(t.fractpath_revenue_to_date)
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
    value: _(t.realtor_fee_total_projected)
  }), n;
}
function En(e) {
  const t = [
    {
      label: "Annual appreciation",
      value: N(e.scenario.annual_appreciation)
    },
    { label: "Exit year", value: `${e.scenario.exit_year} yr` },
    { label: "Closing costs", value: N(e.scenario.closing_cost_pct) },
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
    value: _(e.scenario.fmv_override)
  }), t;
}
function An(e, t, n) {
  switch (e) {
    case "cash_flow":
      return Pn(n);
    case "ownership":
      return Mn(t, n);
    case "protections":
      return Fn(t, n);
    case "fees":
      return Rn(t, n);
    case "assumptions":
      return En(t);
  }
}
function Vn({
  persona: e,
  status: t,
  inputs: n,
  results: o
}) {
  const [r, c] = P("cash_flow"), i = kn(o, n), p = An(r, n, o);
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
        /* @__PURE__ */ a("div", { style: { padding: "14px 18px" }, children: /* @__PURE__ */ a(gn, { items: i }) }),
        /* @__PURE__ */ a("div", { style: { padding: "0 18px 14px" }, children: /* @__PURE__ */ a(vn, { results: o }) }),
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
              children: wn.map((d) => /* @__PURE__ */ a(
                "button",
                {
                  type: "button",
                  onClick: () => c(d.key),
                  style: {
                    padding: "9px 14px",
                    border: "none",
                    borderBottom: r === d.key ? "2px solid #111827" : "2px solid transparent",
                    background: "none",
                    fontSize: 12,
                    fontWeight: r === d.key ? 600 : 400,
                    color: r === d.key ? "#111827" : "#6b7280",
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
          /* @__PURE__ */ a("div", { style: { padding: "14px 18px" }, children: /* @__PURE__ */ a(Sn, { rows: p }) })
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
function Ln({ value: e, anchors: t, onCommit: n, parseRaw: o }) {
  const [r, c] = P(""), [i, p] = P(!1), d = t.some((g) => g.value === e), h = T(
    (g) => {
      p(!1), c(""), n(g);
    },
    [n]
  ), v = T(() => {
    p(!0);
  }, []), S = T((g) => {
    c(g);
  }, []), f = T(() => {
    if (!r) {
      p(!1);
      return;
    }
    const k = (o ?? ((D) => parseFloat(D.replace(/,/g, ""))))(r);
    Number.isFinite(k) && n(k), p(!1);
  }, [r, n, o]), u = i ? r : d ? "" : String(e);
  return {
    isAnchorMatch: d && !i,
    displayCustom: u,
    selectAnchor: h,
    focusCustom: v,
    changeCustom: S,
    blurCustom: f
  };
}
export {
  ue as CONTRACT_VERSION,
  dn as DealEditModal,
  gn as DealKpiStrip,
  Vn as DealSnapshotView,
  Et as EquityChart,
  vn as EquityTransferChart,
  w as FEE_DEFAULTS,
  Wn as FractPathCalculatorWidget,
  On as MARKETING_PERSONAS,
  de as SCHEMA_VERSION,
  St as buildChartSeries,
  Bn as buildDraftSnapshot,
  Bt as buildFullDealSnapshotV1,
  In as buildSavePayload,
  Nn as buildShareSummary,
  wt as computeScenario,
  me as deterministicHash,
  oe as getLabel,
  zn as getPersonaConfig,
  $n as getSummaryOrder,
  ht as normalizeInputs,
  Nt as resolvePersonaPresentation,
  Ln as useKioskInput
};
