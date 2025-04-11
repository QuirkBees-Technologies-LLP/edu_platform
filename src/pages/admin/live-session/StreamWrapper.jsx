import { StreamCall } from "@stream-io/video-react-sdk";

const StreamWrapper = ({ call, children }) => {
  if (!call) return <div>Loading...</div>; // Ensure call is available
  return <StreamCall call={call}>{children}</StreamCall>;
};

export default StreamWrapper;
