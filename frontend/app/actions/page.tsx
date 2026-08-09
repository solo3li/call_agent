"use client";

import React, { useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  InlineNotification
} from '@carbon/react';
import { Save } from '@carbon/icons-react';

const initialNodes = [
  { id: '1', position: { x: 250, y: 5 }, data: { label: 'Start Call' }, type: 'input' },
  { id: '2', position: { x: 100, y: 100 }, data: { label: 'AI Greeting' } },
  { id: '3', position: { x: 400, y: 100 }, data: { label: 'Check Time Condition' } },
  { id: '4', position: { x: 400, y: 200 }, data: { label: 'Transfer to Support' }, type: 'output' },
];
const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e1-3', source: '1', target: '3' },
  { id: 'e3-4', source: '3', target: '4', animated: true },
];

export default function ActionsBuilderPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const handleSave = () => {
    // Generate JSON config from nodes and edges
    const config = { nodes, edges };
    console.log('Saved Config:', JSON.stringify(config));
    alert('Config saved to console!');
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="p-4 border-b border-[var(--cds-ui-03)] bg-[var(--cds-ui-01)] flex justify-between items-center">
        <div>
          <Breadcrumb>
            <BreadcrumbItem href="/">Dashboard</BreadcrumbItem>
            <BreadcrumbItem href="/actions">Actions Engine</BreadcrumbItem>
          </Breadcrumb>
          <h1 className="text-2xl font-bold mt-2 text-[var(--cds-text-01)]">Visual Actions Builder</h1>
          <p className="text-[var(--cds-text-02)]">Design your call flow logic using No-Code nodes.</p>
        </div>
        <Button renderIcon={Save} onClick={handleSave}>
          Save Flow
        </Button>
      </div>

      <div className="flex-1 w-full bg-[var(--cds-ui-02)] relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
}
