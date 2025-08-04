import React, { useEffect, useState } from 'react';
import ClientLiveSessionList from './ClientLiveSessionList';
import { useAuthContext } from '../../../auth/useAuthContext';
import { useGetClientTokenMutation } from '../../../store/api/client/clientLiveSessionApiSlice';

const ClientLiveSession = () => {
    const { auth } = useAuthContext();
    const userId = auth?.user?._id ?? null;
    const [payload, setPayload] = useState({ userId: userId});
    const [sessionToken, setSessionToken] = useState(null);
    const [getClientToken, { data, error, isLoading }] = useGetClientTokenMutation();

    useEffect(() => {
        const fetchClientToken = async () => {
            try {
                const response = await getClientToken(payload).unwrap();
                setSessionToken(response.token);
            } catch (err) {
                console.error("Error:", err);
            }
        };

        fetchClientToken();
    }, []);     
    
    return (
        <div className='container-fluid'>
            <div className="popular pb-5 flex items-center justify-between">
                <div>
                    <a class="text-lg text-gray-800 mb-px" href="/public-profile/profiles/nft">IQ Academy</a>
                </div>
            </div>
            <ClientLiveSessionList userId={userId} userToken={sessionToken}/>
        </div>
    )
}

export default ClientLiveSession