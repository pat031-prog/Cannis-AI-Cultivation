import React, { useState, useCallback } from 'react';
import { EffectPreference, TerpenePreference, GeneticsPreference, GeneticsRecommendation } from '../types';
import { getGeneticsRecommendations } from '../services/geminiService';
import { DnaIcon, AlertTriangleIcon } from './icons';
import { AiLoader } from './AiLoader';

export const GeneticsFinder: React.FC = () => {
    const [preferences, setPreferences] = useState<GeneticsPreference>({
        effect: EffectPreference.Relaxing,
        terpene: TerpenePreference.Earthy,
    });
    const [recommendations, setRecommendations] = useState<GeneticsRecommendation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePreferenceChange = (field: keyof GeneticsPreference, value: string) => {
        setPreferences(prev => ({ ...prev, [field]: value }));
    };

    const handleFindGenetics = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setRecommendations([]);
        try {
            const result = await getGeneticsRecommendations(preferences);
            setRecommendations(result);
        } catch (e) {
            console.error(e);
            setError("No se pudieron obtener recomendaciones de genéticas. Intente de nuevo más tarde.");
        } finally {
            setIsLoading(false);
        }
    }, [preferences]);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Efecto Deseado</label>
                    <select
                        value={preferences.effect}
                        onChange={e => handlePreferenceChange('effect', e.target.value)}
                        className="w-full bg-gray-900/70 border border-gray-700 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:outline-none"
                    >
                        {Object.values(EffectPreference).map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                </div>
                <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-400 mb-1">Perfil de Terpenos</label>
                    <select
                        value={preferences.terpene}
                        onChange={e => handlePreferenceChange('terpene', e.target.value)}
                        className="w-full bg-gray-900/70 border border-gray-700 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:outline-none"
                    >
                        {Object.values(TerpenePreference).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <button
                    onClick={handleFindGenetics}
                    disabled={isLoading}
                    className="md:col-span-1 bg-gradient-to-br from-green-400 to-green-600 text-gray-900 font-bold hover:from-green-400 hover:to-green-500 hover:shadow-[0_4px_15px_rgba(74,222,128,0.3)] hover:-translate-y-px transition-all duration-200 disabled:from-green-800 disabled:to-green-900 disabled:cursor-not-allowed py-2.5 px-4 rounded-lg flex items-center justify-center gap-2"
                >
                    <DnaIcon className="w-5 h-5"/>
                    <span>{isLoading ? 'Buscando...' : 'Encontrar Genéticas'}</span>
                </button>
            </div>

            <div className="mt-4 min-h-[100px]">
                {isLoading && <AiLoader />}
                {error && <div className="flex items-center gap-3 text-red-400 bg-red-900/50 p-3 rounded-lg"><AlertTriangleIcon /> {error}</div>}
                {!isLoading && recommendations.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                        {recommendations.map((rec) => (
                            <div key={rec.name} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                                <h4 className="font-bold text-green-400 text-lg">{rec.name}</h4>
                                <p className="text-sm text-gray-300 mt-1">{rec.description}</p>
                                <p className="text-xs text-purple-300 mt-2"><span className="font-semibold">Terpenos:</span> {rec.terpenes}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};