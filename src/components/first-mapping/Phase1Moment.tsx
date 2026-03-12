import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useFirstMapStore } from '@/lib/firstMapStore';
import { phase1Questions } from '@/lib/firstMapData';
import QuestionScreen from './QuestionScreen';
import MiniMapPreview from './MiniMapPreview';

export default function Phase1Moment() {
  const { phase1Answers, setPhase1Answer, setPhase, computeInferences, namedParts } = useFirstMapStore();
  const [step, setStep] = useState(0);

  const question = phase1Questions[step];
  if (!question) return null;

  const value = phase1Answers[question.id] || (question.type === 'multi-select' ? [] : '');
  const followUpKey = `${question.id}-followUp`;
  const followUpValue = phase1Answers[followUpKey] as string | undefined;

  const handleContinue = () => {
    if (step < phase1Questions.length - 1) {
      setStep(step + 1);
    } else {
      computeInferences();
      setPhase('phase2-intro');
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6">
      {/* Mini map in corner */}
      <div className="fixed top-20 right-6 z-10 w-40 opacity-70">
        <MiniMapPreview parts={namedParts} />
      </div>

      {/* Progress dots */}
      <div className="flex gap-2 mb-8">
        {phase1Questions.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${
              i === step
                ? 'bg-[hsl(45,90%,50%)] w-6'
                : i < step
                ? 'bg-[hsl(45,90%,50%)] opacity-50'
                : 'bg-[hsl(40,15%,25%)]'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <QuestionScreen
          key={question.id}
          question={question}
          value={value}
          followUpValue={followUpValue}
          onAnswer={(v) => setPhase1Answer(question.id, v)}
          onFollowUp={(t) => setPhase1Answer(followUpKey, t)}
          onContinue={handleContinue}
        />
      </AnimatePresence>

      {/* Back button */}
      {step > 0 && (
        <button
          onClick={() => setStep(step - 1)}
          className="mt-4 text-xs text-[hsl(40,15%,40%)] hover:text-[hsl(40,20%,60%)] transition-colors"
        >
          ← Back
        </button>
      )}
    </div>
  );
}
