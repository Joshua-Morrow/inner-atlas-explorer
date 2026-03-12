// All assessment content data — questions, naming moments, chips
// Backend classifications are NEVER shown to users

export interface QuestionDef {
  id: string;
  text: string;
  subtext?: string;
  type: 'multi-select' | 'single-select';
  options: string[];
  maxSelections?: number;
  followUp?: { condition: string[]; prompt: string };
}

export interface NamingMomentDef {
  cluster: string;
  reflectionParagraphs: string[];
  nameChips: string[];
  backendClassification: string;
  partType: 'Protector-Manager' | 'Protector-Firefighter' | 'Exile';
}

// ── PHASE 1: THE MOMENT ──────────────────────────

export const phase1Questions: QuestionDef[] = [
  {
    id: 'bodySensations',
    text: 'In that moment, what did you feel in your body?',
    type: 'multi-select',
    options: [
      'Chest tightness', 'Stomach dropping', 'Jaw or shoulders clenching',
      'Heart racing', 'Numbness or disconnection', 'Heat rising',
      'Restlessness', 'Heaviness', 'Throat constriction', 'Something else',
    ],
  },
  {
    id: 'actions',
    text: 'What did you do — or want to do?',
    type: 'multi-select',
    options: [
      'Withdraw', 'Push back', 'Try to fix it',
      'Reach for something comforting', 'Distract yourself', 'Go numb',
      'Work harder', 'Disappear', 'Make sure the other person was okay',
      'Something else',
    ],
  },
  {
    id: 'secondVoice',
    text: 'Was there a voice or pull going against that reaction — a second perspective?',
    type: 'single-select',
    options: ['Yes clearly', 'Yes faintly', 'Not sure', 'No'],
    followUp: {
      condition: ['Yes clearly', 'Yes faintly'],
      prompt: 'What was it saying?',
    },
  },
  {
    id: 'aftermath',
    text: 'After it passed, how did you feel about how you handled it?',
    type: 'single-select',
    options: [
      'Proud', 'Frustrated with myself',
      "Confused — I didn't recognize myself", 'Numb or blank',
      'Like I had no choice', 'Relieved it was over',
    ],
  },
  {
    id: 'frequency',
    text: 'Does this kind of moment happen often?',
    type: 'single-select',
    options: ['Very often', 'Fairly often', 'Occasionally', "It's unusual for me"],
  },
];

// ── PHASE 2: THE PATTERNS ─────────────────────────

export interface ClusterDef {
  id: string;
  title: string;
  questions: QuestionDef[];
  namingMoment: NamingMomentDef;
  // Cluster D has an optional second naming moment
  secondNamingMoment?: NamingMomentDef & { conditionKey: string; conditionMinSelections: number };
}

