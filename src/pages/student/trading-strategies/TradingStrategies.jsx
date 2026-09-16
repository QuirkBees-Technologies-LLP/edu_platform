import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/auth';
import { useTourStep } from '@/hooks/useTourStep';
import { toast } from 'sonner';
import { Container } from '@/components/container';
import { useGetAdminStrategyListQuery, useLazyGetStrategyByIdQuery, useGetStrategyLanguagesQuery, useGetStrategyByNameMutation } from '@/store/api/client/clientStrategiesApiSlice';
import { useGetStrategyContentQuery } from '@/store/api/client/clientLearningContentApiSlice';
import { useSelector, useDispatch } from 'react-redux';
import { setBreadcrumbSuffix, clearBreadcrumbSuffix } from '@/store/reducer/breadcrumbSlice';
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
import StrategyResources from "../../../components/ui/StrategyResources";
import { getEmbedUrl } from "@/utils/videoUtils";
import { Skeleton } from "@/components/ui/skeleton";

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
 * First lecture of a section — checked directly on the section, then inside
 * its subsections in order (Sections -> Subsections -> Lectures).
 */
const getFirstLectureOfSection = (section) => {
    if (section?.lectures?.length > 0) return section.lectures[0];
    for (const subsection of section?.subsections || []) {
        if (subsection?.lectures?.length > 0) return subsection.lectures[0];
    }
    return null;
};


