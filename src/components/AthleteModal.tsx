import React, { useState, useEffect } from 'react';
import { Athlete, TrainingGoal, AthleteLevel, EquipmentType } from '../types';
import { TRAINING_GOALS_MAP, EQUIPMENT_MAP } from '../data/constants';
import { X, Check } from 'lucide-react';

interface AthleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Athlete, 'id' | 'createdAt' | 'lastActive'>) => void;
  initialAthlete?: Athlete | null;
}

export const AthleteModal: React.FC<AthleteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialAthlete,
}) => {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('1998-01-01');
  const [age, setAge] = useState(28);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [level, setLevel] = useState<AthleteLevel>('intermediario');
  const [primaryGoal, setPrimaryGoal] = useState<TrainingGoal>('hipertrofia');
  const [secondaryGoals, setSecondaryGoals] = useState<TrainingGoal[]>([]);
  const [preferredDays, setPreferredDays] = useState<string[]>(['Seg', 'Qua', 'Sex']);
  const [sessionDurationMinutes, setSessionDurationMinutes] = useState(60);
  const [location, setLocation] = useState('Academia');
  const [availableEquipment, setAvailableEquipment] = useState<EquipmentType[]>([
    'barras_anilhas',
    'halteres',
    'maquinas',
    'cabos_polias',
  ]);
  const [parqPassed, setParqPassed] = useState(true);
  const [injuriesHistoryText, setInjuriesHistoryText] = useState('');
  const [jointRestrictionsText, setJointRestrictionsText] = useState('');
  const [coachNotes, setCoachNotes] = useState('');

  useEffect(() => {
    if (initialAthlete) {
      setName(initialAthlete.name);
      setBirthDate(initialAthlete.birthDate);
      setAge(initialAthlete.age);
      setEmail(initialAthlete.email);
      setPhone(initialAthlete.phone);
      setLevel(initialAthlete.level);
      setPrimaryGoal(initialAthlete.primaryGoal);
      setSecondaryGoals(initialAthlete.secondaryGoals);
      setPreferredDays(initialAthlete.preferredDays);
      setSessionDurationMinutes(initialAthlete.sessionDurationMinutes);
      setLocation(initialAthlete.location);
      setAvailableEquipment(initialAthlete.availableEquipment);
      setParqPassed(initialAthlete.healthScreening.parqPassed);
      setInjuriesHistoryText(initialAthlete.healthScreening.injuriesHistory.join(', '));
      setJointRestrictionsText(initialAthlete.healthScreening.jointRestrictions.join(', '));
      setCoachNotes(initialAthlete.coachNotes);
    } else {
      setName('');
      setBirthDate('1998-01-01');
      setAge(28);
      setEmail('');
      setPhone('');
      setLevel('intermediario');
      setPrimaryGoal('hipertrofia');
      setSecondaryGoals([]);
      setPreferredDays(['Seg', 'Qua', 'Sex']);
      setSessionDurationMinutes(60);
      setLocation('Academia Comercial');
      setAvailableEquipment(['barras_anilhas', 'halteres', 'maquinas', 'cabos_polias']);
      setParqPassed(true);
      setInjuriesHistoryText('');
      setJointRestrictionsText('');
      setCoachNotes('');
    }
  }, [initialAthlete, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name,
      birthDate,
      age: Number(age),
      email,
      phone,
      level,
      primaryGoal,
      secondaryGoals,
      preferredDays,
      sessionDurationMinutes: Number(sessionDurationMinutes),
      location,
      availableEquipment,
      healthScreening: {
        parqPassed,
        injuriesHistory: injuriesHistoryText ? injuriesHistoryText.split(',').map((s) => s.trim()) : [],
        jointRestrictions: jointRestrictionsText ? jointRestrictionsText.split(',').map((s) => s.trim()) : [],
        medicalClearance: true,
        notes: '',
      },
      coachNotes,
    });
    onClose();
  };

  const toggleDay = (day: string) => {
    setPreferredDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggleSecondaryGoal = (goal: TrainingGoal) => {
    if (goal === primaryGoal) return;
    setSecondaryGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-lg font-bold text-white">
            {initialAthlete ? 'Editar Dados do Atleta' : 'Cadastrar Novo Aluno / Atleta'}
          </h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Identificação */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Nome Completo *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: João Ferreira"
                className="w-full p-2 bg-slate-800 text-white rounded-lg border border-slate-700 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Idade (anos)</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full p-2 bg-slate-800 text-white font-mono rounded-lg border border-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-400 font-medium">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="atleta@email.com"
                className="w-full p-2 bg-slate-800 text-slate-200 rounded-lg border border-slate-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium">WhatsApp / Telefone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 98765-4321"
                className="w-full p-2 bg-slate-800 text-slate-200 rounded-lg border border-slate-700"
              />
            </div>
          </div>

          {/* Nível e Objetivo Principal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Nível de Condicionamento</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as AthleteLevel)}
                className="w-full p-2 bg-slate-800 text-slate-200 rounded-lg border border-slate-700"
              >
                <option value="iniciante">Iniciante</option>
                <option value="intermediario">Intermediário</option>
                <option value="avancado">Avançado</option>
                <option value="atleta">Atleta Competitivo</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Objetivo Principal *</label>
              <select
                value={primaryGoal}
                onChange={(e) => {
                  const g = e.target.value as TrainingGoal;
                  setPrimaryGoal(g);
                  setSecondaryGoals((prev) => prev.filter((item) => item !== g));
                }}
                className="w-full p-2 bg-slate-800 text-emerald-400 font-bold rounded-lg border border-slate-700"
              >
                {Object.entries(TRAINING_GOALS_MAP).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Objetivos Secundários (Múltiplos) */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-medium">
              Objetivos Secundários (Selecione um ou mais)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(TRAINING_GOALS_MAP).map(([key, item]) => {
                if (key === primaryGoal) return null;
                const isSelected = secondaryGoals.includes(key as TrainingGoal);
                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => toggleSecondaryGoal(key as TrainingGoal)}
                    className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                      isSelected
                        ? 'bg-slate-700 text-emerald-400 font-semibold border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {item.label.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dias preferenciais e Tempo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Dias de Treino Disponíveis</label>
              <div className="flex gap-1">
                {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'].map((d) => (
                  <button
                    type="button"
                    key={d}
                    onClick={() => toggleDay(d)}
                    className={`flex-1 py-1.5 rounded text-[11px] font-mono font-bold ${
                      preferredDays.includes(d)
                        ? 'bg-emerald-400 text-slate-950'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Tempo Disponível / Sessão</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={sessionDurationMinutes}
                  onChange={(e) => setSessionDurationMinutes(Number(e.target.value))}
                  className="w-24 p-2 bg-slate-800 text-white font-mono rounded-lg border border-slate-700"
                />
                <span className="text-slate-400">minutos</span>
              </div>
            </div>
          </div>

          {/* Local de Treino */}
          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Local de Treino Principal</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: Academia Comercial, Box Funcional ou Home Gym"
              className="w-full p-2 bg-slate-800 text-slate-200 rounded-lg border border-slate-700"
            />
          </div>

          {/* Triagem de Saúde & Restrições */}
          <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200">Triagem de Saúde & PAR-Q</span>
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={parqPassed}
                  onChange={(e) => setParqPassed(e.target.checked)}
                  className="rounded accent-emerald-400"
                />
                <span>Apto sem restrições médicas gerais</span>
              </label>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400">Histórico de Lesões (separadas por vírgula):</label>
              <input
                type="text"
                value={injuriesHistoryText}
                onChange={(e) => setInjuriesHistoryText(e.target.value)}
                placeholder="Ex: Entorse de tornozelo em 2024, dor patelar leve"
                className="w-full p-2 bg-slate-800 text-slate-200 rounded-lg border border-slate-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400">Restrições Articulares e Contraindicações:</label>
              <input
                type="text"
                value={jointRestrictionsText}
                onChange={(e) => setJointRestrictionsText(e.target.value)}
                placeholder="Ex: Evitar carga axial pesada sobre lombar, aquecer manguito"
                className="w-full p-2 bg-slate-800 text-amber-400 rounded-lg border border-slate-700"
              />
            </div>
          </div>

          {/* Observações do Treinador */}
          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Observações do Treinador</label>
            <textarea
              rows={2}
              value={coachNotes}
              onChange={(e) => setCoachNotes(e.target.value)}
              placeholder="Metas de curto prazo, estratégias de adesão e pontos de atenção técnica..."
              className="w-full p-2 bg-slate-800 text-slate-200 rounded-lg border border-slate-700"
            />
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
              {initialAthlete ? 'Salvar Alterações' : 'Concluir Cadastro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
