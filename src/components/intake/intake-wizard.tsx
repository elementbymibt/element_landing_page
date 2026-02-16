"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  budgetTierCards,
  businessRoomOptions,
  furnitureQuizQuestions,
  intakeGuideManifest,
  lightingCards,
  moodCards,
  moodQuizQuestions,
  paletteCards,
  propertyTypeLabels,
  residentialRoomOptions,
  roomLabels,
  styleCards,
  styleQuizQuestions,
} from "@/src/data/intake-content";
import { adminDefaults } from "@/src/data/admin-settings";
import { useLocale } from "@/src/components/i18n/locale-provider";
import { trackEvent } from "@/src/lib/analytics";
import { cn } from "@/src/lib/utils";
import {
  budgetAllocationKeys,
  mixedPremiumFocusOptions,
  tradeoffKeys,
  type FurnitureQualityOption,
  type IntakeAssetKindOption,
  type IntakeAssetRecord,
  type IntakeDraft,
  type MoodDiscoveryOption,
  type MoodQuizQuestionId,
  type RoomMeasurementDraft,
  type RoomPreferenceDraft,
  type RoomScopeOption,
  type StyleDiscoveryOption,
  type StyleQuizQuestionId,
} from "@/src/lib/intake/types";

type ApiError = {
  status: "error";
  message: string;
};

type SaveResponse = {
  status: "success";
  intake: IntakeDraft;
  savedAt: string;
};

type UploadResponse = {
  status: "success";
  asset: IntakeAssetRecord;
};

type SubmitResponse = {
  status: "success";
  redirectTo: string;
  contradictions: string[];
};

type SubmitNeedsConfirmation = {
  status: "needs_confirmation";
  contradictions: string[];
};

type SaveState = "idle" | "saving" | "saved" | "error";

const priorityLabels: Record<
  (typeof tradeoffKeys)[number],
  { sr: string; en: string }
> = {
  aesthetics: { sr: "Estetika", en: "Aesthetics" },
  functionality: { sr: "Funkcionalnost", en: "Functionality" },
  budget_control: { sr: "Kontrola budžeta", en: "Budget control" },
  speed_timeline: { sr: "Brzina", en: "Speed" },
  durability: { sr: "Trajnost", en: "Durability" },
};

const allocationLabels: Record<
  (typeof budgetAllocationKeys)[number],
  { sr: string; en: string }
> = {
  kitchen: { sr: "Kuhinja", en: "Kitchen" },
  living: { sr: "Dnevna", en: "Living" },
  bedrooms: { sr: "Spavaće", en: "Bedrooms" },
  bathroom: { sr: "Kupatilo", en: "Bathroom" },
  lighting: { sr: "Rasveta", en: "Lighting" },
  decor: { sr: "Dekor", en: "Decor" },
  appliances: { sr: "Tehnika", en: "Appliances" },
  seating: { sr: "Garniture/sedenje", en: "Seating" },
};

const wallPreferenceLabels = {
  keep_white: { sr: "Zadrži bele zidove", en: "Keep white walls" },
  greige_walls: { sr: "Greige zidovi", en: "Greige walls" },
  accent_wall: { sr: "Jedan akcentni zid", en: "One accent wall" },
  recommend_for_me: { sr: "Predloži umesto mene", en: "Recommend for me" },
} as const;

const lightingPresetDescriptions = {
  DAY_SOFT: {
    sr: "Meko dnevno svetlo i funkcionalna jasnoća.",
    en: "Soft daylight and practical clarity.",
  },
  AFTERNOON_WARM: {
    sr: "Balans topline i definicije kroz ceo dan.",
    en: "Balanced warmth and definition throughout the day.",
  },
  EVENING_COZY: {
    sr: "Topla večernja atmosfera i intimnija scena.",
    en: "Warm evening atmosphere with a more intimate mood.",
  },
} as const;

const roomLabelsEn: Record<RoomScopeOption, string> = {
  living_room: "Living room",
  kitchen: "Kitchen",
  bedroom: "Bedroom",
  bathroom: "Bathroom",
  dining: "Dining",
  hallway: "Hallway",
  office: "Office",
  kids_room: "Kids room",
  terrace: "Terrace",
  meeting_room: "Meeting room",
  reception: "Reception",
  open_space: "Open space",
  conference_room: "Conference room",
  kitchenette: "Kitchenette",
  storage_room: "Storage room",
  wc: "WC",
  commercial_zone: "Commercial zone",
};

const propertyTypeLabelsEn: Record<IntakeDraft["basics"]["propertyType"], string> = {
  apartment: "Apartment",
  house: "House",
  single_room: "Single room",
  business_space: "Business space",
  commercial_space: "Commercial space",
};

const positionLabels = {
  north: { sr: "Sever", en: "North" },
  south: { sr: "Jug", en: "South" },
  east: { sr: "Istok", en: "East" },
  west: { sr: "Zapad", en: "West" },
  unknown: { sr: "Ne znam", en: "Unknown" },
} as const;

const budgetTierRanges = {
  starter: { min: 12000, max: 30000 },
  balanced: { min: 30000, max: 70000 },
  premium: { min: 70000, max: 180000 },
} as const;

function formatDateTime(input: string, locale: "sr" | "en") {
  try {
    return new Date(input).toLocaleTimeString(locale === "en" ? "en-GB" : "sr-RS", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "--:--";
  }
}

function isEmailValid(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(value.trim());
}

function toggleValue<T extends string>(
  values: T[],
  value: T,
  max?: number,
): T[] {
  if (values.includes(value)) {
    return values.filter((item) => item !== value);
  }

  if (typeof max === "number" && values.length >= max) {
    return [...values.slice(1), value];
  }

  return [...values, value];
}

function normalizeToHundred<T extends string>(
  keys: readonly T[],
  source: Record<T, number>,
): Record<T, number> {
  const current = keys.map((key) => ({
    key,
    value: Math.max(0, Math.min(100, Math.round(source[key] ?? 0))),
  }));

  const total = current.reduce((sum, item) => sum + item.value, 0);

  if (total <= 0) {
    const equal = Math.floor(100 / keys.length);
    const result = {} as Record<T, number>;
    let sum = 0;

    current.forEach((item, index) => {
      const value = index === 0 ? 100 - equal * (keys.length - 1) : equal;
      result[item.key] = value;
      sum += value;
    });

    if (sum !== 100) {
      result[current[0].key] += 100 - sum;
    }

    return result;
  }

  const normalized = current.map((item) => ({
    key: item.key,
    value: Math.round((item.value / total) * 100),
  }));

  const diff = 100 - normalized.reduce((sum, item) => sum + item.value, 0);

  if (diff !== 0) {
    normalized[0].value += diff;
  }

  return normalized.reduce((acc, item) => {
    acc[item.key] = item.value;
    return acc;
  }, {} as Record<T, number>);
}

function getStyleSuggestionsFromQuiz(
  quizAnswers: Partial<Record<StyleQuizQuestionId, string>>,
): StyleDiscoveryOption[] {
  const styles: StyleDiscoveryOption[] = [];

  if (quizAnswers.materials === "natural") {
    styles.push("japandi", "natural_organic");
  }

  if (quizAnswers.materials === "lux") {
    styles.push("warm_luxury", "contemporary_classic");
  }

  if (quizAnswers.silhouette === "clean") {
    styles.push("modern_minimal", "scandinavian");
  }

  if (quizAnswers.silhouette === "statement") {
    styles.push("dark_elegant", "boutique_hotel");
  }

  if (quizAnswers.contrast === "high") {
    styles.push("soft_industrial", "dark_elegant");
  }

  if (quizAnswers.contrast === "soft") {
    styles.push("japandi", "mediterranean_warm");
  }

  if (quizAnswers.texture === "soft") {
    styles.push("scandinavian", "natural_organic");
  }

  if (quizAnswers.texture === "rich") {
    styles.push("warm_luxury", "boutique_hotel");
  }

  if (quizAnswers.mood_intensity === "calm") {
    styles.push("modern_minimal", "japandi");
  }

  if (quizAnswers.mood_intensity === "statement") {
    styles.push("dark_elegant", "soft_industrial");
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

  return unique.length > 0 ? unique : (["warm_luxury", "japandi"] as StyleDiscoveryOption[]);
}

function recommendWallPreference(styles: StyleDiscoveryOption[]) {
  if (styles.includes("dark_elegant")) {
    return "accent_wall";
  }

  if (styles.includes("modern_minimal") || styles.includes("scandinavian")) {
    return "keep_white";
  }

  return "greige_walls";
}

function getMoodSuggestionsFromQuiz(
  quizAnswers: Partial<Record<MoodQuizQuestionId, string>>,
): MoodDiscoveryOption[] {
  const moods: MoodDiscoveryOption[] = [];

  if (quizAnswers.daylight_preference === "maximum") {
    moods.push("bright_airy", "calm_minimal");
  }

  if (quizAnswers.daylight_preference === "controlled") {
    moods.push("dramatic_elegant", "cozy_warm");
  }

  if (quizAnswers.social_energy === "hosting") {
    moods.push("bold_artistic", "dramatic_elegant");
  }

  if (quizAnswers.social_energy === "retreat") {
    moods.push("calm_minimal", "soft_romantic");
  }

  if (quizAnswers.visual_temperature === "warm") {
    moods.push("cozy_warm", "soft_romantic");
  }

  if (quizAnswers.visual_temperature === "cool") {
    moods.push("bright_airy", "calm_minimal");
  }

  const unique: MoodDiscoveryOption[] = [];

  for (const mood of moods) {
    if (!unique.includes(mood)) {
      unique.push(mood);
    }

    if (unique.length >= 3) {
      break;
    }
  }

  return unique.length >= 2 ? unique : ["cozy_warm", "calm_minimal"];
}

function getFurnitureTierFromQuiz(
  quizAnswers: Partial<
    Record<"touch_expectation" | "longevity_expectation" | "care_tolerance", string>
  >,
): FurnitureQualityOption {
  if (quizAnswers.touch_expectation === "lux" || quizAnswers.longevity_expectation === "best") {
    return "premium";
  }

  if (quizAnswers.touch_expectation === "easy" && quizAnswers.care_tolerance === "low") {
    return "basic";
  }

  if (
    quizAnswers.touch_expectation === "balanced" ||
    quizAnswers.longevity_expectation === "high"
  ) {
    return "mid";
  }

  return "mid";
}

function recommendPalette(draft: IntakeDraft): IntakeDraft["color"]["palette"] {
  if (
    draft.style.selectedStyles.includes("dark_elegant") ||
    draft.mood.selectedMoods.includes("dramatic_elegant")
  ) {
    return "burgundy_accent";
  }

  if (draft.color.temperature === "cool") {
    return "white_black_accents";
  }

  if (
    draft.style.selectedStyles.includes("japandi") ||
    draft.style.selectedStyles.includes("natural_organic")
  ) {
    return "greige_walnut";
  }

  if (draft.mood.selectedMoods.includes("bright_airy")) {
    return "warm_neutrals";
  }

  if (draft.style.selectedStyles.includes("warm_luxury")) {
    return "cream_gold";
  }

  return "stone_taupe";
}

function suggestLightingPreset(dayNight: "day" | "night" | "balanced", dramaLevel: number) {
  if (dramaLevel >= 8) {
    return "EVENING_COZY";
  }

  if (dayNight === "day") {
    return "DAY_SOFT";
  }

  if (dayNight === "night") {
    return "EVENING_COZY";
  }

  return "AFTERNOON_WARM";
}

function localContradictions(draft: IntakeDraft, locale: "sr" | "en") {
  const issues: string[] = [];

  if (
    draft.color.brightness === "dark" &&
    draft.mood.selectedMoods.includes("bright_airy")
  ) {
    issues.push(
      locale === "en"
        ? "Dark base + Bright & Airy may require a visual compromise."
        : "Tamna baza + Bright & Airy može zahtevati kompromis.",
    );
  }

  if (
    draft.style.selectedStyles.includes("modern_minimal") &&
    draft.roomPreferences.some((room) => room.decorDensity === "rich")
  ) {
    issues.push(
      locale === "en"
        ? "Modern Minimal style conflicts with rich decor in one or more rooms."
        : "Modern Minimal stil + bogat dekor u pojedinim sobama.",
    );
  }

  if (
    draft.furniture.qualityTier === "premium" &&
    typeof draft.budget.maxTotal === "number" &&
    typeof draft.basics.total_m2 === "number" &&
    draft.budget.maxTotal < draft.basics.total_m2 * 900
  ) {
    issues.push(
      locale === "en"
        ? "Premium requirements are likely above the current budget."
        : "Premium zahtevi su verovatno iznad trenutno definisanog budžeta.",
    );
  }

  return issues;
}

function getRoomOptionsForProperty(
  propertyType: IntakeDraft["basics"]["propertyType"],
): RoomScopeOption[] {
  if (propertyType === "apartment" || propertyType === "house" || propertyType === "single_room") {
    return residentialRoomOptions;
  }

  return businessRoomOptions;
}

function getDefaultRoomsByProperty(
  propertyType: IntakeDraft["basics"]["propertyType"],
): RoomScopeOption[] {
  if (propertyType === "house") {
    return ["living_room", "kitchen", "bedroom", "bathroom"];
  }

  if (propertyType === "single_room") {
    return ["living_room"];
  }

  if (propertyType === "business_space") {
    return ["reception", "open_space", "meeting_room", "wc"];
  }

  if (propertyType === "commercial_space") {
    return ["commercial_zone", "reception", "storage_room", "wc"];
  }

  return ["living_room", "kitchen", "bedroom"];
}

function buildDefaultMeasurement(roomType: RoomScopeOption): RoomMeasurementDraft {
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

function syncDraftRooms(draft: IntakeDraft, rooms: RoomScopeOption[]): IntakeDraft {
  const uniqueRooms = Array.from(new Set(rooms));

  const roomMeasurements = uniqueRooms.map(
    (roomType) =>
      draft.floorplan.roomMeasurements.find((entry) => entry.roomType === roomType) ??
      buildDefaultMeasurement(roomType),
  );

  const roomPreferences = uniqueRooms.map(
    (roomType) =>
      draft.roomPreferences.find((entry) => entry.roomType === roomType) ??
      buildDefaultRoomPreference(roomType),
  );

  const roomQuantities = uniqueRooms.reduce<Partial<Record<RoomScopeOption, number>>>(
    (acc, roomType) => {
      const current = draft.basics.roomQuantities[roomType] ?? 1;
      acc[roomType] = Math.max(1, Math.min(10, Math.round(current)));
      return acc;
    },
    {},
  );

  return {
    ...draft,
    basics: {
      ...draft.basics,
      roomsInScope: uniqueRooms,
      roomQuantities,
    },
    floorplan: {
      ...draft.floorplan,
      roomMeasurements,
    },
    roomPreferences,
  };
}

function getStorageNeedFromScore(score: number): IntakeDraft["lifestyle"]["storageNeed"] {
  if (score <= 3) {
    return "low";
  }

  if (score <= 7) {
    return "medium";
  }

  return "high";
}

function getMaintenanceFromScore(
  score: number,
): IntakeDraft["lifestyle"]["maintenancePreference"] {
  if (score <= 5) {
    return "low_maintenance";
  }

  return "delicate_materials";
}

function getStyleTitle(styleId: StyleDiscoveryOption) {
  return styleCards.find((item) => item.id === styleId)?.title ?? styleId;
}

function getPaletteTitle(paletteId: IntakeDraft["color"]["palette"]) {
  return paletteCards.find((item) => item.id === paletteId)?.title ?? paletteId;
}

function PercentageBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full rounded-full bg-brand-neutral-300/70">
      <div
        className="bg-brand-gold h-2 rounded-full transition-all"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

function StepTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      <p className="text-brand-gold text-xs tracking-[0.25em] uppercase">{eyebrow}</p>
      <h2 className="font-display text-brand-burgundy mt-2 text-3xl leading-tight md:text-4xl">
        {title}
      </h2>
      {description ? <p className="text-brand-earth mt-3 max-w-3xl text-sm">{description}</p> : null}
    </div>
  );
}

function SelectablePill({
  active,
  label,
  onClick,
  className,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-sm transition",
        active
          ? "border-brand-burgundy bg-brand-burgundy text-white"
          : "border-brand-neutral-500 text-brand-earth hover:border-brand-gold hover:text-brand-burgundy",
        className,
      )}
    >
      {label}
    </button>
  );
}

