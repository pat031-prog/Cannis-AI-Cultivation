import React, { useState, useEffect, useCallback } from 'react';
import { CultivationData, CultivationPhase, AiRecommendation, CULTIVATION_PHASES_ORDER, ActivityLogEntry, ActivityType, HealthStatus, AiAnalysisResult, SystemAlert, AlertType } from './types';
import { getAiRecommendations } from './services/geminiService';
import { calculateHealthStatus } from './utils';
import { Card } from './components/Card';
import { Modal } from './components/Modal';
import { Sparkline } from './components/Sparkline';
import { AiLoader } from './components/AiLoader';
import { FloatingParticles } from './components/FloatingParticles';
import { NewsTicker } from './components/NewsTicker';
import { GeneticsFinder } from './components/GeneticsFinder';
import { CannisMagazineWidget } from './components/CannisMagazineWidget';
import { GrowthChart } from './components/GrowthChart';
import { ThermometerIcon, DropletsIcon, PhIcon, SunIcon, SproutIcon, FlowerIcon, ScissorsIcon, BotIcon, WaterIcon, ZapIcon, InfoIcon, AlertTriangleIcon, ActivityIcon, DownloadIcon, HistoryIcon, NotebookIcon, PlusIcon, LeafIcon, BeakerIcon, BellIcon, NewspaperIcon, DnaIcon, SparklesIcon, BookOpenIcon } from './components/icons';

const initialDays = 42;
const initialProgress = 65;
const generateInitialGrowthHistory = (days: number, finalProgress: number): number[] => {
    if (days <= 1) return [finalProgress];
    // Generate an array representing progress over time
    return Array.from({ length: Math.floor(days) }, (_, i) => {
        // Use a power function (e.g., exponent of 1.5) for a slightly eased curve
        const ratio = i / (Math.floor(days) - 1);
        const progress = Math.pow(ratio, 1.5) * finalProgress;
        return parseFloat(progress.toFixed(1));
    });
};
const initialGrowthHistoryData = generateInitialGrowthHistory(initialDays, initialProgress);


const initialCultivationData: CultivationData = {
  phase: CultivationPhase.Vegetative,
  daysElapsed: initialDays,
  overallHealth: 'Excelente',
  growthProgress: initialProgress,
  temperature: 24.1,
  humidity: 58.3,
  ph: 6.2,
  lightHours: 18,
  lastWateringDaysAgo: 2,
  nextWateringInDays: 1,
  soilMoisturePercent: 75,
};

