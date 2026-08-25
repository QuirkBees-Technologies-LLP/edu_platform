import React, { useEffect, useState, useCallback, useRef } from "react";
import { useLocation, useParams } from "react-router";
import { StreamVideoClient } from "@stream-io/video-react-sdk";
import { useAuthContext } from "../../../auth/useAuthContext";
import { useGetClientTokenMutation } from "../../../store/api/client/clientLiveSessionApiSlice";
import StreamWrapper from "./StreamWrapper";
import StreamClient from "./StreamClient";
import { EventProvider } from "./chat-room/context/EventContext";

const apiKey = import.meta.env.VITE_APP_STREAM_API_KEY;

const EducatorLiveSessionView = () => {
  const { state: sessionData } = useLocation();
  const { callId } = useParams();
  const {
    rtmp_URl: rtmp_url,
    token: rtmp_stream_key,
    _id: _id,
    schedule: { isRecurent } = {},
    checkLastRecurrence: checkLastRecurrence,
  } = sessionData || {};

  const { auth } = useAuthContext();
  const userId = auth?.user?._id;

  const [sessionToken, setSessionToken] = useState(null);
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);

  const [getClientToken] = useGetClientTokenMutation();
  const effectRan = useRef(false);

  const fetchTokenAndInitialize = useCallback(async () => {
    if (!apiKey || !userId || !callId) return;

    try {
      const response = await getClientToken({ userId }).unwrap();
      const token = response.token;
      setSessionToken(token);

      // ✅ Use getOrCreateInstance to prevent duplicate clients for the same userId
      const newClient = StreamVideoClient.getOrCreateInstance({
        apiKey,
        token,
        user: {
          id: userId,
          name: auth?.user?.first_name + " " + auth?.user?.last_name,
        },
      });

      const newCall = newClient.call("livestream", callId);

      // Join the call to establish WebSocket connection
      // Required for receiving closed caption events
      if (!newCall.state.joined) {
        await newCall.join({ create: true });
      }

      setClient(newClient);
      setCall(newCall);

      return () => {
        if (newCall.state.joined) {
          newCall.leave().catch(console.error);
        }
        newClient.disconnectUser();
      };
    } catch (error) {
      console.error("❌ Error initializing Stream:", error);
    }
  }, [apiKey, userId, callId, getClientToken, auth?.user]);

  useEffect(() => {
    if (effectRan.current) return;
    effectRan.current = true;

    let cleanupFn;

    const init = async () => {
      cleanupFn = await fetchTokenAndInitialize();
    };

    init();

    return () => {
      // ✅ Do NOT reset effectRan.current here — prevents double-init in React Strict Mode
      if (typeof cleanupFn === "function") {
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
          id={_id}
          checkLastRecurrence={checkLastRecurrence}
          isRecurent={isRecurent}
        />
      </StreamWrapper>
    </EventProvider>
  );
};

export default EducatorLiveSessionView;
