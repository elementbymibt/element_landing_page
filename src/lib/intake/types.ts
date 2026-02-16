import {
  moodOptions,
  paletteOptions,
  qualityTierOptions,
  roomTypeOptions,
  styleOptions,
} from "@/src/data/admin-settings";

export const propertyTypeOptions = [
  "apartment",
  "house",
  "single_room",
  "business_space",
  "commercial_space",
] as const;
export type PropertyTypeOption = (typeof propertyTypeOptions)[number];

export const deadlineOptions = ["2w", "1m", "3m", "6m", "flexible"] as const;
export type DeadlineOption = (typeof deadlineOptions)[number];

export const roomScopeOptions = roomTypeOptions;
export type RoomScopeOption = (typeof roomScopeOptions)[number];

export const kidsAgeRangeOptions = ["none", "0-3", "4-7", "8-12", "13-17"] as const;
export type KidsAgeRangeOption = (typeof kidsAgeRangeOptions)[number];

export const petOptions = ["dog", "cat", "small_pet", "none"] as const;
export type PetOption = (typeof petOptions)[number];

export const workFromHomeOptions = ["none", "sometimes", "daily"] as const;
export type WorkFromHomeOption = (typeof workFromHomeOptions)[number];

export const guestFrequencyOptions = ["rare", "monthly", "weekly"] as const;
export type GuestFrequencyOption = (typeof guestFrequencyOptions)[number];

export const cookingFrequencyOptions = ["rare", "weekly", "daily"] as const;
export type CookingFrequencyOption = (typeof cookingFrequencyOptions)[number];

export const storageNeedOptions = ["low", "medium", "high"] as const;
export type StorageNeedOption = (typeof storageNeedOptions)[number];

export const maintenancePreferenceOptions = [
  "low_maintenance",
  "delicate_materials",
] as const;
export type MaintenancePreferenceOption = (typeof maintenancePreferenceOptions)[number];

export const tradeoffKeys = [
  "aesthetics",
  "functionality",
  "budget_control",
  "speed_timeline",
  "durability",
] as const;
export type TradeoffKey = (typeof tradeoffKeys)[number];

export type PriorityWeights = Record<TradeoffKey, number>;
export type PriorityScores = Record<TradeoffKey, number>;

export const styleDiscoveryOptions = styleOptions;
export type StyleDiscoveryOption = (typeof styleDiscoveryOptions)[number];

export const styleQuizQuestionIds = [
  "materials",
  "silhouette",
  "contrast",
  "texture",
  "mood_intensity",
] as const;
export type StyleQuizQuestionId = (typeof styleQuizQuestionIds)[number];

export const moodQuizQuestionIds = [
  "daylight_preference",
  "social_energy",
  "visual_temperature",
] as const;
export type MoodQuizQuestionId = (typeof moodQuizQuestionIds)[number];

export const moodDiscoveryOptions = moodOptions;
export type MoodDiscoveryOption = (typeof moodDiscoveryOptions)[number];

export const brightnessOptions = ["light", "mid", "dark"] as const;
export type BrightnessOption = (typeof brightnessOptions)[number];

export const temperatureOptions = ["warm", "neutral", "cool"] as const;
export type TemperatureOption = (typeof temperatureOptions)[number];

export const paletteDiscoveryOptions = paletteOptions;
export type PaletteDiscoveryOption = (typeof paletteDiscoveryOptions)[number];

export const wallPreferenceOptions = [
  "keep_white",
  "greige_walls",
  "accent_wall",
  "recommend_for_me",
] as const;
export type WallPreferenceOption = (typeof wallPreferenceOptions)[number];

export const lightingScenarioOptions = [
  "flat_ceiling_only",
  "layered_lighting",
  "track_spot_zones",
  "pendants_dining",
  "indirect_led",
] as const;
export type LightingScenarioOption = (typeof lightingScenarioOptions)[number];

export const dayNightPriorityOptions = ["day", "night", "balanced"] as const;
export type DayNightPriorityOption = (typeof dayNightPriorityOptions)[number];

export const lightingWarmthOptions = ["warm", "neutral"] as const;
export type LightingWarmthOption = (typeof lightingWarmthOptions)[number];

export const lightingPresetOptions = [
  "DAY_SOFT",
  "AFTERNOON_WARM",
  "EVENING_COZY",
] as const;
export type LightingPresetOption = (typeof lightingPresetOptions)[number];

