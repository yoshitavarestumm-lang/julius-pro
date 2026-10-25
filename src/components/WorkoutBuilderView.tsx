import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  WorkoutSession,
  PrescribedExercise,
  WorkoutSection,
  TrainingGoal,
  SplitType,
  AthleteLevel,
} from '../types';
import { TRAINING_GOALS_MAP } from '../data/constants';
import { exportProgramToCSV, formatWorkoutForWhatsApp } from '../utils/exportUtils';
import {
  Plus,
  Trash2,
  Save,
  Printer,
  FileSpreadsheet,
  Share2,
  Calendar,
  Clock,
  Dumbbell,
  ArrowUp,
  ArrowDown,
  Layers,
  ChevronDown,
  ChevronUp,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface WorkoutBuilderViewProps {
  onOpenExercisePicker: (sessionIndex: number) => void;
  onOpenPrintModal: (program: any) => void;
}

export const WorkoutBuilderView: React.FC<WorkoutBuilderViewProps> = ({
  onOpenExercisePicker,
  onOpenPrintModal,
}) => {
  const {
    workoutDraft,
    setWorkoutDraft,
    activeSessionIndex,
    setActiveSessionIndex,
    clearWorkoutDraft,
    saveProgram,
    athletes,
    selectedAthlete,
    setSelectedAthleteId,
    showToast,
  } = useApp();

  // Clamp active session index within safe bounds
  const safeSessionIndex = Math.min(
    Math.max(0, activeSessionIndex),
    Math.max(0, (workoutDraft.sessions?.length || 1) - 1)
  );

  React.useEffect(() => {
    if (workoutDraft.sessions && workoutDraft.sessions.length > 0) {
      if (activeSessionIndex >= workoutDraft.sessions.length) {
        setActiveSessionIndex(workoutDraft.sessions.length - 1);
      }
    }
  }, [workoutDraft.sessions, activeSessionIndex, setActiveSessionIndex]);

  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

  const currentSession =
    workoutDraft.sessions?.[safeSessionIndex] || workoutDraft.sessions?.[0] || null;

  // Helper to update draft header metadata
  const updateDraftMeta = (field: string, value: any) => {
    setWorkoutDraft((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Add new session to draft
  const handleAddSession = () => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const currentSessionsCount = (workoutDraft.sessions || []).length;
    const nextLetter = letters[currentSessionsCount] || `Sessão ${currentSessionsCount + 1}`;
    const newSession: WorkoutSession = {
      id: `sess-${Date.now()}`,
      title: `Treino ${nextLetter} - Nova Divisão`,
      dayOfWeek: 'Segunda-feira',
      focusGoal: workoutDraft.category,
      estimatedDurationMinutes: 60,
      notes: '',
      exercises: [],
    };

    setWorkoutDraft((prev: any) => ({
      ...prev,
      sessions: [...(prev.sessions || []), newSession],
    }));
    setActiveSessionIndex(currentSessionsCount);
    showToast(`Sessão "${newSession.title}" adicionada.`);
  };

  // Remove session from draft
  const handleRemoveSession = (index: number) => {
    if ((workoutDraft.sessions || []).length <= 1) {
      showToast('O programa precisa de pelo menos uma sessão.', 'error');
      return;
    }
    const filtered = (workoutDraft.sessions || []).filter((_: any, i: number) => i !== index);
    setWorkoutDraft((prev: any) => ({
      ...prev,
      sessions: filtered,
    }));
    setActiveSessionIndex(Math.max(0, index - 1));
  };

  // Update session field
  const updateSession = (field: keyof WorkoutSession, value: any) => {
    setWorkoutDraft((prev: any) => {
      const copy = [...(prev.sessions || [])];
      const targetIdx = Math.min(Math.max(0, safeSessionIndex), copy.length - 1);
      if (!copy[targetIdx]) return prev;
      copy[targetIdx] = {
        ...copy[targetIdx],
        [field]: value,
      };
      return { ...prev, sessions: copy };
    });
  };

  // Update specific prescribed exercise
  const updateExercise = (exerciseId: string, updates: Partial<PrescribedExercise>) => {
    setWorkoutDraft((prev: any) => {
      const copy = [...(prev.sessions || [])];
      const targetIdx = Math.min(Math.max(0, safeSessionIndex), copy.length - 1);
      if (!copy[targetIdx]) return prev;
      const targetSession = { ...copy[targetIdx] };
      targetSession.exercises = (targetSession.exercises || []).map((ex: PrescribedExercise) =>
        ex.id === exerciseId ? { ...ex, ...updates } : ex
      );
      copy[targetIdx] = targetSession;
      return { ...prev, sessions: copy };
    });
  };

  // Move exercise up or down in order
  const moveExercise = (index: number, direction: 'up' | 'down') => {
    if (!currentSession) return;
    const currentExercises = currentSession.exercises || [];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= currentExercises.length) return;

    setWorkoutDraft((prev: any) => {
      const copy = [...(prev.sessions || [])];
      const targetIdxSession = Math.min(Math.max(0, safeSessionIndex), copy.length - 1);
      if (!copy[targetIdxSession]) return prev;
      const session = { ...copy[targetIdxSession] };
      const exCopy = [...(session.exercises || [])];
      const temp = exCopy[index];
      exCopy[index] = exCopy[targetIdx];
      exCopy[targetIdx] = temp;
      session.exercises = exCopy;
      copy[targetIdxSession] = session;
      return { ...prev, sessions: copy };
    });
  };

  // Remove exercise from session
  const removeExercise = (exerciseId: string) => {
    setWorkoutDraft((prev: any) => {
      const copy = [...(prev.sessions || [])];
      const targetIdxSession = Math.min(Math.max(0, safeSessionIndex), copy.length - 1);
      if (!copy[targetIdxSession]) return prev;
      const session = { ...copy[targetIdxSession] };
      session.exercises = (session.exercises || []).filter(
        (ex: PrescribedExercise) => ex.id !== exerciseId
      );
      copy[targetIdxSession] = session;
      return { ...prev, sessions: copy };
    });
  };

  // Save Workout Program to Database (Guaranteed 100% session and exercise preservation)
  const handleSaveProgram = async (asTemplate: boolean = false) => {
    if (!workoutDraft.title.trim()) {
      showToast('Insira um título para o programa.', 'error');
      return;
    }

    const targetAthlete = athletes.find((a) => a.id === workoutDraft.targetAthleteId);

    // If saving as template from an existing athlete program, create a new template doc
    const existingIdToUse = asTemplate
      ? (workoutDraft.isTemplate && workoutDraft.programId ? workoutDraft.programId : undefined)
      : (workoutDraft.programId || undefined);

    const programTitle = asTemplate
      ? (workoutDraft.title.toLowerCase().includes('modelo')
          ? workoutDraft.title
          : `${workoutDraft.title} (Modelo)`)
      : workoutDraft.title;

    await saveProgram(
      {
        title: programTitle,
        description: workoutDraft.description || '',
        athleteId: asTemplate ? undefined : (workoutDraft.targetAthleteId || undefined),
        athleteName: asTemplate ? undefined : (targetAthlete?.name || undefined),
        isTemplate: asTemplate,
        category: workoutDraft.category,
        splitType: workoutDraft.splitType,
        level: workoutDraft.level,
        weeklyFrequency: workoutDraft.weeklyFrequency,
        sessions: workoutDraft.sessions,
      },
      existingIdToUse
    );
  };

  // Copy WhatsApp Formatted Message
  const handleCopyWhatsApp = () => {
    const targetAthlete = athletes.find((a) => a.id === workoutDraft.targetAthleteId);
    const fullProg = {
      ...workoutDraft,
      athleteName: targetAthlete?.name,
    };
    const text = formatWorkoutForWhatsApp(fullProg as any);
    navigator.clipboard.writeText(text);
    setCopiedWhatsApp(true);
    showToast('Ficha de treino copiada para a área de transferência no formato WhatsApp!');
    setTimeout(() => setCopiedWhatsApp(false), 3000);
  };

  // Export CSV/Excel
  const handleExportCSV = () => {
    const targetAthlete = athletes.find((a) => a.id === workoutDraft.targetAthleteId);
    exportProgramToCSV({
      ...workoutDraft,
      athleteName: targetAthlete?.name,
    } as any);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header & Program Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Montador Profissional de Treinos
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Prescrição customizada de séries, repetições, cargas, RPE/RIR, cadência, descanso e metas aeróbicas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          <button
            onClick={() => handleSaveProgram(false)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-emerald-500/10"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Salvar & Atribuir</span>
          </button>

          <button
            onClick={() => handleSaveProgram(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors whitespace-nowrap"
            title="Salva na biblioteca como modelo reutilizável"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Salvar como Modelo</span>
          </button>

          <button
            onClick={() => onOpenPrintModal(workoutDraft)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
            title="Imprimir ou gerar PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Imprimir / PDF</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
            title="Exportar planilha Excel/CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Excel</span>
          </button>

          <button
            onClick={handleCopyWhatsApp}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
              copiedWhatsApp
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
            }`}
            title="Copiar texto pronto para envio no WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedWhatsApp ? 'Copiado!' : 'WhatsApp'}</span>
          </button>
        </div>
      </div>

      {/* Program General Metadata Card */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Título do Programa</label>
            <input
              type="text"
              value={workoutDraft.title}
              onChange={(e) => updateDraftMeta('title', e.target.value)}
              placeholder="Ex: Periodização Hipertrofia ABCD - Foco Peitoral"
              className="w-full px-3.5 py-2 bg-slate-800 text-sm font-bold text-white rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Atribuir ao Atleta</label>
            <select
              value={workoutDraft.targetAthleteId || ''}
              onChange={(e) => {
                const athId = e.target.value;
                updateDraftMeta('targetAthleteId', athId || null);
                if (athId) setSelectedAthleteId(athId);
              }}
              className="w-full px-3.5 py-2 bg-slate-800 text-xs font-medium text-slate-200 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-500"
            >
              <option value="">Sem atleta (Salvar como Modelo Livre)</option>
              {athletes.map((ath) => (
                <option key={ath.id} value={ath.id}>
                  {ath.name} ({ath.level})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Objetivo Macro</label>
            <select
              value={workoutDraft.category}
              onChange={(e) => updateDraftMeta('category', e.target.value as TrainingGoal)}
              className="w-full p-2 bg-slate-800 text-slate-200 rounded-lg border border-slate-700"
            >
              {Object.entries(TRAINING_GOALS_MAP).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Estrutura de Divisão</label>
            <select
              value={workoutDraft.splitType}
              onChange={(e) => updateDraftMeta('splitType', e.target.value as SplitType)}
              className="w-full p-2 bg-slate-800 text-slate-200 rounded-lg border border-slate-700"
            >
              <option value="ABCD">Treino A, B, C, D</option>
              <option value="UpperLower">Membros Superiores / Inferiores (Upper/Lower)</option>
              <option value="PushPullLegs">Empurrar, Puxar, Pernas (PPL)</option>
              <option value="FullBody">Corpo Inteiro (Full Body)</option>
              <option value="Corrida">Periodização de Corrida</option>
              <option value="Hibrido">Treinamento Híbrido (Força + Cardio)</option>
              <option value="Esportivo">Preparação Esportiva Específica</option>
              <option value="Personalizado">Personalizado</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Nível Alvo</label>
            <select
              value={workoutDraft.level}
              onChange={(e) => updateDraftMeta('level', e.target.value as AthleteLevel)}
              className="w-full p-2 bg-slate-800 text-slate-200 rounded-lg border border-slate-700"
            >
              <option value="iniciante">Iniciante</option>
              <option value="intermediario">Intermediário</option>
              <option value="avancado">Avançado</option>
              <option value="atleta">Atleta Competitivo</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Frequência Semanal</label>
            <select
              value={workoutDraft.weeklyFrequency}
              onChange={(e) => updateDraftMeta('weeklyFrequency', Number(e.target.value))}
              className="w-full p-2 bg-slate-800 text-slate-200 rounded-lg border border-slate-700 font-mono"
            >
              <option value={2}>2x por semana</option>
              <option value={3}>3x por semana</option>
              <option value={4}>4x por semana</option>
              <option value={5}>5x por semana</option>
              <option value={6}>6x por semana</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400">
            Descrição Geral & Recomendações do Treinador
          </label>
          <input
            type="text"
            value={workoutDraft.description}
            onChange={(e) => updateDraftMeta('description', e.target.value)}
            placeholder="Orientações globais do mesociclo, cadência respiratória e progressão de sobrecarga..."
            className="w-full px-3 py-1.5 bg-slate-800 text-xs text-slate-300 rounded-lg border border-slate-700 focus:outline-none"
          />
        </div>
      </div>

      {/* Workout Sessions Tabs (Treino A, Treino B, Treino C...) */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {workoutDraft.sessions.map((sess: WorkoutSession, idx: number) => {
            const isActive = idx === safeSessionIndex;
            return (
              <button
                key={sess.id || `sess-${idx}`}
                onClick={() => setActiveSessionIndex(idx)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span>{sess.title.split('-')[0].trim()}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400">
                  {(sess.exercises || []).length}
                </span>
              </button>
            );
          })}

          <button
            onClick={handleAddSession}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Adicionar Sessão</span>
          </button>
        </div>

        {workoutDraft.sessions.length > 1 && (
          <button
            onClick={() => handleRemoveSession(safeSessionIndex)}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
            title="Excluir sessão atual"
          >
            <Trash2 className="w-3 h-3" />
            <span>Excluir {currentSession?.title.split('-')[0].trim()}</span>
          </button>
        )}
      </div>

      {/* Active Session Configuration Bar */}
      {currentSession && (
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Nome da Sessão</label>
              <input
                type="text"
                value={currentSession.title}
                onChange={(e) => updateSession('title', e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-800 text-slate-100 font-bold rounded-lg border border-slate-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Dia Sugerido da Semana</label>
              <select
                value={currentSession.dayOfWeek || 'Segunda-feira'}
                onChange={(e) => updateSession('dayOfWeek', e.target.value)}
                className="w-full p-1.5 bg-slate-800 text-slate-200 rounded-lg border border-slate-700"
              >
                <option value="Segunda-feira">Segunda-feira</option>
                <option value="Terça-feira">Terça-feira</option>
                <option value="Quarta-feira">Quarta-feira</option>
                <option value="Quinta-feira">Quinta-feira</option>
                <option value="Sexta-feira">Sexta-feira</option>
                <option value="Sábado">Sábado</option>
                <option value="Domingo">Domingo</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Duração Estimada</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={currentSession.estimatedDurationMinutes}
                  onChange={(e) => updateSession('estimatedDurationMinutes', Number(e.target.value))}
                  className="w-20 px-2 py-1.5 bg-slate-800 text-slate-100 font-mono rounded-lg border border-slate-700 text-right"
                />
                <span className="text-slate-400">minutos</span>
              </div>
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="text-slate-400 font-medium">Notas Específicas da Sessão</label>
            <input
              type="text"
              value={currentSession.notes}
              onChange={(e) => updateSession('notes', e.target.value)}
              placeholder="Ex: Aquecimento articular no elástico antes de iniciar supino. Atenção ao intervalo de recuperação."
              className="w-full px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg border border-slate-700"
            />
          </div>
        </div>
      )}

      {/* Prescribed Exercises Table in Active Session */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-emerald-400" />
            Exercícios Prescritos na Sessão ({(currentSession?.exercises || []).length})
          </h3>
          <button
            onClick={() => onOpenExercisePicker(safeSessionIndex)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>+ Selecionar do Banco</span>
          </button>
        </div>

        {currentSession && currentSession.exercises.length > 0 ? (
          <div className="space-y-3">
            {currentSession.exercises.map((item: PrescribedExercise, idx: number) => {
              return (
                <div
                  key={item.id}
                  className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3 transition-all"
                >
                  {/* Top Bar of Exercise Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-slate-800 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-white">{item.exerciseName}</h4>
                      {item.groupTag && (
                        <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                          {item.groupTag}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 self-end sm:self-auto">
                      <button
                        onClick={() => moveExercise(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800"
                        title="Subir ordem"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveExercise(idx, 'down')}
                        disabled={idx === currentSession.exercises.length - 1}
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800"
                        title="Descer ordem"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeExercise(item.id)}
                        className="p-1 text-rose-400 hover:text-rose-300 rounded hover:bg-slate-800 ml-1"
                        title="Remover exercício da sessão"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Granular Prescription Parameters Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
                    {/* Seção */}
                    <div>
                      <span className="text-slate-400 font-medium block mb-1">Seção</span>
                      <select
                        value={item.section}
                        onChange={(e) =>
                          updateExercise(item.id, { section: e.target.value as WorkoutSection })
                        }
                        className="w-full p-1.5 bg-slate-800 text-slate-200 rounded-lg border border-slate-700"
                      >
                        <option value="aquecimento">Aquecimento</option>
                        <option value="principal">Principal</option>
                        <option value="volta_a_calma">Volta à Calma</option>
                      </select>
                    </div>

                    {/* Séries */}
                    <div>
                      <span className="text-slate-400 font-medium block mb-1">Séries</span>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={item.sets}
                        onChange={(e) => updateExercise(item.id, { sets: Number(e.target.value) })}
                        className="w-full p-1.5 bg-slate-800 text-white font-mono rounded-lg border border-slate-700 text-center"
                      />
                    </div>

                    {/* Repetições ou Duração */}
                    <div>
                      <span className="text-slate-400 font-medium block mb-1">Reps / Duração</span>
                      <input
                        type="text"
                        value={item.repsOrDuration}
                        onChange={(e) => updateExercise(item.id, { repsOrDuration: e.target.value })}
                        placeholder="Ex: 8-10 ou 45s"
                        className="w-full p-1.5 bg-slate-800 text-slate-200 font-mono rounded-lg border border-slate-700"
                      />
                    </div>

                    {/* Carga / % 1RM */}
                    <div>
                      <span className="text-slate-400 font-medium block mb-1">Carga Prescrita</span>
                      <input
                        type="text"
                        value={item.loadPrescription}
                        onChange={(e) => updateExercise(item.id, { loadPrescription: e.target.value })}
                        placeholder="Ex: 80kg ou 75% 1RM"
                        className="w-full p-1.5 bg-slate-800 text-slate-200 font-mono rounded-lg border border-slate-700"
                      />
                    </div>

                    {/* Intensidade (RIR / RPE) */}
                    <div>
                      <span className="text-slate-400 font-medium block mb-1">Intensidade</span>
                      <input
                        type="text"
                        value={item.intensityValue}
                        onChange={(e) => updateExercise(item.id, { intensityValue: e.target.value })}
                        placeholder="Ex: RIR 1 ou RPE 8"
                        className="w-full p-1.5 bg-slate-800 text-slate-200 font-mono rounded-lg border border-slate-700"
                      />
                    </div>

                    {/* Descanso */}
                    <div>
                      <span className="text-slate-400 font-medium block mb-1">Descanso</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step={15}
                          value={item.restSeconds}
                          onChange={(e) =>
                            updateExercise(item.id, { restSeconds: Number(e.target.value) })
                          }
                          className="w-full p-1.5 bg-slate-800 text-slate-200 font-mono rounded-lg border border-slate-700 text-right"
                        />
                        <span className="text-slate-500 text-[11px]">s</span>
                      </div>
                    </div>
                  </div>

                  {/* Secondary Parameters (Cadência, Pace, Agrupamento e Notas) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 text-xs pt-1">
                    <div>
                      <span className="text-slate-400 font-medium block mb-1">Cadência (Tempo)</span>
                      <input
                        type="text"
                        value={item.tempo}
                        onChange={(e) => updateExercise(item.id, { tempo: e.target.value })}
                        placeholder="Ex: 3-0-1-0"
                        className="w-full p-1.5 bg-slate-800 text-slate-200 font-mono rounded-lg border border-slate-700"
                      />
                    </div>

                    <div>
                      <span className="text-slate-400 font-medium block mb-1">
                        Pace / Zona FC (Cardio)
                      </span>
                      <input
                        type="text"
                        value={item.paceTarget || ''}
                        onChange={(e) => updateExercise(item.id, { paceTarget: e.target.value })}
                        placeholder="Ex: 4:30 min/km ou Zona 4"
                        className="w-full p-1.5 bg-slate-800 text-slate-200 font-mono rounded-lg border border-slate-700"
                      />
                    </div>

                    <div>
                      <span className="text-slate-400 font-medium block mb-1">Agrupamento (Supersérie)</span>
                      <input
                        type="text"
                        value={item.groupTag || ''}
                        onChange={(e) => updateExercise(item.id, { groupTag: e.target.value })}
                        placeholder="Ex: A1, A2 ou Circuito"
                        className="w-full p-1.5 bg-slate-800 text-slate-200 font-mono rounded-lg border border-slate-700"
                      />
                    </div>

                    <div>
                      <span className="text-slate-400 font-medium block mb-1">Substituição Alternativa</span>
                      <input
                        type="text"
                        value={item.alternativeExerciseName || ''}
                        onChange={(e) =>
                          updateExercise(item.id, { alternativeExerciseName: e.target.value })
                        }
                        placeholder="Ex: Supino Halteres se barra ocupada"
                        className="w-full p-1.5 bg-slate-800 text-slate-200 rounded-lg border border-slate-700"
                      />
                    </div>
                  </div>

                  {/* Coach Notes */}
                  <div className="text-xs">
                    <input
                      type="text"
                      value={item.coachNotes || ''}
                      onChange={(e) => updateExercise(item.id, { coachNotes: e.target.value })}
                      placeholder="Dica técnica / comando verbal para o atleta (ex: pés cravados no chão, escápula travada)..."
                      className="w-full px-3 py-1.5 bg-slate-800/80 text-slate-300 italic rounded-lg border border-slate-700 focus:outline-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 border-dashed rounded-2xl space-y-3">
            <Dumbbell className="w-8 h-8 text-slate-600 mx-auto" />
            <h4 className="text-sm font-semibold text-white">Nenhum exercício nesta sessão ainda</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Clique no botão abaixo para abrir a biblioteca e adicionar exercícios para esta sessão.
            </p>
            <button
              onClick={() => onOpenExercisePicker(activeSessionIndex)}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm"
            >
              + Adicionar Exercício do Banco
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
