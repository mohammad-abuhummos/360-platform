import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, ReactElement } from "react";
import type { MetaFunction } from "react-router";
import videojs from "video.js";
import type Player from "video.js/dist/types/player";
import "video.js/dist/video-js.css";
import { Stage, Layer, Group, Rect as KonvaRect, Ellipse, Text as KonvaText, Arrow, Transformer } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { Stage as KonvaStage } from "konva/lib/Stage";
import type { Group as KonvaGroup } from "konva/lib/Group";
import type { Transformer as KonvaTransformer } from "konva/lib/shapes/Transformer";
import { create } from "zustand";
import { produce } from "immer";

import { DashboardLayout } from "../components/dashboard-layout";
import { Heading, Subheading } from "../components/heading";
import { Text } from "../components/text";
import { Badge } from "../components/badge";
import { Button } from "../components/button";
import { Divider } from "../components/divider";

const FALLBACK_DURATION_SECONDS = 2 * 60 * 60 + 3 * 60 + 44;
const FPS_OPTIONS = [25, 30, 50] as const;
const PLAYBACK_RATES = [0.25, 0.5, 1, 1.5, 2] as const;

type AnnotationTool = "spotlight" | "rectangle" | "arrow" | "text";

type Annotation = {
    id: string;
    type: AnnotationTool;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
    opacity: number;
    text?: string;
};

type VideoSource = {
    src: string;
    type: string;
    label: string;
};

type GoalShot = {
    id: string;
    label: string;
    start: number;
    end: number;
};

type AnnotationToolDefinition = {
    id: AnnotationTool;
    label: string;
    description: string;
    icon: (props: IconProps) => ReactElement;
};

type IconProps = {
    className?: string;
};

const annotationTools: AnnotationToolDefinition[] = [
    { id: "spotlight", label: "Spotlight", description: "Soft circular glow", icon: SpotlightToolIcon },
    { id: "rectangle", label: "Box", description: "Mark pitch zones", icon: RectangleToolIcon },
    { id: "arrow", label: "Arrow", description: "Point to players", icon: ArrowToolIcon },
    { id: "text", label: "Text", description: "Add notes", icon: TextToolIcon },
];

type AnnotationState = {
    tool: AnnotationTool;
    annotations: Annotation[];
    selectedId: string | null;
    defaults: {
        fill: string;
        stroke: string;
    };
    setTool: (tool: AnnotationTool) => void;
    setDefaults: (partial: Partial<AnnotationState["defaults"]>) => void;
    addAnnotation: (annotation: Annotation) => void;
    updateAnnotation: (id: string, updates: Partial<Annotation> | ((annotation: Annotation) => void)) => void;
    setSelectedId: (id: string | null) => void;
    removeSelected: () => void;
    clearAll: () => void;
};

const useAnnotationStore = create<AnnotationState>()((set) => ({
    tool: "spotlight",
    annotations: [],
    selectedId: null,
    defaults: {
        fill: "#ff7a18",
        stroke: "#ffffff",
    },
    setTool: (tool) => set({ tool }),
    setDefaults: (partial) =>
        set(
            produce<AnnotationState>((state) => {
                state.defaults = { ...state.defaults, ...partial };
            }),
        ),
    addAnnotation: (annotation) =>
        set(
            produce<AnnotationState>((state) => {
                state.annotations.push(annotation);
                state.selectedId = annotation.id;
            }),
        ),
    updateAnnotation: (id, updates) =>
        set(
            produce<AnnotationState>((state) => {
                const target = state.annotations.find((ann) => ann.id === id);
                if (!target) return;
                if (typeof updates === "function") {
                    updates(target);
                } else {
                    Object.assign(target, updates);
                }
            }),
        ),
    setSelectedId: (selectedId) => set({ selectedId }),
    removeSelected: () =>
        set(
            produce<AnnotationState>((state) => {
                if (!state.selectedId) return;
                state.annotations = state.annotations.filter((ann) => ann.id !== state.selectedId);
                state.selectedId = null;
            }),
        ),
    clearAll: () => set({ annotations: [], selectedId: null }),
}));

const createId = () =>
    typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);

