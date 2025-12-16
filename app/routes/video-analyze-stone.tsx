import { useState, useRef, useEffect } from "react";
import { animate, motion } from "motion/react";
import { useWheel, useGesture } from "@use-gesture/react";
import { Stage, Layer, Circle, Rect, Line, Text, Arrow, RegularPolygon, Transformer } from "react-konva";
import Konva from "konva";

export const meta = () => {
    return [
        { title: "Football Video Editor" },
        { name: "description", content: "Create and analyze football video clips" },
    ];
};

interface Clip {
    id: string;
    name: string;
    startTime: number;
    endTime: number;
    duration: number;
    type: string;
}

interface Annotation {
    id: string;
    type: 'text' | 'circle' | 'spotlight' | 'line' | 'arrow' | 'polygon';
    clipId: string;
    startTime: number;
    endTime: number;
    x: number;
    y: number;
    width?: number;
    height?: number;
    radius?: number;
    points?: number[];
    text?: string;
    fontSize?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    opacity?: number;
    rotation?: number;
    scaleX?: number;
    scaleY?: number;
    isDragging?: boolean;
    tracking?: {
        enabled: boolean;
        playerId?: string;
        offsetX: number;
        offsetY: number;
    };
}

type Tool = 'select' | 'text' | 'circle' | 'spotlight' | 'line' | 'arrow' | 'connection' | 'polygon';

