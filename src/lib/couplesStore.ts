import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Types ──

export interface CouplesPartRef {
  partId: string;
  partName: string;
  partType: string;
  partner: 'A' | 'B';
}

export interface RelationshipConnection {
  id: string;
  sourcePartId: string;
  sourcePartner: 'A' | 'B';
  targetPartId: string;
  targetPartner: 'A' | 'B';
  type: 'harmonious' | 'conflict' | 'protective' | 'mirroring';
  notes: string;
}

export interface RelationshipAssessmentEntry {
  partner: 'A' | 'B';
  patterns: string;
  activeParts: string[];
  triggers: string[];
  selfEnergyDuringConflict: number;
  values: string;
  growthAreas: string;
  completedAt: string;
}

export interface CouplesCheckIn {
  id: string;
  partner: 'A' | 'B';
  selfEnergy: number;
  activeParts: string[];
  temperature: 'disconnected' | 'distant' | 'neutral' | 'connected' | 'deeply-connected';
  note: string;
  date: string;
}

export type ConversationType =
  | 'conflict-resolution'
  | 'intimacy-connection'
  | 'vulnerability-sharing'
  | 'setting-boundaries'
  | 'repair-after-rupture'
  | 'future-planning'
  | 'appreciation-gratitude';

export interface ConversationStep {
  stepIndex: number;
  partnerAResponse: string;
  partnerBResponse: string;
}

export interface GuidedConversation {
  id: string;
  type: ConversationType;
  currentStep: number;
  steps: ConversationStep[];
  startedAt: string;
  completedAt?: string;
  partnerASelfEnergy?: number;
  partnerBSelfEnergy?: number;
  partnerAActiveParts: string[];
  partnerBActiveParts: string[];
}

export interface CouplesProfile {
  name: string;
  partIds: string[];
}

interface CouplesStore {
  // Setup
  isConnected: boolean;
  partnerA: CouplesProfile;
  partnerB: CouplesProfile;
  setupComplete: boolean;

  // Assessment
  assessments: RelationshipAssessmentEntry[];

  // Relationship Map
  sharedParts: CouplesPartRef[];
  connections: RelationshipConnection[];

  // Check-ins
  checkIns: CouplesCheckIn[];

  // Conversations
  conversations: GuidedConversation[];
  activeConversationId: string | null;

  // Actions - Setup
  connectPartner: (nameA: string, nameB: string) => void;
  disconnect: () => void;

  // Actions - Assessment
  submitAssessment: (entry: Omit<RelationshipAssessmentEntry, 'completedAt'>) => void;
  isAssessmentComplete: () => boolean;

  // Actions - Map
  addSharedPart: (part: CouplesPartRef) => void;
  removeSharedPart: (partId: string, partner: 'A' | 'B') => void;
  addConnection: (conn: Omit<RelationshipConnection, 'id'>) => void;
  updateConnection: (id: string, data: Partial<RelationshipConnection>) => void;
  deleteConnection: (id: string) => void;

  // Actions - Check-ins
  addCheckIn: (checkIn: Omit<CouplesCheckIn, 'id' | 'date'>) => void;
  getLatestCheckIns: () => { a: CouplesCheckIn | null; b: CouplesCheckIn | null };

  // Actions - Conversations
  startConversation: (type: ConversationType) => string;
  updateConversationStep: (convId: string, stepIndex: number, partner: 'A' | 'B', response: string) => void;
  advanceConversation: (convId: string) => void;
  completeConversation: (convId: string) => void;
  setConversationActiveParts: (convId: string, partner: 'A' | 'B', partIds: string[]) => void;
  setConversationSelfEnergy: (convId: string, partner: 'A' | 'B', value: number) => void;
}

const FRAMEWORK_STEP_COUNTS: Record<ConversationType, number> = {
  'conflict-resolution': 7,
  'intimacy-connection': 6,
  'vulnerability-sharing': 5,
  'setting-boundaries': 6,
  'repair-after-rupture': 7,
  'future-planning': 5,
  'appreciation-gratitude': 4,
};