const TradingStrategies = () => {
    // ==================== STATE MANAGEMENT ====================
    const [bannerImageLoaded, setBannerImageLoaded] = useState(false);
    const [selectedStrategyId, setSelectedStrategyId] = useState(null);
    const [activeSectionId, setActiveSectionId] = useState(null);
    const [activeLectureId, setActiveLectureId] = useState(null);
    const [activeLecture, setActiveLecture] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalStrategyTitle, setModalStrategyTitle] = useState("");
    const [modalStrategyId, setModalStrategyId] = useState(null);
    const [modalLanguage, setModalLanguage] = useState("");
    const [manualStrategyData, setManualStrategyData] = useState(null);
    const [parentStrategyId, setParentStrategyId] = useState(null);
    const [activeLanguageForContent, setActiveLanguageForContent] = useState("");

    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { auth } = useAuthContext();

    // Get selected language from Redux
    const { data: strategyLanguages, isLoading: strategyLanguagesLoading } = useGetStrategyLanguagesQuery(modalStrategyId, {
        skip: !modalStrategyId
    });

    // Fetch dynamic learning content for the selected strategy + language
    const {
        data: learningContentData,
        isLoading: isLearningContentLoading,
        isError: isLearningContentError,
        isFetching: isLearningContentFetching,
    } = useGetStrategyContentQuery(
        { strategy: parentStrategyId /* language: activeLanguageForContent */ },
        { skip: !parentStrategyId }
    );
    const learningContent = learningContentData?.data;

    // Reset the banner's loaded state whenever the banner image itself changes
    // (e.g. switching strategies), so the skeleton reappears for the new image
    // instead of staying hidden from the previous one's load event.
    useEffect(() => {
        setBannerImageLoaded(false);
    }, [learningContent?.bannerImage]);


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
     * Show the selected strategy's name in the header breadcrumb ("Strategies > Defy").
     * Cleared on unmount so the breadcrumb doesn't leak into other pages.
     */
    useEffect(() => {
        dispatch(setBreadcrumbSuffix(currentStrategy?.title || null));
        return () => {
            dispatch(clearBreadcrumbSuffix());
        };
    }, [currentStrategy?.title, dispatch]);

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
            setActiveSectionId(firstSection?._id);
            const firstLecture = getFirstLectureOfSection(firstSection);
            if (firstLecture) {
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
        onDone: () => {
            try {
                const allowedRoutes = auth?.user?.plan?.allowedSideBar || [];
                if (allowedRoutes.includes('/trading-signals')) {
                    navigate('/trading-signals', { state: { continueTour: true } });
                } else {
                    navigate('/iq-social', { state: { continueTour: true } });
                }
            } catch (err) {
                console.error("Tour routing error:", err);
                navigate('/iq-social', { state: { continueTour: true } });
            }
        },
        delay: 1200,
    });
    // ─────────────────────────────────────────────────────────────────────────────────

    // ==================== EVENT HANDLERS ====================
    const selectStrategy = (strategyId) => {
        setManualStrategyData(null); // Clear manual data so fetchStrategy takes over
        setSelectedStrategyId(strategyId);
        setActiveSectionId(null);
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
     * Handle main section selection (sections are shown horizontally below the banner)
     */
    const handleSectionClick = (section) => {
        setActiveSectionId(section?._id);
        const firstLecture = getFirstLectureOfSection(section);
        setActiveLectureId(firstLecture?._id || null);
        setActiveLecture(firstLecture || null);
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
                setActiveSectionId(null);
                setActiveLectureId(null);
                setActiveLecture(null);

                // Allow enough time for Dialog to close and DOM to update before scrolling
                setTimeout(() => {
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                }, 300);
                // Store the language for learning content fetch
                setActiveLanguageForContent(modalLanguage);
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

    // The currently selected main section, and whether it has any lectures/subsections
    const activeSection =
        currentStrategy?.sections?.find((s) => s?._id === activeSectionId) ||
        currentStrategy?.sections?.[0] ||
        null;
    const activeSectionHasContent = !!(
        activeSection?.lectures?.length > 0 || activeSection?.subsections?.length > 0
    );

    // ==================== MAIN RENDER ====================
    return (
        <div className="container-fluid pb-10">
            {/* <BackButton /> */}
            {/* ========== BANNER ========== */}
                {/* Banner — static image, replaces the old video carousel */}
                <div className="ts-banner relative">
                    {currentStrategy
                        ? (learningContent?.bannerImage
                            ? (
                                <div className="relative w-full aspect-[3/1] rounded-2xl overflow-hidden">
                                    {!bannerImageLoaded && (
                                        <Skeleton className="absolute inset-0 w-full h-full rounded-2xl" />
                                    )}
                                    <img
                                        key={learningContent.bannerImage}
                                        src={learningContent.bannerImage}
                                        alt={currentStrategy?.title || "Strategy"}
                                        onLoad={() => setBannerImageLoaded(true)}
                                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${bannerImageLoaded ? "opacity-100" : "opacity-0"
                                            }`}
                                    />
                                </div>
                            )
                            : <Banner />)
                        : <Banner />
                    }
                </div>

                {/* ========== DYNAMIC CONTENT AREA ========== */}
                {/* Shows the lectures & subsections of the selected main section */}
                <div className="flex flex-col md:flex-row gap-6 mb-8 mt-5">
                    {/* ========== LESSONS PANEL (LEFT SIDEBAR) ========== */}
                    {currentStrategy?.sections?.length > 0 ? (
                        <div className="md:w-[430px] flex flex-col">
                            <div className="max-h-[675px] left_sidebar overflow-y-auto rounded-xl shadow card divide-y divide-gray-200">
                                {activeSectionHasContent ? (
                                    <>
                                        {activeSection?.lectures?.map((lecture) => (
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

                                        {/* Subsections — same accordion look sections used to have */}
                                        {activeSection?.subsections?.length > 0 && (
                                            <Accordion allowMultiple={false}>
                                                {activeSection.subsections.map((subsection) => (
                                                    <AccordionItem
                                                        key={subsection?._id}
                                                        title={subsection?.title || 'Subsection'}
                                                    >
                                                        {subsection?.lectures?.map((lecture) => (
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
                                        )}
                                    </>
                                ) : (
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
                                )}
                            </div>

                            {/* Strategy-level resources — same design as when it lived on the banner.
                                mt-auto pushes it to the bottom of this column (which now stretches to
                                match the video player's height), so it stays anchored near the bottom
                                regardless of how much lecture content is above it. */}
                            {currentStrategy && learningContent?.resources?.length > 0 && (
                                <div className="mt-auto pt-6">
                                    <StrategyResources resources={learningContent.resources} />
                                </div>
                            )}

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
                            {/* Section tabs — sit directly above the video player, in the same column */}
                            {currentStrategy?.sections?.length > 0 && (
                                <div className="flex items-center overflow-x-auto mb-4">
                                    <div className="flex flex-row items-center h-10 px-3 rounded-lg bg-gradient-to-r from-[#4C63E8] to-[#4f2e7a]">
                                        {currentStrategy.sections.map((section, index) => {
                                            const isActive = activeSectionId === section?._id;
                                            return (
                                                <React.Fragment key={section?._id || index}>
                                                    {index > 0 && (
                                                        <span className="text-white/30 select-none text-sm px-2 leading-none">|</span>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSectionClick(section)}
                                                        aria-pressed={isActive}
                                                        className={`shrink-0 inline-flex items-center justify-center h-8 px-1 text-sm whitespace-nowrap border-b-2 outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded-sm transition-colors ${isActive
                                                            ? "font-bold text-white border-amber-400"
                                                            : "font-medium text-white/70 hover:text-white border-transparent"
                                                            }`}
                                                    >
                                                        {index + 1}. {section?.title || "Section"}
                                                    </button>
                                                </React.Fragment>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            <div className="card rounded-2xl border border-gray-300 overflow-hidden">
                                {/* Height was a flat h-[425px] before, which didn't match a proper 16:9
                                    box at this column's actual (responsive) width — too short at some
                                    widths (clipping Dyntube's toolbar, which sits below the video rather
                                    than overlaid on it like YouTube's), too tall at others (dead space
                                    below the player). Padding-top as a % of width keeps it at a real 16:9
                                    for every embed and every width instead of one fixed guess. */}
                                <div
                                    className="relative w-full dark:bg-black bg-gray-200"
                                    style={{ paddingTop: "56.25%" }}
                                >
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        {/* Show loading while fetching strategy details */}
                                        {strategyLoading ? (
                                            <div className="text-center">
                                                <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
                                                <h3 className="text-xl text-gray-200">Loading strategy details...</h3>
                                            </div>
                                        ) : activeLecture?.content ? (
                                            <iframe
                                                src={getEmbedUrl(activeLecture?.content)}
                                                className="absolute inset-0 w-full h-full"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                style={{ border: "none" }}
                                                title={activeLecture?.title || "Video Player"}
                                            />
                                        ) : currentStrategy?.sections?.length > 0 && activeSectionHasContent ? (
                                            <div className="text-center">
                                                <div className="text-8xl mb-5 opacity-30 text-white">▶</div>
                                                <h3 className="text-xl text-white">
                                                    Select a lecture to start watching
                                                </h3>
                                            </div>
                                        ) : currentStrategy ? (
                                            // No sections at all, or the selected section has no lectures/subsections yet
                                            <div className="text-center text-gray-400">
                                                <div className="text-8xl mb-5 opacity-30">▶</div>
                                                <h3 className="text-xl text-gray-200">No lessons available for this strategy</h3>
                                                <p className="text-sm text-gray-400 mt-2">Lessons will be added soon</p>
                                            </div>
                                        ) : null}
                                    </div>
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
                                        <div
                                            key={educator?._id || i}
                                            className="flex flex-col items-center text-center cursor-pointer group"
                                            onClick={() => navigate(`/iq-educators/${educator?._id}`)}
                                        >
                                            <img
                                                src={educator?.image || `https://ui-avatars.com/api/?name=${educator?.first_name}+${educator?.last_name}`}
                                                alt={`${educator?.first_name || ''} ${educator?.last_name || ''}`}
                                                className="w-20 h-20 rounded-full mb-3 border-2 border-gray-300 object-cover transition-all duration-300 group-hover:border-[#400dd9] group-hover:shadow-lg group-hover:shadow-[#400dd9]/25 group-hover:scale-105"
                                            />
                                            <div className="text-sm font-medium text-gray-900 transition-colors duration-200 group-hover:text-[#400dd9]">
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
                                    className={`card rounded-2xl p-4 border cursor-pointer transition-all duration-300 hover:-translate-y-1 h-full flex flex-col ${selectedStrategyId === strategy?._id
                                        ? 'border-purple-500 shadow-lg shadow-purple-500/30'
                                        : 'border-gray-300 hover:border-gray-400'
                                        }${index === 0 ? ' ts-first-card' : ''}`}
                                >
                                    {/* Strategy Card Content */}
                                    <div className="flex flex-col md:flex-row gap-3 mb-3">
                                        {/* Strategy Image */}
                                        {strategy?.imageUrl && (
                                            <img
                                                src={strategy?.imageUrl}
                                                alt={strategy?.title}
                                                className="w-14 h-14 rounded-xl object-cover"
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
                                        <p className="text-xs text-gray-900 leading-relaxed mb-3 line-clamp-2">
                                            {strategy?.description}
                                        </p>
                                    </div>

                                    {/* Call-to-Action Button */}
                                    <button
                                        onClick={(e) => handleStartLearning(e, strategy)}
                                        className={`w-full py-2.5 bg-gradient-to-r from-purple-500 to-orange-500 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-opacity mt-auto${index === 0 ? ' ts-start-btn' : ''}`}
                                    >
                                        Start Learning
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {
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

                            <div className="mt-4">
                                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Strategy</label>
                                <div className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-200 rounded-lg text-sm font-medium text-gray-800 dark:text-gray-700">
                                    {modalStrategyTitle}
                                </div>
                            </div>

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
                }
        </div>
    );
}

export default TradingStrategies