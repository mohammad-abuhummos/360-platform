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

export type RegistrationVisibility = "public" | "club_lobby" | "unlisted";
export type RegistrationStatus = "open" | "closed" | "draft";
export type FormFieldType = "short_answer" | "long_answer" | "email" | "phone" | "date" | "number" | "single_choice" | "multiple_choice" | "file_upload";

export type FormField = {
    id: string;
    type: FormFieldType;
    label: string;
    description?: string;
    required: boolean;
    isDefault: boolean;
    order: number;
    options?: string[]; // For single_choice and multiple_choice
    validation?: {
        minLength?: number;
        maxLength?: number;
        min?: number;
        max?: number;
        pattern?: string;
    };
};

export type FormSection = {
    id: string;
    title: string;
    description?: string;
    order: number;
    fields: FormField[];
};

export type Package = {
    id: string;
    title: string;
    description?: string;
    products: PackageProduct[];
    eligibilityRules: EligibilityRule[];
};

export type PackageProduct = {
    id: string;
    name: string;
    price: number;
    currency: string;
    paymentType: "one_time" | "recurring";
    recurringInterval?: "monthly" | "quarterly" | "yearly";
};

export type EligibilityRule = {
    id: string;
    fieldId: string;
    operator: "equals" | "not_equals" | "contains" | "date_between" | "date_before" | "date_after";
    value: string | string[] | { start: string; end: string };
};

export type RegistrationAttachment = {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
};

export type Registration = {
    id: string;
    clubId: string;
    title: string;
    description?: string;
    categoryId?: string;
    categoryName?: string;
    imageUrl?: string;
    logoUrl?: string;
    attachments?: RegistrationAttachment[];
    publicSlug?: string;
    visibility: RegistrationVisibility;
    status: RegistrationStatus;
    sections: FormSection[];
    packages: Package[];
    sendEmailOnSubmission: boolean;
    customEmailEnabled: boolean;
    customEmailSubject?: string;
    customEmailBody?: string;
    limitResponses: boolean;
    maxResponses?: number;
    requireAccount: boolean;
    registrationCount: number;
    isArchived: boolean;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
};

export type RegistrationCategory = {
    id: string;
    clubId: string;
    name: string;
    description?: string;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
};

export type RegistrationSubmission = {
    id: string;
    registrationId: string;
    clubId: string;
    userId?: string;
    userEmail: string;
    data: Record<string, unknown>;
    packageId?: string;
    paymentStatus?: "pending" | "completed" | "failed";
    submittedAt?: Timestamp;
};

type FirestoreRegistration = Omit<Registration, "id">;
type FirestoreCategory = Omit<RegistrationCategory, "id">;

// ==================== Payloads ====================

export type CreateRegistrationPayload = {
    title: string;
    description?: string;
    categoryId?: string;
    categoryName?: string;
    imageUrl?: string;
    logoUrl?: string;
    attachments?: RegistrationAttachment[];
    visibility: RegistrationVisibility;
    status: RegistrationStatus;
    sections: FormSection[];
    packages: Package[];
    sendEmailOnSubmission: boolean;
    customEmailEnabled: boolean;
    customEmailSubject?: string;
    customEmailBody?: string;
    limitResponses: boolean;
    maxResponses?: number;
    requireAccount: boolean;
};

export type UpdateRegistrationPayload = Partial<CreateRegistrationPayload> & {
    isArchived?: boolean;
};

export type CreateCategoryPayload = {
    name: string;
    description?: string;
};

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;

// ==================== Constants ====================

const CLUBS_COLLECTION = "clubs";
const REGISTRATIONS_SUBCOLLECTION = "registrations";
const CATEGORIES_SUBCOLLECTION = "registration_categories";
const SUBMISSIONS_SUBCOLLECTION = "registration_submissions";

// Default form fields for new registrations
export const DEFAULT_FORM_FIELDS: FormField[] = [
    {
        id: "field_first_name",
        type: "short_answer",
        label: "First name",
        required: true,
        isDefault: true,
        order: 0,
    },
    {
        id: "field_last_name",
        type: "short_answer",
        label: "Last name",
        required: true,
        isDefault: true,
        order: 1,
    },
    {
        id: "field_email",
        type: "email",
        label: "Email",
        required: true,
        isDefault: true,
        order: 2,
    },
];

