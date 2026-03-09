import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TimelineEventType =
  | 'part-added'
  | 'part-elaborated'
  | 'part-refined'
  | 'update-logged'
  | 'trail-started'
  | 'trail-completed'
  | 'exile-discovered'
  | 'dialogue-recorded'
  | 'self-energy-checkin'
  | 'assessment-completed'
  | 'clarity-event'
  | 'practice-completed'
  | 'body-checkin'
  | 'journal-entry'
  | 'snapshot-created';

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  date: string;
  summary: string;
  linkTo?: string;
  partIds?: string[];
  tags?: string[];
}

export interface SystemSnapshot {
  id: string;
  date: string;
  label?: string;
  partCount: number;
  managerCount: number;
  firefighterCount: number;
  exileCount: number;
  selfEnergyAvg: number;
  elaboratedCount: number;
  trailsCompleted: number;
  dialogueCount: number;
  practiceCount: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  text: string;
  partIds: string[];
  tags: string[];
}

export type MilestoneTier = 'foundation' | 'explorer' | 'depth' | 'integration';

export interface MilestoneDef {
  id: string;
  tier: MilestoneTier;
  title: string;
  description: string;
}

export interface EarnedMilestone {
  milestoneId: string;
  earnedAt: string;
}

export const MILESTONES: MilestoneDef[] = [
  // Foundation
  { id: 'first-part', tier: 'foundation', title: 'First Part Identified', description: "You've begun to see your internal system" },
  { id: 'first-elaboration', tier: 'foundation', title: 'First Elaboration Completed', description: 'You went deeper with a part' },
  { id: 'first-dialogue', tier: 'foundation', title: 'First Inner Dialogue', description: 'You let your parts speak' },
  { id: 'first-self-checkin', tier: 'foundation', title: 'First Self-Energy Check-In', description: 'You checked in with your Self' },
  { id: 'first-body-placement', tier: 'foundation', title: 'First Body Map Placement', description: 'You brought your system into your body' },
  { id: 'first-update', tier: 'foundation', title: 'First Update Logged', description: 'You started tracking your system in real time' },
  // Explorer
  { id: '5-parts', tier: 'explorer', title: '5 Parts Identified', description: 'Your system is taking shape' },
  { id: 'first-trail', tier: 'explorer', title: 'First Trailhead Completed', description: 'You followed an activation chain to its source' },
  { id: 'first-exile', tier: 'explorer', title: 'First Exile Discovered', description: "You found what's being protected" },
  { id: 'trail-named', tier: 'explorer', title: 'Trail Named & Saved', description: 'You mapped a protection system' },
  { id: 'values-clarified', tier: 'explorer', title: 'Values Clarified', description: 'You know what matters most to you' },
  { id: 'first-memory', tier: 'explorer', title: 'First Core Memory Added', description: 'You connected your present to your past' },
  { id: 'mission-written', tier: 'explorer', title: 'Mission Statement Written', description: "You've articulated your deeper purpose" },
  // Depth
  { id: 'manager-elaborated', tier: 'depth', title: 'Manager Elaborated', description: 'You understood a protector in depth' },
  { id: 'firefighter-elaborated', tier: 'depth', title: 'Firefighter Elaborated', description: 'You faced the reactive protector' },
  { id: 'exile-elaborated', tier: 'depth', title: 'Exile Elaborated', description: 'You sat with the most vulnerable part of your system' },
  { id: 'unblending-practice', tier: 'depth', title: 'Unblending Practice Done', description: 'You created space between Self and a part' },
  { id: '3-trails', tier: 'depth', title: '3 Trailheads Completed', description: 'Pattern recognition begins' },
  { id: 'first-refine', tier: 'depth', title: 'First Part Refined', description: 'This system is truly yours now' },
  { id: 'couples-session', tier: 'depth', title: 'First Couples Session', description: 'You brought IFS to your relationship' },
  // Integration
  { id: 'self-energy-up', tier: 'integration', title: 'Self-Energy Sustained Increase', description: 'Your baseline has shifted upward' },
  { id: '10-updates', tier: 'integration', title: '10 Updates Logged', description: "You're tracking your inner life consistently" },
  { id: 'all-elaborated', tier: 'integration', title: 'All Parts Elaborated', description: 'You know your whole system' },
  { id: '30-days-practice', tier: 'integration', title: '30 Days of Practice', description: "You've built a practice" },
  { id: 'snapshot-growth', tier: 'integration', title: 'Snapshot Shows Growth', description: 'You can see yourself changing' },
];

interface JourneyStore {
  events: TimelineEvent[];
  snapshots: SystemSnapshot[];
  journals: JournalEntry[];
  earnedMilestones: EarnedMilestone[];
  firstUseDate: string | null;

  addEvent: (e: Omit<TimelineEvent, 'id' | 'date'>) => void;
  addSnapshot: (s: Omit<SystemSnapshot, 'id' | 'date'>) => void;
  addJournal: (j: Omit<JournalEntry, 'id' | 'date'>) => void;
  earnMilestone: (milestoneId: string) => void;
  setFirstUse: () => void;
}

export const useJourneyStore = create<JourneyStore>()(
  persist(
    (set, get) => ({
      events: [],
      snapshots: [],
      journals: [],
      earnedMilestones: [],
      firstUseDate: null,

      addEvent: (e) =>
        set((s) => ({
          events: [...s.events, { ...e, id: crypto.randomUUID(), date: new Date().toISOString() }],
        })),

      addSnapshot: (snap) =>
        set((s) => ({
          snapshots: [...s.snapshots, { ...snap, id: crypto.randomUUID(), date: new Date().toISOString() }],
        })),

      addJournal: (j) => {
        const entry: JournalEntry = { ...j, id: crypto.randomUUID(), date: new Date().toISOString() };
        set((s) => ({
          journals: [...s.journals, entry],
          events: [
            ...s.events,
            { id: crypto.randomUUID(), type: 'journal-entry', date: entry.date, summary: j.text.slice(0, 80) + (j.text.length > 80 ? '...' : '') },
          ],
        }));
      },

      earnMilestone: (milestoneId) =>
        set((s) => {
          if (s.earnedMilestones.some((m) => m.milestoneId === milestoneId)) return s;
          return { earnedMilestones: [...s.earnedMilestones, { milestoneId, earnedAt: new Date().toISOString() }] };
        }),

      setFirstUse: () =>
        set((s) => {
          if (s.firstUseDate) return s;
          return { firstUseDate: new Date().toISOString() };
        }),
    }),
    { name: 'inner-atlas-journey' }
  )
);
