import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PracticeSession {
  id: string;
  practiceId: string;
  startedAt: string;
  completedAt?: string;
  reflections: Record<number, string>; // stepIndex → text
  selectedPartId?: string;
  integrationNote?: string;
  /** Step the user paused at (null = not paused) */
  pausedAtStep?: number;
}

interface PracticesStore {
  sessions: PracticeSession[];
  favorites: string[]; // practice ids
  currentSession: PracticeSession | null;

  startSession: (practiceId: string) => void;
  setReflection: (stepIndex: number, text: string) => void;
  setSelectedPart: (partId: string) => void;
  pauseSession: (stepIndex: number) => void;
  completeSession: (integrationNote?: string) => void;
  cancelSession: () => void;
  resumeSession: (sessionId: string) => void;
  toggleFavorite: (practiceId: string) => void;
}

export const usePracticesStore = create<PracticesStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      favorites: [],
      currentSession: null,

      startSession: (practiceId) =>
        set({
          currentSession: {
            id: crypto.randomUUID(),
            practiceId,
            startedAt: new Date().toISOString(),
            reflections: {},
          },
        }),

      setReflection: (stepIndex, text) =>
        set((s) => {
          if (!s.currentSession) return s;
          return {
            currentSession: {
              ...s.currentSession,
              reflections: { ...s.currentSession.reflections, [stepIndex]: text },
            },
          };
        }),

      setSelectedPart: (partId) =>
        set((s) => {
          if (!s.currentSession) return s;
          return { currentSession: { ...s.currentSession, selectedPartId: partId } };
        }),

      pauseSession: (stepIndex) =>
        set((s) => {
          if (!s.currentSession) return s;
          const paused = { ...s.currentSession, pausedAtStep: stepIndex };
          return {
            currentSession: null,
            sessions: [...s.sessions, paused],
          };
        }),

      completeSession: (integrationNote) =>
        set((s) => {
          if (!s.currentSession) return s;
          const completed: PracticeSession = {
            ...s.currentSession,
            completedAt: new Date().toISOString(),
            integrationNote,
            pausedAtStep: undefined,
          };
          return {
            currentSession: null,
            sessions: [...s.sessions.filter((ss) => ss.id !== completed.id), completed],
          };
        }),

      cancelSession: () => set({ currentSession: null }),

      resumeSession: (sessionId) =>
        set((s) => {
          const session = s.sessions.find((ss) => ss.id === sessionId);
          if (!session) return s;
          return {
            currentSession: session,
            sessions: s.sessions.filter((ss) => ss.id !== sessionId),
          };
        }),

      toggleFavorite: (practiceId) =>
        set((s) => ({
          favorites: s.favorites.includes(practiceId)
            ? s.favorites.filter((f) => f !== practiceId)
            : [...s.favorites, practiceId],
        })),
    }),
    { name: 'inner-atlas-practices' }
  )
);