export const furnitureQualityOptions = qualityTierOptions;
export type FurnitureQualityOption = (typeof furnitureQualityOptions)[number];

export const mixedPremiumFocusOptions = [
  "kitchen",
  "sofa",
  "wardrobes",
  "lighting",
] as const;
export type MixedPremiumFocusOption = (typeof mixedPremiumFocusOptions)[number];

export const materialRestrictionOptions = [
  "no_glossy",
  "no_marble",
  "kid_proof",
  "pet_friendly",
] as const;
export type MaterialRestrictionOption = (typeof materialRestrictionOptions)[number];

export const furnitureQuizQuestionIds = [
  "touch_expectation",
  "longevity_expectation",
  "care_tolerance",
] as const;
export type FurnitureQuizQuestionId = (typeof furnitureQuizQuestionIds)[number];

export const currencyOptions = ["EUR"] as const;
export type CurrencyOption = (typeof currencyOptions)[number];

export const budgetTierOptions = ["starter", "balanced", "premium"] as const;
export type BudgetTierOption = (typeof budgetTierOptions)[number];

export const budgetAllocationKeys = [
  "kitchen",
  "living",
  "bedrooms",
  "bathroom",
  "lighting",
  "decor",
  "appliances",
  "seating",
] as const;
export type BudgetAllocationKey = (typeof budgetAllocationKeys)[number];

export type BudgetAllocation = Record<BudgetAllocationKey, number>;

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

export const inspirationTagOptions = [
  "colors",
  "lighting",
  "layout",
  "materials",
  "furniture_style",
] as const;
export type InspirationTagOption = (typeof inspirationTagOptions)[number];

export const roomStoragePriorityOptions = ["low", "medium", "high"] as const;
export type RoomStoragePriorityOption = (typeof roomStoragePriorityOptions)[number];

export const livingSeatingOptions = ["sectional", "sofa_armchairs"] as const;
export type LivingSeatingOption = (typeof livingSeatingOptions)[number];

export const kitchenLayoutOptions = ["l_shape", "u_shape", "straight"] as const;
export type KitchenLayoutOption = (typeof kitchenLayoutOptions)[number];

export const kitchenHandleOptions = ["handleless", "handles"] as const;
export type KitchenHandleOption = (typeof kitchenHandleOptions)[number];

export const bedSizeOptions = [160, 180] as const;
export type BedSizeOption = (typeof bedSizeOptions)[number];

export const wardrobeTypeOptions = ["sliding", "hinged"] as const;
export type WardrobeTypeOption = (typeof wardrobeTypeOptions)[number];

export const roomMeasurementConfidenceOptions = ["high", "medium", "low"] as const;
export type RoomMeasurementConfidenceOption =
  (typeof roomMeasurementConfidenceOptions)[number];

export const wallPositionOptions = ["north", "south", "east", "west", "unknown"] as const;
export type WallPositionOption = (typeof wallPositionOptions)[number];

export const intakeAssetKindOptions = [
  "plan",
  "keep_item",
  "inspiration",
  "avoid",
  "reference",
] as const;
export type IntakeAssetKindOption = (typeof intakeAssetKindOptions)[number];

export const intakeStatusOptions = ["draft", "submitted"] as const;
export type IntakeStatusOption = (typeof intakeStatusOptions)[number];

export type RoomOpening = {
  id: string;
  position: WallPositionOption;
  width_mm: number | null;
  sill_height_mm?: number | null;
};

export type RoomMeasurementDraft = {
  roomType: RoomScopeOption;
  width_mm: number | null;
  length_mm: number | null;
  ceiling_height_mm: number | null;
  confidence: RoomMeasurementConfidenceOption;
  used_defaults: boolean;
  doors: RoomOpening[];
  windows: RoomOpening[];
};

export type RoomPreferenceDraft = {
  roomType: RoomScopeOption;
  storagePriority: RoomStoragePriorityOption;
  activityIntensity: number;
  naturalLightPriority: number;
  comfortPriority: number;
  mustHave: string;
  avoid: string[];
  decorDensity: "minimal" | "balanced" | "rich";
  livingSeating?: LivingSeatingOption;
  tvWall?: boolean | null;
  rugPreference?: boolean | null;
  kitchenLayout?: KitchenLayoutOption;
  island?: boolean | null;
  kitchenHandles?: KitchenHandleOption;
  bedSize?: BedSizeOption;
  wardrobeType?: WardrobeTypeOption;
};

