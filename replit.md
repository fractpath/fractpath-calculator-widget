# FractPath Calculator Widget

## Overview
The FractPath Calculator Widget is an embeddable React-based ES module designed for the FractPath Scenario Tool. Its primary purpose is to provide a versatile financial calculator experience for various user personas (buyer, homeowner, investor, realtor, operations). The widget supports two main modes: a streamlined "marketing" mode for high-level summaries and a comprehensive "app" mode for detailed financial analysis. It features controlled inputs, structured payload emissions (DraftSnapshot, ShareSummary, SavePayload), and is built for seamless integration into external websites. The project aims to be the single source of financial truth for scenario computations, offering a robust and deterministic tool for real estate financial analysis.

## User Preferences
None.

## System Architecture
The widget is built using React 19, TypeScript, and Vite 7, with Vitest for testing. It outputs an ES module (`dist/index.js`). The core computational logic resides in the `@fractpath/compute` package (v10.2.0), ensuring a single, pure-functional source of financial truth.

**Key Architectural Components:**
- **Widget Core**: `src/widget/` orchestrates the calculator's UI, persona-based configurations, data formatting, snapshot building, and deterministic hashing.
- **Calculator Engine**: `src/calc/` houses the `computeScenario` function and chart series builders, utilizing the canonical `@fractpath/compute` for all financial calculations.
- **Editing Layer**: `src/widget/editing/` manages a unified draft state, provides Tier 1 previews, triggers computations on blur, and handles input validation. It uses a metadata-driven field registry (`fieldMeta.ts`) and a tab configuration (`tabConfig.ts`) for rendering inputs.
- **UI/UX**:
    - Supports persona-based presentation (`personaPresentation.ts`) for hero metrics, summary strips, and marketing bullets, ensuring content is tailored without direct computation.
    - Features modal components like `DealEditModal`, `KioskSelect`, `PreviewPanel`, and `HelpTooltip` for interactive input and information display.
    - Visualizations include `EquityChart.tsx` (SVG line chart) and `SimpleBarChart.tsx` (SVG bar chart) for displaying financial outcomes.
    - Two primary modes: "marketing" for basic results and "app" for full analysis including detailed outputs and equity charts.
    - Design utilizes portal-rendered tooltips, stable modal heights, and shimmer loading indicators for enhanced user experience.
- **Data Flow & Payloads**: The widget emits structured payloads: `DraftSnapshot` (for saving draft states), `ShareSummary` (for sharing high-level results), and `SavePayload` (containing full `ScenarioInputs/Outputs`).
- **Versioning**: Strict versioning is enforced across the compute module (`COMPUTE_VERSION`), integration contract (`CONTRACT_VERSION`), and payload schemas (`SCHEMA_VERSION`), all managed as single sources of truth.
- **Drift Guards**: Automated tests ensure version alignment, canonical field coverage, and determinism across various computational paths.

## External Dependencies
- **@fractpath/compute**: Version 10.2.0, located at `packages/compute/`, serves as the canonical financial computation library. It's a pure-functional module, free from external dependencies like databases or network calls.