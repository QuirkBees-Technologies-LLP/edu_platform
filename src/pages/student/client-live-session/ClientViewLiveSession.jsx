import React, { useEffect, useState } from "react";
import { StreamVideoClient, StreamTheme } from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { useParams } from "react-router";
import { useGetClientTokenMutation } from "../../../store/api/client/clientLiveSessionApiSlice";
import { useAuthContext } from "../../../auth/useAuthContext";
import { EventProvider } from "./chat-room/context/EventContext";
import ClientLiveSessionWrapper from "./ClientLiveSessionWrapper";
import StreamWrapper from "../../admin/live-session/StreamWrapper";

const apiKey = import.meta.env.VITE_APP_STREAM_API_KEY;

const ClientViewLiveSession = () => {
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const { callId } = useParams();
  const { auth } = useAuthContext();

  const userId = auth?.user?._id ?? null;
  const [payload, setPayload] = useState({ userId: userId, callId: callId });
  const [token, setToken] = useState(null);
  const [getClientToken, { data, error, isLoading }] = useGetClientTokenMutation();

  useEffect(() => {
    const fetchClientToken = async () => {
      try {
        const response = await getClientToken(payload).unwrap();
        setToken(response.token);
      } catch (err) {
        console.error("Error:", err);
      }
    };

    fetchClientToken();
  }, []);

  useEffect(() => {
    const initClient = async () => {
      try {
        if (client) {
          console.warn("Stream client already initialized, skipping re-creation.");
          return;
        }

        const newClient = new StreamVideoClient({ apiKey });
        const newCall = newClient.call("livestream", callId);
        await newClient.connectUser({ id: userId }, token);
        await newCall.get(); 
        setClient(newClient);
        setCall(newCall);
        console.log("Stream client initialized successfully.");
      } catch (error) {
        console.error("Error initializing Stream client:", error);
      }
    };

    token && initClient();

    return () => {
      if (client) {
        client.disconnectUser()
          .then(() => console.log("User disconnected from Stream."))
          .catch(err => console.error("Error disconnecting user:", err));
      }
    };
  }, [client, token]);

  return (
    <EventProvider>
      <StreamWrapper call={call} callId={callId}>
        <StreamTheme style={{ fontFamily: "sans-serif", color: "white" }}>
          <ClientLiveSessionWrapper token={token} client={client} callId={callId} />
        </StreamTheme>
      </StreamWrapper>
    </EventProvider>
  );
};

export default ClientViewLiveSession;