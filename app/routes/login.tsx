import type { Route } from "./+types/login";
import { useState, type FormEvent } from "react";
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

    return (
        <main
            style={{
                background: "linear-gradient(155deg,hsl(0, 0%, 25%), hsl(0, 0%, 0%))",
            }}
            className=""
        >
            <div className="">
                <div className="grid items-stretch  rounded-[32px] border border-black/15 bg-black/5  shadow-2xl shadow-black/40 ring-1 ring-black/10 backdrop-blur-3xl lg:grid-cols-[1.05fr_0.95fr]">
                    <section style={{
                        background: "linear-gradient(155deg,hsl(0, 0%, 25%), hsl(0, 0%, 0%))",
                    }} className="rounded-r-[28px] bg-black p-8 text-zinc-900 sm:p-12 flex flex-col h-screen">
                        <div className="flex items-center gap-4">
                            <img
                                src="/logo.jpeg"
                                alt="360 logo"
                                className="h-14 w-14 rounded-2xl object-cover shadow-lg shadow-zinc-900/10"
                            />
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500">
                                    Football Platform
                                </p>
                                <Heading level={1} className="mt-2 text-3xl font-semibold">
                                    Welcome back
                                </Heading>
                            </div>
                        </div>

                        <Text className="mt-6 text-zinc-600">
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
                                <Link href="#" className="text-sm font-medium text-white hover:underline">
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

                    <section className="relative hidden min-h-[420px] overflow-hidden  border border-black/20 bg-black/40 lg:flex">
                        <video
                            className="h-full w-full object-cover"
                            src="/login.mp4"
                            autoPlay
                            loop
                            muted
                            playsInline
                            poster="/logo.jpeg"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                        <div className="absolute bottom-8 left-8 right-8">
                            <p className="text-3xl font-semibold leading-tight text-white sm:text-2xl">
                                Human stories, immersive data.
                            </p>
                            <p className="mt-3 text-base/7 text-white/80">
                                Engaging motion greets your team while the left panel handles authentication.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}


