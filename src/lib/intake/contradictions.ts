import type { IntakeJson } from "@/src/lib/intake/schema";

function formatMoney(value: number) {
  return new Intl.NumberFormat("sr-RS", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function detectIntakeContradictions(intake: IntakeJson) {
  const issues: string[] = [];

  if (intake.color.brightness === "dark" && intake.mood.selectedMoods.includes("bright_airy")) {
    issues.push(
      "Odabrali ste tamniju bazu, ali i atmosferu Bright & Airy. Potvrdite da želite balans ova dva pravca.",
    );
  }

  const hasRichDecorRoom = intake.roomPreferences.some(
    (room) => room.decorDensity === "rich",
  );

  if (
    intake.style.selectedStyles.includes("modern_minimal") &&
    hasRichDecorRoom
  ) {
    issues.push(
      "Stilski pravac je Modern Minimal, ali u jednoj ili više soba je izabran bogat dekor. Potvrdite prioritete.",
    );
  }

  const premiumTarget = intake.basics.total_m2 * 900;

  if (intake.furniture.qualityTier === "premium" && intake.budget.maxTotal < premiumTarget) {
    issues.push(
      `Premium nivo materijala obično traži oko ${formatMoney(premiumTarget)} za ovaj obim. Potvrdite budžet ili smanjite scope.`,
    );
  }

  if (
    intake.mood.selectedMoods.includes("calm_minimal") &&
    intake.lighting.dramaLevel >= 8
  ) {
    issues.push(
      "Izabrali ste Calm & Minimal uz vrlo visok drama nivo rasvete. Potvrdite da je ovo nameran kontrast.",
    );
  }

  if (
    intake.lighting.scenarios.includes("flat_ceiling_only") &&
    intake.lighting.scenarios.includes("layered_lighting")
  ) {
    issues.push(
      "Istovremeno su izabrani Flat ceiling only i Layered lighting. Predlog je da zadržite Layered lighting za premium rezultat.",
    );
  }

  return issues;
}
