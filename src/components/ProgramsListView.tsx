import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TrainingProgram } from '../types';
import { TRAINING_GOALS_MAP } from '../data/constants';
import { exportProgramToCSV } from '../utils/exportUtils';
import {
  FolderGit2,
  Copy,
  FileEdit,
  Trash2,
  Printer,
  FileSpreadsheet,
  Plus,
  Users,
  Layers,
  Calendar,
  Check,
  Search,
} from 'lucide-react';

interface ProgramsListViewProps {
  onEditProgram: (program: TrainingProgram) => void;
  onOpenPrintModal: (program: TrainingProgram) => void;
  onNewProgramClick: () => void;
}

export const ProgramsListView: React.FC<ProgramsListViewProps> = ({
  onEditProgram,
  onOpenPrintModal,
  onNewProgramClick,
}) => {
  const { programs, athletes, duplicateProgram, deleteProgram, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'athletes' | 'templates'>(() => {
    try {
      return (localStorage.getItem('programas_activeTab') as any) || 'all';
    } catch (e) {
      return 'all';
    }
  });

  const [searchTerm, setSearchTerm] = useState(() => {
    try {
      return localStorage.getItem('programas_searchTerm') || '';
    } catch (e) {
      return '';
    }
  });

  React.useEffect(() => {
    try {
      localStorage.setItem('programas_activeTab', activeTab);
      localStorage.setItem('programas_searchTerm', searchTerm);
    } catch (e) {}
  }, [activeTab, searchTerm]);

  // Duplication Modal State (Scenario 5)
  const [duplicateTargetProgram, setDuplicateTargetProgram] = useState<TrainingProgram | null>(null);
  const [selectedDestinationAthleteId, setSelectedDestinationAthleteId] = useState<string>('');
  const [customizedTitle, setCustomizedTitle] = useState('');

  const filteredPrograms = programs.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.athleteName && p.athleteName.toLowerCase().includes(searchTerm.toLowerCase()));

    if (activeTab === 'templates') return matchesSearch && p.isTemplate;
    if (activeTab === 'athletes') return matchesSearch && !p.isTemplate;
    return matchesSearch;
  });

  const handleOpenDuplicate = (program: TrainingProgram) => {
    setDuplicateTargetProgram(program);
    setSelectedDestinationAthleteId(athletes[0]?.id || '');
    setCustomizedTitle(`${program.title} (Personalizado)`);
  };

  const handleConfirmDuplicate = async () => {
    if (!duplicateTargetProgram) return;
    await duplicateProgram(
      duplicateTargetProgram.id,
      selectedDestinationAthleteId || undefined,
      customizedTitle
    );
    setDuplicateTargetProgram(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Programas & Modelos de Treinamento
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Gerencie programas em andamento e acesse a biblioteca de modelos reutilizáveis.
          </p>
        </div>

        <button
          onClick={onNewProgramClick}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Montar Novo Treino</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-1.5 p-1 bg-slate-800/80 rounded-lg border border-slate-700/60">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'all'
                ? 'bg-emerald-400 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos ({programs.length})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'templates'
                ? 'bg-emerald-400 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Modelos Salvos ({programs.filter((p) => p.isTemplate).length})
          </button>
          <button
            onClick={() => setActiveTab('athletes')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'athletes'
                ? 'bg-emerald-400 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Atribuídos a Atletas ({programs.filter((p) => !p.isTemplate).length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar programas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-800 text-xs text-slate-200 placeholder-slate-400 rounded-lg border border-slate-700 focus:outline-none"
          />
        </div>
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPrograms.map((program) => {
          return (
            <div
              key={program.id}
              className="p-5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white line-clamp-1">{program.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {program.isTemplate ? (
                        <span className="text-emerald-400 font-semibold">Modelo Reutilizável</span>
                      ) : (
                        <span>Atleta: {program.athleteName || 'Não atribuído'}</span>
                      )}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0">
                    {program.splitType}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {program.description}
                </p>

                {/* Sessions summary */}
                <div className="mt-4 pt-3 border-t border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Divisões / Sessões:</span>
                    <span className="font-mono text-slate-200 font-bold">
                      {(program.sessions || []).length} sessões
                    </span>
                  </div>

                  {/* Sessions badges */}
                  <div className="flex flex-wrap gap-1.5 py-0.5">
                    {(program.sessions || []).map((s, idx) => (
                      <span
                        key={s.id || `sess-${idx}`}
                        className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-300 border border-slate-700/60 font-mono"
                      >
                        <strong className="text-emerald-400">{s.title.split('-')[0].trim()}</strong>: {(s.exercises || []).length} ex
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span>Frequência semanal:</span>
                    <span className="font-mono text-slate-200">
                      {program.weeklyFrequency}x por semana
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Foco do treinamento:</span>
                    <span className="text-emerald-400">
                      {TRAINING_GOALS_MAP[program.category]?.label.split(' ')[0]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-1">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditProgram(program)}
                    className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded"
                    title="Editar treino no montador"
                  >
                    <FileEdit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleOpenDuplicate(program)}
                    className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 rounded"
                    title="Duplicar para outro atleta"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onOpenPrintModal(program)}
                    className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded"
                    title="Imprimir / PDF"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => exportProgramToCSV(program)}
                    className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded"
                    title="Exportar Excel"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    if (confirm(`Excluir programa "${program.title}"?`)) {
                      deleteProgram(program.id);
                    }
                  }}
                  className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-slate-800 rounded"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Scenario 5: Duplicate Program Modal */}
      {duplicateTargetProgram && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Copy className="w-4 h-4 text-emerald-400" />
                Duplicar & Personalizar Treino (Cenário 5)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Adapte o modelo original para um atleta específico. O modelo original permanecerá intacto.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Modelo de Origem</label>
                <div className="p-2.5 bg-slate-800/80 rounded-lg text-slate-200 font-medium">
                  {duplicateTargetProgram.title}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Atribuir ao Atleta</label>
                <select
                  value={selectedDestinationAthleteId}
                  onChange={(e) => setSelectedDestinationAthleteId(e.target.value)}
                  className="w-full p-2 bg-slate-800 text-slate-200 rounded-lg border border-slate-700"
                >
                  {athletes.map((ath) => (
                    <option key={ath.id} value={ath.id}>
                      {ath.name} ({ath.level})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-medium">Título da Nova Cópia Customizada</label>
                <input
                  type="text"
                  value={customizedTitle}
                  onChange={(e) => setCustomizedTitle(e.target.value)}
                  className="w-full p-2 bg-slate-800 text-white rounded-lg border border-slate-700"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setDuplicateTargetProgram(null)}
                className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDuplicate}
                className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg"
              >
                Confirmar Duplicação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
