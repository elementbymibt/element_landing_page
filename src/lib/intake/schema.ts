import { z } from "zod";

import { adminDefaults } from "@/src/data/admin-settings";
import {
  bedSizeOptions,
  brightnessOptions,
  budgetAllocationKeys,
  budgetTierOptions,
  cookingFrequencyOptions,
  currencyOptions,
  dayNightPriorityOptions,
  deadlineOptions,
  furnitureQuizQuestionIds,
  furnitureQualityOptions,
  guestFrequencyOptions,
  inspirationTagOptions,
  intakeAssetKindOptions,
  intakeStatusOptions,
  keepItemOptions,
  kidsAgeRangeOptions,
  kitchenHandleOptions,
  kitchenLayoutOptions,
  lightingPresetOptions,
  lightingScenarioOptions,
  lightingWarmthOptions,
  livingSeatingOptions,
  maintenancePreferenceOptions,
  materialRestrictionOptions,
  mixedPremiumFocusOptions,
  moodDiscoveryOptions,
  moodQuizQuestionIds,
  paletteDiscoveryOptions,
  petOptions,
  propertyTypeOptions,
  roomMeasurementConfidenceOptions,
  roomScopeOptions,
  roomStoragePriorityOptions,
  styleDiscoveryOptions,
  styleQuizQuestionIds,
  temperatureOptions,
  tradeoffKeys,
  wallPositionOptions,
  wallPreferenceOptions,
  wardrobeTypeOptions,
  workFromHomeOptions,
  type BudgetAllocation,
  type IntakeAssetRecord,
  type IntakeDraft,
  type PriorityScores,
  type PriorityWeights,
  type RoomScopeOption,
  type StyleQuizQuestionId,
  type MoodQuizQuestionId,
  type FurnitureQuizQuestionId,
  type RoomMeasurementDraft,
  type RoomPreferenceDraft,
  type StyleDiscoveryOption,
} from "@/src/lib/intake/types";

const NUMBER_RE = /[^0-9.,-]/g;
const INTAKE_STEP_MAX = 12;

function sanitizeText(input: unknown) {
  return String(input ?? "").trim();
}

