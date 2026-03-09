import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/lib/store';
import {
  useSelfEnergyStore, SELF_QUALITIES, QUALITY_INDICATORS,
  LIFE_DOMAINS, SELF_PRACTICES, SelfQuality,
} from '@/lib/selfEnergyStore';
import { ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LEADERSHIP_ITEMS = [
  'Notice when parts are activated before being swept away',
  'Maintain a sense of Self separate from parts',
  'Relate to parts from curiosity rather than reactivity',
  'Make decisions from Self rather than from a part\'s urgency',
  'Respond rather than react in triggering situations',
];

type Section = 'qualities' | 'domains' | 'blending' | 'resources' | 'leadership' | 'reflection';
const sections: { id: Section; label: string }[] = [
  { id: 'qualities', label: 'Self Qualities' },
  { id: 'domains', label: 'Life Domains' },
  { id: 'blending', label: 'Part Blending' },
  { id: 'resources', label: 'Self Resources' },
  { id: 'leadership', label: 'Self Leadership' },
  { id: 'reflection', label: 'Reflection' },
];

export default function FullSelfAssessment() {
  const navigate = useNavigate();
  const parts = useStore((s) => s.parts);
  const { addFullAssessment } = useSelfEnergyStore();

  const [sectionIdx, setSectionIdx] = useState(0);
  const [saved, setSaved] = useState(false);

  // Section 1: Quality indicators
  const [qualityScores, setQualityScores] = useState<Record<SelfQuality, number[]>>(
    Object.fromEntries(SELF_QUALITIES.map((q) => [q, QUALITY_INDICATORS[q].map(() => 4)])) as Record<SelfQuality, number[]>
  );

  // Section 2: Domain access
  const [domains, setDomains] = useState<Record<string, number>>(
    Object.fromEntries(LIFE_DOMAINS.map((d) => [d, 3]))
  );

  // Section 3: Blending
  const [blending, setBlending] = useState<{ partId: string; frequency: string; trigger: string }[]>(
    parts.map((p) => ({ partId: p.id, frequency: 'Occasionally', trigger: '' }))
  );

  // Section 4: Resources
  const [selectedPractices, setSelectedPractices] = useState<{ name: string; frequency: string }[]>([]);

  // Section 5: Leadership
  const [leadership, setLeadership] = useState<Record<string, number>>(
    Object.fromEntries(LEADERSHIP_ITEMS.map((l) => [l, 3]))
  );

  // Section 6: Reflections
  const [reflections, setReflections] = useState({ supported: '', challenged: '', remember: '' });

  const currentSection = sections[sectionIdx];
  const progress = ((sectionIdx + 1) / sections.length) * 100;

  const handleNext = () => {
    if (sectionIdx < sections.length - 1) setSectionIdx(sectionIdx + 1);
    else handleSave();
  };

  const handleSave = () => {
    addFullAssessment({
      qualityIndicators: qualityScores,
      domainAccess: domains,
      partBlending: blending,
      practices: selectedPractices,
      leadership,
      reflections,
    });
    setSaved(true);
    setTimeout(() => navigate('/self-energy'), 1500);
  };

  if (saved) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Full Assessment Saved</h2>
          <p className="text-sm text-muted-foreground">View your results on the Self-Energy dashboard.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Full Self-Energy Assessment</h1>
        <p className="text-sm text-muted-foreground">5–10 minutes · Weekly/Monthly</p>
        <div className="mt-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{currentSection.label}</span>
            <span>{sectionIdx + 1} of {sections.length}</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 mb-5 overflow-x-auto pb-1">
        {sections.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setSectionIdx(i)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all ${i === sectionIdx ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent text-muted-foreground'}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={currentSection.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              {/* SECTION 1 */}
              {currentSection.id === 'qualities' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold">Detailed Self Qualities</h2>
                  <p className="text-sm text-muted-foreground">Rate each behavioral indicator (1–7).</p>
                  {SELF_QUALITIES.map((q) => (
                    <div key={q} className="space-y-3">
                      <h3 className="text-sm font-semibold text-primary">{q}</h3>
                      {QUALITY_INDICATORS[q].map((indicator, i) => (
                        <div key={i}>
                          <p className="text-sm mb-1">{indicator}</p>
                          <div className="flex items-center gap-2">
                            <Slider
                              value={[qualityScores[q][i]]}
                              onValueChange={([v]) => {
                                const scores = { ...qualityScores };
                                scores[q] = [...scores[q]];
                                scores[q][i] = v;
                                setQualityScores(scores);
                              }}
                              max={7} min={1} step={1}
                            />
                            <span className="text-xs text-muted-foreground w-6 text-right">{qualityScores[q][i]}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {/* SECTION 2 */}
              {currentSection.id === 'domains' && (
                <div className="space-y-5">
                  <h2 className="text-lg font-semibold">Self Access by Life Domain</h2>
                  <p className="text-sm text-muted-foreground">Rate your Self-energy access in each context (1–5).</p>
                  {LIFE_DOMAINS.map((d) => (
                    <div key={d}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{d}</span>
                        <span className="text-muted-foreground">{domains[d]}/5</span>
                      </div>
                      <Slider
                        value={[domains[d]]}
                        onValueChange={([v]) => setDomains({ ...domains, [d]: v })}
                        max={5} min={1} step={1}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* SECTION 3 */}
              {currentSection.id === 'blending' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Part Blending Patterns</h2>
                  <p className="text-sm text-muted-foreground">How often does each part blend with your Self?</p>
                  {blending.map((b, i) => {
                    const p = parts.find((pp) => pp.id === b.partId);
                    if (!p) return null;
                    return (
                      <div key={b.partId} className="border rounded-lg p-3 space-y-2">
                        <div className="font-medium text-sm">{p.name}</div>
                        <div className="flex gap-1.5 flex-wrap">
                          {['Never', 'Occasionally', 'Frequently', 'Almost Always'].map((f) => (
                            <button
                              key={f}
                              onClick={() => {
                                const nb = [...blending];
                                nb[i] = { ...nb[i], frequency: f };
                                setBlending(nb);
                              }}
                              className={`px-2.5 py-1 rounded text-xs border transition-all ${b.frequency === f ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent'}`}
                            >
                              {f}
                            </button>
                          ))}
                        </div>
                        {(b.frequency === 'Frequently' || b.frequency === 'Almost Always') && (
                          <Textarea
                            placeholder="What typically triggers this blending?"
                            value={b.trigger}
                            onChange={(e) => {
                              const nb = [...blending];
                              nb[i] = { ...nb[i], trigger: e.target.value };
                              setBlending(nb);
                            }}
                            rows={2}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* SECTION 4 */}
              {currentSection.id === 'resources' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Self Resources</h2>
                  <p className="text-sm text-muted-foreground">Which practices support your Self-energy?</p>
                  <div className="space-y-2">
                    {SELF_PRACTICES.map((pr) => {
                      const sel = selectedPractices.find((sp) => sp.name === pr);
                      return (
                        <div key={pr} className="space-y-1">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={!!sel}
                              onCheckedChange={(checked) => {
                                if (checked) setSelectedPractices([...selectedPractices, { name: pr, frequency: 'Weekly' }]);
                                else setSelectedPractices(selectedPractices.filter((sp) => sp.name !== pr));
                              }}
                            />
                            <span className="text-sm">{pr}</span>
                          </label>
                          {sel && (
                            <div className="ml-6 flex gap-1.5">
                              {['Daily', 'Several times/week', 'Weekly', 'Rarely'].map((f) => (
                                <button
                                  key={f}
                                  onClick={() => setSelectedPractices(selectedPractices.map((sp) => sp.name === pr ? { ...sp, frequency: f } : sp))}
                                  className={`px-2 py-1 rounded text-xs border transition-all ${sel.frequency === f ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent'}`}
                                >
                                  {f}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION 5 */}
              {currentSection.id === 'leadership' && (
                <div className="space-y-5">
                  <h2 className="text-lg font-semibold">Self Leadership</h2>
                  <p className="text-sm text-muted-foreground">Rate your capacity (1–5).</p>
                  {LEADERSHIP_ITEMS.map((item) => (
                    <div key={item}>
                      <p className="text-sm mb-1">{item}</p>
                      <div className="flex items-center gap-2">
                        <Slider
                          value={[leadership[item]]}
                          onValueChange={([v]) => setLeadership({ ...leadership, [item]: v })}
                          max={5} min={1} step={1}
                        />
                        <span className="text-xs text-muted-foreground w-6 text-right">{leadership[item]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* SECTION 6 */}
              {currentSection.id === 'reflection' && (
                <div className="space-y-5">
                  <h2 className="text-lg font-semibold">Open Reflection</h2>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">What has supported your Self-energy most this week?</label>
                    <Textarea value={reflections.supported} onChange={(e) => setReflections({ ...reflections, supported: e.target.value })} rows={3} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">What has challenged your Self-energy most this week?</label>
                    <Textarea value={reflections.challenged} onChange={(e) => setReflections({ ...reflections, challenged: e.target.value })} rows={3} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Is there anything you'd like your Self to know or remember right now?</label>
                    <Textarea value={reflections.remember} onChange={(e) => setReflections({ ...reflections, remember: e.target.value })} rows={3} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => setSectionIdx(Math.max(0, sectionIdx - 1))} disabled={sectionIdx === 0}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Previous
        </Button>
        <Button onClick={handleNext}>
          {sectionIdx === sections.length - 1 ? 'Save Assessment' : 'Next'} <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
