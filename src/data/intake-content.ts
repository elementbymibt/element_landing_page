import type {
  BudgetTierOption,
  LightingScenarioOption,
  MoodDiscoveryOption,
  PaletteDiscoveryOption,
  RoomScopeOption,
  StyleDiscoveryOption,
} from "@/src/lib/intake/types";

export const roomLabels: Record<RoomScopeOption, string> = {
  living_room: "Dnevna soba",
  kitchen: "Kuhinja",
  bedroom: "Spavaća soba",
  bathroom: "Kupatilo",
  dining: "Trpezarija",
  hallway: "Hodnik",
  office: "Kancelarija",
  kids_room: "Dečija soba",
  terrace: "Terasa",
  meeting_room: "Sala za sastanke",
  reception: "Recepcija",
  open_space: "Open space",
  conference_room: "Konferencijska sala",
  kitchenette: "Čajna kuhinja",
  storage_room: "Magacin",
  wc: "WC",
  commercial_zone: "Prodajno/komercijalna zona",
};

export const propertyTypeLabels = {
  apartment: "Stan",
  house: "Kuća",
  single_room: "Jedna prostorija",
  business_space: "Poslovni prostor",
  commercial_space: "Komercijalni prostor",
} as const;

export const deadlineLabels = {
  "2w": "2 nedelje",
  "1m": "1 mesec",
  "3m": "3 meseca",
  "6m": "6 meseci",
  flexible: "Fleksibilno",
} as const;

export const styleCards: Array<{
  id: StyleDiscoveryOption;
  title: string;
  subtitle: string;
  image: string;
}> = [
  {
    id: "modern_minimal",
    title: "Modern Minimal",
    subtitle: "Čiste linije i fokus na proporciji.",
    image: "/intake/styles/modern-minimal.jpg",
  },
  {
    id: "japandi",
    title: "Japandi",
    subtitle: "Mirna toplina i prirodna ravnoteža.",
    image: "/intake/styles/japandi.jpg",
  },
  {
    id: "warm_luxury",
    title: "Warm Luxury",
    subtitle: "Diskretan luksuz sa toplim materijalima.",
    image: "/intake/styles/warm-luxury.jpg",
  },
  {
    id: "scandinavian",
    title: "Scandinavian",
    subtitle: "Svetlo, funkcionalno i smireno.",
    image: "/intake/styles/scandinavian.jpg",
  },
  {
    id: "contemporary_classic",
    title: "Contemporary Classic",
    subtitle: "Savremeno sa klasičnim proporcijama.",
    image: "/intake/styles/contemporary-classic.jpg",
  },
  {
    id: "soft_industrial",
    title: "Soft Industrial",
    subtitle: "Urban karakter sa toplim teksturama.",
    image: "/intake/styles/soft-industrial.jpg",
  },
  {
    id: "mediterranean_warm",
    title: "Mediterranean Warm",
    subtitle: "Sunčani tonovi i opušten premium osećaj.",
    image: "/intake/styles/mediterranean-warm.jpg",
  },
  {
    id: "dark_elegant",
    title: "Dark Elegant",
    subtitle: "Tamniji tonovi i sofisticirana drama.",
    image: "/intake/styles/dark-elegant.jpg",
  },
  {
    id: "natural_organic",
    title: "Natural Organic",
    subtitle: "Organske forme i prirodni materijali.",
    image: "/intake/styles/natural-organic.jpg",
  },
  {
    id: "boutique_hotel",
    title: "Boutique Hotel",
    subtitle: "Slojevita atmosfera i hotelski komfor.",
    image: "/intake/styles/boutique-hotel.jpg",
  },
];

export const styleQuizQuestions = [
  {
    id: "materials",
    title: "Koji materijali vas više privlače?",
    options: [
      { id: "natural", label: "Prirodno drvo, lan, kamen" },
      { id: "lux", label: "Premium završne obrade i metal" },
      { id: "balanced", label: "Balans prirodnog i modernog" },
    ],
  },
  {
    id: "silhouette",
    title: "Koje linije vam više prijaju?",
    options: [
      { id: "clean", label: "Čiste, mirne linije" },
      { id: "statement", label: "Statement forme i karakter" },
      { id: "soft", label: "Mekše, zaobljene forme" },
    ],
  },
  {
    id: "contrast",
    title: "Koliko kontrasta želite?",
    options: [
      { id: "soft", label: "Nizak kontrast, umirujuće" },
      { id: "medium", label: "Srednji kontrast" },
      { id: "high", label: "Jaki kontrasti i drama" },
    ],
  },
  {
    id: "texture",
    title: "Koliko teksturalnog sloja želite?",
    options: [
      { id: "soft", label: "Diskretno, taktilno ali mirno" },
      { id: "balanced", label: "Balansirano" },
      { id: "rich", label: "Bogato i slojevito" },
    ],
  },
  {
    id: "mood_intensity",
    title: "Kako želite da prostor ostavlja utisak?",
    options: [
      { id: "calm", label: "Smireno i kontrolisano" },
      { id: "balanced", label: "Balansirano" },
      { id: "statement", label: "Statement i karakter" },
    ],
  },
] as const;

