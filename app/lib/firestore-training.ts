import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
    type DocumentData,
    type Timestamp,
    type Unsubscribe,
} from "firebase/firestore";
import { db, storage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "~/lib/firebase";

// Types for drawing objects
export interface DrawingObject {
    id: string;
    type: 'player' | 'ball' | 'cone' | 'goal' | 'ladder' | 'hurdle' | 'pole' | 'mannequin' | 'flag' |
          'circle' | 'rectangle' | 'line' | 'arrow' | 'curved-arrow' | 'dashed-line' | 'text' | 'zone';
    x: number;
    y: number;
    width?: number;
    height?: number;
    radius?: number;
    rotation?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    text?: string;
    fontSize?: number;
    points?: number[]; // For lines/arrows
    playerColor?: 'orange' | 'yellow' | 'green' | 'red' | 'blue' | 'purple' | 'black' | 'gray';
    playerNumber?: string;
    hasJersey?: boolean;
    jerseyColor?: string;
}

// A single step in a training plan
export interface TrainingStep {
    id: string;
    name: string;
    duration: number; // in milliseconds for animation
    objects: DrawingObject[];
    thumbnail?: string;
}

// Training Plan / Exercise
export interface TrainingPlan {
    id?: string;
    clubId: string;
    title: string;
    introduction?: string;
    description?: string;
    keyCoachingPoints?: string;
    tags?: string[];
    duration?: number; // in minutes
    minPlayers?: number;
    materials?: string;
    ageSpanMin?: number;
    ageSpanMax?: number;
    areaWidth?: number;
    areaLength?: number;
    backgroundType: string; // e.g., 'tall_full', 'half_north', etc.
    backgroundCategory: 'football' | 'football-bw';
    steps: TrainingStep[];
    thumbnail?: string;
    gifUrl?: string;
    createdBy: string;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

// Football field backgrounds - using local images from public/stadiums
export const FOOTBALL_BACKGROUNDS = {
    football: [
        { id: 'square_plain', name: 'Box', file: 'square_plain_thumb.png' },
        { id: 'half_north', name: 'Half north', file: 'half_north_thumb.png' },
        { id: 'half_south', name: 'Half south', file: 'half_south_thumb.png' },
        { id: 'quarter_north_corridor', name: 'Quarter north corridor', file: 'quarter_north_corridor_thumb.png' },
        { id: 'quarter_north', name: 'Quarter north', file: 'quarter_north_thumb.png' },
        { id: 'quarter_south_corridor', name: 'Quarter south corridor', file: 'quarter_south_corridor_thumb.png' },
        { id: 'quarter_south', name: 'Quarter south', file: 'quarter_south_thumb.png' },
        { id: 'tall_full_corridor', name: 'Tall full corridor', file: 'tall_full_corridor_thumb.png' },
        { id: 'tall_full', name: 'Tall full', file: 'tall_full_thumb.png' },
        { id: 'tall_plain', name: 'Tall', file: 'tall_plain_thumb.png' },
        { id: 'wide_full', name: 'Wide full', file: 'wide_full_thumb.png' },
        { id: 'wide_plain', name: 'Wide', file: 'wide_plain_thumb.png' },
        { id: 'perspective', name: 'Perspective', file: 'perspective_thumb.png' },
    ],
    'football-bw': [
        { id: 'square_plain', name: 'Box', file: 'square_plain_thumb.png' },
        { id: 'half_north', name: 'Half north', file: 'half_north_thumb.png' },
        { id: 'half_south', name: 'Half south', file: 'half_south_thumb.png' },
        { id: 'quarter_north_corridor', name: 'Quarter north corridor', file: 'quarter_north_corridor_thumb.png' },
        { id: 'quarter_north', name: 'Quarter north', file: 'quarter_north_thumb.png' },
        { id: 'quarter_south_corridor', name: 'Quarter south corridor', file: 'quarter_south_corridor_thumb.png' },
        { id: 'quarter_south', name: 'Quarter south', file: 'quarter_south_thumb.png' },
        { id: 'tall_full_corridor', name: 'Tall full corridor', file: 'tall_full_corridor_thumb.png' },
        { id: 'tall_full', name: 'Tall full', file: 'tall_full_thumb.png' },
        { id: 'tall_plain', name: 'Tall', file: 'tall_plain_thumb.png' },
        { id: 'wide_full_corridor', name: 'Wide full corridor', file: 'wide_full_corridor_thumb.png' },
        { id: 'wide_full', name: 'Wide full', file: 'wide_full_thumb.png' },
        { id: 'wide_plain', name: 'Wide', file: 'wide_plain_thumb.png' },
        { id: 'perspective', name: 'Perspective', file: 'perspective_thumb.png' },
    ],
};

// Helper to get background image URL - using local images from public/stadiums
export function getBackgroundUrl(category: 'football' | 'football-bw', id: string, _isThumbnail = false): string {
    const bg = FOOTBALL_BACKGROUNDS[category].find(b => b.id === id);
    if (!bg) return '';
    
    // Local path: /stadiums/ for color, /stadiums/bw/ for black & white
    const basePath = category === 'football-bw' ? '/stadiums/bw' : '/stadiums';
    return `${basePath}/${bg.file}`;
}

// Player colors
export const PLAYER_COLORS = {
    orange: '#f97316',
    yellow: '#eab308',
    green: '#22c55e',
    red: '#ef4444',
    blue: '#3b82f6',
    purple: '#a855f7',
    black: '#171717',
    gray: '#6b7280',
};

// Jersey colors for player icons
export const JERSEY_COLORS = {
    orange: '#f97316',
    yellow: '#eab308',
    green: '#22c55e',
    red: '#ef4444',
    blue: '#3b82f6',
    purple: '#a855f7',
    teal: '#14b8a6',
    black: '#171717',
};

// Create a new training plan
export async function createTrainingPlan(plan: Omit<TrainingPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
        const docRef = await addDoc(collection(db, 'training_plans'), {
            ...plan,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error('Error creating training plan:', error);
        throw error;
    }
}

// Update a training plan
export async function updateTrainingPlan(id: string, updates: Partial<TrainingPlan>): Promise<void> {
    try {
        const docRef = doc(db, 'training_plans', id);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error updating training plan:', error);
        throw error;
    }
}

// Delete a training plan
export async function deleteTrainingPlan(id: string): Promise<void> {
    try {
        const docRef = doc(db, 'training_plans', id);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Error deleting training plan:', error);
        throw error;
    }
}

// Get all training plans for a club
export async function getClubTrainingPlans(clubId: string): Promise<TrainingPlan[]> {
    try {
        const q = query(
            collection(db, 'training_plans'),
            where('clubId', '==', clubId),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        } as TrainingPlan));
    } catch (error) {
        console.error('Error getting club training plans:', error);
        throw error;
    }
}

// Get a single training plan
export async function getTrainingPlan(id: string): Promise<TrainingPlan | null> {
    try {
        const docRef = doc(db, 'training_plans', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data(),
            } as TrainingPlan;
        }
        return null;
    } catch (error) {
        console.error('Error getting training plan:', error);
        throw error;
    }
}

