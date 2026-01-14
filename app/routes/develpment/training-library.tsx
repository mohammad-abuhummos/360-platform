import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Stage, Layer, Image as KonvaImage, Circle, Rect, Line, Arrow, Text as KonvaText, Group, Transformer } from 'react-konva';
import type Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { DashboardLayout } from "~/components/dashboard-layout";
import { useAuth } from "~/context/auth-context";
import {
    type TrainingPlan,
    type TrainingStep,
    type DrawingObject,
    FOOTBALL_BACKGROUNDS,
    getBackgroundUrl,
    PLAYER_COLORS,
    generateObjectId,
    generateStepId,
    createTrainingPlan,
    updateTrainingPlan,
    deleteTrainingPlan,
    subscribeToClubTrainingPlans,
    uploadPlanGif,
} from "~/lib/firestore-training";
import toast from "react-hot-toast";

export const meta = () => {
    return [
        { title: "Training Library | Development" },
        { name: "description", content: "Create and manage training exercises and drills" },
    ];
};

type ViewMode = 'list' | 'create' | 'edit' | 'preview';
type Tool = 'select' | 'player' | 'ball' | 'cone' | 'goal' | 'ladder' | 'hurdle' | 'pole' | 'mannequin' | 'flag' |
    'circle' | 'rectangle' | 'line' | 'arrow' | 'curved-arrow' | 'dashed-line' | 'text' | 'zone';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 600;

