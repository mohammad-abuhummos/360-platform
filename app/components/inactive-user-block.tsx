import { useAuth } from "~/context/auth-context";

export function InactiveUserBlock() {
    const { signOut } = useAuth();

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4">
            <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-xl bg-red-500/20">
                    <svg
                        className="size-8 text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                        />
                    </svg>
                </div>
                <h1 className="text-xl font-semibold text-white">
                    Your profile has been deactivated
                </h1>
                <p className="mt-2 text-sm text-zinc-400">
                    Please contact your administrator for access.
                </p>
                <button
                    type="button"
                    onClick={() => void signOut()}
                    className="mt-6 w-full rounded-xl border border-amber-500 bg-amber-500 px-4 py-3 font-semibold text-amber-950 transition hover:bg-amber-400"
                >
                    Log out
                </button>
            </div>
        </div>
    );
}
