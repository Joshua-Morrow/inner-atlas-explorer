import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { QuestionDef } from '@/lib/firstMapData';

interface QuestionScreenProps {
  question: QuestionDef;
  value: string[] | string;
  followUpValue?: string;
  onAnswer: (value: string[] | string) => void;
  onFollowUp?: (text: string) => void;
  onContinue: () => void;
}

export default function QuestionScreen({
  question,
  value,
  followUpValue,
  onAnswer,
  onFollowUp,
  onContinue,
}: QuestionScreenProps) {
  const isMulti = question.type === 'multi-select';
  const selected = isMulti ? (Array.isArray(value) ? value : []) : (typeof value === 'string' ? value : '');
  const [showFollowUp, setShowFollowUp] = useState(false);

  useEffect(() => {
    if (question.followUp) {
      const sel = Array.isArray(selected) ? selected : [selected];
      setShowFollowUp(sel.some((s) => question.followUp!.condition.includes(s)));
    }
  }, [selected, question.followUp]);

  const canContinue = isMulti
    ? (selected as string[]).length > 0
    : (selected as string) !== '';

  const handleSelect = (option: string) => {
    if (isMulti) {
      const arr = selected as string[];
      if (arr.includes(option)) {
        onAnswer(arr.filter((o) => o !== option));
      } else {
        if (question.maxSelections && arr.length >= question.maxSelections) return;
        onAnswer([...arr, option]);
      }
    } else {
      onAnswer(option);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.4 }}
      className="max-w-lg mx-auto"
    >
      <h2 className="text-xl font-sans text-[hsl(40,30%,90%)] mb-2 leading-relaxed">
        {question.text}
      </h2>

      {question.subtext && (
        <p className="text-sm text-[hsl(40,20%,55%)] mb-4">{question.subtext}</p>
      )}

      {isMulti && question.maxSelections && (
        <p className="text-xs text-[hsl(40,20%,45%)] mb-4">
          Select up to {question.maxSelections}
        </p>
      )}
      {isMulti && !question.maxSelections && (
        <p className="text-xs text-[hsl(40,20%,45%)] mb-4">Select all that apply</p>
      )}

      <div className="space-y-2 mb-6">
        {question.options.map((option) => {
          const isSelected = isMulti
            ? (selected as string[]).includes(option)
            : selected === option;

          return (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm ${
                isSelected
                  ? 'bg-[hsl(40,25%,18%)] border-[hsl(45,90%,50%)] text-[hsl(40,30%,90%)]'
                  : 'bg-[hsl(20,15%,12%)] border-[hsl(40,15%,20%)] text-[hsl(40,20%,65%)] hover:border-[hsl(40,20%,35%)] hover:bg-[hsl(20,15%,14%)]'
              }`}
            >
              <span className="flex items-center gap-3">
                <span
                  className={`flex-shrink-0 w-5 h-5 rounded-${isMulti ? 'md' : 'full'} border-2 flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-[hsl(45,90%,50%)] border-[hsl(45,90%,50%)]'
                      : 'border-[hsl(40,15%,30%)]'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-[hsl(20,15%,8%)]" />}
                </span>
                {option}
              </span>
            </button>
          );
        })}
      </div>

      {/* Follow-up text area */}
      {showFollowUp && question.followUp && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6"
        >
          <p className="text-sm text-[hsl(40,20%,60%)] mb-2">{question.followUp.prompt}</p>
          <textarea
            value={followUpValue || ''}
            onChange={(e) => onFollowUp?.(e.target.value)}
            rows={3}
            className="w-full bg-[hsl(20,15%,10%)] border border-[hsl(40,15%,22%)] rounded-xl px-4 py-3 text-sm text-[hsl(40,30%,85%)] placeholder:text-[hsl(40,15%,30%)] focus:outline-none focus:border-[hsl(45,90%,50%)] resize-none"
            placeholder="Optional — share as much or as little as you'd like"
          />
        </motion.div>
      )}

      <button
        onClick={onContinue}
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
  );
}
