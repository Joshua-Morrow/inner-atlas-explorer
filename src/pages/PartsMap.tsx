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

export default function PartsMap() {
  const parts = useStore((state) => state.parts);
  
  // Transform parts into nodes
  const initialNodes: Node[] = parts.map((part, index) => {
    let shapeClass = "rounded-md"; // Default / Manager
    if (part.type === 'Firefighter') shapeClass = "rounded-none"; // Jagged approx
    if (part.type === 'Exile') shapeClass = "rounded-full"; // Soft circle
    if (part.type === 'Self') shapeClass = "rounded-full ring-4 ring-offset-2"; // Radiant

    return {
      id: part.id,
      position: { x: 250 + (index * 150), y: 200 + (index % 2 === 0 ? 50 : -50) },
      data: { 
        label: (
          <div className={`p-3 text-center border-2 shadow-sm bg-card ${shapeClass}`}
               style={{ borderColor: part.accentColor }}>
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
      
      <div className="flex-1 rounded-xl border bg-card shadow-inner overflow-hidden">
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
      </div>
    </div>
  );
}