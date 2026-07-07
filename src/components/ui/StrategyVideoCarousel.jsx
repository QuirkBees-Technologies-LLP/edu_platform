import React, { useState, useRef, useCallback } from "react";
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
 */
const StrategyVideoCarousel = ({ videos = [], className = "" }) => {
    const swiperRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);

    // ---- Swiper event handlers ----
    const handleSlideChange = useCallback((swiper) => {
        setActiveIndex(swiper.realIndex);
    }, []);

    const handlePrev = useCallback(() => {
        swiperRef.current?.slidePrev();
    }, []);

    const handleNext = useCallback(() => {
        swiperRef.current?.slideNext();
    }, []);

    const handleDotClick = useCallback((index) => {
        swiperRef.current?.slideToLoop(index);
    }, []);

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

    if (!videos || videos.length === 0) return null;

    return (
        <div className={`strategy-video-carousel ${className}`}>
            {/* ---- Swiper carousel ---- */}
            <Swiper
                onSwiper={(swiper) => { swiperRef.current = swiper; }}
                onSlideChange={handleSlideChange}
                centeredSlides
                slidesPerView="auto"
                spaceBetween={10}
                loop={videos.length > 2}
                // loopAdditionalSlides={2}
                grabCursor
                breakpoints={{
                    0: { slidesPerView: 1.1, spaceBetween: 6 },
                    640: { slidesPerView: 1.3, spaceBetween: 8 },
                    768: { slidesPerView: 1.8, spaceBetween: 10 },
                    1024: { slidesPerView: 2.2, spaceBetween: 12 },
                }}
            >
                {videos.map((video) => (
                    <SwiperSlide key={video.id}>
                        <div
                            className="svc-card"
                            onClick={() => openVideo(video)}
                            role="button"
                            tabIndex={0}
                            aria-label={`Play video: ${video.title}`}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    openVideo(video);
                                }
                            }}
                        >
                            {/* Thumbnail — iframe preview for Dyntube, static image for others */}
                            {video.videoUrl?.includes("dyntube.com") ? (
                                <iframe
                                    src={getEmbedUrl(video.videoUrl)}
                                    className="svc-thumb"
                                    loading="lazy"
                                    tabIndex={-1}
                                    style={{ pointerEvents: "none", border: "none" }}
                                    title={video.title}
                                />
                            ) : (
                                <img
                                    src={video.thumbnailUrl || getVideoThumbnail(video.videoUrl) || ""}
                                    alt={video.title}
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
                                <p className="svc-title">{video.title}</p>
                                {video.duration && (
                                    <p className="svc-duration">{video.duration}</p>
                                )}
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* ---- Controls: arrows + dots ---- */}
            <div className="svc-controls">
                <button
                    className="svc-nav-btn"
                    onClick={handlePrev}
                    aria-label="Previous slide"
                >
                    <ChevronLeft size={18} />
                </button>

                <div className="svc-dots">
                    {videos.map((_, index) => (
                        <button
                            key={index}
                            className={`svc-dot ${index === activeIndex ? "active" : ""}`}
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
                    <ChevronRight size={18} />
                </button>
            </div>

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
                                    src={getEmbedUrl(selectedVideo.videoUrl)}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    title={selectedVideo.title || "Video Player"}
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