export type IntakeAssetRecord = {
  id: string;
  intakeId: string;
  kind: IntakeAssetKindOption;
  roomType: RoomScopeOption | null;
  label: string | null;
  originalUrl: string;
  thumbnailUrl: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
};

export type IntakeDraft = {
  id: string;
  status: IntakeStatusOption;
  currentStep: number;
  client: {
    fullName: string;
    email: string;
    phone: string;
  };
  agreements: {
    hasExactMeasurements: boolean | null;
    understandsConceptConceptualOnly: boolean;
    understandsTwoRevisionsIncluded: boolean;
    privacyConsent: boolean;
  };
  basics: {
    propertyType: PropertyTypeOption;
    city: string;
    total_m2: number | null;
    roomsInScope: RoomScopeOption[];
    roomQuantities: Partial<Record<RoomScopeOption, number>>;
    deadline: DeadlineOption;
  };
  floorplan: {
    hasPlan: boolean;
    planAssetIds: string[];
    measurementGuideSeen: boolean;
    roomMeasurements: RoomMeasurementDraft[];
    pendingUploadLater: boolean;
  };
  lifestyle: {
    peopleCount: number;
    kidsAgeRanges: KidsAgeRangeOption[];
    pets: PetOption[];
    workFromHome: WorkFromHomeOption;
    guests: GuestFrequencyOption;
    cookingFrequency: CookingFrequencyOption;
    storageNeed: StorageNeedOption;
    maintenancePreference: MaintenancePreferenceOption;
    storageNeedScore: number;
    maintenanceCareScore: number;
  };
  tradeoffs: PriorityWeights;
  tradeoffScores: PriorityScores;
  style: {
    selectedStyles: StyleDiscoveryOption[];
    usedQuiz: boolean;
    quizAnswers: Partial<Record<StyleQuizQuestionId, string>>;
  };
  mood: {
    selectedMoods: MoodDiscoveryOption[];
    usedQuiz: boolean;
    quizAnswers: Partial<Record<MoodQuizQuestionId, string>>;
  };
  color: {
    brightness: BrightnessOption;
    temperature: TemperatureOption;
    palette: PaletteDiscoveryOption;
    wallPreference: WallPreferenceOption;
  };
  lighting: {
    scenarios: LightingScenarioOption[];
    dayNightPriority: DayNightPriorityOption;
    warmth: LightingWarmthOption;
    dramaLevel: number;
    presetSuggestion: LightingPresetOption;
  };
  furniture: {
    qualityTier: FurnitureQualityOption;
    mixedPremiumFocus: MixedPremiumFocusOption[];
    restrictions: MaterialRestrictionOption[];
    usedQuiz: boolean;
    quizAnswers: Partial<Record<FurnitureQuizQuestionId, string>>;
  };
  budget: {
    currency: CurrencyOption;
    minTotal: number | null;
    maxTotal: number | null;
    flexibleBy10: boolean;
    allocation: BudgetAllocation;
    unknownBudget: boolean;
    comfortableMonthlyPayment: number | null;
    maxLimit: number | null;
    tier: BudgetTierOption;
  };
  keepReplace: {
    keepItems: KeepItemOption[];
    keepItemAssetIds: string[];
    dimensionsNote: string;
  };
  roomPreferences: RoomPreferenceDraft[];
  inspirations: {
    inspirationAssetIds: string[];
    avoidAssetIds: string[];
    tagsByAsset: Record<string, InspirationTagOption[]>;
  };
  contradictionsConfirmed: boolean;
  confidenceFlags: {
    measurements: "high" | "medium" | "low";
    budget: "high" | "medium" | "low";
  };
  notes: string;
  assets: IntakeAssetRecord[];
  createdAt: string;
  updatedAt: string;
};

export type ProjectRecord = {
  id: string;
  intakeId: string;
  status: "intake_completed" | "proposal_generated" | "archived";
  summary: {
    title: string;
    city: string;
    propertyType: PropertyTypeOption;
    style: StyleDiscoveryOption[];
    mood: MoodDiscoveryOption[];
    palette: PaletteDiscoveryOption;
    lightingPreset: LightingPresetOption;
    qualityTier: FurnitureQualityOption;
    budget: {
      min: number;
      max: number;
      currency: CurrencyOption;
    };
    contradictions: string[];
  };
  createdAt: string;
  updatedAt: string;
};

export type IntakeStoreRecord = {
  intake: IntakeDraft;
  project: ProjectRecord | null;
};
