import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { allAssessmentParts, AssessmentPart } from './assessmentData';

export type AssessmentStage = 'not-started' | 'stage1' | 'breath1' | 'stage2' | 'breath2' | 'stage3' | 'complete';

export interface Stage1Answers {
  [partId: string]: number[]; // 5 answers per part (1-5)
}

export interface Stage2Answers {
  [partId: string]: {
    triggers: number[];           // 5 trigger ratings
    manifestations: { cognitive: number; emotional: number; interoceptive: number; behavioral: number };
    intensity: 'Low' | 'Medium' | 'High';
    lifeContexts: { [context: string]: number };
    somaticLocation: string;
    bodyPoints: { x: number; y: number }[];
    duration: string;
    recovery: string;
    historicalOrigins: string;
    partPerspective: string;
    personalNotes: string;
  };
}

export interface RelationshipData {
  sourceId: string;
  targetId: string;
  type: 'protective' | 'allied' | 'conflicting' | 'dominant' | 'tension' | 'rare';
  strength: 'Mildly' | 'Moderately' | 'Intensely';
  strategies: string[];
  notes: string;
}

export interface Stage3Answers {
  protectorExileLinks: { protectorId: string; exileId: string; strength: string; strategies: string[] }[];
  managerRelationships: { partAId: string; partBId: string; relationship: string }[];
  firefighterManagerLinks: { firefighterId: string; managerId: string; stepsIn: string }[];
  exilePairs: { exileAId: string; exileBId: string; sharedBurdens: string }[];
  dominantParts: string[];
  neverCoexist: [string, string][];
  alwaysTogether: [string, string][];
  selfCQualities: { [quality: string]: number };
}

export interface IdentifiedPart {
  partDef: AssessmentPart;
  averageScore: number;
  status: 'highly-active' | 'moderately-active';
}

export interface AssessmentSnapshot {
  id: string;
  date: string;
  stage1: Stage1Answers;
  stage2: Stage2Answers;
  stage3: Stage3Answers;
  identifiedParts: IdentifiedPart[];
}

interface AssessmentStore {
  // Flow state
  currentStage: AssessmentStage;
  hasCompletedAssessment: boolean;

  // Stage 1
  stage1Answers: Stage1Answers;
  stage1CurrentIndex: number;

  // Stage 2
  stage2Answers: Stage2Answers;
  stage2CurrentIndex: number;
  identifiedParts: IdentifiedPart[];

  // Stage 3
  stage3Answers: Stage3Answers;
  stage3CurrentStep: number;

  // History
  assessmentHistory: AssessmentSnapshot[];

  // Actions
  setStage: (stage: AssessmentStage) => void;
  setStage1Answer: (partId: string, questionIndex: number, value: number) => void;
  setStage1CurrentIndex: (index: number) => void;
  computeIdentifiedParts: () => void;
  setStage2Answer: (partId: string, data: Partial<Stage2Answers[string]>) => void;
  setStage2CurrentIndex: (index: number) => void;
  setStage3Answers: (data: Partial<Stage3Answers>) => void;
  setStage3CurrentStep: (step: number) => void;
  completeAssessment: () => void;
  resetAssessment: () => void;
}

const defaultStage2Entry = (): Stage2Answers[string] => ({
  triggers: [0, 0, 0, 0, 0],
  manifestations: { cognitive: 0, emotional: 0, interoceptive: 0, behavioral: 0 },
  intensity: 'Medium',
  lifeContexts: {},
  somaticLocation: '',
  bodyPoints: [],
  duration: '',
  recovery: '',
  historicalOrigins: '',
  partPerspective: '',
  personalNotes: '',
});

const defaultStage3: Stage3Answers = {
  protectorExileLinks: [],
  managerRelationships: [],
  firefighterManagerLinks: [],
  exilePairs: [],
  dominantParts: [],
  neverCoexist: [],
  alwaysTogether: [],
  selfCQualities: {},
};

export const useAssessmentStore = create<AssessmentStore>()(
  persist(
    (set, get) => ({
      currentStage: 'not-started',
      hasCompletedAssessment: false,
      stage1Answers: {},
      stage1CurrentIndex: 0,
      stage2Answers: {},
      stage2CurrentIndex: 0,
      identifiedParts: [],
      stage3Answers: { ...defaultStage3 },
      stage3CurrentStep: 0,
      assessmentHistory: [],

      setStage: (stage) => set({ currentStage: stage }),

      setStage1Answer: (partId, questionIndex, value) =>
        set((state) => {
          const existing = state.stage1Answers[partId] || [0, 0, 0, 0, 0];
          const updated = [...existing];
          updated[questionIndex] = value;
          return { stage1Answers: { ...state.stage1Answers, [partId]: updated } };
        }),

      setStage1CurrentIndex: (index) => set({ stage1CurrentIndex: index }),

      computeIdentifiedParts: () => {
        const { stage1Answers } = get();
        const identified: IdentifiedPart[] = [];
        for (const part of allAssessmentParts) {
          const answers = stage1Answers[part.id];
          if (!answers) continue;
          const avg = answers.reduce((a, b) => a + b, 0) / answers.length;
          if (avg >= 3.5) {
            identified.push({ partDef: part, averageScore: avg, status: 'highly-active' });
          } else if (avg >= 2.5) {
            identified.push({ partDef: part, averageScore: avg, status: 'moderately-active' });
          }
        }
        // Initialize stage2 answers for identified parts
        const stage2: Stage2Answers = {};
        for (const ip of identified) {
          stage2[ip.partDef.id] = defaultStage2Entry();
        }
        set({ identifiedParts: identified, stage2Answers: stage2 });
      },

      setStage2Answer: (partId, data) =>
        set((state) => ({
          stage2Answers: {
            ...state.stage2Answers,
            [partId]: { ...(state.stage2Answers[partId] || defaultStage2Entry()), ...data },
          },
        })),

      setStage2CurrentIndex: (index) => set({ stage2CurrentIndex: index }),

      setStage3Answers: (data) =>
        set((state) => ({
          stage3Answers: { ...state.stage3Answers, ...data },
        })),

      setStage3CurrentStep: (step) => set({ stage3CurrentStep: step }),

      completeAssessment: () => {
        const state = get();
        const snapshot: AssessmentSnapshot = {
          id: Math.random().toString(36).substring(7),
          date: new Date().toISOString(),
          stage1: state.stage1Answers,
          stage2: state.stage2Answers,
          stage3: state.stage3Answers,
          identifiedParts: state.identifiedParts,
        };
        set({
          currentStage: 'complete',
          hasCompletedAssessment: true,
          assessmentHistory: [...state.assessmentHistory, snapshot],
        });
      },

      resetAssessment: () =>
        set({
          currentStage: 'stage1',
          stage1Answers: {},
          stage1CurrentIndex: 0,
          stage2Answers: {},
          stage2CurrentIndex: 0,
          identifiedParts: [],
          stage3Answers: { ...defaultStage3 },
          stage3CurrentStep: 0,
        }),
    }),
    {
      name: 'inner-atlas-assessment',
    }
  )
);
