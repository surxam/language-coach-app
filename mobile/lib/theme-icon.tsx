import {
  UtensilsCrossed, ShoppingBag, Plane, Briefcase, HeartPulse, Trophy,
  House, Music2, GraduationCap, Laptop, CloudSun, MessageCircle,
  PawPrint, UsersRound, Clapperboard, Heart, PartyPopper, Smartphone,
  Newspaper, Gamepad2, BookOpen, Rocket, Wallet, Check, AlertCircle, AlertTriangle,
  type LucideIcon,
} from "lucide-react-native";

/**
 * Résolution du thème libre généré par l'IA vers une catégorie visuelle.
 * Miroir exact de app/Support/theme_helpers.php (projet web LinguistFlow) —
 * aligné sur la taxonomie officielle des 20 sujets de conversation de
 * l'application, plus une catégorie bonus "animaux" repérée dans les
 * données réelles.
 */
export type ThemeCategory =
  | "pets_animals" | "family" | "home_housing" | "work" | "education"
  | "sports" | "movies_series" | "music" | "games_hobbies" | "books_culture"
  | "food" | "travel" | "money" | "romance" | "friends_social"
  | "social_media" | "technology" | "news_society" | "weather_seasons"
  | "health_wellness" | "dreams_projects" | "default";

// L'ordre compte : les catégories les plus spécifiques passent avant les
// plus génériques pour éviter les faux positifs (ex: "Video Games" ne doit
// pas tomber dans "sports" à cause du mot "game").
const CATEGORY_KEYWORDS: Record<ThemeCategory, string[]> = {
  pets_animals: ["dog", "cat", "pet", "animal", "puppy", "kitten", "vet", "veterinarian", "bird", "chien", "chat", "animaux"],
  family: ["family", "parent", "mother", "father", "brother", "sister", "sibling", "children", "kids", "famille", "frère", "sœur", "soeur", "parents", "enfants"],
  home_housing: ["house", "home", "apartment", "moving", "neighbor", "renovation", "decoration", "déménagement", "voisinage", "travaux", "décoration", "logement", "maison", "daily life", "routine", "quotidien"],
  work: ["work", "job", "career", "office", "business", "meeting", "colleague", "interview", "boss", "salary", "resume", "cv", "travail", "bureau", "emploi", "entretien", "collègue"],
  education: ["school", "study", "education", "learning", "class", "university", "exam", "homework", "teacher", "student", "école", "étude", "cours", "examen", "formation"],
  sports: ["sport", "football", "soccer", "basketball", "tennis", "golf", "baseball", "rugby", "match", "tournament", "team", "training", "marathon", "athlete", "gym", "fitness", "exercise", "running", "workout", "équipe"],
  movies_series: ["movie", "film", "série", "series", "actor", "actress", "cinema", "cinéma", "netflix", "streaming", "plateforme"],
  music: ["music", "song", "concert", "artist", "chanson", "chanteur", "chanteuse", "musique", "album", "playlist"],
  games_hobbies: ["game", "gaming", "video game", "board game", "playstation", "xbox", "jeu", "jeux vidéo", "loisir", "hobby", "jouer", "créatif"],
  books_culture: ["book", "reading", "novel", "author", "museum", "literature", "culture", "culturel", "livre", "roman", "auteur", "musée", "spectacle", "lecture"],
  food: ["restaurant", "food", "meal", "dinner", "lunch", "breakfast", "cafe", "café", "coffee", "cuisine", "cooking", "recipe", "eat", "kitchen", "chef", "nourriture", "repas", "cuisiner", "plat"],
  travel: ["travel", "trip", "vacation", "holiday", "flight", "airport", "voyage", "tourism", "tourist", "hotel", "journey", "abroad", "backpacking", "road trip", "destination"],
  money: ["money", "finance", "budget", "bank", "investment", "saving", "expense", "economy", "currency", "cost of living", "coût de la vie", "argent", "économie", "shopping", "grocery", "store", "market", "buy", "purchase", "shop", "achat", "magasin", "boutique", "course", "marché"],
  romance: ["romantic", "relationship", "dating", "boyfriend", "girlfriend", "marriage", "wedding", "breakup", "couple", "romance", "rencontre amoureuse", "relation amoureuse", "relations amoureuses", "amoureux", "amoureuse", "amoureuses"],
  friends_social: ["friend", "hangout", "social life", "outing", "ami", "amis", "sortie", "soirée", "entre amis"],
  social_media: ["instagram", "tiktok", "facebook", "snapchat", "influencer", "social media", "réseaux sociaux", "influenceur", "numérique"],
  technology: ["technology", "technologie", "computer", "smartphone", "internet", "software", "app", "digital", "tech", "artificial intelligence", "coding", "programming", "gadget", "ai chatbot", "ai tool", "intelligence artificielle"],
  news_society: ["news", "politics", "election", "government", "society", "current events", "actualité", "société", "événement"],
  weather_seasons: ["weather", "season", "rain", "heat", "cyclone", "winter", "summer", "météo", "saison", "chaleur", "pluie", "hiver"],
  health_wellness: ["health", "doctor", "medical", "hospital", "medicine", "symptom", "sleep", "wellbeing", "relax", "stress", "mood", "feeling", "santé", "médecin", "bien-être", "sommeil", "détente"],
  dreams_projects: ["goal", "dream", "project", "ambition", "future plan", "objectif", "rêve", "projet", "avenir"],
  default: [],
};