export const moodQuizQuestions = [
  {
    id: "daylight_preference",
    title: "Koliko dnevne svetlosti želite da dominira?",
    options: [
      { id: "maximum", label: "Maksimalno, što svetlije" },
      { id: "balanced", label: "Balans dan/noć" },
      { id: "controlled", label: "Kontrolisano, intimnije" },
    ],
  },
  {
    id: "social_energy",
    title: "Kako prostor najčešće koristite?",
    options: [
      { id: "hosting", label: "Česta druženja i energija" },
      { id: "mixed", label: "Balans privatno/društveno" },
      { id: "retreat", label: "Mir i privatnost" },
    ],
  },
  {
    id: "visual_temperature",
    title: "Koji ton vam više prija?",
    options: [
      { id: "warm", label: "Topliji i cozy" },
      { id: "neutral", label: "Neutralni balans" },
      { id: "cool", label: "Svežiji i čistiji" },
    ],
  },
] as const;

export const furnitureQuizQuestions = [
  {
    id: "touch_expectation",
    title: "Kakav osećaj materijala želite pod rukom?",
    options: [
      { id: "easy", label: "Praktično i lako održavanje" },
      { id: "balanced", label: "Balans praktičnog i premium" },
      { id: "lux", label: "Premium taktilni osećaj" },
    ],
  },
  {
    id: "longevity_expectation",
    title: "Koliko dug vek trajanja očekujete bez kompromisa?",
    options: [
      { id: "good", label: "Dobar standard" },
      { id: "high", label: "Visok standard" },
      { id: "best", label: "Top premium i custom detalji" },
    ],
  },
  {
    id: "care_tolerance",
    title: "Koliko ste spremni na redovno održavanje osetljivih površina?",
    options: [
      { id: "low", label: "Minimalno održavanje" },
      { id: "medium", label: "Umereno održavanje" },
      { id: "high", label: "Bez problema sa održavanjem" },
    ],
  },
] as const;

export const residentialRoomOptions: RoomScopeOption[] = [
  "living_room",
  "kitchen",
  "dining",
  "bedroom",
  "kids_room",
  "bathroom",
  "hallway",
  "office",
  "terrace",
];

export const businessRoomOptions: RoomScopeOption[] = [
  "reception",
  "open_space",
  "meeting_room",
  "conference_room",
  "office",
  "kitchenette",
  "storage_room",
  "wc",
  "commercial_zone",
];

export const moodCards: Array<{
  id: MoodDiscoveryOption;
  title: string;
  subtitle: string;
  image: string;
}> = [
  {
    id: "cozy_warm",
    title: "Cozy & Warm",
    subtitle: "Topla i prijatna atmosfera.",
    image: "/intake/moods/cozy-warm.jpg",
  },
  {
    id: "bright_airy",
    title: "Bright & Airy",
    subtitle: "Svetao i prozračan osećaj.",
    image: "/intake/moods/bright-airy.jpg",
  },
  {
    id: "calm_minimal",
    title: "Calm & Minimal",
    subtitle: "Mirna, čistija vizuelna dinamika.",
    image: "/intake/moods/calm-minimal.jpg",
  },
  {
    id: "dramatic_elegant",
    title: "Dramatic & Elegant",
    subtitle: "Kontrast i sofisticirana scena.",
    image: "/intake/moods/dramatic-elegant.jpg",
  },
  {
    id: "soft_romantic",
    title: "Soft & Romantic",
    subtitle: "Nježni prelazi i meke teksture.",
    image: "/intake/moods/soft-romantic.jpg",
  },
  {
    id: "bold_artistic",
    title: "Bold & Artistic",
    subtitle: "Hrabar i personalizovan izraz.",
    image: "/intake/moods/bold-artistic.jpg",
  },
];

