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

  // High performance Canvas reference tracking to completely bypass React state-update triggers
  const nodesRef = useRef<ConceptNode[]>([]);
  const linksRef = useRef<ConceptLink[]>([]);
  const selectedNodeRef = useRef<ConceptNode | null>(null);
  const rotationRef = useRef({ x: 0.15, y: -0.2 });
  const zoomRef = useRef(1.1);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Right Side Detail Panel display state
  const [selectedNode, setSelectedNode] = useState<ConceptNode | null>(null);

  // Sync initial configuration states with canvas render trackers
  useEffect(() => {
    if (initialNodes && initialNodes.length > 0) {
      const adapted = initialNodes.map(n => ({ ...n }));
      nodesRef.current = adapted;
      setSelectedNode(adapted[0]);
      selectedNodeRef.current = adapted[0];
    }
  }, [initialNodes]);

  useEffect(() => {
    linksRef.current = links || [];
  }, [links]);

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

      // Project every 3D node to depth-sorted 2D using ref values
      const currentNodes = nodesRef.current;
      const currentLinks = linksRef.current;
      const currentRotation = rotationRef.current;
      const currentZoom = zoomRef.current;
      const currentSelectedNode = selectedNodeRef.current;
      const currentIsDragging = isDraggingRef.current;

      const projectedNodes = currentNodes.map(node => {
        // Step 1: Rotate around Y axis (horizontal)
        const rotY = rotatePointY(node.x, node.z, currentRotation.y);
        // Step 2: Rotate around X axis (vertical)
        const rotX = rotatePointX(node.y, rotY.rotatedZ, currentRotation.x);

        // Perspective factor
        const depth = 400; // Camera distance
        const perspective = depth / (depth + rotX.rotatedZ);
        
        return {
          ...node,
          rx: centerX + rotY.rotatedX * currentZoom * perspective,
          ry: centerY + rotX.rotatedY * currentZoom * perspective,
          pz: rotX.rotatedZ,
          pSize: node.size * perspective * currentZoom,
          opacity: Math.max(0.2, Math.min(1.0, (depth - rotX.rotatedZ) / (depth * 0.8)))
        };
      });

      // Depth sort
      const sortedNodes = [...projectedNodes].sort((a, b) => b.pz - a.pz);

      // Draw Connection Links
      ctx.lineWidth = 1;
      currentLinks.forEach(link => {
        const sourceNode = projectedNodes.find(n => n.id === link.source);
        const targetNode = projectedNodes.find(n => n.id === link.target);

        if (sourceNode && targetNode) {
          const avgPz = (sourceNode.pz + targetNode.pz) / 2;
          const alpha = Math.max(0.1, Math.min(0.6, (400 - avgPz) / 450));
          
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
        const isSelected = currentSelectedNode?.id === node.id;
        const radius = node.pSize!;

        // Node Glow Effect
        if (isSelected) {
          ctx.shadowColor = 'rgba(0, 255, 194, 0.6)';
          ctx.shadowBlur = 12;
        } else {
          ctx.shadowBlur = 0;
        }

        const gradient = ctx.createRadialGradient(
          node.rx!, node.ry!, radius * 0.2,
          node.rx!, node.ry!, radius
        );

        if (node.group === 0) {
          gradient.addColorStop(0, '#00FFC2');
          gradient.addColorStop(1, '#008F6B');
        } else if (node.group === 1) {
          gradient.addColorStop(0, '#8183FF');
          gradient.addColorStop(1, '#2D1E70');
        } else {
          gradient.addColorStop(0, '#FFAD00');
          gradient.addColorStop(1, '#8A4F00');
        }

        ctx.beginPath();
        ctx.arc(node.rx!, node.ry!, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        if (isSelected) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.lineWidth = 2;
          ctx.stroke();
          
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

      // Ambient rotate slowly when mouse is not active
      if (!currentIsDragging) {
        rotationRef.current = {
          x: currentRotation.x,
          y: currentRotation.y + 0.0012
        };
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

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
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    rotationRef.current = {
      x: rotationRef.current.x + deltaY * 0.009,
      y: rotationRef.current.y + deltaX * 0.009
    };

    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
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

    nodesRef.current.forEach(node => {
      const rotY = rotatePointY(node.x, node.z, rotationRef.current.y);
      const rotX = rotatePointX(node.y, rotY.rotatedZ, rotationRef.current.x);
      const depth = 400;
      const perspective = depth / (depth + rotX.rotatedZ);
      
      const rx = centerX + rotY.rotatedX * zoomRef.current * perspective;
      const ry = centerY + rotX.rotatedY * zoomRef.current * perspective;

      const dist = Math.hypot(mouseX - rx, mouseY - ry);
      if (dist < minDistance) {
        minDistance = dist;
        clickedNode = node;
      }
    });

    if (clickedNode) {
      setSelectedNode(clickedNode);
      selectedNodeRef.current = clickedNode;
    }
  };

  const handleRecenter = () => {
    rotationRef.current = { x: 0.15, y: -0.2 };
    zoomRef.current = 1.1;
  };

  const handleZoomIn = () => {
    zoomRef.current = Math.min(2.5, zoomRef.current + 0.15);
  };
  const handleZoomOut = () => {
    zoomRef.current = Math.max(0.5, zoomRef.current - 0.15);
  };

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
