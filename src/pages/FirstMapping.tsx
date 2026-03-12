import { motion, AnimatePresence } from 'framer-motion';
import { useFirstMapStore } from '@/lib/firstMapStore';
import SafetyIcon from '@/components/first-mapping/SafetyIcon';
import OpeningScreen from '@/components/first-mapping/OpeningScreen';
import Phase1Moment from '@/components/first-mapping/Phase1Moment';
import Phase2Patterns from '@/components/first-mapping/Phase2Patterns';
import Phase3Connections from '@/components/first-mapping/Phase3Connections';
import MapReveal from '@/components/first-mapping/MapReveal';

export default function FirstMapping() {
  const phase = useFirstMapStore((s) => s.phase);
  const setPhase = useFirstMapStore((s) => s.setPhase);

  const renderPhase = () => {
    switch (phase) {
      case 'opening':
        return <OpeningScreen />;
      case 'phase1':
        return <Phase1Moment />;
      case 'phase2-intro':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-[80vh] flex items-center justify-center px-6"
          >
            <div className="max-w-md mx-auto text-center">
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-[hsl(40,30%,85%)] font-serif text-xl leading-relaxed mb-4"
              >
                Now we look at patterns — the ways your inner world tends to show up.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-[hsl(40,20%,60%)] font-serif text-base mb-10"
              >
                You might recognize some immediately. Others might surprise you.
              </motion.p>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
                onClick={() => setPhase('phase2')}
                className="px-8 py-3.5 rounded-xl bg-[hsl(45,90%,50%)] text-[hsl(20,15%,8%)] text-sm font-medium hover:bg-[hsl(45,90%,55%)] transition-colors"
              >
                Continue
              </motion.button>
            </div>
          </motion.div>
        );
      case 'phase2':
        return <Phase2Patterns />;
      case 'phase3-intro':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-[80vh] flex items-center justify-center px-6"
          >
            <div className="max-w-md mx-auto text-center">
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-[hsl(40,30%,85%)] font-serif text-xl leading-relaxed mb-4"
              >
                Your parts don't work alone. They're in relationship with each other — sometimes protecting one another, sometimes in conflict.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-[hsl(40,20%,60%)] font-serif text-base mb-10"
              >
                Let's look at what's already connecting on your map.
              </motion.p>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
                onClick={() => setPhase('phase3')}
                className="px-8 py-3.5 rounded-xl bg-[hsl(45,90%,50%)] text-[hsl(20,15%,8%)] text-sm font-medium hover:bg-[hsl(45,90%,55%)] transition-colors"
              >
                Continue
              </motion.button>
            </div>
          </motion.div>
        );
      case 'phase3':
        return <Phase3Connections />;
      case 'reveal':
        return <MapReveal />;
      default:
        return null;
    }
  };

  return (
    <div
      className="min-h-screen relative"
      style={{
        background: 'linear-gradient(180deg, hsl(20, 15%, 8%) 0%, hsl(25, 12%, 10%) 50%, hsl(20, 15%, 8%) 100%)',
        color: 'hsl(40, 30%, 85%)',
        fontFamily: "'Source Sans 3', 'Source Sans Pro', sans-serif",
      }}
    >
      <SafetyIcon />
      <AnimatePresence mode="wait">
        <motion.div key={phase}>
          {renderPhase()}
        </motion.div>
      </AnimatePresence>

      {/* Subtle bottom text */}
      <div className="fixed bottom-4 left-0 right-0 text-center">
        <p className="text-[9px] tracking-[0.2em] uppercase text-[hsl(40,10%,25%)]">
          Inner Atlas
        </p>
      </div>
    </div>
  );
}
