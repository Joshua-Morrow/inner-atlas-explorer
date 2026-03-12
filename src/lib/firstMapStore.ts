import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type MappingPhase = 'opening' | 'phase1' | 'phase2-intro' | 'phase2' | 'phase3-intro' | 'phase3' | 'reveal' | 'complete';

export interface FirstMapPart {
  partId: string;
  userChosenName: string;
  backendClassification: string;
  type: 'Protector-Manager' | 'Protector-Firefighter' | 'Exile';
  cluster: string;
  selfEnergyReadings: { feelings: string[]; timestamp: string }[];
  status: 'named' | 'shadowed' | 'unknown';
}

export interface MapRelationship {
  id: string;
  partAId: string;
  partBId: string;
  type: 'protective' | 'allied' | 'conflicting' | 'polarized' | 'unknown';
  strength: 'inferred' | 'moderate' | 'strong';
  status: 'confirmed' | 'inferred' | 'shadowed';
}

export interface ShadowedNode {
  id: string;
  inferredType: 'Protector-Manager' | 'Protector-Firefighter' | 'Exile';
  connectedToPartId: string;
  revealedByAssessment: string;
  label: string;
}

interface FirstMapStore {
  phase: MappingPhase;
  hasCompletedFirstMapping: boolean;

  // Phase 1
  phase1Answers: Record<string, string[] | string>;

  // Phase 2
  clusterAnswers: Record<string, Record<string, string[] | string>>;
  namedParts: FirstMapPart[];

  // Phase 3
  phase3Answers: Record<string, string[] | string>;

  // Map data
  relationships: MapRelationship[];
  shadowedNodes: ShadowedNode[];
  selfEnergyBaseline: string[];

  // Inferences computed from Phase 1
  inferences: {
    managerStrong: boolean;
    firefighterStrong: boolean;
    polarizationLikely: boolean;
    exileGesture: boolean;
  };

  // Actions
  setPhase: (phase: MappingPhase) => void;
  setPhase1Answer: (key: string, value: string[] | string) => void;
  setClusterAnswer: (cluster: string, key: string, value: string[] | string) => void;
  namePart: (part: FirstMapPart) => void;
  addMicroCapture: (partId: string, feelings: string[]) => void;
  setPhase3Answer: (key: string, value: string[] | string) => void;
  setSelfEnergyBaseline: (feelings: string[]) => void;
  computeInferences: () => void;
  generateShadowedNodes: () => void;
  addRelationship: (rel: MapRelationship) => void;
  completeFirstMapping: () => void;
  resetFirstMapping: () => void;
}