export function IntakeWizard({ initialIntake }: { initialIntake: IntakeDraft }) {
  const router = useRouter();
  const { locale } = useLocale();
  const tx = useCallback(
    (sr: string, en: string) => (locale === "en" ? en : sr),
    [locale],
  );

  const [draft, setDraft] = useState<IntakeDraft>(initialIntake);
  const [step, setStep] = useState(initialIntake.currentStep || 0);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [lastSavedAt, setLastSavedAt] = useState(initialIntake.updatedAt);
  const [saveError, setSaveError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [serverContradictions, setServerContradictions] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const draftRef = useRef(draft);
  const mountedRef = useRef(false);

  const stepTitles = useMemo(() => {
    if (locale === "en") {
      return [
        "Welcome",
        "Project Basics",
        "Floorplan & Measurements",
        "Household & Lifestyle",
        "Priority Tradeoffs",
        "Style Discovery",
        "Mood & Atmosphere",
        "Color Palette Builder",
        "Lighting Preferences",
        "Furniture & Materials",
        "Budget Planner",
        "Room-by-room Preferences",
        "Inspirations & Final Confirmation",
      ] as const;
    }

    return [
      "Dobrodošli",
      "Osnovni podaci projekta",
      "Tlocrt i mere",
      "Lifestyle i navike",
      "Prioriteti",
      "Otkrivanje stila",
      "Raspoloženje i atmosfera",
      "Izbor palete",
      "Preferencije rasvete",
      "Nameštaj i materijali",
      "Budžet planer",
      "Preferencije po prostoriji",
      "Inspiracije i finalna potvrda",
    ] as const;
  }, [locale]);

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  const progress = useMemo(
    () => Math.round(((step + 1) / stepTitles.length) * 100),
    [step, stepTitles.length],
  );

  const updateDraft = useCallback((updater: (prev: IntakeDraft) => IntakeDraft) => {
    setDraft((prev) => {
      const next = updater(prev);
      return {
        ...next,
        currentStep: step,
        updatedAt: new Date().toISOString(),
      };
    });
  }, [step]);

  const persistDraft = useCallback(
    async (nextStep: number, payload?: IntakeDraft) => {
      setSaveState("saving");
      setSaveError("");

      try {
        const response = await fetch(`/api/intake/${draft.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentStep: nextStep,
            draft: payload ?? draftRef.current,
          }),
        });

        const result = (await response.json()) as SaveResponse | ApiError;

        if (!response.ok || result.status === "error") {
          throw new Error(
            result.status === "error"
              ? result.message
              : tx("Greška pri snimanju.", "Save error."),
          );
        }

        setSaveState("saved");
        setLastSavedAt(result.savedAt);
      } catch (error) {
        setSaveState("error");
        setSaveError(error instanceof Error ? error.message : tx("Snimanje nije uspelo.", "Save failed."));
      }
    },
    [draft.id, tx],
  );

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }

    const timeout = window.setTimeout(() => {
      void persistDraft(step);
    }, 900);

    return () => window.clearTimeout(timeout);
  }, [draft, step, persistDraft]);

  const changeStep = async (targetStep: number) => {
    const bounded = Math.max(0, Math.min(stepTitles.length - 1, targetStep));
    setStep(bounded);
    setDraft((prev) => ({ ...prev, currentStep: bounded }));
    await persistDraft(bounded, { ...draftRef.current, currentStep: bounded });
  };

  const updateRoomMeasurement = (
    roomType: RoomScopeOption,
    updater: (room: IntakeDraft["floorplan"]["roomMeasurements"][number]) => IntakeDraft["floorplan"]["roomMeasurements"][number],
  ) => {
    updateDraft((prev) => ({
      ...prev,
      floorplan: {
        ...prev.floorplan,
        roomMeasurements: prev.floorplan.roomMeasurements.map((room) =>
          room.roomType === roomType ? updater(room) : room,
        ),
      },
    }));
  };

  const updateRoomPreference = (
    roomType: RoomScopeOption,
    updater: (room: IntakeDraft["roomPreferences"][number]) => IntakeDraft["roomPreferences"][number],
  ) => {
    updateDraft((prev) => ({
      ...prev,
      roomPreferences: prev.roomPreferences.map((room) =>
        room.roomType === roomType ? updater(room) : room,
      ),
    }));
  };

  const uploadAssets = async (
    files: FileList | null,
    kind: IntakeAssetKindOption,
    roomType: RoomScopeOption | null = null,
  ) => {
    if (!files || files.length === 0) {
      return;
    }

    setUploading(true);

    const uploadedAssets: IntakeAssetRecord[] = [];

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("intakeId", draft.id);
        formData.append("kind", kind);
        formData.append("roomType", roomType ?? "");
        formData.append("label", file.name);
        formData.append("file", file);

        const response = await fetch("/api/intake/upload", {
          method: "POST",
          body: formData,
        });

        const result = (await response.json()) as UploadResponse | ApiError;

        if (!response.ok || result.status === "error") {
          throw new Error(result.status === "error" ? result.message : "Upload error");
        }

        uploadedAssets.push(result.asset);
      }

      if (uploadedAssets.length > 0) {
        updateDraft((prev) => {
          const assets = [...prev.assets, ...uploadedAssets.filter((asset) => !prev.assets.some((current) => current.id === asset.id))];

          const floorplan =
            kind === "plan"
              ? {
                  ...prev.floorplan,
                  hasPlan: true,
                  planAssetIds: [
                    ...new Set([...prev.floorplan.planAssetIds, ...uploadedAssets.map((asset) => asset.id)]),
                  ],
                }
              : prev.floorplan;

          const inspirations =
            kind === "inspiration"
              ? {
                  ...prev.inspirations,
                  inspirationAssetIds: [
                    ...new Set([
                      ...prev.inspirations.inspirationAssetIds,
                      ...uploadedAssets.map((asset) => asset.id),
                    ]),
                  ],
                }
              : kind === "avoid"
                ? {
                    ...prev.inspirations,
                    avoidAssetIds: [
                      ...new Set([
                        ...prev.inspirations.avoidAssetIds,
                        ...uploadedAssets.map((asset) => asset.id),
                      ]),
                    ],
                  }
                : prev.inspirations;

          return {
            ...prev,
            assets,
            floorplan,
            inspirations,
          };
        });
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : tx("Upload nije uspeo.", "Upload failed."));
    } finally {
      setUploading(false);
    }
  };

  const previewContradictions = useMemo(
    () => localContradictions(draft, locale),
    [draft, locale],
  );

  const handleSubmit = async () => {
    if (!draft.client.fullName.trim()) {
      setSubmitError(
        tx("Unesite ime i prezime pre slanja upitnika.", "Please enter your full name before submitting."),
      );
      return;
    }

    if (!isEmailValid(draft.client.email)) {
      setSubmitError(
        tx("Unesite ispravnu email adresu pre slanja upitnika.", "Please enter a valid email before submitting."),
      );
      return;
    }

    if (draft.agreements.hasExactMeasurements === null) {
      setSubmitError(
        tx("Označite da li su mere tačne ili okvirne.", "Please mark whether your measurements are exact or approximate."),
      );
      return;
    }

    if (
      !draft.agreements.understandsConceptConceptualOnly ||
      !draft.agreements.understandsTwoRevisionsIncluded ||
      !draft.agreements.privacyConsent
    ) {
      setSubmitError(
        tx(
          "Potvrdite sve obavezne saglasnosti pre slanja.",
          "Please confirm all required agreements before submitting.",
        ),
      );
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch(`/api/intake/${draft.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          confirmContradictions: draft.contradictionsConfirmed,
          draft,
        }),
      });

      const result = (await response.json()) as SubmitResponse | SubmitNeedsConfirmation | ApiError;

      if (response.status === 409 && result.status === "needs_confirmation") {
        setServerContradictions(result.contradictions);
        setSubmitError(
          tx(
            "Potvrdite kontradikcije pre finalnog slanja.",
            "Please confirm contradictions before final submit.",
          ),
        );
        return;
      }

      if (!response.ok || result.status !== "success") {
        const message =
          result && "message" in result
            ? result.message
            : tx(
                "Nismo uspeli da završimo intake. Pokušajte ponovo.",
                "Failed to complete intake. Please try again.",
              );
        throw new Error(message);
      }

      trackEvent("intake_submit", {
        source: "intake_wizard",
        id: draft.id,
      });
      trackEvent("lead_submit", {
        source: "intake_wizard",
      });

      router.push(result.redirectTo);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : tx("Došlo je do greške.", "Something went wrong."),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const planAssets = draft.assets.filter((asset) => asset.kind === "plan");
  const inspirationAssets = draft.assets.filter((asset) => asset.kind === "inspiration");
  const avoidAssets = draft.assets.filter((asset) => asset.kind === "avoid");

  return (
    <div className="space-y-8">
      <section className="border-brand-neutral-500/60 bg-brand-neutral-100 sticky top-20 z-40 rounded-3xl border p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-brand-gold text-xs tracking-[0.24em] uppercase">
              {tx("Klijentski upitnik", "Client intake")}
            </p>
            <h1 className="font-display text-brand-burgundy mt-2 text-2xl md:text-3xl">
              {stepTitles[step]}
            </h1>
            <p className="text-brand-earth mt-1 text-xs md:text-sm">
              {tx("Korak", "Step")} {step + 1} / {stepTitles.length}
            </p>
          </div>
          <div className="text-right text-xs md:text-sm">
            <p
              className={cn(
                "font-medium",
                saveState === "saved"
                  ? "text-brand-green"
                  : saveState === "saving"
                    ? "text-brand-earth"
                    : saveState === "error"
                      ? "text-red-700"
                      : "text-brand-earth",
              )}
            >
              {saveState === "saved"
                ? `${tx("Sačuvano:", "Saved:")} ${formatDateTime(lastSavedAt, locale)}`
                : saveState === "saving"
                  ? tx("Snimanje...", "Saving...")
                  : saveState === "error"
                    ? tx("Greška pri snimanju", "Save error")
                    : tx("Spremno", "Ready")}
            </p>
            {saveError ? <p className="mt-1 text-red-700">{saveError}</p> : null}
          </div>
        </div>

        <div className="mt-4">
          <PercentageBar value={progress} />
        </div>
      </section>

      <section className="border-brand-neutral-500/60 rounded-3xl border bg-white p-6 md:p-8">
        {step === 0 ? (
          <div className="space-y-6">
            <StepTitle
              eyebrow={tx("Korak 0", "Step 0")}
              title={tx(
                "Za 10-12 minuta do jasnog brief-a.",
                "In 10-12 minutes: a clear design brief.",
              )}
              description={tx(
                "Odgovorite na nekoliko pitanja o prostoru i preferencijama. Ako niste sigurni, uvek možete izabrati „Ne znam“.",
                "Answer a few questions about your space and preferences. If unsure, you can always choose “I don’t know”.",
              )}
            />

            <div className="grid gap-4 md:grid-cols-3">
              <div className="border-brand-neutral-500/60 rounded-2xl border bg-brand-neutral-100 p-4">
                <p className="text-brand-burgundy text-sm font-semibold">
                  {tx("Osnove projekta", "Project basics")}
                </p>
                <p className="text-brand-earth mt-2 text-xs">
                  {tx(
                    "Obim, dimenzije i ključna ograničenja, da sve postavimo na čvrste temelje.",
                    "Scope, measurements and key constraints to set a solid foundation.",
                  )}
                </p>
              </div>
              <div className="border-brand-neutral-500/60 rounded-2xl border bg-brand-neutral-100 p-4">
                <p className="text-brand-burgundy text-sm font-semibold">
                  {tx("Stil i atmosfera", "Style & mood")}
                </p>
                <p className="text-brand-earth mt-2 text-xs">
                  {tx(
                    "Vizuelne kartice za stil, boje i rasvetu, uz diskretno vođenje.",
                    "Visual cards for style, palette and lighting, with gentle guidance.",
                  )}
                </p>
              </div>
              <div className="border-brand-neutral-500/60 rounded-2xl border bg-brand-neutral-100 p-4">
                <p className="text-brand-burgundy text-sm font-semibold">
                  {tx("Finalni pregled", "Final review")}
                </p>
                <p className="text-brand-earth mt-2 text-xs">
                  {tx(
                    "Pre slanja dobijate pregled svih izbora, uz proveru potencijalnih neslaganja.",
                    "Before submit you get a full review of choices, plus a quick inconsistency check.",
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void changeStep(1)}
              className="btn-primary inline-flex min-h-12 items-center justify-center rounded-full px-8 text-sm font-semibold"
            >
              {tx("Krenimo", "Let’s begin")}
            </button>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-8">
            <StepTitle
              eyebrow={tx("Korak 1", "Step 1")}
              title="Project Basics"
              description={tx(
                "Definišemo osnovni okvir projekta: tip prostora, lokaciju, kvadraturu i scope prostorija sa količinama.",
                "Define project fundamentals: property type, location, floor area and room scope with quantities.",
              )}
            />

            <div>
              <p className="text-brand-burgundy mb-3 text-sm font-semibold">
                {tx("Tip nekretnine", "Property type")}
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(propertyTypeLabels).map(([value, label]) => (
                  <SelectablePill
                    key={value}
                    active={draft.basics.propertyType === value}
                    label={
                      locale === "en"
                        ? propertyTypeLabelsEn[value as IntakeDraft["basics"]["propertyType"]]
                        : label
                    }
                    onClick={() =>
                      updateDraft((prev) => {
                        const nextProperty = value as IntakeDraft["basics"]["propertyType"];
                        const allowedRooms = getRoomOptionsForProperty(nextProperty);
                        const filteredRooms = prev.basics.roomsInScope.filter((room) =>
                          allowedRooms.includes(room),
                        );
                        const nextRooms =
                          filteredRooms.length > 0
                            ? filteredRooms
                            : getDefaultRoomsByProperty(nextProperty);

                        return syncDraftRooms(
                          {
                            ...prev,
                            basics: {
                              ...prev.basics,
                              propertyType: nextProperty,
                            },
                          },
                          nextRooms,
                        );
                      })
                    }
                  />
                ))}
              </div>
              <p className="text-brand-earth mt-2 text-xs">
                {draft.basics.propertyType === "business_space" ||
                draft.basics.propertyType === "commercial_space"
                  ? tx(
                      "Za poslovne i komercijalne prostore birate poslovne zone i možete uneti više jedinica po tipu.",
                      "For business and commercial spaces, choose business zones and set multiple units per room type.",
                    )
                  : tx(
                      "Za stambene projekte birate stambene prostorije sa količinom po tipu.",
                      "For residential projects, choose residential room types and quantities.",
                    )}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="intake-city" className="text-brand-earth mb-2 block text-sm">
                  {tx("Grad", "City")}
                </label>
                <input
                  id="intake-city"
                  type="text"
                  className="input-field"
                  value={draft.basics.city}
                  onChange={(event) =>
                    updateDraft((prev) => ({
                      ...prev,
                      basics: {
                        ...prev.basics,
                        city: event.target.value,
                      },
                    }))
                  }
                />
              </div>
              <div>
                <label htmlFor="intake-m2" className="text-brand-earth mb-2 block text-sm">
                  {tx("Ukupna kvadratura (m2)", "Total area (m2)")}
                </label>
                <input
                  id="intake-m2"
                  type="number"
                  className="input-field"
                  min={10}
                  value={draft.basics.total_m2 ?? ""}
                  onChange={(event) =>
                    updateDraft((prev) => ({
                      ...prev,
                      basics: {
                        ...prev.basics,
                        total_m2: Number(event.target.value) || 0,
                      },
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <p className="text-brand-burgundy mb-3 text-sm font-semibold">
                {tx("Rooms in scope", "Rooms in scope")}
              </p>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {getRoomOptionsForProperty(draft.basics.propertyType).map((roomType) => {
                  const checked = draft.basics.roomsInScope.includes(roomType);
                  const quantity = draft.basics.roomQuantities[roomType] ?? 1;

                  return (
                    <div
                      key={roomType}
                      className={cn(
                        "rounded-2xl border p-3 text-sm transition",
                        checked
                          ? "border-brand-burgundy bg-brand-burgundy/5 text-brand-burgundy"
                          : "border-brand-neutral-500/60 text-brand-earth",
                      )}
                    >
                      <label className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          className="mt-0.5"
                          checked={checked}
                          onChange={() =>
                            updateDraft((prev) => {
                              const already = prev.basics.roomsInScope.includes(roomType);
                              const nextRooms = already
                                ? prev.basics.roomsInScope.filter((item) => item !== roomType)
                                : [...prev.basics.roomsInScope, roomType];
                              const safeRooms =
                                nextRooms.length > 0
                                  ? nextRooms
                                  : [getDefaultRoomsByProperty(prev.basics.propertyType)[0]];

                              return syncDraftRooms(prev, safeRooms);
                            })
                          }
                        />
                        <span>{locale === "en" ? roomLabelsEn[roomType] : roomLabels[roomType]}</span>
                      </label>

                      {checked ? (
                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-brand-earth text-xs">
                            {tx("Količina", "Quantity")}
                          </span>
                          <button
                            type="button"
                            className="rounded-full border border-brand-neutral-500 px-2 py-0.5 text-xs"
                            onClick={() =>
                              updateDraft((prev) => ({
                                ...prev,
                                basics: {
                                  ...prev.basics,
                                  roomQuantities: {
                                    ...prev.basics.roomQuantities,
                                    [roomType]: Math.max(
                                      1,
                                      (prev.basics.roomQuantities[roomType] ?? 1) - 1,
                                    ),
                                  },
                                },
                              }))
                            }
                          >
                            -
                          </button>
                          <span className="text-brand-burgundy min-w-5 text-center font-semibold">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            className="rounded-full border border-brand-neutral-500 px-2 py-0.5 text-xs"
                            onClick={() =>
                              updateDraft((prev) => ({
                                ...prev,
                                basics: {
                                  ...prev.basics,
                                  roomQuantities: {
                                    ...prev.basics.roomQuantities,
                                    [roomType]: Math.min(
                                      10,
                                      (prev.basics.roomQuantities[roomType] ?? 1) + 1,
                                    ),
                                  },
                                },
                              }))
                            }
                          >
                            +
                          </button>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-8">
            <StepTitle
              eyebrow={tx("Korak 2", "Step 2")}
              title="Floorplan & Measurements"
              description={tx(
                "Ako imate projekat, skicu ili crtež uploadujte ga. Ako nemate, koristite vodič i opciju 'Ne znam'.",
                "Upload existing plans/sketches if you have them. If not, use the guide and 'I don't know' options.",
              )}
            />

            <div className="space-y-4 rounded-2xl border border-dashed border-brand-neutral-500 p-5">
              <p className="text-brand-burgundy text-sm font-semibold">
                {tx(
                  "Upload plan/skicu/crtež (PDF/PNG/JPG) - opciono",
                  "Upload plan/sketch/drawing (PDF/PNG/JPG) - optional",
                )}
              </p>
              <input
                type="file"
                accept=".pdf,image/png,image/jpeg,image/webp"
                onChange={(event) => void uploadAssets(event.target.files, "plan")}
              />
              <p className="text-brand-earth text-xs">
                {uploading ? tx("Upload u toku...", "Uploading...") : ""}
              </p>

              {planAssets.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {planAssets.map((asset) => (
                    <a
                      key={asset.id}
                      href={asset.originalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="border-brand-neutral-500/60 rounded-xl border bg-brand-neutral-100 p-3 text-xs"
                    >
                      {asset.label || tx("Plan fajl", "Plan file")}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>

            {!draft.floorplan.hasPlan ? (
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="border-brand-neutral-500/60 rounded-2xl border p-4">
                  <p className="text-brand-burgundy mb-3 text-sm font-semibold">
                    {tx("How to measure quickly (video)", "How to measure quickly (video)")}
                  </p>
                  <Image
                    src={intakeGuideManifest.quickMeasureVideo}
                    alt={tx("Vodič za brzo merenje", "Quick measuring guide")}
                    width={1200}
                    height={720}
                    className="h-auto w-full rounded-xl"
                  />
                </div>
                <div className="border-brand-neutral-500/60 rounded-2xl border p-4">
                  <p className="text-brand-burgundy mb-3 text-sm font-semibold">
                    {tx("Ilustrovani vodič", "Illustrated guide")}
                  </p>
                  <Image
                    src={intakeGuideManifest.quickMeasureIllustration}
                    alt={tx("Ilustrovani vodič za merenje", "Illustrated measuring guide")}
                    width={1200}
                    height={720}
                    className="h-auto w-full rounded-xl"
                  />
                  <label className="text-brand-earth mt-4 flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={draft.floorplan.measurementGuideSeen}
                      onChange={(event) =>
                        updateDraft((prev) => ({
                          ...prev,
                          floorplan: {
                            ...prev.floorplan,
                            measurementGuideSeen: event.target.checked,
                          },
                        }))
                      }
                    />
                    {tx("Pogledao/la sam vodič", "I viewed the guide")}
                  </label>
                </div>
              </div>
            ) : null}

            <div className="space-y-5">
              {draft.basics.roomsInScope.map((roomType) => {
                const roomMeasurement = draft.floorplan.roomMeasurements.find(
                  (room) => room.roomType === roomType,
                );

                if (!roomMeasurement) {
                  return null;
                }

                const defaultTemplate = adminDefaults.roomTemplates[roomType];
                const quantity = draft.basics.roomQuantities[roomType] ?? 1;
                const door = roomMeasurement.doors[0];
                const windowItem = roomMeasurement.windows[0];

                return (
                  <div key={roomType} className="border-brand-neutral-500/60 rounded-2xl border p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-brand-burgundy text-sm font-semibold">
                        {locale === "en" ? roomLabelsEn[roomType] : roomLabels[roomType]}{" "}
                        <span className="text-brand-earth text-xs">x{quantity}</span>
                      </p>
                      <button
                        type="button"
                        className="text-brand-burgundy text-xs underline"
                        onClick={() =>
                          updateRoomMeasurement(roomType, (room) => ({
                            ...room,
                            width_mm: defaultTemplate.width_mm,
                            length_mm: defaultTemplate.length_mm,
                            ceiling_height_mm: defaultTemplate.ceiling_height_mm,
                            confidence: "low",
                            used_defaults: true,
                          }))
                        }
                      >
                        {tx("Ne znam - koristi default", "I don't know - use defaults")}
                      </button>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                      <div>
                        <label className="text-brand-earth mb-1 block text-xs">
                          {tx("Širina (mm)", "Width (mm)")}
                        </label>
                        <input
                          type="number"
                          className="input-field"
                          value={roomMeasurement.width_mm ?? ""}
                          onChange={(event) =>
                            updateRoomMeasurement(roomType, (room) => ({
                              ...room,
                              width_mm: Number(event.target.value) || 0,
                              confidence: "high",
                              used_defaults: false,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label className="text-brand-earth mb-1 block text-xs">
                          {tx("Dužina (mm)", "Length (mm)")}
                        </label>
                        <input
                          type="number"
                          className="input-field"
                          value={roomMeasurement.length_mm ?? ""}
                          onChange={(event) =>
                            updateRoomMeasurement(roomType, (room) => ({
                              ...room,
                              length_mm: Number(event.target.value) || 0,
                              confidence: "high",
                              used_defaults: false,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label className="text-brand-earth mb-1 block text-xs">
                          {tx("Visina plafona (mm)", "Ceiling height (mm)")}
                        </label>
                        <input
                          type="number"
                          className="input-field"
                          value={roomMeasurement.ceiling_height_mm ?? ""}
                          onChange={(event) =>
                            updateRoomMeasurement(roomType, (room) => ({
                              ...room,
                              ceiling_height_mm: Number(event.target.value) || 0,
                              confidence: "high",
                              used_defaults: false,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div className="rounded-xl border border-brand-neutral-500/60 p-3">
                        <p className="text-brand-earth mb-2 text-xs uppercase">
                          {tx("Vrata", "Doors")}
                        </p>
                        <select
                          className="input-field"
                          value={door?.position ?? "unknown"}
                          onChange={(event) =>
                            updateRoomMeasurement(roomType, (room) => ({
                              ...room,
                              doors: [
                                {
                                  ...(room.doors[0] ?? { id: crypto.randomUUID() }),
                                  position: event.target.value as typeof room.doors[number]["position"],
                                  width_mm: room.doors[0]?.width_mm ?? defaultTemplate.door_width_mm,
                                },
                              ],
                            }))
                          }
                        >
                          <option value="unknown">{tx("Pozicija", "Position")}</option>
                          <option value="north">{positionLabels.north[locale]}</option>
                          <option value="south">{positionLabels.south[locale]}</option>
                          <option value="east">{positionLabels.east[locale]}</option>
                          <option value="west">{positionLabels.west[locale]}</option>
                        </select>
                        <input
                          type="number"
                          className="input-field mt-2"
                          placeholder={tx("Širina vrata (mm)", "Door width (mm)")}
                          value={door?.width_mm ?? ""}
                          onChange={(event) =>
                            updateRoomMeasurement(roomType, (room) => ({
                              ...room,
                              doors: [
                                {
                                  ...(room.doors[0] ?? { id: crypto.randomUUID(), position: "unknown" }),
                                  width_mm: Number(event.target.value) || 0,
                                },
                              ],
                            }))
                          }
                        />
                      </div>

                      <div className="rounded-xl border border-brand-neutral-500/60 p-3">
                        <p className="text-brand-earth mb-2 text-xs uppercase">
                          {tx("Prozor", "Window")}
                        </p>
                        <select
                          className="input-field"
                          value={windowItem?.position ?? "unknown"}
                          onChange={(event) =>
                            updateRoomMeasurement(roomType, (room) => ({
                              ...room,
                              windows: [
                                {
                                  ...(room.windows[0] ?? { id: crypto.randomUUID() }),
                                  position: event.target.value as typeof room.windows[number]["position"],
                                  width_mm: room.windows[0]?.width_mm ?? defaultTemplate.window_width_mm,
                                  sill_height_mm:
                                    room.windows[0]?.sill_height_mm ?? defaultTemplate.window_sill_height_mm,
                                },
                              ],
                            }))
                          }
                        >
                          <option value="unknown">{tx("Pozicija", "Position")}</option>
                          <option value="north">{positionLabels.north[locale]}</option>
                          <option value="south">{positionLabels.south[locale]}</option>
                          <option value="east">{positionLabels.east[locale]}</option>
                          <option value="west">{positionLabels.west[locale]}</option>
                        </select>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            className="input-field"
                            placeholder={tx("Širina (mm)", "Width (mm)")}
                            value={windowItem?.width_mm ?? ""}
                            onChange={(event) =>
                              updateRoomMeasurement(roomType, (room) => ({
                                ...room,
                                windows: [
                                  {
                                    ...(room.windows[0] ?? {
                                      id: crypto.randomUUID(),
                                      position: "unknown",
                                    }),
                                    width_mm: Number(event.target.value) || 0,
                                    sill_height_mm:
                                      room.windows[0]?.sill_height_mm ?? defaultTemplate.window_sill_height_mm,
                                  },
                                ],
                              }))
                            }
                          />
                          <input
                            type="number"
                            className="input-field"
                            placeholder={tx("Parapet (mm)", "Sill height (mm)")}
                            value={windowItem?.sill_height_mm ?? ""}
                            onChange={(event) =>
                              updateRoomMeasurement(roomType, (room) => ({
                                ...room,
                                windows: [
                                  {
                                    ...(room.windows[0] ?? {
                                      id: crypto.randomUUID(),
                                      position: "unknown",
                                    }),
                                    width_mm:
                                      room.windows[0]?.width_mm ?? defaultTemplate.window_width_mm,
                                    sill_height_mm: Number(event.target.value) || 0,
                                  },
                                ],
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <label className="text-brand-earth flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={draft.floorplan.pendingUploadLater}
                onChange={(event) =>
                  updateDraft((prev) => ({
                    ...prev,
                    floorplan: {
                      ...prev.floorplan,
                      pendingUploadLater: event.target.checked,
                    },
                  }))
                }
              />
              {tx(
                "Plan i precizne mere ću upload-ovati kasnije.",
                "I will upload final plans and precise measurements later.",
              )}
            </label>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-8">
            <StepTitle
              eyebrow={tx("Korak 3", "Step 3")}
              title="Household & Lifestyle"
              description={tx(
                "Cilj je da razumemo realnu upotrebu prostora: ko koristi prostor, kako i koliko intenzivno.",
                "The goal is to map real-life use: who uses the space, how and how intensively.",
              )}
            />

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-brand-earth mb-2 block text-sm">
                  {tx("Broj osoba", "People")}
                </label>
                <select
                  className="input-field"
                  value={draft.lifestyle.peopleCount}
                  onChange={(event) =>
                    updateDraft((prev) => ({
                      ...prev,
                      lifestyle: {
                        ...prev.lifestyle,
                        peopleCount: Number(event.target.value),
                      },
                    }))
                  }
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5+</option>
                </select>
              </div>

              <div>
                <label className="text-brand-earth mb-2 block text-sm">
                  {tx("Work-from-home", "Work-from-home")}
                </label>
                <select
                  className="input-field"
                  value={draft.lifestyle.workFromHome}
                  onChange={(event) =>
                    updateDraft((prev) => ({
                      ...prev,
                      lifestyle: {
                        ...prev.lifestyle,
                        workFromHome: event.target.value as IntakeDraft["lifestyle"]["workFromHome"],
                      },
                    }))
                  }
                >
                  <option value="none">{tx("Nema", "None")}</option>
                  <option value="sometimes">{tx("Ponekad", "Sometimes")}</option>
                  <option value="daily">{tx("Svakodnevno", "Daily")}</option>
                </select>
              </div>

              <div>
                <label className="text-brand-earth mb-2 block text-sm">
                  {tx("Guest frequency", "Guest frequency")}
                </label>
                <select
                  className="input-field"
                  value={draft.lifestyle.guests}
                  onChange={(event) =>
                    updateDraft((prev) => ({
                      ...prev,
                      lifestyle: {
                        ...prev.lifestyle,
                        guests: event.target.value as IntakeDraft["lifestyle"]["guests"],
                      },
                    }))
                  }
                >
                  <option value="rare">{tx("Retko", "Rare")}</option>
                  <option value="monthly">{tx("Mesečno", "Monthly")}</option>
                  <option value="weekly">{tx("Nedeljno", "Weekly")}</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-brand-earth mb-2 text-sm">{tx("Deca (uzrast)", "Kids (age ranges)")}</p>
                <div className="flex flex-wrap gap-2">
                  {(["none", "0-3", "4-7", "8-12", "13-17"] as const).map((range) => (
                    <SelectablePill
                      key={range}
                      active={draft.lifestyle.kidsAgeRanges.includes(range)}
                      label={range === "none" ? tx("Nema dece", "No kids") : range}
                      onClick={() =>
                        updateDraft((prev) => {
                          const current = prev.lifestyle.kidsAgeRanges;
                          const next =
                            range === "none"
                              ? current.includes("none")
                                ? []
                                : ["none"]
                              : toggleValue(current.filter((entry) => entry !== "none"), range);

                          return {
                            ...prev,
                            lifestyle: {
                            ...prev.lifestyle,
                            kidsAgeRanges: next as IntakeDraft["lifestyle"]["kidsAgeRanges"],
                          },
                        };
                      })
                      }
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-brand-earth mb-2 text-sm">{tx("Ljubimci", "Pets")}</p>
                <div className="flex flex-wrap gap-2">
                  {([
                    ["dog", tx("Pas", "Dog")],
                    ["cat", tx("Mačka", "Cat")],
                    ["small_pet", tx("Mali ljubimac", "Small pet")],
                    ["none", tx("Nema", "None")],
                  ] as const).map(([value, label]) => (
                    <SelectablePill
                      key={value}
                      active={draft.lifestyle.pets.includes(value)}
                      label={label}
                      onClick={() =>
                        updateDraft((prev) => {
                          const current = prev.lifestyle.pets;
                          const next =
                            value === "none"
                              ? current.includes("none")
                                ? []
                                : ["none"]
                              : toggleValue(current.filter((entry) => entry !== "none"), value);

                          return {
                            ...prev,
                            lifestyle: {
                            ...prev.lifestyle,
                            pets: next as IntakeDraft["lifestyle"]["pets"],
                          },
                        };
                      })
                      }
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-brand-earth mb-2 block text-sm">
                  {tx("Učestalost kuvanja", "Cooking frequency")}
                </label>
                <select
                  className="input-field"
                  value={draft.lifestyle.cookingFrequency}
                  onChange={(event) =>
                    updateDraft((prev) => ({
                      ...prev,
                      lifestyle: {
                        ...prev.lifestyle,
                        cookingFrequency: event.target.value as IntakeDraft["lifestyle"]["cookingFrequency"],
                      },
                    }))
                  }
                >
                  <option value="rare">{tx("Retko", "Rare")}</option>
                  <option value="weekly">{tx("Nedeljno", "Weekly")}</option>
                  <option value="daily">{tx("Svakodnevno", "Daily")}</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-brand-earth mb-2 block text-sm">
                  {tx("Storage need (1-10)", "Storage need (1-10)")}
                </label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={draft.lifestyle.storageNeedScore}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    updateDraft((prev) => ({
                      ...prev,
                      lifestyle: {
                        ...prev.lifestyle,
                        storageNeedScore: value,
                        storageNeed: getStorageNeedFromScore(value),
                      },
                    }));
                  }}
                />
                <p className="text-brand-earth mt-1 text-xs">
                  {tx(
                    "1 = minimalno odlaganje, 10 = maksimalno skrivenog skladištenja.",
                    "1 = minimal storage, 10 = maximum concealed storage.",
                  )}
                </p>
              </div>

              <div>
                <label className="text-brand-earth mb-2 block text-sm">
                  {tx("Maintenance preference (1-10)", "Maintenance preference (1-10)")}
                </label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={draft.lifestyle.maintenanceCareScore}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    updateDraft((prev) => ({
                      ...prev,
                      lifestyle: {
                        ...prev.lifestyle,
                        maintenanceCareScore: value,
                        maintenancePreference: getMaintenanceFromScore(value),
                      },
                    }));
                  }}
                />
                <p className="text-brand-earth mt-1 text-xs">
                  {tx(
                    "1 = lako održavanje, 10 = spreman/na sam za osetljivije premium površine.",
                    "1 = low-maintenance surfaces, 10 = fully comfortable with delicate premium materials.",
                  )}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-8">
            <StepTitle
              eyebrow={tx("Korak 4", "Step 4")}
              title="Priority Tradeoffs"
              description={tx(
                "Svaki prioritet ocenite od 1 do 10. Sistem automatski normalizuje raspodelu na 100%.",
                "Score each priority from 1 to 10. The system automatically normalizes weights to 100%.",
              )}
            />

            <div className="space-y-4">
              {tradeoffKeys.map((key) => (
                <div key={key} className="rounded-2xl border border-brand-neutral-500/60 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-brand-burgundy text-sm font-semibold">
                      {priorityLabels[key][locale]}
                    </p>
                    <p className="text-brand-earth text-xs">
                      {draft.tradeoffScores[key]}/10 · {draft.tradeoffs[key]}%
                    </p>
                  </div>
                  <p className="text-brand-earth mb-2 text-xs">
                    {key === "aesthetics" &&
                      tx(
                        "1 = izgled nije presudan, 10 = vizuelni utisak je ključan.",
                        "1 = look is secondary, 10 = visual impact is critical.",
                      )}
                    {key === "functionality" &&
                      tx(
                        "1 = fleksibilno korišćenje, 10 = maksimalna praktičnost.",
                        "1 = flexible use, 10 = maximum practical use.",
                      )}
                    {key === "budget_control" &&
                      tx(
                        "1 = spremni na odstupanja, 10 = stroga budžetska kontrola.",
                        "1 = flexible spending, 10 = strict budget control.",
                      )}
                    {key === "speed_timeline" &&
                      tx(
                        "1 = vreme nije bitno, 10 = što brža realizacija.",
                        "1 = timeline is flexible, 10 = fastest delivery.",
                      )}
                    {key === "durability" &&
                      tx(
                        "1 = kraći horizont, 10 = dugoročna trajnost.",
                        "1 = shorter horizon, 10 = long-term durability.",
                      )}
                  </p>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={draft.tradeoffScores[key]}
                    onChange={(event) =>
                      updateDraft((prev) => {
                        const nextScores = {
                          ...prev.tradeoffScores,
                          [key]: Number(event.target.value),
                        };
                        const scaled = tradeoffKeys.reduce((acc, tradeoffKey) => {
                          acc[tradeoffKey] = nextScores[tradeoffKey] * 10;
                          return acc;
                        }, {} as Record<(typeof tradeoffKeys)[number], number>);

                        return {
                          ...prev,
                          tradeoffScores: nextScores,
                          tradeoffs: normalizeToHundred(tradeoffKeys, scaled),
                        };
                      })
                    }
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <p className="text-brand-earth text-sm">
                {tx("Trenutni zbir", "Current sum")}:{" "}
                {Object.values(draft.tradeoffs).reduce((sum, value) => sum + value, 0)}%
              </p>
              <button
                type="button"
                className="btn-secondary rounded-full px-5 py-2 text-xs font-semibold"
                onClick={() =>
                  updateDraft((prev) => ({
                    ...prev,
                    tradeoffs: normalizeToHundred(
                      tradeoffKeys,
                      tradeoffKeys.reduce((acc, key) => {
                        acc[key] = prev.tradeoffScores[key] * 10;
                        return acc;
                      }, {} as Record<(typeof tradeoffKeys)[number], number>),
                    ),
                  }))
                }
              >
                {tx("Auto uskladi na 100%", "Auto balance to 100%")}
              </button>
            </div>
          </div>
        ) : null}

        {step === 5 ? (
          <div className="space-y-8">
            <StepTitle
              eyebrow={tx("Korak 5", "Step 5")}
              title="Style Discovery"
              description={tx(
                "Odaberite do 2 stila. Ako niste sigurni, mini kviz (5 pitanja) predlaže najverovatniji pravac.",
                "Choose up to 2 styles. If unsure, a 5-question mini quiz suggests your best-fit direction.",
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {styleCards.map((card) => {
                const selected = draft.style.selectedStyles.includes(card.id);

                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() =>
                      updateDraft((prev) => ({
                        ...prev,
                        style: {
                          ...prev.style,
                          selectedStyles: toggleValue(prev.style.selectedStyles, card.id, 2),
                          usedQuiz: false,
                        },
                      }))
                    }
                    className={cn(
                      "overflow-hidden rounded-2xl border text-left transition",
                      selected
                        ? "border-brand-burgundy shadow-[0_8px_24px_rgba(59,13,24,0.2)]"
                        : "border-brand-neutral-500/60 hover:border-brand-gold",
                    )}
                  >
                    <Image
                      src={card.image}
                      alt={card.title}
                      width={800}
                      height={520}
                      className="h-36 w-full object-cover"
                    />
                    <div className="p-3">
                      <p className="text-brand-burgundy text-sm font-semibold">{card.title}</p>
                      <p className="text-brand-earth mt-1 text-xs">{card.subtitle}</p>
                      <p className="text-brand-earth mt-2 text-[11px]">
                        {tx("Vizuelna referenca stila.", "Visual style reference.")}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl border border-brand-neutral-500/60 bg-brand-neutral-100 p-4">
              <label className="text-brand-earth flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={draft.style.usedQuiz}
                  onChange={(event) =>
                    updateDraft((prev) => ({
                      ...prev,
                      style: {
                        ...prev.style,
                        usedQuiz: event.target.checked,
                      },
                    }))
                  }
                />
                {tx("Ne znam - pokreni mini kviz", "I don't know - run mini quiz")}
              </label>

              {draft.style.usedQuiz ? (
                <div className="mt-4 space-y-3">
                  {styleQuizQuestions.map((question) => (
                    <div key={question.id}>
                      <p className="text-brand-burgundy text-sm font-semibold">{question.title}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {question.options.map((option) => (
                          <SelectablePill
                            key={option.id}
                            active={draft.style.quizAnswers[question.id] === option.id}
                            label={option.label}
                            onClick={() =>
                              updateDraft((prev) => ({
                                ...prev,
                                style: {
                                  ...prev.style,
                                  quizAnswers: {
                                    ...prev.style.quizAnswers,
                                    [question.id]: option.id,
                                  },
                                },
                              }))
                            }
                            className="text-xs"
                          />
                        ))}
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="btn-primary rounded-full px-6 py-2 text-xs font-semibold"
                    onClick={() =>
                      updateDraft((prev) => ({
                        ...prev,
                        style: {
                          ...prev.style,
                          selectedStyles: getStyleSuggestionsFromQuiz(prev.style.quizAnswers),
                          usedQuiz: true,
                        },
                      }))
                    }
                  >
                    {tx("Predloži top 2 stila", "Suggest top 2 styles")}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {step === 6 ? (
          <div className="space-y-8">
            <StepTitle
              eyebrow={tx("Korak 6", "Step 6")}
              title="Mood & Atmosphere"
              description={tx(
                "Odaberite 2-3 mood kartice ili uključite mini kviz ako niste sigurni.",
                "Choose 2-3 mood cards or run a mini quiz if you are unsure.",
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {moodCards.map((card) => {
                const selected = draft.mood.selectedMoods.includes(card.id);

                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() =>
                      updateDraft((prev) => ({
                        ...prev,
                        mood: {
                          ...prev.mood,
                          selectedMoods: toggleValue(prev.mood.selectedMoods, card.id, 3),
                        },
                      }))
                    }
                    className={cn(
                      "overflow-hidden rounded-2xl border text-left transition",
                      selected
                        ? "border-brand-burgundy shadow-[0_8px_24px_rgba(59,13,24,0.16)]"
                        : "border-brand-neutral-500/60 hover:border-brand-gold",
                    )}
                  >
                    <Image
                      src={card.image}
                      alt={card.title}
                      width={800}
                      height={520}
                      className="h-36 w-full object-cover"
                    />
                    <div className="p-3">
                      <p className="text-brand-burgundy text-sm font-semibold">{card.title}</p>
                      <p className="text-brand-earth mt-1 text-xs">{card.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl border border-brand-neutral-500/60 bg-brand-neutral-100 p-4">
              <label className="text-brand-earth flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={draft.mood.usedQuiz}
                  onChange={(event) =>
                    updateDraft((prev) => ({
                      ...prev,
                      mood: {
                        ...prev.mood,
                        usedQuiz: event.target.checked,
                      },
                    }))
                  }
                />
                {tx("Ne znam - pokreni mini kviz", "I don't know - run mini quiz")}
              </label>

              {draft.mood.usedQuiz ? (
                <div className="mt-4 space-y-3">
                  {moodQuizQuestions.map((question) => (
                    <div key={question.id}>
                      <p className="text-brand-burgundy text-sm font-semibold">{question.title}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {question.options.map((option) => (
                          <SelectablePill
                            key={option.id}
                            active={draft.mood.quizAnswers[question.id] === option.id}
                            label={option.label}
                            onClick={() =>
                              updateDraft((prev) => ({
                                ...prev,
                                mood: {
                                  ...prev.mood,
                                  quizAnswers: {
                                    ...prev.mood.quizAnswers,
                                    [question.id]: option.id,
                                  },
                                },
                              }))
                            }
                            className="text-xs"
                          />
                        ))}
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="btn-primary rounded-full px-6 py-2 text-xs font-semibold"
                    onClick={() =>
                      updateDraft((prev) => ({
                        ...prev,
                        mood: {
                          ...prev.mood,
                          selectedMoods: getMoodSuggestionsFromQuiz(prev.mood.quizAnswers),
                          usedQuiz: true,
                        },
                      }))
                    }
                  >
                    {tx("Predloži mood set", "Suggest mood set")}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {step === 7 ? (
          <div className="space-y-8">
            <StepTitle
              eyebrow={tx("Korak 7", "Step 7")}
              title="Color Palette Builder"
              description={tx(
                "Vođeni izbor: svetlina, temperaturni ton i predlog palete na osnovu stila i atmosfere.",
                "Guided selection: brightness, temperature and palette suggestion based on style and mood.",
              )}
            />

            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <p className="text-brand-burgundy mb-2 text-sm font-semibold">
                  {tx("Svetlina", "Brightness")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {([
                    ["light", tx("Svetla", "Light")],
                    ["mid", tx("Srednja", "Mid")],
                    ["dark", tx("Tamna", "Dark")],
                  ] as const).map(([value, label]) => (
                    <SelectablePill
                      key={value}
                      active={draft.color.brightness === value}
                      label={label}
                      onClick={() =>
                        updateDraft((prev) => ({
                          ...prev,
                          color: {
                            ...prev.color,
                            brightness: value,
                          },
                        }))
                      }
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-brand-burgundy mb-2 text-sm font-semibold">
                  {tx("Temperatura", "Temperature")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {([
                    ["warm", tx("Topla", "Warm")],
                    ["neutral", tx("Neutralna", "Neutral")],
                    ["cool", tx("Hladna", "Cool")],
                  ] as const).map(([value, label]) => (
                    <SelectablePill
                      key={value}
                      active={draft.color.temperature === value}
                      label={label}
                      onClick={() =>
                        updateDraft((prev) => ({
                          ...prev,
                          color: {
                            ...prev.color,
                            temperature: value,
                          },
                        }))
                      }
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-brand-burgundy mb-2 text-sm font-semibold">
                  {tx("Preferencija zidova", "Wall preference")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(wallPreferenceLabels).map(([value, label]) => (
                    <SelectablePill
                      key={value}
                      active={draft.color.wallPreference === value}
                      label={label[locale]}
                      onClick={() =>
                        updateDraft((prev) => ({
                          ...prev,
                          color: {
                            ...prev.color,
                            wallPreference:
                              value === "recommend_for_me"
                                ? recommendWallPreference(prev.style.selectedStyles)
                                : (value as IntakeDraft["color"]["wallPreference"]),
                          },
                        }))
                      }
                      className="text-xs"
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-brand-neutral-500/60 bg-brand-neutral-100 p-4">
              <p className="text-brand-burgundy text-sm font-semibold">
                {tx("Vođeni predlog palete", "Guided palette suggestion")}
              </p>
              <p className="text-brand-earth mt-1 text-xs">
                {tx(
                  "Ako niste sigurni, sistem može predložiti paletu na osnovu stila, mood-a i temperature boja.",
                  "If unsure, the system can recommend a palette based on style, mood and color temperature.",
                )}
              </p>
              <button
                type="button"
                className="btn-secondary mt-3 rounded-full px-5 py-2 text-xs font-semibold"
                onClick={() =>
                  updateDraft((prev) => ({
                    ...prev,
                    color: {
                      ...prev.color,
                      palette: recommendPalette(prev),
                    },
                  }))
                }
              >
                {tx("Predloži paletu", "Recommend palette")}
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {paletteCards.map((palette) => {
                const active = draft.color.palette === palette.id;

                return (
                  <button
                    key={palette.id}
                    type="button"
                    onClick={() =>
                      updateDraft((prev) => ({
                        ...prev,
                        color: {
                          ...prev.color,
                          palette: palette.id,
                        },
                      }))
                    }
                    className={cn(
                      "rounded-2xl border text-left transition",
                      active
                        ? "border-brand-burgundy shadow-[0_8px_24px_rgba(59,13,24,0.16)]"
                        : "border-brand-neutral-500/60 hover:border-brand-gold",
                    )}
                  >
                    <Image
                      src={palette.image}
                      alt={palette.title}
                      width={700}
                      height={420}
                      className="h-28 w-full rounded-t-2xl object-cover"
                    />
                    <div className="p-3">
                      <p className="text-brand-burgundy text-sm font-semibold">{palette.title}</p>
                      <p className="text-brand-earth mt-1 text-xs">{palette.subtitle}</p>
                      <div className="mt-2 flex gap-1">
                        {palette.swatches.map((swatch) => (
                          <span
                            key={swatch}
                            className="h-4 w-4 rounded-full border border-white"
                            style={{ backgroundColor: swatch }}
                          />
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {step === 8 ? (
          <div className="space-y-8">
            <StepTitle
              eyebrow={tx("Korak 8", "Step 8")}
              title="Lighting Preferences"
              description={tx(
                "Biramo scenarije rasvete i nivo atmosfere kroz vođene opcije koje su jednostavne za izbor.",
                "Select lighting scenarios and atmosphere intensity through guided, easy choices.",
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {lightingCards.map((card) => {
                const selected = draft.lighting.scenarios.includes(card.id);

                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() =>
                      updateDraft((prev) => ({
                        ...prev,
                        lighting: {
                          ...prev.lighting,
                          scenarios: toggleValue(prev.lighting.scenarios, card.id),
                        },
                      }))
                    }
                    className={cn(
                      "overflow-hidden rounded-2xl border text-left transition",
                      selected
                        ? "border-brand-burgundy shadow-[0_8px_24px_rgba(59,13,24,0.16)]"
                        : "border-brand-neutral-500/60 hover:border-brand-gold",
                    )}
                  >
                    <Image
                      src={card.media}
                      alt={card.title}
                      width={700}
                      height={420}
                      className="h-32 w-full object-cover"
                    />
                    <div className="p-3">
                      <p className="text-brand-burgundy text-sm font-semibold">{card.title}</p>
                      <p className="text-brand-earth mt-1 text-xs">{card.subtitle}</p>
                      {card.recommended ? (
                        <p className="text-brand-green mt-2 text-[11px] uppercase tracking-wide">
                          {tx("Preporučeno", "Recommended")}
                        </p>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-brand-burgundy mb-2 text-sm font-semibold">
                  {tx("Dan/noć prioritet", "Day/night priority")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {([
                    ["day", tx("Dan", "Day")],
                    ["balanced", tx("Balans", "Balanced")],
                    ["night", tx("Noć", "Night")],
                  ] as const).map(([value, label]) => (
                    <SelectablePill
                      key={value}
                      active={draft.lighting.dayNightPriority === value}
                      label={label}
                      onClick={() =>
                        updateDraft((prev) => ({
                          ...prev,
                          lighting: {
                            ...prev.lighting,
                            dayNightPriority: value,
                            presetSuggestion: suggestLightingPreset(value, prev.lighting.dramaLevel),
                          },
                        }))
                      }
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-brand-burgundy mb-2 text-sm font-semibold">
                  {tx("Toplina svetla", "Light warmth")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {([
                    ["warm", tx("Toplo", "Warm")],
                    ["neutral", tx("Neutralno", "Neutral")],
                  ] as const).map(([value, label]) => (
                    <SelectablePill
                      key={value}
                      active={draft.lighting.warmth === value}
                      label={label}
                      onClick={() =>
                        updateDraft((prev) => ({
                          ...prev,
                          lighting: {
                            ...prev.lighting,
                            warmth: value,
                          },
                        }))
                      }
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-brand-burgundy mb-2 block text-sm font-semibold">
                  {tx("Nivo ambijenta (1-10)", "Ambience level (1-10)")}
                </label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={draft.lighting.dramaLevel}
                  onChange={(event) =>
                    updateDraft((prev) => ({
                      ...prev,
                      lighting: {
                        ...prev.lighting,
                        dramaLevel: Number(event.target.value),
                        presetSuggestion: suggestLightingPreset(
                          prev.lighting.dayNightPriority,
                          Number(event.target.value),
                        ),
                      },
                    }))
                  }
                />
                <p className="text-brand-earth mt-1 text-xs">
                  {tx(
                    "1-3 suptilno, 4-7 balansirano, 8-10 dramatično.",
                    "1-3 subtle, 4-7 balanced, 8-10 dramatic.",
                  )}{" "}
                  ({draft.lighting.dramaLevel}/10)
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-brand-neutral-500/60 bg-brand-neutral-100 p-4">
              <p className="text-brand-burgundy text-sm font-semibold">Predloženi preset</p>
              <p className="text-brand-earth mt-1 text-sm">
                {lightingPresetDescriptions[draft.lighting.presetSuggestion][locale]}
              </p>
            </div>
          </div>
        ) : null}

        {step === 9 ? (
          <div className="space-y-8">
            <StepTitle
              eyebrow={tx("Korak 9", "Step 9")}
              title="Furniture Quality & Materials"
              description={tx(
                "Odaberite kvalitetni nivo, ograničenja materijala i pokrenite kviz ako niste sigurni.",
                "Choose quality tier, material restrictions and run a quiz if unsure.",
              )}
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {([
                ["basic", "BASIC", tx("Praktično i ekonomično", "Practical and cost-efficient")],
                ["mid", "MID", tx("Balans cene i kvaliteta", "Balanced quality/value")],
                ["premium", "PREMIUM", tx("Vrhunski materijali i detalji", "Premium materials and details")],
                ["mixed", "MIXED", tx("Premium po ključnim zonama", "Premium in selected zones")],
              ] as const).map(([value, title, subtitle]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    updateDraft((prev) => ({
                      ...prev,
                      furniture: {
                        ...prev.furniture,
                        qualityTier: value,
                      },
                    }))
                  }
                  className={cn(
                    "rounded-2xl border p-4 text-left",
                    draft.furniture.qualityTier === value
                      ? "border-brand-burgundy bg-brand-burgundy/5"
                      : "border-brand-neutral-500/60",
                  )}
                >
                  <p className="text-brand-burgundy text-sm font-semibold">{title}</p>
                  <p className="text-brand-earth mt-2 text-xs">{subtitle}</p>
                </button>
              ))}
            </div>

            {draft.furniture.qualityTier === "mixed" ? (
              <div>
                <p className="text-brand-burgundy mb-2 text-sm font-semibold">
                  {tx("Gde premium najviše znači?", "Where does premium matter most?")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {mixedPremiumFocusOptions.map((option) => (
                    <SelectablePill
                      key={option}
                      active={draft.furniture.mixedPremiumFocus.includes(option)}
                      label={option.replace("_", " ")}
                      onClick={() =>
                        updateDraft((prev) => ({
                          ...prev,
                          furniture: {
                            ...prev.furniture,
                            mixedPremiumFocus: toggleValue(prev.furniture.mixedPremiumFocus, option),
                          },
                        }))
                      }
                    />
                  ))}
                </div>
              </div>
            ) : null}

            <div>
              <p className="text-brand-burgundy mb-2 text-sm font-semibold">
                {tx("Material restrictions", "Material restrictions")}
              </p>
              <div className="flex flex-wrap gap-2">
                {([
                  ["no_glossy", tx("Bez sjajnih površina", "No glossy surfaces")],
                  ["no_marble", tx("Bez mermera", "No marble")],
                  ["kid_proof", tx("Kid-proof površine", "Kid-proof surfaces")],
                  ["pet_friendly", tx("Pet-friendly tkanine", "Pet-friendly fabrics")],
                ] as const).map(([value, label]) => (
                  <SelectablePill
                    key={value}
                    active={draft.furniture.restrictions.includes(value)}
                    label={label}
                    onClick={() =>
                      updateDraft((prev) => ({
                        ...prev,
                        furniture: {
                          ...prev.furniture,
                          restrictions: toggleValue(prev.furniture.restrictions, value),
                        },
                      }))
                    }
                  />
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-brand-neutral-500/60 bg-brand-neutral-100 p-4">
              <label className="text-brand-earth flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={draft.furniture.usedQuiz}
                  onChange={(event) =>
                    updateDraft((prev) => ({
                      ...prev,
                      furniture: {
                        ...prev.furniture,
                        usedQuiz: event.target.checked,
                      },
                    }))
                  }
                />
                {tx("Ne znam - pokreni mini kviz", "I don't know - run mini quiz")}
              </label>

              {draft.furniture.usedQuiz ? (
                <div className="mt-4 space-y-3">
                  {furnitureQuizQuestions.map((question) => (
                    <div key={question.id}>
                      <p className="text-brand-burgundy text-sm font-semibold">{question.title}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {question.options.map((option) => (
                          <SelectablePill
                            key={option.id}
                            active={draft.furniture.quizAnswers[question.id] === option.id}
                            label={option.label}
                            onClick={() =>
                              updateDraft((prev) => ({
                                ...prev,
                                furniture: {
                                  ...prev.furniture,
                                  quizAnswers: {
                                    ...prev.furniture.quizAnswers,
                                    [question.id]: option.id,
                                  },
                                },
                              }))
                            }
                            className="text-xs"
                          />
                        ))}
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="btn-primary rounded-full px-6 py-2 text-xs font-semibold"
                    onClick={() =>
                      updateDraft((prev) => ({
                        ...prev,
                        furniture: {
                          ...prev.furniture,
                          qualityTier: getFurnitureTierFromQuiz(prev.furniture.quizAnswers),
                          usedQuiz: true,
                        },
                      }))
                    }
                  >
                    {tx("Predloži kvalitetni tier", "Suggest quality tier")}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {step === 10 ? (
          <div className="space-y-8">
            <StepTitle
              eyebrow={tx("Korak 10", "Step 10")}
              title="Budget"
              description={tx(
                "Unesite budžetni opseg i raspodelu po segmentima. Ako niste sigurni, koristite vođene tier-e.",
                "Enter budget range and segment allocation. If unsure, use guided budget tiers.",
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-brand-earth mb-2 block text-sm">
                  {tx("Budžet minimum (EUR)", "Budget min (EUR)")}
                </label>
                <input
                  type="number"
                  className="input-field"
                  min={0}
                  value={draft.budget.minTotal ?? ""}
                  onChange={(event) =>
                    updateDraft((prev) => ({
                      ...prev,
                      budget: {
                        ...prev.budget,
                        minTotal: Number(event.target.value) || 0,
                      },
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-brand-earth mb-2 block text-sm">
                  {tx("Budžet maksimum (EUR)", "Budget max (EUR)")}
                </label>
                <input
                  type="number"
                  className="input-field"
                  min={0}
                  value={draft.budget.maxTotal ?? ""}
                  onChange={(event) =>
                    updateDraft((prev) => ({
                      ...prev,
                      budget: {
                        ...prev.budget,
                        maxTotal: Number(event.target.value) || 0,
                      },
                    }))
                  }
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <SelectablePill
                active={Boolean(draft.budget.flexibleBy10)}
                label={tx("Fleksibilnost ±10%", "Flexibility ±10%")}
                onClick={() =>
                  updateDraft((prev) => ({
                    ...prev,
                    budget: {
                      ...prev.budget,
                      flexibleBy10: !prev.budget.flexibleBy10,
                    },
                  }))
                }
              />
              <SelectablePill
                active={draft.budget.unknownBudget}
                label={tx("Ne znam budžet", "I don't know budget")}
                onClick={() =>
                  updateDraft((prev) => ({
                    ...prev,
                    budget: {
                      ...prev.budget,
                      unknownBudget: !prev.budget.unknownBudget,
                    },
                  }))
                }
              />
            </div>

            {draft.budget.unknownBudget ? (
              <div className="space-y-4 rounded-2xl border border-brand-neutral-500/60 bg-brand-neutral-100 p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-brand-earth mb-2 block text-sm">
                      {tx("Komforna mesečna rata (EUR)", "Comfortable monthly payment (EUR)")}
                    </label>
                    <input
                      type="number"
                      className="input-field"
                      value={draft.budget.comfortableMonthlyPayment ?? ""}
                      onChange={(event) =>
                        updateDraft((prev) => ({
                          ...prev,
                          budget: {
                            ...prev.budget,
                            comfortableMonthlyPayment: Number(event.target.value) || 0,
                          },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-brand-earth mb-2 block text-sm">
                      {tx("Maksimalni limit (EUR)", "Max limit (EUR)")}
                    </label>
                    <input
                      type="number"
                      className="input-field"
                      value={draft.budget.maxLimit ?? ""}
                      onChange={(event) =>
                        updateDraft((prev) => ({
                          ...prev,
                          budget: {
                            ...prev.budget,
                            maxLimit: Number(event.target.value) || 0,
                          },
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {budgetTierCards.map((card) => (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() =>
                        updateDraft((prev) => ({
                          ...prev,
                          budget: {
                            ...prev.budget,
                            tier: card.id,
                            minTotal: budgetTierRanges[card.id].min,
                            maxTotal: budgetTierRanges[card.id].max,
                          },
                        }))
                      }
                      className={cn(
                        "rounded-xl border p-3 text-left",
                        draft.budget.tier === card.id
                          ? "border-brand-burgundy bg-brand-burgundy/5"
                          : "border-brand-neutral-500/60",
                      )}
                    >
                      <p className="text-brand-burgundy text-sm font-semibold">{card.title}</p>
                      <p className="text-brand-earth text-xs">{card.range}</p>
                      <ul className="text-brand-earth mt-2 list-disc space-y-0.5 pl-4 text-[11px]">
                        {card.bullets.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="rounded-2xl border border-brand-neutral-500/60 bg-brand-neutral-100 p-4">
              <p className="text-brand-burgundy text-sm font-semibold">
                {tx("Srbija: orijentacioni nivo kvaliteta", "Serbia: quality guidance")}
              </p>
              <p className="text-brand-earth mt-1 text-xs">
                {tx(
                  "Starter je za selektivne intervencije, Balanced za kompletan MID nivo, Premium za custom i high-end završnice.",
                  "Starter fits selective interventions, Balanced covers full mid-tier design, Premium enables custom high-end execution.",
                )}
              </p>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-brand-burgundy text-sm font-semibold">
                  {tx("Raspodela budžeta (%)", "Budget allocation (%)")}
                </p>
                <button
                  type="button"
                  className="btn-secondary rounded-full px-4 py-1.5 text-xs"
                  onClick={() =>
                    updateDraft((prev) => ({
                      ...prev,
                      budget: {
                        ...prev.budget,
                        allocation: normalizeToHundred(
                          budgetAllocationKeys,
                          prev.budget.allocation,
                        ),
                      },
                    }))
                  }
                >
                  {tx("Normalizuj", "Normalize")}
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {budgetAllocationKeys.map((key) => (
                  <label key={key} className="text-brand-earth text-sm">
                    {allocationLabels[key][locale]}
                    <input
                      type="number"
                      className="input-field mt-1"
                      min={0}
                      max={100}
                      value={draft.budget.allocation[key]}
                      onChange={(event) =>
                        updateDraft((prev) => ({
                          ...prev,
                          budget: {
                            ...prev.budget,
                            allocation: {
                              ...prev.budget.allocation,
                              [key]: Number(event.target.value) || 0,
                            },
                          },
                        }))
                      }
                    />
                    <p className="mt-1 text-[11px]">
                      {tx("Procena na bazi max budžeta", "Estimated by max budget")}:{" "}
                      {(((draft.budget.maxTotal ?? 0) * draft.budget.allocation[key]) / 100).toLocaleString(
                        locale === "en" ? "en-GB" : "sr-RS",
                      )}{" "}
                      EUR
                    </p>
                  </label>
                ))}
              </div>
              <p className="text-brand-earth mt-2 text-xs">
                {tx("Zbir", "Total")}:{" "}
                {Object.values(draft.budget.allocation).reduce((sum, value) => sum + value, 0)}%
              </p>
            </div>
          </div>
        ) : null}

        {step === 11 ? (
          <div className="space-y-8">
            <StepTitle
              eyebrow={locale === "en" ? "Step 11" : "Korak 11"}
              title="Room-by-room Preferences"
              description={tx(
                "Detaljni ali kratki unosi za svaku prostoriju. Cilj je maksimum korisnih informacija bez komplikacija.",
                "Detailed yet short inputs for each room. Goal: maximum useful data with minimal friction.",
              )}
            />

            <div className="space-y-4">
              {draft.basics.roomsInScope.map((roomType) => {
                const room = draft.roomPreferences.find((entry) => entry.roomType === roomType);

                if (!room) {
                  return null;
                }

                return (
                  <div key={roomType} className="rounded-2xl border border-brand-neutral-500/60 p-4">
                    <p className="text-brand-burgundy mb-3 text-sm font-semibold">
                      {locale === "en" ? roomLabelsEn[roomType] : roomLabels[roomType]} · x
                      {draft.basics.roomQuantities[roomType] ?? 1}
                    </p>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="text-brand-earth mb-1 block text-xs">
                          {tx("Storage priority", "Storage priority")}
                        </label>
                        <select
                          className="input-field"
                          value={room.storagePriority}
                          onChange={(event) =>
                            updateRoomPreference(roomType, (current) => ({
                              ...current,
                              storagePriority: event.target.value as typeof current.storagePriority,
                            }))
                          }
                        >
                          <option value="low">{tx("Nisko", "Low")}</option>
                          <option value="medium">{tx("Srednje", "Medium")}</option>
                          <option value="high">{tx("Visoko", "High")}</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-brand-earth mb-1 block text-xs">
                          {tx("Decor density", "Decor density")}
                        </label>
                        <select
                          className="input-field"
                          value={room.decorDensity}
                          onChange={(event) =>
                            updateRoomPreference(roomType, (current) => ({
                              ...current,
                              decorDensity: event.target.value as typeof current.decorDensity,
                            }))
                          }
                        >
                          <option value="minimal">{tx("Minimalno", "Minimal")}</option>
                          <option value="balanced">{tx("Balans", "Balanced")}</option>
                          <option value="rich">{tx("Bogato", "Rich")}</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      <label className="text-brand-earth text-xs">
                        {tx("Intenzitet korišćenja", "Usage intensity")} ({room.activityIntensity}/10)
                        <input
                          type="range"
                          min={1}
                          max={10}
                          value={room.activityIntensity}
                          onChange={(event) =>
                            updateRoomPreference(roomType, (current) => ({
                              ...current,
                              activityIntensity: Number(event.target.value),
                            }))
                          }
                        />
                      </label>
                      <label className="text-brand-earth text-xs">
                        {tx("Prioritet prirodnog svetla", "Natural light priority")} ({room.naturalLightPriority}/10)
                        <input
                          type="range"
                          min={1}
                          max={10}
                          value={room.naturalLightPriority}
                          onChange={(event) =>
                            updateRoomPreference(roomType, (current) => ({
                              ...current,
                              naturalLightPriority: Number(event.target.value),
                            }))
                          }
                        />
                      </label>
                      <label className="text-brand-earth text-xs">
                        {tx("Komfor prioritet", "Comfort priority")} ({room.comfortPriority}/10)
                        <input
                          type="range"
                          min={1}
                          max={10}
                          value={room.comfortPriority}
                          onChange={(event) =>
                            updateRoomPreference(roomType, (current) => ({
                              ...current,
                              comfortPriority: Number(event.target.value),
                            }))
                          }
                        />
                      </label>
                    </div>

                    {roomType === "living_room" ? (
                      <div className="mt-3 grid gap-3 md:grid-cols-3">
                        <select
                          className="input-field"
                          value={room.livingSeating ?? "sectional"}
                          onChange={(event) =>
                            updateRoomPreference(roomType, (current) => ({
                              ...current,
                              livingSeating: event.target.value as "sectional" | "sofa_armchairs",
                            }))
                          }
                        >
                          <option value="sectional">{tx("Ugaona", "Sectional")}</option>
                          <option value="sofa_armchairs">
                            {tx("Trosed + fotelje", "Sofa + armchairs")}
                          </option>
                        </select>
                        <select
                          className="input-field"
                          value={room.tvWall ? "yes" : "no"}
                          onChange={(event) =>
                            updateRoomPreference(roomType, (current) => ({
                              ...current,
                              tvWall: event.target.value === "yes",
                            }))
                          }
                        >
                          <option value="yes">{tx("TV zid: Da", "TV wall: Yes")}</option>
                          <option value="no">{tx("TV zid: Ne", "TV wall: No")}</option>
                        </select>
                        <select
                          className="input-field"
                          value={room.rugPreference ? "yes" : "no"}
                          onChange={(event) =>
                            updateRoomPreference(roomType, (current) => ({
                              ...current,
                              rugPreference: event.target.value === "yes",
                            }))
                          }
                        >
                          <option value="yes">{tx("Tepih: Da", "Rug: Yes")}</option>
                          <option value="no">{tx("Tepih: Ne", "Rug: No")}</option>
                        </select>
                      </div>
                    ) : null}

                    {roomType === "kitchen" ? (
                      <div className="mt-3 grid gap-3 md:grid-cols-3">
                        <select
                          className="input-field"
                          value={room.kitchenLayout ?? "l_shape"}
                          onChange={(event) =>
                            updateRoomPreference(roomType, (current) => ({
                              ...current,
                              kitchenLayout: event.target.value as "l_shape" | "u_shape" | "straight",
                            }))
                          }
                        >
                          <option value="l_shape">{tx("L raspored", "L shape")}</option>
                          <option value="u_shape">{tx("U raspored", "U shape")}</option>
                          <option value="straight">{tx("Pravolinijski", "Straight")}</option>
                        </select>
                        <select
                          className="input-field"
                          value={room.island ? "yes" : "no"}
                          onChange={(event) =>
                            updateRoomPreference(roomType, (current) => ({
                              ...current,
                              island: event.target.value === "yes",
                            }))
                          }
                        >
                          <option value="yes">{tx("Ostrvo: Da", "Island: Yes")}</option>
                          <option value="no">{tx("Ostrvo: Ne", "Island: No")}</option>
                        </select>
                        <select
                          className="input-field"
                          value={room.kitchenHandles ?? "handleless"}
                          onChange={(event) =>
                            updateRoomPreference(roomType, (current) => ({
                              ...current,
                              kitchenHandles: event.target.value as "handleless" | "handles",
                            }))
                          }
                        >
                          <option value="handleless">{tx("Bez ručkica", "Handleless")}</option>
                          <option value="handles">{tx("Sa ručkicama", "Handles")}</option>
                        </select>
                      </div>
                    ) : null}

                    {roomType === "bedroom" ? (
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <select
                          className="input-field"
                          value={room.bedSize ?? 180}
                          onChange={(event) =>
                            updateRoomPreference(roomType, (current) => ({
                              ...current,
                              bedSize: Number(event.target.value) as 160 | 180,
                            }))
                          }
                        >
                          <option value={160}>{tx("Krevet 160", "Bed 160")}</option>
                          <option value={180}>{tx("Krevet 180", "Bed 180")}</option>
                        </select>
                        <select
                          className="input-field"
                          value={room.wardrobeType ?? "sliding"}
                          onChange={(event) =>
                            updateRoomPreference(roomType, (current) => ({
                              ...current,
                              wardrobeType: event.target.value as "sliding" | "hinged",
                            }))
                          }
                        >
                          <option value="sliding">{tx("Klizni plakar", "Sliding wardrobe")}</option>
                          <option value="hinged">{tx("Krila plakar", "Hinged wardrobe")}</option>
                        </select>
                      </div>
                    ) : null}

                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="text-brand-earth mb-1 block text-xs">
                          {tx("Must have", "Must have")}
                        </label>
                        <input
                          type="text"
                          className="input-field"
                          value={room.mustHave}
                          onChange={(event) =>
                            updateRoomPreference(roomType, (current) => ({
                              ...current,
                              mustHave: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label className="text-brand-earth mb-1 block text-xs">
                          {tx("Izbegavati (odvojeno zarezom)", "Avoid (comma-separated)")}
                        </label>
                        <input
                          type="text"
                          className="input-field"
                          value={room.avoid.join(", ")}
                          onChange={(event) =>
                            updateRoomPreference(roomType, (current) => ({
                              ...current,
                              avoid: event.target.value
                                .split(",")
                                .map((item) => item.trim())
                                .filter(Boolean),
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {step === 12 ? (
          <div className="space-y-8">
            <StepTitle
              eyebrow={locale === "en" ? "Step 12" : "Korak 12"}
              title="Inspirations & Final Confirmation"
              description="Upload inspiracije, tagujte šta vam se dopada i potvrdite finalni preview."
            />

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-dashed border-brand-neutral-500 p-4">
                <p className="text-brand-burgundy text-sm font-semibold">Upload 3-10 inspiration images</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="mt-3"
                  onChange={(event) => void uploadAssets(event.target.files, "inspiration")}
                />
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {inspirationAssets.map((asset) => (
                    <div key={asset.id} className="rounded-xl border border-brand-neutral-500/60 p-2">
                      <Image
                        src={asset.thumbnailUrl}
                        alt={asset.label ?? "Inspiration"}
                        width={360}
                        height={240}
                        className="h-24 w-full rounded-md object-cover"
                      />
                      <p className="text-brand-earth mt-2 text-xs">
                        {tx("Označite šta vam se dopada:", "Tag what you like:")}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {([
                          ["colors", tx("Boje", "Colors")],
                          ["lighting", tx("Rasveta", "Lighting")],
                          ["layout", tx("Raspored", "Layout")],
                          ["materials", tx("Materijali", "Materials")],
                          ["furniture_style", tx("Nameštaj", "Furniture")],
                        ] as const).map(([value, label]) => {
                          const tags = draft.inspirations.tagsByAsset[asset.id] ?? [];
                          const active = tags.includes(value);

                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() =>
                                updateDraft((prev) => {
                                  const currentTags = prev.inspirations.tagsByAsset[asset.id] ?? [];
                                  return {
                                    ...prev,
                                    inspirations: {
                                      ...prev.inspirations,
                                      tagsByAsset: {
                                        ...prev.inspirations.tagsByAsset,
                                        [asset.id]: toggleValue(currentTags, value),
                                      },
                                    },
                                  };
                                })
                              }
                              className={cn(
                                "rounded-full border px-2 py-1 text-[11px]",
                                active
                                  ? "border-brand-burgundy bg-brand-burgundy text-white"
                                  : "border-brand-neutral-500 text-brand-earth",
                              )}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-dashed border-brand-neutral-500 p-4">
                <p className="text-brand-burgundy text-sm font-semibold">
                  {tx("Upload 1-3 avoid slike", "Upload 1-3 avoid images")}
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="mt-3"
                  onChange={(event) => void uploadAssets(event.target.files, "avoid")}
                />
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {avoidAssets.map((asset) => (
                    <Image
                      key={asset.id}
                      src={asset.thumbnailUrl}
                      alt={asset.label ?? "Avoid"}
                      width={360}
                      height={240}
                      className="h-24 w-full rounded-md object-cover"
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-brand-neutral-500/60 bg-brand-neutral-100 p-5">
              <p className="text-brand-burgundy text-sm font-semibold">
                {tx("Podaci za kontakt i potvrde", "Contact details and confirmations")}
              </p>

              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <div>
                  <label className="text-brand-earth mb-1 block text-xs">
                    {tx("Ime i prezime", "Full name")}
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={draft.client.fullName}
                    onChange={(event) =>
                      updateDraft((prev) => ({
                        ...prev,
                        client: {
                          ...prev.client,
                          fullName: event.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-brand-earth mb-1 block text-xs">
                    {tx("Email", "Email")}
                  </label>
                  <input
                    type="email"
                    className="input-field"
                    value={draft.client.email}
                    onChange={(event) =>
                      updateDraft((prev) => ({
                        ...prev,
                        client: {
                          ...prev.client,
                          email: event.target.value.trim(),
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-brand-earth mb-1 block text-xs">
                    {tx("Telefon (opciono)", "Phone (optional)")}
                  </label>
                  <input
                    type="tel"
                    className="input-field"
                    value={draft.client.phone}
                    onChange={(event) =>
                      updateDraft((prev) => ({
                        ...prev,
                        client: {
                          ...prev.client,
                          phone: event.target.value,
                        },
                      }))
                    }
                  />
                </div>
              </div>

              <div className="mt-4">
                <p className="text-brand-earth text-xs">
                  {tx("Da li su unete mere tačne?", "Are the entered measurements exact?")}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <SelectablePill
                    active={draft.agreements.hasExactMeasurements === true}
                    label={tx("Da, tačne su", "Yes, exact")}
                    onClick={() =>
                      updateDraft((prev) => ({
                        ...prev,
                        agreements: {
                          ...prev.agreements,
                          hasExactMeasurements: true,
                        },
                      }))
                    }
                  />
                  <SelectablePill
                    active={draft.agreements.hasExactMeasurements === false}
                    label={tx("Ne, okvirne su", "No, approximate")}
                    onClick={() =>
                      updateDraft((prev) => ({
                        ...prev,
                        agreements: {
                          ...prev.agreements,
                          hasExactMeasurements: false,
                        },
                      }))
                    }
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <label className="text-brand-earth flex items-start gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={draft.agreements.understandsConceptConceptualOnly}
                    onChange={(event) =>
                      updateDraft((prev) => ({
                        ...prev,
                        agreements: {
                          ...prev.agreements,
                          understandsConceptConceptualOnly: event.target.checked,
                        },
                      }))
                    }
                  />
                  {tx(
                    "Razumem da je idejno rešenje konceptualni dokument.",
                    "I understand the concept package is a conceptual document.",
                  )}
                </label>
                <label className="text-brand-earth flex items-start gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={draft.agreements.understandsTwoRevisionsIncluded}
                    onChange={(event) =>
                      updateDraft((prev) => ({
                        ...prev,
                        agreements: {
                          ...prev.agreements,
                          understandsTwoRevisionsIncluded: event.target.checked,
                        },
                      }))
                    }
                  />
                  {tx(
                    "Razumem da su uključene 2 revizije.",
                    "I understand that 2 revisions are included.",
                  )}
                </label>
                <label className="text-brand-earth flex items-start gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={draft.agreements.privacyConsent}
                    onChange={(event) =>
                      updateDraft((prev) => ({
                        ...prev,
                        agreements: {
                          ...prev.agreements,
                          privacyConsent: event.target.checked,
                        },
                      }))
                    }
                  />
                  {tx(
                    "Saglasan/a sam sa obradom podataka radi izrade ponude.",
                    "I consent to data processing for offer preparation.",
                  )}
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-brand-neutral-500/60 bg-brand-neutral-100 p-5">
              <p className="text-brand-burgundy text-sm font-semibold">
                {tx("Confirmation Preview", "Confirmation Preview")}
              </p>
              {inspirationAssets.length > 0 ? (
                <div className="mt-4">
                  <p className="text-brand-earth mb-2 text-xs uppercase tracking-[0.16em]">
                    {tx("Auto-generated moodboard collage", "Auto-generated moodboard collage")}
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {inspirationAssets.slice(0, 6).map((asset) => (
                      <Image
                        key={`moodboard-${asset.id}`}
                        src={asset.thumbnailUrl}
                        alt={asset.label ?? "Moodboard element"}
                        width={360}
                        height={260}
                        className="h-24 w-full rounded-lg object-cover md:h-28"
                      />
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-brand-neutral-500/60 bg-white p-3">
                  <p className="text-brand-earth text-xs uppercase">Style</p>
                  <p className="text-brand-burgundy mt-1 text-sm">
                    {draft.style.selectedStyles.length > 0
                      ? draft.style.selectedStyles.map((item) => getStyleTitle(item)).join(", ")
                      : tx("Neodređeno", "Undefined")}
                  </p>
                </div>
                <div className="rounded-xl border border-brand-neutral-500/60 bg-white p-3">
                  <p className="text-brand-earth text-xs uppercase">Palette</p>
                  <p className="text-brand-burgundy mt-1 text-sm">
                    {getPaletteTitle(draft.color.palette)}
                  </p>
                </div>
                <div className="rounded-xl border border-brand-neutral-500/60 bg-white p-3">
                  <p className="text-brand-earth text-xs uppercase">Lighting</p>
                  <p className="text-brand-burgundy mt-1 text-sm">
                    {lightingPresetDescriptions[draft.lighting.presetSuggestion][locale]}
                  </p>
                </div>
                <div className="rounded-xl border border-brand-neutral-500/60 bg-white p-3">
                  <p className="text-brand-earth text-xs uppercase">Budget</p>
                  <p className="text-brand-burgundy mt-1 text-sm">
                    {draft.budget.minTotal?.toLocaleString(locale === "en" ? "en-GB" : "sr-RS")} -{" "}
                    {draft.budget.maxTotal?.toLocaleString(locale === "en" ? "en-GB" : "sr-RS")} EUR
                  </p>
                </div>
              </div>

              {previewContradictions.length > 0 || serverContradictions.length > 0 ? (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3">
                  <p className="text-sm font-semibold text-red-800">
                    {tx("Detektovane kontradikcije", "Detected contradictions")}
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-red-800">
                    {[...new Set([...previewContradictions, ...serverContradictions])].map((issue) => (
                      <li key={issue}>{issue}</li>
                    ))}
                  </ul>
                  <label className="mt-3 flex items-start gap-2 text-xs text-red-800">
                    <input
                      type="checkbox"
                      checked={draft.contradictionsConfirmed}
                      onChange={(event) =>
                        updateDraft((prev) => ({
                          ...prev,
                          contradictionsConfirmed: event.target.checked,
                        }))
                      }
                    />
                    {tx(
                      "Potvrđujem da sam pregledao/la kontradikcije i želim da nastavim.",
                      "I reviewed the contradictions and confirm I want to continue.",
                    )}
                  </label>
                </div>
              ) : null}
            </div>

            {submitError ? <p className="text-sm text-red-700">{submitError}</p> : null}
          </div>
        ) : null}
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => void changeStep(step - 1)}
          disabled={step === 0}
          className="btn-secondary disabled:opacity-40 inline-flex min-h-11 items-center justify-center rounded-full px-6 text-sm font-semibold"
        >
          {tx("Nazad", "Back")}
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="btn-secondary inline-flex min-h-11 items-center justify-center rounded-full px-6 text-sm font-semibold"
            onClick={() => void persistDraft(step)}
          >
            {tx("Sačuvaj draft", "Save draft")}
          </button>

          {step < stepTitles.length - 1 ? (
            <button
              type="button"
              onClick={() => void changeStep(step + 1)}
              className="btn-primary inline-flex min-h-11 items-center justify-center rounded-full px-6 text-sm font-semibold"
            >
              {tx("Dalje", "Next")}
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={() => void handleSubmit()}
              className="btn-primary disabled:opacity-50 inline-flex min-h-11 items-center justify-center rounded-full px-6 text-sm font-semibold"
            >
              {submitting ? tx("Slanje...", "Submitting...") : tx("Pošalji intake", "Submit intake")}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
