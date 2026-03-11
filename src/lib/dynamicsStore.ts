import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DynamicType = 'polarization' | 'alliance';
export type DynamicStatus = 'active' | 'easing' | 'resolved';

export interface SessionNote {
  id: string;
  text: string;
  createdAt: string;
}

export interface PartDynamic {
  id: string;
  dynamicType: DynamicType;
  title: string;
  partIds: string[];
  description: string;
  eachPartFears: Record<string, string>; // partId → fear text
  costToSystem: string;
  resolutionNotes: string;
  status: DynamicStatus;
  sessionNotes: SessionNote[];
  createdAt: string;
  updatedAt: string;
}

interface DynamicsStore {
  dynamics: PartDynamic[];
  addDynamic: (d: Omit<PartDynamic, 'id' | 'createdAt' | 'updatedAt' | 'sessionNotes'>) => void;
  updateDynamic: (id: string, updates: Partial<PartDynamic>) => void;
  deleteDynamic: (id: string) => void;
  setStatus: (id: string, status: DynamicStatus) => void;
  addSessionNote: (dynamicId: string, text: string) => void;
  getDynamicsForPart: (partId: string) => PartDynamic[];
  getActivePolarizations: () => PartDynamic[];
  getActiveAlliances: () => PartDynamic[];
}

export const useDynamicsStore = create<DynamicsStore>()(
  persist(
    (set, get) => ({
      dynamics: [],

      addDynamic: (d) => {
        const now = new Date().toISOString();
        set((state) => ({
          dynamics: [
            ...state.dynamics,
            { ...d, id: crypto.randomUUID(), sessionNotes: [], createdAt: now, updatedAt: now },
          ],
        }));
      },

      updateDynamic: (id, updates) =>
        set((state) => ({
          dynamics: state.dynamics.map((d) =>
            d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
          ),
        })),

      deleteDynamic: (id) =>
        set((state) => ({ dynamics: state.dynamics.filter((d) => d.id !== id) })),

      setStatus: (id, status) =>
        set((state) => ({
          dynamics: state.dynamics.map((d) =>
            d.id === id ? { ...d, status, updatedAt: new Date().toISOString() } : d
          ),
        })),

      addSessionNote: (dynamicId, text) =>
        set((state) => ({
          dynamics: state.dynamics.map((d) =>
            d.id === dynamicId
              ? {
                  ...d,
                  sessionNotes: [
                    ...d.sessionNotes,
                    { id: crypto.randomUUID(), text, createdAt: new Date().toISOString() },
                  ],
                  updatedAt: new Date().toISOString(),
                }
              : d
          ),
        })),

      getDynamicsForPart: (partId) => get().dynamics.filter((d) => d.partIds.includes(partId)),

      getActivePolarizations: () =>
        get().dynamics.filter((d) => d.dynamicType === 'polarization' && d.status === 'active'),

      getActiveAlliances: () =>
        get().dynamics.filter((d) => d.dynamicType === 'alliance' && d.status === 'active'),
    }),
    { name: 'inner-atlas-dynamics' }
  )
);
