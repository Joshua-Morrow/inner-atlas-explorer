import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const SELF_QUALITIES = ['Calm', 'Curious', 'Compassionate', 'Clear', 'Confident', 'Creative', 'Courageous', 'Connected'] as const;
export type SelfQuality = typeof SELF_QUALITIES[number];

export const QUALITY_DESCRIPTIONS: Record<SelfQuality, string> = {
  Calm: 'Centered, peaceful presence',
  Curious: 'Open, interested, wondering',
  Compassionate: 'Warm, caring toward all parts',
  Clear: 'Unblended, seeing the bigger picture',
  Confident: 'Trusting in your capacity to handle what arises',
  Creative: 'Resourceful, generative, flexible',
  Courageous: 'Willing to face difficult parts or feelings',
  Connected: 'In touch with yourself, others, something larger',
};

export const QUALITY_INDICATORS: Record<SelfQuality, string[]> = {
  Calm: [
    'I can stay centered even when things around me are chaotic',
    'I notice tension in my body and can soften it intentionally',
    'I feel a sense of inner stillness available to me',
  ],
  Curious: [
    'I feel interested in understanding my parts, even difficult ones',
    'I approach situations with openness rather than judgment',
    'I\'m able to ask questions rather than make assumptions',
  ],
  Compassionate: [
    'I can feel warmth toward my own suffering',
    'I extend care to my parts without needing them to change',
    'I feel tenderness toward my most vulnerable parts',
  ],
  Clear: [
    'I can see the bigger picture even when parts are activated',
    'I can distinguish my Self\'s perspective from my parts\' perspectives',
    'I have a sense of knowing that isn\'t driven by anxiety or urgency',
  ],
  Confident: [
    'I trust that I can handle whatever arises',
    'I feel a core sense of "I\'m okay" even in difficulty',
    'I can take action without being paralyzed by doubt',
  ],
  Creative: [
    'I can find new approaches when the usual ones aren\'t working',
    'I feel resourceful and flexible in my responses',
    'I can generate possibilities rather than feeling stuck',
  ],
  Courageous: [
    'I\'m willing to face difficult feelings or parts',
    'I can stay present with discomfort rather than fleeing',
    'I take emotional risks when they serve my growth',
  ],
  Connected: [
    'I feel in touch with something deeper in myself',
    'I can be genuinely present with others',
    'I sense being part of something larger than myself',
    'I feel connected to my own values and purpose',
  ],
};

export const LIFE_DOMAINS = ['Work/Professional', 'Close Relationships', 'Family', 'Social Settings', 'When Alone', 'Under Stress', 'During Decision-Making'] as const;
export const CONTEXT_CHIPS = ['Home', 'Work', 'Social', 'Alone', 'Family', 'Health Situation', 'Crisis', 'Other'] as const;
export const SELF_PRACTICES = ['Meditation', 'Journaling', 'Movement', 'Nature', 'Therapy', 'Creative Work', 'Breathwork', 'Somatic Practices', 'Time Alone', 'Connection with Others', 'Other'] as const;

export interface BlendedPart {
  partId: string;
  strength: 'Mild' | 'Moderate' | 'Strong';
}

export interface QuickCheckIn {
  id: string;
  date: string;
  overallEnergy: number;
  qualities: Record<SelfQuality, number>;
  blendedParts: BlendedPart[];
  context: string[];
  note: string;
}

export interface FullAssessment {
  id: string;
  date: string;
  qualityIndicators: Record<SelfQuality, number[]>;
  domainAccess: Record<string, number>;
  partBlending: { partId: string; frequency: string; trigger: string }[];
  practices: { name: string; frequency: string }[];
  leadership: Record<string, number>;
  reflections: { supported: string; challenged: string; remember: string };
}

export interface SelfMoment {
  id: string;
  date: string;
  whatHappened: string;
  whatHelped: string;
  howItFelt: string;
  starred: boolean;
}

export interface Practice {
  id: string;
  title: string;
  category: string;
  duration: string;
  depth: 'Gentle' | 'Moderate' | 'Deep';
  steps: string[];
  quality?: SelfQuality;
}

interface SelfEnergyStore {
  checkIns: QuickCheckIn[];
  fullAssessments: FullAssessment[];
  selfMoments: SelfMoment[];
  favoritePractices: string[];

  addCheckIn: (c: Omit<QuickCheckIn, 'id' | 'date'>) => void;
  addFullAssessment: (a: Omit<FullAssessment, 'id' | 'date'>) => void;
  addSelfMoment: (m: Omit<SelfMoment, 'id' | 'date' | 'starred'>) => void;
  toggleMomentStar: (id: string) => void;
  toggleFavoritePractice: (id: string) => void;
  getLatestCheckIn: () => QuickCheckIn | undefined;
  getLatestFullAssessment: () => FullAssessment | undefined;
  getRecentBlendedPartIds: () => string[];
}

