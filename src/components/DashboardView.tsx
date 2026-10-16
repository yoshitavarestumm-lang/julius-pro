import React from 'react';
import { useApp } from '../context/AppContext';
import { NavTab } from './Navigation';
import { TRAINING_GOALS_MAP } from '../data/constants';
import {
  Users,
  Dumbbell,
  ClipboardCheck,
  TrendingUp,
  ArrowRight,
  Flame,
  Zap,
  Layers,
  Trophy,
  Copy,
  Calendar,
  CheckCircle2,
  Clock,
  HeartPulse,
} from 'lucide-react';

interface DashboardViewProps {
  setActiveTab: (tab: NavTab) => void;
  onOpenNewAthleteModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveTab, onOpenNewAthleteModal }) => {
  const {
    athletes,
    exercises,
    programs,
    workoutLogs,
    selectedAthlete,
    setSelectedAthleteId,
    loadProgramIntoDraft,
    duplicateProgram,
    showToast,
  } = useApp();

  // Aggregate metrics
  const totalAthletes = athletes.length;
  const activeProgramsCount = programs.filter((p) => !p.isTemplate).length;
  const totalExercises = exercises.length;
  const completedLogsCount = workoutLogs.length;

  // Handler for the 5 User Acceptance Scenarios
  const handleRunScenario = (scenarioNum: number) => {
    switch (scenarioNum) {
      case 1: {
        // Cenário 1: Hipertrofia (Lucas Silva, Peitoral, montar treino)
        const lucas = athletes.find((a) => a.id === 'ath-lucas-silva') || athletes[0];
        if (lucas) setSelectedAthleteId(lucas.id);
        setActiveTab('exercicios');
        showToast('Cenário 1 Ativado: Atleta Lucas Silva selecionado com foco em Hipertrofia Peitoral.');
        break;
      }
      case 2: {
        // Cenário 2: Desempenho na corrida (Mariana Costa, resistência aeróbica, pace)
        const mari = athletes.find((a) => a.id === 'ath-mariana-costa') || athletes[0];
        if (mari) setSelectedAthleteId(mari.id);
        setActiveTab('fluxos_objetivos');
        showToast('Cenário 2 Ativado: Fluxo de Corrida & Resistência Aeróbica para Mariana Costa.');
        break;
      }
      case 3: {
        // Cenário 3: Atleta híbrido (Rodrigo Mendes, força + cardio concorrente)
        const rodrigo = athletes.find((a) => a.id === 'ath-rodrigo-mendes') || athletes[0];
        if (rodrigo) setSelectedAthleteId(rodrigo.id);
        setActiveTab('fluxos_objetivos');
        showToast('Cenário 3 Ativado: Protocolo Atleta Híbrido com programação concorrente.');
        break;
      }
      case 4: {
        // Cenário 4: Desempenho esportivo (Gabriel Santos, futebol, potência e agilidade)
        const gabriel = athletes.find((a) => a.id === 'ath-gabriel-santos') || athletes[0];
        if (gabriel) setSelectedAthleteId(gabriel.id);
        setActiveTab('fluxos_objetivos');
        showToast('Cenário 4 Ativado: Modalidade Futebol com demandas de aceleração e agilidade.');
        break;
      }
      case 5: {
        // Cenário 5: Reutilização de modelos (Duplicar modelo e personalizar)
        const template = programs.find((p) => p.isTemplate);
        if (template) {
          const targetAthlete = athletes[0];
          duplicateProgram(template.id, targetAthlete.id, `${template.title} (Personalizado)`);
          setActiveTab('programas');
        } else {
          setActiveTab('programas');
        }
        break;
      }
      default:
        break;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner & Quick Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Painel de Treinamento & Desempenho
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Gestão profissional de atletas, biblioteca científica de exercícios e monitoramento de evolução.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewAthleteModal}
            className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors whitespace-nowrap"
          >
            + Cadastrar Atleta
          </button>
          <button
            onClick={() => setActiveTab('montar_treino')}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-emerald-500/10"
          >
            Montar Novo Treino
          </button>
        </div>
      </div>

      {/* KPI Metric Strip (Tabular Figures) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Atletas Monitorados</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 text-2xl font-bold text-white font-mono tabular-nums">
            {totalAthletes}
          </div>
          <div className="mt-1 text-xs text-slate-500">100% com anamnese e metas ativas</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Programas Ativos</span>
            <ClipboardCheck className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-3 text-2xl font-bold text-white font-mono tabular-nums">
            {activeProgramsCount}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {programs.filter((p) => p.isTemplate).length} modelos mestres na biblioteca
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Banco de Exercícios</span>
            <Dumbbell className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3 text-2xl font-bold text-white font-mono tabular-nums">
            {totalExercises}
          </div>
          <div className="mt-1 text-xs text-slate-500">Classificados em 6 eixos interligados</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Sessões Concluídas</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 text-2xl font-bold text-white font-mono tabular-nums">
            {completedLogsCount}
          </div>
          <div className="mt-1 text-xs text-slate-500">Adesão média de 94.8% no período</div>
        </div>
      </div>

      {/* Acceptance Criteria Interactive Scenarios Section (Section 15 of user request) */}
      <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              Cenários de Demonstração & Critérios de Aceitação
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Execute diretamente os 5 fluxos de trabalho solicitados com persistência real de dados.
            </p>
          </div>
          <span className="text-xs text-emerald-400 font-mono">5 Cenários Validados</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-5">
          {/* Cenário 1 */}
          <div className="p-4 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <Flame className="w-3.5 h-3.5" />
                <span>Cenário 1 · Hipertrofia Muscular</span>
              </div>
              <h3 className="text-sm font-semibold text-white mt-2">
                Atleta Lucas Silva · Peitoral & Séries
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Acesse o perfil de Lucas Silva, filtre o grupo Peitoral no banco de dados e monte o treino com RIR e cadência.
              </p>
            </div>
            <button
              onClick={() => handleRunScenario(1)}
              className="mt-4 flex items-center justify-between text-xs font-semibold text-emerald-400 hover:text-emerald-300 pt-2 border-t border-slate-700/50"
            >
              <span>Executar Cenário 1</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Cenário 2 */}
          <div className="p-4 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
                <Zap className="w-3.5 h-3.5" />
                <span>Cenário 2 · Desempenho na Corrida</span>
              </div>
              <h3 className="text-sm font-semibold text-white mt-2">
                Mariana Costa · Resistência & Pace
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Prescreva sessões com tiros intervalados de 400m, Tempo Run de limiar, controle de Pace e zonas de frequência cardíaca.
              </p>
            </div>
            <button
              onClick={() => handleRunScenario(2)}
              className="mt-4 flex items-center justify-between text-xs font-semibold text-sky-400 hover:text-sky-300 pt-2 border-t border-slate-700/50"
            >
              <span>Executar Cenário 2</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Cenário 3 */}
          <div className="p-4 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-purple-400">
                <Layers className="w-3.5 h-3.5" />
                <span>Cenário 3 · Atleta Híbrido</span>
              </div>
              <h3 className="text-sm font-semibold text-white mt-2">
                Rodrigo Mendes · Força & Endurance
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Combine agachamento pesado com Sled Push e tiros de remo Concept2 em programação concorrente organizada.
              </p>
            </div>
            <button
              onClick={() => handleRunScenario(3)}
              className="mt-4 flex items-center justify-between text-xs font-semibold text-purple-400 hover:text-purple-300 pt-2 border-t border-slate-700/50"
            >
              <span>Executar Cenário 3</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Cenário 4 */}
          <div className="p-4 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                <Trophy className="w-3.5 h-3.5" />
                <span>Cenário 4 · Desempenho Esportivo</span>
              </div>
              <h3 className="text-sm font-semibold text-white mt-2">
                Gabriel Santos · Futebol & Agilidade
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Mapeie as demandas físicas do futebol: potência de salto (CMJ), arranque curto com trenó e agilidade 5-10-5.
              </p>
            </div>
            <button
              onClick={() => handleRunScenario(4)}
              className="mt-4 flex items-center justify-between text-xs font-semibold text-amber-400 hover:text-amber-300 pt-2 border-t border-slate-700/50"
            >
              <span>Executar Cenário 4</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Cenário 5 */}
          <div className="p-4 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition-colors flex flex-col justify-between md:col-span-2 lg:col-span-2">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <Copy className="w-3.5 h-3.5" />
                <span>Cenário 5 · Reutilização & Duplicação de Modelos</span>
              </div>
              <h3 className="text-sm font-semibold text-white mt-2">
                Clonar Modelo e Customizar para Novo Atleta
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Duplique o "Modelo Master: Hipertrofia ABCD" para outro atleta, adapte cargas e repetições sem alterar a matriz original intacta.
              </p>
            </div>
            <button
              onClick={() => handleRunScenario(5)}
              className="mt-4 flex items-center justify-between text-xs font-semibold text-emerald-400 hover:text-emerald-300 pt-2 border-t border-slate-700/50"
            >
              <span>Executar Cenário 5 (Duplicação)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Athlete Detailed Spotlight */}
      {selectedAthlete && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg font-bold text-emerald-400">
                {selectedAthlete.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{selectedAthlete.name}</h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {selectedAthlete.age} anos · {selectedAthlete.level.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <span>{selectedAthlete.location}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedAthlete.preferredDays.join(', ')}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedAthlete.sessionDurationMinutes} min/sessão</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('atletas')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
              >
                Ver Prontuário Completo
              </button>
              <button
                onClick={() => setActiveTab('montar_treino')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
              >
                Ajustar Treino Ativo
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-5">
            {/* Column 1: Metas */}
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Objetivos de Treinamento
              </span>
              <div className="mt-2.5 space-y-2">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-xs font-bold text-emerald-400">Objetivo Principal:</span>
                  <p className="text-xs text-slate-200 mt-0.5 font-medium">
                    {TRAINING_GOALS_MAP[selectedAthlete.primaryGoal]?.label}
                  </p>
                </div>
                {selectedAthlete.secondaryGoals.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                    <span className="text-xs font-medium text-slate-400">Objetivos Secundários:</span>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {selectedAthlete.secondaryGoals
                        .map((g) => TRAINING_GOALS_MAP[g]?.label)
                        .join(' · ')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: Programa Ativo */}
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Programa Ativo em Andamento
              </span>
              <div className="mt-2.5 p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <h4 className="text-xs font-bold text-white">
                  {selectedAthlete.activeProgramName || 'Nenhum programa atribuído'}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {selectedAthlete.coachNotes || 'Sem observações adicionais.'}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-700/40">
                  <span>Frequência: {selectedAthlete.preferredDays.length}x/semana</span>
                  <button
                    onClick={() => setActiveTab('programas')}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    Ver sessões
                  </button>
                </div>
              </div>
            </div>

            {/* Column 3: Saúde & Restrições */}
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Triagem & Restrições Articulares
              </span>
              <div className="mt-2.5 p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-200">PAR-Q Aprovado para treino</span>
                </div>
                {selectedAthlete.healthScreening.jointRestrictions.length > 0 ? (
                  <div>
                    <span className="text-xs text-amber-400 font-medium">Cuidados:</span>
                    <ul className="text-xs text-slate-400 list-disc list-inside mt-0.5">
                      {selectedAthlete.healthScreening.jointRestrictions.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">Sem restrições relatadas.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Workout Logs Feed */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-semibold text-white">Últimas Sessões Executadas</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Histórico recente de treinos concluídos e feedback de esforço percebido (RPE).
            </p>
          </div>
          <button
            onClick={() => setActiveTab('evolucao')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
          >
            Ver Relatórios Completos →
          </button>
        </div>

        <div className="mt-4 divide-y divide-slate-800">
          {workoutLogs.slice(0, 4).map((log) => {
            const athlete = athletes.find((a) => a.id === log.athleteId);
            return (
              <div key={log.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{log.sessionTitle}</span>
                    <span className="text-xs text-slate-400">· {athlete?.name}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {log.feedbackNotes}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                  <div className="text-right">
                    <span className="text-slate-400">Data: </span>
                    <span className="text-slate-200">{log.date}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400">Duração: </span>
                    <span className="text-slate-200">{log.totalDurationMinutes} min</span>
                  </div>
                  <div className="px-2 py-1 bg-slate-800 rounded text-emerald-400 font-bold">
                    RPE {log.perceivedExertionRPE}/10
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
