import { GoogleGenAI, Type } from "@google/genai";
// FIX: Changed 'import type' to a regular 'import' to allow the 'AlertType' enum to be used as a value.
import { CultivationData, AiRecommendation, ActivityLogEntry, AiAnalysisResult, GeneticsPreference, GeneticsRecommendation, SystemAlert, AlertType } from '../types';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Using mock data.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const MOCK_ANALYSIS_RESULT: AiAnalysisResult = {
    recommendations: [
        { icon: "leaf", text: "El crecimiento es vigoroso. Considerar LST (Low Stress Training) para maximizar la exposición de luz en las ramas inferiores." },
        { icon: "thermometer", text: "La temperatura es estable. Monitorear los cambios nocturnos para evitar que baje de los 18°C y prevenir estrés." },
        { icon: "water", text: "La humedad del suelo es óptima. Continuar con el programa de riego actual, ajustando según la necesidad de la planta." },
    ],
    alerts: [
        { type: AlertType.Nutrient, message: "Es momento de la próxima dosis de nutrientes de crecimiento. Aumentar ligeramente el nitrógeno (ej. N-P-K 12-6-6).", daysUntilAction: 0 },
        { type: AlertType.Pruning, message: "Las hojas más bajas muestran signos de poca luz. Realizar una ligera defoliación para mejorar la circulación de aire y penetración lumínica.", daysUntilAction: 1 },
    ]
};

const MOCK_GENETICS_RECOMMENDATIONS: GeneticsRecommendation[] = [
    { name: "Blue Dream", description: "Híbrido Sativa dominante conocido por su efecto cerebral estimulante y relajación corporal completa. Ideal para aliviar el estrés durante el día.", terpenes: "Mirceno, Pineno, Cariofileno" },
    { name: "Granddaddy Purple", description: "Indica popular con potentes efectos relajantes y sedantes. Perfecta para combatir el insomnio y el dolor.", terpenes: "Mirceno, Linalool, Cariofileno" },
    { name: "Sour Diesel", description: "Sativa energizante y de acción rápida. Fomenta la creatividad y combate la fatiga y la depresión.", terpenes: "Limoneno, Mirceno, Cariofileno" },
];

export async function getAiRecommendations(data: CultivationData, nutrientHistory: ActivityLogEntry[]): Promise<AiAnalysisResult> {
    if (!process.env.API_KEY) {
        return new Promise(resolve => setTimeout(() => resolve(MOCK_ANALYSIS_RESULT), 1000));
    }

    const nutrientHistoryString = nutrientHistory.length > 0
        ? nutrientHistory.map(log => `- ${new Date(log.id).toLocaleDateString('es-ES')}: ${log.details?.nutrientType} a ${log.details?.dosage}. Notas: ${log.notes}`).join('\n')
        : "No se han registrado aplicaciones de nutrientes recientemente.";
    
    const prompt = `
        Eres un asistente experto en el cultivo de cannabis terapéutico. Analiza los siguientes datos de un módulo de cultivo.
        Tu tarea es generar dos cosas en español:
        1. Una lista de 3 recomendaciones generales y concisas sobre el estado actual del cultivo.
        2. Una lista de hasta 2 alertas accionables y urgentes. Estas alertas deben indicar acciones que el cultivador debe tomar pronto (hoy o en los próximos días).
        
        Tipos de Alertas Posibles:
        - 'Nutriente': Si es momento de aplicar nutrientes.
        - 'Poda': Si se recomienda una técnica de poda específica (LST, defoliación, etc.).
        - 'Condición': Si algún parámetro ambiental (temp, humedad, pH) necesita ajuste urgente.
        - 'Técnica': Si se recomienda otra acción importante (ej. iniciar lavado de raíces, revisar tricomas).

        Datos del Cultivo:
        - Fase Actual: ${data.phase}
        - Días Transcurridos: ${Math.floor(data.daysElapsed)}
        - Temperatura: ${data.temperature.toFixed(1)}°C
        - Humedad: ${data.humidity.toFixed(1)}%
        - pH del Suelo: ${data.ph}
        - Horas de Luz Diarias: ${data.lightHours}h
        
        Historial Reciente de Nutrientes:
        ${nutrientHistoryString}
        
        Genera el JSON con las recomendaciones y las alertas. Para cada alerta, especifica el tipo, un mensaje claro y en cuántos días se debe realizar la acción (0 para hoy, 1 para mañana, etc.).
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        recommendations: {
                            type: Type.ARRAY,
                            description: "Una lista de 3 recomendaciones generales para el cultivo.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    icon: { type: Type.STRING, description: 'Un nombre de ícono: "leaf", "water", "lightbulb", "thermometer", "scissors", "nutrient".' },
                                    text: { type: Type.STRING, description: 'El texto de la recomendación.' }
                                },
                                required: ["icon", "text"]
                            }
                        },
                        alerts: {
                            type: Type.ARRAY,
                            description: "Una lista de hasta 2 alertas accionables y urgentes.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    type: { type: Type.STRING, enum: Object.values(AlertType), description: "El tipo de alerta." },
                                    message: { type: Type.STRING, description: "El mensaje claro y accionable de la alerta." },
                                    daysUntilAction: { type: Type.INTEGER, description: "Número de días hasta que la acción deba realizarse." }
                                },
                                required: ["type", "message", "daysUntilAction"]
                            }
                        }
                    },
                    required: ["recommendations", "alerts"]
                },
                temperature: 0.7,
            },
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);

        if (result && Array.isArray(result.recommendations) && Array.isArray(result.alerts)) {
            return result as AiAnalysisResult;
        }
        
        throw new Error("La respuesta de la IA no tiene el formato esperado.");

    } catch (error) {
        console.error("Error fetching AI recommendations:", error);
        throw new Error("No se pudo comunicar con el servicio de IA.");
    }
}


export async function getGeneticsRecommendations(preferences: GeneticsPreference): Promise<GeneticsRecommendation[]> {
    if (!process.env.API_KEY) {
        return new Promise(resolve => setTimeout(() => resolve(MOCK_GENETICS_RECOMMENDATIONS.slice(0, 2)), 1000));
    }

    const prompt = `
        Eres un experto en genéticas de cannabis. Recomienda 2 genéticas específicas en español que se ajusten a las siguientes preferencias de un usuario. Para cada genética, proporciona su nombre, una breve descripción de sus efectos y beneficios, y su perfil de terpenos principal.
        
        Preferencias del Usuario:
        - Efecto Deseado: ${preferences.effect}
        - Perfil de Terpenos Preferido: ${preferences.terpene}
        
        Genera una lista de 2 recomendaciones.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    description: "Una lista de 2 recomendaciones de genéticas de cannabis.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING, description: 'El nombre de la genética.' },
                            description: { type: Type.STRING, description: 'Breve descripción de la genética, sus efectos y usos.' },
                            terpenes: { type: Type.STRING, description: 'Los terpenos dominantes de la genética (ej. Mirceno, Limoneno).' }
                        },
                        required: ["name", "description", "terpenes"]
                    }
                },
                temperature: 0.8,
            },
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);

        if (Array.isArray(result) && result.length > 0) {
            return result as GeneticsRecommendation[];
        }
        
        throw new Error("La respuesta de la IA no tiene el formato esperado.");

    } catch (error) {
        console.error("Error fetching genetics recommendations:", error);
        throw new Error("No se pudo comunicar con el servicio de IA para genéticas.");
    }
}