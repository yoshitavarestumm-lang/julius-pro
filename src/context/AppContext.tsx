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
  activeSessionIndex: number;
  setActiveSessionIndex: (index: number) => void;
  addExerciseToDraft: (exercise: Exercise, targetSessionIndex?: number) => void;
  clearWorkoutDraft: () => void;
  loadProgramIntoDraft: (program: TrainingProgram, forAthleteId?: string, sessionIndex?: number) => void;

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
  const [activeSessionIndex, setActiveSessionIndex] = useState<number>(0);
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Helper to deep sanitize data for Firestore (prevents undefined field rejection)
  const sanitizeForFirestore = <T,>(data: T): any => {
    return JSON.parse(
      JSON.stringify(data, (_, v) => (v === undefined ? null : v))
    );
  };

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
          if (typeof data?.activeSessionIndex === 'number') {
            setActiveSessionIndex(data.activeSessionIndex);
          }
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

  // Sync draft, active session & active athlete to Firestore
  const persistDraftToFirestore = async (
    newDraft: WorkoutDraft,
    athleteId?: string | null,
    sessionIdx?: number
  ) => {
    if (!currentUser) return;
    try {
      const sanitizedDraft = sanitizeForFirestore(newDraft);
      await setDoc(
        doc(db, 'drafts', currentUser.uid),
        {
          coachId: currentUser.uid,
          draft: sanitizedDraft,
          activeSessionIndex: sessionIdx !== undefined ? sessionIdx : activeSessionIndex,
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
  const addExerciseToDraft = (exercise: Exercise, targetSessionIndex?: number) => {
    const sIndex = targetSessionIndex !== undefined ? targetSessionIndex : activeSessionIndex;
    setWorkoutDraft((prev) => {
      const sessionsCopy = [...prev.sessions];
      if (sessionsCopy.length === 0) {
        sessionsCopy.push({
          id: `sess-${Date.now()}`,
          title: 'Treino A',
          dayOfWeek: 'Segunda-feira',
          focusGoal: exercise.primaryGoals?.[0] || 'hipertrofia',
          estimatedDurationMinutes: 60,
          notes: '',
          exercises: [],
        });
      }
      const sessionIdx = Math.min(Math.max(0, sIndex), sessionsCopy.length - 1);
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

      targetSession.exercises = [...(targetSession.exercises || []), newPrescribed];
      sessionsCopy[sessionIdx] = targetSession;

      const updated = {
        ...prev,
        sessions: sessionsCopy,
      };
      persistDraftToFirestore(updated, updated.targetAthleteId, sessionIdx);
      return updated;
    });
    showToast(`"${exercise.name}" adicionado à montagem do treino.`);
  };

  const clearWorkoutDraft = () => {
    setWorkoutDraft(defaultInitialDraft);
    setActiveSessionIndex(0);
    persistDraftToFirestore(defaultInitialDraft, null, 0);
  };

  const loadProgramIntoDraft = (
    program: TrainingProgram,
    forAthleteId?: string,
    sessionIndex: number = 0
  ) => {
    const rawSessions = program.sessions || [];
    const safeSessionIndex = Math.max(
      0,
      Math.min(sessionIndex, Math.max(0, rawSessions.length - 1))
    );

    const updatedDraft: WorkoutDraft = {
      targetAthleteId: forAthleteId || program.athleteId || null,
      programId: program.id,
      title: program.title,
      description: program.description || '',
      splitType: program.splitType,
      category: program.category,
      level: program.level,
      weeklyFrequency: program.weeklyFrequency,
      isTemplate: !!program.isTemplate,
      sessions: JSON.parse(JSON.stringify(rawSessions)),
    };
    setWorkoutDraft(updatedDraft);
    setActiveSessionIndex(safeSessionIndex);
    persistDraftToFirestore(updatedDraft, updatedDraft.targetAthleteId, safeSessionIndex);
    showToast(`Programa "${program.title}" carregado no editor.`);
  };

  // CRUD Programs in Cloud Firestore - Guaranteed 100% complete session & exercise preservation
  const saveProgram = async (
    programData: Omit<TrainingProgram, 'id' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ): Promise<TrainingProgram> => {
    if (!currentUser) throw new Error('Utilizador não autenticado.');
    const now = new Date().toISOString();
    let saved: TrainingProgram;

    // Deep-clean and preserve all sessions and exercises completely
    const cleanSessions: WorkoutSession[] = (programData.sessions || []).map((session, sIdx) => ({
      id: session.id || `sess-${Date.now()}-${sIdx}`,
      title: session.title || `Treino ${String.fromCharCode(65 + sIdx)}`,
      dayOfWeek: session.dayOfWeek || 'Segunda-feira',
      focusGoal: session.focusGoal || programData.category || 'hipertrofia',
      estimatedDurationMinutes: Number(session.estimatedDurationMinutes) || 60,
      notes: session.notes || '',
      exercises: (session.exercises || []).map((ex, eIdx) => ({
        id: ex.id || `pe-${Date.now()}-${sIdx}-${eIdx}`,
        exerciseId: ex.exerciseId || '',
        exerciseName: ex.exerciseName || '',
        section: ex.section || 'principal',
        grouping: ex.grouping || 'individual',
        groupTag: ex.groupTag || undefined,
        sets: Number(ex.sets) || 3,
        repsOrDuration: ex.repsOrDuration || '10 reps',
        loadPrescription: ex.loadPrescription || '',
        intensityMethod: ex.intensityMethod || 'rir',
        intensityValue: ex.intensityValue || 'RIR 2',
        restSeconds: Number(ex.restSeconds) || 90,
        tempo: ex.tempo || '2-0-1-0',
        coachNotes: ex.coachNotes || '',
        alternativeExerciseName: ex.alternativeExerciseName || undefined,
        paceTarget: ex.paceTarget || undefined,
        distanceMeters: ex.distanceMeters ? Number(ex.distanceMeters) : undefined,
        heartRateZone: ex.heartRateZone || undefined,
      })),
    }));

    const cleanPayload = sanitizeForFirestore({
      ...programData,
      sessions: cleanSessions,
      athleteId: programData.athleteId || null,
      athleteName: programData.athleteName || null,
      coachId: currentUser.uid,
      updatedAt: now,
    });

    if (existingId) {
      delete (cleanPayload as any).id;
      await updateDoc(doc(db, 'programs', existingId), cleanPayload);
      saved = {
        ...cleanPayload,
        id: existingId,
        createdAt: programs.find((p) => p.id === existingId)?.createdAt || now,
      };
      showToast(`Programa "${saved.title}" atualizado no Firestore! (${cleanSessions.length} divisões salvas)`);
    } else {
      cleanPayload.createdAt = now;
      const docRef = await addDoc(collection(db, 'programs'), cleanPayload);
      saved = { ...cleanPayload, id: docRef.id };
      showToast(
        saved.isTemplate
          ? `Modelo "${saved.title}" salvo na biblioteca com ${cleanSessions.length} divisões!`
          : `Programa "${saved.title}" criado e atribuído com ${cleanSessions.length} divisões!`
      );
    }

    if (saved.athleteId && !saved.isTemplate) {
      await updateAthlete(saved.athleteId, {
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

    // Deep clone 100% of sessions and exercises
    const cleanSessions: WorkoutSession[] = (source.sessions || []).map((session, sIdx) => ({
      id: `sess-${Date.now()}-${sIdx}`,
      title: session.title || `Treino ${String.fromCharCode(65 + sIdx)}`,
      dayOfWeek: session.dayOfWeek || 'Segunda-feira',
      focusGoal: session.focusGoal || source.category || 'hipertrofia',
      estimatedDurationMinutes: Number(session.estimatedDurationMinutes) || 60,
      notes: session.notes || '',
      exercises: (session.exercises || []).map((ex, eIdx) => ({
        ...ex,
        id: `pe-${Date.now()}-${sIdx}-${eIdx}`,
      })),
    }));

    const cleanPayload = sanitizeForFirestore({
      ...source,
      title: newTitle || `${source.title} (Personalizado para ${targetAthlete?.name || 'Novo Aluno'})`,
      athleteId: newAthleteId || null,
      athleteName: targetAthlete?.name || null,
      isTemplate: !newAthleteId,
      sessions: cleanSessions,
      coachId: currentUser.uid,
      createdAt: now,
      updatedAt: now,
    });
    delete cleanPayload.id;

    const docRef = await addDoc(collection(db, 'programs'), cleanPayload);
    const duplicated: TrainingProgram = {
      ...cleanPayload,
      id: docRef.id,
    };

    if (newAthleteId) {
      await updateAthlete(newAthleteId, {
        activeProgramId: duplicated.id,
        activeProgramName: duplicated.title,
      });
    }

    showToast(`Programa com ${cleanSessions.length} sessões duplicado com sucesso para ${targetAthlete?.name || 'atleta'}!`);
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
        activeSessionIndex,
        setActiveSessionIndex,
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
