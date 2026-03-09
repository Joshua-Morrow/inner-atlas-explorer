import { useState } from 'react';
import { useClarityStore, GoalType, GoalStatus, TherapeuticGoal, PartReaction } from '@/lib/clarityStore';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, ChevronRight, ChevronLeft, Target, Sprout, Heart, Sparkles, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const TYPE_META: Record<GoalType, { label: string; color: string; icon: typeof Target }> = {
  healing: { label: 'Healing', color: 'hsl(var(--ifs-exile))', icon: Heart },
  growth: { label: 'Growth', color: 'hsl(var(--primary))', icon: Sprout },
  relationship: { label: 'Relationship', color: 'hsl(var(--ifs-firefighter))', icon: Heart },
  'parts-work': { label: 'Parts Work', color: 'hsl(var(--ifs-manager))', icon: Sparkles },
};

const STATUS_OPTIONS: { value: GoalStatus; label: string }[] = [
  { value: 'just-started', label: 'Just Started' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'breakthrough', label: 'Breakthrough' },
  { value: 'integrated', label: 'Integrated' },
  { value: 'complete', label: 'Complete' },
];

export default function TherapeuticGoals() {
  const { therapeuticGoals, addTherapeuticGoal, updateTherapeuticGoal, deleteTherapeuticGoal } = useClarityStore();
  const parts = useStore((s) => s.parts);
  const [creating, setCreating] = useState(false);
  const [step, setStep] = useState(1);

  // Builder state
  const [statement, setStatement] = useState('');
  const [goalType, setGoalType] = useState<GoalType>('growth');
  const [specific, setSpecific] = useState('');
  const [meaningful, setMeaningful] = useState('');
  const [achievable, setAchievable] = useState('');
  const [relevant, setRelevant] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [partReactions, setPartReactions] = useState<PartReaction[]>([]);
  const [selfCheck, setSelfCheck] = useState<'yes' | 'mostly' | 'not-sure'>('yes');
  const [selfCheckNote, setSelfCheckNote] = useState('');

  const resetForm = () => {
    setStep(1); setStatement(''); setGoalType('growth'); setSpecific(''); setMeaningful('');
    setAchievable(''); setRelevant(''); setTimeframe(''); setPartReactions([]);
    setSelfCheck('yes'); setSelfCheckNote(''); setCreating(false);
  };

  const handleSave = () => {
    addTherapeuticGoal({
      statement, type: goalType, specific, meaningful, achievable, relevant, timeframe,
      partReactions, selfCheck, selfCheckNote, status: 'just-started',
    });
    resetForm();
  };

  const togglePartReaction = (partId: string) => {
    setPartReactions((prev) =>
      prev.some((p) => p.partId === partId)
        ? prev.filter((p) => p.partId !== partId)
        : [...prev, { partId, stance: 'supporting', concern: '' }]
    );
  };

  if (creating) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">New Goal — Step {step} of 5</h2>
          <Button variant="ghost" size="sm" onClick={resetForm}>Cancel</Button>
        </div>
        <div className="flex gap-1">
          {[1,2,3,4,5].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>

        {step === 1 && (
          <Card><CardContent className="pt-6 space-y-4">
            <Label>What do you want to be different in your life or inner world?</Label>
            <Textarea value={statement} onChange={(e) => setStatement(e.target.value)} placeholder="No constraints — just what comes up..." className="min-h-[120px]" />
          </CardContent></Card>
        )}

        {step === 2 && (
          <Card><CardContent className="pt-6 space-y-3">
            <Label>What type of goal is this?</Label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(TYPE_META) as [GoalType, typeof TYPE_META[GoalType]][]).map(([type, meta]) => (
                <Button key={type} variant={goalType === type ? 'default' : 'outline'}
                  className="h-auto py-3 flex-col gap-1" onClick={() => setGoalType(type)}>
                  <meta.icon className="h-5 w-5" />
                  <span className="text-xs">{meta.label}</span>
                </Button>
              ))}
            </div>
          </CardContent></Card>
        )}

        {step === 3 && (
          <Card><CardContent className="pt-6 space-y-4">
            <p className="text-sm font-medium">SMART Refinement</p>
            <div><Label className="text-xs">Specific — What exactly?</Label><Textarea value={specific} onChange={(e) => setSpecific(e.target.value)} className="mt-1 min-h-[60px]" /></div>
            <div><Label className="text-xs">Meaningful — Why does this matter?</Label><Textarea value={meaningful} onChange={(e) => setMeaningful(e.target.value)} className="mt-1 min-h-[60px]" /></div>
            <div><Label className="text-xs">Achievable — What's a realistic first step?</Label><Textarea value={achievable} onChange={(e) => setAchievable(e.target.value)} className="mt-1 min-h-[60px]" /></div>
            <div><Label className="text-xs">Relevant — How does this connect to your deeper values?</Label><Textarea value={relevant} onChange={(e) => setRelevant(e.target.value)} className="mt-1 min-h-[60px]" /></div>
            <div><Label className="text-xs">Time-oriented — What timeframe feels right?</Label><Input value={timeframe} onChange={(e) => setTimeframe(e.target.value)} className="mt-1" placeholder="e.g., 3 months, 1 year..." /></div>
          </CardContent></Card>
        )}

        {step === 4 && (
          <Card><CardContent className="pt-6 space-y-4">
            <Label>Which parts have a reaction to this goal?</Label>
            <div className="flex flex-wrap gap-1.5">
              {parts.map((p) => (
                <button key={p.id}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${partReactions.some((r) => r.partId === p.id) ? 'bg-primary text-primary-foreground border-primary' : 'border-input hover:bg-muted/50'}`}
                  onClick={() => togglePartReaction(p.id)}>
                  {p.name}
                </button>
              ))}
            </div>
            {partReactions.map((pr) => {
              const part = parts.find((p) => p.id === pr.partId);
              return (
                <div key={pr.partId} className="border rounded-lg p-3 space-y-2">
                  <p className="text-xs font-medium">{part?.name}</p>
                  <div className="flex gap-1.5">
                    {(['supporting', 'resisting', 'both'] as const).map((s) => (
                      <button key={s} className={`text-[10px] px-2 py-1 rounded-full border ${pr.stance === s ? 'bg-primary text-primary-foreground border-primary' : 'border-input'}`}
                        onClick={() => setPartReactions((prev) => prev.map((r) => r.partId === pr.partId ? { ...r, stance: s } : r))}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                  <Input placeholder="What is this part's concern?" className="text-xs h-8"
                    value={pr.concern} onChange={(e) => setPartReactions((prev) => prev.map((r) => r.partId === pr.partId ? { ...r, concern: e.target.value } : r))} />
                </div>
              );
            })}
          </CardContent></Card>
        )}

        {step === 5 && (
          <Card><CardContent className="pt-6 space-y-4">
            <Label>When you access your Self-energy and read this goal, does it still feel true and right?</Label>
            <p className="text-sm italic text-muted-foreground border-l-2 border-primary/30 pl-3">"{statement}"</p>
            <div className="flex gap-2">
              {(['yes', 'mostly', 'not-sure'] as const).map((opt) => (
                <Button key={opt} variant={selfCheck === opt ? 'default' : 'outline'} size="sm" onClick={() => setSelfCheck(opt)}>
                  {opt === 'yes' ? 'Yes' : opt === 'mostly' ? 'Mostly' : 'Not sure'}
                </Button>
              ))}
            </div>
            {selfCheck !== 'yes' && (
              <Textarea value={selfCheckNote} onChange={(e) => setSelfCheckNote(e.target.value)}
                placeholder="What feels off? What would your Self adjust?" className="min-h-[80px]" />
            )}
          </CardContent></Card>
        )}

        <div className="flex justify-between">
          <Button variant="ghost" size="sm" disabled={step === 1} onClick={() => setStep(step - 1)}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          {step < 5 ? (
            <Button size="sm" disabled={step === 1 && !statement.trim()} onClick={() => setStep(step + 1)}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button size="sm" onClick={handleSave}>Save Goal</Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Therapeutic Goals</h2>
        <Button size="sm" className="gap-1" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> New Goal
        </Button>
      </div>

      {therapeuticGoals.length === 0 ? (
        <Card><CardContent className="pt-6 text-center py-12">
          <Target className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No goals yet. Create your first therapeutic goal.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {therapeuticGoals.map((goal) => (
            <Card key={goal.id} className="group">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{goal.statement}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge style={{ backgroundColor: `${TYPE_META[goal.type].color}20`, color: TYPE_META[goal.type].color, borderColor: TYPE_META[goal.type].color }} variant="outline" className="text-[10px]">
                        {TYPE_META[goal.type].label}
                      </Badge>
                      {goal.partReactions.map((pr) => {
                        const p = parts.find((pt) => pt.id === pr.partId);
                        return p && <div key={pr.partId} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.accentColor }} title={p.name} />;
                      })}
                      <span className="text-[10px] text-muted-foreground ml-auto">{format(new Date(goal.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <select className="text-[10px] bg-background border rounded px-1.5 py-1"
                      value={goal.status}
                      onChange={(e) => updateTherapeuticGoal(goal.id, { status: e.target.value as GoalStatus })}>
                      {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={() => deleteTherapeuticGoal(goal.id)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
