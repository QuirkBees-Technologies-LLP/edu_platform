/**
 * Utility function to convert various video URLs to embeddable format.
 * Supports: YouTube, Vimeo, Dailymotion, Loom, Dyntube.
 *
 * Single source of truth — import this wherever embed URLs are needed.
 */
export const getEmbedUrl = (url) => {
    if (!url) return "";

    // YouTube
    if (url.includes("youtube.com/watch?v=")) {
        const videoId = url.split("v=")[1].split("&")[0];
        return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("youtu.be/")) {
        const videoId = url.split("youtu.be/")[1].split("?")[0];
        return `https://www.youtube.com/embed/${videoId}`;
    }

    // Vimeo
    if (url.includes("vimeo.com/")) {
        const parts = url.split("vimeo.com/")[1].split("/");
        const videoId = parts[0].split("?")[0];
        const hash = parts[1] ? parts[1].split("?")[0] : null;
        return hash
            ? `https://player.vimeo.com/video/${videoId}?h=${hash}`
            : `https://player.vimeo.com/video/${videoId}`;
    }

    // Dailymotion
    if (url.includes("dailymotion.com/video/")) {
        const videoId = url.split("dailymotion.com/video/")[1].split("?")[0];
        return `https://www.dailymotion.com/embed/video/${videoId}`;
    }

    // Loom
    if (url.includes("loom.com/share/")) {
        const videoId = url.split("loom.com/share/")[1].split("?")[0];
        return `https://www.loom.com/embed/${videoId}`;
    }

    // Dyntube - Case 1: app.dyntube.com/#/video
    if (url.includes("app.dyntube.com/#/video/")) {
        const match = url.match(/video\/([^/]+)/);
        if (match?.[1]) return `https://player.dyntube.com/video/${match[1]}`;
    }

    // Dyntube - Case 2: videos.dyntube.com/iframes
    if (url.includes("videos.dyntube.com/iframes/")) {
        const match = url.match(/iframes\/([^/?#]+)/);
        if (match?.[1]) return `https://videos.dyntube.com/iframes/${match[1]}`;
    }

    // Dyntube - Case 3: player.dyntube.com/video
    if (url.includes("player.dyntube.com/video/")) {
        const match = url.match(/video\/([^/?#]+)/);
        if (match?.[1]) return `https://player.dyntube.com/video/${match[1]}`;
    }

    // Dyntube - Case 4: fallback generic
    if (url.includes("dyntube.com/")) return url;

    return url;
};

/**
 * Check whether a URL is a supported DynTube link.
 * Returns true for any URL containing "dyntube.com".
 */
export const isDyntubeUrl = (url) => {
    if (!url || typeof url !== "string") return false;
    try {
        const trimmed = url.trim();
        if (!trimmed) return false;
        return trimmed.includes("dyntube.com");
    } catch {
        return false;
    }
};

/**
 * Derive a thumbnail URL from a video URL.
 * Supports: YouTube, Dyntube, Vimeo, Dailymotion.
 * Returns null if no thumbnail can be determined.
 */
export const getVideoThumbnail = (url) => {
    if (!url) return null;

    // YouTube
    let videoId = null;
    if (url.includes("youtube.com/watch?v=")) {
        videoId = url.split("v=")[1]?.split("&")[0];
    } else if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1]?.split("?")[0];
    }
    if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    // Dyntube — extract key and use their CDN thumbnail endpoint
    if (url.includes("dyntube.com")) {
        let key = null;
        if (url.includes("/iframes/")) {
            key = url.match(/iframes\/([^/?#]+)/)?.[1];
        } else if (url.includes("/video/")) {
            key = url.match(/video\/([^/?#]+)/)?.[1];
        }
        if (key) return `https://img.dyntube.com/${key}/thumb.webp`;
    }

    // Vimeo — use vumbnail.com service (no API key needed)
    if (url.includes("vimeo.com/")) {
        const vimeoId = url.split("vimeo.com/")[1]?.split(/[/?#]/)[0];
        if (vimeoId) return `https://vumbnail.com/${vimeoId}.jpg`;
    }

    // Dailymotion
    if (url.includes("dailymotion.com/video/")) {
        const dmId = url.split("dailymotion.com/video/")[1]?.split(/[/?#]/)[0];
        if (dmId) return `https://www.dailymotion.com/thumbnail/video/${dmId}`;
    }

    return null;
};

/** @deprecated Use getVideoThumbnail instead */
export const getYouTubeThumbnail = (url) => getVideoThumbnail(url);
