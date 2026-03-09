import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import { useAssessmentStore } from '@/lib/assessmentStore';
import { allAssessmentParts } from '@/lib/assessmentData';

const scaleLabels = ['Never', 'Rarely', 'Sometimes', 'Often', 'Very Frequently'];

export default function Stage1() {
  const {
    stage1Answers, setStage1Answer, stage1CurrentIndex, setStage1CurrentIndex,
    computeIdentifiedParts, setStage, identifiedParts,
  } = useAssessmentStore();

  const [showSummary, setShowSummary] = useState(false);

  const totalParts = allAssessmentParts.length;
  const currentPart = allAssessmentParts[stage1CurrentIndex];
  const answers = stage1Answers[currentPart?.id] || [0, 0, 0, 0, 0];
  const allAnswered = answers.every((a) => a > 0);
  const progress = ((stage1CurrentIndex) / totalParts) * 100;

  const typeBadgeClass = (type: string) => {
    if (type === 'Manager') return 'bg-ifs-manager/15 text-ifs-manager border-ifs-manager/30';
    if (type === 'Firefighter') return 'bg-ifs-firefighter/15 text-ifs-firefighter border-ifs-firefighter/30';
    return 'bg-ifs-exile/15 text-ifs-exile border-ifs-exile/30';
  };

  const handleNext = () => {
    if (stage1CurrentIndex < totalParts - 1) {
      setStage1CurrentIndex(stage1CurrentIndex + 1);
    } else {
      computeIdentifiedParts();
      setShowSummary(true);
    }
  };

  const handlePrev = () => {
    if (stage1CurrentIndex > 0) setStage1CurrentIndex(stage1CurrentIndex - 1);
  };

  if (showSummary) {
    const highly = identifiedParts.filter((p) => p.status === 'highly-active');
    const moderate = identifiedParts.filter((p) => p.status === 'moderately-active');
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Stage 1 Complete</h2>
          <p className="text-muted-foreground">
            We identified <strong>{identifiedParts.length}</strong> active parts in your system.
          </p>
        </div>

        {highly.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">Highly Active</h3>
            <div className="grid gap-2">
              {highly.map((ip) => (
                <div key={ip.partDef.id} className="flex items-center justify-between p-3 rounded-lg bg-card border">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={typeBadgeClass(ip.partDef.type)}>{ip.partDef.type}</Badge>
                    <span className="font-medium">{ip.partDef.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Score: {ip.averageScore.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {moderate.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">Moderately Active</h3>
            <div className="grid gap-2">
              {moderate.map((ip) => (
                <div key={ip.partDef.id} className="flex items-center justify-between p-3 rounded-lg bg-card border">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={typeBadgeClass(ip.partDef.type)}>{ip.partDef.type}</Badge>
                    <span className="font-medium">{ip.partDef.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Score: {ip.averageScore.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button onClick={() => setStage('breath1')} size="lg" className="w-full">
          Continue to Stage 2 <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Stage 1: Parts Identification</span>
          <span>{stage1CurrentIndex + 1} of {totalParts}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentPart.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
        >
          <Card className="border-0 shadow-md">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline" className={typeBadgeClass(currentPart.type)}>
                  {currentPart.type}
                </Badge>
              </div>
              <h2 className="text-xl font-semibold mb-1">{currentPart.name}</h2>
              <p className="text-muted-foreground text-sm mb-6">{currentPart.description}</p>

              <div className="space-y-5">
                {currentPart.screeningQuestions.map((q, qi) => (
                  <div key={qi} className="space-y-2">
                    <p className="text-sm font-medium leading-relaxed">{q}</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          onClick={() => setStage1Answer(currentPart.id, qi, val)}
                          className={`flex-1 py-2 px-1 rounded-md text-xs font-medium border transition-all
                            ${answers[qi] === val
                              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                              : 'bg-card border-border hover:bg-accent text-muted-foreground hover:text-foreground'
                            }`}
                        >
                          <div>{val}</div>
                          <div className="hidden sm:block text-[10px] opacity-80">{scaleLabels[val - 1]}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={handlePrev} disabled={stage1CurrentIndex === 0}>
          <ChevronLeft className="mr-1 h-4 w-4" /> Previous
        </Button>
        <Button onClick={handleNext} disabled={!allAnswered}>
          {stage1CurrentIndex === totalParts - 1 ? 'View Results' : 'Next'} <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
