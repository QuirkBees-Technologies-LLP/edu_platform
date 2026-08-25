import React, { useState, useRef, useCallback, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { getEmbedUrl, getVideoThumbnail } from "@/utils/videoUtils";
import StrategyResources from "./StrategyResources";

import "swiper/css";
import "./StrategyVideoCarousel.css";



/**
 * StrategyVideoCarousel
 *
 * A reusable, responsive video carousel component with centred-item styling,
 * custom navigation arrows, dot indicators, and a modal video player.
 *
 * @param {Object[]} videos           – Array of video objects
 * @param {string}   videos[].id      – Unique identifier
 * @param {string}   videos[].title   – Display title
 * @param {string}   videos[].videoUrl      – Watchable / embeddable URL
 * @param {string}   [videos[].thumbnailUrl] – Custom thumbnail (optional, auto-derived for YouTube)
 * @param {string}   [videos[].duration]     – e.g. "12:30" (optional)
 * @param {string}   [className]      – Extra class on the wrapper
 * @param {string}   [title]          – Optional heading above carousel
 * @param {string}   [description]    – Optional sub-text below heading
 */
const StrategyVideoCarousel = ({ videos: rawVideos, className = "", title, description, strategyIcon, darkModeImage = "", lightModeImage = "", resources = [] }) => {
    // Ensure videos is always a safe array
    const videos = Array.isArray(rawVideos) ? rawVideos : [];

    const swiperRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);

    // ---- Build padded slides for Swiper v11 loop mode ----
    // Loop requires slides >= 2 × max(slidesPerView). Max is 2.2, so need ≥ 5.
    // Only enable loop for 3+ videos. For 1-2 videos, no loop, no duplication.
    const MIN_LOOP_SLIDES = 5;
    const canLoop = videos.length >= 2;
    const showNav = videos.length > 1;
    const slides = useMemo(() => {
        if (!canLoop || videos.length === 0) return videos.map((v, i) => ({ ...(v || {}), _origIndex: i }));
        // Duplicate until we have enough slides for loop
        let arr = videos.map((v, i) => ({ ...(v || {}), _origIndex: i }));
        while (arr.length < MIN_LOOP_SLIDES) {
            arr = arr.concat(videos.map((v, i) => ({ ...(v || {}), _origIndex: i })));
        }
        return arr;
    }, [videos, canLoop]);

    // ---- Swiper event handlers ----
    const handleSlideChange = useCallback((swiper) => {
        if (swiper && typeof swiper.realIndex === "number") {
            setActiveIndex(swiper.realIndex);
        }
    }, []);

    const handlePrev = useCallback(() => {
        swiperRef.current?.slidePrev();
    }, []);

    const handleNext = useCallback(() => {
        swiperRef.current?.slideNext();
    }, []);

    const handleDotClick = useCallback((origIndex) => {
        if (canLoop) {
            // Find first slide in the padded array that matches this original index
            const slideIdx = slides.findIndex((s) => s._origIndex === origIndex);
            if (slideIdx >= 0) swiperRef.current?.slideToLoop(slideIdx);
        } else {
            swiperRef.current?.slideTo(origIndex);
        }
    }, [slides, canLoop]);

    // ---- Video modal ----
    const openVideo = useCallback((video) => {
        setSelectedVideo(video);
        setModalOpen(true);
    }, []);

    const closeVideo = useCallback(() => {
        setModalOpen(false);
        // Delay clearing to allow close animation
        setTimeout(() => setSelectedVideo(null), 300);
    }, []);

    if (!videos || videos.length === 0 || slides.length === 0) return null;

    // Map swiper realIndex back to original video index for dots
    const safeActiveIndex = typeof activeIndex === "number" && activeIndex >= 0 ? activeIndex : 0;
    const dotIndex = slides[safeActiveIndex]?._origIndex ?? (videos.length > 0 ? safeActiveIndex % videos.length : 0);

    return (
        <div className={`strategy-video-carousel ${className}`}>
            {/* ---- Strategy title with icon ---- */}
            {(title || description) && (
                <div className="svc-header">
                    <div className="svc-heading-row">
                        {strategyIcon && (
                            <img
                                src={strategyIcon}
                                alt={title || "Strategy"}
                                className="svc-strategy-icon"
                            />
                        )}
                        {title && <h2 className="svc-heading">{title}</h2>}
                    </div>
                    {description && <p className="svc-description">{description}</p>}
                </div>
            )}

            {/* ---- Carousel wrapper with overlay arrows ---- */}
            <div className="svc-carousel-wrapper">
                {/* ---- Swiper carousel ---- */}
                <Swiper
                    onSwiper={(swiper) => { swiperRef.current = swiper; }}
                    onSlideChange={handleSlideChange}
                    centeredSlides
                    spaceBetween={10}
                    loop={canLoop}
                    grabCursor={showNav}
                    breakpoints={videos.length <= 2 ? {
                        0: { slidesPerView: 1.1, spaceBetween: 6 },
                        640: { slidesPerView: 1.3, spaceBetween: 8 },
                        768: { slidesPerView: 1.6, spaceBetween: 10 },
                        1024: { slidesPerView: 2, spaceBetween: 12 },
                    } : {
                        0: { slidesPerView: 1.1, spaceBetween: 6 },
                        640: { slidesPerView: 1.3, spaceBetween: 8 },
                        768: { slidesPerView: 1.8, spaceBetween: 10 },
                        1024: { slidesPerView: 2.2, spaceBetween: 12 },
                    }}
                >
                    {slides.map((video, idx) => {
                        if (!video) return null;
                        return (
                            <SwiperSlide key={`${video?.id || idx}-${idx}`}>
                                <div
                                    className="svc-card"
                                    onClick={() => openVideo(video)}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`Play video: ${video?.title || ""}`}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            openVideo(video);
                                        }
                                    }}
                                >
                                    {/* Thumbnail — iframe preview for Dyntube, static image for others */}
                                    {video?.videoUrl?.includes("dyntube.com") ? (
                                        <iframe
                                            src={getEmbedUrl(video?.videoUrl || "")}
                                            className="svc-thumb"
                                            loading="lazy"
                                            tabIndex={-1}
                                            scrolling="no"
                                            style={{ pointerEvents: "none", border: "none", overflow: "hidden" }}
                                            title={video?.title || ""}
                                        />
                                    ) : (
                                        <img
                                            src={video?.thumbnailUrl || getVideoThumbnail(video?.videoUrl || "") || ""}
                                            alt={video?.title || ""}
                                            className="svc-thumb"
                                            loading="lazy"
                                            onError={(e) => {
                                                e.target.style.display = "none";
                                            }}
                                        />
                                    )}

                                    {/* Gradient overlay */}
                                    <div className="svc-overlay" />

                                    {/* Play button — absolutely centered on the card */}
                                    <div className="svc-play-icon">
                                        <Play />
                                    </div>

                                    {/* Title + duration */}
                                    <div className="svc-info">
                                        <p className="svc-title">{video?.title || ""}</p>
                                        {video?.duration && (
                                            <p className="svc-duration">{video?.duration}</p>
                                        )}
                                    </div>

                                    {/* Left/Right arrows — shown only on active card via CSS, hidden for single video */}
                                    {showNav && (
                                        <>
                                            {/* For non-loop (2 videos): hide prev on first, hide next on last */}
                                            {(canLoop || video._origIndex > 0) && (
                                                <button
                                                    className="svc-side-btn svc-side-btn--prev"
                                                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                                                    aria-label="Previous slide"
                                                >
                                                    <ChevronLeft size={22} />
                                                </button>
                                            )}
                                            {(canLoop || video._origIndex < videos.length - 1) && (
                                                <button
                                                    className="svc-side-btn svc-side-btn--next"
                                                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                                                    aria-label="Next slide"
                                                >
                                                    <ChevronRight size={22} />
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>

                {/* Resources overlay — positioned over right preview card area */}
                {resources?.length > 0 && (
                    <div className="svc-resources-overlay">
                        <StrategyResources resources={resources} />
                    </div>
                )}
            </div>

            {/* ---- Resources below carousel (mobile only) ---- */}
            {resources?.length > 0 && (
                <div className="svc-resources-mobile">
                    <StrategyResources resources={resources} />
                </div>
            )}

            {/* ---- Bottom controls: arrows + dots (hidden for single video) ---- */}
            {showNav && (
                <div className="svc-controls">
                    <button
                        className="svc-nav-btn"
                        onClick={handlePrev}
                        aria-label="Previous slide"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    <div className="svc-dots">
                        {videos.map((_, index) => (
                            <button
                                key={index}
                                className={`svc-dot ${index === dotIndex ? "active" : ""}`}
                                onClick={() => handleDotClick(index)}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>

                    <button
                        className="svc-nav-btn"
                        onClick={handleNext}
                        aria-label="Next slide"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}

            {/* ---- Video playback modal ---- */}
            <Dialog open={modalOpen} onOpenChange={closeVideo}>
                <DialogContent
                    className="max-w-5xl w-full p-0 !overflow-hidden bg-black border-gray-800 !max-h-[85vh] flex flex-col"
                    onCloseAutoFocus={(e) => e.preventDefault()}
                >
                    {/* Header — fixed height */}
                    <DialogHeader className="px-5 pt-4 pb-2 shrink-0">
                        <DialogTitle className="text-white text-lg font-semibold truncate pr-8">
                            {selectedVideo?.title || "Video"}
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            Video player for {selectedVideo?.title}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Player — aspect-video but capped by flex parent */}
                    {selectedVideo && (
                        <div className="w-full flex-1 min-h-0">
                            <div className="aspect-video w-full h-full max-h-full">
                                <iframe
                                    src={getEmbedUrl(selectedVideo?.videoUrl || "")}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    title={selectedVideo?.title || "Video Player"}
                                    style={{ border: "none" }}
                                />
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default StrategyVideoCarousel;
