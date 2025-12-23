import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Stage, Layer, Circle, Line, Text, Arrow, RegularPolygon } from "react-konva";
import { getVideoAnalysis, saveVideoAnalysisData, type VideoAnalysis } from "~/lib/firebase";

export const meta = () => {
    return [
        { title: "Video Preview - Football Analysis" },
        { name: "description", content: "Preview your video analysis with annotations" },
    ];
};

// Keyframe for animation
interface Keyframe {
    time: number;
    x: number;
    y: number;
    rotation?: number;
    scaleX?: number;
    scaleY?: number;
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
    keyframes?: Keyframe[];
    // Pause Scene annotation - video pauses when this annotation appears
    isPauseScene?: boolean;
    pauseSceneDuration?: number;
}

interface Clip {
    id: string;
    name: string;
    startTime: number;
    endTime: number;
    duration: number;
    type: string;
    description?: string;
}

// Default canvas dimensions (fallback)
const DEFAULT_CANVAS_WIDTH = 1920;
const DEFAULT_CANVAS_HEIGHT = 1080;

export default function VideoPreview() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Video state
    const [videoFile, setVideoFile] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);

    // Analysis state
    const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);
    const [clips, setClips] = useState<Clip[]>([]);
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pause Scene state
    const [activePauseScene, setActivePauseScene] = useState<Annotation | null>(null);
    const [pauseSceneTriggered, setPauseSceneTriggered] = useState<Set<string>>(new Set());
    const [pauseSceneCountdown, setPauseSceneCountdown] = useState<number>(0);
    const [showPauseScenesPanel, setShowPauseScenesPanel] = useState(false);
    const pauseSceneTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Get all pause scene annotations
    const pauseSceneAnnotations = annotations.filter(ann => ann.isPauseScene);

    // Original canvas dimensions from editor (loaded from analysis)
    const [originalCanvasWidth, setOriginalCanvasWidth] = useState(DEFAULT_CANVAS_WIDTH);
    const [originalCanvasHeight, setOriginalCanvasHeight] = useState(DEFAULT_CANVAS_HEIGHT);

    // Display dimensions
    const [displayWidth, setDisplayWidth] = useState(DEFAULT_CANVAS_WIDTH);
    const [displayHeight, setDisplayHeight] = useState(DEFAULT_CANVAS_HEIGHT);
    const [videoNaturalWidth, setVideoNaturalWidth] = useState(DEFAULT_CANVAS_WIDTH);
    const [videoNaturalHeight, setVideoNaturalHeight] = useState(DEFAULT_CANVAS_HEIGHT);

    // Scale factor for annotations
    const [scaleX, setScaleX] = useState(1);
    const [scaleY, setScaleY] = useState(1);

    // Refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Load analysis data
    useEffect(() => {
        const loadAnalysis = async () => {
            if (!id) {
                setError("No analysis ID provided");
                setIsLoading(false);
                return;
            }

            try {
                const data = await getVideoAnalysis(id);
                if (data) {
                    setAnalysis(data);
                    setClips(data.clips || []);
                    setAnnotations(data.annotations || []);

                    // Load the original canvas dimensions from the editor
                    if (data.canvasWidth && data.canvasHeight) {
                        setOriginalCanvasWidth(data.canvasWidth);
                        setOriginalCanvasHeight(data.canvasHeight);
                        console.log(`Loaded canvas dimensions: ${data.canvasWidth}x${data.canvasHeight}`);
                    }
                } else {
                    setError("Analysis not found");
                }
            } catch (err) {
                console.error("Failed to load analysis:", err);
                setError("Failed to load analysis");
            } finally {
                setIsLoading(false);
            }
        };

        loadAnalysis();
    }, [id]);

    // Update display dimensions based on container size
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current && videoRef.current) {
                const container = containerRef.current;
                // Account for padding (p-4 = 16px on each side)
                const padding = 32;
                // Reserve space for controls at bottom (about 100px)
                const controlsSpace = 100;
                const availableWidth = container.clientWidth - padding;
                const availableHeight = container.clientHeight - padding - controlsSpace;

                // Get video natural dimensions
                const videoWidth = videoRef.current.videoWidth || originalCanvasWidth;
                const videoHeight = videoRef.current.videoHeight || originalCanvasHeight;

                setVideoNaturalWidth(videoWidth);
                setVideoNaturalHeight(videoHeight);

                // Calculate aspect ratios
                const videoAspect = videoWidth / videoHeight;
                const containerAspect = availableWidth / availableHeight;

                let newWidth, newHeight;

                if (containerAspect > videoAspect) {
                    // Container is wider - fit to height
                    newHeight = availableHeight;
                    newWidth = availableHeight * videoAspect;
                } else {
                    // Container is taller - fit to width
                    newWidth = availableWidth;
                    newHeight = availableWidth / videoAspect;
                }

                setDisplayWidth(newWidth);
                setDisplayHeight(newHeight);

                // Calculate scale factors
                // Annotations were created on originalCanvas, now displaying on newWidth x newHeight
                setScaleX(newWidth / originalCanvasWidth);
                setScaleY(newHeight / originalCanvasHeight);
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);

        return () => window.removeEventListener('resize', updateDimensions);
    }, [videoFile, originalCanvasWidth, originalCanvasHeight]);

    // Video event handlers
    const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setVideoFile(url);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);

            // Update dimensions after video loads
            const videoWidth = videoRef.current.videoWidth;
            const videoHeight = videoRef.current.videoHeight;
            setVideoNaturalWidth(videoWidth);
            setVideoNaturalHeight(videoHeight);

            // Recalculate display dimensions
            if (containerRef.current) {
                const container = containerRef.current;
                // Account for padding and controls
                const padding = 32;
                const controlsSpace = 100;
                const availableWidth = container.clientWidth - padding;
                const availableHeight = container.clientHeight - padding - controlsSpace;

                const videoAspect = videoWidth / videoHeight;
                const containerAspect = availableWidth / availableHeight;

                let newWidth, newHeight;

                if (containerAspect > videoAspect) {
                    newHeight = availableHeight;
                    newWidth = availableHeight * videoAspect;
                } else {
                    newWidth = availableWidth;
                    newHeight = availableWidth / videoAspect;
                }

                setDisplayWidth(newWidth);
                setDisplayHeight(newHeight);
                // Use original canvas dimensions from editor for scaling
                setScaleX(newWidth / originalCanvasWidth);
                setScaleY(newHeight / originalCanvasHeight);
            }
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const seekTo = (time: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, Math.min(duration, time));
        }
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percentage = (e.clientX - rect.left) / rect.width;
        seekTo(percentage * duration);
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Auto-hide controls
    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        if (isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        }
    };

    // Smooth easing function (smootherstep for natural movement)
    const smootherstep = (t: number): number => {
        return t * t * t * (t * (t * 6 - 15) + 10);
    };

    // Smooth lerp function
    const lerp = (start: number, end: number, factor: number): number => {
        return start + (end - start) * factor;
    };

    // Track smoothed positions for each annotation
    const smoothedPositionsRef = useRef<Map<string, { x: number; y: number; opacity: number; rotation: number; scaleX: number; scaleY: number }>>(new Map());

    // Previous scale for detecting changes
    const prevScaleRef = useRef({ x: 1, y: 1 });

    // Smoothing factor (0-1, higher = faster catch-up, lower = smoother)
    const SMOOTHING_FACTOR = 0.12;

    // Clear smoothed positions when scale changes significantly
    useEffect(() => {
        const scaleDiff = Math.abs(scaleX - prevScaleRef.current.x) + Math.abs(scaleY - prevScaleRef.current.y);
        if (scaleDiff > 0.01) {
            // Scale changed, clear smoothed positions to avoid wrong positions
            smoothedPositionsRef.current.clear();
            prevScaleRef.current = { x: scaleX, y: scaleY };
        }
    }, [scaleX, scaleY]);

    // Animation frame counter for smooth rendering
    const [animationTick, setAnimationTick] = useState(0);

    // Animation loop for smooth transitions
    useEffect(() => {
        let frameId: number;

        const animateFrame = () => {
            if (isPlaying || activePauseScene) {
                setAnimationTick(t => t + 1);
            }
            frameId = requestAnimationFrame(animateFrame);
        };

        if (isPlaying || activePauseScene) {
            frameId = requestAnimationFrame(animateFrame);
        }

        return () => {
            if (frameId) {
                cancelAnimationFrame(frameId);
            }
        };
    }, [isPlaying, activePauseScene]);

    // Pause Scene detection - pause video when reaching a pause scene annotation
    useEffect(() => {
        if (!isPlaying || !videoRef.current || activePauseScene) return;

        // Find pause scene annotations that should trigger at current time
        const pauseSceneAnnotations = annotations.filter(ann =>
            ann.isPauseScene &&
            !pauseSceneTriggered.has(ann.id) &&
            currentTime >= ann.startTime &&
            currentTime <= ann.startTime + 0.1 // Small window to trigger
        );

        if (pauseSceneAnnotations.length > 0) {
            const pauseAnn = pauseSceneAnnotations[0];

            // Pause the video
            videoRef.current.pause();
            setIsPlaying(false);
            setActivePauseScene(pauseAnn);

            // Calculate total duration of the pause scene annotation
            const totalDuration = pauseAnn.endTime - pauseAnn.startTime;
            setPauseSceneCountdown(Math.ceil(totalDuration));

            // Mark as triggered so it doesn't trigger again
            setPauseSceneTriggered(prev => new Set([...prev, pauseAnn.id]));

            // Start countdown - pause for the full annotation duration
            let remaining = totalDuration;
            const countdownInterval = setInterval(() => {
                remaining -= 1;
                setPauseSceneCountdown(Math.max(0, Math.ceil(remaining)));

                if (remaining <= 0) {
                    clearInterval(countdownInterval);
                    // Seek to end of annotation and resume playback
                    setActivePauseScene(null);
                    if (videoRef.current) {
                        videoRef.current.currentTime = pauseAnn.endTime;
                        videoRef.current.play();
                        setIsPlaying(true);
                    }
                }
            }, 1000);

            pauseSceneTimeoutRef.current = countdownInterval as any;
        }
    }, [currentTime, isPlaying, annotations, pauseSceneTriggered, activePauseScene]);

    // Reset pause scene triggers when seeking backwards
    useEffect(() => {
        // If user seeks to a time before any triggered pause scene, reset those
        const toReset = Array.from(pauseSceneTriggered).filter(id => {
            const ann = annotations.find(a => a.id === id);
            return ann && currentTime < ann.startTime;
        });

        if (toReset.length > 0) {
            setPauseSceneTriggered(prev => {
                const newSet = new Set(prev);
                toReset.forEach(id => newSet.delete(id));
                return newSet;
            });
        }
    }, [currentTime, annotations]);

    // Skip pause scene manually
    const skipPauseScene = useCallback(() => {
        if (pauseSceneTimeoutRef.current) {
            clearInterval(pauseSceneTimeoutRef.current);
        }
        // Seek to end of the pause scene annotation
        if (activePauseScene && videoRef.current) {
            videoRef.current.currentTime = activePauseScene.endTime;
        }
        setActivePauseScene(null);
        if (videoRef.current) {
            videoRef.current.play();
            setIsPlaying(true);
        }
    }, [activePauseScene]);

    // Cleanup pause scene timeout on unmount
    useEffect(() => {
        return () => {
            if (pauseSceneTimeoutRef.current) {
                clearInterval(pauseSceneTimeoutRef.current);
            }
        };
    }, []);

    // Delete pause scene annotation
    const deletePauseScene = useCallback(async (annId: string) => {
        // Remove from local state
        const updatedAnnotations = annotations.filter(a => a.id !== annId);
        setAnnotations(updatedAnnotations);

        // Remove from triggered set if it was triggered
        setPauseSceneTriggered(prev => {
            const newSet = new Set(prev);
            newSet.delete(annId);
            return newSet;
        });

        // If this is the active pause scene, cancel it
        if (activePauseScene?.id === annId) {
            if (pauseSceneTimeoutRef.current) {
                clearInterval(pauseSceneTimeoutRef.current);
            }
            setActivePauseScene(null);
            if (videoRef.current) {
                videoRef.current.play();
                setIsPlaying(true);
            }
        }

        // Save to database
        if (id && analysis) {
            try {
                await saveVideoAnalysisData(
                    id,
                    clips,
                    updatedAnnotations,
                    analysis.canvasWidth || 1920,
                    analysis.canvasHeight || 1080
                );
            } catch (error) {
                console.error('Failed to save after deleting pause scene:', error);
            }
        }
    }, [annotations, activePauseScene, id, analysis, clips]);

    // Interpolate keyframes with smooth easing
    const interpolateKeyframes = (keyframes: Keyframe[], time: number): { x: number; y: number; rotation?: number; scaleX?: number; scaleY?: number } | null => {
        if (!keyframes || keyframes.length === 0) return null;

        const sorted = [...keyframes].sort((a, b) => a.time - b.time);

        if (time <= sorted[0].time) {
            return sorted[0];
        }

        if (time >= sorted[sorted.length - 1].time) {
            return sorted[sorted.length - 1];
        }

        for (let i = 0; i < sorted.length - 1; i++) {
            const k1 = sorted[i];
            const k2 = sorted[i + 1];

            if (time >= k1.time && time <= k2.time) {
                // Calculate linear t then apply smooth easing
                const linearT = (time - k1.time) / (k2.time - k1.time);
                const t = smootherstep(linearT);

                return {
                    x: k1.x + (k2.x - k1.x) * t,
                    y: k1.y + (k2.y - k1.y) * t,
                    rotation: k1.rotation !== undefined && k2.rotation !== undefined
                        ? k1.rotation + (k2.rotation - k1.rotation) * t
                        : k1.rotation,
                    scaleX: k1.scaleX !== undefined && k2.scaleX !== undefined
                        ? k1.scaleX + (k2.scaleX - k1.scaleX) * t
                        : k1.scaleX,
                    scaleY: k1.scaleY !== undefined && k2.scaleY !== undefined
                        ? k1.scaleY + (k2.scaleY - k1.scaleY) * t
                        : k1.scaleY,
                };
            }
        }

        return null;
    };

    // Get visible annotations at current time with scaling and smooth transitions
    const getVisibleAnnotations = useCallback(() => {
        const FADE_DURATION = 0.5;
        const FADE_MARGIN = 0.1;

        // Use uniform scale to maintain aspect ratio
        const uniformScale = Math.min(scaleX, scaleY);

        return annotations.filter(ann => {
            return currentTime >= ann.startTime - FADE_MARGIN && currentTime <= ann.endTime + FADE_MARGIN;
        }).map(ann => {
            let targetOpacity = ann.opacity || 1;

            // Calculate fade with smooth easing
            if (currentTime < ann.startTime) {
                targetOpacity = 0;
            } else if (currentTime < ann.startTime + FADE_DURATION) {
                const fadeProgress = (currentTime - ann.startTime) / FADE_DURATION;
                targetOpacity *= smootherstep(fadeProgress);
            } else if (currentTime > ann.endTime - FADE_DURATION) {
                const fadeProgress = (ann.endTime - currentTime) / FADE_DURATION;
                targetOpacity *= smootherstep(Math.max(0, fadeProgress));
            }

            targetOpacity = Math.max(0, Math.min(1, targetOpacity));

            // Get target position from keyframe interpolation (UNSCALED - original coordinates)
            let targetX = ann.x;
            let targetY = ann.y;
            let targetRotation = ann.rotation || 0;
            let targetScaleX = ann.scaleX || 1;
            let targetScaleY = ann.scaleY || 1;

            if (ann.keyframes && ann.keyframes.length > 0) {
                const interpolated = interpolateKeyframes(ann.keyframes, currentTime);
                if (interpolated) {
                    targetX = interpolated.x;
                    targetY = interpolated.y;
                    targetRotation = interpolated.rotation ?? targetRotation;
                    targetScaleX = interpolated.scaleX ?? targetScaleX;
                    targetScaleY = interpolated.scaleY ?? targetScaleY;
                }
            }

            // Get or initialize smoothed position (UNSCALED values)
            let smoothed = smoothedPositionsRef.current.get(ann.id);
            if (!smoothed) {
                smoothed = {
                    x: targetX,
                    y: targetY,
                    opacity: targetOpacity,
                    rotation: targetRotation,
                    scaleX: targetScaleX,
                    scaleY: targetScaleY
                };
                smoothedPositionsRef.current.set(ann.id, smoothed);
            } else {
                // Lerp towards target (unscaled) for smooth movement
                smoothed.x = lerp(smoothed.x, targetX, SMOOTHING_FACTOR);
                smoothed.y = lerp(smoothed.y, targetY, SMOOTHING_FACTOR);
                smoothed.opacity = lerp(smoothed.opacity, targetOpacity, SMOOTHING_FACTOR * 1.5);
                smoothed.rotation = lerp(smoothed.rotation, targetRotation, SMOOTHING_FACTOR);
                smoothed.scaleX = lerp(smoothed.scaleX, targetScaleX, SMOOTHING_FACTOR);
                smoothed.scaleY = lerp(smoothed.scaleY, targetScaleY, SMOOTHING_FACTOR);
                smoothedPositionsRef.current.set(ann.id, smoothed);
            }

            // Apply scaling AT RENDER TIME (not stored in smoothed values)
            return {
                ...ann,
                x: smoothed.x * scaleX,
                y: smoothed.y * scaleY,
                radius: ann.radius ? ann.radius * uniformScale : undefined,
                fontSize: ann.fontSize ? ann.fontSize * uniformScale : undefined,
                strokeWidth: ann.strokeWidth ? ann.strokeWidth * uniformScale : undefined,
                points: ann.points ? ann.points.map((p, i) => p * (i % 2 === 0 ? scaleX : scaleY)) : undefined,
                opacity: smoothed.opacity,
                rotation: smoothed.rotation,
                scaleX: smoothed.scaleX,
                scaleY: smoothed.scaleY,
            };
        }).filter(ann => ann.opacity > 0.01);
    }, [annotations, currentTime, scaleX, scaleY, animationTick]);

    // Format time
    const formatTime = (time: number) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Get current clip
    const getCurrentClip = () => {
        return clips.find(clip => currentTime >= clip.startTime && currentTime <= clip.endTime);
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement) return;

            switch (e.key) {
                case ' ':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    seekTo(currentTime - 5);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    seekTo(currentTime + 5);
                    break;
                case 'f':
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case 'm':
                    e.preventDefault();
                    toggleMute();
                    break;
                case 'Escape':
                    if (activePauseScene) {
                        skipPauseScene();
                    } else if (isFullscreen) {
                        document.exitFullscreen();
                        setIsFullscreen(false);
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentTime, duration, isFullscreen, activePauseScene, skipPauseScene]);

    // Icons
    const Icons = {
        play: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>,
        pause: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>,
        volumeHigh: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></svg>,
        volumeMute: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>,
        fullscreen: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" /></svg>,
        exitFullscreen: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" /></svg>,
        back: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>,
        upload: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
        skipBack: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="19 20 9 12 19 4 19 20" fill="currentColor" /><line x1="5" y1="19" x2="5" y2="5" /></svg>,
        skipForward: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 4 15 12 5 20 5 4" fill="currentColor" /><line x1="19" y1="5" x2="19" y2="19" /></svg>,
    };

    if (isLoading) {
        return (
            <div className="flex h-screen bg-[#0a0a0f] text-white items-center justify-center">
                <motion.div
                    className="flex flex-col items-center gap-4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <motion.div
                        className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <p className="text-gray-400">Loading analysis...</p>
                </motion.div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen bg-[#0a0a0f] text-white items-center justify-center">
                <motion.div
                    className="flex flex-col items-center gap-6 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="15" y1="9" x2="9" y2="15" />
                            <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-white mb-2">Error</h2>
                        <p className="text-gray-400">{error}</p>
                    </div>
                    <motion.button
                        onClick={() => navigate('/video-analyze-stone')}
                        className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-all"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Go Back
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-[#0a0a0f] text-white overflow-hidden font-['Inter',system-ui,sans-serif]">
            {/* Header - fixed height */}
            <motion.header
                className="h-14 shrink-0 bg-[#12121a] border-b border-white/5 flex items-center justify-between px-6"
                initial={{ y: -56, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
            >
                <div className="flex items-center gap-4">
                    <motion.button
                        onClick={() => navigate('/video-analyze-stone')}
                        className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {Icons.back}
                    </motion.button>
                    <div>
                        <h1 className="font-semibold text-white">{analysis?.name || 'Preview'}</h1>
                        <p className="text-xs text-gray-500">
                            {clips.length} clips • {annotations.length} annotations
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Current clip indicator */}
                    {getCurrentClip() && (
                        <motion.div
                            className="px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/30 rounded-lg"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            key={getCurrentClip()?.id}
                        >
                            <span className="text-sm text-cyan-400 font-medium">
                                {getCurrentClip()?.name}
                            </span>
                        </motion.div>
                    )}

                    {/* Debug info */}
                    {videoFile && (
                        <div className="text-xs text-gray-500 px-3 py-1 bg-white/5 rounded-lg">
                            Original: {originalCanvasWidth}×{originalCanvasHeight} |
                            Display: {Math.round(displayWidth)}×{Math.round(displayHeight)} |
                            Scale: {scaleX.toFixed(2)}×{scaleY.toFixed(2)}
                        </div>
                    )}

                    {/* Upload video button */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden"
                    />
                    <motion.button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-lg text-sm font-medium transition-all"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {videoFile ? 'Change Video' : 'Upload Video'}
                    </motion.button>
                </div>
            </motion.header>

            {/* Main video area - takes remaining space minus clips bar */}
            <div
                ref={containerRef}
                className="flex-1 min-h-0 bg-black relative flex items-center justify-center p-4"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => isPlaying && setShowControls(false)}
            >
                {!videoFile ? (
                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <motion.button
                            onClick={() => fileInputRef.current?.click()}
                            className="group flex flex-col items-center gap-6 p-12 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 rounded-3xl transition-all duration-300"
                            whileHover={{ scale: 1.02, y: -5 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="p-6 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-2xl group-hover:scale-110 transition-transform">
                                {Icons.upload}
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-2">Upload Video</h3>
                                <p className="text-gray-500 text-sm">
                                    Upload the video file to preview with annotations
                                </p>
                            </div>
                        </motion.button>

                        {analysis?.videoFileName && (
                            <p className="mt-4 text-sm text-gray-500">
                                Expected file: <span className="text-gray-400">{analysis.videoFileName}</span>
                            </p>
                        )}
                    </motion.div>
                ) : (
                    <>
                        {/* Video and annotations container - positioned together */}
                        <div
                            className="relative"
                            style={{
                                width: displayWidth,
                                height: displayHeight
                            }}
                        >
                            {/* Video element - fills container exactly */}
                            <video
                                ref={videoRef}
                                src={videoFile}
                                className="absolute inset-0"
                                style={{
                                    width: displayWidth,
                                    height: displayHeight,
                                    objectFit: 'fill' // Fill exactly to match Stage dimensions
                                }}
                                onLoadedMetadata={handleLoadedMetadata}
                                onTimeUpdate={handleTimeUpdate}
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                                onEnded={() => setIsPlaying(false)}
                                onClick={togglePlay}
                            />

                            {/* Konva stage overlay for annotations - exact same size as video */}
                            <div className="absolute inset-0 pointer-events-none">
                                <Stage width={displayWidth} height={displayHeight}>
                                    <Layer>
                                        {getVisibleAnnotations().map((ann) => {
                                            const commonProps = {
                                                key: ann.id,
                                                id: ann.id,
                                                x: ann.x,
                                                y: ann.y,
                                                opacity: ann.opacity,
                                                rotation: ann.rotation,
                                                scaleX: ann.scaleX,
                                                scaleY: ann.scaleY,
                                                listening: false,
                                            };

                                            switch (ann.type) {
                                                case 'circle':
                                                case 'spotlight':
                                                    return (
                                                        <Circle
                                                            {...commonProps}
                                                            radius={ann.radius}
                                                            fill={ann.fill}
                                                            stroke={ann.stroke}
                                                            strokeWidth={ann.strokeWidth}
                                                            shadowColor={ann.type === 'spotlight' ? '#ffd700' : undefined}
                                                            shadowBlur={ann.type === 'spotlight' ? 30 * Math.min(scaleX, scaleY) : 0}
                                                            shadowOpacity={ann.type === 'spotlight' ? 0.8 : 0}
                                                        />
                                                    );
                                                case 'line':
                                                    return (
                                                        <Line
                                                            {...commonProps}
                                                            points={ann.points}
                                                            stroke={ann.stroke}
                                                            strokeWidth={ann.strokeWidth}
                                                            lineCap="round"
                                                            lineJoin="round"
                                                        />
                                                    );
                                                case 'arrow':
                                                    return (
                                                        <Arrow
                                                            {...commonProps}
                                                            points={ann.points || [0, 0, 100 * scaleX, 100 * scaleY]}
                                                            stroke={ann.stroke}
                                                            strokeWidth={ann.strokeWidth}
                                                            fill={ann.stroke}
                                                            pointerLength={12 * Math.min(scaleX, scaleY)}
                                                            pointerWidth={12 * Math.min(scaleX, scaleY)}
                                                        />
                                                    );
                                                case 'polygon':
                                                    return (
                                                        <RegularPolygon
                                                            {...commonProps}
                                                            sides={6}
                                                            radius={ann.radius || 50 * Math.min(scaleX, scaleY)}
                                                            fill={ann.fill}
                                                            stroke={ann.stroke}
                                                            strokeWidth={ann.strokeWidth}
                                                        />
                                                    );
                                                case 'text':
                                                    return (
                                                        <Text
                                                            {...commonProps}
                                                            text={ann.text}
                                                            fontSize={ann.fontSize}
                                                            fill={ann.fill}
                                                            stroke={ann.stroke}
                                                            strokeWidth={ann.strokeWidth}
                                                            fontFamily="Inter, system-ui, sans-serif"
                                                            fontStyle="bold"
                                                        />
                                                    );
                                                default:
                                                    return null;
                                            }
                                        })}
                                    </Layer>
                                </Stage>
                            </div>
                        </div>

                        {/* Play/Pause overlay button */}
                        <AnimatePresence>
                            {!isPlaying && !activePauseScene && (
                                <motion.button
                                    className="absolute inset-0 flex items-center justify-center bg-black/30"
                                    onClick={togglePlay}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <motion.div
                                        className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
                                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.3)' }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {Icons.play}
                                    </motion.div>
                                </motion.button>
                            )}
                        </AnimatePresence>

                        {/* Pause Scene Overlay */}
                        <AnimatePresence>
                            {activePauseScene && (
                                <motion.div
                                    className="absolute inset-0 pointer-events-none"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    {/* Border glow effect */}
                                    <div className="absolute inset-0 border-4 border-red-500/60 rounded-lg">
                                        <motion.div
                                            className="absolute inset-0 border-4 border-red-500/40"
                                            animate={{ scale: [1, 1.02, 1] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        />
                                    </div>

                                    {/* Top banner */}
                                    <motion.div
                                        className="absolute top-4 left-1/2 -translate-x-1/2 px-6 py-3 bg-red-500/90 backdrop-blur-sm rounded-xl shadow-lg shadow-red-500/30"
                                        initial={{ y: -20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <motion.div
                                                className="w-3 h-3 bg-white rounded-full"
                                                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                                                transition={{ duration: 1, repeat: Infinity }}
                                            />
                                            <span className="text-white font-semibold">PAUSE SCENE</span>
                                            <span className="text-white/70 text-sm">
                                                • {formatTime(activePauseScene.startTime)} - {formatTime(activePauseScene.endTime)}
                                            </span>
                                        </div>
                                    </motion.div>

                                    {/* Countdown and skip button */}
                                    <motion.div
                                        className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-4 pointer-events-auto"
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                    >
                                        {/* Countdown circle */}
                                        <div className="relative w-16 h-16">
                                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                                <circle
                                                    cx="18"
                                                    cy="18"
                                                    r="16"
                                                    fill="none"
                                                    stroke="rgba(255,255,255,0.2)"
                                                    strokeWidth="3"
                                                />
                                                <motion.circle
                                                    cx="18"
                                                    cy="18"
                                                    r="16"
                                                    fill="none"
                                                    stroke="#ef4444"
                                                    strokeWidth="3"
                                                    strokeLinecap="round"
                                                    strokeDasharray={`${(pauseSceneCountdown / Math.ceil(activePauseScene.endTime - activePauseScene.startTime)) * 100.53} 100.53`}
                                                    initial={{ strokeDashoffset: 0 }}
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-white text-xl font-bold">{pauseSceneCountdown}</span>
                                            </div>
                                        </div>

                                        {/* Skip button */}
                                        <motion.button
                                            onClick={skipPauseScene}
                                            className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white text-sm font-medium transition-all"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Skip →
                                        </motion.button>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Video controls */}
                        <AnimatePresence>
                            {showControls && (
                                <motion.div
                                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-6 pt-16 pb-4"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {/* Progress bar */}
                                    <div
                                        className="relative h-1.5 bg-white/20 rounded-full mb-4 cursor-pointer group"
                                        onClick={handleProgressClick}
                                    >
                                        {/* Clip markers */}
                                        {clips.map(clip => (
                                            <div
                                                key={clip.id}
                                                className="absolute top-0 h-full bg-cyan-500/30"
                                                style={{
                                                    left: `${(clip.startTime / duration) * 100}%`,
                                                    width: `${((clip.endTime - clip.startTime) / duration) * 100}%`,
                                                }}
                                            />
                                        ))}

                                        {/* Pause Scene markers */}
                                        {pauseSceneAnnotations.map(ann => (
                                            <div
                                                key={ann.id}
                                                className="absolute top-0 h-full bg-red-500/50 border-l-2 border-red-500"
                                                style={{
                                                    left: `${(ann.startTime / duration) * 100}%`,
                                                    width: `${((ann.endTime - ann.startTime) / duration) * 100}%`,
                                                }}
                                                title={`Pause Scene: ${formatTime(ann.startTime)} - ${formatTime(ann.endTime)}`}
                                            />
                                        ))}

                                        {/* Progress */}
                                        <motion.div
                                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                                            style={{ width: `${(currentTime / duration) * 100}%` }}
                                        />

                                        {/* Hover indicator */}
                                        <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            style={{ left: `${(currentTime / duration) * 100}%`, transform: 'translate(-50%, -50%)' }}
                                        />
                                    </div>

                                    {/* Controls row */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            {/* Play/Pause */}
                                            <motion.button
                                                onClick={togglePlay}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-all"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                {isPlaying ? Icons.pause : Icons.play}
                                            </motion.button>

                                            {/* Skip buttons */}
                                            <motion.button
                                                onClick={() => seekTo(currentTime - 10)}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-all"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                {Icons.skipBack}
                                            </motion.button>

                                            <motion.button
                                                onClick={() => seekTo(currentTime + 10)}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-all"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                {Icons.skipForward}
                                            </motion.button>

                                            {/* Time display */}
                                            <span className="text-sm font-mono text-gray-300">
                                                {formatTime(currentTime)} / {formatTime(duration)}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            {/* Pause Scenes button */}
                                            {pauseSceneAnnotations.length > 0 && (
                                                <div className="relative">
                                                    <motion.button
                                                        onClick={() => setShowPauseScenesPanel(!showPauseScenesPanel)}
                                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${showPauseScenesPanel
                                                            ? 'bg-red-500/30 text-red-400'
                                                            : 'hover:bg-white/10 text-gray-300'
                                                            }`}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                            <rect x="6" y="4" width="4" height="16" rx="1" />
                                                            <rect x="14" y="4" width="4" height="16" rx="1" />
                                                        </svg>
                                                        <span className="text-sm">{pauseSceneAnnotations.length}</span>
                                                    </motion.button>
                                                </div>
                                            )}

                                            {/* Volume */}
                                            <div className="flex items-center gap-2">
                                                <motion.button
                                                    onClick={toggleMute}
                                                    className="p-2 hover:bg-white/10 rounded-lg transition-all"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    {isMuted ? Icons.volumeMute : Icons.volumeHigh}
                                                </motion.button>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="1"
                                                    step="0.1"
                                                    value={isMuted ? 0 : volume}
                                                    onChange={handleVolumeChange}
                                                    className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                                                />
                                            </div>

                                            {/* Fullscreen */}
                                            <motion.button
                                                onClick={toggleFullscreen}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-all"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                {isFullscreen ? Icons.exitFullscreen : Icons.fullscreen}
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}
            </div>

            {/* Pause Scenes Panel */}
            <AnimatePresence>
                {showPauseScenesPanel && pauseSceneAnnotations.length > 0 && (
                    <motion.div
                        className="absolute bottom-32 right-6 w-80 bg-[#12121a]/95 backdrop-blur-sm border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-red-400">
                                    <rect x="6" y="4" width="4" height="16" rx="1" />
                                    <rect x="14" y="4" width="4" height="16" rx="1" />
                                </svg>
                                <span className="font-semibold text-white">Pause Scenes</span>
                                <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-xs font-medium rounded">
                                    {pauseSceneAnnotations.length}
                                </span>
                            </div>
                            <motion.button
                                onClick={() => setShowPauseScenesPanel(false)}
                                className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </motion.button>
                        </div>

                        {/* Pause Scenes List */}
                        <div className="max-h-64 overflow-y-auto">
                            {pauseSceneAnnotations.map((ann, index) => {
                                const isTriggered = pauseSceneTriggered.has(ann.id);
                                const isActive = activePauseScene?.id === ann.id;
                                const duration = ann.endTime - ann.startTime;

                                return (
                                    <motion.div
                                        key={ann.id}
                                        className={`px-4 py-3 border-b border-white/5 flex items-center gap-3 hover:bg-white/5 transition-colors ${isActive ? 'bg-red-500/10' : ''
                                            }`}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        {/* Icon & Status */}
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive
                                            ? 'bg-red-500/30 text-red-400'
                                            : isTriggered
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-white/10 text-gray-400'
                                            }`}>
                                            {isActive ? (
                                                <motion.div
                                                    animate={{ scale: [1, 1.2, 1] }}
                                                    transition={{ duration: 1, repeat: Infinity }}
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                                        <rect x="6" y="4" width="4" height="16" rx="1" />
                                                        <rect x="14" y="4" width="4" height="16" rx="1" />
                                                    </svg>
                                                </motion.div>
                                            ) : isTriggered ? (
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            ) : (
                                                <span className="text-xs font-bold">{index + 1}</span>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-white capitalize">
                                                    {ann.type}
                                                </span>
                                                {isActive && (
                                                    <span className="px-1.5 py-0.5 bg-red-500/30 text-red-400 text-[10px] font-medium rounded animate-pulse">
                                                        ACTIVE
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500 flex items-center gap-2">
                                                <span>{formatTime(ann.startTime)} - {formatTime(ann.endTime)}</span>
                                                <span className="text-gray-600">•</span>
                                                <span>{duration.toFixed(1)}s</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1">
                                            {/* Jump to */}
                                            <motion.button
                                                onClick={() => {
                                                    seekTo(ann.startTime);
                                                    // Reset triggered state for this annotation so it can play again
                                                    setPauseSceneTriggered(prev => {
                                                        const newSet = new Set(prev);
                                                        newSet.delete(ann.id);
                                                        return newSet;
                                                    });
                                                }}
                                                className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                title="Jump to this pause scene"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                                    <polygon points="5 3 19 12 5 21 5 3" />
                                                </svg>
                                            </motion.button>

                                            {/* Delete */}
                                            <motion.button
                                                onClick={() => deletePauseScene(ann.id)}
                                                className="p-1.5 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400 transition-colors"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                title="Delete this pause scene"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="3 6 5 6 21 6" />
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                </svg>
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Footer hint */}
                        <div className="px-4 py-2 bg-white/5 border-t border-white/5">
                            <p className="text-[10px] text-gray-500 text-center">
                                Click play icon to jump • Click trash to delete permanently
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Clips bar - fixed at bottom */}
            {videoFile && clips.length > 0 && (
                <motion.div
                    className="h-20 shrink-0 bg-[#12121a] border-t border-white/5 flex items-center px-4 gap-3 overflow-x-auto"
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    {clips.map((clip, index) => {
                        const isActive = currentTime >= clip.startTime && currentTime <= clip.endTime;
                        return (
                            <motion.button
                                key={clip.id}
                                onClick={() => seekTo(clip.startTime)}
                                className={`flex-shrink-0 px-4 py-3 rounded-xl border transition-all ${isActive
                                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                                    }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="text-left">
                                    <div className="text-sm font-medium">{clip.name}</div>
                                    <div className="text-xs opacity-60">
                                        {formatTime(clip.startTime)} - {formatTime(clip.endTime)}
                                    </div>
                                </div>
                            </motion.button>
                        );
                    })}
                </motion.div>
            )}

            {/* Keyboard shortcuts hint */}
            <AnimatePresence>
                {showControls && videoFile && (
                    <motion.div
                        className="absolute bottom-28 right-6 text-xs text-gray-500 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                    >
                        <span className="text-gray-400">Space</span> Play/Pause •{' '}
                        <span className="text-gray-400">←→</span> Seek •{' '}
                        <span className="text-gray-400">F</span> Fullscreen •{' '}
                        <span className="text-gray-400">M</span> Mute
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                
                * {
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                }
                `
            }} />
        </div>
    );
}

