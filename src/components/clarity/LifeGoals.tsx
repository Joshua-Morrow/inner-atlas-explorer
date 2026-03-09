import { useState, useEffect } from 'react';
import { useClarityStore, DomainDriver } from '@/lib/clarityStore';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, ChevronDown, Trash2, Briefcase, Heart, Users, Activity, TrendingUp, Palette, Sparkles, Globe } from 'lucide-react';

const DOMAIN_ICONS: Record<string, typeof Briefcase> = {
  briefcase: Briefcase, heart: Heart, users: Users, activity: Activity,
  'trending-up': TrendingUp, palette: Palette, sparkles: Sparkles, globe: Globe,
};

const SAT_LABELS: Record<number, string> = {
  1: 'Deeply Unfulfilling', 2: 'Very Unfulfilling', 3: 'Unfulfilling', 4: 'Somewhat Unfulfilling', 5: 'Neutral',
  6: 'Somewhat Fulfilling', 7: 'Fulfilling', 8: 'Very Fulfilling', 9: 'Deeply Fulfilling', 10: 'Deeply Fulfilling',
};

const DRIVER_COLORS: Record<DomainDriver, string> = {
  'part-driven': 'hsl(var(--ifs-firefighter))',
  'self-led': 'hsl(var(--ifs-self))',
  'mixed': 'hsl(var(--primary))',
};