// Default categories for seeding
const DEFAULT_CATEGORIES: Omit<FirestoreCategory, "clubId">[] = [
    { name: "Academy", description: "Academy registration forms" },
    { name: "Coach Forms", description: "Forms for coaches" },
    { name: "International Cup", description: "International tournament registrations" },
    { name: "JKFC Tournament", description: "JKFC tournament forms" },
];

// Sample registrations for seeding
const DEFAULT_REGISTRATIONS: Omit<FirestoreRegistration, "clubId">[] = [
    {
        title: "Official Winter Package(Black)",
        categoryId: "",
        categoryName: "Academy",
        visibility: "public",
        status: "open",
        sections: [{
            id: "section_main",
            title: "Main",
            order: 0,
            fields: DEFAULT_FORM_FIELDS,
        }],
        packages: [],
        sendEmailOnSubmission: true,
        customEmailEnabled: false,
        limitResponses: false,
        requireAccount: true,
        registrationCount: 5,
        isArchived: false,
    },
    {
        title: "Video Request Form",
        categoryId: "",
        categoryName: "Academy",
        visibility: "public",
        status: "open",
        sections: [{
            id: "section_main",
            title: "Main",
            order: 0,
            fields: DEFAULT_FORM_FIELDS,
        }],
        packages: [],
        sendEmailOnSubmission: true,
        customEmailEnabled: false,
        limitResponses: false,
        requireAccount: true,
        registrationCount: 5,
        isArchived: false,
    },
    {
        title: "🇦🇪 Arab Elite Cup – Dubai 2025",
        categoryId: "",
        categoryName: "International Cup",
        visibility: "public",
        status: "open",
        sections: [{
            id: "section_main",
            title: "Main",
            order: 0,
            fields: DEFAULT_FORM_FIELDS,
        }],
        packages: [],
        sendEmailOnSubmission: true,
        customEmailEnabled: false,
        limitResponses: false,
        requireAccount: true,
        registrationCount: 39,
        isArchived: false,
    },
    {
        title: 'The "Jordan Cup" football tournament for players born in 2013 / 2014.',
        categoryId: "",
        categoryName: "JKFC Tournament",
        visibility: "club_lobby",
        status: "closed",
        sections: [{
            id: "section_main",
            title: "Main",
            order: 0,
            fields: DEFAULT_FORM_FIELDS,
        }],
        packages: [],
        sendEmailOnSubmission: true,
        customEmailEnabled: false,
        limitResponses: false,
        requireAccount: true,
        registrationCount: 71,
        isArchived: false,
    },
    {
        title: "Autumn 2025",
        categoryId: "",
        categoryName: "Academy",
        visibility: "public",
        status: "closed",
        sections: [{
            id: "section_main",
            title: "Main",
            order: 0,
            fields: DEFAULT_FORM_FIELDS,
        }],
        packages: [],
        sendEmailOnSubmission: true,
        customEmailEnabled: false,
        limitResponses: false,
        requireAccount: true,
        registrationCount: 3,
        isArchived: false,
    },
];

// ==================== Collection References ====================

function registrationsCollection(clubId: string) {
    return collection(db, CLUBS_COLLECTION, clubId, REGISTRATIONS_SUBCOLLECTION);
}

function categoriesCollection(clubId: string) {
    return collection(db, CLUBS_COLLECTION, clubId, CATEGORIES_SUBCOLLECTION);
}

// ==================== Formatters ====================

function formatRegistration(docSnap: QueryDocumentSnapshot<DocumentData>): Registration {
    const data = docSnap.data() as FirestoreRegistration;
    return {
        id: docSnap.id,
        ...data,
    };
}

function formatCategory(docSnap: QueryDocumentSnapshot<DocumentData>): RegistrationCategory {
    const data = docSnap.data() as FirestoreCategory;
    return {
        id: docSnap.id,
        ...data,
    };
}