const App: React.FC = () => {
  const [data, setData] = useState<CultivationData>(initialCultivationData);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<AiAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [sensorHistory, setSensorHistory] = useState<{ temp: number[], humidity: number[] }>({ temp: [], humidity: [] });
  const [growthHistory, setGrowthHistory] = useState<number[]>(initialGrowthHistoryData);
  const [modal, setModal] = useState<'log' | 'history' | 'none'>('none');
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([
    {
      id: Date.now() - 86400000 * 3, // 3 days ago
      date: new Date(Date.now() - 86400000 * 3).toLocaleString('es-ES'),
      type: ActivityType.Nutrients,
      notes: 'Aplicación estándar para crecimiento.',
      details: {
        nutrientType: 'N-P-K (10-5-5)',
        dosage: '2ml/L'
      }
    }
  ]);
  const [newLogNotes, setNewLogNotes] = useState('');
  const [newLogType, setNewLogType] = useState<ActivityType>(ActivityType.Observation);
  const [newNutrientType, setNewNutrientType] = useState('');
  const [newNutrientDosage, setNewNutrientDosage] = useState('');
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);


  const fetchRecommendations = useCallback(async (currentData: CultivationData, currentLog: ActivityLogEntry[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const nutrientHistory = currentLog
        .filter(log => log.type === ActivityType.Nutrients)
        .slice(0, 3);
      const result = await getAiRecommendations(currentData, nutrientHistory);
      setAiAnalysisResult(result);
      setSystemAlerts(result.alerts);

    } catch (e) {
      console.error(e);
      setError('Error al obtener recomendaciones de la IA. Intente de nuevo.');
      setAiAnalysisResult(null);
      setSystemAlerts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations(data, activityLog);
  }, []); // Carga inicial

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prevData => {
        const newTemp = parseFloat((23 + Math.random() * 2).toFixed(1));
        const newHumidity = parseFloat((55 + Math.random() * 5).toFixed(1));
        
        setSensorHistory(prevHistory => ({
            temp: [...prevHistory.temp, newTemp].slice(-20),
            humidity: [...prevHistory.humidity, newHumidity].slice(-20),
        }));

        const currentProgress = prevData.growthProgress;
        // Growth slows down as it approaches 100. The increment is smaller when progress is high.
        const growthIncrement = (100 - currentProgress) / 100 * 0.05; 
        const newProgress = Math.min(100, currentProgress + growthIncrement);

        setGrowthHistory(prev => [...prev.slice(-59), newProgress]);

        return {
          ...prevData,
          daysElapsed: prevData.daysElapsed + 1/24, // Incremento por hora
          temperature: newTemp,
          humidity: newHumidity,
          growthProgress: newProgress,
        };
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    setHealthStatus(calculateHealthStatus(data));
  }, [data]);

  const handlePhaseChange = (phase: CultivationPhase) => {
    setData(prev => ({ ...prev, phase }));
  };
  
  const handleAiAnalysis = () => {
    fetchRecommendations(data, activityLog);
  };

  const handleLogActivity = () => {
    if (newLogNotes.trim() === '') return;
    const newLog: ActivityLogEntry = {
        id: Date.now(),
        date: new Date().toLocaleString('es-ES'),
        type: newLogType,
        notes: newLogNotes,
    };

    if (newLogType === ActivityType.Nutrients) {
      if (newNutrientType.trim() === '' || newNutrientDosage.trim() === '') {
        alert("Por favor, complete el tipo y la dosis del nutriente.");
        return;
      }
      newLog.details = {
        nutrientType: newNutrientType,
        dosage: newNutrientDosage,
      };
      // Al registrar nutrientes, la IA debería recalcular las alertas en el próximo análisis.
       setSystemAlerts(prev => prev.filter(alert => alert.type !== AlertType.Nutrient));
    }
     if (newLogType === ActivityType.Pruning) {
        setSystemAlerts(prev => prev.filter(alert => alert.type !== AlertType.Pruning));
    }


    setActivityLog(prev => [newLog, ...prev]);
    setNewLogNotes('');
    setNewNutrientType('');
    setNewNutrientDosage('');
    setModal('none');
  };
  
  const iconMap: { [key: string]: React.ReactNode } = {
    leaf: <LeafIcon className="w-5 h-5 text-green-400" />,
    water: <WaterIcon className="w-5 h-5 text-blue-400" />,
    lightbulb: <SunIcon className="w-5 h-5 text-yellow-400" />,
    thermometer: <ThermometerIcon className="w-5 h-5 text-orange-400" />,
    scissors: <ScissorsIcon className="w-5 h-5 text-gray-400" />,
    nutrient: <ZapIcon className="w-5 h-5 text-purple-400" />,
    default: <InfoIcon className="w-5 h-5 text-gray-400" />,
  };
  
  const phaseIcons = {
    [CultivationPhase.Germination]: <SproutIcon className="mx-auto mb-2 w-7 h-7" />,
    [CultivationPhase.Vegetative]: <LeafIcon className="mx-auto mb-2 w-7 h-7" />,
    [CultivationPhase.Flowering]: <FlowerIcon className="mx-auto mb-2 w-7 h-7" />,
    [CultivationPhase.Harvest]: <ScissorsIcon className="mx-auto mb-2 w-7 h-7" />,
  };

  const activityIcons: { [key in ActivityType]: React.ReactNode } = {
    [ActivityType.Watering]: <WaterIcon className="w-5 h-5 text-blue-400" />,
    [ActivityType.Nutrients]: <ZapIcon className="w-5 h-5 text-purple-400" />,
    [ActivityType.Pruning]: <ScissorsIcon className="w-5 h-5 text-yellow-400" />,
    [ActivityType.Observation]: <InfoIcon className="w-5 h-5 text-gray-400" />,
  }

  const alertConfig: { [key in AlertType]: { icon: React.ReactNode; color: string } } = {
    [AlertType.Nutrient]: { icon: <BeakerIcon className="w-6 h-6" />, color: 'border-yellow-400/50 bg-yellow-500/20 text-yellow-200' },
    [AlertType.Pruning]: { icon: <ScissorsIcon className="w-6 h-6" />, color: 'border-sky-400/50 bg-sky-500/20 text-sky-200' },
    [AlertType.Environment]: { icon: <ThermometerIcon className="w-6 h-6" />, color: 'border-orange-400/50 bg-orange-500/20 text-orange-200' },
    [AlertType.Technique]: { icon: <ZapIcon className="w-6 h-6" />, color: 'border-purple-400/50 bg-purple-500/20 text-purple-200' },
  };
  
  const exportData = () => {
      const exportableData = {
          ...data,
          daysElapsed: Math.floor(data.daysElapsed),
          activityLog: activityLog
      };
      const blob = new Blob([JSON.stringify(exportableData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cannis-cultivation-data.json';
      a.click();
      URL.revokeObjectURL(url);
  };

  const lastNutrientApplication = activityLog.find(log => log.type === ActivityType.Nutrients);
  
  const secondaryButtonClasses = "bg-green-400/10 text-green-300 border border-green-400/30 hover:bg-green-400/20 hover:border-green-400/50 transition-all duration-200 p-3 rounded-lg flex items-center justify-center gap-2";
  const primaryButtonClasses = "bg-gradient-to-br from-green-400 to-green-600 text-gray-900 font-bold hover:from-green-400 hover:to-green-500 hover:shadow-[0_4px_15px_rgba(74,222,128,0.3)] hover:-translate-y-px transition-all duration-200 disabled:from-green-800 disabled:to-green-900 disabled:cursor-not-allowed p-3 rounded-lg flex items-center justify-center gap-2";


  return (
    <div className="min-h-screen text-gray-100">
      <FloatingParticles />
      <div className="container mx-auto p-4 md:p-8 max-w-7xl relative z-10">
        <header className="text-center mb-6">
          <div className="flex justify-center items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-[0_4px_20px_rgba(74,222,128,0.3)] text-3xl">
              🌱
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-green-300 tracking-wider" style={{textShadow: '0 2px 10px rgba(74, 222, 128, 0.5)'}}>Cannis AI Cultivation</h1>
          </div>
          <p className="text-green-300/80 mb-4">Acompañante Inteligente para Cultivo Terapéutico</p>
          <div className="inline-flex items-center gap-2 bg-green-900/50 border border-green-500/30 px-4 py-2 rounded-full text-sm">
            <div className="w-3 h-3 bg-green-500 rounded-full status-dot-pulse"></div>
            Sistema Activo • Monitoreo en Tiempo Real
          </div>
        </header>

        <NewsTicker />
        
        <Card title="Centro de Alertas" icon={<BellIcon />} className="mb-6 animate-fade-in">
             {isLoading && <AiLoader />}
             {!isLoading && error && (
                <div className="flex items-center gap-3 text-red-400 bg-red-900/50 p-3 rounded-lg">
                    <AlertTriangleIcon /> {error.replace('Error al obtener recomendaciones de la IA. Intente de nuevo.', 'Error al generar alertas.')}
                </div>
             )}
             {!isLoading && !error && systemAlerts.length === 0 && (
                <div className="text-center text-green-300/80 py-4">
                    ✅ Sistema optimizado. No hay alertas críticas en este momento.
                </div>
             )}
             {!isLoading && systemAlerts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {systemAlerts.map((alert, index) => (
                         <div key={index} className={`p-4 rounded-xl flex items-start gap-4 border ${alertConfig[alert.type].color}`}>
                            <div className="flex-shrink-0 mt-0.5">{alertConfig[alert.type].icon}</div>
                            <div>
                                <h3 className="font-bold">{alert.type}</h3>
                                <p className="text-sm">{alert.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
             )}
        </Card>

        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          <Card title="Estado del Cultivo" icon={<ActivityIcon />} className="md:col-span-2 lg:col-span-2">
            <div className="space-y-4">
              <div className="flex justify-between items-center"><span className="text-gray-400">Fase Actual</span><span className="font-bold text-green-400">{data.phase}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-400">Días Transcurridos</span><span className="font-bold">{Math.floor(data.daysElapsed)}</span></div>
              {healthStatus && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Salud General</span>
                  <span className={`font-bold px-2 py-1 rounded ${healthStatus.color}`}>{healthStatus.status}</span>
                </div>
              )}
               {healthStatus && healthStatus.status !== 'Excelente' && (
                <div className="text-xs text-amber-300/80 bg-amber-900/30 p-2 rounded-md flex gap-2 items-center">
                  <AlertTriangleIcon className="w-4 h-4 flex-shrink-0"/> <span>{healthStatus.advice}</span>
                </div>
              )}
              <div>
                <div className="flex justify-between items-center text-gray-400 text-xs mb-1">
                    <span>Inicio Fase (Día 0)</span>
                    <span>Actual (Día {Math.floor(data.daysElapsed)})</span>
                </div>
                <GrowthChart data={growthHistory} height={60} className="my-2" />
                <small className="text-gray-400 mt-1 block text-right">Progreso de crecimiento: {data.growthProgress.toFixed(1)}%</small>
              </div>
            </div>
          </Card>
          
          <Card title="Condiciones Ambientales" icon={<ThermometerIcon />} className="md:col-span-2 lg:col-span-2">
             <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                <div className="flex justify-between items-center col-span-2">
                    <div className="flex items-center gap-2"><ThermometerIcon className="text-orange-400" /><span className="text-gray-400">Temp:</span> <span className="font-bold text-lg">{data.temperature.toFixed(1)}°C</span></div>
                    <Sparkline data={sensorHistory.temp} color="rgba(251, 146, 60, 0.7)" />
                </div>
                <div className="flex justify-between items-center col-span-2">
                    <div className="flex items-center gap-2"><DropletsIcon className="text-blue-400" /><span className="text-gray-400">Humedad:</span> <span className="font-bold text-lg">{data.humidity.toFixed(1)}%</span></div>
                    <Sparkline data={sensorHistory.humidity} color="rgba(96, 165, 250, 0.7)" />
                </div>
                <div className="flex items-center gap-2"><PhIcon className="text-purple-400" /><span className="text-gray-400">pH Suelo:</span> <span className="font-bold">{data.ph}</span></div>
                <div className="flex items-center gap-2"><SunIcon className="text-yellow-400" /><span className="text-gray-400">Luz Diaria:</span> <span className="font-bold">{data.lightHours}h</span></div>
             </div>
          </Card>

          <Card title="Fases de Cultivo" icon={<SproutIcon />} className="lg:col-span-4">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {CULTIVATION_PHASES_ORDER.map(phase => (
                    <button key={phase} onClick={() => handlePhaseChange(phase)} className={`p-3 text-center rounded-lg transition-all duration-200 text-sm ${data.phase === phase ? 'bg-green-500 text-gray-900 font-bold shadow-lg' : 'bg-gray-800/60 hover:bg-gray-700/80'}`}>
                        {phaseIcons[phase]}
                        {phase}
                    </button>
                ))}
             </div>
          </Card>

          <Card title="Programa de Riego" icon={<WaterIcon />} className="lg:col-span-2">
             <div className="space-y-3">
                <div className="flex justify-between items-center"><span className="text-gray-400">Último Riego</span><span className="font-bold">Hace {data.lastWateringDaysAgo} días</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-400">Próximo Riego</span><span className="font-bold">En {data.nextWateringInDays} día(s)</span></div>
                <div>
                   <div className="w-full bg-blue-900/50 rounded-full h-2.5">
                     <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${data.soilMoisturePercent}%` }}></div>
                   </div>
                   <small className="text-gray-400 mt-1 block text-right">Humedad del suelo: {data.soilMoisturePercent}%</small>
                </div>
             </div>
          </Card>

          <Card title="Programa de Nutrientes" icon={<BeakerIcon />} className="lg:col-span-2">
            {lastNutrientApplication ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Última Aplicación</span>
                  <span className="font-bold text-xs">{new Date(lastNutrientApplication.id).toLocaleDateString('es-ES')}</span>
                </div>
                <div className="bg-gray-800/60 p-2 rounded-md text-sm space-y-1">
                  <p><span className="font-semibold text-purple-300">Tipo:</span> {lastNutrientApplication.details?.nutrientType}</p>
                  <p><span className="font-semibold text-purple-300">Dosis:</span> {lastNutrientApplication.details?.dosage}</p>
                </div>
                <p className="text-xs text-gray-400 text-center pt-1">Consulte las recomendaciones de la IA para la próxima aplicación.</p>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4 flex flex-col items-center justify-center h-full">
                <p>No se han registrado aplicaciones de nutrientes.</p>
              </div>
            )}
          </Card>

          <Card title="Explorador de Genéticas" icon={<DnaIcon />} className="col-span-1 md:col-span-2 lg:col-span-4">
             <GeneticsFinder />
          </Card>

          <Card title="Títulos Recientes: Revista Cannis" icon={<BookOpenIcon />} className="col-span-1 md:col-span-2 lg:col-span-4">
            <CannisMagazineWidget />
          </Card>

          <Card title="Asistente IA" icon={<BotIcon />} className="col-span-1 md:col-span-2 lg:col-span-4">
            {isLoading && <AiLoader />}
            {error && <div className="flex items-center gap-3 text-red-400 bg-red-900/50 p-3 rounded-lg"><AlertTriangleIcon /> {error}</div>}
            {!isLoading && !error && aiAnalysisResult && (
              <div className="space-y-3">
                {aiAnalysisResult.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-4 p-3 bg-gray-800/50 rounded-lg border-l-2 border-green-500/50">
                    <div className="flex-shrink-0 mt-1">{iconMap[rec.icon] || iconMap.default}</div>
                    <p className="text-sm">{rec.text}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </main>
        
        <section className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <button onClick={() => setModal('log')} className={secondaryButtonClasses}><NotebookIcon className="w-5 h-5"/> Registrar Actividad</button>
            <button onClick={() => setModal('history')} className={secondaryButtonClasses}><HistoryIcon className="w-5 h-5"/> Ver Historial</button>
            <button onClick={exportData} className={secondaryButtonClasses}><DownloadIcon className="w-5 h-5"/> Exportar Datos</button>
            <button onClick={handleAiAnalysis} disabled={isLoading} className={primaryButtonClasses}><SparklesIcon className="w-5 h-5"/> Análisis IA</button>
        </section>
        
        <Modal isOpen={modal === 'log'} onClose={() => setModal('none')} title="Registrar Nueva Actividad">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Tipo de Actividad</label>
                    <select value={newLogType} onChange={e => setNewLogType(e.target.value as ActivityType)} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:outline-none">
                        {Object.values(ActivityType).map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                </div>
                 {newLogType === ActivityType.Nutrients && (
                    <>
                        <div className="animate-fade-in">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Tipo de Nutriente</label>
                            <input type="text" value={newNutrientType} onChange={e => setNewNutrientType(e.target.value)} placeholder="Ej: Cal-Mag, N-P-K (10-5-5)" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:outline-none" />
                        </div>
                        <div className="animate-fade-in">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Dosis</label>
                            <input type="text" value={newNutrientDosage} onChange={e => setNewNutrientDosage(e.target.value)} placeholder="Ej: 2ml/L, 500ppm" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:outline-none" />
                        </div>
                    </>
                )}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Notas</label>
                    <textarea value={newLogNotes} onChange={e => setNewLogNotes(e.target.value)} rows={3} placeholder="Ej: Se aplicaron 2ml de N..." className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:outline-none"></textarea>
                </div>
                <button onClick={handleLogActivity} className="w-full bg-green-600 hover:bg-green-500 font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2"><PlusIcon/> Añadir Registro</button>
            </div>
        </Modal>

        <Modal isOpen={modal === 'history'} onClose={() => setModal('none')} title="Historial de Cultivo">
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {activityLog.length > 0 ? activityLog.map(log => (
                    <div key={log.id} className="bg-gray-800/70 p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-2 font-bold text-green-400">
                                {activityIcons[log.type]}
                                <span>{log.type}</span>
                            </div>
                            <span className="text-xs text-gray-400">{log.date}</span>
                        </div>
                        <p className="text-sm text-gray-300 ml-7">{log.notes}</p>
                        {log.type === ActivityType.Nutrients && log.details && (
                           <div className="mt-2 ml-7 text-xs bg-gray-900/70 p-2 rounded-md border-l-2 border-purple-400 space-y-1">
                               <p><span className="font-semibold text-gray-400">Tipo:</span> {log.details.nutrientType}</p>
                               <p><span className="font-semibold text-gray-400">Dosis:</span> {log.details.dosage}</p>
                           </div>
                        )}
                    </div>
                )) : <p className="text-center text-gray-500 py-8">No hay actividades registradas.</p>}
            </div>
        </Modal>


        <footer className="text-center mt-12 text-xs text-gray-500">
          <p>⚠ Este sistema es exclusivamente para cultivo medicinal/terapéutico legal. Cumplir con todas las regulaciones locales.</p>
          <p className="mt-2"><strong>Cannis LLC © 2024</strong> - Tecnología para Cultivo Responsable</p>
        </footer>
      </div>
    </div>
  );
};

export default App;