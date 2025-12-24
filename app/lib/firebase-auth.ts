import type { Auth, NextOrObserver, Unsubscribe, User, UserCredential } from "firebase/auth";
import { app } from "~/lib/firebase";

let authPromise: Promise<Auth> | null = null;

function assertBrowserEnvironment() {
    if (typeof window === "undefined") {
        throw new Error("Firebase Auth is only available in the browser.");
    }
}

async function getAuthInstance(): Promise<Auth> {
    assertBrowserEnvironment();

    if (!authPromise) {
        authPromise = import("firebase/auth").then(({ getAuth }) => getAuth(app));
    }

    return authPromise;
}

export async function subscribeToAuthChanges(callback: NextOrObserver<User>): Promise<Unsubscribe> {
    const auth = await getAuthInstance();
    const { onAuthStateChanged } = await import("firebase/auth");
    return onAuthStateChanged(auth, callback);
}

export async function signInWithEmail(email: string, password: string): Promise<UserCredential> {
    const auth = await getAuthInstance();
    const { signInWithEmailAndPassword } = await import("firebase/auth");
    return signInWithEmailAndPassword(auth, email, password);
}

export async function signOutCurrentUser(): Promise<void> {
    const auth = await getAuthInstance();
    const { signOut } = await import("firebase/auth");
    await signOut(auth);
}

export async function getCurrentUser(): Promise<User | null> {
    const auth = await getAuthInstance();
    return auth.currentUser;
}


