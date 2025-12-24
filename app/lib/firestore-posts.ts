import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
    type DocumentData,
    type FirestoreError,
    type QueryDocumentSnapshot,
    type Timestamp,
    type Unsubscribe,
} from "firebase/firestore";
import { db, storage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "~/lib/firebase";

// ==================== Types ====================

export type PostScope = "Group" | "MultiGroup" | "ClubLobby";
export type PostStatus = "Draft" | "Published" | "Scheduled";
export type VisibilityRole = "AdminsAndStaff" | "Players" | "Parents" | "Public";

export type PostAttachment = {
    id: string;
    fileName: string;
    contentType: string;
    url: string;
    sizeBytes: number;
};

export type Post = {
    id: string;
    clubId: string;
    title: string | null;
    content: string;
    authorId: string;
    authorName: string;
    scope: PostScope;
    targetGroupIds: string[];
    targetGroupNames: string[];
    visibilityRoles: VisibilityRole[];
    attachments: PostAttachment[];
    commentsEnabled: boolean;
    isSticky: boolean;
    postAsClub: boolean;
    status: PostStatus;
    publishedAt: Timestamp | null;
    scheduledPublishAtUtc: Timestamp | null;
    viewCount: number;
    commentCount: number;
    reactionsCount: number;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
};

type FirestorePost = Omit<Post, "id">;

// ==================== Payloads ====================

export type CreatePostPayload = {
    title?: string | null;
    content: string;
    scope: PostScope;
    targetGroupIds?: string[];
    targetGroupNames?: string[];
    visibilityRoles: VisibilityRole[];
    commentsEnabled: boolean;
    notifyRecipients?: boolean;
    isSticky: boolean;
    postAsClub: boolean;
    publishMode: "Draft" | "PublishNow" | "Schedule";
    scheduledPublishAtUtc?: string | null;
};

export type UpdatePostPayload = Partial<CreatePostPayload>;

// ==================== Constants ====================

const CLUBS_COLLECTION = "clubs";
const POSTS_SUBCOLLECTION = "posts";

// ==================== Collection References ====================

function postsCollection(clubId: string) {
    return collection(db, CLUBS_COLLECTION, clubId, POSTS_SUBCOLLECTION);
}

// ==================== Formatters ====================

function formatPost(docSnap: QueryDocumentSnapshot<DocumentData>): Post {
    const data = docSnap.data() as FirestorePost;
    return {
        id: docSnap.id,
        ...data,
    };
}

// ==================== Helper ====================

function removeUndefinedValues<T extends Record<string, unknown>>(obj: T): Partial<T> {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, value]) => value !== undefined)
    ) as Partial<T>;
}

