export const FEE_DEFAULTS = {
  setup_fee_pct: 0.023,
  setup_fee_floor: 1_750,
  setup_fee_cap: 18_000,
  servicing_fee_monthly: 59,
  payment_admin_fee: 4,
  exit_admin_fee_amount: 4_500,
  first_extension_premium_pct: 0.06,
  second_extension_premium_pct: 0.12,
} as const;
