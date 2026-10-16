import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PhysicalAssessment } from '../types';
import {
  FileCheck2,
  Plus,
  TrendingUp,
  TrendingDown,
  Calendar,
  Trash2,
  User,
  ArrowRight,
  ShieldAlert,
  Award,
} from 'lucide-react';

interface AssessmentsViewProps {
  onOpenNewAssessmentModal: () => void;
}

export const AssessmentsView: React.FC<AssessmentsViewProps> = ({ onOpenNewAssessmentModal }) => {
  const { assessments, athletes, selectedAthleteId, setSelectedAthleteId, deleteAssessment } = useApp();

  const [activeFilterAthleteId, setActiveFilterAthleteId] = useState<string>(() => {
    try {
      return localStorage.getItem('avaliacoes_filterAthleteId') || selectedAthleteId || 'all';
    } catch (e) {
      return selectedAthleteId || 'all';
    }
  });

  React.useEffect(() => {
    try {
      localStorage.setItem('avaliacoes_filterAthleteId', activeFilterAthleteId);
    } catch (e) {}
  }, [activeFilterAthleteId]);

  const filteredAssessments = assessments
    .filter((a) => activeFilterAthleteId === 'all' || a.athleteId === activeFilterAthleteId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Comparison between two assessments for the selected athlete
  const athleteAssessmentsChronological = assessments
    .filter((a) => a.athleteId === (activeFilterAthleteId === 'all' ? selectedAthleteId : activeFilterAthleteId))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const initialAssessment = athleteAssessmentsChronological[0] || null;
  const recentAssessment =
    athleteAssessmentsChronological.length > 1
      ? athleteAssessmentsChronological[athleteAssessmentsChronological.length - 1]
      : null;

  const currentAthleteObj = athletes.find(
    (a) => a.id === (activeFilterAthleteId === 'all' ? selectedAthleteId : activeFilterAthleteId)
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Avaliações Físicas & Testes de Desempenho
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Antropometria, composição corporal estimada, testes neuromusculares de 1RM, salto vertical, corrida e agilidade.
          </p>
        </div>

        <button
          onClick={onOpenNewAssessmentModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto shadow-sm shadow-emerald-500/10"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Registrar Nova Avaliação</span>
        </button>
      </div>

      {/* Athlete Selector Filter */}
      <div className="flex items-center gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <span className="text-xs text-slate-400 font-medium">Filtrar por Atleta:</span>
        <select
          value={activeFilterAthleteId}
          onChange={(e) => {
            setActiveFilterAthleteId(e.target.value);
            if (e.target.value !== 'all') setSelectedAthleteId(e.target.value);
          }}
          className="px-3 py-1.5 bg-slate-800 text-xs text-slate-200 rounded-lg border border-slate-700 focus:outline-none"
        >
          <option value="all">Todos os Atletas</option>
          {athletes.map((ath) => (
            <option key={ath.id} value={ath.id}>
              {ath.name}
            </option>
          ))}
        </select>
      </div>

      {/* Side-by-Side Assessment Comparison (Before vs After) */}
      {initialAssessment && recentAssessment && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                Comparativo de Evolução: {currentAthleteObj?.name}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Avaliação Inicial ({initialAssessment.date}) vs. Reavaliação Recente ({recentAssessment.date})
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              + Variação Fisiológica
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            {/* Peso Corporal */}
            {initialAssessment.measurements.weightKg && recentAssessment.measurements.weightKg && (
              <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-sans block text-[11px]">Peso Corporal</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-slate-400">{initialAssessment.measurements.weightKg}kg</span>
                  <span className="text-slate-500 font-sans">→</span>
                  <span className="text-white font-bold">{recentAssessment.measurements.weightKg}kg</span>
                </div>
                <div className="text-[10px] text-emerald-400 mt-1">
                  {(recentAssessment.measurements.weightKg - initialAssessment.measurements.weightKg > 0 ? '+' : '')}
                  {(recentAssessment.measurements.weightKg - initialAssessment.measurements.weightKg).toFixed(1)} kg
                </div>
              </div>
            )}

            {/* % Gordura Estimada */}
            {initialAssessment.measurements.bodyFatPercentageEstimated &&
              recentAssessment.measurements.bodyFatPercentageEstimated && (
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-sans block text-[11px]">% Gordura (Estimado)</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-slate-400">{initialAssessment.measurements.bodyFatPercentageEstimated}%</span>
                    <span className="text-slate-500 font-sans">→</span>
                    <span className="text-emerald-400 font-bold">{recentAssessment.measurements.bodyFatPercentageEstimated}%</span>
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-1">
                    {(recentAssessment.measurements.bodyFatPercentageEstimated - initialAssessment.measurements.bodyFatPercentageEstimated).toFixed(1)}%
                  </div>
                </div>
              )}

            {/* 1RM Supino ou Agachamento */}
            {initialAssessment.performanceTests.benchPress1RMKg &&
              recentAssessment.performanceTests.benchPress1RMKg && (
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-sans block text-[11px]">1RM Supino Reto</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-slate-400">{initialAssessment.performanceTests.benchPress1RMKg}kg</span>
                    <span className="text-slate-500 font-sans">→</span>
                    <span className="text-white font-bold">{recentAssessment.performanceTests.benchPress1RMKg}kg</span>
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-1">
                    +{(recentAssessment.performanceTests.benchPress1RMKg - initialAssessment.performanceTests.benchPress1RMKg)} kg (+
                    {(
                      ((recentAssessment.performanceTests.benchPress1RMKg - initialAssessment.performanceTests.benchPress1RMKg) /
                        initialAssessment.performanceTests.benchPress1RMKg) *
                      100
                    ).toFixed(1)}
                    %)
                  </div>
                </div>
              )}

            {/* Salto Vertical ou Cooper */}
            {initialAssessment.performanceTests.verticalJumpCm &&
              recentAssessment.performanceTests.verticalJumpCm && (
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-sans block text-[11px]">Salto Vertical (CMJ)</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-slate-400">{initialAssessment.performanceTests.verticalJumpCm}cm</span>
                    <span className="text-slate-500 font-sans">→</span>
                    <span className="text-white font-bold">{recentAssessment.performanceTests.verticalJumpCm}cm</span>
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-1">
                    +{(recentAssessment.performanceTests.verticalJumpCm - initialAssessment.performanceTests.verticalJumpCm)} cm
                  </div>
                </div>
              )}

            {/* Teste de Cooper 12min */}
            {initialAssessment.performanceTests.cooper12MinMeters &&
              recentAssessment.performanceTests.cooper12MinMeters && (
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-sans block text-[11px]">Teste Cooper (12 min)</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-slate-400">{initialAssessment.performanceTests.cooper12MinMeters}m</span>
                    <span className="text-slate-500 font-sans">→</span>
                    <span className="text-white font-bold">{recentAssessment.performanceTests.cooper12MinMeters}m</span>
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-1">
                    +{(recentAssessment.performanceTests.cooper12MinMeters - initialAssessment.performanceTests.cooper12MinMeters)}m
                  </div>
                </div>
              )}
          </div>
        </div>
      )}

      {/* Assessments Log List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white">Histórico Detalhado de Registros</h3>

        <div className="space-y-3">
          {filteredAssessments.map((asmt) => (
            <div
              key={asmt.id}
              className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">
                    {asmt.athleteName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{asmt.athleteName}</h4>
                    <span className="text-xs text-slate-400 font-mono">
                      Data: {asmt.date} · Tipo: {asmt.type.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (confirm('Excluir esta avaliação?')) {
                        deleteAssessment(asmt.id);
                      }
                    }}
                    className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-slate-800 rounded"
                    title="Excluir avaliação"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Anthropometric & Test Results */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                {asmt.measurements.weightKg && (
                  <div className="p-2.5 bg-slate-800/40 rounded-lg">
                    <span className="text-slate-400 text-[10px] font-sans block">Peso</span>
                    <span className="text-white font-bold">{asmt.measurements.weightKg} kg</span>
                  </div>
                )}
                {asmt.measurements.bodyFatPercentageEstimated && (
                  <div className="p-2.5 bg-slate-800/40 rounded-lg">
                    <span className="text-slate-400 text-[10px] font-sans block">% Gordura (Estimativa)</span>
                    <span className="text-emerald-400 font-bold">
                      {asmt.measurements.bodyFatPercentageEstimated}%
                    </span>
                  </div>
                )}
                {asmt.performanceTests.benchPress1RMKg && (
                  <div className="p-2.5 bg-slate-800/40 rounded-lg">
                    <span className="text-slate-400 text-[10px] font-sans block">1RM Supino</span>
                    <span className="text-white font-bold">
                      {asmt.performanceTests.benchPress1RMKg} kg
                    </span>
                  </div>
                )}
                {asmt.performanceTests.squat1RMKg && (
                  <div className="p-2.5 bg-slate-800/40 rounded-lg">
                    <span className="text-slate-400 text-[10px] font-sans block">1RM Agachamento</span>
                    <span className="text-white font-bold">
                      {asmt.performanceTests.squat1RMKg} kg
                    </span>
                  </div>
                )}
                {asmt.performanceTests.verticalJumpCm && (
                  <div className="p-2.5 bg-slate-800/40 rounded-lg">
                    <span className="text-slate-400 text-[10px] font-sans block">Salto CMJ</span>
                    <span className="text-white font-bold">
                      {asmt.performanceTests.verticalJumpCm} cm
                    </span>
                  </div>
                )}
                {asmt.performanceTests.fiveKmPaceMinutes && (
                  <div className="p-2.5 bg-slate-800/40 rounded-lg">
                    <span className="text-slate-400 text-[10px] font-sans block">Pace nos 5km</span>
                    <span className="text-white font-bold">
                      {asmt.performanceTests.fiveKmPaceMinutes}
                    </span>
                  </div>
                )}
                {asmt.performanceTests.sprint30mMilisecs && (
                  <div className="p-2.5 bg-slate-800/40 rounded-lg">
                    <span className="text-slate-400 text-[10px] font-sans block">Sprint 30m</span>
                    <span className="text-white font-bold">
                      {(asmt.performanceTests.sprint30mMilisecs / 1000).toFixed(2)}s
                    </span>
                  </div>
                )}
                {asmt.performanceTests.proAgilitySeconds && (
                  <div className="p-2.5 bg-slate-800/40 rounded-lg">
                    <span className="text-slate-400 text-[10px] font-sans block">Agilidade 5-10-5</span>
                    <span className="text-white font-bold">
                      {asmt.performanceTests.proAgilitySeconds}s
                    </span>
                  </div>
                )}
              </div>

              {/* Protocol Note Warning (Section 9 Requirement: Do not treat estimates as direct measures) */}
              {asmt.measurements.bodyFatProtocol && (
                <div className="text-[11px] text-slate-400 italic flex items-center gap-1.5">
                  <span className="text-amber-400">Nota Metodológica:</span>
                  <span>{asmt.measurements.bodyFatProtocol}</span>
                </div>
              )}

              {/* Coach Technical Interpretation */}
              <div className="pt-2 border-t border-slate-800 text-xs">
                <span className="font-semibold text-slate-400">Interpretação do Treinador:</span>
                <p className="text-slate-200 mt-1 leading-relaxed">{asmt.coachInterpretation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
