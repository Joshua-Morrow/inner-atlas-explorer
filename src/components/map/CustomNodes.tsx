import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

const intensityBorder = (intensity: string) => {
  if (intensity === 'High') return 4;
  if (intensity === 'Medium') return 3;
  return 2;
};

// ── Manager: Rounded rectangle, indigo/blue fill ──
export const ManagerNode = memo(({ data }: NodeProps) => {
  const d = data as { name: string; initial: string; intensity: string; elaborated: boolean; blended: boolean };
  const bw = intensityBorder(d.intensity);
  return (
    <div
      className="relative flex flex-col items-center justify-center rounded-lg px-4 py-3 text-center shadow-md"
      style={{
        background: 'hsl(var(--ifs-manager) / 0.15)',
        border: `${bw}px solid hsl(var(--ifs-manager))`,
        minWidth: 100,
        boxShadow: d.elaborated
          ? '0 0 14px 3px hsl(var(--ifs-manager) / 0.4)'
          : d.blended
            ? '0 0 10px 3px hsl(var(--ifs-self) / 0.4)'
            : undefined,
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0 !w-0 !h-0" />
      {d.elaborated && (
        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[8px] flex items-center justify-center">✦</span>
      )}
      <div
        className="w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold mb-1"
        style={{ background: 'hsl(var(--ifs-manager) / 0.3)', color: 'hsl(var(--ifs-manager))' }}
      >
        {d.initial}
      </div>
      <div className="font-semibold text-xs text-foreground leading-tight">{d.name}</div>
      <div className="text-[9px] text-muted-foreground">Manager</div>
    </div>
  );
});
ManagerNode.displayName = 'ManagerNode';

// ── Firefighter: Starburst shape, amber/orange fill ──
export const FirefighterNode = memo(({ data }: NodeProps) => {
  const d = data as { name: string; initial: string; intensity: string; elaborated: boolean; blended: boolean };
  const bw = intensityBorder(d.intensity);
  return (
    <div className="relative" style={{ width: 120, height: 120 }}>
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-0 !w-0 !h-0" style={{ top: 4 }} />
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0 !w-0 !h-0" style={{ bottom: 4 }} />
      <svg viewBox="0 0 120 120" className="absolute inset-0 w-full h-full">
        <polygon
          points="60,2 72,40 110,40 80,62 90,100 60,78 30,100 40,62 10,40 48,40"
          fill="hsl(var(--ifs-firefighter) / 0.18)"
          stroke="hsl(var(--ifs-firefighter))"
          strokeWidth={bw}
          filter={d.elaborated ? 'url(#ffGlow)' : undefined}
        />
        {d.elaborated && (
          <defs>
            <filter id="ffGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
        {d.elaborated && (
          <span className="absolute top-0 right-3 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[8px] flex items-center justify-center">✦</span>
        )}
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-0.5"
          style={{ background: 'hsl(var(--ifs-firefighter) / 0.35)', color: 'hsl(var(--ifs-firefighter))' }}
        >
          {d.initial}
        </div>
        <div className="font-semibold text-[10px] text-foreground leading-tight text-center px-4">{d.name}</div>
        <div className="text-[8px] text-muted-foreground">Firefighter</div>
      </div>
    </div>
  );
});
FirefighterNode.displayName = 'FirefighterNode';

// ── Exile: Soft circle, violet/lavender fill ──
export const ExileNode = memo(({ data }: NodeProps) => {
  const d = data as { name: string; initial: string; intensity: string; elaborated: boolean; blended: boolean };
  const bw = intensityBorder(d.intensity);
  return (
    <div
      className="relative flex flex-col items-center justify-center rounded-full text-center shadow-md"
      style={{
        width: 100,
        height: 100,
        background: 'hsl(var(--ifs-exile) / 0.15)',
        border: `${bw}px solid hsl(var(--ifs-exile))`,
        boxShadow: d.elaborated
          ? '0 0 14px 3px hsl(var(--ifs-exile) / 0.4)'
          : d.blended
            ? '0 0 10px 3px hsl(var(--ifs-self) / 0.4)'
            : undefined,
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-0 !w-0 !h-0" />
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0 !w-0 !h-0" />
      {d.elaborated && (
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[8px] flex items-center justify-center">✦</span>
      )}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-0.5"
        style={{ background: 'hsl(var(--ifs-exile) / 0.3)', color: 'hsl(var(--ifs-exile))' }}
      >
        {d.initial}
      </div>
      <div className="font-semibold text-[10px] text-foreground leading-tight">{d.name}</div>
      <div className="text-[8px] text-muted-foreground">Exile</div>
    </div>
  );
});
ExileNode.displayName = 'ExileNode';

// ── Self: Larger octagon, gold fill ──
export const SelfNode = memo(({ data }: NodeProps) => {
  const d = data as { name: string; initial: string; intensity: string; elaborated: boolean; blended: boolean };
  const bw = intensityBorder(d.intensity);
  return (
    <div className="relative" style={{ width: 130, height: 130 }}>
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-0 !w-0 !h-0" style={{ top: 8 }} />
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0 !w-0 !h-0" style={{ bottom: 8 }} />
      <svg viewBox="0 0 130 130" className="absolute inset-0 w-full h-full">
        <polygon
          points="39,4 91,4 126,39 126,91 91,126 39,126 4,91 4,39"
          fill="hsl(var(--ifs-self) / 0.18)"
          stroke="hsl(var(--ifs-self))"
          strokeWidth={bw}
          filter="url(#selfGlow)"
        />
        <defs>
          <filter id="selfGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold mb-1"
          style={{ background: 'hsl(var(--ifs-self) / 0.35)', color: 'hsl(var(--ifs-self))' }}
        >
          ☀
        </div>
        <div className="font-bold text-xs text-foreground">{d.name}</div>
        <div className="text-[9px] text-muted-foreground">Self</div>
      </div>
    </div>
  );
});
SelfNode.displayName = 'SelfNode';
