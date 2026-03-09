export type PracticeCategory =
  | 'breathing'
  | 'accessing-self'
  | 'unblending'
  | 'sitting-with'
  | 'visualizations'
  | 'lineup'
  | 'dialogue'
  | 'parts-specific'
  | 'integration';

export const CATEGORY_LABELS: Record<PracticeCategory, string> = {
  breathing: 'Breathing & Grounding',
  'accessing-self': 'Accessing Self',
  unblending: 'Unblending',
  'sitting-with': 'Sitting With Parts',
  visualizations: 'Visualizations & Imagery',
  lineup: 'The Line-Up',
  dialogue: 'Inner Dialogue',
  'parts-specific': 'Parts-Specific',
  integration: 'Integration',
};

export type Difficulty = 'Gentle' | 'Moderate' | 'Deep';

export type StepType = 'reading' | 'pause' | 'breathing' | 'reflection' | 'body-awareness' | 'part-selection';

export interface PracticeStep {
  type: StepType;
  text: string;
  /** For breathing steps: seconds per phase */
  breathCounts?: { inhale: number; hold: number; exhale: number; holdOut: number };
  /** Number of breathing cycles */
  cycles?: number;
  /** Placeholder for reflection textarea */
  reflectionPrompt?: string;
}

export interface Practice {
  id: string;
  name: string;
  category: PracticeCategory;
  duration: number; // minutes
  difficulty: Difficulty;
  description: string;
  requiresPartSelection?: boolean;
  minPartsRequired?: number;
  steps: PracticeStep[];
}

