import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useAssessmentStore } from '@/lib/assessmentStore';
import { protectionStrategies, selfQualities } from '@/lib/assessmentData';

type Step = 'protector-exile' | 'manager-pairs' | 'ff-manager' | 'exile-pairs' | 'system' | 'self-energy';
const steps: Step[] = ['protector-exile', 'manager-pairs', 'ff-manager', 'exile-pairs', 'system', 'self-energy'];
const stepLabels: Record<Step, string> = {
  'protector-exile': 'Protection Dynamics',
  'manager-pairs': 'Manager Relationships',
  'ff-manager': 'Firefighter–Manager Links',
  'exile-pairs': 'Exile Connections',
  'system': 'System-Level Questions',
  'self-energy': 'Self-Energy Assessment',
};

export default function Stage3() {
  const {
    identifiedParts, stage3Answers, setStage3Answers,
    stage3CurrentStep, setStage3CurrentStep, completeAssessment,
  } = useAssessmentStore();

  const protectors = identifiedParts.filter(p => p.partDef.type === 'Manager' || p.partDef.type === 'Firefighter');
  const managers = identifiedParts.filter(p => p.partDef.type === 'Manager');
  const firefighters = identifiedParts.filter(p => p.partDef.type === 'Firefighter');
  const exiles = identifiedParts.filter(p => p.partDef.type === 'Exile');

  const currentStep = steps[stage3CurrentStep];
  const progress = ((stage3CurrentStep) / steps.length) * 100;

  const handleNext = () => {
    if (stage3CurrentStep < steps.length - 1) {
      setStage3CurrentStep(stage3CurrentStep + 1);
    } else {
      completeAssessment();
    }
  };

  const handlePrev = () => {
    if (stage3CurrentStep > 0) setStage3CurrentStep(stage3CurrentStep - 1);
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Stage 3: Relationship Mapping</span>
          <span>{stepLabels[currentStep]}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="border-0 shadow-md">
        <CardContent className="p-6 md:p-8">
          {currentStep === 'protector-exile' && (
            <ProtectorExileStep protectors={protectors} exiles={exiles} />
          )}
          {currentStep === 'manager-pairs' && <ManagerPairsStep managers={managers} />}
          {currentStep === 'ff-manager' && <FFManagerStep firefighters={firefighters} managers={managers} />}
          {currentStep === 'exile-pairs' && <ExilePairsStep exiles={exiles} />}
          {currentStep === 'system' && <SystemStep parts={identifiedParts} />}
          {currentStep === 'self-energy' && <SelfEnergyStep />}
        </CardContent>
      </Card>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={handlePrev} disabled={stage3CurrentStep === 0}>
          <ChevronLeft className="mr-1 h-4 w-4" /> Previous
        </Button>
        <Button onClick={handleNext}>
          {stage3CurrentStep === steps.length - 1 ? 'Complete Assessment' : 'Next'} <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function ProtectorExileStep({ protectors, exiles }: { protectors: any[]; exiles: any[] }) {
  const { stage3Answers, setStage3Answers } = useAssessmentStore();
  const links = stage3Answers.protectorExileLinks || [];

  if (protectors.length === 0 || exiles.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No protector-exile pairs to map. Continue to the next step.</p>;
  }

  const toggleLink = (protectorId: string, exileId: string) => {
    const existing = links.find(l => l.protectorId === protectorId && l.exileId === exileId);
    if (existing) {
      setStage3Answers({ protectorExileLinks: links.filter(l => !(l.protectorId === protectorId && l.exileId === exileId)) });
    } else {
      setStage3Answers({ protectorExileLinks: [...links, { protectorId, exileId, strength: 'Moderately', strategies: [] }] });
    }
  };

  const updateLink = (protectorId: string, exileId: string, field: string, value: any) => {
    setStage3Answers({
      protectorExileLinks: links.map(l =>
        l.protectorId === protectorId && l.exileId === exileId ? { ...l, [field]: value } : l
      ),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Protection Dynamics</h3>
        <p className="text-sm text-muted-foreground">For each protector, select which exile parts it guards.</p>
      </div>
      {protectors.map((prot) => (
        <div key={prot.partDef.id} className="border rounded-lg p-4 space-y-3">
          <div className="font-medium">{prot.partDef.name} <Badge variant="outline" className="ml-2 text-xs">{prot.partDef.type}</Badge></div>
          <p className="text-xs text-muted-foreground">Which exiles does this part protect?</p>
          <div className="space-y-2">
            {exiles.map((exile) => {
              const link = links.find(l => l.protectorId === prot.partDef.id && l.exileId === exile.partDef.id);
              return (
                <div key={exile.partDef.id} className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={!!link}
                      onCheckedChange={() => toggleLink(prot.partDef.id, exile.partDef.id)}
                    />
                    <span className="text-sm">{exile.partDef.name}</span>
                  </label>
                  {link && (
                    <div className="ml-6 space-y-2">
                      <div className="flex gap-2">
                        {['Mildly', 'Moderately', 'Intensely'].map((s) => (
                          <button
                            key={s}
                            onClick={() => updateLink(prot.partDef.id, exile.partDef.id, 'strength', s)}
                            className={`px-3 py-1 rounded text-xs border transition-all
                              ${link.strength === s ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent'}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {protectionStrategies.map((strat) => (
                          <label key={strat} className="flex items-center gap-1.5 text-xs cursor-pointer">
                            <Checkbox
                              checked={link.strategies.includes(strat)}
                              onCheckedChange={(checked) => {
                                const strategies = checked
                                  ? [...link.strategies, strat]
                                  : link.strategies.filter((s: string) => s !== strat);
                                updateLink(prot.partDef.id, exile.partDef.id, 'strategies', strategies);
                              }}
                            />
                            {strat}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function ManagerPairsStep({ managers }: { managers: any[] }) {
  const { stage3Answers, setStage3Answers } = useAssessmentStore();
  const rels = stage3Answers.managerRelationships || [];
  const options = ['Work together as allies', 'Frequently in conflict', 'One dominates the other', 'Occasional tension', 'Rarely interact'];

  if (managers.length < 2) {
    return <p className="text-muted-foreground text-center py-8">Not enough managers to compare. Continue to the next step.</p>;
  }

  const pairs: [any, any][] = [];
  for (let i = 0; i < managers.length; i++)
    for (let j = i + 1; j < managers.length; j++)
      pairs.push([managers[i], managers[j]]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Manager Relationships</h3>
        <p className="text-sm text-muted-foreground">How do your manager parts relate to each other?</p>
      </div>
      {pairs.map(([a, b]) => {
        const rel = rels.find(r => r.partAId === a.partDef.id && r.partBId === b.partDef.id);
        return (
          <div key={`${a.partDef.id}-${b.partDef.id}`} className="border rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">{a.partDef.name} ↔ {b.partDef.name}</p>
            <div className="space-y-1">
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    const others = rels.filter(r => !(r.partAId === a.partDef.id && r.partBId === b.partDef.id));
                    setStage3Answers({ managerRelationships: [...others, { partAId: a.partDef.id, partBId: b.partDef.id, relationship: opt }] });
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded text-sm border transition-all
                    ${rel?.relationship === opt ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FFManagerStep({ firefighters, managers }: { firefighters: any[]; managers: any[] }) {
  const { stage3Answers, setStage3Answers } = useAssessmentStore();
  const links = stage3Answers.firefighterManagerLinks || [];

  if (firefighters.length === 0 || managers.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No firefighter–manager pairs to map. Continue to the next step.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Firefighter–Manager Dynamics</h3>
        <p className="text-sm text-muted-foreground">When a manager fails to contain activation, does the firefighter step in?</p>
      </div>
      {firefighters.map((ff) =>
        managers.map((mgr) => {
          const link = links.find(l => l.firefighterId === ff.partDef.id && l.managerId === mgr.partDef.id);
          return (
            <div key={`${ff.partDef.id}-${mgr.partDef.id}`} className="border rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium">When <strong>{mgr.partDef.name}</strong> fails, does <strong>{ff.partDef.name}</strong> step in?</p>
              <div className="flex gap-2">
                {['Yes', 'Sometimes', 'No'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      const others = links.filter(l => !(l.firefighterId === ff.partDef.id && l.managerId === mgr.partDef.id));
                      setStage3Answers({ firefighterManagerLinks: [...others, { firefighterId: ff.partDef.id, managerId: mgr.partDef.id, stepsIn: opt }] });
                    }}
                    className={`flex-1 py-2 rounded text-sm border transition-all
                      ${link?.stepsIn === opt ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function ExilePairsStep({ exiles }: { exiles: any[] }) {
  const { stage3Answers, setStage3Answers } = useAssessmentStore();
  const pairs_ = stage3Answers.exilePairs || [];

  if (exiles.length < 2) {
    return <p className="text-muted-foreground text-center py-8">Not enough exiles to compare. Continue to the next step.</p>;
  }

  const pairs: [any, any][] = [];
  for (let i = 0; i < exiles.length; i++)
    for (let j = i + 1; j < exiles.length; j++)
      pairs.push([exiles[i], exiles[j]]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Exile Connections</h3>
        <p className="text-sm text-muted-foreground">Do these exile parts share similar burdens or wounds?</p>
      </div>
      {pairs.map(([a, b]) => {
        const pair = pairs_.find(p => p.exileAId === a.partDef.id && p.exileBId === b.partDef.id);
        return (
          <div key={`${a.partDef.id}-${b.partDef.id}`} className="border rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">{a.partDef.name} & {b.partDef.name}</p>
            <div className="flex gap-2">
              {['Yes', 'Sometimes', 'No'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    const others = pairs_.filter(p => !(p.exileAId === a.partDef.id && p.exileBId === b.partDef.id));
                    setStage3Answers({ exilePairs: [...others, { exileAId: a.partDef.id, exileBId: b.partDef.id, sharedBurdens: opt }] });
                  }}
                  className={`flex-1 py-2 rounded text-sm border transition-all
                    ${pair?.sharedBurdens === opt ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SystemStep({ parts }: { parts: any[] }) {
  const { stage3Answers, setStage3Answers } = useAssessmentStore();

  const toggleDominant = (id: string) => {
    const current = stage3Answers.dominantParts || [];
    if (current.includes(id)) {
      setStage3Answers({ dominantParts: current.filter(d => d !== id) });
    } else if (current.length < 3) {
      setStage3Answers({ dominantParts: [...current, id] });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">System Overview</h3>
        <p className="text-sm text-muted-foreground">A few big-picture questions about your internal system.</p>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2">Which parts are most dominant in your daily life? (Select up to 3)</h4>
        <div className="space-y-1">
          {parts.map((p) => (
            <label key={p.partDef.id} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-accent">
              <Checkbox
                checked={(stage3Answers.dominantParts || []).includes(p.partDef.id)}
                onCheckedChange={() => toggleDominant(p.partDef.id)}
                disabled={!(stage3Answers.dominantParts || []).includes(p.partDef.id) && (stage3Answers.dominantParts || []).length >= 3}
              />
              <span className="text-sm">{p.partDef.name}</span>
              <Badge variant="outline" className="text-xs ml-auto">{p.partDef.type}</Badge>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function SelfEnergyStep() {
  const { stage3Answers, setStage3Answers } = useAssessmentStore();
  const ratings = stage3Answers.selfCQualities || {};

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Self-Energy Assessment</h3>
        <p className="text-sm text-muted-foreground">Rate your current access to each of the 8 C's of Self.</p>
      </div>
      <div className="space-y-4">
        {selfQualities.map((q) => (
          <div key={q} className="flex items-center justify-between">
            <span className="text-sm font-medium">{q}</span>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  onClick={() => setStage3Answers({ selfCQualities: { ...ratings, [q]: val } })}
                  className={`w-9 h-9 rounded-full text-xs font-medium border-2 transition-all
                    ${ratings[q] === val
                      ? 'bg-ifs-self text-foreground border-ifs-self'
                      : 'border-border hover:border-ifs-self/50 text-muted-foreground'
                    }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
