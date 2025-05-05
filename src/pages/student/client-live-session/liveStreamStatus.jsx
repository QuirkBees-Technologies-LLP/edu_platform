// useLivestreamStatus.js
import { useEffect, useState } from 'react';

export function useLivestreamStatus(call) {
    const [isLive, setIsLive] = useState(false);

    useEffect(() => {
        if (!call) return;

        const handleStart = () => {
            console.log('✅ Live started');
            setIsLive(true);
        };

        const handleEnd = () => {
            console.log('🛑 Live ended');
            setIsLive(false);
        };

        call.on('broadcast_started', () => {
            console.log('🟢 Live started');
            setIsLive(true);
        });
        call.on('broadcast_ended', () => {
            console.log('🔴 Live ended');
            setIsLive(false);
        });

        return () => {
            call.off('broadcast_started', handleStart);
            call.off('broadcast_ended', handleEnd);
        };
    }, [call]);

    return isLive;
}
