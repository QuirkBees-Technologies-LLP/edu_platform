import React, { useEffect, useState } from 'react'
import { toAbsoluteUrl } from "@/utils/Assets";
import { StreamVideoClient } from '@stream-io/video-react-sdk';
import { useNavigate } from 'react-router';

const apiKey = import.meta.env.VITE_APP_STREAM_API_KEY;

const ClientLiveSessionList = ({ userId, userToken }) => {
    const [liveStreams, setLiveStreams] = useState([]);
    const [client, setClient] = useState(null);
    const [next, setNext] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!userId || !userToken) return;
        const user = { id: userId, name: "Host" };
        const streamClient = new StreamVideoClient({ apiKey, user, token: userToken });

        setClient(streamClient);

        return () => {
            streamClient.disconnectUser();
        };
    }, [userId, userToken]);

    const fetchLiveStreams = async (loadMore = false) => {
        if (!client || (loadMore && !next)) return; // Don't load if no next page

        setLoading(true);

        try {
            const response = await client.queryCalls({
                filter_conditions: { type: "livestream" },
                sort: [{ field: "created_at", direction: -1 }],
                limit: 5, // Adjust limit as needed
                next: loadMore ? next : undefined, // Load more using next cursor
            });

            setLiveStreams((prev) =>
                loadMore ? [...prev, ...response.calls] : response.calls
            );

            setNext(response.next); // Update pagination cursor
        } catch (error) {
            console.error("Error fetching IQ Academy:", error);
        }

        setLoading(false);
    };

    useEffect(() => {
        if (client) fetchLiveStreams();
    }, [client]);


    return (
        <div className="grid grid-cols-12 gap-4">
            {liveStreams?.length > 0 && liveStreams.map((stream) => {
                return (
                    <div className="col-span-4" key={stream.id}>
                        <a href="">
                            <div className="video-library overflow-hidden h-auto relative dark:">
                                <img onClick={() => navigate(`/live-session/${stream.id}`)}
                                    src={toAbsoluteUrl(`/media/images/600x400/1.jpg`)}
                                    className="w-full h-48 rounded-xl"
                                    alt=""
                                />
                                <div className="video-details absolute bottom-0 p-4">
                                    <div class="flex items-center justify-between pt-2">
                                        <a href="#" class=" bg-black text-white p-1 justify-center rounded-sm text-xs">{stream.viewers || 0} Viewers</a>
                                    </div>
                                </div>
                                <div className="live absolute top-5 left-5">
                                    <a href="#" class=" bg-red-700 text-white pl-1 pr-1 font-semibold bg-red justify-center rounded-sm text-sm">Live</a>
                                </div>
                            </div>
                            <div className="session-details flex items-start gap-3 w-100 mt-3">
                                <div className="session-icon shrink-0">
                                    <img
                                        src={toAbsoluteUrl(`/media/avatars/300-2.png`)}
                                        className="size-10 rounded-full object-cover"
                                        alt=""
                                    />
                                </div>
                                <div className="session-content">
                                    <h5 class="text-black text-md font-semibold" onClick={() => navigate(`/live-session/${stream.id}`)}>{stream?.state?.custom?.title}</h5>
                                    <h6 class="text-black text-sm text-gray-700 hover:text-gray-900">mbAdmin</h6>
                                    <div className="flex gap-2 my-3">
                                        <span class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset">Capa</span>
                                        <span class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset">Espanol</span>
                                        <span class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset">Drop</span>
                                        <span class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset">Drop</span>
                                    </div>
                                </div>
                            </div>
                        </a>
                    </div>
                )
            })}
        </div>
    )
}

export default ClientLiveSessionList
