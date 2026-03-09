import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useStore } from '@/lib/store';
import {
  useSelfEnergyStore, SELF_QUALITIES, QUALITY_DESCRIPTIONS,
  CONTEXT_CHIPS, BlendedPart, SelfQuality,
} from '@/lib/selfEnergyStore';
import { CheckCircle2, Link as LinkIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export default function QuickCheckIn() {
  const navigate = useNavigate();
  const parts = useStore((s) => s.parts);
  const { addCheckIn } = useSelfEnergyStore();

  const [overall, setOverall] = useState([50]);
  const [qualities, setQualities] = useState<Record<SelfQuality, number>>(
    Object.fromEntries(SELF_QUALITIES.map((q) => [q, 3])) as Record<SelfQuality, number>
  );
  const [blended, setBlended] = useState<BlendedPart[]>([]);
  const [contexts, setContexts] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  const radarData = SELF_QUALITIES.map((q) => ({ quality: q, value: qualities[q], fullMark: 5 }));

  const toggleBlended = (partId: string) => {
    if (blended.find((b) => b.partId === partId)) {
      setBlended(blended.filter((b) => b.partId !== partId));
    } else if (blended.length < 3) {
      setBlended([...blended, { partId, strength: 'Moderate' }]);
    }
  };

  const handleSave = () => {
    addCheckIn({ overallEnergy: overall[0], qualities, blendedParts: blended, context: contexts, note });
    setSaved(true);
    setTimeout(() => navigate('/self-energy'), 1500);
  };

  if (saved) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Check-In Saved</h2>
          <p className="text-sm text-muted-foreground">Your Self-energy has been recorded.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quick Self-Energy Check-In</h1>
        <p className="text-sm text-muted-foreground">1–2 minutes · Daily practice</p>
      </div>

      {/* Section 1 — Overall */}
      <Card className="border-0 shadow-md overflow-hidden">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Overall Self-Energy</h2>
          <p className="text-sm">How connected do you feel to your Self right now?</p>

          {/* Circular gauge */}
          <div className="flex justify-center">
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke="url(#goldGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(overall[0] / 100) * 263.9} 263.9`}
                />
                <defs>
                  <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(45, 90%, 50%)" />
                    <stop offset="100%" stopColor="hsl(35, 95%, 55%)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-foreground">{overall[0]}%</span>
              </div>
            </div>
          </div>
          <Slider value={overall} onValueChange={setOverall} max={100} min={0} step={1} />
        </CardContent>
      </Card>

      {/* Section 2 — 8 C's */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">The 8 C's of Self</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <div className="space-y-4">
              {SELF_QUALITIES.map((q) => (
                <div key={q}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{q}</span>
                    <span className="text-muted-foreground">{qualities[q]}/5</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{QUALITY_DESCRIPTIONS[q]}</p>
                  <Slider
                    value={[qualities[q]]}
                    onValueChange={([v]) => setQualities({ ...qualities, [q]: v })}
                    max={5} min={1} step={1}
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center mt-4 md:mt-0">
              <ResponsiveContainer width={260} height={260}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="quality" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
                  <Radar dataKey="value" stroke="hsl(45, 90%, 50%)" fill="hsl(45, 90%, 50%)" fillOpacity={0.25} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3 — Blending */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Current Blending Check</h2>
          <p className="text-sm">Which parts feel most active or blended right now? (Up to 3)</p>
          <div className="flex flex-wrap gap-2">
            {parts.map((p) => {
              const sel = blended.find((b) => b.partId === p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => toggleBlended(p.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${sel ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent text-muted-foreground'}`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
          {blended.map((b) => {
            const p = parts.find((pp) => pp.id === b.partId);
            return (
              <div key={b.partId} className="flex items-center gap-3 pl-2">
                <span className="text-sm font-medium w-24 truncate">{p?.name}</span>
                <div className="flex gap-1.5">
                  {(['Mild', 'Moderate', 'Strong'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setBlended(blended.map((bb) => bb.partId === b.partId ? { ...bb, strength: s } : bb))}
                      className={`px-2.5 py-1 rounded text-xs border transition-all ${b.strength === s ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Section 4 — Context */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Context</h2>
          <div className="flex flex-wrap gap-2">
            {CONTEXT_CHIPS.map((c) => (
              <button
                key={c}
                onClick={() => setContexts(contexts.includes(c) ? contexts.filter((x) => x !== c) : [...contexts, c])}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${contexts.includes(c) ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent text-muted-foreground'}`}
              >
                {c}
              </button>
            ))}
          </div>
          <Input placeholder="Optional note (1 sentence)" value={note} onChange={(e) => setNote(e.target.value)} />
        </CardContent>
      </Card>

      {/* Low energy prompt */}
      {overall[0] < 30 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-lg bg-accent border border-primary/20">
          <p className="text-sm mb-2">When Self-energy is low, a grounding practice can help before exploring parts.</p>
          <Button variant="outline" size="sm" onClick={() => navigate('/self-energy/practices')}>
            <LinkIcon className="h-3.5 w-3.5 mr-1.5" /> Try a Grounding Practice
          </Button>
        </motion.div>
      )}

      <Button onClick={handleSave} size="lg" className="w-full">Save Check-In</Button>
    </div>
  );
}
