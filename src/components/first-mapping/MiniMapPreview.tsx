import { motion, AnimatePresence } from 'framer-motion';
import { FirstMapPart } from '@/lib/firstMapStore';

const typeColors: Record<string, string> = {
  'Protector-Manager': '#2D9596',
  'Protector-Firefighter': '#E07B39',
  Exile: '#A78BCA',
};

const positions = [
  { x: 120, y: 60 },
  { x: 60, y: 130 },
  { x: 180, y: 130 },
  { x: 90, y: 200 },
  { x: 150, y: 200 },
];

interface MiniMapPreviewProps {
  parts: FirstMapPart[];
  shadowCount?: number;
}

export default function MiniMapPreview({ parts, shadowCount = 3 }: MiniMapPreviewProps) {
  return (
    <div className="relative">
      <svg viewBox="0 0 240 260" className="w-full max-w-[200px] mx-auto">
        {/* Self energy orb at top */}
        <circle cx="120" cy="20" r="8" fill="#F5C842" opacity={0.6}>
          <animate attributeName="opacity" values="0.4;0.7;0.4" dur="3s" repeatCount="indefinite" />
        </circle>

        {/* Fog layer */}
        <defs>
          <radialGradient id="fog-mini" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="60%" stopColor="hsl(30, 10%, 15%)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(30, 10%, 15%)" stopOpacity="0.7" />
          </radialGradient>
        </defs>

        {/* Shadowed nodes */}
        {Array.from({ length: shadowCount }).map((_, i) => (
          <circle
            key={`shadow-${i}`}
            cx={60 + i * 60}
            cy={230}
            r={6}
            fill="hsl(30, 5%, 30%)"
            opacity={0.3}
            filter="blur(1px)"
          />
        ))}

        {/* Relationship lines */}
        <AnimatePresence>
          {parts.length >= 2 &&
            parts.slice(1).map((_, i) => (
              <motion.line
                key={`line-${i}`}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.4 }}
                transition={{ duration: 1, delay: 0.5 }}
                x1={positions[0]?.x}
                y1={positions[0]?.y}
                x2={positions[i + 1]?.x}
                y2={positions[i + 1]?.y}
                stroke="#F5C842"
                strokeWidth="1"
                strokeOpacity="0.3"
              />
            ))}
        </AnimatePresence>

        {/* Named part nodes */}
        <AnimatePresence>
          {parts.map((part, i) => {
            const pos = positions[i] || { x: 120, y: 120 };
            const color = typeColors[part.type] || '#888';
            return (
              <motion.g key={part.partId} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
                <circle cx={pos.x} cy={pos.y} r={10} fill={color} opacity={0.8}>
                  <animate attributeName="r" values="10;12;10" dur="2s" repeatCount="1" />
                  <animate attributeName="opacity" values="0.5;1;0.8" dur="2s" repeatCount="1" />
                </circle>
                <text x={pos.x} y={pos.y + 22} textAnchor="middle" fill="hsl(40, 30%, 75%)" fontSize="7" fontFamily="'Cormorant Garamond', serif">
                  {part.userChosenName.length > 14 ? part.userChosenName.slice(0, 12) + '…' : part.userChosenName}
                </text>
              </motion.g>
            );
          })}
        </AnimatePresence>

        {/* Fog overlay */}
        <rect x="0" y="0" width="240" height="260" fill="url(#fog-mini)" />
      </svg>

      <p className="text-center text-[10px] text-[hsl(40,20%,50%)] mt-1 tracking-wider uppercase">
        Your map is taking shape
      </p>
    </div>
  );
}