export function resolveThemeCategory(theme: string): ThemeCategory {
  const t = theme.toLowerCase();
  for (const category of Object.keys(CATEGORY_KEYWORDS) as ThemeCategory[]) {
    if (category === "default") continue;
    // Limites de mots pour éviter les faux positifs de sous-chaîne (ex:
    // "ami" ne doit PAS matcher dans "Lamin"), avec un [sx]? final
    // optionnel pour couvrir les pluriels français (étude/études, jeu/jeux).
    const matches = CATEGORY_KEYWORDS[category].some((kw) =>
      new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[sx]?\\b`, "iu").test(t)
    );
    if (matches) return category;
  }
  return "default";
}

type ThemeStyle = { color: string; bg: string; Icon: LucideIcon };

const THEME_STYLES: Record<ThemeCategory, ThemeStyle> = {
  pets_animals: { color: "#D97706", bg: "#FEF3C7", Icon: PawPrint },
  family: { color: "#FB923C", bg: "#FFEDD5", Icon: UsersRound },
  home_housing: { color: "#14B8A6", bg: "#CCFBF1", Icon: House },
  work: { color: "#1E1B22", bg: "#F1F5F9", Icon: Briefcase },
  education: { color: "#FACC15", bg: "#FEF9C3", Icon: GraduationCap },
  sports: { color: "#38BDF8", bg: "#E0F2FE", Icon: Trophy },
  movies_series: { color: "#A855F7", bg: "#F3E8FF", Icon: Clapperboard },
  music: { color: "#EC4899", bg: "#FCE7F3", Icon: Music2 },
  games_hobbies: { color: "#F43F5E", bg: "#FFF1F2", Icon: Gamepad2 },
  books_culture: { color: "#F59E0B", bg: "#FEF3C7", Icon: BookOpen },
  food: { color: "#4ADE80", bg: "#DCFCE7", Icon: UtensilsCrossed },
  travel: { color: "#6366F1", bg: "#EEF2FF", Icon: Plane },
  money: { color: "#059669", bg: "#ECFDF5", Icon: Wallet },
  romance: { color: "#FB7185", bg: "#FFE4E6", Icon: Heart },
  friends_social: { color: "#22D3EE", bg: "#CFFAFE", Icon: PartyPopper },
  social_media: { color: "#D946EF", bg: "#FAE8FF", Icon: Smartphone },
  technology: { color: "#818CF8", bg: "#E0E7FF", Icon: Laptop },
  news_society: { color: "#64748B", bg: "#F1F5F9", Icon: Newspaper },
  weather_seasons: { color: "#0EA5E9", bg: "#E0F2FE", Icon: CloudSun },
  health_wellness: { color: "#34D399", bg: "#D1FAE5", Icon: HeartPulse },
  dreams_projects: { color: "#8B5CF6", bg: "#EDE9FE", Icon: Rocket },
  default: { color: "#94A3B8", bg: "#F1F5F9", Icon: MessageCircle },
};

/**
 * Style complet (couleur d'icône, fond pastel, composant icône) pour un
 * thème de conversation donné. Utilisé par ConversationCard (Historique),
 * ReviewScreen et ConversationDetailScreen pour un rendu cohérent : fond
 * clair + icône colorée (au lieu d'un fond plein + icône blanche).
 */
export function getThemeStyle(theme: string): ThemeStyle {
  return THEME_STYLES[resolveThemeCategory(theme)];
}

/**
 * Icône de thème prête à l'emploi : <ThemeIcon theme={fb.theme} size={19} />
 */
export function ThemeIcon({ theme, size = 19 }: { theme: string; size?: number }) {
  const { color, Icon } = getThemeStyle(theme);
  return <Icon size={size} color={color} />;
}

/**
 * Message de félicitations/encouragement adapté au score de la session,
 * affiché sur les écrans "Discussion terminée" et "Review". Miroir exact
 * de fluencyMessage() dans app/Support/theme_helpers.php (projet web).
 */
export function fluencyMessage(score: number | null): string {
  if (score === null) return "Votre session est terminée.";
  if (score >= 9.0) return "Vous avez fait preuve d'une fluidité exceptionnelle !";
  if (score >= 7.5) return "Vous avez fait preuve d'une excellente fluidité.";
  if (score >= 6.0) return "Votre fluidité progresse bien, continuez sur cette lancée !";
  if (score >= 4.0) return "Vous progressez : encore un peu de pratique pour gagner en fluidité.";
  return "Chaque session compte, ne lâchez rien : votre fluidité va s'améliorer.";
}

type ScoreVisual = { color: string; bg: string; Icon: LucideIcon };

/**
 * Palette (couleur + fond clair + icône) associée au niveau du score, pour
 * la carte "Prononciation". Miroir exact de scoreVisual() côté web.
 */
export function scoreVisual(score: number | null): ScoreVisual {
  if (score === null) return { color: "#94A3B8", bg: "#F1F5F9", Icon: AlertCircle };
  if (score >= 7.5) return { color: "#22C55E", bg: "#DCFCE7", Icon: Check };
  if (score >= 4.0) return { color: "#F97316", bg: "#FFEDD5", Icon: AlertTriangle };
  return { color: "#EF4444", bg: "#FEE2E2", Icon: AlertCircle };
}
