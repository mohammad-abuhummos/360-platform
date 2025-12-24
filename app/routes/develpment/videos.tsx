import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
    createVideoAnalysis,
    deleteVideoAnalysis,
    getAllVideoAnalyses,
    updateVideoAnalysis,
    type VideoAnalysis,
} from "~/lib/firebase";
import {
    storage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject,
} from "~/lib/firebase";
import { DashboardLayout } from "~/components/dashboard-layout";

export const meta = () => {
    return [
        { title: "Video Library | Development" },
        { name: "description", content: "Your team's video library" },
    ];
};

// Extended VideoAnalysis with video URL
interface VideoWithUrl extends VideoAnalysis {
    videoUrl?: string;
    thumbnailUrl?: string;
    uploadProgress?: number;
    visibility?: 'team' | 'club' | 'only_me';
    author?: string;
    authorAvatar?: string;
    uploadedAt?: Date;
}

// Icons
const Icons = {
    play: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
    ),
    upload: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
    ),
    filter: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
    ),
    search: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    ),
    grid: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
        </svg>
    ),
    list: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
    ),
    plus: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    ),
    moreVertical: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
        </svg>
    ),
    trash: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
    ),
    edit: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
    ),
    video: (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
            <path d="M7 2v20" />
            <path d="M17 2v20" />
            <path d="M2 12h20" />
            <path d="M2 7h5" />
            <path d="M2 17h5" />
            <path d="M17 17h5" />
            <path d="M17 7h5" />
        </svg>
    ),
    playlist: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="16" y2="18" />
            <polygon points="3 6 3 6 5 6" fill="currentColor" />
            <polygon points="3 12 3 12 5 12" fill="currentColor" />
            <polygon points="3 18 3 18 5 18" fill="currentColor" />
        </svg>
    ),
    clock: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    ),
    eye: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    ),
    lock: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    ),
    users: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    ),
    chevronLeft: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
        </svg>
    ),
    x: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    ),
};

// Tab types
type TabType = 'browse' | 'team' | 'club' | 'your_content';

