import { motion } from 'framer-motion';
import { useFirstMapStore } from '@/lib/firstMapStore';

export default function OpeningScreen() {
  const setPhase = useFirstMapStore((s) => s.setPhase);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="min-h-[80vh] flex items-center justify-center px-6"
    >
      <div className="max-w-md mx-auto text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-[hsl(40,30%,85%)] font-serif text-xl leading-relaxed mb-8"
        >
          Before we start building your map, we want to meet you where you actually live. Not in theory. In a real moment.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-[hsl(40,30%,80%)] font-serif text-lg leading-relaxed mb-4"
        >
          Think of a recent time when you felt reactive, stuck, or pulled in two directions. It doesn't need to be dramatic — just a moment when more was happening inside than you showed.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="text-[hsl(40,20%,60%)] font-serif text-base italic mb-12"
        >
          Take a breath. Got one? Good.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
          className="flex flex-col gap-3"
        >
          <button
            onClick={() => setPhase('phase1')}
            className="w-full py-4 rounded-xl bg-[hsl(45,90%,50%)] text-[hsl(20,15%,8%)] font-medium hover:bg-[hsl(45,90%,55%)] transition-colors text-sm"
          >
            I have a moment
          </button>
          <button
            onClick={() => setPhase('phase2-intro')}
            className="w-full py-3 rounded-xl bg-transparent border border-[hsl(40,15%,22%)] text-[hsl(40,20%,55%)] text-sm hover:border-[hsl(40,20%,35%)] hover:text-[hsl(40,20%,70%)] transition-colors"
          >
            Skip to a fresh start
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
