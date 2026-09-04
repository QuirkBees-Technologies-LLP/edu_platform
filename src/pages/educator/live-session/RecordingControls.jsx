import { useCallStateHooks } from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const RecordingControls = ({ call }) => {
  const { useIsCallRecordingInProgress } = useCallStateHooks();
  const isRecording = useIsCallRecordingInProgress();

  const [recordings, setRecordings] = useState([]);

  const handleStart = async () => {
    try {
      await call.startRecording();
    } catch (err) {
      console.error("Failed to start recording:", err);
      toast.error(
        err?.message?.includes("no active session")
          ? "Can't start recording yet — make sure you're live first, then try again."
          : "Failed to start recording. Please try again."
      );
    }
  };

  const handleStop = async () => {
    try {
      await call.stopRecording();
    } catch (err) {
      console.error("Failed to stop recording:", err);
      toast.error("Failed to stop recording.");
    }
  };

  const fetchRecordings = async () => {
    try {
      const response = await call.queryRecordings();
      setRecordings(response.recordings);
    } catch (err) {
      console.error("Failed to fetch recordings:", err);
    }
  };

  useEffect(() => {
    // Fetch recordings when the component mounts
    fetchRecordings();
  }, [call]);

  return (
    <div>
      {!isRecording && (
        <button
          className="btn btn-primary"
          onClick={handleStart}
          disabled={isRecording}
        >
          Start Recording
        </button>
      )}
      {isRecording && (
        <button
          className="btn btn-danger"
          onClick={handleStop}
          disabled={!isRecording}
        >
          Stop Recording
        </button>
      )}
    </div>
  );
};

export default RecordingControls;