// Subscribe to training plans for a club (real-time updates)
export function subscribeToClubTrainingPlans(
    clubId: string,
    callback: (plans: TrainingPlan[]) => void
): Unsubscribe {
    const q = query(
        collection(db, 'training_plans'),
        where('clubId', '==', clubId),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const plans = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        } as TrainingPlan));
        callback(plans);
    });
}

// Upload thumbnail image
export async function uploadPlanThumbnail(planId: string, blob: Blob): Promise<string> {
    const storageRef = ref(storage, `training_plans/${planId}/thumbnail.png`);
    const uploadTask = uploadBytesResumable(storageRef, blob);
    
    return new Promise((resolve, reject) => {
        uploadTask.on(
            'state_changed',
            null,
            (error) => reject(error),
            async () => {
                const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadUrl);
            }
        );
    });
}

// Upload GIF
export async function uploadPlanGif(planId: string, blob: Blob): Promise<string> {
    const storageRef = ref(storage, `training_plans/${planId}/animation.gif`);
    const uploadTask = uploadBytesResumable(storageRef, blob);
    
    return new Promise((resolve, reject) => {
        uploadTask.on(
            'state_changed',
            null,
            (error) => reject(error),
            async () => {
                const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadUrl);
            }
        );
    });
}

// Generate unique ID for objects
export function generateObjectId(): string {
    return `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Generate unique ID for steps
export function generateStepId(): string {
    return `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
