/**
 * seedDemoData — populates all persisted stores with realistic placeholder
 * content so every screen in Inner Atlas renders with sample data on first load.
 * Called once from App.tsx; guards against double-seeding via a presence check.
 */

import { useBodyMapStore } from './bodyMapStore';
import { useJourneyStore } from './journeyStore';
import { useCouplesStore } from './couplesStore';
import { useClarityStore } from './clarityStore';
import { useSelfEnergyStore } from './selfEnergyStore';
import { useElaborationStore } from './elaborationStore';
import { useRefineStore } from './refineStore';
import { usePracticesStore } from './practicesStore';
import { useTrailheadStore } from './trailheadStore';
import { useAssessmentStore } from './assessmentStore';
import { useDynamicsStore } from './dynamicsStore';

// Helper: ISO string N days ago
const d = (daysAgo: number) =>
  new Date(Date.now() - daysAgo * 86_400_000).toISOString();

const SEED_VERSION = 'v2-assessment-flow';

export function seedDemoData() {
  // Reset if seed version changed (ensures assessment flow is accessible after code update)
  const lastSeed = localStorage.getItem('inner-atlas-seed-version');
  if (lastSeed !== SEED_VERSION) {
    // Clear assessment state so the onboarding flow is navigable
    useAssessmentStore.getState().resetAssessment();
    useAssessmentStore.setState({ hasCompletedAssessment: false, currentStage: 'not-started' });
    localStorage.setItem('inner-atlas-seed-version', SEED_VERSION);
  }

  // ── Assessment: pre-seed stage1 answers for demo but don't skip flow ──
  const assessment = useAssessmentStore.getState();
  if (!assessment.hasCompletedAssessment && Object.keys(assessment.stage1Answers).length === 0) {
    useAssessmentStore.setState({
      stage1Answers: {
        'mgr-perfectionist': [4, 5, 4, 3, 5],
        'mgr-critic': [5, 4, 4, 3, 4],
        'mgr-pleaser': [3, 4, 3, 3, 4],
        'mgr-controller': [2, 2, 3, 2, 1],
        'ff-distracter': [4, 3, 4, 5, 3],
        'ff-dissociator': [2, 1, 2, 2, 1],
        'ff-rage': [3, 3, 4, 3, 3],
        'ex-abandoned': [4, 5, 4, 4, 5],
        'ex-worthless': [3, 4, 4, 3, 4],
        'ex-rejected': [2, 2, 3, 2, 2],
      },
    });
  }

  // ── Body Map ──
  const bodyMap = useBodyMapStore.getState();
  if (bodyMap.placements.length === 0) {
    useBodyMapStore.setState({
      placements: [
        { id: 'bp1', partId: 'p1', x: 50, y: 20, view: 'front', createdAt: d(14) },
        { id: 'bp2', partId: 'p2', x: 44, y: 48, view: 'front', createdAt: d(12) },
        { id: 'bp3', partId: 'p3', x: 50, y: 40, view: 'front', createdAt: d(10) },
        { id: 'bp4', partId: 'p4', x: 54, y: 20, view: 'front', createdAt: d(8) },
        { id: 'bp5', partId: 'p1', x: 50, y: 54, view: 'front', createdAt: d(6) },
        { id: 'bp6', partId: 'p3', x: 48, y: 62, view: 'back', createdAt: d(5) },
        { id: 'bp7', partId: 'p2', x: 55, y: 30, view: 'back', createdAt: d(4) },
      ],
      checkIns: [
        {
          id: 'ci1',
          placements: [
            { partId: 'p1', x: 50, y: 20, view: 'front' as const, intensity: 7 },
            { partId: 'p3', x: 50, y: 40, view: 'front' as const, intensity: 4 },
          ],
          createdAt: d(3),
          note: 'Pre-meeting activation in head and stomach',
        },
        {
          id: 'ci2',
          placements: [
            { partId: 'p2', x: 44, y: 48, view: 'front' as const, intensity: 8 },
          ],
          createdAt: d(1),
          note: 'Strong avoidance impulse mid-afternoon',
        },
      ],
      sensationMaps: [
        {
          id: 'sm1',
          marks: [
            { id: 'sm1-1', x: 50, y: 35, view: 'front' as const, sensation: 'tight' as const },
            { id: 'sm1-2', x: 48, y: 55, view: 'front' as const, sensation: 'heavy' as const },
            { id: 'sm1-3', x: 52, y: 20, view: 'front' as const, sensation: 'buzzing' as const },
            { id: 'sm1-4', x: 50, y: 45, view: 'front' as const, sensation: 'expansive' as const },
          ],
          createdAt: d(7),
        },
      ],
    });
  }

  // ── Journey ──
  const journey = useJourneyStore.getState();
  if (journey.events.length === 0) {
    useJourneyStore.setState({
      firstUseDate: d(45),
      events: [
        { id: 'ev1',  type: 'assessment-completed', date: d(45), summary: 'Completed initial three-stage inner system assessment' },
        { id: 'ev2',  type: 'part-added',            date: d(44), summary: 'The Planner identified as a Manager part',              partIds: ['p1'] },
        { id: 'ev3',  type: 'part-added',            date: d(44), summary: 'The Avoider identified as a Firefighter part',          partIds: ['p2'] },
        { id: 'ev4',  type: 'part-added',            date: d(44), summary: 'Little One identified as an Exile part',                partIds: ['p3'] },
        { id: 'ev5',  type: 'part-added',            date: d(43), summary: 'The Inner Critic identified as a Manager part',         partIds: ['p4'] },
        { id: 'ev6',  type: 'self-energy-checkin',   date: d(40), summary: 'Self-energy check-in: 55% — system highly activated' },
        { id: 'ev7',  type: 'part-elaborated',        date: d(38), summary: 'Elaboration session completed for The Planner',         partIds: ['p1'] },
        { id: 'ev8',  type: 'trail-started',          date: d(35), summary: 'Started trailhead: recurring anxiety before meetings' },
        { id: 'ev9',  type: 'trail-completed',        date: d(35), summary: "Trail completed — traced anxiety to Little One's fear of judgment" },
        { id: 'ev10', type: 'exile-discovered',       date: d(35), summary: "Exile discovered: Little One carries fear of rejection from childhood", partIds: ['p3'] },
        { id: 'ev11', type: 'dialogue-recorded',      date: d(30), summary: 'Inner dialogue with The Planner about releasing control' },
        { id: 'ev12', type: 'practice-completed',     date: d(28), summary: 'Completed Box Breathing grounding exercise (4 min)' },
        { id: 'ev13', type: 'part-refined',           date: d(25), summary: 'Refined The Planner — renamed The Architect, custom brain icon' },
        { id: 'ev14', type: 'clarity-event',          date: d(20), summary: 'Core values clarified: Authenticity, Compassion, Courage, Connection' },
        { id: 'ev15', type: 'body-checkin',           date: d(15), summary: 'Body check-in: tension in head (The Planner) and stomach (Little One)' },
        { id: 'ev16', type: 'update-logged',          date: d(10), summary: 'Part activation: The Inner Critic triggered by work performance review' },
        { id: 'ev17', type: 'practice-completed',     date: d(7),  summary: 'Completed Creating Space unblending practice — first real unblending' },
        { id: 'ev18', type: 'self-energy-checkin',    date: d(5),  summary: 'Self-energy check-in: 74% — noticeable shift after practice work' },
        { id: 'ev19', type: 'journal-entry',          date: d(3),  summary: "Reflection: I can now catch The Planner before it takes over. There's a moment of awareness that wasn't there six weeks ago." },
        { id: 'ev20', type: 'update-logged',          date: d(1),  summary: 'System observation: parts cooperating more; Self-energy more accessible during stress' },
      ],
      snapshots: [
        { id: 'snap1', date: d(45), label: 'Post-Assessment Baseline',
          partCount: 4, managerCount: 2, firefighterCount: 1, exileCount: 1,
          selfEnergyAvg: 55, elaboratedCount: 0, trailsCompleted: 0, dialogueCount: 0, practiceCount: 0 },
        { id: 'snap2', date: d(15), label: 'Four Weeks In',
          partCount: 5, managerCount: 2, firefighterCount: 1, exileCount: 1,
          selfEnergyAvg: 68, elaboratedCount: 1, trailsCompleted: 1, dialogueCount: 2, practiceCount: 4 },
      ],
      earnedMilestones: [
        { milestoneId: 'first-part',          earnedAt: d(44) },
        { milestoneId: 'first-elaboration',   earnedAt: d(38) },
        { milestoneId: 'first-dialogue',      earnedAt: d(30) },
        { milestoneId: 'first-self-checkin',  earnedAt: d(40) },
        { milestoneId: 'first-body-placement',earnedAt: d(14) },
        { milestoneId: 'first-update',        earnedAt: d(10) },
        { milestoneId: '5-parts',             earnedAt: d(43) },
        { milestoneId: 'first-trail',         earnedAt: d(35) },
        { milestoneId: 'first-exile',         earnedAt: d(35) },
        { milestoneId: 'trail-named',         earnedAt: d(35) },
        { milestoneId: 'values-clarified',    earnedAt: d(20) },
        { milestoneId: 'first-memory',        earnedAt: d(20) },
        { milestoneId: 'first-refine',        earnedAt: d(25) },
        { milestoneId: 'manager-elaborated',  earnedAt: d(38) },
        { milestoneId: 'unblending-practice', earnedAt: d(7)  },
      ],
      journals: [
        { id: 'j1', date: d(3),
          text: "I notice I can catch The Planner before it takes over now. There's a moment of awareness that wasn't there six weeks ago. Something has shifted.",
          partIds: ['p1'], tags: ['insight', 'progress'] },
        { id: 'j2', date: d(12),
          text: 'The trail session tonight was profound. I finally understand that The Inner Critic and The Planner are both protecting Little One — just with different strategies.',
          partIds: ['p3', 'p4', 'p1'], tags: ['insight', 'trail'] },
      ],
    });
  }

  // ── Couples ──
  const couples = useCouplesStore.getState();
  if (!couples.setupComplete) {
    useCouplesStore.setState({
      isConnected: true,
      setupComplete: true,
      partnerA: { name: 'Alex', partIds: ['p1', 'p4'] },
      partnerB: { name: 'Jordan', partIds: ['p2', 'p3'] },
      assessments: [
        {
          partner: 'A',
          patterns: "I tend to withdraw when feeling criticized. My Planner part goes into overdrive during arguments, making lists of counterarguments instead of staying present.",
          activeParts: ['p1', 'p4'],
          triggers: ['Criticism or judgment', 'Feeling ignored or dismissed', 'Broken promises'],
          selfEnergyDuringConflict: 4,
          values: 'Deep emotional honesty, mutual growth, and feeling truly known by each other.',
          growthAreas: 'Staying present in conflict instead of retreating into planning and analysis mode.',
          completedAt: d(20),
        },
        {
          partner: 'B',
          patterns: "I distract or emotionally absent myself when things get intense. The Avoider kicks in before I even realize it, and suddenly I'm somewhere else mentally.",
          activeParts: ['p2', 'p3'],
          triggers: ['Conflict or raised voices', 'Emotional withdrawal', 'Feeling controlled'],
          selfEnergyDuringConflict: 3,
          values: 'Feeling safe enough to be vulnerable together, and being seen without judgment.',
          growthAreas: 'Learning to stay in the room — emotionally and physically — when things get hard.',
          completedAt: d(20),
        },
      ],
      sharedParts: [
        { partId: 'p1', partName: 'The Planner',     partType: 'Manager',     partner: 'A' },
        { partId: 'p4', partName: 'The Inner Critic', partType: 'Manager',     partner: 'A' },
        { partId: 'p2', partName: 'The Avoider',      partType: 'Firefighter', partner: 'B' },
        { partId: 'p3', partName: 'Little One',       partType: 'Exile',       partner: 'B' },
      ],
      connections: [
        { id: 'cc1', sourcePartId: 'p1', sourcePartner: 'A', targetPartId: 'p2', targetPartner: 'B',
          type: 'conflict',    notes: "Alex's planning activates Jordan's avoidance — a classic pursuer-distancer pattern." },
        { id: 'cc2', sourcePartId: 'p4', sourcePartner: 'A', targetPartId: 'p3', targetPartner: 'B',
          type: 'protective',  notes: "Alex's Critic's perfectionistic tone activates Little One's fear of rejection in Jordan." },
        { id: 'cc3', sourcePartId: 'p1', sourcePartner: 'A', targetPartId: 'p4', targetPartner: 'A',
          type: 'harmonious',  notes: 'Both Managers in Alex work together — planning and criticism reinforce each other.' },
      ],
      checkIns: [
        { id: 'cck1', partner: 'A', selfEnergy: 6, activeParts: ['p1'], temperature: 'connected',
          note: 'Feeling present and willing to try tonight.', date: d(5) },
        { id: 'cck2', partner: 'B', selfEnergy: 5, activeParts: ['p2'], temperature: 'neutral',
          note: 'A bit guarded but genuinely wanting to connect.', date: d(5) },
        { id: 'cck3', partner: 'A', selfEnergy: 3, activeParts: ['p1', 'p4'], temperature: 'distant',
          note: 'Planner and Critic both very loud after the work call.', date: d(12) },
        { id: 'cck4', partner: 'B', selfEnergy: 2, activeParts: ['p2', 'p3'], temperature: 'disconnected',
          note: 'Avoider just wants to disappear. Little One is scared.', date: d(12) },
      ],
      conversations: [
        {
          id: 'conv1', type: 'appreciation-gratitude', currentStep: 4,
          steps: [
            { stepIndex: 0, partnerAResponse: 'Taking a breath... feeling the day settle.', partnerBResponse: 'Shoulders dropping. Breathing.' },
            { stepIndex: 1,
              partnerAResponse: "I appreciate how you stayed in the conversation last Tuesday even when your Avoider wanted to leave. That meant a lot to my Little One, even if I didn't say so.",
              partnerBResponse: "I appreciate how you named your Planner part instead of just shutting down. Seeing you do that made me feel like we were on the same team." },
            { stepIndex: 2,
              partnerAResponse: "Hearing that, my chest softens. A younger part of me that worries you don't really see me — it relaxes a little.",
              partnerBResponse: "Little One inside me felt touched. It's not used to feeling appreciated. It got a little teary." },
            { stepIndex: 3,
              partnerAResponse: "I'm grateful that your Avoider is learning to stay. Every time it does, we heal a little.",
              partnerBResponse: "I'm grateful that your Planner works so hard to protect us, even when it's exhausting for both of us." },
          ],
          startedAt: d(10), completedAt: d(10),
          partnerAActiveParts: ['p1'], partnerBActiveParts: ['p2', 'p3'],
          partnerASelfEnergy: 7, partnerBSelfEnergy: 6,
        },
      ],
      activeConversationId: null,
    });
  }

  // ── Clarity ──
  const clarity = useClarityStore.getState();
  if (clarity.therapeuticGoals.length === 0 && !clarity.savedMissionStatement) {
    useClarityStore.setState({
      savedMissionStatement:
        'To lead from Self in all my relationships — honoring every part of my system while building a life of authentic connection, creative purpose, and ongoing inner growth.',
      therapeuticGoals: [
        {
          id: 'tg1',
          statement: 'Develop the capacity to notice and unblend from The Planner in real-time during high-pressure situations.',
          type: 'parts-work',
          specific: 'Catch The Planner within 30 seconds of activation; take one breath before responding.',
          meaningful: 'The Planner unconsciously runs my professional and personal relationships.',
          achievable: 'Through daily awareness practice and the unblending practices in the app.',
          relevant: 'Core to every area of my life — work, relationships, creativity.',
          timeframe: '3 months',
          partReactions: [
            { partId: 'p1', stance: 'resisting', concern: "If I pause The Planner, everything will fall apart and I'll be exposed." },
          ],
          selfCheck: 'yes',
          selfCheckNote: 'This feels genuinely Self-led, not fear-driven.',
          status: 'in-progress',
          createdAt: d(30),
          reviewNotes: [
            'Week 2: Caught Planner twice in one day — first time that has ever happened.',
            'Week 4: Starting to feel a tiny gap between activation and reaction.',
          ],
        },
        {
          id: 'tg2',
          statement: 'Build a compassionate, ongoing relationship with Little One (exile).',
          type: 'healing',
          specific: 'Check in with Little One twice a week using the Sitting With practice.',
          meaningful: 'This exile carries the core wound of not-enough-ness that drives so much behavior.',
          achievable: 'With the Sitting With practice and increasing Self-energy.',
          relevant: 'Everything ultimately leads back to this part.',
          timeframe: '6 months',
          partReactions: [
            { partId: 'p2', stance: 'both', concern: 'Not sure if going near the exile is safe yet.' },
            { partId: 'p1', stance: 'resisting', concern: "What if opening this up makes everything worse?" },
          ],
          selfCheck: 'mostly',
          selfCheckNote: 'Some protector concern remains, but Self feels genuinely ready to try.',
          status: 'just-started',
          createdAt: d(20),
          reviewNotes: [],
        },
      ],
      selectedValues: ['Authenticity', 'Compassion', 'Courage', 'Growth', 'Connection', 'Creativity', 'Honesty'],
      valueEntries: [
        { value: 'Authenticity', bucket: 'essential',       holder: 'self' },
        { value: 'Compassion',   bucket: 'essential',       holder: 'self' },
        { value: 'Courage',      bucket: 'essential',       holder: 'both', partId: 'p1', partFear: "Being seen as weak or unprepared." },
        { value: 'Connection',   bucket: 'essential',       holder: 'both', partId: 'p3', partFear: "Being rejected once I'm truly known." },
        { value: 'Growth',       bucket: 'very-important',  holder: 'self' },
        { value: 'Creativity',   bucket: 'very-important',  holder: 'self' },
        { value: 'Honesty',      bucket: 'very-important',  holder: 'both', partId: 'p4', partFear: "Honesty might expose my imperfections." },
      ],
      valuesStage: 3,
      memories: [
        {
          id: 'mem1', title: 'The School Presentation', age: 8, lifeStage: 'childhood',
          description:
            'I froze during a class presentation when I forgot my lines. Everyone laughed. I stood at the front of the room, face burning, completely exposed. I wanted to disappear.',
          emotionalTones: ['Shame', 'Fear', 'Helplessness', 'Humiliation'],
          memoryTypes: ['exile-origin', 'protector-formation'],
          connectedParts: ['p3', 'p1', 'p4'],
          sensoryDetails: 'Bright fluorescent lights, the sound of laughter, sweaty palms, the smell of chalk.',
          lessons:
            'This is where The Planner was born — vowing that I would never be unprepared again. And The Inner Critic came too, to make sure I kept that vow.',
          createdAt: d(18),
        },
        {
          id: 'mem2', title: 'Playing Guitar Alone', age: 16, lifeStage: 'adolescence',
          description:
            'A Sunday afternoon, alone in my room. I was learning a new song and completely lost myself in it for three hours. Time disappeared. There was no self-consciousness, no inner critic — just presence.',
          emotionalTones: ['Joy', 'Wonder', 'Safety', 'Awe'],
          memoryTypes: ['self-energy'],
          connectedParts: [],
          sensoryDetails: 'Warm afternoon light, the vibration of the guitar body, complete absorption, no time.',
          lessons:
            'Self was always here. Even at 16, with all the parts active, there were moments of pure Self. This memory is proof.',
          createdAt: d(14),
        },
        {
          id: 'mem3', title: 'My Father\'s Criticism', age: 12, lifeStage: 'childhood',
          description:
            "I showed my father a painting I'd made and he said it wasn't good enough — that I should have worked harder. I remember putting it away and never painting again for years.",
          emotionalTones: ['Sadness', 'Anger', 'Shame', 'Betrayal'],
          memoryTypes: ['burden-origin', 'protector-formation'],
          connectedParts: ['p3', 'p4'],
          sensoryDetails: 'The smell of oil paint, afternoon kitchen light, the weight of the painting in my hands.',
          lessons:
            "The Inner Critic may have internalized my father's voice to preemptively criticize before anyone else could.",
          createdAt: d(10),
        },
      ],
      lifeDomains: [
        { id: 'work',          name: 'Work & Career',            icon: 'briefcase',  satisfaction: 6,  goals: [{ id: 'lg1', text: 'Lead a project from Self, not anxiety', why: 'To prove the work can be good without being fear-driven' }], activeParts: ['p1', 'p4'], driver: 'mixed' },
        { id: 'relationships', name: 'Relationships & Love',     icon: 'heart',      satisfaction: 7,  goals: [{ id: 'lg2', text: 'Stay present during conflict with partner', why: 'Connection is only real if I can be there in the hard moments too' }], activeParts: ['p2', 'p3'], driver: 'mixed' },
        { id: 'family',        name: 'Family',                   icon: 'users',      satisfaction: 5,  goals: [], activeParts: ['p4'], driver: 'part-driven' },
        { id: 'health',        name: 'Health & Body',            icon: 'activity',   satisfaction: 6,  goals: [{ id: 'lg3', text: 'Build a somatic practice', why: 'To reconnect with my body, which parts have colonized' }], activeParts: [], driver: 'self-led' },
        { id: 'growth',        name: 'Personal Growth & Learning', icon: 'trending-up', satisfaction: 8, goals: [], activeParts: [], driver: 'self-led' },
        { id: 'creative',      name: 'Creative Expression',      icon: 'palette',    satisfaction: 4,  goals: [{ id: 'lg4', text: 'Create again without The Inner Critic running the session', why: 'Creativity is Self-energy and I want it back' }], activeParts: ['p4'], driver: 'part-driven' },
        { id: 'spirituality',  name: 'Spirituality & Meaning',   icon: 'sparkles',   satisfaction: 7,  goals: [], activeParts: [], driver: 'self-led' },
        { id: 'community',     name: 'Community & Contribution', icon: 'globe',      satisfaction: 5,  goals: [], activeParts: ['p1'], driver: 'mixed' },
      ],
    });
  }

  // ── Self-Energy ──
  const selfEnergy = useSelfEnergyStore.getState();
  if (selfEnergy.checkIns.length === 0) {
    useSelfEnergyStore.setState({
      checkIns: [
        {
          id: 'se1', date: d(14), overallEnergy: 55,
          qualities: { Calm: 2, Curious: 3, Compassionate: 3, Clear: 2, Confident: 2, Creative: 3, Courageous: 2, Connected: 2 },
          blendedParts: [{ partId: 'p1', strength: 'Strong' }, { partId: 'p4', strength: 'Moderate' }],
          context: ['Work', 'Social'], note: 'Planner and Critic both very loud today',
        },
        {
          id: 'se2', date: d(7), overallEnergy: 68,
          qualities: { Calm: 4, Curious: 4, Compassionate: 4, Clear: 3, Confident: 3, Creative: 4, Courageous: 3, Connected: 4 },
          blendedParts: [{ partId: 'p4', strength: 'Mild' }],
          context: ['Home', 'Alone'], note: 'More settled after practice this morning',
        },
        {
          id: 'se3', date: d(1), overallEnergy: 74,
          qualities: { Calm: 4, Curious: 5, Compassionate: 5, Clear: 4, Confident: 4, Creative: 4, Courageous: 4, Connected: 5 },
          blendedParts: [],
          context: ['Alone'], note: 'Genuinely grounded — the quietest the system has been in weeks',
        },
      ],
      selfMoments: [
        {
          id: 'sm1', date: d(10),
          whatHappened: "Noticed The Planner activating before a meeting and — for the first time — was able to take a breath and choose my response rather than being swept away.",
          whatHelped: 'Box breathing and silently saying "I see you, Planner" before walking in.',
          howItFelt: 'Spacious. Like there was a gap between stimulus and response that had never been there before.',
          starred: true,
        },
        {
          id: 'sm2', date: d(5),
          whatHappened: "Partner and I had a moment of real connection after the Appreciation conversation. No parts were loud — just the two of us, present.",
          whatHelped: 'The guided conversation structure gave us both a container.',
          howItFelt: 'Like coming home to something I forgot was possible.',
          starred: true,
        },
      ],
    });
  }

  // ── Elaboration ──
  const elaboration = useElaborationStore.getState();
  if (elaboration.sessions.length === 0) {
    useElaborationStore.setState({
      sessions: [
        {
          id: 'elab1', partId: 'p1', date: d(38), completed: true,
          responses: [
            { tabId: 'story',      questionIndex: 0, answer: "I first noticed The Planner around age 8, right after a humiliating school presentation where I forgot my lines. It vowed that I would never be unprepared again.", timestamp: d(38) },
            { tabId: 'story',      questionIndex: 1, answer: "The night before a major job interview three years ago. I rehearsed answers for six hours straight and still couldn't sleep because the Planner kept finding more scenarios to prepare for.", timestamp: d(38) },
            { tabId: 'story',      questionIndex: 2, answer: "The presentation incident at age 8. But also years of a father who was critical of anything 'done wrong.' The Planner learned early: be ready for everything.", timestamp: d(38) },
            { tabId: 'appearance', questionIndex: 0, answer: "A middle-aged person in a perfectly pressed suit, always holding a clipboard or a mental list. Slightly anxious eyes behind a meticulously organized exterior. Never sits still.", timestamp: d(38) },
            { tabId: 'appearance', questionIndex: 3, answer: "Tension in my forehead and behind my eyes. Sometimes a pressure in my chest, like something needs to be done and I haven't done it yet.", timestamp: d(38) },
            { tabId: 'function',   questionIndex: 0, answer: "It's trying to prevent any situation where I might be caught unprepared, exposed, and humiliated. If I'm always ready, nothing bad can happen.", timestamp: d(38) },
            { tabId: 'function',   questionIndex: 1, answer: "I genuinely don't know. I think I'd feel naked. Exposed. Like I'd have no shield.", timestamp: d(38) },
            { tabId: 'function',   questionIndex: 2, answer: "That I'd be humiliated. That people would see I'm not as competent as they think. That something would go catastrophically wrong and I'd have no one to blame but myself.", timestamp: d(38) },
            { tabId: 'needs',      questionIndex: 0, answer: "It needs to know that being imperfectly prepared won't lead to catastrophe. It needs evidence that unpredictability is survivable.", timestamp: d(38) },
            { tabId: 'needs',      questionIndex: 2, answer: "It wants to be seen and appreciated for how hard it works to keep me safe. It's exhausted and nobody thanks it.", timestamp: d(38) },
            { tabId: 'relationship', questionIndex: 0, answer: "Complicated. Gratitude mixed with genuine frustration. I appreciate what it does — I'm good at my job partly because of it — but I'm also exhausted by it.", timestamp: d(38) },
            { tabId: 'relationship', questionIndex: 2, answer: "By checking in with it before high-stakes situations and showing it that I have the basics handled. By showing it that imperfection hasn't destroyed me.", timestamp: d(38) },
            { tabId: 'burdens',    questionIndex: 0, answer: "The belief that 'you must always be prepared or something terrible will happen.' The exhausting myth that vigilance equals safety.", timestamp: d(38) },
            { tabId: 'burdens',    questionIndex: 3, answer: "Incredible organizational ability. Strategic thinking. The capacity to hold complex plans in mind. Dedication to keeping me safe. These are genuinely gifts.", timestamp: d(38) },
          ],
        },
        {
          id: 'elab2', partId: 'p3', date: d(20), completed: false,
          responses: [
            { tabId: 'story',      questionIndex: 0, answer: "I think Little One has been there forever. But I first really noticed it during the school presentation memory — that moment of wanting to disappear.", timestamp: d(20) },
            { tabId: 'appearance', questionIndex: 0, answer: "A young child, maybe 7 or 8 years old. Sitting with arms wrapped around their knees. Eyes that are watchful, waiting for judgment. Somehow both hopeful and bracing.", timestamp: d(20) },
            { tabId: 'appearance', questionIndex: 3, answer: "A hollow, sinking feeling in my stomach. Warmth behind my eyes like I might cry.", timestamp: d(20) },
          ],
        },
      ],
    });
  }

  // ── Refine ──
  const refine = useRefineStore.getState();
  if (!refine.refinements['p1']) {
    useRefineStore.setState({
      refinements: {
        p1: {
          partId: 'p1',
          customName: 'The Architect',
          nameReason: "It doesn't just plan — it constructs entire protective structures. The Architect captures both its controlling nature and the genuine intelligence underneath.",
          nameHistory: [{ name: 'The Planner', date: d(25) }],
          representationType: 'icon' as const,
          selectedIcon: 'brain',
          customColor: 'hsl(220, 65%, 45%)',
          imageUrl: undefined,
          prominence: 4,
          visualNotes: 'Blue feels right — it carries an intellectual, structured quality.',
          editedDescription: "Constructs elaborate systems of preparation and control to prevent exposure and ensure safety. Exhausting but genuinely brilliant at its work.",
          editedTriggers: "High-stakes evaluations, ambiguity, unpredictable situations, any risk of being seen as incompetent.",
          editedManifestations: "Overthinking, excessive preparation, rehearsal of conversations, difficulty sleeping before events.",
          customAttributes: [
            { id: 'ca1', name: 'Favorite phrases', value: '"Let\'s think this through." "We need a backup plan." "What if that happens?"' },
            { id: 'ca2', name: "This part's age",  value: '8 — that\'s when it activated. Still operates from that scared child\'s logic.' },
            { id: 'ca3', name: 'Historical figure', value: 'A general before a major battle — all strategy, all preparation, no rest.' },
          ],
          story: "The Architect came online after a devastating school presentation at age 8. Since then, it has been the silent organizer of my entire life — ensuring I'm never caught unprepared, never exposed, never humiliated again.",
          originStory: "Born from public humiliation at age 8. In that moment, a decision was made: 'I will never be vulnerable and unprepared in public again.' The Architect has kept that vow ever since.",
          partVoice: '"I am not the enemy. I am the reason you\'ve succeeded. I am the reason you\'re still standing. Without me, you would have fallen apart years ago. I just need you to trust me."',
          evolutionNotes: "Beginning to trust Self more. Still watches closely but slightly less frantic since the unblending work began.",
          history: [
            { id: 'rh1', timestamp: d(25), field: 'customName', oldValue: '', newValue: 'The Architect' },
            { id: 'rh2', timestamp: d(25), field: 'selectedIcon', oldValue: '', newValue: 'brain' },
          ],
          createdAt: d(25),
          lastRefinedAt: d(25),
        },
      },
    });
  }

  // ── Practices ──
  const practices = usePracticesStore.getState();
  if (practices.sessions.length === 0) {
    usePracticesStore.setState({
      sessions: [
        {
          id: 'ps1', practiceId: 'box-breathing',
          startedAt: d(28), completedAt: d(28),
          reflections: {
            5: 'Felt noticeably calmer afterward. The Planner quieted for about 20 minutes — longer than usual.',
          },
          integrationNote: "Simple but surprisingly effective. The breathing anchored me when the mental spiraling wanted to take over. Will do this daily before work.",
        },
        {
          id: 'ps2', practiceId: 'creating-space',
          startedAt: d(7), completedAt: d(7),
          selectedPartId: 'p1',
          reflections: {
            3: "The Planner was very reluctant to give even an inch of space. But when I asked 'would you be willing to step back just slightly?' — it did. A tiny movement but real.",
            6: "From the space, I could see The Planner with something like compassion instead of my usual frustration. It looked tired. It's been working so hard.",
          },
          integrationNote: "First real unblending experience. That gap between Self and the part — I've read about it but now I've felt it. This changes something.",
        },
        {
          id: 'ps3', practiceId: 'already-there',
          startedAt: d(15), completedAt: d(15),
          reflections: {
            2: "The guitar memory. I was 16 and completely absorbed in learning a song. No critic, no planner, just the music and me.",
            4: "There was something present in that moment that was none of the parts. Calm, absorbed, real. That must be Self.",
          },
          integrationNote: "The recognition practice is powerful. Self wasn't something I had to create — it was already there at 16. I just forgot.",
        },
      ],
      favorites: ['box-breathing', 'creating-space', 'already-there'],
    });
  }

  // ── Trailhead ──
  const trailhead = useTrailheadStore.getState();
  if (trailhead.trails.length === 0) {
    useTrailheadStore.setState({
      trails: [
        {
          id: 'trail1',
          name: 'Pre-Meeting Anxiety Trail',
          date: d(35),
          status: 'completed',
          entry: {
            type: 'feeling',
            description: "Intense anxiety about tomorrow's team presentation — the kind that makes it impossible to sleep.",
            intensity: 7,
            bodyResponse: 'Tightness in my chest and throat. Shallow breathing. Restlessness in my legs.',
          },
          chain: [
            {
              partId: 'p1', partName: 'The Planner', partType: 'Manager', isNew: false,
              purpose: "Making sure I'm fully prepared so nothing can go wrong. Rehearsing every possible scenario.",
              duration: 'Since childhood — maybe age 8.',
              fear: "Being caught unprepared and publicly humiliated. Everyone seeing that I'm not as competent as they think.",
              isProtecting: "Little One — the vulnerable, shame-carrying part that I almost never let the surface see.",
              managingFeelings: "Shame, fear of judgment, the deep terror of inadequacy and not-enough-ness.",
              underneathFeeling: "Underneath the planning is a terrified younger part who believes one mistake means total rejection.",
              willingToStep: "Reluctantly — only if I can show it that we have the basics handled. It needs reassurance before it can rest.",
              whatComesUp: "A younger feeling — sad, scared, wanting to be told it's okay to be imperfect.",
            },
            {
              partId: 'p4', partName: 'The Inner Critic', partType: 'Manager', isNew: false,
              purpose: "Pushing me to work harder so The Planner's fears don't come true. Using criticism as a motivator.",
              duration: 'As long as I can remember. Probably internalized from external criticism.',
              fear: "That without its harsh standards, I'll become complacent and truly fail.",
              isProtecting: "Also protecting Little One — different strategy, same mission. Criticize me before others can.",
              managingFeelings: "Shame and inadequacy — by preemptively attacking me first.",
              underneathFeeling: "Underneath the criticism is the same core wound: not worthy of love unless perfect.",
              willingToStep: "Extremely reluctant. Believes it is essential to my survival.",
              whatComesUp: "Sadness. Underneath the harsh voice is a part that is desperately trying to protect something tender.",
            },
          ],
          exile: {
            partId: 'p3',
            partName: 'Little One',
            isNew: false,
            carriesEmotions: "Deep shame from the school presentation memory. Fear of being seen as fundamentally not enough. Longing for acceptance without conditions.",
            feelsYounger: 'About 7-8 years old — exactly the age of the presentation incident.',
            longBurden: "The belief that 'I am fundamentally not good enough, and if people really know me, they will reject me.'",
            selfAwareness: "It knows Self is here. It looks cautiously hopeful — like it's been waiting a long time for someone to finally show up.",
            exileMessage: "I just want to know that I'm okay even when things don't go perfectly. That I don't have to earn the right to exist.",
          },
          selfEnergyChecks: [58, 65, 72],
          starred: true,
          tags: ['anxiety', 'work', 'performance', 'shame'],
        },
        {
          id: 'trail2',
          name: 'Conflict Avoidance Pattern',
          date: d(18),
          status: 'completed',
          entry: {
            type: 'impulse',
            description: "The urge to leave the room / change the subject / suddenly become very busy whenever my partner brings up something that needs to be addressed between us.",
            intensity: 8,
            bodyResponse: "Tension in the shoulders, a kind of restless energy in the legs like they want to run.",
          },
          chain: [
            {
              partId: 'p2', partName: 'The Avoider', partType: 'Firefighter', isNew: false,
              purpose: "Getting me out of the situation before the emotional intensity reaches a level Little One can't handle.",
              duration: 'Early. This part was probably active by age 10.',
              fear: "That if I stay and feel what's there, it will overwhelm me and break something permanently.",
              isProtecting: "Little One. The Avoider is a firefighter — it rushes in when it senses Little One is about to be flooded.",
              managingFeelings: "Terror of abandonment, shame, vulnerability, the feeling of being trapped.",
              underneathFeeling: "The same Little One feelings: not enough, will be rejected, emotional pain is dangerous.",
              willingToStep: "If I could show it that staying in the feeling won't destroy us. It needs proof.",
              whatComesUp: "Relief. Then almost immediately — sadness about all the connections missed because this part ran.",
            },
          ],
          exile: {
            partId: 'p3', partName: 'Little One', isNew: false,
            carriesEmotions: 'Fear of abandonment if truly known. The wound of having needs that weren\'t met.',
            feelsYounger: 'Perhaps even younger here — 5 or 6.',
            longBurden: "'My needs are too much. If I show them, I will be abandoned.'",
            selfAwareness: 'Little One is surprised Self is there. It hides. Then slowly, carefully comes closer.',
            exileMessage: 'I just need to know you won\'t leave when it gets hard.',
          },
          selfEnergyChecks: [45, 60],
          starred: false,
          tags: ['avoidance', 'relationship', 'conflict', 'connection'],
        },
      ],
    });
  }
}
