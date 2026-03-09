import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  useSelfEnergyStore, SELF_QUALITIES, SelfQuality, CONTEXT_CHIPS,
} from '@/lib/selfEnergyStore';
import { useStore } from '@/lib/store';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip,
  BarChart, Bar, CartesianGrid,
} from 'recharts';

export default function TrackingDashboard() {
  const { checkIns, fullAssessments } = useSelfEnergyStore();
  const parts = useStore((s) => s.parts);
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30);

  const now = Date.now();
  const rangeMs = timeRange * 24 * 60 * 60 * 1000;
  const filtered = checkIns.filter((c) => now - new Date(c.date).getTime() < rangeMs);

  // 1. Trend line data
  const trendData = filtered.map((c) => ({
    date: new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    energy: c.overallEnergy,
    context: c.context.join(', '),
  }));

  // 2. Spider chart from latest full assessment
  const latestFull = fullAssessments.length > 0 ? fullAssessments[fullAssessments.length - 1] : null;
  const baselineFull = fullAssessments.length > 1 ? fullAssessments[0] : null;
  const spiderData = SELF_QUALITIES.map((q) => {
    const latest = latestFull ? latestFull.qualityIndicators[q].reduce((a, b) => a + b, 0) / latestFull.qualityIndicators[q].length : 0;
    const baseline = baselineFull ? baselineFull.qualityIndicators[q].reduce((a, b) => a + b, 0) / baselineFull.qualityIndicators[q].length : 0;
    return { quality: q, current: Math.round(latest * 10) / 10, baseline: Math.round(baseline * 10) / 10, fullMark: 7 };
  });

  // 3. Blending heat map data
  const blendingMap = parts.map((p) => {
    const entries = filtered.filter((c) => c.blendedParts.some((b) => b.partId === p.id));
    return { name: p.name, count: entries.length, pct: filtered.length > 0 ? Math.round((entries.length / filtered.length) * 100) : 0 };
  }).sort((a, b) => b.count - a.count);

  // 4. Context analysis
  const contextData = CONTEXT_CHIPS.map((ctx) => {
    const entries = filtered.filter((c) => c.context.includes(ctx));
    const avg = entries.length > 0 ? Math.round(entries.reduce((s, c) => s + c.overallEnergy, 0) / entries.length) : 0;
    return { context: ctx, avgEnergy: avg, count: entries.length };
  }).filter((d) => d.count > 0);

  if (checkIns.length === 0 && fullAssessments.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No data yet. Complete a check-in or full assessment to see your trends.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time range toggle */}
      <div className="flex gap-2">
        {([7, 30, 90] as const).map((r) => (
          <Button key={r} variant={timeRange === r ? 'default' : 'outline'} size="sm" onClick={() => setTimeRange(r)}>
            {r} days
          </Button>
        ))}
      </div>

      {/* Trend Line */}
      {trendData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Self-Energy Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="energy" stroke="hsl(45, 90%, 50%)" strokeWidth={2} dot={{ fill: 'hsl(45, 90%, 50%)' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Spider Chart */}
        {latestFull && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">8 C's Profile</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ResponsiveContainer width={280} height={280}>
                <RadarChart data={spiderData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="quality" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                  <PolarRadiusAxis domain={[0, 7]} tick={false} axisLine={false} />
                  {baselineFull && (
                    <Radar dataKey="baseline" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground))" fillOpacity={0.1} strokeDasharray="4 4" />
                  )}
                  <Radar dataKey="current" stroke="hsl(45, 90%, 50%)" fill="hsl(45, 90%, 50%)" fillOpacity={0.25} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Context Analysis */}
        {contextData.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Self-Energy by Context</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={contextData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis type="category" dataKey="context" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} width={80} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="avgEnergy" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Blending Heat Map */}
      {blendingMap.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Blending Frequency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {blendingMap.map((b) => (
                <div key={b.name} className="flex items-center gap-3">
                  <span className="text-sm w-32 truncate">{b.name}</span>
                  <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${b.pct}%`,
                        backgroundColor: b.pct > 60 ? 'hsl(0, 70%, 55%)' : b.pct > 30 ? 'hsl(30, 90%, 50%)' : 'hsl(var(--primary))',
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-12 text-right">{b.pct}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
