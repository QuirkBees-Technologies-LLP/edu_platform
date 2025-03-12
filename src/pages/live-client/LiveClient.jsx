import React, { useEffect, useRef } from "react";
import io from "socket.io-client";

const SERVER_URL = "https://6787-2409-40c1-2116-86bb-d5c4-2f56-594-7f62.ngrok-free.app/";

const LiveClient = () => {
    const videoRef = useRef(null);
  const socket = useRef(null);
  const mediaSource = useRef(new MediaSource());
  const sourceBuffer = useRef(null);
  const queue = useRef([]); // Buffer queue for pending chunks

  useEffect(() => {
    socket.current = io(SERVER_URL);
    console.log("Connecting to server...");

    socket.current.on("connect", () => console.log("Viewer connected!"));

    const videoElement = videoRef.current;
    videoElement.src = URL.createObjectURL(mediaSource.current);

    mediaSource.current.addEventListener("sourceopen", () => {
      console.log("MediaSource opened");
      try {
        if (!sourceBuffer.current) {
          sourceBuffer.current = mediaSource.current.addSourceBuffer(
            'video/webm; codecs="vp8,opus"'
          );
          console.log("SourceBuffer created");
          
          // Process any queued chunks
          sourceBuffer.current.addEventListener("updateend", () => {
            if (queue.current.length > 0 && !sourceBuffer.current.updating) {
              console.log("Appending queued buffer...");
              sourceBuffer.current.appendBuffer(queue.current.shift());
            }
          });
        }
      } catch (err) {
        console.error("Error creating SourceBuffer:", err);
      }
    });

    socket.current.on("videoBroadcast", (data) => {
      console.log("Receiving data:", data.byteLength, "bytes");

      if (mediaSource.current.readyState !== "open") {
        console.warn("MediaSource is not open yet, dropping data...");
        return;
      }

      if (sourceBuffer.current && !sourceBuffer.current.updating) {
        try {
          const chunk = new Uint8Array(data);
          console.log("Appending buffer...");
          sourceBuffer.current.appendBuffer(chunk);
        } catch (err) {
          console.error("Error appending buffer:", err);
        }
      } else {
        console.warn("SourceBuffer is updating, queuing data...");
        queue.current.push(new Uint8Array(data)); // Store for later
      }
    });

    return () => {
      socket.current.disconnect();
    };
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Live Stream Viewer</h1>
      <video ref={videoRef} autoPlay controls style={{ width: "50%" }}></video>
    </div>
  );
};

export default LiveClient;
