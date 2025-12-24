import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, addDoc, updateDoc, deleteDoc, getDocs, getDoc, query, orderBy, Timestamp, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAtxja0nrAKoqsE7E5W7_d3snPsrASRQ-8",
    authDomain: "platfrom-bf2a3.firebaseapp.com",
    projectId: "platfrom-bf2a3",
    storageBucket: "platfrom-bf2a3.firebasestorage.app",
    messagingSenderId: "962318157238",
    appId: "1:962318157238:web:f9183ade47cd60c494ed17"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Types
export interface VideoAnalysisClip {
    id: string;
    name: string;
    startTime: number;
    endTime: number;
    duration: number;
    type: string;
    description?: string;
}

export interface VideoAnalysisAnnotation {
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

export interface VideoAnalysis {
    id?: string;
    name: string;
    description?: string;
    videoFileName?: string;
    videoDuration?: number;
    // Canvas dimensions when annotations were created (for scaling in preview)
    canvasWidth?: number;
    canvasHeight?: number;
    clips: VideoAnalysisClip[];
    annotations: VideoAnalysisAnnotation[];
    createdAt?: any;
    updatedAt?: any;
}

// Collection reference
const COLLECTION_NAME = 'video_analyses';

// Create a new video analysis
export async function createVideoAnalysis(analysis: Omit<VideoAnalysis, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...analysis,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error('Error creating video analysis:', error);
        throw error;
    }
}

// Update an existing video analysis
export async function updateVideoAnalysis(id: string, updates: Partial<VideoAnalysis>): Promise<void> {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error updating video analysis:', error);
        throw error;
    }
}

// Delete a video analysis
export async function deleteVideoAnalysis(id: string): Promise<void> {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Error deleting video analysis:', error);
        throw error;
    }
}

// Get all video analyses
export async function getAllVideoAnalyses(): Promise<VideoAnalysis[]> {
    try {
        const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        } as VideoAnalysis));
    } catch (error) {
        console.error('Error getting video analyses:', error);
        throw error;
    }
}

// Get a single video analysis by ID
export async function getVideoAnalysis(id: string): Promise<VideoAnalysis | null> {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data(),
            } as VideoAnalysis;
        }
        return null;
    } catch (error) {
        console.error('Error getting video analysis:', error);
        throw error;
    }
}

// Save clips and annotations for a video analysis
export async function saveVideoAnalysisData(
    id: string, 
    clips: VideoAnalysisClip[], 
    annotations: VideoAnalysisAnnotation[],
    canvasWidth?: number,
    canvasHeight?: number
): Promise<void> {
    try {
        const updates: Partial<VideoAnalysis> = { clips, annotations };
        if (canvasWidth !== undefined) updates.canvasWidth = canvasWidth;
        if (canvasHeight !== undefined) updates.canvasHeight = canvasHeight;
        await updateVideoAnalysis(id, updates);
    } catch (error) {
        console.error('Error saving video analysis data:', error);
        throw error;
    }
}

export { app, db, storage, ref, uploadBytesResumable, getDownloadURL, deleteObject };

