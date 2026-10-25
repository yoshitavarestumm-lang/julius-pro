import React, { useState } from 'react';
import { TrainingProgram, PrescribedExercise, WorkoutSession } from '../types';
import { Printer, X, Download, Filter, CheckCircle2, Dumbbell } from 'lucide-react';

interface PrintWorkoutModalProps {
  program: TrainingProgram | null;
  onClose: () => void;
}

export const PrintWorkoutModal: React.FC<PrintWorkoutModalProps> = ({ program, onClose }) => {
  if (!program) return null;

  const rawSessions = program.sessions || [];

  // Filter state: 'all' or specific session ID
  const [selectedSessionId, setSelectedSessionId] = useState<string>('all');

  const handlePrint = () => {
    window.print();
  };

  // Filter sessions to print/view
  const sessionsToPrint: WorkoutSession[] =
    selectedSessionId === 'all'
      ? rawSessions
      : rawSessions.filter((s, idx) => (s.id || `sess-${idx}`) === selectedSessionId);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
        {/* Modal Controls - Hidden when printing */}
        <div className="no-print space-y-4 border-b border-slate-800 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Printer className="w-5 h-5 text-emerald-400" />
                Visualização de Impressão / Ficha do Atleta
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Pronto para imprimir ou salvar como PDF. Selecione todas as divisões ou filtre uma sessão específica.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir / Salvar PDF</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Session Selector Filter Bar */}
          {rawSessions.length > 1 && (
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                Sessões para Imprimir:
              </span>
              <button
                onClick={() => setSelectedSessionId('all')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  selectedSessionId === 'all'
                    ? 'bg-emerald-400 text-slate-950 shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Todas as Divisões ({rawSessions.length})
              </button>
              {rawSessions.map((sess, idx) => {
                const sId = sess.id || `sess-${idx}`;
                const isSelected = selectedSessionId === sId;
                const exCount = (sess.exercises || []).length;
                return (
                  <button
                    key={sId}
                    onClick={() => setSelectedSessionId(sId)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-400 text-slate-950 shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span>{sess.title.split('-')[0].trim()}</span>
                    <span className="text-[10px] font-mono opacity-80">({exCount} ex)</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* The Printable Sheet (Clean white background styling in print) */}
        <div className="bg-white text-slate-900 p-8 rounded-xl space-y-6 border border-slate-200 font-sans shadow-sm">
          {/* Sheet Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Julius Coach Pro · Prescrição de Treinamento
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
                {program.title}
              </h1>
              <div className="flex items-center gap-3 text-xs text-slate-600 mt-2 font-medium flex-wrap">
                <span>Atleta: <strong>{program.athleteName || 'Prescrição Livre'}</strong></span>
                <span>·</span>
                <span>Divisão: <strong>{program.splitType}</strong></span>
                <span>·</span>
                <span>Frequência: <strong>{program.weeklyFrequency}x por semana</strong></span>
                {selectedSessionId !== 'all' && (
                  <>
                    <span>·</span>
                    <span className="text-emerald-700 font-bold">
                      Ficha da Sessão Selecionada
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="text-right text-xs text-slate-500 font-mono">
              <div>Emissão: {new Date().toLocaleDateString('pt-BR')}</div>
              <div className="text-[10px] mt-0.5">Validade: 8 a 12 semanas</div>
            </div>
          </div>

          {program.description && (
            <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-700 italic">
              <strong>Orientações Gerais do Treinador:</strong> {program.description}
            </div>
          )}

          {/* Sessions Loop - Guaranteed 100% independent per session (No Treino A duplication) */}
          <div className="space-y-8">
            {sessionsToPrint.map((currentSess, sIdx) => {
              const sessionExercises = currentSess.exercises || [];
              const sessionKey = currentSess.id || `sess-print-${sIdx}`;

              return (
                <div
                  key={sessionKey}
                  className="space-y-3 pb-4 border-b border-slate-200 last:border-b-0"
                  style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
                >
                  <div className="flex items-center justify-between border-b-2 border-slate-800 pb-2 bg-slate-50 p-2.5 rounded-lg">
                    <div>
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-800 mr-2">
                        {currentSess.dayOfWeek ? `${currentSess.dayOfWeek} · ` : ''}Sessão {sIdx + 1}:
                      </span>
                      <h2 className="inline text-base font-black text-slate-900 uppercase tracking-wide">
                        {currentSess.title}
                      </h2>
                    </div>
                    <span className="text-xs text-slate-600 font-mono font-bold">
                      {currentSess.estimatedDurationMinutes || 60} min · {sessionExercises.length} {sessionExercises.length === 1 ? 'exercício' : 'exercícios'}
                    </span>
                  </div>

                  {currentSess.notes && (
                    <p className="text-xs text-slate-600 italic px-2">
                      <strong>Recomendações da sessão:</strong> {currentSess.notes}
                    </p>
                  )}

                  {/* Exercises Table for this specific session */}
                  {sessionExercises.length > 0 ? (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b-2 border-slate-800 text-[11px] uppercase tracking-wider text-slate-700 bg-slate-100">
                          <th className="py-2 px-2">#</th>
                          <th className="py-2 px-2">Exercício</th>
                          <th className="py-2 px-2 text-center">Séries</th>
                          <th className="py-2 px-2 text-center">Reps / Tempo</th>
                          <th className="py-2 px-2">Carga & Intensidade</th>
                          <th className="py-2 px-2 text-center">Descanso</th>
                          <th className="py-2 px-2 text-center">Cadência</th>
                          <th className="py-2 px-2">Registro de Carga</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {sessionExercises.map((ex, eIdx) => {
                          const rowKey = `${sessionKey}-${ex.id || eIdx}`;
                          return (
                            <tr key={rowKey} className="hover:bg-slate-50">
                              <td className="py-2 px-2 font-mono text-slate-500 font-bold">{eIdx + 1}</td>
                              <td className="py-2 px-2 font-semibold text-slate-900">
                                {ex.groupTag && (
                                  <span className="font-mono text-purple-700 font-bold mr-1">
                                    [{ex.groupTag}]
                                  </span>
                                )}
                                {ex.exerciseName}
                                {ex.coachNotes && (
                                  <div className="text-[10px] text-slate-500 font-normal italic mt-0.5">
                                    💡 {ex.coachNotes}
                                  </div>
                                )}
                                {(ex.paceTarget || ex.distanceMeters) && (
                                  <div className="text-[10px] text-emerald-700 font-mono mt-0.5">
                                    Alvo: {ex.distanceMeters ? `${ex.distanceMeters}m ` : ''}{ex.paceTarget ? `@ ${ex.paceTarget}` : ''}
                                  </div>
                                )}
                              </td>
                              <td className="py-2 px-2 text-center font-mono font-bold text-slate-900">{ex.sets}</td>
                              <td className="py-2 px-2 text-center font-mono text-slate-800">{ex.repsOrDuration}</td>
                              <td className="py-2 px-2 font-mono text-[11px] text-slate-700">
                                {ex.loadPrescription || 'Carga Livre'}
                                {ex.intensityValue ? ` · ${ex.intensityValue}` : ''}
                              </td>
                              <td className="py-2 px-2 text-center font-mono text-slate-800">{ex.restSeconds}s</td>
                              <td className="py-2 px-2 text-center font-mono text-slate-800">{ex.tempo || '-'}</td>
                              <td className="py-2 px-2 border-l border-slate-200">
                                <div className="h-6 w-24 border-b border-dashed border-slate-400"></div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400 italic bg-slate-50 rounded-lg border border-dashed border-slate-300">
                      Nenhum exercício registrado nesta divisão de treino ({currentSess.title}).
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer of the sheet */}
          <div className="pt-4 border-t border-slate-300 flex items-center justify-between text-[11px] text-slate-500">
            <div>Foco na técnica impecável, amplitude segura e sobrecarga progressiva gradual.</div>
            <div className="font-mono">Julius Coach Pro © 2026</div>
          </div>
        </div>
      </div>
    </div>
  );
};
