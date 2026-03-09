import { useState } from 'react';
import { useCouplesStore, CONVERSATION_FRAMEWORKS, TRIGGER_OPTIONS, ConversationType, CouplesCheckIn } from '@/lib/couplesStore';
import { useStore } from '@/lib/store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Heart, Users, Link2, Unlink, MessageCircle, Thermometer, BookOpen,
  ChevronRight, ChevronLeft, Check, Play, Pause, Wind,
  Shield, ArrowRight, CircleDot, Sparkles, Map as MapIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const TEMP_LABELS: Record<CouplesCheckIn['temperature'], string> = {
  'disconnected': 'Disconnected',
  'distant': 'Distant',
  'neutral': 'Neutral',
  'connected': 'Connected',
  'deeply-connected': 'Deeply Connected',
};

const TEMP_COLORS: Record<CouplesCheckIn['temperature'], string> = {
  'disconnected': 'bg-destructive/20 text-destructive',
  'distant': 'hsl(var(--ifs-firefighter))',
  'neutral': 'bg-muted text-muted-foreground',
  'connected': 'bg-primary/20 text-primary',
  'deeply-connected': 'bg-primary text-primary-foreground',
};

export default function CouplesConnection() {
  const store = useCouplesStore();
  const parts = useStore((s) => s.parts);
  const [mainTab, setMainTab] = useState(store.setupComplete ? 'home' : 'setup');

  if (!store.setupComplete) {
    return <SetupView />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-primary">Couples Connection</h1>
            <Badge variant="outline" className="text-xs gap-1">
              <Link2 className="h-3 w-3" /> Active
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {store.partnerA.name} & {store.partnerB.name} — working with your parts together.
          </p>
        </div>
        <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => { if (confirm('Disconnect from your partner? All shared data will be cleared.')) store.disconnect(); }}>
          <Unlink className="h-3 w-3 mr-1" /> Disconnect
        </Button>
      </div>

      <Tabs value={mainTab} onValueChange={setMainTab}>
        <TabsList className="w-full grid grid-cols-6">
          <TabsTrigger value="home" className="text-xs">Home</TabsTrigger>
          <TabsTrigger value="assessment" className="text-xs">Assessment</TabsTrigger>
          <TabsTrigger value="map" className="text-xs">Rel. Map</TabsTrigger>
          <TabsTrigger value="conversations" className="text-xs">Conversations</TabsTrigger>
          <TabsTrigger value="checkins" className="text-xs">Check-ins</TabsTrigger>
          <TabsTrigger value="resources" className="text-xs">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="home"><HomeView /></TabsContent>
        <TabsContent value="assessment"><AssessmentView /></TabsContent>
        <TabsContent value="map"><RelationshipMapView /></TabsContent>
        <TabsContent value="conversations"><ConversationsView /></TabsContent>
        <TabsContent value="checkins"><CheckInsView /></TabsContent>
        <TabsContent value="resources"><ResourcesView /></TabsContent>
      </Tabs>
    </div>
  );
}

// ─── SETUP ───

