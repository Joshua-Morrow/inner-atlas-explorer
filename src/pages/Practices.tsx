import { useState, useEffect, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { usePracticesStore } from '@/lib/practicesStore';
import { useBodyMapStore } from '@/lib/bodyMapStore';
import { practices, Practice, PracticeStep, CATEGORY_LABELS, type PracticeCategory, type Difficulty } from '@/lib/practicesData';
import { useElaborationStore } from '@/lib/elaborationStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Leaf, Star, StarOff, Clock, Play, Pause, X, ChevronRight,
  Heart, History, Sparkles, ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { useSidebar } from '@/components/ui/sidebar';

// ─── Breathing Animation ───
function BreathingGuide({ counts, cycles, onComplete }: {
  counts: { inhale: number; hold: number; exhale: number; holdOut: number };
  cycles: number;
  onComplete: () => void;
}) {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'holdOut'>('inhale');
  const [count, setCount] = useState(counts.inhale);
  const [cycle, setCycle] = useState(1);
  const [active, setActive] = useState(true);

  const totalPhaseTime = counts.inhale + counts.hold + counts.exhale + counts.holdOut;
  const scale = phase === 'inhale' ? 1.4 : phase === 'exhale' ? 0.7 : phase === 'hold' ? 1.4 : 0.7;

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          // next phase
          if (phase === 'inhale') { setPhase('hold'); return counts.hold; }
          if (phase === 'hold') { setPhase('exhale'); return counts.exhale; }
          if (phase === 'exhale') { setPhase('holdOut'); return counts.holdOut; }
          // holdOut done → next cycle
          if (cycle >= cycles) { setActive(false); onComplete(); return 0; }
          setCycle((cy) => cy + 1);
          setPhase('inhale');
          return counts.inhale;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, cycle, active, counts, cycles, onComplete]);

  const phaseLabel = phase === 'inhale' ? 'Breathe In' : phase === 'hold' ? 'Hold' : phase === 'exhale' ? 'Breathe Out' : 'Hold';

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div
        className="rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center transition-all duration-1000 ease-in-out"
        style={{ width: `${scale * 80}px`, height: `${scale * 80}px` }}
      >
        <span className="text-2xl font-bold text-primary">{count}</span>
      </div>
      <p className="text-sm font-medium text-foreground">{phaseLabel}</p>
      <p className="text-xs text-muted-foreground">Cycle {cycle} of {cycles}</p>
      <Button variant="ghost" size="sm" onClick={() => { setActive(false); onComplete(); }}>
        Skip
      </Button>
    </div>
  );
}

