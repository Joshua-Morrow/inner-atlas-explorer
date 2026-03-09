import { useAssessmentStore } from '@/lib/assessmentStore';
import Stage1 from '@/components/assessment/Stage1';
import Stage2 from '@/components/assessment/Stage2';
import Stage3 from '@/components/assessment/Stage3';
import BreathPrompt from '@/components/assessment/BreathPrompt';
import AssessmentComplete from '@/components/assessment/AssessmentComplete';
import { Button } from '@/components/ui/button';
import { Shield, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Assessment() {
  const { currentStage, setStage } = useAssessmentStore();

  if (currentStage === 'not-started') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto text-center px-6"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Welcome to Inner Atlas</h1>
          <p className="text-muted-foreground mb-2">
            Let's map your internal system together. This assessment has three stages and takes about 20–30 minutes.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            You can save your progress and return at any time. There are no right or wrong answers — only honest ones.
          </p>
          <Button onClick={() => setStage('stage1')} size="lg" className="gap-2 px-8">
            Begin Assessment <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    );
  }

  if (currentStage === 'stage1') return <Stage1 />;

  if (currentStage === 'breath1') {
    return (
      <BreathPrompt
        fromStage="Parts Identification"
        toStage="Parts Specifics"
        onContinue={() => setStage('stage2')}
      />
    );
  }

  if (currentStage === 'stage2') return <Stage2 />;

  if (currentStage === 'breath2') {
    return (
      <BreathPrompt
        fromStage="Parts Specifics"
        toStage="Relationship Mapping"
        onContinue={() => setStage('stage3')}
      />
    );
  }

  if (currentStage === 'stage3') return <Stage3 />;

  if (currentStage === 'complete') return <AssessmentComplete />;

  return null;
}
