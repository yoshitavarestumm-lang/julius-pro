import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  User,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import {
  Athlete,
  Exercise,
  TrainingProgram,
  PhysicalAssessment,
  CompletedWorkoutLog,
  SportModality,
  WorkoutSession,
  PrescribedExercise,
  TrainingGoal,
  SplitType,
  AthleteLevel,
} from '../types';

export interface WorkoutDraft {
  targetAthleteId: string | null;
  programId: string | null;
  title: string;
  description: string;
  splitType: SplitType;
  category: TrainingGoal;
  level: AthleteLevel;
  weeklyFrequency: number;
  isTemplate: boolean;
  sessions: WorkoutSession[];
}

interface AppContextType {
  currentUser: User | null;
  isAuthLoading: boolean;
  logout: () => Promise<void>;

  athletes: Athlete[];
  exercises: Exercise[];
  programs: TrainingProgram[];
  assessments: PhysicalAssessment[];
  workoutLogs: CompletedWorkoutLog[];
  sports: SportModality[];
  selectedAthleteId: string | null;
  setSelectedAthleteId: (id: string | null) => void;
  selectedAthlete: Athlete | null;

  workoutDraft: WorkoutDraft;
  setWorkoutDraft: React.Dispatch<React.SetStateAction<WorkoutDraft>>;
  addExerciseToDraft: (exercise: Exercise, targetSessionIndex?: number) => void;
  clearWorkoutDraft: () => void;
  loadProgramIntoDraft: (program: TrainingProgram, forAthleteId?: string) => void;

  addAthlete: (athlete: Omit<Athlete, 'id' | 'createdAt' | 'lastActive'>) => Promise<Athlete>;
  updateAthlete: (id: string, updates: Partial<Athlete>) => Promise<void>;
  deleteAthlete: (id: string) => Promise<void>;

  addExercise: (exercise: Omit<Exercise, 'id'>) => Promise<Exercise>;
  updateExercise: (id: string, updates: Partial<Exercise>) => Promise<void>;
  deleteExercise: (id: string) => Promise<void>;

  saveProgram: (programData: Omit<TrainingProgram, 'id' | 'createdAt' | 'updatedAt'>, existingId?: string) => Promise<TrainingProgram>;
  deleteProgram: (id: string) => Promise<void>;
  duplicateProgram: (programId: string, newAthleteId?: string, newTitle?: string) => Promise<TrainingProgram>;

  addAssessment: (assessment: Omit<PhysicalAssessment, 'id'>) => Promise<PhysicalAssessment>;
  deleteAssessment: (id: string) => Promise<void>;

  addWorkoutLog: (log: Omit<CompletedWorkoutLog, 'id'>) => Promise<void>;
  addSport: (sport: Omit<SportModality, 'id'>) => Promise<void>;

  exportDatabaseJSON: () => void;
  importDatabaseJSON: (jsonString: string) => Promise<boolean>;
  resetToDefaults: () => Promise<void>;

