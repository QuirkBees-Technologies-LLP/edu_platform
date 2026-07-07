import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/auth';
import { useTourStep } from '@/hooks/useTourStep';
import { toast } from 'sonner';
import { Container } from '@/components/container';
import { useGetAdminStrategyListQuery, useLazyGetStrategyByIdQuery, useGetStrategyLanguagesQuery, useGetStrategyByNameMutation } from '@/store/api/client/clientStrategiesApiSlice';
import { useSelector } from 'react-redux';
import { Loader2, CirclePlay, Globe } from 'lucide-react';
import { Accordion, AccordionItem } from '@/components/accordion';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import ResourcesSection from "../../../components/ui/ResourcesSection";
import StrategyVideoCarousel from "../../../components/ui/StrategyVideoCarousel";
import { getEmbedUrl } from "@/utils/videoUtils";

/**
 * Original Strategy Banner — shown on the landing page before a strategy is selected.
 */
const Banner = () => (
    <div className="rounded-2xl overflow-hidden">
        <img
            src="/media/banners/Welcome Banner_Strategy.jpg.jpeg"
            alt="IQ Strategies Banner"
            className="w-full h-auto object-cover"
        />
    </div>
);

/**
 * Utility function to parse tags from various backend formats
 * Handles: ["[\"KillShot\"]"], ["KillShot"], "KillShot", etc.
 */
const parseTags = (tags) => {
    if (!tags || !Array.isArray(tags) || tags?.length === 0) return [];

    let result = [];
    tags?.forEach(tag => {
        if (typeof tag === 'string' && tag?.startsWith('[')) {
            try {
                const parsed = JSON.parse(tag);
                if (Array.isArray(parsed)) {
                    result = [...result, ...parsed];
                } else {
                    result?.push(String(parsed));
                }
            } catch (e) {
                result?.push(tag);
            }
        } else {
            result?.push(tag);
        }
    });
    return result;
};

/**
 * Placeholder video data for the strategy carousel.
 * Replace with an API call when a backend endpoint is available.
 */
const STRATEGY_VIDEOS = [
    {
        id: "v1",
        title: "IQ_REACT_V1",
        videoUrl: "https://videos.dyntube.com/iframes/MLM6WSKCfEOEqwe379CGtw",
        duration: "",
    },
    {
        id: "v2",
        title: "IQ_DEFY_V4",
        videoUrl: "https://videos.dyntube.com/iframes/ieeCtsTzUS3irQuPUSg",
        duration: "",
    },
    {
        id: "v3",
        title: "IQ_KILLSHOT_V4",
        videoUrl: "https://videos.dyntube.com/iframes/zQGhQgxx2Eism1fWLbO8A",
        duration: "",
    },
    {
        id: "v4",
        title: "IQ_BULLSEYE_V4",
        videoUrl: "https://videos.dyntube.com/iframes/mR5aNLY6dECk6lkVFeRmeg",
        duration: "",
    },
];

