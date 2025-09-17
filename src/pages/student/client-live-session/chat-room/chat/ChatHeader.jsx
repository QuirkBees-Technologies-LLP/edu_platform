import React, { useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { useEventContext } from '../context/EventContext';
import { ArrowBigLeft, ArrowBigRight, UserRound } from 'lucide-react';
import { useResponsive } from '../../../../../hooks';

export const ChatHeader = ({ dmUnread, eventUnread, globalUnread, qaUnread }) => {
    const {
        chatType,
        eventName,
        selected,
        setChatType,
        setShowChannelList,
        isFullScreen, setIsFullScreen
    } = useEventContext();
    const isMdUp = useResponsive('down', 'sm'); // matches Tailwind's md: 768px+
    useEffect(() => {
        if (isMdUp) {
            setIsFullScreen(false);
        }
    }, [isMdUp]);

    const handleGlobalClick = useCallback(() => {
        setChatType('global-ve2');
        setShowChannelList(false);
    }, [setChatType, setShowChannelList]);

    const handleEventClick = useCallback(() => {
        const eventType = selected === 'main-event' ? 'main-event' : 'room';
        setChatType(eventType);
        setShowChannelList(false);
    }, [selected, setChatType, setShowChannelList]);

    const handleDirectClick = useCallback(() => {
        setChatType('direct');
        setShowChannelList(true);
    }, [setChatType, setShowChannelList]);

    const handleQAClick = useCallback(() => {
        setChatType('qa');
        setShowChannelList(false);
    }, [setChatType, setShowChannelList]);

    return (
        <>
            {!isFullScreen && <div className='bg-[#1A1446] px-4 py-3 chat-components-header border border-b-0'>
                <div className='chat-components-header-top flex gap-3 items-center'>
                    <button onClick={() => setIsFullScreen((prev) => !prev)} class="flex btn btn-xs btn-icon btn-primary btn-outline md:flex btn btn-xs btn-icon btn-primary btn-outline ">
                        <ArrowBigRight size={18} />
                    </button>
                    <h3 class="text-white font-semibold text-sm pb-0">ChatBox</h3>
                    {/* <button class="btn btn-xs btn-primary btn-outline">
                    <UserRound size={16}/>
                        12354
                    </button> */}
                </div>
            </div>
            }
        </>
    );
};
