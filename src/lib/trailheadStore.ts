import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type EntryType = 'thought' | 'feeling' | 'sensation' | 'impulse';

export interface TrailEntry {
  type: EntryType;
  description: string;
  intensity: number;
  bodyResponse: string;
}

export interface TrailChainNode {
  partId: string;        // existing or newly created
  partName: string;
  partType: string;
  isNew: boolean;
  purpose: string;       // what it's trying to do
  duration: string;      // how long active
  fear: string;          // afraid of what
  isProtecting: string;  // protecting what
  managingFeelings: string;
  underneathFeeling: string;
  willingToStep: string;
  whatComesUp: string;
}

export interface ExileDiscovery {
  partId: string;
  partName: string;
  isNew: boolean;
  carriesEmotions: string;
  feelsYounger: string;
  longBurden: string;
  selfAwareness: string;
  exileMessage: string;
}

export type TrailStatus = 'active' | 'paused' | 'completed';

export interface Trail {
  id: string;
  name: string;
  date: string;
  status: TrailStatus;
  entry: TrailEntry | null;
  chain: TrailChainNode[];
  exile: ExileDiscovery | null;
  selfEnergyChecks: number[];
  starred: boolean;
  tags: string[];
}

export type TrailStep =
  | 'entry'
  | 'part-id'
  | 'self-check'
  | 'part-explore'
  | 'follow'
  | 'follow-choice'
  | 'exile-recognition'
  | 'exile-safety'
  | 'exile-connect'
  | 'complete'
  | 'grounding';

interface TrailheadStore {
  trails: Trail[];
  activeTrailId: string | null;
  currentStep: TrailStep;
  currentChainIndex: number;
  previousStep: TrailStep | null; // for grounding return

  startTrail: () => string;
  setStep: (step: TrailStep) => void;
  setChainIndex: (index: number) => void;
  updateEntry: (entry: TrailEntry) => void;
  addChainNode: (node: TrailChainNode) => void;
  updateChainNode: (index: number, data: Partial<TrailChainNode>) => void;
  setExile: (exile: ExileDiscovery) => void;
  updateExile: (data: Partial<ExileDiscovery>) => void;
  addSelfEnergyCheck: (value: number) => void;
  completeTrail: (name: string) => void;
  pauseTrail: () => void;
  resumeTrail: (trailId: string) => void;
  toggleStar: (trailId: string) => void;
  addTag: (trailId: string, tag: string) => void;
  getActiveTrail: () => Trail | undefined;
  enterGrounding: () => void;
  exitGrounding: () => void;
}

export const useTrailheadStore = create<TrailheadStore>()(
  persist(
    (set, get) => ({
      trails: [],
      activeTrailId: null,
      currentStep: 'entry',
      currentChainIndex: 0,
      previousStep: null,

      startTrail: () => {
        const id = Math.random().toString(36).substring(7);
        const trail: Trail = {
          id, name: '', date: new Date().toISOString(),
          status: 'active', entry: null, chain: [], exile: null,
          selfEnergyChecks: [], starred: false, tags: [],
        };
        set((s) => ({
          trails: [...s.trails, trail],
          activeTrailId: id,
          currentStep: 'entry',
          currentChainIndex: 0,
          previousStep: null,
        }));
        return id;
      },

      setStep: (step) => set({ currentStep: step }),
      setChainIndex: (index) => set({ currentChainIndex: index }),

      updateEntry: (entry) =>
        set((s) => ({
          trails: s.trails.map((t) => t.id === s.activeTrailId ? { ...t, entry } : t),
        })),

      addChainNode: (node) =>
        set((s) => ({
          trails: s.trails.map((t) =>
            t.id === s.activeTrailId ? { ...t, chain: [...t.chain, node] } : t
          ),
          currentChainIndex: (s.trails.find((t) => t.id === s.activeTrailId)?.chain.length ?? 0),
        })),

      updateChainNode: (index, data) =>
        set((s) => ({
          trails: s.trails.map((t) => {
            if (t.id !== s.activeTrailId) return t;
            const chain = [...t.chain];
            chain[index] = { ...chain[index], ...data };
            return { ...t, chain };
          }),
        })),

      setExile: (exile) =>
        set((s) => ({
          trails: s.trails.map((t) => t.id === s.activeTrailId ? { ...t, exile } : t),
        })),

      updateExile: (data) =>
        set((s) => ({
          trails: s.trails.map((t) => {
            if (t.id !== s.activeTrailId || !t.exile) return t;
            return { ...t, exile: { ...t.exile, ...data } };
          }),
        })),

      addSelfEnergyCheck: (value) =>
        set((s) => ({
          trails: s.trails.map((t) =>
            t.id === s.activeTrailId ? { ...t, selfEnergyChecks: [...t.selfEnergyChecks, value] } : t
          ),
        })),

      completeTrail: (name) =>
        set((s) => ({
          trails: s.trails.map((t) =>
            t.id === s.activeTrailId ? { ...t, name, status: 'completed' as TrailStatus } : t
          ),
          activeTrailId: null,
          currentStep: 'entry',
        })),

      pauseTrail: () =>
        set((s) => ({
          trails: s.trails.map((t) =>
            t.id === s.activeTrailId ? { ...t, status: 'paused' as TrailStatus } : t
          ),
          activeTrailId: null,
          currentStep: 'entry',
        })),

      resumeTrail: (trailId) => {
        const trail = get().trails.find((t) => t.id === trailId);
        if (!trail) return;
        set({
          activeTrailId: trailId,
          trails: get().trails.map((t) => t.id === trailId ? { ...t, status: 'active' } : t),
          currentStep: trail.chain.length > 0 ? 'follow-choice' : 'entry',
          currentChainIndex: Math.max(0, trail.chain.length - 1),
        });
      },

      toggleStar: (trailId) =>
        set((s) => ({
          trails: s.trails.map((t) => t.id === trailId ? { ...t, starred: !t.starred } : t),
        })),

      addTag: (trailId, tag) =>
        set((s) => ({
          trails: s.trails.map((t) =>
            t.id === trailId && !t.tags.includes(tag) ? { ...t, tags: [...t.tags, tag] } : t
          ),
        })),

      getActiveTrail: () => {
        const s = get();
        return s.trails.find((t) => t.id === s.activeTrailId);
      },

      enterGrounding: () => set((s) => ({ previousStep: s.currentStep, currentStep: 'grounding' as TrailStep })),
      exitGrounding: () => set((s) => ({ currentStep: s.previousStep || 'entry', previousStep: null })),
    }),
    { name: 'inner-atlas-trailhead' }
  )
);
