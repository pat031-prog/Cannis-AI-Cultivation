export enum CultivationPhase {
  Germination = 'Germinación',
  Vegetative = 'Vegetativa',
  Flowering = 'Floración',
  Harvest = 'Cosecha',
}

export const CULTIVATION_PHASES_ORDER = [
  CultivationPhase.Germination,
  CultivationPhase.Vegetative,
  CultivationPhase.Flowering,
  CultivationPhase.Harvest,
];

export interface CultivationData {
  phase: CultivationPhase;
  daysElapsed: number;
  overallHealth: string;
  growthProgress: number;
  temperature: number;
  humidity: number;
  ph: number;
  lightHours: number;
  lastWateringDaysAgo: number;
  nextWateringInDays: number;
  soilMoisturePercent: number;
}

export interface AiRecommendation {
  icon: string;
  text: string;
}

export enum AlertType {
  Nutrient = 'Nutriente',
  Pruning = 'Poda',
  Environment = 'Condición',
  Technique = 'Técnica'
}

export interface SystemAlert {
    type: AlertType;
    message: string;
    daysUntilAction: number;
}

export interface AiAnalysisResult {
  recommendations: AiRecommendation[];
  alerts: SystemAlert[];
}

export enum ActivityType {
    Watering = 'Riego',
    Nutrients = 'Nutrientes',
    Pruning = 'Poda',
    Observation = 'Observación',
}

export interface ActivityLogEntry {
    id: number;
    date: string;
    type: ActivityType;
    notes: string;
    details?: {
        nutrientType?: string;
        dosage?: string;
    };
}

export interface HealthStatus {
    status: 'Excelente' | 'Buena' | 'Atención Requerida';
    color: string;
    advice: string;
}

export interface NewsArticle {
    id?: number;
    source: string;
    headline: string;
    link: string;
}

export enum EffectPreference {
    Relaxing = "Relajante / Calmante",
    Uplifting = "Eufórico / Energizante",
    Creative = "Creativo / Enfocado",
    Medicinal = "Medicinal / Terapéutico"
}

export enum TerpenePreference {
    Citrus = "Cítrico (Limoneno)",
    Earthy = "Terroso (Mirceno)",
    Pine = "Pino (Pineno)",
    Floral = "Floral (Linalool)",
    Spicy = "Especiado (Cariofileno)"
}

export interface GeneticsPreference {
    effect: EffectPreference;
    terpene: TerpenePreference;
}

export interface GeneticsRecommendation {
    name: string;
    description: string;
    terpenes: string;
}