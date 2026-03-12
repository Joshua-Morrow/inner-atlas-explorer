import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFirstMapStore } from '@/lib/firstMapStore';
import { useNavigate } from 'react-router-dom';

const typeColors: Record<string, string> = {
  'Protector-Manager': '#2D9596',
  'Protector-Firefighter': '#E07B39',
  Exile: '#A78BCA',
};

export default function MapReveal() {
  const { namedParts, shadowedNodes, relationships, completeFirstMapping, generateShadowedNodes } = useFirstMapStore();
  const navigate = useNavigate();
  const [screen, setScreen] = useState(0);

  useEffect(() => {
    generateShadowedNodes();
  }, []);

  const named = namedParts.filter((p) => p.status === 'named');
  const protectorA = named[0];
  const protectorB = named.length >= 2 ? named[1] : null;

  // Node positions for the reveal map
  const positions = [
    { x: 300, y: 100 },
    { x: 150, y: 200 },
    { x: 450, y: 200 },
    { x: 220, y: 320 },
    { x: 380, y: 320 },
  ];

  // Screen 1: Full map animates in
  if (screen === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[80vh] flex flex-col items-center justify-center px-6"
      >
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-serif text-[hsl(40,30%,90%)] mb-2 text-center"
        >
          Your first map.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-sm text-[hsl(40,20%,55%)] mb-8 text-center"
        >
          {named.length} parts discovered. Your map is just beginning.
        </motion.p>

        {/* The map visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="relative w-full max-w-lg mx-auto"
        >
          <svg viewBox="0 0 600 450" className="w-full">
            {/* Fog background */}
            <defs>
              <radialGradient id="fog-reveal" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="50%" stopColor="hsl(30, 10%, 12%)" stopOpacity="0.2" />
                <stop offset="100%" stopColor="hsl(30, 10%, 12%)" stopOpacity="0.8" />
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="shadow-blur">
                <feGaussianBlur stdDeviation="3" />
              </filter>
            </defs>

            {/* Self energy orb */}
            <motion.circle
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.5, type: 'spring' }}
              cx="300" cy="40" r="15"
              fill="#F5C842" opacity={0.6} filter="url(#glow)"
            >
              <animate attributeName="opacity" values="0.4;0.7;0.4" dur="4s" repeatCount="indefinite" />
            </motion.circle>
            <motion.text
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              x="300" y="70" textAnchor="middle" fill="hsl(45, 90%, 60%)" fontSize="10" fontFamily="'Cormorant Garamond', serif"
            >
              Self
            </motion.text>

            {/* Connection lines — draw in slowly */}
            {named.map((part, i) => (
              <motion.line
                key={`self-line-${i}`}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.3 }}
                transition={{ delay: 2.5 + i * 0.3, duration: 1 }}
                x1={300} y1={40}
                x2={positions[i]?.x || 300} y2={positions[i]?.y || 200}
                stroke="#F5C842" strokeWidth="1"
              />
            ))}

            {/* Relationship lines between parts */}
            {named.length >= 2 && (
              <motion.line
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.4 }}
                transition={{ delay: 3.5, duration: 0.8 }}
                x1={positions[0]?.x} y1={positions[0]?.y}
                x2={positions[1]?.x} y2={positions[1]?.y}
                stroke="#F5C842" strokeWidth="1.5"
              />
            )}

            {/* Named nodes — appear sequentially */}
            {named.map((part, i) => {
              const pos = positions[i] || { x: 300, y: 200 };
              const color = typeColors[part.type] || '#888';
              return (
                <motion.g
                  key={part.partId}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 2 + i * 0.5, type: 'spring', stiffness: 80 }}
                >
                  <circle cx={pos.x} cy={pos.y} r="18" fill={color} opacity={0.85} filter="url(#glow)">
                    <animate attributeName="r" values="18;21;18" dur="2s" repeatCount="1" />
                  </circle>
                  <text x={pos.x} y={pos.y + 4} textAnchor="middle" fill="white" fontSize="11" fontWeight="600">
                    {part.userChosenName.charAt(0)}
                  </text>
                  <text
                    x={pos.x} y={pos.y + 35}
                    textAnchor="middle" fill="hsl(40, 30%, 75%)"
                    fontSize="10" fontFamily="'Cormorant Garamond', serif"
                  >
                    {part.userChosenName}
                  </text>
                </motion.g>
              );
            })}

            {/* Shadowed nodes in fog */}
            {shadowedNodes.slice(0, 4).map((shadow, i) => {
              const angle = (Math.PI * 2 * i) / 4 + Math.PI * 0.7;
              const sx = 300 + Math.cos(angle) * 180;
              const sy = 230 + Math.sin(angle) * 120;
              return (
                <motion.g
                  key={shadow.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 4 + i * 0.3 }}
                >
                  <circle cx={sx} cy={sy} r="10" fill="hsl(30, 5%, 25%)" opacity={0.3} filter="url(#shadow-blur)" />
                  {/* Dotted line to connected part */}
                  {shadow.connectedToPartId && (() => {
                    const connIdx = named.findIndex((p) => p.partId === shadow.connectedToPartId);
                    if (connIdx < 0) return null;
                    const target = positions[connIdx];
                    return (
                      <line
                        x1={sx} y1={sy} x2={target?.x} y2={target?.y}
                        stroke="hsl(40, 20%, 30%)" strokeWidth="1" strokeDasharray="4 4" opacity={0.3}
                      />
                    );
                  })()}
                </motion.g>
              );
            })}

            {/* Fog overlay */}
            <rect x="0" y="0" width="600" height="450" fill="url(#fog-reveal)" />
          </svg>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 5 }}
          onClick={() => setScreen(1)}
          className="mt-6 px-8 py-3 rounded-xl bg-[hsl(40,20%,16%)] border border-[hsl(40,15%,25%)] text-[hsl(40,30%,80%)] text-sm hover:bg-[hsl(40,20%,22%)] transition-colors"
        >
          What your map is showing
        </motion.button>
      </motion.div>
    );
  }

  // Screen 2: Relationship insight
  if (screen === 1) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[80vh] flex flex-col items-center justify-center px-6"
      >
        <div className="max-w-md mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[hsl(40,30%,80%)] font-serif text-sm uppercase tracking-[0.15em] mb-6"
          >
            Here's something your map is already showing.
          </motion.p>

          {protectorA && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-[hsl(40,30%,88%)] font-serif text-xl leading-relaxed mb-6"
            >
              <span className="text-[#2D9596]">{protectorA.userChosenName}</span>
              {' — working so hard, keeping the bar high — and the quiet ache underneath. They're connected. One is protecting the other.'}
            </motion.p>
          )}

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="text-[hsl(40,20%,60%)] font-serif text-lg italic mb-10"
          >
            That's not a problem. That's loyalty. Your system built this to keep you safe.
          </motion.p>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            onClick={() => setScreen(2)}
            className="px-8 py-3 rounded-xl bg-[hsl(40,20%,16%)] border border-[hsl(40,15%,25%)] text-[hsl(40,30%,80%)] text-sm hover:bg-[hsl(40,20%,22%)] transition-colors"
          >
            What else is in there?
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // Screen 3: The cliffhanger
  if (screen === 2) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[80vh] flex flex-col items-center justify-center px-6"
      >
        <div className="max-w-md mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[hsl(40,30%,90%)] font-serif text-2xl mb-8"
          >
            But here's what your map doesn't show yet.
          </motion.p>

          {/* Pulsing fog visualization */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="relative w-48 h-48 mx-auto mb-8"
          >
            <div className="absolute inset-0 rounded-full bg-[hsl(30,15%,15%)] opacity-40">
              <div className="absolute inset-0 rounded-full animate-pulse bg-[hsl(40,20%,20%)] opacity-30" />
            </div>
            {/* Ghost nodes */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ delay: 1 + i * 0.3, duration: 3, repeat: Infinity }}
                className="absolute w-6 h-6 rounded-full bg-[hsl(270,20%,35%)]"
                style={{
                  left: `${30 + i * 25}%`,
                  top: `${35 + (i % 2) * 25}%`,
                  filter: 'blur(2px)',
                }}
              />
            ))}
            {/* Dotted lines pulsing */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
              <motion.line
                x1="40" y1="45" x2="65" y2="55" stroke="hsl(40,20%,30%)" strokeWidth="0.5" strokeDasharray="3 3"
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.line
                x1="55" y1="40" x2="35" y2="60" stroke="hsl(40,20%,30%)" strokeWidth="0.5" strokeDasharray="3 3"
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
              />
            </svg>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="text-[hsl(40,30%,80%)] font-serif text-lg leading-relaxed mb-4"
          >
            There are parts in there we haven't met. Parts your{' '}
            {protectorA && <span className="text-[#2D9596]">{protectorA.userChosenName}</span>}
            {protectorB && <> and <span className="text-[#E07B39]">{protectorB.userChosenName}</span></>}
            {' '}may be protecting without you fully knowing it.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5 }}
            className="text-[hsl(40,20%,55%)] font-serif text-base italic mb-4"
          >
            Parts that have been waiting — some of them for a very long time — to be seen.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.5 }}
            className="text-[hsl(40,30%,85%)] font-serif text-lg mb-10"
          >
            Your map is asking a question:{' '}
            <em className="text-[hsl(45,90%,60%)]">what happened that made these connections necessary?</em>
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 4.5 }}
            className="text-[hsl(40,20%,50%)] text-sm mb-8"
          >
            That question is worth following.
          </motion.p>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 5 }}
            onClick={() => {
              completeFirstMapping();
              navigate('/');
            }}
            className="px-8 py-3.5 rounded-xl bg-[hsl(45,90%,50%)] text-[hsl(20,15%,8%)] text-sm font-medium hover:bg-[hsl(45,90%,55%)] transition-colors"
          >
            Enter your map
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return null;
}