export const useSelfEnergyStore = create<SelfEnergyStore>()(
  persist(
    (set, get) => ({
      checkIns: [],
      fullAssessments: [],
      selfMoments: [],
      favoritePractices: [],

      addCheckIn: (c) => set((s) => ({
        checkIns: [...s.checkIns, { ...c, id: Math.random().toString(36).substring(7), date: new Date().toISOString() }],
      })),

      addFullAssessment: (a) => set((s) => ({
        fullAssessments: [...s.fullAssessments, { ...a, id: Math.random().toString(36).substring(7), date: new Date().toISOString() }],
      })),

      addSelfMoment: (m) => set((s) => ({
        selfMoments: [...s.selfMoments, { ...m, id: Math.random().toString(36).substring(7), date: new Date().toISOString(), starred: false }],
      })),

      toggleMomentStar: (id) => set((s) => ({
        selfMoments: s.selfMoments.map((m) => m.id === id ? { ...m, starred: !m.starred } : m),
      })),

      toggleFavoritePractice: (id) => set((s) => ({
        favoritePractices: s.favoritePractices.includes(id)
          ? s.favoritePractices.filter((f) => f !== id)
          : [...s.favoritePractices, id],
      })),

      getLatestCheckIn: () => {
        const cks = get().checkIns;
        return cks.length > 0 ? cks[cks.length - 1] : undefined;
      },

      getLatestFullAssessment: () => {
        const fa = get().fullAssessments;
        return fa.length > 0 ? fa[fa.length - 1] : undefined;
      },

      getRecentBlendedPartIds: () => {
        const latest = get().getLatestCheckIn();
        return latest ? latest.blendedParts.map((b) => b.partId) : [];
      },
    }),
    { name: 'inner-atlas-self-energy' }
  )
);

