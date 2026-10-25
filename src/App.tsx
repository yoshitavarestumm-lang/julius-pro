import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navigation, NavTab } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { AthletesView } from './components/AthletesView';
import { ExerciseDatabaseView } from './components/ExerciseDatabaseView';
import { WorkoutBuilderView } from './components/WorkoutBuilderView';
import { ProgramsListView } from './components/ProgramsListView';
import { ObjectiveWorkflowsView } from './components/ObjectiveWorkflowsView';
import { AssessmentsView } from './components/AssessmentsView';
import { EvolutionAnalyticsView } from './components/EvolutionAnalyticsView';
import { SettingsView } from './components/SettingsView';
import { AthleteModal } from './components/AthleteModal';
import { ExerciseModal } from './components/ExerciseModal';
import { AssessmentModal } from './components/AssessmentModal';
import { ExercisePickerModal } from './components/ExercisePickerModal';
import { PrintWorkoutModal } from './components/PrintWorkoutModal';
import { Toast } from './components/Toast';
import { StorageSyncIndicator } from './components/StorageSyncIndicator';
import { AuthView } from './components/AuthView';
import { Athlete, Exercise, TrainingProgram } from './types';

function MainAppContent() {
  const {
    currentUser,
    isAuthLoading,
    addAthlete,
    updateAthlete,
    addExercise,
    updateExercise,
    addAssessment,
    loadProgramIntoDraft,
    setWorkoutDraft,
    setSelectedAthleteId,
    setActiveSessionIndex,
    programs,
  } = useApp();

  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    try {
      const saved = localStorage.getItem('julius_active_tab') as NavTab;
      if (saved) return saved;
    } catch (e) {}
    return 'painel';
  });

  React.useEffect(() => {
    try {
      localStorage.setItem('julius_active_tab', activeTab);
    } catch (e) {}
  }, [activeTab]);

  // Modal States
  const [isAthleteModalOpen, setIsAthleteModalOpen] = useState(false);
  const [athleteToEdit, setAthleteToEdit] = useState<Athlete | null>(null);

  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [exerciseToEdit, setExerciseToEdit] = useState<Exercise | null>(null);

  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);

  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);
  const [targetPickerSessionIndex, setTargetPickerSessionIndex] = useState(0);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [programToPrint, setProgramToPrint] = useState<TrainingProgram | null>(null);



  // Handlers
  const handleOpenNewAthlete = () => {
    setAthleteToEdit(null);
    setIsAthleteModalOpen(true);
  };

  const handleEditAthlete = (athlete: Athlete) => {
    setAthleteToEdit(athlete);
    setIsAthleteModalOpen(true);
  };

  const handleSaveAthlete = (athleteData: any) => {
    if (athleteToEdit) {
      updateAthlete(athleteToEdit.id, athleteData);
    } else {
      addAthlete(athleteData);
    }
  };

  const handleOpenNewExercise = () => {
    setExerciseToEdit(null);
    setIsExerciseModalOpen(true);
  };

  const handleEditExercise = (exercise: Exercise) => {
    setExerciseToEdit(exercise);
    setIsExerciseModalOpen(true);
  };

  const handleSaveExercise = (exerciseData: any) => {
    if (exerciseToEdit) {
      updateExercise(exerciseToEdit.id, exerciseData);
    } else {
      addExercise(exerciseData);
    }
  };

  const handlePrescribeForAthlete = (athlete: Athlete, sessionIndex: number = 0) => {
    setSelectedAthleteId(athlete.id);
    const existingProg = programs.find((p) => p.id === athlete.activeProgramId);
    if (existingProg) {
      loadProgramIntoDraft(existingProg, athlete.id, sessionIndex);
    } else {
      const newDraft = {
        targetAthleteId: athlete.id,
        programId: null,
        title: `Treino Personalizado - ${athlete.name}`,
        description: `Prescrição individualizada com base nas metas e capacidades do atleta.`,
        splitType: 'UpperLower' as any,
        category: athlete.primaryGoal,
        level: athlete.level,
        weeklyFrequency: athlete.preferredDays?.length || 4,
        isTemplate: false,
        sessions: [
          {
            id: `sess-${Date.now()}`,
            title: 'Treino A - Sessão Principal',
            dayOfWeek: athlete.preferredDays?.[0] || 'Segunda-feira',
            focusGoal: athlete.primaryGoal,
            estimatedDurationMinutes: athlete.sessionDurationMinutes || 60,
            notes: '',
            exercises: [],
          },
        ],
      };
      setWorkoutDraft(newDraft);
      setActiveSessionIndex(0);
    }
    setActiveTab('montar_treino');
  };

  const handleEditAthleteSession = (program: TrainingProgram, sessionIndex: number) => {
    if (program.athleteId) {
      setSelectedAthleteId(program.athleteId);
    }
    loadProgramIntoDraft(program, program.athleteId, sessionIndex);
    setActiveTab('montar_treino');
  };

  const handleEditProgram = (program: TrainingProgram, sessionIndex: number = 0) => {
    loadProgramIntoDraft(program, program.athleteId, sessionIndex);
    setActiveTab('montar_treino');
  };

  const handleOpenPrintModal = (program: TrainingProgram) => {
    setProgramToPrint(program);
    setIsPrintModalOpen(true);
  };

  const handleOpenPicker = (sessionIndex: number) => {
    setTargetPickerSessionIndex(sessionIndex);
    setIsExercisePickerOpen(true);
  };

  // 1. Loading state during Firebase Auth initialization
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3 font-sans text-slate-200">
        <div className="w-10 h-10 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-emerald-400 tracking-wider">A inicializar Julius Coach Pro...</span>
      </div>
    );
  }

  // 2. Strict Authentication Gate: Unauthenticated users ONLY see AuthView
  if (!currentUser) {
    return (
      <>
        <AuthView />
        <Toast />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Top Bar Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewAthleteModal={handleOpenNewAthlete}
      />

      {/* Main View Content */}
      <main className={`flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 ${isPrintModalOpen ? 'no-print' : ''}`}>
        {activeTab === 'painel' && (
          <DashboardView
            setActiveTab={setActiveTab}
            onOpenNewAthleteModal={handleOpenNewAthlete}
          />
        )}

        {activeTab === 'atletas' && (
          <AthletesView
            onOpenNewAthleteModal={handleOpenNewAthlete}
            onEditAthlete={handleEditAthlete}
            onPrescribeForAthlete={handlePrescribeForAthlete}
            onEditAthleteSession={handleEditAthleteSession}
            onOpenPrintModal={handleOpenPrintModal}
          />
        )}

        {activeTab === 'exercicios' && (
          <ExerciseDatabaseView
            onOpenNewExerciseModal={handleOpenNewExercise}
            onEditExercise={handleEditExercise}
          />
        )}

        {activeTab === 'montar_treino' && (
          <WorkoutBuilderView
            onOpenExercisePicker={handleOpenPicker}
            onOpenPrintModal={handleOpenPrintModal}
          />
        )}

        {activeTab === 'programas' && (
          <ProgramsListView
            onEditProgram={handleEditProgram}
            onOpenPrintModal={handleOpenPrintModal}
            onNewProgramClick={() => {
              setActiveTab('montar_treino');
            }}
          />
        )}

        {activeTab === 'fluxos_objetivos' && (
          <ObjectiveWorkflowsView setActiveTab={setActiveTab} />
        )}

        {activeTab === 'avaliacoes' && (
          <AssessmentsView onOpenNewAssessmentModal={() => setIsAssessmentModalOpen(true)} />
        )}

        {activeTab === 'evolucao' && <EvolutionAnalyticsView />}

        {activeTab === 'configuracoes' && <SettingsView />}
      </main>

      {/* Modals */}
      <AthleteModal
        isOpen={isAthleteModalOpen}
        onClose={() => setIsAthleteModalOpen(false)}
        onSave={handleSaveAthlete}
        initialAthlete={athleteToEdit}
      />

      <ExerciseModal
        isOpen={isExerciseModalOpen}
        onClose={() => setIsExerciseModalOpen(false)}
        onSave={handleSaveExercise}
        initialExercise={exerciseToEdit}
      />

      <AssessmentModal
        isOpen={isAssessmentModalOpen}
        onClose={() => setIsAssessmentModalOpen(false)}
        onSave={addAssessment}
      />

      <ExercisePickerModal
        isOpen={isExercisePickerOpen}
        onClose={() => setIsExercisePickerOpen(false)}
        targetSessionIndex={targetPickerSessionIndex}
      />

      <PrintWorkoutModal
        program={programToPrint}
        onClose={() => {
          setIsPrintModalOpen(false);
          setProgramToPrint(null);
        }}
      />

      {/* Browser LocalStorage Sync Status & Test Verification */}
      <StorageSyncIndicator />

      {/* Global Toast */}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