export const paletteCards: Array<{
  id: PaletteDiscoveryOption;
  title: string;
  subtitle: string;
  image: string;
  swatches: string[];
}> = [
  {
    id: "warm_neutrals",
    title: "Warm neutrals",
    subtitle: "Meko topla osnova sa tihom elegancijom.",
    image: "/intake/palettes/warm-neutrals.jpg",
    swatches: ["#F5F1EA", "#EDE4D4", "#D8CBB8", "#8B8072"],
  },
  {
    id: "greige_walnut",
    title: "Greige + walnut",
    subtitle: "Greige zidovi uz toplinu oraha.",
    image: "/intake/palettes/greige-walnut.jpg",
    swatches: ["#EFE6D8", "#D8CBB8", "#5E5A3C", "#3E332D"],
  },
  {
    id: "cream_gold",
    title: "Cream + gold accents",
    subtitle: "Krem osnova sa suptilnim brass detaljima.",
    image: "/intake/palettes/cream-gold.jpg",
    swatches: ["#F2E8D9", "#E8DDCC", "#C9A35D", "#B8A06A"],
  },
  {
    id: "white_black_accents",
    title: "White + black accents",
    subtitle: "Čist kontrast sa ograničenim tamnim akcentom.",
    image: "/intake/palettes/white-black-accents.jpg",
    swatches: ["#F5F1EA", "#EDE4D4", "#3E332D", "#2F4F4A"],
  },
  {
    id: "earthy_greens",
    title: "Earthy greens",
    subtitle: "Prirodni zeleni tonovi i zemljana baza.",
    image: "/intake/palettes/earthy-greens.jpg",
    swatches: ["#E8DDCC", "#D8CBB8", "#5E5A3C", "#2F4F4A"],
  },
  {
    id: "burgundy_accent",
    title: "Burgundy accent",
    subtitle: "Brand-friendly burgundy kao akcent.",
    image: "/intake/palettes/burgundy-accent.jpg",
    swatches: ["#F5F1EA", "#EDE4D4", "#3B0D18", "#C9A35D"],
  },
  {
    id: "stone_taupe",
    title: "Stone + taupe",
    subtitle: "Neutralni mineralni tonovi sa dubinom.",
    image: "/intake/palettes/stone-taupe.jpg",
    swatches: ["#EFE6D8", "#E8DDCC", "#8B8072", "#3E332D"],
  },
  {
    id: "soft_pastel_neutrals",
    title: "Soft pastel neutrals",
    subtitle: "Pastelna nota unutar neutralnog spektra.",
    image: "/intake/palettes/soft-pastel-neutrals.jpg",
    swatches: ["#F5F1EA", "#F2E8D9", "#E8DDCC", "#B8A06A"],
  },
];

export const lightingCards: Array<{
  id: LightingScenarioOption;
  title: string;
  subtitle: string;
  media: string;
  recommended?: boolean;
}> = [
  {
    id: "flat_ceiling_only",
    title: "Flat ceiling only",
    subtitle: "Jednostavna plafonska tačka (izbegavati).",
    media: "/intake/lighting/flat-ceiling-only.jpg",
  },
  {
    id: "layered_lighting",
    title: "Layered lighting",
    subtitle: "Ambijentalno + radno + akcentno svetlo.",
    media: "/intake/lighting/layered-lighting.jpg",
    recommended: true,
  },
  {
    id: "track_spot_zones",
    title: "Track/spot zones",
    subtitle: "Fleksibilne scene i akcenti po zonama.",
    media: "/intake/lighting/track-spot-zones.jpg",
  },
  {
    id: "pendants_dining",
    title: "Pendants (dining)",
    subtitle: "Viseća rasveta za trpezarijsku scenu.",
    media: "/intake/lighting/pendants-dining.jpg",
  },
  {
    id: "indirect_led",
    title: "Indirect LED",
    subtitle: "Diskretna, cozy noćna atmosfera.",
    media: "/intake/lighting/indirect-led.jpg",
  },
];

export const budgetTierCards: Array<{
  id: BudgetTierOption;
  title: string;
  range: string;
  bullets: string[];
}> = [
  {
    id: "starter",
    title: "Starter",
    range: "12.000€ - 30.000€",
    bullets: ["Selektivne intervencije", "Mid/BASIC kombinacija", "Fokus na funkcionalni upgrade"],
  },
  {
    id: "balanced",
    title: "Balanced",
    range: "30.000€ - 70.000€",
    bullets: ["Kompletan balans estetike i funkcije", "MID nivo kao baza", "Rasveta i detalji sa karakterom"],
  },
  {
    id: "premium",
    title: "Premium",
    range: "70.000€+",
    bullets: ["Custom rešenja i premium materijali", "Veći nivo personalizacije", "Najviši nivo završne obrade"],
  },
];

export const intakeGuideManifest = {
  quickMeasureVideo: "/intake/guides/measure-video-placeholder.svg",
  quickMeasureIllustration: "/intake/guides/measure-guide.svg",
};
