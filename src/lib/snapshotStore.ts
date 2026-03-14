import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PartReflection {
  partId: string;
  text: string;
}

export interface SnapshotReflections {
  overallShift: string;
  partReflections: PartReflection[];
}

export interface SystemSnapshot {
  id: string;
  createdAt: string;
  // Section 1
  totalParts: number;
  managerCount: number;
  firefighterCount: number;
  exileCount: number;
  selfCount: number;
  // Section 2
  firstCheckInScore: number | null;
  latestCheckInScore: number | null;
  firstQualities: Record<string, number> | null;
  latestQualities: Record<string, number> | null;
  // Section 3
  totalPracticeSessions: number;
  practicesByCategory: Record<string, number>;
  totalDialogues: number;
  mostDialoguedParts: { partId: string; partName: string; count: number }[];
  elaboratedParts: { partId: string; partName: string }[];
  totalUpdates: number;
  // Section 4
  polarizations: { title: string; partNames: string[]; status: string }[];
  alliances: { title: string; partNames: string[]; status: string }[];
  // Section 5
  reflections: SnapshotReflections;
}

interface SnapshotStore {
  snapshots: SystemSnapshot[];
  saveSnapshot: (snapshot: SystemSnapshot) => void;
  updateReflections: (snapshotId: string, reflections: SnapshotReflections) => void;
}

export const useSnapshotStore = create<SnapshotStore>()(
  persist(
    (set) => ({
      snapshots: [],
      saveSnapshot: (snapshot) =>
        set((s) => ({ snapshots: [...s.snapshots, snapshot] })),
      updateReflections: (snapshotId, reflections) =>
        set((s) => ({
          snapshots: s.snapshots.map((snap) =>
            snap.id === snapshotId ? { ...snap, reflections } : snap
          ),
        })),
    }),
    { name: 'inner-atlas-snapshots' }
  )
);