export default function VideoAnalyzeStone() {
    const [videoFile, setVideoFile] = useState<string | null>(null);
    const [clips, setClips] = useState<Clip[]>([]);
    const [selectedClip, setSelectedClip] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeTool, setActiveTool] = useState<Tool>('select');
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [resizingClip, setResizingClip] = useState<{ id: string; edge: 'start' | 'end' } | null>(null);
    const [isDraggingTimeline, setIsDraggingTimeline] = useState(false);
    const [draggingClip, setDraggingClip] = useState<{ id: string; startX: number; originalStartTime: number } | null>(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [timelineScroll, setTimelineScroll] = useState(0);
    const [isTimelineHovered, setIsTimelineHovered] = useState(false);
    const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
    const [canvasDimensions, setCanvasDimensions] = useState({ width: 1920, height: 1080 });
    const [textInput, setTextInput] = useState("");
    const [showTextInput, setShowTextInput] = useState(false);
    const [textInputPos, setTextInputPos] = useState({ x: 0, y: 0 });

    const videoRef = useRef<HTMLVideoElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const timelineRef = useRef<HTMLDivElement>(null);
    const scrollAnimationRef = useRef<any>(null);
    const stageRef = useRef<Konva.Stage>(null);
    const transformerRef = useRef<Konva.Transformer>(null);
    const videoContainerRef = useRef<HTMLDivElement>(null);

    // Handle video upload
    const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setVideoFile(url);
            setClips([]);
            setAnnotations([]);
            setSelectedClip(null);
        }
    };

    // Play/Pause toggle
    const togglePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    // Update current time
    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    // Handle video loaded
    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
            setCanvasDimensions({
                width: videoRef.current.videoWidth,
                height: videoRef.current.videoHeight
            });
        }
    };

    // Update canvas dimensions on window resize
    useEffect(() => {
        const updateCanvasDimensions = () => {
            if (videoContainerRef.current && videoRef.current) {
                const container = videoContainerRef.current.getBoundingClientRect();
                const video = videoRef.current;
                const videoAspect = video.videoWidth / video.videoHeight;
                const containerAspect = container.width / container.height;

                let width, height;
                if (containerAspect > videoAspect) {
                    height = container.height;
                    width = height * videoAspect;
                } else {
                    width = container.width;
                    height = width / videoAspect;
                }

                setCanvasDimensions({ width, height });
            }
        };

        window.addEventListener('resize', updateCanvasDimensions);
        return () => window.removeEventListener('resize', updateCanvasDimensions);
    }, [videoFile]);

    // Seek to time
    const seekTo = (time: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    // Skip forward/backward
    const skip = (seconds: number) => {
        if (videoRef.current) {
            const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
            seekTo(newTime);
        }
    };

    // Create new clip
    const createClip = (type: string = "Shot on goal") => {
        const newClip: Clip = {
            id: Date.now().toString(),
            name: type,
            startTime: currentTime,
            endTime: currentTime + 25, // 25 seconds duration
            duration: 25,
            type: type
        };
        setClips([...clips, newClip]);
        setSelectedClip(newClip.id);
    };

    // Delete clip
    const deleteClip = (clipId: string) => {
        setClips(clips.filter(c => c.id !== clipId));
        if (selectedClip === clipId) {
            setSelectedClip(null);
        }
    };

    // Jump to clip
    const jumpToClip = (clip: Clip) => {
        seekTo(clip.startTime);
        setSelectedClip(clip.id);
    };

    // Format time display
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 100);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    };

    // Change playback speed
    const changePlaybackSpeed = () => {
        const speeds = [0.5, 1, 1.5, 2];
        const currentIndex = speeds.indexOf(playbackSpeed);
        const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
        setPlaybackSpeed(nextSpeed);
        if (videoRef.current) {
            videoRef.current.playbackRate = nextSpeed;
        }
    };

    // Handle annotation selection
    const handleAnnotationSelect = (id: string) => {
        setSelectedAnnotationId(id);
        const node = stageRef.current?.findOne(`#${id}`);
        if (node && transformerRef.current) {
            transformerRef.current.nodes([node]);
            transformerRef.current.getLayer()?.batchDraw();
        }
    };

    // Handle stage click/tap
    const handleStageClick = (e: any) => {
        if (activeTool === 'select') {
            const clickedOnEmpty = e.target === e.target.getStage();
            if (clickedOnEmpty) {
                setSelectedAnnotationId(null);
                transformerRef.current?.nodes([]);
            }
            return;
        }

        // For text tool, show input dialog
        if (activeTool === 'text') {
            const stage = e.target.getStage();
            const pos = stage.getPointerPosition();
            setTextInputPos(pos);
            setShowTextInput(true);
            return;
        }

        // For other tools, start drawing
        if (!isDrawing) {
            const stage = e.target.getStage();
            const pos = stage.getPointerPosition();
            setDrawStart(pos);
            setIsDrawing(true);
        }
    };

    // Handle stage mouse up
    const handleStageMouseUp = (e: any) => {
        if (!isDrawing || !drawStart || activeTool === 'select' || activeTool === 'text') return;

        const stage = e.target.getStage();
        const pos = stage.getPointerPosition();

        // Create annotation based on tool type
        const newAnnotation: Annotation = {
            id: `ann_${Date.now()}`,
            type: activeTool as any,
            clipId: selectedClip || '',
            startTime: currentTime,
            endTime: currentTime + 5,
            x: drawStart.x,
            y: drawStart.y,
            fill: activeTool === 'spotlight' ? 'rgba(255, 255, 0, 0.3)' : 'transparent',
            stroke: '#3b82f6',
            strokeWidth: 3,
            opacity: 1,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
        };

        // Set dimensions based on tool type
        switch (activeTool) {
            case 'circle':
                const radius = Math.sqrt(Math.pow(pos.x - drawStart.x, 2) + Math.pow(pos.y - drawStart.y, 2));
                newAnnotation.radius = Math.max(radius, 20);
                newAnnotation.fill = 'transparent';
                break;
            case 'spotlight':
                const spotRadius = Math.sqrt(Math.pow(pos.x - drawStart.x, 2) + Math.pow(pos.y - drawStart.y, 2));
                newAnnotation.radius = Math.max(spotRadius, 50);
                break;
            case 'line':
                newAnnotation.points = [0, 0, pos.x - drawStart.x, pos.y - drawStart.y];
                break;
            case 'arrow':
                newAnnotation.points = [0, 0, pos.x - drawStart.x, pos.y - drawStart.y];
                break;
            case 'polygon':
                const polyRadius = Math.sqrt(Math.pow(pos.x - drawStart.x, 2) + Math.pow(pos.y - drawStart.y, 2));
                newAnnotation.radius = Math.max(polyRadius, 30);
                newAnnotation.fill = 'transparent';
                break;
        }

        setAnnotations([...annotations, newAnnotation]);
        setIsDrawing(false);
        setDrawStart(null);
        setActiveTool('select');
    };

    // Handle text submit
    const handleTextSubmit = () => {
        if (textInput.trim()) {
            const newAnnotation: Annotation = {
                id: `ann_${Date.now()}`,
                type: 'text',
                clipId: selectedClip || '',
                startTime: currentTime,
                endTime: currentTime + 5,
                x: textInputPos.x,
                y: textInputPos.y,
                text: textInput,
                fontSize: 24,
                fill: '#ffffff',
                stroke: '#000000',
                strokeWidth: 1,
                opacity: 1,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
            };
            setAnnotations([...annotations, newAnnotation]);
        }
        setTextInput("");
        setShowTextInput(false);
        setActiveTool('select');
    };

    // Update annotation
    const updateAnnotation = (id: string, updates: Partial<Annotation>) => {
        setAnnotations(annotations.map(ann =>
            ann.id === id ? { ...ann, ...updates } : ann
        ));
    };

    // Delete annotation
    const deleteAnnotation = (id: string) => {
        setAnnotations(annotations.filter(ann => ann.id !== id));
        if (selectedAnnotationId === id) {
            setSelectedAnnotationId(null);
        }
    };

    // Get visible annotations at current time
    const getVisibleAnnotations = () => {
        return annotations.filter(ann => {
            return currentTime >= ann.startTime && currentTime <= ann.endTime;
        }).map(ann => {
            // Calculate fade in/out opacity
            const fadeDuration = 0.5; // 0.5 seconds fade
            let opacity = ann.opacity || 1;

            // Fade in
            if (currentTime < ann.startTime + fadeDuration) {
                opacity *= (currentTime - ann.startTime) / fadeDuration;
            }

            // Fade out
            if (currentTime > ann.endTime - fadeDuration) {
                opacity *= (ann.endTime - currentTime) / fadeDuration;
            }

            return { ...ann, opacity: Math.max(0, Math.min(1, opacity)) };
        });
    };

    // Handle clip resize start
    const handleResizeStart = (clipId: string, edge: 'start' | 'end', e: React.MouseEvent) => {
        e.stopPropagation();
        setResizingClip({ id: clipId, edge });
    };

    // Handle clip drag start (to move it)
    const handleClipDragStart = (clipId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const clip = clips.find(c => c.id === clipId);
        if (clip) {
            setDraggingClip({
                id: clipId,
                startX: e.clientX,
                originalStartTime: clip.startTime
            });
        }
    };

    // Handle mouse move for resizing or dragging
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!timelineRef.current) return;

        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const visibleDuration = duration / zoomLevel;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        const newTime = (percentage * visibleDuration) + timelineScroll;

        // Handle resizing
        if (resizingClip) {
            setClips(clips.map(clip => {
                if (clip.id === resizingClip.id) {
                    if (resizingClip.edge === 'start') {
                        const newStartTime = Math.max(0, Math.min(newTime, clip.endTime - 1));
                        return {
                            ...clip,
                            startTime: newStartTime,
                            duration: clip.endTime - newStartTime
                        };
                    } else {
                        const newEndTime = Math.max(clip.startTime + 1, Math.min(newTime, duration));
                        return {
                            ...clip,
                            endTime: newEndTime,
                            duration: newEndTime - clip.startTime
                        };
                    }
                }
                return clip;
            }));
        }

        // Handle dragging clip to move it
        if (draggingClip) {
            const clip = clips.find(c => c.id === draggingClip.id);
            if (clip) {
                const deltaX = e.clientX - draggingClip.startX;
                const deltaTime = (deltaX / rect.width) * visibleDuration;
                const newStartTime = Math.max(0, Math.min(duration - clip.duration, draggingClip.originalStartTime + deltaTime));
                const newEndTime = newStartTime + clip.duration;

                setClips(clips.map(c =>
                    c.id === draggingClip.id
                        ? { ...c, startTime: newStartTime, endTime: newEndTime }
                        : c
                ));
            }
        }
    };

    // Handle mouse up to stop resizing or dragging
    const handleMouseUp = () => {
        setResizingClip(null);
        setDraggingClip(null);
        setIsDraggingTimeline(false);
    };

    // Smooth zoom with animation
    const handleZoom = (direction: 'in' | 'out', centerTime?: number) => {
        setZoomLevel(prev => {
            const newZoom = direction === 'in' ? Math.min(prev * 1.5, 10) : Math.max(prev / 1.5, 1);

            // Animate zoom smoothly
            if (newZoom === 1) {
                // Reset scroll smoothly
                animateScroll(0);
            } else if (centerTime !== undefined && prev !== newZoom) {
                // Keep the center time in view when zooming
                const visibleDuration = duration / newZoom;
                const newScroll = Math.max(0, Math.min(duration - visibleDuration, centerTime - visibleDuration / 2));
                animateScroll(newScroll);
            }

            return newZoom;
        });
    };

    // Smooth scroll animation
    const animateScroll = (targetScroll: number) => {
        if (scrollAnimationRef.current) {
            scrollAnimationRef.current.stop();
        }

        scrollAnimationRef.current = animate(timelineScroll, targetScroll, {
            duration: 0.3,
            ease: [0.4, 0.0, 0.2, 1],
            onUpdate: (latest) => setTimelineScroll(latest),
        });
    };

    // Handle timeline scroll when zoomed (smooth)
    const handleTimelineScroll = (direction: 'left' | 'right') => {
        const visibleDuration = duration / zoomLevel;
        const scrollAmount = visibleDuration * 0.15; // Scroll 15% at a time
        const newScroll = direction === 'right'
            ? Math.min(duration - visibleDuration, timelineScroll + scrollAmount)
            : Math.max(0, timelineScroll - scrollAmount);

        animateScroll(newScroll);
    };

    // Enhanced wheel handling with smooth scrolling
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();

        if (e.ctrlKey || e.metaKey) {
            // Zoom with Ctrl/Cmd + wheel
            const rect = timelineRef.current?.getBoundingClientRect();
            if (rect) {
                const x = e.clientX - rect.left;
                const percentage = x / rect.width;
                const visibleDuration = duration / zoomLevel;
                const centerTime = timelineScroll + (visibleDuration * percentage);

                if (e.deltaY < 0) {
                    handleZoom('in', centerTime);
                } else {
                    handleZoom('out', centerTime);
                }
            }
        } else if (zoomLevel > 1) {
            // Smooth horizontal scroll when zoomed
            const visibleDuration = duration / zoomLevel;
            const scrollAmount = (e.deltaY / 1000) * visibleDuration; // Proportional scrolling
            const newScroll = Math.max(0, Math.min(duration - visibleDuration, timelineScroll + scrollAmount));

            // Smooth scroll
            if (scrollAnimationRef.current) {
                scrollAnimationRef.current.stop();
            }
            setTimelineScroll(newScroll);
        }
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (!videoFile) return;

            // Don't handle shortcuts when typing in input
            if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
                return;
            }

            // Space - play/pause
            if (e.code === 'Space') {
                e.preventDefault();
                togglePlayPause();
            }
            // Arrow Left - skip back
            else if (e.code === 'ArrowLeft') {
                e.preventDefault();
                skip(e.shiftKey ? -1 : -5);
            }
            // Arrow Right - skip forward
            else if (e.code === 'ArrowRight') {
                e.preventDefault();
                skip(e.shiftKey ? 1 : 5);
            }
            // Plus/Minus - zoom
            else if ((e.code === 'Equal' || e.code === 'NumpadAdd') && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleZoom('in', currentTime);
            }
            else if ((e.code === 'Minus' || e.code === 'NumpadSubtract') && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleZoom('out', currentTime);
            }
            // M - add clip marker
            else if (e.code === 'KeyM') {
                e.preventDefault();
                createClip();
            }
            // Delete - delete selected annotation
            else if (e.code === 'Delete' || e.code === 'Backspace') {
                if (selectedAnnotationId) {
                    e.preventDefault();
                    deleteAnnotation(selectedAnnotationId);
                    setSelectedAnnotationId(null);
                }
            }
            // Escape - cancel drawing/selection
            else if (e.code === 'Escape') {
                e.preventDefault();
                setActiveTool('select');
                setSelectedAnnotationId(null);
                setShowTextInput(false);
                setTextInput("");
                transformerRef.current?.nodes([]);
            }
            // Number keys 1-8 for quick tool selection
            else if (e.code === 'Digit1') {
                setActiveTool('select');
            }
            else if (e.code === 'Digit2') {
                setActiveTool('text');
            }
            else if (e.code === 'Digit3') {
                setActiveTool('circle');
            }
            else if (e.code === 'Digit4') {
                setActiveTool('spotlight');
            }
            else if (e.code === 'Digit5') {
                setActiveTool('line');
            }
            else if (e.code === 'Digit6') {
                setActiveTool('arrow');
            }
            else if (e.code === 'Digit7') {
                setActiveTool('connection');
            }
            else if (e.code === 'Digit8') {
                setActiveTool('polygon');
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [videoFile, currentTime, zoomLevel, timelineScroll, duration, selectedAnnotationId, annotations]);

    // Update clip times
    const updateClip = (clipId: string, updates: Partial<Clip>) => {
        setClips(clips.map(clip =>
            clip.id === clipId ? { ...clip, ...updates } : clip
        ));
    };

    return (
        <div className="flex h-screen bg-gray-900 text-white">
            {/* Left Sidebar - Tools */}
            <motion.div
                className="w-20 bg-gray-800 flex flex-col items-center py-4 space-y-6"
                initial={{ x: -80, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                <motion.div
                    className="w-12 h-12 bg-white rounded-full flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="text-gray-900 font-bold text-xl">⚽</span>
                </motion.div>

                <motion.button
                    onClick={() => setActiveTool('select')}
                    className={`tool-btn ${activeTool === 'select' ? 'bg-gray-700' : ''}`}
                    title="Select"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <span className="text-2xl">↖️</span>
                </motion.button>

                <motion.button
                    onClick={() => setActiveTool('text')}
                    className={`tool-btn ${activeTool === 'text' ? 'bg-gray-700' : ''}`}
                    title="Text"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <span className="text-2xl">T</span>
                </motion.button>

                <motion.button
                    onClick={() => setActiveTool('circle')}
                    className={`tool-btn ${activeTool === 'circle' ? 'bg-gray-700' : ''}`}
                    title="Circle"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <span className="text-2xl">⭕</span>
                </motion.button>

                <motion.button
                    onClick={() => setActiveTool('spotlight')}
                    className={`tool-btn ${activeTool === 'spotlight' ? 'bg-gray-700' : ''}`}
                    title="Spotlight"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <span className="text-2xl">🔦</span>
                </motion.button>

                <motion.button
                    onClick={() => setActiveTool('line')}
                    className={`tool-btn ${activeTool === 'line' ? 'bg-gray-700' : ''}`}
                    title="Line"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <span className="text-2xl">📏</span>
                </motion.button>

                <motion.button
                    onClick={() => setActiveTool('arrow')}
                    className={`tool-btn ${activeTool === 'arrow' ? 'bg-gray-700' : ''}`}
                    title="Arrow"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <span className="text-2xl">➡️</span>
                </motion.button>

                <motion.button
                    onClick={() => setActiveTool('connection')}
                    className={`tool-btn ${activeTool === 'connection' ? 'bg-gray-700' : ''}`}
                    title="Connection"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <span className="text-2xl">🔗</span>
                </motion.button>

                <motion.button
                    onClick={() => setActiveTool('polygon')}
                    className={`tool-btn ${activeTool === 'polygon' ? 'bg-gray-700' : ''}`}
                    title="Polygon"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <span className="text-2xl">⬡</span>
                </motion.button>
            </motion.div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <motion.div
                    className="h-16 bg-gray-800 flex items-center justify-between px-6"
                    initial={{ y: -64, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <h1 className="text-xl font-bold">فريسان_وحدات_2</h1>
                    <motion.button
                        className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Exit analytics
                    </motion.button>
                </motion.div>

                {/* Video Display Area */}
                <div className="flex-1 flex items-center justify-center bg-black relative">
                    {!videoFile ? (
                        <motion.div
                            className="text-center"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.4 }}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="video/*"
                                onChange={handleVideoUpload}
                                className="hidden"
                            />
                            <motion.button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-lg font-semibold shadow-lg"
                                whileHover={{ scale: 1.1, boxShadow: '0 20px 50px rgba(59, 130, 246, 0.5)' }}
                                whileTap={{ scale: 0.95 }}
                            >
                                📹 Upload Video
                            </motion.button>
                            <motion.p
                                className="mt-4 text-gray-400"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                Upload your football match video to start editing
                            </motion.p>
                        </motion.div>
                    ) : (
                        <div ref={videoContainerRef} className="relative w-full h-full flex items-center justify-center">
                            <video
                                ref={videoRef}
                                src={videoFile}
                                className="max-w-full max-h-full"
                                onTimeUpdate={handleTimeUpdate}
                                onLoadedMetadata={handleLoadedMetadata}
                                onEnded={() => setIsPlaying(false)}
                            />
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                                style={{ width: canvasDimensions.width, height: canvasDimensions.height }}>
                                <Stage
                                    ref={stageRef}
                                    width={canvasDimensions.width}
                                    height={canvasDimensions.height}
                                    onMouseDown={handleStageClick}
                                    onTouchStart={handleStageClick}
                                    onMouseUp={handleStageMouseUp}
                                    onTouchEnd={handleStageMouseUp}
                                    className="pointer-events-auto"
                                    style={{ cursor: activeTool === 'select' ? 'default' : 'crosshair' }}
                                >
                                    <Layer>
                                        {getVisibleAnnotations().map((ann) => {
                                            switch (ann.type) {
                                                case 'circle':
                                                    return (
                                                        <Circle
                                                            key={ann.id}
                                                            id={ann.id}
                                                            x={ann.x}
                                                            y={ann.y}
                                                            radius={ann.radius}
                                                            fill={ann.fill}
                                                            stroke={ann.stroke}
                                                            strokeWidth={ann.strokeWidth}
                                                            opacity={ann.opacity}
                                                            rotation={ann.rotation}
                                                            scaleX={ann.scaleX}
                                                            scaleY={ann.scaleY}
                                                            draggable={activeTool === 'select'}
                                                            onClick={() => handleAnnotationSelect(ann.id)}
                                                            onTap={() => handleAnnotationSelect(ann.id)}
                                                            onDragEnd={(e) => {
                                                                updateAnnotation(ann.id, {
                                                                    x: e.target.x(),
                                                                    y: e.target.y()
                                                                });
                                                            }}
                                                            onTransformEnd={(e) => {
                                                                const node = e.target;
                                                                updateAnnotation(ann.id, {
                                                                    x: node.x(),
                                                                    y: node.y(),
                                                                    rotation: node.rotation(),
                                                                    scaleX: node.scaleX(),
                                                                    scaleY: node.scaleY()
                                                                });
                                                            }}
                                                        />
                                                    );
                                                case 'spotlight':
                                                    return (
                                                        <Circle
                                                            key={ann.id}
                                                            id={ann.id}
                                                            x={ann.x}
                                                            y={ann.y}
                                                            radius={ann.radius}
                                                            fill={ann.fill}
                                                            stroke={ann.stroke}
                                                            strokeWidth={ann.strokeWidth}
                                                            opacity={ann.opacity}
                                                            rotation={ann.rotation}
                                                            scaleX={ann.scaleX}
                                                            scaleY={ann.scaleY}
                                                            draggable={activeTool === 'select'}
                                                            onClick={() => handleAnnotationSelect(ann.id)}
                                                            onTap={() => handleAnnotationSelect(ann.id)}
                                                            shadowColor="yellow"
                                                            shadowBlur={30}
                                                            shadowOpacity={0.8}
                                                            onDragEnd={(e) => {
                                                                updateAnnotation(ann.id, {
                                                                    x: e.target.x(),
                                                                    y: e.target.y()
                                                                });
                                                            }}
                                                            onTransformEnd={(e) => {
                                                                const node = e.target;
                                                                updateAnnotation(ann.id, {
                                                                    x: node.x(),
                                                                    y: node.y(),
                                                                    rotation: node.rotation(),
                                                                    scaleX: node.scaleX(),
                                                                    scaleY: node.scaleY()
                                                                });
                                                            }}
                                                        />
                                                    );
                                                case 'line':
                                                    return (
                                                        <Line
                                                            key={ann.id}
                                                            id={ann.id}
                                                            x={ann.x}
                                                            y={ann.y}
                                                            points={ann.points}
                                                            stroke={ann.stroke}
                                                            strokeWidth={ann.strokeWidth}
                                                            opacity={ann.opacity}
                                                            rotation={ann.rotation}
                                                            scaleX={ann.scaleX}
                                                            scaleY={ann.scaleY}
                                                            draggable={activeTool === 'select'}
                                                            onClick={() => handleAnnotationSelect(ann.id)}
                                                            onTap={() => handleAnnotationSelect(ann.id)}
                                                            lineCap="round"
                                                            lineJoin="round"
                                                            onDragEnd={(e) => {
                                                                updateAnnotation(ann.id, {
                                                                    x: e.target.x(),
                                                                    y: e.target.y()
                                                                });
                                                            }}
                                                            onTransformEnd={(e) => {
                                                                const node = e.target;
                                                                updateAnnotation(ann.id, {
                                                                    x: node.x(),
                                                                    y: node.y(),
                                                                    rotation: node.rotation(),
                                                                    scaleX: node.scaleX(),
                                                                    scaleY: node.scaleY()
                                                                });
                                                            }}
                                                        />
                                                    );
                                                case 'arrow':
                                                    return (
                                                        <Arrow
                                                            key={ann.id}
                                                            id={ann.id}
                                                            x={ann.x}
                                                            y={ann.y}
                                                            points={ann.points || [0, 0, 100, 100]}
                                                            stroke={ann.stroke}
                                                            strokeWidth={ann.strokeWidth}
                                                            fill={ann.stroke}
                                                            opacity={ann.opacity}
                                                            rotation={ann.rotation}
                                                            scaleX={ann.scaleX}
                                                            scaleY={ann.scaleY}
                                                            draggable={activeTool === 'select'}
                                                            onClick={() => handleAnnotationSelect(ann.id)}
                                                            onTap={() => handleAnnotationSelect(ann.id)}
                                                            pointerLength={10}
                                                            pointerWidth={10}
                                                            onDragEnd={(e) => {
                                                                updateAnnotation(ann.id, {
                                                                    x: e.target.x(),
                                                                    y: e.target.y()
                                                                });
                                                            }}
                                                            onTransformEnd={(e) => {
                                                                const node = e.target;
                                                                updateAnnotation(ann.id, {
                                                                    x: node.x(),
                                                                    y: node.y(),
                                                                    rotation: node.rotation(),
                                                                    scaleX: node.scaleX(),
                                                                    scaleY: node.scaleY()
                                                                });
                                                            }}
                                                        />
                                                    );
                                                case 'polygon':
                                                    return (
                                                        <RegularPolygon
                                                            key={ann.id}
                                                            id={ann.id}
                                                            x={ann.x}
                                                            y={ann.y}
                                                            sides={6}
                                                            radius={ann.radius || 50}
                                                            fill={ann.fill}
                                                            stroke={ann.stroke}
                                                            strokeWidth={ann.strokeWidth}
                                                            opacity={ann.opacity}
                                                            rotation={ann.rotation}
                                                            scaleX={ann.scaleX}
                                                            scaleY={ann.scaleY}
                                                            draggable={activeTool === 'select'}
                                                            onClick={() => handleAnnotationSelect(ann.id)}
                                                            onTap={() => handleAnnotationSelect(ann.id)}
                                                            onDragEnd={(e) => {
                                                                updateAnnotation(ann.id, {
                                                                    x: e.target.x(),
                                                                    y: e.target.y()
                                                                });
                                                            }}
                                                            onTransformEnd={(e) => {
                                                                const node = e.target;
                                                                updateAnnotation(ann.id, {
                                                                    x: node.x(),
                                                                    y: node.y(),
                                                                    rotation: node.rotation(),
                                                                    scaleX: node.scaleX(),
                                                                    scaleY: node.scaleY()
                                                                });
                                                            }}
                                                        />
                                                    );
                                                case 'text':
                                                    return (
                                                        <Text
                                                            key={ann.id}
                                                            id={ann.id}
                                                            x={ann.x}
                                                            y={ann.y}
                                                            text={ann.text}
                                                            fontSize={ann.fontSize}
                                                            fill={ann.fill}
                                                            stroke={ann.stroke}
                                                            strokeWidth={ann.strokeWidth}
                                                            opacity={ann.opacity}
                                                            rotation={ann.rotation}
                                                            scaleX={ann.scaleX}
                                                            scaleY={ann.scaleY}
                                                            draggable={activeTool === 'select'}
                                                            onClick={() => handleAnnotationSelect(ann.id)}
                                                            onTap={() => handleAnnotationSelect(ann.id)}
                                                            fontFamily="Arial"
                                                            fontStyle="bold"
                                                            onDragEnd={(e) => {
                                                                updateAnnotation(ann.id, {
                                                                    x: e.target.x(),
                                                                    y: e.target.y()
                                                                });
                                                            }}
                                                            onTransformEnd={(e) => {
                                                                const node = e.target;
                                                                updateAnnotation(ann.id, {
                                                                    x: node.x(),
                                                                    y: node.y(),
                                                                    rotation: node.rotation(),
                                                                    scaleX: node.scaleX(),
                                                                    scaleY: node.scaleY()
                                                                });
                                                            }}
                                                        />
                                                    );
                                                default:
                                                    return null;
                                            }
                                        })}
                                        <Transformer
                                            ref={transformerRef}
                                            boundBoxFunc={(oldBox, newBox) => {
                                                // Limit resize
                                                if (newBox.width < 5 || newBox.height < 5) {
                                                    return oldBox;
                                                }
                                                return newBox;
                                            }}
                                        />
                                    </Layer>
                                </Stage>
                            </div>

                            {/* Text Input Dialog */}
                            {showTextInput && (
                                <motion.div
                                    className="absolute bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-600"
                                    style={{
                                        left: textInputPos.x,
                                        top: textInputPos.y,
                                        zIndex: 1000
                                    }}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                >
                                    <input
                                        type="text"
                                        value={textInput}
                                        onChange={(e) => setTextInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleTextSubmit();
                                            if (e.key === 'Escape') {
                                                setShowTextInput(false);
                                                setTextInput("");
                                                setActiveTool('select');
                                            }
                                        }}
                                        placeholder="Enter text..."
                                        className="px-3 py-2 bg-gray-700 rounded text-white w-64 mb-2"
                                        autoFocus
                                    />
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={handleTextSubmit}
                                            className="px-4 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                                        >
                                            Add
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowTextInput(false);
                                                setTextInput("");
                                                setActiveTool('select');
                                            }}
                                            className="px-4 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    )}
                </div>

                {/* Video Controls */}
                {videoFile && (
                    <div className="bg-gray-800 p-4">
                        {/* Playback Controls */}
                        <div className="flex items-center justify-center space-x-4 mb-4">
                            <motion.button
                                onClick={() => skip(-10)}
                                className="control-btn"
                                title="Skip -10s (← Arrow)"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <span className="text-xl">↶10</span>
                            </motion.button>

                            <motion.button
                                onClick={togglePlayPause}
                                className="control-btn-large"
                                title="Play/Pause (Space)"
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.95 }}
                                animate={{ rotate: isPlaying ? 0 : [0, -10, 10, 0] }}
                                transition={{ duration: 0.3 }}
                            >
                                {isPlaying ? '⏸️' : '▶️'}
                            </motion.button>

                            <motion.button
                                onClick={() => skip(10)}
                                className="control-btn"
                                title="Skip +10s (→ Arrow)"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <span className="text-xl">↷10</span>
                            </motion.button>

                            <motion.button
                                onClick={() => setIsRecording(!isRecording)}
                                className={`control-btn ${isRecording ? 'bg-red-600' : ''}`}
                                title="Record Clip"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
                                transition={isRecording ? { duration: 1, repeat: Infinity } : {}}
                            >
                                ⏺️
                            </motion.button>

                            <motion.button
                                onClick={changePlaybackSpeed}
                                className="control-btn"
                                title="Playback Speed"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                {playbackSpeed}x
                            </motion.button>
                        </div>

                        {/* Timeline */}
                        <div
                            className="relative select-none"
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        >
                            <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                                <div className="flex items-center space-x-4">
                                    <span>{formatTime(currentTime)}</span>
                                    <div className="flex items-center space-x-2 bg-gray-700 rounded px-3 py-1">
                                        <button
                                            onClick={() => handleZoom('out')}
                                            className="hover:text-white transition-colors"
                                            title="Zoom Out (Ctrl + Scroll)"
                                            disabled={zoomLevel <= 1}
                                        >
                                            🔍−
                                        </button>
                                        <span className="text-xs">{zoomLevel.toFixed(1)}x</span>
                                        <button
                                            onClick={() => handleZoom('in')}
                                            className="hover:text-white transition-colors"
                                            title="Zoom In (Ctrl + Scroll)"
                                            disabled={zoomLevel >= 10}
                                        >
                                            🔍+
                                        </button>
                                    </div>
                                    {zoomLevel > 1 && (
                                        <div className="flex items-center space-x-1">
                                            <button
                                                onClick={() => handleTimelineScroll('left')}
                                                className="hover:text-white transition-colors px-2"
                                                title="Scroll Left"
                                            >
                                                ◀
                                            </button>
                                            <button
                                                onClick={() => handleTimelineScroll('right')}
                                                className="hover:text-white transition-colors px-2"
                                                title="Scroll Right"
                                            >
                                                ▶
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <span>{formatTime(duration)}</span>
                            </div>

                            <motion.div
                                ref={timelineRef}
                                className="relative h-16 bg-gray-700 rounded overflow-hidden cursor-grab active:cursor-grabbing"
                                onWheel={handleWheel}
                                onMouseEnter={() => setIsTimelineHovered(true)}
                                onMouseLeave={() => setIsTimelineHovered(false)}
                                animate={{
                                    scale: isTimelineHovered ? 1.01 : 1,
                                }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* Timeline bar */}
                                <input
                                    type="range"
                                    min={timelineScroll}
                                    max={timelineScroll + (duration / zoomLevel)}
                                    step="0.1"
                                    value={currentTime}
                                    onChange={(e) => seekTo(parseFloat(e.target.value))}
                                    className="absolute top-0 w-full h-2 appearance-none bg-transparent cursor-pointer z-10"
                                    style={{
                                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((currentTime - timelineScroll) / (duration / zoomLevel)) * 100}%, #4b5563 ${((currentTime - timelineScroll) / (duration / zoomLevel)) * 100}%, #4b5563 100%)`
                                    }}
                                />

                                {/* Clip markers on timeline */}
                                {clips.map((clip) => {
                                    const visibleDuration = duration / zoomLevel;
                                    const visibleStart = timelineScroll;
                                    const visibleEnd = timelineScroll + visibleDuration;

                                    // Only show clips that are in the visible range
                                    if (clip.endTime < visibleStart || clip.startTime > visibleEnd) {
                                        return null;
                                    }

                                    const leftPercent = ((clip.startTime - timelineScroll) / visibleDuration) * 100;
                                    const widthPercent = (clip.duration / visibleDuration) * 100;

                                    return (
                                        <motion.div
                                            key={clip.id}
                                            className={`absolute h-12 bg-blue-600 border-2 border-blue-400 rounded cursor-move ${selectedClip === clip.id ? 'bg-opacity-70 border-blue-300 shadow-lg' : 'bg-opacity-50 hover:bg-opacity-70'
                                                }`}
                                            style={{
                                                left: `${Math.max(0, leftPercent)}%`,
                                                width: `${widthPercent}%`,
                                                top: '20px',
                                                zIndex: selectedClip === clip.id ? 30 : 20
                                            }}
                                            initial={{ scale: 0.95, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ duration: 0.2 }}
                                            whileHover={{ y: -2, boxShadow: '0 4px 20px rgba(59, 130, 246, 0.5)' }}
                                            onMouseDown={(e) => {
                                                const target = e.target as HTMLElement;
                                                if (!target.classList.contains('cursor-ew-resize')) {
                                                    handleClipDragStart(clip.id, e);
                                                }
                                            }}
                                            title={`${clip.name} - ${formatTime(clip.startTime)} (drag to move)`}
                                        >
                                            {/* Left resize handle */}
                                            <motion.div
                                                className="absolute left-0 top-0 w-2 h-full bg-blue-300 cursor-ew-resize hover:bg-blue-200 z-30"
                                                onMouseDown={(e) => handleResizeStart(clip.id, 'start', e)}
                                                title="Drag to adjust start time"
                                                whileHover={{ width: '8px', backgroundColor: '#93c5fd' }}
                                            />

                                            <div className="text-xs text-center truncate px-3 py-1 flex items-center justify-center h-full pointer-events-none">
                                                {clip.name}
                                            </div>

                                            {/* Right resize handle */}
                                            <motion.div
                                                className="absolute right-0 top-0 w-2 h-full bg-blue-300 cursor-ew-resize hover:bg-blue-200 z-30"
                                                onMouseDown={(e) => handleResizeStart(clip.id, 'end', e)}
                                                title="Drag to adjust end time"
                                                whileHover={{ width: '8px', backgroundColor: '#93c5fd' }}
                                            />
                                        </motion.div>
                                    );
                                })}

                                {/* Current time indicator */}
                                <motion.div
                                    className="absolute w-0.5 h-16 bg-white pointer-events-none"
                                    style={{
                                        left: `${((currentTime - timelineScroll) / (duration / zoomLevel)) * 100}%`,
                                        zIndex: 25,
                                        display: currentTime >= timelineScroll && currentTime <= timelineScroll + (duration / zoomLevel) ? 'block' : 'none'
                                    }}
                                    initial={{ scaleY: 0.8 }}
                                    animate={{ scaleY: [0.8, 1, 0.8] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                />
                            </motion.div>

                            {/* Time markers */}
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                {Array.from({ length: 11 }, (_, i) => {
                                    const visibleDuration = duration / zoomLevel;
                                    const time = timelineScroll + (visibleDuration / 10) * i;
                                    return <span key={i}>{formatTime(time).split('.')[0]}</span>;
                                })}
                            </div>
                        </div>

                        {/* Create Clip Button & Help */}
                        <div className="space-y-3 mt-4">
                            <div className="flex justify-between items-center">
                                <motion.button
                                    onClick={() => createClip()}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    📌 Add Shot on Goal Clip (M)
                                </motion.button>

                                <div className="text-xs text-gray-400 flex items-center space-x-4">
                                    <span title="Play/Pause">Space: Play/Pause</span>
                                    <span title="Navigate">←→: Skip</span>
                                    <span title="Zoom">Ctrl+Wheel: Zoom</span>
                                    <span title="Scroll when zoomed">Wheel: Scroll</span>
                                </div>
                            </div>

                            {/* Annotation Tools Info */}
                            {selectedAnnotationId && (
                                <motion.div
                                    className="p-3 bg-gray-700 rounded-lg border border-blue-500"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs text-gray-300">
                                            <span className="font-semibold text-blue-400">Annotation Selected</span> - Drag to move • Handles to resize • Del to delete
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => {
                                                    const ann = annotations.find(a => a.id === selectedAnnotationId);
                                                    if (ann) {
                                                        updateAnnotation(selectedAnnotationId, {
                                                            stroke: ann.stroke === '#3b82f6' ? '#ef4444' : ann.stroke === '#ef4444' ? '#10b981' : '#3b82f6'
                                                        });
                                                    }
                                                }}
                                                className="px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded text-xs"
                                                title="Change Color"
                                            >
                                                🎨
                                            </button>
                                            <button
                                                onClick={() => {
                                                    deleteAnnotation(selectedAnnotationId);
                                                    setSelectedAnnotationId(null);
                                                }}
                                                className="px-2 py-1 bg-red-600 hover:bg-red-500 rounded text-xs"
                                                title="Delete"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Drawing Mode Info */}
                            {activeTool !== 'select' && (
                                <motion.div
                                    className="p-3 bg-green-900/30 rounded-lg border border-green-500"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <div className="text-xs text-green-300">
                                        <span className="font-semibold">Drawing Mode: {activeTool.toUpperCase()}</span> -
                                        {activeTool === 'text' ? ' Click to place text' : ' Click and drag to draw'}
                                        {' • ESC to cancel'}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Right Sidebar - Clips List */}
            {videoFile && (
                <div className="w-80 bg-gray-800 flex flex-col">
                    {/* Clips Header */}
                    <div className="p-4 border-b border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <input
                                type="text"
                                placeholder="Filter clips..."
                                className="flex-1 px-3 py-2 bg-gray-700 rounded text-sm"
                            />
                            <button className="ml-2 p-2 hover:bg-gray-700 rounded">
                                🔍
                            </button>
                        </div>

                        <button className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm">
                            Select clips...
                        </button>

                        <div className="mt-4">
                            <select className="w-full px-3 py-2 bg-gray-700 rounded text-sm">
                                <option>My clips</option>
                                <option>All clips</option>
                                <option>Team clips</option>
                            </select>
                        </div>
                    </div>

                    {/* Clips List */}
                    <div className="flex-1 overflow-y-auto">
                        {clips.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                <p className="mb-2">No clips yet</p>
                                <p className="text-sm">Create your first clip by clicking the button below the timeline</p>
                            </div>
                        ) : (
                            <div className="p-2 space-y-2">
                                {clips.map((clip, index) => (
                                    <motion.div
                                        key={clip.id}
                                        className={`p-3 rounded ${selectedClip === clip.id
                                            ? 'bg-blue-600'
                                            : 'bg-gray-700 hover:bg-gray-600'
                                            }`}
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1" onClick={() => jumpToClip(clip)}>
                                                <div className="flex items-center space-x-2 mb-2 cursor-pointer">
                                                    <span className="text-sm">⚽</span>
                                                    <input
                                                        type="text"
                                                        value={clip.name}
                                                        onChange={(e) => {
                                                            e.stopPropagation();
                                                            updateClip(clip.id, { name: e.target.value });
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="font-semibold bg-transparent border-none outline-none flex-1 hover:bg-gray-600 px-1 rounded transition-colors"
                                                    />
                                                </div>

                                                <div className="space-y-1 text-xs" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-gray-400 w-12">Start:</span>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={clip.startTime.toFixed(1)}
                                                            onChange={(e) => {
                                                                e.stopPropagation();
                                                                const newStart = Math.max(0, parseFloat(e.target.value) || 0);
                                                                if (newStart < clip.endTime) {
                                                                    updateClip(clip.id, {
                                                                        startTime: newStart,
                                                                        duration: clip.endTime - newStart
                                                                    });
                                                                }
                                                            }}
                                                            className="bg-gray-600 px-2 py-1 rounded w-20 text-white"
                                                        />
                                                        <span className="text-gray-400">s</span>
                                                    </div>

                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-gray-400 w-12">End:</span>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={clip.endTime.toFixed(1)}
                                                            onChange={(e) => {
                                                                e.stopPropagation();
                                                                const newEnd = Math.min(duration, parseFloat(e.target.value) || 0);
                                                                if (newEnd > clip.startTime) {
                                                                    updateClip(clip.id, {
                                                                        endTime: newEnd,
                                                                        duration: newEnd - clip.startTime
                                                                    });
                                                                }
                                                            }}
                                                            className="bg-gray-600 px-2 py-1 rounded w-20 text-white"
                                                        />
                                                        <span className="text-gray-400">s</span>
                                                    </div>

                                                    <div className="text-gray-400 mt-1">
                                                        Duration: {formatTime(clip.duration)}
                                                    </div>
                                                </div>

                                                {/* Annotations for this clip */}
                                                {selectedClip === clip.id && annotations.filter(a => a.clipId === clip.id).length > 0 && (
                                                    <div className="mt-3 pt-3 border-t border-gray-600">
                                                        <div className="text-xs text-gray-400 mb-2">Annotations ({annotations.filter(a => a.clipId === clip.id).length})</div>
                                                        <div className="space-y-1 max-h-40 overflow-y-auto">
                                                            {annotations.filter(a => a.clipId === clip.id).map(ann => (
                                                                <div
                                                                    key={ann.id}
                                                                    className="flex items-center justify-between p-2 bg-gray-600 rounded text-xs hover:bg-gray-500 cursor-pointer"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        seekTo(ann.startTime);
                                                                        handleAnnotationSelect(ann.id);
                                                                    }}
                                                                >
                                                                    <div className="flex items-center space-x-2 flex-1">
                                                                        <span>{ann.type === 'text' ? '📝' : ann.type === 'circle' ? '⭕' : ann.type === 'spotlight' ? '🔦' : ann.type === 'arrow' ? '➡️' : ann.type === 'line' ? '📏' : '⬡'}</span>
                                                                        <span className="truncate">{ann.text || ann.type}</span>
                                                                        <span className="text-gray-400 text-[10px]">{formatTime(ann.startTime).substring(0, 5)}</span>
                                                                    </div>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            deleteAnnotation(ann.id);
                                                                        }}
                                                                        className="ml-2 text-red-400 hover:text-red-300"
                                                                    >
                                                                        ×
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {index === 0 && (
                                                    <div className="mt-2 text-xs text-gray-400">
                                                        test
                                                    </div>
                                                )}
                                            </div>
                                            <motion.button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteClip(clip.id);
                                                }}
                                                className="p-1 hover:bg-gray-600 rounded text-gray-400 hover:text-red-400 transition-colors"
                                                title="Delete clip"
                                                whileHover={{ scale: 1.2, rotate: 10 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                🗑️
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          scroll-behavior: smooth;
        }

        body {
          overflow-x: hidden;
        }
        
        .tool-btn {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
        }
        .tool-btn:hover {
          background-color: #374151;
          transform: scale(1.05);
        }
        .tool-btn:active {
          transform: scale(0.95);
        }
        
        .control-btn {
          padding: 8px 16px;
          background-color: #374151;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
        }
        .control-btn:hover {
          background-color: #4b5563;
          transform: translateY(-1px);
        }
        .control-btn:active {
          transform: translateY(0);
        }
        
        .control-btn-large {
          width: 56px;
          height: 56px;
          background-color: #3b82f6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 24px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }
        .control-btn-large:hover {
          background-color: #2563eb;
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.6);
        }
        .control-btn-large:active {
          transform: scale(1.05);
        }

        input[type="range"] {
          -webkit-appearance: none;
          width: 100%;
          height: 8px;
          border-radius: 4px;
          outline: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%);
          cursor: grab;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 0 0 rgba(59, 130, 246, 0);
        }

        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.3);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), 0 0 0 4px rgba(59, 130, 246, 0.3);
        }

        input[type="range"]::-webkit-slider-thumb:active {
          cursor: grabbing;
          transform: scale(1.2);
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.5), 0 0 0 6px rgba(59, 130, 246, 0.4);
        }

        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%);
          cursor: grab;
          border: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        input[type="range"]::-moz-range-thumb:hover {
          transform: scale(1.3);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
        }

        input[type="range"]::-moz-range-thumb:active {
          cursor: grabbing;
          transform: scale(1.2);
        }

        input[type="number"] {
          transition: all 0.2s ease-in-out;
        }

        input[type="number"]:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        .select-none {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #1f2937;
        }

        ::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 4px;
          transition: background 0.2s;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }

        .cursor-ew-resize {
          cursor: ew-resize;
        }

        .cursor-move {
          cursor: move;
        }

        .cursor-grab {
          cursor: grab;
        }

        .cursor-grabbing {
          cursor: grabbing;
        }

        /* Zoom transition */
        .timeline-zoom-transition {
          transition: all 0.3s ease-in-out;
        }

        /* Smooth animations */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes slideIn {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        /* Custom button styles */
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        button:disabled:hover {
          transform: none !important;
        }

        /* Video container */
        video {
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }

        /* Smooth transitions for all interactive elements */
        button, input, select {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}} />
        </div>
    );
}

