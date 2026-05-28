import React, { useState, useRef, useEffect } from 'react';
import { 
  PenTool, Palette, Plus, Trash2, Check, X, Eraser, 
  Sparkles, Type, Type as NoteIcon, HelpCircle
} from 'lucide-react';

interface StickyNote {
  id: string;
  text: string;
  x: number; // percentage positions for responsive safety (0 to 100)
  y: number;
  color: 'yellow' | 'blue' | 'pink' | 'green';
  category?: 'Strategic' | 'Urgent' | 'Idea' | 'None';
}

interface WhiteboardAnnotatorProps {
  imageSrc: string;
  onSave: (finalBase64: string) => void;
  onCancel: () => void;
}

const NOTE_COLORS = {
  yellow: { bg: 'bg-amber-100 border-amber-300', text: 'text-amber-900', rawBg: '#FEF08A', rawText: '#78350F' },
  blue: { bg: 'bg-sky-100 border-sky-300', text: 'text-sky-900', rawBg: '#E0F2FE', rawText: '#0C4A6E' },
  pink: { bg: 'bg-rose-100 border-rose-300', text: 'text-rose-900', rawBg: '#FFE4E6', rawText: '#881337' },
  green: { bg: 'bg-emerald-100 border-emerald-300', text: 'text-emerald-900', rawBg: '#D1FAE5', rawText: '#064E3B' }
};

