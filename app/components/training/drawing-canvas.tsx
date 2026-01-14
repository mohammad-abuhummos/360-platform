import { useRef, useState, useEffect, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Circle, Rect, Line, Arrow, Text as KonvaText, Group, Transformer } from 'react-konva';
import type Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { motion, AnimatePresence } from 'motion/react';
import {
    type DrawingObject,
    type TrainingStep,
    FOOTBALL_BACKGROUNDS,
    getBackgroundUrl,
    PLAYER_COLORS,
    generateObjectId,
} from '~/lib/firestore-training';

interface DrawingCanvasProps {
    step: TrainingStep;
    backgroundCategory: 'football' | 'football-bw';
    backgroundType: string;
    onObjectsChange: (objects: DrawingObject[]) => void;
    isPreviewMode?: boolean;
    width?: number;
    height?: number;
}

type Tool = 'select' | 'player' | 'ball' | 'cone' | 'goal' | 'ladder' | 'hurdle' | 'pole' | 'mannequin' | 'flag' |
    'circle' | 'rectangle' | 'line' | 'arrow' | 'curved-arrow' | 'dashed-line' | 'text' | 'zone';

// Player icon SVG paths
const PlayerIcon = ({ color, hasJersey = false, jerseyColor }: { color: string; hasJersey?: boolean; jerseyColor?: string }) => (
    <Circle radius={15} fill={color} stroke="#fff" strokeWidth={2} />
);