function formatTimestamp(seconds: number) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
        return [hrs, mins, secs]
            .map((value, index) => (index === 0 ? value : value.toString().padStart(2, "0")))
            .join(":");
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function clampTime(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

export const meta: MetaFunction = () => [
    { title: "Video analysis · Jordan Knights" },
    { name: "description", content: "Upload a match, tag goal shots, and overlay tactics." },
];

export default function VideoAnalyze() {
    const [videoSource, setVideoSource] = useState<VideoSource | null>(null);
    const [objectUrl, setObjectUrl] = useState<string | null>(null);
    const videoNodeRef = useRef<HTMLVideoElement | null>(null);
    const playerRef = useRef<Player | null>(null);
    const [videoReady, setVideoReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [fps, setFps] = useState<(typeof FPS_OPTIONS)[number]>(FPS_OPTIONS[0]);
    const [playbackRate, setPlaybackRate] = useState<(typeof PLAYBACK_RATES)[number]>(1);
    const [goalShots, setGoalShots] = useState<GoalShot[]>([]);
    const [selectedShotId, setSelectedShotId] = useState<string | null>(null);
    const [urlInput, setUrlInput] = useState("");
    const [stageContainerRef, stageSize] = useElementSize<HTMLDivElement>();
    const safeDuration = duration || FALLBACK_DURATION_SECONDS;
    const clearAnnotations = useAnnotationStore((state) => state.clearAll);

    useEffect(() => {
        if (!videoNodeRef.current) return;

        const player = videojs(videoNodeRef.current, {
            controls: false,
            preload: "auto",
            fluid: true,
            responsive: true,
            fill: true,
        });
        playerRef.current = player;

        const handleLoadedMetadata = () => {
            setDuration(player.duration() || 0);
            setVideoReady(true);
        };
        const handleCanPlay = () => setVideoReady(true);
        const handleTimeUpdate = () => {
            const time = player.currentTime();
            setCurrentTime(typeof time === "number" ? time : 0);
        };
        const handlePlay = () => {
            setIsPlaying(true);
            setVideoReady(true);
        };
        const handlePause = () => setIsPlaying(false);

        player.on("loadedmetadata", handleLoadedMetadata);
        player.on("loadeddata", handleCanPlay);
        player.on("canplay", handleCanPlay);
        player.on("playing", handleCanPlay);
        player.on("timeupdate", handleTimeUpdate);
        player.on("play", handlePlay);
        player.on("pause", handlePause);

        return () => {
            player.off("loadedmetadata", handleLoadedMetadata);
            player.off("loadeddata", handleCanPlay);
            player.off("canplay", handleCanPlay);
            player.off("playing", handleCanPlay);
            player.off("timeupdate", handleTimeUpdate);
            player.off("play", handlePlay);
            player.off("pause", handlePause);
            player.dispose();
            playerRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!playerRef.current || !videoSource) return;
        const player = playerRef.current;
        player.src({ src: videoSource.src, type: videoSource.type });
        player.currentTime(0);
        setCurrentTime(0);
        setDuration(0);
        setVideoReady(false);
        setGoalShots([]);
        setSelectedShotId(null);
        clearAnnotations();
        player.ready(() => setVideoReady(true));
    }, [videoSource, clearAnnotations]);

    useEffect(() => {
        if (!playerRef.current) return;
        playerRef.current.playbackRate(playbackRate);
    }, [playbackRate]);

    useEffect(() => {
        const node = videoNodeRef.current;
        if (!node) return;
        const markReady = () => setVideoReady(true);
        node.addEventListener("loadeddata", markReady);
        node.addEventListener("canplay", markReady);
        node.addEventListener("playing", markReady);
        return () => {
            node.removeEventListener("loadeddata", markReady);
            node.removeEventListener("canplay", markReady);
            node.removeEventListener("playing", markReady);
        };
    }, [videoSource]);

    useEffect(() => {
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [objectUrl]);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
        }
        const url = URL.createObjectURL(file);
        setVideoSource({ src: url, type: file.type || "video/mp4", label: file.name });
        setObjectUrl(url);
    };

    const handleUrlLoad = () => {
        if (!urlInput.trim()) return;
        if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
            setObjectUrl(null);
        }
        setVideoSource({ src: urlInput.trim(), type: "video/mp4", label: urlInput.trim() });
    };

    const resetWorkspace = () => {
        setVideoSource(null);
        setGoalShots([]);
        setSelectedShotId(null);
        setDuration(0);
        setCurrentTime(0);
        setVideoReady(false);
        clearAnnotations();
        if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
            setObjectUrl(null);
        }
    };

    const togglePlayback = () => {
        if (!playerRef.current) return;
        if (playerRef.current.paused()) {
            void playerRef.current.play();
        } else {
            playerRef.current.pause();
        }
    };

    const skipSeconds = useCallback(
        (delta: number) => {
            const player = playerRef.current;
            if (!player) return;
            const current = player.currentTime();
            const next = clampTime((typeof current === "number" ? current : 0) + delta, 0, safeDuration);
            player.currentTime(next);
            setCurrentTime(next);
        },
        [safeDuration],
    );

    const stepFrame = (direction: 1 | -1) => {
        const step = 1 / fps;
        skipSeconds(direction * step);
    };

    const addGoalShot = () => {
        const player = playerRef.current;
        if (!player) return;
        const current = player.currentTime();
        const start = typeof current === "number" ? current : 0;
        setGoalShots((prev) => {
            const newShot: GoalShot = {
                id: createId(),
                label: `Goal shot ${prev.length + 1}`,
                start,
                end: clampTime(start + 20, start + 5, safeDuration),
            };
            setSelectedShotId(newShot.id);
            return [...prev, newShot];
        });
    };

    const updateGoalShot = (id: string, updates: Partial<GoalShot>) => {
        setGoalShots((shots) => shots.map((shot) => (shot.id === id ? { ...shot, ...updates } : shot)));
    };

    const removeGoalShot = (id: string) => {
        setGoalShots((shots) => shots.filter((shot) => shot.id !== id));
        if (selectedShotId === id) {
            setSelectedShotId(null);
        }
    };

    const focusShot = (shot: GoalShot) => {
        setSelectedShotId(shot.id);
        const player = playerRef.current;
        if (!player) return;
        player.currentTime(shot.start);
        void player.play();
    };

    const playbackLabel = useMemo(() => (videoSource ? videoSource.label : "No video loaded"), [videoSource]);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <header className="flex flex-wrap items-center gap-4">
                    <div>
                        <Heading level={1} className="text-3xl font-semibold">
                            Video analysis
                        </Heading>
                        <Text className="text-sm text-zinc-500">Upload your match, tag goal shots, and overlay tactical notes.</Text>
                    </div>
                    {videoSource && (
                        <Badge color="blue" className="ml-auto text-sm">
                            {playbackLabel}
                        </Badge>
                    )}
                    <div className="ml-auto flex gap-2">
                        {videoSource && (
                            <Button outline onClick={resetWorkspace} className="text-sm">
                                Change video
                            </Button>
                        )}
                    </div>
                </header>

                {!videoSource ? (
                    <UploadGate
                        onFileChange={handleFileChange}
                        urlValue={urlInput}
                        onUrlChange={setUrlInput}
                        onUrlLoad={handleUrlLoad}
                    />
                ) : (
                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
                        <section className="space-y-4 rounded-3xl border border-zinc-100 bg-white p-5 shadow-lg">
                            <div className="space-y-3">
                                <Subheading level={2} className="text-xl font-semibold text-zinc-900">
                                    Playback & overlays
                                </Subheading>
                                <Text className="text-sm text-zinc-500">Click on the canvas to drop the active tool. Drag handles to resize or rotate.</Text>
                                <div ref={stageContainerRef} className="relative aspect-video w-full overflow-hidden rounded-2xl border border-zinc-200 bg-black">
                                    <div data-vjs-player className="h-full w-full">
                                        <video ref={videoNodeRef} className="video-js vjs-default-skin h-full w-full" playsInline />
                                    </div>
                                    {stageSize.width > 0 && stageSize.height > 0 && (
                                        <AnnotationStage width={stageSize.width} height={stageSize.height} disabled={!videoReady} />
                                    )}
                                    {!videoReady && (
                                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-zinc-950/30 text-sm font-medium text-white">
                                            Loading frames…
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                                <div className="flex flex-wrap items-center gap-3 text-sm">
                                    <span className="text-zinc-500">FPS</span>
                                    <div className="flex gap-1">
                                        {FPS_OPTIONS.map((option) => (
                                            <button
                                                key={option}
                                                onClick={() => setFps(option)}
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${fps === option ? "bg-zinc-900 text-white" : "bg-white text-zinc-800"}`}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="hidden h-6 w-px bg-zinc-200 lg:block" />
                                    <span className="text-zinc-500">Speed</span>
                                    <div className="flex gap-1">
                                        {PLAYBACK_RATES.map((rate) => (
                                            <button
                                                key={rate}
                                                onClick={() => setPlaybackRate(rate)}
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${playbackRate === rate ? "bg-blue-600 text-white" : "bg-white text-zinc-800"}`}
                                            >
                                                {rate}x
                                            </button>
                                        ))}
                                    </div>
                                    <div className="ml-auto flex items-center gap-2 text-xs text-zinc-500">
                                        <span>{formatTimestamp(currentTime)}</span>
                                        <span>·</span>
                                        <span>{formatTimestamp(safeDuration)}</span>
                                    </div>
                                </div>
                                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold">
                                    <Button plain className="rounded-full border border-zinc-300 px-3 py-1" onClick={() => skipSeconds(-10)}>
                                        −10s
                                    </Button>
                                    <Button color="blue" className="rounded-full px-4 py-1" onClick={togglePlayback}>
                                        {isPlaying ? "Pause" : "Play"}
                                    </Button>
                                    <Button plain className="rounded-full border border-zinc-300 px-3 py-1" onClick={() => skipSeconds(10)}>
                                        +10s
                                    </Button>
                                    <Button plain className="rounded-full border border-zinc-300 px-3 py-1 text-xs" onClick={() => stepFrame(-1)}>
                                        Step ←
                                    </Button>
                                    <Button plain className="rounded-full border border-zinc-300 px-3 py-1 text-xs" onClick={() => stepFrame(1)}>
                                        Step →
                                    </Button>
                                </div>
                            </div>

                            <Divider />

                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Subheading level={3} className="text-lg font-semibold text-zinc-900">
                                        Goal shots timeline
                                    </Subheading>
                                    <Badge color="blue">{goalShots.length}</Badge>
                                    <Button color="blue" className="ml-auto text-sm" onClick={addGoalShot} disabled={!videoReady}>
                                        Add goal shot
                                    </Button>
                                </div>
                                <GoalShotsTimeline
                                    shots={goalShots}
                                    safeDuration={safeDuration}
                                    currentTime={currentTime}
                                    selectedShotId={selectedShotId}
                                    onSelect={focusShot}
                                />
                            </div>
                        </section>

                        <aside className="space-y-4 rounded-3xl border border-zinc-100 bg-white p-6 shadow-lg">
                            <div className="space-y-1">
                                <Subheading level={2} className="text-xl font-semibold text-zinc-900">
                                    Overlay tools
                                </Subheading>
                                <Text className="text-sm text-zinc-500">Pick a tool, then click on the video to drop it.</Text>
                            </div>
                            <ToolPalette />
                            <Divider />
                            <AnnotationInspector />
                            <Divider />
                            <div className="space-y-2">
                                <Subheading level={3} className="text-lg font-semibold text-zinc-900">
                                    Goal shots
                                </Subheading>
                                <GoalShotsList
                                    shots={goalShots}
                                    selectedShotId={selectedShotId}
                                    safeDuration={safeDuration}
                                    onSelect={focusShot}
                                    onUpdate={updateGoalShot}
                                    onRemove={removeGoalShot}
                                />
                            </div>
                        </aside>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

type UploadGateProps = {
    onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
    urlValue: string;
    onUrlChange: (value: string) => void;
    onUrlLoad: () => void;
};

function UploadGate({ onFileChange, urlValue, onUrlChange, onUrlLoad }: UploadGateProps) {
    return (
        <section className="rounded-3xl border border-dashed border-zinc-300 bg-white p-10 text-center shadow-sm">
            <Heading level={2} className="text-2xl font-semibold text-zinc-900">
                Upload a match recording to start editing
            </Heading>
            <Text className="mt-2 text-sm text-zinc-500">We recommend MP4 (H.264) or an HLS URL. Once loaded you can scrub frame-by-frame.</Text>
            <div className="mt-8 flex flex-col items-center gap-4 md:flex-row md:justify-center">
                <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-zinc-200 px-6 py-4 text-sm font-semibold text-zinc-700 shadow-sm">
                    <input type="file" accept="video/*" className="hidden" onChange={onFileChange} />
                    <span>Select video file</span>
                    <Text className="text-xs text-zinc-500">MP4, MOV, MKV…</Text>
                </label>
                <div className="flex flex-1 flex-col gap-2">
                    <input
                        type="url"
                        placeholder="https://example.com/match.m3u8"
                        value={urlValue}
                        onChange={(event) => onUrlChange(event.target.value)}
                        className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm"
                    />
                    <Button color="blue" className="w-full" onClick={onUrlLoad}>
                        Load from URL
                    </Button>
                </div>
            </div>
        </section>
    );
}

type AnnotationStageProps = {
    width: number;
    height: number;
    disabled: boolean;
};

function AnnotationStage({ width, height, disabled }: AnnotationStageProps) {
    const annotations = useAnnotationStore((state) => state.annotations);
    const addAnnotation = useAnnotationStore((state) => state.addAnnotation);
    const selectedId = useAnnotationStore((state) => state.selectedId);
    const setSelectedId = useAnnotationStore((state) => state.setSelectedId);
    const tool = useAnnotationStore((state) => state.tool);
    const defaults = useAnnotationStore((state) => state.defaults);
    const transformerRef = useRef<KonvaTransformer | null>(null);
    const [stage, setStage] = useState<KonvaStage | null>(null);

    useEffect(() => {
        if (!transformerRef.current || !stage) return;
        const node = selectedId ? (stage.findOne(`#${selectedId}`) as KonvaGroup | undefined) : undefined;
        if (node) {
            transformerRef.current.nodes([node]);
        } else {
            transformerRef.current.nodes([]);
        }
        transformerRef.current.getLayer()?.batchDraw();
    }, [selectedId, annotations, stage]);

    const handleStagePointer = (event: KonvaEventObject<MouseEvent | TouchEvent>) => {
        if (disabled) return;
        const clickedId = event.target?.attrs["data-annotation-id"] as string | undefined;
        if (clickedId) {
            setSelectedId(clickedId);
            return;
        }

        if (event.target?.name() !== "background") {
            setSelectedId(null);
            return;
        }

        const pointer = event.target.getStage()?.getPointerPosition();
        if (!pointer) return;

        const baseSize = tool === "text" ? 260 : tool === "arrow" ? 220 : 150;
        const annotation: Annotation = {
            id: createId(),
            type: tool,
            x: pointer.x - baseSize / 2,
            y: pointer.y - baseSize / 2,
            width: baseSize,
            height: tool === "arrow" ? 70 : tool === "spotlight" ? baseSize : baseSize * 0.75,
            rotation: 0,
            fill: defaults.fill,
            stroke: tool === "spotlight" ? "transparent" : defaults.stroke,
            strokeWidth: tool === "spotlight" ? 0 : 3,
            opacity: tool === "spotlight" ? 0.35 : 0.95,
            text: tool === "text" ? "Add text" : undefined,
        };

        addAnnotation(annotation);
    };

    return (
        <Stage
            width={width}
            height={height}
            style={{ position: "absolute", inset: 0 }}
            onMouseDown={(event) => handleStagePointer(event)}
            onTouchStart={(event) => handleStagePointer(event)}
            ref={setStage}
        >
            <Layer>
                <KonvaRect width={width} height={height} fill="rgba(0,0,0,0)" name="background" />
                {annotations.map((annotation) => (
                    <AnnotationShape key={annotation.id} annotation={annotation} isSelected={annotation.id === selectedId} onSelect={() => setSelectedId(annotation.id)} />
                ))}
                <Transformer ref={transformerRef} rotateEnabled={!disabled} />
            </Layer>
        </Stage>
    );
}

type AnnotationShapeProps = {
    annotation: Annotation;
    isSelected: boolean;
    onSelect: () => void;
};

function AnnotationShape({ annotation, onSelect }: AnnotationShapeProps) {
    const updateAnnotation = useAnnotationStore((state) => state.updateAnnotation);
    const shapeRef = useRef<KonvaGroup>(null);

    const handleTransform = () => {
        const node = shapeRef.current;
        if (!node) return;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        const newWidth = Math.max(40, node.width() * scaleX);
        const newHeight = Math.max(30, node.height() * scaleY);
        node.scaleX(1);
        node.scaleY(1);
        updateAnnotation(annotation.id, {
            x: node.x(),
            y: node.y(),
            width: newWidth,
            height: newHeight,
            rotation: node.rotation(),
        });
    };

    return (
        <Group
            ref={shapeRef}
            id={annotation.id}
            data-annotation-id={annotation.id}
            x={annotation.x}
            y={annotation.y}
            width={annotation.width}
            height={annotation.height}
            rotation={annotation.rotation}
            draggable
            onClick={(event) => {
                event.cancelBubble = true;
                onSelect();
            }}
            onTap={(event) => {
                event.cancelBubble = true;
                onSelect();
            }}
            onDragEnd={(event) => {
                updateAnnotation(annotation.id, { x: event.target.x(), y: event.target.y() });
            }}
            onTransformEnd={handleTransform}
        >
            {annotation.type === "rectangle" && (
                <KonvaRect
                    width={annotation.width}
                    height={annotation.height}
                    cornerRadius={16}
                    fill={annotation.fill}
                    opacity={annotation.opacity}
                    stroke={annotation.stroke}
                    strokeWidth={annotation.strokeWidth}
                />
            )}
            {annotation.type === "spotlight" && (
                <Ellipse
                    x={annotation.width / 2}
                    y={annotation.height / 2}
                    radiusX={annotation.width / 2}
                    radiusY={annotation.height / 2}
                    fill={annotation.fill}
                    opacity={annotation.opacity}
                />
            )}
            {annotation.type === "arrow" && (
                <Arrow
                    points={[0, annotation.height / 2, annotation.width, annotation.height / 2]}
                    pointerWidth={Math.max(10, annotation.height)}
                    pointerLength={24}
                    fill={annotation.fill}
                    stroke={annotation.stroke}
                    strokeWidth={annotation.strokeWidth}
                    opacity={annotation.opacity}
                />
            )}
            {annotation.type === "text" && (
                <KonvaText
                    width={annotation.width}
                    text={annotation.text ?? ""}
                    fontSize={24}
                    fontStyle="700"
                    padding={8}
                    fill={annotation.fill}
                    stroke={annotation.stroke}
                    strokeWidth={annotation.strokeWidth}
                    opacity={annotation.opacity}
                />
            )}
        </Group>
    );
}

function ToolPalette() {
    const activeTool = useAnnotationStore((state) => state.tool);
    const setTool = useAnnotationStore((state) => state.setTool);

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {annotationTools.map((tool) => {
                const Icon = tool.icon;
                const isActive = activeTool === tool.id;
                return (
                    <button
                        key={tool.id}
                        onClick={() => setTool(tool.id)}
                        className={`rounded-2xl border px-3 py-3 text-left text-sm font-semibold ${isActive ? "border-blue-500 bg-blue-50 text-blue-900" : "border-zinc-200 text-zinc-700 hover:border-blue-200"
                            }`}
                    >
                        <Icon className="mb-2 size-5" />
                        <div>{tool.label}</div>
                        <p className="text-xs font-normal text-zinc-500">{tool.description}</p>
                    </button>
                );
            })}
        </div>
    );
}

function AnnotationInspector() {
    const selectedId = useAnnotationStore((state) => state.selectedId);
    const annotation = useAnnotationStore((state) => state.annotations.find((ann) => ann.id === selectedId));
    const updateAnnotation = useAnnotationStore((state) => state.updateAnnotation);
    const removeSelected = useAnnotationStore((state) => state.removeSelected);
    const defaults = useAnnotationStore((state) => state.defaults);
    const setDefaults = useAnnotationStore((state) => state.setDefaults);

    if (!annotation) {
        return (
            <div className="space-y-3">
                <Subheading level={3} className="text-base font-semibold text-zinc-900">
                    Tool defaults
                </Subheading>
                <Text className="text-sm text-zinc-500">Choose the fill and stroke colors for the next overlay you add.</Text>
                <div className="flex gap-3">
                    <label className="flex flex-1 flex-col text-xs font-medium text-zinc-500">
                        Fill
                        <input
                            type="color"
                            value={defaults.fill}
                            onChange={(event) => setDefaults({ fill: event.target.value })}
                            className="mt-2 h-10 w-full cursor-pointer rounded-xl border border-zinc-200 bg-white"
                        />
                    </label>
                    <label className="flex flex-1 flex-col text-xs font-medium text-zinc-500">
                        Stroke
                        <input
                            type="color"
                            value={defaults.stroke}
                            onChange={(event) => setDefaults({ stroke: event.target.value })}
                            className="mt-2 h-10 w-full cursor-pointer rounded-xl border border-zinc-200 bg-white"
                        />
                    </label>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <Subheading level={3} className="text-base font-semibold text-zinc-900">
                Overlay settings
            </Subheading>
            <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col text-xs font-medium text-zinc-500">
                    Fill
                    <input
                        type="color"
                        value={annotation.fill}
                        onChange={(event) => updateAnnotation(annotation.id, { fill: event.target.value })}
                        className="mt-2 h-10 w-full cursor-pointer rounded-xl border border-zinc-200 bg-white"
                    />
                </label>
                <label className="flex flex-col text-xs font-medium text-zinc-500">
                    Stroke
                    <input
                        type="color"
                        value={annotation.stroke}
                        onChange={(event) => updateAnnotation(annotation.id, { stroke: event.target.value })}
                        className="mt-2 h-10 w-full cursor-pointer rounded-xl border border-zinc-200 bg-white"
                    />
                </label>
            </div>
            <label className="flex flex-col text-xs font-medium text-zinc-500">
                Stroke width
                <input
                    type="range"
                    min={0}
                    max={10}
                    step={0.5}
                    value={annotation.strokeWidth}
                    onChange={(event) => updateAnnotation(annotation.id, { strokeWidth: Number(event.target.value) })}
                    className="mt-2"
                />
            </label>
            <label className="flex flex-col text-xs font-medium text-zinc-500">
                Opacity
                <input
                    type="range"
                    min={0.1}
                    max={1}
                    step={0.05}
                    value={annotation.opacity}
                    onChange={(event) => updateAnnotation(annotation.id, { opacity: Number(event.target.value) })}
                    className="mt-2"
                />
            </label>
            {annotation.type === "text" && (
                <label className="flex flex-col text-xs font-medium text-zinc-500">
                    Text
                    <input
                        type="text"
                        value={annotation.text ?? ""}
                        onChange={(event) => updateAnnotation(annotation.id, { text: event.target.value })}
                        className="mt-2 rounded-xl border border-zinc-200 px-3 py-2 text-sm"
                    />
                </label>
            )}
            <Button plain className="w-full text-sm text-red-500" onClick={removeSelected}>
                Delete overlay
            </Button>
        </div>
    );
}

type GoalShotsTimelineProps = {
    shots: GoalShot[];
    safeDuration: number;
    currentTime: number;
    selectedShotId: string | null;
    onSelect: (shot: GoalShot) => void;
};

function GoalShotsTimeline({ shots, safeDuration, currentTime, selectedShotId, onSelect }: GoalShotsTimelineProps) {
    if (shots.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
                Tag your first goal shot to start building the highlight reel.
            </div>
        );
    }

    return (
        <div className="relative h-28 rounded-2xl border border-zinc-200 bg-zinc-50">
            {shots.map((shot) => {
                const width = Math.max(1.5, ((shot.end - shot.start) / safeDuration) * 100);
                const left = (shot.start / safeDuration) * 100;
                const isActive = shot.id === selectedShotId;
                return (
                    <button
                        key={shot.id}
                        type="button"
                        style={{ width: `${width}%`, left: `${left}%` }}
                        className={`absolute top-4 flex h-20 flex-col rounded-xl border px-3 py-2 text-left text-xs font-semibold ${isActive ? "border-blue-500 bg-blue-100 text-blue-900" : "border-zinc-200 bg-white/90 text-zinc-600"
                            }`}
                        onClick={() => onSelect(shot)}
                    >
                        <span className="text-[11px] uppercase tracking-wide">{shot.label}</span>
                        <span>
                            {formatTimestamp(shot.start)} – {formatTimestamp(shot.end)}
                        </span>
                    </button>
                );
            })}
            <div className="absolute inset-y-0 w-[2px] bg-blue-500" style={{ left: `${(currentTime / safeDuration) * 100}%` }} />
        </div>
    );
}

type GoalShotsListProps = {
    shots: GoalShot[];
    selectedShotId: string | null;
    safeDuration: number;
    onSelect: (shot: GoalShot) => void;
    onUpdate: (id: string, updates: Partial<GoalShot>) => void;
    onRemove: (id: string) => void;
};

function GoalShotsList({ shots, selectedShotId, safeDuration, onSelect, onUpdate, onRemove }: GoalShotsListProps) {
    if (shots.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-500">
                No goal shots saved yet. Use the button above the timeline after you scrub to a key moment.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {shots.map((shot) => {
                const isActive = shot.id === selectedShotId;
                return (
                    <div key={shot.id} className={`space-y-2 rounded-2xl border p-4 ${isActive ? "border-blue-200 bg-blue-50" : "border-zinc-200"}`}>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={shot.label}
                                onChange={(event) => onUpdate(shot.id, { label: event.target.value })}
                                className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-900"
                            />
                            <Button plain className="text-xs text-blue-600" onClick={() => onSelect(shot)}>
                                Jump
                            </Button>
                            <Button plain className="text-xs text-red-500" onClick={() => onRemove(shot.id)}>
                                Delete
                            </Button>
                        </div>
                        <div className="grid gap-3 text-xs text-zinc-500 sm:grid-cols-2">
                            <label className="flex flex-col gap-1">
                                Start (s)
                                <input
                                    type="number"
                                    min={0}
                                    max={safeDuration}
                                    step={0.1}
                                    value={shot.start.toFixed(1)}
                                    onChange={(event) => {
                                        const value = Number(event.target.value);
                                        if (Number.isNaN(value)) return;
                                        const next = Math.min(value, shot.end - 0.2);
                                        onUpdate(shot.id, { start: clampTime(next, 0, safeDuration) });
                                    }}
                                    className="rounded-xl border border-zinc-200 px-2 py-1 text-sm text-zinc-800"
                                />
                            </label>
                            <label className="flex flex-col gap-1">
                                End (s)
                                <input
                                    type="number"
                                    min={0}
                                    max={safeDuration}
                                    step={0.1}
                                    value={shot.end.toFixed(1)}
                                    onChange={(event) => {
                                        const value = Number(event.target.value);
                                        if (Number.isNaN(value)) return;
                                        const next = Math.max(value, shot.start + 0.2);
                                        onUpdate(shot.id, { end: clampTime(next, 0, safeDuration) });
                                    }}
                                    className="rounded-xl border border-zinc-200 px-2 py-1 text-sm text-zinc-800"
                                />
                            </label>
                        </div>
                        <p className="text-xs font-medium text-zinc-500">
                            {formatTimestamp(shot.start)} – {formatTimestamp(shot.end)}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}

function useElementSize<T extends HTMLElement>() {
    const ref = useRef<T | null>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });

    useLayoutEffect(() => {
        if (!ref.current || typeof ResizeObserver === "undefined") return;
        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (!entry) return;
            setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
        });
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return [ref, size] as const;
}

function iconClasses(className?: string) {
    return ["size-5", className].filter(Boolean).join(" ");
}

function SpotlightToolIcon({ className }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={iconClasses(className)}>
            <path d="M8 5h8l2 4-6 10-6-10 2-4Z" strokeLinejoin="round" />
            <path d="M12 19v2" strokeLinecap="round" />
        </svg>
    );
}

function RectangleToolIcon({ className }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={iconClasses(className)}>
            <rect x="5" y="5" width="14" height="14" rx="3" />
        </svg>
    );
}

function ArrowToolIcon({ className }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={iconClasses(className)}>
            <path d="M4 12h12" strokeLinecap="round" />
            <path d="m13 7 6 5-6 5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function TextToolIcon({ className }: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={iconClasses(className)}>
            <path d="M5 6h14" strokeLinecap="round" />
            <path d="M9 6v12" />
            <path d="M15 6v12" />
            <path d="M5 18h14" strokeLinecap="round" />
        </svg>
    );
}