  toast: { message: string; type: 'success' | 'info' | 'error' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const defaultInitialDraft: WorkoutDraft = {
  targetAthleteId: null,
  programId: null,
  title: 'Novo Programa Personalizado',
  description: 'Prescrição customizada com base nas metas e capacidades do atleta.',
  splitType: 'UpperLower',
  category: 'hipertrofia',
  level: 'intermediario',
  weeklyFrequency: 4,
  isTemplate: false,
  sessions: [
    {
      id: 'sess-draft-1',
      title: 'Treino A - Sessão Principal',
      dayOfWeek: 'Segunda-feira',
      focusGoal: 'hipertrofia',
      estimatedDurationMinutes: 60,
      notes: '',
      exercises: [],
    },
  ],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // Requirement 4: Start empty (no fake SEED data). Loaded purely from real user data in Firestore
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [assessments, setAssessments] = useState<PhysicalAssessment[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<CompletedWorkoutLog[]>([]);
  const [sports, setSports] = useState<SportModality[]>([]);
  const [workoutDraft, setWorkoutDraft] = useState<WorkoutDraft>(defaultInitialDraft);
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // 1. Firebase Authentication Listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
      if (!user) {
        // Clear in-memory state on logout
        setAthletes([]);
        setExercises([]);
        setPrograms([]);
        setAssessments([]);
        setWorkoutLogs([]);
        setSports([]);
        setWorkoutDraft(defaultInitialDraft);
        setSelectedAthleteId(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. Real-time Firestore Subscriptions (filtered strictly by coachId === currentUser.uid)
  useEffect(() => {
    if (!currentUser) return;
    const uid = currentUser.uid;

    // A) Athletes Collection
    const athletesQuery = query(collection(db, 'athletes'), where('coachId', '==', uid));
    const unsubAthletes = onSnapshot(
      athletesQuery,
      (snapshot) => {
        const list = snapshot.docs.map((docSnap) => ({
          ...docSnap.data(),
          id: docSnap.id,
        })) as Athlete[];
        setAthletes(list);
        if (list.length > 0 && !selectedAthleteId) {
          setSelectedAthleteId(list[0].id);
        }
      },
      (error) => {
        console.error('Erro no snapshot de atletas:', error);
      }
    );

    // B) Exercises Collection
    const exercisesQuery = query(collection(db, 'exercises'), where('coachId', '==', uid));
    const unsubExercises = onSnapshot(
      exercisesQuery,
      (snapshot) => {
        const list = snapshot.docs.map((docSnap) => ({
          ...docSnap.data(),
          id: docSnap.id,
        })) as Exercise[];
        setExercises(list);
      },
      (error) => {
        console.error('Erro no snapshot de exercícios:', error);
      }
    );

    // C) Programs Collection
    const programsQuery = query(collection(db, 'programs'), where('coachId', '==', uid));
    const unsubPrograms = onSnapshot(
      programsQuery,
      (snapshot) => {
        const list = snapshot.docs.map((docSnap) => ({
          ...docSnap.data(),
          id: docSnap.id,
        })) as TrainingProgram[];
        setPrograms(list);
      },
      (error) => {
        console.error('Erro no snapshot de programas:', error);
      }
    );

    // D) Assessments Collection
    const assessmentsQuery = query(collection(db, 'assessments'), where('coachId', '==', uid));
    const unsubAssessments = onSnapshot(
      assessmentsQuery,
      (snapshot) => {
        const list = snapshot.docs.map((docSnap) => ({
          ...docSnap.data(),
          id: docSnap.id,
        })) as PhysicalAssessment[];
        setAssessments(list);
      },
      (error) => {
        console.error('Erro no snapshot de avaliações:', error);
      }
    );

    // E) Workout Logs Collection
    const logsQuery = query(collection(db, 'workoutLogs'), where('coachId', '==', uid));
    const unsubLogs = onSnapshot(
      logsQuery,
      (snapshot) => {
        const list = snapshot.docs.map((docSnap) => ({
          ...docSnap.data(),
          id: docSnap.id,
        })) as CompletedWorkoutLog[];
        setWorkoutLogs(list);
      },
      (error) => {
        console.error('Erro no snapshot de logs:', error);
      }
    );

    // F) Sports Collection
    const sportsQuery = query(collection(db, 'sports'), where('coachId', '==', uid));
    const unsubSports = onSnapshot(
      sportsQuery,
      (snapshot) => {
        const list = snapshot.docs.map((docSnap) => ({
          ...docSnap.data(),
          id: docSnap.id,
        })) as SportModality[];
        setSports(list);
      },
      (error) => {
        console.error('Erro no snapshot de modalidades:', error);
      }
    );

    // G) Coach Preferences & Workout Draft doc
    const draftDocRef = doc(db, 'drafts', uid);
    const unsubDraft = onSnapshot(
      draftDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data?.draft) setWorkoutDraft(data.draft);
          if (data?.selectedAthleteId) setSelectedAthleteId(data.selectedAthleteId);
        }
      },
      (error) => {
        console.error('Erro no snapshot de rascunhos:', error);
      }
    );

    return () => {
      unsubAthletes();
      unsubExercises();
      unsubPrograms();
      unsubAssessments();
      unsubLogs();
      unsubSports();
      unsubDraft();
    };
  }, [currentUser]);

  const selectedAthlete = athletes.find((a) => a.id === selectedAthleteId) || athletes[0] || null;

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      showToast('Sessão encerrada com sucesso.', 'info');
    } catch (err: any) {
      console.error('Erro ao encerrar sessão:', err);
      showToast('Erro ao sair.', 'error');
    }
  };

