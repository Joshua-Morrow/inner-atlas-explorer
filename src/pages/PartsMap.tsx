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

export default function PartsMap() {
  const parts = useStore((state) => state.parts);
  const { isPartElaborated } = useElaborationStore();
  const { getLatestCheckIn, getRecentBlendedPartIds } = useSelfEnergyStore();
  const latestCheckIn = getLatestCheckIn();
  const blendedIds = getRecentBlendedPartIds();
  
  // Transform parts into nodes
  const initialNodes: Node[] = parts.map((part, index) => {
    let shapeClass = "rounded-md"; // Default / Manager
    if (part.type === 'Firefighter') shapeClass = "rounded-none"; // Jagged approx
    if (part.type === 'Exile') shapeClass = "rounded-full"; // Soft circle
    if (part.type === 'Self') shapeClass = "rounded-full ring-4 ring-offset-2"; // Radiant

    const elaborated = isPartElaborated(part.id);
    const isBlended = blendedIds.includes(part.id);

    return {
      id: part.id,
      position: { x: 250 + (index * 150), y: 200 + (index % 2 === 0 ? 50 : -50) },
      data: { 
        label: (
          <div className={`p-3 text-center border-2 shadow-sm bg-card ${shapeClass} relative`}
               style={{ borderColor: part.accentColor, boxShadow: elaborated ? `0 0 12px 2px ${part.accentColor}60` : isBlended ? `0 0 10px 3px hsl(45, 90%, 50%, 0.4)` : undefined }}>
            {elaborated && (
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary" title="Elaborated">
                <span className="text-[8px] text-primary-foreground flex items-center justify-center h-full">✦</span>
              </div>
            )}
            <div className="font-bold">{part.name}</div>
            <div className="text-xs opacity-70">{part.type}</div>
          </div>
        )
      },
      style: { width: 120 }
    };
  });

  const initialEdges: Edge[] = [
    { id: 'e1-2', source: 'p1', target: 'p2', animated: true, style: { stroke: 'hsl(0, 84.2%, 60.2%)', strokeWidth: 2 } },
    { id: 'e1-3', source: 'p1', target: 'p3', style: { stroke: 'hsl(214.3, 31.8%, 91.4%)', strokeWidth: 2 } },
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