export default function WhiteboardAnnotator({ imageSrc, onSave, onCancel }: WhiteboardAnnotatorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#EF4444'); // default red pen
  const [brushSize, setBrushSize] = useState(4);
  const [isEraser, setIsEraser] = useState(false);

  // Sticky notes state
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  // Dragging states
  const draggingNoteIdRef = useRef<string | null>(null);
  const dragStartPosRef = useRef({ x: 0, y: 0 });

  // Load image onto canvas on initialization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      // Scale canvas dimensions to adapt the image without exploding memory space
      const maxDim = 800;
      let targetWidth = img.naturalWidth || 800;
      let targetHeight = img.naturalHeight || 600;

      if (targetWidth > maxDim || targetHeight > maxDim) {
        if (targetWidth > targetHeight) {
          targetHeight = Math.round((targetHeight * maxDim) / targetWidth);
          targetWidth = maxDim;
        } else {
          targetWidth = Math.round((targetWidth * maxDim) / targetHeight);
          targetHeight = maxDim;
        }
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Draw initial white background then image clear
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      setImageLoaded(true);

      // Spawn a default helping sticky note to instruct the user
      setStickyNotes([
        {
          id: 'welcome-note',
          text: 'Drag me and write database structures / review logs!',
          x: 45,
          y: 25,
          color: 'yellow',
          category: 'Strategic'
        }
      ]);
    };
  }, [imageSrc]);

  // Drawing mouse handlers
  const handleStartDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = isEraser ? '#FFFFFF' : brushColor;
    ctx.lineWidth = brushSize;
    
    setIsDrawing(true);
  };

  const handleDrawMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleStopDrawing = () => {
    setIsDrawing(false);
  };

  // Sticky notes orchestration
  const handleAddStickyNote = (color: 'yellow' | 'blue' | 'pink' | 'green') => {
    const newNote: StickyNote = {
      id: 'note-' + Date.now(),
      text: 'New sticky note. Press to edit strategies!',
      x: 35 + Math.random() * 20,
      y: 35 + Math.random() * 20,
      color,
      category: 'Strategic'
    };
    setStickyNotes(prev => [...prev, newNote]);
  };

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStickyNotes(prev => prev.filter(n => n.id !== id));
    if (selectedNoteId === id) setSelectedNoteId(null);
  };

  const handleRotateCategory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const categories: ('Strategic' | 'Urgent' | 'Idea' | 'None')[] = ['Strategic', 'Urgent', 'Idea', 'None'];
    setStickyNotes(prev => prev.map(n => {
      if (n.id === id) {
        const current = n.category || 'Strategic';
        const nextIndex = (categories.indexOf(current) + 1) % categories.length;
        return { ...n, category: categories[nextIndex] };
      }
      return n;
    }));
  };

  const handleUpdateNoteText = (id: string, text: string) => {
    setStickyNotes(prev => prev.map(n => n.id === id ? { ...n, text } : n));
  };

  // Dragging event handlers for sticky notes inside container
  const handleNoteDragStart = (id: string, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    draggingNoteIdRef.current = id;
    setSelectedNoteId(id);

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const note = stickyNotes.find(n => n.id === id);
    if (note && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      // Calculate start offsets from click base
      dragStartPosRef.current = {
        x: clientX - (containerRect.left + (note.x / 100) * containerRect.width),
        y: clientY - (containerRect.top + (note.y / 100) * containerRect.height)
      };
    }
  };

  const handleContainerPointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    const noteId = draggingNoteIdRef.current;
    if (!noteId || !containerRef.current) return;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Calculate new percentage position safely within container boundaries
    const rawX = clientX - containerRect.left - dragStartPosRef.current.x;
    const rawY = clientY - containerRect.top - dragStartPosRef.current.y;

    const percentageX = Math.max(0, Math.min(90, (rawX / containerRect.width) * 100));
    const percentageY = Math.max(0, Math.min(90, (rawY / containerRect.height) * 100));

    setStickyNotes(prev => prev.map(n => n.id === noteId ? { ...n, x: percentageX, y: percentageY } : n));
  };

  const handleContainerPointerUp = () => {
    draggingNoteIdRef.current = null;
  };

  // Compile both drawings and interactive sticky notes onto the high-resolution canvas, then submit as flattened base64
  const handleFinalSubmit = () => {
    const editCanvas = canvasRef.current;
    if (!editCanvas) return;

    // Create a temporary export canvas to safely flaten everything
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = editCanvas.width;
    exportCanvas.height = editCanvas.height;
    
    const exportCtx = exportCanvas.getContext('2d');
    if (!exportCtx) return;

    // 1. Draw edited canvas image + painted strokes first
    exportCtx.drawImage(editCanvas, 0, 0);

    // 2. Draw each sticky note manually into the exported canvas
    stickyNotes.forEach(note => {
      const noteWidth = 140; 
      const noteHeight = 110;

      // Convert percentage coordinates into canvas coordinates
      const noteX = (note.x / 100) * editCanvas.width;
      const noteY = (note.y / 100) * editCanvas.height;

      // Draw sticky note background box
      const colorData = NOTE_COLORS[note.color];
      exportCtx.fillStyle = colorData.rawBg;
      exportCtx.strokeStyle = '#CCCCCC';
      exportCtx.lineWidth = 1.5;

      // Draw rounded rectangle
      const radius = 6;
      exportCtx.beginPath();
      exportCtx.moveTo(noteX + radius, noteY);
      exportCtx.lineTo(noteX + noteWidth - radius, noteY);
      exportCtx.quadraticCurveTo(noteX + noteWidth, noteY, noteX + noteWidth, noteY + radius);
      exportCtx.lineTo(noteX + noteWidth, noteY + noteHeight - radius);
      exportCtx.quadraticCurveTo(noteX + noteWidth, noteY + noteHeight, noteX + noteWidth - radius, noteY + noteHeight);
      exportCtx.lineTo(noteX + radius, noteY + noteHeight);
      exportCtx.quadraticCurveTo(noteX, noteY + noteHeight, noteX, noteY + noteHeight - radius);
      exportCtx.lineTo(noteX, noteY + radius);
      exportCtx.quadraticCurveTo(noteX, noteY, noteX + radius, noteY);
      exportCtx.closePath();
      exportCtx.fill();
      exportCtx.stroke();

      // Draw category label badge if not None
      const category = note.category || 'Strategic';
      if (category !== 'None') {
        exportCtx.save();
        exportCtx.fillStyle = category === 'Urgent'
          ? '#F59E0B' // amber
          : category === 'Strategic'
          ? '#6366F1' // indigo
          : category === 'Idea'
          ? '#10B981' // emerald
          : '#B45309';
          
        if (category === 'Urgent') exportCtx.fillStyle = '#EF4444'; // real red
        if (category === 'Strategic') exportCtx.fillStyle = '#4F46E5'; // deep indigo
        if (category === 'Idea') exportCtx.fillStyle = '#10B981'; // green

        const badgeWidth = 44;
        const badgeHeight = 11;
        const badgeX = noteX + noteWidth - badgeWidth - 8;
        const badgeY = noteY + 8;
        
        // draw badge rect
        exportCtx.beginPath();
        if ((exportCtx as any).roundRect) {
          (exportCtx as any).roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 2);
        } else {
          exportCtx.rect(badgeX, badgeY, badgeWidth, badgeHeight);
        }
        exportCtx.fill();
        
        // draw badge text
        exportCtx.fillStyle = '#FFFFFF';
        exportCtx.font = 'bold 7px sans-serif';
        exportCtx.textAlign = 'center';
        exportCtx.textBaseline = 'middle';
        exportCtx.fillText(category.toUpperCase(), badgeX + badgeWidth / 2, badgeY + badgeHeight / 2);
        exportCtx.restore();
      }

      // Draw Note text content with crude wrapping
      exportCtx.fillStyle = colorData.rawText;
      exportCtx.font = 'bold 9px sans-serif';
      
      const words = note.text.split(' ');
      let line = '';
      let textY = noteY + 16;
      const textX = noteX + 10;
      const maxWidth = noteWidth - 20;
      const lineHeight = 11;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = exportCtx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          exportCtx.fillText(line, textX, textY);
          line = words[n] + ' ';
          textY += lineHeight;
        } else {
          line = testLine;
        }
      }
      exportCtx.fillText(line, textX, textY);
    });

    // Extract high-quality composite base64 and save
    const base64Content = exportCanvas.toDataURL('image/png', 0.92);
    onSave(base64Content);
  };

  return (
    <div className="bg-immersive-card border border-immersive-border rounded-2xl overflow-hidden shadow-2xl flex flex-col max-w-4xl mx-auto w-full animate-fade-in relative z-40">
      
      {/* Header bar */}
      <div className="bg-immersive-bg border-b border-immersive-border p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-immersive-accent" />
          <div>
            <h3 className="font-sans font-extrabold text-xs text-immersive-text-white tracking-wider uppercase">
              Perfect Vision: Live Whiteboard Annotator
            </h3>
            <p className="text-[10px] text-immersive-dim">
              Hold and click to paint annotations over files, and place responsive color sticky notes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-immersive-border hover:bg-black/20 text-xs font-semibold text-immersive-dim hover:text-white transition-all cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
            Discard
          </button>
          
          <button
            type="button"
            onClick={handleFinalSubmit}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-immersive-accent text-immersive-bg text-xs font-bold shadow-lg shadow-immersive-accent/10 hover:shadow-immersive-accent/30 hover:brightness-110 transition-all cursor-pointer"
          >
            <Check className="h-3.5 w-3.5" />
            Apply Annotations & Back to Chat
          </button>
        </div>
      </div>

      {/* Editor Main Sandbox Workspace split */}
      <div className="grid grid-cols-1 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-immersive-border min-h-[460px] bg-immersive-bg/50">
        
        {/* Sidebar Controls Panel */}
        <div className="p-4 space-y-5 lg:col-span-1 flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Draw Mode selection buttons */}
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-immersive-dim block mb-2">
                1. Select Brush Mode
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsEraser(false)}
                  className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                    !isEraser 
                      ? 'bg-immersive-accent/10 border-immersive-accent text-immersive-accent' 
                      : 'bg-immersive-card border-immersive-border text-immersive-dim hover:text-white'
                  }`}
                >
                  <PenTool className="h-3.5 w-3.5" />
                  Pen Brush
                </button>
                <button
                  type="button"
                  onClick={() => setIsEraser(true)}
                  className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                    isEraser 
                      ? 'bg-amber-500/10 border-amber-500 text-amber-500' 
                      : 'bg-immersive-card border-immersive-border text-immersive-dim hover:text-white'
                  }`}
                >
                  <Eraser className="h-3.5 w-3.5" />
                  Eraser
                </button>
              </div>
            </div>

            {/* brush parameters (only visible if not using eraser) */}
            {!isEraser && (
              <div className="space-y-3 animate-fade-in">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-immersive-dim block mb-1.5">
                    Brush Ink Color
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { hex: '#EF4444', label: 'Red' },
                      { hex: '#3B82F6', label: 'Blue' },
                      { hex: '#F59E0B', label: 'Amber' },
                      { hex: '#10B981', label: 'Emerald' },
                      { hex: '#8B5CF6', label: 'Purple' },
                      { hex: '#000000', label: 'Black' }
                    ].map(col => (
                      <button
                        key={col.hex}
                        type="button"
                        onClick={() => setBrushColor(col.hex)}
                        className={`h-6 w-6 rounded-full border transition-all cursor-pointer ${
                          brushColor === col.hex ? 'border-white scale-110 ring-2 ring-immersive-accent/50' : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: col.hex }}
                        title={col.label}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-[10px] font-mono uppercase text-immersive-dim mb-1">
                    <span>Brush Size ({brushSize}px)</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="14"
                    step="1"
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className="w-full accent-immersive-accent"
                  />
                </div>
              </div>
            )}

            {/* Sticky Notes addition control list */}
            <div className="pt-2 border-t border-immersive-border/65">
              <span className="text-[10px] font-mono uppercase tracking-wider text-immersive-dim block mb-2">
                2. Spawn Sticky Note
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { color: 'yellow' as const, label: 'Yellow Note', hex: 'bg-amber-100' },
                  { color: 'blue' as const, label: 'Blue Note', hex: 'bg-sky-100' },
                  { color: 'pink' as const, label: 'Pink Note', hex: 'bg-rose-100' },
                  { color: 'green' as const, label: 'Green Note', hex: 'bg-emerald-100' }
                ].map(item => (
                  <button
                    key={item.color}
                    type="button"
                    onClick={() => handleAddStickyNote(item.color)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-immersive-card hover:bg-immersive-aside border border-immersive-border text-[10px] font-semibold text-immersive-text-white cursor-pointer hover:border-immersive-accent/60 transition-colors"
                  >
                    <span className={`h-2.5 w-2.5 rounded-sm ${item.hex}`} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Quick tips guide indicator at base of control board */}
          <div className="bg-immersive-card/50 border border-immersive-border/60 p-3 rounded-xl flex items-start gap-1.5">
            <HelpCircle className="h-4 w-4 text-immersive-accent shrink-0 mt-0.5" />
            <p className="text-[9.5px] text-immersive-dim leading-normal">
              Click & drag elements on top of the drawing stage! Double tap to edit text right inside notes. Tap apply annotations when finished.
            </p>
          </div>
        </div>

        {/* Live Interactive Board Canvas Frame */}
        <div className="lg:col-span-3 p-4 flex items-center justify-center relative overflow-hidden">
          
          <div 
            ref={containerRef}
            onMouseMove={handleContainerPointerMove}
            onTouchMove={handleContainerPointerMove}
            onMouseUp={handleContainerPointerUp}
            onTouchEnd={handleContainerPointerUp}
            className="max-w-full max-h-[500px] border border-immersive-border/90 rounded-xl relative shadow-2xl bg-slate-950 overflow-hidden select-none"
          >
            {/* Drawing Canvas */}
            <canvas
              ref={canvasRef}
              onMouseDown={handleStartDrawing}
              onTouchStart={handleStartDrawing}
              onMouseMove={handleDrawMove}
              onTouchMove={handleDrawMove}
              onMouseUp={handleStopDrawing}
              onTouchEnd={handleStopDrawing}
              onMouseLeave={handleStopDrawing}
              className={`block max-w-full cursor-crosshair rounded-xl ${
                !imageLoaded ? 'opacity-0' : 'opacity-100 animate-fade-in'
              }`}
              style={{ maxHeight: '440px', objectFit: 'contain' }}
            />

            {/* Spinner loader indicator */}
            {!imageLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-immersive-dim text-xs">
                <div className="animate-spin h-5 w-5 border-2 border-immersive-accent border-t-transparent rounded-full" />
                Loading sketch into editor canvas buffer...
              </div>
            )}

            {/* Draggable and editable HTML Sticky note sticker components overlay */}
            {imageLoaded && stickyNotes.map(note => {
              const themeColor = NOTE_COLORS[note.color];
              const isSelected = selectedNoteId === note.id;

              return (
                <div
                  key={note.id}
                  style={{ left: `${note.x}%`, top: `${note.y}%` }}
                  onPointerDown={(e) => handleNoteDragStart(note.id, e)}
                  onMouseDown={(e) => handleNoteDragStart(note.id, e)}
                  onTouchStart={(e) => handleNoteDragStart(note.id, e)}
                  className={`absolute w-[140px] h-[110px] p-2.5 rounded-lg shadow-xl cursor-move border flex flex-col justify-between transition-shadow select-none z-30 ${themeColor.bg} ${
                    isSelected ? 'ring-2 ring-immersive-accent shadow-2xl scale-[1.02]' : 'hover:shadow-md'
                  }`}
                >
                  {/* Note header row containing gripper, category tag, and delete trigger */}
                  <div className="flex items-center justify-between mb-1 text-[9px] uppercase font-mono tracking-wider opacity-90 select-none">
                    <div className="flex items-center gap-1 pointer-events-none">
                      <span className="h-1.5 w-1.5 rounded-full bg-black/60" />
                      <span className="text-black/60 font-semibold">Note</span>
                    </div>

                    <div className="flex items-center gap-1.5 pointer-events-auto">
                      {/* Dynamic clickable rotating Category element tag with custom color coding */}
                      <button
                        type="button"
                        onClick={(e) => handleRotateCategory(note.id, e)}
                        className={`text-[8px] font-sans font-extrabold px-1.5 py-0.5 rounded border leading-none tracking-wide select-none transition-transform active:scale-95 cursor-pointer shadow-sm ${
                          (note.category || 'Strategic') === 'Urgent'
                            ? 'bg-rose-500 border-rose-600 text-white'
                            : (note.category || 'Strategic') === 'Strategic'
                            ? 'bg-indigo-500 border-indigo-600 text-white'
                            : (note.category || 'Strategic') === 'Idea'
                            ? 'bg-emerald-500 border-emerald-600 text-white'
                            : 'bg-black/10 border-black/20 text-black/60'
                        }`}
                        title="Click to cycle categories (Strategic, Urgent, Idea, None)"
                      >
                        {note.category || 'Strategic'}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteNote(note.id, e)}
                        className="text-black/60 hover:text-red-600 p-0.5 rounded cursor-pointer"
                        title="Delete Note"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Editable textarea textbox */}
                  <textarea
                    value={note.text}
                    onChange={(e) => handleUpdateNoteText(note.id, e.target.value)}
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    className={`w-full flex-1 bg-transparent border-none text-[10px] font-sans font-semibold leading-snug resize-none outline-none focus:ring-0 ${themeColor.text}`}
                    placeholder="Type strategic brief..."
                    maxLength={120}
                  />

                  {/* Max characters ticker bar */}
                  <div className="text-right text-[8px] opacity-40 select-none">
                    {note.text.length}/120
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