function generateAttachmentId(): string {
    return `att_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ==================== Post CRUD ====================

export function subscribeToPosts(
    clubId: string,
    onData: (posts: Post[]) => void,
    onError?: (error: Error | FirestoreError) => void,
    options?: {
        includeDrafts?: boolean;
        includeScheduled?: boolean;
        status?: PostStatus;
    }
): Unsubscribe {
    const postsRef = postsCollection(clubId);
    
    // Use simple query without compound index requirement
    // Filter by status in memory to avoid needing composite indexes
    const postsQuery = query(postsRef, orderBy("createdAt", "desc"));

    return onSnapshot(
        postsQuery,
        (snapshot) => {
            let posts = snapshot.docs.map(formatPost);
            
            // Filter by status in memory
            if (options?.status) {
                posts = posts.filter(p => p.status === options.status);
            } else if (options?.includeDrafts && !options?.includeScheduled) {
                posts = posts.filter(p => p.status === "Published" || p.status === "Draft");
            } else if (!options?.includeDrafts && options?.includeScheduled) {
                posts = posts.filter(p => p.status === "Published" || p.status === "Scheduled");
            } else if (!options?.includeDrafts && !options?.includeScheduled) {
                // Default: only published posts
                posts = posts.filter(p => p.status === "Published");
            }
            
            onData(posts);
        },
        (error) => {
            onError?.(error);
        }
    );
}

export async function getPostsByStatus(
    clubId: string,
    status: PostStatus
): Promise<Post[]> {
    const postsRef = postsCollection(clubId);
    const postsQuery = query(
        postsRef,
        orderBy("createdAt", "desc")
    );
    
    const snapshot = await getDocs(postsQuery);
    return snapshot.docs.map(formatPost).filter(p => p.status === status);
}

export async function getRecentPosts(
    clubId: string,
    limitCount: number = 5
): Promise<Post[]> {
    const postsRef = postsCollection(clubId);
    const postsQuery = query(
        postsRef,
        orderBy("createdAt", "desc"),
        limit(limitCount * 2) // Fetch more to account for filtering
    );
    
    const snapshot = await getDocs(postsQuery);
    return snapshot.docs
        .map(formatPost)
        .filter(p => p.status === "Published")
        .slice(0, limitCount);
}

export async function createPost(
    clubId: string,
    authorId: string,
    authorName: string,
    payload: CreatePostPayload
): Promise<string> {
    const postsRef = postsCollection(clubId);

    // Determine status and dates based on publish mode
    let status: PostStatus = "Draft";
    let publishedAt: Timestamp | null = null;
    let scheduledPublishAtUtc: Timestamp | null = null;

    if (payload.publishMode === "PublishNow") {
        status = "Published";
        publishedAt = serverTimestamp() as unknown as Timestamp;
    } else if (payload.publishMode === "Schedule" && payload.scheduledPublishAtUtc) {
        status = "Scheduled";
        scheduledPublishAtUtc = new Date(payload.scheduledPublishAtUtc) as unknown as Timestamp;
    }

    const postData: Omit<FirestorePost, "createdAt" | "updatedAt"> = {
        clubId,
        title: payload.title || null,
        content: payload.content,
        authorId,
        authorName,
        scope: payload.scope,
        targetGroupIds: payload.targetGroupIds || [],
        targetGroupNames: payload.targetGroupNames || [],
        visibilityRoles: payload.visibilityRoles,
        attachments: [],
        commentsEnabled: payload.commentsEnabled,
        isSticky: payload.isSticky,
        postAsClub: payload.postAsClub,
        status,
        publishedAt,
        scheduledPublishAtUtc,
        viewCount: 0,
        commentCount: 0,
        reactionsCount: 0,
    };

    const docRef = await addDoc(postsRef, {
        ...postData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    return docRef.id;
}

export async function updatePost(
    clubId: string,
    postId: string,
    payload: UpdatePostPayload
): Promise<void> {
    const postRef = doc(db, CLUBS_COLLECTION, clubId, POSTS_SUBCOLLECTION, postId);

    const updates: Record<string, unknown> = {};

    if (payload.title !== undefined) updates.title = payload.title;
    if (payload.content !== undefined) updates.content = payload.content;
    if (payload.scope !== undefined) updates.scope = payload.scope;
    if (payload.targetGroupIds !== undefined) updates.targetGroupIds = payload.targetGroupIds;
    if (payload.targetGroupNames !== undefined) updates.targetGroupNames = payload.targetGroupNames;
    if (payload.visibilityRoles !== undefined) updates.visibilityRoles = payload.visibilityRoles;
    if (payload.commentsEnabled !== undefined) updates.commentsEnabled = payload.commentsEnabled;
    if (payload.isSticky !== undefined) updates.isSticky = payload.isSticky;
    if (payload.postAsClub !== undefined) updates.postAsClub = payload.postAsClub;

    // Handle publish mode changes
    if (payload.publishMode === "PublishNow") {
        updates.status = "Published";
        updates.publishedAt = serverTimestamp();
    } else if (payload.publishMode === "Draft") {
        updates.status = "Draft";
    } else if (payload.publishMode === "Schedule" && payload.scheduledPublishAtUtc) {
        updates.status = "Scheduled";
        updates.scheduledPublishAtUtc = new Date(payload.scheduledPublishAtUtc);
    }

    await updateDoc(postRef, {
        ...updates,
        updatedAt: serverTimestamp(),
    });
}

export async function deletePost(clubId: string, postId: string): Promise<void> {
    // First get the post to delete attachments
    const postRef = doc(db, CLUBS_COLLECTION, clubId, POSTS_SUBCOLLECTION, postId);
    const postSnap = await getDoc(postRef);

    if (postSnap.exists()) {
        const post = formatPost(postSnap as QueryDocumentSnapshot<DocumentData>);
        
        // Delete all attachments from storage
        for (const attachment of post.attachments) {
            try {
                const fileRef = ref(storage, `clubs/${clubId}/posts/${postId}/${attachment.id}`);
                await deleteObject(fileRef);
            } catch (error) {
                console.warn("Failed to delete attachment:", error);
            }
        }
    }

    await deleteDoc(postRef);
}

export async function getPostById(clubId: string, postId: string): Promise<Post | null> {
    const postRef = doc(db, CLUBS_COLLECTION, clubId, POSTS_SUBCOLLECTION, postId);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) {
        return null;
    }

    return formatPost(postSnap as QueryDocumentSnapshot<DocumentData>);
}

export async function publishPost(clubId: string, postId: string): Promise<void> {
    const postRef = doc(db, CLUBS_COLLECTION, clubId, POSTS_SUBCOLLECTION, postId);
    
    await updateDoc(postRef, {
        status: "Published",
        publishedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}

export async function unpublishPost(clubId: string, postId: string): Promise<void> {
    const postRef = doc(db, CLUBS_COLLECTION, clubId, POSTS_SUBCOLLECTION, postId);
    
    await updateDoc(postRef, {
        status: "Draft",
        publishedAt: null,
        updatedAt: serverTimestamp(),
    });
}

// ==================== Attachment Management ====================

export async function uploadPostAttachment(
    clubId: string,
    postId: string,
    file: File,
    onProgress?: (progress: number) => void
): Promise<PostAttachment> {
    const attachmentId = generateAttachmentId();
    const storagePath = `clubs/${clubId}/posts/${postId}/${attachmentId}`;
    const storageRef = ref(storage, storagePath);

    return new Promise((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                onProgress?.(progress);
            },
            (error) => {
                reject(error);
            },
            async () => {
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    
                    const attachment: PostAttachment = {
                        id: attachmentId,
                        fileName: file.name,
                        contentType: file.type,
                        url: downloadURL,
                        sizeBytes: file.size,
                    };

                    // Update the post with the new attachment
                    const postRef = doc(db, CLUBS_COLLECTION, clubId, POSTS_SUBCOLLECTION, postId);
                    const postSnap = await getDoc(postRef);
                    
                    if (postSnap.exists()) {
                        const currentAttachments = postSnap.data().attachments || [];
                        await updateDoc(postRef, {
                            attachments: [...currentAttachments, attachment],
                            updatedAt: serverTimestamp(),
                        });
                    }

                    resolve(attachment);
                } catch (error) {
                    reject(error);
                }
            }
        );
    });
}

export async function deletePostAttachment(
    clubId: string,
    postId: string,
    attachmentId: string
): Promise<void> {
    // Delete from storage
    const storagePath = `clubs/${clubId}/posts/${postId}/${attachmentId}`;
    const storageRef = ref(storage, storagePath);
    
    try {
        await deleteObject(storageRef);
    } catch (error) {
        console.warn("Failed to delete attachment from storage:", error);
    }

    // Remove from post document
    const postRef = doc(db, CLUBS_COLLECTION, clubId, POSTS_SUBCOLLECTION, postId);
    const postSnap = await getDoc(postRef);
    
    if (postSnap.exists()) {
        const currentAttachments: PostAttachment[] = postSnap.data().attachments || [];
        const updatedAttachments = currentAttachments.filter(a => a.id !== attachmentId);
        
        await updateDoc(postRef, {
            attachments: updatedAttachments,
            updatedAt: serverTimestamp(),
        });
    }
}

// ==================== View Tracking ====================

export async function incrementPostViews(clubId: string, postId: string): Promise<void> {
    const postRef = doc(db, CLUBS_COLLECTION, clubId, POSTS_SUBCOLLECTION, postId);
    const postSnap = await getDoc(postRef);
    
    if (postSnap.exists()) {
        const currentViews = postSnap.data().viewCount || 0;
        await updateDoc(postRef, {
            viewCount: currentViews + 1,
        });
    }
}

// ==================== Helpers for Display ====================

export function formatPostDate(timestamp: Timestamp | null | undefined): string {
    if (!timestamp) return "-";
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp as unknown as string);
    return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

export function getPostAuthorInitials(name: string): string {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

export function getTimeSincePost(timestamp: Timestamp | null | undefined): string {
    if (!timestamp) return "";
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp as unknown as string);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
}