export function DrawingCanvas({
    step,
    backgroundCategory,
    backgroundType,
    onObjectsChange,
    isPreviewMode = false,
    width = 600,
    height = 600,
}: DrawingCanvasProps) {
    const stageRef = useRef<Konva.Stage>(null);
    const transformerRef = useRef<Konva.Transformer>(null);
    const [activeTool, setActiveTool] = useState<Tool>('select');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
    const [activePlayerColor, setActivePlayerColor] = useState<keyof typeof PLAYER_COLORS>('orange');
    const [showTextInput, setShowTextInput] = useState(false);
    const [textInputPos, setTextInputPos] = useState({ x: 0, y: 0 });
    const [textInput, setTextInput] = useState('');

    // Load background image
    useEffect(() => {
        const url = getBackgroundUrl(backgroundCategory, backgroundType, false);
        if (url) {
            const img = new window.Image();
            img.crossOrigin = 'anonymous';
            img.src = url;
            img.onload = () => setBackgroundImage(img);
        }
    }, [backgroundCategory, backgroundType]);

    // Update transformer when selection changes
    useEffect(() => {
        if (!transformerRef.current || !stageRef.current) return;
        
        const transformer = transformerRef.current;
        if (selectedId && !isPreviewMode) {
            const node = stageRef.current.findOne(`#${selectedId}`);
            if (node) {
                transformer.nodes([node]);
            }
        } else {
            transformer.nodes([]);
        }
        transformer.getLayer()?.batchDraw();
    }, [selectedId, step.objects, isPreviewMode]);

    const handleStageClick = useCallback((e: KonvaEventObject<MouseEvent>) => {
        if (isPreviewMode) return;
        
        const stage = stageRef.current;
        if (!stage) return;
        
        const pos = stage.getPointerPosition();
        if (!pos) return;

        // If clicking on empty area with select tool, deselect
        if (e.target === stage && activeTool === 'select') {
            setSelectedId(null);
            return;
        }

        // Add new objects based on active tool
        if (activeTool !== 'select' && e.target === stage) {
            const newObject: DrawingObject = {
                id: generateObjectId(),
                type: activeTool as DrawingObject['type'],
                x: pos.x,
                y: pos.y,
            };

            switch (activeTool) {
                case 'player':
                    newObject.playerColor = activePlayerColor;
                    newObject.radius = 15;
                    break;
                case 'ball':
                    newObject.radius = 10;
                    newObject.fill = '#fff';
                    newObject.stroke = '#000';
                    newObject.strokeWidth = 2;
                    break;
                case 'cone':
                    newObject.fill = '#f97316';
                    newObject.width = 20;
                    newObject.height = 25;
                    break;
                case 'goal':
                    newObject.width = 80;
                    newObject.height = 30;
                    newObject.stroke = '#fff';
                    newObject.strokeWidth = 3;
                    break;
                case 'ladder':
                    newObject.width = 40;
                    newObject.height = 100;
                    newObject.stroke = '#eab308';
                    newObject.strokeWidth = 2;
                    break;
                case 'hurdle':
                    newObject.width = 50;
                    newObject.height = 20;
                    newObject.fill = '#f97316';
                    break;
                case 'pole':
                    newObject.width = 6;
                    newObject.height = 60;
                    newObject.fill = '#f97316';
                    break;
                case 'flag':
                    newObject.width = 20;
                    newObject.height = 40;
                    newObject.fill = '#ef4444';
                    break;
                case 'mannequin':
                    newObject.fill = '#3b82f6';
                    newObject.width = 30;
                    newObject.height = 50;
                    break;
                case 'circle':
                    newObject.radius = 30;
                    newObject.stroke = '#fff';
                    newObject.strokeWidth = 2;
                    break;
                case 'rectangle':
                case 'zone':
                    newObject.width = 60;
                    newObject.height = 40;
                    newObject.stroke = activeTool === 'zone' ? '#f97316' : '#fff';
                    newObject.strokeWidth = 2;
                    newObject.fill = activeTool === 'zone' ? 'rgba(249, 115, 22, 0.2)' : undefined;
                    break;
                case 'text':
                    setShowTextInput(true);
                    setTextInputPos(pos);
                    return;
                default:
                    break;
            }

            if (!['line', 'arrow', 'curved-arrow', 'dashed-line'].includes(activeTool)) {
                onObjectsChange([...step.objects, newObject]);
            }
        }
    }, [activeTool, activePlayerColor, isPreviewMode, onObjectsChange, step.objects]);

    const handleMouseDown = useCallback((e: KonvaEventObject<MouseEvent>) => {
        if (isPreviewMode) return;
        
        const stage = stageRef.current;
        if (!stage) return;
        
        const pos = stage.getPointerPosition();
        if (!pos || e.target !== stage) return;

        if (['line', 'arrow', 'curved-arrow', 'dashed-line'].includes(activeTool)) {
            setIsDrawing(true);
            setDrawStart(pos);
        }
    }, [activeTool, isPreviewMode]);

    const handleMouseUp = useCallback((e: KonvaEventObject<MouseEvent>) => {
        if (!isDrawing || !drawStart || isPreviewMode) return;
        
        const stage = stageRef.current;
        if (!stage) return;
        
        const pos = stage.getPointerPosition();
        if (!pos) return;

        const newObject: DrawingObject = {
            id: generateObjectId(),
            type: activeTool as DrawingObject['type'],
            x: drawStart.x,
            y: drawStart.y,
            points: [0, 0, pos.x - drawStart.x, pos.y - drawStart.y],
            stroke: '#fff',
            strokeWidth: 3,
        };

        if (activeTool === 'dashed-line') {
            // Dashed line will use dash property in rendering
        }

        onObjectsChange([...step.objects, newObject]);
        setIsDrawing(false);
        setDrawStart(null);
    }, [activeTool, drawStart, isDrawing, isPreviewMode, onObjectsChange, step.objects]);

    const handleDragEnd = useCallback((id: string, e: KonvaEventObject<DragEvent>) => {
        if (isPreviewMode) return;
        
        const updatedObjects = step.objects.map(obj => {
            if (obj.id === id) {
                return {
                    ...obj,
                    x: e.target.x(),
                    y: e.target.y(),
                };
            }
            return obj;
        });
        onObjectsChange(updatedObjects);
    }, [isPreviewMode, onObjectsChange, step.objects]);

    const handleTransformEnd = useCallback((id: string, e: KonvaEventObject<Event>) => {
        if (isPreviewMode) return;
        
        const node = e.target;
        const updatedObjects = step.objects.map(obj => {
            if (obj.id === id) {
                return {
                    ...obj,
                    x: node.x(),
                    y: node.y(),
                    rotation: node.rotation(),
                    width: obj.width ? node.width() * node.scaleX() : undefined,
                    height: obj.height ? node.height() * node.scaleY() : undefined,
                    radius: obj.radius ? obj.radius * Math.max(node.scaleX(), node.scaleY()) : undefined,
                };
            }
            return obj;
        });
        
        // Reset scale
        node.scaleX(1);
        node.scaleY(1);
        
        onObjectsChange(updatedObjects);
    }, [isPreviewMode, onObjectsChange, step.objects]);

    const handleTextSubmit = useCallback(() => {
        if (!textInput.trim()) {
            setShowTextInput(false);
            setTextInput('');
            return;
        }

        const newObject: DrawingObject = {
            id: generateObjectId(),
            type: 'text',
            x: textInputPos.x,
            y: textInputPos.y,
            text: textInput,
            fontSize: 16,
            fill: '#fff',
        };

        onObjectsChange([...step.objects, newObject]);
        setShowTextInput(false);
        setTextInput('');
    }, [textInput, textInputPos, onObjectsChange, step.objects]);

    const deleteSelected = useCallback(() => {
        if (!selectedId) return;
        onObjectsChange(step.objects.filter(obj => obj.id !== selectedId));
        setSelectedId(null);
    }, [selectedId, onObjectsChange, step.objects]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (!showTextInput) {
                    deleteSelected();
                }
            }
            if (e.key === 'Escape') {
                setSelectedId(null);
                setActiveTool('select');
                setShowTextInput(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [deleteSelected, showTextInput]);

    const renderObject = (obj: DrawingObject) => {
        const commonProps = {
            id: obj.id,
            key: obj.id,
            x: obj.x,
            y: obj.y,
            rotation: obj.rotation || 0,
            draggable: !isPreviewMode,
            onClick: () => !isPreviewMode && setSelectedId(obj.id),
            onTap: () => !isPreviewMode && setSelectedId(obj.id),
            onDragEnd: (e: KonvaEventObject<DragEvent>) => handleDragEnd(obj.id, e),
            onTransformEnd: (e: KonvaEventObject<Event>) => handleTransformEnd(obj.id, e),
        };

        switch (obj.type) {
            case 'player':
                return (
                    <Circle
                        {...commonProps}
                        radius={obj.radius || 15}
                        fill={PLAYER_COLORS[obj.playerColor || 'orange']}
                        stroke="#fff"
                        strokeWidth={2}
                        shadowColor="#000"
                        shadowBlur={3}
                        shadowOpacity={0.3}
                    />
                );
            case 'ball':
                return (
                    <Group {...commonProps}>
                        <Circle
                            radius={obj.radius || 10}
                            fill="#fff"
                            stroke="#000"
                            strokeWidth={1}
                        />
                        {/* Ball pattern */}
                        <Circle
                            radius={(obj.radius || 10) * 0.4}
                            fill="#000"
                        />
                    </Group>
                );
            case 'cone':
                return (
                    <Line
                        {...commonProps}
                        points={[0, 0, (obj.width || 20) / 2, -(obj.height || 25), obj.width || 20, 0]}
                        closed
                        fill={obj.fill || '#f97316'}
                        stroke="#fff"
                        strokeWidth={1}
                    />
                );
            case 'goal':
                return (
                    <Rect
                        {...commonProps}
                        width={obj.width || 80}
                        height={obj.height || 30}
                        stroke={obj.stroke || '#fff'}
                        strokeWidth={obj.strokeWidth || 3}
                        cornerRadius={2}
                    />
                );
            case 'ladder':
                return (
                    <Group {...commonProps}>
                        <Rect
                            width={obj.width || 40}
                            height={obj.height || 100}
                            stroke={obj.stroke || '#eab308'}
                            strokeWidth={obj.strokeWidth || 2}
                        />
                        {/* Ladder rungs */}
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Line
                                key={i}
                                points={[0, (i + 1) * 16, obj.width || 40, (i + 1) * 16]}
                                stroke={obj.stroke || '#eab308'}
                                strokeWidth={2}
                            />
                        ))}
                    </Group>
                );
            case 'hurdle':
                return (
                    <Rect
                        {...commonProps}
                        width={obj.width || 50}
                        height={obj.height || 20}
                        fill={obj.fill || '#f97316'}
                        stroke="#fff"
                        strokeWidth={1}
                        cornerRadius={2}
                    />
                );
            case 'pole':
                return (
                    <Rect
                        {...commonProps}
                        width={obj.width || 6}
                        height={obj.height || 60}
                        fill={obj.fill || '#f97316'}
                        cornerRadius={3}
                    />
                );
            case 'flag':
                return (
                    <Group {...commonProps}>
                        <Line
                            points={[0, 0, 0, obj.height || 40]}
                            stroke="#333"
                            strokeWidth={3}
                        />
                        <Line
                            points={[0, 0, obj.width || 20, 8, 0, 16]}
                            closed
                            fill={obj.fill || '#ef4444'}
                        />
                    </Group>
                );
            case 'mannequin':
                return (
                    <Group {...commonProps}>
                        <Circle
                            y={-20}
                            radius={10}
                            fill={obj.fill || '#3b82f6'}
                        />
                        <Rect
                            y={-10}
                            width={obj.width || 30}
                            height={(obj.height || 50) - 20}
                            offsetX={(obj.width || 30) / 2}
                            fill={obj.fill || '#3b82f6'}
                            cornerRadius={5}
                        />
                    </Group>
                );
            case 'circle':
                return (
                    <Circle
                        {...commonProps}
                        radius={obj.radius || 30}
                        stroke={obj.stroke || '#fff'}
                        strokeWidth={obj.strokeWidth || 2}
                        fill={obj.fill}
                    />
                );
            case 'rectangle':
            case 'zone':
                return (
                    <Rect
                        {...commonProps}
                        width={obj.width || 60}
                        height={obj.height || 40}
                        stroke={obj.stroke || '#fff'}
                        strokeWidth={obj.strokeWidth || 2}
                        fill={obj.fill}
                        cornerRadius={obj.type === 'zone' ? 4 : 0}
                    />
                );
            case 'line':
            case 'dashed-line':
                return (
                    <Line
                        {...commonProps}
                        points={obj.points || [0, 0, 50, 50]}
                        stroke={obj.stroke || '#fff'}
                        strokeWidth={obj.strokeWidth || 3}
                        dash={obj.type === 'dashed-line' ? [10, 5] : undefined}
                    />
                );
            case 'arrow':
            case 'curved-arrow':
                return (
                    <Arrow
                        {...commonProps}
                        points={obj.points || [0, 0, 50, 50]}
                        stroke={obj.stroke || '#fff'}
                        strokeWidth={obj.strokeWidth || 3}
                        fill={obj.stroke || '#fff'}
                        pointerLength={10}
                        pointerWidth={10}
                    />
                );
            case 'text':
                return (
                    <KonvaText
                        {...commonProps}
                        text={obj.text || ''}
                        fontSize={obj.fontSize || 16}
                        fill={obj.fill || '#fff'}
                        fontFamily="Arial"
                        fontStyle="bold"
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="relative">
            {/* Toolbar - only show in edit mode */}
            {!isPreviewMode && (
                <div className="absolute left-2 top-2 z-10 flex flex-col gap-2 rounded-lg bg-zinc-900/90 p-2 backdrop-blur">
                    {/* Shapes */}
                    <div className="space-y-1">
                        <span className="text-xs font-medium text-zinc-400">Shapes</span>
                        <div className="grid grid-cols-3 gap-1">
                            <ToolButton tool="circle" active={activeTool === 'circle'} onClick={() => setActiveTool('circle')} icon="○" />
                            <ToolButton tool="rectangle" active={activeTool === 'rectangle'} onClick={() => setActiveTool('rectangle')} icon="□" />
                            <ToolButton tool="zone" active={activeTool === 'zone'} onClick={() => setActiveTool('zone')} icon="▢" />
                            <ToolButton tool="line" active={activeTool === 'line'} onClick={() => setActiveTool('line')} icon="╱" />
                            <ToolButton tool="arrow" active={activeTool === 'arrow'} onClick={() => setActiveTool('arrow')} icon="→" />
                            <ToolButton tool="dashed-line" active={activeTool === 'dashed-line'} onClick={() => setActiveTool('dashed-line')} icon="┈" />
                            <ToolButton tool="text" active={activeTool === 'text'} onClick={() => setActiveTool('text')} icon="T" />
                        </div>
                    </div>

                    {/* Equipment */}
                    <div className="space-y-1">
                        <span className="text-xs font-medium text-zinc-400">Equipment</span>
                        <div className="grid grid-cols-3 gap-1">
                            <ToolButton tool="ball" active={activeTool === 'ball'} onClick={() => setActiveTool('ball')} icon="⚽" />
                            <ToolButton tool="cone" active={activeTool === 'cone'} onClick={() => setActiveTool('cone')} icon="▲" />
                            <ToolButton tool="goal" active={activeTool === 'goal'} onClick={() => setActiveTool('goal')} icon="⊓" />
                            <ToolButton tool="ladder" active={activeTool === 'ladder'} onClick={() => setActiveTool('ladder')} icon="☰" />
                            <ToolButton tool="hurdle" active={activeTool === 'hurdle'} onClick={() => setActiveTool('hurdle')} icon="━" />
                            <ToolButton tool="pole" active={activeTool === 'pole'} onClick={() => setActiveTool('pole')} icon="│" />
                            <ToolButton tool="flag" active={activeTool === 'flag'} onClick={() => setActiveTool('flag')} icon="⚑" />
                            <ToolButton tool="mannequin" active={activeTool === 'mannequin'} onClick={() => setActiveTool('mannequin')} icon="♟" />
                        </div>
                    </div>

                    {/* Players */}
                    <div className="space-y-1">
                        <span className="text-xs font-medium text-zinc-400">Player</span>
                        <div className="grid grid-cols-3 gap-1">
                            {Object.entries(PLAYER_COLORS).map(([color, hex]) => (
                                <button
                                    key={color}
                                    onClick={() => {
                                        setActivePlayerColor(color as keyof typeof PLAYER_COLORS);
                                        setActiveTool('player');
                                    }}
                                    className={`h-8 w-8 rounded-lg transition-all ${
                                        activeTool === 'player' && activePlayerColor === color
                                            ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900'
                                            : 'hover:scale-110'
                                    }`}
                                    style={{ backgroundColor: hex }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Select tool */}
                    <button
                        onClick={() => setActiveTool('select')}
                        className={`mt-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                            activeTool === 'select'
                                ? 'bg-blue-600 text-white'
                                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                        }`}
                    >
                        ↖ Select
                    </button>

                    {/* Delete selected */}
                    {selectedId && (
                        <button
                            onClick={deleteSelected}
                            className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                        >
                            🗑 Delete
                        </button>
                    )}
                </div>
            )}

            {/* Canvas */}
            <div className="overflow-hidden rounded-xl border border-zinc-700">
                <Stage
                    ref={stageRef}
                    width={width}
                    height={height}
                    onClick={handleStageClick}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onTouchStart={handleMouseDown}
                    onTouchEnd={handleMouseUp}
                    style={{ cursor: activeTool === 'select' ? 'default' : 'crosshair' }}
                >
                    <Layer>
                        {/* Background */}
                        {backgroundImage && (
                            <KonvaImage
                                image={backgroundImage}
                                width={width}
                                height={height}
                                listening={false}
                            />
                        )}

                        {/* Objects */}
                        {step.objects.map(renderObject)}

                        {/* Transformer */}
                        {!isPreviewMode && (
                            <Transformer
                                ref={transformerRef}
                                boundBoxFunc={(oldBox, newBox) => {
                                    if (newBox.width < 10 || newBox.height < 10) {
                                        return oldBox;
                                    }
                                    return newBox;
                                }}
                            />
                        )}
                    </Layer>
                </Stage>
            </div>

            {/* Text input overlay */}
            <AnimatePresence>
                {showTextInput && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute z-20"
                        style={{ left: textInputPos.x, top: textInputPos.y }}
                    >
                        <input
                            type="text"
                            autoFocus
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleTextSubmit();
                                if (e.key === 'Escape') setShowTextInput(false);
                            }}
                            onBlur={handleTextSubmit}
                            className="rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-white outline-none focus:border-blue-500"
                            placeholder="Enter text..."
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ToolButton({ tool, active, onClick, icon }: { tool: string; active: boolean; onClick: () => void; icon: string }) {
    return (
        <button
            onClick={onClick}
            title={tool}
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-lg transition-all ${
                active
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
            }`}
        >
            {icon}
        </button>
    );
}
