import { useState } from 'react';
import { useClarityStore, CoreMemory, LifeStage, MemoryType, EMOTIONAL_TONES } from '@/lib/clarityStore';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, BookMarked, Trash2, Clock, Grid, BarChart3, X } from 'lucide-react';
import { format } from 'date-fns';

const LIFE_STAGES: { value: LifeStage; label: string; range: string }[] = [
  { value: 'early-childhood', label: 'Early Childhood', range: '0–5' },
  { value: 'childhood', label: 'Childhood', range: '6–11' },
  { value: 'adolescence', label: 'Adolescence', range: '12–17' },
  { value: 'young-adult', label: 'Young Adult', range: '18–25' },
  { value: 'adult', label: 'Adult', range: '26+' },
];

const MEMORY_TYPES: { value: MemoryType; label: string; description: string }[] = [
  { value: 'exile-origin', label: 'Exile Origin', description: 'May have created a wounded part' },
  { value: 'protector-formation', label: 'Protector Formation', description: 'May have created a Manager or Firefighter' },
  { value: 'self-energy', label: 'Self-Energy Memory', description: 'I was fully myself here' },
  { value: 'relationship', label: 'Relationship Memory', description: 'Shaped how I relate to others' },
  { value: 'turning-point', label: 'Turning Point', description: 'Something fundamental changed' },
  { value: 'burden-origin', label: 'Burden Origin', description: 'A belief or burden was taken on' },
];

const TONE_COLORS: Record<string, string> = {
  Joy: 'hsl(45, 90%, 50%)', Pride: 'hsl(35, 80%, 50%)', Love: 'hsl(340, 70%, 55%)',
  Safety: 'hsl(142, 60%, 40%)', Belonging: 'hsl(180, 50%, 40%)', Curiosity: 'hsl(210, 70%, 50%)',
  Confusion: 'hsl(40, 40%, 50%)', Sadness: 'hsl(220, 50%, 50%)', Fear: 'hsl(270, 40%, 50%)',
  Shame: 'hsl(0, 50%, 35%)', Anger: 'hsl(0, 80%, 50%)', Abandonment: 'hsl(280, 40%, 40%)',
  Helplessness: 'hsl(220, 30%, 45%)', Betrayal: 'hsl(350, 60%, 40%)', Loss: 'hsl(240, 30%, 40%)',
  Wonder: 'hsl(50, 80%, 55%)', Awe: 'hsl(200, 70%, 55%)', Gratitude: 'hsl(160, 60%, 45%)',
};

