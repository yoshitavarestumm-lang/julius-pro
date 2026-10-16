import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Athlete, TrainingGoal, AthleteLevel, EquipmentType } from '../types';
import {
  TRAINING_GOALS_MAP,
  EQUIPMENT_MAP,
} from '../data/constants';
import {
  User,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  ShieldCheck,
  AlertCircle,
  FileEdit,
  Trash2,
  CheckCircle2,
  Activity,
  Award,
} from 'lucide-react';

interface AthletesViewProps {
  onOpenNewAthleteModal: () => void;
  onEditAthlete: (athlete: Athlete) => void;
  onPrescribeForAthlete: (athlete: Athlete) => void;
}

export const AthletesView: React.FC<AthletesViewProps> = ({
  onOpenNewAthleteModal,
  onEditAthlete,
  onPrescribeForAthlete,
}) => {
  const {
    athletes,
    selectedAthleteId,
    setSelectedAthleteId,
    deleteAthlete,
    assessments,
    workoutLogs,
    programs,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState(() => {
    try {
      return localStorage.getItem('atletas_searchTerm') || '';
    } catch (e) {
      return '';
    }
  });
  const [goalFilter, setGoalFilter] = useState<string>(() => {
    try {
      return localStorage.getItem('atletas_goalFilter') || 'all';
    } catch (e) {
      return 'all';
    }
  });
  const [levelFilter, setLevelFilter] = useState<string>(() => {
    try {
      return localStorage.getItem('atletas_levelFilter') || 'all';
    } catch (e) {
      return 'all';
    }
  });

  React.useEffect(() => {
    try {
      localStorage.setItem('atletas_searchTerm', searchTerm);
      localStorage.setItem('atletas_goalFilter', goalFilter);
      localStorage.setItem('atletas_levelFilter', levelFilter);
    } catch (e) {}
  }, [searchTerm, goalFilter, levelFilter]);

  const filteredAthletes = athletes.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGoal = goalFilter === 'all' || a.primaryGoal === goalFilter;
    const matchesLevel = levelFilter === 'all' || a.level === levelFilter;
    return matchesSearch && matchesGoal && matchesLevel;
  });

  const currentAthlete = athletes.find((a) => a.id === selectedAthleteId) || athletes[0];
  const athleteAssessments = assessments.filter((asmt) => asmt.athleteId === currentAthlete?.id);
  const athleteLogs = workoutLogs.filter((log) => log.athleteId === currentAthlete?.id);
  const athleteProgram = programs.find((p) => p.id === currentAthlete?.activeProgramId);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Controls & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Gestão de Alunos & Atletas</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Perfis individualizados, triagem de saúde, metas primárias/secundárias e acompanhamento.
          </p>
        </div>
        <button
          onClick={onOpenNewAthleteModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Cadastrar Novo Atleta</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800 text-xs text-slate-200 placeholder-slate-400 rounded-lg border border-slate-700/80 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-2">
          <select
            value={goalFilter}
            onChange={(e) => setGoalFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800 text-xs text-slate-300 rounded-lg border border-slate-700 focus:outline-none"
          >
            <option value="all">Todos os Objetivos</option>
            {Object.entries(TRAINING_GOALS_MAP).map(([key, item]) => (
              <option key={key} value={key}>
                {item.label}
              </option>
            ))}
          </select>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800 text-xs text-slate-300 rounded-lg border border-slate-700 focus:outline-none"
          >
            <option value="all">Todos os Níveis</option>
            <option value="iniciante">Iniciante</option>
            <option value="intermediario">Intermediário</option>
            <option value="avancado">Avançado</option>
            <option value="atleta">Atleta Competitivo</option>
          </select>
        </div>
      </div>

      {/* Main Split Layout: Left List / Right Full Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Athletes List Column */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Atletas encontrados: {filteredAthletes.length}</span>
            <span>Clique para selecionar</span>
          </div>

          <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
            {filteredAthletes.map((ath) => {
              const isSelected = ath.id === currentAthlete?.id;
              return (
                <div
                  key={ath.id}
                  onClick={() => setSelectedAthleteId(ath.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-emerald-500/50 shadow-sm'
                      : 'bg-slate-900 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-emerald-400 text-sm">
                        {ath.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{ath.name}</h3>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          {ath.age} anos · {ath.level}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        isSelected
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {TRAINING_GOALS_MAP[ath.primaryGoal]?.label.split(' ')[0]}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="truncate max-w-[200px]">
                      {ath.activeProgramName || 'Sem treino ativo'}
                    </span>
                    <span className="font-mono text-slate-500">
                      {ath.preferredDays.join('/')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Athlete Full Dossier Column */}
        {currentAthlete ? (
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            {/* Header with quick actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl font-bold text-emerald-400">
                  {currentAthlete.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white">{currentAthlete.name}</h2>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-slate-800 text-slate-300 rounded">
                      {currentAthlete.level.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span>{currentAthlete.email}</span>
                    <span aria-hidden="true">·</span>
                    <span>{currentAthlete.phone}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => onPrescribeForAthlete(currentAthlete)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap"
                >
                  Prescrever Treino
                </button>
                <button
                  onClick={() => onEditAthlete(currentAthlete)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg border border-slate-700/60"
                  title="Editar dados"
                >
                  <FileEdit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Tem certeza que deseja excluir o atleta ${currentAthlete.name}?`)) {
                      deleteAthlete(currentAthlete.id);
                    }
                  }}
                  className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-slate-800 rounded-lg border border-slate-700/60"
                  title="Excluir atleta"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Profile Grid Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-800">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Objetivo Principal
                </span>
                <p className="text-sm font-bold text-emerald-400 mt-1">
                  {TRAINING_GOALS_MAP[currentAthlete.primaryGoal]?.label}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {TRAINING_GOALS_MAP[currentAthlete.primaryGoal]?.description}
                </p>
              </div>

              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-800">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Objetivos Secundários
                </span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {currentAthlete.secondaryGoals.length > 0 ? (
                    currentAthlete.secondaryGoals.map((g) => (
                      <span key={g} className="text-xs px-2 py-0.5 bg-slate-800 text-slate-300 rounded">
                        {TRAINING_GOALS_MAP[g]?.label}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">Nenhum secundário especificado.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Logistics & Availability */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-medium">Dias de Treino</span>
                <p className="text-slate-100 font-bold mt-1 font-mono">
                  {currentAthlete.preferredDays.join(', ')}
                </p>
              </div>
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-medium">Tempo por Sessão</span>
                <p className="text-slate-100 font-bold mt-1 font-mono">
                  {currentAthlete.sessionDurationMinutes} minutos
                </p>
              </div>
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-medium">Local de Treino</span>
                <p className="text-slate-100 font-bold mt-1 truncate">
                  {currentAthlete.location}
                </p>
              </div>
            </div>

            {/* Health Screening / PAR-Q / Injuries */}
            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Triagem de Saúde, Limitações & Anamnese
                </span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  PAR-Q Aprovado
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Histórico de Lesões:</span>
                  <p className="text-slate-200 mt-0.5">
                    {currentAthlete.healthScreening.injuriesHistory.length > 0
                      ? currentAthlete.healthScreening.injuriesHistory.join(', ')
                      : 'Nenhum histórico relatado.'}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 font-medium">Restrições / Cuidados Articulares:</span>
                  <p className="text-amber-400 mt-0.5">
                    {currentAthlete.healthScreening.jointRestrictions.length > 0
                      ? currentAthlete.healthScreening.jointRestrictions.join(', ')
                      : 'Nenhuma contraindicação.'}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-400 font-medium">Notas do Treinador:</span>
                <p className="text-slate-300 mt-0.5 italic">
                  "{currentAthlete.coachNotes || 'Sem observações.'}"
                </p>
              </div>
            </div>

            {/* Active Training Program Details */}
            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Programa de Treinamento Ativo
                </span>
                {athleteProgram && (
                  <span className="text-xs font-mono text-emerald-400">
                    Divisão {athleteProgram.splitType}
                  </span>
                )}
              </div>

              {athleteProgram ? (
                <div className="mt-3 space-y-2">
                  <h4 className="text-sm font-bold text-white">{athleteProgram.title}</h4>
                  <p className="text-xs text-slate-400">{athleteProgram.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-slate-800">
                    {athleteProgram.sessions.map((sess, idx) => (
                      <div
                        key={sess.id}
                        className="px-2.5 py-1 bg-slate-900 border border-slate-700/80 rounded text-xs text-slate-300"
                      >
                        <span className="font-semibold text-emerald-400">{sess.title}: </span>
                        <span>{sess.exercises.length} exercícios</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 mt-2">
                  Nenhum programa ativo no momento para este atleta.
                </p>
              )}
            </div>

            {/* Physical Assessments Summary for this athlete */}
            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Histórico de Avaliações ({athleteAssessments.length})
                </span>
              </div>
              {athleteAssessments.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {athleteAssessments.map((asmt) => (
                    <div
                      key={asmt.id}
                      className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-200">
                          {asmt.date} · {asmt.type.toUpperCase()}
                        </span>
                        <p className="text-slate-400 mt-0.5 line-clamp-1">
                          {asmt.coachInterpretation}
                        </p>
                      </div>
                      {asmt.measurements.weightKg && (
                        <span className="font-mono text-emerald-400 font-bold shrink-0">
                          {asmt.measurements.weightKg} kg
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 mt-2">
                  Nenhuma avaliação registrada ainda.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-7 p-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
            Selecione um atleta para visualizar o perfil completo.
          </div>
        )}
      </div>
    </div>
  );
};
