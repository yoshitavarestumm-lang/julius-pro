import React, { useState, useEffect } from 'react';
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
} from '../data/constants';
import { X, Check } from 'lucide-react';

interface ExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Exercise, 'id'>) => void;
  initialExercise?: Exercise | null;
}

export const ExerciseModal: React.FC<ExerciseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialExercise,
}) => {
  const [name, setName] = useState('');
  const [alternativeNamesText, setAlternativeNamesText] = useState('');
  const [category, setCategory] = useState<Exercise['category']>('musculacao');
  const [difficulty, setDifficulty] = useState<Exercise['difficulty']>('intermediario');
  const [primaryGoal, setPrimaryGoal] = useState<TrainingGoal>('hipertrofia');
  const [secondaryGoals, setSecondaryGoals] = useState<TrainingGoal[]>([]);
  const [primaryMuscle, setPrimaryMuscle] = useState<MuscleGroup>('peitoral');
  const [secondaryMuscles, setSecondaryMuscles] = useState<MuscleGroup[]>([]);
  const [movementPattern, setMovementPattern] = useState<MovementPattern>('empurrar_horizontal');
  const [contractionType, setContractionType] = useState('Dinâmica Isotônica');
  const [physicalCapacities, setPhysicalCapacities] = useState<PhysicalCapacity[]>(['forca_maxima']);
  const [equipment, setEquipment] = useState<EquipmentType[]>(['barras_anilhas']);
  const [initialPosition, setInitialPosition] = useState('');
  const [execution, setExecution] = useState('');
  const [finishing, setFinishing] = useState('');
  const [breathingCues, setBreathingCues] = useState('');
  const [commonMistakesText, setCommonMistakesText] = useState('');
  const [coachCuesText, setCoachCuesText] = useState('');
  const [recommendedSets, setRecommendedSets] = useState('3 a 4 séries');
  const [recommendedReps, setRecommendedReps] = useState('8 a 12 reps');
  const [intensityGuidance, setIntensityGuidance] = useState('RIR 1-2');
  const [restInterval, setRestInterval] = useState('90s');
  const [tempoCadence, setTempoCadence] = useState('2-0-1-0');
  const [safetyNotes, setSafetyNotes] = useState('');
  const [sportsApplicationsText, setSportsApplicationsText] = useState('');
  const [tagsText, setTagsText] = useState('');

  useEffect(() => {
    if (initialExercise) {
      setName(initialExercise.name);
      setAlternativeNamesText(initialExercise.alternativeNames.join(', '));
      setCategory(initialExercise.category);
      setDifficulty(initialExercise.difficulty);
      setPrimaryGoal(initialExercise.primaryGoals[0] || 'hipertrofia');
      setSecondaryGoals(initialExercise.secondaryGoals || []);
      setPrimaryMuscle(initialExercise.primaryMuscles[0] || 'peitoral');
      setSecondaryMuscles(initialExercise.secondaryMuscles || []);
      setMovementPattern(initialExercise.movementPattern);
      setContractionType(initialExercise.contractionType);
      setPhysicalCapacities(initialExercise.physicalCapacities || []);
      setEquipment(initialExercise.equipment || []);
      setInitialPosition(initialExercise.instructions.initialPosition);
      setExecution(initialExercise.instructions.execution);
      setFinishing(initialExercise.instructions.finishing);
      setBreathingCues(initialExercise.breathingCues);
      setCommonMistakesText(initialExercise.commonMistakes.join('\n'));
      setCoachCuesText(initialExercise.coachCues.join('\n'));
      setRecommendedSets(initialExercise.prescriptiveParameters?.recommendedSets || '3 a 4 séries');
      setRecommendedReps(initialExercise.prescriptiveParameters?.recommendedRepsOrDuration || '8 a 12 reps');
      setIntensityGuidance(initialExercise.prescriptiveParameters?.intensityGuidance || 'RIR 1-2');
      setRestInterval(initialExercise.prescriptiveParameters?.restInterval || '90s');
      setTempoCadence(initialExercise.prescriptiveParameters?.tempoCadence || '2-0-1-0');
      setSafetyNotes(initialExercise.safetyNotes || '');
      setSportsApplicationsText(initialExercise.sportsApplications.join(', '));
      setTagsText(initialExercise.tags.join(', '));
    } else {
      setName('');
      setAlternativeNamesText('');
      setCategory('musculacao');
      setDifficulty('intermediario');
      setPrimaryGoal('hipertrofia');
      setSecondaryGoals([]);
      setPrimaryMuscle('peitoral');
      setSecondaryMuscles([]);
      setMovementPattern('empurrar_horizontal');
      setContractionType('Dinâmica Isotônica');
      setPhysicalCapacities(['forca_maxima']);
      setEquipment(['halteres']);
      setInitialPosition('Posicione-se com alinhamento articular neutro.');
      setExecution('Execute com amplitude controlada e controle excêntrico.');
      setFinishing('Retorne à posição de repouso com segurança.');
      setBreathingCues('Inspire na fase excêntrica e expire na concêntrica.');
      setCommonMistakesText('Compensação lombar por excesso de carga\nPerda do controle excêntrico');
      setCoachCuesText('Mantenha o core rígido\nControle a descida');
      setRecommendedSets('3 a 4 séries');
      setRecommendedReps('8 a 12 reps');
      setIntensityGuidance('RIR 1-2');
      setRestInterval('90s');
      setTempoCadence('2-0-1-0');
      setSafetyNotes('Evitar caso haja dor articular aguda.');
      setSportsApplicationsText('Futebol, Lutas, Basquete');
      setTagsText('força, composto, hipertrofia');
    }
  }, [initialExercise, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name,
      alternativeNames: alternativeNamesText ? alternativeNamesText.split(',').map((s) => s.trim()) : [],
      category,
      difficulty,
      primaryGoals: [primaryGoal],
      secondaryGoals,
      primaryMuscles: [primaryMuscle],
      secondaryMuscles,
      movementPattern,
      contractionType,
      physicalCapacities,
      equipment,
      instructions: {
        initialPosition,
        execution,
        finishing,
      },
      breathingCues,
      commonMistakes: commonMistakesText ? commonMistakesText.split('\n').map((s) => s.trim()).filter(Boolean) : [],
      coachCues: coachCuesText ? coachCuesText.split('\n').map((s) => s.trim()).filter(Boolean) : [],
      progressions: [],
      regressions: [],
      variations: [],
      prescriptiveParameters: {
        recommendedSets,
        recommendedRepsOrDuration: recommendedReps,
        intensityGuidance,
        restInterval,
        tempoCadence,
      },
      safetyNotes,
      sportsApplications: sportsApplicationsText ? sportsApplicationsText.split(',').map((s) => s.trim()) : [],
      tags: tagsText ? tagsText.split(',').map((s) => s.trim()) : [],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-lg font-bold text-white">
            {initialExercise ? 'Editar Exercício' : 'Cadastrar Novo Exercício no Banco'}
          </h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Identificação e Sinônimos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Nome do Exercício (PT-BR) *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Supino Reto com Barra Olímpica"
                className="w-full p-2 bg-slate-800 text-white rounded-lg border border-slate-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Sinônimos / Nomes Alternativos</label>
              <input
                type="text"
                value={alternativeNamesText}
                onChange={(e) => setAlternativeNamesText(e.target.value)}
                placeholder="Ex: Barbell Bench Press, Supino Plano"
                className="w-full p-2 bg-slate-800 text-slate-200 rounded-lg border border-slate-700"
              />
            </div>
          </div>

          {/* Categoria, Padrão e Músculo Principal */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full p-2 bg-slate-800 text-slate-200 rounded-lg border border-slate-700"
              >
                <option value="musculacao">Musculação / Força</option>
                <option value="pliometria">Pliometria & Saltos</option>
                <option value="cardio_locomocao">Cardio & Locomoção</option>
                <option value="mobilidade">Mobilidade & Estabilidade</option>
                <option value="funcional_potencia">Funcional & Potência</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Músculo Primário</label>
              <select
                value={primaryMuscle}
                onChange={(e) => setPrimaryMuscle(e.target.value as MuscleGroup)}
                className="w-full p-2 bg-slate-800 text-emerald-400 font-bold rounded-lg border border-slate-700"
              >
                {Object.entries(MUSCLE_GROUPS_MAP).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Padrão de Movimento</label>
              <select
                value={movementPattern}
                onChange={(e) => setMovementPattern(e.target.value as MovementPattern)}
                className="w-full p-2 bg-slate-800 text-slate-200 rounded-lg border border-slate-700"
              >
                {Object.entries(MOVEMENT_PATTERNS_MAP).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dificuldade e Objetivo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Objetivo Primário</label>
              <select
                value={primaryGoal}
                onChange={(e) => setPrimaryGoal(e.target.value as TrainingGoal)}
                className="w-full p-2 bg-slate-800 text-slate-200 rounded-lg border border-slate-700"
              >
                {Object.entries(TRAINING_GOALS_MAP).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Nível de Dificuldade</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full p-2 bg-slate-800 text-slate-200 rounded-lg border border-slate-700"
              >
                <option value="iniciante">Iniciante</option>
                <option value="intermediario">Intermediário</option>
                <option value="avancado">Avançado</option>
                <option value="elite">Elite</option>
              </select>
            </div>
          </div>

          {/* Instruções de Execução */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="font-bold text-slate-200 block">Instruções Passo a Passo:</span>
            <div className="space-y-2">
              <input
                type="text"
                value={initialPosition}
                onChange={(e) => setInitialPosition(e.target.value)}
                placeholder="Posição Inicial: postura, pegada, pés..."
                className="w-full p-2 bg-slate-800 text-slate-200 rounded-lg border border-slate-700"
              />
              <input
                type="text"
                value={execution}
                onChange={(e) => setExecution(e.target.value)}
                placeholder="Execução: descida controlada e subida..."
                className="w-full p-2 bg-slate-800 text-slate-200 rounded-lg border border-slate-700"
              />
              <input
                type="text"
                value={finishing}
                onChange={(e) => setFinishing(e.target.value)}
                placeholder="Finalização: travamento seguro e postura..."
                className="w-full p-2 bg-slate-800 text-slate-200 rounded-lg border border-slate-700"
              />
            </div>
          </div>

          {/* Respiração e Comandos do Treinador */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Orientações Respiratórias</label>
              <textarea
                rows={2}
                value={breathingCues}
                onChange={(e) => setBreathingCues(e.target.value)}
                placeholder="Ex: Inspire na descida e expire após passar pelo ponto de transição concêntrica."
                className="w-full p-2 bg-slate-800 text-slate-200 rounded-lg border border-slate-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Comandos do Treinador (1 por linha)</label>
              <textarea
                rows={2}
                value={coachCuesText}
                onChange={(e) => setCoachCuesText(e.target.value)}
                placeholder="Ex: Escápulas travadas\nEmpurre o chão com os calcanhares"
                className="w-full p-2 bg-slate-800 text-slate-200 rounded-lg border border-slate-700"
              />
            </div>
          </div>

          {/* Erros Comuns e Segurança */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Erros Comuns (1 por linha)</label>
              <textarea
                rows={2}
                value={commonMistakesText}
                onChange={(e) => setCommonMistakesText(e.target.value)}
                placeholder="Ex: Hiperextensão lombar no topo\nJoelhos em valgo dinâmico"
                className="w-full p-2 bg-slate-800 text-rose-300 rounded-lg border border-slate-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Segurança & Contraindicações</label>
              <textarea
                rows={2}
                value={safetyNotes}
                onChange={(e) => setSafetyNotes(e.target.value)}
                placeholder="Ex: Utilizar travas de segurança em cargas elevadas."
                className="w-full p-2 bg-slate-800 text-amber-300 rounded-lg border border-slate-700"
              />
            </div>
          </div>

          {/* Parâmetros de Prescrição */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-2 border-t border-slate-800">
            <div>
              <label className="text-slate-400">Séries Sugeridas</label>
              <input
                type="text"
                value={recommendedSets}
                onChange={(e) => setRecommendedSets(e.target.value)}
                className="w-full p-1.5 bg-slate-800 text-white rounded-lg border border-slate-700"
              />
            </div>
            <div>
              <label className="text-slate-400">Reps Sugeridas</label>
              <input
                type="text"
                value={recommendedReps}
                onChange={(e) => setRecommendedReps(e.target.value)}
                className="w-full p-1.5 bg-slate-800 text-white rounded-lg border border-slate-700"
              />
            </div>
            <div>
              <label className="text-slate-400">Intensidade</label>
              <input
                type="text"
                value={intensityGuidance}
                onChange={(e) => setIntensityGuidance(e.target.value)}
                className="w-full p-1.5 bg-slate-800 text-white rounded-lg border border-slate-700"
              />
            </div>
            <div>
              <label className="text-slate-400">Descanso</label>
              <input
                type="text"
                value={restInterval}
                onChange={(e) => setRestInterval(e.target.value)}
                className="w-full p-1.5 bg-slate-800 text-white rounded-lg border border-slate-700"
              />
            </div>
          </div>

          {/* Aplicações Esportivas e Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Aplicações Esportivas (vírgula)</label>
              <input
                type="text"
                value={sportsApplicationsText}
                onChange={(e) => setSportsApplicationsText(e.target.value)}
                placeholder="Futebol, Corrida de rua, Basquete"
                className="w-full p-2 bg-slate-800 text-slate-200 rounded-lg border border-slate-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Etiquetas / Tags de Busca</label>
              <input
                type="text"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                placeholder="peito, barra, força pura"
                className="w-full p-2 bg-slate-800 text-slate-200 rounded-lg border border-slate-700"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm"
            >
              {initialExercise ? 'Salvar Exercício' : 'Adicionar ao Banco de Dados'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
