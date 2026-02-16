export const roomTypeOptions = [
  "living_room",
  "kitchen",
  "bedroom",
  "bathroom",
  "dining",
  "hallway",
  "office",
  "kids_room",
  "terrace",
  "meeting_room",
  "reception",
  "open_space",
  "conference_room",
  "kitchenette",
  "storage_room",
  "wc",
  "commercial_zone",
] as const;

export type RoomType = (typeof roomTypeOptions)[number];

export const styleOptions = [
  "modern_minimal",
  "japandi",
  "warm_luxury",
  "scandinavian",
  "contemporary_classic",
  "soft_industrial",
  "mediterranean_warm",
  "dark_elegant",
  "natural_organic",
  "boho",
  "boutique_hotel",
] as const;

export type StyleOption = (typeof styleOptions)[number];

export const moodOptions = [
  "cozy_warm",
  "bright_airy",
  "calm_minimal",
  "dramatic_elegant",
  "soft_romantic",
  "bold_artistic",
] as const;

export type MoodOption = (typeof moodOptions)[number];

export const paletteOptions = [
  "warm_neutrals",
  "greige_walnut",
  "cream_gold",
  "white_black_accents",
  "earthy_greens",
  "burgundy_accent",
  "stone_taupe",
  "soft_pastel_neutrals",
] as const;

export type PaletteOption = (typeof paletteOptions)[number];

export const lightingScenarioOptions = [
  "flat_ceiling_only",
  "layered_lighting",
  "track_spot_zones",
  "pendants_dining",
  "indirect_led",
] as const;

export type LightingScenarioOption = (typeof lightingScenarioOptions)[number];

export const qualityTierOptions = ["basic", "mid", "premium", "mixed"] as const;

export type QualityTierOption = (typeof qualityTierOptions)[number];

export const budgetTierOptions = ["starter", "balanced", "premium"] as const;

export type BudgetTierOption = (typeof budgetTierOptions)[number];

export const keepItemOptions = [
  "sofa",
  "dining_table",
  "chairs",
  "bed",
  "wardrobes",
  "appliances",
  "artwork",
] as const;

export type KeepItemOption = (typeof keepItemOptions)[number];

export const adminDefaults = {
  roomTemplates: {
    living_room: {
      width_mm: 4200,
      length_mm: 5200,
      ceiling_height_mm: 2700,
      door_width_mm: 900,
      window_width_mm: 1600,
      window_sill_height_mm: 900,
    },
    kitchen: {
      width_mm: 3000,
      length_mm: 3600,
      ceiling_height_mm: 2700,
      door_width_mm: 800,
      window_width_mm: 1200,
      window_sill_height_mm: 920,
    },
    bedroom: {
      width_mm: 3400,
      length_mm: 4200,
      ceiling_height_mm: 2700,
      door_width_mm: 800,
      window_width_mm: 1400,
      window_sill_height_mm: 900,
    },
    bathroom: {
      width_mm: 1900,
      length_mm: 2500,
      ceiling_height_mm: 2600,
      door_width_mm: 700,
      window_width_mm: 600,
      window_sill_height_mm: 1500,
    },
    dining: {
      width_mm: 2800,
      length_mm: 3200,
      ceiling_height_mm: 2700,
      door_width_mm: 800,
      window_width_mm: 1400,
      window_sill_height_mm: 900,
    },
    hallway: {
      width_mm: 1400,
      length_mm: 3400,
      ceiling_height_mm: 2700,
      door_width_mm: 800,
      window_width_mm: 0,
      window_sill_height_mm: 0,
    },
    office: {
      width_mm: 2600,
      length_mm: 3200,
      ceiling_height_mm: 2700,
      door_width_mm: 800,
      window_width_mm: 1200,
      window_sill_height_mm: 900,
    },
    kids_room: {
      width_mm: 2900,
      length_mm: 3600,
      ceiling_height_mm: 2700,
      door_width_mm: 800,
      window_width_mm: 1200,
      window_sill_height_mm: 900,
    },
    terrace: {
      width_mm: 2200,
      length_mm: 3500,
      ceiling_height_mm: 0,
      door_width_mm: 1000,
      window_width_mm: 0,
      window_sill_height_mm: 0,
    },
    meeting_room: {
      width_mm: 3200,
      length_mm: 4400,
      ceiling_height_mm: 3000,
      door_width_mm: 900,
      window_width_mm: 1800,
      window_sill_height_mm: 900,
    },
    reception: {
      width_mm: 3000,
      length_mm: 4800,
      ceiling_height_mm: 3000,
      door_width_mm: 1100,
      window_width_mm: 2200,
      window_sill_height_mm: 900,
    },
    open_space: {
      width_mm: 6200,
      length_mm: 8200,
      ceiling_height_mm: 3200,
      door_width_mm: 1100,
      window_width_mm: 2400,
      window_sill_height_mm: 900,
    },
    conference_room: {
      width_mm: 4200,
      length_mm: 6200,
      ceiling_height_mm: 3000,
      door_width_mm: 1000,
      window_width_mm: 1800,
      window_sill_height_mm: 900,
    },
    kitchenette: {
      width_mm: 2200,
      length_mm: 3200,
      ceiling_height_mm: 2900,
      door_width_mm: 850,
      window_width_mm: 1200,
      window_sill_height_mm: 900,
    },
    storage_room: {
      width_mm: 1800,
      length_mm: 2400,
      ceiling_height_mm: 2900,
      door_width_mm: 800,
      window_width_mm: 0,
      window_sill_height_mm: 0,
    },
    wc: {
      width_mm: 1600,
      length_mm: 2200,
      ceiling_height_mm: 2900,
      door_width_mm: 750,
      window_width_mm: 0,
      window_sill_height_mm: 0,
    },
    commercial_zone: {
      width_mm: 5800,
      length_mm: 7600,
      ceiling_height_mm: 3300,
      door_width_mm: 1200,
      window_width_mm: 2600,
      window_sill_height_mm: 900,
    },
  },
  defaultCategoryDimensions: {
    apartment: {
      total_m2: 70,
    },
    house: {
      total_m2: 140,
    },
    single_room: {
      total_m2: 25,
    },
    business_space: {
      total_m2: 140,
    },
    commercial_space: {
      total_m2: 200,
    },
  },
  defaultLightingPreset: "DAY_SOFT",
  defaultBudgetAllocation: {
    kitchen: 20,
    living: 15,
    bedrooms: 12,
    bathroom: 10,
    lighting: 10,
    decor: 8,
    appliances: 13,
    seating: 12,
  },
  styleDefinitions: {
    modern_minimal: "Čiste linije, minimalan dekor, fokus na proporciji i teksturi.",
    japandi: "Japanski mir + skandinavska funkcija, prirodni materijali i balans.",
    warm_luxury: "Topli tonovi, premium materijali, diskretni luksuz.",
    scandinavian: "Svetao, funkcionalan i prirodan stil sa tihim detaljima.",
    contemporary_classic: "Savremena baza sa klasičnim proporcijama i elegancijom.",
    soft_industrial: "Urban karakter sa omekšanim teksturama i toplim akcentima.",
    mediterranean_warm: "Sunčana paleta, prirodni tonovi i opušten premium osećaj.",
    dark_elegant: "Tamniji tonovi, drama svetla i sofisticirana atmosfera.",
    natural_organic: "Prirodni oblici, organski materijali i mirna paleta.",
    boutique_hotel: "Hotel-grade komfor, slojevita rasveta i kurirani detalji.",
  },
} as const;

export type AdminDefaults = typeof adminDefaults;
