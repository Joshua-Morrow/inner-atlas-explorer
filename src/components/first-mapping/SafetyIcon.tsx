import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X } from 'lucide-react';

export default function SafetyIcon() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed top-6 right-6 z-50 w-10 h-10 rounded-full bg-[hsl(40,30%,20%)] border border-[hsl(40,20%,30%)] flex items-center justify-center text-[hsl(40,30%,85%)] hover:bg-[hsl(40,30%,25%)] transition-colors"
        aria-label="Safety information"
      >
        <ShieldCheck className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-md w-full rounded-2xl bg-[hsl(20,15%,12%)] border border-[hsl(40,20%,20%)] p-8 shadow-2xl"
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 text-[hsl(40,20%,50%)] hover:text-[hsl(40,30%,80%)]"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="w-6 h-6 text-[hsl(45,90%,60%)]" />
                <h3 className="text-lg font-serif text-[hsl(40,30%,90%)]">Go at your own pace</h3>
              </div>
              <p className="text-[hsl(40,20%,65%)] leading-relaxed text-sm">
                If anything feels like too much, pause or skip. This is your exploration — there are no right answers,
                no scores, and nothing you share here will be judged. You can return to any part of this at any time.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