// ─── Practice Player ───
function PracticePlayer({ practice, onExit }: { practice: Practice; onExit: () => void }) {
  const parts = useStore((s) => s.parts);
  const {
    currentSession,
    setReflection,
    setSelectedPart,
    pauseSession,
    completeSession,
    cancelSession,
  } = usePracticesStore();
  const { setOpen } = useSidebar();

  const [stepIndex, setStepIndex] = useState(currentSession?.pausedAtStep ?? 0);
  const [started, setStarted] = useState(!!currentSession?.pausedAtStep);
  const [breathDone, setBreathDone] = useState(false);
  const [integrationNote, setIntegrationNote] = useState('');
  const [showIntegration, setShowIntegration] = useState(false);

  useEffect(() => { setOpen(false); return () => setOpen(true); }, [setOpen]);

  const step = practice.steps[stepIndex] as PracticeStep | undefined;
  const progress = ((stepIndex + 1) / practice.steps.length) * 100;
  const reflectionText = currentSession?.reflections[stepIndex] ?? '';

  const canAdvance = useCallback(() => {
    if (!step) return false;
    if (step.type === 'breathing' && !breathDone) return false;
    if (step.type === 'part-selection' && !currentSession?.selectedPartId) return false;
    return true;
  }, [step, breathDone, currentSession?.selectedPartId]);

  const advance = () => {
    if (stepIndex >= practice.steps.length - 1) {
      setShowIntegration(true);
      return;
    }
    setStepIndex((i) => i + 1);
    setBreathDone(false);
  };

  const handleComplete = () => {
    completeSession(integrationNote || undefined);
    onExit();
  };

  if (!started) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, hsl(var(--background)), hsl(var(--muted)))' }}>
        <div className="text-center max-w-md space-y-6 animate-fade-in">
          <Leaf className="h-10 w-10 text-primary mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">{practice.name}</h1>
          <p className="text-muted-foreground">{practice.description}</p>
          <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
            <Badge variant="secondary">{practice.difficulty}</Badge>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{practice.duration} min</span>
          </div>
          <Button size="lg" onClick={() => setStarted(true)} className="gap-2">
            <Play className="h-4 w-4" /> Begin
          </Button>
          <div>
            <Button variant="ghost" size="sm" onClick={() => { cancelSession(); onExit(); }}>
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Library
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showIntegration) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, hsl(var(--background)), hsl(var(--muted)))' }}>
        <div className="max-w-lg w-full space-y-6 animate-fade-in">
          <div className="text-center">
            <Sparkles className="h-8 w-8 text-primary mx-auto mb-3" />
            <h2 className="text-xl font-bold text-foreground">Integration</h2>
            <p className="text-sm text-muted-foreground mt-1">Take a moment before returning to your day.</p>
          </div>
          <Textarea
            placeholder="What did you notice? What do you want to remember?"
            value={integrationNote}
            onChange={(e) => setIntegrationNote(e.target.value)}
            className="min-h-[120px] resize-none"
          />
          <Button className="w-full" onClick={handleComplete}>
            Complete Practice
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, hsl(var(--background)), hsl(var(--muted)))' }}>
      {/* Top bar */}
      <div className="p-4 flex items-center gap-3">
        <span className="text-sm font-medium text-foreground flex-1">{practice.name}</span>
        <span className="text-xs text-muted-foreground">{stepIndex + 1}/{practice.steps.length}</span>
        <Button variant="ghost" size="sm" onClick={() => { pauseSession(stepIndex); onExit(); }}>
          <Pause className="h-3.5 w-3.5 mr-1" /> Pause
        </Button>
        <Button variant="ghost" size="sm" onClick={() => { setShowIntegration(true); }}>
          End Early
        </Button>
      </div>
      <Progress value={progress} className="h-1 mx-4 rounded-full" />

      {/* Step content */}
      <div className="flex-1 flex items-center justify-center p-6">
        {step && (
          <div className="max-w-lg w-full animate-fade-in" key={stepIndex}>
            {step.type === 'reading' && (
              <div className="space-y-6 text-center">
                <p className="text-lg leading-relaxed text-foreground">{step.text}</p>
              </div>
            )}

            {step.type === 'pause' && (
              <div className="space-y-6 text-center">
                <div className="flex justify-center">
                  <div className="w-4 h-4 rounded-full bg-primary/50 animate-pulse" />
                </div>
                <p className="text-lg leading-relaxed text-foreground">{step.text}</p>
                <p className="text-xs text-muted-foreground">Continue when you're ready.</p>
              </div>
            )}

            {step.type === 'breathing' && (
              <div className="space-y-4 text-center">
                <p className="text-base text-foreground mb-4">{step.text}</p>
                {!breathDone ? (
                  <BreathingGuide
                    counts={step.breathCounts!}
                    cycles={step.cycles!}
                    onComplete={() => setBreathDone(true)}
                  />
                ) : (
                  <p className="text-sm text-primary font-medium">✓ Breathing complete</p>
                )}
              </div>
            )}

            {step.type === 'reflection' && (
              <div className="space-y-4">
                <p className="text-lg leading-relaxed text-foreground text-center">{step.text}</p>
                <Textarea
                  placeholder={step.reflectionPrompt || 'Write your reflection...'}
                  value={reflectionText}
                  onChange={(e) => setReflection(stepIndex, e.target.value)}
                  className="min-h-[100px] resize-none"
                />
                <p className="text-xs text-muted-foreground text-center">Optional but encouraged.</p>
              </div>
            )}

            {step.type === 'body-awareness' && (
              <div className="space-y-4 text-center">
                <p className="text-lg leading-relaxed text-foreground">{step.text}</p>
                <div className="mx-auto w-40">
                  <svg viewBox="0 0 100 100" className="w-full">
                    <path
                      d="M 50 8 C 44 8 40 12 40 18 C 40 24 44 28 50 28 C 56 28 60 24 60 18 C 60 12 56 8 50 8 Z M 50 28 L 50 30 C 42 32 35 36 33 44 L 28 62 C 27 65 29 67 31 66 L 38 52 L 38 70 L 36 92 C 36 95 39 96 40 93 L 50 72 L 60 93 C 61 96 64 95 64 92 L 62 70 L 62 52 L 69 66 C 71 67 73 65 72 62 L 67 44 C 65 36 58 32 50 30 Z"
                      fill="hsl(var(--muted))"
                      stroke="hsl(var(--muted-foreground) / 0.4)"
                      strokeWidth="0.8"
                    />
                  </svg>
                </div>
                <p className="text-xs text-muted-foreground">Notice the location, then continue.</p>
              </div>
            )}

            {step.type === 'part-selection' && (
              <div className="space-y-4 text-center">
                <p className="text-lg leading-relaxed text-foreground">{step.text}</p>
                <div className="max-w-xs mx-auto">
                  <Select value={currentSession?.selectedPartId || ''} onValueChange={setSelectedPart}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a part..." />
                    </SelectTrigger>
                    <SelectContent>
                      {parts.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom advance */}
      <div className="p-6 flex justify-center">
        <Button onClick={advance} disabled={!canAdvance()} size="lg" className="gap-2 min-w-[200px]">
          Continue <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Difficulty badge color helper ───
function difficultyClass(d: Difficulty) {
  if (d === 'Gentle') return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20';
  if (d === 'Moderate') return 'bg-amber-500/10 text-amber-700 border-amber-500/20';
  return 'bg-rose-500/10 text-rose-700 border-rose-500/20';
}

// ─── Main Practices Page ───
export default function Practices() {
  const parts = useStore((s) => s.parts);
  const { isPartElaborated } = useElaborationStore();
  const {
    sessions,
    favorites,
    currentSession,
    startSession,
    resumeSession,
    toggleFavorite,
  } = usePracticesStore();

  const [activePractice, setActivePractice] = useState<Practice | null>(null);
  const [tab, setTab] = useState('library');
  const [categoryFilter, setCategoryFilter] = useState<PracticeCategory | 'all'>('all');

  // Generate dynamic parts-specific practices
  const partsSpecificPractices: Practice[] = parts
    .filter((p) => isPartElaborated(p.id))
    .map((part) => ({
      id: `parts-${part.id}`,
      name: `${part.name} Dialogue`,
      category: 'parts-specific' as PracticeCategory,
      duration: 10,
      difficulty: 'Moderate' as Difficulty,
      description: `A personalized listening practice for your ${part.type.toLowerCase()} part "${part.name}".`,
      requiresPartSelection: false,
      steps: [
        { type: 'breathing' as const, text: 'Settle in.', breathCounts: { inhale: 4, hold: 3, exhale: 5, holdOut: 2 }, cycles: 3 },
        { type: 'reading' as const, text: `Turn your attention inward and find ${part.name}. This is your ${part.type.toLowerCase()} — ${part.description}` },
        { type: 'body-awareness' as const, text: `Where do you feel ${part.name} in your body right now?` },
        { type: 'reading' as const, text: `Say to ${part.name}: "I see you. I'm here and I want to listen."` },
        { type: 'pause' as const, text: `Wait. Let ${part.name} respond in its own way — a feeling, an image, a word.` },
        { type: 'reflection' as const, text: `What does ${part.name} want you to know right now?`, reflectionPrompt: `${part.name} wants me to know...` },
        { type: 'reflection' as const, text: `What does ${part.name} need from you?`, reflectionPrompt: `${part.name} needs...` },
        { type: 'reading' as const, text: `Thank ${part.name} for sharing. "I appreciate you and what you do for me."` },
        { type: 'pause' as const, text: 'Let the practice settle.' },
      ],
    }));

  const allPractices = [...practices, ...partsSpecificPractices];

  const filteredPractices = categoryFilter === 'all'
    ? allPractices
    : allPractices.filter((p) => p.category === categoryFilter);

  const favoritePractices = allPractices.filter((p) => favorites.includes(p.id));

  const completedSessions = sessions.filter((s) => s.completedAt).sort((a, b) =>
    new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
  );

  const pausedSessions = sessions.filter((s) => s.pausedAtStep !== undefined && !s.completedAt);

  // Handle starting/resuming
  const handleStart = (practice: Practice) => {
    startSession(practice.id);
    setActivePractice(practice);
  };

  const handleResume = (sessionId: string) => {
    resumeSession(sessionId);
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      const p = allPractices.find((pr) => pr.id === session.practiceId);
      if (p) setActivePractice(p);
    }
  };

  // Player mode
  if (activePractice && currentSession) {
    return <PracticePlayer practice={activePractice} onExit={() => setActivePractice(null)} />;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Guided Practices</h1>
        <p className="text-muted-foreground">Interactive IFS exercises — breathing, visualizations, unblending, and more.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="library"><Leaf className="h-3.5 w-3.5 mr-1" />Library</TabsTrigger>
          <TabsTrigger value="history"><History className="h-3.5 w-3.5 mr-1" />My History</TabsTrigger>
        </TabsList>

        {/* ═══ LIBRARY ═══ */}
        <TabsContent value="library" className="space-y-6">
          {/* Paused sessions */}
          {pausedSessions.length > 0 && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><Pause className="h-4 w-4" /> Paused Practices</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {pausedSessions.map((s) => {
                  const p = allPractices.find((pr) => pr.id === s.practiceId);
                  return (
                    <div key={s.id} className="flex items-center gap-3">
                      <span className="text-sm">{p?.name || s.practiceId}</span>
                      <Badge variant="outline" className="text-[10px]">Step {(s.pausedAtStep || 0) + 1}</Badge>
                      <Button size="sm" variant="outline" className="ml-auto" onClick={() => handleResume(s.id)}>
                        Resume
                      </Button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Favorites */}
          {favoritePractices.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5 mb-3">
                <Star className="h-3.5 w-3.5" /> Favorites
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {favoritePractices.map((p) => (
                  <PracticeCard
                    key={p.id}
                    practice={p}
                    isFavorite
                    onStart={() => handleStart(p)}
                    onToggleFavorite={() => toggleFavorite(p.id)}
                    parts={parts}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Category filter */}
          <div className="flex flex-wrap gap-1.5">
            <Button
              size="sm"
              variant={categoryFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setCategoryFilter('all')}
              className="text-xs h-7"
            >
              All
            </Button>
            {(Object.keys(CATEGORY_LABELS) as PracticeCategory[]).map((cat) => {
              const count = allPractices.filter((p) => p.category === cat).length;
              if (count === 0) return null;
              return (
                <Button
                  key={cat}
                  size="sm"
                  variant={categoryFilter === cat ? 'default' : 'outline'}
                  onClick={() => setCategoryFilter(cat)}
                  className="text-xs h-7"
                >
                  {CATEGORY_LABELS[cat]} ({count})
                </Button>
              );
            })}
          </div>

          {/* Practice grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPractices.map((p) => (
              <PracticeCard
                key={p.id}
                practice={p}
                isFavorite={favorites.includes(p.id)}
                onStart={() => handleStart(p)}
                onToggleFavorite={() => toggleFavorite(p.id)}
                parts={parts}
              />
            ))}
          </div>

          {filteredPractices.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground text-sm">
                {categoryFilter === 'parts-specific'
                  ? 'Elaborate your parts in the Elaboration feature to unlock personalized practices.'
                  : 'No practices in this category yet.'}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ═══ HISTORY ═══ */}
        <TabsContent value="history" className="space-y-4">
          {completedSessions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground text-sm">
                Complete a practice to see your history here.
              </CardContent>
            </Card>
          ) : (
            completedSessions.map((s) => {
              const p = allPractices.find((pr) => pr.id === s.practiceId);
              return (
                <Card key={s.id}>
                  <CardContent className="py-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{p?.name || s.practiceId}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(s.completedAt!), 'MMM d, yyyy · h:mm a')}
                        </p>
                        {s.integrationNote && (
                          <p className="text-sm text-foreground mt-2 bg-muted/50 rounded-md p-2">{s.integrationNote}</p>
                        )}
                      </div>
                      {p && (
                        <Badge variant="outline" className="text-[10px]">
                          {CATEGORY_LABELS[p.category]}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Practice Card ───
function PracticeCard({ practice, isFavorite, onStart, onToggleFavorite, parts }: {
  practice: Practice;
  isFavorite: boolean;
  onStart: () => void;
  onToggleFavorite: () => void;
  parts: { id: string }[];
}) {
  const meetsRequirement = !practice.minPartsRequired || parts.length >= practice.minPartsRequired;

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="pt-5 pb-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-foreground leading-tight">{practice.name}</h3>
            <Badge variant="outline" className="text-[9px] mt-1">{CATEGORY_LABELS[practice.category]}</Badge>
          </div>
          <button onClick={onToggleFavorite} className="text-muted-foreground hover:text-primary transition-colors">
            {isFavorite ? <Star className="h-4 w-4 fill-primary text-primary" /> : <StarOff className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{practice.description}</p>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={`text-[10px] border ${difficultyClass(practice.difficulty)}`}>
            {practice.difficulty}
          </Badge>
          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
            <Clock className="h-3 w-3" /> {practice.duration} min
          </span>
        </div>
        <Button
          size="sm"
          className="w-full mt-1"
          onClick={onStart}
          disabled={!meetsRequirement}
        >
          {!meetsRequirement
            ? `Requires ${practice.minPartsRequired}+ parts`
            : 'Start Practice'}
        </Button>
      </CardContent>
    </Card>
  );
}
