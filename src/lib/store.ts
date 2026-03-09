import { create } from 'zustand';

export type PartType = 'Manager' | 'Firefighter' | 'Exile' | 'Self';
export type PartIntensity = 'Low' | 'Medium' | 'High';

export interface Part {
  id: string;
  name: string;
  type: PartType;
  manifestationMode: string;
  description: string;
  intensity: PartIntensity;
  avatar: string;
  accentColor: string;
}

export interface Dialogue {
  id: string;
  title: string;
  date: string;
  participantIds: string[];
  messages: {
    partId: string;
    text: string;
  }[];
}

interface IFSStore {
  parts: Part[];
  dialogues: Dialogue[];
  addPart: (part: Omit<Part, 'id'>) => void;
  updatePart: (id: string, part: Partial<Part>) => void;
  deletePart: (id: string) => void;
  addDialogue: (dialogue: Omit<Dialogue, 'id'>) => void;
}

const mockParts: Part[] = [
  {
    id: 'p1',
    name: 'The Planner',
    type: 'Manager',
    manifestationMode: 'Cognitive',
    description: 'Always trying to figure out what happens next to stay safe.',
    intensity: 'Medium',
    avatar: 'brain',
    accentColor: 'hsl(230, 60%, 40%)',
  },
  {
    id: 'p2',
    name: 'The Avoider',
    type: 'Firefighter',
    manifestationMode: 'Impulse',
    description: 'Wants to scroll on phone or watch TV when overwhelmed.',
    intensity: 'High',
    avatar: 'shield',
    accentColor: 'hsl(30, 90%, 50%)',
  },
  {
    id: 'p3',
    name: 'Little One',
    type: 'Exile',
    manifestationMode: 'Emotional',
    description: 'Holds feelings of not being good enough from childhood.',
    intensity: 'Low',
    avatar: 'heart',
    accentColor: 'hsl(270, 50%, 60%)',
  },
  {
    id: 'p4',
    name: 'The Inner Critic',
    type: 'Manager',
    manifestationMode: 'Cognitive',
    description: 'Harshly judges performance and worth to prevent failure and shame.',
    intensity: 'High',
    avatar: 'eye',
    accentColor: 'hsl(210, 50%, 35%)',
  },
  {
    id: 'p5',
    name: 'Self',
    type: 'Self',
    manifestationMode: 'Presence',
    description: 'The calm, compassionate core that can hold space for all other parts.',
    intensity: 'Medium',
    avatar: 'sun',
    accentColor: 'hsl(45, 90%, 50%)',
  },
];

const mockDialogues: Dialogue[] = [
  {
    id: 'd1',
    title: 'Check-in with The Planner',
    date: new Date(Date.now() - 7 * 86400000).toISOString(),
    participantIds: ['p1', 'self'],
    messages: [
      { partId: 'self', text: 'Hi Planner, I notice you working really hard today. Can we talk?' },
      { partId: 'p1', text: "If I don't plan everything, we'll fall behind and bad things will happen. You know that." },
      { partId: 'self', text: 'I hear that fear. I appreciate how much you want to keep us safe.' },
      { partId: 'p1', text: '...you do? Most of the time I feel like you just want me to stop.' },
      { partId: 'self', text: "I don't want you to stop. I want to understand you better. What are you most afraid of right now?" },
      { partId: 'p1', text: "That if I let go for even a moment, everything will fall apart. That we'll be exposed." },
      { partId: 'self', text: "That sounds exhausting. What if I could help carry some of that? What if being unprepared didn't mean catastrophe?" },
    ],
  },
  {
    id: 'd2',
    title: 'The Avoider and Little One',
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
    participantIds: ['p2', 'p3', 'self'],
    messages: [
      { partId: 'self', text: "I notice both of you are activated right now. Avoider — you want to shut down. Little One — you're hurting. Can we slow down?" },
      { partId: 'p2', text: "I need to get us out of here. This feeling is too much. Let's go watch something, do anything else." },
      { partId: 'p3', text: "Please don't leave. Every time the Avoider takes over, I'm left alone with all this pain." },
      { partId: 'self', text: "Avoider, I hear you. You're trying to protect us from something overwhelming. But Little One is asking us to stay." },
      { partId: 'p2', text: "I... I'm afraid if we stay, Little One's pain will drown us." },
      { partId: 'self', text: "What if I'm here too? What if the three of us can be with this feeling together, just for a moment?" },
      { partId: 'p3', text: "I just want someone to be with me." },
      { partId: 'p2', text: "Okay. I'll try to stay. But I need to know we can leave if it gets too much." },
      { partId: 'self', text: "You can. We'll go at your pace. Thank you both for trusting me." },
    ],
  },
];

export const useStore = create<IFSStore>((set) => ({
  parts: mockParts,
  dialogues: mockDialogues,
  addPart: (part) => set((state) => ({ 
    parts: [...state.parts, { ...part, id: Math.random().toString(36).substring(7) }] 
  })),
  updatePart: (id, updatedPart) => set((state) => ({
    parts: state.parts.map(p => p.id === id ? { ...p, ...updatedPart } : p)
  })),
  deletePart: (id) => set((state) => ({
    parts: state.parts.filter(p => p.id !== id)
  })),
  addDialogue: (dialogue) => set((state) => ({
    dialogues: [...state.dialogues, { ...dialogue, id: Math.random().toString(36).substring(7) }]
  })),
}));