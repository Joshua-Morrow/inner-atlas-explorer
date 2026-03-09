import { useState, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStore } from '@/lib/store';
import { useElaborationStore } from '@/lib/elaborationStore';
import { useSelfEnergyStore } from '@/lib/selfEnergyStore';
import { useRefineStore } from '@/lib/refineStore';

export default function PartsMap() {
  const parts = useStore((state) => state.parts);
  const { isPartElaborated } = useElaborationStore();
  const { getLatestCheckIn, getRecentBlendedPartIds } = useSelfEnergyStore();
  const { getRefinementLevel } = useRefineStore();
  const latestCheckIn = getLatestCheckIn();
  const blendedIds = getRecentBlendedPartIds();
  
  // Position map — Self centered, others around
  const positionMap: Record<string, { x: number; y: number }> = {
    p5: { x: 400, y: 250 },
    p1: { x: 150, y: 120 },
    p4: { x: 650, y: 120 },
    p2: { x: 150, y: 380 },
    p3: { x: 650, y: 380 },
  };

  // Shape: Manager=rounded-lg, Firefighter=starburst clip, Exile=rounded-full, Self=octagon clip
  const shapeStyle = (type: string): React.CSSProperties => {
    if (type === 'Self') return { clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' };
    if (type === 'Firefighter') return { clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' };
    return {};
  };
  const shapeClass = (type: string) => {
    if (type === 'Exile') return 'rounded-full';
    if (type === 'Manager') return 'rounded-lg';
    return '';
  };

  const initialNodes: Node[] = parts.map((part, index) => {
    const elaborated = isPartElaborated(part.id);
    const isBlended = blendedIds.includes(part.id);
    const refined = getRefinementLevel(part.id) !== 'none';
    const pos = positionMap[part.id] || { x: 250 + index * 150, y: 200 };

    return {
      id: part.id,
      position: pos,
      data: {
        label: (
          <div
            className={`p-4 text-center border-2 shadow-sm bg-card relative ${shapeClass(part.type)}`}
            style={{
              borderColor: part.accentColor,
              boxShadow: elaborated ? `0 0 12px 2px ${part.accentColor}60` : refined ? `0 0 10px 2px ${part.accentColor}40` : isBlended ? `0 0 10px 3px hsl(45, 90%, 50%, 0.4)` : undefined,
              ...(part.type === 'Self' || part.type === 'Firefighter' ? shapeStyle(part.type) : {}),
              minWidth: part.type === 'Self' ? 100 : 90,
              minHeight: part.type === 'Self' ? 100 : undefined,
              display: 'flex',
              flexDirection: 'column' as const,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: part.type === 'Self' ? `${part.accentColor}18` : undefined,
            }}
          >
            {elaborated && (
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary" title="Elaborated">
                <span className="text-[8px] text-primary-foreground flex items-center justify-center h-full">✦</span>
              </div>
            )}
            <div className="font-bold text-sm">{part.name}</div>
            <div className="text-[10px] opacity-70">{part.type}</div>
          </div>
        ),
      },
      style: { width: part.type === 'Self' ? 120 : 110 },
    };
  });

  const initialEdges: Edge[] = [
    { id: 'e1-3', source: 'p1', target: 'p3', label: 'protects', style: { stroke: 'hsl(230, 60%, 40%)', strokeWidth: 2 }, animated: true },
    { id: 'e4-3', source: 'p4', target: 'p3', label: 'protects', style: { stroke: 'hsl(210, 50%, 35%)', strokeWidth: 2 }, animated: true },
    { id: 'e2-3', source: 'p2', target: 'p3', label: 'protects', style: { stroke: 'hsl(30, 90%, 50%)', strokeWidth: 2 }, animated: true },
    { id: 'e1-4', source: 'p1', target: 'p4', label: 'allied', style: { stroke: 'hsl(140, 50%, 45%)', strokeWidth: 2 } },
    { id: 'e1-2', source: 'p1', target: 'p2', label: 'tension', style: { stroke: 'hsl(0, 84%, 60%)', strokeWidth: 2, strokeDasharray: '5,5' } },
    { id: 'e5-1', source: 'p5', target: 'p1', style: { stroke: 'hsl(45, 90%, 50%)', strokeWidth: 1.5 } },
    { id: 'e5-2', source: 'p5', target: 'p2', style: { stroke: 'hsl(45, 90%, 50%)', strokeWidth: 1.5 } },
    { id: 'e5-3', source: 'p5', target: 'p3', style: { stroke: 'hsl(45, 90%, 50%)', strokeWidth: 1.5 } },
    { id: 'e5-4', source: 'p5', target: 'p4', style: { stroke: 'hsl(45, 90%, 50%)', strokeWidth: 1.5 } },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Parts Map</h1>
        <p className="text-muted-foreground">Interactive visualization of your internal system.</p>
      </div>
      
      <div className="flex-1 rounded-xl border bg-card shadow-inner overflow-hidden relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          attributionPosition="bottom-right"
        >
          <Controls />
          <MiniMap zoomable pannable className="bg-background" />
          <Background color="#ccc" gap={16} />
        </ReactFlow>

        {/* Self-energy gauge overlay */}
        {latestCheckIn && (
          <div className="absolute bottom-4 left-4 z-10 bg-card/90 backdrop-blur-sm border rounded-lg p-3 shadow-md">
            <div className="relative w-12 h-12 mx-auto">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(45, 90%, 50%)" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${(latestCheckIn.overallEnergy / 100) * 251.3} 251.3`} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold">{latestCheckIn.overallEnergy}%</span>
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground text-center mt-1">Self Energy</div>
          </div>
        )}
      </div>
    </div>
  );
}