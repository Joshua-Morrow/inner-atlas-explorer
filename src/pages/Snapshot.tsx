import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { useJourneyStore } from '@/lib/journeyStore';
import { useSelfEnergyStore, SELF_QUALITIES } from '@/lib/selfEnergyStore';
import { usePracticesStore } from '@/lib/practicesStore';
import { useElaborationStore } from '@/lib/elaborationStore';
import { useDynamicsStore } from '@/lib/dynamicsStore';
import { useSnapshotStore, SystemSnapshot, SnapshotReflections } from '@/lib/snapshotStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, FileDown, ArrowLeft, TrendingUp, Users, Brain, Heart, Zap, ArrowLeftRight } from 'lucide-react';
import { format } from 'date-fns';
import { practicesLibrary } from '@/lib/selfEnergyStore';

function EnergyGauge({ value, label }: { value: number; label: string }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 100 100" className="w-24 h-24 -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
          <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(var(--primary))" strokeWidth="6"
            strokeDasharray={`${progress} ${circumference}`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold">{value}%</span>
        </div>
      </div>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

function buildSnapshot(
  parts: ReturnType<typeof useStore.getState>['parts'],
  dialogues: ReturnType<typeof useStore.getState>['dialogues'],
  checkIns: ReturnType<typeof useSelfEnergyStore.getState>['checkIns'],
  practiceSessions: ReturnType<typeof usePracticesStore.getState>['sessions'],
  elaborationSessions: ReturnType<typeof useElaborationStore.getState>['sessions'],
  dynamics: ReturnType<typeof useDynamicsStore.getState>['dynamics'],
  events: ReturnType<typeof useJourneyStore.getState>['events'],
): Omit<SystemSnapshot, 'id' | 'createdAt'> {
  const managers = parts.filter((p) => p.type === 'Manager');
  const firefighters = parts.filter((p) => p.type === 'Firefighter');
  const exiles = parts.filter((p) => p.type === 'Exile');
  const selves = parts.filter((p) => p.type === 'Self');

  // Self-energy
  const sorted = [...checkIns].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const first = sorted[0] ?? null;
  const latest = sorted[sorted.length - 1] ?? null;

  // Practices by category
  const practicesByCategory: Record<string, number> = {};
  const completed = practiceSessions.filter((s) => s.completedAt);
  for (const s of completed) {
    const lib = practicesLibrary.find((p) => p.id === s.practiceId);
    const cat = lib?.category ?? 'Other';
    practicesByCategory[cat] = (practicesByCategory[cat] ?? 0) + 1;
  }

  // Dialogues per part
  const partDialogueCounts: Record<string, number> = {};
  for (const d of dialogues) {
    for (const pid of d.participantIds) {
      if (pid !== 'self') partDialogueCounts[pid] = (partDialogueCounts[pid] ?? 0) + 1;
    }
  }
  const mostDialoguedParts = Object.entries(partDialogueCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([partId, count]) => {
      const p = parts.find((pp) => pp.id === partId);
      return { partId, partName: p?.name ?? 'Unknown', count };
    });

  // Elaborated parts
  const elaboratedParts = parts
    .filter((p) => {
      const sessions = elaborationSessions.filter((s) => s.partId === p.id);
      return sessions.some((s) => s.completed);
    })
    .map((p) => ({ partId: p.id, partName: p.name }));

  // Updates count
  const totalUpdates = events.filter((e) => e.type === 'update-logged').length;

  // Dynamics
  const polarizations = dynamics
    .filter((d) => d.dynamicType === 'polarization')
    .map((d) => ({
      title: d.title,
      partNames: d.partIds.map((id) => parts.find((p) => p.id === id)?.name ?? 'Unknown'),
      status: d.status,
    }));
  const alliances = dynamics
    .filter((d) => d.dynamicType === 'alliance')
    .map((d) => ({
      title: d.title,
      partNames: d.partIds.map((id) => parts.find((p) => p.id === id)?.name ?? 'Unknown'),
      status: d.status,
    }));

  return {
    totalParts: parts.length,
    managerCount: managers.length,
    firefighterCount: firefighters.length,
    exileCount: exiles.length,
    selfCount: selves.length,
    firstCheckInScore: first?.overallEnergy ?? null,
    latestCheckInScore: latest?.overallEnergy ?? null,
    firstQualities: first?.qualities ?? null,
    latestQualities: latest?.qualities ?? null,
    totalPracticeSessions: completed.length,
    practicesByCategory,
    totalDialogues: dialogues.length,
    mostDialoguedParts,
    elaboratedParts,
    totalUpdates,
    polarizations,
    alliances,
    reflections: {
      overallShift: '',
      partReflections: parts.map((p) => ({ partId: p.id, text: '' })),
    },
  };
}

export default function Snapshot({ readOnlySnapshot }: { readOnlySnapshot?: SystemSnapshot }) {
  const navigate = useNavigate();
  const parts = useStore((s) => s.parts);
  const dialogues = useStore((s) => s.dialogues);
  const checkIns = useSelfEnergyStore((s) => s.checkIns);
  const practiceSessions = usePracticesStore((s) => s.sessions);
  const elaborationSessions = useElaborationStore((s) => s.sessions);
  const dynamics = useDynamicsStore((s) => s.dynamics);
  const events = useJourneyStore((s) => s.events);
  const { saveSnapshot } = useSnapshotStore();

  const [loading, setLoading] = useState(!readOnlySnapshot);
  const [snapshot, setSnapshot] = useState<SystemSnapshot | null>(readOnlySnapshot ?? null);
  const [saved, setSaved] = useState(!!readOnlySnapshot);
  const readOnly = !!readOnlySnapshot;

  useEffect(() => {
    if (readOnlySnapshot) return;
    const timer = setTimeout(() => {
      const data = buildSnapshot(parts, dialogues, checkIns, practiceSessions, elaborationSessions, dynamics, events);
      setSnapshot({
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      });
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const updateReflection = useCallback((field: string, value: string) => {
    if (!snapshot || readOnly) return;
    setSnapshot((prev) => {
      if (!prev) return prev;
      return { ...prev, reflections: { ...prev.reflections, overallShift: field === 'overall' ? value : prev.reflections.overallShift, partReflections: field === 'overall' ? prev.reflections.partReflections : prev.reflections.partReflections.map((pr) => pr.partId === field ? { ...pr, text: value } : pr) } };
    });
  }, [readOnly]);

  const handleSave = () => {
    if (!snapshot) return;
    saveSnapshot(snapshot);
    setSaved(true);
    // Also add journey event
    useJourneyStore.getState().addEvent({ type: 'snapshot-created', summary: `System snapshot saved — ${snapshot.totalParts} parts, ${snapshot.totalDialogues} dialogues` });
  };

  const handleExportPDF = async () => {
    if (!snapshot) return;
    const { default: jsPDF } = await import('jspdf');
    await import('jspdf-autotable');
    const doc = new jsPDF();
    const margin = 20;
    let y = 20;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(45, 149, 150);
    doc.text('Inner Atlas — System Snapshot', margin, y);
    y += 10;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(format(new Date(snapshot.createdAt), 'MMMM d, yyyy · h:mm a'), margin, y);
    y += 15;

    // Section 1
    doc.setFontSize(14);
    doc.setTextColor(30);
    doc.text('Your System Today', margin, y);
    y += 8;
    doc.setFontSize(10);
    doc.setTextColor(60);
    doc.text(`Total parts: ${snapshot.totalParts}`, margin, y); y += 5;
    doc.text(`Managers: ${snapshot.managerCount} · Firefighters: ${snapshot.firefighterCount} · Exiles: ${snapshot.exileCount}`, margin, y); y += 10;

    // Section 2
    doc.setFontSize(14);
    doc.setTextColor(30);
    doc.text('Self-Energy Journey', margin, y); y += 8;
    doc.setFontSize(10);
    doc.setTextColor(60);
    if (snapshot.firstCheckInScore !== null) {
      doc.text(`First check-in: ${snapshot.firstCheckInScore}% → Latest: ${snapshot.latestCheckInScore}%`, margin, y); y += 6;
    }
    if (snapshot.firstQualities && snapshot.latestQualities) {
      const qualities = Object.keys(snapshot.firstQualities);
      (doc as any).autoTable({
        startY: y,
        head: [['Quality', 'First', 'Latest', 'Change']],
        body: qualities.map((q) => {
          const first = (snapshot.firstQualities as any)[q];
          const latest = (snapshot.latestQualities as any)[q];
          const diff = latest - first;
          return [q, first, latest, diff > 0 ? `+${diff}` : `${diff}`];
        }),
        margin: { left: margin },
        styles: { fontSize: 9 },
        headStyles: { fillColor: [45, 149, 150] },
      });
      y = (doc as any).lastAutoTable.finalY + 10;
    }

    // Section 3
    doc.setFontSize(14);
    doc.setTextColor(30);
    if (y > 250) { doc.addPage(); y = 20; }
    doc.text('Work Done', margin, y); y += 8;
    doc.setFontSize(10);
    doc.setTextColor(60);
    doc.text(`Practice sessions: ${snapshot.totalPracticeSessions}`, margin, y); y += 5;
    doc.text(`Inner dialogues: ${snapshot.totalDialogues}`, margin, y); y += 5;
    doc.text(`Elaborated parts: ${snapshot.elaboratedParts.map((p) => p.partName).join(', ') || 'None'}`, margin, y); y += 5;
    doc.text(`Updates logged: ${snapshot.totalUpdates}`, margin, y); y += 10;

    // Section 4
    if (snapshot.polarizations.length > 0 || snapshot.alliances.length > 0) {
      if (y > 250) { doc.addPage(); y = 20; }
      doc.setFontSize(14);
      doc.setTextColor(30);
      doc.text('System Dynamics', margin, y); y += 8;
      doc.setFontSize(10);
      doc.setTextColor(60);
      for (const p of snapshot.polarizations) {
        doc.text(`Polarization: ${p.title} (${p.partNames.join(' ↔ ')}) — ${p.status}`, margin, y); y += 5;
      }
      for (const a of snapshot.alliances) {
        doc.text(`Alliance: ${a.title} (${a.partNames.join(' + ')}) — ${a.status}`, margin, y); y += 5;
      }
      y += 5;
    }

    // Section 5
    if (snapshot.reflections.overallShift) {
      if (y > 230) { doc.addPage(); y = 20; }
      doc.setFontSize(14);
      doc.setTextColor(30);
      doc.text('Integration Reflection', margin, y); y += 8;
      doc.setFontSize(10);
      doc.setTextColor(60);
      const lines = doc.splitTextToSize(snapshot.reflections.overallShift, 170);
      doc.text(lines, margin, y);
      y += lines.length * 5 + 5;
      for (const pr of snapshot.reflections.partReflections.filter((r) => r.text)) {
        if (y > 260) { doc.addPage(); y = 20; }
        const part = parts.find((p) => p.id === pr.partId);
        doc.setTextColor(30);
        doc.text(`${part?.name ?? 'Unknown'} needs:`, margin, y); y += 5;
        doc.setTextColor(60);
        const prLines = doc.splitTextToSize(pr.text, 170);
        doc.text(prLines, margin, y);
        y += prLines.length * 5 + 3;
      }
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text('Inner Atlas · System Snapshot', margin, 290);
      doc.text(`Page ${i} of ${pageCount}`, 170, 290);
    }

    doc.save(`inner-atlas-snapshot-${format(new Date(snapshot.createdAt), 'yyyy-MM-dd')}.pdf`);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-lg font-medium text-muted-foreground">Building your system snapshot...</p>
        <p className="text-sm text-muted-foreground">Compiling data from your entire journey.</p>
      </div>
    );
  }

  if (!snapshot) return null;

  const statusColor = (s: string) =>
    s === 'active' ? 'bg-destructive/15 text-destructive border-destructive/30' :
    s === 'easing' ? 'bg-amber-500/15 text-amber-600 border-amber-500/30' :
    'bg-dynamics-alliance/15 text-dynamics-alliance border-dynamics-alliance/30';

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-primary">System Snapshot</h1>
          <p className="text-sm text-muted-foreground">{format(new Date(snapshot.createdAt), 'MMMM d, yyyy · h:mm a')}</p>
        </div>
        <div className="flex gap-2">
          {!readOnly && !saved && (
            <Button onClick={handleSave} className="gap-2"><Save className="h-4 w-4" /> Save Snapshot</Button>
          )}
          {saved && <Badge variant="outline" className="text-primary border-primary">✓ Saved</Badge>}
          <Button variant="outline" onClick={handleExportPDF} className="gap-2"><FileDown className="h-4 w-4" /> Export PDF</Button>
        </div>
      </div>

      {/* Section 1 — Your System Today */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><Brain className="h-5 w-5 text-primary" /> Your System Today</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-secondary/50">
              <div className="text-3xl font-bold text-primary">{snapshot.totalParts}</div>
              <div className="text-xs text-muted-foreground">Total Parts</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-secondary/50">
              <Badge className="bg-ifs-manager/15 text-ifs-manager border-ifs-manager/30 text-lg px-3">{snapshot.managerCount}</Badge>
              <div className="text-xs text-muted-foreground mt-1">Managers</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-secondary/50">
              <Badge className="bg-ifs-firefighter/15 text-ifs-firefighter border-ifs-firefighter/30 text-lg px-3">{snapshot.firefighterCount}</Badge>
              <div className="text-xs text-muted-foreground mt-1">Firefighters</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-secondary/50">
              <Badge className="bg-ifs-exile/15 text-ifs-exile border-ifs-exile/30 text-lg px-3">{snapshot.exileCount}</Badge>
              <div className="text-xs text-muted-foreground mt-1">Exiles</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2 — Self-Energy Journey */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><Heart className="h-5 w-5 text-ifs-self" /> Self-Energy Journey</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {snapshot.firstCheckInScore !== null ? (
            <>
              <div className="flex justify-center gap-12">
                <EnergyGauge value={snapshot.firstCheckInScore} label="Then" />
                <div className="flex items-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <EnergyGauge value={snapshot.latestCheckInScore ?? 0} label="Now" />
              </div>

              {snapshot.firstQualities && snapshot.latestQualities && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium text-muted-foreground">Quality</th>
                        <th className="text-center py-2 font-medium text-muted-foreground">First</th>
                        <th className="text-center py-2 font-medium text-muted-foreground">Latest</th>
                        <th className="text-center py-2 font-medium text-muted-foreground">Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SELF_QUALITIES.map((q) => {
                        const first = (snapshot.firstQualities as any)?.[q] ?? 0;
                        const latest = (snapshot.latestQualities as any)?.[q] ?? 0;
                        const diff = latest - first;
                        const improved = diff >= 2;
                        return (
                          <tr key={q} className={`border-b ${improved ? 'bg-primary/5' : ''}`}>
                            <td className="py-2 font-medium">{q}</td>
                            <td className="py-2 text-center">{first}</td>
                            <td className="py-2 text-center font-semibold">{latest}</td>
                            <td className="py-2 text-center">
                              <span className={diff > 0 ? 'text-primary font-semibold' : diff < 0 ? 'text-destructive' : 'text-muted-foreground'}>
                                {diff > 0 ? `+${diff}` : diff}
                              </span>
                              {improved && <span className="ml-1 text-primary">★</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No self-energy check-ins recorded yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Section 3 — Work Done */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><Zap className="h-5 w-5 text-primary" /> Work Done</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-secondary/50 text-center">
              <div className="text-2xl font-bold text-primary">{snapshot.totalPracticeSessions}</div>
              <div className="text-xs text-muted-foreground">Practice Sessions</div>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50 text-center">
              <div className="text-2xl font-bold text-primary">{snapshot.totalDialogues}</div>
              <div className="text-xs text-muted-foreground">Inner Dialogues</div>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50 text-center">
              <div className="text-2xl font-bold text-primary">{snapshot.elaboratedParts.length}</div>
              <div className="text-xs text-muted-foreground">Parts Elaborated</div>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50 text-center">
              <div className="text-2xl font-bold text-primary">{snapshot.totalUpdates}</div>
              <div className="text-xs text-muted-foreground">Updates Logged</div>
            </div>
          </div>

          {Object.keys(snapshot.practicesByCategory).length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Practices by technique</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(snapshot.practicesByCategory).map(([cat, count]) => (
                  <Badge key={cat} variant="secondary">{cat}: {count}</Badge>
                ))}
              </div>
            </div>
          )}

          {snapshot.mostDialoguedParts.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Most dialogued parts</p>
              <div className="flex flex-wrap gap-2">
                {snapshot.mostDialoguedParts.map((p) => (
                  <Badge key={p.partId} variant="outline">{p.partName} ({p.count})</Badge>
                ))}
              </div>
            </div>
          )}

          {snapshot.elaboratedParts.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Elaborated</p>
              <div className="flex flex-wrap gap-2">
                {snapshot.elaboratedParts.map((p) => (
                  <Badge key={p.partId} variant="outline" className="text-primary border-primary/30">{p.partName}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 4 — System Dynamics */}
      {(snapshot.polarizations.length > 0 || snapshot.alliances.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><ArrowLeftRight className="h-5 w-5 text-dynamics-polarization" /> System Dynamics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.polarizations.map((p, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${p.status !== 'active' ? 'bg-primary/5' : ''}`}>
                <Badge className="bg-dynamics-polarization/15 text-dynamics-polarization border-dynamics-polarization/30 text-[10px]">POL</Badge>
                <div className="flex-1">
                  <div className="font-medium text-sm">{p.title}</div>
                  <div className="text-xs text-muted-foreground">{p.partNames.join(' ↔ ')}</div>
                </div>
                <Badge variant="outline" className={statusColor(p.status)}>{p.status}</Badge>
              </div>
            ))}
            {snapshot.alliances.map((a, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${a.status !== 'active' ? 'bg-primary/5' : ''}`}>
                <Badge className="bg-dynamics-alliance/15 text-dynamics-alliance border-dynamics-alliance/30 text-[10px]">ALL</Badge>
                <div className="flex-1">
                  <div className="font-medium text-sm">{a.title}</div>
                  <div className="text-xs text-muted-foreground">{a.partNames.join(' + ')}</div>
                </div>
                <Badge variant="outline" className={statusColor(a.status)}>{a.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Section 5 — Integration Reflection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><Users className="h-5 w-5 text-primary" /> Integration Reflection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">What has shifted for you across this work?</label>
            <Textarea
              value={snapshot.reflections.overallShift}
              onChange={(e) => updateReflection('overall', e.target.value)}
              placeholder="Reflect on how your relationship with your inner system has changed..."
              className="min-h-[100px]"
              readOnly={readOnly}
            />
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">What does each part need going forward?</p>
            {snapshot.reflections.partReflections.map((pr) => {
              const part = parts.find((p) => p.id === pr.partId);
              if (!part) return null;
              return (
                <div key={pr.partId}>
                  <label className="text-xs font-medium mb-1 block">{part.name}</label>
                  <Textarea
                    value={pr.text}
                    onChange={(e) => updateReflection(pr.partId, e.target.value)}
                    placeholder={`What does ${part.name} need going forward?`}
                    className="min-h-[60px]"
                    readOnly={readOnly}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Section 6 — What's Next */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">Continue with your therapist</h3>
            <p className="text-sm text-muted-foreground">
              The insights from Inner Atlas are meant to deepen your therapeutic work. Share this snapshot with your therapist to bring them into your inner world.
            </p>
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">IFS Foundations Course</h3>
            <Badge variant="secondary" className="mb-2 text-xs">Coming Soon</Badge>
            <p className="text-sm text-muted-foreground">
              A guided course to deepen your understanding of your internal system and build lasting Self-leadership.
            </p>
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">Keep using Inner Atlas</h3>
            <p className="text-sm text-muted-foreground">
              Your system is always evolving. Regular check-ins, dialogues, and reflections build the kind of awareness that creates lasting change.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bottom actions */}
      <div className="flex justify-center gap-4 pt-4">
        {!readOnly && !saved && (
          <Button onClick={handleSave} size="lg" className="gap-2"><Save className="h-4 w-4" /> Save Snapshot</Button>
        )}
        <Button variant="outline" size="lg" onClick={handleExportPDF} className="gap-2"><FileDown className="h-4 w-4" /> Export as PDF</Button>
      </div>
    </div>
  );
}
