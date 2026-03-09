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
];

const mockDialogues: Dialogue[] = [
  {
    id: 'd1',
    title: 'Check-in with The Planner',
    date: new Date().toISOString(),
    participantIds: ['p1', 'self'],
    messages: [
      { partId: 'self', text: 'Hi Planner, I notice you working really hard today.' },
      { partId: 'p1', text: 'If I don\'t plan everything, we\'ll fall behind and bad things will happen.' },
      { partId: 'self', text: 'I hear that fear. I appreciate how much you want to keep us safe.' },
    ],
  },
];

export const useStore = create<IFSStore>((set) => ({
  parts: [],
  dialogues: [],
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