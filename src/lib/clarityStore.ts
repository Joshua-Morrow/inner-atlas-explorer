import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Therapeutic Goals ──

export type GoalType = 'healing' | 'growth' | 'relationship' | 'parts-work';
export type GoalStatus = 'just-started' | 'in-progress' | 'breakthrough' | 'integrated' | 'complete';

export interface PartReaction {
  partId: string;
  stance: 'supporting' | 'resisting' | 'both';
  concern: string;
}

export interface TherapeuticGoal {
  id: string;
  statement: string;
  type: GoalType;
  specific: string;
  meaningful: string;
  achievable: string;
  relevant: string;
  timeframe: string;
  partReactions: PartReaction[];
  selfCheck: 'yes' | 'mostly' | 'not-sure';
  selfCheckNote: string;
  status: GoalStatus;
  createdAt: string;
  lastReviewedAt?: string;
  reviewNotes: string[];
}

// ── Life Goals ──

export type DomainDriver = 'part-driven' | 'self-led' | 'mixed';

export interface LifeGoalItem {
  id: string;
  text: string;
  why: string;
}

export interface LifeDomain {
  id: string;
  name: string;
  icon: string;
  satisfaction: number;
  goals: LifeGoalItem[];
  activeParts: string[];
  driver: DomainDriver;
}

export const LIFE_DOMAINS: { id: string; name: string; icon: string }[] = [
  { id: 'work', name: 'Work & Career', icon: 'briefcase' },
  { id: 'relationships', name: 'Relationships & Love', icon: 'heart' },
  { id: 'family', name: 'Family', icon: 'users' },
  { id: 'health', name: 'Health & Body', icon: 'activity' },
  { id: 'growth', name: 'Personal Growth & Learning', icon: 'trending-up' },
  { id: 'creative', name: 'Creative Expression', icon: 'palette' },
  { id: 'spirituality', name: 'Spirituality & Meaning', icon: 'sparkles' },
  { id: 'community', name: 'Community & Contribution', icon: 'globe' },
];

// ── Mission Statement ──

export interface PeakExperience {
  description: string;
  values: string;
}

export interface MissionData {
  peakExperiences: [PeakExperience, PeakExperience, PeakExperience];
  talents: string[];
  serveWho: string;
  difference: string;
  problem: string;
  partsReview: 'yes' | 'no' | 'not-sure';
  partsNote: string;
  selfResponse: string;
  draft: string;
  selfCheck: boolean;
  savedAt?: string;
}

// ── Core Values ──

export type ValueHolder = 'self' | 'part' | 'both';
export type ValueBucket = 'essential' | 'very-important' | 'important';

export interface ValueEntry {
  value: string;
  bucket: ValueBucket;
  holder: ValueHolder;
  partId?: string;
  partFear?: string;
}

export const VALUES_LIST: { category: string; values: string[] }[] = [
  { category: 'Connection', values: ['Love', 'Belonging', 'Intimacy', 'Trust', 'Compassion', 'Empathy', 'Loyalty', 'Partnership'] },
  { category: 'Achievement', values: ['Success', 'Excellence', 'Mastery', 'Ambition', 'Competence', 'Perseverance', 'Discipline', 'Recognition'] },
  { category: 'Expression', values: ['Creativity', 'Authenticity', 'Passion', 'Beauty', 'Humor', 'Originality', 'Artistry', 'Voice'] },
  { category: 'Service', values: ['Generosity', 'Kindness', 'Contribution', 'Justice', 'Equality', 'Advocacy', 'Mentorship', 'Charity'] },
  { category: 'Growth', values: ['Wisdom', 'Curiosity', 'Learning', 'Self-awareness', 'Resilience', 'Adaptability', 'Mindfulness', 'Evolution'] },
  { category: 'Integrity', values: ['Honesty', 'Honor', 'Responsibility', 'Accountability', 'Respect', 'Fairness', 'Dignity', 'Humility'] },
  { category: 'Freedom', values: ['Independence', 'Autonomy', 'Adventure', 'Spontaneity', 'Flexibility', 'Openness', 'Exploration', 'Courage'] },
  { category: 'Meaning', values: ['Purpose', 'Spirituality', 'Faith', 'Gratitude', 'Peace', 'Harmony', 'Legacy', 'Transcendence'] },
];

// ── Core Memories ──

export type LifeStage = 'early-childhood' | 'childhood' | 'adolescence' | 'young-adult' | 'adult';
export type MemoryType = 'exile-origin' | 'protector-formation' | 'self-energy' | 'relationship' | 'turning-point' | 'burden-origin';

export const EMOTIONAL_TONES = [
  'Joy', 'Pride', 'Love', 'Safety', 'Belonging', 'Curiosity',
  'Confusion', 'Sadness', 'Fear', 'Shame', 'Anger', 'Abandonment',
  'Helplessness', 'Betrayal', 'Loss', 'Wonder', 'Awe', 'Gratitude',
] as const;

