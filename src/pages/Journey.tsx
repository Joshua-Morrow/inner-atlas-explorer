import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { useJourneyStore, TimelineEvent, TimelineEventType, SystemSnapshot, MILESTONES, MilestoneTier, type MilestoneDef } from '@/lib/journeyStore';
import { useElaborationStore } from '@/lib/elaborationStore';
import { useTrailheadStore } from '@/lib/trailheadStore';
import { usePracticesStore } from '@/lib/practicesStore';
import { useBodyMapStore } from '@/lib/bodyMapStore';
import { useClarityStore } from '@/lib/clarityStore';
import { useSelfEnergyStore } from '@/lib/selfEnergyStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Mountain, Calendar, TrendingUp, Trophy, Plus, Search, Lock, Unlock,
  Star, Camera, ArrowUpRight, ArrowDownRight, Minus, PenLine
} from 'lucide-react';
import { format, subDays, isAfter } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const EVENT_COLORS: Record<TimelineEventType, string> = {
  'part-added': 'border-l-[hsl(var(--ifs-manager))]',
  'part-elaborated': 'border-l-[hsl(var(--ifs-manager))]',
  'part-refined': 'border-l-[hsl(var(--ifs-manager))]',
  'update-logged': 'border-l-amber-500',
  'trail-started': 'border-l-violet-500',
  'trail-completed': 'border-l-violet-500',
  'exile-discovered': 'border-l-violet-500',
  'dialogue-recorded': 'border-l-emerald-500',
  'self-energy-checkin': 'border-l-yellow-500',
  'assessment-completed': 'border-l-yellow-500',
  'clarity-event': 'border-l-teal-500',
  'practice-completed': 'border-l-rose-400',
  'body-checkin': 'border-l-rose-400',
  'journal-entry': 'border-l-yellow-400',
  'snapshot-created': 'border-l-primary',
};

const EVENT_LABELS: Record<TimelineEventType, string> = {
  'part-added': 'Part Added',
  'part-elaborated': 'Elaboration',
  'part-refined': 'Refinement',
  'update-logged': 'Update',
  'trail-started': 'Trail Started',
  'trail-completed': 'Trail Completed',
  'exile-discovered': 'Exile Found',
  'dialogue-recorded': 'Dialogue',
  'self-energy-checkin': 'Self-Energy',
  'assessment-completed': 'Assessment',
  'clarity-event': 'Clarity',
  'practice-completed': 'Practice',
  'body-checkin': 'Body Check-In',
  'journal-entry': 'Journal',
  'snapshot-created': 'Snapshot',
};

const TIER_LABELS: Record<MilestoneTier, string> = {
  foundation: 'Foundation',
  explorer: 'Explorer',
  depth: 'Depth Work',
  integration: 'Integration',
};

const TIER_COLORS: Record<MilestoneTier, string> = {
  foundation: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  explorer: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  depth: 'bg-violet-500/10 text-violet-700 border-violet-500/20',
  integration: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
};

