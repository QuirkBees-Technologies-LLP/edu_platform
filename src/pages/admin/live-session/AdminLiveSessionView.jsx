import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useParams } from "react-router";
import { StreamVideoClient } from "@stream-io/video-react-sdk";
import { useAuthContext } from "../../../auth/useAuthContext";
import { useGetClientTokenMutation } from "../../../store/api/client/clientLiveSessionApiSlice";
import StreamWrapper from "./StreamWrapper";
import StreamClient from "./StreamClient";
import { EventProvider } from "./chat-room/context/EventContext";

const apiKey = import.meta.env.VITE_APP_STREAM_API_KEY;

const AdminLiveSessionView = () => {
  const { state: sessionData } = useLocation();
  const { callId } = useParams();
  const { address: rtmp_url, token: rtmp_stream_key } = sessionData || {};
  const { auth } = useAuthContext();
  const userId = auth?.user?._id;

  const [sessionToken, setSessionToken] = useState(null);
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);

  const [getClientToken] = useGetClientTokenMutation();

  const fetchTokenAndInitialize = useCallback(async () => {
    if (!apiKey || !userId || !callId) return;

    try {
      const response = await getClientToken({ userId }).unwrap();
      const token = response.token;
      setSessionToken(token);

      const newClient = new StreamVideoClient({
        apiKey,
        token,
        user: { id: userId, name: "Admin Host" },
      });

      const newCall = newClient.call("livestream", callId);
      await newCall.join({ create: true });

      setClient(newClient);
      setCall(newCall);

      return () => {
        newCall.leave();
        newClient.disconnectUser();
        console.log("🔴 Cleaned up Stream client and call.");
      };
    } catch (error) {
      console.error("❌ Error initializing Stream:", error);
    }
  }, [apiKey, userId, callId, getClientToken]);

  useEffect(() => {
    let cleanupFn;
  
    const init = async () => {
      cleanupFn = await fetchTokenAndInitialize();
    };
  
    init();
  
    return () => {
      if (typeof cleanupFn === 'function') {
        cleanupFn();
      }
    };
  }, [fetchTokenAndInitialize]);
  

  return (
    <EventProvider>
      <StreamWrapper call={call}>
        <StreamClient
          sessionToken={sessionToken}
          call={call}
          client={client}
          callId={callId}
          token={rtmp_stream_key}
          rtmp_stream_key={rtmp_stream_key}
          rtmp_url={rtmp_url}
        />
      </StreamWrapper>
    </EventProvider>
  );
};

export default AdminLiveSessionView;
