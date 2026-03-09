import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Wind } from 'lucide-react';

interface BreathPromptProps {
  fromStage: string;
  toStage: string;
  onContinue: () => void;
}

export default function BreathPrompt({ fromStage, toStage, onContinue }: BreathPromptProps) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-md mx-auto px-6"
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8"
        >
          <Wind className="w-10 h-10 text-primary" />
        </motion.div>

        <h2 className="text-2xl font-semibold text-foreground mb-3">Take a breath</h2>
        <p className="text-muted-foreground mb-2">
          You've completed {fromStage}. Before moving to {toStage}, take a moment to pause.
        </p>
        <p className="text-muted-foreground mb-8 text-sm">
          Notice how you're feeling. There's no rush. Your parts appreciate being seen.
        </p>

        <Button onClick={onContinue} size="lg" className="px-8">
          I'm ready to continue
        </Button>
      </motion.div>
    </div>
  );
}
