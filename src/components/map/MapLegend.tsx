import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  showDynamics: boolean;
  onToggleDynamics: () => void;
}

export function MapLegend({ showDynamics, onToggleDynamics }: Props) {
  const [open, setOpen] = useState(true);

  return (
    <div className="absolute bottom-4 left-4 z-10">
      <div className="bg-card/95 backdrop-blur-sm border rounded-lg shadow-md overflow-hidden" style={{ width: open ? 220 : 'auto' }}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 px-3 py-2 w-full text-xs font-semibold text-foreground hover:bg-accent/50 transition-colors"
        >
          <span>Legend</span>
          {open ? <ChevronDown className="w-3 h-3 ml-auto" /> : <ChevronUp className="w-3 h-3 ml-auto" />}
        </button>

        {open && (
          <div className="px-3 pb-3 space-y-3">
            {/* Node Types */}
            <div>
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Node Types</div>
              <div className="space-y-1.5">
                <LegendNode shape="rectangle" color="var(--ifs-manager)" label="Manager" />
                <LegendNode shape="starburst" color="var(--ifs-firefighter)" label="Firefighter" />
                <LegendNode shape="circle" color="var(--ifs-exile)" label="Exile" />
                <LegendNode shape="octagon" color="var(--ifs-self)" label="Self" />
              </div>
            </div>

            {/* Relationship Lines */}
            <div>
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Relationships</div>
              <div className="space-y-1.5">
                <LegendLine color="hsl(140, 50%, 45%)" dash={false} label="Harmonious" />
                <LegendLine color="hsl(0, 84%, 60%)" dash={false} label="Conflicting" />
                <LegendLine color="hsl(230, 60%, 40%)" dash={true} label="Protective" />
                <LegendLine color="hsl(45, 90%, 50%)" dash={true} label="Neutral" />
              </div>
            </div>

            {/* Dynamics toggle */}
            <div>
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Dynamics</div>
              <div className="space-y-1.5">
                <LegendLine color="hsl(0, 65%, 45%)" dash={false} label="Polarization" badge="P" />
                <LegendLine color="hsl(152, 60%, 30%)" dash={true} label="Alliance" badge="A" />
                <button
                  onClick={onToggleDynamics}
                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                    showDynamics
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'border-muted text-muted-foreground'
                  }`}
                >
                  {showDynamics ? '● Visible' : '○ Hidden'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LegendNode({ shape, color, label }: { shape: string; color: string; label: string }) {
  const hsl = `hsl(${color})`;
  const hslBg = `hsl(${color} / 0.2)`;

  return (
    <div className="flex items-center gap-2">
      <div className="w-5 h-5 flex items-center justify-center shrink-0">
        {shape === 'rectangle' && (
          <div className="w-5 h-3.5 rounded-sm" style={{ background: hslBg, border: `2px solid ${hsl}` }} />
        )}
        {shape === 'starburst' && (
          <svg viewBox="0 0 20 20" className="w-5 h-5">
            <polygon
              points="10,1 12,7 18,7 13,11 15,17 10,13 5,17 7,11 2,7 8,7"
              fill={hslBg}
              stroke={hsl}
              strokeWidth="1.5"
            />
          </svg>
        )}
        {shape === 'circle' && (
          <div className="w-4 h-4 rounded-full" style={{ background: hslBg, border: `2px solid ${hsl}` }} />
        )}
        {shape === 'octagon' && (
          <svg viewBox="0 0 20 20" className="w-5 h-5">
            <polygon
              points="6,1 14,1 19,6 19,14 14,19 6,19 1,14 1,6"
              fill={hslBg}
              stroke={hsl}
              strokeWidth="1.5"
            />
          </svg>
        )}
      </div>
      <span className="text-[11px] text-foreground">{label}</span>
    </div>
  );
}

function LegendLine({ color, dash, label, badge }: { color: string; dash: boolean; label: string; badge?: string }) {
  return (
    <div className="flex items-center gap-2">
      <svg viewBox="0 0 28 6" className="w-7 h-1.5 shrink-0">
        <line
          x1="0" y1="3" x2="28" y2="3"
          stroke={color}
          strokeWidth="2"
          strokeDasharray={dash ? '4,3' : undefined}
        />
      </svg>
      <span className="text-[11px] text-foreground">{label}</span>
      {badge && (
        <span className="text-[8px] font-bold text-white px-1 py-0.5 rounded" style={{ backgroundColor: color }}>
          {badge}
        </span>
      )}
    </div>
  );
}
