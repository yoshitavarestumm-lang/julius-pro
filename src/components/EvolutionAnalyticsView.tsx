import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  Activity,
  Calendar,
  Award,
  Zap,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Dumbbell,
  CheckCircle2,
} from 'lucide-react';

export const EvolutionAnalyticsView: React.FC = () => {
  const { athletes, selectedAthleteId, setSelectedAthleteId, workoutLogs, assessments, programs } = useApp();

  const currentAthlete = athletes.find((a) => a.id === selectedAthleteId) || athletes[0];

  // Selected metric tabs for Chart 1 & Chart 2 with Lazy State Initialization
  const [compositionMetric, setCompositionMetric] = useState<'weight' | 'bodyFat' | 'waist'>(() => {
    try {
      const salvo = localStorage.getItem('evolucao_metricas');
      if (salvo) {
        const parsed = JSON.parse(salvo);
        if (parsed.compositionMetric) return parsed.compositionMetric;
      }
    } catch (e) {}
    return 'weight';
  });

  const [performanceMetric, setPerformanceMetric] = useState<string>(() => {
    try {
      const salvo = localStorage.getItem('evolucao_metricas');
      if (salvo) {
        const parsed = JSON.parse(salvo);
        if (parsed.performanceMetric) return parsed.performanceMetric;
      }
    } catch (e) {}
    return 'auto';
  });

  React.useEffect(() => {
    try {
      localStorage.setItem(
        'evolucao_metricas',
        JSON.stringify({ compositionMetric, performanceMetric })
      );
    } catch (e) {}
  }, [compositionMetric, performanceMetric]);

  // Filter athlete assessments chronologically
  const athleteAssessments = useMemo(() => {
    return assessments
      .filter((a) => a.athleteId === currentAthlete?.id)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [assessments, currentAthlete?.id]);

  // Filter athlete workout logs
  const athleteLogs = useMemo(() => {
    return workoutLogs
      .filter((l) => l.athleteId === currentAthlete?.id)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [workoutLogs, currentAthlete?.id]);

  // Filter athlete programs created or assigned in 'Montar Treino'
  const athletePrograms = useMemo(() => {
    return programs.filter((p) => !p.isTemplate && p.athleteId === currentAthlete?.id);
  }, [programs, currentAthlete?.id]);

  // Calculate volume load from assigned programs
  const programVolumeCalculations = useMemo(() => {
    let totalPlannedTonnage = 0;
    let totalPlannedDistanceKm = 0;
    let totalPrescribedSets = 0;
    const muscleSeriesMap: Record<string, number> = {};

    athletePrograms.forEach((prog) => {
      prog.sessions.forEach((sess) => {
        sess.exercises.forEach((ex) => {
          totalPrescribedSets += ex.sets || 0;

          // Parse Reps (e.g. "8 a 10" -> 9, "10 reps" -> 10, "12" -> 12)
          let repsNum = 10;
          const repMatch = (ex.repsOrDuration || '').match(/\d+/g);
          if (repMatch) {
            if (repMatch.length >= 2) {
              repsNum = (Number(repMatch[0]) + Number(repMatch[1])) / 2;
            } else {
              repsNum = Number(repMatch[0]);
            }
          }

          // Parse Load (e.g. "95 kg" -> 95, "80% 1RM" -> estimate, "Peso Corporal" -> 0)
          let loadKg = 0;
          const loadMatch = (ex.loadPrescription || '').match(/(\d+[\.,]?\d*)\s*kg/i);
          if (loadMatch) {
            loadKg = parseFloat(loadMatch[1].replace(',', '.'));
          } else {
            const rawNumMatch = (ex.loadPrescription || '').match(/\d+/);
            if (rawNumMatch && !ex.loadPrescription.includes('%')) {
              loadKg = parseFloat(rawNumMatch[0]);
            }
          }

          if (loadKg > 0 && repsNum > 0 && ex.sets > 0) {
            totalPlannedTonnage += ex.sets * repsNum * loadKg;
          }

          // Distance
          if (ex.distanceMeters) {
            totalPlannedDistanceKm += (ex.distanceMeters * (ex.sets || 1)) / 1000;
          }
        });
      });
    });

    return {
      totalPlannedTonnage,
      totalPlannedDistanceKm,
      totalPrescribedSets,
      totalSessions: athletePrograms.reduce((acc, p) => acc + p.sessions.length, 0),
    };
  }, [athletePrograms]);

  // Aggregate stats dynamically
  const loggedTonnage = athleteLogs.reduce((acc, curr) => acc + (curr.tonnageKg || 0), 0);
  const totalVolumeTonnage = loggedTonnage > 0 ? loggedTonnage : programVolumeCalculations.totalPlannedTonnage;

  const loggedDistance = athleteLogs.reduce((acc, curr) => acc + (curr.distanceCoveredKm || 0), 0);
  const totalDistance = loggedDistance > 0 ? loggedDistance : programVolumeCalculations.totalPlannedDistanceKm;

  const averageRPE =
    athleteLogs.length > 0
      ? (athleteLogs.reduce((acc, curr) => acc + curr.perceivedExertionRPE, 0) / athleteLogs.length).toFixed(1)
      : '8.0';

  // Available performance test keys with valid data for this athlete
  const availablePerformanceMetrics = useMemo(() => {
    const metrics: { id: string; label: string; unit: string }[] = [];
    const hasBench = athleteAssessments.some((a) => a.performanceTests.benchPress1RMKg);
    const hasSquat = athleteAssessments.some((a) => a.performanceTests.squat1RMKg);
    const hasDeadlift = athleteAssessments.some((a) => a.performanceTests.deadlift1RMKg);
    const hasJump = athleteAssessments.some((a) => a.performanceTests.verticalJumpCm);
    const hasCooper = athleteAssessments.some((a) => a.performanceTests.cooper12MinMeters);
    const hasSprint = athleteAssessments.some((a) => a.performanceTests.sprint30mMilisecs);
    const hasAgility = athleteAssessments.some((a) => a.performanceTests.proAgilitySeconds);

    if (hasBench) metrics.push({ id: 'bench', label: '1RM Supino', unit: 'kg' });
    if (hasSquat) metrics.push({ id: 'squat', label: '1RM Agachamento', unit: 'kg' });
    if (hasDeadlift) metrics.push({ id: 'deadlift', label: '1RM Terra', unit: 'kg' });
    if (hasJump) metrics.push({ id: 'jump', label: 'Salto CMJ', unit: 'cm' });
    if (hasCooper) metrics.push({ id: 'cooper', label: 'Cooper 12min', unit: 'm' });
    if (hasSprint) metrics.push({ id: 'sprint', label: 'Sprint 30m', unit: 's' });
    if (hasAgility) metrics.push({ id: 'agility', label: 'Agilidade 5-10-5', unit: 's' });

    return metrics;
  }, [athleteAssessments]);

  // Determine active performance metric
  const activePerfMetricId = useMemo(() => {
    if (performanceMetric !== 'auto' && availablePerformanceMetrics.some((m) => m.id === performanceMetric)) {
      return performanceMetric;
    }
    return availablePerformanceMetrics[0]?.id || 'bench';
  }, [performanceMetric, availablePerformanceMetrics]);

  // Extract data series for Chart 1 (Composition)
  const compositionData = useMemo(() => {
    return athleteAssessments
      .map((a) => {
        let val: number | null = null;
        if (compositionMetric === 'weight') val = a.measurements.weightKg ?? null;
        if (compositionMetric === 'bodyFat') val = a.measurements.bodyFatPercentageEstimated ?? null;
        if (compositionMetric === 'waist') val = a.measurements.waistCircumferenceCm ?? null;
        return {
          id: a.id,
          date: a.date,
          value: val,
        };
      })
      .filter((d) => d.value !== null) as { id: string; date: string; value: number }[];
  }, [athleteAssessments, compositionMetric]);

  // Extract data series for Chart 2 (Performance)
  const performanceData = useMemo(() => {
    return athleteAssessments
      .map((a) => {
        let val: number | null = null;
        if (activePerfMetricId === 'bench') val = a.performanceTests.benchPress1RMKg ?? null;
        if (activePerfMetricId === 'squat') val = a.performanceTests.squat1RMKg ?? null;
        if (activePerfMetricId === 'deadlift') val = a.performanceTests.deadlift1RMKg ?? null;
        if (activePerfMetricId === 'jump') val = a.performanceTests.verticalJumpCm ?? null;
        if (activePerfMetricId === 'cooper') val = a.performanceTests.cooper12MinMeters ?? null;
        if (activePerfMetricId === 'sprint')
          val = a.performanceTests.sprint30mMilisecs ? a.performanceTests.sprint30mMilisecs / 1000 : null;
        if (activePerfMetricId === 'agility') val = a.performanceTests.proAgilitySeconds ?? null;
        return {
          id: a.id,
          date: a.date,
          value: val,
        };
      })
      .filter((d) => d.value !== null) as { id: string; date: string; value: number }[];
  }, [athleteAssessments, activePerfMetricId]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Painel de Evolução & Desempenho
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Recalculado em tempo real com base nas avaliações e treinos salvos de cada atleta.
          </p>
        </div>

        {/* Athlete Quick Selector */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2 rounded-xl">
          <span className="text-xs text-slate-400 font-medium">Atleta:</span>
          <select
            value={currentAthlete?.id || ''}
            onChange={(e) => setSelectedAthleteId(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 text-xs font-bold text-white rounded-lg border border-slate-700 focus:outline-none"
          >
            {athletes.map((ath) => (
              <option key={ath.id} value={ath.id}>
                {ath.name} ({ath.level})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards Strip - Dynamically Recalculated */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 font-medium">Sessões do Atleta</span>
          <div className="text-2xl font-bold text-white font-mono mt-2 tabular-nums">
            {athleteLogs.length > 0 ? athleteLogs.length : programVolumeCalculations.totalSessions}
          </div>
          <span className="text-[11px] text-emerald-400 mt-1 block">
            {athleteLogs.length > 0
              ? `${athleteLogs.length} sessões concluídas`
              : `${programVolumeCalculations.totalSessions} sessões prescritas`}
          </span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 font-medium">Percepção Esforço (RPE)</span>
          <div className="text-2xl font-bold text-white font-mono mt-2 tabular-nums">
            RPE {averageRPE}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {athleteLogs.length > 0 ? 'Média real dos registros' : 'RPE alvo prescrito'}
          </span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 font-medium">Volume de Treino (Tonnage)</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-2 tabular-nums">
            {totalVolumeTonnage > 0 ? `${(totalVolumeTonnage / 1000).toFixed(1)} tons` : '-'}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {loggedTonnage > 0 ? 'Carga total levantada' : 'Volume planejado no treino'}
          </span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 font-medium">Distância Monitorada</span>
          <div className="text-2xl font-bold text-sky-400 font-mono mt-2 tabular-nums">
            {totalDistance > 0 ? `${totalDistance.toFixed(1)} km` : '-'}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {loggedDistance > 0 ? 'Km completados' : 'Km planejados no programa'}
          </span>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Evolução Antropométrica & Composição Corporal */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Composição Corporal & Medidas
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {athleteAssessments.length} avaliações registradas no histórico
              </p>
            </div>

            {/* Metric Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-800/80 rounded-lg border border-slate-700/60 self-start sm:self-auto">
              <button
                onClick={() => setCompositionMetric('weight')}
                className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                  compositionMetric === 'weight'
                    ? 'bg-emerald-400 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Peso (kg)
              </button>
              <button
                onClick={() => setCompositionMetric('bodyFat')}
                className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                  compositionMetric === 'bodyFat'
                    ? 'bg-emerald-400 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                % Gordura
              </button>
              <button
                onClick={() => setCompositionMetric('waist')}
                className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                  compositionMetric === 'waist'
                    ? 'bg-emerald-400 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Cintura
              </button>
            </div>
          </div>

          {compositionData.length > 0 ? (
            <div className="space-y-4">
              {/* Dynamic SVG / HTML Bar Chart with auto-scaling */}
              {(() => {
                const values = compositionData.map((d) => d.value);
                const min = Math.min(...values);
                const max = Math.max(...values);
                const range = max - min || 1;
                const unit =
                  compositionMetric === 'weight' ? 'kg' : compositionMetric === 'bodyFat' ? '%' : 'cm';

                const delta = values.length >= 2 ? values[values.length - 1] - values[0] : 0;

                return (
                  <div>
                    {/* Evolution Delta Header */}
                    <div className="flex items-center justify-between text-xs font-mono mb-2">
                      <span className="text-slate-400">
                        Inicial: <strong className="text-slate-200">{values[0]} {unit}</strong>
                      </span>
                      {values.length >= 2 && (
                        <span
                          className={`font-bold flex items-center gap-0.5 ${
                            delta > 0
                              ? compositionMetric === 'bodyFat'
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {delta > 0 ? (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          )}
                          {delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)} {unit} (
                          {((delta / values[0]) * 100).toFixed(1)}%)
                        </span>
                      )}
                      <span className="text-slate-400">
                        Atual: <strong className="text-emerald-400">{values[values.length - 1]} {unit}</strong>
                      </span>
                    </div>

                    {/* Dynamic Graphic Bars */}
                    <div className="h-44 w-full flex items-end gap-4 pt-8 pb-2 px-4 bg-slate-800/30 rounded-xl border border-slate-800/80">
                      {compositionData.map((item, idx) => {
                        // Calculate percentage relative to min/max with comfortable visual baseline
                        const heightPct =
                          range === 0
                            ? 70
                            : Math.round(35 + ((item.value - min) / range) * 55);

                        return (
                          <div
                            key={item.id}
                            className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative"
                          >
                            <span className="text-[11px] font-mono font-bold text-emerald-400">
                              {item.value} {unit}
                            </span>
                            <div
                              style={{ height: `${heightPct}%` }}
                              className="w-full max-w-[56px] bg-emerald-500/30 border border-emerald-400 rounded-t-lg transition-all group-hover:bg-emerald-500/50"
                            />
                            <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                              {item.date.slice(5)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              <div className="p-3 bg-slate-800/40 rounded-xl text-xs space-y-1">
                <span className="font-semibold text-slate-300">Resumo Metodológico:</span>
                <p className="text-slate-400 leading-relaxed">
                  {athleteAssessments[athleteAssessments.length - 1]?.measurements.bodyFatProtocol ||
                    'Acompanhamento contínuo dos marcos antropométricos.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              Nenhuma avaliação cadastrada ainda para este atleta. Registre uma nova avaliação na aba "Avaliações" para ver os pontos aqui.
            </div>
          )}
        </div>

        {/* Chart 2: Evolução de Força Máxima & Capacidade Específica */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-sky-400" />
                Desempenho Físico & Força (1RM / Testes)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Curva de evolução temporal nos testes de campo
              </p>
            </div>

            {/* Test Metric Selector */}
            {availablePerformanceMetrics.length > 0 && (
              <select
                value={activePerfMetricId}
                onChange={(e) => setPerformanceMetric(e.target.value)}
                className="px-2.5 py-1 bg-slate-800 text-xs font-bold text-sky-400 rounded-lg border border-slate-700 focus:outline-none self-start sm:self-auto"
              >
                {availablePerformanceMetrics.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label} ({m.unit})
                  </option>
                ))}
              </select>
            )}
          </div>

          {performanceData.length > 0 ? (
            <div className="space-y-4">
              {(() => {
                const values = performanceData.map((d) => d.value);
                const min = Math.min(...values);
                const max = Math.max(...values);
                const range = max - min || 1;
                const activeMeta = availablePerformanceMetrics.find((m) => m.id === activePerfMetricId);
                const unit = activeMeta?.unit || '';

                const delta = values.length >= 2 ? values[values.length - 1] - values[0] : 0;
                const isSprintOrAgility = activePerfMetricId === 'sprint' || activePerfMetricId === 'agility';

                return (
                  <div>
                    {/* Header Delta */}
                    <div className="flex items-center justify-between text-xs font-mono mb-2">
                      <span className="text-slate-400">
                        Teste Inicial: <strong className="text-slate-200">{values[0]} {unit}</strong>
                      </span>
                      {values.length >= 2 && (
                        <span
                          className={`font-bold flex items-center gap-0.5 ${
                            (isSprintOrAgility ? delta < 0 : delta > 0)
                              ? 'text-emerald-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {delta > 0 ? (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          )}
                          {delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)} {unit} (
                          {((Math.abs(delta) / values[0]) * 100).toFixed(1)}%)
                        </span>
                      )}
                      <span className="text-slate-400">
                        Melhor Marca:{' '}
                        <strong className="text-sky-400">
                          {isSprintOrAgility ? min : max} {unit}
                        </strong>
                      </span>
                    </div>

                    {/* SVG Line & Area Graph */}
                    <div className="h-44 w-full bg-slate-800/30 rounded-xl border border-slate-800/80 p-4 flex flex-col justify-between relative">
                      <svg className="w-full h-28 overflow-visible" viewBox={`0 0 ${Math.max(200, performanceData.length * 90)} 100`}>
                        {/* Connecting Line and Dots */}
                        {(() => {
                          const svgWidth = Math.max(200, performanceData.length * 90);
                          const stepX = svgWidth / (Math.max(1, performanceData.length - 1));

                          const points = performanceData.map((d, i) => {
                            const x = performanceData.length === 1 ? svgWidth / 2 : i * stepX;
                            const y = range === 0 ? 50 : 85 - ((d.value - min) / range) * 70;
                            return { x, y, val: d.value, date: d.date };
                          });

                          const pathD =
                            points.length > 1
                              ? points.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '')
                              : '';

                          return (
                            <>
                              {/* Path line */}
                              {pathD && (
                                <path
                                  d={pathD}
                                  fill="none"
                                  stroke="#38bdf8"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              )}

                              {/* Data circles & text */}
                              {points.map((p, idx) => (
                                <g key={idx}>
                                  <circle
                                    cx={p.x}
                                    cy={p.y}
                                    r="5"
                                    className="fill-slate-900 stroke-sky-400 stroke-2"
                                  />
                                  <text
                                    x={p.x}
                                    y={p.y - 10}
                                    textAnchor="middle"
                                    className="text-[10px] font-mono font-bold fill-sky-300"
                                  >
                                    {p.val}
                                  </text>
                                </g>
                              ))}
                            </>
                          );
                        })()}
                      </svg>

                      {/* X-axis dates */}
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                        {performanceData.map((d) => (
                          <span key={d.id}>{d.date.slice(5)}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="p-3 bg-slate-800/40 rounded-xl text-xs space-y-1">
                <span className="font-semibold text-slate-300">Parecer Técnico do Treinador:</span>
                <p className="text-slate-400 leading-relaxed">
                  {athleteAssessments[athleteAssessments.length - 1]?.coachInterpretation ||
                    'Ganhos expressivos na capacidade neuromuscular sem sinais de overreaching.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              Nenhum teste registrado para este atleta ainda. Registre testes de 1RM, salto ou corrida na aba "Avaliações".
            </div>
          )}
        </div>
      </div>

      {/* Program Volume Breakdown Section (Diretamente das Prescrições de 'Montar Treino') */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-emerald-400" />
              Prescrição de Treinos Ativa (Aba 'Montar Treino')
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Programas e divisões atribuídos a {currentAthlete?.name}
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {athletePrograms.length} programa(s) cadastrado(s)
          </span>
        </div>

        {athletePrograms.length > 0 ? (
          <div className="space-y-4">
            {athletePrograms.map((prog) => (
              <div key={prog.id} className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-white">{prog.title}</h4>
                    <span className="text-xs text-slate-400">
                      Divisão {prog.splitType} · {prog.weeklyFrequency}x por semana · Nível {prog.level}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-bold px-2.5 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    {prog.sessions.length} divisões de treino
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
                  {prog.sessions.map((sess) => (
                    <div key={sess.id} className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-xs">
                      <div className="font-bold text-slate-200">{sess.title}</div>
                      <div className="text-slate-400 mt-1 font-mono">
                        {sess.exercises.length} exercícios · ~{sess.estimatedDurationMinutes} min
                      </div>
                      <div className="mt-2 text-[11px] text-slate-400 truncate">
                        {sess.exercises.map((e) => e.exerciseName).slice(0, 3).join(', ')}
                        {sess.exercises.length > 3 ? '...' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-500">
            Nenhum programa atribuído ainda para este atleta. Acesse a aba "Montar Treino" para criar e salvar um treino para {currentAthlete?.name}.
          </div>
        )}
      </div>
    </div>
  );
};