// ─── Timeline View ───
function TimelineView() {
  const { events, journals, addJournal } = useJourneyStore();
  const parts = useStore((s) => s.parts);
  const [range, setRange] = useState<'7' | '30' | '90' | 'all'>('30');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TimelineEventType | 'all'>('all');
  const [journalOpen, setJournalOpen] = useState(false);
  const [journalText, setJournalText] = useState('');

  const cutoff = range === 'all' ? null : subDays(new Date(), Number(range));
  const filtered = useMemo(() => {
    return [...events]
      .filter((e) => !cutoff || isAfter(new Date(e.date), cutoff))
      .filter((e) => typeFilter === 'all' || e.type === typeFilter)
      .filter((e) => !search || e.summary.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [events, cutoff, typeFilter, search]);

  const saveJournal = () => {
    if (!journalText.trim()) return;
    addJournal({ text: journalText, partIds: [], tags: [] });
    setJournalText('');
    setJournalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center">
        <Select value={range} onValueChange={(v) => setRange(v as any)}>
          <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
          <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {Object.entries(EVENT_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative flex-1 min-w-[150px]">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-8 text-xs pl-7" />
        </div>
        <Dialog open={journalOpen} onOpenChange={setJournalOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><PenLine className="h-3.5 w-3.5" /> Add Reflection</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Journal Reflection</DialogTitle></DialogHeader>
            <Textarea placeholder="Write about your experience..." value={journalText} onChange={(e) => setJournalText(e.target.value)} className="min-h-[120px]" />
            <Button onClick={saveJournal} disabled={!journalText.trim()}>Save Entry</Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* Today marker */}
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]" />
        <span className="text-xs font-medium text-primary">Today — {format(new Date(), 'MMM d, yyyy')}</span>
      </div>

      {/* Events */}
      {filtered.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">No events in this range. Start using the app to build your timeline.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((ev) => (
            <Card key={ev.id} className={`border-l-4 ${EVENT_COLORS[ev.type] || 'border-l-muted'}`}>
              <CardContent className="py-3 flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[9px]">{EVENT_LABELS[ev.type]}</Badge>
                    <span className="text-[10px] text-muted-foreground">{format(new Date(ev.date), 'MMM d, h:mm a')}</span>
                  </div>
                  <p className="text-sm mt-1">{ev.summary}</p>
                </div>
                {ev.linkTo && (
                  <Button variant="ghost" size="sm" className="text-xs" asChild>
                    <a href={ev.linkTo}>View</a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── System Evolution View ───
function SystemEvolutionView() {
  const parts = useStore((s) => s.parts);
  const dialogues = useStore((s) => s.dialogues);
  const { snapshots, addSnapshot, events } = useJourneyStore();
  const { isPartElaborated } = useElaborationStore();
  const trails = useTrailheadStore((s) => s.trails);
  const practicesSessions = usePracticesStore((s) => s.sessions);
  const [compareA, setCompareA] = useState<string | null>(null);
  const [compareB, setCompareB] = useState<string | null>(null);

  const completedTrails = trails.filter((t) => t.status === 'completed');
  const completedPractices = practicesSessions.filter((s) => s.completedAt);
  const elaboratedCount = parts.filter((p) => isPartElaborated(p.id)).length;

  const createSnapshot = () => {
    addSnapshot({
      partCount: parts.length,
      managerCount: parts.filter((p) => p.type === 'Manager').length,
      firefighterCount: parts.filter((p) => p.type === 'Firefighter').length,
      exileCount: parts.filter((p) => p.type === 'Exile').length,
      selfEnergyAvg: 70, // placeholder
      elaboratedCount,
      trailsCompleted: completedTrails.length,
      dialogueCount: dialogues.length,
      practiceCount: completedPractices.length,
    });
  };

  const snapA = snapshots.find((s) => s.id === compareA);
  const snapB = snapshots.find((s) => s.id === compareB);

  // Build simple trend data from events
  const trendData = useMemo(() => {
    const dayMap: Record<string, { parts: number; trails: number; dialogues: number; practices: number; updates: number }> = {};
    let pc = 0, tc = 0, dc = 0, prc = 0, uc = 0;
    const sorted = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    sorted.forEach((e) => {
      const day = format(new Date(e.date), 'MMM d');
      if (e.type === 'part-added') pc++;
      if (e.type === 'trail-completed') tc++;
      if (e.type === 'dialogue-recorded') dc++;
      if (e.type === 'practice-completed') prc++;
      if (e.type === 'update-logged') uc++;
      dayMap[day] = { parts: pc, trails: tc, dialogues: dc, practices: prc, updates: uc };
    });
    return Object.entries(dayMap).map(([day, d]) => ({ day, ...d }));
  }, [events]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">System Snapshots</h2>
        <Button size="sm" onClick={createSnapshot} className="gap-1"><Camera className="h-3.5 w-3.5" /> Save Snapshot</Button>
      </div>

      {snapshots.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">No snapshots yet. Save your first system snapshot to start tracking evolution.</CardContent></Card>
      ) : (
        <>
          <ScrollArea className="w-full">
            <div className="flex gap-3 pb-2">
              {snapshots.map((snap) => (
                <Card
                  key={snap.id}
                  className={`min-w-[160px] cursor-pointer transition-all ${
                    compareA === snap.id || compareB === snap.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => {
                    if (!compareA) setCompareA(snap.id);
                    else if (!compareB && snap.id !== compareA) setCompareB(snap.id);
                    else { setCompareA(snap.id); setCompareB(null); }
                  }}
                >
                  <CardContent className="py-3 text-center">
                    <p className="text-xs font-medium">{format(new Date(snap.date), 'MMM d, yyyy')}</p>
                    <p className="text-2xl font-bold text-primary mt-1">{snap.partCount}</p>
                    <p className="text-[10px] text-muted-foreground">parts</p>
                    <div className="flex justify-center gap-1 mt-2">
                      <span className="text-[9px] px-1 rounded bg-[hsl(var(--ifs-manager)/0.2)] text-[hsl(var(--ifs-manager))]">{snap.managerCount}M</span>
                      <span className="text-[9px] px-1 rounded bg-[hsl(var(--ifs-firefighter)/0.2)] text-[hsl(var(--ifs-firefighter))]">{snap.firefighterCount}F</span>
                      <span className="text-[9px] px-1 rounded bg-[hsl(var(--ifs-exile)/0.2)] text-[hsl(var(--ifs-exile))]">{snap.exileCount}E</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>

          {/* Comparison */}
          {snapA && snapB && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Comparison</CardTitle>
                <CardDescription className="text-xs">
                  {format(new Date(snapA.date), 'MMM d')} → {format(new Date(snapB.date), 'MMM d')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <CompareMetric label="Parts" a={snapA.partCount} b={snapB.partCount} />
                  <CompareMetric label="Elaborated" a={snapA.elaboratedCount} b={snapB.elaboratedCount} />
                  <CompareMetric label="Trails" a={snapA.trailsCompleted} b={snapB.trailsCompleted} />
                  <CompareMetric label="Dialogues" a={snapA.dialogueCount} b={snapB.dialogueCount} />
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Since {format(new Date(snapA.date), 'MMM d')}: {snapB.partCount - snapA.partCount >= 0 ? '+' : ''}{snapB.partCount - snapA.partCount} parts, {snapB.elaboratedCount - snapA.elaboratedCount >= 0 ? '+' : ''}{snapB.elaboratedCount - snapA.elaboratedCount} elaborated, {snapB.trailsCompleted - snapA.trailsCompleted >= 0 ? '+' : ''}{snapB.trailsCompleted - snapA.trailsCompleted} trails.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Trend metrics */}
      <h2 className="text-lg font-semibold">System Metrics</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard label="Total Parts" value={parts.length} />
        <MetricCard label="Elaborated" value={elaboratedCount} />
        <MetricCard label="Trails Done" value={completedTrails.length} />
        <MetricCard label="Dialogues" value={dialogues.length} />
        <MetricCard label="Practices" value={completedPractices.length} />
        <MetricCard label="Updates" value={events.filter((e) => e.type === 'update-logged').length} />
      </div>

      {trendData.length > 2 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Cumulative Activity</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="parts" stroke="hsl(var(--ifs-manager))" strokeWidth={2} dot={false} name="Parts" />
                <Line type="monotone" dataKey="trails" stroke="hsl(270,50%,60%)" strokeWidth={2} dot={false} name="Trails" />
                <Line type="monotone" dataKey="practices" stroke="hsl(340,50%,55%)" strokeWidth={2} dot={false} name="Practices" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CompareMetric({ label, a, b }: { label: string; a: number; b: number }) {
  const diff = b - a;
  return (
    <div className="text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex items-center justify-center gap-1 mt-1">
        <span className="text-lg font-bold">{b}</span>
        {diff !== 0 && (
          <span className={`flex items-center text-xs ${diff > 0 ? 'text-emerald-600' : 'text-destructive'}`}>
            {diff > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(diff)}
          </span>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="py-4 text-center">
        <p className="text-2xl font-bold text-primary">{value}</p>
        <p className="text-[10px] text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

// ─── Milestones View ───
function MilestonesView() {
  const { earnedMilestones } = useJourneyStore();
  const earned = new Set(earnedMilestones.map((m) => m.milestoneId));
  const totalEarned = earnedMilestones.length;
  const totalPossible = MILESTONES.length;
  const pct = totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0;

  const tiers: MilestoneTier[] = ['foundation', 'explorer', 'depth', 'integration'];

  return (
    <div className="space-y-6">
      {/* Progress ring summary */}
      <Card>
        <CardContent className="py-6 flex items-center gap-6">
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
              <circle cx="18" cy="18" r="16" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="16" fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="3"
                strokeDasharray={`${(pct / 100) * 100.53} 100.53`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">{totalEarned}/{totalPossible}</span>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Milestones Earned</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {tiers.map((t) => {
                const count = MILESTONES.filter((m) => m.tier === t && earned.has(m.id)).length;
                const total = MILESTONES.filter((m) => m.tier === t).length;
                return `${TIER_LABELS[t]}: ${count}/${total}`;
              }).join(' · ')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tier sections */}
      {tiers.map((tier) => {
        const milestones = MILESTONES.filter((m) => m.tier === tier);
        return (
          <div key={tier}>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Badge variant="outline" className={`text-[10px] border ${TIER_COLORS[tier]}`}>{TIER_LABELS[tier]}</Badge>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {milestones.map((m) => {
                const isEarned = earned.has(m.id);
                const earnedData = earnedMilestones.find((em) => em.milestoneId === m.id);
                return (
                  <Card key={m.id} className={`transition-all ${isEarned ? 'bg-card' : 'bg-muted/30 opacity-60'}`}>
                    <CardContent className="py-4 flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isEarned ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        {isEarned ? (
                          <Unlock className="h-4 w-4 text-primary" />
                        ) : (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isEarned ? 'text-foreground' : 'text-muted-foreground'}`}>{m.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>
                        {earnedData && (
                          <p className="text-[10px] text-primary mt-1">{format(new Date(earnedData.earnedAt), 'MMM d, yyyy')}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ───
export default function Journey() {
  const [tab, setTab] = useState('timeline');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">My Journey</h1>
        <p className="text-muted-foreground">See how your inner work has unfolded over time.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="timeline"><Calendar className="h-3.5 w-3.5 mr-1" />Timeline</TabsTrigger>
          <TabsTrigger value="evolution"><TrendingUp className="h-3.5 w-3.5 mr-1" />System Evolution</TabsTrigger>
          <TabsTrigger value="milestones"><Trophy className="h-3.5 w-3.5 mr-1" />Milestones</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline"><TimelineView /></TabsContent>
        <TabsContent value="evolution"><SystemEvolutionView /></TabsContent>
        <TabsContent value="milestones"><MilestonesView /></TabsContent>
      </Tabs>
    </div>
  );
}
