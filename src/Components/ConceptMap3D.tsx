import React, { useRef, useEffect, useState } from 'react';
import { ConceptNode, ConceptLink } from '../types';
import { RotateCcw, ZoomIn, ZoomOut, Compass, Info } from 'lucide-react';

interface ConceptMap3DProps {
  nodes: ConceptNode[];
  links: ConceptLink[];
  topic: string;
  theme?: 'immersive' | 'light';
}

export default function ConceptMap3D({ nodes: initialNodes, links, topic, theme = 'immersive' }: ConceptMap3DProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // States
  const [nodes, setNodes] = useState<ConceptNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<ConceptNode | null>(null);
  const [rotation, setRotation] = useState({ x: 0.15, y: -0.2 }); // In radians
  const [zoom, setZoom] = useState(1.1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Load and adapt nodes
  useEffect(() => {
    if (initialNodes && initialNodes.length > 0) {
      setNodes(initialNodes.map(n => ({ ...n })));
      setSelectedNode(initialNodes[0]);
    }
  }, [initialNodes]);

  // Rotates 3D coordinates based on angles
  const rotatePointX = (y: number, z: number, angle: number) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      rotatedY: y * cos - z * sin,
      rotatedZ: y * sin + z * cos
    };
  };

  const rotatePointY = (x: number, z: number, angle: number) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      rotatedX: x * cos + z * sin,
      rotatedZ: -x * sin + z * cos
    };
  };

  // Main rendering animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      // Project every 3D node to depth-sorted 2D
      const projectedNodes = nodes.map(node => {
        // Step 1: Rotate around Y axis (horizontal)
        const rotY = rotatePointY(node.x, node.z, rotation.y);
        // Step 2: Rotate around X axis (vertical)
        const rotX = rotatePointX(node.y, rotY.rotatedZ, rotation.x);

        // Perspective factor
        const depth = 400; // Camera distance
        const perspective = depth / (depth + rotX.rotatedZ);
        
        return {
          ...node,
          rx: centerX + rotY.rotatedX * zoom * perspective,
          ry: centerY + rotX.rotatedY * zoom * perspective,
          pz: rotX.rotatedZ, // Depth value: negative means closer, positive means further
          pSize: node.size * perspective * zoom,
          opacity: Math.max(0.2, Math.min(1.0, (depth - rotX.rotatedZ) / (depth * 0.8)))
        };
      });

      // Depth sort (draw back nodes first, then links, then front nodes to avoid overlap issues)
      const sortedNodes = [...projectedNodes].sort((a, b) => b.pz - a.pz);

      // Draw Connection Links
      ctx.lineWidth = 1;
      links.forEach(link => {
        const sourceNode = projectedNodes.find(n => n.id === link.source);
        const targetNode = projectedNodes.find(n => n.id === link.target);

        if (sourceNode && targetNode) {
          const avgPz = (sourceNode.pz + targetNode.pz) / 2;
          const alpha = Math.max(0.1, Math.min(0.6, (400 - avgPz) / 450));
          
          // Render links with gradient or soft color
          ctx.beginPath();
          ctx.moveTo(sourceNode.rx!, sourceNode.ry!);
          ctx.lineTo(targetNode.rx!, targetNode.ry!);
          
          ctx.strokeStyle = `rgba(0, 255, 194, ${alpha * 0.75})`;
          ctx.shadowBlur = 0;
          ctx.stroke();
        }
      });

      // Draw Nodes
      sortedNodes.forEach(node => {
        const isSelected = selectedNode?.id === node.id;
        const radius = node.pSize!;

        // Node Glow Effect
        if (isSelected) {
          ctx.shadowColor = 'rgba(0, 255, 194, 0.6)';
          ctx.shadowBlur = 12;
        } else {
          ctx.shadowBlur = 0;
        }

        // Generate circular gradient for futuristic orb representation
        const gradient = ctx.createRadialGradient(
          node.rx!, node.ry!, radius * 0.2,
          node.rx!, node.ry!, radius
        );

        if (node.group === 0) {
          // Central Focus node - bright neon cyber orb
          gradient.addColorStop(0, '#00FFC2');
          gradient.addColorStop(1, '#008F6B');
        } else if (node.group === 1) {
          // Framework principles - high-end deep purple-indigo orb
          gradient.addColorStop(0, '#8183FF');
          gradient.addColorStop(1, '#2D1E70');
        } else {
          // Tactical action steps - gold orange warning orb
          gradient.addColorStop(0, '#FFAD00');
          gradient.addColorStop(1, '#8A4F00');
        }

        ctx.beginPath();
        ctx.arc(node.rx!, node.ry!, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Node outline rings for selection or hierarchy
        if (isSelected) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          // External pulsing indicator
          ctx.beginPath();
          ctx.arc(node.rx!, node.ry!, radius + 5, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(0, 255, 194, 0.3)';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Draw tidy labels paired underneath or inside larger nodes
        if (radius > 8) {
          ctx.shadowBlur = 0;
          ctx.fillStyle = isSelected 
            ? (theme === 'light' ? '#12151c' : '#ffffff') 
            : (theme === 'light' ? 'rgba(18, 21, 28, 0.85)' : 'rgba(241, 245, 249, 0.85)');
          ctx.font = `650 ${isSelected ? '11px' : '9px'} sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(node.label, node.rx!, node.ry! + radius + 11);
        }
      });

      // Ambient rotate slowly when mouse is not active to look automated
      if (!isDragging) {
        setRotation(prev => ({
          x: prev.x,
          y: prev.y + 0.0012
        }));
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [nodes, rotation, zoom, selectedNode, isDragging, links]);

  // Handle Resize triggers safely internally
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      canvas.width = container.clientWidth;
      canvas.height = Math.max(320, container.clientHeight);
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Handle Drag interactions for 3D rotation
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setRotation(prev => ({
      x: prev.x + deltaY * 0.009,
      y: prev.y + deltaX * 0.009
    }));

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Node Clicking Interaction (Raycast matching)
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Projection calculation matching to find click target
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    let clickedNode: ConceptNode | null = null;
    let minDistance = 22; // Maximum tap radius tolerance

    nodes.forEach(node => {
      const rotY = rotatePointY(node.x, node.z, rotation.y);
      const rotX = rotatePointX(node.y, rotY.rotatedZ, rotation.x);
      const depth = 400;
      const perspective = depth / (depth + rotX.rotatedZ);
      
      const rx = centerX + rotY.rotatedX * zoom * perspective;
      const ry = centerY + rotX.rotatedY * zoom * perspective;

      const dist = Math.hypot(mouseX - rx, mouseY - ry);
      if (dist < minDistance) {
        minDistance = dist;
        clickedNode = node;
      }
    });

    if (clickedNode) {
      setSelectedNode(clickedNode);
    }
  };

  const handleRecenter = () => {
    setRotation({ x: 0.15, y: -0.2 });
    setZoom(1.1);
  };

  const handleZoomIn = () => setZoom(z => Math.min(2.5, z + 0.15));
  const handleZoomOut = () => setZoom(z => Math.max(0.5, z - 0.15));

  return (
    <div className="bg-[#0C0C0F] border border-[#1A1A1E] rounded-2xl flex flex-col md:flex-row relative h-[440px] overflow-hidden">
      {/* Visual background guide lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1A1A1E_1px,transparent_1px),linear-gradient(to_bottom,#1A1A1E_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35" />

      {/* Floating Header UI */}
      <div className="absolute top-4 left-4 z-10 select-none bg-[#050507]/80 border border-[#1A1A1E] backdrop-blur px-3 py-1.5 rounded-xl pointer-events-none">
        <h4 className="font-sans font-bold text-xs tracking-tight text-white mb-0.5">3D CONCEPT TOPOLOGY</h4>
        <p className="font-mono text-[9px] text-[#71717A]">Interactive decision linkages</p>
      </div>

      {/* Interactive Controls Overlay */}
      <div className="absolute bottom-4 left-4 z-10 flex gap-1.5 bg-[#050507]/90 border border-[#1A1A1E] p-1.5 rounded-xl backdrop-blur-sm">
        <button 
          onClick={handleRecenter}
          title="Recenter Camera" 
          className="p-1.5 bg-[#0C0C0F] hover:bg-[#1A1A1E] border border-[#1A1A1E] rounded transition-colors text-slate-300 cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
        <button 
          onClick={handleZoomIn}
          title="Zoom In" 
          className="p-1.5 bg-[#0C0C0F] hover:bg-[#1A1A1E] border border-[#1A1A1E] rounded transition-colors text-slate-300 cursor-pointer"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>
        <button 
          onClick={handleZoomOut}
          title="Zoom Out" 
          className="p-1.5 bg-[#0C0C0F] hover:bg-[#1A1A1E] border border-[#1A1A1E] rounded transition-colors text-slate-300 cursor-pointer"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </button>
        <div className="h-full w-[1px] bg-[#1A1A1E] mx-1 self-center" />
        <span className="flex items-center gap-1 font-mono text-[9px] text-[#71717A] px-1 select-none uppercase">
          <Compass className="h-3.5 w-3.5 text-[#00FFC2] animate-spin" style={{ animationDuration: '6s' }} />
          Drag to Rotate
        </span>
      </div>

      {/* Primary Rendering View */}
      <div ref={containerRef} className="flex-1 min-h-[220px] h-full relative cursor-grab active:cursor-grabbing">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onClick={handleCanvasClick}
          className="block w-full h-full"
        />
      </div>

      {/* Selection detail right panel */}
      {selectedNode && (
        <div className="w-full md:w-80 bg-[#050507] border-t md:border-t-0 md:border-l border-[#1A1A1E] p-5 flex flex-col justify-between z-10 backdrop-blur-md">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={`px-2 py-0.5 rounded-[4px] text-[8px] font-mono font-bold uppercase tracking-wider ${
                selectedNode.group === 0 ? 'bg-[#00FFC2]/10 text-[#00FFC2] border border-[#00FFC2]/20' :
                selectedNode.group === 1 ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                'bg-orange-500/10 text-orange-400 border border-orange-500/20'
              }`}>
                {selectedNode.group === 0 ? 'Root Problem' : selectedNode.group === 1 ? 'Core Rule Set' : 'Tactics Plan'}
              </span>
              <Info className="h-4 w-4 text-[#71717A]" />
            </div>

            <div>
              <h5 className="font-sans font-extrabold text-sm text-white tracking-tight mb-2">
                {selectedNode.label}
              </h5>
              <p className="text-[#71717A] font-sans leading-relaxed text-xs">
                {selectedNode.description || "Interactive component linked natively with the derived LLM reasoning frameworks."}
              </p>
            </div>
          </div>

          <div className="border-t border-[#1A1A1E] pt-4 mt-4 hidden md:block">
            <p className="font-mono text-[9.5px] text-[#71717A] leading-relaxed uppercase tracking-wider">
              Node ID: {selectedNode.id}<br />
              Relational Vector: [3D spatial projection]
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
