import React, { useEffect, useRef, useState } from "react";
import { Container } from "@/components/container";
import io from "socket.io-client";

const SERVER_URL= "https://6787-2409-40c1-2116-86bb-d5c4-2f56-594-7f62.ngrok-free.app/"

const Live = () => {
    const videoRef = useRef(null);
    const socket = useRef(null);
    const mediaRecorder = useRef(null);
  
    useEffect(() => {
      socket.current = io(SERVER_URL);
      socket.current.on("connect", () => console.log("Streamer connected"));
  
      return () => socket.current.disconnect();
    }, []);
  
    const startRecording = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      videoRef.current.srcObject = stream;
  
      mediaRecorder.current = new MediaRecorder(stream, {
        mimeType: "video/webm; codecs=vp8,opus",
      });
  
      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
            console.log("sending data");
            console.log("data===>", event.data);
          socket.current.emit("videoStream", event.data); // Send data to server
        }
      };
  
      mediaRecorder.current.start(1000);
    };
  
    const stopRecording = () => {
      if (mediaRecorder.current) {
        mediaRecorder.current.stop();
        socket.current.emit("stopRecording");
      }
    };
  
    return (
      <div style={{ textAlign: "center" }}>
        <h1>Live Stream</h1>
        <br />
        <button style={{ margin: "10px", padding: "10px" }} onClick={startRecording}>Start Streaming</button>
        <button style={{ margin: "10px", padding: "10px" }} onClick={stopRecording}>Stop Streaming</button>
        <video ref={videoRef} autoPlay muted style={{ width: "50%" }}></video>
      </div>
    );
};

export default Live;
