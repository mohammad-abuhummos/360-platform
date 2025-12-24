import { motion } from "motion/react";
import { DashboardLayout } from "~/components/dashboard-layout";

export const meta = () => {
    return [
        { title: "Training Library | Development" },
        { name: "description", content: "Training library for player development" },
    ];
};

// Icons
const Icons = {
    book: (
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            <path d="M12 6v7M9 9.5l3-3 3 3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    trophy: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </svg>
    ),
    clipboard: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <path d="M12 11h4" />
            <path d="M12 16h4" />
            <path d="M8 11h.01" />
            <path d="M8 16h.01" />
        </svg>
    ),
    users: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    ),
    dumbbell: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m6.5 6.5 11 11" />
            <path d="m21 21-1-1" />
            <path d="m3 3 1 1" />
            <path d="m18 22 4-4" />
            <path d="m2 6 4-4" />
            <path d="m3 10 7-7" />
            <path d="m14 21 7-7" />
        </svg>
    ),
    target: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
        </svg>
    ),
};

export default function TrainingLibraryPage() {
    const features = [
        {
            icon: Icons.clipboard,
            title: "Training Sessions",
            description: "Create and manage structured training programs",
        },
        {
            icon: Icons.dumbbell,
            title: "Exercise Library",
            description: "Access a comprehensive collection of drills and exercises",
        },
        {
            icon: Icons.target,
            title: "Performance Tracking",
            description: "Monitor player progress and development metrics",
        },
        {
            icon: Icons.users,
            title: "Team Collaboration",
            description: "Share training materials with coaching staff",
        },
    ];

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-8">
                <div className="max-w-3xl w-full text-center">
                    {/* Animated Icon */}
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, type: "spring" }}
                        className="mb-8"
                    >
                        <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30">
                            <motion.div
                                animate={{ 
                                    y: [0, -8, 0],
                                }}
                                transition={{ 
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="text-amber-400"
                            >
                                {Icons.book}
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Main Content */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <h1 className="text-4xl font-bold text-white mb-4">
                            Training Library
                        </h1>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full mb-6">
                            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            <span className="text-amber-400 text-sm font-medium">Coming Soon</span>
                        </div>
                        <p className="text-lg text-zinc-400 mb-12 max-w-xl mx-auto">
                            We're building a comprehensive training library to help you develop 
                            your players and track their progress. Stay tuned for updates!
                        </p>
                    </motion.div>

                    {/* Feature Preview Cards */}
                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                                className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-6 text-left hover:border-amber-500/30 hover:bg-zinc-800 transition-all duration-300"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 flex-shrink-0">
                                        {feature.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                                        <p className="text-sm text-zinc-400">{feature.description}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Notification Signup */}
                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.9, duration: 0.5 }}
                        className="mt-12 p-6 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 rounded-xl border border-amber-500/20"
                    >
                        <div className="flex items-center justify-center gap-3 text-amber-400">
                            {Icons.trophy}
                            <span className="font-semibold">
                                Want to be notified when it's ready?
                            </span>
                        </div>
                        <p className="text-zinc-400 text-sm mt-2">
                            Check back soon or contact your administrator for updates.
                        </p>
                    </motion.div>

                    {/* Decorative Elements */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <motion.div
                            animate={{ 
                                rotate: 360,
                            }}
                            transition={{ 
                                duration: 50,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl"
                        />
                        <motion.div
                            animate={{ 
                                rotate: -360,
                            }}
                            transition={{ 
                                duration: 60,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl"
                        />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

