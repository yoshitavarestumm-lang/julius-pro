import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NavTab } from './Navigation';
import { TrainingGoal, SportModality, MuscleGroup } from '../types';
import { DEFAULT_SPORTS, MUSCLE_GROUPS_MAP } from '../data/constants';
import {
  Flame,
  Zap,
  Layers,
  Trophy,
  Activity,
  Compass,
  ArrowRight,
  CheckCircle2,
  Sliders,
  Calculator,
  Shield,
  Clock,
  Heart,
  Gauge,
} from 'lucide-react';

interface ObjectiveWorkflowsViewProps {
  setActiveTab: (tab: NavTab) => void;
}

export const ObjectiveWorkflowsView: React.FC<ObjectiveWorkflowsViewProps> = ({ setActiveTab }) => {
  const {
    exercises,
    athletes,
    selectedAthlete,
    setWorkoutDraft,
    showToast,
  } = useApp();

  // Lazy State Initialization for Fluxos (Aba Fluxos)
  const [activeWorkflow, setActiveWorkflow] = useState<
    'hipertrofia' | 'corrida' | 'hibrido' | 'esporte' | 'emagrecimento' | 'capacidade'
  >(() => {
    try {
      const salvo = localStorage.getItem('fluxos');
      if (salvo) {
        const parsed = JSON.parse(salvo);
        if (parsed.activeWorkflow) return parsed.activeWorkflow;
      }
    } catch (e) {}
    return 'hipertrofia';
  });

  // Hypertrophy Volume Planner State
  const [hypTargetMuscle, setHypTargetMuscle] = useState<string>(() => {
    try {
      const salvo = localStorage.getItem('fluxos');
      if (salvo) {
        const parsed = JSON.parse(salvo);
        if (parsed.hypTargetMuscle) return parsed.hypTargetMuscle;
      }
    } catch (e) {}
    return 'peitoral';
  });

  const [hypWeeklySets, setHypWeeklySets] = useState<number>(() => {
    try {
      const salvo = localStorage.getItem('fluxos');
      if (salvo) {
        const parsed = JSON.parse(salvo);
        if (typeof parsed.hypWeeklySets === 'number') return parsed.hypWeeklySets;
      }
    } catch (e) {}
    return 16;
  });

  const [hypFrequency, setHypFrequency] = useState<number>(() => {
    try {
      const salvo = localStorage.getItem('fluxos');
      if (salvo) {
        const parsed = JSON.parse(salvo);
        if (typeof parsed.hypFrequency === 'number') return parsed.hypFrequency;
      }
    } catch (e) {}
    return 2;
  });

  // Running Pace & Zones Calculator State
  const [runGoalDistance, setRunGoalDistance] = useState<'5k' | '10k' | '21k'>(() => {
    try {
      const salvo = localStorage.getItem('fluxos');
      if (salvo) {
        const parsed = JSON.parse(salvo);
        if (parsed.runGoalDistance) return parsed.runGoalDistance;
      }
    } catch (e) {}
    return '10k';
  });

  const [targetTimeMinutes, setTargetTimeMinutes] = useState<number>(() => {
    try {
      const salvo = localStorage.getItem('fluxos');
      if (salvo) {
        const parsed = JSON.parse(salvo);
        if (typeof parsed.targetTimeMinutes === 'number') return parsed.targetTimeMinutes;
      }
    } catch (e) {}
    return 45;
  });

  const [maxHeartRate, setMaxHeartRate] = useState<number>(() => {
    try {
      const salvo = localStorage.getItem('fluxos');
      if (salvo) {
        const parsed = JSON.parse(salvo);
        if (typeof parsed.maxHeartRate === 'number') return parsed.maxHeartRate;
      }
    } catch (e) {}
    return 185;
  });

  // Hybrid Matrix State
  const [hybridStrengthPriority, setHybridStrengthPriority] = useState<string>(() => {
    try {
      const salvo = localStorage.getItem('fluxos');
      if (salvo) {
        const parsed = JSON.parse(salvo);
        if (parsed.hybridStrengthPriority) return parsed.hybridStrengthPriority;
      }
    } catch (e) {}
    return 'Agachamento & Supino';
  });

  const [hybridEndurancePriority, setHybridEndurancePriority] = useState<string>(() => {
    try {
      const salvo = localStorage.getItem('fluxos');
      if (salvo) {
        const parsed = JSON.parse(salvo);
        if (parsed.hybridEndurancePriority) return parsed.hybridEndurancePriority;
      }
    } catch (e) {}
    return 'Tiros de 400m & Remo Concept2';
  });

  // Sport Specific State
  const [selectedSportId, setSelectedSportId] = useState<string>(() => {
    try {
      const salvo = localStorage.getItem('fluxos');
      if (salvo) {
        const parsed = JSON.parse(salvo);
        if (parsed.selectedSportId) return parsed.selectedSportId;
      }
    } catch (e) {}
    return 'futebol';
  });

  // Sync fluxos parameters whenever they change
  React.useEffect(() => {
    try {
      const fluxosData = {
        activeWorkflow,
        hypTargetMuscle,
        hypWeeklySets,
        hypFrequency,
        runGoalDistance,
        targetTimeMinutes,
        maxHeartRate,
        hybridStrengthPriority,
        hybridEndurancePriority,
        selectedSportId,
      };
      localStorage.setItem('fluxos', JSON.stringify(fluxosData));
    } catch (e) {}
  }, [
    activeWorkflow,
    hypTargetMuscle,
    hypWeeklySets,
    hypFrequency,
    runGoalDistance,
    targetTimeMinutes,
    maxHeartRate,
    hybridStrengthPriority,
    hybridEndurancePriority,
    selectedSportId,
  ]);

  // Load Guided Template into Builder
  const handleApplyWorkflowToBuilder = (workflowKey: string) => {
    switch (workflowKey) {
      case 'hipertrofia': {
        const chestExercises = exercises.filter((e) => e.primaryMuscles.includes('peitoral'));
        setWorkoutDraft({
          targetAthleteId: selectedAthlete?.id || null,
          programId: null,
          title: `Hipertrofia Especializada: ${MUSCLE_GROUPS_MAP[hypTargetMuscle as MuscleGroup] || 'Peitoral'} (${hypWeeklySets} séries/sem)`,
          description: `Planejamento de sobrecarga progressiva com ${hypWeeklySets} séries semanais divididas em ${hypFrequency} sessões com RIR 1-2.`,
          splitType: 'UpperLower',
          category: 'hipertrofia',
          level: selectedAthlete?.level || 'avancado',
          weeklyFrequency: 4,
          isTemplate: false,
          sessions: [
            {
              id: `sess-hyp-1`,
              title: `Treino 1 - Foco Pesado ${MUSCLE_GROUPS_MAP[hypTargetMuscle as MuscleGroup] || 'Peitoral'}`,
              dayOfWeek: 'Segunda-feira',
              focusGoal: 'hipertrofia',
              estimatedDurationMinutes: 65,
              notes: 'Foco em tensão mecânica e sobrecarga progressiva.',
              exercises: chestExercises.slice(0, 4).map((ex, i) => ({
                id: `pe-hyp-${i}`,
                exerciseId: ex.id,
                exerciseName: ex.name,
                section: 'principal',
                grouping: 'individual',
                sets: Math.ceil(hypWeeklySets / (hypFrequency * 2)),
                repsOrDuration: '8 a 10 reps',
                loadPrescription: '75-80% 1RM',
                intensityMethod: 'rir',
                intensityValue: 'RIR 1-2',
                restSeconds: 90,
                tempo: '3-0-1-0',
                coachNotes: ex.coachCues?.[0] || 'Execução estrita.',
              })),
            },
          ],
        });
        setActiveTab('montar_treino');
        showToast('Fluxo de Hipertrofia transferido para o Montador de Treino para revisão do treinador.');
        break;
      }

      case 'corrida': {
        const pacePerKm = (targetTimeMinutes / (runGoalDistance === '5k' ? 5 : runGoalDistance === '10k' ? 10 : 21.1)).toFixed(2);
        const [mins, secsDec] = pacePerKm.split('.');
        const secs = Math.round(Number('0.' + secsDec) * 60).toString().padStart(2, '0');
        const formattedPace = `${mins}:${secs} min/km`;

        setWorkoutDraft({
          targetAthleteId: selectedAthlete?.id || null,
          programId: null,
          title: `Periodização de Corrida: ${runGoalDistance.toUpperCase()} Sub-${targetTimeMinutes}min`,
          description: `Alvo de Pace de prova: ${formattedPace}. Sessões intervaladas de VO2máx e treino contínuo no limiar.`,
          splitType: 'Corrida',
          category: 'corrida_resistencia',
          level: selectedAthlete?.level || 'avancado',
          weeklyFrequency: 3,
          isTemplate: false,
          sessions: [
            {
              id: `sess-run-flow-1`,
              title: 'Sessão 1 - Tiros de Pista (VO2máx Intervalado)',
              dayOfWeek: 'Terça-feira',
              focusGoal: 'corrida_resistencia',
              estimatedDurationMinutes: 50,
              notes: 'Aquecimento 10 min Z2 + educativos de passada.',
              exercises: [
                {
                  id: 'pe-rf-1',
                  exerciseId: 'ex-tiros-intervalados-corrida',
                  exerciseName: 'Tiros Intervalados de Alta Intensidade (HIIT 400m)',
                  section: 'principal',
                  sets: 8,
                  repsOrDuration: '400m',
                  loadPrescription: `Pace Alvo: ${formattedPace}`,
                  intensityMethod: 'pace',
                  intensityValue: `Pace ${formattedPace} (Zona 5)`,
                  restSeconds: 90,
                  tempo: 'Cadência 180 spm',
                  distanceMeters: 400,
                  paceTarget: formattedPace,
                  heartRateZone: 'Zona 5',
                },
              ],
            },
            {
              id: 'sess-run-flow-2',
              title: 'Sessão 2 - Tempo Run Sustentado (Limiar de Lactato)',
              dayOfWeek: 'Quinta-feira',
              focusGoal: 'corrida_resistencia',
              estimatedDurationMinutes: 45,
              notes: 'Ritmo confortável e forte mantendo a técnica.',
              exercises: [
                {
                  id: 'pe-rf-2',
                  exerciseId: 'ex-corrida-ritmo-tempo-run',
                  exerciseName: 'Corrida Contínua de Ritmo (Tempo Run / Limiar)',
                  section: 'principal',
                  sets: 1,
                  repsOrDuration: '30 minutos',
                  loadPrescription: 'Pace de Limiar',
                  intensityMethod: 'zona_fc',
                  intensityValue: 'Zona 4 (85-88% FC Máx)',
                  restSeconds: 0,
                  tempo: 'Constante',
                  heartRateZone: 'Zona 4',
                },
              ],
            },
          ],
        });
        setActiveTab('montar_treino');
        showToast('Fluxo de Corrida transferido com zonas calculadas!');
        break;
      }

      case 'hibrido': {
        setWorkoutDraft({
          targetAthleteId: selectedAthlete?.id || null,
          programId: null,
          title: 'Programa Híbrido: Força Máxima & Capacidade Cardiorrespiratória',
          description: 'Mitigação do efeito de interferência via separação de estímulos neuromusculares e cardiovasculares.',
          splitType: 'Hibrido',
          category: 'atleta_hibrido',
          level: 'atleta',
          weeklyFrequency: 5,
          isTemplate: false,
          sessions: [
            {
              id: 'sess-hib-1',
              title: 'Treino A - Força Máxima & Transporte de Cargas',
              dayOfWeek: 'Segunda-feira',
              focusGoal: 'forca_maxima',
              estimatedDurationMinutes: 75,
              notes: 'Manter velocidade concêntrica alta nos levantamentos principais.',
              exercises: [
                {
                  id: 'hpe-1',
                  exerciseId: 'ex-agachamento-livre-barra',
                  exerciseName: 'Agachamento Livre com Barra (Back Squat)',
                  section: 'principal',
                  sets: 4,
                  repsOrDuration: '5 reps',
                  loadPrescription: '85% 1RM',
                  intensityMethod: 'pct_1rm',
                  intensityValue: '85% 1RM (RIR 1-2)',
                  restSeconds: 150,
                  tempo: '3-0-1-0',
                },
                {
                  id: 'hpe-2',
                  exerciseId: 'ex-farmer-walk-caminhada-fazendeiro',
                  exerciseName: 'Caminhada do Fazendeiro (Farmer\'s Walk)',
                  section: 'principal',
                  sets: 4,
                  repsOrDuration: '40 metros',
                  loadPrescription: 'Carga pesada',
                  intensityMethod: 'rpe',
                  intensityValue: 'RPE 9',
                  restSeconds: 90,
                  tempo: 'Passo firme',
                },
              ],
            },
            {
              id: 'sess-hib-2',
              title: 'Treino B - Capacidade Aeróbica & Sled',
              dayOfWeek: 'Quarta-feira',
              focusGoal: 'atleta_hibrido',
              estimatedDurationMinutes: 65,
              notes: 'Intervalos aeróbicos sem sobrecarga excêntrica dolorosa.',
              exercises: [
                {
                  id: 'hpe-3',
                  exerciseId: 'ex-remo-ergometrico-concept2',
                  exerciseName: 'Remo Ergométrico (Concept2 Rower)',
                  section: 'principal',
                  sets: 5,
                  repsOrDuration: '500m',
                  loadPrescription: 'Pace: 1:40 /500m',
                  intensityMethod: 'pace',
                  intensityValue: 'Pace 1:40 /500m',
                  restSeconds: 90,
                  tempo: '26 SPM',
                },
                {
                  id: 'hpe-4',
                  exerciseId: 'ex-sled-push-treno',
                  exerciseName: 'Empurrão de Trenó Pesado (Sled Push)',
                  section: 'principal',
                  sets: 4,
                  repsOrDuration: '25 metros',
                  loadPrescription: '100 kg',
                  intensityMethod: 'rpe',
                  intensityValue: 'RPE 9',
                  restSeconds: 90,
                  tempo: 'Aceleração contínua',
                },
              ],
            },
          ],
        });
        setActiveTab('montar_treino');
        showToast('Fluxo Híbrido transferido para o Montador de Treino!');
        break;
      }

      case 'esporte': {
        const sportObj = DEFAULT_SPORTS.find((s) => s.id === selectedSportId) || DEFAULT_SPORTS[1];
        setWorkoutDraft({
          targetAthleteId: selectedAthlete?.id || null,
          programId: null,
          title: `Preparação Física Específica: ${sportObj.name}`,
          description: `Demandas físicas priorizadas: ${sportObj.keyDemands.join(', ')}. Foco em transferência para competição.`,
          splitType: 'Esportivo',
          category: 'desempenho_esportivo',
          level: 'atleta',
          weeklyFrequency: 3,
          isTemplate: false,
          sessions: [
            {
              id: 'sess-esp-1',
              title: `Sessão 1 - Potência, Agilidade & Arrancada (${sportObj.name.split('(')[0].trim()})`,
              dayOfWeek: 'Segunda-feira',
              focusGoal: 'desempenho_esportivo',
              estimatedDurationMinutes: 60,
              notes: 'Realizar descansado antes dos treinos táticos da modalidade.',
              exercises: [
                {
                  id: 'spe-1',
                  exerciseId: 'ex-salto-vertical-cmj',
                  exerciseName: 'Salto Vertical com Contramovimento (CMJ)',
                  section: 'principal',
                  sets: 4,
                  repsOrDuration: '4 saltos com esforço máximo',
                  loadPrescription: 'Peso corporal',
                  intensityMethod: 'rpe',
                  intensityValue: '100% de esforço',
                  restSeconds: 90,
                  tempo: 'Explosivo',
                },
                {
                  id: 'spe-2',
                  exerciseId: 'ex-tiros-agilidade-pro-agility',
                  exerciseName: 'Teste & Treino de Agilidade 5-10-5 (Pro-Agility Shuttle)',
                  section: 'principal',
                  sets: 4,
                  repsOrDuration: '1 corrida completa',
                  loadPrescription: 'Peso corporal',
                  intensityMethod: 'rpe',
                  intensityValue: 'Velocidade máxima',
                  restSeconds: 90,
                  tempo: 'Máxima velocidade',
                },
              ],
            },
          ],
        });
        setActiveTab('montar_treino');
        showToast(`Fluxo Esportivo (${sportObj.name.split('(')[0].trim()}) transferido para o Montador!`);
        break;
      }

      default:
        setActiveTab('montar_treino');
        break;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Fluxos Especializados por Objetivo
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Ferramentas científicas dedicadas para Hipertrofia, Corrida, Atleta Híbrido, Desempenho Esportivo e Emagrecimento.
        </p>
      </div>

      {/* Workflow Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800">
        <button
          onClick={() => setActiveWorkflow('hipertrofia')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
            activeWorkflow === 'hipertrofia'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Hipertrofia Muscular</span>
        </button>

        <button
          onClick={() => setActiveWorkflow('corrida')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
            activeWorkflow === 'corrida'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Desempenho na Corrida</span>
        </button>

        <button
          onClick={() => setActiveWorkflow('hibrido')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
            activeWorkflow === 'hibrido'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Atleta Híbrido (Hyrox/Cross)</span>
        </button>

        <button
          onClick={() => setActiveWorkflow('esporte')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
            activeWorkflow === 'esporte'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Desempenho Esportivo</span>
        </button>
      </div>

      {/* 1. Hypertrophy Workflow Content */}
      {activeWorkflow === 'hipertrofia' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-emerald-400" />
                Planejador Científico de Volume de Hipertrofia
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                A literatura científica recomenda entre 10 e 20 séries semanais por grupo muscular próximo à falha concêntrica (RIR 1-2) para maximizar a síntese proteica miofibrilar.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Grupo Muscular Alvo</label>
                <select
                  value={hypTargetMuscle}
                  onChange={(e) => setHypTargetMuscle(e.target.value)}
                  className="w-full p-2 bg-slate-800 text-slate-100 rounded-lg border border-slate-700"
                >
                  {Object.entries(MUSCLE_GROUPS_MAP).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Volume Semanal Alvo</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={10}
                    max={24}
                    value={hypWeeklySets}
                    onChange={(e) => setHypWeeklySets(Number(e.target.value))}
                    className="w-full accent-emerald-400"
                  />
                  <span className="font-mono text-emerald-400 font-bold w-12 text-right">
                    {hypWeeklySets} sets
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Frequência Semanal</label>
                <select
                  value={hypFrequency}
                  onChange={(e) => setHypFrequency(Number(e.target.value))}
                  className="w-full p-2 bg-slate-800 text-slate-100 rounded-lg border border-slate-700 font-mono"
                >
                  <option value={2}>2x na semana ({Math.round(hypWeeklySets / 2)} séries/sessão)</option>
                  <option value={3}>3x na semana ({Math.round(hypWeeklySets / 3)} séries/sessão)</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-slate-200">Recomendações de Prescrição:</span>
              <ul className="text-slate-400 space-y-1 list-disc list-inside">
                <li>
                  <strong className="text-slate-300">Faixa de Repetições:</strong> 6 a 12 reps para exercícios multiarticulares pesados e 10 a 15 reps para isoladores com cabos/máquinas.
                </li>
                <li>
                  <strong className="text-slate-300">Intensidade do Esforço:</strong> RIR 1-2 (deixando 1 a 2 repetições na reserva antes da falha técnica mecânica).
                </li>
                <li>
                  <strong className="text-slate-300">Descanso entre Séries:</strong> 90s a 150s em compostos pesados; 60s a 75s em exercícios unijoint.
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleApplyWorkflowToBuilder('hipertrofia')}
              className="w-full py-2.5 px-4 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Gerar e Transferir Treino de Hipertrofia para o Montador</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Distribuição Semanal Recomendada</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                <span className="font-bold text-emerald-400">Sessão 1 (Ex: Segunda):</span>
                <p className="text-slate-300 mt-1">
                  Exercícios multiarticulares pesados (Supino Reto Barra + Supino Inclinado Halteres).
                </p>
                <span className="font-mono text-slate-400 mt-1 block">
                  Volume: {Math.ceil(hypWeeklySets / 2)} séries de trabalho
                </span>
              </div>

              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                <span className="font-bold text-sky-400">Sessão 2 (Ex: Quinta):</span>
                <p className="text-slate-300 mt-1">
                  Tensão mecânica contínua e estiramento (Crucifixo Crossover + Máquina Articulada).
                </p>
                <span className="font-mono text-slate-400 mt-1 block">
                  Volume: {Math.floor(hypWeeklySets / 2)} séries de trabalho
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Running Performance Workflow Content */}
      {activeWorkflow === 'corrida' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-sky-400" />
                Prescrição de Desempenho na Corrida & Zonas de Treinamento
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Calcule o ritmo (pace), zonas de frequência cardíaca e estrutura de sessões (Tiros de VO2máx, Tempo Run de Limiar e Longão Aeróbico Z2).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Distância Alvo</label>
                <select
                  value={runGoalDistance}
                  onChange={(e) => setRunGoalDistance(e.target.value as any)}
                  className="w-full p-2 bg-slate-800 text-slate-100 rounded-lg border border-slate-700"
                >
                  <option value="5k">5 km</option>
                  <option value="10k">10 km</option>
                  <option value="21k">21.1 km (Meia Maratona)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Tempo Meta (minutos)</label>
                <input
                  type="number"
                  value={targetTimeMinutes}
                  onChange={(e) => setTargetTimeMinutes(Number(e.target.value))}
                  className="w-full p-2 bg-slate-800 text-white font-mono rounded-lg border border-slate-700"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">FC Máxima (bpm)</label>
                <input
                  type="number"
                  value={maxHeartRate}
                  onChange={(e) => setMaxHeartRate(Number(e.target.value))}
                  className="w-full p-2 bg-slate-800 text-white font-mono rounded-lg border border-slate-700"
                />
              </div>
            </div>

            {/* Calculated Running Zones */}
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-white block">Zonas Fisiológicas de Intensidade:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-emerald-400 font-bold">Zona 2 (Aeróbio / Longão):</span>
                  <div className="text-slate-300">
                    {Math.round(maxHeartRate * 0.65)} - {Math.round(maxHeartRate * 0.75)} bpm
                  </div>
                </div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-sky-400 font-bold">Zona 4 (Limiar de Lactato):</span>
                  <div className="text-slate-300">
                    {Math.round(maxHeartRate * 0.85)} - {Math.round(maxHeartRate * 0.90)} bpm
                  </div>
                </div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-amber-400 font-bold">Zona 5 (Tiros de VO2máx):</span>
                  <div className="text-slate-300">
                    {Math.round(maxHeartRate * 0.92)} - {maxHeartRate} bpm
                  </div>
                </div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-purple-400 font-bold">Pace Médio Alvo:</span>
                  <div className="text-slate-200 font-bold">
                    {(targetTimeMinutes / (runGoalDistance === '5k' ? 5 : runGoalDistance === '10k' ? 10 : 21.1)).toFixed(2)} min/km
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleApplyWorkflowToBuilder('corrida')}
              className="w-full py-2.5 px-4 text-xs font-bold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <span>Gerar e Transferir Treino de Corrida para o Montador</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Sessões Estruturadas da Semana</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                <span className="font-bold text-amber-400">Terça: Tiros de VO2máx (8x 400m)</span>
                <p className="text-slate-300 mt-1">
                  Pace forte em Zona 5 com 90 segundos de trote leve de recuperação.
                </p>
              </div>
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                <span className="font-bold text-sky-400">Quinta: Tempo Run (30 min)</span>
                <p className="text-slate-300 mt-1">
                  Ritmo sustentado em Zona 4 (limiar anaeróbico) para aumentar a remoção de lactato.
                </p>
              </div>
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                <span className="font-bold text-emerald-400">Sábado: Força Específica</span>
                <p className="text-slate-300 mt-1">
                  RDL, Agachamento Búlgaro e Panturrilhas para blindagem contra canelite e joelho do corredor.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Hybrid Athlete Workflow Content */}
      {activeWorkflow === 'hibrido' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" />
                Matriz de Treinamento Concorrente para Atletas Híbridos
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Organização semanal inteligente de força pesada e resistência cardiovascular sem comprometer a recuperação neuromuscular.
              </p>
            </div>

            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl space-y-2 text-xs">
              <span className="font-bold text-purple-300">Regra de Ouro do Treino Concorrente:</span>
              <p className="text-slate-300 leading-relaxed">
                Separe sessões pesadas de membros inferiores (Agachamento / Levantamento Terra) dos treinos intervalados de corrida em pelo menos 6 a 8 horas, ou em dias alternados. Utilize exercícios concêntricos (Sled Push / Remo Ergométrico) para alta demanda cardiovascular com baixo dano muscular excêntrico.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                <span className="font-bold text-white block mb-1">Pilares de Força Pura:</span>
                <span className="text-slate-300">Agachamento Livre 85% + Supino + Farmer's Walk</span>
              </div>
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                <span className="font-bold text-white block mb-1">Pilares de Endurance HYROX:</span>
                <span className="text-slate-300">Empurrão de Trenó + Remo Concept2 + Tiros 400m</span>
              </div>
            </div>

            <button
              onClick={() => handleApplyWorkflowToBuilder('hibrido')}
              className="w-full py-2.5 px-4 text-xs font-bold text-slate-950 bg-purple-400 hover:bg-purple-300 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <span>Gerar e Transferir Treino Híbrido para o Montador</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Cronograma Semanal Anti-Fadiga</h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 bg-slate-800/60 rounded border border-slate-700">
                <span className="text-emerald-400 font-bold">SEG:</span> Força Pesada (Lower 85%) + Farmer's Walk
              </div>
              <div className="p-2.5 bg-slate-800/60 rounded border border-slate-700">
                <span className="text-sky-400 font-bold">TER:</span> Corrida Aeróbica Contínua Z2 (45 min)
              </div>
              <div className="p-2.5 bg-slate-800/60 rounded border border-slate-700">
                <span className="text-purple-400 font-bold">QUA:</span> Simulação HYROX (Remo 500m + Trenó)
              </div>
              <div className="p-2.5 bg-slate-800/60 rounded border border-slate-700">
                <span className="text-emerald-400 font-bold">QUI:</span> Força Upper (Supino + Barra Fixa)
              </div>
              <div className="p-2.5 bg-slate-800/60 rounded border border-slate-700">
                <span className="text-amber-400 font-bold">SEX:</span> Tiros de Velocidade ou Recuperação Ativa
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Sports Performance Workflow Content */}
      {activeWorkflow === 'esporte' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                Preparação Física Específica por Modalidade Esportiva
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Mapeamento das demandas fisiológicas, padrões de movimento prioritários e sistemas bioenergéticos de cada esporte.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <label className="text-slate-400 font-medium">Selecione a Modalidade Esportiva</label>
              <select
                value={selectedSportId}
                onChange={(e) => setSelectedSportId(e.target.value)}
                className="w-full p-2.5 bg-slate-800 text-sm font-bold text-white rounded-lg border border-slate-700"
              >
                {DEFAULT_SPORTS.map((sp) => (
                  <option key={sp.id} value={sp.id}>
                    {sp.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Sport Detailed Profile */}
            {(() => {
              const sp = DEFAULT_SPORTS.find((s) => s.id === selectedSportId) || DEFAULT_SPORTS[1];
              return (
                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-800 space-y-3 text-xs">
                  <div>
                    <span className="font-bold text-emerald-400 uppercase tracking-wider block">
                      Perfil da Modalidade: {sp.name}
                    </span>
                    <p className="text-slate-300 mt-1 leading-relaxed">{sp.description}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                    <div>
                      <span className="text-slate-400 font-semibold block mb-1">
                        Capacidades Físicas Decisivas:
                      </span>
                      <ul className="text-slate-200 list-disc list-inside space-y-0.5">
                        {sp.keyDemands.map((kd, i) => (
                          <li key={i}>{kd.replace('_', ' ').toUpperCase()}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block mb-1">
                        Sistemas Bioenergéticos:
                      </span>
                      <ul className="text-slate-200 list-disc list-inside space-y-0.5">
                        {sp.energySystems.map((es, i) => (
                          <li key={i}>{es}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })()}

            <button
              onClick={() => handleApplyWorkflowToBuilder('esporte')}
              className="w-full py-2.5 px-4 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <span>Gerar e Transferir Treino Específico para o Montador</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Exercícios de Transferência Direta</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                <span className="font-bold text-amber-400">Salto Vertical com Contramovimento (CMJ)</span>
                <p className="text-slate-300 mt-1">
                  Taxa de desenvolvimento de força (RFD) para disputa aérea e cabeceio.
                </p>
              </div>
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                <span className="font-bold text-amber-400">Agilidade 5-10-5 (Pro-Agility Shuttle)</span>
                <p className="text-slate-300 mt-1">
                  Capacidade de desacelerar e acelerar em novos ângulos nos primeiros metros.
                </p>
              </div>
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                <span className="font-bold text-amber-400">Sled Push (Arrancada de 15m)</span>
                <p className="text-slate-300 mt-1">
                  Sobrecarga de potência na aceleração horizontal com o mesmo ângulo do gramado.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
