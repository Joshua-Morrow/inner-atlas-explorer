import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useAssessmentStore, Stage2Answers } from '@/lib/assessmentStore';
import { lifeContexts, durationOptions, recoveryOptions } from '@/lib/assessmentData';

const defaultAnswers: Stage2Answers[string] = {
  triggers: [0, 0, 0, 0, 0],
  manifestations: { cognitive: 0, emotional: 0, interoceptive: 0, behavioral: 0 },
  intensity: 'Medium',
  lifeContexts: {},
  somaticLocation: '',
  bodyPoints: [],
  duration: '',
  recovery: '',
  historicalOrigins: '',
  partPerspective: '',
  personalNotes: '',
};

const scaleLabels = ['Never', 'Rarely', 'Sometimes', 'Often', 'Very Frequently'];

export default function Stage2() {
  const {
    identifiedParts, stage2Answers, setStage2Answer,
    stage2CurrentIndex, setStage2CurrentIndex, setStage,
  } = useAssessmentStore();

  const total = identifiedParts.length;
  const current = identifiedParts[stage2CurrentIndex];
  if (!current) return null;

  const partDef = current.partDef;
  const answers = stage2Answers[partDef.id] || defaultAnswers;
  const progress = (stage2CurrentIndex / total) * 100;

  const typeBadgeClass = (type: string) => {
    if (type === 'Manager') return 'bg-ifs-manager/15 text-ifs-manager border-ifs-manager/30';
    if (type === 'Firefighter') return 'bg-ifs-firefighter/15 text-ifs-firefighter border-ifs-firefighter/30';
    return 'bg-ifs-exile/15 text-ifs-exile border-ifs-exile/30';
  };

  const handleNext = () => {
    if (stage2CurrentIndex < total - 1) {
      setStage2CurrentIndex(stage2CurrentIndex + 1);
    } else {
      setStage('breath2');
    }
  };

  const handlePrev = () => {
    if (stage2CurrentIndex > 0) setStage2CurrentIndex(stage2CurrentIndex - 1);
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Stage 2: Parts Specifics</span>
          <span>Part {stage2CurrentIndex + 1} of {total}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={partDef.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
        >
          <Card className="border-0 shadow-md">
            <CardContent className="p-6 md:p-8 space-y-8">
              {/* Header */}
              <div>
                <Badge variant="outline" className={typeBadgeClass(partDef.type)}>{partDef.type}</Badge>
                <h2 className="text-xl font-semibold mt-2">{partDef.name}</h2>
                <p className="text-sm text-muted-foreground">{partDef.description}</p>
              </div>

              {/* Triggers */}
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">Triggers</h3>
                <div className="space-y-4">
                  {partDef.triggerStatements.map((t, ti) => (
                    <div key={ti} className="space-y-1">
                      <p className="text-sm">{t}</p>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            onClick={() => {
                              const triggers = [...(answers.triggers || [0, 0, 0, 0, 0])];
                              triggers[ti] = val;
                              setStage2Answer(partDef.id, { triggers });
                            }}
                            className={`flex-1 py-1.5 rounded-md text-xs font-medium border transition-all
                              ${(answers.triggers?.[ti] || 0) === val
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-card border-border hover:bg-accent text-muted-foreground'
                              }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Manifestations */}
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">Manifestation Channels</h3>
                <div className="space-y-3">
                  {(['cognitive', 'emotional', 'interoceptive', 'behavioral'] as const).map((channel) => (
                    <div key={channel} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{channel}</span>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            onClick={() => {
                              const m = { ...(answers.manifestations || { cognitive: 0, emotional: 0, interoceptive: 0, behavioral: 0 }) };
                              m[channel] = val;
                              setStage2Answer(partDef.id, { manifestations: m });
                            }}
                            className={`w-8 h-8 rounded-md text-xs font-medium border transition-all
                              ${(answers.manifestations?.[channel] || 0) === val
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-card border-border hover:bg-accent text-muted-foreground'
                              }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Intensity */}
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">Intensity Level</h3>
                <div className="grid grid-cols-3 gap-3">
                  {(['Low', 'Medium', 'High'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setStage2Answer(partDef.id, { intensity: level })}
                      className={`p-3 rounded-lg border text-left transition-all
                        ${answers.intensity === level
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border hover:bg-accent'
                        }`}
                    >
                      <div className="font-medium text-sm">{level}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {partDef.intensityDescriptors[level.toLowerCase() as 'low' | 'medium' | 'high']}
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* Life Contexts */}
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">Life Contexts</h3>
                <div className="space-y-3">
                  {lifeContexts.map((ctx) => (
                    <div key={ctx} className="flex items-center justify-between">
                      <span className="text-sm">{ctx}</span>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            onClick={() => {
                              const lc = { ...(answers.lifeContexts || {}) };
                              lc[ctx] = val;
                              setStage2Answer(partDef.id, { lifeContexts: lc });
                            }}
                            className={`w-8 h-8 rounded-md text-xs font-medium border transition-all
                              ${(answers.lifeContexts?.[ctx] || 0) === val
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-card border-border hover:bg-accent text-muted-foreground'
                              }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Somatic */}
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">Somatic Markers</h3>
                <Input
                  placeholder="Where do you feel this part in your body? (e.g., chest, stomach, throat)"
                  value={answers.somaticLocation || ''}
                  onChange={(e) => setStage2Answer(partDef.id, { somaticLocation: e.target.value })}
                />
              </section>

              {/* Duration & Recovery */}
              <section className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">Duration</h3>
                  <div className="space-y-1">
                    {durationOptions.map((d) => (
                      <button
                        key={d}
                        onClick={() => setStage2Answer(partDef.id, { duration: d })}
                        className={`w-full text-left px-3 py-1.5 rounded text-sm border transition-all
                          ${answers.duration === d ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent'}`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">Recovery</h3>
                  <div className="space-y-1">
                    {recoveryOptions.map((r) => (
                      <button
                        key={r}
                        onClick={() => setStage2Answer(partDef.id, { recovery: r })}
                        className={`w-full text-left px-3 py-1.5 rounded text-sm border transition-all
                          ${answers.recovery === r ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent'}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* Historical Origins */}
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">Historical Origins</h3>
                <p className="text-xs text-muted-foreground mb-2">When did you first notice this part? What experiences may have shaped it?</p>
                <Textarea
                  value={answers.historicalOrigins || ''}
                  onChange={(e) => setStage2Answer(partDef.id, { historicalOrigins: e.target.value })}
                  placeholder="Optional — share what feels right"
                  rows={3}
                />
              </section>

              {/* Part's Perspective */}
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">Part's Perspective</h3>
                <p className="text-xs text-muted-foreground mb-2">If this part could speak, what would it say its job is? What is it afraid of?</p>
                <Textarea
                  value={answers.partPerspective || ''}
                  onChange={(e) => setStage2Answer(partDef.id, { partPerspective: e.target.value })}
                  placeholder="Optional — let this part speak"
                  rows={3}
                />
              </section>

              {/* Personal Notes */}
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">Personal Notes</h3>
                <Textarea
                  value={answers.personalNotes || ''}
                  onChange={(e) => setStage2Answer(partDef.id, { personalNotes: e.target.value })}
                  placeholder="Anything else you want to note about this part"
                  rows={2}
                />
              </section>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={handlePrev} disabled={stage2CurrentIndex === 0}>
          <ChevronLeft className="mr-1 h-4 w-4" /> Previous
        </Button>
        <Button onClick={handleNext}>
          {stage2CurrentIndex === total - 1 ? 'Continue' : 'Next Part'} <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