export const practices: Practice[] = [
  // ── BREATHING & GROUNDING ──
  {
    id: 'box-breathing',
    name: 'Box Breathing',
    category: 'breathing',
    duration: 4,
    difficulty: 'Gentle',
    description: 'A four-count breathing cycle for settling the nervous system before parts work.',
    steps: [
      { type: 'reading', text: 'Find a comfortable position. Let your body settle. Feel the weight of yourself in this seat. There is nowhere you need to be except here.' },
      { type: 'reading', text: 'We\'re going to practice Box Breathing — a simple four-count cycle that signals safety to your nervous system. Each side of the "box" is four counts.' },
      { type: 'breathing', text: 'Follow the breathing guide. Inhale for 4 counts, hold for 4, exhale for 4, hold for 4. We\'ll do this together 4 times.', breathCounts: { inhale: 4, hold: 4, exhale: 4, holdOut: 4 }, cycles: 4 },
      { type: 'pause', text: 'Let your breath return to its natural rhythm. Don\'t try to control it.' },
      { type: 'reading', text: 'Now do a brief body scan. Starting from the top of your head, notice any areas of tension or holding. Don\'t try to change anything — just notice.' },
      { type: 'pause', text: 'Take a moment here. Feel yourself in the room.' },
      { type: 'reflection', text: 'How does your body feel right now compared to when you started?', reflectionPrompt: 'Describe what you notice...' },
    ],
  },
  {
    id: 'settling-breath',
    name: 'The Settling Breath',
    category: 'breathing',
    duration: 2,
    difficulty: 'Gentle',
    description: 'Three deep breaths with awareness of the body releasing with each exhale.',
    steps: [
      { type: 'reading', text: 'This is the simplest practice we have. Three breaths, that\'s all. But do them with your whole attention.' },
      { type: 'breathing', text: 'First breath: Breathe in deeply. As you exhale, let your shoulders drop.', breathCounts: { inhale: 5, hold: 2, exhale: 6, holdOut: 2 }, cycles: 1 },
      { type: 'breathing', text: 'Second breath: Breathe in deeply. As you exhale, let your jaw soften.', breathCounts: { inhale: 5, hold: 2, exhale: 6, holdOut: 2 }, cycles: 1 },
      { type: 'breathing', text: 'Third breath: Breathe in deeply. As you exhale, let your belly relax.', breathCounts: { inhale: 5, hold: 2, exhale: 6, holdOut: 2 }, cycles: 1 },
      { type: 'pause', text: 'Notice how you feel now. Something may have shifted, even slightly.' },
    ],
  },
  {
    id: 'grounding-present',
    name: 'Grounding in the Present',
    category: 'breathing',
    duration: 5,
    difficulty: 'Gentle',
    description: 'A sensory grounding exercise to anchor you in the present moment.',
    steps: [
      { type: 'reading', text: 'This practice uses your five senses to bring you fully into the present. Take your time with each step — there is no rush.' },
      { type: 'reflection', text: 'Name 5 things you can see right now. Look around slowly.', reflectionPrompt: 'I can see...' },
      { type: 'reflection', text: 'Name 4 things you can physically feel right now (the chair, your clothes, the air).', reflectionPrompt: 'I can feel...' },
      { type: 'reflection', text: 'Name 3 things you can hear right now. Listen carefully.', reflectionPrompt: 'I can hear...' },
      { type: 'reflection', text: 'Name 2 things you can smell right now. Or 2 smells you remember.', reflectionPrompt: 'I can smell...' },
      { type: 'reflection', text: 'Name 1 thing you can taste right now.', reflectionPrompt: 'I can taste...' },
      { type: 'pause', text: 'You are here. You are present. Your body is safe in this moment.' },
      { type: 'reflection', text: 'From here, how are you?', reflectionPrompt: 'Right now I feel...' },
    ],
  },

  // ── ACCESSING SELF ──
  {
    id: 'already-there',
    name: 'Already There',
    category: 'accessing-self',
    duration: 8,
    difficulty: 'Gentle',
    description: 'Recognize Self-energy through a memory of being fully present and alive.',
    steps: [
      { type: 'reading', text: 'This practice is not about building something new. It\'s about recognizing something that has always been there.' },
      { type: 'breathing', text: 'Let\'s settle first with a few deep breaths.', breathCounts: { inhale: 4, hold: 3, exhale: 5, holdOut: 2 }, cycles: 3 },
      { type: 'reflection', text: 'Recall a moment of complete absorption in something you loved — maybe a flow state, a deep connection, a moment of peace in nature. Describe it.', reflectionPrompt: 'I remember a time when...' },
      { type: 'pause', text: 'Let yourself linger in that memory. Feel it in your body.' },
      { type: 'reflection', text: 'What was present in you during that moment? What qualities were alive?', reflectionPrompt: 'In that moment I felt...' },
      { type: 'reading', text: 'Something was there in that moment that was not anxious, not reactive, not effortful. It was clear, open, alive. That something is your Self.' },
      { type: 'reading', text: 'Your Self is not something you need to create. It\'s something you uncover by giving your parts space. It has always been there — underneath everything.' },
      { type: 'pause', text: 'Sit with that recognition for a moment.' },
      { type: 'reflection', text: 'What does it feel like to know this part of you has always been here?', reflectionPrompt: 'It feels...' },
    ],
  },
  {
    id: 'the-observer',
    name: 'The Observer',
    category: 'accessing-self',
    duration: 6,
    difficulty: 'Gentle',
    description: 'Unblend through the simple act of observation — noticing thoughts without being them.',
    steps: [
      { type: 'reading', text: 'Right now, something is happening inside you — thoughts, feelings, sensations. We\'re going to shift your relationship to that activity.' },
      { type: 'pause', text: 'Notice a thought or feeling that\'s active right now. Don\'t push it away. Just notice it.' },
      { type: 'reading', text: 'Now ask yourself: Can you notice it without being it?' },
      { type: 'pause', text: 'Sit with that question.' },
      { type: 'reading', text: 'If you can notice it, then you are not only that thought or feeling. There is a "you" who is doing the noticing. Who is that?' },
      { type: 'reading', text: 'In IFS, we call this "you" the Self. It is the one who can observe all parts without being hijacked by any of them.' },
      { type: 'reflection', text: 'What is present when you are simply the observer?', reflectionPrompt: 'When I just observe, I notice...' },
    ],
  },
  {
    id: 'contrast-awareness',
    name: 'Contrast Awareness',
    category: 'accessing-self',
    duration: 7,
    difficulty: 'Gentle',
    description: 'Recognize Self-energy by comparing two contrasting internal states.',
    steps: [
      { type: 'breathing', text: 'Begin with a settling breath.', breathCounts: { inhale: 4, hold: 2, exhale: 5, holdOut: 2 }, cycles: 2 },
      { type: 'reading', text: 'Step 1: Briefly recall a moment of overwhelm or reactivity. Don\'t go deep — just touch the edge of it.' },
      { type: 'reflection', text: 'What were the qualities of that state? What did it feel like inside?', reflectionPrompt: 'That state felt like...' },
      { type: 'pause', text: 'Let that go now. Take a breath.' },
      { type: 'reading', text: 'Step 2: Now recall a moment of calm clarity or deep peace. A time you felt steady and open.' },
      { type: 'reflection', text: 'What were the qualities of that state?', reflectionPrompt: 'That state felt like...' },
      { type: 'reading', text: 'The contrast between these two states is the difference between being blended with a part and being in Self-energy. The second state — that\'s accessible to you anytime.' },
      { type: 'reflection', text: 'Describe the difference between those two states in your own words.', reflectionPrompt: 'The difference is...' },
    ],
  },
  {
    id: 'stepping-back',
    name: 'The Stepping Back',
    category: 'accessing-self',
    duration: 8,
    difficulty: 'Moderate',
    description: 'A guided practice for creating distance between you and an active thought or feeling.',
    steps: [
      { type: 'breathing', text: 'Ground yourself first. Feet on the floor, slow breath.', breathCounts: { inhale: 4, hold: 3, exhale: 5, holdOut: 3 }, cycles: 3 },
      { type: 'reading', text: 'Notice what\'s most active inside you right now — a thought, an emotion, a sensation, an urge. Don\'t analyze it. Just notice it.' },
      { type: 'pause', text: 'Take a moment to acknowledge what\'s there.' },
      { type: 'reading', text: 'Now ask yourself: Can I feel this feeling without being this feeling?' },
      { type: 'pause', text: 'Sit with that question. Don\'t rush the answer.' },
      { type: 'reading', text: 'What is observing this? Who is the one watching?' },
      { type: 'reading', text: 'Imagine taking one gentle step back — not away from, but slightly back from this experience. Like stepping back from a painting to see it more clearly.' },
      { type: 'pause', text: 'Feel your feet on the floor. Slow breath. You are the one looking, not the thing being looked at.' },
      { type: 'reflection', text: 'From this stepped-back place, what do you notice? How do you feel toward what\'s active inside you?', reflectionPrompt: 'From here, I notice...' },
    ],
  },

  // ── UNBLENDING ──
  {
    id: 'creating-space',
    name: 'Creating Space',
    category: 'unblending',
    duration: 10,
    difficulty: 'Moderate',
    description: 'A guided process for creating internal space between Self and a specific part.',
    requiresPartSelection: true,
    steps: [
      { type: 'part-selection', text: 'Which part would you like to work with right now?' },
      { type: 'breathing', text: 'Let\'s settle in with a few breaths.', breathCounts: { inhale: 4, hold: 3, exhale: 5, holdOut: 2 }, cycles: 3 },
      { type: 'reading', text: 'Acknowledge the part\'s presence. Say to it (internally): "I know you\'re here. I see you."' },
      { type: 'pause', text: 'Give the part a moment to be recognized.' },
      { type: 'reading', text: 'Now thank this part for showing up. Whatever it\'s doing, it\'s trying to help or protect in some way. "Thank you for what you do."' },
      { type: 'pause', text: 'Notice if anything shifts inside when you thank this part.' },
      { type: 'reading', text: 'Gently ask this part if it would be willing to give you a little space — not to go away, just to separate slightly so you can see it more clearly.' },
      { type: 'pause', text: 'Wait. Notice if the part moves or shifts. There\'s no right answer.' },
      { type: 'reflection', text: 'How do you feel toward this part now? Check: is there curiosity? Openness? Compassion? Or is there still frustration, judgment, or fear?', reflectionPrompt: 'Toward this part, I feel...' },
      { type: 'reading', text: 'If you feel curiosity or openness — you\'re in Self-energy. If you still feel judgment or frustration, another part may be present. Acknowledge that one too.' },
      { type: 'body-awareness', text: 'Where do you feel this part in your body right now?' },
      { type: 'reflection', text: 'What did this part communicate during this practice?', reflectionPrompt: 'This part seemed to say...' },
    ],
  },
  {
    id: 'u-turn',
    name: 'The U-Turn',
    category: 'unblending',
    duration: 10,
    difficulty: 'Moderate',
    description: 'Redirect attention from an external trigger to the internal system responding to it.',
    steps: [
      { type: 'reading', text: 'Something is happening out there that is activating something in here. Right now, we\'re going to make a U-turn — turning our attention from the external situation to the internal response.' },
      { type: 'breathing', text: 'Take a few breaths to settle.', breathCounts: { inhale: 4, hold: 2, exhale: 5, holdOut: 2 }, cycles: 3 },
      { type: 'reflection', text: 'What external situation or interaction is on your mind right now?', reflectionPrompt: 'What\'s happening is...' },
      { type: 'reading', text: 'Now turn inward. Something inside you is responding to that situation. A part (or several parts) have been activated.' },
      { type: 'part-selection', text: 'Which part(s) seem most active in response to this situation?' },
      { type: 'reading', text: 'Acknowledge this part: "I see that you\'re activated right now. I\'m here."' },
      { type: 'pause', text: 'Notice what this part is feeling. Don\'t try to change it.' },
      { type: 'reading', text: 'Ask the part to give you just a little space so you can understand it better. You\'re not asking it to go away — just to let you see it clearly.' },
      { type: 'reflection', text: 'What is this part afraid would happen if it relaxed? What is it protecting you from?', reflectionPrompt: 'This part is afraid that...' },
      { type: 'reflection', text: 'From your Self, what does this part need to hear right now?', reflectionPrompt: 'I want this part to know...' },
    ],
  },

  // ── SITTING WITH PARTS ──
  {
    id: 'sitting-with',
    name: 'Sitting With',
    category: 'sitting-with',
    duration: 12,
    difficulty: 'Moderate',
    description: 'Develop the capacity to be present with a part without trying to change it.',
    requiresPartSelection: true,
    steps: [
      { type: 'part-selection', text: 'Which part would you like to sit with right now?' },
      { type: 'breathing', text: 'Settle with a few breaths.', breathCounts: { inhale: 4, hold: 3, exhale: 5, holdOut: 2 }, cycles: 3 },
      { type: 'body-awareness', text: 'Where do you find this part in your body? Tap the location.' },
      { type: 'reading', text: 'Get a sense of this part. Its energy, its texture, its emotional quality. You don\'t need words for this — just a felt sense.' },
      { type: 'reading', text: 'Now the practice: Can you simply be with this part? Not fixing it. Not analyzing it. Not trying to make it feel better. Just being present with it.' },
      { type: 'pause', text: 'This is the practice. Just sitting with. Take as long as you need here.' },
      { type: 'pause', text: 'Continue to be present. Notice if the part shifts at all in your body or in its feeling-tone.' },
      { type: 'reading', text: 'This capacity — to be with — is one of the most powerful tools you have. Parts heal not from being fixed, but from being witnessed.' },
      { type: 'reflection', text: 'What did you notice about this part when you just sat with it?', reflectionPrompt: 'When I sat with this part, I noticed...' },
    ],
  },
  {
    id: 'listening-to-parts',
    name: 'Listening to Parts',
    category: 'sitting-with',
    duration: 12,
    difficulty: 'Moderate',
    description: 'A guided inner listening practice to hear what a part wants you to know.',
    requiresPartSelection: true,
    steps: [
      { type: 'part-selection', text: 'Which part would you like to listen to?' },
      { type: 'breathing', text: 'Settle in.', breathCounts: { inhale: 4, hold: 3, exhale: 5, holdOut: 2 }, cycles: 3 },
      { type: 'reading', text: 'Ask the part to separate from you slightly so you can hear it more clearly. If it won\'t — that\'s okay. Just notice that.' },
      { type: 'reading', text: 'Now say to this part (internally): "I\'m here. I want to listen to you. You don\'t have to say anything, but if you want to, I\'m listening."' },
      { type: 'pause', text: 'Wait. Be open and receptive. Don\'t manufacture a response — let it come to you.' },
      { type: 'reflection', text: 'What does this part want you to know? There\'s no "right" answer.', reflectionPrompt: 'This part wants me to know...' },
      { type: 'pause', text: 'Stay with what came.' },
      { type: 'reflection', text: 'What does this part need from you right now?', reflectionPrompt: 'This part needs...' },
      { type: 'reading', text: 'Close by offering this part appreciation: "Thank you for being willing to share with me. I\'m here for you."' },
      { type: 'pause', text: 'Let the practice settle before returning.' },
    ],
  },

  // ── VISUALIZATIONS ──
  {
    id: 'inner-room',
    name: 'The Inner Room',
    category: 'visualizations',
    duration: 15,
    difficulty: 'Moderate',
    description: 'Visualize an internal meeting space and invite a part to sit with you there.',
    requiresPartSelection: true,
    steps: [
      { type: 'breathing', text: 'Close your eyes if comfortable. Let your breath slow.', breathCounts: { inhale: 4, hold: 4, exhale: 5, holdOut: 3 }, cycles: 3 },
      { type: 'reading', text: 'Imagine you\'re walking into an internal room — a space that is entirely yours. It can look however it needs to.' },
      { type: 'reflection', text: 'What does this room look like? Describe its qualities — size, light, feeling, furnishings.', reflectionPrompt: 'My inner room looks like...' },
      { type: 'reading', text: 'Settle into this room. Feel yourself at ease here. This is your space.' },
      { type: 'part-selection', text: 'Now invite one part to enter this room. Which part?' },
      { type: 'reading', text: 'Watch the door. Your part enters. Notice how it appears — what form does it take? What is its posture, its expression?' },
      { type: 'reflection', text: 'Describe how your part appears in this room.', reflectionPrompt: 'This part appears as...' },
      { type: 'reading', text: 'From a place of curiosity, begin a conversation. You might ask: "What do you want me to see?" or "What do you need right now?"' },
      { type: 'reflection', text: 'What did this part communicate?', reflectionPrompt: 'My part said...' },
      { type: 'pause', text: 'Sit together in this room for a moment before closing.' },
      { type: 'reflection', text: 'What do you want to remember from this visit?', reflectionPrompt: 'I want to remember...' },
    ],
  },
  {
    id: 'the-landscape',
    name: 'The Landscape',
    category: 'visualizations',
    duration: 12,
    difficulty: 'Moderate',
    description: 'Visualize your internal world as a living landscape and explore it.',
    steps: [
      { type: 'breathing', text: 'Settle in with deep breaths.', breathCounts: { inhale: 4, hold: 3, exhale: 5, holdOut: 2 }, cycles: 3 },
      { type: 'reading', text: 'Imagine your internal world as a landscape. Not what you think it should look like — let it show itself to you.' },
      { type: 'reflection', text: 'What do you see? Describe the weather, terrain, time of day, atmosphere.', reflectionPrompt: 'My inner landscape looks like...' },
      { type: 'reading', text: 'Notice where different parts might be in this landscape. Some might be near, some far. Some might be in the open, others hiding.' },
      { type: 'reflection', text: 'Where are your parts in this landscape?', reflectionPrompt: 'I see my parts...' },
      { type: 'reading', text: 'Approach one part. Move toward it slowly, with curiosity.' },
      { type: 'reflection', text: 'What happens as you approach? What does this part do?', reflectionPrompt: 'As I approach...' },
      { type: 'pause', text: 'Stay here with this part for a moment.' },
    ],
  },
  {
    id: 'wise-mentor',
    name: 'The Wise Mentor',
    category: 'visualizations',
    duration: 10,
    difficulty: 'Moderate',
    description: 'Access a wise, compassionate inner figure — an embodiment of Self-energy.',
    steps: [
      { type: 'breathing', text: 'Breathe and settle.', breathCounts: { inhale: 4, hold: 3, exhale: 5, holdOut: 2 }, cycles: 3 },
      { type: 'reading', text: 'Imagine a wise, compassionate figure — someone (real or imagined) who embodies the qualities of Self-energy: calm, curious, compassionate, clear. This figure knows you completely and accepts you fully.' },
      { type: 'reflection', text: 'Who or what appears? Describe this figure.', reflectionPrompt: 'My wise mentor appears as...' },
      { type: 'reading', text: 'You can ask this figure one question. Let the question arise naturally from what\'s most alive in you right now.' },
      { type: 'reflection', text: 'What question do you ask?', reflectionPrompt: 'I ask...' },
      { type: 'pause', text: 'Wait for a response. Let it come to you — don\'t manufacture it.' },
      { type: 'reflection', text: 'What response do you receive?', reflectionPrompt: 'The response is...' },
      { type: 'pause', text: 'Sit with this response. Let it land.' },
    ],
  },

  // ── THE LINE-UP ──
  {
    id: 'meeting-your-parts',
    name: 'Meeting Your Parts',
    category: 'lineup',
    duration: 20,
    difficulty: 'Deep',
    description: 'A structured visualization for meeting multiple parts at once in a line-up.',
    minPartsRequired: 3,
    steps: [
      { type: 'breathing', text: 'This is a longer, deeper practice. Make sure you have uninterrupted time. Settle in fully.', breathCounts: { inhale: 5, hold: 4, exhale: 6, holdOut: 3 }, cycles: 4 },
      { type: 'reading', text: 'Imagine a calm, open space. A clearing, a room, a field. You, as Self, stand at one end. Your parts are gathered before you, each in their own form.' },
      { type: 'reading', text: 'One by one, you\'ll approach each part. You don\'t need to fix anyone. You\'re just here to see them, acknowledge them, and offer your presence.' },
      { type: 'pause', text: 'Take a moment to see the whole group. Who\'s here?' },
      { type: 'reading', text: 'Approach the first part. The one that steps forward or catches your eye. Notice how it appears — its form, its expression, its energy.' },
      { type: 'reflection', text: 'Which part came forward first? What does it communicate?', reflectionPrompt: 'The first part is... and it says...' },
      { type: 'reading', text: 'Offer this part your presence. "I see you. Thank you for being here." Then move to the next.' },
      { type: 'reflection', text: 'The second part. Who is it? What do you notice?', reflectionPrompt: 'The next part is...' },
      { type: 'reading', text: 'Continue moving through the group. Notice who hangs back, who pushes forward, who hides.' },
      { type: 'reflection', text: 'Was there a part that surprised you? Or one that was hard to approach?', reflectionPrompt: 'I was surprised by...' },
      { type: 'reading', text: 'Before closing, stand back and see the whole group again. These are all parts of you. They all belong here.' },
      { type: 'pause', text: 'Offer the whole group your presence and appreciation.' },
      { type: 'reflection', text: 'What do you want to remember from meeting your parts today?', reflectionPrompt: 'I want to remember...' },
    ],
  },

  // ── INTEGRATION ──
  {
    id: 'daily-checkin',
    name: 'The Daily Check-In',
    category: 'integration',
    duration: 5,
    difficulty: 'Gentle',
    description: 'A brief practice to check in with your system at the start or end of your day.',
    steps: [
      { type: 'breathing', text: 'Three settling breaths.', breathCounts: { inhale: 4, hold: 2, exhale: 5, holdOut: 2 }, cycles: 3 },
      { type: 'reflection', text: 'What parts are active right now?', reflectionPrompt: 'The parts I notice are...' },
      { type: 'reflection', text: 'What do they need?', reflectionPrompt: 'They need...' },
      { type: 'reflection', text: 'What would Self like to say to them?', reflectionPrompt: 'From Self, I would say...' },
    ],
  },
  {
    id: 'end-of-day-review',
    name: 'End of Day Review',
    category: 'integration',
    duration: 8,
    difficulty: 'Gentle',
    description: 'A self-compassionate day review through an IFS lens.',
    steps: [
      { type: 'breathing', text: 'Settle into the end of your day.', breathCounts: { inhale: 4, hold: 3, exhale: 5, holdOut: 2 }, cycles: 3 },
      { type: 'reading', text: 'Let\'s review this day with compassion — not judgment. Every part that showed up today was doing its best.' },
      { type: 'reflection', text: 'Which parts showed up today?', reflectionPrompt: 'Today I noticed...' },
      { type: 'reflection', text: 'What were they responding to? What situations activated them?', reflectionPrompt: 'They were responding to...' },
      { type: 'reflection', text: 'What did you learn today about your internal system?', reflectionPrompt: 'Today I learned...' },
      { type: 'reading', text: 'Close by offering appreciation to each part that showed up. They were all trying to help in their own way.' },
      { type: 'pause', text: 'Let the day settle. You did enough. You are enough.' },
    ],
  },
];