export const useFirstMapStore = create<FirstMapStore>()(
  persist(
    (set, get) => ({
      phase: 'opening',
      hasCompletedFirstMapping: false,
      phase1Answers: {},
      clusterAnswers: {},
      namedParts: [],
      phase3Answers: {},
      relationships: [],
      shadowedNodes: [],
      selfEnergyBaseline: [],
      inferences: {
        managerStrong: false,
        firefighterStrong: false,
        polarizationLikely: false,
        exileGesture: false,
      },

      setPhase: (phase) => set({ phase }),

      setPhase1Answer: (key, value) =>
        set((s) => ({ phase1Answers: { ...s.phase1Answers, [key]: value } })),

      setClusterAnswer: (cluster, key, value) =>
        set((s) => ({
          clusterAnswers: {
            ...s.clusterAnswers,
            [cluster]: { ...(s.clusterAnswers[cluster] || {}), [key]: value },
          },
        })),

      namePart: (part) =>
        set((s) => ({ namedParts: [...s.namedParts, part] })),

      addMicroCapture: (partId, feelings) =>
        set((s) => ({
          namedParts: s.namedParts.map((p) =>
            p.partId === partId
              ? { ...p, selfEnergyReadings: [...p.selfEnergyReadings, { feelings, timestamp: new Date().toISOString() }] }
              : p
          ),
        })),

      setPhase3Answer: (key, value) =>
        set((s) => ({ phase3Answers: { ...s.phase3Answers, [key]: value } })),

      setSelfEnergyBaseline: (feelings) => set({ selfEnergyBaseline: feelings }),

      computeInferences: () => {
        const { phase1Answers } = get();
        const body = (phase1Answers.bodySensations as string[]) || [];
        const actions = (phase1Answers.actions as string[]) || [];
        const secondVoice = phase1Answers.secondVoice as string;

        const managerSignals = ['Try to fix it', 'Work harder', 'Make sure the other person was okay'];
        const firefighterSignals = ['Reach for something comforting', 'Distract yourself', 'Go numb'];
        const managerStrong = actions.some((a) => managerSignals.includes(a));
        const firefighterStrong = actions.some((a) => firefighterSignals.includes(a));
        const polarizationLikely = secondVoice === 'Yes clearly' || secondVoice === 'Yes faintly';
        const exileGesture = body.includes('Numbness or disconnection') || body.includes('Heaviness');

        set({
          inferences: { managerStrong, firefighterStrong, polarizationLikely, exileGesture },
        });
      },

      generateShadowedNodes: () => {
        const { namedParts, inferences } = get();
        const shadows: ShadowedNode[] = [];
        const managerPart = namedParts.find((p) => p.type === 'Protector-Manager');
        const firefighterPart = namedParts.find((p) => p.type === 'Protector-Firefighter');

        if (managerPart) {
          shadows.push({
            id: 'shadow-exile-worth',
            inferredType: 'Exile',
            connectedToPartId: managerPart.partId,
            revealedByAssessment: 'the-tender-places',
            label: 'Unknown — waiting to be known',
          });
        }
        if (firefighterPart) {
          shadows.push({
            id: 'shadow-exile-pain',
            inferredType: 'Exile',
            connectedToPartId: firefighterPart.partId,
            revealedByAssessment: 'the-escape-artist',
            label: 'Unknown — waiting to be known',
          });
        }
        if (inferences.managerStrong) {
          shadows.push({
            id: 'shadow-mgr-2',
            inferredType: 'Protector-Manager',
            connectedToPartId: managerPart?.partId || '',
            revealedByAssessment: 'the-achiever',
            label: 'A pattern in the fog',
          });
        }
        if (inferences.firefighterStrong) {
          shadows.push({
            id: 'shadow-ff-2',
            inferredType: 'Protector-Firefighter',
            connectedToPartId: firefighterPart?.partId || '',
            revealedByAssessment: 'the-escape-artist',
            label: 'A pattern in the fog',
          });
        }
        // Always add at least 3 shadows
        if (shadows.length < 3) {
          shadows.push({
            id: 'shadow-body',
            inferredType: 'Protector-Manager',
            connectedToPartId: '',
            revealedByAssessment: 'the-body-speaks',
            label: 'Something held in the body',
          });
        }
        set({ shadowedNodes: shadows });
      },

      addRelationship: (rel) =>
        set((s) => ({ relationships: [...s.relationships, rel] })),

      completeFirstMapping: () => {
        const { namedParts, computeInferences, generateShadowedNodes } = get();
        computeInferences();
        // Generate protective relationships between protector types and exile gestures
        const relationships: MapRelationship[] = [];
        const protectors = namedParts.filter((p) => p.type !== 'Exile');
        const exiles = namedParts.filter((p) => p.type === 'Exile');
        protectors.forEach((prot) => {
          exiles.forEach((ex) => {
            relationships.push({
              id: `rel-${prot.partId}-${ex.partId}`,
              partAId: prot.partId,
              partBId: ex.partId,
              type: 'protective',
              strength: 'inferred',
              status: 'inferred',
            });
          });
        });
        // Check for polarization between first two protectors
        if (protectors.length >= 2) {
          relationships.push({
            id: `rel-${protectors[0].partId}-${protectors[1].partId}`,
            partAId: protectors[0].partId,
            partBId: protectors[1].partId,
            type: 'polarized',
            strength: 'inferred',
            status: 'inferred',
          });
        }
        set({ relationships, phase: 'complete', hasCompletedFirstMapping: true });
        generateShadowedNodes();
      },

      resetFirstMapping: () =>
        set({
          phase: 'opening',
          phase1Answers: {},
          clusterAnswers: {},
          namedParts: [],
          phase3Answers: {},
          relationships: [],
          shadowedNodes: [],
          selfEnergyBaseline: [],
          inferences: { managerStrong: false, firefighterStrong: false, polarizationLikely: false, exileGesture: false },
        }),
    }),
    { name: 'inner-atlas-first-mapping' }
  )
);
