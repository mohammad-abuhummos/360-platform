import { useRef, useState, useEffect, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Circle, Rect, Line, Arrow, Text as KonvaText, Group } from 'react-konva';
import type Konva from 'konva';
import { motion, AnimatePresence } from 'motion/react';
import {
    type DrawingObject,
    type TrainingStep,
    getBackgroundUrl,
    PLAYER_COLORS,
} from '~/lib/firestore-training';

interface PlanPreviewProps {
    steps: TrainingStep[];
    backgroundCategory: 'football' | 'football-bw';
    backgroundType: string;
    width?: number;
    height?: number;
    autoPlay?: boolean;
    stepDuration?: number; // ms between steps
    onExportGif?: () => void;
}

export function PlanPreview({
    steps,
    backgroundCategory,
    backgroundType,
    width = 600,
    height = 600,
    autoPlay = false,
    stepDuration = 1500,
    onExportGif,
}: PlanPreviewProps) {
    const stageRef = useRef<Konva.Stage>(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
    const animationRef = useRef<number | null>(null);

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

    // Auto-play animation
    useEffect(() => {
        if (!isPlaying || steps.length <= 1) return;

        const intervalId = setInterval(() => {
            setCurrentStepIndex(prev => (prev + 1) % steps.length);
        }, stepDuration);

        return () => clearInterval(intervalId);
    }, [isPlaying, steps.length, stepDuration]);

    const play = useCallback(() => {
        setIsPlaying(true);
    }, []);

    const pause = useCallback(() => {
        setIsPlaying(false);
    }, []);

    const goToStep = useCallback((index: number) => {
        setCurrentStepIndex(index);
    }, []);

    const goToPrevStep = useCallback(() => {
        setCurrentStepIndex(prev => (prev - 1 + steps.length) % steps.length);
    }, [steps.length]);

    const goToNextStep = useCallback(() => {
        setCurrentStepIndex(prev => (prev + 1) % steps.length);
    }, [steps.length]);

    const currentStep = steps[currentStepIndex];

    const renderObject = (obj: DrawingObject) => {
        const commonProps = {
            key: obj.id,
            x: obj.x,
            y: obj.y,
            rotation: obj.rotation || 0,
            listening: false,
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

    if (!currentStep) {
        return (
            <div className="flex h-96 items-center justify-center rounded-xl bg-zinc-800 text-zinc-400">
                No steps to preview
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Canvas */}
            <div className="relative overflow-hidden rounded-xl border border-zinc-700">
                <Stage
                    ref={stageRef}
                    width={width}
                    height={height}
                >
                    <Layer>
                        {/* Background */}
                        {backgroundImage && (
                            <KonvaImage
                                image={backgroundImage}
                                width={width}
                                height={height}
                            />
                        )}

                        {/* Objects with smooth transition */}
                        {currentStep.objects.map(renderObject)}
                    </Layer>
                </Stage>

                {/* Step indicator overlay */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur">
                    Step {currentStepIndex + 1} / {steps.length}
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
                <button
                    onClick={goToPrevStep}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-700 text-white transition-colors hover:bg-zinc-600"
                >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <button
                    onClick={isPlaying ? pause : play}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700"
                >
                    {isPlaying ? (
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                        </svg>
                    ) : (
                        <svg className="h-6 w-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    )}
                </button>

                <button
                    onClick={goToNextStep}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-700 text-white transition-colors hover:bg-zinc-600"
                >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                {onExportGif && (
                    <button
                        onClick={onExportGif}
                        className="ml-4 flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export GIF
                    </button>
                )}
            </div>

            {/* Step thumbnails */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {steps.map((step, index) => (
                    <button
                        key={step.id}
                        onClick={() => goToStep(index)}
                        className={`relative flex-shrink-0 rounded-lg border-2 p-1 transition-all ${
                            index === currentStepIndex
                                ? 'border-blue-500 bg-blue-500/10'
                                : 'border-zinc-700 hover:border-zinc-500'
                        }`}
                    >
                        <div className="h-16 w-16 overflow-hidden rounded bg-zinc-800">
                            {step.thumbnail ? (
                                <img
                                    src={step.thumbnail}
                                    alt={`Step ${index + 1}`}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500">
                                    {index + 1}
                                </div>
                            )}
                        </div>
                        <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-700 text-xs text-white">
                            {index + 1}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}

// GIF Export utility using canvas frames
export async function exportToGif(
    stageRef: React.RefObject<Konva.Stage>,
    steps: TrainingStep[],
    backgroundImage: HTMLImageElement | null,
    width: number,
    height: number,
    frameDelay: number = 1000
): Promise<Blob> {
    // We'll use a simple approach: capture each step as a frame
    // For a proper GIF, you'd use a library like gif.js
    
    if (!stageRef.current) {
        throw new Error('Stage not available');
    }

    const frames: string[] = [];
    
    // Capture each step
    for (const step of steps) {
        const dataUrl = stageRef.current.toDataURL({
            pixelRatio: 1,
            mimeType: 'image/png',
        });
        frames.push(dataUrl);
    }

    // For now, return the first frame as PNG
    // In production, use gif.js or similar library
    const response = await fetch(frames[0]);
    return response.blob();
}

// Helper to download blob as file
export function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
