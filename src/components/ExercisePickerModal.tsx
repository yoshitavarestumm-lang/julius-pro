import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Exercise } from '../types';
import { MUSCLE_GROUPS_MAP, MOVEMENT_PATTERNS_MAP, EQUIPMENT_MAP } from '../data/constants';
import { Search, Plus, X, Dumbbell, Check } from 'lucide-react';

interface ExercisePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetSessionIndex: number;
}

export const ExercisePickerModal: React.FC<ExercisePickerModalProps> = ({
  isOpen,
  onClose,
  targetSessionIndex,
}) => {
  const { exercises, addExerciseToDraft } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('all');
  const [addedIds, setAddedIds] = useState<string[]>([]);

  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        ex.name.toLowerCase().includes(q) ||
        ex.alternativeNames.some((alt) => alt.toLowerCase().includes(q)) ||
        ex.tags.some((t) => t.toLowerCase().includes(q));

      const matchesMuscle =
        selectedMuscle === 'all' ||
        ex.primaryMuscles.includes(selectedMuscle as any) ||
        ex.secondaryMuscles.includes(selectedMuscle as any);

      return matchesSearch && matchesMuscle;
    });
  }, [exercises, searchTerm, selectedMuscle]);

  if (!isOpen) return null;

  const handleAdd = (ex: Exercise) => {
    addExerciseToDraft(ex, targetSessionIndex);
    setAddedIds((prev) => [...prev, ex.id]);
    setTimeout(() => {
      setAddedIds((prev) => prev.filter((id) => id !== ex.id));
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-emerald-400" />
            Adicionar Exercícios à Sessão
          </h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, sinônimo ou tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-800 text-xs text-slate-200 placeholder-slate-400 rounded-lg border border-slate-700 focus:outline-none"
            />
          </div>

          <select
            value={selectedMuscle}
            onChange={(e) => setSelectedMuscle(e.target.value)}
            className="px-3 py-2 bg-slate-800 text-xs text-slate-200 rounded-lg border border-slate-700 focus:outline-none"
          >
            <option value="all">Todos os Músculos</option>
            {Object.entries(MUSCLE_GROUPS_MAP).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>

        {/* Exercises List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-800/80">
          {filtered.map((ex) => {
            const isJustAdded = addedIds.includes(ex.id);
            return (
              <div
                key={ex.id}
                className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <h4 className="font-bold text-white">{ex.name}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span>{ex.primaryMuscles.map((m) => MUSCLE_GROUPS_MAP[m]).join(', ')}</span>
                    <span aria-hidden="true">·</span>
                    <span>{MOVEMENT_PATTERNS_MAP[ex.movementPattern]}</span>
                    <span aria-hidden="true">·</span>
                    <span>{ex.equipment.map((eq) => EQUIPMENT_MAP[eq]).join(', ')}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleAdd(ex)}
                  className={`px-3 py-1.5 font-semibold rounded-lg transition-colors flex items-center gap-1 shrink-0 ${
                    isJustAdded
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-sm'
                  }`}
                >
                  {isJustAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Adicionado</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>+ Adicionar</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg"
          >
            Concluir Seleção
          </button>
        </div>
      </div>
    </div>
  );
};
