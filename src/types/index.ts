export type TrainingGoal =
  | 'hipertrofia'
  | 'emagrecimento'
  | 'forca_maxima'
  | 'condicionamento_geral'
  | 'corrida_resistencia'
  | 'desempenho_esportivo'
  | 'atleta_hibrido'
  | 'potencia_explosao'
  | 'mobilidade_estabilidade'
  | 'resistencia_localizada'
  | 'retorno_progressivo'
  | 'personalizado';

export type MuscleGroup =
  | 'peitoral'
  | 'costas'
  | 'ombros'
  | 'biceps'
  | 'triceps'
  | 'antebraco_pegada'
  | 'quadriceps'
  | 'posteriores_coxa'
  | 'gluteos'
  | 'panturrilhas'
  | 'abdomen_core'
  | 'corpo_inteiro';

export type MovementPattern =
  | 'agachamento'
  | 'dobradica_quadril'
  | 'empurrar_horizontal'
  | 'empurrar_vertical'
  | 'puxar_horizontal'
  | 'puxar_vertical'
  | 'avancos_unilateral'
  | 'rotacao_antirotacao'
  | 'saltos_aterrissagens'
  | 'corrida_locomocao'
  | 'transporte_cargas'
  | 'multiplanar';

export type PhysicalCapacity =
  | 'forca_maxima'
  | 'forca_relativa'
  | 'potencia'
  | 'resistencia_muscular'
  | 'resistencia_aerobica'
  | 'capacidade_anaerobica'
  | 'velocidade'
  | 'aceleracao'
  | 'desaceleracao'
  | 'agilidade'
  | 'mobilidade'
  | 'estabilidade'
  | 'coordenacao'
  | 'equilibrio';

export type EquipmentType =
  | 'peso_corporal'
  | 'halteres'
  | 'barras_anilhas'
  | 'maquinas'
  | 'cabos_polias'
  | 'elasticos'
  | 'kettlebells'
  | 'medicine_ball'
  | 'caixas_pliometricas'
  | 'treno'
  | 'bike_ergometrica'
  | 'esteira'
  | 'remo_ergometrico'
  | 'outros';

export type AthleteLevel = 'iniciante' | 'intermediario' | 'avancado' | 'atleta';

export interface Athlete {
  id: string;
  coachId?: string;
  name: string;
  birthDate: string;
  age: number;
  email: string;
  phone: string;
  avatarUrl?: string;
  level: AthleteLevel;
  primaryGoal: TrainingGoal;
  secondaryGoals: TrainingGoal[];
  preferredDays: string[];
  sessionDurationMinutes: number;
  location: string;
  availableEquipment: EquipmentType[];
  healthScreening: {
    parqPassed: boolean;
    injuriesHistory: string[];
    jointRestrictions: string[];
    medicalClearance: boolean;
    notes: string;
  };
  coachNotes: string;
  activeProgramId?: string;
  activeProgramName?: string;
  createdAt: string;
  lastActive: string;
}

export interface Exercise {
  id: string;
  coachId?: string;
  name: string;
  alternativeNames: string[];
  category: 'musculacao' | 'pliometria' | 'cardio_locomocao' | 'mobilidade' | 'funcional_potencia';
  primaryGoals: TrainingGoal[];
  secondaryGoals: TrainingGoal[];
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  movementPattern: MovementPattern;
  contractionType: string;
  physicalCapacities: PhysicalCapacity[];
  equipment: EquipmentType[];
  difficulty: 'iniciante' | 'intermediario' | 'avancado' | 'elite';
  instructions: {
    initialPosition: string;
    execution: string;
    finishing: string;
  };
  breathingCues: string;
  commonMistakes: string[];
  coachCues: string[];
  progressions: string[];
  regressions: string[];
  variations: string[];
  prescriptiveParameters: {
    recommendedSets: string;
    recommendedRepsOrDuration: string;
    intensityGuidance: string;
    restInterval: string;
    tempoCadence: string;
  };
  safetyNotes: string;
  sportsApplications: string[];
  tags: string[];
  isCustom?: boolean;
}

export type WorkoutSection = 'aquecimento' | 'principal' | 'volta_a_calma';

export interface PrescribedExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  section: WorkoutSection;
  grouping?: 'individual' | 'superset' | 'circuit';
  groupTag?: string; // 'A1', 'A2', 'B1', etc.
  sets: number;
  repsOrDuration: string;
  loadPrescription: string;
  intensityMethod: 'carga' | 'pct_1rm' | 'rpe' | 'rir' | 'zona_fc' | 'pace';
  intensityValue: string;
  restSeconds: number;
  tempo: string;
  distanceMeters?: number;
  paceTarget?: string;
  heartRateZone?: string;
  coachNotes?: string;
  alternativeExerciseId?: string;
  alternativeExerciseName?: string;
}

export interface WorkoutSession {
  id: string;
  title: string;
  dayOfWeek?: string;
  focusGoal: TrainingGoal;
  estimatedDurationMinutes: number;
  exercises: PrescribedExercise[];
  notes: string;
}

export type SplitType =
  | 'ABCD'
  | 'UpperLower'
  | 'PushPullLegs'
  | 'FullBody'
  | 'Corrida'
  | 'Hibrido'
  | 'Esportivo'
  | 'Personalizado';

export interface TrainingProgram {
  id: string;
  coachId?: string;
  title: string;
  description: string;
  athleteId?: string;
  athleteName?: string;
  isTemplate: boolean;
  category: TrainingGoal;
  splitType: SplitType;
  level: AthleteLevel;
  sessions: WorkoutSession[];
  weeklyFrequency: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SportModality {
  id: string;
  name: string;
  description: string;
  keyDemands: PhysicalCapacity[];
  energySystems: string[];
  primaryMovementPatterns: MovementPattern[];
}

export interface PhysicalAssessment {
  id: string;
  coachId?: string;
  athleteId: string;
  athleteName: string;
  date: string;
  type: 'antropometria' | 'forca_1rm' | 'corrida_cardio' | 'potencia_salto' | 'agilidade' | 'mobilidade' | 'completa';
  measurements: {
    weightKg?: number;
    heightCm?: number;
    bmi?: number;
    bodyFatPercentageEstimated?: number;
    bodyFatProtocol?: string;
    chestCircumferenceCm?: number;
    waistCircumferenceCm?: number;
    hipCircumferenceCm?: number;
    rightArmRelaxedCm?: number;
    rightArmFlexedCm?: number;
    rightThighCm?: number;
    calvesCm?: number;
  };
  performanceTests: {
    benchPress1RMKg?: number;
    squat1RMKg?: number;
    deadlift1RMKg?: number;
    verticalJumpCm?: number;
    cooper12MinMeters?: number;
    vo2MaxEstimated?: number;
    sprint30mMilisecs?: number;
    proAgilitySeconds?: number;
    yoyoLevel?: string;
    fiveKmPaceMinutes?: string;
  };
  mobilityNotes?: string;
  coachInterpretation: string;
}

export interface CompletedWorkoutLog {
  id: string;
  coachId?: string;
  athleteId: string;
  programId: string;
  sessionId: string;
  sessionTitle: string;
  date: string;
  completed: boolean;
  perceivedExertionRPE: number;
  feedbackNotes: string;
  totalDurationMinutes: number;
  tonnageKg?: number;
  distanceCoveredKm?: number;
}