export default function CoreMemories() {
  const { memories, addMemory, deleteMemory } = useClarityStore();
  const parts = useStore((s) => s.parts);
  const [view, setView] = useState<'timeline' | 'cards' | 'patterns'>('cards');
  const [creating, setCreating] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [age, setAge] = useState<number | undefined>();
  const [lifeStage, setLifeStage] = useState<LifeStage>('childhood');
  const [description, setDescription] = useState('');
  const [tones, setTones] = useState<string[]>([]);
  const [types, setTypes] = useState<MemoryType[]>([]);
  const [connectedParts, setConnectedParts] = useState<string[]>([]);
  const [sensory, setSensory] = useState('');
  const [lessons, setLessons] = useState('');

  const resetForm = () => {
    setTitle(''); setAge(undefined); setLifeStage('childhood'); setDescription('');
    setTones([]); setTypes([]); setConnectedParts([]); setSensory(''); setLessons(''); setCreating(false);
  };

  const handleSave = () => {
    addMemory({ title, age, lifeStage, description, emotionalTones: tones, memoryTypes: types, connectedParts, sensoryDetails: sensory, lessons });
    resetForm();
  };

  // Patterns
  const toneCounts = memories.reduce<Record<string, number>>((acc, m) => {
    m.emotionalTones.forEach((t) => { acc[t] = (acc[t] || 0) + 1; });
    return acc;
  }, {});
  const partCounts = memories.reduce<Record<string, number>>((acc, m) => {
    m.connectedParts.forEach((p) => { acc[p] = (acc[p] || 0) + 1; });
    return acc;
  }, {});
  const sortedTones = Object.entries(toneCounts).sort((a, b) => b[1] - a[1]);
  const sortedParts = Object.entries(partCounts).sort((a, b) => b[1] - a[1]);

  const sortedByAge = [...memories].sort((a, b) => {
    const aIdx = LIFE_STAGES.findIndex((s) => s.value === a.lifeStage);
    const bIdx = LIFE_STAGES.findIndex((s) => s.value === b.lifeStage);
    return aIdx - bIdx || (a.age || 0) - (b.age || 0);
  });

  if (creating) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Add Memory</h2>
          <Button variant="ghost" size="sm" onClick={resetForm}>Cancel</Button>
        </div>

        <Card><CardContent className="pt-6 space-y-4">
          <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="A short label for this memory" className="mt-1" /></div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Life Stage</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {LIFE_STAGES.map((s) => (
                  <button key={s.value} className={`text-[10px] px-2 py-1 rounded-full border ${lifeStage === s.value ? 'bg-primary text-primary-foreground border-primary' : 'border-input'}`}
                    onClick={() => setLifeStage(s.value)}>
                    {s.label} ({s.range})
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs">Approximate Age (optional)</Label>
              <Input type="number" value={age || ''} onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : undefined)} className="mt-1 h-8 text-xs" />
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this memory with as much or as little detail as feels right..." className="mt-1 min-h-[120px]" />
          </div>

          <div>
            <Label className="text-xs">Emotional Tone</Label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {EMOTIONAL_TONES.map((t) => (
                <button key={t} className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${tones.includes(t) ? 'text-white font-medium' : 'border-input hover:bg-muted/50'}`}
                  style={tones.includes(t) ? { backgroundColor: TONE_COLORS[t], borderColor: TONE_COLORS[t] } : {}}
                  onClick={() => setTones((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs">Memory Type (select all that apply)</Label>
            <div className="space-y-1 mt-1">
              {MEMORY_TYPES.map((mt) => (
                <button key={mt.value} className={`w-full text-left text-xs px-3 py-2 rounded-lg border transition-colors ${types.includes(mt.value) ? 'bg-primary/10 border-primary text-primary' : 'border-input hover:bg-muted/50'}`}
                  onClick={() => setTypes((prev) => prev.includes(mt.value) ? prev.filter((x) => x !== mt.value) : [...prev, mt.value])}>
                  <span className="font-medium">{mt.label}</span> — <span className="text-muted-foreground">{mt.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs">Connected Parts</Label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {parts.map((p) => (
                <button key={p.id} className={`text-[10px] px-2 py-0.5 rounded-full border ${connectedParts.includes(p.id) ? 'bg-primary text-primary-foreground border-primary' : 'border-input'}`}
                  onClick={() => setConnectedParts((prev) => prev.includes(p.id) ? prev.filter((x) => x !== p.id) : [...prev, p.id])}>
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div><Label className="text-xs">Sensory Details (optional)</Label>
            <Textarea value={sensory} onChange={(e) => setSensory(e.target.value)} placeholder="What do you see, hear, feel, smell?" className="mt-1 min-h-[60px]" /></div>

          <div><Label className="text-xs">What did this memory teach you? (optional)</Label>
            <Textarea value={lessons} onChange={(e) => setLessons(e.target.value)} placeholder="What conclusions or beliefs formed here?" className="mt-1 min-h-[60px]" /></div>

          <Button className="w-full" disabled={!title.trim() || !description.trim()} onClick={handleSave}>Save Memory</Button>
        </CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Core Memories</h2>
        <div className="flex gap-1">
          {[{ v: 'timeline' as const, icon: Clock }, { v: 'cards' as const, icon: Grid }, { v: 'patterns' as const, icon: BarChart3 }].map(({ v, icon: Icon }) => (
            <Button key={v} variant={view === v ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7"
              onClick={() => setView(v)}><Icon className="h-3.5 w-3.5" /></Button>
          ))}
          <Button size="sm" className="gap-1 ml-2" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> Add Memory
          </Button>
        </div>
      </div>

      {memories.length === 0 ? (
        <Card><CardContent className="pt-6 text-center py-12">
          <BookMarked className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No memories yet. Start building your core memory archive.</p>
        </CardContent></Card>
      ) : view === 'timeline' ? (
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
              {sortedByAge.map((mem) => {
                const mainTone = mem.emotionalTones[0];
                return (
                  <div key={mem.id} className="relative pl-10 pb-6">
                    <div className="absolute left-2.5 w-3 h-3 rounded-full border-2 border-background"
                      style={{ backgroundColor: mainTone ? TONE_COLORS[mainTone] : 'hsl(var(--muted))' }} />
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-medium">{mem.title}</span>
                      <span className="text-[10px] text-muted-foreground">{mem.age ? `Age ${mem.age}` : LIFE_STAGES.find((s) => s.value === mem.lifeStage)?.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{mem.description}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {mem.memoryTypes.map((t) => <Badge key={t} variant="outline" className="text-[9px]">{MEMORY_TYPES.find((mt) => mt.value === t)?.label}</Badge>)}
                      {mem.emotionalTones.slice(0, 3).map((t) => (
                        <div key={t} className="w-2 h-2 rounded-full" style={{ backgroundColor: TONE_COLORS[t] }} title={t} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : view === 'patterns' ? (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Most Common Emotional Tones</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sortedTones.slice(0, 8).map(([tone, count]) => (
                  <div key={tone} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: TONE_COLORS[tone] }} />
                    <span className="text-xs flex-1">{tone}</span>
                    <div className="w-24 h-1.5 rounded-full bg-muted">
                      <div className="h-full rounded-full" style={{ width: `${(count / memories.length) * 100}%`, backgroundColor: TONE_COLORS[tone] }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground w-4 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Most Frequently Tagged Parts</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sortedParts.slice(0, 6).map(([partId, count]) => {
                  const part = parts.find((p) => p.id === partId);
                  return part && (
                    <div key={partId} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: part.accentColor }} />
                      <span className="text-xs flex-1">{part.name}</span>
                      <span className="text-[10px] text-muted-foreground">{count} memories</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {memories.map((mem) => {
            const mainTone = mem.emotionalTones[0];
            return (
              <Card key={mem.id} className="group border-l-4" style={{ borderLeftColor: mainTone ? TONE_COLORS[mainTone] : 'hsl(var(--border))' }}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{mem.title}</p>
                      <p className="text-[10px] text-muted-foreground">{mem.age ? `Age ${mem.age}` : LIFE_STAGES.find((s) => s.value === mem.lifeStage)?.label}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={() => deleteMemory(mem.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{mem.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {mem.memoryTypes.map((t) => <Badge key={t} variant="outline" className="text-[9px]">{MEMORY_TYPES.find((mt) => mt.value === t)?.label}</Badge>)}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {mem.emotionalTones.map((t) => (
                      <div key={t} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: TONE_COLORS[t] }} title={t} />
                    ))}
                    <div className="ml-auto flex gap-0.5">
                      {mem.connectedParts.map((pid) => {
                        const p = parts.find((pt) => pt.id === pid);
                        return p && <div key={pid} className="w-2 h-2 rounded-full" style={{ backgroundColor: p.accentColor }} title={p.name} />;
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