export default function LifeGoals() {
  const { lifeDomains, initLifeDomains, updateLifeDomain, addLifeGoal, removeLifeGoal, futureSelf, setFutureSelf } = useClarityStore();
  const parts = useStore((s) => s.parts);
  const [openDomain, setOpenDomain] = useState<string | null>(null);
  const [newGoalText, setNewGoalText] = useState('');
  const [newGoalWhy, setNewGoalWhy] = useState('');

  useEffect(() => { initLifeDomains(); }, [initLifeDomains]);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Life Goals</h2>

      {/* Wheel Visualization */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Life Domains Wheel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <svg viewBox="0 0 300 300" className="w-64 h-64">
              {lifeDomains.map((d, i) => {
                const angle = (i / lifeDomains.length) * Math.PI * 2 - Math.PI / 2;
                const nextAngle = ((i + 1) / lifeDomains.length) * Math.PI * 2 - Math.PI / 2;
                const r = 30 + (d.satisfaction / 10) * 110;
                const cx = 150, cy = 150;
                const x1 = cx + r * Math.cos(angle);
                const y1 = cy + r * Math.sin(angle);
                const x2 = cx + r * Math.cos(nextAngle);
                const y2 = cy + r * Math.sin(nextAngle);
                const largeArc = 0;
                const fill = DRIVER_COLORS[d.driver];
                return (
                  <g key={d.id}>
                    <path
                      d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                      fill={fill} opacity={0.3} stroke={fill} strokeWidth={1}
                    />
                    <text
                      x={cx + 125 * Math.cos((angle + nextAngle) / 2)}
                      y={cy + 125 * Math.sin((angle + nextAngle) / 2)}
                      textAnchor="middle" dominantBaseline="middle"
                      className="text-[8px] fill-foreground"
                    >
                      {d.name.split(' ')[0]}
                    </text>
                  </g>
                );
              })}
              {/* Background rings */}
              {[2, 4, 6, 8, 10].map((ring) => (
                <circle key={ring} cx={150} cy={150} r={30 + (ring / 10) * 110}
                  fill="none" stroke="hsl(var(--border))" strokeWidth={0.5} strokeDasharray="2,2" />
              ))}
            </svg>
          </div>
          <div className="flex justify-center gap-4 text-[10px]">
            {Object.entries(DRIVER_COLORS).map(([key, color]) => (
              <div key={key} className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                {key === 'part-driven' ? 'Part-Driven' : key === 'self-led' ? 'Self-Led' : 'Mixed'}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Domains */}
      <div className="space-y-2">
        {lifeDomains.map((domain) => {
          const Icon = DOMAIN_ICONS[domain.icon] || Sparkles;
          return (
            <Collapsible key={domain.id} open={openDomain === domain.id} onOpenChange={(open) => setOpenDomain(open ? domain.id : null)}>
              <CollapsibleTrigger asChild>
                <Card className="cursor-pointer hover:shadow-sm transition-shadow">
                  <CardContent className="py-3 flex items-center gap-3">
                    <Icon className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="font-medium text-sm flex-1">{domain.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-muted">
                        <div className="h-full rounded-full" style={{ width: `${domain.satisfaction * 10}%`, backgroundColor: DRIVER_COLORS[domain.driver] }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground w-4">{domain.satisfaction}</span>
                    </div>
                    <Badge variant="outline" className="text-[9px]">{domain.goals.length} goals</Badge>
                    <ChevronDown className={`h-4 w-4 transition-transform ${openDomain === domain.id ? 'rotate-180' : ''}`} />
                  </CardContent>
                </Card>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <Card className="mt-1 border-l-4" style={{ borderLeftColor: DRIVER_COLORS[domain.driver] }}>
                  <CardContent className="pt-4 space-y-4">
                    <div>
                      <Label className="text-xs">Satisfaction: {domain.satisfaction}/10 — {SAT_LABELS[domain.satisfaction]}</Label>
                      <Slider value={[domain.satisfaction]} onValueChange={([v]) => updateLifeDomain(domain.id, { satisfaction: v })}
                        min={1} max={10} step={1} className="mt-2" />
                    </div>

                    <div>
                      <Label className="text-xs">Domain Driver</Label>
                      <div className="flex gap-1.5 mt-1">
                        {(['self-led', 'mixed', 'part-driven'] as DomainDriver[]).map((d) => (
                          <button key={d} className={`text-[10px] px-2.5 py-1 rounded-full border ${domain.driver === d ? 'font-medium' : 'opacity-60'}`}
                            style={domain.driver === d ? { borderColor: DRIVER_COLORS[d], color: DRIVER_COLORS[d] } : {}}
                            onClick={() => updateLifeDomain(domain.id, { driver: d })}>
                            {d === 'self-led' ? 'Self-Led' : d === 'part-driven' ? 'Part-Driven' : 'Mixed'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Active Parts in This Domain</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {parts.map((p) => (
                          <button key={p.id}
                            className={`text-[10px] px-2 py-0.5 rounded-full border ${domain.activeParts.includes(p.id) ? 'bg-primary text-primary-foreground border-primary' : 'border-input'}`}
                            onClick={() => updateLifeDomain(domain.id, {
                              activeParts: domain.activeParts.includes(p.id)
                                ? domain.activeParts.filter((x) => x !== p.id)
                                : [...domain.activeParts, p.id],
                            })}>
                            {p.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Goals</Label>
                      {domain.goals.map((g) => (
                        <div key={g.id} className="flex items-start gap-2 text-xs border rounded p-2">
                          <div className="flex-1">
                            <p className="font-medium">{g.text}</p>
                            {g.why && <p className="text-muted-foreground mt-0.5">{g.why}</p>}
                          </div>
                          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => removeLifeGoal(domain.id, g.id)}>
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <Input placeholder="New goal..." className="text-xs h-8 flex-1"
                          value={openDomain === domain.id ? newGoalText : ''} onChange={(e) => setNewGoalText(e.target.value)} />
                        <Button size="sm" className="h-8 text-xs" disabled={!newGoalText.trim()}
                          onClick={() => { addLifeGoal(domain.id, newGoalText, newGoalWhy); setNewGoalText(''); setNewGoalWhy(''); }}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>

      {/* Future Self */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Future Self</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground italic">
            "Imagine you are 80 years old, looking back on a life that felt truly meaningful. What do you see? What was important? What are you glad you did or became?"
          </p>
          <Textarea value={futureSelf} onChange={(e) => setFutureSelf(e.target.value)}
            placeholder="Write freely..." className="min-h-[120px]" />
        </CardContent>
      </Card>
    </div>
  );
}