function SetupView() {
  const { connectPartner } = useCouplesStore();
  const [nameA, setNameA] = useState('');
  const [nameB, setNameB] = useState('');
  const [step, setStep] = useState(0);

  return (
    <div className="max-w-2xl mx-auto py-12 space-y-8">
      <div className="text-center space-y-3">
        <Heart className="h-12 w-12 text-primary mx-auto" />
        <h1 className="text-3xl font-bold text-primary">Couples Connection</h1>
        <p className="text-muted-foreground">Explore your relationship through IFS — together.</p>
      </div>

      {step === 0 && (
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
              <p className="font-medium">🔒 Privacy First</p>
              <ul className="space-y-1 text-muted-foreground text-xs">
                <li>• Your individual parts, profiles, and maps remain <strong>private</strong> unless you choose to share</li>
                <li>• Your partner cannot see your personal parts work unless explicitly shared</li>
                <li>• Either partner can disconnect at any time</li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              In this demo mode, you'll simulate both partners to explore how the Couples Connection feature works.
            </p>
            <Button className="w-full gap-2" onClick={() => setStep(1)}>
              <Users className="h-4 w-4" /> Get Started
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Name Your Partners</CardTitle>
            <CardDescription>In demo mode, you'll play both roles.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Partner A</Label>
                <Input value={nameA} onChange={(e) => setNameA(e.target.value)} placeholder="e.g., Alex" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Partner B</Label>
                <Input value={nameB} onChange={(e) => setNameB(e.target.value)} placeholder="e.g., Jordan" className="mt-1" />
              </div>
            </div>
            <Button
              className="w-full gap-2"
              disabled={!nameA.trim() || !nameB.trim()}
              onClick={() => connectPartner(nameA.trim(), nameB.trim())}
            >
              <Link2 className="h-4 w-4" /> Connect Partners
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── HOME ───

function HomeView() {
  const { partnerA, partnerB, isAssessmentComplete, conversations, checkIns } = useCouplesStore();
  const assessmentDone = isAssessmentComplete();
  const completedConvos = conversations.filter((c) => c.completedAt).length;

  return (
    <div className="space-y-6 mt-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ backgroundColor: 'hsl(210, 70%, 90%)' }}>
              <span className="text-xl font-bold" style={{ color: 'hsl(210, 70%, 40%)' }}>{partnerA.name.charAt(0)}</span>
            </div>
            <p className="font-medium mt-2">{partnerA.name}</p>
            <p className="text-xs text-muted-foreground">Partner A</p>
          </CardContent>
        </Card>
        <Card className="flex items-center justify-center">
          <CardContent className="pt-6 text-center">
            <Heart className="h-8 w-8 text-primary mx-auto" />
            <p className="text-xs text-muted-foreground mt-2">{completedConvos} conversations · {checkIns.length} check-ins</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ backgroundColor: 'hsl(15, 70%, 90%)' }}>
              <span className="text-xl font-bold" style={{ color: 'hsl(15, 70%, 40%)' }}>{partnerB.name.charAt(0)}</span>
            </div>
            <p className="font-medium mt-2">{partnerB.name}</p>
            <p className="text-xs text-muted-foreground">Partner B</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { done: assessmentDone, label: 'Complete the Relationship Assessment', tab: 'assessment' },
              { done: completedConvos > 0, label: 'Have your first Guided Conversation', tab: 'conversations' },
              { done: checkIns.length > 0, label: 'Do a Couples Check-In', tab: 'checkins' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${item.done ? 'bg-primary' : 'border-2 border-muted-foreground/30'}`}>
                  {item.done && <Check className="h-3 w-3 text-primary-foreground" />}
                </div>
                <span className={item.done ? 'text-muted-foreground line-through' : ''}>{item.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── ASSESSMENT ───

function AssessmentView() {
  const { partnerA, partnerB, assessments, submitAssessment, isAssessmentComplete } = useCouplesStore();
  const parts = useStore((s) => s.parts);
  const [activePartner, setActivePartner] = useState<'A' | 'B'>('A');
  const existingA = assessments.find((a) => a.partner === 'A');
  const existingB = assessments.find((a) => a.partner === 'B');

  const [patterns, setPatterns] = useState('');
  const [activeParts, setActiveParts] = useState<string[]>([]);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [selfEnergy, setSelfEnergy] = useState(5);
  const [values, setValues] = useState('');
  const [growth, setGrowth] = useState('');

  const handleSubmit = () => {
    submitAssessment({ partner: activePartner, patterns, activeParts, triggers, selfEnergyDuringConflict: selfEnergy, values, growthAreas: growth });
    setPatterns(''); setActiveParts([]); setTriggers([]); setSelfEnergy(5); setValues(''); setGrowth('');
  };

  const done = isAssessmentComplete();

  if (done) {
    return (
      <div className="space-y-6 mt-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Relationship System Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              {[{ data: existingA!, label: partnerA.name, color: 'hsl(210, 70%, 40%)' }, { data: existingB!, label: partnerB.name, color: 'hsl(15, 70%, 40%)' }].map(({ data, label, color }) => (
                <div key={label} className="space-y-3">
                  <h3 className="font-semibold text-sm" style={{ color }}>{label}</h3>
                  <div>
                    <p className="text-xs text-muted-foreground">Active Parts</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {data.activeParts.map((p) => {
                        const found = parts.find((pt) => pt.id === p);
                        return <Badge key={p} variant="outline" className="text-[10px]">{found?.name || p}</Badge>;
                      })}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Self-Energy During Conflict</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-2 rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${data.selfEnergyDuringConflict * 10}%` }} />
                      </div>
                      <span className="text-xs font-medium">{data.selfEnergyDuringConflict}/10</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Patterns</p>
                    <p className="text-xs mt-1">{data.patterns}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Values</p>
                    <p className="text-xs mt-1">{data.values}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Growth Areas</p>
                    <p className="text-xs mt-1">{data.growthAreas}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 border-t pt-4">
              <h4 className="text-sm font-medium mb-2">Common Triggers</h4>
              <div className="flex flex-wrap gap-1">
                {[...new Set([...(existingA?.triggers || []), ...(existingB?.triggers || [])])].map((t) => {
                  const shared = existingA?.triggers.includes(t) && existingB?.triggers.includes(t);
                  return <Badge key={t} variant={shared ? 'default' : 'outline'} className="text-[10px]">{t} {shared && '(shared)'}</Badge>;
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="flex gap-2">
        <Button variant={activePartner === 'A' ? 'default' : 'outline'} size="sm" onClick={() => setActivePartner('A')} className="gap-1">
          {partnerA.name} {existingA && <Check className="h-3 w-3" />}
        </Button>
        <Button variant={activePartner === 'B' ? 'default' : 'outline'} size="sm" onClick={() => setActivePartner('B')} className="gap-1">
          {partnerB.name} {existingB && <Check className="h-3 w-3" />}
        </Button>
      </div>

      {((activePartner === 'A' && existingA) || (activePartner === 'B' && existingB)) ? (
        <Card><CardContent className="pt-6 text-center"><Check className="h-8 w-8 text-primary mx-auto" /><p className="mt-2 text-sm">{activePartner === 'A' ? partnerA.name : partnerB.name} has completed their assessment.</p></CardContent></Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{activePartner === 'A' ? partnerA.name : partnerB.name}'s Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label>What recurring patterns do you notice in your relationship?</Label>
              <Textarea value={patterns} onChange={(e) => setPatterns(e.target.value)} className="mt-1" placeholder="Describe patterns you notice..." />
            </div>
            <div>
              <Label>Which parts get activated most in your relationship?</Label>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {parts.map((p) => (
                  <button key={p.id} className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${activeParts.includes(p.id) ? 'bg-primary text-primary-foreground border-primary' : 'border-input hover:bg-muted/50'}`}
                    onClick={() => setActiveParts((prev) => prev.includes(p.id) ? prev.filter((x) => x !== p.id) : [...prev, p.id])}>
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>What triggers activate your parts during interactions?</Label>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {TRIGGER_OPTIONS.map((t) => (
                  <button key={t} className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${triggers.includes(t) ? 'bg-primary text-primary-foreground border-primary' : 'border-input hover:bg-muted/50'}`}
                    onClick={() => setTriggers((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>How easy is it to access Self-energy during disagreements? ({selfEnergy}/10)</Label>
              <Slider value={[selfEnergy]} onValueChange={([v]) => setSelfEnergy(v)} min={1} max={10} step={1} className="mt-2" />
            </div>
            <div>
              <Label>What do you most value about your relationship?</Label>
              <Textarea value={values} onChange={(e) => setValues(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>What do you most want to grow or change?</Label>
              <Textarea value={growth} onChange={(e) => setGrowth(e.target.value)} className="mt-1" />
            </div>
            <Button className="w-full" disabled={!patterns.trim()} onClick={handleSubmit}>
              Submit {activePartner === 'A' ? partnerA.name : partnerB.name}'s Assessment
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── RELATIONSHIP MAP ───

function RelationshipMapView() {
  const { partnerA, partnerB, sharedParts, connections, addSharedPart, removeSharedPart, addConnection, deleteConnection } = useCouplesStore();
  const parts = useStore((s) => s.parts);
  const [showAddConn, setShowAddConn] = useState(false);
  const [connSource, setConnSource] = useState('');
  const [connTarget, setConnTarget] = useState('');
  const [connType, setConnType] = useState<'harmonious' | 'conflict' | 'protective' | 'mirroring'>('harmonious');
  const [connNotes, setConnNotes] = useState('');

  const partsA = sharedParts.filter((p) => p.partner === 'A');
  const partsB = sharedParts.filter((p) => p.partner === 'B');

  const connTypeStyles = {
    harmonious: { color: 'hsl(142, 60%, 40%)', label: 'Harmonious', dash: '' },
    conflict: { color: 'hsl(0, 70%, 50%)', label: 'Conflict', dash: '' },
    protective: { color: 'hsl(270, 50%, 50%)', label: 'Protective', dash: '6,4' },
    mirroring: { color: 'hsl(30, 80%, 50%)', label: 'Mirroring', dash: '6,4' },
  };

  return (
    <div className="space-y-6 mt-4">
      {/* Add parts to map */}
      <div className="grid grid-cols-2 gap-4">
        {[{ partner: 'A' as const, name: partnerA.name, color: 'hsl(210, 70%, 40%)', bg: 'hsl(210, 70%, 95%)', shared: partsA },
          { partner: 'B' as const, name: partnerB.name, color: 'hsl(15, 70%, 40%)', bg: 'hsl(15, 70%, 95%)', shared: partsB }].map(({ partner, name, color, bg, shared }) => (
          <Card key={partner}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm" style={{ color }}>{name}'s Parts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {parts.map((p) => {
                  const isShared = shared.some((s) => s.partId === p.id);
                  return (
                    <button key={p.id}
                      className={`text-xs px-2 py-1 rounded-full border transition-all ${isShared ? 'border-2 font-medium' : 'border-dashed opacity-60 hover:opacity-100'}`}
                      style={isShared ? { borderColor: color, backgroundColor: bg, color } : {}}
                      onClick={() => isShared
                        ? removeSharedPart(p.id, partner)
                        : addSharedPart({ partId: p.id, partName: p.name, partType: p.type, partner })
                      }
                    >
                      {isShared ? '✓ ' : '+ '}{p.name}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Visual Map */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2"><MapIcon className="h-4 w-4" /> Relationship Map</CardTitle>
            <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => setShowAddConn(!showAddConn)}>
              {showAddConn ? 'Cancel' : '+ Add Connection'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddConn && (
            <div className="border rounded-lg p-3 mb-4 space-y-3 bg-muted/20">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Source Part</Label>
                  <select className="w-full mt-1 text-xs rounded-md border bg-background px-2 py-1.5" value={connSource} onChange={(e) => setConnSource(e.target.value)}>
                    <option value="">Select...</option>
                    {sharedParts.map((p) => <option key={`${p.partner}-${p.partId}`} value={`${p.partner}:${p.partId}`}>{p.partner === 'A' ? partnerA.name : partnerB.name}: {p.partName}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Target Part</Label>
                  <select className="w-full mt-1 text-xs rounded-md border bg-background px-2 py-1.5" value={connTarget} onChange={(e) => setConnTarget(e.target.value)}>
                    <option value="">Select...</option>
                    {sharedParts.map((p) => <option key={`${p.partner}-${p.partId}`} value={`${p.partner}:${p.partId}`}>{p.partner === 'A' ? partnerA.name : partnerB.name}: {p.partName}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-1.5">
                {(Object.keys(connTypeStyles) as Array<keyof typeof connTypeStyles>).map((t) => (
                  <button key={t} className={`text-[10px] px-2 py-1 rounded-full border ${connType === t ? 'font-medium' : 'opacity-60'}`}
                    style={connType === t ? { borderColor: connTypeStyles[t].color, color: connTypeStyles[t].color } : {}}
                    onClick={() => setConnType(t)}>
                    {connTypeStyles[t].label}
                  </button>
                ))}
              </div>
              <Textarea value={connNotes} onChange={(e) => setConnNotes(e.target.value)} placeholder="Notes about this dynamic..." className="min-h-[50px] text-xs" />
              <Button size="sm" className="text-xs h-7" disabled={!connSource || !connTarget} onClick={() => {
                const [sp, sid] = connSource.split(':');
                const [tp, tid] = connTarget.split(':');
                addConnection({ sourcePartId: sid, sourcePartner: sp as 'A' | 'B', targetPartId: tid, targetPartner: tp as 'A' | 'B', type: connType, notes: connNotes });
                setShowAddConn(false); setConnSource(''); setConnTarget(''); setConnNotes('');
              }}>
                Add Connection
              </Button>
            </div>
          )}

          {/* Simple visual map */}
          <div className="relative min-h-[300px] border rounded-lg bg-muted/10 overflow-hidden">
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {connections.map((conn) => {
                const sIdx = sharedParts.filter((p) => p.partner === conn.sourcePartner).findIndex((p) => p.partId === conn.sourcePartId);
                const tIdx = sharedParts.filter((p) => p.partner === conn.targetPartner).findIndex((p) => p.partId === conn.targetPartId);
                if (sIdx < 0 || tIdx < 0) return null;
                const sx = conn.sourcePartner === 'A' ? 120 : 380;
                const sy = 40 + sIdx * 70;
                const tx = conn.targetPartner === 'A' ? 120 : 380;
                const ty = 40 + tIdx * 70;
                const style = connTypeStyles[conn.type];
                return (
                  <g key={conn.id}>
                    <line x1={sx} y1={sy} x2={tx} y2={ty} stroke={style.color} strokeWidth={2} strokeDasharray={style.dash} />
                    <circle cx={(sx + tx) / 2} cy={(sy + ty) / 2} r={8} fill={style.color} opacity={0.3} />
                  </g>
                );
              })}
            </svg>

            <div className="flex justify-between p-4">
              <div className="space-y-4">
                <p className="text-xs font-medium" style={{ color: 'hsl(210, 70%, 40%)' }}>{partnerA.name}</p>
                {partsA.map((p, i) => (
                  <div key={p.partId} className="w-24 h-14 rounded-lg border-2 flex flex-col items-center justify-center text-xs shadow-sm bg-card"
                    style={{ borderColor: 'hsl(210, 70%, 40%)' }}>
                    <span className="font-medium">{p.partName}</span>
                    <span className="text-[9px] text-muted-foreground">{p.partType}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center">
                <Heart className="h-6 w-6 text-primary/30" />
              </div>
              <div className="space-y-4">
                <p className="text-xs font-medium text-right" style={{ color: 'hsl(15, 70%, 40%)' }}>{partnerB.name}</p>
                {partsB.map((p, i) => (
                  <div key={p.partId} className="w-24 h-14 rounded-lg border-2 flex flex-col items-center justify-center text-xs shadow-sm bg-card"
                    style={{ borderColor: 'hsl(15, 70%, 40%)' }}>
                    <span className="font-medium">{p.partName}</span>
                    <span className="text-[9px] text-muted-foreground">{p.partType}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Connection Legend */}
          <div className="flex gap-4 mt-3 justify-center">
            {Object.entries(connTypeStyles).map(([key, { color, label, dash }]) => (
              <div key={key} className="flex items-center gap-1.5 text-[10px]">
                <svg width="20" height="4"><line x1="0" y1="2" x2="20" y2="2" stroke={color} strokeWidth={2} strokeDasharray={dash} /></svg>
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* Connection list */}
          {connections.length > 0 && (
            <div className="mt-4 space-y-2">
              {connections.map((conn) => {
                const sp = sharedParts.find((p) => p.partId === conn.sourcePartId && p.partner === conn.sourcePartner);
                const tp = sharedParts.find((p) => p.partId === conn.targetPartId && p.partner === conn.targetPartner);
                return (
                  <div key={conn.id} className="flex items-center gap-2 text-xs border rounded-lg p-2">
                    <Badge variant="outline" className="text-[9px]">{sp?.partName}</Badge>
                    <ArrowRight className="h-3 w-3" style={{ color: connTypeStyles[conn.type].color }} />
                    <Badge variant="outline" className="text-[9px]">{tp?.partName}</Badge>
                    <Badge variant="secondary" className="text-[9px] ml-auto">{connTypeStyles[conn.type].label}</Badge>
                    {conn.notes && <span className="text-muted-foreground truncate max-w-[150px]">{conn.notes}</span>}
                    <Button variant="ghost" size="icon" className="h-5 w-5 ml-1" onClick={() => deleteConnection(conn.id)}>×</Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── GUIDED CONVERSATIONS ───

function ConversationsView() {
  const store = useCouplesStore();
  const { conversations, activeConversationId, startConversation, updateConversationStep, advanceConversation, completeConversation, setConversationSelfEnergy } = store;
  const activeConv = conversations.find((c) => c.id === activeConversationId);

  if (activeConv && !activeConv.completedAt) {
    return <ActiveConversation conv={activeConv} />;
  }

  const convTypes: { type: ConversationType; icon: typeof Heart }[] = [
    { type: 'conflict-resolution', icon: Shield },
    { type: 'intimacy-connection', icon: Heart },
    { type: 'vulnerability-sharing', icon: CircleDot },
    { type: 'setting-boundaries', icon: Shield },
    { type: 'repair-after-rupture', icon: Heart },
    { type: 'future-planning', icon: Sparkles },
    { type: 'appreciation-gratitude', icon: Heart },
  ];

  return (
    <div className="space-y-6 mt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {convTypes.map(({ type, icon: Icon }) => {
          const fw = CONVERSATION_FRAMEWORKS[type];
          return (
            <Card key={type} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => startConversation(type)}>
              <CardContent className="pt-4 pb-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{fw.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{fw.description}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{fw.steps.length} steps</p>
                </div>
                <Play className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {conversations.filter((c) => c.completedAt).length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2">Past Conversations</h3>
          <div className="space-y-2">
            {conversations.filter((c) => c.completedAt).map((c) => (
              <Card key={c.id}>
                <CardContent className="py-3 flex items-center gap-3">
                  <Check className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{CONVERSATION_FRAMEWORKS[c.type].title}</p>
                    <p className="text-[10px] text-muted-foreground">{format(new Date(c.completedAt!), 'MMM d, yyyy h:mm a')}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ActiveConversation({ conv }: { conv: ReturnType<typeof useCouplesStore.getState>['conversations'][0] }) {
  const { partnerA, partnerB, updateConversationStep, advanceConversation, completeConversation, setConversationSelfEnergy } = useCouplesStore();
  const fw = CONVERSATION_FRAMEWORKS[conv.type];
  const step = fw.steps[conv.currentStep];
  const currentStepData = conv.steps[conv.currentStep];
  const isLastStep = conv.currentStep >= fw.steps.length - 1;
  const [breathing, setBreathing] = useState(false);
  const [breathCount, setBreathCount] = useState(0);

  // Box breathing for pause steps
  const startBreathing = () => {
    setBreathing(true);
    setBreathCount(0);
    const interval = setInterval(() => {
      setBreathCount((c) => {
        if (c >= 15) { clearInterval(interval); setBreathing(false); return 0; }
        return c + 1;
      });
    }, 1000);
  };

  const breathPhase = ['Breathe in...', 'Hold...', 'Breathe out...', 'Hold...'][breathCount % 4];

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{fw.title}</h2>
          <p className="text-xs text-muted-foreground">Step {conv.currentStep + 1} of {fw.steps.length}: {step.title}</p>
        </div>
        <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => completeConversation(conv.id)}>
          <Pause className="h-3 w-3" /> Save & Exit
        </Button>
      </div>

      {/* Progress */}
      <div className="flex gap-1">
        {fw.steps.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${i < conv.currentStep ? 'bg-primary' : i === conv.currentStep ? 'bg-primary/50' : 'bg-muted'}`} />
        ))}
      </div>

      {step.title === 'Pause' ? (
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <Wind className="h-12 w-12 text-primary mx-auto" />
            <p className="text-sm">{step.promptA}</p>
            {breathing ? (
              <div className="space-y-3">
                <div className={`w-20 h-20 rounded-full mx-auto border-4 border-primary transition-all duration-1000 ${breathCount % 4 < 2 ? 'scale-125' : 'scale-100'}`} />
                <p className="text-sm font-medium text-primary">{breathPhase}</p>
              </div>
            ) : (
              <Button onClick={startBreathing} className="gap-2"><Wind className="h-4 w-4" /> Start Breathing Exercise</Button>
            )}
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => isLastStep ? completeConversation(conv.id) : advanceConversation(conv.id)}>
              Skip →
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[{ partner: 'A' as const, name: partnerA.name, prompt: step.promptA, response: currentStepData?.partnerAResponse || '', color: 'hsl(210, 70%, 40%)' },
            { partner: 'B' as const, name: partnerB.name, prompt: step.promptB, response: currentStepData?.partnerBResponse || '', color: 'hsl(15, 70%, 40%)' }].map(({ partner, name, prompt, response, color }) => (
            <Card key={partner}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm" style={{ color }}>{name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">{prompt}</p>
                {step.helper && (
                  <p className="text-[10px] italic text-primary/70 bg-primary/5 rounded px-2 py-1">💡 {step.helper}</p>
                )}
                {step.title === 'Check-In' && (
                  <div className="space-y-2">
                    <Label className="text-xs">Self-energy: {partner === 'A' ? (conv.partnerASelfEnergy ?? 50) : (conv.partnerBSelfEnergy ?? 50)}%</Label>
                    <Slider value={[partner === 'A' ? (conv.partnerASelfEnergy ?? 50) : (conv.partnerBSelfEnergy ?? 50)]}
                      onValueChange={([v]) => setConversationSelfEnergy(conv.id, partner, v)} min={0} max={100} />
                  </div>
                )}
                <Textarea
                  value={response}
                  onChange={(e) => updateConversationStep(conv.id, conv.currentStep, partner, e.target.value)}
                  placeholder="Type your response..."
                  className="min-h-[80px] text-sm"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="ghost" size="sm" disabled={conv.currentStep === 0}
          onClick={() => useCouplesStore.setState((s) => ({ conversations: s.conversations.map((c) => c.id === conv.id ? { ...c, currentStep: c.currentStep - 1 } : c) }))}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Previous
        </Button>
        <Button size="sm" onClick={() => isLastStep ? completeConversation(conv.id) : advanceConversation(conv.id)}>
          {isLastStep ? 'Complete' : 'Next'} <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// ─── CHECK-INS ───

function CheckInsView() {
  const { partnerA, partnerB, checkIns, addCheckIn, getLatestCheckIns } = useCouplesStore();
  const parts = useStore((s) => s.parts);
  const [activePartner, setActivePartner] = useState<'A' | 'B'>('A');
  const [selfEnergy, setSelfEnergy] = useState(50);
  const [activeParts, setActiveParts] = useState<string[]>([]);
  const [temperature, setTemperature] = useState<CouplesCheckIn['temperature']>('neutral');
  const [note, setNote] = useState('');

  const latest = getLatestCheckIns();
  const temps: CouplesCheckIn['temperature'][] = ['disconnected', 'distant', 'neutral', 'connected', 'deeply-connected'];

  const handleSubmit = () => {
    addCheckIn({ partner: activePartner, selfEnergy, activeParts, temperature, note });
    setSelfEnergy(50); setActiveParts([]); setTemperature('neutral'); setNote('');
  };

  // Trend data
  const trendData = checkIns
    .filter((c) => c.partner === 'A')
    .map((c) => ({ date: format(new Date(c.date), 'MMM d'), energy: c.selfEnergy, temp: temps.indexOf(c.temperature) + 1 }));

  return (
    <div className="space-y-6 mt-4">
      {/* Latest side by side */}
      {(latest.a || latest.b) && (
        <div className="grid grid-cols-2 gap-4">
          {[{ data: latest.a, name: partnerA.name, color: 'hsl(210, 70%, 40%)' }, { data: latest.b, name: partnerB.name, color: 'hsl(15, 70%, 40%)' }].map(({ data, name, color }) => (
            <Card key={name}>
              <CardContent className="pt-4 text-center space-y-2">
                <p className="text-xs font-medium" style={{ color }}>{name}</p>
                {data ? (
                  <>
                    <div className="relative w-16 h-16 mx-auto">
                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
                          strokeDasharray={`${(data.selfEnergy / 100) * 251.3} 251.3`} />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{data.selfEnergy}%</span>
                    </div>
                    <Badge className={`text-[10px] ${TEMP_COLORS[data.temperature]}`}>{TEMP_LABELS[data.temperature]}</Badge>
                    <p className="text-[10px] text-muted-foreground">{format(new Date(data.date), 'MMM d, h:mm a')}</p>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground py-4">No check-in yet</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* New check-in */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex gap-2">
            <Button variant={activePartner === 'A' ? 'default' : 'outline'} size="sm" className="text-xs" onClick={() => setActivePartner('A')}>{partnerA.name}</Button>
            <Button variant={activePartner === 'B' ? 'default' : 'outline'} size="sm" className="text-xs" onClick={() => setActivePartner('B')}>{partnerB.name}</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs">Self-energy in relationship context: {selfEnergy}%</Label>
            <Slider value={[selfEnergy]} onValueChange={([v]) => setSelfEnergy(v)} min={0} max={100} className="mt-2" />
          </div>
          <div>
            <Label className="text-xs">Active parts</Label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {parts.map((p) => (
                <button key={p.id} className={`text-[10px] px-2 py-0.5 rounded-full border ${activeParts.includes(p.id) ? 'bg-primary text-primary-foreground border-primary' : 'border-input'}`}
                  onClick={() => setActiveParts((prev) => prev.includes(p.id) ? prev.filter((x) => x !== p.id) : [...prev, p.id])}>
                  {p.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs">Relationship temperature</Label>
            <div className="flex gap-1.5 mt-1">
              {temps.map((t) => (
                <button key={t} className={`text-[10px] px-2 py-1 rounded-full border flex-1 ${temperature === t ? 'bg-primary text-primary-foreground border-primary' : 'border-input'}`}
                  onClick={() => setTemperature(t)}>
                  {TEMP_LABELS[t]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs">Note (optional)</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="How are things between you?" className="mt-1 text-xs" />
          </div>
          <Button className="w-full" onClick={handleSubmit}>Save Check-In</Button>
        </CardContent>
      </Card>

      {/* Trend */}
      {trendData.length > 1 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Relationship Temperature Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="energy" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── RESOURCES ───

const RESOURCES = {
  articles: [
    { title: 'IFS Principles in Relationships', description: 'Understanding how your internal parts interact with your partner\'s parts creates deeper empathy and connection.', time: '5 min' },
    { title: 'Common Parts Dynamics Between Couples', description: 'Explore typical protector-to-protector, protector-to-exile, and exile-to-exile dynamics in intimate relationships.', time: '7 min' },
    { title: 'Understanding Attachment Through IFS', description: 'How attachment styles manifest as parts patterns and how couples can work with them together.', time: '8 min' },
    { title: 'Moving from Protective Cycles to Secure Connection', description: 'Learn to recognize when protector parts create cycles and how Self-energy breaks the pattern.', time: '6 min' },
  ],
  exercises: [
    { title: 'Parts Introduction', description: 'Each partner introduces one of their parts to their partner, sharing what it does and what it needs.', time: '15 min', depth: 'Gentle' },
    { title: 'Protector Appreciation Circle', description: 'Take turns acknowledging and appreciating each other\'s protector parts for what they\'re trying to do.', time: '20 min', depth: 'Moderate' },
    { title: 'Self-to-Self Attunement', description: 'A guided practice where both partners access Self-energy simultaneously and attune to each other.', time: '10 min', depth: 'Deep' },
  ],
};

function ResourcesView() {
  return (
    <div className="space-y-6 mt-4">
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><BookOpen className="h-4 w-4" /> Articles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {RESOURCES.articles.map((a) => (
            <Card key={a.title} className="hover:shadow-sm transition-shadow">
              <CardContent className="pt-4 pb-4">
                <p className="font-medium text-sm">{a.title}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.description}</p>
                <Badge variant="secondary" className="text-[10px] mt-2">{a.time} read</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Sparkles className="h-4 w-4" /> Exercises</h3>
        <div className="space-y-3">
          {RESOURCES.exercises.map((e) => (
            <Card key={e.title}>
              <CardContent className="pt-4 pb-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{e.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{e.description}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary" className="text-[10px]">{e.time}</Badge>
                    <Badge variant="outline" className="text-[10px]">{e.depth}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><MessageCircle className="h-4 w-4" /> Dialogue Frameworks</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(CONVERSATION_FRAMEWORKS).map(([key, fw]) => (
            <Card key={key}>
              <CardContent className="pt-4 pb-4">
                <p className="font-medium text-sm">{fw.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{fw.description}</p>
                <div className="mt-2 space-y-1">
                  {fw.steps.map((s, i) => (
                    <p key={i} className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <span className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[8px] font-medium flex-shrink-0">{i + 1}</span>
                      {s.title}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