  // Sync draft & active athlete to Firestore
  const persistDraftToFirestore = async (newDraft: WorkoutDraft, athleteId?: string | null) => {
    if (!currentUser) return;
    try {
      await setDoc(
        doc(db, 'drafts', currentUser.uid),
        {
          coachId: currentUser.uid,
          draft: newDraft,
          selectedAthleteId: athleteId ?? selectedAthleteId,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('Erro ao salvar rascunho no Firestore:', e);
    }
  };

  // CRUD Athletes in Cloud Firestore
  const addAthlete = async (athleteData: Omit<Athlete, 'id' | 'createdAt' | 'lastActive'>): Promise<Athlete> => {
    if (!currentUser) throw new Error('Utilizador não autenticado.');
    const now = new Date().toISOString();
    const payload = {
      ...athleteData,
      coachId: currentUser.uid,
      createdAt: now,
      lastActive: now,
    };

    const docRef = await addDoc(collection(db, 'athletes'), payload);
    const newAthlete: Athlete = {
      ...payload,
      id: docRef.id,
    };
    setSelectedAthleteId(docRef.id);
    persistDraftToFirestore(workoutDraft, docRef.id);
    showToast(`Atleta "${newAthlete.name}" gravado com sucesso no Firestore!`);
    return newAthlete;
  };

  const updateAthlete = async (id: string, updates: Partial<Athlete>) => {
    if (!currentUser) return;
    const now = new Date().toISOString();
    const cleanUpdates = { ...updates, lastActive: now, coachId: currentUser.uid };
    delete (cleanUpdates as any).id;
    await updateDoc(doc(db, 'athletes', id), cleanUpdates);
    showToast('Perfil do atleta atualizado no Firestore.');
  };

  const deleteAthlete = async (id: string) => {
    if (!currentUser) return;
    const athleteToDelete = athletes.find((a) => a.id === id);
    await deleteDoc(doc(db, 'athletes', id));
    if (selectedAthleteId === id) {
      const remaining = athletes.filter((a) => a.id !== id);
      setSelectedAthleteId(remaining[0]?.id || null);
    }
    showToast(`Atleta "${athleteToDelete?.name || ''}" removido da nuvem.`);
  };

  // CRUD Exercises in Cloud Firestore
  const addExercise = async (exerciseData: Omit<Exercise, 'id'>): Promise<Exercise> => {
    if (!currentUser) throw new Error('Utilizador não autenticado.');
    const payload = {
      ...exerciseData,
      coachId: currentUser.uid,
      isCustom: true,
      createdAt: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, 'exercises'), payload);
    const newExercise: Exercise = {
      ...payload,
      id: docRef.id,
    };
    showToast(`Exercício "${newExercise.name}" adicionado à sua biblioteca no Firestore!`);
    return newExercise;
  };

  const updateExercise = async (id: string, updates: Partial<Exercise>) => {
    if (!currentUser) return;
    const cleanUpdates = { ...updates, coachId: currentUser.uid };
    delete (cleanUpdates as any).id;
    await updateDoc(doc(db, 'exercises', id), cleanUpdates);
    showToast('Exercício atualizado no Firestore.');
  };

  const deleteExercise = async (id: string) => {
    if (!currentUser) return;
    await deleteDoc(doc(db, 'exercises', id));
    showToast('Exercício removido do banco de dados na nuvem.');
  };

  // Workout Draft Editor
  const addExerciseToDraft = (exercise: Exercise, targetSessionIndex: number = 0) => {
    setWorkoutDraft((prev) => {
      const sessionsCopy = [...prev.sessions];
      if (sessionsCopy.length === 0) {
        sessionsCopy.push({
          id: `sess-${Date.now()}`,
          title: 'Treino A',
          focusGoal: exercise.primaryGoals?.[0] || 'hipertrofia',
          estimatedDurationMinutes: 60,
          notes: '',
          exercises: [],
        });
      }
      const sessionIdx = Math.min(Math.max(0, targetSessionIndex), sessionsCopy.length - 1);
      const targetSession = { ...sessionsCopy[sessionIdx] };

      const newPrescribed: PrescribedExercise = {
        id: `pe-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        section: exercise.category === 'mobilidade' ? 'aquecimento' : 'principal',
        grouping: 'individual',
        sets: 3,
        repsOrDuration: exercise.prescriptiveParameters?.recommendedRepsOrDuration || '10 reps',
        loadPrescription: 'Carga moderada',
        intensityMethod: 'rir',
        intensityValue: 'RIR 1-2',
        restSeconds: 90,
        tempo: exercise.prescriptiveParameters?.tempoCadence || '2-0-1-0',
        coachNotes: exercise.coachCues?.[0] || '',
      };

      targetSession.exercises = [...targetSession.exercises, newPrescribed];
      sessionsCopy[sessionIdx] = targetSession;

      const updated = {
        ...prev,
        sessions: sessionsCopy,
      };
      persistDraftToFirestore(updated);
      return updated;
    });
    showToast(`"${exercise.name}" adicionado à montagem do treino.`);
  };

  const clearWorkoutDraft = () => {
    setWorkoutDraft(defaultInitialDraft);
    persistDraftToFirestore(defaultInitialDraft);
  };

  const loadProgramIntoDraft = (program: TrainingProgram, forAthleteId?: string) => {
    const updatedDraft: WorkoutDraft = {
      targetAthleteId: forAthleteId || program.athleteId || null,
      programId: program.id,
      title: program.title,
      description: program.description,
      splitType: program.splitType,
      category: program.category,
      level: program.level,
      weeklyFrequency: program.weeklyFrequency,
      isTemplate: program.isTemplate,
      sessions: JSON.parse(JSON.stringify(program.sessions || [])),
    };
    setWorkoutDraft(updatedDraft);
    persistDraftToFirestore(updatedDraft, updatedDraft.targetAthleteId);
    showToast(`Programa "${program.title}" carregado no editor.`);
  };

  // CRUD Programs in Cloud Firestore
  const saveProgram = async (
    programData: Omit<TrainingProgram, 'id' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ): Promise<TrainingProgram> => {
    if (!currentUser) throw new Error('Utilizador não autenticado.');
    const now = new Date().toISOString();
    let saved: TrainingProgram;

    if (existingId) {
      const cleanData = {
        ...programData,
        coachId: currentUser.uid,
        updatedAt: now,
      };
      delete (cleanData as any).id;
      await updateDoc(doc(db, 'programs', existingId), cleanData);
      saved = { ...cleanData, id: existingId, createdAt: programs.find((p) => p.id === existingId)?.createdAt || now };
      showToast(`Programa "${saved.title}" atualizado no Firestore!`);
    } else {
      const cleanData = {
        ...programData,
        coachId: currentUser.uid,
        createdAt: now,
        updatedAt: now,
      };
      const docRef = await addDoc(collection(db, 'programs'), cleanData);
      saved = { ...cleanData, id: docRef.id };
      showToast(
        saved.isTemplate
          ? `Modelo "${saved.title}" salvo no Firestore!`
          : `Programa "${saved.title}" criado e atribuído!`
      );
    }

    if (saved.athleteId && !saved.isTemplate) {
      updateAthlete(saved.athleteId, {
        activeProgramId: saved.id,
        activeProgramName: saved.title,
      });
    }

    return saved;
  };

  const deleteProgram = async (id: string) => {
    if (!currentUser) return;
    const p = programs.find((pr) => pr.id === id);
    await deleteDoc(doc(db, 'programs', id));
    showToast(`Programa "${p?.title || ''}" removido.`);
  };

  const duplicateProgram = async (
    programId: string,
    newAthleteId?: string,
    newTitle?: string
  ): Promise<TrainingProgram> => {
    if (!currentUser) throw new Error('Utilizador não autenticado.');
    const source = programs.find((p) => p.id === programId);
    if (!source) throw new Error('Programa não encontrado para duplicação.');

    const targetAthlete = athletes.find((a) => a.id === newAthleteId);
    const now = new Date().toISOString();
    const payload = {
      ...JSON.parse(JSON.stringify(source)),
      title: newTitle || `${source.title} (Personalizado para ${targetAthlete?.name || 'Novo Aluno'})`,
      athleteId: newAthleteId || undefined,
      athleteName: targetAthlete?.name || undefined,
      isTemplate: false,
      coachId: currentUser.uid,
      createdAt: now,
      updatedAt: now,
    };
    delete payload.id;

    const docRef = await addDoc(collection(db, 'programs'), payload);
    const duplicated: TrainingProgram = {
      ...payload,
      id: docRef.id,
    };

    if (newAthleteId) {
      updateAthlete(newAthleteId, {
        activeProgramId: duplicated.id,
        activeProgramName: duplicated.title,
      });
    }

    showToast(`Programa duplicado com sucesso para ${targetAthlete?.name || 'atleta'}!`);
    return duplicated;
  };

  // CRUD Assessments in Cloud Firestore
  const addAssessment = async (data: Omit<PhysicalAssessment, 'id'>): Promise<PhysicalAssessment> => {
    if (!currentUser) throw new Error('Utilizador não autenticado.');
    const payload = {
      ...data,
      coachId: currentUser.uid,
      createdAt: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, 'assessments'), payload);
    const newAsmt: PhysicalAssessment = {
      ...payload,
      id: docRef.id,
    };
    showToast(`Avaliação de ${newAsmt.athleteName} registada e sincronizada no Firestore!`);
    return newAsmt;
  };

  const deleteAssessment = async (id: string) => {
    if (!currentUser) return;
    await deleteDoc(doc(db, 'assessments', id));
    showToast('Avaliação removida da nuvem.');
  };

  // Workout Logs in Cloud Firestore
  const addWorkoutLog = async (logData: Omit<CompletedWorkoutLog, 'id'>) => {
    if (!currentUser) throw new Error('Utilizador não autenticado.');
    const payload = {
      ...logData,
      coachId: currentUser.uid,
      createdAt: new Date().toISOString(),
    };
    await addDoc(collection(db, 'workoutLogs'), payload);
    showToast('Sessão concluída e registada no histórico de evolução!');
  };

  // Sports in Cloud Firestore
  const addSport = async (sportData: Omit<SportModality, 'id'>) => {
    if (!currentUser) throw new Error('Utilizador não autenticado.');
    const payload = {
      ...sportData,
      coachId: currentUser.uid,
    };
    await addDoc(collection(db, 'sports'), payload);
    showToast(`Modalidade "${sportData.name}" adicionada.`);
  };

  // Backup & Restore
  const exportDatabaseJSON = () => {
    const databaseDump = {
      version: '2.0-firestore',
      coachId: currentUser?.uid,
      coachEmail: currentUser?.email,
      exportedAt: new Date().toISOString(),
      athletes,
      exercises,
      programs,
      assessments,
      workoutLogs,
      sports,
    };
    const blob = new Blob([JSON.stringify(databaseDump, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `julius-coach-pro-firestore-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup completo em formato JSON exportado com sucesso.');
  };

  const importDatabaseJSON = async (jsonString: string): Promise<boolean> => {
    if (!currentUser) {
      showToast('Inicie sessão antes de importar dados.', 'error');
      return false;
    }
    try {
      const data = JSON.parse(jsonString);
      const uid = currentUser.uid;

      if (Array.isArray(data.athletes)) {
        for (const item of data.athletes) {
          const clean = { ...item, coachId: uid };
          delete clean.id;
          await addDoc(collection(db, 'athletes'), clean);
        }
      }

      if (Array.isArray(data.exercises)) {
        for (const item of data.exercises) {
          const clean = { ...item, coachId: uid };
          delete clean.id;
          await addDoc(collection(db, 'exercises'), clean);
        }
      }

      if (Array.isArray(data.programs)) {
        for (const item of data.programs) {
          const clean = { ...item, coachId: uid };
          delete clean.id;
          await addDoc(collection(db, 'programs'), clean);
        }
      }

      if (Array.isArray(data.assessments)) {
        for (const item of data.assessments) {
          const clean = { ...item, coachId: uid };
          delete clean.id;
          await addDoc(collection(db, 'assessments'), clean);
        }
      }

      showToast('Dados importados com sucesso para o seu Cloud Firestore!');
      return true;
    } catch (err) {
      console.error('Erro ao importar JSON:', err);
      showToast('Erro ao importar arquivo JSON. Verifique a estrutura.', 'error');
      return false;
    }
  };

  const resetToDefaults = async () => {
    if (!currentUser) return;
    try {
      // Clear Firestore user records
      const athSnap = await getDocs(query(collection(db, 'athletes'), where('coachId', '==', currentUser.uid)));
      for (const d of athSnap.docs) await deleteDoc(d.ref);

      const exSnap = await getDocs(query(collection(db, 'exercises'), where('coachId', '==', currentUser.uid)));
      for (const d of exSnap.docs) await deleteDoc(d.ref);

      const progSnap = await getDocs(query(collection(db, 'programs'), where('coachId', '==', currentUser.uid)));
      for (const d of progSnap.docs) await deleteDoc(d.ref);

      const asmtSnap = await getDocs(query(collection(db, 'assessments'), where('coachId', '==', currentUser.uid)));
      for (const d of asmtSnap.docs) await deleteDoc(d.ref);

      const logSnap = await getDocs(query(collection(db, 'workoutLogs'), where('coachId', '==', currentUser.uid)));
      for (const d of logSnap.docs) await deleteDoc(d.ref);

      await deleteDoc(doc(db, 'drafts', currentUser.uid));

      setAthletes([]);
      setExercises([]);
      setPrograms([]);
      setAssessments([]);
      setWorkoutLogs([]);
      setSports([]);
      setSelectedAthleteId(null);
      clearWorkoutDraft();

      showToast('Base de dados do Firestore limpa para esta conta.');
    } catch (err: any) {
      console.error('Erro ao limpar dados:', err);
      showToast('Erro ao limpar base de dados.', 'error');
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthLoading,
        logout,
        athletes,
        exercises,
        programs,
        assessments,
        workoutLogs,
        sports,
        selectedAthleteId,
        setSelectedAthleteId,
        selectedAthlete,
        workoutDraft,
        setWorkoutDraft,
        addExerciseToDraft,
        clearWorkoutDraft,
        loadProgramIntoDraft,
        addAthlete,
        updateAthlete,
        deleteAthlete,
        addExercise,
        updateExercise,
        deleteExercise,
        saveProgram,
        deleteProgram,
        duplicateProgram,
        addAssessment,
        deleteAssessment,
        addWorkoutLog,
        addSport,
        exportDatabaseJSON,
        importDatabaseJSON,
        resetToDefaults,
        toast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
