import { useState } from 'react';
import { motion } from 'framer-motion';
import type { NamingMomentDef } from '@/lib/firstMapData';
import { microCaptureOptions } from '@/lib/firstMapData';

interface NamingMomentProps {
  moment: NamingMomentDef;
  /** If true, this is a shadowed exile node — no name field, just acknowledgment */
  isShadowed?: boolean;
  onName: (name: string) => void;
  onMicroCapture: (feelings: string[]) => void;
}

type Stage = 'reflection' | 'naming' | 'micro-capture' | 'shadowed-ack';

export default function NamingMoment({ moment, isShadowed, onName, onMicroCapture }: NamingMomentProps) {
  const [stage, setStage] = useState<Stage>(isShadowed ? 'shadowed-ack' : 'reflection');
  const [paragraphIndex, setParagraphIndex] = useState(0);
  const [chosenName, setChosenName] = useState('');
  const [customName, setCustomName] = useState('');
  const [microFeelings, setMicroFeelings] = useState<string[]>([]);

  const currentParagraph = moment.reflectionParagraphs[paragraphIndex];
  const isLastParagraph = paragraphIndex >= moment.reflectionParagraphs.length - 1;
  const finalName = customName.trim() || chosenName;

  // Shadowed exile acknowledgment (no naming)
  if (stage === 'shadowed-ack') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-lg mx-auto text-center"
      >
        {moment.reflectionParagraphs.map((p, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 1.2 }}
            className="text-[hsl(40,30%,80%)] font-serif text-lg leading-relaxed mb-6 italic"
          >
            {p}
          </motion.p>
        ))}

        {/* Shadowed node visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: moment.reflectionParagraphs.length * 1.2 }}
          className="my-8"
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-[hsl(270,20%,25%)] border border-[hsl(270,20%,35%)] opacity-50 shadow-[0_0_20px_hsl(270,20%,25%)]" />
          <p className="text-xs text-[hsl(40,20%,50%)] mt-3 italic">Unknown — waiting to be known</p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: moment.reflectionParagraphs.length * 1.2 + 0.5 }}
          className="text-sm text-[hsl(40,20%,55%)] mb-8"
        >
          This part isn't ready to be named yet. That's okay. Knowing it's there is the beginning.
        </motion.p>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: moment.reflectionParagraphs.length * 1.2 + 1 }}
          onClick={() => onName('Unknown — waiting to be known')}
          className="px-8 py-3 rounded-xl bg-[hsl(40,20%,18%)] border border-[hsl(40,15%,25%)] text-[hsl(40,30%,80%)] text-sm hover:bg-[hsl(40,20%,22%)] transition-colors"
        >
          Continue
        </motion.button>
      </motion.div>
    );
  }

  // Reflection stage — reveal paragraphs one at a time
  if (stage === 'reflection') {
    return (
      <motion.div
        key={`reflection-${paragraphIndex}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-lg mx-auto text-center"
      >
        <motion.p
          key={paragraphIndex}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[hsl(40,30%,85%)] font-serif text-xl leading-relaxed mb-10"
        >
          {currentParagraph}
        </motion.p>

        <button
          onClick={() => {
            if (isLastParagraph) {
              setStage('naming');
            } else {
              setParagraphIndex((i) => i + 1);
            }
          }}
          className="px-8 py-3 rounded-xl bg-[hsl(40,20%,16%)] border border-[hsl(40,15%,25%)] text-[hsl(40,30%,80%)] text-sm hover:bg-[hsl(40,20%,22%)] transition-colors"
        >
          {isLastParagraph ? 'Choose a name' : 'Continue'}
        </button>
      </motion.div>
    );
  }

  // Naming stage
  if (stage === 'naming') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg mx-auto text-center">
        <h3 className="text-lg font-serif text-[hsl(40,30%,90%)] mb-6">
          What would you like to call this part — for now?
        </h3>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {moment.nameChips.map((chip) => (
            <button
              key={chip}
              onClick={() => { setChosenName(chip); setCustomName(''); }}
              className={`px-4 py-2 rounded-full text-sm border transition-all ${
                chosenName === chip
                  ? 'bg-[hsl(45,90%,50%)] text-[hsl(20,15%,8%)] border-[hsl(45,90%,50%)]'
                  : 'bg-[hsl(20,15%,12%)] border-[hsl(40,15%,22%)] text-[hsl(40,20%,70%)] hover:border-[hsl(40,20%,40%)]'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>

        <div className="mb-6">
          <input
            type="text"
            value={customName}
            onChange={(e) => { setCustomName(e.target.value); setChosenName(''); }}
            placeholder="Or give it your own name..."
            className="w-full bg-[hsl(20,15%,10%)] border border-[hsl(40,15%,22%)] rounded-xl px-4 py-3 text-sm text-[hsl(40,30%,85%)] placeholder:text-[hsl(40,15%,30%)] focus:outline-none focus:border-[hsl(45,90%,50%)] text-center font-serif"
          />
        </div>

        <button
          onClick={() => {
            if (finalName) {
              setStage('micro-capture');
            }
          }}
          disabled={!finalName}
          className={`px-8 py-3.5 rounded-xl text-sm font-medium transition-all ${
            finalName
              ? 'bg-[hsl(45,90%,50%)] text-[hsl(20,15%,8%)] hover:bg-[hsl(45,90%,55%)]'
              : 'bg-[hsl(40,10%,18%)] text-[hsl(40,10%,35%)] cursor-not-allowed'
          }`}
        >
          This is {finalName || '...'}
        </button>
      </motion.div>
    );
  }

  // Micro-capture stage
  if (stage === 'micro-capture') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg mx-auto text-center">
        {/* Node pulse animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 100, delay: 0.2 }}
          className="mb-6"
        >
          <div
            className="w-16 h-16 mx-auto rounded-full flex items-center justify-center shadow-lg"
            style={{
              backgroundColor:
                moment.partType === 'Protector-Manager' ? '#2D9596'
                : moment.partType === 'Protector-Firefighter' ? '#E07B39'
                : '#A78BCA',
              boxShadow: `0 0 30px ${
                moment.partType === 'Protector-Manager' ? 'rgba(45,149,150,0.5)'
                : moment.partType === 'Protector-Firefighter' ? 'rgba(224,123,57,0.5)'
                : 'rgba(167,139,202,0.5)'
              }`,
            }}
          >
            <span className="text-white font-serif text-lg">{finalName.charAt(0)}</span>
          </div>
          <p className="text-sm text-[hsl(40,30%,85%)] font-serif mt-3">{finalName}</p>
        </motion.div>

        <p className="text-[hsl(40,20%,60%)] text-sm mb-4">
          How do you feel toward {finalName} right now?
        </p>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {microCaptureOptions.map((opt) => (
            <button
              key={opt}
              onClick={() =>
                setMicroFeelings((prev) =>
                  prev.includes(opt) ? prev.filter((f) => f !== opt) : [...prev, opt]
                )
              }
              className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                microFeelings.includes(opt)
                  ? 'bg-[hsl(40,25%,20%)] border-[hsl(45,90%,50%)] text-[hsl(40,30%,90%)]'
                  : 'bg-[hsl(20,15%,12%)] border-[hsl(40,15%,22%)] text-[hsl(40,20%,60%)] hover:border-[hsl(40,20%,35%)]'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            onName(finalName);
            onMicroCapture(microFeelings);
          }}
          className="px-8 py-3 rounded-xl bg-[hsl(45,90%,50%)] text-[hsl(20,15%,8%)] text-sm font-medium hover:bg-[hsl(45,90%,55%)] transition-colors"
        >
          Continue
        </button>
      </motion.div>
    );
  }

  return null;
}
