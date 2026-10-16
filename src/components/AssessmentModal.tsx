import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PhysicalAssessment } from '../types';
import { X, Check, ShieldAlert } from 'lucide-react';

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<PhysicalAssessment, 'id'>) => void;
}

export const AssessmentModal: React.FC<AssessmentModalProps> = ({ isOpen, onClose, onSave }) => {
  const { athletes, selectedAthleteId } = useApp();

  const [athleteId, setAthleteId] = useState<string>(selectedAthleteId || athletes[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState<PhysicalAssessment['type']>('completa');

  // Anthropometry
  const [weightKg, setWeightKg] = useState<string>('80.0');
  const [heightCm, setHeightCm] = useState<string>('180');
  const [bodyFatPercentageEstimated, setBodyFatPercentageEstimated] = useState<string>('14.0');
  const [bodyFatProtocol, setBodyFatProtocol] = useState<string>(
    'Dobras Cutâneas Pollock 7 dobras (Estimativa antropométrica)'
  );
  const [chestCircumferenceCm, setChestCircumferenceCm] = useState<string>('102');
  const [waistCircumferenceCm, setWaistCircumferenceCm] = useState<string>('82');
  const [hipCircumferenceCm, setHipCircumferenceCm] = useState<string>('98');
  const [rightArmFlexedCm, setRightArmFlexedCm] = useState<string>('40.0');
  const [rightThighCm, setRightThighCm] = useState<string>('60.0');

  // Performance Tests
  const [benchPress1RMKg, setBenchPress1RMKg] = useState<string>('100');
  const [squat1RMKg, setSquat1RMKg] = useState<string>('130');
  const [deadlift1RMKg, setDeadlift1RMKg] = useState<string>('160');
  const [verticalJumpCm, setVerticalJumpCm] = useState<string>('50');
  const [cooper12MinMeters, setCooper12MinMeters] = useState<string>('2800');
  const [fiveKmPaceMinutes, setFiveKmPaceMinutes] = useState<string>('4:45 min/km');
  const [sprint30mSeconds, setSprint30mSeconds] = useState<string>('4.10');
  const [proAgilitySeconds, setProAgilitySeconds] = useState<string>('4.50');

  const [coachInterpretation, setCoachInterpretation] = useState(
    'Evolução consistente na capacidade de produção de força máxima e composição corporal adequada.'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const athlete = athletes.find((a) => a.id === athleteId);
    if (!athlete) return;

    onSave({
      athleteId,
      athleteName: athlete.name,
      date,
      type,
      measurements: {
        weightKg: weightKg ? Number(weightKg) : undefined,
        heightCm: heightCm ? Number(heightCm) : undefined,
        bmi: weightKg && heightCm ? Number((Number(weightKg) / ((Number(heightCm) / 100) ** 2)).toFixed(1)) : undefined,
        bodyFatPercentageEstimated: bodyFatPercentageEstimated ? Number(bodyFatPercentageEstimated) : undefined,
        bodyFatProtocol,
        chestCircumferenceCm: chestCircumferenceCm ? Number(chestCircumferenceCm) : undefined,
        waistCircumferenceCm: waistCircumferenceCm ? Number(waistCircumferenceCm) : undefined,
        hipCircumferenceCm: hipCircumferenceCm ? Number(hipCircumferenceCm) : undefined,
        rightArmFlexedCm: rightArmFlexedCm ? Number(rightArmFlexedCm) : undefined,
        rightThighCm: rightThighCm ? Number(rightThighCm) : undefined,
      },
      performanceTests: {
        benchPress1RMKg: benchPress1RMKg ? Number(benchPress1RMKg) : undefined,
        squat1RMKg: squat1RMKg ? Number(squat1RMKg) : undefined,
        deadlift1RMKg: deadlift1RMKg ? Number(deadlift1RMKg) : undefined,
        verticalJumpCm: verticalJumpCm ? Number(verticalJumpCm) : undefined,
        cooper12MinMeters: cooper12MinMeters ? Number(cooper12MinMeters) : undefined,
        fiveKmPaceMinutes: fiveKmPaceMinutes || undefined,
        sprint30mMilisecs: sprint30mSeconds ? Math.round(Number(sprint30mSeconds) * 1000) : undefined,
        proAgilitySeconds: proAgilitySeconds ? Number(proAgilitySeconds) : undefined,
      },
      coachInterpretation,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-lg font-bold text-white">Registrar Avaliação Física & Testes</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Atleta e Data */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Atleta Avaliado *</label>
              <select
                value={athleteId}
                onChange={(e) => setAthleteId(e.target.value)}
                className="w-full p-2 bg-slate-800 text-white font-bold rounded-lg border border-slate-700"
              >
                {athletes.map((ath) => (
                  <option key={ath.id} value={ath.id}>
                    {ath.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Data do Teste</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 bg-slate-800 text-white font-mono rounded-lg border border-slate-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Tipo de Avaliação</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full p-2 bg-slate-800 text-slate-200 rounded-lg border border-slate-700"
              >
                <option value="completa">Avaliação Completa</option>
                <option value="antropometria">Antropometria</option>
                <option value="forca_1rm">Força Máxima (1RM)</option>
                <option value="corrida_cardio">Corrida & Cardio</option>
                <option value="potencia_salto">Potência & Saltos</option>
                <option value="agilidade">Agilidade & Sprints</option>
              </select>
            </div>
          </div>

          {/* Antropometria */}
          <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 space-y-3">
            <span className="font-bold text-emerald-400 block">Antropometria & Composição</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
              <div>
                <label className="text-slate-400 font-sans text-[11px] block">Peso (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full p-1.5 bg-slate-800 text-white rounded border border-slate-700"
                />
              </div>
              <div>
                <label className="text-slate-400 font-sans text-[11px] block">Altura (cm)</label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className="w-full p-1.5 bg-slate-800 text-white rounded border border-slate-700"
                />
              </div>
              <div>
                <label className="text-slate-400 font-sans text-[11px] block">% Gordura (Est.)</label>
                <input
                  type="number"
                  step="0.1"
                  value={bodyFatPercentageEstimated}
                  onChange={(e) => setBodyFatPercentageEstimated(e.target.value)}
                  className="w-full p-1.5 bg-slate-800 text-emerald-400 font-bold rounded border border-slate-700"
                />
              </div>
              <div>
                <label className="text-slate-400 font-sans text-[11px] block">Cintura (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  value={waistCircumferenceCm}
                  onChange={(e) => setWaistCircumferenceCm(e.target.value)}
                  className="w-full p-1.5 bg-slate-800 text-white rounded border border-slate-700"
                />
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <label className="text-slate-400 text-[11px]">
                Protocolo Metodológico Utilizado (Transparência):
              </label>
              <input
                type="text"
                value={bodyFatProtocol}
                onChange={(e) => setBodyFatProtocol(e.target.value)}
                placeholder="Ex: Dobras Cutâneas Pollock 7 dobras (Estimado)"
                className="w-full p-1.5 bg-slate-800 text-slate-300 rounded border border-slate-700 italic"
              />
            </div>
          </div>

          {/* Testes de Desempenho Físico */}
          <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 space-y-3 font-mono">
            <span className="font-bold text-sky-400 font-sans block">
              Testes de Força, Potência e Condicionamento
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="text-slate-400 font-sans text-[11px] block">1RM Supino (kg)</label>
                <input
                  type="number"
                  value={benchPress1RMKg}
                  onChange={(e) => setBenchPress1RMKg(e.target.value)}
                  className="w-full p-1.5 bg-slate-800 text-white rounded border border-slate-700"
                />
              </div>
              <div>
                <label className="text-slate-400 font-sans text-[11px] block">1RM Agachamento (kg)</label>
                <input
                  type="number"
                  value={squat1RMKg}
                  onChange={(e) => setSquat1RMKg(e.target.value)}
                  className="w-full p-1.5 bg-slate-800 text-white rounded border border-slate-700"
                />
              </div>
              <div>
                <label className="text-slate-400 font-sans text-[11px] block">Salto CMJ (cm)</label>
                <input
                  type="number"
                  value={verticalJumpCm}
                  onChange={(e) => setVerticalJumpCm(e.target.value)}
                  className="w-full p-1.5 bg-slate-800 text-white rounded border border-slate-700"
                />
              </div>
              <div>
                <label className="text-slate-400 font-sans text-[11px] block">Cooper 12min (m)</label>
                <input
                  type="number"
                  value={cooper12MinMeters}
                  onChange={(e) => setCooper12MinMeters(e.target.value)}
                  className="w-full p-1.5 bg-slate-800 text-white rounded border border-slate-700"
                />
              </div>
              <div>
                <label className="text-slate-400 font-sans text-[11px] block">Pace 5km</label>
                <input
                  type="text"
                  value={fiveKmPaceMinutes}
                  onChange={(e) => setFiveKmPaceMinutes(e.target.value)}
                  placeholder="4:30 min/km"
                  className="w-full p-1.5 bg-slate-800 text-white rounded border border-slate-700"
                />
              </div>
              <div>
                <label className="text-slate-400 font-sans text-[11px] block">Sprint 30m (s)</label>
                <input
                  type="number"
                  step="0.01"
                  value={sprint30mSeconds}
                  onChange={(e) => setSprint30mSeconds(e.target.value)}
                  className="w-full p-1.5 bg-slate-800 text-white rounded border border-slate-700"
                />
              </div>
              <div>
                <label className="text-slate-400 font-sans text-[11px] block">Pro-Agility 5-10-5 (s)</label>
                <input
                  type="number"
                  step="0.01"
                  value={proAgilitySeconds}
                  onChange={(e) => setProAgilitySeconds(e.target.value)}
                  className="w-full p-1.5 bg-slate-800 text-white rounded border border-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Parecer do Treinador */}
          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Interpretação Clínica & Parecer do Treinador</label>
            <textarea
              rows={2}
              required
              value={coachInterpretation}
              onChange={(e) => setCoachInterpretation(e.target.value)}
              placeholder="Análise dos resultados e direcionamento das próximas semanas de treinamento..."
              className="w-full p-2 bg-slate-800 text-slate-200 rounded-lg border border-slate-700"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
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
              Salvar Avaliação
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
