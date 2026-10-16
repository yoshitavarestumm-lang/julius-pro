import React from 'react';
import { TrainingProgram, PrescribedExercise } from '../types';
import { Printer, X, Download } from 'lucide-react';

interface PrintWorkoutModalProps {
  program: TrainingProgram | null;
  onClose: () => void;
}

export const PrintWorkoutModal: React.FC<PrintWorkoutModalProps> = ({ program, onClose }) => {
  if (!program) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
        {/* Modal Controls - Hidden when printing */}
        <div className="no-print flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Visualização de Impressão / Ficha do Atleta</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Pronto para imprimir ou salvar como PDF no diálogo de impressão do navegador.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
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
              <div className="flex items-center gap-4 text-xs text-slate-600 mt-2 font-medium">
                <span>Atleta: <strong>{program.athleteName || 'Prescrição Livre'}</strong></span>
                <span>·</span>
                <span>Divisão: <strong>{program.splitType}</strong></span>
                <span>·</span>
                <span>Frequência: <strong>{program.weeklyFrequency}x por semana</strong></span>
              </div>
            </div>
            <div className="text-right text-xs text-slate-500 font-mono">
              <div>Emissão: {new Date().toLocaleDateString('pt-BR')}</div>
              <div className="text-[10px] mt-0.5">Validade: 8 a 12 semanas</div>
            </div>
          </div>

          {program.description && (
            <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-700 italic">
              <strong>Orientações do Treinador:</strong> {program.description}
            </div>
          )}

          {/* Sessions */}
          <div className="space-y-6">
            {program.sessions.map((sess, sIdx) => (
              <div key={sess.id} className="space-y-3 page-break-inside-avoid">
                <div className="flex items-center justify-between border-b border-slate-300 pb-1.5">
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    {sess.title}
                  </h2>
                  <span className="text-xs text-slate-500 font-mono">
                    {sess.estimatedDurationMinutes} minutos
                  </span>
                </div>

                {sess.notes && (
                  <p className="text-xs text-slate-600 italic">Nota da sessão: {sess.notes}</p>
                )}

                {/* Exercises Table */}
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-800 text-[11px] uppercase tracking-wider text-slate-600">
                      <th className="py-1.5 px-2">#</th>
                      <th className="py-1.5 px-2">Exercício</th>
                      <th className="py-1.5 px-2 text-center">Séries</th>
                      <th className="py-1.5 px-2 text-center">Reps / Tempo</th>
                      <th className="py-1.5 px-2">Carga & Intensidade</th>
                      <th className="py-1.5 px-2 text-center">Descanso</th>
                      <th className="py-1.5 px-2 text-center">Cadência</th>
                      <th className="py-1.5 px-2">Registro de Carga</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {sess.exercises.map((ex, eIdx) => (
                      <tr key={ex.id} className="hover:bg-slate-50">
                        <td className="py-2 px-2 font-mono text-slate-400">{eIdx + 1}</td>
                        <td className="py-2 px-2 font-semibold text-slate-900">
                          {ex.groupTag && (
                            <span className="font-mono text-purple-700 font-bold mr-1">
                              [{ex.groupTag}]
                            </span>
                          )}
                          {ex.exerciseName}
                          {ex.coachNotes && (
                            <div className="text-[10px] text-slate-500 font-normal italic">
                              💡 {ex.coachNotes}
                            </div>
                          )}
                        </td>
                        <td className="py-2 px-2 text-center font-mono font-bold">{ex.sets}</td>
                        <td className="py-2 px-2 text-center font-mono">{ex.repsOrDuration}</td>
                        <td className="py-2 px-2 font-mono text-[11px]">
                          {ex.loadPrescription} · {ex.intensityValue}
                        </td>
                        <td className="py-2 px-2 text-center font-mono">{ex.restSeconds}s</td>
                        <td className="py-2 px-2 text-center font-mono">{ex.tempo}</td>
                        <td className="py-2 px-2 border-l border-slate-200">
                          <div className="h-6 w-24 border-b border-dashed border-slate-400"></div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
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
