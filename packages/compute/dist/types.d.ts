export type RealtorRepresentationMode = "BUYER" | "SELLER" | "DUAL" | "NONE";
export type ContractWindow = "pre_target" | "target_exit" | "first_extension" | "second_extension" | "post_long_stop";
export interface DealTerms {
    property_value: number;
    upfront_payment: number;
    monthly_payment: number;
    number_of_payments: number;
    minimum_hold_years: number;
    contract_maturity_years: number;
    target_exit_year: number;
    target_exit_window_start_year: number;
    target_exit_window_end_year: number;
    long_stop_year: number;
    first_extension_start_year: number;
    first_extension_end_year: number;
    first_extension_premium_pct: number;
    second_extension_start_year: number;
    second_extension_end_year: number;
    second_extension_premium_pct: number;
    partial_buyout_allowed: boolean;
    partial_buyout_min_fraction: number;
    partial_buyout_increment_fraction: number;
    buyer_purchase_option_enabled: boolean;
    buyer_purchase_notice_days: number;
    buyer_purchase_closing_days: number;
    setup_fee_pct: number;
    setup_fee_floor: number;
    setup_fee_cap: number;
    servicing_fee_monthly: number;
    payment_admin_fee: number;
    exit_admin_fee_amount: number;
    realtor_representation_mode: RealtorRepresentationMode;
    realtor_commission_pct: number;
}
export interface ScenarioAssumptions {
    annual_appreciation: number;
    closing_cost_pct: number;
    exit_year: number;
    fmv_override?: number;
}
export interface DealResults {
    total_scheduled_buyer_funding: number;
    actual_buyer_funding_to_date: number;
    funding_completion_factor: number;
    scheduled_buyer_appreciation_share: number;
    effective_buyer_appreciation_share: number;
    buyer_base_capital_component: number;
    buyer_appreciation_claim: number;
    current_contract_value: number;
    current_participation_value: number;
    base_buyout_amount: number;
    extension_adjusted_buyout_amount: number;
    partial_buyout_amount_25: number | null;
    partial_buyout_amount_50: number | null;
    partial_buyout_amount_75: number | null;
    discount_purchase_price: number | null;
    current_window: ContractWindow;
    fractpath_setup_fee_amount: number;
    fractpath_revenue_to_date: number;
    realtor_fee_total_projected: number;
    compute_version: string;
}