export const CONVERSATION_FRAMEWORKS: Record<ConversationType, { title: string; description: string; steps: { title: string; promptA: string; promptB: string; helper?: string }[] }> = {
  'conflict-resolution': {
    title: 'Conflict Resolution',
    description: 'A structured approach to work through disagreements using IFS principles.',
    steps: [
      { title: 'Check-In', promptA: 'Rate your Self-energy and identify active parts.', promptB: 'Rate your Self-energy and identify active parts.', helper: 'Notice which parts are most present right now.' },
      { title: 'Recognition', promptA: 'Name the parts that are active for you right now in this situation.', promptB: 'Name the parts that are active for you right now in this situation.', helper: 'Try: "I notice a part of me that..."' },
      { title: 'Pause', promptA: 'Take a moment for a 60-second breathing exercise together.', promptB: 'Take a moment for a 60-second breathing exercise together.' },
      { title: 'Curiosity', promptA: 'From your Self, what are you curious about in your partner\'s experience right now?', promptB: 'From your Self, what are you curious about in your partner\'s experience right now?', helper: 'Try: "From my Self, I\'m curious about..."' },
      { title: 'Understanding', promptA: 'What is the need underneath your activated part\'s position?', promptB: 'What is the need underneath your activated part\'s position?' },
      { title: 'Connection', promptA: 'What might you both need to feel understood right now?', promptB: 'What might you both need to feel understood right now?' },
      { title: 'Integration', promptA: 'What did you learn? What would you like to try differently?', promptB: 'What did you learn? What would you like to try differently?' },
    ],
  },
  'intimacy-connection': {
    title: 'Intimacy & Connection',
    description: 'Deepen emotional closeness by exploring parts that open or close to intimacy.',
    steps: [
      { title: 'Settle', promptA: 'Take a breath and notice how open or closed you feel right now.', promptB: 'Take a breath and notice how open or closed you feel right now.' },
      { title: 'Parts Check', promptA: 'Which parts might be guarding your vulnerability right now?', promptB: 'Which parts might be guarding your vulnerability right now?', helper: 'Protector parts often step in when intimacy increases.' },
      { title: 'Desire', promptA: 'What does the part of you that longs for connection want right now?', promptB: 'What does the part of you that longs for connection want right now?' },
      { title: 'Sharing', promptA: 'Share something your partner doesn\'t know about how you experience closeness.', promptB: 'Share something your partner doesn\'t know about how you experience closeness.' },
      { title: 'Receiving', promptA: 'What did you hear from your partner? What touched you?', promptB: 'What did you hear from your partner? What touched you?' },
      { title: 'Closing', promptA: 'What would help you carry this connection forward?', promptB: 'What would help you carry this connection forward?' },
    ],
  },
  'vulnerability-sharing': {
    title: 'Vulnerability Sharing',
    description: 'Create a safe space to share vulnerable parts with each other.',
    steps: [
      { title: 'Safety Check', promptA: 'How safe do you feel to share something vulnerable right now?', promptB: 'How safe do you feel to share something vulnerable right now?' },
      { title: 'Self Access', promptA: 'Take a moment to connect with your Self-energy. Breathe.', promptB: 'Take a moment to connect with your Self-energy. Breathe.' },
      { title: 'Sharing', promptA: 'Share about a part that carries something difficult for you.', promptB: 'Listen fully. Then share about a part that carries something difficult for you.', helper: 'Try: "There\'s a part of me that carries..."' },
      { title: 'Witnessing', promptA: 'What did you notice as your partner shared? What part of you responded?', promptB: 'What did you notice as your partner shared? What part of you responded?' },
      { title: 'Closing', promptA: 'What do you appreciate about your partner\'s courage in sharing?', promptB: 'What do you appreciate about your partner\'s courage in sharing?' },
    ],
  },
  'setting-boundaries': {
    title: 'Setting Boundaries',
    description: 'Explore and communicate boundaries using parts awareness.',
    steps: [
      { title: 'Check-In', promptA: 'Notice which parts are present as you think about boundaries.', promptB: 'Notice which parts are present as you think about boundaries.' },
      { title: 'Identify', promptA: 'What boundary do you need to communicate?', promptB: 'What boundary do you need to communicate?', helper: 'A boundary protects something important to you.' },
      { title: 'Parts Behind', promptA: 'Which part needs this boundary? What is it protecting?', promptB: 'Which part needs this boundary? What is it protecting?' },
      { title: 'Share', promptA: 'Share your boundary with your partner from Self.', promptB: 'Listen from Self, then share your boundary.', helper: 'Try: "A part of me needs... because..."' },
      { title: 'Respond', promptA: 'What parts responded to your partner\'s boundary? What do you understand?', promptB: 'What parts responded to your partner\'s boundary? What do you understand?' },
      { title: 'Agreement', promptA: 'What agreements can you make to honor each other\'s boundaries?', promptB: 'What agreements can you make to honor each other\'s boundaries?' },
    ],
  },
  'repair-after-rupture': {
    title: 'Repair After Rupture',
    description: 'Heal a recent disconnection or conflict through parts-aware repair.',
    steps: [
      { title: 'Ground', promptA: 'Before starting, take several breaths. This is repair, not re-fighting.', promptB: 'Before starting, take several breaths. This is repair, not re-fighting.' },
      { title: 'Self Check', promptA: 'Rate your Self-energy. Can you approach this from Self?', promptB: 'Rate your Self-energy. Can you approach this from Self?' },
      { title: 'Acknowledge', promptA: 'Name what happened without blame. What parts were activated?', promptB: 'Name what happened without blame. What parts were activated?', helper: 'Try: "During that moment, a part of me..."' },
      { title: 'Impact', promptA: 'Share the impact on your parts. What got hurt or scared?', promptB: 'Share the impact on your parts. What got hurt or scared?' },
      { title: 'Responsibility', promptA: 'What can you own about your part\'s behavior during the rupture?', promptB: 'What can you own about your part\'s behavior during the rupture?' },
      { title: 'Needs', promptA: 'What does the hurt part of you need right now?', promptB: 'What does the hurt part of you need right now?' },
      { title: 'Repair', promptA: 'What repair action would help? What can you offer your partner?', promptB: 'What repair action would help? What can you offer your partner?' },
    ],
  },
  'future-planning': {
    title: 'Future Planning',
    description: 'Dream and plan together while staying aware of parts that emerge.',
    steps: [
      { title: 'Vision', promptA: 'What does your heart most want for your relationship\'s future?', promptB: 'What does your heart most want for your relationship\'s future?' },
      { title: 'Parts Check', promptA: 'Which parts have opinions about the future? What are they afraid of?', promptB: 'Which parts have opinions about the future? What are they afraid of?' },
      { title: 'Shared Dreams', promptA: 'What dreams do you share? Where do you align?', promptB: 'What dreams do you share? Where do you align?' },
      { title: 'Differences', promptA: 'Where do your visions differ? Which parts are driving those differences?', promptB: 'Where do your visions differ? Which parts are driving those differences?' },
      { title: 'Next Steps', promptA: 'What\'s one step you can take together toward your shared vision?', promptB: 'What\'s one step you can take together toward your shared vision?' },
    ],
  },
  'appreciation-gratitude': {
    title: 'Appreciation & Gratitude',
    description: 'Strengthen your bond through intentional appreciation and gratitude.',
    steps: [
      { title: 'Settle', promptA: 'Take a moment to let the busyness of the day settle.', promptB: 'Take a moment to let the busyness of the day settle.' },
      { title: 'Appreciate', promptA: 'Share three specific things you appreciate about your partner this week.', promptB: 'Share three specific things you appreciate about your partner this week.', helper: 'Be specific about moments, not generalities.' },
      { title: 'Receive', promptA: 'What did it feel like to hear your partner\'s appreciation? Which parts responded?', promptB: 'What did it feel like to hear your partner\'s appreciation? Which parts responded?' },
      { title: 'Gratitude', promptA: 'Express gratitude for something your partner\'s parts do for your relationship.', promptB: 'Express gratitude for something your partner\'s parts do for your relationship.', helper: 'Try: "I\'m grateful that your [part] helps us by..."' },
    ],
  },
};

