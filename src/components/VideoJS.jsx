
import { CircleChevronLeft, CircleChevronRight } from "lucide-react";
import React from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import ReactDOM from "react-dom";

export const VideoJS = ({ options, onReady }) => {
  const videoRef = React.useRef(null);
  const playerRef = React.useRef(null);

  React.useEffect(() => {
    if (!playerRef.current) {
      const videoElement = document.createElement("video-js");
      videoElement.classList.add("vjs-big-play-centered");
      videoRef.current.appendChild(videoElement);

      const player = (playerRef.current = videojs(videoElement, options, () => {
        videojs.log("player is ready");

        const Button = videojs.getComponent("Button");

        class RewindButton extends Button {
          constructor(player, options) {
            super(player, options);
            this.addClass("vjs-rewind-button");
            this.controlText("Rewind 10s");
            ReactDOM.render(<CircleChevronLeft size={18} />, this.el());
          }
          handleClick() {
            player.currentTime(Math.max(0, player.currentTime() - 10));
          }
        }

        class ForwardButton extends Button {
          constructor(player, options) {
            super(player, options);
            this.addClass("vjs-forward-button");
            this.controlText("Forward 10s");
            ReactDOM.render(<CircleChevronRight size={18} />, this.el());
          }
          handleClick() {
            player.currentTime(
              Math.min(player.duration(), player.currentTime() + 10)
            );
          }
        }

        videojs.registerComponent("RewindButton", RewindButton);
        videojs.registerComponent("ForwardButton", ForwardButton);

        const controlBar = player.getChild("controlBar");
        controlBar.addChild("RewindButton", {}, controlBar.children().length - 1);
        controlBar.addChild("ForwardButton", {}, controlBar.children().length - 1);

        player.ready(() => {
          const videoEl = player.el().querySelector("video");

          if (videoEl) {
            videoEl.addEventListener("contextmenu", (e) => e.preventDefault());

            videoEl.setAttribute("disablePictureInPicture", true);
            videoEl.setAttribute("controlsList", "nodownload");

            videoEl.setAttribute("draggable", false);
            videoEl.style.userSelect = "none";
          }

          const overlay = document.createElement("div");
          overlay.style.position = "absolute";
          overlay.style.top = "0";
          overlay.style.left = "0";
          overlay.style.width = "100%";
          overlay.style.height = "100%";
          overlay.style.background = "transparent";
          overlay.style.pointerEvents = "none";
          overlay.style.zIndex = "10";
          overlay.addEventListener("contextmenu", (e) => e.preventDefault());

          const container = player.el();
          container.style.position = "relative";
          container.appendChild(overlay);
        });

        onReady && onReady(player);
      }));
    }
  }, [options]);

  React.useEffect(() => {
    const player = playerRef.current;
    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <div data-vjs-player>
      <div ref={videoRef} style={{ position: "relative" }} />
    </div>
  );
};

export default VideoJS;



