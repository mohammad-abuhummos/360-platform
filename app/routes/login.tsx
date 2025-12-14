import clsx from "clsx";
import { useEffect, useState, type FormEvent } from "react";
import type { Route } from "./+types/login";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { Fieldset, Field, Label } from "../components/fieldset";
import { Checkbox, CheckboxField, CheckboxGroup } from "../components/checkbox";
import { Heading } from "../components/heading";
import { Text, TextLink } from "../components/text";
import { Link } from "../components/link";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Login | Football Platform" },
        { name: "description", content: "Sign in to access the Football Platform." },
    ];
}

export default function Login() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [theme, setTheme] = useState<"light" | "dark">("dark");
    const isDark = theme === "dark";

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        const savedTheme = window.localStorage.getItem("theme");
        if (savedTheme === "light" || savedTheme === "dark") {
            setTheme(savedTheme);
            return;
        }

        if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
            setTheme("dark");
            return;
        }

        setTheme("light");
    }, []);

    useEffect(() => {
        if (typeof document === "undefined" || typeof window === "undefined") {
            return;
        }

        const root = document.documentElement;
        root.dataset.theme = theme;
        root.classList.toggle("dark", theme === "dark");
        window.localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((current) => (current === "dark" ? "light" : "dark"));
    };

    const connectToAuthApi = async () => {
        // Reserved for the future authentication API connection.
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            await connectToAuthApi();
        } finally {
            setIsSubmitting(false);
        }
    };

    const backgroundGradient = isDark
        ? "linear-gradient(155deg,hsl(0, 0%, 25%), hsl(0, 0%, 0%))"
        : "linear-gradient(155deg,hsl(210, 40%, 98%), hsl(210, 30%, 90%))";

    const cardClasses = clsx(
        "grid items-stretch rounded-[32px] shadow-2xl backdrop-blur-3xl lg:grid-cols-[0.45fr_0.55fr] transition-colors duration-500",
        isDark
            ? "border border-black/15 bg-black/5 shadow-black/40 ring-1 ring-black/10"
            : "border border-white/60 bg-white/80 shadow-black/10 ring-1 ring-white/60"
    );

    const formPanelBackground = isDark
        ? "linear-gradient(155deg,hsl(0, 0%, 25%), hsl(0, 0%, 0%))"
        : "linear-gradient(155deg,hsl(0, 0%, 100%), hsl(210, 30%, 92%))";

    const formPanelClasses = clsx(
        "relative flex flex-col h-screen rounded-r-[28px] p-8 sm:p-12 transition-colors duration-500 lg:-mr-[30px] lg:rounded-r-[40px] lg:z-10",
        isDark ? "bg-black text-white lg:shadow-2xl lg:shadow-black/60" : "bg-white text-zinc-900 lg:shadow-2xl lg:shadow-black/15"
    );

    const videoPanelClasses = clsx(
        "relative hidden min-h-[420px] overflow-hidden transition-colors duration-500 lg:flex",
        isDark ? "border border-black/20 bg-black/40" : "border border-white/70 bg-white/70"
    );

    const videoOverlayClasses = clsx(
        "absolute inset-0 transition-colors duration-500",
        isDark
            ? "bg-linear-to-t from-black/70 via-black/30 to-transparent"
            : "bg-linear-to-t from-white/80 via-white/40 to-transparent"
    );

    const videoHeadlineClasses = clsx(
        "text-3xl font-semibold leading-tight sm:text-2xl",
        isDark ? "text-white" : "text-zinc-900"
    );

    const videoBodyClasses = clsx(
        "mt-3 text-base/7",
        isDark ? "text-white/80" : "text-zinc-700"
    );

    const themeButtonText = isDark ? "Light mode" : "Dark mode";
    const themeButtonAriaLabel = `Switch to ${isDark ? "light" : "dark"} mode`;

    return (
        <main
            data-theme={theme}
            style={{ background: backgroundGradient }}
            className={clsx("min-h-screen transition-colors duration-500", isDark && "dark")}
        >
            <div className="">
                <div className={cardClasses}>
                    <section
                        style={{ background: formPanelBackground }}
                        className={formPanelClasses}
                    >
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <img
                                    src="/logo.jpeg"
                                    alt="360 logo"
                                    className="h-14 w-14 rounded-2xl object-cover shadow-lg shadow-zinc-900/10"
                                />
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
                                        Football Platform
                                    </p>
                                    <Heading level={1} className="mt-2 text-3xl font-semibold">
                                        Welcome back
                                    </Heading>
                                </div>
                            </div>
                            <Button
                                type="button"
                                outline
                                aria-pressed={isDark}
                                aria-label={themeButtonAriaLabel}
                                title={themeButtonAriaLabel}
                                onClick={toggleTheme}
                                className="w-full justify-center sm:w-auto"
                            >
                                {themeButtonText}
                            </Button>
                        </div>

                        <Text className="mt-6 text-zinc-600 dark:text-zinc-400">
                            Sign in with your credentials to continue. You can plug in your
                            preferred auth API inside this flow once it&apos;s ready.
                        </Text>

                        <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-6">
                            <Fieldset className="space-y-6">
                                <Field>
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" name="email" type="email" placeholder="you@example.com" required />
                                </Field>
                                <Field>
                                    <Label htmlFor="password">Password</Label>
                                    <Input id="password" name="password" type="password" placeholder="********" required />
                                </Field>
                            </Fieldset>

                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <CheckboxGroup>
                                    <CheckboxField>
                                        <Checkbox id="remember" name="remember" />
                                        <Label htmlFor="remember">Keep me signed in</Label>
                                    </CheckboxField>
                                </CheckboxGroup>
                                <Link href="#" className="text-sm font-medium text-zinc-900 hover:underline dark:text-white">
                                    Forgot password?
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                color="blue"
                                className="w-full justify-center"
                                disabled={isSubmitting}
                                data-disabled={isSubmitting ? "" : undefined}
                            >
                                {isSubmitting ? "Connecting…" : "Sign in"}
                            </Button>

                            <Text className="text-center text-sm text-zinc-500">
                                Don’t have an account? <TextLink href="#">Talk to sales</TextLink>
                            </Text>
                        </form>
                    </section>

                    <section className={videoPanelClasses}>
                        <video
                            className="h-full w-full object-cover"
                            src="/login.mp4"
                            autoPlay
                            loop
                            muted
                            playsInline
                            poster="/logo.jpeg"
                        />
                        <div className={videoOverlayClasses} />
                        <div className="absolute bottom-8 left-8 right-8 max-w-xl mx-auto">
                            <p className={videoHeadlineClasses}>
                                Human stories, immersive data.
                            </p>
                            <p className={videoBodyClasses}>
                                Engaging motion greets your team while the left panel handles authentication.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}


