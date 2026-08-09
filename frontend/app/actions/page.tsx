"use client";

import React, { useState, useCallback, useEffect } from 'react';
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
  TextArea,
  ContentSwitcher,
  Switch
} from '@carbon/react';
import { Save, Code, ChartNetwork } from '@carbon/icons-react';

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
  
  const [activeTab, setActiveTab] = useState<'visual' | 'json'>('visual');
  const [jsonConfig, setJsonConfig] = useState('');

  // Sync ReactFlow state -> JSON state when switching to JSON tab
  useEffect(() => {
    if (activeTab === 'json') {
      setJsonConfig(JSON.stringify({ nodes, edges }, null, 2));
    }
  }, [activeTab, nodes, edges]);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonConfig(e.target.value);
    try {
      const parsed = JSON.parse(e.target.value);
      if (parsed.nodes) setNodes(parsed.nodes);
      if (parsed.edges) setEdges(parsed.edges);
    } catch (err) {
      // Ignore parse errors while typing
    }
  };

  const handleSave = async () => {
    const config = activeTab === 'json' ? jsonConfig : JSON.stringify({ nodes, edges });
    
    try {
      const res = await fetch('http://localhost:5000/api/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `ApiKey ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: 'New Custom Action',
          description: 'Created via Action Builder',
          configJson: config,
          isActive: true
        })
      });
      if (res.ok) {
        alert('Config saved successfully!');
      } else {
        alert('Failed to save config.');
      }
    } catch (e) {
      console.error(e);
      alert('Error saving config.');
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="p-4 border-b border-[var(--cds-ui-03)] bg-[var(--cds-ui-01)] flex justify-between items-center">
        <div>
          <Breadcrumb>
            <BreadcrumbItem href="/">Dashboard</BreadcrumbItem>
            <BreadcrumbItem href="/actions">Actions Engine</BreadcrumbItem>
          </Breadcrumb>
          <h1 className="text-2xl font-bold mt-2 text-[var(--cds-text-01)]">Actions Engine Builder</h1>
          <p className="text-[var(--cds-text-02)]">Design your call flow logic using No-Code nodes or JSON.</p>
        </div>
        <div className="flex items-center space-x-4">
          <ContentSwitcher onChange={(e: any) => setActiveTab(e.name === 'visual' ? 'visual' : 'json')} selectedIndex={activeTab === 'visual' ? 0 : 1}>
            <Switch name="visual" text="Visual Builder" />
            <Switch name="json" text="JSON Config" />
          </ContentSwitcher>
          <Button renderIcon={Save} onClick={handleSave}>
            Save Flow
          </Button>
        </div>
      </div>

      <div className="flex-1 w-full bg-[var(--cds-ui-02)] relative flex">
        {activeTab === 'visual' ? (
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
        ) : (
          <div className="flex-1 p-8 bg-[var(--cds-layer-01)]">
            <TextArea 
              id="json-editor" 
              labelText="JSON Configuration"
              value={jsonConfig}
              onChange={handleJsonChange}
              rows={30}
              className="font-mono text-sm h-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}
