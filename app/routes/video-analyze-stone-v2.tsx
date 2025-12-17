import { useState, useRef, useEffect, useCallback } from "react";
import { animate, motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "motion/react";
import { Stage, Layer, Circle, Line, Text, Arrow, RegularPolygon, Transformer } from "react-konva";
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
    description?: string;
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
}

type Tool = 'select' | 'text' | 'circle' | 'spotlight' | 'line' | 'arrow' | 'connection' | 'polygon';

// Modern SVG Icons
const Icons = {
    home: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    ),
    folder: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
    ),
    calendar: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    ),
    clipboard: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        </svg>
    ),
    users: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    ),
    share: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
    ),
    timer: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    ),
    tag: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
    ),
    grid: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
        </svg>
    ),
    settings: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    ),
    help: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    ),
    monitor: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
    ),
    layers: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
        </svg>
    ),
    // Drawing tools
    cursor: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4l7.07 17 2.51-7.39L21 11.07z" />
        </svg>
    ),
    text: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M4 7V4h16v3" />
            <path d="M12 4v16" />
            <path d="M8 20h8" />
        </svg>
    ),
    circle: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
        </svg>
    ),
    spotlight: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.3" />
        </svg>
    ),
    line: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="5" y1="19" x2="19" y2="5" />
        </svg>
    ),
    connection: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="6" cy="6" r="3" />
            <circle cx="18" cy="18" r="3" />
            <path d="M8.5 8.5L15.5 15.5" strokeDasharray="3 3" />
        </svg>
    ),
    arrow: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
        </svg>
    ),
    polygon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
        </svg>
    ),
    // Player controls
    play: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
    ),
    pause: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
    ),
    skipBack: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="19 20 9 12 19 4 19 20" fill="currentColor" />
            <line x1="5" y1="19" x2="5" y2="5" />
        </svg>
    ),
    skipForward: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="5 4 15 12 5 20 5 4" fill="currentColor" />
            <line x1="19" y1="5" x2="19" y2="19" />
        </svg>
    ),
    rewind: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 19l-7-7 7-7" />
            <path d="M18 19l-7-7 7-7" />
        </svg>
    ),
    fastForward: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 5l7 7-7 7" />
            <path d="M6 5l7 7-7 7" />
        </svg>
    ),
    record: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="8" />
        </svg>
    ),
    volume: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
    ),
    zoomIn: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
    ),
    zoomOut: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
    ),
    search: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    ),
    filter: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
        </svg>
    ),
    check: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),
    chevronDown: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
        </svg>
    ),
    moreHorizontal: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="19" cy="12" r="1.5" />
            <circle cx="5" cy="12" r="1.5" />
        </svg>
    ),
    x: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    ),
    upload: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
    ),
    soccer: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            <path d="M2 12h20" />
        </svg>
    ),
};

