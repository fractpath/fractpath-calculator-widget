export type Unit = "currency" | "percent" | "years" | "months" | "number" | "enum" | "info";
export type Control = "kiosk" | "slider" | "enum" | "readonly" | "info";
export type FieldKey = "deal_terms.property_value" | "deal_terms.upfront_payment" | "deal_terms.monthly_payment" | "deal_terms.number_of_payments" | "scenario.annual_appreciation" | "scenario.exit_year" | "scenario.closing_cost_pct" | "deal_terms.minimum_hold_years" | "deal_terms.contract_maturity_years" | "deal_terms.target_exit_year" | "deal_terms.first_extension_premium_pct" | "deal_terms.second_extension_premium_pct" | "deal_terms.partial_buyout_allowed" | "deal_terms.setup_fee_pct" | "deal_terms.servicing_fee_monthly" | "deal_terms.payment_admin_fee" | "deal_terms.exit_admin_fee_amount" | "deal_terms.realtor_representation_mode" | "deal_terms.realtor_commission_pct" | "__disclosure__";
export type Anchor = {
    label: string;
    value: number;
};
export type DynamicPercentAnchors = {
    sourceKey: "deal_terms.property_value";
    percents: [number, number, number, number];
    rounding: "nearest_100";
    min?: number;
    maxPercentOfSource?: number;
    labelPercents?: [string, string, string, string];
};
export type SliderSpec = {
    min: number;
    max: number;
    step: number;
};
export type FieldMeta = {
    key: FieldKey;
    label: string;
    unit: Unit;
    control: Control;
    simpleDefinition: string;
    impact: string;
    formula: string;
    anchors?: [Anchor, Anchor, Anchor, Anchor];
    dynamicPercentAnchors?: DynamicPercentAnchors;
    slider?: SliderSpec;
    recommendedRange?: {
        min: number;
        max: number;
    };
    hardRange?: {
        min: number;
        max: number;
    };
    options?: Array<{
        label: string;
        value: string;
    }>;
    readOnly?: boolean;
    sectionHint?: string;
};
export declare const FIELD_META: FieldMeta[];
export declare function getFieldMeta(key: FieldKey): FieldMeta | undefined;
export declare function computeDynamicAnchors(meta: FieldMeta, propertyValue: number): Anchor[];
//# sourceMappingURL=fieldMeta.d.ts.map