function toNumber(input: unknown): number | null {
  if (typeof input === "number" && Number.isFinite(input)) {
    return input;
  }

  const cleaned = String(input ?? "")
    .replace(NUMBER_RE, "")
    .replace(".", "")
    .replace(",", ".");

  if (!cleaned) {
    return null;
  }

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function toPositiveInt(input: unknown, fallback: number) {
  const parsed = toNumber(input);

  if (parsed === null || parsed < 0) {
    return fallback;
  }

  return Math.round(parsed);
}

function toPositiveMoney(input: unknown, fallback: number) {
  const parsed = toNumber(input);

  if (parsed === null || parsed < 0) {
    return fallback;
  }

  return Math.round(parsed);
}

function ensureEnum<T extends readonly string[]>(
  value: unknown,
  options: T,
  fallback: T[number],
): T[number] {
  const stringValue = String(value ?? "");
  return options.includes(stringValue as T[number]) ? (stringValue as T[number]) : fallback;
}

function ensureNumberEnum<T extends readonly number[]>(
  value: unknown,
  options: T,
  fallback: T[number],
): T[number] {
  const numeric = toNumber(value);

  if (numeric === null) {
    return fallback;
  }

  return options.includes(numeric as T[number]) ? (numeric as T[number]) : fallback;
}

function ensureEnumArray<T extends readonly string[]>(
  values: unknown,
  options: T,
  fallback: T[number][] = [],
  max = options.length,
): T[number][] {
  if (!Array.isArray(values)) {
    return fallback;
  }

  const unique = new Set<T[number]>();

  for (const value of values) {
    const normalized = String(value ?? "");

    if (options.includes(normalized as T[number])) {
      unique.add(normalized as T[number]);
    }

    if (unique.size >= max) {
      break;
    }
  }

  if (unique.size === 0) {
    return fallback;
  }

  return Array.from(unique);
}

function normalizeWeights<T extends readonly string[]>(
  keys: T,
  source: Partial<Record<T[number], number>>,
): Record<T[number], number> {
  const prepared = keys.map((key) => {
    const typedKey = key as T[number];
    const raw = source[typedKey];
    const numeric = typeof raw === "number" && Number.isFinite(raw) ? raw : 20;
    return {
      key: typedKey,
      value: Math.max(0, Math.min(100, Math.round(numeric))),
    };
  });

  const total = prepared.reduce((sum, item) => sum + item.value, 0);

  if (total <= 0) {
    const equal = Math.floor(100 / keys.length);
    const result = {} as Record<T[number], number>;
    let sum = 0;

    prepared.forEach((item, index) => {
      const value = index === 0 ? 100 - equal * (keys.length - 1) : equal;
      result[item.key] = value;
      sum += value;
    });

    if (sum !== 100) {
      result[prepared[0].key] += 100 - sum;
    }

    return result;
  }

  const scaled = prepared.map((item) => ({
    key: item.key,
    value: Math.round((item.value / total) * 100),
  }));

  const scaledSum = scaled.reduce((sum, item) => sum + item.value, 0);
  const diff = 100 - scaledSum;

  if (diff !== 0) {
    scaled[0].value += diff;
  }

  return scaled.reduce((acc, item) => {
    acc[item.key] = item.value;
    return acc;
  }, {} as Record<T[number], number>);
}

function normalizeAllocation(source: Partial<BudgetAllocation>) {
  return normalizeWeights(budgetAllocationKeys, source);
}

function buildDefaultTradeoffs(): PriorityWeights {
  return normalizeWeights(tradeoffKeys, {
    aesthetics: 20,
    functionality: 25,
    budget_control: 20,
    speed_timeline: 15,
    durability: 20,
  });
}

function defaultLightingPreset(
  dayNightPriority: (typeof dayNightPriorityOptions)[number],
  dramaLevel: number,
) {
  if (dramaLevel >= 70) {
    return "EVENING_COZY" as const;
  }

  if (dayNightPriority === "day") {
    return "DAY_SOFT" as const;
  }

  if (dayNightPriority === "night") {
    return "EVENING_COZY" as const;
  }

  return "AFTERNOON_WARM" as const;
}

function wallPreferenceRecommendation(styles: StyleDiscoveryOption[]) {
  if (styles.includes("dark_elegant")) {
    return "accent_wall" as const;
  }

  if (styles.includes("scandinavian") || styles.includes("modern_minimal")) {
    return "keep_white" as const;
  }

  return "greige_walls" as const;
}

function stylesFromQuiz(quizAnswers: Partial<Record<StyleQuizQuestionId, string>>) {
  const styles: StyleDiscoveryOption[] = [];

  const materials = quizAnswers.materials;
  const silhouette = quizAnswers.silhouette;
  const contrast = quizAnswers.contrast;
  const texture = quizAnswers.texture;
  const moodIntensity = quizAnswers.mood_intensity;

  if (materials === "natural") {
    styles.push("japandi", "natural_organic");
  }

  if (materials === "lux") {
    styles.push("warm_luxury", "contemporary_classic");
  }

  if (silhouette === "clean") {
    styles.push("modern_minimal", "scandinavian");
  }

  if (silhouette === "statement") {
    styles.push("boutique_hotel", "dark_elegant");
  }

  if (contrast === "soft") {
    styles.push("mediterranean_warm", "natural_organic");
  }

  if (contrast === "high") {
    styles.push("dark_elegant", "soft_industrial");
  }

  if (texture === "soft") {
    styles.push("japandi", "scandinavian");
  }

  if (texture === "rich") {
    styles.push("warm_luxury", "boutique_hotel");
  }

  if (moodIntensity === "calm") {
    styles.push("modern_minimal", "natural_organic");
  }

  if (moodIntensity === "statement") {
    styles.push("dark_elegant", "boutique_hotel");
  }

  const unique: StyleDiscoveryOption[] = [];

  for (const style of styles) {
    if (!unique.includes(style)) {
      unique.push(style);
    }

    if (unique.length >= 2) {
      break;
    }
  }

  if (unique.length === 0) {
    return ["japandi"] as StyleDiscoveryOption[];
  }

  return unique;
}

function moodsFromStyles(styles: StyleDiscoveryOption[]) {
  if (styles.includes("dark_elegant")) {
    return ["dramatic_elegant", "cozy_warm"] as (typeof moodDiscoveryOptions)[number][];
  }

  if (styles.includes("scandinavian") || styles.includes("modern_minimal")) {
    return ["bright_airy", "calm_minimal"] as (typeof moodDiscoveryOptions)[number][];
  }

  return ["cozy_warm", "calm_minimal"] as (typeof moodDiscoveryOptions)[number][];
}

function budgetTierDefaults(tier: (typeof budgetTierOptions)[number]) {
  switch (tier) {
    case "starter":
      return { min: 12000, max: 30000 };
    case "premium":
      return { min: 70000, max: 180000 };
    case "balanced":
    default:
      return { min: 30000, max: 70000 };
  }
}

function buildDefaultRoomMeasurement(roomType: RoomScopeOption): RoomMeasurementDraft {
  const template = adminDefaults.roomTemplates[roomType];

  return {
    roomType,
    width_mm: template.width_mm,
    length_mm: template.length_mm,
    ceiling_height_mm: template.ceiling_height_mm,
    confidence: "medium",
    used_defaults: true,
    doors: [
      {
        id: crypto.randomUUID(),
        position: "unknown",
        width_mm: template.door_width_mm,
      },
    ],
    windows:
      template.window_width_mm > 0
        ? [
            {
              id: crypto.randomUUID(),
              position: "unknown",
              width_mm: template.window_width_mm,
              sill_height_mm: template.window_sill_height_mm,
            },
          ]
        : [],
  };
}

function buildDefaultRoomPreference(roomType: RoomScopeOption): RoomPreferenceDraft {
  return {
    roomType,
    storagePriority: "medium",
    activityIntensity: 6,
    naturalLightPriority: 6,
    comfortPriority: 7,
    mustHave: "",
    avoid: [],
    decorDensity: "balanced",
    livingSeating: roomType === "living_room" ? "sectional" : undefined,
    tvWall: roomType === "living_room" ? true : null,
    rugPreference: roomType === "living_room" ? true : null,
    kitchenLayout: roomType === "kitchen" ? "l_shape" : undefined,
    island: roomType === "kitchen" ? false : null,
    kitchenHandles: roomType === "kitchen" ? "handleless" : undefined,
    bedSize: roomType === "bedroom" ? 180 : undefined,
    wardrobeType: roomType === "bedroom" ? "sliding" : undefined,
  };
}

function normalizeRoomMeasurements(
  roomsInScope: RoomScopeOption[],
  source: RoomMeasurementDraft[] | undefined,
) {
  return roomsInScope.map((roomType) => {
    const base = buildDefaultRoomMeasurement(roomType);
    const found = source?.find((entry) => entry.roomType === roomType);

    if (!found) {
      return base;
    }

    const template = adminDefaults.roomTemplates[roomType];

    const width = toPositiveInt(found.width_mm, template.width_mm);
    const length = toPositiveInt(found.length_mm, template.length_mm);
    const ceiling = toPositiveInt(found.ceiling_height_mm, template.ceiling_height_mm);

    const hasUnknownCoreDimensions =
      found.width_mm == null || found.length_mm == null || found.ceiling_height_mm == null;

    const doors =
      found.doors.length > 0
        ? found.doors.map((door) => ({
            id: sanitizeText(door.id) || crypto.randomUUID(),
            position: ensureEnum(door.position, wallPositionOptions, "unknown"),
            width_mm: toPositiveInt(door.width_mm, template.door_width_mm),
          }))
        : base.doors;

    const windows =
      found.windows.length > 0
        ? found.windows.map((windowItem) => ({
            id: sanitizeText(windowItem.id) || crypto.randomUUID(),
            position: ensureEnum(windowItem.position, wallPositionOptions, "unknown"),
            width_mm: toPositiveInt(windowItem.width_mm, template.window_width_mm),
            sill_height_mm: toPositiveInt(
              windowItem.sill_height_mm,
              template.window_sill_height_mm,
            ),
          }))
        : base.windows;

    const confidence = hasUnknownCoreDimensions
      ? "low"
      : ensureEnum(found.confidence, roomMeasurementConfidenceOptions, "medium");

    return {
      roomType,
      width_mm: width,
      length_mm: length,
      ceiling_height_mm: ceiling,
      confidence,
      used_defaults: found.used_defaults || hasUnknownCoreDimensions,
      doors,
      windows,
    };
  });
}

function normalizeRoomPreferences(
  roomsInScope: RoomScopeOption[],
  source: RoomPreferenceDraft[] | undefined,
) {
  return roomsInScope.map((roomType) => {
    const base = buildDefaultRoomPreference(roomType);
    const found = source?.find((entry) => entry.roomType === roomType);

    if (!found) {
      return base;
    }

    return {
      roomType,
      storagePriority: ensureEnum(
        found.storagePriority,
        roomStoragePriorityOptions,
        base.storagePriority,
      ),
      activityIntensity: Math.max(1, Math.min(10, toPositiveInt(found.activityIntensity, 6))),
      naturalLightPriority: Math.max(
        1,
        Math.min(10, toPositiveInt(found.naturalLightPriority, 6)),
      ),
      comfortPriority: Math.max(1, Math.min(10, toPositiveInt(found.comfortPriority, 7))),
      mustHave: sanitizeText(found.mustHave).slice(0, 500),
      avoid: Array.isArray(found.avoid)
        ? found.avoid
            .map((item) => sanitizeText(item))
            .filter(Boolean)
            .slice(0, 12)
        : [],
      decorDensity: ensureEnum(
        found.decorDensity,
        ["minimal", "balanced", "rich"] as const,
        base.decorDensity,
      ),
      livingSeating:
        roomType === "living_room"
          ? ensureEnum(found.livingSeating, livingSeatingOptions, base.livingSeating ?? "sectional")
          : undefined,
      tvWall: roomType === "living_room" ? Boolean(found.tvWall) : null,
      rugPreference: roomType === "living_room" ? Boolean(found.rugPreference) : null,
      kitchenLayout:
        roomType === "kitchen"
          ? ensureEnum(found.kitchenLayout, kitchenLayoutOptions, base.kitchenLayout ?? "l_shape")
          : undefined,
      island: roomType === "kitchen" ? Boolean(found.island) : null,
      kitchenHandles:
        roomType === "kitchen"
          ? ensureEnum(
              found.kitchenHandles,
              kitchenHandleOptions,
              base.kitchenHandles ?? "handleless",
            )
          : undefined,
      bedSize:
        roomType === "bedroom"
          ? ensureNumberEnum(found.bedSize, bedSizeOptions, base.bedSize ?? 180)
          : undefined,
      wardrobeType:
        roomType === "bedroom"
          ? ensureEnum(found.wardrobeType, wardrobeTypeOptions, base.wardrobeType ?? "sliding")
          : undefined,
    };
  });
}

function normalizeAssets(source: IntakeAssetRecord[] | undefined, intakeId: string) {
  if (!Array.isArray(source)) {
    return [];
  }

  return source
    .map((asset) => ({
      id: sanitizeText(asset.id) || crypto.randomUUID(),
      intakeId,
      kind: ensureEnum(asset.kind, intakeAssetKindOptions, "reference"),
      roomType: roomScopeOptions.includes(asset.roomType as RoomScopeOption)
        ? (asset.roomType as RoomScopeOption)
        : null,
      label: sanitizeText(asset.label) || null,
      originalUrl: sanitizeText(asset.originalUrl),
      thumbnailUrl: sanitizeText(asset.thumbnailUrl),
      mimeType: sanitizeText(asset.mimeType) || "application/octet-stream",
      sizeBytes: toPositiveInt(asset.sizeBytes, 0),
      createdAt: sanitizeText(asset.createdAt) || new Date().toISOString(),
    }))
    .filter((asset) => asset.originalUrl && asset.thumbnailUrl);
}

export function createDefaultIntakeDraft(
  input: Partial<IntakeDraft> = {},
  id = input.id ?? crypto.randomUUID(),
): IntakeDraft {
  const createdAt = sanitizeText(input.createdAt) || new Date().toISOString();
  const nowIso = new Date().toISOString();

  const propertyType = ensureEnum(input.basics?.propertyType, propertyTypeOptions, "apartment");
  const defaultRoomsByProperty: Record<(typeof propertyTypeOptions)[number], RoomScopeOption[]> = {
    apartment: ["living_room", "kitchen", "bedroom"],
    house: ["living_room", "kitchen", "bedroom", "bathroom"],
    single_room: ["living_room"],
    business_space: ["reception", "open_space", "meeting_room", "wc"],
    commercial_space: ["commercial_zone", "reception", "storage_room", "wc"],
  };
  const totalFallback = adminDefaults.defaultCategoryDimensions[propertyType].total_m2;
  const roomsInScope = ensureEnumArray(
    input.basics?.roomsInScope,
    roomScopeOptions,
    defaultRoomsByProperty[propertyType],
    roomScopeOptions.length,
  );
  const roomQuantities = roomsInScope.reduce<Partial<Record<RoomScopeOption, number>>>(
    (acc, roomType) => {
      const raw = input.basics?.roomQuantities?.[roomType];
      acc[roomType] = Math.max(1, Math.min(10, toPositiveInt(raw, 1)));
      return acc;
    },
    {},
  );

  const quizAnswers = styleQuizQuestionIds.reduce<
    Partial<Record<StyleQuizQuestionId, string>>
  >((acc, key) => {
    const raw = input.style?.quizAnswers?.[key];
    if (typeof raw === "string" && raw.trim()) {
      acc[key] = raw.trim();
    }

    return acc;
  }, {});

  const moodQuizAnswers = moodQuizQuestionIds.reduce<
    Partial<Record<MoodQuizQuestionId, string>>
  >((acc, key) => {
    const raw = input.mood?.quizAnswers?.[key];
    if (typeof raw === "string" && raw.trim()) {
      acc[key] = raw.trim();
    }

    return acc;
  }, {});

  const furnitureQuizAnswers = furnitureQuizQuestionIds.reduce<
    Partial<Record<FurnitureQuizQuestionId, string>>
  >((acc, key) => {
    const raw = input.furniture?.quizAnswers?.[key];
    if (typeof raw === "string" && raw.trim()) {
      acc[key] = raw.trim();
    }

    return acc;
  }, {});

  const inferredStyles = stylesFromQuiz(quizAnswers);

  const selectedStyles = ensureEnumArray(
    input.style?.selectedStyles,
    styleDiscoveryOptions,
    inferredStyles,
    2,
  );

  const selectedMoods = ensureEnumArray(
    input.mood?.selectedMoods,
    moodDiscoveryOptions,
    moodsFromStyles(selectedStyles),
    3,
  );

  const minimumMoods = selectedMoods.length >= 2 ? selectedMoods : [...moodsFromStyles(selectedStyles)];

  const wallPrefCandidate = ensureEnum(
    input.color?.wallPreference,
    wallPreferenceOptions,
    "recommend_for_me",
  );
  const wallPreference =
    wallPrefCandidate === "recommend_for_me"
      ? wallPreferenceRecommendation(selectedStyles)
      : wallPrefCandidate;

  const dayNightPriority = ensureEnum(
    input.lighting?.dayNightPriority,
    dayNightPriorityOptions,
    "balanced",
  );
  const dramaLevel = Math.max(1, Math.min(10, toPositiveInt(input.lighting?.dramaLevel, 6)));
  const presetSuggestion = ensureEnum(
    input.lighting?.presetSuggestion,
    lightingPresetOptions,
    defaultLightingPreset(dayNightPriority, dramaLevel),
  );

  const tradeoffs = normalizeWeights(tradeoffKeys, input.tradeoffs ?? buildDefaultTradeoffs());
  const tradeoffScores = tradeoffKeys.reduce<PriorityScores>((acc, key) => {
    const fallback = Math.max(1, Math.min(10, Math.round((tradeoffs[key] / 100) * 10) || 5));
    acc[key] = Math.max(1, Math.min(10, toPositiveInt(input.tradeoffScores?.[key], fallback)));
    return acc;
  }, {} as PriorityScores);

  const tier = ensureEnum(input.budget?.tier, budgetTierOptions, "balanced");
  const tierDefaults = budgetTierDefaults(tier);

  const unknownBudget = Boolean(input.budget?.unknownBudget);

  const explicitMin = toPositiveMoney(input.budget?.minTotal, tierDefaults.min);
  const explicitMax = toPositiveMoney(input.budget?.maxTotal, tierDefaults.max);
  const minTotal = unknownBudget ? tierDefaults.min : explicitMin;
  const maxTotal = unknownBudget ? tierDefaults.max : Math.max(explicitMax, minTotal);

  const allocation = normalizeAllocation(
    input.budget?.allocation ?? adminDefaults.defaultBudgetAllocation,
  );

  const roomMeasurements = normalizeRoomMeasurements(roomsInScope, input.floorplan?.roomMeasurements);
  const roomPreferences = normalizeRoomPreferences(roomsInScope, input.roomPreferences);
  const storageNeedScore = Math.max(
    1,
    Math.min(10, toPositiveInt(input.lifestyle?.storageNeedScore, 6)),
  );
  const maintenanceCareScore = Math.max(
    1,
    Math.min(10, toPositiveInt(input.lifestyle?.maintenanceCareScore, 5)),
  );

  const measurementConfidence = roomMeasurements.some((room) => room.confidence === "low")
    ? "low"
    : roomMeasurements.some((room) => room.confidence === "medium")
      ? "medium"
      : "high";

  const budgetConfidence = unknownBudget ? "low" : "high";

  const assets = normalizeAssets(input.assets, id);

  const tagMap = Object.entries(input.inspirations?.tagsByAsset ?? {}).reduce<
    Record<string, (typeof inspirationTagOptions)[number][]>
  >((acc, [assetId, tags]) => {
    const normalizedId = sanitizeText(assetId);

    if (!normalizedId) {
      return acc;
    }

    acc[normalizedId] = ensureEnumArray(tags, inspirationTagOptions, [], inspirationTagOptions.length);

    return acc;
  }, {});

  return {
    id,
    status: ensureEnum(input.status, intakeStatusOptions, "draft"),
    currentStep: Math.max(0, Math.min(INTAKE_STEP_MAX, toPositiveInt(input.currentStep, 0))),
    client: {
      fullName: sanitizeText((input as IntakeDraft).client?.fullName).slice(0, 120),
      email: sanitizeText((input as IntakeDraft).client?.email).toLowerCase().slice(0, 180),
      phone: sanitizeText((input as IntakeDraft).client?.phone).slice(0, 40),
    },
    agreements: {
      hasExactMeasurements:
        typeof (input as IntakeDraft).agreements?.hasExactMeasurements === "boolean"
          ? (input as IntakeDraft).agreements.hasExactMeasurements
          : null,
      understandsConceptConceptualOnly: Boolean(
        (input as IntakeDraft).agreements?.understandsConceptConceptualOnly,
      ),
      understandsTwoRevisionsIncluded: Boolean(
        (input as IntakeDraft).agreements?.understandsTwoRevisionsIncluded,
      ),
      privacyConsent: Boolean((input as IntakeDraft).agreements?.privacyConsent),
    },
    basics: {
      propertyType,
      city: sanitizeText(input.basics?.city),
      total_m2: toPositiveMoney(input.basics?.total_m2, totalFallback),
      roomsInScope,
      roomQuantities,
      deadline: ensureEnum(input.basics?.deadline, deadlineOptions, "3m"),
    },
    floorplan: {
      hasPlan: Boolean(input.floorplan?.hasPlan),
      planAssetIds: ensureEnumArray(
        input.floorplan?.planAssetIds,
        assets.map((asset) => asset.id) as readonly string[],
        [],
      ),
      measurementGuideSeen: Boolean(input.floorplan?.measurementGuideSeen),
      roomMeasurements,
      pendingUploadLater: Boolean(input.floorplan?.pendingUploadLater),
    },
    lifestyle: {
      peopleCount: Math.max(1, Math.min(5, toPositiveInt(input.lifestyle?.peopleCount, 2))),
      kidsAgeRanges: ensureEnumArray(input.lifestyle?.kidsAgeRanges, kidsAgeRangeOptions),
      pets: ensureEnumArray(input.lifestyle?.pets, petOptions, ["none"]),
      workFromHome: ensureEnum(input.lifestyle?.workFromHome, workFromHomeOptions, "sometimes"),
      guests: ensureEnum(input.lifestyle?.guests, guestFrequencyOptions, "monthly"),
      cookingFrequency: ensureEnum(
        input.lifestyle?.cookingFrequency,
        cookingFrequencyOptions,
        "weekly",
      ),
      storageNeed: ensureEnum(
        input.lifestyle?.storageNeed,
        roomStoragePriorityOptions,
        storageNeedScore >= 8 ? "high" : storageNeedScore >= 5 ? "medium" : "low",
      ),
      maintenancePreference: ensureEnum(
        input.lifestyle?.maintenancePreference,
        maintenancePreferenceOptions,
        maintenanceCareScore >= 7 ? "delicate_materials" : "low_maintenance",
      ),
      storageNeedScore,
      maintenanceCareScore,
    },
    tradeoffs,
    tradeoffScores,
    style: {
      selectedStyles,
      usedQuiz: Boolean(input.style?.usedQuiz),
      quizAnswers,
    },
    mood: {
      selectedMoods: minimumMoods.slice(0, 3),
      usedQuiz: Boolean(input.mood?.usedQuiz),
      quizAnswers: moodQuizAnswers,
    },
    color: {
      brightness: ensureEnum(input.color?.brightness, brightnessOptions, "mid"),
      temperature: ensureEnum(input.color?.temperature, temperatureOptions, "warm"),
      palette: ensureEnum(input.color?.palette, paletteDiscoveryOptions, "warm_neutrals"),
      wallPreference,
    },
    lighting: {
      scenarios: ensureEnumArray(
        input.lighting?.scenarios,
        lightingScenarioOptions,
        ["layered_lighting"],
        5,
      ),
      dayNightPriority,
      warmth: ensureEnum(input.lighting?.warmth, lightingWarmthOptions, "warm"),
      dramaLevel,
      presetSuggestion,
    },
    furniture: {
      qualityTier: ensureEnum(input.furniture?.qualityTier, furnitureQualityOptions, "mid"),
      mixedPremiumFocus: ensureEnumArray(
        input.furniture?.mixedPremiumFocus,
        mixedPremiumFocusOptions,
        [],
      ),
      restrictions: ensureEnumArray(input.furniture?.restrictions, materialRestrictionOptions),
      usedQuiz: Boolean(input.furniture?.usedQuiz),
      quizAnswers: furnitureQuizAnswers,
    },
    budget: {
      currency: ensureEnum(input.budget?.currency, currencyOptions, "EUR"),
      minTotal,
      maxTotal,
      flexibleBy10: Boolean(input.budget?.flexibleBy10),
      allocation,
      unknownBudget,
      comfortableMonthlyPayment: toPositiveMoney(input.budget?.comfortableMonthlyPayment, 0),
      maxLimit: toPositiveMoney(input.budget?.maxLimit, maxTotal),
      tier,
    },
    keepReplace: {
      keepItems: ensureEnumArray(input.keepReplace?.keepItems, keepItemOptions),
      keepItemAssetIds: ensureEnumArray(
        input.keepReplace?.keepItemAssetIds,
        assets.map((asset) => asset.id) as readonly string[],
        [],
      ),
      dimensionsNote: sanitizeText(input.keepReplace?.dimensionsNote).slice(0, 1000),
    },
    roomPreferences,
    inspirations: {
      inspirationAssetIds: ensureEnumArray(
        input.inspirations?.inspirationAssetIds,
        assets.map((asset) => asset.id) as readonly string[],
        [],
      ),
      avoidAssetIds: ensureEnumArray(
        input.inspirations?.avoidAssetIds,
        assets.map((asset) => asset.id) as readonly string[],
        [],
      ),
      tagsByAsset: tagMap,
    },
    contradictionsConfirmed: Boolean(input.contradictionsConfirmed),
    confidenceFlags: {
      measurements: ensureEnum(
        input.confidenceFlags?.measurements,
        ["high", "medium", "low"] as const,
        measurementConfidence,
      ),
      budget: ensureEnum(
        input.confidenceFlags?.budget,
        ["high", "medium", "low"] as const,
        budgetConfidence,
      ),
    },
    notes: sanitizeText(input.notes).slice(0, 2000),
    assets,
    createdAt,
    updatedAt: sanitizeText(input.updatedAt) || nowIso,
  };
}

const RoomOpeningSchema = z.object({
  id: z.string().min(1),
  position: z.enum(wallPositionOptions),
  width_mm: z.number().int().nonnegative(),
  sill_height_mm: z.number().int().nonnegative().optional(),
});

const RoomMeasurementSchema = z.object({
  roomType: z.enum(roomScopeOptions),
  width_mm: z.number().int().positive(),
  length_mm: z.number().int().positive(),
  ceiling_height_mm: z.number().int().nonnegative(),
  confidence: z.enum(roomMeasurementConfidenceOptions),
  used_defaults: z.boolean(),
  doors: z.array(RoomOpeningSchema),
  windows: z.array(RoomOpeningSchema),
});

const RoomPreferenceSchema = z.object({
  roomType: z.enum(roomScopeOptions),
  storagePriority: z.enum(roomStoragePriorityOptions),
  activityIntensity: z.number().int().min(1).max(10),
  naturalLightPriority: z.number().int().min(1).max(10),
  comfortPriority: z.number().int().min(1).max(10),
  mustHave: z.string(),
  avoid: z.array(z.string()),
  decorDensity: z.enum(["minimal", "balanced", "rich"]),
  livingSeating: z.enum(livingSeatingOptions).optional(),
  tvWall: z.boolean().nullable().optional(),
  rugPreference: z.boolean().nullable().optional(),
  kitchenLayout: z.enum(kitchenLayoutOptions).optional(),
  island: z.boolean().nullable().optional(),
  kitchenHandles: z.enum(kitchenHandleOptions).optional(),
  bedSize: z.union([z.literal(160), z.literal(180)]).optional(),
  wardrobeType: z.enum(wardrobeTypeOptions).optional(),
});

const StyleQuizAnswersSchema = z.object({
  materials: z.string().optional(),
  silhouette: z.string().optional(),
  contrast: z.string().optional(),
  texture: z.string().optional(),
  mood_intensity: z.string().optional(),
});

const MoodQuizAnswersSchema = z.object({
  daylight_preference: z.string().optional(),
  social_energy: z.string().optional(),
  visual_temperature: z.string().optional(),
});

const FurnitureQuizAnswersSchema = z.object({
  touch_expectation: z.string().optional(),
  longevity_expectation: z.string().optional(),
  care_tolerance: z.string().optional(),
});

const IntakeAssetSchema = z.object({
  id: z.string().min(1),
  intakeId: z.string().min(1),
  kind: z.enum(intakeAssetKindOptions),
  roomType: z.enum(roomScopeOptions).nullable(),
  label: z.string().nullable(),
  originalUrl: z.string().min(1),
  thumbnailUrl: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().nonnegative(),
  createdAt: z.string().min(1),
});

export const IntakeJsonSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(intakeStatusOptions),
  currentStep: z.number().int().min(0).max(INTAKE_STEP_MAX),
  client: z.object({
    fullName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().max(40),
  }),
  agreements: z.object({
    hasExactMeasurements: z.boolean(),
    understandsConceptConceptualOnly: z.boolean().refine((value) => value === true, {
      message: "Concept acknowledgment is required.",
    }),
    understandsTwoRevisionsIncluded: z.boolean().refine((value) => value === true, {
      message: "Revision acknowledgment is required.",
    }),
    privacyConsent: z.boolean().refine((value) => value === true, {
      message: "Privacy consent is required.",
    }),
  }),
  basics: z.object({
    propertyType: z.enum(propertyTypeOptions),
    city: z.string(),
    total_m2: z.number().positive(),
    roomsInScope: z.array(z.enum(roomScopeOptions)).min(1),
    roomQuantities: z.record(z.string(), z.number().int().min(1).max(10)),
    deadline: z.enum(deadlineOptions),
  }),
  floorplan: z.object({
    hasPlan: z.boolean(),
    planAssetIds: z.array(z.string().min(1)),
    measurementGuideSeen: z.boolean(),
    roomMeasurements: z.array(RoomMeasurementSchema).min(1),
    pendingUploadLater: z.boolean(),
  }),
  lifestyle: z.object({
    peopleCount: z.number().int().min(1).max(5),
    kidsAgeRanges: z.array(z.enum(kidsAgeRangeOptions)),
    pets: z.array(z.enum(petOptions)),
    workFromHome: z.enum(workFromHomeOptions),
    guests: z.enum(guestFrequencyOptions),
    cookingFrequency: z.enum(cookingFrequencyOptions),
    storageNeed: z.enum(roomStoragePriorityOptions),
    maintenancePreference: z.enum(maintenancePreferenceOptions),
    storageNeedScore: z.number().int().min(1).max(10),
    maintenanceCareScore: z.number().int().min(1).max(10),
  }),
  tradeoffs: z
    .object({
      aesthetics: z.number().int().nonnegative(),
      functionality: z.number().int().nonnegative(),
      budget_control: z.number().int().nonnegative(),
      speed_timeline: z.number().int().nonnegative(),
      durability: z.number().int().nonnegative(),
    })
    .refine((weights) => Object.values(weights).reduce((sum, value) => sum + value, 0) === 100, {
      message: "Tradeoff weight sum must be 100.",
    }),
  tradeoffScores: z.object({
    aesthetics: z.number().int().min(1).max(10),
    functionality: z.number().int().min(1).max(10),
    budget_control: z.number().int().min(1).max(10),
    speed_timeline: z.number().int().min(1).max(10),
    durability: z.number().int().min(1).max(10),
  }),
  style: z.object({
    selectedStyles: z.array(z.enum(styleDiscoveryOptions)).min(1).max(2),
    usedQuiz: z.boolean(),
    quizAnswers: StyleQuizAnswersSchema,
  }),
  mood: z.object({
    selectedMoods: z.array(z.enum(moodDiscoveryOptions)).min(2).max(3),
    usedQuiz: z.boolean(),
    quizAnswers: MoodQuizAnswersSchema,
  }),
  color: z.object({
    brightness: z.enum(brightnessOptions),
    temperature: z.enum(temperatureOptions),
    palette: z.enum(paletteDiscoveryOptions),
    wallPreference: z.enum(["keep_white", "greige_walls", "accent_wall"]),
  }),
  lighting: z.object({
    scenarios: z.array(z.enum(lightingScenarioOptions)).min(1),
    dayNightPriority: z.enum(dayNightPriorityOptions),
    warmth: z.enum(lightingWarmthOptions),
    dramaLevel: z.number().int().min(1).max(10),
    presetSuggestion: z.enum(lightingPresetOptions),
  }),
  furniture: z.object({
    qualityTier: z.enum(furnitureQualityOptions),
    mixedPremiumFocus: z.array(z.enum(mixedPremiumFocusOptions)),
    restrictions: z.array(z.enum(materialRestrictionOptions)),
    usedQuiz: z.boolean(),
    quizAnswers: FurnitureQuizAnswersSchema,
  }),
  budget: z
    .object({
      currency: z.enum(currencyOptions),
      minTotal: z.number().int().positive(),
      maxTotal: z.number().int().positive(),
      flexibleBy10: z.boolean(),
      allocation: z.object({
        kitchen: z.number().int().nonnegative(),
        living: z.number().int().nonnegative(),
        bedrooms: z.number().int().nonnegative(),
        bathroom: z.number().int().nonnegative(),
        lighting: z.number().int().nonnegative(),
        decor: z.number().int().nonnegative(),
        appliances: z.number().int().nonnegative(),
        seating: z.number().int().nonnegative(),
      }),
      unknownBudget: z.boolean(),
      comfortableMonthlyPayment: z.number().int().nonnegative(),
      maxLimit: z.number().int().nonnegative(),
      tier: z.enum(budgetTierOptions),
    })
    .refine((value) => value.maxTotal >= value.minTotal, {
      message: "Max budget must be greater than or equal to min budget.",
    })
    .refine(
      (value) =>
        Object.values(value.allocation).reduce((sum, allocationValue) => sum + allocationValue, 0) === 100,
      {
        message: "Budget allocation sum must be 100.",
      },
    ),
  keepReplace: z.object({
    keepItems: z.array(z.enum(keepItemOptions)),
    keepItemAssetIds: z.array(z.string().min(1)),
    dimensionsNote: z.string(),
  }),
  roomPreferences: z.array(RoomPreferenceSchema),
  inspirations: z.object({
    inspirationAssetIds: z.array(z.string().min(1)),
    avoidAssetIds: z.array(z.string().min(1)),
    tagsByAsset: z.record(z.string(), z.array(z.enum(inspirationTagOptions))),
  }),
  contradictionsConfirmed: z.boolean(),
  confidenceFlags: z.object({
    measurements: z.enum(["high", "medium", "low"]),
    budget: z.enum(["high", "medium", "low"]),
  }),
  notes: z.string(),
  assets: z.array(IntakeAssetSchema),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export type IntakeJson = z.infer<typeof IntakeJsonSchema>;

export function normalizeIntakeDraft(input: Partial<IntakeDraft> = {}): IntakeDraft {
  return createDefaultIntakeDraft(input, input.id);
}

export function mergeIntakeDraft(current: IntakeDraft, patch: Partial<IntakeDraft>): IntakeDraft {
  const merged: Partial<IntakeDraft> = {
    ...current,
    ...patch,
    client: { ...current.client, ...patch.client },
    agreements: { ...current.agreements, ...patch.agreements },
    basics: { ...current.basics, ...patch.basics },
    floorplan: { ...current.floorplan, ...patch.floorplan },
    lifestyle: { ...current.lifestyle, ...patch.lifestyle },
    tradeoffs: { ...current.tradeoffs, ...patch.tradeoffs },
    tradeoffScores: { ...current.tradeoffScores, ...patch.tradeoffScores },
    style: {
      ...current.style,
      ...patch.style,
      quizAnswers: { ...current.style.quizAnswers, ...patch.style?.quizAnswers },
    },
    mood: {
      ...current.mood,
      ...patch.mood,
      quizAnswers: { ...current.mood.quizAnswers, ...patch.mood?.quizAnswers },
    },
    color: { ...current.color, ...patch.color },
    lighting: { ...current.lighting, ...patch.lighting },
    furniture: {
      ...current.furniture,
      ...patch.furniture,
      quizAnswers: { ...current.furniture.quizAnswers, ...patch.furniture?.quizAnswers },
    },
    budget: {
      ...current.budget,
      ...patch.budget,
      allocation: { ...current.budget.allocation, ...patch.budget?.allocation },
    },
    keepReplace: { ...current.keepReplace, ...patch.keepReplace },
    inspirations: {
      ...current.inspirations,
      ...patch.inspirations,
      tagsByAsset: {
        ...current.inspirations.tagsByAsset,
        ...patch.inspirations?.tagsByAsset,
      },
    },
    confidenceFlags: { ...current.confidenceFlags, ...patch.confidenceFlags },
    notes: patch.notes ?? current.notes,
    updatedAt: new Date().toISOString(),
  };

  if (patch.roomPreferences) {
    merged.roomPreferences = patch.roomPreferences;
  }

  if (patch.floorplan?.roomMeasurements) {
    merged.floorplan = {
      ...merged.floorplan,
      roomMeasurements: patch.floorplan.roomMeasurements,
    } as IntakeDraft["floorplan"];
  }

  if (patch.assets) {
    merged.assets = patch.assets;
  }

  return normalizeIntakeDraft(merged);
}

export function toValidatedIntakeJson(draft: IntakeDraft) {
  const normalized = normalizeIntakeDraft(draft);
  return IntakeJsonSchema.parse(normalized);
}

export function safeParseIntakeJson(draft: IntakeDraft) {
  const normalized = normalizeIntakeDraft(draft);
  return IntakeJsonSchema.safeParse(normalized);
}
