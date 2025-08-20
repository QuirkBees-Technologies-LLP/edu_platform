import React, { useRef, useState, useEffect } from "react";

const CustomVideoPlayer = ({ videoUrl }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const video = videoRef.current;

    const updateTime = () => setCurrentTime(video.currentTime);
    const setVideoDuration = () => setDuration(video.duration);

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", setVideoDuration);

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("loadedmetadata", setVideoDuration);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleVolumeChange = (e) => {
    const video = videoRef.current;
    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
  };

  const handleSeekChange = (e) => {
    const video = videoRef.current;
    const newTime = parseFloat(e.target.value);
    // Smooth seek: pause → set time → play
    const wasPlaying = !video.paused;
    video.pause();
    video.currentTime = newTime;
    if (wasPlaying) video.play();
    setCurrentTime(newTime);
  };

  const skipTime = (seconds) => {
    const video = videoRef.current;
    const wasPlaying = !video.paused;
    video.pause();
    video.currentTime += seconds;
    if (wasPlaying) video.play();
  };

  return (
    <div style={{ width: "640px", margin: "20px auto" }}>
      <video
        ref={videoRef}
        width="640"
        height="360"
        src={videoUrl}
        controls
        preload="metadata" // Important for seeking
      />
      <div style={{ display: "flex", alignItems: "center", marginTop: "10px" }}>
        <button onClick={togglePlay}>{isPlaying ? "Pause" : "Play"}</button>
        <button onClick={() => skipTime(-10)}>« 10s</button>
        <button onClick={() => skipTime(10)}>10s »</button>
        <input
          type="range"
          min="0"
          max={duration}
          step="0.1"
          value={currentTime}
          onChange={handleSeekChange}
          style={{ flex: 1, margin: "0 10px" }}
        />
        <span>
          {Math.floor(currentTime)} / {Math.floor(duration)} sec
        </span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
        />
      </div>
    </div>
  );
};

export default CustomVideoPlayer;