// ==================== Seeding ====================

const seededClubs = new Set<string>();

async function ensureSeedData(clubId: string) {
    if (seededClubs.has(clubId)) {
        return;
    }

    const clubRef = doc(db, CLUBS_COLLECTION, clubId);
    const clubSnap = await getDoc(clubRef);
    if (clubSnap.exists() && clubSnap.data()?.registrationsSeeded) {
        seededClubs.add(clubId);
        return;
    }

    // Seed categories
    const catRef = categoriesCollection(clubId);
    const catSnapshot = await getDocs(query(catRef, limit(1)));

    const categoryMap: Record<string, string> = {};
    if (catSnapshot.empty) {
        for (const category of DEFAULT_CATEGORIES) {
            const catDoc = await addDoc(catRef, {
                ...category,
                clubId,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            categoryMap[category.name] = catDoc.id;
        }
    }

    // Seed registrations
    const regRef = registrationsCollection(clubId);
    const regSnapshot = await getDocs(query(regRef, limit(1)));

    if (regSnapshot.empty) {
        const baseDate = new Date("2025-10-24");
        for (let i = 0; i < DEFAULT_REGISTRATIONS.length; i++) {
            const reg = DEFAULT_REGISTRATIONS[i];
            const createdDate = new Date(baseDate);
            createdDate.setDate(createdDate.getDate() - i * 11);
            
            await addDoc(regRef, {
                ...reg,
                clubId,
                categoryId: reg.categoryName ? categoryMap[reg.categoryName] || "" : "",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
        }
    }

    await setDoc(
        clubRef,
        {
            registrationsSeeded: true,
            updatedAt: serverTimestamp(),
        },
        { merge: true }
    );

    seededClubs.add(clubId);
}

// ==================== Registration CRUD ====================

export function subscribeToRegistrations(
    clubId: string,
    onData: (registrations: Registration[]) => void,
    onError?: (error: Error | FirestoreError) => void,
    includeArchived: boolean = false
): Unsubscribe {
    void ensureSeedData(clubId).catch((error) => {
        if (onError && error instanceof Error) {
            onError(error);
        }
    });

    const regRef = registrationsCollection(clubId);
    let regQuery;
    
    if (includeArchived) {
        regQuery = query(regRef, where("isArchived", "==", true), orderBy("createdAt", "desc"));
    } else {
        regQuery = query(regRef, where("isArchived", "==", false), orderBy("createdAt", "desc"));
    }

    return onSnapshot(
        regQuery,
        (snapshot) => {
            const registrations = snapshot.docs.map(formatRegistration);
            onData(registrations);
        },
        (error) => {
            onError?.(error);
        }
    );
}

// Helper to remove undefined values (Firestore doesn't accept undefined)
function removeUndefinedValues<T extends Record<string, unknown>>(obj: T): Partial<T> {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, value]) => value !== undefined)
    ) as Partial<T>;
}

