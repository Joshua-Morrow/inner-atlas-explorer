import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore, PartType } from '@/lib/store';
import { useElaborationStore, elaborationTabs } from '@/lib/elaborationStore';
import { useRefineStore } from '@/lib/refineStore';
import { useBodyMapStore } from '@/lib/bodyMapStore';
import { useDynamicsStore } from '@/lib/dynamicsStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Sparkles, PenLine, Diamond, Activity, MessageCircle, Clock, ArrowLeftRight, Users } from 'lucide-react';
import { CreateDynamicFlow } from '@/components/dynamics/CreateDynamicFlow';
import { format } from 'date-fns';

const typeColors: Record<PartType, string> = {
  Manager: 'bg-ifs-manager/15 text-ifs-manager border-ifs-manager/30',
  Firefighter: 'bg-ifs-firefighter/15 text-ifs-firefighter border-ifs-firefighter/30',
  Exile: 'bg-ifs-exile/15 text-ifs-exile border-ifs-exile/30',
  Self: 'bg-ifs-self/15 text-ifs-self border-ifs-self/30',
};

export default function PartProfile() {
  const [createDynamicType, setCreateDynamicType] = useState<'polarization' | 'alliance' | null>(null);
  const { partId } = useParams<{ partId: string }>();
  const navigate = useNavigate();
  const parts = useStore((s) => s.parts);
  const dialogues = useStore((s) => s.dialogues);
  const part = parts.find((p) => p.id === partId);
  const { sessions, getPartElaborationProgress, isPartElaborated } = useElaborationStore();
  const { getRefinement, getRefinementLevel } = useRefineStore();
  const { placements } = useBodyMapStore();

  if (!part) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <p className="text-muted-foreground">Part not found.</p>
        <Button variant="link" onClick={() => navigate('/inventory')}>Back to Inventory</Button>
      </div>
    );
  }

  const refinement = partId ? getRefinement(partId) : null;
  const refinementLevel = partId ? getRefinementLevel(partId) : 'none';
  const elaborated = partId ? isPartElaborated(partId) : false;
  const progress = partId ? getPartElaborationProgress(partId) : 0;
  const partSessions = sessions.filter((s) => s.partId === partId);
  const partPlacements = placements.filter((p) => p.partId === partId);
  const partDialogues = dialogues.filter((d) => d.participantIds.includes(partId!));
  const displayName = refinement?.customName || part.name;
  const displayColor = refinement?.customColor || part.accentColor;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/inventory')}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3 flex-1">
          <div
            className="w-14 h-14 rounded-xl border-2 flex items-center justify-center shadow-md"
            style={{ borderColor: displayColor, backgroundColor: `${displayColor}15` }}
          >
            <span className="text-xl font-bold" style={{ color: displayColor }}>
              {displayName.charAt(0)}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{displayName}</h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={typeColors[part.type]}>{part.type}</Badge>
              {elaborated && <Badge variant="outline" className="text-xs gap-1"><Sparkles className="h-3 w-3" /> Elaborated</Badge>}
              {refinementLevel !== 'none' && <Badge variant="outline" className="text-xs gap-1"><Diamond className="h-3 w-3" /> {refinementLevel === 'full' ? 'Fully' : 'Partially'} Refined</Badge>}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/elaborate/${partId}`}><Sparkles className="h-3.5 w-3.5 mr-1.5" /> Elaborate</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/refine/${partId}`}><PenLine className="h-3.5 w-3.5 mr-1.5" /> Refine</Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="w-full grid grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="body">Body</TabsTrigger>
          <TabsTrigger value="relationships">Relationships</TabsTrigger>
          <TabsTrigger value="dialogues">Dialogues</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-sm">Profile</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div><span className="text-muted-foreground">Description:</span><p className="mt-1">{refinement?.editedDescription || part.description}</p></div>
                <div><span className="text-muted-foreground">Manifestation Mode:</span> <span className="font-medium">{part.manifestationMode}</span></div>
                <div><span className="text-muted-foreground">Intensity:</span> <Badge variant="secondary">{part.intensity}</Badge></div>
                {refinement?.editedTriggers && <div><span className="text-muted-foreground">Triggers:</span><p className="mt-1">{refinement.editedTriggers}</p></div>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Elaboration Progress</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative w-16 h-16">
                    <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                      <circle cx="18" cy="18" r="16" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                      <circle cx="18" cy="18" r="16" fill="none" stroke="hsl(var(--primary))" strokeWidth="3"
                        strokeDasharray={`${(progress / 100) * 100.53} 100.53`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold">{progress}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">{partSessions.length} session{partSessions.length !== 1 ? 's' : ''}</p>
                    <p className="text-xs text-muted-foreground">{partSessions.filter(s => s.completed).length} completed</p>
                  </div>
                </div>
                {partSessions.length > 0 && (
                  <div className="space-y-2">
                    {elaborationTabs.map((tab) => {
                      const answered = partSessions.flatMap(s => s.responses).filter(r => r.tabId === tab.id && r.answer.trim()).length;
                      return (
                        <div key={tab.id} className="flex items-center justify-between text-xs">
                          <span>{tab.label}</span>
                          <span className="text-muted-foreground">{answered}/{tab.questions.length}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
            {refinement?.story && (
              <Card className="md:col-span-2">
                <CardHeader><CardTitle className="text-sm">Part Story</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{refinement.story}</p>
                  {refinement.originStory && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Origin Story</p>
                      <p className="text-sm leading-relaxed">{refinement.originStory}</p>
                    </div>
                  )}
                  {refinement.partVoice && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs font-medium text-muted-foreground mb-1">In Its Own Words</p>
                      <blockquote className="text-sm italic leading-relaxed border-l-2 pl-3" style={{ borderColor: displayColor }}>
                        {refinement.partVoice}
                      </blockquote>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* BODY */}
        <TabsContent value="body">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4" /> Body Locations ({partPlacements.length})</CardTitle></CardHeader>
            <CardContent>
              {partPlacements.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground mb-3">No body placements yet for {displayName}.</p>
                  <Button variant="outline" size="sm" asChild><Link to="/body-map">Add on Body Map</Link></Button>
                </div>
              ) : (
                <div className="flex items-start gap-6">
                  <div className="w-48 flex-shrink-0">
                    <svg viewBox="0 0 100 100" className="w-full">
                      <path
                        d="M 50 8 C 44 8 40 12 40 18 C 40 24 44 28 50 28 C 56 28 60 24 60 18 C 60 12 56 8 50 8 Z M 50 28 L 50 30 C 42 32 35 36 33 44 L 28 62 C 27 65 29 67 31 66 L 38 52 L 38 70 L 36 92 C 36 95 39 96 40 93 L 50 72 L 60 93 C 61 96 64 95 64 92 L 62 70 L 62 52 L 69 66 C 71 67 73 65 72 62 L 67 44 C 65 36 58 32 50 30 Z"
                        fill="hsl(var(--muted))" stroke="hsl(var(--muted-foreground) / 0.4)" strokeWidth="0.8"
                      />
                      {partPlacements.map((pl) => (
                        <circle key={pl.id} cx={pl.x} cy={pl.y} r={3} fill={displayColor} stroke="hsl(var(--background))" strokeWidth="0.5" />
                      ))}
                    </svg>
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm text-muted-foreground">{displayName} is felt in {partPlacements.length} location{partPlacements.length !== 1 ? 's' : ''}.</p>
                    {partPlacements.map((pl) => (
                      <div key={pl.id} className="text-xs flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: displayColor }} />
                        <span>{pl.view === 'front' ? 'Front' : 'Back'} view — ({Math.round(pl.x)}%, {Math.round(pl.y)}%)</span>
                        <span className="text-muted-foreground ml-auto">{format(new Date(pl.createdAt), 'MMM d')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* RELATIONSHIPS / DYNAMICS */}
        <TabsContent value="relationships">
          <DynamicsSection partId={partId!} displayName={displayName} onCreateDynamic={setCreateDynamicType} />
        </TabsContent>

        {/* DIALOGUES */}
        <TabsContent value="dialogues">
          {partDialogues.length === 0 ? (
            <Card><CardContent className="py-8 text-center"><p className="text-sm text-muted-foreground">No dialogues involving {displayName} yet.</p></CardContent></Card>
          ) : (
            <div className="space-y-4">
              {partDialogues.map((d) => (
                <Card key={d.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" /> {d.title}
                      <span className="text-xs text-muted-foreground ml-auto">{format(new Date(d.date), 'MMM d, yyyy')}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {d.messages.map((msg, i) => {
                        const speaker = msg.partId === 'self'
                          ? { name: 'Self', color: 'hsl(45, 90%, 50%)' }
                          : (() => { const p = parts.find(pp => pp.id === msg.partId); return p ? { name: p.name, color: p.accentColor } : { name: 'Unknown', color: '#ccc' }; })();
                        return (
                          <div key={i} className="flex gap-2">
                            <div className="w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
                              style={{ borderColor: speaker.color, color: speaker.color }}>
                              {speaker.name.charAt(0)}
                            </div>
                            <div>
                              <span className="text-[10px] font-semibold" style={{ color: speaker.color }}>{speaker.name}</span>
                              <p className="text-sm">{msg.text}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* HISTORY */}
        <TabsContent value="history">
          <div className="space-y-4">
            {partSessions.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Sparkles className="h-4 w-4" /> Elaboration Sessions</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {partSessions.map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                      <div>
                        <p className="font-medium">{format(new Date(s.date), 'MMM d, yyyy')}</p>
                        <p className="text-xs text-muted-foreground">{s.responses.filter(r => r.answer.trim()).length} responses{s.completed ? ' · Completed' : ' · In progress'}</p>
                      </div>
                      {s.completed && <Badge variant="outline" className="text-xs text-primary">✓ Complete</Badge>}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            {refinement && refinement.history.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" /> Refinement History</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {refinement.history.map((h) => (
                    <div key={h.id} className="text-xs flex items-center gap-2">
                      <span className="text-muted-foreground">{format(new Date(h.timestamp), 'MMM d')}</span>
                      <span>Changed <strong>{h.field}</strong></span>
                      {h.oldValue && <span className="text-muted-foreground">from "{h.oldValue}"</span>}
                      <span>to "{h.newValue}"</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <CreateDynamicFlow
        open={createDynamicType !== null}
        onOpenChange={(open) => { if (!open) setCreateDynamicType(null); }}
        dynamicType={createDynamicType || 'polarization'}
        preSelectedPartId={partId}
      />
    </div>
  );
}

function DynamicsSection({ partId, displayName, onCreateDynamic }: { partId: string; displayName: string; onCreateDynamic: (type: 'polarization' | 'alliance') => void }) {
  const parts = useStore((s) => s.parts);
  const partDynamics = useDynamicsStore((s) => s.getDynamicsForPart(partId));

  const statusColor = (s: string) =>
    s === 'active' ? 'border-dynamics-polarization text-dynamics-polarization' :
    s === 'easing' ? 'border-amber-500 text-amber-500' :
    'border-dynamics-alliance text-dynamics-alliance';

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">System Dynamics</CardTitle>
        </CardHeader>
        <CardContent>
          {partDynamics.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {displayName} is not currently mapped in any polarization or alliance.
            </p>
          ) : (
            <div className="space-y-2">
              {partDynamics.map((d) => (
                <Link key={d.id} to="/dynamics" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/30 transition-colors">
                  <Badge className={d.dynamicType === 'polarization' ? 'bg-dynamics-polarization text-white border-0 text-[10px]' : 'bg-dynamics-alliance text-white border-0 text-[10px]'}>
                    {d.dynamicType === 'polarization' ? <><ArrowLeftRight className="h-3 w-3 mr-1" />Pol</> : <><Users className="h-3 w-3 mr-1" />All</>}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{d.title}</div>
                    <div className="flex gap-1 mt-0.5">
                      {d.partIds.filter((id) => id !== partId).map((id) => {
                        const p = parts.find((pp) => pp.id === id);
                        return p ? <span key={id} className="text-[10px] text-muted-foreground">{p.name}</span> : null;
                      })}
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${statusColor(d.status)}`}>
                    {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => onCreateDynamic('polarization')}>
              <ArrowLeftRight className="h-3.5 w-3.5 mr-1.5" /> Add Polarization
            </Button>
            <Button variant="outline" size="sm" onClick={() => onCreateDynamic('alliance')}>
              <Users className="h-3.5 w-3.5 mr-1.5" /> Add Alliance
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