// Tool button component
const ToolButton = ({ tool, activeTool, setActiveTool, icon, label }: {
    tool: Tool;
    activeTool: Tool;
    setActiveTool: (tool: Tool) => void;
    icon: React.ReactNode;
    label: string;
}) => (
    <motion.button
        onClick={() => setActiveTool(tool)}
        className={`group relative flex flex-col items-center justify-center w-full py-3 rounded-xl transition-all duration-200
            ${activeTool === tool
                ? 'bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-cyan-400 shadow-lg shadow-cyan-500/10'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
    >
        <div className={`transition-transform duration-200 ${activeTool === tool ? 'scale-110' : 'group-hover:scale-110'}`}>
            {icon}
        </div>
        <span className="text-[10px] mt-1.5 font-medium tracking-wide">{label}</span>
        {activeTool === tool && (
            <motion.div
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-r-full"
                layoutId="activeToolIndicator"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
        )}
    </motion.button>
);

// Sidebar nav button
const NavButton = ({ icon, active = false, badge }: { icon: React.ReactNode; active?: boolean; badge?: string }) => (
    <motion.button
        className={`relative p-3 rounded-xl transition-all duration-200
            ${active ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
    >
        {icon}
        {badge && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-500 text-[10px] font-bold rounded-full flex items-center justify-center">
                {badge}
            </span>
        )}
    </motion.button>
);

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
    const [draggingClip, setDraggingClip] = useState<{ id: string; startX: number; originalStartTime: number } | null>(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [timelineScroll, setTimelineScroll] = useState(0);
    const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
    const [canvasDimensions, setCanvasDimensions] = useState({ width: 1920, height: 1080 });
    const [textInput, setTextInput] = useState("");
    const [showTextInput, setShowTextInput] = useState(false);
    const [textInputPos, setTextInputPos] = useState({ x: 0, y: 0 });
    const [filterText, setFilterText] = useState("");
    const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(1);

    const videoRef = useRef<HTMLVideoElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const timelineRef = useRef<HTMLDivElement>(null);
    const scrollAnimationRef = useRef<any>(null);
    const stageRef = useRef<Konva.Stage>(null);
    const transformerRef = useRef<Konva.Transformer>(null);
    const videoContainerRef = useRef<HTMLDivElement>(null);

    // Smooth spring values for playhead
    const playheadX = useMotionValue(0);
    const smoothPlayheadX = useSpring(playheadX, { stiffness: 300, damping: 30 });

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
    const togglePlayPause = useCallback(() => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    }, [isPlaying]);

    // Update current time
    const handleTimeUpdate = () => {
        if (videoRef.current && !isDraggingPlayhead) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    // Update playhead position
    useEffect(() => {
        if (timelineRef.current && duration > 0) {
            const visibleDuration = duration / zoomLevel;
            const percentage = ((currentTime - timelineScroll) / visibleDuration) * 100;
            playheadX.set(percentage);
        }
    }, [currentTime, timelineScroll, zoomLevel, duration, playheadX]);

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
    const seekTo = useCallback((time: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            setCurrentTime(time);
        }
    }, []);

    // Skip forward/backward
    const skip = useCallback((seconds: number) => {
        if (videoRef.current) {
            const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
            seekTo(newTime);
        }
    }, [currentTime, duration, seekTo]);

    // Create new clip
    const createClip = useCallback((type: string = "Shot on goal") => {
        const newClip: Clip = {
            id: Date.now().toString(),
            name: type,
            startTime: currentTime,
            endTime: Math.min(currentTime + 25, duration),
            duration: Math.min(25, duration - currentTime),
            type: type,
            description: ""
        };
        setClips(prev => [...prev, newClip]);
        setSelectedClip(newClip.id);
    }, [currentTime, duration]);

    // Delete clip
    const deleteClip = useCallback((clipId: string) => {
        setClips(prev => prev.filter(c => c.id !== clipId));
        if (selectedClip === clipId) {
            setSelectedClip(null);
        }
    }, [selectedClip]);

    // Jump to clip
    const jumpToClip = useCallback((clip: Clip) => {
        seekTo(clip.startTime);
        setSelectedClip(clip.id);
    }, [seekTo]);

    // Format time display
    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        if (hrs > 0) {
            return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Format duration for clips
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `(${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')})`;
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

        if (activeTool === 'text') {
            const stage = e.target.getStage();
            const pos = stage.getPointerPosition();
            setTextInputPos(pos);
            setShowTextInput(true);
            return;
        }

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

        const newAnnotation: Annotation = {
            id: `ann_${Date.now()}`,
            type: activeTool as any,
            clipId: selectedClip || '',
            startTime: currentTime,
            endTime: currentTime + 5,
            x: drawStart.x,
            y: drawStart.y,
            fill: activeTool === 'spotlight' ? 'rgba(255, 255, 0, 0.3)' : 'transparent',
            stroke: '#00d4ff',
            strokeWidth: 3,
            opacity: 1,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
        };

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

        setAnnotations(prev => [...prev, newAnnotation]);
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
                strokeWidth: 0.5,
                opacity: 1,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
            };
            setAnnotations(prev => [...prev, newAnnotation]);
        }
        setTextInput("");
        setShowTextInput(false);
        setActiveTool('select');
    };

    // Update annotation
    const updateAnnotation = (id: string, updates: Partial<Annotation>) => {
        setAnnotations(prev => prev.map(ann =>
            ann.id === id ? { ...ann, ...updates } : ann
        ));
    };

    // Delete annotation
    const deleteAnnotation = (id: string) => {
        setAnnotations(prev => prev.filter(ann => ann.id !== id));
        if (selectedAnnotationId === id) {
            setSelectedAnnotationId(null);
        }
    };

    // Get visible annotations at current time
    const getVisibleAnnotations = () => {
        return annotations.filter(ann => {
            return currentTime >= ann.startTime && currentTime <= ann.endTime;
        }).map(ann => {
            const fadeDuration = 0.3;
            let opacity = ann.opacity || 1;

            if (currentTime < ann.startTime + fadeDuration) {
                opacity *= (currentTime - ann.startTime) / fadeDuration;
            }
            if (currentTime > ann.endTime - fadeDuration) {
                opacity *= (ann.endTime - currentTime) / fadeDuration;
            }

            return { ...ann, opacity: Math.max(0, Math.min(1, opacity)) };
        });
    };

    // Handle timeline click to seek
    const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!timelineRef.current || resizingClip || draggingClip) return;

        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const visibleDuration = duration / zoomLevel;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        const newTime = (percentage * visibleDuration) + timelineScroll;

        seekTo(Math.max(0, Math.min(duration, newTime)));
    };

    // Handle clip resize start
    const handleResizeStart = (clipId: string, edge: 'start' | 'end', e: React.MouseEvent) => {
        e.stopPropagation();
        setResizingClip({ id: clipId, edge });
    };

    // Handle clip drag start
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

        if (resizingClip) {
            setClips(prev => prev.map(clip => {
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

        if (draggingClip) {
            const clip = clips.find(c => c.id === draggingClip.id);
            if (clip) {
                const deltaX = e.clientX - draggingClip.startX;
                const deltaTime = (deltaX / rect.width) * visibleDuration;
                const newStartTime = Math.max(0, Math.min(duration - clip.duration, draggingClip.originalStartTime + deltaTime));
                const newEndTime = newStartTime + clip.duration;

                setClips(prev => prev.map(c =>
                    c.id === draggingClip.id
                        ? { ...c, startTime: newStartTime, endTime: newEndTime }
                        : c
                ));
            }
        }

        if (isDraggingPlayhead) {
            const newTime = Math.max(0, Math.min(duration, (percentage * visibleDuration) + timelineScroll));
            seekTo(newTime);
        }
    };

    // Handle mouse up
    const handleMouseUp = () => {
        setResizingClip(null);
        setDraggingClip(null);
        setIsDraggingPlayhead(false);
    };

    // Smooth zoom
    const handleZoom = (direction: 'in' | 'out', centerTime?: number) => {
        setZoomLevel(prev => {
            const newZoom = direction === 'in' ? Math.min(prev * 1.5, 10) : Math.max(prev / 1.5, 1);

            if (newZoom === 1) {
                animateScroll(0);
            } else if (centerTime !== undefined && prev !== newZoom) {
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

    // Handle wheel
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();

        if (e.ctrlKey || e.metaKey) {
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
            const visibleDuration = duration / zoomLevel;
            const scrollAmount = (e.deltaY / 500) * visibleDuration;
            const newScroll = Math.max(0, Math.min(duration - visibleDuration, timelineScroll + scrollAmount));
            setTimelineScroll(newScroll);
        }
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (!videoFile) return;

            if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
                return;
            }

            if (e.code === 'Space') {
                e.preventDefault();
                togglePlayPause();
            } else if (e.code === 'ArrowLeft') {
                e.preventDefault();
                skip(e.shiftKey ? -1 : -10);
            } else if (e.code === 'ArrowRight') {
                e.preventDefault();
                skip(e.shiftKey ? 1 : 10);
            } else if ((e.code === 'Equal' || e.code === 'NumpadAdd') && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleZoom('in', currentTime);
            } else if ((e.code === 'Minus' || e.code === 'NumpadSubtract') && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleZoom('out', currentTime);
            } else if (e.code === 'KeyM') {
                e.preventDefault();
                createClip();
            } else if (e.code === 'Delete' || e.code === 'Backspace') {
                if (selectedAnnotationId) {
                    e.preventDefault();
                    deleteAnnotation(selectedAnnotationId);
                }
            } else if (e.code === 'Escape') {
                e.preventDefault();
                setActiveTool('select');
                setSelectedAnnotationId(null);
                setShowTextInput(false);
                setTextInput("");
                transformerRef.current?.nodes([]);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [videoFile, currentTime, zoomLevel, timelineScroll, duration, selectedAnnotationId, togglePlayPause, skip, createClip, deleteAnnotation]);

    // Update clip
    const updateClip = (clipId: string, updates: Partial<Clip>) => {
        setClips(prev => prev.map(clip =>
            clip.id === clipId ? { ...clip, ...updates } : clip
        ));
    };

    // Filter clips
    const filteredClips = clips.filter(clip =>
        clip.name.toLowerCase().includes(filterText.toLowerCase()) ||
        clip.description?.toLowerCase().includes(filterText.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-[#0a0a0f] text-white overflow-hidden font-['Inter',system-ui,sans-serif]">
            {/* Left Sidebar - Navigation */}
            <motion.div
                className="w-14 bg-[#0f0f15] border-r border-white/5 flex flex-col items-center py-4"
                initial={{ x: -60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
                {/* Logo */}
                <motion.div
                    className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/20"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {Icons.soccer}
                </motion.div>

                {/* Nav icons */}
                <div className="flex flex-col items-center space-y-1 flex-1">
                    <NavButton icon={Icons.home} active />
                    <NavButton icon={Icons.folder} />
                    <NavButton icon={Icons.calendar} />
                    <NavButton icon={Icons.clipboard} />
                    <NavButton icon={Icons.users} />
                    <NavButton icon={Icons.share} />
                    <NavButton icon={Icons.timer} />
                    <NavButton icon={Icons.tag} badge="3" />
                    <NavButton icon={Icons.grid} />
                </div>

                {/* Bottom nav */}
                <div className="flex flex-col items-center space-y-1 mt-auto">
                    <NavButton icon={Icons.settings} />
                    <NavButton icon={Icons.help} />
                    <NavButton icon={Icons.monitor} />
                    <NavButton icon={Icons.layers} />
                </div>
            </motion.div>

            {/* Tools Sidebar */}
            <motion.div
                className="w-20 bg-[#12121a] border-r border-white/5 flex flex-col py-4 px-2"
                initial={{ x: -80, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
                <div className="space-y-1">
                    <ToolButton tool="select" activeTool={activeTool} setActiveTool={setActiveTool} icon={Icons.cursor} label="Select" />
                    <ToolButton tool="text" activeTool={activeTool} setActiveTool={setActiveTool} icon={Icons.text} label="Text" />
                    <ToolButton tool="circle" activeTool={activeTool} setActiveTool={setActiveTool} icon={Icons.circle} label="Circle" />
                    <ToolButton tool="spotlight" activeTool={activeTool} setActiveTool={setActiveTool} icon={Icons.spotlight} label="Spotlight" />
                    <ToolButton tool="line" activeTool={activeTool} setActiveTool={setActiveTool} icon={Icons.line} label="Line" />
                    <ToolButton tool="connection" activeTool={activeTool} setActiveTool={setActiveTool} icon={Icons.connection} label="Connection" />
                    <ToolButton tool="arrow" activeTool={activeTool} setActiveTool={setActiveTool} icon={Icons.arrow} label="Arrow" />
                    <ToolButton tool="polygon" activeTool={activeTool} setActiveTool={setActiveTool} icon={Icons.polygon} label="Polygon" />
                </div>
            </motion.div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <motion.div
                    className="h-14 bg-[#12121a] border-b border-white/5 flex items-center justify-between px-6"
                    initial={{ y: -56, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                    <h1 className="text-lg font-semibold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent" dir="rtl">
                        فرسان_وحدات2
                    </h1>
                    <motion.button
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-all"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Exit analytics
                        {Icons.x}
                    </motion.button>
                </motion.div>

                {/* Video Display Area */}
                <div className="flex-1 flex items-center justify-center bg-[#0a0a0f] relative overflow-hidden">
                    {!videoFile ? (
                        <motion.div
                            className="text-center"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
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
                                className="group relative px-10 py-5 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 hover:from-cyan-500/20 hover:to-blue-600/20 border border-cyan-500/30 hover:border-cyan-400/50 rounded-2xl transition-all duration-300"
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="flex flex-col items-center gap-4">
                                    <div className="p-4 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-xl group-hover:scale-110 transition-transform">
                                        {Icons.upload}
                                    </div>
                                    <span className="text-lg font-semibold">Upload Video</span>
                                </div>
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.button>
                            <motion.p
                                className="mt-6 text-gray-500 text-sm"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
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
                                className="max-w-full max-h-full rounded-lg shadow-2xl"
                                onTimeUpdate={handleTimeUpdate}
                                onLoadedMetadata={handleLoadedMetadata}
                                onEnded={() => setIsPlaying(false)}
                                muted={isMuted}
                            />

                            {/* Canvas overlay */}
                            <div
                                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                                style={{ width: canvasDimensions.width, height: canvasDimensions.height }}
                            >
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
                                            const commonProps = {
                                                key: ann.id,
                                                id: ann.id,
                                                x: ann.x,
                                                y: ann.y,
                                                opacity: ann.opacity,
                                                rotation: ann.rotation,
                                                scaleX: ann.scaleX,
                                                scaleY: ann.scaleY,
                                                draggable: activeTool === 'select',
                                                onClick: () => handleAnnotationSelect(ann.id),
                                                onTap: () => handleAnnotationSelect(ann.id),
                                                onDragEnd: (e: any) => {
                                                    updateAnnotation(ann.id, {
                                                        x: e.target.x(),
                                                        y: e.target.y()
                                                    });
                                                },
                                                onTransformEnd: (e: any) => {
                                                    const node = e.target;
                                                    updateAnnotation(ann.id, {
                                                        x: node.x(),
                                                        y: node.y(),
                                                        rotation: node.rotation(),
                                                        scaleX: node.scaleX(),
                                                        scaleY: node.scaleY()
                                                    });
                                                }
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
                                                            shadowBlur={ann.type === 'spotlight' ? 30 : 0}
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
                                                            points={ann.points || [0, 0, 100, 100]}
                                                            stroke={ann.stroke}
                                                            strokeWidth={ann.strokeWidth}
                                                            fill={ann.stroke}
                                                            pointerLength={12}
                                                            pointerWidth={12}
                                                        />
                                                    );
                                                case 'polygon':
                                                    return (
                                                        <RegularPolygon
                                                            {...commonProps}
                                                            sides={6}
                                                            radius={ann.radius || 50}
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
                                        <Transformer
                                            ref={transformerRef}
                                            boundBoxFunc={(oldBox, newBox) => {
                                                if (newBox.width < 5 || newBox.height < 5) {
                                                    return oldBox;
                                                }
                                                return newBox;
                                            }}
                                            borderStroke="#00d4ff"
                                            anchorStroke="#00d4ff"
                                            anchorFill="#0a0a0f"
                                            anchorSize={10}
                                            anchorCornerRadius={2}
                                        />
                                    </Layer>
                                </Stage>
                            </div>

                            {/* Text Input Dialog */}
                            <AnimatePresence>
                                {showTextInput && (
                                    <motion.div
                                        className="absolute bg-[#1a1a24] p-4 rounded-xl shadow-2xl border border-white/10"
                                        style={{
                                            left: textInputPos.x,
                                            top: textInputPos.y,
                                            zIndex: 1000
                                        }}
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.9, opacity: 0 }}
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
                                            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white w-64 mb-3 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                                            autoFocus
                                        />
                                        <div className="flex gap-2">
                                            <motion.button
                                                onClick={handleTextSubmit}
                                                className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-lg text-sm font-medium transition-all"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                Add
                                            </motion.button>
                                            <motion.button
                                                onClick={() => {
                                                    setShowTextInput(false);
                                                    setTextInput("");
                                                    setActiveTool('select');
                                                }}
                                                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-all"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                Cancel
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Video Controls & Timeline */}
                {videoFile && (
                    <motion.div
                        className="bg-[#12121a] border-t border-white/5"
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {/* Playback Controls */}
                        <div className="flex items-center justify-center gap-2 py-3 border-b border-white/5">
                            {/* Left controls */}
                            <div className="flex items-center gap-3 mr-auto pl-4">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg text-sm">
                                    <span className="text-cyan-400 font-medium">{Icons.tag}</span>
                                    <span className="text-gray-400">My clips</span>
                                    {Icons.chevronDown}
                                </div>
                            </div>

                            {/* Center controls */}
                            <div className="flex items-center gap-1">
                                <motion.button
                                    onClick={() => seekTo(0)}
                                    className="p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    {Icons.skipBack}
                                </motion.button>

                                <motion.button
                                    onClick={() => skip(-10)}
                                    className="p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    {Icons.rewind}
                                </motion.button>

                                <motion.button
                                    onClick={togglePlayPause}
                                    className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 rounded-full shadow-lg shadow-red-500/30 transition-all"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {isPlaying ? Icons.pause : Icons.play}
                                </motion.button>

                                <motion.button
                                    onClick={() => skip(10)}
                                    className="p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    {Icons.fastForward}
                                </motion.button>

                                <motion.button
                                    onClick={() => seekTo(duration)}
                                    className="p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    {Icons.skipForward}
                                </motion.button>
                            </div>

                            {/* Right controls */}
                            <div className="flex items-center gap-2 ml-auto pr-4">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg">
                                    <motion.button
                                        onClick={() => handleZoom('out')}
                                        className="text-gray-400 hover:text-white transition-colors disabled:opacity-30"
                                        disabled={zoomLevel <= 1}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        {Icons.zoomOut}
                                    </motion.button>
                                    <motion.button
                                        onClick={() => handleZoom('in')}
                                        className="text-gray-400 hover:text-white transition-colors disabled:opacity-30"
                                        disabled={zoomLevel >= 10}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        {Icons.zoomIn}
                                    </motion.button>
                                </div>

                                <motion.button
                                    onClick={() => setIsMuted(!isMuted)}
                                    className="p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    {Icons.volume}
                                </motion.button>

                                <motion.button
                                    onClick={changePlaybackSpeed}
                                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-all"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {playbackSpeed}×
                                </motion.button>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div
                            className="relative px-4 py-4 select-none"
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        >
                            {/* Time display */}
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-lg text-sm font-mono z-30">
                                <span className="text-white">{formatTime(currentTime)}</span>
                                <span className="text-gray-500"> / {formatTime(duration)}</span>
                            </div>

                            {/* Time markers */}
                            <div className="flex justify-between text-[10px] text-gray-600 mb-2 px-1">
                                {Array.from({ length: 11 }, (_, i) => {
                                    const visibleDuration = duration / zoomLevel;
                                    const time = timelineScroll + (visibleDuration / 10) * i;
                                    return <span key={i}>{formatTime(time)}</span>;
                                })}
                            </div>

                            {/* Timeline track */}
                            <motion.div
                                ref={timelineRef}
                                className="relative h-24 bg-[#1a1a24] rounded-xl overflow-hidden cursor-pointer"
                                onWheel={handleWheel}
                                onClick={handleTimelineClick}
                            >
                                {/* Progress bar background */}
                                <div className="absolute inset-x-0 top-0 h-1.5 bg-white/5">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                                        style={{
                                            width: `${((currentTime - timelineScroll) / (duration / zoomLevel)) * 100}%`
                                        }}
                                    />
                                </div>

                                {/* Clip markers on timeline */}
                                <AnimatePresence>
                                    {clips.map((clip) => {
                                        const visibleDuration = duration / zoomLevel;
                                        const visibleStart = timelineScroll;
                                        const visibleEnd = timelineScroll + visibleDuration;

                                        if (clip.endTime < visibleStart || clip.startTime > visibleEnd) {
                                            return null;
                                        }

                                        const leftPercent = ((clip.startTime - timelineScroll) / visibleDuration) * 100;
                                        const widthPercent = (clip.duration / visibleDuration) * 100;

                                        return (
                                            <motion.div
                                                key={clip.id}
                                                className={`absolute rounded-lg cursor-move overflow-hidden backdrop-blur-sm
                                                    ${selectedClip === clip.id
                                                        ? 'bg-cyan-500/30 border-2 border-cyan-400 shadow-lg shadow-cyan-500/20'
                                                        : 'bg-blue-500/20 border border-blue-400/50 hover:bg-blue-500/30'
                                                    }`}
                                                style={{
                                                    left: `${Math.max(0, leftPercent)}%`,
                                                    width: `${widthPercent}%`,
                                                    top: '16px',
                                                    height: 'calc(100% - 24px)',
                                                    zIndex: selectedClip === clip.id ? 20 : 10
                                                }}
                                                initial={{ scale: 0.9, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0.9, opacity: 0 }}
                                                whileHover={{ y: -2 }}
                                                onMouseDown={(e) => {
                                                    const target = e.target as HTMLElement;
                                                    if (!target.classList.contains('resize-handle')) {
                                                        handleClipDragStart(clip.id, e);
                                                    }
                                                }}
                                            >
                                                {/* Left resize handle */}
                                                <div
                                                    className="resize-handle absolute left-0 top-0 w-2 h-full bg-gradient-to-r from-white/30 to-transparent cursor-ew-resize hover:from-white/50 transition-colors"
                                                    onMouseDown={(e) => handleResizeStart(clip.id, 'start', e)}
                                                />

                                                <div className="flex items-center h-full px-3 pointer-events-none">
                                                    <span className="text-xs font-medium truncate text-white/80">{clip.name}</span>
                                                </div>

                                                {/* Resize icon in corner */}
                                                <div className="absolute bottom-1 right-1 text-white/30">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M22 22H20V20H22V22ZM22 18H20V16H22V18ZM18 22H16V20H18V22ZM18 18H16V16H18V18ZM14 22H12V20H14V22ZM22 14H20V12H22V14Z" />
                                                    </svg>
                                                </div>

                                                {/* Right resize handle */}
                                                <div
                                                    className="resize-handle absolute right-0 top-0 w-2 h-full bg-gradient-to-l from-white/30 to-transparent cursor-ew-resize hover:from-white/50 transition-colors"
                                                    onMouseDown={(e) => handleResizeStart(clip.id, 'end', e)}
                                                />
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>

                                {/* Playhead */}
                                <motion.div
                                    className="absolute top-0 bottom-0 w-0.5 bg-white z-30 cursor-ew-resize"
                                    style={{
                                        left: `${((currentTime - timelineScroll) / (duration / zoomLevel)) * 100}%`,
                                        display: currentTime >= timelineScroll && currentTime <= timelineScroll + (duration / zoomLevel) ? 'block' : 'none'
                                    }}
                                    onMouseDown={() => setIsDraggingPlayhead(true)}
                                >
                                    {/* Playhead handle */}
                                    <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-sm rotate-45 shadow-lg" />
                                </motion.div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Right Sidebar - Clips List */}
            <AnimatePresence>
                {videoFile && (
                    <motion.div
                        className="w-80 bg-[#12121a] border-l border-white/5 flex flex-col"
                        initial={{ x: 320, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 320, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {/* Clips Header */}
                        <div className="p-4 border-b border-white/5 space-y-3">
                            {/* Search */}
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                    {Icons.search}
                                </div>
                                <input
                                    type="text"
                                    placeholder="Filter clips..."
                                    value={filterText}
                                    onChange={(e) => setFilterText(e.target.value)}
                                    className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                                />
                                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                                    {Icons.filter}
                                </button>
                            </div>

                            {/* Select clips button */}
                            <motion.button
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-all"
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                            >
                                {Icons.check}
                                Select clips...
                            </motion.button>

                            {/* Clips dropdown */}
                            <div className="flex items-center gap-2 px-3 py-2.5 bg-white/5 rounded-lg">
                                <span className="text-cyan-400">{Icons.tag}</span>
                                <span className="flex-1 text-sm font-medium">My clips</span>
                                {Icons.chevronDown}
                            </div>
                        </div>

                        {/* Clips List */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {filteredClips.length === 0 ? (
                                <div className="p-8 text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center text-gray-600">
                                        {Icons.tag}
                                    </div>
                                    <p className="text-gray-500 text-sm mb-1">No clips yet</p>
                                    <p className="text-gray-600 text-xs">Press M or click the record button to create your first clip</p>
                                </div>
                            ) : (
                                <div className="p-2 space-y-2">
                                    {filteredClips.map((clip, index) => (
                                        <motion.div
                                            key={clip.id}
                                            className={`group relative p-3 rounded-xl transition-all duration-200 cursor-pointer
                                                ${selectedClip === clip.id
                                                    ? 'bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/30'
                                                    : 'bg-white/5 hover:bg-white/10 border border-transparent'
                                                }`}
                                            initial={{ x: 20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            onClick={() => jumpToClip(clip)}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`mt-0.5 ${selectedClip === clip.id ? 'text-cyan-400' : 'text-gray-500'}`}>
                                                    {Icons.soccer}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <input
                                                            type="text"
                                                            value={clip.name}
                                                            onChange={(e) => {
                                                                e.stopPropagation();
                                                                updateClip(clip.id, { name: e.target.value });
                                                            }}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className={`font-medium bg-transparent border-none outline-none flex-1 truncate hover:bg-white/5 px-1 py-0.5 -mx-1 rounded transition-colors
                                                                ${selectedClip === clip.id ? 'text-cyan-400' : 'text-white'}`}
                                                        />
                                                        <motion.button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteClip(clip.id);
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all"
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                        >
                                                            {Icons.moreHorizontal}
                                                        </motion.button>
                                                    </div>

                                                    <div className="text-xs text-gray-500">
                                                        {formatTime(clip.startTime)} - {formatTime(clip.endTime)} {formatDuration(clip.duration)}
                                                    </div>

                                                    <input
                                                        type="text"
                                                        value={clip.description || ''}
                                                        onChange={(e) => {
                                                            e.stopPropagation();
                                                            updateClip(clip.id, { description: e.target.value });
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        placeholder="Add description..."
                                                        className="mt-2 w-full text-xs bg-white/5 border border-transparent hover:border-white/10 focus:border-cyan-500/30 rounded px-2 py-1.5 text-gray-400 placeholder-gray-600 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Add clip button */}
                        <div className="p-4 border-t border-white/5">
                            <motion.button
                                onClick={() => createClip()}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl text-sm font-semibold shadow-lg shadow-cyan-500/20 transition-all"
                                whileHover={{ scale: 1.02, y: -1 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <motion.span
                                    className={isRecording ? 'text-red-300' : ''}
                                    animate={isRecording ? { scale: [1, 1.2, 1] } : {}}
                                    transition={isRecording ? { duration: 1, repeat: Infinity } : {}}
                                >
                                    {Icons.record}
                                </motion.span>
                                Add Shot on Goal (M)
                            </motion.button>
                        </div>
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

                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }

                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 3px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }

                input[type="text"]:focus,
                input[type="number"]:focus {
                    outline: none;
                }

                /* Smooth animations */
                @keyframes pulse-glow {
                    0%, 100% {
                        box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
                    }
                    50% {
                        box-shadow: 0 0 40px rgba(0, 212, 255, 0.5);
                    }
                }

                .pulse-glow {
                    animation: pulse-glow 2s ease-in-out infinite;
                }
            `}} />
        </div>
    );
}
