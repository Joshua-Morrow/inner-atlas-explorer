import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ElaborationTab {
  id: string;
  label: string;
  questions: string[];
}

export const elaborationTabs: ElaborationTab[] = [
  {
    id: 'story',
    label: 'Story & History',
    questions: [
      'When did you first notice this part in your life?',
      'Can you remember a specific time when this part was especially active?',
      'What significant life events might have shaped this part?',
      'How has this part changed or evolved over time?',
      'If this part had an origin story, what would it be?',
    ],
  },
  {
    id: 'appearance',
    label: 'Appearance & Identity',
    questions: [
      'If you could visualize this part, what might it look like? (age, appearance, demeanor)',
      'What name feels personally right for this part beyond its functional label?',
      'What energy or presence does this part have? (size, weight, intensity)',
      'Where in your body do you most strongly feel this part?',
      'If this part had a voice, what would it sound like?',
      'Describe or imagine an image/icon that represents this part.',
    ],
  },
  {
    id: 'function',
    label: 'Function & Purpose',
    questions: [
      'What do you believe this part is trying to accomplish for you?',
      'What would happen if this part wasn\'t there to do its job?',
      'What is this part afraid might happen if it stopped its activities?',
      'How does this part view its role in your overall system?',
      'What beliefs does this part hold about you, others, or the world?',
    ],
  },
  {
    id: 'needs',
    label: 'Needs & Values',
    questions: [
      'What does this part need to feel safe?',
      'What does this part value most?',
      'What recognition or appreciation might this part want from you?',
      'What might this part need that it hasn\'t been getting?',
      'If this part could have more of something in your life, what would it be?',
    ],
  },
  {
    id: 'relationship',
    label: 'Your Relationship',
    questions: [
      'How do you currently feel toward this part?',
      'What would you like this part to know about you?',
      'How might you develop a better relationship with this part?',
      'What compassion or understanding might this part need from you?',
      'If you could make an agreement with this part, what would it be?',
    ],
  },
  {
    id: 'burdens',
    label: 'Burdens, Gifts & Growth',
    questions: [
      'What difficult experiences or beliefs might this part be carrying?',
      'What outdated strategies might this part be using?',
      'What would this part look like if it were unburdened?',
      'What wisdom or strengths does this part bring to your system?',
      'What positive intention underlies this part\'s activities?',
      'How might this part\'s energy be channeled more constructively?',
    ],
  },
];

export interface ElaborationResponse {
  tabId: string;
  questionIndex: number;
  answer: string;
  timestamp: string;
}

export interface ElaborationSession {
  id: string;
  partId: string;
  date: string;
  responses: ElaborationResponse[];
  completed: boolean;
}

interface ElaborationStore {
  sessions: ElaborationSession[];
  // Current in-progress session
  activeSessionId: string | null;
  activeTabIndex: number;
  activeQuestionIndex: number;

  startSession: (partId: string) => string;
  setActiveSession: (sessionId: string | null) => void;
  setActiveTab: (index: number) => void;
  setActiveQuestion: (index: number) => void;
  saveResponse: (sessionId: string, tabId: string, questionIndex: number, answer: string) => void;
  completeSession: (sessionId: string) => void;
  getSessionsForPart: (partId: string) => ElaborationSession[];
  getPartElaborationProgress: (partId: string) => number; // 0-100
  isPartElaborated: (partId: string) => boolean;
}

export const useElaborationStore = create<ElaborationStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeSessionId: null,
      activeTabIndex: 0,
      activeQuestionIndex: 0,

      startSession: (partId: string) => {
        const id = Math.random().toString(36).substring(7);
        const session: ElaborationSession = {
          id,
          partId,
          date: new Date().toISOString(),
          responses: [],
          completed: false,
        };
        set((state) => ({
          sessions: [...state.sessions, session],
          activeSessionId: id,
          activeTabIndex: 0,
          activeQuestionIndex: 0,
        }));
        return id;
      },

      setActiveSession: (sessionId) => set({ activeSessionId: sessionId, activeTabIndex: 0, activeQuestionIndex: 0 }),

      setActiveTab: (index) => set({ activeTabIndex: index, activeQuestionIndex: 0 }),

      setActiveQuestion: (index) => set({ activeQuestionIndex: index }),

      saveResponse: (sessionId, tabId, questionIndex, answer) =>
        set((state) => ({
          sessions: state.sessions.map((s) => {
            if (s.id !== sessionId) return s;
            const existing = s.responses.findIndex(
              (r) => r.tabId === tabId && r.questionIndex === questionIndex
            );
            const response: ElaborationResponse = {
              tabId,
              questionIndex,
              answer,
              timestamp: new Date().toISOString(),
            };
            const responses = [...s.responses];
            if (existing >= 0) {
              responses[existing] = response;
            } else {
              responses.push(response);
            }
            return { ...s, responses };
          }),
        })),

      completeSession: (sessionId) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId ? { ...s, completed: true } : s
          ),
          activeSessionId: null,
        })),

      getSessionsForPart: (partId) => get().sessions.filter((s) => s.partId === partId),

      getPartElaborationProgress: (partId) => {
        const sessions = get().sessions.filter((s) => s.partId === partId);
        if (sessions.length === 0) return 0;
        // Count unique tab+question combos answered across all sessions
        const totalQuestions = elaborationTabs.reduce((sum, t) => sum + t.questions.length, 0);
        const answered = new Set<string>();
        for (const s of sessions) {
          for (const r of s.responses) {
            if (r.answer.trim()) answered.add(`${r.tabId}-${r.questionIndex}`);
          }
        }
        return Math.round((answered.size / totalQuestions) * 100);
      },

      isPartElaborated: (partId) => {
        const sessions = get().sessions.filter((s) => s.partId === partId);
        // Elaborated if at least one response in each tab
        const tabsWithResponses = new Set<string>();
        for (const s of sessions) {
          for (const r of s.responses) {
            if (r.answer.trim()) tabsWithResponses.add(r.tabId);
          }
        }
        return tabsWithResponses.size >= elaborationTabs.length;
      },
    }),
    { name: 'inner-atlas-elaboration' }
  )
);