export const TRIGGER_OPTIONS = [
  'Criticism or judgment',
  'Feeling ignored or dismissed',
  'Conflict or raised voices',
  'Emotional withdrawal',
  'Feeling controlled',
  'Broken promises',
  'Intimacy pressure',
  'Financial stress',
  'Parenting disagreements',
  'Feeling unappreciated',
  'Jealousy or insecurity',
  'Schedule or time conflicts',
];

export const useCouplesStore = create<CouplesStore>()(
  persist(
    (set, get) => ({
      isConnected: false,
      partnerA: { name: '', partIds: [] },
      partnerB: { name: '', partIds: [] },
      setupComplete: false,
      assessments: [],
      sharedParts: [],
      connections: [],
      checkIns: [],
      conversations: [],
      activeConversationId: null,

      connectPartner: (nameA, nameB) => set({
        isConnected: true,
        partnerA: { name: nameA, partIds: [] },
        partnerB: { name: nameB, partIds: [] },
        setupComplete: true,
      }),

      disconnect: () => set({
        isConnected: false,
        partnerA: { name: '', partIds: [] },
        partnerB: { name: '', partIds: [] },
        setupComplete: false,
        assessments: [],
        sharedParts: [],
        connections: [],
        checkIns: [],
        conversations: [],
        activeConversationId: null,
      }),

      submitAssessment: (entry) => set((s) => ({
        assessments: [...s.assessments.filter((a) => a.partner !== entry.partner), { ...entry, completedAt: new Date().toISOString() }],
      })),

      isAssessmentComplete: () => {
        const { assessments } = get();
        return assessments.some((a) => a.partner === 'A') && assessments.some((a) => a.partner === 'B');
      },

      addSharedPart: (part) => set((s) => ({
        sharedParts: [...s.sharedParts.filter((p) => !(p.partId === part.partId && p.partner === part.partner)), part],
      })),

      removeSharedPart: (partId, partner) => set((s) => ({
        sharedParts: s.sharedParts.filter((p) => !(p.partId === partId && p.partner === partner)),
      })),

      addConnection: (conn) => set((s) => ({
        connections: [...s.connections, { ...conn, id: Math.random().toString(36).substring(7) }],
      })),

      updateConnection: (id, data) => set((s) => ({
        connections: s.connections.map((c) => c.id === id ? { ...c, ...data } : c),
      })),

      deleteConnection: (id) => set((s) => ({
        connections: s.connections.filter((c) => c.id !== id),
      })),

      addCheckIn: (checkIn) => set((s) => ({
        checkIns: [...s.checkIns, { ...checkIn, id: Math.random().toString(36).substring(7), date: new Date().toISOString() }],
      })),

      getLatestCheckIns: () => {
        const { checkIns } = get();
        const sorted = [...checkIns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return {
          a: sorted.find((c) => c.partner === 'A') || null,
          b: sorted.find((c) => c.partner === 'B') || null,
        };
      },

      startConversation: (type) => {
        const id = Math.random().toString(36).substring(7);
        const stepCount = FRAMEWORK_STEP_COUNTS[type];
        const steps: ConversationStep[] = Array.from({ length: stepCount }, (_, i) => ({
          stepIndex: i,
          partnerAResponse: '',
          partnerBResponse: '',
        }));
        set((s) => ({
          conversations: [...s.conversations, {
            id, type, currentStep: 0, steps, startedAt: new Date().toISOString(),
            partnerAActiveParts: [], partnerBActiveParts: [],
          }],
          activeConversationId: id,
        }));
        return id;
      },

      updateConversationStep: (convId, stepIndex, partner, response) => set((s) => ({
        conversations: s.conversations.map((c) =>
          c.id === convId
            ? { ...c, steps: c.steps.map((st) => st.stepIndex === stepIndex ? { ...st, [partner === 'A' ? 'partnerAResponse' : 'partnerBResponse']: response } : st) }
            : c
        ),
      })),

      advanceConversation: (convId) => set((s) => ({
        conversations: s.conversations.map((c) => c.id === convId ? { ...c, currentStep: c.currentStep + 1 } : c),
      })),

      completeConversation: (convId) => set((s) => ({
        conversations: s.conversations.map((c) => c.id === convId ? { ...c, completedAt: new Date().toISOString() } : c),
        activeConversationId: null,
      })),

      setConversationActiveParts: (convId, partner, partIds) => set((s) => ({
        conversations: s.conversations.map((c) =>
          c.id === convId
            ? { ...c, [partner === 'A' ? 'partnerAActiveParts' : 'partnerBActiveParts']: partIds }
            : c
        ),
      })),

      setConversationSelfEnergy: (convId, partner, value) => set((s) => ({
        conversations: s.conversations.map((c) =>
          c.id === convId
            ? { ...c, [partner === 'A' ? 'partnerASelfEnergy' : 'partnerBSelfEnergy']: value }
            : c
        ),
      })),
    }),
    { name: 'inner-atlas-couples' }
  )
);