export const clusters: ClusterDef[] = [
  // ─── CLUSTER A: Standards & Effort ───
  {
    id: 'A',
    title: 'How You Relate to Standards and Effort',
    questions: [
      {
        id: 'A-q1',
        text: 'When you fall short of your own expectations:',
        type: 'multi-select',
        maxSelections: 2,
        options: [
          'Replay it with self-criticism', 'Push harder immediately',
          'Feel a wave of shame', 'Minimize and move on',
          'Need reassurance first', 'Get angry', "Don't relate to this",
        ],
      },
      {
        id: 'A-q2',
        text: 'When something important is at stake:',
        type: 'multi-select',
        options: [
          'Voice runs through what could go wrong',
          'Urge to prepare more and control more',
          'Pull to delay or not start',
          "Sense that less than perfect doesn't count",
          'Physical tension/bracing',
          "I feel calm — not my pattern",
        ],
      },
      {
        id: 'A-q3',
        text: 'After you succeed, how long does satisfaction last?',
        type: 'single-select',
        options: [
          'Briefly — bar moves higher',
          'A while but something was off',
          "Depends on others' acknowledgment",
          'I feel genuinely satisfied',
          'I barely register it',
        ],
      },
    ],
    namingMoment: {
      cluster: 'A',
      reflectionParagraphs: [
        "There's a part here that learned — probably a long time ago — that effort, precision, and getting it right were how you stayed safe. Or stayed worthy.",
        "You might recognize it as the voice that raises the bar the moment you clear it.",
        "But here's what matters: this part is not its job. The pushing, the pressure, the demand to do it better — that's a role it took on. Not who it is.",
        "Underneath that relentless effort is a part that has been working very hard for a very long time. And it has reasons. Good ones.",
        "What would you like to call this part — for now?",
      ],
      nameChips: ['The Striver', 'The Standard-Keeper', 'The Driver', 'The Iron Fist', 'The Taskmaster', 'The Perfecter'],
      backendClassification: 'Perfectionist',
      partType: 'Protector-Manager',
    },
  },

  // ─── CLUSTER B: Finding Relief ───
  {
    id: 'B',
    title: 'How Your System Finds Relief',
    questions: [
      {
        id: 'B-q1',
        text: 'When emotions get intense:',
        type: 'multi-select',
        options: [
          'Reach for food/phone/drink/shopping/TV',
          'Shut down or go numb', 'Get physically restless',
          'Get very busy', 'Disconnect mentally',
          'Express it too intensely', 'Push through', "Don't notice this",
        ],
      },
      {
        id: 'B-q2',
        text: 'Things you do that you sometimes regret — like a part took over?',
        type: 'single-select',
        options: ['Yes definitely', 'Sometimes', 'Rarely', 'No'],
        followUp: {
          condition: ['Yes definitely', 'Sometimes'],
          prompt: 'What tends to happen?',
        },
      },
      {
        id: 'B-q3',
        text: 'When the relief happens, what does it feel like?',
        type: 'single-select',
        options: [
          'Pressure releasing', 'Feeling just stops',
          'Finally feeling something real', 'Like watching it happen',
          'Comfort — like being held', "Don't experience this",
        ],
      },
    ],
    namingMoment: {
      cluster: 'B',
      reflectionParagraphs: [
        "There's a part that shows up fast — sometimes faster than thought. Its only job is to make something stop.",
        "It found something that works. And it uses it. Not because it's reckless. Because it is a protector, and protectors use what works.",
        "But here's what matters: this part is not its behavior. The reaching, the escaping — those are strategies it learned. Not who it is.",
        "This part has probably protected you, in its own way, more times than you know.",
        "What would you like to call this part — for now?",
      ],
      nameChips: ['The Reliever', 'The Escape Hatch', 'The Pressure Valve', 'The Soother', 'The Exit', 'The Quick Fix'],
      backendClassification: 'Distracter',
      partType: 'Protector-Firefighter',
    },
  },

  // ─── CLUSTER C: Connection ───
  {
    id: 'C',
    title: 'How You Show Up in Connection',
    questions: [
      {
        id: 'C-q1',
        text: 'In close relationships:',
        type: 'multi-select',
        maxSelections: 2,
        options: [
          "Tune into others' needs before my own",
          'Worry about rejection or abandonment',
          "Slight guardedness I can't explain",
          'Work to keep the peace even when I disagree',
          'Voice says I\'m "too much" when I need something',
          'Hard to trust people will stay',
          "Don't relate to this",
        ],
      },
      {
        id: 'C-q2',
        text: 'When someone important seems distant or unavailable:',
        type: 'multi-select',
        options: [
          'Assume I did something wrong', 'Try to fix or smooth it',
          'Withdraw and wait', 'Something like dread or panic',
          'Get angry', 'Go numb',
          "Not much — doesn't activate me",
        ],
      },
      {
        id: 'C-q3',
        text: 'When you think about being truly seen — fears, needs, the uncertain parts of you:',
        type: 'single-select',
        options: [
          'Fear of judgment or rejection',
          'Longing — I want this more than almost anything',
          'Confusion — not sure who "the real me" is',
          'Sadness', 'Numbness', 'I feel comfortable with this',
        ],
      },
    ],
    namingMoment: {
      cluster: 'C',
      reflectionParagraphs: [
        "There's a part — maybe more than one — that has learned to pay very close attention to other people. To what they feel, whether they're okay, whether you're okay with them.",
        "This part often learned early that connection was uncertain. That love had conditions. Or that needing things was risky.",
        "But here's what matters: this part is not its watchfulness. The monitoring, the smoothing, the holding back — that's what it learned. Not who it is.",
        "What would you like to call this part — for now?",
      ],
      nameChips: ['The Keeper', 'The Peacemaker', 'The Watcher', 'The Diplomat', 'The Tender One', 'The Bridge'],
      backendClassification: 'Pleaser',
      partType: 'Protector-Manager',
    },
  },

  // ─── CLUSTER D: The Voice Inside ───
  {
    id: 'D',
    title: 'The Voice Inside',
    questions: [
      {
        id: 'D-q1',
        text: 'Is there a voice that comments on what you do, how you come across, or who you are?',
        type: 'single-select',
        options: ['Constantly', 'Frequently', 'Occasionally', 'Rarely', 'Not aware of one'],
        followUp: {
          condition: ['Constantly', 'Frequently'],
          prompt: 'What does it tend to say?',
        },
      },
      {
        id: 'D-q2',
        text: 'When things go quiet — underneath the doing and managing — what sometimes surfaces?',
        type: 'multi-select',
        options: [
          'Emptiness or loneliness', 'Low hum of anxiety',
          'Sadness without reason',
          'Sense something is fundamentally wrong or missing',
          'Exhaustion deeper than physical',
          "A longing I can't name",
          'I feel settled when things are quiet',
        ],
      },
    ],
    namingMoment: {
      cluster: 'D-critic',
      reflectionParagraphs: [
        "That voice — the one that comments, critiques, holds you to a standard. That's a part.",
        "It is not your enemy. It learned that if it could criticize you first, it could protect you from something worse — rejection, failure, shame.",
        "It is a protector wearing the mask of a judge.",
        "This part is not its criticism. The harsh words — those are its tools. Not its identity.",
        "What would you like to call this part?",
      ],
      nameChips: ['The Critic', 'The Judge', 'The Inner Voice', 'The Hardliner', 'The Watchdog', 'The Editor'],
      backendClassification: 'Inner Critic',
      partType: 'Protector-Manager',
    },
    secondNamingMoment: {
      cluster: 'D-exile',
      conditionKey: 'D-q2',
      conditionMinSelections: 2,
      reflectionParagraphs: [
        "And there's something else your answers pointed toward. Something quieter. Underneath.",
        "When things go still, something surfaces — a feeling that doesn't have a clean name. An ache, or emptiness, or longing.",
        "In IFS, this often comes from a younger, more vulnerable part. One that the other parts have been working, in their own ways, to protect.",
        "We won't go deep here — not today. But we want you to know: that feeling has a source. And the source is a part that deserves to be known.",
      ],
      nameChips: [],
      backendClassification: 'Exile Gesture',
      partType: 'Exile',
    },
  },
];

// ── PHASE 3: THE CONNECTIONS ─────────────────────

export const selfAccessOptions = [
  "Compassion — they've been doing their best",
  'Curiosity — I want to understand them more',
  "Gratitude — I see how they've tried to protect me",
  'Frustration — I wish some would ease up',
  'Sadness — especially for the ones carrying the most',
  'Overwhelm',
  "Something I can't name yet",
];

export const underneathOptions = [
  'Fear of not being enough',
  'Deep loneliness or sadness',
  'Shame — something is wrong with me',
  'Terror of being left',
  'Something I can sense but can\'t name',
  "I don't notice anything underneath",
];

export const pullingAwayOptions = [
  'Something I cannot name but do not want to feel',
  'Overwhelm',
  'Failure or worthlessness',
  'Profound emptiness',
  "I'm not sure",
];

// ── MICRO-CAPTURE OPTIONS ─────────────────────

export const microCaptureOptions = [
  'Curious', 'Frustrated', 'Grateful', 'Sad', 'Protective', 'Numb', 'Something else',
];
