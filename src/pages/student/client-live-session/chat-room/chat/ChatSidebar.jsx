import React from 'react';
import { ArrowBigLeft } from 'lucide-react';
import { useEventContext } from '../context/EventContext';

export const ChatSidebar = (props) => {
    const { dmUnread, eventUnread, globalUnread, qaUnread, setIsFullScreen } = props;
    const { chatType, eventName } = useEventContext();

    const isMainEvent = eventName === 'cybersecurity' || eventName === 'data';

    return (
        <div className='chat-sidebar'>
            <div className="card border items-center">
                <div className="card-body p-2">
                    <button onClick={() => setIsFullScreen((prev) => !prev)} class="btn btn-xs btn-icon btn-primary btn-outline ">
                        <ArrowBigLeft />
                    </button>
                </div>
            </div>
        </div>
    );
};
