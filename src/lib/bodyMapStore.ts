import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type BodyView = 'front' | 'back';

export interface BodyPlacement {
  id: string;
  partId: string;
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  view: BodyView;
  createdAt: string;
}

export type SensationType = 'tight' | 'heavy' | 'numb' | 'buzzing' | 'warm' | 'cold' | 'hollow' | 'expansive' | 'constricted' | 'painful' | 'tingly';

export interface SensationMark {
  id: string;
  x: number;
  y: number;
  view: BodyView;
  sensation: SensationType;
}

export interface SensationMap {
  id: string;
  marks: SensationMark[];
  createdAt: string;
}

export interface BodyCheckIn {
  id: string;
  placements: { partId: string; x: number; y: number; view: BodyView; intensity: number }[];
  createdAt: string;
  note?: string;
}

interface BodyMapStore {
  placements: BodyPlacement[];
  sensationMaps: SensationMap[];
  checkIns: BodyCheckIn[];
  activePartIds: string[];

  addPlacement: (p: Omit<BodyPlacement, 'id' | 'createdAt'>) => void;
  removePlacement: (id: string) => void;
  saveSensationMap: (marks: SensationMark[]) => void;
  saveCheckIn: (checkIn: Omit<BodyCheckIn, 'id' | 'createdAt'>) => void;
  setActivePartIds: (ids: string[]) => void;
}

export const useBodyMapStore = create<BodyMapStore>()(
  persist(
    (set) => ({
      placements: [],
      sensationMaps: [],
      checkIns: [],
      activePartIds: [],

      addPlacement: (p) =>
        set((s) => ({
          placements: [
            ...s.placements,
            { ...p, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
          ],
        })),

      removePlacement: (id) =>
        set((s) => ({ placements: s.placements.filter((p) => p.id !== id) })),

      saveSensationMap: (marks) =>
        set((s) => ({
          sensationMaps: [
            ...s.sensationMaps,
            { id: crypto.randomUUID(), marks, createdAt: new Date().toISOString() },
          ],
        })),

      saveCheckIn: (checkIn) =>
        set((s) => ({
          checkIns: [
            ...s.checkIns,
            { ...checkIn, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
          ],
        })),

      setActivePartIds: (ids) => set({ activePartIds: ids }),
    }),
    { name: 'inner-atlas-body-map' }
  )
);
