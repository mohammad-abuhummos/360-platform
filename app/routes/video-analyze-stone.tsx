import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { animate, motion, AnimatePresence, useMotionValue, useSpring } from "motion/react";
import { Stage, Layer, Circle, Line, Text, Arrow, RegularPolygon, Transformer } from "react-konva";
import Konva from "konva";
import {
    createVideoAnalysis,
    updateVideoAnalysis,
    deleteVideoAnalysis,
    getAllVideoAnalyses,
    getVideoAnalysis,
    saveVideoAnalysisData,
    type VideoAnalysis,
    type VideoAnalysisClip,
    type VideoAnalysisAnnotation,
} from "~/lib/firebase";

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

// Keyframe for animation recording
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
    // Keyframe animation data
    keyframes?: Keyframe[];
    // Pause Scene annotation - video pauses when this annotation appears
    isPauseScene?: boolean;
    pauseSceneDuration?: number; // How long to pause (in seconds)
}

type Tool = 'select' | 'text' | 'circle' | 'spotlight' | 'line' | 'arrow' | 'connection' | 'polygon';

// Timeline layer configuration
interface TimelineLayer {
    id: string;
    name: string;
    type: 'clips' | 'text' | 'circle' | 'spotlight' | 'line' | 'arrow' | 'polygon';
    color: string;
    icon: 'clips' | 'text' | 'circle' | 'spotlight' | 'line' | 'connection' | 'arrow' | 'polygon';
    expanded: boolean;
    visible: boolean;
}

