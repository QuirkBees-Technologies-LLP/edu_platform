import { StreamCall } from "@stream-io/video-react-sdk";
import Loader from "../../../components/ui/loader";
import { Send } from "lucide-react";
import { toAbsoluteUrl } from "@/utils/Assets";

const StreamWrapper = ({ call, children, bannerImage }) => {
  if (!call)
    return (
      <div className="">
        <div className="grid grid-cols-12 gap-6">
          {/* Image Section */}
          <div className="col-span-12 lg:col-span-8">
            <div className="card rounded-none rounded-b-xl">
              <img
                src={bannerImage ? bannerImage : toAbsoluteUrl("/media/images/2600x1600/live_banner.jpg")}
                alt=""
                className="w-full h-full rounded-xl object-cover"
              />
            </div>
          </div>

          {/* Chatbox Section */}
          <div className="col-span-12 lg:col-span-4">
            <div className="card rounded-2xl shadow-md overflow-hidden h-full flex flex-col">
              <div className="bg-[#1A1446] px-4 py-3 flex justify-between items-center rounded-t-2xl">
                <h3 className="text-white font-semibold text-sm">Chatbox</h3>
              </div>

              <div className="flex-1 p-4 overflow-y-auto flex flex-col space-y-4">
                <div className="flex flex-col gap-2 h-full justify-center items-center">
                  <div className="text-sm text-gray-900 font-medium text-center">
                    Stream is not live yet.
                  </div>
                </div>
              </div>

              <form className="p-4 border-t border-gray-200">
                <div className="flex items-center justify-center">
                  <div className="relative w-full max-w-md">
                    <input
                      type="text"
                      placeholder="Your comment..."
                      className="w-full p-4 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 text-xs dark:bg-gray-100"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 duration-200 focus:outline-none"
                      aria-label="Send message"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );

  return <StreamCall call={call}>{children}</StreamCall>;
};

export default StreamWrapper;