export default function VideosPage() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeTab, setActiveTab] = useState<TabType>('browse');
    const [searchQuery, setSearchQuery] = useState('');
    const [videos, setVideos] = useState<VideoWithUrl[]>([]);
    const [playlists, setPlaylists] = useState<{ id: string; name: string; clipCount: number; visibility: string; }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [uploadingVideos, setUploadingVideos] = useState<{ [key: string]: number }>({});
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState<VideoWithUrl | null>(null);
    const [showVideoMenu, setShowVideoMenu] = useState<string | null>(null);

    // Load videos from Firestore
    const loadVideos = useCallback(async () => {
        try {
            setIsLoading(true);
            const analyses = await getAllVideoAnalyses();
            const videosWithUrls: VideoWithUrl[] = analyses.map(analysis => ({
                ...analysis,
                visibility: 'team',
                author: 'Team Member',
                uploadedAt: analysis.createdAt?.toDate?.() || new Date(),
            }));
            setVideos(videosWithUrls);
            
            // Mock playlists for now
            setPlaylists([
                { id: '1', name: '[.k.]p', clipCount: 0, visibility: 'only_me' },
                { id: '2', name: 'test', clipCount: 31, visibility: 'team' },
                { id: '3', name: 'Edit Goals', clipCount: 0, visibility: 'team' },
            ]);
        } catch (error) {
            console.error('Error loading videos:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadVideos();
    }, [loadVideos]);

    // Handle file upload
    const handleFileUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        for (const file of Array.from(files)) {
            if (!file.type.startsWith('video/')) {
                alert('Please select a video file');
                continue;
            }

            const tempId = `temp-${Date.now()}-${Math.random()}`;
            setUploadingVideos(prev => ({ ...prev, [tempId]: 0 }));

            try {
                // Create storage reference
                const storageRef = ref(storage, `videos/${Date.now()}-${file.name}`);
                
                // Upload file with progress tracking
                const uploadTask = uploadBytesResumable(storageRef, file);

                uploadTask.on('state_changed',
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        setUploadingVideos(prev => ({ ...prev, [tempId]: progress }));
                    },
                    (error) => {
                        console.error('Upload error:', error);
                        setUploadingVideos(prev => {
                            const updated = { ...prev };
                            delete updated[tempId];
                            return updated;
                        });
                        alert('Failed to upload video');
                    },
                    async () => {
                        // Get download URL
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        
                        // Get video duration
                        const video = document.createElement('video');
                        video.src = downloadURL;
                        
                        video.onloadedmetadata = async () => {
                            const duration = video.duration;
                            
                            // Create video analysis record in Firestore
                            const analysisId = await createVideoAnalysis({
                                name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
                                description: '',
                                videoFileName: file.name,
                                videoDuration: duration,
                                clips: [],
                                annotations: [],
                            });

                            // Update with video URL
                            await updateVideoAnalysis(analysisId, {
                                videoUrl: downloadURL,
                            } as any);

                            // Remove from uploading and reload
                            setUploadingVideos(prev => {
                                const updated = { ...prev };
                                delete updated[tempId];
                                return updated;
                            });
                            
                            loadVideos();
                        };
                    }
                );
            } catch (error) {
                console.error('Error starting upload:', error);
                setUploadingVideos(prev => {
                    const updated = { ...prev };
                    delete updated[tempId];
                    return updated;
                });
            }
        }
        
        setShowUploadModal(false);
    };

    // Handle video delete
    const handleDeleteVideo = async (video: VideoWithUrl) => {
        if (!confirm(`Are you sure you want to delete "${video.name}"?`)) return;

        try {
            // Delete from Firestore
            if (video.id) {
                await deleteVideoAnalysis(video.id);
            }

            // Try to delete from storage if we have the URL
            if (video.videoUrl) {
                try {
                    const storageRef = ref(storage, video.videoUrl);
                    await deleteObject(storageRef);
                } catch (e) {
                    // Storage deletion might fail if URL format is different
                    console.log('Could not delete from storage:', e);
                }
            }

            loadVideos();
        } catch (error) {
            console.error('Error deleting video:', error);
            alert('Failed to delete video');
        }
        
        setShowVideoMenu(null);
    };

    // Open video in analyzer
    const handleOpenVideo = (video: VideoWithUrl) => {
        if (video.id) {
            navigate(`/video-analyze-stone?id=${video.id}`);
        }
    };

    // Format duration
    const formatDuration = (seconds?: number) => {
        if (!seconds) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const hours = Math.floor(mins / 60);
        if (hours > 0) {
            return `${hours}:${String(mins % 60).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    // Format date
    const formatDate = (date?: Date) => {
        if (!date) return '';
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        }).format(date);
    };

    // Filter videos based on tab and search
    const filteredVideos = videos.filter(video => {
        const matchesSearch = video.name?.toLowerCase().includes(searchQuery.toLowerCase());
        
        switch (activeTab) {
            case 'team':
                return matchesSearch && video.visibility === 'team';
            case 'club':
                return matchesSearch && video.visibility === 'club';
            case 'your_content':
                return matchesSearch && video.visibility === 'only_me';
            default:
                return matchesSearch;
        }
    });

    // Tabs
    const tabs: { id: TabType; label: string }[] = [
        { id: 'browse', label: 'Browse' },
        { id: 'team', label: 'Team' },
        { id: 'club', label: 'Club' },
        { id: 'your_content', label: 'Your content' },
    ];

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-zinc-900">
                {/* Header */}
                <div className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-10">
                    <div className="px-6 py-4">
                        <div className="flex items-center gap-4 mb-4">
                            <button 
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
                            >
                                {Icons.chevronLeft}
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                        <polygon points="5 3 19 12 5 21 5 3" />
                                    </svg>
                                </div>
                                <h1 className="text-xl font-semibold text-white">Video Library</h1>
                            </div>
                        </div>
                        
                        {/* Tabs */}
                        <div className="flex gap-6 border-b border-zinc-800 -mb-px">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`pb-3 px-1 text-sm font-medium transition-colors relative
                                        ${activeTab === tab.id 
                                            ? 'text-white' 
                                            : 'text-zinc-400 hover:text-zinc-300'
                                        }`}
                                >
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500"
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Search and Actions */}
                <div className="px-6 py-4 flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                            {Icons.search}
                        </div>
                        <input
                            type="text"
                            placeholder="Search videos, playlists and collections..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500 transition-colors"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-300 hover:bg-zinc-700 transition-colors">
                            {Icons.filter}
                            <span className="text-sm">Filter</span>
                        </button>
                        <button 
                            onClick={() => setShowUploadModal(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 rounded-lg text-white transition-colors"
                        >
                            {Icons.plus}
                            <span className="text-sm font-medium">Add content</span>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 pb-8">
                    {/* Your team's library section */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-zinc-400">{Icons.users}</span>
                            <h2 className="text-lg font-medium text-white">Your team's library</h2>
                        </div>

                        {isLoading ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="animate-pulse">
                                        <div className="aspect-video bg-zinc-800 rounded-lg mb-2" />
                                        <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2" />
                                        <div className="h-3 bg-zinc-800 rounded w-1/2" />
                                    </div>
                                ))}
                            </div>
                        ) : filteredVideos.length === 0 && Object.keys(uploadingVideos).length === 0 ? (
                            <div className="text-center py-16">
                                <div className="text-zinc-600 mb-4">{Icons.video}</div>
                                <p className="text-zinc-400 mb-4">No videos yet</p>
                                <button 
                                    onClick={() => setShowUploadModal(true)}
                                    className="px-6 py-2 bg-teal-600 hover:bg-teal-500 rounded-lg text-white transition-colors"
                                >
                                    Upload your first video
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {/* Uploading videos */}
                                {Object.entries(uploadingVideos).map(([id, progress]) => (
                                    <div key={id} className="group relative">
                                        <div className="aspect-video bg-zinc-800 rounded-lg overflow-hidden relative">
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="text-center">
                                                    <div className="w-16 h-16 rounded-full border-4 border-zinc-700 border-t-teal-500 animate-spin mb-3" />
                                                    <p className="text-sm text-white font-medium">{Math.round(progress)}%</p>
                                                </div>
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-700">
                                                <div 
                                                    className="h-full bg-teal-500 transition-all duration-300"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                        <p className="mt-2 text-sm text-zinc-400">Uploading...</p>
                                    </div>
                                ))}

                                {/* Videos */}
                                {filteredVideos.map((video) => (
                                    <div 
                                        key={video.id} 
                                        className="group relative cursor-pointer"
                                        onClick={() => handleOpenVideo(video)}
                                    >
                                        {/* Thumbnail */}
                                        <div className="aspect-video bg-zinc-800 rounded-lg overflow-hidden relative">
                                            {video.videoUrl ? (
                                                <video 
                                                    src={video.videoUrl}
                                                    className="w-full h-full object-cover"
                                                    onMouseEnter={(e) => e.currentTarget.play()}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.pause();
                                                        e.currentTarget.currentTime = 0;
                                                    }}
                                                    muted
                                                    loop
                                                    playsInline
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center">
                                                    <span className="text-zinc-500">{Icons.video}</span>
                                                </div>
                                            )}
                                            
                                            {/* Visibility badge */}
                                            <div className="absolute top-2 left-2">
                                                <span className="flex items-center gap-1 px-2 py-1 bg-zinc-900/80 rounded text-xs text-zinc-300">
                                                    {video.visibility === 'only_me' ? Icons.lock : Icons.users}
                                                    <span className="uppercase text-[10px]">
                                                        {video.visibility === 'only_me' ? 'Only me' : video.visibility}
                                                    </span>
                                                </span>
                                            </div>
                                            
                                            {/* Duration */}
                                            <div className="absolute bottom-2 right-2">
                                                <span className="px-2 py-1 bg-zinc-900/80 rounded text-xs text-white font-mono">
                                                    {formatDuration(video.videoDuration)}
                                                </span>
                                            </div>

                                            {/* Play overlay on hover */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                                    {Icons.play}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="mt-2 flex items-start gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs font-bold text-white">
                                                    {video.name?.charAt(0)?.toUpperCase() || 'V'}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-medium text-white truncate">{video.name}</h3>
                                                <p className="text-xs text-zinc-400">{video.author || 'Unknown'}</p>
                                                <p className="text-xs text-zinc-500">{formatDate(video.uploadedAt)}</p>
                                            </div>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowVideoMenu(showVideoMenu === video.id ? null : video.id!);
                                                }}
                                                className="p-1.5 hover:bg-zinc-800 rounded transition-colors text-zinc-400 opacity-0 group-hover:opacity-100"
                                            >
                                                {Icons.moreVertical}
                                            </button>
                                        </div>

                                        {/* Context menu */}
                                        {showVideoMenu === video.id && (
                                            <div 
                                                className="absolute right-0 top-full mt-1 w-48 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-20"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <button 
                                                    onClick={() => handleOpenVideo(video)}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-zinc-700 transition-colors"
                                                >
                                                    {Icons.play}
                                                    <span>Open in Editor</span>
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteVideo(video)}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-700 transition-colors"
                                                >
                                                    {Icons.trash}
                                                    <span>Delete</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Load more button */}
                                {filteredVideos.length > 0 && (
                                    <div className="aspect-video bg-zinc-800/50 border-2 border-dashed border-zinc-700 rounded-lg flex items-center justify-center cursor-pointer hover:border-teal-500 hover:bg-zinc-800 transition-colors">
                                        <span className="text-teal-400 font-medium">Load more</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Playlists section */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-zinc-400">{Icons.playlist}</span>
                            <h2 className="text-lg font-medium text-white">Playlists</h2>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {playlists.map((playlist) => (
                                <div 
                                    key={playlist.id}
                                    className="group cursor-pointer"
                                >
                                    <div className="aspect-video bg-gradient-to-br from-teal-600 to-cyan-700 rounded-lg overflow-hidden relative">
                                        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-zinc-900/60 rounded text-xs text-white">
                                            {Icons.playlist}
                                            <span>Playlist</span>
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center text-white text-4xl font-bold opacity-20">
                                            {playlist.clipCount}
                                        </div>
                                        <div className="absolute bottom-2 right-2 text-right">
                                            <p className="text-3xl font-bold text-white">{playlist.clipCount}</p>
                                            <p className="text-xs text-white/70">clips</p>
                                        </div>
                                        <div className="absolute bottom-2 left-2">
                                            <span className="flex items-center gap-1 px-2 py-1 bg-zinc-900/60 rounded text-xs text-zinc-300">
                                                {playlist.visibility === 'only_me' ? Icons.lock : Icons.users}
                                                <span className="uppercase text-[10px]">
                                                    {playlist.visibility === 'only_me' ? 'Only me' : 'Team'}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                    <h3 className="mt-2 text-sm font-medium text-white truncate">{playlist.name}</h3>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Upload Modal */}
                <AnimatePresence>
                    {showUploadModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
                            onClick={() => setShowUploadModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 w-full max-w-lg"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold text-white">Upload Video</h2>
                                    <button 
                                        onClick={() => setShowUploadModal(false)}
                                        className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400"
                                    >
                                        {Icons.x}
                                    </button>
                                </div>

                                <div 
                                    className="border-2 border-dashed border-zinc-700 rounded-xl p-12 text-center hover:border-teal-500 transition-colors cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        e.currentTarget.classList.add('border-teal-500', 'bg-teal-500/5');
                                    }}
                                    onDragLeave={(e) => {
                                        e.preventDefault();
                                        e.currentTarget.classList.remove('border-teal-500', 'bg-teal-500/5');
                                    }}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        e.currentTarget.classList.remove('border-teal-500', 'bg-teal-500/5');
                                        handleFileUpload(e.dataTransfer.files);
                                    }}
                                >
                                    <div className="text-zinc-500 mb-4">{Icons.upload}</div>
                                    <p className="text-white font-medium mb-2">
                                        Drop your video here or click to browse
                                    </p>
                                    <p className="text-sm text-zinc-500">
                                        Supports MP4, WebM, MOV files
                                    </p>
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="video/*"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => handleFileUpload(e.target.files)}
                                />

                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        onClick={() => setShowUploadModal(false)}
                                        className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-6 py-2 bg-teal-600 hover:bg-teal-500 rounded-lg text-white font-medium transition-colors"
                                    >
                                        Select Files
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Click outside to close menu */}
                {showVideoMenu && (
                    <div 
                        className="fixed inset-0 z-10"
                        onClick={() => setShowVideoMenu(null)}
                    />
                )}
            </div>
        </DashboardLayout>
    );
}