const DEFAULT_LAYERS: TimelineLayer[] = [
    { id: 'clips', name: 'Clips', type: 'clips', color: '#3b82f6', icon: 'clips', expanded: true, visible: true },
    { id: 'text', name: 'Text', type: 'text', color: '#f59e0b', icon: 'text', expanded: true, visible: true },
    { id: 'circle', name: 'Circles', type: 'circle', color: '#10b981', icon: 'circle', expanded: true, visible: true },
    { id: 'spotlight', name: 'Spotlights', type: 'spotlight', color: '#fbbf24', icon: 'spotlight', expanded: true, visible: true },
    { id: 'line', name: 'Lines', type: 'line', color: '#8b5cf6', icon: 'line', expanded: true, visible: true },
    { id: 'arrow', name: 'Arrows', type: 'arrow', color: '#ec4899', icon: 'arrow', expanded: true, visible: true },
    { id: 'polygon', name: 'Polygons', type: 'polygon', color: '#06b6d4', icon: 'polygon', expanded: true, visible: true },
];

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
    clips: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
            <line x1="7" y1="2" x2="7" y2="22" />
            <line x1="17" y1="2" x2="17" y2="22" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <line x1="2" y1="7" x2="7" y2="7" />
            <line x1="2" y1="17" x2="7" y2="17" />
            <line x1="17" y1="17" x2="22" y2="17" />
            <line x1="17" y1="7" x2="22" y2="7" />
        </svg>
    ),
    eye: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    ),
    eyeOff: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    ),
    chevronRight: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
        </svg>
    ),
    lock: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    ),
    unlock: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 9.9-1" />
        </svg>
    ),
    plus: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    ),
    trash: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
    ),
    save: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
        </svg>
    ),
    cloud: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
        </svg>
    ),
    cloudCheck: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 16.2A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9" />
            <polyline points="9 15 12 18 22 8" />
        </svg>
    ),
    fileVideo: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <path d="M10 11l5 3-5 3v-6z" />
        </svg>
    ),
    folderOpen: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            <path d="M2 10h20" />
        </svg>
    ),
    spinner: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    ),
    database: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
    ),
    clock: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
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
    const navigate = useNavigate();
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
    const [drawCurrent, setDrawCurrent] = useState<{ x: number; y: number } | null>(null);
    const [canvasDimensions, setCanvasDimensions] = useState({ width: 1920, height: 1080 });
    const [textInput, setTextInput] = useState("");
    const [showTextInput, setShowTextInput] = useState(false);
    const [textInputPos, setTextInputPos] = useState({ x: 0, y: 0 });
    const [filterText, setFilterText] = useState("");
    const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(1);
    const [layers, setLayers] = useState<TimelineLayer[]>(DEFAULT_LAYERS);

    // Firebase state
    const [savedAnalyses, setSavedAnalyses] = useState<VideoAnalysis[]>([]);
    const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
    const [currentAnalysisName, setCurrentAnalysisName] = useState("");
    const [showAnalysisPicker, setShowAnalysisPicker] = useState(true);
    const [isLoadingAnalyses, setIsLoadingAnalyses] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [showNewAnalysisDialog, setShowNewAnalysisDialog] = useState(false);
    const [newAnalysisName, setNewAnalysisName] = useState("");
    const [videoFileName, setVideoFileName] = useState("");

    // Object Recording state
    const [isRecordingMovement, setIsRecordingMovement] = useState(false);
    const [recordingAnnotationId, setRecordingAnnotationId] = useState<string | null>(null);
    const [isShiftPressed, setIsShiftPressed] = useState(false);
    const [resizingAnnotation, setResizingAnnotation] = useState<{ id: string; edge: 'start' | 'end' } | null>(null);
    const [draggingAnnotation, setDraggingAnnotation] = useState<{ id: string; startX: number; originalStartTime: number } | null>(null);
    const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

    // Properties Panel state
    const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);
    const [propertiesPanelItem, setPropertiesPanelItem] = useState<{ type: 'clip' | 'annotation'; id: string } | null>(null);

    // Context Menu state
    const [contextMenu, setContextMenu] = useState<{
        show: boolean;
        x: number;
        y: number;
        type: 'clip' | 'annotation';
        id: string;
    } | null>(null);

    // Pause Scene state
    const [isPauseSceneMode, setIsPauseSceneMode] = useState(false);
    const [pauseSceneStartTime, setPauseSceneStartTime] = useState<number | null>(null);
    const [pauseSceneDuration, setPauseSceneDuration] = useState(3); // Default 3 seconds pause

    // Track if a drag operation occurred (to prevent click after drag)
    const wasDraggingRef = useRef(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const timelineRef = useRef<HTMLDivElement>(null);
    const scrollAnimationRef = useRef<any>(null);
    const stageRef = useRef<Konva.Stage>(null);
    const transformerRef = useRef<Konva.Transformer>(null);
    const videoContainerRef = useRef<HTMLDivElement>(null);
    const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const lastRecordedPositionRef = useRef<{ x: number; y: number } | null>(null);

    // Smooth spring values for playhead
    const playheadX = useMotionValue(0);
    const smoothPlayheadX = useSpring(playheadX, { stiffness: 300, damping: 30 });

    // Handle video upload
    const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setVideoFile(url);
            setVideoFileName(file.name);
            setSelectedClip(null);

            // Update analysis with video info if we have one
            if (currentAnalysisId) {
                updateVideoAnalysis(currentAnalysisId, {
                    videoFileName: file.name,
                });
            }
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

    // Calculate and update canvas dimensions to match displayed video size
    const updateCanvasDimensions = useCallback(() => {
        if (videoContainerRef.current && videoRef.current) {
            const container = videoContainerRef.current.getBoundingClientRect();
            const video = videoRef.current;

            if (video.videoWidth === 0 || video.videoHeight === 0) return;

            const videoAspect = video.videoWidth / video.videoHeight;
            const containerAspect = container.width / container.height;

            let width, height;
            if (containerAspect > videoAspect) {
                // Container is wider - fit to height
                height = container.height;
                width = height * videoAspect;
            } else {
                // Container is taller - fit to width
                width = container.width;
                height = width / videoAspect;
            }

            setCanvasDimensions({ width, height });
            console.log(`Canvas dimensions updated: ${width}x${height} (video: ${video.videoWidth}x${video.videoHeight})`);
        }
    }, []);

    // Handle video loaded
    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
            // Calculate displayed size, not natural size
            updateCanvasDimensions();
        }
    };

    // Update canvas dimensions on window resize
    useEffect(() => {
        window.addEventListener('resize', updateCanvasDimensions);
        // Also update after a short delay to ensure layout is complete
        const timeout = setTimeout(updateCanvasDimensions, 100);
        return () => {
            window.removeEventListener('resize', updateCanvasDimensions);
            clearTimeout(timeout);
        };
    }, [videoFile, updateCanvasDimensions]);

    // Load saved analyses on mount
    useEffect(() => {
        loadSavedAnalyses();
    }, []);

    // Auto-save when clips or annotations change
    useEffect(() => {
        if (currentAnalysisId && (clips.length > 0 || annotations.length > 0)) {
            // Clear previous timeout
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }

            // Set new timeout for auto-save (2 seconds after last change)
            autoSaveTimeoutRef.current = setTimeout(() => {
                handleAutoSave();
            }, 2000);
        }

        return () => {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
        };
    }, [clips, annotations, currentAnalysisId]);

    // Animation frame counter for smooth rendering
    const [animationTick, setAnimationTick] = useState(0);

    // Animation loop for smooth transitions
    useEffect(() => {
        let frameId: number;

        const animate = () => {
            // Only run animation loop when video is playing or when we need smooth transitions
            if (isPlaying || isRecordingMovement) {
                setAnimationTick(t => t + 1);
            }
            frameId = requestAnimationFrame(animate);
        };

        // Start animation loop when video is playing
        if (isPlaying || isRecordingMovement) {
            frameId = requestAnimationFrame(animate);
        }

        return () => {
            if (frameId) {
                cancelAnimationFrame(frameId);
            }
        };
    }, [isPlaying, isRecordingMovement]);

    // Shift key detection for recording mode
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Shift' && !isShiftPressed) {
                setIsShiftPressed(true);
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'Shift') {
                setIsShiftPressed(false);
                // Stop recording when shift is released
                if (isRecordingMovement) {
                    stopRecordingMovement();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [isShiftPressed, isRecordingMovement]);

    // Start recording movement for an annotation
    const startRecordingMovement = (annotationId: string, initialX: number, initialY: number) => {
        if (!isPlaying) {
            // Start playing video when recording starts
            videoRef.current?.play();
            setIsPlaying(true);
        }

        setIsRecordingMovement(true);
        setRecordingAnnotationId(annotationId);
        lastRecordedPositionRef.current = { x: initialX, y: initialY };

        // Add initial keyframe
        const ann = annotations.find(a => a.id === annotationId);
        if (ann) {
            const initialKeyframe: Keyframe = {
                time: currentTime,
                x: initialX,
                y: initialY,
                rotation: ann.rotation,
                scaleX: ann.scaleX,
                scaleY: ann.scaleY,
            };

            setAnnotations(prev => prev.map(a => {
                if (a.id === annotationId) {
                    const existingKeyframes = a.keyframes || [];
                    return {
                        ...a,
                        keyframes: [...existingKeyframes, initialKeyframe]
                    };
                }
                return a;
            }));
        }
    };

    // Record a keyframe at the current position
    const recordKeyframe = (annotationId: string, x: number, y: number, rotation?: number) => {
        if (!isRecordingMovement || recordingAnnotationId !== annotationId) return;

        // Record more frequently for smoother movement (reduced threshold from 5 to 2 pixels)
        const lastPos = lastRecordedPositionRef.current;
        if (lastPos) {
            const distance = Math.sqrt(Math.pow(x - lastPos.x, 2) + Math.pow(y - lastPos.y, 2));
            if (distance < 2) return; // Skip if moved less than 2 pixels
        }

        lastRecordedPositionRef.current = { x, y };

        const keyframe: Keyframe = {
            time: currentTime,
            x,
            y,
            rotation,
        };

        setAnnotations(prev => prev.map(a => {
            if (a.id === annotationId) {
                const existingKeyframes = a.keyframes || [];
                // Remove any keyframe very close in time (reduced from 0.05 to 0.016 = ~60fps)
                const filteredKeyframes = existingKeyframes.filter(k => Math.abs(k.time - currentTime) > 0.016);
                return {
                    ...a,
                    keyframes: [...filteredKeyframes, keyframe].sort((a, b) => a.time - b.time)
                };
            }
            return a;
        }));
    };

    // Stop recording movement
    const stopRecordingMovement = () => {
        if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
            recordingIntervalRef.current = null;
        }
        setIsRecordingMovement(false);
        setRecordingAnnotationId(null);
        lastRecordedPositionRef.current = null;
    };

    // Clear all keyframes for an annotation
    const clearKeyframes = (annotationId: string) => {
        setAnnotations(prev => prev.map(a => {
            if (a.id === annotationId) {
                return { ...a, keyframes: [] };
            }
            return a;
        }));
    };

    // Smooth easing function (ease-in-out)
    const smoothstep = (t: number): number => {
        return t * t * (3 - 2 * t);
    };

    // Even smoother easing (smootherstep)
    const smootherstep = (t: number): number => {
        return t * t * t * (t * (t * 6 - 15) + 10);
    };

    // Elastic ease out for bouncy feel
    const elasticOut = (t: number): number => {
        const p = 0.3;
        return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
    };

    // Smooth lerp function
    const lerp = (start: number, end: number, factor: number): number => {
        return start + (end - start) * factor;
    };

    // Track smoothed positions for each annotation
    const smoothedPositionsRef = useRef<Map<string, { x: number; y: number; opacity: number; rotation: number; scaleX: number; scaleY: number }>>(new Map());

    // Animation frame ref for cleanup
    const animationFrameRef = useRef<number | null>(null);

    // Smoothing factor (0-1, higher = faster catch-up, lower = smoother)
    const SMOOTHING_FACTOR = 0.15;

    // Interpolate position between keyframes with smooth easing
    const interpolateKeyframes = (keyframes: Keyframe[], time: number): { x: number; y: number; rotation?: number; scaleX?: number; scaleY?: number } | null => {
        if (!keyframes || keyframes.length === 0) return null;

        // Sort keyframes by time
        const sorted = [...keyframes].sort((a, b) => a.time - b.time);

        // If before first keyframe, return first keyframe position
        if (time <= sorted[0].time) {
            return sorted[0];
        }

        // If after last keyframe, return last keyframe position
        if (time >= sorted[sorted.length - 1].time) {
            return sorted[sorted.length - 1];
        }

        // Find the two keyframes to interpolate between
        for (let i = 0; i < sorted.length - 1; i++) {
            const k1 = sorted[i];
            const k2 = sorted[i + 1];

            if (time >= k1.time && time <= k2.time) {
                // Calculate linear t
                const linearT = (time - k1.time) / (k2.time - k1.time);
                // Apply smooth easing for natural movement
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

    // Load all saved analyses from Firestore
    const loadSavedAnalyses = async () => {
        setIsLoadingAnalyses(true);
        try {
            const analyses = await getAllVideoAnalyses();
            setSavedAnalyses(analyses);
        } catch (error) {
            console.error('Failed to load analyses:', error);
        } finally {
            setIsLoadingAnalyses(false);
        }
    };

    // Create a new analysis
    const handleCreateNewAnalysis = async () => {
        if (!newAnalysisName.trim()) return;

        try {
            const id = await createVideoAnalysis({
                name: newAnalysisName.trim(),
                clips: [],
                annotations: [],
                videoFileName: '',
                videoDuration: 0,
            });

            setCurrentAnalysisId(id);
            setCurrentAnalysisName(newAnalysisName.trim());
            setShowNewAnalysisDialog(false);
            setShowAnalysisPicker(false);
            setNewAnalysisName("");

            // Reset editor state
            setClips([]);
            setAnnotations([]);
            setVideoFile(null);
            setSelectedClip(null);

            // Refresh the list
            await loadSavedAnalyses();
        } catch (error) {
            console.error('Failed to create analysis:', error);
        }
    };

    // Load a saved analysis
    const handleLoadAnalysis = async (analysis: VideoAnalysis) => {
        if (!analysis.id) return;

        try {
            const fullAnalysis = await getVideoAnalysis(analysis.id);
            if (fullAnalysis) {
                setCurrentAnalysisId(fullAnalysis.id!);
                setCurrentAnalysisName(fullAnalysis.name);
                setClips(fullAnalysis.clips || []);
                setAnnotations(fullAnalysis.annotations || []);
                setVideoFileName(fullAnalysis.videoFileName || '');
                setShowAnalysisPicker(false);

                // Reset video - user will need to upload it
                setVideoFile(null);
                setDuration(fullAnalysis.videoDuration || 0);
            }
        } catch (error) {
            console.error('Failed to load analysis:', error);
        }
    };

    // Auto-save current analysis
    const handleAutoSave = async () => {
        if (!currentAnalysisId) return;

        // Only save if we have valid canvas dimensions (not default)
        if (canvasDimensions.width === 1920 && canvasDimensions.height === 1080 && videoRef.current) {
            // Try to update dimensions first
            updateCanvasDimensions();
        }

        setIsSaving(true);
        try {
            console.log(`Saving with canvas dimensions: ${canvasDimensions.width}x${canvasDimensions.height}`);
            await saveVideoAnalysisData(
                currentAnalysisId,
                clips,
                annotations,
                canvasDimensions.width,
                canvasDimensions.height
            );
            setLastSaved(new Date());
        } catch (error) {
            console.error('Auto-save failed:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Manual save
    const handleManualSave = async () => {
        if (!currentAnalysisId) return;

        setIsSaving(true);
        try {
            await updateVideoAnalysis(currentAnalysisId, {
                name: currentAnalysisName,
                clips,
                annotations,
                videoFileName,
                videoDuration: duration,
                canvasWidth: canvasDimensions.width,
                canvasHeight: canvasDimensions.height,
            });
            setLastSaved(new Date());
        } catch (error) {
            console.error('Save failed:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Delete an analysis
    const handleDeleteAnalysis = async (id: string) => {
        if (!confirm('Are you sure you want to delete this analysis?')) return;

        try {
            await deleteVideoAnalysis(id);
            await loadSavedAnalyses();

            // If deleting current analysis, reset state
            if (id === currentAnalysisId) {
                setCurrentAnalysisId(null);
                setCurrentAnalysisName("");
                setClips([]);
                setAnnotations([]);
                setVideoFile(null);
                setShowAnalysisPicker(true);
            }
        } catch (error) {
            console.error('Failed to delete analysis:', error);
        }
    };

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

    // Handle stage mouse down (start drawing)
    const handleStageMouseDown = (e: any) => {
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

        // Start drawing for other tools
        const stage = e.target.getStage();
        const pos = stage.getPointerPosition();
        setDrawStart(pos);
        setDrawCurrent(pos);
        setIsDrawing(true);
    };

    // Handle stage mouse move (update drawing preview)
    const handleStageMouseMove = (e: any) => {
        if (!isDrawing || !drawStart || activeTool === 'select' || activeTool === 'text') return;

        const stage = e.target.getStage();
        const pos = stage.getPointerPosition();
        setDrawCurrent(pos);
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
            stroke: isPauseSceneMode ? '#ff6b6b' : '#00d4ff', // Red stroke for pause scene annotations
            strokeWidth: 3,
            opacity: 1,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            // Mark as pause scene annotation if in pause scene mode
            isPauseScene: isPauseSceneMode,
            pauseSceneDuration: isPauseSceneMode ? pauseSceneDuration : undefined,
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
        setDrawCurrent(null);
        // Don't switch to select tool if in pause scene mode - allow continuous drawing
        if (!isPauseSceneMode) {
            setActiveTool('select');
        }
    };

    // Get drawing preview props
    const getDrawingPreview = (): {
        type: 'circle' | 'line' | 'arrow' | 'polygon';
        x?: number;
        y?: number;
        radius?: number;
        points?: number[];
        stroke: string;
        strokeWidth: number;
        fill?: string;
        dash: number[];
    } | null => {
        if (!isDrawing || !drawStart || !drawCurrent || activeTool === 'select' || activeTool === 'text') {
            return null;
        }

        const previewColor = '#00d4ff';
        const previewStrokeWidth = 3;

        switch (activeTool) {
            case 'circle': {
                const circleRadius = Math.sqrt(
                    Math.pow(drawCurrent.x - drawStart.x, 2) +
                    Math.pow(drawCurrent.y - drawStart.y, 2)
                );
                return {
                    type: 'circle',
                    x: drawStart.x,
                    y: drawStart.y,
                    radius: Math.max(circleRadius, 5),
                    stroke: previewColor,
                    strokeWidth: previewStrokeWidth,
                    fill: 'transparent',
                    dash: [5, 5],
                };
            }
            case 'spotlight': {
                const spotRadius = Math.sqrt(
                    Math.pow(drawCurrent.x - drawStart.x, 2) +
                    Math.pow(drawCurrent.y - drawStart.y, 2)
                );
                return {
                    type: 'circle',
                    x: drawStart.x,
                    y: drawStart.y,
                    radius: Math.max(spotRadius, 5),
                    stroke: '#fbbf24',
                    strokeWidth: previewStrokeWidth,
                    fill: 'rgba(255, 255, 0, 0.2)',
                    dash: [5, 5],
                };
            }
            case 'line':
                return {
                    type: 'line',
                    points: [drawStart.x, drawStart.y, drawCurrent.x, drawCurrent.y],
                    stroke: previewColor,
                    strokeWidth: previewStrokeWidth,
                    dash: [5, 5],
                };
            case 'arrow':
                return {
                    type: 'arrow',
                    points: [drawStart.x, drawStart.y, drawCurrent.x, drawCurrent.y],
                    stroke: previewColor,
                    strokeWidth: previewStrokeWidth,
                    fill: previewColor,
                    dash: [5, 5],
                };
            case 'connection':
                return {
                    type: 'line',
                    points: [drawStart.x, drawStart.y, drawCurrent.x, drawCurrent.y],
                    stroke: previewColor,
                    strokeWidth: previewStrokeWidth,
                    dash: [8, 4],
                };
            case 'polygon': {
                const polyRadius = Math.sqrt(
                    Math.pow(drawCurrent.x - drawStart.x, 2) +
                    Math.pow(drawCurrent.y - drawStart.y, 2)
                );
                return {
                    type: 'polygon',
                    x: drawStart.x,
                    y: drawStart.y,
                    radius: Math.max(polyRadius, 5),
                    stroke: previewColor,
                    strokeWidth: previewStrokeWidth,
                    fill: 'transparent',
                    dash: [5, 5],
                };
            }
            default:
                return null;
        }
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
                fill: isPauseSceneMode ? '#ff6b6b' : '#ffffff', // Red for pause scene
                stroke: '#000000',
                strokeWidth: 0.5,
                opacity: 1,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                // Mark as pause scene annotation if in pause scene mode
                isPauseScene: isPauseSceneMode,
                pauseSceneDuration: isPauseSceneMode ? pauseSceneDuration : undefined,
            };
            setAnnotations(prev => [...prev, newAnnotation]);
        }
        setTextInput("");
        setShowTextInput(false);
        // Don't switch to select tool if in pause scene mode
        if (!isPauseSceneMode) {
            setActiveTool('select');
        }
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

    // Get visible annotations at current time with smooth transitions
    const getVisibleAnnotations = () => {
        // First, get all annotations that should be visible or are fading
        const FADE_DURATION = 0.5; // Longer fade for smoother effect
        const FADE_MARGIN = 0.1; // Extra margin for fade out completion

        return annotations.filter(ann => {
            // Include annotations that are visible or within fade margin
            return currentTime >= ann.startTime - FADE_MARGIN && currentTime <= ann.endTime + FADE_MARGIN;
        }).map(ann => {
            // Check if this annotation is currently being recorded
            const isBeingRecorded = isRecordingMovement && recordingAnnotationId === ann.id;

            let targetOpacity = ann.opacity || 1;

            // Calculate fade with smooth easing (but not during recording)
            if (!isBeingRecorded) {
                if (currentTime < ann.startTime) {
                    // Not yet visible
                    targetOpacity = 0;
                } else if (currentTime < ann.startTime + FADE_DURATION) {
                    // Fading in - use smootherstep for smooth entrance
                    const fadeProgress = (currentTime - ann.startTime) / FADE_DURATION;
                    targetOpacity *= smootherstep(fadeProgress);
                } else if (currentTime > ann.endTime - FADE_DURATION) {
                    // Fading out - use smootherstep for smooth exit
                    const fadeProgress = (ann.endTime - currentTime) / FADE_DURATION;
                    targetOpacity *= smootherstep(Math.max(0, fadeProgress));
                }
            }

            // Clamp opacity
            targetOpacity = Math.max(0, Math.min(1, targetOpacity));

            // If being recorded, use raw position directly (no interpolation or smoothing)
            if (isBeingRecorded) {
                // Clear smoothed position so it resets after recording
                smoothedPositionsRef.current.delete(ann.id);
                return {
                    ...ann,
                    opacity: targetOpacity
                };
            }

            // Get target position from keyframe interpolation (only when not recording)
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

            // Get or initialize smoothed position
            let smoothed = smoothedPositionsRef.current.get(ann.id);
            if (!smoothed) {
                // Initialize with target values
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
                // Lerp towards target for smooth movement
                smoothed.x = lerp(smoothed.x, targetX, SMOOTHING_FACTOR);
                smoothed.y = lerp(smoothed.y, targetY, SMOOTHING_FACTOR);
                smoothed.opacity = lerp(smoothed.opacity, targetOpacity, SMOOTHING_FACTOR * 1.5); // Faster opacity transition
                smoothed.rotation = lerp(smoothed.rotation, targetRotation, SMOOTHING_FACTOR);
                smoothed.scaleX = lerp(smoothed.scaleX, targetScaleX, SMOOTHING_FACTOR);
                smoothed.scaleY = lerp(smoothed.scaleY, targetScaleY, SMOOTHING_FACTOR);
                smoothedPositionsRef.current.set(ann.id, smoothed);
            }

            return {
                ...ann,
                x: smoothed.x,
                y: smoothed.y,
                opacity: smoothed.opacity,
                rotation: smoothed.rotation,
                scaleX: smoothed.scaleX,
                scaleY: smoothed.scaleY
            };
        }).filter(ann => ann.opacity > 0.01); // Filter out fully faded annotations
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
            wasDraggingRef.current = false; // Reset at start, will be set true if actual drag happens
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
            wasDraggingRef.current = true; // Mark as dragging during resize
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
                // Mark as dragged if moved more than 3 pixels
                if (Math.abs(deltaX) > 3) {
                    wasDraggingRef.current = true;
                }
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

        // Handle annotation resizing
        if (resizingAnnotation) {
            wasDraggingRef.current = true; // Mark as dragging during resize
            setAnnotations(prev => prev.map(ann => {
                if (ann.id === resizingAnnotation.id) {
                    if (resizingAnnotation.edge === 'start') {
                        const newStartTime = Math.max(0, Math.min(newTime, ann.endTime - 0.5));
                        return { ...ann, startTime: newStartTime };
                    } else {
                        const newEndTime = Math.max(ann.startTime + 0.5, Math.min(newTime, duration));
                        return { ...ann, endTime: newEndTime };
                    }
                }
                return ann;
            }));
        }

        // Handle annotation dragging
        if (draggingAnnotation) {
            const ann = annotations.find(a => a.id === draggingAnnotation.id);
            if (ann) {
                const annDuration = ann.endTime - ann.startTime;
                const deltaX = e.clientX - draggingAnnotation.startX;
                // Mark as dragged if moved more than 3 pixels
                if (Math.abs(deltaX) > 3) {
                    wasDraggingRef.current = true;
                }
                const deltaTime = (deltaX / rect.width) * visibleDuration;
                const newStartTime = Math.max(0, Math.min(duration - annDuration, draggingAnnotation.originalStartTime + deltaTime));
                const newEndTime = newStartTime + annDuration;

                setAnnotations(prev => prev.map(a =>
                    a.id === draggingAnnotation.id
                        ? { ...a, startTime: newStartTime, endTime: newEndTime }
                        : a
                ));
            }
        }
    };

    // Handle mouse up
    const handleMouseUp = () => {
        setResizingClip(null);
        setDraggingClip(null);
        setIsDraggingPlayhead(false);
        setResizingAnnotation(null);
        setDraggingAnnotation(null);
    };

    // Toggle layer visibility
    const toggleLayerVisibility = (layerId: string) => {
        setLayers(prev => prev.map(layer =>
            layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
        ));
    };

    // Toggle layer expanded
    const toggleLayerExpanded = (layerId: string) => {
        setLayers(prev => prev.map(layer =>
            layer.id === layerId ? { ...layer, expanded: !layer.expanded } : layer
        ));
    };

    // Handle annotation resize start
    const handleAnnotationResizeStart = (annotationId: string, edge: 'start' | 'end', e: React.MouseEvent) => {
        e.stopPropagation();
        setResizingAnnotation({ id: annotationId, edge });
    };

    // Handle annotation drag start
    const handleAnnotationDragStart = (annotationId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const ann = annotations.find(a => a.id === annotationId);
        if (ann) {
            wasDraggingRef.current = false; // Reset at start, will be set true if actual drag happens
            setDraggingAnnotation({
                id: annotationId,
                startX: e.clientX,
                originalStartTime: ann.startTime
            });
            setSelectedAnnotationId(annotationId);
        }
    };

    // Get layer icon
    const getLayerIcon = (iconType: string) => {
        const iconMap: Record<string, React.ReactNode> = {
            clips: Icons.clips,
            text: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M4 7V4h16v3" /><path d="M12 4v16" /><path d="M8 20h8" /></svg>,
            circle: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /></svg>,
            spotlight: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.3" /><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83" /></svg>,
            line: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="19" x2="19" y2="5" /></svg>,
            connection: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="6" r="3" /><circle cx="18" cy="18" r="3" /><path d="M8.5 8.5L15.5 15.5" strokeDasharray="3 3" /></svg>,
            arrow: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
            polygon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" /></svg>,
        };
        return iconMap[iconType] || Icons.clips;
    };

    // Get annotations for a specific layer
    const getAnnotationsForLayer = (layerType: string) => {
        return annotations.filter(ann => ann.type === layerType);
    };

    // Open properties panel for timeline item
    const openPropertiesPanel = useCallback((type: 'clip' | 'annotation', id: string) => {
        setPropertiesPanelItem({ type, id });
        setShowPropertiesPanel(true);
        if (type === 'clip') {
            setSelectedClip(id);
        } else {
            setSelectedAnnotationId(id);
        }
    }, []);

    // Close properties panel
    const closePropertiesPanel = useCallback(() => {
        setShowPropertiesPanel(false);
        setPropertiesPanelItem(null);
    }, []);

    // Open context menu for timeline item
    const openContextMenu = useCallback((e: React.MouseEvent, type: 'clip' | 'annotation', id: string) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({
            show: true,
            x: e.clientX,
            y: e.clientY,
            type,
            id
        });
        // Select the item
        if (type === 'clip') {
            setSelectedClip(id);
        } else {
            setSelectedAnnotationId(id);
        }
    }, []);

    // Close context menu
    const closeContextMenu = useCallback(() => {
        setContextMenu(null);
    }, []);

    // Handle context menu edit action
    const handleContextMenuEdit = useCallback(() => {
        if (contextMenu) {
            openPropertiesPanel(contextMenu.type, contextMenu.id);
            closeContextMenu();
        }
    }, [contextMenu, openPropertiesPanel, closeContextMenu]);

    // Enter Pause Scene mode
    const enterPauseSceneMode = useCallback(() => {
        if (!videoFile || isPauseSceneMode) return;

        // Pause the video
        if (videoRef.current && isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
        }

        setIsPauseSceneMode(true);
        setPauseSceneStartTime(currentTime);
    }, [videoFile, isPauseSceneMode, isPlaying, currentTime]);

    // Exit Pause Scene mode
    const exitPauseSceneMode = useCallback(() => {
        setIsPauseSceneMode(false);
        setPauseSceneStartTime(null);
    }, []);

    // Create pause scene annotation
    const createPauseSceneAnnotation = useCallback((annotation: Omit<Annotation, 'isPauseScene' | 'pauseSceneDuration'>) => {
        const pauseSceneAnnotation: Annotation = {
            ...annotation,
            isPauseScene: true,
            pauseSceneDuration: pauseSceneDuration,
        };
        setAnnotations(prev => [...prev, pauseSceneAnnotation]);
        return pauseSceneAnnotation;
    }, [pauseSceneDuration]);

    // Handle context menu delete action
    const handleContextMenuDelete = useCallback(() => {
        if (contextMenu) {
            if (contextMenu.type === 'clip') {
                deleteClip(contextMenu.id);
            } else {
                deleteAnnotation(contextMenu.id);
            }
            closeContextMenu();
        }
    }, [contextMenu, closeContextMenu]);

    // Handle context menu jump to start action
    const handleContextMenuJumpToStart = useCallback(() => {
        if (contextMenu) {
            const item = contextMenu.type === 'clip'
                ? clips.find(c => c.id === contextMenu.id)
                : annotations.find(a => a.id === contextMenu.id);
            if (item) {
                seekTo(item.startTime);
            }
            closeContextMenu();
        }
    }, [contextMenu, clips, annotations, seekTo, closeContextMenu]);

    // Close context menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            if (contextMenu?.show) {
                closeContextMenu();
            }
        };

        if (contextMenu?.show) {
            document.addEventListener('click', handleClickOutside);
            document.addEventListener('contextmenu', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('contextmenu', handleClickOutside);
        };
    }, [contextMenu?.show, closeContextMenu]);

    // Get current properties panel item data
    const getPropertiesPanelData = () => {
        if (!propertiesPanelItem) return null;
        if (propertiesPanelItem.type === 'clip') {
            return clips.find(c => c.id === propertiesPanelItem.id);
        } else {
            return annotations.find(a => a.id === propertiesPanelItem.id);
        }
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

            // Ctrl+Shift to enter/exit Pause Scene mode
            if (e.ctrlKey && e.shiftKey && !e.code.startsWith('Arrow')) {
                e.preventDefault();
                if (isPauseSceneMode) {
                    exitPauseSceneMode();
                } else {
                    enterPauseSceneMode();
                }
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
                if (isPauseSceneMode) {
                    exitPauseSceneMode();
                } else if (contextMenu?.show) {
                    closeContextMenu();
                } else if (showPropertiesPanel) {
                    closePropertiesPanel();
                } else {
                    setActiveTool('select');
                    setSelectedAnnotationId(null);
                    setShowTextInput(false);
                    setTextInput("");
                    transformerRef.current?.nodes([]);
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [videoFile, currentTime, zoomLevel, timelineScroll, duration, selectedAnnotationId, togglePlayPause, skip, createClip, deleteAnnotation, showPropertiesPanel, closePropertiesPanel, contextMenu, closeContextMenu, isPauseSceneMode, enterPauseSceneMode, exitPauseSceneMode]);

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
            {/* Analysis Picker Modal */}
            <AnimatePresence>
                {showAnalysisPicker && (
                    <motion.div
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="w-full max-w-2xl bg-[#12121a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-white/10">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400">
                                        {Icons.database}
                                    </div>
                                    <h2 className="text-xl font-bold">Video Analysis Library</h2>
                                </div>
                                <p className="text-gray-400 text-sm">Select an existing analysis to continue editing or create a new one</p>
                            </div>

                            {/* Content */}
                            <div className="p-6 max-h-[400px] overflow-y-auto custom-scrollbar">
                                {isLoadingAnalyses ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="flex items-center gap-3 text-gray-400">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            >
                                                {Icons.spinner}
                                            </motion.div>
                                            Loading analyses...
                                        </div>
                                    </div>
                                ) : savedAnalyses.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center text-gray-600">
                                            {Icons.folderOpen}
                                        </div>
                                        <p className="text-gray-500 mb-2">No saved analyses yet</p>
                                        <p className="text-gray-600 text-sm">Create your first video analysis to get started</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {savedAnalyses.map((analysis, index) => (
                                            <motion.div
                                                key={analysis.id}
                                                className="group p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-500/30 rounded-xl cursor-pointer transition-all"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                onClick={() => handleLoadAnalysis(analysis)}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
                                                        {Icons.fileVideo}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-white truncate">{analysis.name}</h3>
                                                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                                            {analysis.videoFileName && (
                                                                <span className="truncate max-w-[200px]">📹 {analysis.videoFileName}</span>
                                                            )}
                                                            <span>{analysis.clips?.length || 0} clips</span>
                                                            <span>{analysis.annotations?.length || 0} annotations</span>
                                                        </div>
                                                    </div>
                                                    <motion.button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteAnalysis(analysis.id!);
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-all"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        {Icons.trash}
                                                    </motion.button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-white/10 bg-white/[0.02]">
                                <motion.button
                                    onClick={() => setShowNewAnalysisDialog(true)}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl font-semibold shadow-lg shadow-cyan-500/20 transition-all"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {Icons.plus}
                                    Create New Analysis
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* New Analysis Dialog */}
            <AnimatePresence>
                {showNewAnalysisDialog && (
                    <motion.div
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="w-full max-w-md bg-[#12121a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                        >
                            <div className="p-6">
                                <h2 className="text-xl font-bold mb-4">Create New Analysis</h2>
                                <input
                                    type="text"
                                    value={newAnalysisName}
                                    onChange={(e) => setNewAnalysisName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleCreateNewAnalysis();
                                        if (e.key === 'Escape') {
                                            setShowNewAnalysisDialog(false);
                                            setNewAnalysisName("");
                                        }
                                    }}
                                    placeholder="Analysis name (e.g., Match vs Team A)"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                                    autoFocus
                                />
                                <div className="flex gap-3 mt-4">
                                    <motion.button
                                        onClick={handleCreateNewAnalysis}
                                        disabled={!newAnalysisName.trim()}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold transition-all"
                                        whileHover={{ scale: newAnalysisName.trim() ? 1.02 : 1 }}
                                        whileTap={{ scale: newAnalysisName.trim() ? 0.98 : 1 }}
                                    >
                                        Create
                                    </motion.button>
                                    <motion.button
                                        onClick={() => {
                                            setShowNewAnalysisDialog(false);
                                            setNewAnalysisName("");
                                        }}
                                        className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold transition-all"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        Cancel
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Properties Panel - Side Popup */}
            <AnimatePresence>
                {showPropertiesPanel && propertiesPanelItem && (
                    <motion.div
                        className="fixed inset-0 z-50 flex justify-end"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Backdrop */}
                        <motion.div
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={closePropertiesPanel}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />

                        {/* Panel */}
                        <motion.div
                            className="relative w-96 max-w-full bg-[#12121a] border-l border-white/10 shadow-2xl overflow-y-auto"
                            initial={{ x: 400 }}
                            animate={{ x: 0 }}
                            exit={{ x: 400 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            {/* Header */}
                            <div className="sticky top-0 bg-[#12121a]/95 backdrop-blur-sm border-b border-white/10 p-4 flex items-center justify-between z-10">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${propertiesPanelItem.type === 'clip' ? 'bg-blue-500/20 text-blue-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                                        {propertiesPanelItem.type === 'clip' ? Icons.clips : getLayerIcon(annotations.find(a => a.id === propertiesPanelItem.id)?.type || 'circle')}
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white">
                                            {propertiesPanelItem.type === 'clip' ? 'Edit Clip' : 'Edit Annotation'}
                                        </h2>
                                        <p className="text-xs text-gray-500">
                                            {propertiesPanelItem.type === 'clip'
                                                ? clips.find(c => c.id === propertiesPanelItem.id)?.name
                                                : annotations.find(a => a.id === propertiesPanelItem.id)?.type}
                                        </p>
                                    </div>
                                </div>
                                <motion.button
                                    onClick={closePropertiesPanel}
                                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    {Icons.x}
                                </motion.button>
                            </div>

                            {/* Content */}
                            <div className="p-4 space-y-6">
                                {propertiesPanelItem.type === 'clip' ? (
                                    // Clip Properties
                                    (() => {
                                        const clip = clips.find(c => c.id === propertiesPanelItem.id);
                                        if (!clip) return null;
                                        return (
                                            <>
                                                {/* Clip Name */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Clip Name</label>
                                                    <input
                                                        type="text"
                                                        value={clip.name}
                                                        onChange={(e) => updateClip(clip.id, { name: e.target.value })}
                                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                                                    />
                                                </div>

                                                {/* Duration Section */}
                                                <div className="space-y-3">
                                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                                        {Icons.clock}
                                                        Duration
                                                    </label>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-1.5">
                                                            <label className="text-xs text-gray-500">Start Time (s)</label>
                                                            <input
                                                                type="number"
                                                                value={clip.startTime.toFixed(2)}
                                                                onChange={(e) => {
                                                                    const value = parseFloat(e.target.value);
                                                                    if (!isNaN(value) && value >= 0 && value < clip.endTime) {
                                                                        updateClip(clip.id, {
                                                                            startTime: value,
                                                                            duration: clip.endTime - value
                                                                        });
                                                                    }
                                                                }}
                                                                min={0}
                                                                max={clip.endTime - 0.1}
                                                                step={0.1}
                                                                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="text-xs text-gray-500">End Time (s)</label>
                                                            <input
                                                                type="number"
                                                                value={clip.endTime.toFixed(2)}
                                                                onChange={(e) => {
                                                                    const value = parseFloat(e.target.value);
                                                                    if (!isNaN(value) && value > clip.startTime && value <= duration) {
                                                                        updateClip(clip.id, {
                                                                            endTime: value,
                                                                            duration: value - clip.startTime
                                                                        });
                                                                    }
                                                                }}
                                                                min={clip.startTime + 0.1}
                                                                max={duration}
                                                                step={0.1}
                                                                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Duration Display */}
                                                    <div className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg">
                                                        <span className="text-xs text-gray-500">Total Duration</span>
                                                        <span className="text-sm font-mono text-cyan-400">{clip.duration.toFixed(2)}s</span>
                                                    </div>

                                                    {/* Quick Duration Buttons */}
                                                    <div className="flex gap-2">
                                                        {[5, 10, 15, 20, 30].map((dur) => (
                                                            <motion.button
                                                                key={dur}
                                                                onClick={() => {
                                                                    const newEndTime = Math.min(clip.startTime + dur, duration);
                                                                    updateClip(clip.id, {
                                                                        endTime: newEndTime,
                                                                        duration: newEndTime - clip.startTime
                                                                    });
                                                                }}
                                                                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${Math.abs(clip.duration - dur) < 0.5
                                                                    ? 'bg-cyan-500/30 text-cyan-400 border border-cyan-500/50'
                                                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-transparent'
                                                                    }`}
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                            >
                                                                {dur}s
                                                            </motion.button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Description */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</label>
                                                    <textarea
                                                        value={clip.description || ''}
                                                        onChange={(e) => updateClip(clip.id, { description: e.target.value })}
                                                        placeholder="Add a description..."
                                                        rows={3}
                                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 resize-none focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                                                    />
                                                </div>

                                                {/* Jump to clip */}
                                                <motion.button
                                                    onClick={() => seekTo(clip.startTime)}
                                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-all"
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    {Icons.play}
                                                    Jump to Start
                                                </motion.button>

                                                {/* Delete */}
                                                <motion.button
                                                    onClick={() => {
                                                        deleteClip(clip.id);
                                                        closePropertiesPanel();
                                                    }}
                                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-sm font-medium transition-all"
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    {Icons.trash}
                                                    Delete Clip
                                                </motion.button>
                                            </>
                                        );
                                    })()
                                ) : (
                                    // Annotation Properties
                                    (() => {
                                        const ann = annotations.find(a => a.id === propertiesPanelItem.id);
                                        if (!ann) return null;
                                        return (
                                            <>
                                                {/* Type indicator */}
                                                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                                                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${ann.fill || ann.stroke}20` }}>
                                                        {getLayerIcon(ann.type)}
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-medium text-white capitalize">{ann.type}</span>
                                                        <p className="text-xs text-gray-500">Annotation Tool</p>
                                                    </div>
                                                </div>

                                                {/* Colors Section */}
                                                <div className="space-y-3">
                                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <circle cx="12" cy="12" r="10" />
                                                            <circle cx="12" cy="12" r="4" fill="currentColor" />
                                                        </svg>
                                                        Colors
                                                    </label>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        {/* Fill Color */}
                                                        <div className="space-y-1.5">
                                                            <label className="text-xs text-gray-500">Fill Color</label>
                                                            <div className="relative">
                                                                <input
                                                                    type="color"
                                                                    value={ann.fill === 'transparent' ? '#000000' : (ann.fill || '#00d4ff')}
                                                                    onChange={(e) => updateAnnotation(ann.id, { fill: e.target.value })}
                                                                    className="w-full h-12 rounded-lg cursor-pointer border-2 border-white/10 hover:border-white/30 transition-colors"
                                                                />
                                                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                                                    <span className="text-[10px] font-mono text-white/70 bg-black/50 px-1.5 py-0.5 rounded">
                                                                        {ann.fill === 'transparent' ? 'None' : (ann.fill || '#00d4ff').toUpperCase()}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <motion.button
                                                                onClick={() => updateAnnotation(ann.id, { fill: 'transparent' })}
                                                                className="w-full py-1.5 text-xs bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 transition-all"
                                                                whileTap={{ scale: 0.95 }}
                                                            >
                                                                No Fill
                                                            </motion.button>
                                                        </div>

                                                        {/* Stroke Color */}
                                                        <div className="space-y-1.5">
                                                            <label className="text-xs text-gray-500">Stroke Color</label>
                                                            <div className="relative">
                                                                <input
                                                                    type="color"
                                                                    value={ann.stroke || '#00d4ff'}
                                                                    onChange={(e) => updateAnnotation(ann.id, { stroke: e.target.value })}
                                                                    className="w-full h-12 rounded-lg cursor-pointer border-2 border-white/10 hover:border-white/30 transition-colors"
                                                                />
                                                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                                                    <span className="text-[10px] font-mono text-white/70 bg-black/50 px-1.5 py-0.5 rounded">
                                                                        {(ann.stroke || '#00d4ff').toUpperCase()}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Color Presets */}
                                                    <div className="space-y-1.5">
                                                        <label className="text-xs text-gray-500">Quick Colors</label>
                                                        <div className="flex gap-2 flex-wrap">
                                                            {[
                                                                '#00d4ff', '#3b82f6', '#8b5cf6', '#ec4899',
                                                                '#ef4444', '#f97316', '#fbbf24', '#22c55e',
                                                                '#ffffff', '#000000'
                                                            ].map((color) => (
                                                                <motion.button
                                                                    key={color}
                                                                    onClick={() => updateAnnotation(ann.id, { fill: color, stroke: color })}
                                                                    className="w-8 h-8 rounded-lg border-2 border-white/20 hover:border-white/50 hover:scale-110 transition-all"
                                                                    style={{ backgroundColor: color }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    title={color}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Stroke Width */}
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Stroke Width</label>
                                                        <span className="text-sm font-mono text-cyan-400">{ann.strokeWidth || 3}px</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min={0}
                                                        max={20}
                                                        step={1}
                                                        value={ann.strokeWidth || 3}
                                                        onChange={(e) => updateAnnotation(ann.id, { strokeWidth: parseInt(e.target.value) })}
                                                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                                    />
                                                </div>

                                                {/* Opacity */}
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Opacity</label>
                                                        <span className="text-sm font-mono text-cyan-400">{Math.round((ann.opacity || 1) * 100)}%</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min={0}
                                                        max={1}
                                                        step={0.05}
                                                        value={ann.opacity || 1}
                                                        onChange={(e) => updateAnnotation(ann.id, { opacity: parseFloat(e.target.value) })}
                                                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                                    />
                                                </div>

                                                {/* Duration Section */}
                                                <div className="space-y-3">
                                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                                        {Icons.clock}
                                                        Duration
                                                    </label>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-1.5">
                                                            <label className="text-xs text-gray-500">Start Time (s)</label>
                                                            <input
                                                                type="number"
                                                                value={ann.startTime.toFixed(2)}
                                                                onChange={(e) => {
                                                                    const value = parseFloat(e.target.value);
                                                                    if (!isNaN(value) && value >= 0 && value < ann.endTime) {
                                                                        updateAnnotation(ann.id, { startTime: value });
                                                                    }
                                                                }}
                                                                min={0}
                                                                max={ann.endTime - 0.1}
                                                                step={0.1}
                                                                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="text-xs text-gray-500">End Time (s)</label>
                                                            <input
                                                                type="number"
                                                                value={ann.endTime.toFixed(2)}
                                                                onChange={(e) => {
                                                                    const value = parseFloat(e.target.value);
                                                                    if (!isNaN(value) && value > ann.startTime && value <= duration) {
                                                                        updateAnnotation(ann.id, { endTime: value });
                                                                    }
                                                                }}
                                                                min={ann.startTime + 0.1}
                                                                max={duration}
                                                                step={0.1}
                                                                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Duration Display */}
                                                    <div className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg">
                                                        <span className="text-xs text-gray-500">Total Duration</span>
                                                        <span className="text-sm font-mono text-cyan-400">{(ann.endTime - ann.startTime).toFixed(2)}s</span>
                                                    </div>

                                                    {/* Quick Duration Buttons */}
                                                    <div className="flex gap-2">
                                                        {[2, 3, 5, 10, 15].map((dur) => (
                                                            <motion.button
                                                                key={dur}
                                                                onClick={() => {
                                                                    const newEndTime = Math.min(ann.startTime + dur, duration);
                                                                    updateAnnotation(ann.id, { endTime: newEndTime });
                                                                }}
                                                                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${Math.abs((ann.endTime - ann.startTime) - dur) < 0.5
                                                                    ? 'bg-cyan-500/30 text-cyan-400 border border-cyan-500/50'
                                                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-transparent'
                                                                    }`}
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                            >
                                                                {dur}s
                                                            </motion.button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Text content (for text annotations) */}
                                                {ann.type === 'text' && (
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Text Content</label>
                                                        <input
                                                            type="text"
                                                            value={ann.text || ''}
                                                            onChange={(e) => updateAnnotation(ann.id, { text: e.target.value })}
                                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                                                        />
                                                        <div className="space-y-2">
                                                            <label className="text-xs text-gray-500">Font Size</label>
                                                            <input
                                                                type="range"
                                                                min={12}
                                                                max={72}
                                                                value={ann.fontSize || 24}
                                                                onChange={(e) => updateAnnotation(ann.id, { fontSize: parseInt(e.target.value) })}
                                                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                                            />
                                                            <div className="text-right text-xs text-gray-400">{ann.fontSize || 24}px</div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Pause Scene settings */}
                                                <div className="space-y-3">
                                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-red-400">
                                                            <rect x="6" y="4" width="4" height="16" rx="1" />
                                                            <rect x="14" y="4" width="4" height="16" rx="1" />
                                                        </svg>
                                                        Pause Scene
                                                    </label>

                                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm text-gray-300">Pause on appear</span>
                                                            {ann.isPauseScene && (
                                                                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-red-500/20 text-red-400 rounded">
                                                                    {ann.pauseSceneDuration || 3}s
                                                                </span>
                                                            )}
                                                        </div>
                                                        <motion.button
                                                            onClick={() => updateAnnotation(ann.id, {
                                                                isPauseScene: !ann.isPauseScene,
                                                                pauseSceneDuration: ann.isPauseScene ? undefined : 3
                                                            })}
                                                            className={`relative w-12 h-6 rounded-full transition-colors ${ann.isPauseScene ? 'bg-red-500' : 'bg-white/20'
                                                                }`}
                                                            whileTap={{ scale: 0.95 }}
                                                        >
                                                            <motion.div
                                                                className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow"
                                                                animate={{ x: ann.isPauseScene ? 24 : 0 }}
                                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                            />
                                                        </motion.button>
                                                    </div>

                                                    {ann.isPauseScene && (
                                                        <div className="space-y-2">
                                                            <label className="text-xs text-gray-500">Pause Duration</label>
                                                            <div className="flex gap-2">
                                                                {[1, 2, 3, 5, 10].map((dur) => (
                                                                    <motion.button
                                                                        key={dur}
                                                                        onClick={() => updateAnnotation(ann.id, { pauseSceneDuration: dur })}
                                                                        className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${ann.pauseSceneDuration === dur
                                                                            ? 'bg-red-500/30 text-red-400 border border-red-500/50'
                                                                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-transparent'
                                                                            }`}
                                                                        whileHover={{ scale: 1.05 }}
                                                                        whileTap={{ scale: 0.95 }}
                                                                    >
                                                                        {dur}s
                                                                    </motion.button>
                                                                ))}
                                                            </div>
                                                            <p className="text-[10px] text-gray-600">
                                                                Video will pause for this duration when annotation appears in preview
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Keyframes info */}
                                                {ann.keyframes && ann.keyframes.length > 0 && (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                                                <motion.div
                                                                    className="w-2 h-2 rounded-full bg-red-400"
                                                                    animate={{ scale: [1, 1.2, 1] }}
                                                                    transition={{ duration: 1, repeat: Infinity }}
                                                                />
                                                                Motion Recording
                                                            </label>
                                                            <span className="text-xs text-purple-400">{ann.keyframes.length} keyframes</span>
                                                        </div>
                                                        <motion.button
                                                            onClick={() => clearKeyframes(ann.id)}
                                                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-xs font-medium transition-all"
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                        >
                                                            {Icons.trash}
                                                            Clear Keyframes
                                                        </motion.button>
                                                    </div>
                                                )}

                                                {/* Jump to annotation */}
                                                <motion.button
                                                    onClick={() => seekTo(ann.startTime)}
                                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-all"
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    {Icons.play}
                                                    Jump to Start
                                                </motion.button>

                                                {/* Delete */}
                                                <motion.button
                                                    onClick={() => {
                                                        deleteAnnotation(ann.id);
                                                        closePropertiesPanel();
                                                    }}
                                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-sm font-medium transition-all"
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    {Icons.trash}
                                                    Delete Annotation
                                                </motion.button>
                                            </>
                                        );
                                    })()
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Context Menu */}
            <AnimatePresence>
                {contextMenu?.show && (
                    <motion.div
                        className="fixed z-[60] min-w-[180px] bg-[#1a1a24] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                        style={{
                            left: contextMenu.x,
                            top: contextMenu.y,
                        }}
                        initial={{ opacity: 0, scale: 0.9, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                        transition={{ duration: 0.15 }}
                    >
                        {/* Header */}
                        <div className="px-3 py-2 border-b border-white/10 bg-white/5">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                {contextMenu.type === 'clip' ? 'Clip Options' : 'Annotation Options'}
                            </span>
                        </div>

                        {/* Menu Items */}
                        <div className="py-1">
                            {/* Edit */}
                            <motion.button
                                onClick={handleContextMenuEdit}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white hover:bg-cyan-500/20 transition-colors"
                                whileHover={{ x: 2 }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                                Edit Properties
                            </motion.button>

                            {/* Jump to Start */}
                            <motion.button
                                onClick={handleContextMenuJumpToStart}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white hover:bg-white/10 transition-colors"
                                whileHover={{ x: 2 }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-blue-400">
                                    <polygon points="5 3 19 12 5 21 5 3" />
                                </svg>
                                Jump to Start
                            </motion.button>

                            {/* Duplicate (for annotations only) */}
                            {contextMenu.type === 'annotation' && (
                                <motion.button
                                    onClick={() => {
                                        const ann = annotations.find(a => a.id === contextMenu.id);
                                        if (ann) {
                                            const newAnn: Annotation = {
                                                ...ann,
                                                id: `ann_${Date.now()}`,
                                                x: ann.x + 20,
                                                y: ann.y + 20,
                                            };
                                            setAnnotations(prev => [...prev, newAnn]);
                                        }
                                        closeContextMenu();
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white hover:bg-white/10 transition-colors"
                                    whileHover={{ x: 2 }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                    </svg>
                                    Duplicate
                                </motion.button>
                            )}

                            {/* Divider */}
                            <div className="my-1 border-t border-white/10" />

                            {/* Delete */}
                            <motion.button
                                onClick={handleContextMenuDelete}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/20 transition-colors"
                                whileHover={{ x: 2 }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                                Delete
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                    <div className="flex items-center gap-4">
                        <motion.button
                            onClick={() => setShowAnalysisPicker(true)}
                            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Back to Library"
                        >
                            {Icons.folderOpen}
                        </motion.button>
                        <div>
                            <h1 className="text-lg font-semibold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                {currentAnalysisName || "Untitled Analysis"}
                            </h1>
                            {videoFileName && (
                                <p className="text-xs text-gray-500 truncate max-w-[200px]">{videoFileName}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Recording Indicator */}
                        {isRecordingMovement && (
                            <motion.div
                                className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 border border-red-500/50 rounded-lg"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                            >
                                <motion.div
                                    className="w-3 h-3 bg-red-500 rounded-full"
                                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                />
                                <span className="text-red-400 text-sm font-medium">Recording Motion</span>
                            </motion.div>
                        )}

                        {/* Pause Scene Mode Indicator */}
                        {isPauseSceneMode && (
                            <motion.div
                                className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 border border-red-500/50 rounded-lg"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                            >
                                <motion.div
                                    className="w-3 h-3 bg-red-500 rounded-full"
                                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                />
                                <span className="text-red-400 text-sm font-medium">Pause Scene</span>
                                <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] font-mono text-gray-400">Ctrl+Shift</kbd>
                            </motion.div>
                        )}

                        {/* Shift Key Indicator */}
                        {isShiftPressed && !isRecordingMovement && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-lg">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400">
                                    <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
                                </svg>
                                <span className="text-purple-400 text-sm font-medium">Shift + Drag to Record</span>
                            </div>
                        )}

                        {/* Save Status */}
                        {currentAnalysisId && (
                            <div className="flex items-center gap-2 text-sm">
                                {isSaving ? (
                                    <div className="flex items-center gap-2 text-yellow-400">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        >
                                            {Icons.spinner}
                                        </motion.div>
                                        <span>Saving...</span>
                                    </div>
                                ) : lastSaved ? (
                                    <div className="flex items-center gap-2 text-green-400">
                                        {Icons.cloudCheck}
                                        <span>Saved</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-gray-500">
                                        {Icons.cloud}
                                        <span>Not saved</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Manual Save Button */}
                        {currentAnalysisId && (
                            <motion.button
                                onClick={handleManualSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {Icons.save}
                                Save
                            </motion.button>
                        )}

                        {/* Preview Button */}
                        {currentAnalysisId && (
                            <motion.button
                                onClick={() => navigate(`/video-preview/${currentAnalysisId}`)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-sm font-medium transition-all"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
                                </svg>
                                Preview
                            </motion.button>
                        )}

                        <motion.button
                            onClick={() => setShowAnalysisPicker(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-all"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Exit analytics
                            {Icons.x}
                        </motion.button>
                    </div>
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
                                {videoFileName ? (
                                    <>
                                        <span className="text-cyan-400 font-medium">Previously used:</span> {videoFileName}
                                        <br />
                                        <span className="text-gray-600">Upload the same video to continue editing</span>
                                    </>
                                ) : (
                                    "Upload your football match video to start editing"
                                )}
                            </motion.p>

                            {/* Show saved data info */}
                            {(clips.length > 0 || annotations.length > 0) && (
                                <motion.div
                                    className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-sm"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <div className="text-cyan-400 font-medium mb-1">Saved data loaded:</div>
                                    <div className="text-gray-400 flex gap-4 justify-center">
                                        <span>{clips.length} clips</span>
                                        <span>{annotations.length} annotations</span>
                                    </div>
                                </motion.div>
                            )}
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
                                    onMouseDown={handleStageMouseDown}
                                    onTouchStart={handleStageMouseDown}
                                    onMouseMove={handleStageMouseMove}
                                    onTouchMove={handleStageMouseMove}
                                    onMouseUp={handleStageMouseUp}
                                    onTouchEnd={handleStageMouseUp}
                                    onMouseLeave={() => {
                                        if (isDrawing) {
                                            setIsDrawing(false);
                                            setDrawStart(null);
                                            setDrawCurrent(null);
                                        }
                                    }}
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
                                                onDragStart: (e: any) => {
                                                    // Start recording if Shift is pressed
                                                    if (isShiftPressed) {
                                                        startRecordingMovement(ann.id, e.target.x(), e.target.y());
                                                    }
                                                },
                                                onDragMove: (e: any) => {
                                                    // Record keyframe if recording
                                                    if (isRecordingMovement && recordingAnnotationId === ann.id) {
                                                        recordKeyframe(ann.id, e.target.x(), e.target.y(), e.target.rotation());
                                                    }
                                                },
                                                onDragEnd: (e: any) => {
                                                    // Stop recording if active
                                                    if (isRecordingMovement && recordingAnnotationId === ann.id) {
                                                        // Add final keyframe
                                                        recordKeyframe(ann.id, e.target.x(), e.target.y(), e.target.rotation());
                                                        stopRecordingMovement();
                                                    }
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
                                        {/* Drawing Preview */}
                                        {(() => {
                                            const preview = getDrawingPreview();
                                            if (!preview) return null;

                                            if (preview.type === 'circle') {
                                                return (
                                                    <Circle
                                                        x={preview.x}
                                                        y={preview.y}
                                                        radius={preview.radius}
                                                        stroke={preview.stroke}
                                                        strokeWidth={preview.strokeWidth}
                                                        fill={preview.fill}
                                                        dash={preview.dash}
                                                        opacity={0.8}
                                                        listening={false}
                                                    />
                                                );
                                            }
                                            if (preview.type === 'line') {
                                                return (
                                                    <Line
                                                        points={preview.points}
                                                        stroke={preview.stroke}
                                                        strokeWidth={preview.strokeWidth}
                                                        dash={preview.dash}
                                                        lineCap="round"
                                                        opacity={0.8}
                                                        listening={false}
                                                    />
                                                );
                                            }
                                            if (preview.type === 'arrow' && preview.points) {
                                                return (
                                                    <Arrow
                                                        points={preview.points}
                                                        stroke={preview.stroke}
                                                        strokeWidth={preview.strokeWidth}
                                                        fill={preview.fill}
                                                        dash={preview.dash}
                                                        pointerLength={12}
                                                        pointerWidth={12}
                                                        opacity={0.8}
                                                        listening={false}
                                                    />
                                                );
                                            }
                                            if (preview.type === 'polygon' && preview.radius) {
                                                return (
                                                    <RegularPolygon
                                                        x={preview.x!}
                                                        y={preview.y!}
                                                        sides={6}
                                                        radius={preview.radius}
                                                        stroke={preview.stroke}
                                                        strokeWidth={preview.strokeWidth}
                                                        fill={preview.fill}
                                                        dash={preview.dash}
                                                        opacity={0.8}
                                                        listening={false}
                                                    />
                                                );
                                            }
                                            return null;
                                        })()}

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

                            {/* Drawing indicator */}
                            <AnimatePresence>
                                {isDrawing && drawStart && (
                                    <motion.div
                                        className="absolute bottom-4 left-4 px-4 py-2 bg-cyan-500/20 border border-cyan-500/40 rounded-lg backdrop-blur-sm"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                    >
                                        <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium">
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 0.5, repeat: Infinity }}
                                            >
                                                ●
                                            </motion.div>
                                            Drawing {activeTool}... Release to finish
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Active tool indicator */}
                            <AnimatePresence>
                                {activeTool !== 'select' && !isDrawing && !showTextInput && !isPauseSceneMode && (
                                    <motion.div
                                        className="absolute bottom-4 left-4 px-4 py-2 bg-white/10 border border-white/20 rounded-lg backdrop-blur-sm"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                    >
                                        <div className="flex items-center gap-2 text-white text-sm">
                                            <span className="text-cyan-400">{getLayerIcon(activeTool)}</span>
                                            <span className="font-medium capitalize">{activeTool} Tool</span>
                                            <span className="text-gray-400">• Click and drag to draw</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Pause Scene Mode Overlay */}
                            <AnimatePresence>
                                {isPauseSceneMode && (
                                    <motion.div
                                        className="absolute inset-0 pointer-events-none"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        {/* Border glow effect */}
                                        <div className="absolute inset-0 border-4 border-red-500/50 rounded-lg animate-pulse" />

                                        {/* Top banner */}
                                        <motion.div
                                            className="absolute top-4 left-1/2 -translate-x-1/2 px-6 py-3 bg-red-500/90 backdrop-blur-sm rounded-xl shadow-lg shadow-red-500/30 pointer-events-auto"
                                            initial={{ y: -20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <motion.div
                                                    className="w-3 h-3 bg-white rounded-full"
                                                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                                                    transition={{ duration: 1, repeat: Infinity }}
                                                />
                                                <span className="text-white font-semibold">PAUSE SCENE MODE</span>
                                                <span className="text-white/70 text-sm">• Draw annotations for analysis</span>
                                            </div>
                                        </motion.div>

                                        {/* Bottom controls */}
                                        <motion.div
                                            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-[#1a1a24]/95 backdrop-blur-sm border border-white/10 rounded-xl pointer-events-auto"
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                        >
                                            {/* Pause duration control */}
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-400 text-sm">Pause Duration:</span>
                                                <div className="flex items-center gap-1">
                                                    {[1, 2, 3, 5, 10].map((dur) => (
                                                        <motion.button
                                                            key={dur}
                                                            onClick={() => setPauseSceneDuration(dur)}
                                                            className={`px-2 py-1 text-xs font-medium rounded transition-all ${pauseSceneDuration === dur
                                                                ? 'bg-red-500 text-white'
                                                                : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
                                                                }`}
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                        >
                                                            {dur}s
                                                        </motion.button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="w-px h-6 bg-white/10" />

                                            {/* Tool shortcuts */}
                                            <div className="flex items-center gap-2">
                                                {['circle', 'arrow', 'line', 'text'].map((tool) => (
                                                    <motion.button
                                                        key={tool}
                                                        onClick={() => setActiveTool(tool as Tool)}
                                                        className={`p-2 rounded-lg transition-all ${activeTool === tool
                                                            ? 'bg-red-500/30 text-red-400'
                                                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                                            }`}
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        title={tool.charAt(0).toUpperCase() + tool.slice(1)}
                                                    >
                                                        {getLayerIcon(tool)}
                                                    </motion.button>
                                                ))}
                                            </div>

                                            <div className="w-px h-6 bg-white/10" />

                                            {/* Exit button */}
                                            <motion.button
                                                onClick={exitPauseSceneMode}
                                                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm font-medium transition-all"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <span>Done</span>
                                                <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] font-mono">ESC</kbd>
                                            </motion.button>
                                        </motion.div>

                                        {/* Timestamp indicator */}
                                        <motion.div
                                            className="absolute top-4 right-4 px-3 py-2 bg-black/70 backdrop-blur-sm rounded-lg"
                                            initial={{ x: 20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                        >
                                            <div className="text-sm font-mono text-red-400">
                                                ⏸ {formatTime(pauseSceneStartTime || currentTime)}
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

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

                        {/* Timeline with Layers */}
                        <div
                            className="relative select-none flex"
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        >
                            {/* Layer Labels Panel */}
                            <div className="w-48 bg-[#0f0f15] border-r border-white/5 flex-shrink-0">
                                {/* Time ruler label */}
                                <div className="h-8 border-b border-white/5 flex items-center px-3">
                                    <span className="text-[10px] text-gray-500 font-medium">LAYERS</span>
                                </div>

                                {/* Layer rows */}
                                <div className="overflow-y-auto max-h-[300px] custom-scrollbar">
                                    {layers.map((layer, index) => {
                                        const itemCount = layer.type === 'clips'
                                            ? clips.length
                                            : getAnnotationsForLayer(layer.type).length;

                                        return (
                                            <motion.div
                                                key={layer.id}
                                                className={`group border-b border-white/5 transition-colors ${selectedLayerId === layer.id ? 'bg-white/5' : 'hover:bg-white/[0.02]'
                                                    }`}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.03 }}
                                                onClick={() => setSelectedLayerId(layer.id === selectedLayerId ? null : layer.id)}
                                            >
                                                <div className="h-10 flex items-center px-2 gap-1.5">
                                                    {/* Expand/Collapse */}
                                                    <motion.button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleLayerExpanded(layer.id);
                                                        }}
                                                        className="p-1 text-gray-500 hover:text-white transition-colors"
                                                        animate={{ rotate: layer.expanded ? 90 : 0 }}
                                                    >
                                                        {Icons.chevronRight}
                                                    </motion.button>

                                                    {/* Visibility toggle */}
                                                    <motion.button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleLayerVisibility(layer.id);
                                                        }}
                                                        className={`p-1 transition-colors ${layer.visible ? 'text-gray-400 hover:text-white' : 'text-gray-600'
                                                            }`}
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        {layer.visible ? Icons.eye : Icons.eyeOff}
                                                    </motion.button>

                                                    {/* Layer icon & color */}
                                                    <div
                                                        className="w-5 h-5 rounded flex items-center justify-center"
                                                        style={{ backgroundColor: `${layer.color}30`, color: layer.color }}
                                                    >
                                                        {getLayerIcon(layer.icon)}
                                                    </div>

                                                    {/* Layer name */}
                                                    <span className={`text-xs font-medium flex-1 truncate ${layer.visible ? 'text-gray-300' : 'text-gray-600'
                                                        }`}>
                                                        {layer.name}
                                                    </span>

                                                    {/* Item count badge */}
                                                    {itemCount > 0 && (
                                                        <span
                                                            className="px-1.5 py-0.5 text-[10px] font-medium rounded"
                                                            style={{
                                                                backgroundColor: `${layer.color}20`,
                                                                color: layer.color
                                                            }}
                                                        >
                                                            {itemCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Timeline Tracks Panel */}
                            <div className="flex-1 overflow-hidden">
                                {/* Time ruler */}
                                <div className="h-8 border-b border-white/5 relative bg-[#0f0f15]">
                                    <div className="flex justify-between text-[10px] text-gray-500 h-full items-end pb-1 px-2">
                                        {Array.from({ length: 11 }, (_, i) => {
                                            const visibleDuration = duration / zoomLevel;
                                            const time = timelineScroll + (visibleDuration / 10) * i;
                                            return (
                                                <div key={i} className="flex flex-col items-center">
                                                    <span>{formatTime(time)}</span>
                                                    <div className="w-px h-2 bg-white/10 mt-0.5" />
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Time display tooltip */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-cyan-500/20 border border-cyan-500/30 rounded text-[10px] font-mono text-cyan-400">
                                        {formatTime(currentTime)}
                                    </div>
                                </div>

                                {/* Tracks container */}
                                <div
                                    ref={timelineRef}
                                    className="overflow-y-auto max-h-[300px] custom-scrollbar bg-[#1a1a24]"
                                    onWheel={handleWheel}
                                >
                                    {layers.map((layer, layerIndex) => {
                                        const visibleDuration = duration / zoomLevel;
                                        const visibleStart = timelineScroll;
                                        const visibleEnd = timelineScroll + visibleDuration;

                                        // Get items for this layer
                                        const layerItems = layer.type === 'clips'
                                            ? clips.map(clip => ({
                                                id: clip.id,
                                                startTime: clip.startTime,
                                                endTime: clip.endTime,
                                                duration: clip.duration,
                                                name: clip.name,
                                                isClip: true
                                            }))
                                            : getAnnotationsForLayer(layer.type).map(ann => ({
                                                id: ann.id,
                                                startTime: ann.startTime,
                                                endTime: ann.endTime,
                                                duration: ann.endTime - ann.startTime,
                                                name: ann.text || ann.type,
                                                isClip: false
                                            }));

                                        return (
                                            <motion.div
                                                key={layer.id}
                                                className={`relative border-b border-white/5 transition-all ${!layer.visible ? 'opacity-30' : ''
                                                    } ${selectedLayerId === layer.id ? 'bg-white/[0.02]' : ''}`}
                                                style={{
                                                    height: layer.expanded ? (layerItems.length > 0 ? '40px' : '40px') : '0px',
                                                    overflow: 'hidden'
                                                }}
                                                animate={{
                                                    height: layer.expanded ? 40 : 0,
                                                    opacity: layer.expanded ? 1 : 0
                                                }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                {/* Track background grid lines */}
                                                <div className="absolute inset-0 flex pointer-events-none">
                                                    {Array.from({ length: 10 }, (_, i) => (
                                                        <div
                                                            key={i}
                                                            className="flex-1 border-r border-white/[0.03]"
                                                        />
                                                    ))}
                                                </div>

                                                {/* Items on track */}
                                                <AnimatePresence>
                                                    {layer.visible && layerItems.map((item) => {
                                                        if (item.endTime < visibleStart || item.startTime > visibleEnd) {
                                                            return null;
                                                        }

                                                        const leftPercent = ((item.startTime - timelineScroll) / visibleDuration) * 100;
                                                        const widthPercent = (item.duration / visibleDuration) * 100;
                                                        const isSelected = item.isClip
                                                            ? selectedClip === item.id
                                                            : selectedAnnotationId === item.id;

                                                        return (
                                                            <motion.div
                                                                key={item.id}
                                                                className={`absolute top-1 bottom-1 rounded cursor-move group overflow-hidden ${isSelected
                                                                    ? 'ring-2 ring-white/50 shadow-lg'
                                                                    : 'hover:ring-1 hover:ring-white/30'
                                                                    }`}
                                                                style={{
                                                                    left: `${Math.max(0, leftPercent)}%`,
                                                                    width: `${Math.max(2, widthPercent)}%`,
                                                                    backgroundColor: `${layer.color}40`,
                                                                    borderLeft: `2px solid ${layer.color}`,
                                                                    zIndex: isSelected ? 20 : 10
                                                                }}
                                                                initial={{ scale: 0.9, opacity: 0 }}
                                                                animate={{ scale: 1, opacity: 1 }}
                                                                exit={{ scale: 0.9, opacity: 0 }}
                                                                whileHover={{ y: -1 }}
                                                                onMouseDown={(e) => {
                                                                    const target = e.target as HTMLElement;
                                                                    if (!target.classList.contains('resize-handle')) {
                                                                        if (item.isClip) {
                                                                            handleClipDragStart(item.id, e);
                                                                            setSelectedClip(item.id);
                                                                        } else {
                                                                            handleAnnotationDragStart(item.id, e);
                                                                        }
                                                                    }
                                                                }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    // Only select if it was a click, not a drag
                                                                    if (wasDraggingRef.current) {
                                                                        wasDraggingRef.current = false; // Reset for next interaction
                                                                        return;
                                                                    }
                                                                    // Just select the item on click
                                                                    if (item.isClip) {
                                                                        setSelectedClip(item.id);
                                                                        seekTo(item.startTime);
                                                                    } else {
                                                                        setSelectedAnnotationId(item.id);
                                                                        seekTo(item.startTime);
                                                                    }
                                                                }}
                                                                onContextMenu={(e) => {
                                                                    // Right-click to open context menu
                                                                    openContextMenu(e, item.isClip ? 'clip' : 'annotation', item.id);
                                                                }}
                                                            >
                                                                {/* Left resize handle */}
                                                                <div
                                                                    className="resize-handle absolute left-0 top-0 w-1.5 h-full cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    style={{ backgroundColor: layer.color }}
                                                                    onMouseDown={(e) => {
                                                                        if (item.isClip) {
                                                                            handleResizeStart(item.id, 'start', e);
                                                                        } else {
                                                                            handleAnnotationResizeStart(item.id, 'start', e);
                                                                        }
                                                                    }}
                                                                />

                                                                {/* Item content */}
                                                                <div className="flex items-center h-full px-2 pointer-events-none overflow-hidden">
                                                                    <div
                                                                        className="w-4 h-4 rounded flex items-center justify-center shrink-0 mr-1.5"
                                                                        style={{ color: layer.color }}
                                                                    >
                                                                        {getLayerIcon(layer.icon)}
                                                                    </div>
                                                                    <span
                                                                        className="text-[10px] font-medium truncate"
                                                                        style={{ color: layer.color }}
                                                                    >
                                                                        {item.name}
                                                                    </span>
                                                                    {/* Keyframe indicator */}
                                                                    {!item.isClip && annotations.find(a => a.id === item.id)?.keyframes && annotations.find(a => a.id === item.id)!.keyframes!.length > 0 && (
                                                                        <div className="ml-1 flex items-center gap-0.5">
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" title="Has recorded motion" />
                                                                        </div>
                                                                    )}
                                                                    {/* Pause Scene indicator */}
                                                                    {!item.isClip && annotations.find(a => a.id === item.id)?.isPauseScene && (
                                                                        <div className="ml-1 flex items-center gap-0.5" title="Pause Scene - Video will pause here">
                                                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-red-400">
                                                                                <rect x="6" y="4" width="4" height="16" rx="1" />
                                                                                <rect x="14" y="4" width="4" height="16" rx="1" />
                                                                            </svg>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Keyframe dots on timeline item */}
                                                                {!item.isClip && annotations.find(a => a.id === item.id)?.keyframes?.map((kf, idx) => {
                                                                    const ann = annotations.find(a => a.id === item.id)!;
                                                                    const itemDuration = item.endTime - item.startTime;
                                                                    const keyframePosition = ((kf.time - item.startTime) / itemDuration) * 100;
                                                                    if (keyframePosition < 0 || keyframePosition > 100) return null;
                                                                    return (
                                                                        <div
                                                                            key={idx}
                                                                            className="absolute top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-white/80 pointer-events-none"
                                                                            style={{ left: `${keyframePosition}%` }}
                                                                            title={`Keyframe at ${kf.time.toFixed(2)}s`}
                                                                        />
                                                                    );
                                                                })}

                                                                {/* Right resize handle */}
                                                                <div
                                                                    className="resize-handle absolute right-0 top-0 w-1.5 h-full cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    style={{ backgroundColor: layer.color }}
                                                                    onMouseDown={(e) => {
                                                                        if (item.isClip) {
                                                                            handleResizeStart(item.id, 'end', e);
                                                                        } else {
                                                                            handleAnnotationResizeStart(item.id, 'end', e);
                                                                        }
                                                                    }}
                                                                />
                                                            </motion.div>
                                                        );
                                                    })}
                                                </AnimatePresence>

                                                {/* Playhead line for each track */}
                                                <div
                                                    className="absolute top-0 bottom-0 w-0.5 bg-white/80 pointer-events-none z-30"
                                                    style={{
                                                        left: `${((currentTime - timelineScroll) / visibleDuration) * 100}%`,
                                                        display: currentTime >= visibleStart && currentTime <= visibleEnd ? 'block' : 'none'
                                                    }}
                                                />
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                {/* Main Playhead */}
                                <div
                                    className="absolute top-8 bottom-0 w-0.5 bg-white z-40 pointer-events-none"
                                    style={{
                                        left: `calc(192px + ${((currentTime - timelineScroll) / (duration / zoomLevel)) * 100}% * (100% - 192px) / 100%)`,
                                        display: currentTime >= timelineScroll && currentTime <= timelineScroll + (duration / zoomLevel) ? 'block' : 'none'
                                    }}
                                >
                                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-sm rotate-45 shadow-lg" />
                                </div>
                            </div>
                        </div>

                        {/* Timeline scrubber bar */}
                        <div
                            className="h-6 bg-[#0f0f15] border-t border-white/5 flex items-center px-4 cursor-pointer"
                            onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = e.clientX - rect.left;
                                const percentage = x / rect.width;
                                const newTime = percentage * duration;
                                seekTo(Math.max(0, Math.min(duration, newTime)));
                            }}
                        >
                            <div className="flex-1 h-1 bg-white/10 rounded-full relative overflow-hidden">
                                <motion.div
                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                                    style={{ width: `${(currentTime / duration) * 100}%` }}
                                />
                                <motion.div
                                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg cursor-grab active:cursor-grabbing"
                                    style={{ left: `calc(${(currentTime / duration) * 100}% - 6px)` }}
                                    onMouseDown={() => setIsDraggingPlayhead(true)}
                                    whileHover={{ scale: 1.3 }}
                                />
                            </div>
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

                        {/* Pause Scene Info */}
                        <div className="p-4 border-t border-white/5">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-red-400">
                                    <rect x="6" y="4" width="4" height="16" rx="1" />
                                    <rect x="14" y="4" width="4" height="16" rx="1" />
                                </svg>
                                Pause Scene
                            </h3>
                            <div className="text-xs text-gray-500 mb-3">
                                Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-gray-300 font-mono">Ctrl+Shift</kbd> to pause video and draw annotations for analysis (e.g., offside positions).
                            </div>
                            <motion.button
                                onClick={isPauseSceneMode ? exitPauseSceneMode : enterPauseSceneMode}
                                disabled={!videoFile}
                                className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed ${isPauseSceneMode
                                    ? 'bg-red-500/20 border border-red-500/50 text-red-400'
                                    : 'bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300'
                                    }`}
                                whileHover={{ scale: videoFile ? 1.02 : 1 }}
                                whileTap={{ scale: videoFile ? 0.98 : 1 }}
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                    <rect x="6" y="4" width="4" height="16" rx="1" />
                                    <rect x="14" y="4" width="4" height="16" rx="1" />
                                </svg>
                                {isPauseSceneMode ? 'Exit Pause Scene' : 'Enter Pause Scene'}
                            </motion.button>
                        </div>

                        {/* Motion Recording Info */}
                        <div className="p-4 border-t border-white/5">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                                    <circle cx="12" cy="12" r="10" />
                                    <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
                                </svg>
                                Motion Recording
                            </h3>
                            <div className="text-xs text-gray-500 mb-3">
                                Hold <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-gray-300 font-mono">Shift</kbd> while dragging an annotation to record its movement over time.
                            </div>

                            {/* Selected annotation keyframe controls */}
                            {selectedAnnotationId && (
                                <div className="space-y-2">
                                    {(() => {
                                        const selectedAnn = annotations.find(a => a.id === selectedAnnotationId);
                                        if (!selectedAnn) return null;
                                        const hasKeyframes = selectedAnn.keyframes && selectedAnn.keyframes.length > 0;
                                        return (
                                            <>
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-gray-400">Selected: {selectedAnn.type}</span>
                                                    {hasKeyframes && (
                                                        <span className="text-purple-400">
                                                            {selectedAnn.keyframes!.length} keyframes
                                                        </span>
                                                    )}
                                                </div>
                                                {hasKeyframes && (
                                                    <motion.button
                                                        onClick={() => clearKeyframes(selectedAnnotationId)}
                                                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-xs font-medium transition-all"
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                    >
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M3 6h18" />
                                                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                                        </svg>
                                                        Clear All Keyframes
                                                    </motion.button>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            )}
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