const TradingStrategies = () => {
    // ==================== STATE MANAGEMENT ====================
    const [selectedStrategyId, setSelectedStrategyId] = useState(null);
    const [activeLectureId, setActiveLectureId] = useState(null);
    const [activeLecture, setActiveLecture] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalStrategyTitle, setModalStrategyTitle] = useState("");
    const [modalStrategyId, setModalStrategyId] = useState(null);
    const [modalLanguage, setModalLanguage] = useState("");
    const [manualStrategyData, setManualStrategyData] = useState(null);
    const [parentStrategyId, setParentStrategyId] = useState(null);

    const location = useLocation();
    const navigate = useNavigate();
    const { auth } = useAuthContext();

    // Get selected language from Redux
    const { data: strategyLanguages, isLoading: strategyLanguagesLoading } = useGetStrategyLanguagesQuery(modalStrategyId, {
        skip: !modalStrategyId
    });


    // ==================== API CALLS ====================
    // Fetch all strategies from admin endpoint
    const {
        data: strategiesData,
        isLoading: strategiesLoading,
        error: strategiesError,
    } = useGetAdminStrategyListQuery();

    // Lazy query for fetching individual strategy details
    const [fetchStrategy, {
        data: strategyData,
        isLoading: strategyLoading,
        error: strategyError
    }] = useLazyGetStrategyByIdQuery();

    // Mutation for fetching strategy by name (title + language)
    const [getStrategyByName, { isLoading: strategyByNameLoading }] = useGetStrategyByNameMutation();

    // ==================== DATA EXTRACTION ====================
    const strategies = strategiesData?.data || [];
    const currentStrategy = manualStrategyData || strategyData?.data || null;
    // Parent strategy from Available Strategies list (has tags, category, educators)
    const parentStrategy = strategies?.find(s => s?._id === parentStrategyId) || null;

    // ==================== SIDE EFFECTS ====================
    /**
     * When a strategy is selected, fetch its detailed data
     */
    useEffect(() => {
        if (selectedStrategyId && !manualStrategyData) {
            fetchStrategy(selectedStrategyId);
        }
    }, [selectedStrategyId, fetchStrategy, manualStrategyData]);

    /**
     * Auto-select the first lecture from the first section when strategy is loaded
     */
    useEffect(() => {
        if (currentStrategy?.sections?.length > 0) {
            const firstSection = currentStrategy?.sections?.[0];
            if (firstSection?.lectures?.length > 0) {
                const firstLecture = firstSection?.lectures?.[0];
                setActiveLectureId(firstLecture?._id);
                setActiveLecture(firstLecture);
            }
        }
    }, [currentStrategy]);

    /**
     * Auto-select the first strategy when strategies are loaded
     */
    // useEffect(() => {
    //     if (strategies?.length > 0 && !selectedStrategyId) {
    //         setSelectedStrategyId(strategies[0]._id);
    //     }
    // }, [strategies, selectedStrategyId]);

    // ─── Trading Strategies Tour ──────────────────────────────────────────────────────────
    useTourStep({
        shouldStart: location?.state?.continueTour === true,
        isReady: !strategiesLoading,
        getSteps: () => {
            const steps = [];
            const banner = document.querySelector('.ts-banner');
            if (banner) steps.push({ element: banner, title: '📊 Trading Strategies', intro: 'Explore structured trading strategies from professional educators. Each strategy comes with video lessons and detailed explanations.', position: 'bottom' });
            const firstCard = document.querySelector('.ts-first-card');
            if (firstCard) steps.push({ element: firstCard, title: '🎯 Strategy Card', intro: 'Each card shows a trading strategy with a description and category. Click the card to preview it, or hit <strong>Start Learning</strong> below to begin.', position: 'right' });
            const startBtn = document.querySelector('.ts-start-btn');
            if (startBtn) steps.push({ element: startBtn, title: '▶️ Start Learning', intro: 'Click <strong>Start Learning</strong> to choose your preferred language and begin the strategy course immediately.', position: 'top' });
            return steps;
        },
        onDone: () => navigate('/iq-social', { state: { continueTour: true } }),
        delay: 1000,
    });
    // ─────────────────────────────────────────────────────────────────────────────────

    // ==================== EVENT HANDLERS ====================
    const selectStrategy = (strategyId) => {
        setManualStrategyData(null); // Clear manual data so fetchStrategy takes over
        setSelectedStrategyId(strategyId);
        setActiveLectureId(null);
        setActiveLecture(null);
    };

    /**
     * Handle lecture selection
     */
    const handleLectureClick = (lecture) => {
        setActiveLectureId(lecture?._id);
        setActiveLecture(lecture);
    };

    /**
     * Handle "Start Learning" button click - opens modal with title & language picker
     */
    const handleStartLearning = (e, strategy) => {
        e?.stopPropagation(); // Prevent card click from firing
        setModalStrategyTitle(strategy?.title || '');
        setModalStrategyId(strategy?._id || null);
        setParentStrategyId(strategy?._id || null); // Track parent strategy for tags/category/educators
        setModalLanguage(""); // reset language selection
        setIsModalOpen(true);
    };

    /**
     * Handle Apply button in modal - calls getStrategyByName API
     */
    const handleApplyLanguage = async () => {
        if (!modalLanguage || !modalStrategyId) return;
        try {
            const result = await getStrategyByName({
                id: modalStrategyId,
                language: modalLanguage,
            }).unwrap();

            // If API returns success: false, show error toast and close modal
            if (result?.success === false) {
                toast.error(result?.message || 'No strategy available');
                setIsModalOpen(false);
                return;
            }

            const strategyResult = result?.data;
            if (strategyResult) {
                setManualStrategyData(strategyResult);
                setSelectedStrategyId(strategyResult?._id);
                setActiveLectureId(null);
                setActiveLecture(null);

                // Allow enough time for Dialog to close and DOM to update before scrolling
                setTimeout(() => {
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                }, 300);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to fetch strategy by name:', error);
            const errorMessage = error?.data?.message || error?.message || 'No strategy available';
            toast.error(errorMessage);
            setIsModalOpen(false);
        }
    };

    /**
     * Close the modal
     */
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setModalStrategyTitle("");
        setModalStrategyId(null);
        setModalLanguage("");
    };

    // ==================== LOADING STATE ====================
    if (strategiesLoading) {
        return (
            <div className="min-h-screen">
                <Container width="fluid" className="mx-auto px-5">
                    {/* <Banner /> */}

                    {/* Loading State */}
                    <div className="flex items-center justify-center h-96">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                        <span className="ml-3 text-gray-600">Loading strategies...</span>
                    </div>
                </Container>
            </div>
        );
    }

    // ==================== ERROR STATE ====================
    if (strategiesError) {
        return (
            <div className="min-h-screen">
                <Container width="fluid" className="mx-auto px-5">
                    <Banner />

                    {/* Error State */}
                    <div className="flex flex-col items-center justify-center h-96">
                        <div className="text-red-500 text-lg mb-4">Failed to load strategies</div>
                        <p className="text-gray-600">
                            {strategiesError?.data?.message || 'Something went wrong. Please try again later.'}
                        </p>
                    </div>
                </Container>
            </div>
        );
    }

    // ==================== MAIN RENDER ====================
    return (
        <div className="max-w-7xl mx-auto px-4 pb-10">
            <Container width="fluid" className="mx-auto px-5">
                {/* Banner or Video Carousel — conditionally rendered */}
                <div className="ts-banner">
                    {currentStrategy
                        ? <StrategyVideoCarousel videos={STRATEGY_VIDEOS} />
                        : <Banner />
                    }
                </div>

                {/* ========== DYNAMIC CONTENT AREA ========== */}
                {/* This section updates when a strategy is selected */}
                <div className="flex flex-col md:flex-row gap-6 mb-8 mt-5">
                    {/* ========== LESSONS PANEL (LEFT SIDEBAR) ========== */}
                    {currentStrategy?.sections?.length > 0 ? (
                        <div className="md:w-[430px]">
                            <div className="max-h-[675px] left_sidebar overflow-y-auto rounded-xl shadow card divide-y divide-gray-200">
                                {/* <div className="p-6 border-b border-gray-300">
                                    <h3 className="text-lg font-semibold">{currentStrategy.title}</h3>
                                    <p className="text-sm text-gray-900 mt-2">
                                        {currentStrategy.sections.reduce((total, section) => total + (section.lectures?.length || 0), 0)} Lessons
                                    </p>
                                </div> */}
                                <Accordion allowMultiple={false} defaultIndex={0}>
                                    {currentStrategy?.sections?.map((section, index) => (
                                        <AccordionItem
                                            key={section?._id || index}
                                            title={`${index + 1}. ${section?.title || 'Section'}`}
                                        >
                                            {section?.lectures?.map((lecture) => (
                                                <div
                                                    key={lecture?._id}
                                                    onClick={() => handleLectureClick(lecture)}
                                                    className={`flex items-center p-4 border-t border-gray-100 cursor-pointer transition 
                                                        ${activeLectureId === lecture?._id
                                                            ? "bg-gray-300 dark:bg-slate-800"
                                                            : "hover:bg-gray-50 dark:hover:bg-slate-900"
                                                        }`}
                                                >
                                                    <CirclePlay className="mr-2 text-gray-400" />
                                                    <span className="text-gray-800 font-medium text-xs">
                                                        {lecture?.title}
                                                    </span>
                                                </div>
                                            ))}
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </div>
                        </div>
                    ) : currentStrategy ? (
                        <div className="md:w-[350px]">
                            <div className="max-h-[675px] left_sidebar rounded-xl shadow card bg-gray-50 dark:bg-gray-100">
                                <div className="flex flex-col items-center justify-center py-12 px-6">
                                    <div className="text-center">
                                        <div className="text-4xl mb-4"></div>
                                        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-600 mb-2">
                                            Coming Soon
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                                            Lessons will be added soon
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {/* ========== VIDEO PLAYER AREA (MAIN CONTENT) ========== */}
                    {currentStrategy && (
                        <div className="flex-1">
                            <div className="card rounded-2xl border border-gray-300 overflow-hidden">
                                <div className="w-full h-[425px] dark:bg-black flex items-center justify-center bg-gray-200">
                                    {/* Show loading while fetching strategy details */}
                                    {strategyLoading ? (
                                        <div className="text-center">
                                            <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
                                            <h3 className="text-xl text-gray-200">Loading strategy details...</h3>
                                        </div>
                                    ) : activeLecture?.content ? (
                                        <iframe
                                            src={getEmbedUrl(activeLecture?.content)}
                                            className="w-full h-full"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            title={activeLecture?.title || "Video Player"}
                                        />
                                    ) : currentStrategy?.sections?.length > 0 ? (
                                        <div className="text-center">
                                            <div className="text-8xl mb-5 opacity-30 text-white">▶</div>
                                            <h3 className="text-xl text-white">
                                                Select a lecture to start watching
                                            </h3>
                                        </div>
                                    ) : currentStrategy ? (
                                        // Strategy selected but no sections/lessons available
                                        <div className="text-center text-gray-400">
                                            <div className="text-8xl mb-5 opacity-30">▶</div>
                                            <h3 className="text-xl text-gray-200">No lessons available for this strategy</h3>
                                            <p className="text-sm text-gray-400 mt-2">Lessons will be added soon</p>
                                        </div>
                                    ) : null}
                                </div>
                                {/* Video Info Bar - Only show if active lecture exists */}
                                {/* {activeLecture && (
                                <div className="p-6 bg-gray-200 dark:bg-gray-700">
                                    <h2 className="text-2xl mb-2 dark:text-gray-200">{activeLecture.title}</h2>
                                    <div className="text-sm text-gray-900 dark:text-gray-400">
                                        {currentStrategy?.category?.name || 'Category N/A'} • {activeLecture.duration || 'Duration N/A'}
                                    </div>
                                </div>
                            )} */}
                            </div>
                        </div>
                    )}
                </div>

                {/* Resources for active lecture — view only */}
                {activeLecture?.resources?.length > 0 && (
                    <ResourcesSection
                        resources={activeLecture.resources}
                        viewOnly
                        className="mb-8"
                    />
                )}

                {/* About Strategy */}
                {currentStrategy && (
                    <div className="card rounded-2xl border border-gray-300 p-8 mb-8">
                        {/* Header */}
                        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-300">
                            {currentStrategy?.imageUrl && (
                                <img
                                    src={currentStrategy?.imageUrl}
                                    alt={currentStrategy?.title}
                                    className="w-16 h-16 rounded-xl object-cover"
                                />
                            )}
                            <div>
                                <h3 className="text-2xl font-semibold">{currentStrategy?.title}</h3>
                            </div>
                        </div>

                        {/* Two Column Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-10">
                            <div className="lg:col-span-2">
                                <div className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                                    About This Strategy
                                </div>
                                <p className="text-[15px] leading-relaxed text-gray-900">
                                    {currentStrategy?.aboutStrategy || currentStrategy?.description}
                                </p>
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                                    Strategy Details
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {/* Display tags with alternating colors - from parent strategy */}
                                    {parseTags(parentStrategy?.tags)?.map((tag, i) => (
                                        <span
                                            key={i}
                                            className={`px-4 py-2 rounded-full text-xs font-medium ${i < 2
                                                ? 'bg-orange-500/20 border border-orange-500/40 text-orange-400'
                                                : 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400'
                                                }`}
                                        >
                                            {tag}
                                        </span>
                                    ))}

                                    {/* Display category badges - from parent strategy */}
                                    {parentStrategy?.category?.length > 0 && parentStrategy?.category?.map((cat, i) => (
                                        <span key={cat?._id || i} className="px-4 py-2 rounded-full text-xs font-medium bg-purple-500/20 border border-purple-500/40 text-purple-400">
                                            {cat?.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Educators Section - from parent strategy */}
                        {parentStrategy?.educators?.length > 0 && (
                            <div className="pt-8 border-t border-gray-300">
                                <div className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-6">
                                    Strategy Educators
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                    {parentStrategy?.educators?.map((educator, i) => (
                                        <div key={educator?._id || i} className="flex flex-col items-center text-center">
                                            <img
                                                src={educator?.image || `https://ui-avatars.com/api/?name=${educator?.first_name}+${educator?.last_name}`}
                                                alt={`${educator?.first_name || ''} ${educator?.last_name || ''}`}
                                                className="w-20 h-20 rounded-full mb-3 border-2 border-gray-300 object-cover"
                                            />
                                            <div className="text-sm font-medium text-gray-900">
                                                {educator?.first_name} {educator?.last_name}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ========== AVAILABLE STRATEGIES GRID ========== */}
                {/* This section is always visible */}
                <div className="mt-10 pb-12 ">
                    <div className="flex items-center justify-between mb-6 ts-strat-heading">
                        <h2 className="text-2xl font-semibold mb-6">Available Strategies</h2>
                    </div>

                    {/* Show message if no strategies found */}
                    {strategies?.length === 0 ? (
                        <div className="text-center py-12 text-gray-600">
                            No strategies available at the moment.
                        </div>
                    ) : (
                        // Display strategy cards in a responsive grid
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                            {strategies?.map((strategy, index) => (
                                <div
                                    key={strategy?._id}
                                    onClick={() => selectStrategy(strategy?._id)}
                                    className={`card rounded-2xl p-6 border cursor-pointer transition-all duration-300 hover:-translate-y-1 h-full flex flex-col ${selectedStrategyId === strategy?._id
                                        ? 'border-purple-500 shadow-lg shadow-purple-500/30'
                                        : 'border-gray-300 hover:border-gray-400'
                                        }${index === 0 ? ' ts-first-card' : ''}`}
                                >
                                    {/* Strategy Card Content */}
                                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                                        {/* Strategy Image */}
                                        {strategy?.imageUrl && (
                                            <img
                                                src={strategy?.imageUrl}
                                                alt={strategy?.title}
                                                className="w-20 h-20 rounded-xl object-cover"
                                            />
                                        )}

                                        {/* Strategy Title, Category and Language */}
                                        {/* Strategy Title, Category and Language */}
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <div className="text-xl font-semibold text-gray-900 dark:text-gray-900">{strategy?.title}</div>
                                                {/* {strategy.language && (
                                                    <span className="shrink-0 mt-0.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-600 border border-sky-200 dark:bg-sky-500/10 dark:border-sky-500/20 dark:text-sky-400 tracking-wide uppercase flex items-center gap-1.5 shadow-sm transition-colors hover:bg-sky-100 dark:hover:bg-sky-500/20">
                                                        <Globe className="w-3.5 h-3.5" />
                                                        {strategy.language}
                                                    </span>
                                                )} */}
                                            </div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-900">
                                                {strategy?.category?.length > 0 ? strategy?.category?.map(cat => cat?.name)?.join(', ') : 'All Markets'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Strategy Description (limited to 2 lines) */}
                                    <div className="flex-grow">
                                        <p className="text-sm text-gray-900 leading-relaxed mb-4 line-clamp-2">
                                            {strategy?.description}
                                        </p>
                                    </div>

                                    {/* Call-to-Action Button */}
                                    <button
                                        onClick={(e) => handleStartLearning(e, strategy)}
                                        className={`w-full py-3 bg-gradient-to-r from-purple-500 to-orange-500 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-opacity mt-auto${index === 0 ? ' ts-start-btn' : ''}`}
                                    >
                                        Start Learning
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ========== LANGUAGE SELECTION MODAL ========== */}
                <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
                    <DialogContent className="max-w-md w-full" onCloseAutoFocus={(e) => e.preventDefault()}>
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">
                                Select Language
                            </DialogTitle>
                            <DialogDescription className="text-sm text-gray-500">
                                Choose a language to start learning this strategy
                            </DialogDescription>
                        </DialogHeader>

                        {/* Language Dropdown */}
                        <div className="mt-4">
                            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Language</label>
                            <Select
                                value={modalLanguage}
                                onValueChange={(val) => setModalLanguage(val)}
                            >
                                <SelectTrigger className="w-full h-11">
                                    <SelectValue placeholder="Select Language">
                                        {modalLanguage || "Select Language"}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {strategyLanguagesLoading && (
                                        <SelectItem value="loading" disabled>
                                            Loading...
                                        </SelectItem>
                                    )}
                                    {strategyLanguages?.data?.map((item) => (
                                        <SelectItem key={item} value={item}>
                                            {item}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Strategy Title (read-only) */}
                        <div className="mt-4">
                            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Strategy</label>
                            <div className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-200 rounded-lg text-sm font-medium text-gray-800 dark:text-gray-700">
                                {modalStrategyTitle}
                            </div>
                        </div>



                        {/* Apply Button */}
                        <div className="mt-6">
                            <button
                                onClick={handleApplyLanguage}
                                disabled={!modalLanguage || strategyByNameLoading}
                                className="w-full py-3 bg-gradient-to-r from-purple-500 to-orange-500 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {strategyByNameLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Applying...
                                    </>
                                ) : (
                                    'Apply'
                                )}
                            </button>
                        </div>
                    </DialogContent>
                </Dialog>
            </Container>
        </div>
    );
}

export default TradingStrategies