// ─── Practices Library Data ───
export const practicesLibrary: Practice[] = [
  // Breathing & Grounding
  { id: 'bg-1', title: 'Box Breathing', category: 'Breathing & Grounding', duration: '3 min', depth: 'Gentle',
    steps: ['Find a comfortable position and close your eyes.', 'Breathe in slowly for 4 counts.', 'Hold your breath for 4 counts.', 'Exhale slowly for 4 counts.', 'Hold empty for 4 counts.', 'Repeat for 3–5 minutes.'] },
  { id: 'bg-2', title: '5-4-3-2-1 Grounding', category: 'Breathing & Grounding', duration: '5 min', depth: 'Gentle',
    steps: ['Notice 5 things you can see around you.', 'Notice 4 things you can touch or feel.', 'Notice 3 things you can hear.', 'Notice 2 things you can smell.', 'Notice 1 thing you can taste.', 'Take a deep breath and notice how you feel.'] },
  { id: 'bg-3', title: 'Body Scan Grounding', category: 'Breathing & Grounding', duration: '7 min', depth: 'Moderate',
    steps: ['Close your eyes and take three deep breaths.', 'Bring attention to the top of your head.', 'Slowly scan downward — forehead, jaw, neck, shoulders.', 'Notice each area without trying to change anything.', 'Continue through arms, chest, belly, legs, feet.', 'When complete, take three more deep breaths.'] },
  { id: 'bg-4', title: 'Feet on the Ground', category: 'Breathing & Grounding', duration: '2 min', depth: 'Gentle',
    steps: ['Stand or sit with both feet flat on the floor.', 'Press your feet gently into the ground.', 'Notice the sensation of support beneath you.', 'Imagine roots growing from your feet into the earth.', 'Breathe and feel the stability of the ground holding you.'] },
  // Unblending from Parts
  { id: 'ub-1', title: 'The Step-Back Technique', category: 'Unblending from Parts', duration: '5 min', depth: 'Moderate',
    steps: ['Notice which part is most active right now.', 'Silently say to the part: "I see you. I know you\'re here."', 'Ask the part if it would be willing to step back just a little.', 'Notice any space that opens between you and the part.', 'From that space, see if you can observe the part with curiosity.', 'Thank the part for being willing to give you some room.'] },
  { id: 'ub-2', title: 'Finding Self Among Parts', category: 'Unblending from Parts', duration: '7 min', depth: 'Moderate',
    steps: ['Close your eyes and notice all the inner activity.', 'Imagine each part as a person in a room with you.', 'Ask each part to sit in their own chair — not on your lap.', 'Notice who is left when all parts have their own seats.', 'That awareness, that noticing — that\'s Self.', 'Rest in that awareness for a moment.'] },
  { id: 'ub-3', title: 'The "Not Me" Practice', category: 'Unblending from Parts', duration: '4 min', depth: 'Deep',
    steps: ['Identify a strong feeling or thought pattern present now.', 'Say to yourself: "A part of me feels [this], but it is not all of me."', 'Repeat for each strong part you notice.', 'Notice what remains when you differentiate from each part.', 'Rest in the space of "the one who notices."'] },
  // Compassion Practices
  { id: 'cp-1', title: 'Compassion for a Protector', category: 'Compassion Practices', duration: '5 min', depth: 'Moderate',
    steps: ['Think of a protector part that has been active recently.', 'Acknowledge how hard this part has been working.', 'Silently say: "I see how much you\'ve been trying to help."', 'Ask: "What are you afraid would happen if you stopped?"', 'Whatever it says, respond with: "I understand. Thank you."', 'Send this part warmth and appreciation from your Self.'] },
  { id: 'cp-2', title: 'Self-Compassion Meditation', category: 'Compassion Practices', duration: '8 min', depth: 'Deep',
    steps: ['Place your hand on your heart.', 'Think of a moment of suffering — your own or another\'s.', 'Say: "This is a moment of suffering."', 'Say: "Suffering is a part of being human."', 'Say: "May I be kind to myself in this moment."', 'Say: "May I give myself the compassion I need."', 'Sit quietly and notice what arises.'] },
  // Self Qualities Cultivation
  { id: 'sq-calm', title: 'Cultivating Calm', category: 'Self Qualities', duration: '4 min', depth: 'Gentle', quality: 'Calm',
    steps: ['Find a quiet spot and slow your breathing.', 'Recall a time when you felt deeply peaceful.', 'Let that peace expand in your body.', 'Notice: calm is always available beneath the noise.', 'Rest here for a few breaths.'] },
  { id: 'sq-curious', title: 'Cultivating Curiosity', category: 'Self Qualities', duration: '4 min', depth: 'Gentle', quality: 'Curious',
    steps: ['Choose a part or feeling that is active right now.', 'Instead of analyzing, just wonder about it.', 'Ask gently: "What is this? What wants to be known?"', 'Let yourself not know the answer.', 'Notice how curiosity softens the intensity.'] },
  { id: 'sq-compassionate', title: 'Cultivating Compassion', category: 'Self Qualities', duration: '5 min', depth: 'Moderate', quality: 'Compassionate',
    steps: ['Think of a part you usually push away or judge.', 'Imagine this part as a child doing its best.', 'What does this child need to hear?', 'Offer those words silently from your Self.', 'Notice any warmth that arises.'] },
  { id: 'sq-clear', title: 'Cultivating Clarity', category: 'Self Qualities', duration: '4 min', depth: 'Moderate', quality: 'Clear',
    steps: ['Notice all the voices and opinions inside right now.', 'Imagine turning the volume down on each one.', 'In the quiet, ask: "What do I actually know to be true?"', 'Let the answer come without forcing it.', 'Trust whatever clarity emerges.'] },
  { id: 'sq-confident', title: 'Cultivating Confidence', category: 'Self Qualities', duration: '4 min', depth: 'Gentle', quality: 'Confident',
    steps: ['Recall a moment when you handled something well.', 'Remember how it felt in your body.', 'Say: "I have navigated hard things before."', 'Let that knowing settle in your chest.', 'This capacity is always within you.'] },
  { id: 'sq-creative', title: 'Cultivating Creativity', category: 'Self Qualities', duration: '5 min', depth: 'Gentle', quality: 'Creative',
    steps: ['Think of a situation where you feel stuck.', 'Ask: "What if there were ten possible responses?"', 'Let yourself brainstorm without judgment.', 'Notice how possibility feels in your body.', 'Choose the option that feels most alive.'] },
  { id: 'sq-courageous', title: 'Cultivating Courage', category: 'Self Qualities', duration: '5 min', depth: 'Moderate', quality: 'Courageous',
    steps: ['Think of something you\'ve been avoiding.', 'Notice the fear without running from it.', 'Say: "I can be afraid and still move forward."', 'Take one tiny step toward what scares you.', 'Notice that courage isn\'t the absence of fear.'] },
  { id: 'sq-connected', title: 'Cultivating Connection', category: 'Self Qualities', duration: '5 min', depth: 'Moderate', quality: 'Connected',
    steps: ['Close your eyes and place your hand on your heart.', 'Feel your own heartbeat — your aliveness.', 'Think of someone you love. Feel the thread between you.', 'Expand that sense to include all living things.', 'You are never truly alone.'] },
];
