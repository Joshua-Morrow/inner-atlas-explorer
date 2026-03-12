import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFirstMapStore } from '@/lib/firstMapStore';
import { underneathOptions, pullingAwayOptions, selfAccessOptions } from '@/lib/firstMapData';
import MiniMapPreview from './MiniMapPreview';

export default function Phase3Connections() {
  const {
    namedParts, phase3Answers, setPhase3Answer,
    setSelfEnergyBaseline, setPhase,
  } = useFirstMapStore();
  const [step, setStep] = useState(0);

  const protectors = useMemo(() => namedParts.filter((p) => p.type !== 'Exile' && p.status === 'named'), [namedParts]);
  const firefighters = useMemo(() => namedParts.filter((p) => p.type === 'Protector-Firefighter'), [namedParts]);
  const managerA = protectors[0];
  const managerB = protectors.length >= 2 ? protectors[1] : null;
  const firefighter = firefighters[0];

  // Build dynamic questions based on named parts
  interface DynQuestion {
    id: string;
    text: string;
    options: string[];
    type: 'multi-select' | 'single-select';
    condition?: boolean;
  }

  const dynamicQuestions: DynQuestion[] = useMemo(() => {
    const qs: DynQuestion[] = [];

    if (managerA) {
      qs.push({
        id: 'q-underneath-protector',
        text: `When ${managerA.userChosenName} is working hardest — is there a feeling underneath it that it seems to be keeping away?`,
        options: underneathOptions,
        type: 'single-select',
      });
    }

    if (firefighter) {
      qs.push({
        id: 'q-pulling-away',
        text: `When ${firefighter.userChosenName} kicks in — what do you sense it's pulling you away from?`,
        options: pullingAwayOptions,
        type: 'single-select',
      });
    }

    if (managerA && managerB) {
      qs.push({
        id: 'q-at-war',
        text: `Have ${managerA.userChosenName} and ${managerB.userChosenName} ever seemed at war — wanting opposite things?`,
        options: ['Yes, often — it\'s exhausting', 'Sometimes', 'Not really', 'Not sure'],
        type: 'single-select',
      });
    }

    // Self-access baseline is always last
    qs.push({
      id: 'q-self-access',
      text: '',
      options: selfAccessOptions,
      type: 'multi-select',
    });

    return qs;
  }, [managerA, managerB, firefighter]);

  const currentQ = dynamicQuestions[step];
  if (!currentQ) return null;

  const isLastStep = step >= dynamicQuestions.length - 1;
  const isSelfAccess = currentQ.id === 'q-self-access';

  const value = phase3Answers[currentQ.id] || (currentQ.type === 'multi-select' ? [] : '');

  const handleSelect = (option: string) => {
    if (currentQ.type === 'multi-select') {
      const arr = Array.isArray(value) ? value : [];
      if (arr.includes(option)) {
        setPhase3Answer(currentQ.id, arr.filter((o) => o !== option));
      } else {
        setPhase3Answer(currentQ.id, [...arr, option]);
      }
    } else {
      setPhase3Answer(currentQ.id, option);
    }
  };

  const canContinue = currentQ.type === 'multi-select'
    ? (value as string[]).length > 0
    : (value as string) !== '';

  const handleContinue = () => {
    if (isSelfAccess) {
      setSelfEnergyBaseline(value as string[]);
    }
    if (isLastStep) {
      setPhase('reveal');
    } else {
      setStep(step + 1);
    }
  };

  const partNames = namedParts.filter((p) => p.status === 'named').map((p) => p.userChosenName);

  // Self-access special screen
  if (isSelfAccess) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-6">
        <div className="fixed top-20 right-6 z-10 w-40 opacity-70">
          <MiniMapPreview parts={namedParts} />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-lg mx-auto text-center"
        >
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[hsl(40,30%,85%)] font-serif text-xl leading-relaxed mb-3"
          >
            Take a moment.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-[hsl(40,30%,80%)] font-serif text-lg leading-relaxed mb-2"
          >
            Look at the parts we've found today —{' '}
            <span className="text-[hsl(45,90%,60%)]">{partNames.join(', ')}</span>.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="text-[hsl(40,20%,60%)] font-serif text-base italic mb-8"
          >
            From a little distance. Not from inside any of them. Just... observing.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="text-[hsl(40,30%,88%)] text-sm mb-6"
          >
            How do you feel toward them — taken together?
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {selfAccessOptions.map((opt) => {
                const selected = Array.isArray(value) && (value as string[]).includes(opt);
                return (
                  <button
                    key={opt}
                    onClick={() => handleSelect(opt)}
                    className={`px-3 py-2 rounded-full text-xs border transition-all ${
                      selected
                        ? 'bg-[hsl(40,25%,18%)] border-[hsl(45,90%,50%)] text-[hsl(40,30%,90%)]'
                        : 'bg-[hsl(20,15%,12%)] border-[hsl(40,15%,22%)] text-[hsl(40,20%,65%)] hover:border-[hsl(40,20%,35%)]'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleContinue}
              disabled={!canContinue}
              className={`px-8 py-3.5 rounded-xl text-sm font-medium transition-all ${
                canContinue
                  ? 'bg-[hsl(45,90%,50%)] text-[hsl(20,15%,8%)] hover:bg-[hsl(45,90%,55%)]'
                  : 'bg-[hsl(40,10%,18%)] text-[hsl(40,10%,35%)] cursor-not-allowed'
              }`}
            >
              See your map
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Regular dynamic question
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6">
      <div className="fixed top-20 right-6 z-10 w-40 opacity-70">
        <MiniMapPreview parts={namedParts} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          className="max-w-lg mx-auto"
        >
          <h2 className="text-xl font-sans text-[hsl(40,30%,90%)] mb-6 leading-relaxed">
            {currentQ.text}
          </h2>

          <div className="space-y-2 mb-6">
            {currentQ.options.map((option) => {
              const isSelected = currentQ.type === 'multi-select'
                ? (value as string[]).includes(option)
                : value === option;
              return (
                <button
                  key={option}
                  onClick={() => handleSelect(option)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm ${
                    isSelected
                      ? 'bg-[hsl(40,25%,18%)] border-[hsl(45,90%,50%)] text-[hsl(40,30%,90%)]'
                      : 'bg-[hsl(20,15%,12%)] border-[hsl(40,15%,20%)] text-[hsl(40,20%,65%)] hover:border-[hsl(40,20%,35%)]'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className={`w-full py-3.5 rounded-xl text-sm font-medium transition-all ${
              canContinue
                ? 'bg-[hsl(45,90%,50%)] text-[hsl(20,15%,8%)] hover:bg-[hsl(45,90%,55%)]'
                : 'bg-[hsl(40,10%,18%)] text-[hsl(40,10%,35%)] cursor-not-allowed'
            }`}
          >
            Continue
          </button>
        </motion.div>
      </AnimatePresence>

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
