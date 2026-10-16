import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Exercise,
  TrainingGoal,
  MuscleGroup,
  MovementPattern,
  PhysicalCapacity,
  EquipmentType,
} from '../types';
import {
  TRAINING_GOALS_MAP,
  MUSCLE_GROUPS_MAP,
  MOVEMENT_PATTERNS_MAP,
  PHYSICAL_CAPACITIES_MAP,
  EQUIPMENT_MAP,
  DEFAULT_SPORTS,
} from '../data/constants';
import {
  Search,
  Filter,
  Plus,
  PlusCircle,
  Eye,
  FileEdit,
  Trash2,
  Dumbbell,
  Check,
  ChevronRight,
  ShieldAlert,
  Flame,
  Zap,
  Tag,
  BookOpen,
  ArrowUpRight,
  X,
} from 'lucide-react';

interface ExerciseDatabaseViewProps {
  onPrescribeExercise?: (exercise: Exercise) => void;
  onOpenNewExerciseModal: () => void;
  onEditExercise: (exercise: Exercise) => void;
}

export const ExerciseDatabaseView: React.FC<ExerciseDatabaseViewProps> = ({
  onOpenNewExerciseModal,
  onEditExercise,
}) => {
  const { exercises, addExerciseToDraft, deleteExercise } = useApp();

  // Navigation axis filter tab with Lazy State Initialization
  const [activeAxis, setActiveAxis] = useState<
    'all' | 'goal' | 'muscle' | 'pattern' | 'capacity' | 'equipment' | 'sport'
  >(() => {
    try {
      return (localStorage.getItem('exercicios_activeAxis') as any) || 'all';
    } catch (e) {
      return 'all';
    }
  });

  // Filter States with Lazy State Initialization
  const [searchQuery, setSearchQuery] = useState(() => {
    try {
      return localStorage.getItem('exercicios_searchQuery') || '';
    } catch (e) {
      return '';
    }
  });
  const [selectedGoal, setSelectedGoal] = useState<string>(() => {
    try {
      return localStorage.getItem('exercicios_selectedGoal') || 'all';
    } catch (e) {
      return 'all';
    }
  });
  const [selectedMuscle, setSelectedMuscle] = useState<string>(() => {
    try {
      return localStorage.getItem('exercicios_selectedMuscle') || 'all';
    } catch (e) {
      return 'all';
    }
  });
  const [selectedPattern, setSelectedPattern] = useState<string>(() => {
    try {
      return localStorage.getItem('exercicios_selectedPattern') || 'all';
    } catch (e) {
      return 'all';
    }
  });
  const [selectedCapacity, setSelectedCapacity] = useState<string>(() => {
    try {
      return localStorage.getItem('exercicios_selectedCapacity') || 'all';
    } catch (e) {
      return 'all';
    }
  });
  const [selectedEquipment, setSelectedEquipment] = useState<string>(() => {
    try {
      return localStorage.getItem('exercicios_selectedEquipment') || 'all';
    } catch (e) {
      return 'all';
    }
  });
  const [selectedSport, setSelectedSport] = useState<string>(() => {
    try {
      return localStorage.getItem('exercicios_selectedSport') || 'all';
    } catch (e) {
      return 'all';
    }
  });
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(() => {
    try {
      return localStorage.getItem('exercicios_selectedDifficulty') || 'all';
    } catch (e) {
      return 'all';
    }
  });

  React.useEffect(() => {
    try {
      localStorage.setItem('exercicios_activeAxis', activeAxis);
      localStorage.setItem('exercicios_searchQuery', searchQuery);
      localStorage.setItem('exercicios_selectedGoal', selectedGoal);
      localStorage.setItem('exercicios_selectedMuscle', selectedMuscle);
      localStorage.setItem('exercicios_selectedPattern', selectedPattern);
      localStorage.setItem('exercicios_selectedCapacity', selectedCapacity);
      localStorage.setItem('exercicios_selectedEquipment', selectedEquipment);
      localStorage.setItem('exercicios_selectedSport', selectedSport);
      localStorage.setItem('exercicios_selectedDifficulty', selectedDifficulty);
    } catch (e) {}
  }, [
    activeAxis,
    searchQuery,
    selectedGoal,
    selectedMuscle,
    selectedPattern,
    selectedCapacity,
    selectedEquipment,
    selectedSport,
    selectedDifficulty,
  ]);

  // Exercise Detail Modal state
  const [inspectExercise, setInspectExercise] = useState<Exercise | null>(null);

  // Active Filters Reset
  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedGoal('all');
    setSelectedMuscle('all');
    setSelectedPattern('all');
    setSelectedCapacity('all');
    setSelectedEquipment('all');
    setSelectedSport('all');
    setSelectedDifficulty('all');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedGoal !== 'all' ||
    selectedMuscle !== 'all' ||
    selectedPattern !== 'all' ||
    selectedCapacity !== 'all' ||
    selectedEquipment !== 'all' ||
    selectedSport !== 'all' ||
    selectedDifficulty !== 'all';

  // Multi-variable search and filter evaluation
  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      // Free text search
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = ex.name.toLowerCase().includes(q);
        const matchesAlt = ex.alternativeNames.some((alt) => alt.toLowerCase().includes(q));
        const matchesTags = ex.tags.some((t) => t.toLowerCase().includes(q));
        const matchesCues = ex.coachCues.some((c) => c.toLowerCase().includes(q));
        if (!matchesName && !matchesAlt && !matchesTags && !matchesCues) return false;
      }

      // Goal filter (checks both primary and secondary)
      if (selectedGoal !== 'all') {
        const matchesPrimary = ex.primaryGoals.includes(selectedGoal as TrainingGoal);
        const matchesSecondary = ex.secondaryGoals.includes(selectedGoal as TrainingGoal);
        if (!matchesPrimary && !matchesSecondary) return false;
      }

      // Muscle group filter (primary or secondary)
      if (selectedMuscle !== 'all') {
        const matchesPrimary = ex.primaryMuscles.includes(selectedMuscle as MuscleGroup);
        const matchesSecondary = ex.secondaryMuscles.includes(selectedMuscle as MuscleGroup);
        if (!matchesPrimary && !matchesSecondary) return false;
      }

      // Movement pattern filter
      if (selectedPattern !== 'all' && ex.movementPattern !== selectedPattern) {
        return false;
      }

      // Physical capacity filter
      if (
        selectedCapacity !== 'all' &&
        !ex.physicalCapacities.includes(selectedCapacity as PhysicalCapacity)
      ) {
        return false;
      }

      // Equipment filter
      if (
        selectedEquipment !== 'all' &&
        !ex.equipment.includes(selectedEquipment as EquipmentType)
      ) {
        return false;
      }

      // Sport application filter
      if (selectedSport !== 'all') {
        const targetSport = DEFAULT_SPORTS.find((s) => s.id === selectedSport);
        const matchesSportTag = ex.sportsApplications.some(
          (sp) => sp.toLowerCase().includes(selectedSport.toLowerCase()) ||
                  (targetSport && sp.toLowerCase().includes(targetSport.name.toLowerCase().slice(0, 5)))
        );
        if (!matchesSportTag) return false;
      }

      // Difficulty
      if (selectedDifficulty !== 'all' && ex.difficulty !== selectedDifficulty) {
        return false;
      }

      return true;
    });
  }, [
    exercises,
    searchQuery,
    selectedGoal,
    selectedMuscle,
    selectedPattern,
    selectedCapacity,
    selectedEquipment,
    selectedSport,
    selectedDifficulty,
  ]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Banco Inteligente de Exercícios
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Biblioteca científica com classificação multivariável, comandos do treinador e parâmetros de prescrição.
          </p>
        </div>
        <button
          onClick={onOpenNewExerciseModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto shadow-sm shadow-emerald-500/10"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Cadastrar Novo Exercício</span>
        </button>
      </div>

      {/* Axis Navigation Tabs (Section 4 of user request) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800">
        <button
          onClick={() => {
            setActiveAxis('all');
            clearAllFilters();
          }}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
            activeAxis === 'all'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Todos os Exercícios
        </button>
        <button
          onClick={() => setActiveAxis('goal')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
            activeAxis === 'goal'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Por Objetivo
        </button>
        <button
          onClick={() => setActiveAxis('muscle')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
            activeAxis === 'muscle'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Por Grupo Muscular
        </button>
        <button
          onClick={() => setActiveAxis('pattern')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
            activeAxis === 'pattern'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Por Padrão de Movimento
        </button>
        <button
          onClick={() => setActiveAxis('capacity')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
            activeAxis === 'capacity'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Por Capacidade Física
        </button>
        <button
          onClick={() => setActiveAxis('equipment')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
            activeAxis === 'equipment'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Por Equipamento
        </button>
        <button
          onClick={() => setActiveAxis('sport')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
            activeAxis === 'sport'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Por Modalidade Esportiva
        </button>
      </div>

      {/* Quick Category Chips according to selected axis */}
      {activeAxis === 'muscle' && (
        <div className="flex flex-wrap gap-1.5 p-3 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setSelectedMuscle('all')}
            className={`px-2.5 py-1 text-xs rounded-md ${
              selectedMuscle === 'all'
                ? 'bg-emerald-400 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Todos Músculos
          </button>
          {Object.entries(MUSCLE_GROUPS_MAP).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedMuscle(key)}
              className={`px-2.5 py-1 text-xs rounded-md ${
                selectedMuscle === key
                  ? 'bg-emerald-400 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {activeAxis === 'goal' && (
        <div className="flex flex-wrap gap-1.5 p-3 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setSelectedGoal('all')}
            className={`px-2.5 py-1 text-xs rounded-md ${
              selectedGoal === 'all'
                ? 'bg-emerald-400 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Todos Objetivos
          </button>
          {Object.entries(TRAINING_GOALS_MAP).map(([key, item]) => (
            <button
              key={key}
              onClick={() => setSelectedGoal(key)}
              className={`px-2.5 py-1 text-xs rounded-md ${
                selectedGoal === key
                  ? 'bg-emerald-400 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {activeAxis === 'pattern' && (
        <div className="flex flex-wrap gap-1.5 p-3 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setSelectedPattern('all')}
            className={`px-2.5 py-1 text-xs rounded-md ${
              selectedPattern === 'all'
                ? 'bg-emerald-400 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Todos Padrões
          </button>
          {Object.entries(MOVEMENT_PATTERNS_MAP).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedPattern(key)}
              className={`px-2.5 py-1 text-xs rounded-md ${
                selectedPattern === key
                  ? 'bg-emerald-400 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {activeAxis === 'capacity' && (
        <div className="flex flex-wrap gap-1.5 p-3 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setSelectedCapacity('all')}
            className={`px-2.5 py-1 text-xs rounded-md ${
              selectedCapacity === 'all'
                ? 'bg-emerald-400 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Todas Capacidades
          </button>
          {Object.entries(PHYSICAL_CAPACITIES_MAP).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedCapacity(key)}
              className={`px-2.5 py-1 text-xs rounded-md ${
                selectedCapacity === key
                  ? 'bg-emerald-400 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {activeAxis === 'sport' && (
        <div className="flex flex-wrap gap-1.5 p-3 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setSelectedSport('all')}
            className={`px-2.5 py-1 text-xs rounded-md ${
              selectedSport === 'all'
                ? 'bg-emerald-400 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Todos Esportes
          </button>
          {DEFAULT_SPORTS.map((sport) => (
            <button
              key={sport.id}
              onClick={() => setSelectedSport(sport.id)}
              className={`px-2.5 py-1 text-xs rounded-md ${
                selectedSport === sport.id
                  ? 'bg-emerald-400 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {sport.name.split('(')[0]}
            </button>
          ))}
        </div>
      )}

      {/* Advanced Multi-Variable Search & Combined Filters Toolbar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, sinônimos (ex: Stiff, RDL), tags ou comandos do treinador..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-800 text-xs text-slate-200 placeholder-slate-400 rounded-lg border border-slate-700/80 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 px-3 py-2 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-lg border border-slate-700"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpar Filtros</span>
            </button>
          )}
        </div>

        {/* Multi-Filter Dropdown Selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          <select
            value={selectedGoal}
            onChange={(e) => setSelectedGoal(e.target.value)}
            className="p-2 bg-slate-800 text-slate-200 rounded-lg border border-slate-700 focus:outline-none truncate"
          >
            <option value="all">Objetivo (Todos)</option>
            {Object.entries(TRAINING_GOALS_MAP).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>

          <select
            value={selectedMuscle}
            onChange={(e) => setSelectedMuscle(e.target.value)}
            className="p-2 bg-slate-800 text-slate-200 rounded-lg border border-slate-700 focus:outline-none truncate"
          >
            <option value="all">Músculo (Todos)</option>
            {Object.entries(MUSCLE_GROUPS_MAP).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>

          <select
            value={selectedPattern}
            onChange={(e) => setSelectedPattern(e.target.value)}
            className="p-2 bg-slate-800 text-slate-200 rounded-lg border border-slate-700 focus:outline-none truncate"
          >
            <option value="all">Padrão (Todos)</option>
            {Object.entries(MOVEMENT_PATTERNS_MAP).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>

          <select
            value={selectedCapacity}
            onChange={(e) => setSelectedCapacity(e.target.value)}
            className="p-2 bg-slate-800 text-slate-200 rounded-lg border border-slate-700 focus:outline-none truncate"
          >
            <option value="all">Capacidade (Todas)</option>
            {Object.entries(PHYSICAL_CAPACITIES_MAP).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>

          <select
            value={selectedEquipment}
            onChange={(e) => setSelectedEquipment(e.target.value)}
            className="p-2 bg-slate-800 text-slate-200 rounded-lg border border-slate-700 focus:outline-none truncate"
          >
            <option value="all">Equipamento (Todos)</option>
            {Object.entries(EQUIPMENT_MAP).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="p-2 bg-slate-800 text-slate-200 rounded-lg border border-slate-700 focus:outline-none truncate"
          >
            <option value="all">Dificuldade (Todas)</option>
            <option value="iniciante">Iniciante</option>
            <option value="intermediario">Intermediário</option>
            <option value="avancado">Avançado</option>
            <option value="elite">Elite</option>
          </select>
        </div>
      </div>

      {/* Exercise Results Grid & Quick Add to Workout Draft */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>
            Exibindo <span className="font-mono text-white font-bold">{filteredExercises.length}</span>{' '}
            exercícios
          </span>
          <span>Clique em "+ Treino" para adicionar instantaneamente à sessão</span>
        </div>

        {filteredExercises.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExercises.map((exercise) => {
              return (
                <div
                  key={exercise.id}
                  className="p-5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl flex flex-col justify-between transition-all group"
                >
                  <div>
                    {/* Header: Title and Difficulty */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                          {exercise.name}
                        </h3>
                        {exercise.alternativeNames.length > 0 && (
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                            {exercise.alternativeNames.join(', ')}
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 uppercase shrink-0">
                        {exercise.difficulty}
                      </span>
                    </div>

                    {/* Metadata: Muscle, Pattern & Goals without pill cliches */}
                    <div className="mt-3 space-y-1.5 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 font-medium">Músculo:</span>
                        <span className="text-slate-200 font-medium">
                          {exercise.primaryMuscles.map((m) => MUSCLE_GROUPS_MAP[m]).join(', ')}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 font-medium">Padrão:</span>
                        <span className="text-slate-300">
                          {MOVEMENT_PATTERNS_MAP[exercise.movementPattern]}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 font-medium">Equipamento:</span>
                        <span className="text-slate-300">
                          {exercise.equipment.map((eq) => EQUIPMENT_MAP[eq]).join(', ')}
                        </span>
                      </div>
                    </div>

                    {/* Prescriptive snippet */}
                    {exercise.prescriptiveParameters && (
                      <div className="mt-3 p-2 bg-slate-800/40 rounded-lg text-[11px] text-slate-300 font-mono">
                        <span>
                          Sugerido: {exercise.prescriptiveParameters.recommendedSets} ·{' '}
                          {exercise.prescriptiveParameters.recommendedRepsOrDuration}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions footer */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setInspectExercise(exercise)}
                      className="flex items-center gap-1 text-xs text-slate-300 hover:text-white font-medium"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ficha Técnica</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onEditExercise(exercise)}
                        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded"
                        title="Editar exercício"
                      >
                        <FileEdit className="w-3.5 h-3.5" />
                      </button>

                      {exercise.isCustom && (
                        <button
                          onClick={() => {
                            if (confirm(`Excluir ${exercise.name}?`)) {
                              deleteExercise(exercise.id);
                            }
                          }}
                          className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-slate-800 rounded"
                          title="Excluir exercício customizado"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => addExerciseToDraft(exercise)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-md transition-colors"
                        title="Adicionar à montagem do treino atual"
                      >
                        <Plus className="w-3 h-3 stroke-[3]" />
                        <span>+ Treino</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <Dumbbell className="w-8 h-8 text-slate-600 mx-auto" />
            <h3 className="text-base font-semibold text-white">Nenhum exercício encontrado</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Nenhum exercício corresponde à combinação atual de filtros. Tente limpar os filtros ou cadastre um novo exercício customizado.
            </p>
            <button
              onClick={clearAllFilters}
              className="px-3.5 py-1.5 text-xs text-slate-200 bg-slate-800 rounded-lg hover:bg-slate-700"
            >
              Resetar Filtros
            </button>
          </div>
        )}
      </div>

      {/* Comprehensive Exercise Technical Dossier Modal */}
      {inspectExercise && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">{inspectExercise.name}</h2>
                  <span className="text-xs font-mono px-2 py-0.5 bg-slate-800 text-emerald-400 rounded">
                    {inspectExercise.difficulty.toUpperCase()}
                  </span>
                </div>
                {inspectExercise.alternativeNames.length > 0 && (
                  <p className="text-xs text-slate-400 mt-1">
                    Nomes alternativos: {inspectExercise.alternativeNames.join(' · ')}
                  </p>
                )}
              </div>
              <button
                onClick={() => setInspectExercise(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-medium">Padrão de Movimento</span>
                <p className="text-slate-100 font-bold mt-1">
                  {MOVEMENT_PATTERNS_MAP[inspectExercise.movementPattern]}
                </p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-medium">Músculo Primário</span>
                <p className="text-emerald-400 font-bold mt-1">
                  {inspectExercise.primaryMuscles.map((m) => MUSCLE_GROUPS_MAP[m]).join(', ')}
                </p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-medium">Equipamentos</span>
                <p className="text-slate-100 font-bold mt-1">
                  {inspectExercise.equipment.map((eq) => EQUIPMENT_MAP[eq]).join(', ')}
                </p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-medium">Tipo de Contração</span>
                <p className="text-slate-100 font-bold mt-1">
                  {inspectExercise.contractionType}
                </p>
              </div>
            </div>

            {/* Step-by-Step Execution Instructions */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Instruções Passo a Passo de Execução
              </h3>
              <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 space-y-3 text-xs">
                <div>
                  <span className="font-bold text-emerald-400">1. Posição Inicial:</span>
                  <p className="text-slate-300 mt-0.5 leading-relaxed">
                    {inspectExercise.instructions.initialPosition}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-sky-400">2. Execução / Fase Excêntrica & Concêntrica:</span>
                  <p className="text-slate-300 mt-0.5 leading-relaxed">
                    {inspectExercise.instructions.execution}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-purple-400">3. Finalização & Travamento Seguro:</span>
                  <p className="text-slate-300 mt-0.5 leading-relaxed">
                    {inspectExercise.instructions.finishing}
                  </p>
                </div>
              </div>
            </div>

            {/* Breathing & Verbal Coach Cues */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800">
                <span className="font-bold text-amber-400 uppercase tracking-wider block mb-1">
                  Orientações Respiratórias
                </span>
                <p className="text-slate-300 leading-relaxed">{inspectExercise.breathingCues}</p>
              </div>

              <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800">
                <span className="font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                  Comandos Verbais para o Treinador (Coach Cues)
                </span>
                <ul className="text-slate-300 list-disc list-inside space-y-1">
                  {inspectExercise.coachCues.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Common Technical Mistakes */}
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs space-y-1">
              <span className="font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                Erros Técnicos Comuns a Evitar
              </span>
              <ul className="text-slate-300 list-disc list-inside pt-1 space-y-1">
                {inspectExercise.commonMistakes.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>

            {/* Prescription Guidance */}
            {inspectExercise.prescriptiveParameters && (
              <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-800 text-xs">
                <span className="font-bold text-white uppercase tracking-wider block mb-2">
                  Parâmetros de Prescrição Recomendados
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
                  <div>
                    <span className="text-slate-400">Séries:</span>{' '}
                    <span className="text-emerald-400 font-bold">
                      {inspectExercise.prescriptiveParameters.recommendedSets}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Reps / Duração:</span>{' '}
                    <span className="text-slate-200">
                      {inspectExercise.prescriptiveParameters.recommendedRepsOrDuration}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Intensidade:</span>{' '}
                    <span className="text-slate-200">
                      {inspectExercise.prescriptiveParameters.intensityGuidance}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Descanso:</span>{' '}
                    <span className="text-slate-200">
                      {inspectExercise.prescriptiveParameters.restInterval}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Sports Applications & Safety */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-semibold text-slate-400 block mb-1">
                  Aplicações em Modalidades Esportivas:
                </span>
                <p className="text-slate-200">
                  {inspectExercise.sportsApplications.join(' · ')}
                </p>
              </div>
              <div>
                <span className="font-semibold text-slate-400 block mb-1">
                  Segurança & Contraindicações:
                </span>
                <p className="text-slate-300">{inspectExercise.safetyNotes}</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setInspectExercise(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  addExerciseToDraft(inspectExercise);
                  setInspectExercise(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Adicionar ao Treino em Montagem</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