export default function TrainingLibraryPage() {
    const { activeClub, profile } = useAuth();
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [plans, setPlans] = useState<TrainingPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null);

    // Editor state
    const [currentPlan, setCurrentPlan] = useState<Partial<TrainingPlan>>({
        title: '',
        introduction: '',
        description: '',
        keyCoachingPoints: '',
        tags: [],
        duration: 15,
        minPlayers: 8,
        materials: '',
        backgroundType: 'tall_full',
        backgroundCategory: 'football',
        steps: [],
    });
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);

    // Canvas state
    const stageRef = useRef<Konva.Stage>(null);
    const transformerRef = useRef<Konva.Transformer>(null);
    const [activeTool, setActiveTool] = useState<Tool>('select');
    const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
    const [activePlayerColor, setActivePlayerColor] = useState<keyof typeof PLAYER_COLORS>('orange');
    const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
    const [showTextInput, setShowTextInput] = useState(false);
    const [textInputPos, setTextInputPos] = useState({ x: 0, y: 0 });
    const [textInput, setTextInput] = useState('');

    // Preview state
    const [previewStepIndex, setPreviewStepIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [tagInput, setTagInput] = useState('');
    const [animatedObjects, setAnimatedObjects] = useState<DrawingObject[]>([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const animationRef = useRef<number | null>(null);
    const [animationSpeed, setAnimationSpeed] = useState(1000); // ms for transition

    // Load plans from Firebase
    useEffect(() => {
        if (!activeClub?.id) {
            setLoading(false);
            return;
        }

        const unsubscribe = subscribeToClubTrainingPlans(activeClub.id, (loadedPlans) => {
            setPlans(loadedPlans);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [activeClub?.id]);

    // Load background image when changed
    useEffect(() => {
        if (!currentPlan.backgroundType || !currentPlan.backgroundCategory) return;

        const url = getBackgroundUrl(
            currentPlan.backgroundCategory as 'football' | 'football-bw',
            currentPlan.backgroundType,
            false
        );
        if (url) {
            const img = new window.Image();
            img.crossOrigin = 'anonymous';
            img.src = url;
            img.onload = () => setBackgroundImage(img);
        }
    }, [currentPlan.backgroundType, currentPlan.backgroundCategory]);

    // Update transformer when selection changes
    useEffect(() => {
        if (!transformerRef.current || !stageRef.current || viewMode === 'preview') return;

        const transformer = transformerRef.current;
        if (selectedObjectId) {
            const node = stageRef.current.findOne(`#${selectedObjectId}`);
            if (node) {
                transformer.nodes([node]);
            }
        } else {
            transformer.nodes([]);
        }
        transformer.getLayer()?.batchDraw();
    }, [selectedObjectId, currentPlan.steps, viewMode]);

    // Smooth animation between steps
    const animateToStep = useCallback((fromStep: TrainingStep, toStep: TrainingStep, duration: number) => {
        const startTime = performance.now();

        // Create a map of objects in both steps
        const fromObjects = new Map(fromStep.objects.map(obj => [obj.id, obj]));
        const toObjects = new Map(toStep.objects.map(obj => [obj.id, obj]));

        // Get all unique object IDs
        const allIds = new Set([...fromObjects.keys(), ...toObjects.keys()]);

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-in-out)
            const easeProgress = progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            const interpolatedObjects: DrawingObject[] = [];

            allIds.forEach(id => {
                const fromObj = fromObjects.get(id);
                const toObj = toObjects.get(id);

                if (fromObj && toObj) {
                    // Object exists in both - interpolate position
                    interpolatedObjects.push({
                        ...toObj,
                        x: fromObj.x + (toObj.x - fromObj.x) * easeProgress,
                        y: fromObj.y + (toObj.y - fromObj.y) * easeProgress,
                        rotation: (fromObj.rotation || 0) + ((toObj.rotation || 0) - (fromObj.rotation || 0)) * easeProgress,
                        width: fromObj.width && toObj.width
                            ? fromObj.width + (toObj.width - fromObj.width) * easeProgress
                            : toObj.width,
                        height: fromObj.height && toObj.height
                            ? fromObj.height + (toObj.height - fromObj.height) * easeProgress
                            : toObj.height,
                        radius: fromObj.radius && toObj.radius
                            ? fromObj.radius + (toObj.radius - fromObj.radius) * easeProgress
                            : toObj.radius,
                    });
                } else if (toObj) {
                    // Object only in target - fade in (appear at final position)
                    interpolatedObjects.push({
                        ...toObj,
                        // Add opacity for fade-in effect (handled in render)
                    });
                } else if (fromObj && progress < 1) {
                    // Object only in source - fade out (keep at position until animation ends)
                    interpolatedObjects.push({
                        ...fromObj,
                    });
                }
            });

            setAnimatedObjects(interpolatedObjects);

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                setIsAnimating(false);
                setAnimatedObjects(toStep.objects);
            }
        };

        setIsAnimating(true);
        animationRef.current = requestAnimationFrame(animate);
    }, []);

    // Initialize animated objects when entering preview or when step changes
    useEffect(() => {
        if (viewMode === 'preview' && currentPlan.steps && currentPlan.steps.length > 0) {
            const currentStep = currentPlan.steps[previewStepIndex];
            if (currentStep && !isAnimating) {
                setAnimatedObjects(currentStep.objects);
            }
        }
    }, [viewMode, currentPlan.steps, previewStepIndex, isAnimating]);

    // Handle step transitions with animation
    const goToStepAnimated = useCallback((newIndex: number) => {
        if (!currentPlan.steps || isAnimating) return;

        const currentStep = currentPlan.steps[previewStepIndex];
        const nextStep = currentPlan.steps[newIndex];

        if (currentStep && nextStep && previewStepIndex !== newIndex) {
            animateToStep(currentStep, nextStep, animationSpeed);
            setPreviewStepIndex(newIndex);
        }
    }, [currentPlan.steps, previewStepIndex, isAnimating, animateToStep, animationSpeed]);

    // Preview auto-play with smooth animations
    useEffect(() => {
        if (!isPlaying || viewMode !== 'preview' || !currentPlan.steps || currentPlan.steps.length <= 1 || isAnimating) return;

        const timeoutId = setTimeout(() => {
            const nextIndex = (previewStepIndex + 1) % currentPlan.steps!.length;
            goToStepAnimated(nextIndex);
        }, animationSpeed + 500); // Animation duration + pause between steps

        return () => clearTimeout(timeoutId);
    }, [isPlaying, viewMode, currentPlan.steps, previewStepIndex, isAnimating, goToStepAnimated, animationSpeed]);

    // Cleanup animation on unmount
    useEffect(() => {
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (!showTextInput && selectedObjectId && viewMode !== 'preview') {
                    deleteSelectedObject();
                }
            }
            if (e.key === 'Escape') {
                setSelectedObjectId(null);
                setActiveTool('select');
                setShowTextInput(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedObjectId, showTextInput, viewMode]);

    const getCurrentStep = useCallback((): TrainingStep | null => {
        if (!currentPlan.steps || currentPlan.steps.length === 0) return null;
        const index = viewMode === 'preview' ? previewStepIndex : currentStepIndex;
        return currentPlan.steps[index] || null;
    }, [currentPlan.steps, currentStepIndex, previewStepIndex, viewMode]);

    const updateCurrentStep = useCallback((updater: (step: TrainingStep) => TrainingStep) => {
        setCurrentPlan(prev => {
            if (!prev.steps) return prev;
            const newSteps = [...prev.steps];
            newSteps[currentStepIndex] = updater(newSteps[currentStepIndex]);
            return { ...prev, steps: newSteps };
        });
    }, [currentStepIndex]);

    const addStep = useCallback(() => {
        const currentStep = getCurrentStep();
        const newStep: TrainingStep = {
            id: generateStepId(),
            name: `Step ${(currentPlan.steps?.length || 0) + 1}`,
            duration: 1500,
            objects: currentStep ? [...currentStep.objects] : [], // Copy objects from current step
        };
        setCurrentPlan(prev => ({
            ...prev,
            steps: [...(prev.steps || []), newStep],
        }));
        setCurrentStepIndex((currentPlan.steps?.length || 0));
    }, [currentPlan.steps, getCurrentStep]);

    const deleteStep = useCallback((index: number) => {
        if (!currentPlan.steps || currentPlan.steps.length <= 1) return;

        setCurrentPlan(prev => ({
            ...prev,
            steps: prev.steps?.filter((_, i) => i !== index),
        }));

        if (currentStepIndex >= (currentPlan.steps.length - 1)) {
            setCurrentStepIndex(Math.max(0, currentStepIndex - 1));
        }
    }, [currentPlan.steps, currentStepIndex]);

    const deleteSelectedObject = useCallback(() => {
        if (!selectedObjectId) return;
        updateCurrentStep(step => ({
            ...step,
            objects: step.objects.filter(obj => obj.id !== selectedObjectId),
        }));
        setSelectedObjectId(null);
    }, [selectedObjectId, updateCurrentStep]);

    const handleStageClick = useCallback((e: KonvaEventObject<MouseEvent>) => {
        if (viewMode === 'preview') return;

        const stage = stageRef.current;
        if (!stage) return;

        const pos = stage.getPointerPosition();
        if (!pos) return;

        // If clicking on empty area with select tool, deselect
        if (e.target === stage && activeTool === 'select') {
            setSelectedObjectId(null);
            return;
        }

        // Add new objects based on active tool
        if (activeTool !== 'select' && e.target === stage) {
            if (activeTool === 'text') {
                setShowTextInput(true);
                setTextInputPos(pos);
                return;
            }

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
            }

            if (!['line', 'arrow', 'curved-arrow', 'dashed-line'].includes(activeTool)) {
                updateCurrentStep(step => ({
                    ...step,
                    objects: [...step.objects, newObject],
                }));
            }
        }
    }, [activeTool, activePlayerColor, viewMode, updateCurrentStep]);

    const handleMouseDown = useCallback((e: KonvaEventObject<MouseEvent>) => {
        if (viewMode === 'preview') return;

        const stage = stageRef.current;
        if (!stage) return;

        const pos = stage.getPointerPosition();
        if (!pos || e.target !== stage) return;

        if (['line', 'arrow', 'curved-arrow', 'dashed-line'].includes(activeTool)) {
            setIsDrawing(true);
            setDrawStart(pos);
        }
    }, [activeTool, viewMode]);

    const handleMouseUp = useCallback((e: KonvaEventObject<MouseEvent>) => {
        if (!isDrawing || !drawStart || viewMode === 'preview') return;

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

        updateCurrentStep(step => ({
            ...step,
            objects: [...step.objects, newObject],
        }));
        setIsDrawing(false);
        setDrawStart(null);
    }, [activeTool, drawStart, isDrawing, viewMode, updateCurrentStep]);

    const handleDragEnd = useCallback((id: string, e: KonvaEventObject<DragEvent>) => {
        if (viewMode === 'preview') return;

        updateCurrentStep(step => ({
            ...step,
            objects: step.objects.map(obj => {
                if (obj.id === id) {
                    return { ...obj, x: e.target.x(), y: e.target.y() };
                }
                return obj;
            }),
        }));
    }, [viewMode, updateCurrentStep]);

    const handleTransformEnd = useCallback((id: string, e: KonvaEventObject<Event>) => {
        if (viewMode === 'preview') return;

        const node = e.target;
        updateCurrentStep(step => ({
            ...step,
            objects: step.objects.map(obj => {
                if (obj.id === id) {
                    const updated = {
                        ...obj,
                        x: node.x(),
                        y: node.y(),
                        rotation: node.rotation(),
                    };
                    if (obj.width) updated.width = node.width() * node.scaleX();
                    if (obj.height) updated.height = node.height() * node.scaleY();
                    if (obj.radius) updated.radius = obj.radius * Math.max(node.scaleX(), node.scaleY());
                    return updated;
                }
                return obj;
            }),
        }));

        node.scaleX(1);
        node.scaleY(1);
    }, [viewMode, updateCurrentStep]);

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

        updateCurrentStep(step => ({
            ...step,
            objects: [...step.objects, newObject],
        }));
        setShowTextInput(false);
        setTextInput('');
    }, [textInput, textInputPos, updateCurrentStep]);

    const handleSavePlan = async () => {
        if (!activeClub?.id || !profile?.id) {
            toast.error('Please log in and select a club');
            return;
        }

        if (!currentPlan.title?.trim()) {
            toast.error('Please enter a title');
            return;
        }

        if (!currentPlan.steps || currentPlan.steps.length === 0) {
            toast.error('Please add at least one step');
            return;
        }

        setIsExporting(true);
        toast.loading('Saving exercise...', { id: 'save' });

        try {
            const planData = {
                ...currentPlan,
                clubId: activeClub.id,
                createdBy: profile.id,
                title: currentPlan.title!,
                backgroundType: currentPlan.backgroundType!,
                backgroundCategory: currentPlan.backgroundCategory as 'football' | 'football-bw',
                steps: currentPlan.steps!,
            };

            let planId: string;

            if (selectedPlan?.id) {
                await updateTrainingPlan(selectedPlan.id, planData);
                planId = selectedPlan.id;
            } else {
                planId = await createTrainingPlan(planData);
            }

            // Generate GIF if we have background image loaded
            if (backgroundImage && currentPlan.steps && currentPlan.steps.length > 0) {
                toast.loading('Generating preview...', { id: 'save' });

                try {
                    // @ts-expect-error gifenc doesn't have type declarations
                    const gifenc = await import('gifenc');
                    const GIFEncoder = gifenc.GIFEncoder || gifenc.default?.GIFEncoder;
                    const quantizeFn = gifenc.quantize || gifenc.default?.quantize;
                    const applyPaletteFn = gifenc.applyPalette || gifenc.default?.applyPalette;

                    if (GIFEncoder && quantizeFn && applyPaletteFn) {
                        const width = CANVAS_WIDTH;
                        const height = CANVAS_HEIGHT;
                        const framesPerTransition = 10;
                        const holdFrames = 8;
                        const frameDelay = 60;

                        const gif = GIFEncoder();
                        const canvas = document.createElement('canvas');
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d')!;

                        const steps = currentPlan.steps;

                        // Helper function to render objects inline
                        const renderToCanvas = (objects: DrawingObject[]) => {
                            ctx.clearRect(0, 0, width, height);
                            ctx.drawImage(backgroundImage, 0, 0, width, height);

                            objects.forEach(obj => {
                                ctx.save();
                                ctx.translate(obj.x, obj.y);
                                if (obj.rotation) ctx.rotate((obj.rotation * Math.PI) / 180);

                                switch (obj.type) {
                                    case 'player':
                                        ctx.beginPath();
                                        ctx.arc(0, 0, obj.radius || 15, 0, Math.PI * 2);
                                        ctx.fillStyle = PLAYER_COLORS[obj.playerColor || 'orange'];
                                        ctx.fill();
                                        ctx.strokeStyle = '#fff';
                                        ctx.lineWidth = 2;
                                        ctx.stroke();
                                        break;
                                    case 'ball':
                                        ctx.beginPath();
                                        ctx.arc(0, 0, obj.radius || 10, 0, Math.PI * 2);
                                        ctx.fillStyle = '#fff';
                                        ctx.fill();
                                        ctx.strokeStyle = '#000';
                                        ctx.lineWidth = 1;
                                        ctx.stroke();
                                        ctx.beginPath();
                                        ctx.arc(0, 0, (obj.radius || 10) * 0.4, 0, Math.PI * 2);
                                        ctx.fillStyle = '#000';
                                        ctx.fill();
                                        break;
                                    case 'cone':
                                        ctx.beginPath();
                                        ctx.moveTo(0, 0);
                                        ctx.lineTo((obj.width || 20) / 2, -(obj.height || 25));
                                        ctx.lineTo(obj.width || 20, 0);
                                        ctx.closePath();
                                        ctx.fillStyle = obj.fill || '#f97316';
                                        ctx.fill();
                                        break;
                                    case 'goal':
                                        ctx.strokeStyle = obj.stroke || '#fff';
                                        ctx.lineWidth = obj.strokeWidth || 3;
                                        ctx.strokeRect(0, 0, obj.width || 80, obj.height || 30);
                                        break;
                                    case 'circle':
                                        ctx.beginPath();
                                        ctx.arc(0, 0, obj.radius || 30, 0, Math.PI * 2);
                                        if (obj.fill) { ctx.fillStyle = obj.fill; ctx.fill(); }
                                        ctx.strokeStyle = obj.stroke || '#fff';
                                        ctx.lineWidth = obj.strokeWidth || 2;
                                        ctx.stroke();
                                        break;
                                    case 'rectangle':
                                    case 'zone':
                                        if (obj.fill) { ctx.fillStyle = obj.fill; ctx.fillRect(0, 0, obj.width || 60, obj.height || 40); }
                                        ctx.strokeStyle = obj.stroke || '#fff';
                                        ctx.lineWidth = obj.strokeWidth || 2;
                                        ctx.strokeRect(0, 0, obj.width || 60, obj.height || 40);
                                        break;
                                    case 'arrow':
                                        const arrowPts = obj.points || [0, 0, 50, 50];
                                        const dx = arrowPts[2] - arrowPts[0];
                                        const dy = arrowPts[3] - arrowPts[1];
                                        const angle = Math.atan2(dy, dx);
                                        ctx.strokeStyle = obj.stroke || '#fff';
                                        ctx.fillStyle = obj.stroke || '#fff';
                                        ctx.lineWidth = obj.strokeWidth || 3;
                                        ctx.beginPath();
                                        ctx.moveTo(arrowPts[0], arrowPts[1]);
                                        ctx.lineTo(arrowPts[2], arrowPts[3]);
                                        ctx.stroke();
                                        ctx.save();
                                        ctx.translate(arrowPts[2], arrowPts[3]);
                                        ctx.rotate(angle);
                                        ctx.beginPath();
                                        ctx.moveTo(0, 0);
                                        ctx.lineTo(-10, -5);
                                        ctx.lineTo(-10, 5);
                                        ctx.closePath();
                                        ctx.fill();
                                        ctx.restore();
                                        break;
                                    case 'line':
                                    case 'dashed-line':
                                        ctx.strokeStyle = obj.stroke || '#fff';
                                        ctx.lineWidth = obj.strokeWidth || 3;
                                        if (obj.type === 'dashed-line') ctx.setLineDash([10, 5]);
                                        ctx.beginPath();
                                        const pts = obj.points || [0, 0, 50, 50];
                                        ctx.moveTo(pts[0], pts[1]);
                                        ctx.lineTo(pts[2], pts[3]);
                                        ctx.stroke();
                                        ctx.setLineDash([]);
                                        break;
                                    case 'text':
                                        ctx.fillStyle = obj.fill || '#fff';
                                        ctx.font = `bold ${obj.fontSize || 16}px Arial`;
                                        ctx.fillText(obj.text || '', 0, 0);
                                        break;
                                }
                                ctx.restore();
                            });
                        };

                        // Helper to interpolate objects
                        const interpolate = (from: TrainingStep, to: TrainingStep, progress: number): DrawingObject[] => {
                            const fromMap = new Map(from.objects.map(o => [o.id, o]));
                            const toMap = new Map(to.objects.map(o => [o.id, o]));
                            const allIds = new Set([...fromMap.keys(), ...toMap.keys()]);
                            const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
                            const result: DrawingObject[] = [];

                            allIds.forEach(id => {
                                const f = fromMap.get(id);
                                const t = toMap.get(id);
                                if (f && t) {
                                    result.push({
                                        ...t,
                                        x: f.x + (t.x - f.x) * eased,
                                        y: f.y + (t.y - f.y) * eased,
                                    });
                                } else if (t) {
                                    result.push({ ...t });
                                } else if (f && progress < 1) {
                                    result.push({ ...f });
                                }
                            });
                            return result;
                        };

                        for (let stepIndex = 0; stepIndex < steps.length; stepIndex++) {
                            const currentStep = steps[stepIndex];
                            const nextStep = steps[(stepIndex + 1) % steps.length];

                            for (let h = 0; h < holdFrames; h++) {
                                renderToCanvas(currentStep.objects);
                                const imageData = ctx.getImageData(0, 0, width, height);
                                const palette = quantizeFn(imageData.data, 256);
                                const index = applyPaletteFn(imageData.data, palette);
                                gif.writeFrame(index, width, height, { palette, delay: frameDelay });
                            }

                            if (steps.length > 1) {
                                for (let f = 0; f < framesPerTransition; f++) {
                                    const progress = f / framesPerTransition;
                                    const interpolatedObjects = interpolate(currentStep, nextStep, progress);
                                    renderToCanvas(interpolatedObjects);
                                    const imageData = ctx.getImageData(0, 0, width, height);
                                    const palette = quantizeFn(imageData.data, 256);
                                    const index = applyPaletteFn(imageData.data, palette);
                                    gif.writeFrame(index, width, height, { palette, delay: frameDelay });
                                }
                            }
                        }

                        gif.finish();
                        const bytes = gif.bytes();
                        const gifBlob = new Blob([bytes], { type: 'image/gif' });

                        toast.loading('Uploading preview...', { id: 'save' });
                        const gifUrl = await uploadPlanGif(planId, gifBlob);
                        await updateTrainingPlan(planId, { gifUrl });
                    }
                } catch (gifError) {
                    console.error('GIF generation error:', gifError);
                    // Continue without GIF - don't fail the save
                }
            }

            toast.success('Exercise saved successfully!', { id: 'save' });
            setViewMode('list');
            resetEditor();
        } catch (error) {
            console.error('Error saving plan:', error);
            toast.error('Failed to save exercise', { id: 'save' });
        } finally {
            setIsExporting(false);
        }
    };

    const handleDeletePlan = async (planId: string) => {
        if (!confirm('Are you sure you want to delete this plan?')) return;

        try {
            await deleteTrainingPlan(planId);
            toast.success('Plan deleted successfully!');
        } catch (error) {
            console.error('Error deleting plan:', error);
            toast.error('Failed to delete plan');
        }
    };

    const resetEditor = () => {
        setCurrentPlan({
            title: '',
            introduction: '',
            description: '',
            keyCoachingPoints: '',
            tags: [],
            duration: 15,
            minPlayers: 8,
            materials: '',
            backgroundType: 'tall_full',
            backgroundCategory: 'football',
            steps: [],
        });
        setCurrentStepIndex(0);
        setSelectedPlan(null);
        setSelectedObjectId(null);
        setActiveTool('select');
    };

    const startCreating = () => {
        resetEditor();
        // Initialize with first step
        setCurrentPlan(prev => ({
            ...prev,
            steps: [{
                id: generateStepId(),
                name: 'Step 1',
                duration: 1500,
                objects: [],
            }],
        }));
        setViewMode('create');
        setShowBackgroundPicker(true);
    };

    const startEditing = (plan: TrainingPlan) => {
        setSelectedPlan(plan);
        setCurrentPlan(plan);
        setCurrentStepIndex(0);
        setViewMode('edit');
    };

    const startPreview = (plan: TrainingPlan) => {
        setSelectedPlan(plan);
        setCurrentPlan(plan);
        setPreviewStepIndex(0);
        setIsPlaying(false);
        setViewMode('preview');
    };

    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);

    // Helper to interpolate objects between two steps
    const interpolateStepObjects = useCallback((fromStep: TrainingStep, toStep: TrainingStep, progress: number): DrawingObject[] => {
        const fromObjects = new Map(fromStep.objects.map(obj => [obj.id, obj]));
        const toObjects = new Map(toStep.objects.map(obj => [obj.id, obj]));
        const allIds = new Set([...fromObjects.keys(), ...toObjects.keys()]);

        const easeProgress = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        const interpolatedObjects: DrawingObject[] = [];

        allIds.forEach(id => {
            const fromObj = fromObjects.get(id);
            const toObj = toObjects.get(id);

            if (fromObj && toObj) {
                interpolatedObjects.push({
                    ...toObj,
                    x: fromObj.x + (toObj.x - fromObj.x) * easeProgress,
                    y: fromObj.y + (toObj.y - fromObj.y) * easeProgress,
                    rotation: (fromObj.rotation || 0) + ((toObj.rotation || 0) - (fromObj.rotation || 0)) * easeProgress,
                    width: fromObj.width && toObj.width
                        ? fromObj.width + (toObj.width - fromObj.width) * easeProgress
                        : toObj.width,
                    height: fromObj.height && toObj.height
                        ? fromObj.height + (toObj.height - fromObj.height) * easeProgress
                        : toObj.height,
                    radius: fromObj.radius && toObj.radius
                        ? fromObj.radius + (toObj.radius - fromObj.radius) * easeProgress
                        : toObj.radius,
                });
            } else if (toObj) {
                interpolatedObjects.push({ ...toObj });
            } else if (fromObj && progress < 1) {
                interpolatedObjects.push({ ...fromObj });
            }
        });

        return interpolatedObjects;
    }, []);

    // Render objects to an offscreen canvas
    const renderObjectsToCanvas = useCallback((
        ctx: CanvasRenderingContext2D,
        objects: DrawingObject[],
        bgImage: HTMLImageElement | null,
        width: number,
        height: number
    ) => {
        // Clear and draw background
        ctx.clearRect(0, 0, width, height);
        if (bgImage) {
            ctx.drawImage(bgImage, 0, 0, width, height);
        }

        // Draw each object
        objects.forEach(obj => {
            ctx.save();
            ctx.translate(obj.x, obj.y);
            if (obj.rotation) ctx.rotate((obj.rotation * Math.PI) / 180);

            switch (obj.type) {
                case 'player':
                    ctx.beginPath();
                    ctx.arc(0, 0, obj.radius || 15, 0, Math.PI * 2);
                    ctx.fillStyle = PLAYER_COLORS[obj.playerColor || 'orange'];
                    ctx.fill();
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    ctx.shadowColor = '#000';
                    ctx.shadowBlur = 3;
                    break;
                case 'ball':
                    ctx.beginPath();
                    ctx.arc(0, 0, obj.radius || 10, 0, Math.PI * 2);
                    ctx.fillStyle = '#fff';
                    ctx.fill();
                    ctx.strokeStyle = '#000';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.arc(0, 0, (obj.radius || 10) * 0.4, 0, Math.PI * 2);
                    ctx.fillStyle = '#000';
                    ctx.fill();
                    break;
                case 'cone':
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo((obj.width || 20) / 2, -(obj.height || 25));
                    ctx.lineTo(obj.width || 20, 0);
                    ctx.closePath();
                    ctx.fillStyle = obj.fill || '#f97316';
                    ctx.fill();
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                    break;
                case 'goal':
                    ctx.strokeStyle = obj.stroke || '#fff';
                    ctx.lineWidth = obj.strokeWidth || 3;
                    ctx.strokeRect(0, 0, obj.width || 80, obj.height || 30);
                    break;
                case 'hurdle':
                    ctx.fillStyle = obj.fill || '#f97316';
                    ctx.fillRect(0, 0, obj.width || 50, obj.height || 20);
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(0, 0, obj.width || 50, obj.height || 20);
                    break;
                case 'pole':
                    ctx.fillStyle = obj.fill || '#f97316';
                    ctx.fillRect(0, 0, obj.width || 6, obj.height || 60);
                    break;
                case 'flag':
                    ctx.strokeStyle = '#333';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(0, obj.height || 40);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(obj.width || 20, 8);
                    ctx.lineTo(0, 16);
                    ctx.closePath();
                    ctx.fillStyle = obj.fill || '#ef4444';
                    ctx.fill();
                    break;
                case 'mannequin':
                    ctx.fillStyle = obj.fill || '#3b82f6';
                    ctx.beginPath();
                    ctx.arc(0, -20, 10, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillRect(-(obj.width || 30) / 2, -10, obj.width || 30, (obj.height || 50) - 20);
                    break;
                case 'circle':
                    ctx.beginPath();
                    ctx.arc(0, 0, obj.radius || 30, 0, Math.PI * 2);
                    if (obj.fill) {
                        ctx.fillStyle = obj.fill;
                        ctx.fill();
                    }
                    ctx.strokeStyle = obj.stroke || '#fff';
                    ctx.lineWidth = obj.strokeWidth || 2;
                    ctx.stroke();
                    break;
                case 'rectangle':
                case 'zone':
                    if (obj.fill) {
                        ctx.fillStyle = obj.fill;
                        ctx.fillRect(0, 0, obj.width || 60, obj.height || 40);
                    }
                    ctx.strokeStyle = obj.stroke || '#fff';
                    ctx.lineWidth = obj.strokeWidth || 2;
                    ctx.strokeRect(0, 0, obj.width || 60, obj.height || 40);
                    break;
                case 'line':
                case 'dashed-line':
                    ctx.strokeStyle = obj.stroke || '#fff';
                    ctx.lineWidth = obj.strokeWidth || 3;
                    if (obj.type === 'dashed-line') ctx.setLineDash([10, 5]);
                    ctx.beginPath();
                    const pts = obj.points || [0, 0, 50, 50];
                    ctx.moveTo(pts[0], pts[1]);
                    ctx.lineTo(pts[2], pts[3]);
                    ctx.stroke();
                    ctx.setLineDash([]);
                    break;
                case 'arrow':
                case 'curved-arrow':
                    const arrowPts = obj.points || [0, 0, 50, 50];
                    const dx = arrowPts[2] - arrowPts[0];
                    const dy = arrowPts[3] - arrowPts[1];
                    const angle = Math.atan2(dy, dx);
                    ctx.strokeStyle = obj.stroke || '#fff';
                    ctx.fillStyle = obj.stroke || '#fff';
                    ctx.lineWidth = obj.strokeWidth || 3;
                    ctx.beginPath();
                    ctx.moveTo(arrowPts[0], arrowPts[1]);
                    ctx.lineTo(arrowPts[2], arrowPts[3]);
                    ctx.stroke();
                    // Arrow head
                    ctx.save();
                    ctx.translate(arrowPts[2], arrowPts[3]);
                    ctx.rotate(angle);
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(-10, -5);
                    ctx.lineTo(-10, 5);
                    ctx.closePath();
                    ctx.fill();
                    ctx.restore();
                    break;
                case 'text':
                    ctx.fillStyle = obj.fill || '#fff';
                    ctx.font = `bold ${obj.fontSize || 16}px Arial`;
                    ctx.fillText(obj.text || '', 0, 0);
                    break;
                case 'ladder':
                    ctx.strokeStyle = obj.stroke || '#eab308';
                    ctx.lineWidth = obj.strokeWidth || 2;
                    ctx.strokeRect(0, 0, obj.width || 40, obj.height || 100);
                    for (let i = 1; i <= 5; i++) {
                        ctx.beginPath();
                        ctx.moveTo(0, i * 16);
                        ctx.lineTo(obj.width || 40, i * 16);
                        ctx.stroke();
                    }
                    break;
            }
            ctx.restore();
        });
    }, []);

    const exportAsGif = async () => {
        if (!currentPlan.steps || currentPlan.steps.length === 0 || !backgroundImage) {
            toast.error('No steps to export');
            return;
        }

        setIsExporting(true);
        setExportProgress(0);
        toast.loading('Generating GIF...', { id: 'export' });

        try {
            // Dynamic import for gifenc (CommonJS module)
            // @ts-expect-error gifenc doesn't have type declarations
            const gifenc = await import('gifenc');
            const GIFEncoder = gifenc.GIFEncoder || gifenc.default?.GIFEncoder;
            const quantize = gifenc.quantize || gifenc.default?.quantize;
            const applyPalette = gifenc.applyPalette || gifenc.default?.applyPalette;

            if (!GIFEncoder || !quantize || !applyPalette) {
                throw new Error('Failed to load gifenc library');
            }

            const width = CANVAS_WIDTH;
            const height = CANVAS_HEIGHT;
            const framesPerTransition = 15; // Frames for smooth transition
            const holdFrames = 10; // Frames to hold on each step
            const frameDelay = 50; // ms per frame (20 fps)

            // Create GIF encoder
            const gif = GIFEncoder();

            // Create offscreen canvas for rendering
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d')!;

            const steps = currentPlan.steps;
            const totalFrames = steps.length * (framesPerTransition + holdFrames);
            let frameCount = 0;

            for (let stepIndex = 0; stepIndex < steps.length; stepIndex++) {
                const currentStep = steps[stepIndex];
                const nextStep = steps[(stepIndex + 1) % steps.length];

                // Hold frames on current step
                for (let h = 0; h < holdFrames; h++) {
                    renderObjectsToCanvas(ctx, currentStep.objects, backgroundImage, width, height);
                    const imageData = ctx.getImageData(0, 0, width, height);
                    const palette = quantize(imageData.data, 256);
                    const index = applyPalette(imageData.data, palette);
                    gif.writeFrame(index, width, height, { palette, delay: frameDelay });

                    frameCount++;
                    setExportProgress(Math.round((frameCount / totalFrames) * 100));
                }

                // Transition frames to next step (only if more than one step)
                if (steps.length > 1) {
                    for (let f = 0; f < framesPerTransition; f++) {
                        const progress = f / framesPerTransition;
                        const interpolatedObjects = interpolateStepObjects(currentStep, nextStep, progress);

                        renderObjectsToCanvas(ctx, interpolatedObjects, backgroundImage, width, height);
                        const imageData = ctx.getImageData(0, 0, width, height);
                        const palette = quantize(imageData.data, 256);
                        const index = applyPalette(imageData.data, palette);
                        gif.writeFrame(index, width, height, { palette, delay: frameDelay });

                        frameCount++;
                        setExportProgress(Math.round((frameCount / totalFrames) * 100));
                    }
                }
            }

            // Finish and download
            gif.finish();
            const bytes = gif.bytes();
            const blob = new Blob([bytes], { type: 'image/gif' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.download = `${currentPlan.title || 'training-plan'}.gif`;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success('GIF exported successfully!', { id: 'export' });
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export GIF', { id: 'export' });
        } finally {
            setIsExporting(false);
            setExportProgress(0);
        }
    };

    const handleAddTag = () => {
        if (!tagInput.trim()) return;
        setCurrentPlan(prev => ({
            ...prev,
            tags: [...(prev.tags || []), tagInput.trim()],
        }));
        setTagInput('');
    };

    const handleRemoveTag = (tag: string) => {
        setCurrentPlan(prev => ({
            ...prev,
            tags: prev.tags?.filter(t => t !== tag),
        }));
    };

    const renderObject = (obj: DrawingObject, isPreview = false) => {
        const commonProps = {
            id: obj.id,
            key: obj.id,
            x: obj.x,
            y: obj.y,
            rotation: obj.rotation || 0,
            draggable: !isPreview,
            onClick: () => !isPreview && setSelectedObjectId(obj.id),
            onTap: () => !isPreview && setSelectedObjectId(obj.id),
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
                        <Circle radius={obj.radius || 10} fill="#fff" stroke="#000" strokeWidth={1} />
                        <Circle radius={(obj.radius || 10) * 0.4} fill="#000" />
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
                        <Rect width={obj.width || 40} height={obj.height || 100} stroke={obj.stroke || '#eab308'} strokeWidth={obj.strokeWidth || 2} />
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Line key={i} points={[0, (i + 1) * 16, obj.width || 40, (i + 1) * 16]} stroke={obj.stroke || '#eab308'} strokeWidth={2} />
                        ))}
                    </Group>
                );
            case 'hurdle':
                return <Rect {...commonProps} width={obj.width || 50} height={obj.height || 20} fill={obj.fill || '#f97316'} stroke="#fff" strokeWidth={1} cornerRadius={2} />;
            case 'pole':
                return <Rect {...commonProps} width={obj.width || 6} height={obj.height || 60} fill={obj.fill || '#f97316'} cornerRadius={3} />;
            case 'flag':
                return (
                    <Group {...commonProps}>
                        <Line points={[0, 0, 0, obj.height || 40]} stroke="#333" strokeWidth={3} />
                        <Line points={[0, 0, obj.width || 20, 8, 0, 16]} closed fill={obj.fill || '#ef4444'} />
                    </Group>
                );
            case 'mannequin':
                return (
                    <Group {...commonProps}>
                        <Circle y={-20} radius={10} fill={obj.fill || '#3b82f6'} />
                        <Rect y={-10} width={obj.width || 30} height={(obj.height || 50) - 20} offsetX={(obj.width || 30) / 2} fill={obj.fill || '#3b82f6'} cornerRadius={5} />
                    </Group>
                );
            case 'circle':
                return <Circle {...commonProps} radius={obj.radius || 30} stroke={obj.stroke || '#fff'} strokeWidth={obj.strokeWidth || 2} fill={obj.fill} />;
            case 'rectangle':
            case 'zone':
                return <Rect {...commonProps} width={obj.width || 60} height={obj.height || 40} stroke={obj.stroke || '#fff'} strokeWidth={obj.strokeWidth || 2} fill={obj.fill} cornerRadius={obj.type === 'zone' ? 4 : 0} />;
            case 'line':
            case 'dashed-line':
                return <Line {...commonProps} points={obj.points || [0, 0, 50, 50]} stroke={obj.stroke || '#fff'} strokeWidth={obj.strokeWidth || 3} dash={obj.type === 'dashed-line' ? [10, 5] : undefined} />;
            case 'arrow':
            case 'curved-arrow':
                return <Arrow {...commonProps} points={obj.points || [0, 0, 50, 50]} stroke={obj.stroke || '#fff'} strokeWidth={obj.strokeWidth || 3} fill={obj.stroke || '#fff'} pointerLength={10} pointerWidth={10} />;
            case 'text':
                return <KonvaText {...commonProps} text={obj.text || ''} fontSize={obj.fontSize || 16} fill={obj.fill || '#fff'} fontFamily="Arial" fontStyle="bold" />;
            default:
                return null;
        }
    };

    // List View
    if (viewMode === 'list') {
        return (
            <DashboardLayout>
                <div className="min-h-screen bg-zinc-900 p-6">
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white">Training Library</h1>
                            <p className="text-zinc-400">Create and manage training exercises and drills</p>
                        </div>
                        <button
                            onClick={startCreating}
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Exercise
                        </button>
                    </div>

                    {/* Plans Grid */}
                    {loading ? (
                        <div className="flex h-64 items-center justify-center">
                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                        </div>
                    ) : plans.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-800/50 py-16"
                        >
                            <div className="mb-4 rounded-full bg-zinc-700 p-4">
                                <svg className="h-12 w-12 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <h3 className="mb-2 text-lg font-medium text-white">No exercises yet</h3>
                            <p className="mb-6 text-zinc-400">Create your first training exercise to get started</p>
                            <button
                                onClick={startCreating}
                                className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create Your First Exercise
                            </button>
                        </motion.div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {plans.map((plan, index) => (
                                <motion.div
                                    key={plan.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group overflow-hidden rounded-xl border border-zinc-700 bg-zinc-800 transition-all hover:border-zinc-600"
                                >
                                    {/* Thumbnail / GIF Preview */}
                                    <div className="relative aspect-square bg-zinc-900 overflow-hidden">
                                        {plan.gifUrl ? (
                                            <img
                                                src={plan.gifUrl}
                                                alt={plan.title}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : plan.thumbnail ? (
                                            <img src={plan.thumbnail} alt={plan.title} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <img
                                                    src={getBackgroundUrl(plan.backgroundCategory, plan.backgroundType, true)}
                                                    alt="Field"
                                                    className="h-full w-full object-cover opacity-50"
                                                />
                                            </div>
                                        )}
                                        {/* Overlay actions */}
                                        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                                            <button
                                                onClick={() => startPreview(plan)}
                                                className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700"
                                            >
                                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => startEditing(plan)}
                                                className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-600 text-white transition-colors hover:bg-zinc-500"
                                            >
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => plan.id && handleDeletePlan(plan.id)}
                                                className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white transition-colors hover:bg-red-700"
                                            >
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                        {/* Tags */}
                                        {plan.tags && plan.tags.length > 0 && (
                                            <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
                                                {plan.tags.slice(0, 3).map(tag => (
                                                    <span key={tag} className="rounded bg-blue-600/80 px-2 py-0.5 text-xs font-medium text-white">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {/* Info */}
                                    <div className="p-4">
                                        <h3 className="mb-1 font-semibold text-white">{plan.title}</h3>
                                        {plan.introduction && (
                                            <p className="mb-3 line-clamp-2 text-sm text-zinc-400">{plan.introduction}</p>
                                        )}
                                        <div className="flex flex-wrap gap-3 text-xs text-zinc-500">
                                            {plan.duration && (
                                                <span className="flex items-center gap-1">
                                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {plan.duration} min
                                                </span>
                                            )}
                                            {plan.minPlayers && (
                                                <span className="flex items-center gap-1">
                                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                    {plan.minPlayers}+ players
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                                </svg>
                                                {plan.steps?.length || 0} steps
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </DashboardLayout>
        );
    }

    // Editor / Preview View
    const currentStep = getCurrentStep();

    return (
        <DashboardLayout>
            <div className="flex h-screen flex-col overflow-hidden bg-zinc-900">
                {/* Top Bar */}
                <div className="flex items-center justify-between border-b border-zinc-700 bg-zinc-800 px-4 py-3">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => { setViewMode('list'); resetEditor(); }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-700 text-white transition-colors hover:bg-zinc-600"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <span className="text-sm text-zinc-400">Exercise / {viewMode === 'preview' ? 'Preview' : 'Edit'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {viewMode === 'preview' && (
                            <>
                                <button
                                    onClick={() => setViewMode('edit')}
                                    className="flex items-center gap-2 rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-600"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    Edit
                                </button>
                                <button
                                    onClick={exportAsGif}
                                    disabled={isExporting}
                                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${isExporting
                                        ? 'bg-green-700 cursor-not-allowed'
                                        : 'bg-green-600 hover:bg-green-700'
                                        }`}
                                >
                                    {isExporting ? (
                                        <>
                                            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Exporting... {exportProgress}%
                                        </>
                                    ) : (
                                        <>
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            Export GIF
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                        {viewMode !== 'preview' && (
                            <>
                                <button
                                    onClick={() => startPreview(currentPlan as TrainingPlan)}
                                    className="flex items-center gap-2 rounded-lg border border-zinc-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    Preview
                                </button>
                                <button
                                    onClick={handleSavePlan}
                                    disabled={isExporting}
                                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${isExporting
                                        ? 'bg-blue-700 cursor-not-allowed opacity-80'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                >
                                    {isExporting ? (
                                        <>
                                            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                                                <polyline points="17,21 17,13 7,13 7,21" />
                                                <polyline points="7,3 7,8 15,8" />
                                            </svg>
                                            Save
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left Sidebar - Tools (only in edit mode) */}
                    {viewMode !== 'preview' && (
                        <div className="w-40 shrink-0 overflow-y-auto border-r border-zinc-700 bg-zinc-850 p-3">
                            {/* Shapes */}
                            <div className="mb-4">
                                <span className="mb-2 block text-xs font-medium text-zinc-400">Shapes</span>
                                <div className="grid grid-cols-3 gap-1">
                                    <ToolButton icon={Icons.circle} active={activeTool === 'circle'} onClick={() => setActiveTool('circle')} title="Circle" />
                                    <ToolButton icon={Icons.rectangle} active={activeTool === 'rectangle'} onClick={() => setActiveTool('rectangle')} title="Rectangle" />
                                    <ToolButton icon={Icons.zone} active={activeTool === 'zone'} onClick={() => setActiveTool('zone')} title="Zone" />
                                    <ToolButton icon={Icons.line} active={activeTool === 'line'} onClick={() => setActiveTool('line')} title="Line" />
                                    <ToolButton icon={Icons.arrow} active={activeTool === 'arrow'} onClick={() => setActiveTool('arrow')} title="Arrow" />
                                    <ToolButton icon={Icons.dashedLine} active={activeTool === 'dashed-line'} onClick={() => setActiveTool('dashed-line')} title="Dashed Line" />
                                    <ToolButton icon={Icons.text} active={activeTool === 'text'} onClick={() => setActiveTool('text')} title="Text" />
                                </div>
                            </div>

                            {/* Equipment */}
                            <div className="mb-4">
                                <span className="mb-2 block text-xs font-medium text-zinc-400">Equipment</span>
                                <div className="grid grid-cols-3 gap-1">
                                    <ToolButton icon={Icons.ball} active={activeTool === 'ball'} onClick={() => setActiveTool('ball')} title="Ball" />
                                    <ToolButton icon={Icons.cone} active={activeTool === 'cone'} onClick={() => setActiveTool('cone')} title="Cone" />
                                    <ToolButton icon={Icons.goal} active={activeTool === 'goal'} onClick={() => setActiveTool('goal')} title="Goal" />
                                    <ToolButton icon={Icons.ladder} active={activeTool === 'ladder'} onClick={() => setActiveTool('ladder')} title="Ladder" />
                                    <ToolButton icon={Icons.hurdle} active={activeTool === 'hurdle'} onClick={() => setActiveTool('hurdle')} title="Hurdle" />
                                    <ToolButton icon={Icons.pole} active={activeTool === 'pole'} onClick={() => setActiveTool('pole')} title="Pole" />
                                    <ToolButton icon={Icons.flag} active={activeTool === 'flag'} onClick={() => setActiveTool('flag')} title="Flag" />
                                    <ToolButton icon={Icons.mannequin} active={activeTool === 'mannequin'} onClick={() => setActiveTool('mannequin')} title="Mannequin" />
                                </div>
                            </div>

                            {/* Players */}
                            <div className="mb-4">
                                <span className="mb-2 block text-xs font-medium text-zinc-400">Player</span>
                                <div className="grid grid-cols-3 gap-1">
                                    {Object.entries(PLAYER_COLORS).map(([color, hex]) => (
                                        <button
                                            key={color}
                                            onClick={() => { setActivePlayerColor(color as keyof typeof PLAYER_COLORS); setActiveTool('player'); }}
                                            className={`h-8 w-8 rounded-lg border-2 transition-all ${activeTool === 'player' && activePlayerColor === color
                                                ? 'border-white scale-110'
                                                : 'border-transparent hover:scale-105'
                                                }`}
                                            style={{ backgroundColor: hex }}
                                            title={color}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Select Tool */}
                            <button
                                onClick={() => setActiveTool('select')}
                                className={`mb-2 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${activeTool === 'select' ? 'bg-blue-600 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                                    }`}
                            >
                                {Icons.select}
                                Select
                            </button>

                            {/* Delete */}
                            {selectedObjectId && (
                                <button
                                    onClick={deleteSelectedObject}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                                >
                                    {Icons.delete}
                                    Delete
                                </button>
                            )}

                            {/* Background picker */}
                            <button
                                onClick={() => setShowBackgroundPicker(true)}
                                className="mt-4 w-full rounded-lg border border-zinc-600 px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
                            >
                                Change Field
                            </button>
                        </div>
                    )}

                    {/* Canvas Area */}
                    <div className="flex-1 overflow-auto bg-zinc-800 p-6">
                        <div className="mx-auto" style={{ width: CANVAS_WIDTH }}>
                            {/* Canvas */}
                            <div className="relative overflow-hidden rounded-xl border border-zinc-600 shadow-2xl">
                                <Stage
                                    ref={stageRef}
                                    width={CANVAS_WIDTH}
                                    height={CANVAS_HEIGHT}
                                    onClick={handleStageClick}
                                    onMouseDown={handleMouseDown}
                                    onMouseUp={handleMouseUp}
                                    style={{ cursor: viewMode === 'preview' ? 'default' : activeTool === 'select' ? 'default' : 'crosshair' }}
                                >
                                    <Layer>
                                        {backgroundImage && (
                                            <KonvaImage image={backgroundImage} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} listening={false} />
                                        )}
                                        {viewMode === 'preview'
                                            ? animatedObjects.map(obj => renderObject(obj, true))
                                            : currentStep?.objects.map(obj => renderObject(obj, false))
                                        }
                                        {viewMode !== 'preview' && <Transformer ref={transformerRef} />}
                                    </Layer>
                                </Stage>

                                {/* Text input overlay */}
                                {showTextInput && (
                                    <div className="absolute z-20" style={{ left: textInputPos.x, top: textInputPos.y }}>
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
                                    </div>
                                )}
                            </div>

                            {/* Preview Controls */}
                            {viewMode === 'preview' && currentPlan.steps && currentPlan.steps.length > 1 && (
                                <div className="mt-4 flex flex-col items-center gap-4">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => {
                                                if (isAnimating) return;
                                                const prevIndex = (previewStepIndex - 1 + (currentPlan.steps?.length || 1)) % (currentPlan.steps?.length || 1);
                                                goToStepAnimated(prevIndex);
                                            }}
                                            disabled={isAnimating}
                                            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${isAnimating ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' : 'bg-zinc-700 text-white hover:bg-zinc-600'
                                                }`}
                                        >
                                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => setIsPlaying(!isPlaying)}
                                            className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                        >
                                            {isPlaying ? (
                                                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                                </svg>
                                            ) : (
                                                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (isAnimating) return;
                                                const nextIndex = (previewStepIndex + 1) % (currentPlan.steps?.length || 1);
                                                goToStepAnimated(nextIndex);
                                            }}
                                            disabled={isAnimating}
                                            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${isAnimating ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' : 'bg-zinc-700 text-white hover:bg-zinc-600'
                                                }`}
                                        >
                                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Speed control */}
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-zinc-500">Speed:</span>
                                        <div className="flex gap-1">
                                            {[500, 1000, 1500, 2000].map(speed => (
                                                <button
                                                    key={speed}
                                                    onClick={() => setAnimationSpeed(speed)}
                                                    className={`px-2 py-1 text-xs rounded transition-colors ${animationSpeed === speed
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
                                                        }`}
                                                >
                                                    {speed === 500 ? 'Fast' : speed === 1000 ? 'Normal' : speed === 1500 ? 'Slow' : 'Very Slow'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Step dots */}
                                    <div className="flex items-center gap-2">
                                        {currentPlan.steps?.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => !isAnimating && goToStepAnimated(index)}
                                                disabled={isAnimating}
                                                className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${index === previewStepIndex
                                                    ? 'bg-blue-500 scale-125'
                                                    : 'bg-zinc-600 hover:bg-zinc-500'
                                                    } ${isAnimating ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                            />
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-zinc-400">
                                            Step {previewStepIndex + 1} / {currentPlan.steps?.length || 0}
                                        </span>
                                        {isAnimating && (
                                            <span className="flex items-center gap-1 text-xs text-blue-400">
                                                <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Animating...
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar - Steps & Info */}
                    <div className="w-80 shrink-0 overflow-y-auto border-l border-zinc-700 bg-zinc-850">
                        {viewMode !== 'preview' ? (
                            <>
                                {/* Steps Tab */}
                                <div className="border-b border-zinc-700 p-4">
                                    <div className="mb-3 flex items-center justify-between">
                                        <span className="text-sm font-medium text-white">Steps</span>
                                        <span className="text-xs text-zinc-500">Click to edit • Drag to reorder</span>
                                    </div>
                                    <div className="space-y-2">
                                        {currentPlan.steps?.map((step, index) => (
                                            <div
                                                key={step.id}
                                                onClick={() => setCurrentStepIndex(index)}
                                                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-2 transition-all ${index === currentStepIndex
                                                    ? 'border-blue-500 bg-blue-500/10'
                                                    : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                                                    }`}
                                            >
                                                <span className="flex h-6 w-6 items-center justify-center rounded bg-zinc-700 text-xs font-medium text-white">
                                                    {index + 1}
                                                </span>
                                                <div className="h-12 w-16 shrink-0 overflow-hidden rounded bg-zinc-700">
                                                    {step.thumbnail ? (
                                                        <img src={step.thumbnail} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500">
                                                            {step.objects.length} obj
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="flex-1 truncate text-sm text-zinc-300">{step.name}</span>
                                                {(currentPlan.steps?.length || 0) > 1 && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); deleteStep(index); }}
                                                        className="flex h-6 w-6 items-center justify-center rounded text-zinc-500 hover:bg-zinc-700 hover:text-white"
                                                    >
                                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                                            <line x1="18" y1="6" x2="6" y2="18" />
                                                            <line x1="6" y1="6" x2="18" y2="18" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={addStep}
                                        className="mt-3 w-full rounded-lg border border-dashed border-zinc-600 py-2 text-sm text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-300"
                                    >
                                        + Add step
                                    </button>
                                </div>

                                {/* Exercise Info */}
                                <div className="p-4">
                                    <span className="mb-3 block text-sm font-medium text-white">Exercise Information</span>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="mb-1 block text-xs text-zinc-400">Title *</label>
                                            <input
                                                type="text"
                                                value={currentPlan.title || ''}
                                                onChange={(e) => setCurrentPlan(prev => ({ ...prev, title: e.target.value }))}
                                                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500"
                                                placeholder="E.g. 4v4 Attacking waves"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs text-zinc-400">Introduction</label>
                                            <input
                                                type="text"
                                                value={currentPlan.introduction || ''}
                                                onChange={(e) => setCurrentPlan(prev => ({ ...prev, introduction: e.target.value }))}
                                                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500"
                                                placeholder="A short introduction"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs text-zinc-400">Description</label>
                                            <textarea
                                                value={currentPlan.description || ''}
                                                onChange={(e) => setCurrentPlan(prev => ({ ...prev, description: e.target.value }))}
                                                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500"
                                                placeholder="A description of the exercise"
                                                rows={3}
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs text-zinc-400">Key Coaching Points</label>
                                            <input
                                                type="text"
                                                value={currentPlan.keyCoachingPoints || ''}
                                                onChange={(e) => setCurrentPlan(prev => ({ ...prev, keyCoachingPoints: e.target.value }))}
                                                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500"
                                                placeholder="Key coaching points"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs text-zinc-400">Tags</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={tagInput}
                                                    onChange={(e) => setTagInput(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                                                    className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500"
                                                    placeholder="Add tag..."
                                                />
                                                <button onClick={handleAddTag} className="rounded-lg bg-zinc-700 px-3 py-2 text-sm text-white hover:bg-zinc-600">
                                                    Add
                                                </button>
                                            </div>
                                            {currentPlan.tags && currentPlan.tags.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    {currentPlan.tags.map(tag => (
                                                        <span key={tag} className="flex items-center gap-1 rounded bg-blue-600/20 px-2 py-1 text-xs text-blue-400">
                                                            {tag}
                                                            <button onClick={() => handleRemoveTag(tag)} className="hover:text-white">
                                                                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                                                    <line x1="18" y1="6" x2="6" y2="18" />
                                                                    <line x1="6" y1="6" x2="18" y2="18" />
                                                                </svg>
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="mb-1 block text-xs text-zinc-400">Duration (min)</label>
                                                <input
                                                    type="number"
                                                    value={currentPlan.duration || ''}
                                                    onChange={(e) => setCurrentPlan(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                                                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                                                    placeholder="15"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-xs text-zinc-400">Min Players</label>
                                                <input
                                                    type="number"
                                                    value={currentPlan.minPlayers || ''}
                                                    onChange={(e) => setCurrentPlan(prev => ({ ...prev, minPlayers: parseInt(e.target.value) || 0 }))}
                                                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                                                    placeholder="8"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs text-zinc-400">Materials</label>
                                            <input
                                                type="text"
                                                value={currentPlan.materials || ''}
                                                onChange={(e) => setCurrentPlan(prev => ({ ...prev, materials: e.target.value }))}
                                                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500"
                                                placeholder="E.g. 3 balls, 24 cones"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* Preview Info Panel */
                            <div className="p-4">
                                <h2 className="mb-2 text-lg font-semibold text-white">{currentPlan.title}</h2>
                                {currentPlan.introduction && (
                                    <p className="mb-4 text-sm text-zinc-400">{currentPlan.introduction}</p>
                                )}
                                {currentPlan.description && (
                                    <div className="mb-4">
                                        <span className="mb-1 block text-xs font-medium text-zinc-500">Description</span>
                                        <p className="text-sm text-zinc-300">{currentPlan.description}</p>
                                    </div>
                                )}
                                {currentPlan.keyCoachingPoints && (
                                    <div className="mb-4">
                                        <span className="mb-1 block text-xs font-medium text-zinc-500">Key Coaching Points</span>
                                        <p className="text-sm text-zinc-300">{currentPlan.keyCoachingPoints}</p>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    {currentPlan.duration && (
                                        <div className="rounded-lg bg-zinc-800 p-3">
                                            <span className="block text-xs text-zinc-500">Duration</span>
                                            <span className="font-medium text-white">{currentPlan.duration} min</span>
                                        </div>
                                    )}
                                    {currentPlan.minPlayers && (
                                        <div className="rounded-lg bg-zinc-800 p-3">
                                            <span className="block text-xs text-zinc-500">Players</span>
                                            <span className="font-medium text-white">{currentPlan.minPlayers}+</span>
                                        </div>
                                    )}
                                </div>
                                {currentPlan.materials && (
                                    <div className="mt-3 rounded-lg bg-zinc-800 p-3">
                                        <span className="block text-xs text-zinc-500">Materials</span>
                                        <span className="text-sm text-white">{currentPlan.materials}</span>
                                    </div>
                                )}
                                {currentPlan.tags && currentPlan.tags.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-1">
                                        {currentPlan.tags.map(tag => (
                                            <span key={tag} className="rounded bg-blue-600/20 px-2 py-1 text-xs text-blue-400">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Background Picker Modal */}
                <AnimatePresence>
                    {showBackgroundPicker && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                            onClick={() => setShowBackgroundPicker(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="max-h-[80vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-zinc-800 p-6 shadow-2xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h3 className="mb-4 text-lg font-semibold text-white">Select background</h3>

                                {/* Football (Color) */}
                                <div className="mb-6">
                                    <span className="mb-3 block text-sm font-medium text-zinc-400">Football (Color)</span>
                                    <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-7">
                                        {FOOTBALL_BACKGROUNDS.football.map(bg => (
                                            <button
                                                key={bg.id}
                                                onClick={() => {
                                                    setCurrentPlan(prev => ({ ...prev, backgroundCategory: 'football', backgroundType: bg.id }));
                                                    setShowBackgroundPicker(false);
                                                }}
                                                className={`overflow-hidden rounded-lg border-2 transition-all hover:scale-105 ${currentPlan.backgroundCategory === 'football' && currentPlan.backgroundType === bg.id
                                                    ? 'border-blue-500'
                                                    : 'border-transparent'
                                                    }`}
                                            >
                                                <img
                                                    src={getBackgroundUrl('football', bg.id, true)}
                                                    alt={bg.name}
                                                    className="aspect-square w-full object-cover"
                                                />
                                                <span className="block truncate px-1 py-1 text-center text-xs text-zinc-300">{bg.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Football B&W */}
                                <div>
                                    <span className="mb-3 block text-sm font-medium text-zinc-400">Football (Black & White)</span>
                                    <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-7">
                                        {FOOTBALL_BACKGROUNDS['football-bw'].map(bg => (
                                            <button
                                                key={bg.id}
                                                onClick={() => {
                                                    setCurrentPlan(prev => ({ ...prev, backgroundCategory: 'football-bw', backgroundType: bg.id }));
                                                    setShowBackgroundPicker(false);
                                                }}
                                                className={`overflow-hidden rounded-lg border-2 transition-all hover:scale-105 ${currentPlan.backgroundCategory === 'football-bw' && currentPlan.backgroundType === bg.id
                                                    ? 'border-blue-500'
                                                    : 'border-transparent'
                                                    }`}
                                            >
                                                <img
                                                    src={getBackgroundUrl('football-bw', bg.id, true)}
                                                    alt={bg.name}
                                                    className="aspect-square w-full object-cover"
                                                />
                                                <span className="block truncate px-1 py-1 text-center text-xs text-zinc-300">{bg.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
}

function ToolButton({ icon, active, onClick, title }: { icon: React.ReactNode; active: boolean; onClick: () => void; title: string }) {
    return (
        <button
            onClick={onClick}
            title={title}
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all ${active ? 'bg-blue-600 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                }`}
        >
            {icon}
        </button>
    );
}

// Modern SVG Icons
const Icons = {
    circle: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="8" />
        </svg>
    ),
    rectangle: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="6" width="16" height="12" rx="1" />
        </svg>
    ),
    zone: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="6" width="16" height="12" rx="2" strokeDasharray="4 2" />
        </svg>
    ),
    line: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="5" y1="19" x2="19" y2="5" />
        </svg>
    ),
    arrow: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="19" x2="19" y2="5" />
            <polyline points="10,5 19,5 19,14" />
        </svg>
    ),
    dashedLine: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 3">
            <line x1="5" y1="19" x2="19" y2="5" />
        </svg>
    ),
    text: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4,7 4,4 20,4 20,7" />
            <line x1="12" y1="4" x2="12" y2="20" />
            <line x1="8" y1="20" x2="16" y2="20" />
        </svg>
    ),
    ball: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3v4.5M12 16.5V21M3 12h4.5M16.5 12H21" />
            <circle cx="12" cy="12" r="3" fill="currentColor" />
        </svg>
    ),
    cone: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4L5 20h14L12 4z" />
        </svg>
    ),
    goal: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16v12H4z" />
            <line x1="4" y1="10" x2="20" y2="10" />
            <line x1="4" y1="14" x2="20" y2="14" />
            <line x1="8" y1="6" x2="8" y2="18" />
            <line x1="12" y1="6" x2="12" y2="18" />
            <line x1="16" y1="6" x2="16" y2="18" />
        </svg>
    ),
    ladder: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="6" y1="4" x2="6" y2="20" />
            <line x1="18" y1="4" x2="18" y2="20" />
            <line x1="6" y1="7" x2="18" y2="7" />
            <line x1="6" y1="12" x2="18" y2="12" />
            <line x1="6" y1="17" x2="18" y2="17" />
        </svg>
    ),
    hurdle: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="10" width="16" height="4" rx="1" fill="currentColor" />
            <line x1="6" y1="14" x2="6" y2="20" />
            <line x1="18" y1="14" x2="18" y2="20" />
        </svg>
    ),
    pole: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <rect x="10" y="4" width="4" height="16" rx="2" />
        </svg>
    ),
    flag: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="6" y1="4" x2="6" y2="20" />
            <path d="M6 4h12l-3 4 3 4H6" fill="currentColor" />
        </svg>
    ),
    mannequin: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="3" />
            <path d="M8 10h8l-1 10h-2v-4h-2v4H9l-1-10z" />
        </svg>
    ),
    select: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
            <path d="M13 13l6 6" />
        </svg>
    ),
    delete: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
    ),
};
