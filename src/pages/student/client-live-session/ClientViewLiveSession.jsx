import React, { useEffect, useRef, useState } from "react";
import { StreamVideoClient, StreamTheme } from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { useParams } from "react-router";
import {
  useGetClientLiveScheduleQuery,
  useGetClientTokenMutation,
} from "../../../store/api/client/clientLiveSessionApiSlice";
import { useAuthContext } from "../../../auth/useAuthContext";
import { EventProvider } from "./chat-room/context/EventContext";
import ClientLiveSessionWrapper from "./ClientLiveSessionWrapper";
import StreamWrapper from "../../admin/live-session/StreamWrapper";
import { format } from "date-fns";

const apiKey = import.meta.env.VITE_APP_STREAM_API_KEY;

const ClientViewLiveSession = ({ bannerImage, callId, educatorData }) => {
  const [client, setClient] = useState(null);

  const [call, setCall] = useState(null);
  const isInitializing = useRef(false); // Track initialization attempts
  // const { callId } = useParams();
  const { auth } = useAuthContext();
  const userId = auth?.user?._id ?? null;

  const [recordings, setRecordings] = useState([]);

  // 1. Fetch token and schedule data (uncomment schedule logic)
  const [token, setToken] = useState(null);
  const [getClientToken] = useGetClientTokenMutation();
  const { data: scheduleData } = useGetClientLiveScheduleQuery(callId);

  useEffect(() => {
    const fetchClientToken = async () => {
      try {
        const response = await getClientToken({ userId, callId }).unwrap();
        setToken(response.token);
      } catch (err) {
        console.error("Token fetch failed:", err);
      }
    };
    fetchClientToken();
  }, [userId, callId]);

  // 2. Initialize Stream client
  useEffect(() => {
    const initClient = async () => {
      if (!token || client || isInitializing.current || !callId) return;
      isInitializing.current = true;

      let newClient;
      try {
        newClient = new StreamVideoClient({ apiKey });
        await newClient.connectUser({ id: userId }, token); // Authenticate FIRST
        const newCall = newClient.call("livestream", callId);
        // await newCall.get(); // Verify call exists
        await newCall.getOrCreate({
          data: {
            settings: {
              recording: {
                mode: "available", // recording available
                audio_only: false,
                quality: "1080p",
                layout: {
                  name: "single_participant",
                  options: {
                    video_border_radius: "0",
                  },
                },
              },
            },
          },
        });
        setClient(newClient);
        setCall(newCall);
      } catch (err) {
        console.error("Stream init failed:", err);
        if (newClient) await newClient.disconnectUser(); // Cleanup on failure
      } finally {
        isInitializing.current = false;
      }
    };

    initClient();
  }, [token, callId, userId, client]); // Re-run only if these change

  // 3. Cleanup on unmount
  useEffect(() => {
    return () => {
      if (client) {
        client.disconnectUser().catch(console.error);
      }
    };
  }, [client]);

  // 4. Render logic with safe scheduleData access
  const isUpcoming = scheduleData?.data?.datetime
    ? new Date(scheduleData.data.datetime) > new Date()
    : false;

  const fetchRecordings = async () => {
    try {
      const response = await call.queryRecordings();
      setRecordings(response.recordings);
    } catch (err) {
      console.error("Failed to fetch recordings:", err);
    }
  };

  // useEffect(() => {
  //   // Fetch recordings when the component mounts
  //   fetchRecordings();
  // }, [call]);

  return (
    <>
      {/* {isUpcoming ? (
        <div className="live_center w-full">
          <p className="text-center font-bold text-xl">IQ Academy is Upcoming</p>
          <p className="text-center text-lg pt-10 px-2">
            The event will start on{" "}
            {scheduleData?.data?.datetime 
              ? format(new Date(scheduleData.data.datetime), "MMM dd, yyyy, hh:mm a")
              : "a future date"}
          </p>
        </div>
      ) : ( */}
      <EventProvider>
        <StreamWrapper
          call={call}
          callId={callId}
          bannerImage={bannerImage}
          educatorData={educatorData}
        >
          <StreamTheme style={{ fontFamily: "sans-serif", color: "white" }}>
            {
              <ClientLiveSessionWrapper
                bannerImage={bannerImage}
                client={client}
                callId={callId}
                token={token}
                educatorData={educatorData}
              />
            }
          </StreamTheme>
        </StreamWrapper>
      </EventProvider>
      {/* )} */}
    </>
  );
};

export default ClientViewLiveSession;
