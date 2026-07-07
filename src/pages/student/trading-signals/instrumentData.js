// ── Instrument Categories & Data ─────────────────────────────────────
// Re-exports the centralized asset class definitions from strategyConfig
// as the instrument categories used by InstrumentFilterDropdown and other
// consumers throughout the frontend.
//
// All instrument data is maintained in src/config/strategyConfig.js.
// This file exists only to preserve the existing import interface.

import { ASSET_CLASSES } from "@/config/strategyConfig";

const instrumentCategories = ASSET_CLASSES;

export default instrumentCategories;