export async function createRegistration(clubId: string, payload: CreateRegistrationPayload): Promise<string> {
    const regRef = registrationsCollection(clubId);
    
    // Clean payload by removing undefined values
    const cleanPayload = removeUndefinedValues(payload);
    
    const docRef = await addDoc(regRef, {
        ...cleanPayload,
        clubId,
        registrationCount: 0,
        isArchived: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    
    return docRef.id;
}

export async function updateRegistration(clubId: string, registrationId: string, payload: UpdateRegistrationPayload): Promise<void> {
    const regRef = doc(db, CLUBS_COLLECTION, clubId, REGISTRATIONS_SUBCOLLECTION, registrationId);
    
    // Clean payload by removing undefined values
    const cleanPayload = removeUndefinedValues(payload);
    
    await updateDoc(regRef, {
        ...cleanPayload,
        updatedAt: serverTimestamp(),
    });
}

export async function deleteRegistration(clubId: string, registrationId: string): Promise<void> {
    const regRef = doc(db, CLUBS_COLLECTION, clubId, REGISTRATIONS_SUBCOLLECTION, registrationId);
    await deleteDoc(regRef);
}

export async function getRegistrationById(clubId: string, registrationId: string): Promise<Registration | null> {
    const regRef = doc(db, CLUBS_COLLECTION, clubId, REGISTRATIONS_SUBCOLLECTION, registrationId);
    const regSnap = await getDoc(regRef);
    
    if (!regSnap.exists()) {
        return null;
    }
    
    return formatRegistration(regSnap);
}

export async function archiveRegistration(clubId: string, registrationId: string): Promise<void> {
    await updateRegistration(clubId, registrationId, { isArchived: true });
}

export async function unarchiveRegistration(clubId: string, registrationId: string): Promise<void> {
    await updateRegistration(clubId, registrationId, { isArchived: false });
}

// ==================== Category CRUD ====================

export function subscribeToCategories(
    clubId: string,
    onData: (categories: RegistrationCategory[]) => void,
    onError?: (error: Error | FirestoreError) => void
): Unsubscribe {
    void ensureSeedData(clubId).catch((error) => {
        if (onError && error instanceof Error) {
            onError(error);
        }
    });

    const catRef = categoriesCollection(clubId);
    const catQuery = query(catRef, orderBy("name"));

    return onSnapshot(
        catQuery,
        (snapshot) => {
            const categories = snapshot.docs.map(formatCategory);
            onData(categories);
        },
        (error) => {
            onError?.(error);
        }
    );
}

export async function createCategory(clubId: string, payload: CreateCategoryPayload): Promise<string> {
    const catRef = categoriesCollection(clubId);
    
    // Clean payload by removing undefined values
    const cleanPayload = removeUndefinedValues(payload);
    
    const docRef = await addDoc(catRef, {
        ...cleanPayload,
        clubId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    
    return docRef.id;
}

export async function updateCategory(clubId: string, categoryId: string, payload: UpdateCategoryPayload): Promise<void> {
    const catRef = doc(db, CLUBS_COLLECTION, clubId, CATEGORIES_SUBCOLLECTION, categoryId);
    
    // Clean payload by removing undefined values
    const cleanPayload = removeUndefinedValues(payload);
    
    await updateDoc(catRef, {
        ...cleanPayload,
        updatedAt: serverTimestamp(),
    });
}

export async function deleteCategory(clubId: string, categoryId: string): Promise<void> {
    const catRef = doc(db, CLUBS_COLLECTION, clubId, CATEGORIES_SUBCOLLECTION, categoryId);
    await deleteDoc(catRef);
}

// ==================== Helpers ====================

export function generateFieldId(): string {
    return `field_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function generateSectionId(): string {
    return `section_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function generatePackageId(): string {
    return `package_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function generateProductId(): string {
    return `product_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function generateRuleId(): string {
    return `rule_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function getVisibilityLabel(visibility: RegistrationVisibility): string {
    switch (visibility) {
        case "public":
            return "Public";
        case "club_lobby":
            return "Club lobby";
        case "unlisted":
            return "Unlisted";
        default:
            return visibility;
    }
}

export function getStatusLabel(status: RegistrationStatus): string {
    switch (status) {
        case "open":
            return "Open";
        case "closed":
            return "Closed";
        case "draft":
            return "Draft";
        default:
            return status;
    }
}

export function getFieldTypeLabel(type: FormFieldType): string {
    switch (type) {
        case "short_answer":
            return "Short answer";
        case "long_answer":
            return "Long answer";
        case "email":
            return "Email";
        case "phone":
            return "Phone";
        case "date":
            return "Date";
        case "number":
            return "Number";
        case "single_choice":
            return "Single choice";
        case "multiple_choice":
            return "Multiple choice";
        case "file_upload":
            return "File upload";
        default:
            return type;
    }
}

export function generatePublicSlug(): string {
    return `reg_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
}

export function getPublicFormUrl(clubId: string, registrationId: string): string {
    // In production, this would be a proper domain
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    return `${baseUrl}/forms/${clubId}/${registrationId}`;
}

// ==================== File Upload ====================

export type UploadProgressCallback = (progress: number) => void;

export async function uploadRegistrationFile(
    clubId: string,
    registrationId: string,
    file: File,
    fileType: "logo" | "image" | "attachment" | "submission",
    onProgress?: UploadProgressCallback
): Promise<{ url: string; path: string; name: string; type: string; size: number }> {
    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filePath = `clubs/${clubId}/registrations/${registrationId}/${fileType}/${timestamp}_${safeFileName}`;
    
    const storageRef = ref(storage, filePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                onProgress?.(progress);
            },
            (error) => {
                console.error("Upload error:", error);
                reject(error);
            },
            async () => {
                try {
                    const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve({ 
                        url: downloadUrl, 
                        path: filePath,
                        name: file.name,
                        type: file.type,
                        size: file.size,
                    });
                } catch (error) {
                    reject(error);
                }
            }
        );
    });
}

export async function deleteRegistrationFile(filePath: string): Promise<void> {
    try {
        const storageRef = ref(storage, filePath);
        await deleteObject(storageRef);
    } catch (error) {
        console.error("Error deleting file:", error);
        throw error;
    }
}

// ==================== Submissions ====================

type FirestoreSubmission = Omit<RegistrationSubmission, "id">;

function submissionsCollection(clubId: string, registrationId: string) {
    return collection(db, CLUBS_COLLECTION, clubId, REGISTRATIONS_SUBCOLLECTION, registrationId, "submissions");
}

function formatSubmission(docSnap: QueryDocumentSnapshot<DocumentData>): RegistrationSubmission {
    const data = docSnap.data() as FirestoreSubmission;
    return {
        id: docSnap.id,
        ...data,
    };
}

export function subscribeToSubmissions(
    clubId: string,
    registrationId: string,
    onData: (submissions: RegistrationSubmission[]) => void,
    onError?: (error: Error | FirestoreError) => void
): Unsubscribe {
    const subRef = submissionsCollection(clubId, registrationId);
    const subQuery = query(subRef, orderBy("submittedAt", "desc"));

    return onSnapshot(
        subQuery,
        (snapshot) => {
            const submissions = snapshot.docs.map(formatSubmission);
            onData(submissions);
        },
        (error) => {
            onError?.(error);
        }
    );
}

export async function getSubmissionsCount(clubId: string, registrationId: string): Promise<number> {
    const subRef = submissionsCollection(clubId, registrationId);
    const snapshot = await getDocs(subRef);
    return snapshot.size;
}

export async function createSubmission(
    clubId: string,
    registrationId: string,
    data: Omit<RegistrationSubmission, "id" | "submittedAt">
): Promise<string> {
    const subRef = submissionsCollection(clubId, registrationId);
    
    // Clean data by removing undefined values
    const cleanData = removeUndefinedValues(data as Record<string, unknown>);
    
    const docRef = await addDoc(subRef, {
        ...cleanData,
        submittedAt: serverTimestamp(),
    });

    // Update registration count
    const regRef = doc(db, CLUBS_COLLECTION, clubId, REGISTRATIONS_SUBCOLLECTION, registrationId);
    const regSnap = await getDoc(regRef);
    if (regSnap.exists()) {
        const currentCount = regSnap.data().registrationCount || 0;
        await updateDoc(regRef, {
            registrationCount: currentCount + 1,
            updatedAt: serverTimestamp(),
        });
    }

    return docRef.id;
}

export async function deleteSubmission(clubId: string, registrationId: string, submissionId: string): Promise<void> {
    const subRef = doc(db, CLUBS_COLLECTION, clubId, REGISTRATIONS_SUBCOLLECTION, registrationId, "submissions", submissionId);
    await deleteDoc(subRef);

    // Update registration count
    const regRef = doc(db, CLUBS_COLLECTION, clubId, REGISTRATIONS_SUBCOLLECTION, registrationId);
    const regSnap = await getDoc(regRef);
    if (regSnap.exists()) {
        const currentCount = regSnap.data().registrationCount || 0;
        await updateDoc(regRef, {
            registrationCount: Math.max(0, currentCount - 1),
            updatedAt: serverTimestamp(),
        });
    }
}

