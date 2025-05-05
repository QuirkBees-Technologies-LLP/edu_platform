import { StreamCall } from "@stream-io/video-react-sdk";
import Loader from "../../../components/ui/loader";

const StreamWrapper = ({ call, children }) => {
  if (!call) return <Loader />; // Ensure call is available
  return <StreamCall call={call}>{children}</StreamCall>;
};

export default StreamWrapper;
