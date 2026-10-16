import { TrainingProgram, WorkoutSession, PrescribedExercise } from '../types';

export const exportProgramToCSV = (program: TrainingProgram) => {
  const rows: string[] = [];
  rows.push(['Programa', program.title].join(','));
  rows.push(['Atleta', program.athleteName || 'Não atribuído'].join(','));
  rows.push(['Categoria', program.category].join(','));
  rows.push(['Divisão', program.splitType].join(','));
  rows.push(['Frequência Semanal', `${program.weeklyFrequency}x`].join(','));
  rows.push('');
  rows.push([
    'Sessão',
    'Seção',
    'Agrupamento',
    'Exercício',
    'Séries',
    'Reps / Duração',
    'Carga / Intensidade',
    'Descanso (s)',
    'Cadência',
    'Pace / Distância',
    'Notas do Treinador',
  ].join(','));

  program.sessions.forEach((sess) => {
    sess.exercises.forEach((ex) => {
      const row = [
        `"${sess.title}"`,
        `"${ex.section.toUpperCase()}"`,
        `"${ex.groupTag || 'Individual'}"`,
        `"${ex.exerciseName}"`,
        `"${ex.sets}"`,
        `"${ex.repsOrDuration}"`,
        `"${ex.loadPrescription} (${ex.intensityValue})"`,
        `"${ex.restSeconds}"`,
        `"${ex.tempo}"`,
        `"${ex.paceTarget || ex.distanceMeters ? `${ex.paceTarget || ''} ${ex.distanceMeters ? `${ex.distanceMeters}m` : ''}` : '-'}"`,
        `"${(ex.coachNotes || '').replace(/"/g, '""')}"`,
      ];
      rows.push(row.join(','));
    });
  });

  const csvContent = '\uFEFF' + rows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `treino-${program.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export const formatWorkoutForWhatsApp = (program: TrainingProgram): string => {
  let text = `🏋️ *${program.title.toUpperCase()}*\n`;
  if (program.athleteName) {
    text += `👤 *Atleta:* ${program.athleteName}\n`;
  }
  text += `🎯 *Foco:* ${program.category.replace('_', ' ').toUpperCase()} | *Divisão:* ${program.splitType}\n`;
  text += `------------------------------------\n\n`;

  program.sessions.forEach((sess, sIdx) => {
    text += `📌 *${sess.title}* (${sess.estimatedDurationMinutes} min)\n`;
    if (sess.notes) text += `_Obs: ${sess.notes}_\n`;

    const groupedBySection: Record<string, PrescribedExercise[]> = {
      aquecimento: sess.exercises.filter((e) => e.section === 'aquecimento'),
      principal: sess.exercises.filter((e) => e.section === 'principal'),
      volta_a_calma: sess.exercises.filter((e) => e.section === 'volta_a_calma'),
    };

    if (groupedBySection.aquecimento.length > 0) {
      text += `\n🔹 *AQUECIMENTO:*\n`;
      groupedBySection.aquecimento.forEach((ex) => {
        text += `• ${ex.exerciseName} - ${ex.sets}x ${ex.repsOrDuration} | Descanso: ${ex.restSeconds}s\n`;
      });
    }

    if (groupedBySection.principal.length > 0) {
      text += `\n🔹 *PARTE PRINCIPAL:*\n`;
      groupedBySection.principal.forEach((ex, idx) => {
        const tag = ex.groupTag ? `[${ex.groupTag}] ` : '';
        text += `${idx + 1}. ${tag}*${ex.exerciseName}*\n`;
        text += `   ↳ ${ex.sets} séries x ${ex.repsOrDuration} | Carga: ${ex.loadPrescription} | ${ex.intensityValue}\n`;
        text += `   ↳ Descanso: ${ex.restSeconds}s | Cadência: ${ex.tempo}\n`;
        if (ex.paceTarget || ex.distanceMeters) {
          text += `   ↳ Alvo: ${ex.distanceMeters ? `${ex.distanceMeters}m ` : ''}${ex.paceTarget ? `@ ${ex.paceTarget}` : ''}\n`;
        }
        if (ex.coachNotes) {
          text += `   ↳ 💡 _Nota: ${ex.coachNotes}_\n`;
        }
      });
    }

    if (groupedBySection.volta_a_calma.length > 0) {
      text += `\n🔹 *VOLTA À CALMA:*\n`;
      groupedBySection.volta_a_calma.forEach((ex) => {
        text += `• ${ex.exerciseName} - ${ex.sets}x ${ex.repsOrDuration}\n`;
      });
    }

    text += `\n====================================\n\n`;
  });

  text += `💪 *Bom treino! Foco na técnica e consistência.*`;
  return text;
};