export interface CoreMemory {
  id: string;
  title: string;
  age?: number;
  lifeStage: LifeStage;
  description: string;
  emotionalTones: string[];
  memoryTypes: MemoryType[];
  connectedParts: string[];
  sensoryDetails: string;
  lessons: string;
  createdAt: string;
}

// ── Store ──

interface ClarityStore {
  // Therapeutic Goals
  therapeuticGoals: TherapeuticGoal[];
  addTherapeuticGoal: (goal: Omit<TherapeuticGoal, 'id' | 'createdAt' | 'reviewNotes'>) => void;
  updateTherapeuticGoal: (id: string, data: Partial<TherapeuticGoal>) => void;
  deleteTherapeuticGoal: (id: string) => void;

  // Life Goals
  lifeDomains: LifeDomain[];
  initLifeDomains: () => void;
  updateLifeDomain: (id: string, data: Partial<LifeDomain>) => void;
  addLifeGoal: (domainId: string, text: string, why: string) => void;
  removeLifeGoal: (domainId: string, goalId: string) => void;
  futureSelf: string;
  setFutureSelf: (text: string) => void;

  // Mission
  mission: MissionData | null;
  setMission: (data: MissionData) => void;
  savedMissionStatement: string;
  setSavedMissionStatement: (s: string) => void;

  // Values
  selectedValues: string[];
  valueEntries: ValueEntry[];
  setSelectedValues: (vals: string[]) => void;
  setValueEntries: (entries: ValueEntry[]) => void;
  valuesStage: number;
  setValuesStage: (s: number) => void;

  // Memories
  memories: CoreMemory[];
  addMemory: (mem: Omit<CoreMemory, 'id' | 'createdAt'>) => void;
  updateMemory: (id: string, data: Partial<CoreMemory>) => void;
  deleteMemory: (id: string) => void;
}

export const useClarityStore = create<ClarityStore>()(
  persist(
    (set, get) => ({
      // Goals
      therapeuticGoals: [],
      addTherapeuticGoal: (goal) => set((s) => ({
        therapeuticGoals: [...s.therapeuticGoals, { ...goal, id: Math.random().toString(36).substring(7), createdAt: new Date().toISOString(), reviewNotes: [] }],
      })),
      updateTherapeuticGoal: (id, data) => set((s) => ({
        therapeuticGoals: s.therapeuticGoals.map((g) => g.id === id ? { ...g, ...data } : g),
      })),
      deleteTherapeuticGoal: (id) => set((s) => ({
        therapeuticGoals: s.therapeuticGoals.filter((g) => g.id !== id),
      })),

      // Life
      lifeDomains: [],
      initLifeDomains: () => {
        if (get().lifeDomains.length > 0) return;
        set({
          lifeDomains: LIFE_DOMAINS.map((d) => ({
            ...d,
            satisfaction: 5,
            goals: [],
            activeParts: [],
            driver: 'mixed' as DomainDriver,
          })),
        });
      },
      updateLifeDomain: (id, data) => set((s) => ({
        lifeDomains: s.lifeDomains.map((d) => d.id === id ? { ...d, ...data } : d),
      })),
      addLifeGoal: (domainId, text, why) => set((s) => ({
        lifeDomains: s.lifeDomains.map((d) =>
          d.id === domainId ? { ...d, goals: [...d.goals, { id: Math.random().toString(36).substring(7), text, why }] } : d
        ),
      })),
      removeLifeGoal: (domainId, goalId) => set((s) => ({
        lifeDomains: s.lifeDomains.map((d) =>
          d.id === domainId ? { ...d, goals: d.goals.filter((g) => g.id !== goalId) } : d
        ),
      })),
      futureSelf: '',
      setFutureSelf: (text) => set({ futureSelf: text }),

      // Mission
      mission: null,
      setMission: (data) => set({ mission: data }),
      savedMissionStatement: '',
      setSavedMissionStatement: (s) => set({ savedMissionStatement: s }),

      // Values
      selectedValues: [],
      valueEntries: [],
      setSelectedValues: (vals) => set({ selectedValues: vals }),
      setValueEntries: (entries) => set({ valueEntries: entries }),
      valuesStage: 1,
      setValuesStage: (s) => set({ valuesStage: s }),

      // Memories
      memories: [],
      addMemory: (mem) => set((s) => ({
        memories: [...s.memories, { ...mem, id: Math.random().toString(36).substring(7), createdAt: new Date().toISOString() }],
      })),
      updateMemory: (id, data) => set((s) => ({
        memories: s.memories.map((m) => m.id === id ? { ...m, ...data } : m),
      })),
      deleteMemory: (id) => set((s) => ({
        memories: s.memories.filter((m) => m.id !== id),
      })),
    }),
    { name: 'inner-atlas-clarity' }
  )
);
