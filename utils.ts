import { CultivationData, CultivationPhase, HealthStatus } from './types';

// Rangos óptimos por fase
const optimalRanges = {
  [CultivationPhase.Germination]: {
    temp: { min: 22, max: 26 },
    humidity: { min: 60, max: 80 },
    ph: { min: 6.0, max: 7.0 },
  },
  [CultivationPhase.Vegetative]: {
    temp: { min: 20, max: 28 },
    humidity: { min: 40, max: 60 },
    ph: { min: 5.8, max: 6.5 },
  },
  [CultivationPhase.Flowering]: {
    temp: { min: 18, max: 26 },
    humidity: { min: 40, max: 50 },
    ph: { min: 6.0, max: 7.0 },
  },
  [CultivationPhase.Harvest]: {
    temp: { min: 18, max: 24 },
    humidity: { min: 45, max: 55 },
    ph: { min: 6.0, max: 7.0 },
  },
};

export function calculateHealthStatus(data: CultivationData): HealthStatus {
  const ranges = optimalRanges[data.phase];
  const issues = [];

  if (data.temperature < ranges.temp.min || data.temperature > ranges.temp.max) {
    issues.push(`la temperatura (${data.temperature.toFixed(1)}°C) está fuera del rango ideal (${ranges.temp.min}-${ranges.temp.max}°C)`);
  }
  if (data.humidity < ranges.humidity.min || data.humidity > ranges.humidity.max) {
    issues.push(`la humedad (${data.humidity.toFixed(1)}%) está fuera del rango ideal (${ranges.humidity.min}-${ranges.humidity.max}%)`);
  }
  if (data.ph < ranges.ph.min || data.ph > ranges.ph.max) {
    issues.push(`el pH (${data.ph}) está fuera del rango ideal (${ranges.ph.min}-${ranges.ph.max})`);
  }

  if (issues.length === 0) {
    return {
      status: 'Excelente',
      color: 'bg-green-500/30 text-green-300',
      advice: 'Todos los parámetros están dentro del rango óptimo.',
    };
  } else if (issues.length === 1) {
    return {
      status: 'Buena',
      color: 'bg-yellow-500/30 text-yellow-300',
      advice: `Atención: ${issues[0]}.`,
    };
  } else {
    return {
      status: 'Atención Requerida',
      color: 'bg-red-500/30 text-red-300',
      advice: `Múltiples alertas: ${issues.join(', ')}.`,
    };
  }
}
