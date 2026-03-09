import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RefinementChange {
  id: string;
  timestamp: string;
  field: string;
  oldValue: string;
  newValue: string;
}

export interface CustomAttribute {
  id: string;
  name: string;
  value: string;
}

export interface PartRefinement {
  partId: string;
  // Rename
  customName?: string;
  nameReason?: string;
  nameHistory: { name: string; date: string }[];
  // Appearance
  representationType?: 'icon' | 'color' | 'image';
  selectedIcon?: string;
  customColor?: string;
  imageUrl?: string;
  prominence: number; // 1-5
  visualNotes?: string;
  // Attributes
  editedDescription?: string;
  editedTriggers?: string;
  editedManifestations?: string;
  editedIntensity?: string;
  editedPurpose?: string;
  customAttributes: CustomAttribute[];
  // Narrative
  story?: string;
  originStory?: string;
  partVoice?: string;
  evolutionNotes?: string;
  // Meta
  history: RefinementChange[];
  lastRefinedAt?: string;
  createdAt: string;
}

export type RefinementLevel = 'none' | 'partial' | 'full';

interface RefineStore {
  refinements: Record<string, PartRefinement>;
  getRefinement: (partId: string) => PartRefinement | null;
  initRefinement: (partId: string) => void;
  updateRefinement: (partId: string, data: Partial<PartRefinement>, field?: string) => void;
  addCustomAttribute: (partId: string, name: string, value: string) => void;
  updateCustomAttribute: (partId: string, attrId: string, name: string, value: string) => void;
  deleteCustomAttribute: (partId: string, attrId: string) => void;
  revertChange: (partId: string, changeId: string) => void;
  getRefinementLevel: (partId: string) => RefinementLevel;
  isPartRefined: (partId: string) => boolean;
}

function countFilledFields(r: PartRefinement): number {
  let count = 0;
  if (r.customName) count++;
  if (r.representationType) count++;
  if (r.editedDescription || r.editedTriggers || r.editedManifestations || r.editedIntensity || r.editedPurpose) count++;
  if (r.customAttributes.length > 0) count++;
  if (r.story || r.originStory || r.partVoice || r.evolutionNotes) count++;
  return count;
}

export const useRefineStore = create<RefineStore>()(
  persist(
    (set, get) => ({
      refinements: {},

      getRefinement: (partId) => get().refinements[partId] || null,

      initRefinement: (partId) => {
        if (get().refinements[partId]) return;
        set((state) => ({
          refinements: {
            ...state.refinements,
            [partId]: {
              partId,
              nameHistory: [],
              prominence: 3,
              customAttributes: [],
              history: [],
              createdAt: new Date().toISOString(),
            },
          },
        }));
      },

      updateRefinement: (partId, data, field) => {
        set((state) => {
          const existing = state.refinements[partId];
          if (!existing) return state;
          const changes: RefinementChange[] = [];
          if (field) {
            const oldVal = String((existing as any)[field] || '');
            const newVal = String((data as any)[field] || '');
            if (oldVal !== newVal) {
              changes.push({
                id: Math.random().toString(36).substring(7),
                timestamp: new Date().toISOString(),
                field,
                oldValue: oldVal,
                newValue: newVal,
              });
            }
          }
          // Track name history
          let nameHistory = existing.nameHistory;
          if (data.customName && data.customName !== existing.customName && existing.customName) {
            nameHistory = [...nameHistory, { name: existing.customName, date: new Date().toISOString() }];
          }
          return {
            refinements: {
              ...state.refinements,
              [partId]: {
                ...existing,
                ...data,
                nameHistory,
                history: [...existing.history, ...changes],
                lastRefinedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      addCustomAttribute: (partId, name, value) => {
        set((state) => {
          const existing = state.refinements[partId];
          if (!existing) return state;
          const attr: CustomAttribute = { id: Math.random().toString(36).substring(7), name, value };
          return {
            refinements: {
              ...state.refinements,
              [partId]: {
                ...existing,
                customAttributes: [...existing.customAttributes, attr],
                history: [...existing.history, {
                  id: Math.random().toString(36).substring(7),
                  timestamp: new Date().toISOString(),
                  field: `custom:${name}`,
                  oldValue: '',
                  newValue: value,
                }],
                lastRefinedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      updateCustomAttribute: (partId, attrId, name, value) => {
        set((state) => {
          const existing = state.refinements[partId];
          if (!existing) return state;
          return {
            refinements: {
              ...state.refinements,
              [partId]: {
                ...existing,
                customAttributes: existing.customAttributes.map((a) =>
                  a.id === attrId ? { ...a, name, value } : a
                ),
                lastRefinedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      deleteCustomAttribute: (partId, attrId) => {
        set((state) => {
          const existing = state.refinements[partId];
          if (!existing) return state;
          return {
            refinements: {
              ...state.refinements,
              [partId]: {
                ...existing,
                customAttributes: existing.customAttributes.filter((a) => a.id !== attrId),
                lastRefinedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      revertChange: (partId, changeId) => {
        set((state) => {
          const existing = state.refinements[partId];
          if (!existing) return state;
          const change = existing.history.find((h) => h.id === changeId);
          if (!change) return state;
          return {
            refinements: {
              ...state.refinements,
              [partId]: {
                ...existing,
                [change.field]: change.oldValue || undefined,
                history: existing.history.filter((h) => h.id !== changeId),
                lastRefinedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      getRefinementLevel: (partId) => {
        const r = get().refinements[partId];
        if (!r) return 'none';
        const filled = countFilledFields(r);
        if (filled >= 4) return 'full';
        if (filled >= 1) return 'partial';
        return 'none';
      },

      isPartRefined: (partId) => get().getRefinementLevel(partId) !== 'none',
    }),
    { name: 'inner-atlas-refine' }
  )
);
